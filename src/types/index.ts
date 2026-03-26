import type { Technique } from "./Technique";

export * from "./TacticalState";
export * from "./Technique";
export * from "./GeneratedStep";
export * from "./GeneratedCombination";

export interface ScoredAction {
  action: Technique;
  score: number;
  reasons: string[];
}
