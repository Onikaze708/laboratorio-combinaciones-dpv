import type { GeneratedCombination, ModoExplicacion } from "../types";

interface CombinationResultsProps {
  combinaciones: GeneratedCombination[];
  modoExplicacion: ModoExplicacion;
}

const traducirFase = (fase: string): string => fase.replaceAll("_", " ");
const traducirOrientacion = (orientacion: string): string => orientacion.replaceAll("_", " ");

const familyStyle = (color?: string) => {
  if (!color) return { borderColor: "#e2e8f0", backgroundColor: "#f8fafc" };
  return {
    borderColor: color,
    backgroundColor: `${color}12`,
  };
};

export const CombinationResults = ({ combinaciones, modoExplicacion }: CombinationResultsProps) => {
  if (combinaciones.length === 0) {
    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm text-slate-500">Las combinaciones generadas apareceran aqui.</p>
      </section>
    );
  }

  return (
    <div className="space-y-4 print:space-y-3">
      {combinaciones.map((combination, index) => (
        <section key={combination.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 print:break-inside-avoid print:shadow-none">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Combinacion {index + 1}</h3>
              <p className="text-xs text-slate-500">{combination.pasos.length} pasos generados</p>
            </div>
            <span className="text-xs text-slate-500">{new Date(combination.fecha).toLocaleString("es-ES")}</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {combination.pasos.map((step) => (
              <article
                key={`${combination.id}-${step.numero}-${step.tecnicaId}`}
                className="rounded-xl border p-4"
                style={familyStyle(step.familiaColor)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Paso {step.numero} - {step.nombreTradicionalTecnica ?? step.nombreTecnica}
                    </p>
                    <p className="text-sm text-slate-700">{step.nombreEspanolTecnica ?? step.nombreTecnica}</p>
                  </div>
                  {step.familiaColor ? <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: step.familiaColor }} /> : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                  <span className="rounded-full bg-white/80 px-2 py-1">{step.ladoEjecutado}</span>
                  <span className="rounded-full bg-white/80 px-2 py-1">{traducirFase(step.fase)}</span>
                </div>

                {(step.familiaNombreTradicional || step.familiaNombreEspanol) && (
                  <div className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-700 ring-1 ring-black/5">
                    <p className="font-semibold text-slate-800">Familia</p>
                    <p>{step.familiaNombreTradicional ?? step.familiaId}</p>
                    <p>{step.familiaNombreEspanol ?? step.familiaId}</p>
                  </div>
                )}

                <p className="mt-3 text-sm text-slate-700">Razon: {step.razonDeSeleccion}</p>
                {modoExplicacion === "detallado" && (
                  <p className="mt-3 text-xs text-slate-500">
                    Orientacion {traducirOrientacion(step.estadoDespues.orientacion)}, distancia {step.estadoDespues.distanciaActual}, salida {step.estadoDespues.opcionesDeSalida}.
                  </p>
                )}
              </article>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Explicacion general</p>
            <p className="mt-1 leading-6">{combination.explicacionGeneral}</p>
          </div>

          {combination.observaciones.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              {combination.observaciones.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
};

