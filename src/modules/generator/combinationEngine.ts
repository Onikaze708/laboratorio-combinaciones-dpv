import type { GeneratedCombination, GeneratedStep, ModoExplicacion, TacticalState, Technique } from "../../types";
import { lateralityResolver } from "../laterality/lateralityResolver";
import { buildGeneralExplanation, buildStepExplanation } from "../pedagogy/explanationBuilder";
import { actionFilter } from "../techniques/actionFilter";
import { actionRepository } from "../techniques/actionRepository";
import { actionSelector } from "./actionSelector";
import { createTechnicalState } from "./createTechnicalState";
import { transitionResolver } from "./transitionResolver";
import { utilityEvaluator } from "./utilityEvaluator";

interface CombinationEngineOptions {
  modoExplicacion?: ModoExplicacion;
  variante?: number;
  longitud?: number;
}

const cloneState = (state: TacticalState): TacticalState => ({
  ...state,
  restriccionesEspaciales: [...state.restriccionesEspaciales],
  patronLateralManual: state.patronLateralManual ? [...state.patronLateralManual] : undefined,
  historialAcciones: [...state.historialAcciones],
  historialFamilias: [...state.historialFamilias],
  conteoRepeticiones: { ...state.conteoRepeticiones },
  conteoRepeticionesFamilia: { ...state.conteoRepeticionesFamilia },
});

const fallbackAction = (actions: Technique[]): Technique | null => {
  const available = [...actions].sort((a, b) => a.id.localeCompare(b.id));
  return available[0] ?? null;
};

const buildStepMetadata = (action: Technique) => {
  const family = actionRepository.getFamilyRule(action.familia);
  return {
    nombreTradicionalTecnica: action.nombreTradicional ?? action.nombre,
    nombreEspanolTecnica: action.nombreEspanol ?? action.nombre,
    familiaId: action.familia,
    familiaNombreTradicional: family?.nombreTradicional ?? family?.nombre ?? action.familia,
    familiaNombreEspanol: family?.nombreEspanol ?? family?.nombre ?? action.familia,
    familiaColor: family?.color,
  };
};

export const combinationEngine = (options: CombinationEngineOptions = {}): GeneratedCombination => {
  const { modoExplicacion = "detallado", variante = 0, longitud = 3 } = options;
  const initialState = createTechnicalState(longitud);

  const allActions = actionRepository.getAll();
  const pasos: GeneratedStep[] = [];
  const observaciones: string[] = [];

  let currentState = initialState;

  for (let i = 0; i < longitud; i += 1) {
    const stateBefore = cloneState(currentState);
    const validActions = actionFilter(currentState, allActions);
    const scoredActions = utilityEvaluator({
      state: currentState,
      filteredActions: validActions,
      allActions,
    });

    let selected = actionSelector(scoredActions, `${currentState.faseActual}-${i}-${variante}`);

    if (!selected) {
      selected = fallbackAction(validActions);
      if (selected) {
        observaciones.push(`Paso ${i + 1}: se uso una alternativa de respaldo por falta de tecnicas bien puntuadas.`);
      }
    }

    if (!selected) break;

    const side = lateralityResolver(currentState, selected, i + variante);
    const stateAfter = transitionResolver(currentState, selected, side);

    pasos.push({
      numero: i + 1,
      tecnicaId: selected.id,
      nombreTecnica: selected.nombre,
      ...buildStepMetadata(selected),
      ladoEjecutado: side,
      fase: stateBefore.faseActual,
      descripcionCorta: selected.descripcion,
      razonDeSeleccion: buildStepExplanation(stateBefore, selected, side, stateAfter, modoExplicacion),
      estadoAntes: stateBefore,
      estadoDespues: cloneState(stateAfter),
    });

    currentState = stateAfter;
  }

  return {
    id: `comb_auto_${Date.now()}_${variante}`,
    pasos,
    explicacionGeneral: buildGeneralExplanation(pasos, modoExplicacion),
    observaciones,
    fecha: new Date().toISOString(),
    favorita: false,
  };
};

export const generateAutomaticCombinations = (
  cantidad: number,
  modoExplicacion: ModoExplicacion,
  longitud = 3
): GeneratedCombination[] => {
  return Array.from({ length: cantidad }, (_, index) => combinationEngine({ modoExplicacion, variante: index, longitud }));
};

