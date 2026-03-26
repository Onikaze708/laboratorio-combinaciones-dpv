import type { CategoriaManual, PasoManualConfig } from "../types";

interface ManualBuilderOption {
  value: CategoriaManual;
  label: string;
}

interface TechniqueOption {
  value: string;
  label: string;
  familia: string;
}

interface ManualBuilderPanelProps {
  estructura: PasoManualConfig[];
  options: ManualBuilderOption[];
  techniqueOptions: TechniqueOption[];
  onModeChange: (index: number, value: PasoManualConfig["modo"]) => void;
  onFamilyChange: (index: number, value: CategoriaManual) => void;
  onTechniqueChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const ManualBuilderPanel = ({
  estructura,
  options,
  techniqueOptions,
  onModeChange,
  onFamilyChange,
  onTechniqueChange,
  onAdd,
  onRemove,
}: ManualBuilderPanelProps) => {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Constructor de combinacion</h2>
          <p className="text-sm text-slate-500">Define cada paso por familia o fija una tecnica especifica. El sistema completara combinaciones coherentes respetando esa estructura.</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          onClick={onAdd}
          disabled={estructura.length >= 5}
        >
          Agregar paso
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {estructura.map((paso, index) => {
          const techniqueOptionsForStep = techniqueOptions.filter((option) => option.familia === paso.categoria);

          return (
            <div key={`${paso.modo}-${paso.categoria}-${paso.tecnicaId ?? "sin_tecnica"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span className="text-sm font-semibold text-slate-700">Paso {index + 1}</span>
                <div className="flex flex-wrap gap-4 text-sm text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`modo-paso-${index}`}
                      checked={paso.modo === "familia"}
                      onChange={() => onModeChange(index, "familia")}
                    />
                    Familia
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`modo-paso-${index}`}
                      checked={paso.modo === "tecnica_especifica"}
                      onChange={() => onModeChange(index, "tecnica_especifica")}
                    />
                    Tecnica especifica
                  </label>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  onClick={() => onRemove(index)}
                  disabled={estructura.length <= 3}
                >
                  Quitar
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="text-xs font-medium text-slate-700">
                  Familia
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                    value={paso.categoria}
                    onChange={(e) => onFamilyChange(index, e.target.value as CategoriaManual)}
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-medium text-slate-700">
                  Tecnica especifica
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
                    value={paso.tecnicaId ?? ""}
                    onChange={(e) => onTechniqueChange(index, e.target.value)}
                    disabled={paso.modo !== "tecnica_especifica"}
                  >
                    <option value="">Selecciona una tecnica</option>
                    {techniqueOptionsForStep.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
