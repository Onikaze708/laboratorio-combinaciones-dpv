import type { ScoredAction, Technique } from "../../types";

const stableHash = (text: string): number => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const actionSelector = (scoredActions: ScoredAction[], seed: string): Technique | null => {
  if (scoredActions.length === 0) return null;

  const bestScore = scoredActions[0].score;
  const coherentTop = scoredActions
    .filter((item) => bestScore - item.score <= 18)
    .slice(0, 6);

  if (coherentTop.length === 1) {
    return coherentTop[0].action;
  }

  const pivot = stableHash(seed);
  const weightedIndex = pivot % coherentTop.length;
  return coherentTop[weightedIndex].action;
};
