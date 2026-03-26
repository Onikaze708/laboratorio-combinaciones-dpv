import familiasBaseData from "../../data/familias_base.json";
import tecnicasBaseData from "../../data/tecnicas_base.json";
import transitionRulesData from "../../data/transitionRules.json";
import userFamiliesData from "../../data/userFamilies.json";
import userTechniquesData from "../../data/userTechniques.json";
import userTransitionRulesData from "../../data/userTransitionRules.json";
import type { FamilyRule, Technique, TransitionRule, UserLibrary, UserLibraryFiles } from "../../types";
import { DIRECCIONES_TECNICAS, DISTANCIAS_TECNICAS, POSICIONES_TECNICAS } from "../../types";
import { libraryStorage } from "../storage/libraryStorage";

const normalizeFamily = (item: Partial<FamilyRule>, origen: "base" | "usuario"): FamilyRule => {
  const familyKey = item.familia ?? item.id ?? item.nombreEspanol ?? item.nombreTradicional ?? item.nombre ?? "familia";
  const id = item.id ?? familyKey;
  const nombreEspanol = item.nombreEspanol ?? item.nombre ?? familyKey;
  const nombreTradicional = item.nombreTradicional ?? item.descripcion ?? "";
  const transicionesNaturales = item.transicionesNaturales ?? item.familiasCompatiblesDespues ?? [];
  const transicionesPosibles = item.transicionesPosibles ?? [];
  const transicionesRestringidas = item.transicionesRestringidas ?? [];

  return {
    id,
    familia: item.familia ?? id,
    nombre: item.nombre ?? nombreEspanol,
    nombreTradicional,
    nombreEspanol,
    descripcion: item.descripcion ?? nombreTradicional,
    color: item.color,
    puedeIniciar: item.puedeIniciar ?? true,
    puedeFluir: item.puedeFluir ?? true,
    puedeCerrar: item.puedeCerrar ?? false,
    transicionesNaturales,
    transicionesPosibles,
    transicionesRestringidas,
    permitirRepeticionConsecutiva:
      item.permitirRepeticionConsecutiva ?? item.repeticionConsecutivaPermitida ?? true,
    maxRepeticionesSugeridas: item.maxRepeticionesSugeridas ?? 1,
    requiereCambioDeEstado: item.requiereCambioDeEstado ?? false,
    requiereCambioDeLado: item.requiereCambioDeLado ?? false,
    faseNatural: item.faseNatural ?? (item.puedeCerrar ? "salida_control_separacion" : item.puedeIniciar ? "respuesta_inicial" : "accion_principal"),
    familiasCompatiblesAntes: item.familiasCompatiblesAntes ?? [],
    familiasCompatiblesDespues: item.familiasCompatiblesDespues ?? transicionesNaturales,
    pesoBase: item.pesoBase ?? 0,
    repetiblePorDefecto: item.repetiblePorDefecto ?? true,
    repeticionConsecutivaPermitida:
      item.repeticionConsecutivaPermitida ?? item.permitirRepeticionConsecutiva ?? true,
    penalizacionBasePorRepeticion: item.penalizacionBasePorRepeticion ?? 8,
    origen,
  };
};

const normalizeTechnique = (item: Partial<Technique>, origen: "base" | "usuario"): Technique => {
  const familyKey = item.familia ?? item.familiaId ?? "personalizada";
  const nombre = item.nombre ?? item.nombreEspanol ?? item.nombreTradicional ?? item.id ?? "Tecnica";

  return {
    id: item.id ?? `tec_${Date.now()}`,
    nombre,
    nombreTradicional: item.nombreTradicional ?? nombre,
    nombreEspanol: item.nombreEspanol ?? nombre,
    categoria: item.categoria ?? familyKey,
    subcategoria: item.subcategoria ?? "base",
    familia: familyKey,
    familiaId: item.familiaId ?? familyKey,
    tipo: item.tipo ?? "general",
    variante: item.variante ?? "base",
    descripcion: item.descripcion ?? item.nombreTradicional ?? item.nombreEspanol ?? nombre,
    nivel: item.nivel ?? "basico",
    posicionesValidas: item.posicionesValidas ?? [...POSICIONES_TECNICAS],
    distanciasValidas: item.distanciasValidas ?? [...DISTANCIAS_TECNICAS],
    direccionesCompatibles: item.direccionesCompatibles ?? [...DIRECCIONES_TECNICAS],
    limitantesIncompatibles: item.limitantesIncompatibles ?? [],
    requiereMovilidad: item.requiereMovilidad ?? false,
    requiereGiro: item.requiereGiro ?? false,
    tipoGiro: item.tipoGiro ?? "ninguno",
    ladoEjecutable: item.ladoEjecutable ?? "ambos",
    ladoRequerido: item.ladoRequerido,
    ladosIncompatibles: item.ladosIncompatibles ?? [],
    permitidaSentado: item.permitidaSentado ?? true,
    permitidaSuelo: item.permitidaSuelo ?? false,
    requiereEspacioAmplio: item.requiereEspacioAmplio ?? false,
    compatibleConManoOcupada: item.compatibleConManoOcupada ?? true,
    compatibleConPiernaLimitada: item.compatibleConPiernaLimitada ?? true,
    faseSugerida: item.faseSugerida ?? ["accion_principal"],
    puedeIniciar: item.puedeIniciar ?? true,
    puedeContinuar: item.puedeContinuar ?? true,
    puedeCerrar: item.puedeCerrar ?? true,
    transicionesValidas: item.transicionesValidas ?? [],
    transicionesInvalidas: item.transicionesInvalidas ?? [],
    prioridadContextual: item.prioridadContextual ?? {},
    erroresComunes: item.erroresComunes ?? [],
    tags: item.tags ?? [],
    repetible: item.repetible ?? false,
    maxRepeticionesSugeridas: item.maxRepeticionesSugeridas ?? (item.repetible ? 3 : 1),
    repeticionConsecutivaPermitida: item.repeticionConsecutivaPermitida ?? item.repetible ?? false,
    penalizacionPorRepeticion: item.penalizacionPorRepeticion ?? 8,
    compatibleDespuesDe: item.compatibleDespuesDe ?? [],
    compatibleAntesDe: item.compatibleAntesDe ?? [],
    efectoDistancia: item.efectoDistancia ?? "mantiene",
    efectoOrientacion: item.efectoOrientacion ?? "mantiene",
    efectoEquilibrio: item.efectoEquilibrio ?? "mantiene",
    origen,
  };
};

