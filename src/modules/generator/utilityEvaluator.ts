import { actionRepository } from "../techniques/actionRepository";
import type { ScoredAction, TacticalState, Technique } from "../../types";

interface UtilityInput {
  state: TacticalState;
  filteredActions: Technique[];
  allActions: Technique[];
}

const getPreviousAction = (state: TacticalState, allActions: Technique[]): Technique | undefined => {
  if (!state.accionPreviaId) return undefined;
  return allActions.find((action) => action.id === state.accionPreviaId);
};

const phaseCoherenceBonus = (state: TacticalState, action: Technique): number => {
  const familyRule = actionRepository.getFamilyRule(action.familia);
  if (action.faseSugerida?.includes(state.faseActual)) return 12;
  if (familyRule?.faseNatural === state.faseActual) return 10;
  if (state.faseActual === "salida_control_separacion" && (action.puedeCerrar || familyRule?.puedeCerrar)) return 9;
  if (state.faseActual !== "respuesta_inicial" && (action.puedeContinuar || familyRule?.puedeFluir)) return 6;
  return -8;
};

const transitionCoherence = (previousAction: Technique | undefined, action: Technique): number => {
  if (!previousAction) return 0;

  const familiaPreviaRule = actionRepository.getFamilyRule(previousAction.familia);
  const currentFamilyRule = actionRepository.getFamilyRule(action.familia);
  const rule = actionRepository.getTransitionRule(previousAction.familia, action.familia);
  if (rule) {
    if (!rule.permitido) return -100;
    return rule.bonificacion;
  }

  if (familiaPreviaRule?.transicionesRestringidas.includes(action.familia)) return -90;
  if (currentFamilyRule?.transicionesRestringidas.includes(previousAction.familia)) return -90;
  if (familiaPreviaRule?.transicionesNaturales.includes(action.familia)) return 16;
  if (currentFamilyRule?.transicionesNaturales.includes(previousAction.familia)) return 10;
  if (familiaPreviaRule?.transicionesPosibles.includes(action.familia)) return 8;
  if (previousAction.transicionesInvalidas?.includes(action.id)) return -100;
  if (previousAction.transicionesValidas?.includes(action.id)) return 18;
  if (action.compatibleDespuesDe.length === 0 || action.compatibleDespuesDe.includes(previousAction.familia)) return 0;
  return -12;
};

const repetitionScore = (state: TacticalState, action: Technique): number => {
  const familyRule = actionRepository.getFamilyRule(action.familia);
  const exactCount = state.conteoRepeticiones[action.id] ?? 0;
  const familyCount = state.conteoRepeticionesFamilia[action.familia] ?? 0;
  const repeatPenalty = action.penalizacionPorRepeticion ?? familyRule?.penalizacionBasePorRepeticion ?? 10;
  const maxRepeat = action.maxRepeticionesSugeridas ?? familyRule?.maxRepeticionesSugeridas ?? 1;

  let score = familyRule?.pesoBase ?? 0;

  if (exactCount > 0) score -= repeatPenalty * exactCount;

  if (state.familiaPrevia === action.familia) {
    if (action.repeticionConsecutivaPermitida || familyRule?.permitirRepeticionConsecutiva) {
      score += ["tsuki_waza", "uke_waza", "tai_sabaki", "geri_waza", "atemi_waza"].includes(action.familia) ? 10 : 4;
    } else {
      score -= 40;
    }
  }

  if (familyCount >= maxRepeat) score -= 80;

  return score;
};

const familyBehaviorScore = (state: TacticalState, action: Technique): number => {
  const familyRule = actionRepository.getFamilyRule(action.familia);
  if (!familyRule) return 0;

  let score = 0;
  if (familyRule.requiereCambioDeEstado && state.familiaPrevia === action.familia) score -= 15;
  if (familyRule.requiereCambioDeLado && state.familiaPrevia === action.familia && state.lateralidadPrevia) score -= 8;
  if (familyRule.faseNatural === state.faseActual) score += 8;
  if (state.stepIndex === 0 && familyRule.puedeIniciar) score += 5;
  if (state.stepIndex >= 2 && familyRule.puedeCerrar) score += 8;
  return score;
};

const scoreAction = (state: TacticalState, action: Technique, previousAction: Technique | undefined): ScoredAction => {
  let score = 0;
  const reasons: string[] = [];

  const phaseScore = phaseCoherenceBonus(state, action);
  score += phaseScore;
  if (phaseScore > 0) reasons.push("coherencia de fase");

  const familyScore = familyBehaviorScore(state, action);
  score += familyScore;
  if (familyScore > 0) reasons.push("coherencia de familia");

  const transitionScore = transitionCoherence(previousAction, action);
  score += transitionScore;
  if (transitionScore > 0) reasons.push("coherencia de transicion");
  if (transitionScore < -20) reasons.push("conflicto de transicion");

  const repeatScore = repetitionScore(state, action);
  score += repeatScore;
  if (repeatScore > 0) reasons.push("repeticion util");
  if (repeatScore < 0) reasons.push("penalizacion por repeticion");

  return {
    action,
    score,
    reasons,
  };
};

export const utilityEvaluator = ({ state, filteredActions, allActions }: UtilityInput): ScoredAction[] => {
  const previousAction = getPreviousAction(state, allActions);

  return filteredActions
    .map((action) => scoreAction(state, action, previousAction))
    .filter((item) => item.score > -120)
    .sort((a, b) => b.score - a.score);
};

