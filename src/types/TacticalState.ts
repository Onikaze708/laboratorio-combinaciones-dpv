import type {
  DireccionTecnica,
  DistanciaTecnica,
  Lado,
  RestriccionTecnica,
  ModoLateral,
  ObjetivoTecnico,
  PosicionTecnica,
} from "./Technique";

export type TacticalPhase =
  | "respuesta_inicial"
  | "ajuste_reorientacion"
  | "accion_principal"
  | "salida_control_separacion";

export interface TacticalState {
  postura: PosicionTecnica;
  subPostura: string;
  orientacion: "frontal" | "perfil_derecha" | "perfil_izquierda" | "desfasada";
  equilibrio: "estable" | "inestable";
  distanciaActual: DistanciaTecnica;
  distanciaProyectada: DistanciaTecnica;
  direccionReferencia: DireccionTecnica;
  ladoIzquierdoDisponible: boolean;
  ladoDerechoDisponible: boolean;
  ladoLibre: Lado;
  ladoExpuesto: Lado;
  movilidadNivel: "alta" | "media" | "baja";
  restriccionesEspaciales: RestriccionTecnica[];
  faseActual: TacticalPhase;
  opcionesDeSalida: "alta" | "media" | "baja";
  objetivoTecnico: ObjetivoTecnico;
  modoLateral: ModoLateral;
  patronLateralManual?: Lado[];
  accionPreviaId?: string;
  familiaPrevia?: string;
  lateralidadPrevia?: Lado;
  stepIndex: number;
  historialAcciones: string[];
  historialFamilias: string[];
  conteoRepeticiones: Record<string, number>;
  conteoRepeticionesFamilia: Record<string, number>;
}
