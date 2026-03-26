import type { GeneratedStep, ModoExplicacion, TacticalState, Technique } from "../../types";

const traducirFase = (fase: TacticalState["faseActual"]): string => {
  switch (fase) {
    case "respuesta_inicial":
      return "respuesta inicial";
    case "ajuste_reorientacion":
      return "ajuste y reorientacion";
    case "accion_principal":
      return "accion principal";
    case "salida_control_separacion":
      return "salida o separacion";
  }
};

export const buildStepExplanation = (
  before: TacticalState,
  action: Technique,
  side: "derecha" | "izquierda",
  after: TacticalState,
  mode: ModoExplicacion = "detallado"
): string => {
  if (mode === "corto") {
    return `${action.nombreTradicional ?? action.nombre} encaja en ${traducirFase(before.faseActual)}.`;
  }

  const reasons: string[] = [];
  reasons.push(`Elegido por coherencia tecnica en ${traducirFase(before.faseActual)}`);

  if (before.familiaPrevia && before.familiaPrevia !== action.familia) {
    reasons.push(`continua bien despues de ${before.familiaPrevia}`);
  }

  if (before.familiaPrevia === action.familia && action.repeticionConsecutivaPermitida) {
    reasons.push("la repeticion consecutiva es valida en esta familia");
  }

  if (after.faseActual !== before.faseActual) {
    reasons.push(`la secuencia avanza hacia ${traducirFase(after.faseActual)}`);
  }

  reasons.push(`lado ejecutado ${side}`);
  return reasons.join(", ") + ".";
};

export const buildGeneralExplanation = (
  steps: GeneratedStep[],
  mode: ModoExplicacion = "detallado"
): string => {
  if (steps.length === 0) {
    return "No se pudo generar una combinacion tecnicamente coherente.";
  }

  const first = steps[0];
  const last = steps[steps.length - 1];

  if (mode === "corto") {
    return `La secuencia inicia con ${first.nombreTecnica} y cierra con ${last.nombreTecnica}.`;
  }

  return `La secuencia comienza con ${first.nombreTecnica}, mantiene continuidad tecnica entre pasos y finaliza con ${last.nombreTecnica} como cierre de la combinacion.`;
};

