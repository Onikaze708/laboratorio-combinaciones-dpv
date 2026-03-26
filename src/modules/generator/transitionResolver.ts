import type { TacticalPhase, TacticalState, Technique } from "../../types";

const phaseOrder: TacticalPhase[] = [
  "respuesta_inicial",
  "ajuste_reorientacion",
  "accion_principal",
  "salida_control_separacion",
];

const resolveNextPhase = (state: TacticalState): TacticalPhase => {
  const idx = phaseOrder.indexOf(state.faseActual);
  if (idx < 0 || idx >= phaseOrder.length - 1) return "salida_control_separacion";
  return phaseOrder[idx + 1];
};

const resolveOrientation = (
  prev: TacticalState["orientacion"],
  action: Technique
): TacticalState["orientacion"] => {
  if (action.efectoOrientacion === "mantiene") return prev;
  return action.efectoOrientacion;
};

const resolveBalance = (state: TacticalState, action: Technique): TacticalState["equilibrio"] => {
  if (action.efectoEquilibrio === "mejora") return "estable";
  if (action.efectoEquilibrio === "compromete") return "inestable";
  return state.equilibrio;
};

const resolveExitOptions = (
  action: Technique,
  phase: TacticalState["faseActual"]
): TacticalState["opcionesDeSalida"] => {
  if (phase === "salida_control_separacion" && (action.puedeCerrar || ["osae_waza", "kansetsu_waza", "shime_waza", "ne_waza"].includes(action.familia))) {
    return "alta";
  }
  if (phase === "accion_principal") return "media";
  return "baja";
};

export const transitionResolver = (
  state: TacticalState,
  action: Technique,
  side: "derecha" | "izquierda"
): TacticalState => {
  const faseActual = resolveNextPhase(state);
  const equilibrio = resolveBalance(state, action);
  const orientacion = resolveOrientation(state.orientacion, action);

  const ladoLibre = side === "derecha" ? "izquierda" : "derecha";
  const ladoExpuesto = side;

  return {
    ...state,
    orientacion,
    equilibrio,
    ladoLibre,
    ladoExpuesto,
    faseActual,
    opcionesDeSalida: resolveExitOptions(action, faseActual),
    accionPreviaId: action.id,
    familiaPrevia: action.familia,
    lateralidadPrevia: side,
    stepIndex: state.stepIndex + 1,
    historialAcciones: [...state.historialAcciones, action.id],
    historialFamilias: [...state.historialFamilias, action.familia],
    conteoRepeticiones: {
      ...state.conteoRepeticiones,
      [action.id]: (state.conteoRepeticiones[action.id] ?? 0) + 1,
    },
    conteoRepeticionesFamilia: {
      ...state.conteoRepeticionesFamilia,
      [action.familia]: (state.conteoRepeticionesFamilia[action.familia] ?? 0) + 1,
    },
  };
};