const withOrigin = {
  family: (item: Partial<FamilyRule>, origen: "base" | "usuario"): FamilyRule => normalizeFamily(item, origen),
  technique: (item: Partial<Technique>, origen: "base" | "usuario"): Technique => normalizeTechnique(item, origen),
  transition: (item: TransitionRule, origen: "base" | "usuario"): TransitionRule => ({ ...item, origen }),
};

const mergeBy = <T>(items: T[], key: (item: T) => string): T[] => {
  const map = new Map<string, T>();
  items.forEach((item) => map.set(key(item), item));
  return Array.from(map.values());
};

const mergeLibrary = (): UserLibrary => {
  const user = libraryStorage.load();
  const families = mergeBy(
    [
      ...(familiasBaseData as Partial<FamilyRule>[]).map((item) => withOrigin.family(item, "base")),
      ...(userFamiliesData as Partial<FamilyRule>[]).map((item) => withOrigin.family(item, "usuario")),
      ...user.userFamilies.map((item) => withOrigin.family(item, "usuario")),
    ],
    (item) => item.id
  );

  const techniques = mergeBy(
    [
      ...(tecnicasBaseData as Partial<Technique>[]).map((item) => withOrigin.technique(item, "base")),
      ...(userTechniquesData as Partial<Technique>[]).map((item) => withOrigin.technique(item, "usuario")),
      ...user.userTechniques.map((item) => withOrigin.technique(item, "usuario")),
    ],
    (item) => item.id
  );

  const transitions = mergeBy(
    [
      ...(transitionRulesData as TransitionRule[]).map((item) => withOrigin.transition(item, "base")),
      ...(userTransitionRulesData as TransitionRule[]).map((item) => withOrigin.transition(item, "usuario")),
      ...user.userTransitionRules.map((item) => withOrigin.transition(item, "usuario")),
    ],
    (item) => `${item.desdeFamilia}=>${item.haciaFamilia}`
  );

  return { families, techniques, transitions };
};

export const actionRepository = {
  getAll: (): Technique[] => mergeLibrary().techniques,
  getFamilyRules: (): FamilyRule[] => mergeLibrary().families,
  getTransitionRules: (): TransitionRule[] => mergeLibrary().transitions,
  getFamilyRule: (familia: string): FamilyRule | undefined =>
    mergeLibrary().families.find((rule) => rule.familia === familia || rule.id === familia),
  getTransitionRule: (desdeFamilia?: string, haciaFamilia?: string): TransitionRule | undefined => {
    if (!desdeFamilia || !haciaFamilia) return undefined;
    return mergeLibrary().transitions.find(
      (rule) => rule.desdeFamilia === desdeFamilia && rule.haciaFamilia === haciaFamilia
    );
  },
  getUserLibrary: (): UserLibraryFiles => libraryStorage.load(),
  saveUserLibrary: (library: UserLibraryFiles): UserLibraryFiles => libraryStorage.save(library),
  upsertFamily: (family: FamilyRule): UserLibraryFiles => libraryStorage.upsertFamily(normalizeFamily(family, "usuario")),
  deleteFamily: (familyId: string): UserLibraryFiles => libraryStorage.deleteFamily(familyId),
  upsertTechnique: (technique: Technique): UserLibraryFiles => libraryStorage.upsertTechnique(normalizeTechnique(technique, "usuario")),
  deleteTechnique: (techniqueId: string): UserLibraryFiles => libraryStorage.deleteTechnique(techniqueId),
  upsertTransition: (transition: TransitionRule): UserLibraryFiles => libraryStorage.upsertTransition(transition),
  deleteTransition: (desdeFamilia: string, haciaFamilia: string): UserLibraryFiles =>
    libraryStorage.deleteTransition(desdeFamilia, haciaFamilia),
  exportMergedLibrary: (): UserLibrary => mergeLibrary(),
  exportUserLibraryFiles: (): UserLibraryFiles => libraryStorage.load(),
};

