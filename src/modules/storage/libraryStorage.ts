import type { FamilyRule, Technique, TransitionRule, UserLibraryFiles } from "../../types";

const STORAGE_KEYS = {
  userFamilies: "dpv_user_families_v1",
  userTechniques: "dpv_user_techniques_v1",
  userTransitionRules: "dpv_user_transition_rules_v1",
  legacy: "dpv_user_library_v1",
} as const;

const emptyLibraryFiles = (): UserLibraryFiles => ({
  userFamilies: [],
  userTechniques: [],
  userTransitionRules: [],
});

const canUseStorage = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readArray = <T>(key: string): T[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

const writeArray = <T>(key: string, value: T[]): void => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const migrateLegacyIfNeeded = (): void => {
  if (!canUseStorage()) return;
  const hasModernKeys = Object.values(STORAGE_KEYS).some((key) => key !== STORAGE_KEYS.legacy && window.localStorage.getItem(key));
  if (hasModernKeys) return;

  const legacy = window.localStorage.getItem(STORAGE_KEYS.legacy);
  if (!legacy) return;

  try {
    const parsed = JSON.parse(legacy) as { families?: FamilyRule[]; techniques?: Technique[]; transitions?: TransitionRule[] };
    writeArray(STORAGE_KEYS.userFamilies, Array.isArray(parsed.families) ? parsed.families : []);
    writeArray(STORAGE_KEYS.userTechniques, Array.isArray(parsed.techniques) ? parsed.techniques : []);
    writeArray(STORAGE_KEYS.userTransitionRules, Array.isArray(parsed.transitions) ? parsed.transitions : []);
  } catch {
    // ignore legacy migration errors
  }
};

const read = (): UserLibraryFiles => {
  migrateLegacyIfNeeded();
  return {
    userFamilies: readArray<FamilyRule>(STORAGE_KEYS.userFamilies),
    userTechniques: readArray<Technique>(STORAGE_KEYS.userTechniques),
    userTransitionRules: readArray<TransitionRule>(STORAGE_KEYS.userTransitionRules),
  };
};

const write = (library: UserLibraryFiles): void => {
  writeArray(STORAGE_KEYS.userFamilies, library.userFamilies);
  writeArray(STORAGE_KEYS.userTechniques, library.userTechniques);
  writeArray(STORAGE_KEYS.userTransitionRules, library.userTransitionRules);
};

const sanitize = (input: Partial<UserLibraryFiles> | null | undefined): UserLibraryFiles => ({
  userFamilies: Array.isArray(input?.userFamilies) ? input.userFamilies : [],
  userTechniques: Array.isArray(input?.userTechniques) ? input.userTechniques : [],
  userTransitionRules: Array.isArray(input?.userTransitionRules) ? input.userTransitionRules : [],
});

export const libraryStorage = {
  load: (): UserLibraryFiles => read(),
  save: (library: UserLibraryFiles): UserLibraryFiles => {
    const normalized = sanitize(library);
    write(normalized);
    return normalized;
  },
  clear: (): void => {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEYS.userFamilies);
    window.localStorage.removeItem(STORAGE_KEYS.userTechniques);
    window.localStorage.removeItem(STORAGE_KEYS.userTransitionRules);
  },
  upsertFamily: (family: FamilyRule): UserLibraryFiles => {
    const library = read();
    const next = {
      ...library,
      userFamilies: [...library.userFamilies.filter((item) => item.id !== family.id), { ...family, origen: "usuario" as const }],
    };
    write(next);
    return next;
  },
  deleteFamily: (familyId: string): UserLibraryFiles => {
    const library = read();
    const deleted = library.userFamilies.find((item) => item.id === familyId);
    const familyKey = deleted?.familia ?? familyId;
    const next = {
      userFamilies: library.userFamilies.filter((item) => item.id !== familyId),
      userTechniques: library.userTechniques.filter((item) => item.familia !== familyKey),
      userTransitionRules: library.userTransitionRules.filter(
        (item) => item.desdeFamilia !== familyKey && item.haciaFamilia !== familyKey
      ),
    };
    write(next);
    return next;
  },
  upsertTechnique: (technique: Technique): UserLibraryFiles => {
    const library = read();
    const next = {
      ...library,
      userTechniques: [
        ...library.userTechniques.filter((item) => item.id !== technique.id),
        { ...technique, origen: "usuario" as const },
      ],
    };
    write(next);
    return next;
  },
  deleteTechnique: (techniqueId: string): UserLibraryFiles => {
    const library = read();
    const next = {
      ...library,
      userTechniques: library.userTechniques.filter((item) => item.id !== techniqueId),
    };
    write(next);
    return next;
  },
  upsertTransition: (transition: TransitionRule): UserLibraryFiles => {
    const library = read();
    const next = {
      ...library,
      userTransitionRules: [
        ...library.userTransitionRules.filter(
          (item) => !(item.desdeFamilia === transition.desdeFamilia && item.haciaFamilia === transition.haciaFamilia)
        ),
        { ...transition, origen: "usuario" as const },
      ],
    };
    write(next);
    return next;
  },
  deleteTransition: (desdeFamilia: string, haciaFamilia: string): UserLibraryFiles => {
    const library = read();
    const next = {
      ...library,
      userTransitionRules: library.userTransitionRules.filter(
        (item) => !(item.desdeFamilia === desdeFamilia && item.haciaFamilia === haciaFamilia)
      ),
    };
    write(next);
    return next;
  },
};
