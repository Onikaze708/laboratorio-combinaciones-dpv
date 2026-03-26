import type {
  CategoriaManual,
  GeneratedCombination,
  GeneratedStep,
  ModoExplicacion,
  PasoManualConfig,
  TacticalState,
  TacticalState as TacticalStateType,
  Technique,
} from "../../types";
import { lateralityResolver } from "../laterality/lateralityResolver";
import { buildGeneralExplanation, buildStepExplanation } from "../pedagogy/explanationBuilder";
import { actionFilter } from "../techniques/actionFilter";
import { actionRepository } from "../techniques/actionRepository";
import { actionSelector } from "./actionSelector";
import { createTechnicalState } from "./createTechnicalState";
import { transitionResolver } from "./transitionResolver";
import { utilityEvaluator } from "./utilityEvaluator";

const cloneState = (state: TacticalState): TacticalState => ({
  ...state,
  restriccionesEspaciales: [...state.restriccionesEspaciales],
  patronLateralManual: state.patronLateralManual ? [...state.patronLateralManual] : undefined,
  opcionesDeSalida: state.opcionesDeSalida,
  historialAcciones: [...state.historialAcciones],
  historialFamilias: [...state.historialFamilias],
  conteoRepeticiones: { ...state.conteoRepeticiones },
  conteoRepeticionesFamilia: { ...state.conteoRepeticionesFamilia },
});

const inferPhaseForIndex = (
  index: number,
  total: number,
  categoria: CategoriaManual
): TacticalStateType["faseActual"] => {
  if (index === 0) return "respuesta_inicial";
  if (index === total - 1) {
    return ["escape", "separacion", "control", "luxacion", "osae_waza", "kansetsu_waza", "shime_waza", "ne_waza"].includes(categoria)
      ? "salida_control_separacion"
      : "accion_principal";
  }
  if (["tai_sabaki", "uke_waza"].includes(categoria)) return "ajuste_reorientacion";
  return "accion_principal";
};

const filterByManualCategory = (actions: Technique[], categoria: CategoriaManual): Technique[] => {
  return actions.filter((action) => action.familia === categoria);
};

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

const normalizeEstructura = (estructura: Array<PasoManualConfig | CategoriaManual>): PasoManualConfig[] =>
  estructura.map((item) =>
    typeof item === "string"
      ? { modo: "familia", categoria: item }
      : { modo: item.modo, categoria: item.categoria, tecnicaId: item.tecnicaId }
  );

export const generateManualAssistedCombinations = (
  estructuraInput: Array<PasoManualConfig | CategoriaManual>,
  cantidad: number,
  modoExplicacion: ModoExplicacion
): GeneratedCombination[] => {
  const estructura = normalizeEstructura(estructuraInput);
  const allActions = actionRepository.getAll();

  return Array.from({ length: cantidad }, (_, variante) => {
    const pasos: GeneratedStep[] = [];
    const observaciones: string[] = [];
    let currentState = createTechnicalState(estructura.length);

    for (let index = 0; index < estructura.length; index += 1) {
      const pasoConfig = estructura[index];
      const categoria = pasoConfig.categoria;
      const stateBefore = cloneState({
        ...currentState,
        faseActual: inferPhaseForIndex(index, estructura.length, categoria),
      });

      const filteredByState = actionFilter(stateBefore, allActions);
      const validActions =
        pasoConfig.modo === "tecnica_especifica" && pasoConfig.tecnicaId
          ? filteredByState.filter((action) => action.id === pasoConfig.tecnicaId)
          : filterByManualCategory(filteredByState, categoria);

      const scored = utilityEvaluator({
        state: stateBefore,
        filteredActions: validActions,
        allActions,
      }).map((entry, entryIndex) => ({
        ...entry,
        score: entry.score - variante * 2 - entryIndex,
      }));

      let selected =
        pasoConfig.modo === "tecnica_especifica" && pasoConfig.tecnicaId
          ? scored[0]?.action ?? null
          : actionSelector(scored, `${estructura.map((item) => `${item.modo}:${item.tecnicaId ?? item.categoria}`).join("-")}-${variante}-${index}`);

      if (!selected && pasoConfig.modo === "familia") {
        selected = fallbackAction(filterByManualCategory(allActions, categoria));
        if (selected) {
          observaciones.push(`Paso ${index + 1}: se uso una alternativa de respaldo para la familia ${categoria}.`);
        }
      }

      if (!selected && pasoConfig.modo === "tecnica_especifica" && pasoConfig.tecnicaId) {
        const requerida = allActions.find((action) => action.id === pasoConfig.tecnicaId);
        observaciones.push(
          requerida
            ? `Paso ${index + 1}: la tecnica especifica ${requerida.nombreTradicional ?? requerida.nombre} no fue compatible con la secuencia actual.`
            : `Paso ${index + 1}: no se encontro la tecnica especificada ${pasoConfig.tecnicaId}.`
        );
        break;
      }

      if (!selected) {
        observaciones.push(`Paso ${index + 1}: no se encontro tecnica compatible para la familia ${categoria}.`);
        break;
      }

      const side = lateralityResolver(stateBefore, selected, index + variante);
      const stateAfter = transitionResolver(stateBefore, selected, side);

      pasos.push({
        numero: index + 1,
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
      id: `comb_manual_${Date.now()}_${variante}`,
      pasos,
      explicacionGeneral: buildGeneralExplanation(pasos, modoExplicacion),
      observaciones,
      fecha: new Date().toISOString(),
      favorita: false,
    };
  });
};

