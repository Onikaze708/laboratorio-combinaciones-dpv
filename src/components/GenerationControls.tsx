import type { ModoExplicacion, ModoExportacion } from "../types";
import { opcionesExplicacion, opcionesGeneracion } from "../utils/uiOptions";

interface GenerationControlsProps {
  cantidad: number;
  modoExplicacion: ModoExplicacion;
  modoExportacion: ModoExportacion;
  onCantidadChange: (value: number) => void;
  onModoExplicacionChange: (value: ModoExplicacion) => void;
  onModoExportacionChange: (value: ModoExportacion) => void;
  onGenerate: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  disabledExport: boolean;
}

export const GenerationControls = ({
  cantidad,
  modoExplicacion,
  modoExportacion,
  onCantidadChange,
  onModoExplicacionChange,
  onModoExportacionChange,
  onGenerate,
  onExportPdf,
  onPrint,
  disabledExport,
}: GenerationControlsProps) => {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="text-xs font-medium text-slate-700">
          Numero de combinaciones a generar
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
            value={cantidad}
            onChange={(e) => onCantidadChange(Number(e.target.value))}
          >
            {opcionesGeneracion.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-700">
          Modo de explicacion
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
            value={modoExplicacion}
            onChange={(e) => onModoExplicacionChange(e.target.value as ModoExplicacion)}
          >
            {opcionesExplicacion.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-medium text-slate-700">
          Modo de exportacion
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
            value={modoExportacion}
            onChange={(e) => onModoExportacionChange(e.target.value as ModoExportacion)}
          >
            <option value="editorial">Editorial</option>
            <option value="estandar">Estandar</option>
          </select>
        </label>

        <button
          type="button"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={onGenerate}
        >
          Generar combinaciones
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          onClick={onExportPdf}
          disabled={disabledExport}
        >
          Exportar a PDF
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50"
          onClick={onPrint}
          disabled={disabledExport}
        >
          Imprimir combinacion
        </button>
      </div>
    </section>
  );
};
