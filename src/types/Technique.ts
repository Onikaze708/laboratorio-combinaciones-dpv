export type PosicionTecnica =
  | "de_pie"
  | "sentado"
  | "derribado"
  | "suelo_boca_arriba"
  | "suelo_de_lado"
  | "boca_abajo";

export type DireccionTecnica =
  | "frente"
  | "diagonal_derecha"
  | "diagonal_izquierda"
  | "lado_derecho"
  | "lado_izquierdo"
  | "desde_atras";

export type DistanciaTecnica = "larga" | "media" | "corta" | "contacto" | "clinch";

export type RestriccionTecnica =
  | "espalda_contra_pared"
  | "lado_derecho_bloqueado"
  | "lado_izquierdo_bloqueado"
  | "poco_espacio"
  | "movilidad_parcial"
  | "mano_ocupada"
  | "vision_parcial"
  | "suelo_resbaladizo"
  | "obstaculo_detras"
  | "incorporacion_dificil";

export type NivelDeseado = "basico" | "intermedio" | "avanzado";
export type Lado = "derecha" | "izquierda";
export type ModoLateral = "automatico" | "forzar_derecha" | "forzar_izquierda" | "alternado" | "ambidiestro" | "manual";
export type ObjetivoTecnico = "respuesta_basica" | "adaptacion_espacial" | "orientacion_corporal" | "salida_tactica" | "incorporacion" | "continuidad";

export const POSICIONES_TECNICAS: PosicionTecnica[] = ["de_pie", "sentado", "derribado", "suelo_boca_arriba", "suelo_de_lado", "boca_abajo"];
export const DISTANCIAS_TECNICAS: DistanciaTecnica[] = ["larga", "media", "corta", "contacto", "clinch"];
export const DIRECCIONES_TECNICAS: DireccionTecnica[] = ["frente", "diagonal_derecha", "diagonal_izquierda", "lado_derecho", "lado_izquierdo", "desde_atras"];
export const RESTRICCIONES_TECNICAS: RestriccionTecnica[] = [
  "espalda_contra_pared",
  "lado_derecho_bloqueado",
  "lado_izquierdo_bloqueado",
  "poco_espacio",
  "movilidad_parcial",
  "mano_ocupada",
  "vision_parcial",
  "suelo_resbaladizo",
  "obstaculo_detras",
  "incorporacion_dificil",
];
export const NIVELES_TECNICOS: NivelDeseado[] = ["basico", "intermedio", "avanzado"];

import type { TacticalPhase } from "./TacticalState";

export interface Technique {
  id: string;
  nombre: string;
  nombreTradicional?: string;
  nombreEspanol?: string;
  categoria: string;
  subcategoria: string;
  familia: string;
  familiaId?: string;
  tipo?: string;
  variante?: string;
  descripcion: string;
  nivel?: NivelDeseado;
  posicionesValidas: PosicionTecnica[];
  distanciasValidas: DistanciaTecnica[];
  direccionesCompatibles: DireccionTecnica[];
  limitantesIncompatibles: RestriccionTecnica[];
  requiereMovilidad?: boolean;
  requiereGiro?: boolean;
  tipoGiro?: "ninguno" | "parcial" | "completo";
  ladoEjecutable: "ambos" | Lado;
  ladoRequerido?: Lado;
  ladosIncompatibles?: Lado[];
  permitidaSentado?: boolean;
  permitidaSuelo?: boolean;
  requiereEspacioAmplio?: boolean;
  compatibleConManoOcupada?: boolean;
  compatibleConPiernaLimitada?: boolean;
  faseSugerida?: TacticalPhase[];
  puedeIniciar?: boolean;
  puedeContinuar?: boolean;
  puedeCerrar?: boolean;
  transicionesValidas?: string[];
  transicionesInvalidas?: string[];
  prioridadContextual?: Partial<Record<ObjetivoTecnico, number>>;
  erroresComunes?: string[];
  tags?: string[];
  repetible: boolean;
  maxRepeticionesSugeridas: number;
  repeticionConsecutivaPermitida?: boolean;
  penalizacionPorRepeticion?: number;
  compatibleDespuesDe: string[];
  compatibleAntesDe: string[];
  efectoDistancia: "acorta" | "mantiene" | "amplia";
  efectoOrientacion: "mantiene" | "perfil_derecha" | "perfil_izquierda" | "desfasada";
  efectoEquilibrio: "mejora" | "mantiene" | "compromete";
  origen?: "base" | "usuario";
}

export interface FamilyRule {
  id: string;
  familia: string;
  nombre: string;
  nombreTradicional?: string;
  nombreEspanol?: string;
  descripcion: string;
  color?: string;
  puedeIniciar?: boolean;
  puedeFluir?: boolean;
  puedeCerrar?: boolean;
  transicionesNaturales: string[];
  transicionesPosibles: string[];
  transicionesRestringidas: string[];
  permitirRepeticionConsecutiva: boolean;
  maxRepeticionesSugeridas: number;
  requiereCambioDeEstado: boolean;
  requiereCambioDeLado: boolean;
  faseNatural: TacticalPhase;
  familiasCompatiblesAntes: string[];
  familiasCompatiblesDespues: string[];
  pesoBase: number;
  repetiblePorDefecto?: boolean;
  repeticionConsecutivaPermitida?: boolean;
  penalizacionBasePorRepeticion?: number;
  origen?: "base" | "usuario";
}

export interface TransitionRule {
  desdeFamilia: string;
  haciaFamilia: string;
  permitido: boolean;
  bonificacion: number;
  nota?: string;
  origen?: "base" | "usuario";
}

export interface UserLibraryFiles {
  userFamilies: FamilyRule[];
  userTechniques: Technique[];
  userTransitionRules: TransitionRule[];
}

export interface UserLibrary {
  families: FamilyRule[];
  techniques: Technique[];
  transitions: TransitionRule[];
}
