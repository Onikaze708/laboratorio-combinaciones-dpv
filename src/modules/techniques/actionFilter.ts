import { actionRepository } from "./actionRepository";
import type { TacticalState, Technique } from "../../types";

const isPhaseCompatible = (state: TacticalState, action: Technique): boolean => {
  const familyRule = actionRepository.getFamilyRule(action.familia);
  if (action.faseSugerida && action.faseSugerida.length > 0 && !action.faseSugerida.includes(state.faseActual)) {
    if (familyRule?.faseNatural !== state.faseActual) return false;
  }
  if (state.stepIndex === 0 && (action.puedeIniciar === false || familyRule?.puedeIniciar === false)) return false;
  if (state.stepIndex >= 2 && (action.puedeCerrar === false || familyRule?.puedeCerrar === false)) return false;
  if (state.stepIndex > 0 && state.stepIndex < 2 && (action.puedeContinuar === false || familyRule?.puedeFluir === false)) return false;
  return true;
};

const isRepetitionCompatible = (state: TacticalState, action: Technique): boolean => {
  const familyRule = actionRepository.getFamilyRule(action.familia);
  const repetitionCount = state.conteoRepeticiones[action.id] ?? 0;
  const familyCount = state.conteoRepeticionesFamilia[action.familia] ?? 0;
  const maxRepetitions = action.maxRepeticionesSugeridas ?? familyRule?.maxRepeticionesSugeridas ?? 1;
  const canRepeat = action.repetible ?? familyRule?.repetiblePorDefecto ?? false;
  const canRepeatConsecutive = action.repeticionConsecutivaPermitida ?? familyRule?.permitirRepeticionConsecutiva ?? false;

  if (repetitionCount > 0 && !canRepeat) return false;
  if (familyCount >= maxRepetitions) return false;
  if (state.accionPreviaId === action.id && !canRepeatConsecutive) return false;

  return true;
};

const isFamilyTransitionCompatible = (state: TacticalState, action: Technique): boolean => {
  const familiaPrevia = state.familiaPrevia;
  const currentFamilyRule = actionRepository.getFamilyRule(action.familia);
  const familiaPreviaRule = familiaPrevia ? actionRepository.getFamilyRule(familiaPrevia) : undefined;
  const transitionRule = actionRepository.getTransitionRule(familiaPrevia, action.familia);

  if (transitionRule && !transitionRule.permitido) return false;
  if (familiaPrevia && currentFamilyRule?.transicionesRestringidas.includes(familiaPrevia)) return false;
  if (familiaPreviaRule?.transicionesRestringidas.includes(action.familia)) return false;

  if (familiaPrevia && currentFamilyRule?.familiasCompatiblesAntes.length && !currentFamilyRule.familiasCompatiblesAntes.includes(familiaPrevia)) {
    const allowed = currentFamilyRule.transicionesNaturales.includes(familiaPrevia) || currentFamilyRule.transicionesPosibles.includes(familiaPrevia);
    if (!allowed) return false;
  }

  if (familiaPreviaRule?.familiasCompatiblesDespues.length && !familiaPreviaRule.familiasCompatiblesDespues.includes(action.familia)) {
    const allowed = familiaPreviaRule.transicionesNaturales.includes(action.familia) || familiaPreviaRule.transicionesPosibles.includes(action.familia);
    if (!allowed) return false;
  }

  if (familiaPrevia && action.compatibleDespuesDe.length > 0 && !action.compatibleDespuesDe.includes(familiaPrevia)) return false;
  if (state.accionPreviaId && action.compatibleAntesDe.length > 0 && !action.compatibleAntesDe.includes(state.accionPreviaId)) return false;

  return true;
};

export const actionFilter = (state: TacticalState, actions: Technique[]): Technique[] => {
  return actions.filter(
    (action) => isPhaseCompatible(state, action) && isRepetitionCompatible(state, action) && isFamilyTransitionCompatible(state, action)
  );
};

