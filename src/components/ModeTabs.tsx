import type { ModoGeneracion } from "../types";
import { opcionesModo } from "../utils/uiOptions";

interface ModeTabsProps {
  mode: ModoGeneracion;
  onChange: (mode: ModoGeneracion) => void;
}

export const ModeTabs = ({ mode, onChange }: ModeTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {opcionesModo.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === option.value
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700"
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
