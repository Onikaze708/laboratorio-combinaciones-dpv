import type { GeneratedStep } from "./GeneratedStep";

export interface GeneratedCombination {
  id: string;
  pasos: GeneratedStep[];
  explicacionGeneral: string;
  observaciones: string[];
  fecha: string;
  favorita: boolean;
}

export type ModoExplicacion = "corto" | "detallado";

export type ModoExportacion = "estandar" | "editorial";

export type CategoriaManual = string;

export type ModoPasoManual = "familia" | "tecnica_especifica";

export interface PasoManualConfig {
  modo: ModoPasoManual;
  categoria: CategoriaManual;
  tecnicaId?: string;
}
