import type { TacticalState } from "../../types";

export const createTechnicalState = (longitudSecuencia = 3): TacticalState => ({
  postura: "de_pie",
  subPostura: "neutra",
  orientacion: "frontal",
  equilibrio: "estable",
  distanciaActual: "media",
  distanciaProyectada: "media",
  direccionReferencia: "frente",
  ladoIzquierdoDisponible: true,
  ladoDerechoDisponible: true,
  ladoLibre: "derecha",
  ladoExpuesto: "izquierda",
  movilidadNivel: "alta",
  restriccionesEspaciales: [],
  faseActual: longitudSecuencia <= 1 ? "accion_principal" : "respuesta_inicial",
  opcionesDeSalida: "media",
  objetivoTecnico: "continuidad",
  modoLateral: "automatico",
  patronLateralManual: undefined,
  accionPreviaId: undefined,
  familiaPrevia: undefined,
  lateralidadPrevia: undefined,
  stepIndex: 0,
  historialAcciones: [],
  historialFamilias: [],
  conteoRepeticiones: {},
  conteoRepeticionesFamilia: {},
});


