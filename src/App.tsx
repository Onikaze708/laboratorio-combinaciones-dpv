import { useMemo, useState } from "react";
import { CombinationResults } from "./components/CombinationResults";
import EditorBibliotecaPanel from "./components/EditorBibliotecaPanel";
import { GenerationControls } from "./components/GenerationControls";
import { ManualBuilderPanel } from "./components/ManualBuilderPanel";
import { actionRepository } from "./modules/techniques/actionRepository";
import { generateManualAssistedCombinations } from "./modules/generator/manualCombinationEngine";
import type {
  CategoriaManual,
  FamilyRule,
  GeneratedCombination,
  ModoExplicacion,
  ModoExportacion,
  PasoManualConfig,
  Technique,
  TransitionRule,
  UserLibraryFiles,
} from "./types";
import { exportarCombinacionesPDF, imprimirCombinaciones } from "./utils/export";

const initialStructure: PasoManualConfig[] = [
  { modo: "familia", categoria: "tai_sabaki" },
  { modo: "familia", categoria: "uke_waza" },
  { modo: "familia", categoria: "tsuki_waza" },
];

const descargarJSON = (nombreArchivo: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  URL.revokeObjectURL(url);
};

const parseArrayFile = <T,>(content: string): T[] => {
  const parsed = JSON.parse(content);
  if (!Array.isArray(parsed)) throw new Error("Archivo invalido");
  return parsed as T[];
};

