import type { Lado, TacticalState, Technique } from "../../types";

const opposite = (side: Lado): Lado => (side === "derecha" ? "izquierda" : "derecha");

const preferredSide = (state: TacticalState): Lado => {
  if (state.ladoLibre === "derecha" && state.ladoDerechoDisponible) return "derecha";
  if (state.ladoLibre === "izquierda" && state.ladoIzquierdoDisponible) return "izquierda";

  if (!state.ladoIzquierdoDisponible) return "derecha";
  if (!state.ladoDerechoDisponible) return "izquierda";

  if (state.orientacion === "perfil_derecha") return "derecha";
  if (state.orientacion === "perfil_izquierda") return "izquierda";

  if (state.direccionReferencia === "lado_derecho" || state.direccionReferencia === "diagonal_derecha") return "derecha";
  if (state.direccionReferencia === "lado_izquierdo" || state.direccionReferencia === "diagonal_izquierda") return "izquierda";

  return "derecha";
};

export const lateralityResolver = (
  state: TacticalState,
  selectedAction: Technique,
  stepIndex: number,
  manualPattern?: Lado[]
): Lado => {
  if (state.modoLateral === "forzar_derecha") return "derecha";
  if (state.modoLateral === "forzar_izquierda") return "izquierda";

  const pattern = manualPattern ?? state.patronLateralManual;
  if (state.modoLateral === "manual" && pattern && pattern.length > 0) {
    return pattern[stepIndex % pattern.length];
  }

  const base = preferredSide(state);

  if (state.modoLateral === "alternado" || state.modoLateral === "ambidiestro") {
    return stepIndex % 2 === 0 ? base : opposite(base);
  }

  let side = base;

  if (selectedAction.ladoRequerido) {
    side = selectedAction.ladoRequerido;
  }

  if (selectedAction.ladoEjecutable !== "ambos") {
    side = selectedAction.ladoEjecutable;
  }

  if (selectedAction.ladosIncompatibles.includes(side)) {
    side = opposite(side);
  }

  if (!state.ladoIzquierdoDisponible && side === "izquierda") side = "derecha";
  if (!state.ladoDerechoDisponible && side === "derecha") side = "izquierda";

  if (state.lateralidadPrevia && selectedAction.requiereGiro) {
    side = opposite(state.lateralidadPrevia);
  }

  return side;
};

