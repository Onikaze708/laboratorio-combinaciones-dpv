import type { FamilyRule, Technique, TransitionRule } from "../types";
import { DIRECCIONES_TECNICAS, DISTANCIAS_TECNICAS, POSICIONES_TECNICAS } from "../types";

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "familia_nueva";

export const crearFamiliaPlantilla = (nombre?: string): FamilyRule => {
  const id = slugify(nombre ?? "familia_nueva");
  return {
    id,
    familia: id,
    nombre: nombre ?? "Familia nueva",
    descripcion: "",
    permitirRepeticionConsecutiva: true,
    maxRepeticionesSugeridas: 3,
    requiereCambioDeEstado: false,
    requiereCambioDeLado: false,
    faseNatural: "accion_principal",
    familiasCompatiblesAntes: [],
    familiasCompatiblesDespues: [],
    pesoBase: 0,
    repetiblePorDefecto: true,
    repeticionConsecutivaPermitida: true,
    penalizacionBasePorRepeticion: 6,
    origen: "usuario",
  };
};

export const crearTecnicaPlantilla = (familia?: string): Technique => ({
  id: `usr_${Date.now()}`,
  nombre: "Tecnica nueva",
  categoria: familia ?? "personalizada",
  subcategoria: "base",
  familia: familia ?? "personalizada",
  tipo: "general",
  variante: "base",
  descripcion: "",
  nivel: "basico",
  posicionesValidas: [...POSICIONES_TECNICAS],
  distanciasValidas: [...DISTANCIAS_TECNICAS],
  direccionesCompatibles: [...DIRECCIONES_TECNICAS],
  limitantesIncompatibles: [],
  requiereMovilidad: false,
  requiereGiro: false,
  tipoGiro: "ninguno",
  ladoEjecutable: "ambos",
  ladosIncompatibles: [],
  permitidaSentado: true,
  permitidaSuelo: false,
  requiereEspacioAmplio: false,
  compatibleConManoOcupada: true,
  compatibleConPiernaLimitada: true,
  faseSugerida: ["accion_principal"],
  puedeIniciar: true,
  puedeContinuar: true,
  puedeCerrar: true,
  transicionesValidas: [],
  transicionesInvalidas: [],
  prioridadContextual: {},
  erroresComunes: [],
  tags: [],
  repetible: true,
  maxRepeticionesSugeridas: 3,
  repeticionConsecutivaPermitida: true,
  penalizacionPorRepeticion: 6,
  compatibleDespuesDe: [],
  compatibleAntesDe: [],
  efectoDistancia: "mantiene",
  efectoOrientacion: "mantiene",
  efectoEquilibrio: "mantiene",
  origen: "usuario",
});

export const crearTransicionPlantilla = (familias: string[]): TransitionRule => ({
  desdeFamilia: familias[0] ?? "desplazamiento",
  haciaFamilia: familias[1] ?? familias[0] ?? "bloqueo",
  permitido: true,
  bonificacion: 5,
  nota: "",
  origen: "usuario",
});

