import { useState } from "react";
import type { FamilyRule, Technique, TransitionRule, UserLibrary, UserLibraryFiles } from "../types";

interface EditorBibliotecaPanelProps {
  library: UserLibrary;
  userLibrary: UserLibraryFiles;
  familyOptions: string[];
  onSaveFamily: (family: FamilyRule) => void;
  onDeleteFamily: (familyId: string) => void;
  onSaveTechnique: (technique: Technique) => void;
  onDeleteTechnique: (techniqueId: string) => void;
  onSaveTransition: (transition: TransitionRule) => void;
  onDeleteTransition: (desdeFamilia: string, haciaFamilia: string) => void;
  onImportFamilies: (content: string) => void;
  onImportTechniques: (content: string) => void;
  onImportTransitions: (content: string) => void;
  onExportFamilies: () => void;
  onExportTechniques: () => void;
  onExportTransitions: () => void;
}

const origenLabel = (origen?: "base" | "usuario") =>
  origen === "usuario" ? "Biblioteca del usuario" : "Biblioteca oficial";

export const EditorBibliotecaPanel = ({ library, userLibrary }: EditorBibliotecaPanelProps) => {
  const [tab, setTab] = useState<"familias" | "tecnicas" | "transiciones">("familias");

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "familias" ? "bg-slate-900 text-white" : "border border-slate-300"}`} onClick={() => setTab("familias")}>Familias</button>
        <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "tecnicas" ? "bg-slate-900 text-white" : "border border-slate-300"}`} onClick={() => setTab("tecnicas")}>Tecnicas</button>
        <button type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === "transiciones" ? "bg-slate-900 text-white" : "border border-slate-300"}`} onClick={() => setTab("transiciones")}>Transiciones</button>
      </div>
      {tab === "familias" && (
        <div className="mt-4 space-y-2">
          {library.families.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="font-semibold">{item.nombreTradicional ?? item.nombre}</div>
              <div className="text-sm text-slate-600">{item.nombreEspanol ?? item.nombre}</div>
              <div className="text-xs text-slate-500">{origenLabel(item.origen)}</div>
            </div>
          ))}
        </div>
      )}
      {tab === "tecnicas" && (
        <div className="mt-4 space-y-2">
          {library.techniques.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2">
              <div className="font-semibold">{item.nombreTradicional ?? item.nombre}</div>
              <div className="text-sm text-slate-600">{item.nombreEspanol ?? item.nombre}</div>
              <div className="text-xs text-slate-500">{item.familia}{" ? "}{item.repetible ? "repetible" : "no repetible"}</div>
            </div>
          ))}
        </div>
      )}
      {tab === "transiciones" && (
        <div className="mt-4 space-y-2">
          {library.transitions.map((item) => (
            <div key={`${item.desdeFamilia}=>${item.haciaFamilia}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>{item.desdeFamilia}</span>{" ? "}<span>{item.haciaFamilia}</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Familias usuario: {userLibrary.userFamilies.length}. Tecnicas usuario: {userLibrary.userTechniques.length}. Transiciones usuario: {userLibrary.userTransitionRules.length}.</p>
    </section>
  );
};

export default EditorBibliotecaPanel;

