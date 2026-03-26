import type { ModoExplicacion } from "../types";

export const opcionesGeneracion = [1, 3, 5, 10] as const;

export const opcionesExplicacion: Array<{ value: ModoExplicacion; label: string }> = [
  { value: "corto", label: "Modo corto" },
  { value: "detallado", label: "Modo detallado" },
];
