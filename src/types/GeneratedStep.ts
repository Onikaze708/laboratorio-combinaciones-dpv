import type { TacticalState } from "./TacticalState";

export interface GeneratedStep {
  numero: number;
  tecnicaId: string;
  nombreTecnica: string;
  nombreTradicionalTecnica?: string;
  nombreEspanolTecnica?: string;
  familiaId?: string;
  familiaNombreTradicional?: string;
  familiaNombreEspanol?: string;
  familiaColor?: string;
  ladoEjecutado: "derecha" | "izquierda";
  fase: TacticalState["faseActual"];
  descripcionCorta: string;
  razonDeSeleccion: string;
  estadoAntes: TacticalState;
  estadoDespues: TacticalState;
}