export default function App() {
  const [cantidad, setCantidad] = useState<number>(3);
  const [modoExplicacion, setModoExplicacion] = useState<ModoExplicacion>("corto");
  const [modoExportacion, setModoExportacion] = useState<ModoExportacion>("editorial");
  const [estructura, setEstructura] = useState<PasoManualConfig[]>(initialStructure);
  const [combinaciones, setCombinaciones] = useState<GeneratedCombination[]>([]);
  const [bibliotecaVersion, setBibliotecaVersion] = useState(0);
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);

  const biblioteca = useMemo(() => actionRepository.exportMergedLibrary(), [bibliotecaVersion]);
  const userLibrary = useMemo(() => actionRepository.getUserLibrary(), [bibliotecaVersion]);

  const opcionesConstructor = useMemo(
    () =>
      [...biblioteca.families]
        .sort((a, b) => (a.nombreTradicional ?? a.nombre ?? a.familia).localeCompare(b.nombreTradicional ?? b.nombre ?? b.familia))
        .map((family) => {
          const nombreTradicional = family.nombreTradicional?.trim() ?? family.nombre ?? family.familia;
          const nombreEspanol = family.nombreEspanol ?? family.nombre ?? family.familia;
          return {
            value: family.familia as CategoriaManual,
            label: `${nombreTradicional} - ${nombreEspanol}`,
          };
        }),
    [biblioteca]
  );

  const techniqueOptions = useMemo(
    () =>
      [...biblioteca.techniques]
        .sort((a, b) => (a.nombreTradicional ?? a.nombre).localeCompare(b.nombreTradicional ?? b.nombre))
        .map((technique) => ({
          value: technique.id,
          label: `${technique.nombreTradicional ?? technique.nombre} - ${technique.nombreEspanol ?? technique.nombre}`,
          familia: technique.familia,
        })),
    [biblioteca]
  );

  const familiasDisponibles = useMemo(
    () => biblioteca.families.map((item) => item.familia).sort((a, b) => a.localeCompare(b)),
    [biblioteca]
  );

  const fallbackFamily = opcionesConstructor[0]?.value ?? "tai_sabaki";

  const refreshLibrary = () => setBibliotecaVersion((prev) => prev + 1);

  const handleModeChange = (index: number, value: PasoManualConfig["modo"]) => {
    setEstructura((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        if (value === "tecnica_especifica") {
          const defaultTechnique = techniqueOptions.find((option) => option.familia === item.categoria) ?? techniqueOptions[0];
          return {
            modo: value,
            categoria: (defaultTechnique?.familia ?? item.categoria ?? fallbackFamily) as CategoriaManual,
            tecnicaId: item.tecnicaId ?? defaultTechnique?.value,
          };
        }
        return { modo: value, categoria: item.categoria, tecnicaId: undefined };
      })
    );
  };

  const handleFamilyChange = (index: number, value: CategoriaManual) => {
    setEstructura((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;
        const nextTechnique = item.modo === "tecnica_especifica" ? techniqueOptions.find((option) => option.familia === value)?.value : undefined;
        return { ...item, categoria: value, tecnicaId: nextTechnique };
      })
    );
  };

  const handleTechniqueChange = (index: number, value: string) => {
    const technique = biblioteca.techniques.find((item) => item.id === value);
    setEstructura((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              tecnicaId: value,
              categoria: (technique?.familia ?? item.categoria) as CategoriaManual,
            }
          : item
      )
    );
  };

  const handleAddStep = () => {
    setEstructura((prev) => (prev.length >= 5 ? prev : [...prev, { modo: "familia", categoria: fallbackFamily as CategoriaManual }]));
  };

  const handleRemoveStep = (index: number) => {
    setEstructura((prev) => (prev.length <= 3 ? prev : prev.filter((_, itemIndex) => itemIndex !== index)));
  };

  const handleGenerate = () => {
    const generated = generateManualAssistedCombinations(estructura, cantidad, modoExplicacion);
    setCombinaciones(generated);
  };

  const handleSaveFamily = (family: FamilyRule) => {
    actionRepository.upsertFamily(family);
    refreshLibrary();
  };

  const handleDeleteFamily = (familyId: string) => {
    const family = biblioteca.families.find((item) => item.id === familyId);
    actionRepository.deleteFamily(familyId);
    if (family) {
      setEstructura((prev) =>
        prev.map((item) =>
          item.categoria === family.familia
            ? { ...item, categoria: fallbackFamily as CategoriaManual, tecnicaId: undefined, modo: item.modo === "tecnica_especifica" ? "familia" : item.modo }
            : item
        )
      );
    }
    refreshLibrary();
  };

  const handleSaveTechnique = (technique: Technique) => {
    actionRepository.upsertTechnique(technique);
    refreshLibrary();
  };

  const handleDeleteTechnique = (techniqueId: string) => {
    actionRepository.deleteTechnique(techniqueId);
    setEstructura((prev) =>
      prev.map((item) => (item.tecnicaId === techniqueId ? { ...item, tecnicaId: undefined, modo: "familia" } : item))
    );
    refreshLibrary();
  };

  const handleSaveTransition = (transition: TransitionRule) => {
    actionRepository.upsertTransition(transition);
    refreshLibrary();
  };

  const handleDeleteTransition = (desdeFamilia: string, haciaFamilia: string) => {
    actionRepository.deleteTransition(desdeFamilia, haciaFamilia);
    refreshLibrary();
  };

  const saveUserLibrary = (next: UserLibraryFiles) => {
    actionRepository.saveUserLibrary(next);
    refreshLibrary();
  };

  const handleImportFamilies = (content: string) => {
    try {
      saveUserLibrary({ ...userLibrary, userFamilies: parseArrayFile<FamilyRule>(content) });
    } catch {
      window.alert("No se pudo importar userFamilies.json. Verifica que el archivo sea un arreglo JSON valido.");
    }
  };

  const handleImportTechniques = (content: string) => {
    try {
      saveUserLibrary({ ...userLibrary, userTechniques: parseArrayFile<Technique>(content) });
    } catch {
      window.alert("No se pudo importar userTechniques.json. Verifica que el archivo sea un arreglo JSON valido.");
    }
  };

  const handleImportTransitions = (content: string) => {
    try {
      saveUserLibrary({ ...userLibrary, userTransitionRules: parseArrayFile<TransitionRule>(content) });
    } catch {
      window.alert("No se pudo importar userTransitionRules.json. Verifica que el archivo sea un arreglo JSON valido.");
    }
  };

  return (
    <main className="min-h-screen bg-transparent p-6 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Defensa personal viva</p>
              <h1 className="mt-2 text-3xl font-bold">Laboratorio de Combinaciones</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-200">
                Laboratorio tecnico para construir combinaciones, explorar secuencias compatibles y generar variantes de entrenamiento.
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setMostrarBiblioteca((prev) => !prev)}
            >
              {mostrarBiblioteca ? "Ocultar biblioteca" : "Biblioteca"}
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <ManualBuilderPanel
            estructura={estructura}
            options={opcionesConstructor}
            techniqueOptions={techniqueOptions}
            onModeChange={handleModeChange}
            onFamilyChange={handleFamilyChange}
            onTechniqueChange={handleTechniqueChange}
            onAdd={handleAddStep}
            onRemove={handleRemoveStep}
          />

          <GenerationControls
            cantidad={cantidad}
            modoExplicacion={modoExplicacion}
            modoExportacion={modoExportacion}
            onCantidadChange={setCantidad}
            onModoExplicacionChange={setModoExplicacion}
            onModoExportacionChange={setModoExportacion}
            onGenerate={handleGenerate}
            onExportPdf={() => exportarCombinacionesPDF(combinaciones, modoExportacion)}
            onPrint={() => imprimirCombinaciones(combinaciones, modoExportacion)}
            disabledExport={combinaciones.length === 0}
          />
        </div>

        {mostrarBiblioteca ? (
          <EditorBibliotecaPanel
            library={biblioteca}
            userLibrary={userLibrary}
            familyOptions={familiasDisponibles}
            onSaveFamily={handleSaveFamily}
            onDeleteFamily={handleDeleteFamily}
            onSaveTechnique={handleSaveTechnique}
            onDeleteTechnique={handleDeleteTechnique}
            onSaveTransition={handleSaveTransition}
            onDeleteTransition={handleDeleteTransition}
            onImportFamilies={handleImportFamilies}
            onImportTechniques={handleImportTechniques}
            onImportTransitions={handleImportTransitions}
            onExportFamilies={() => descargarJSON("userFamilies.json", userLibrary.userFamilies)}
            onExportTechniques={() => descargarJSON("userTechniques.json", userLibrary.userTechniques)}
            onExportTransitions={() => descargarJSON("userTransitionRules.json", userLibrary.userTransitionRules)}
          />
        ) : null}

        <CombinationResults combinaciones={combinaciones} modoExplicacion={modoExplicacion} />
      </div>
    </main>
  );
}

