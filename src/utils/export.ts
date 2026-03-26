import type { GeneratedCombination, ModoExportacion } from "../types";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const cardStyle = (color?: string): string => {
  if (!color) return "border: 1px solid #dbe2ea;";
  return `border: 1px solid ${color}; box-shadow: inset 0 0 0 999px ${color}10;`;
};

const formatEditorialCard = (step: GeneratedCombination["pasos"][number]): string => `
  <article class="paso paso-editorial" style="${cardStyle(step.familiaColor)}">
    <div class="paso-top">Paso ${step.numero}</div>
    <div class="paso-titulo">${escapeHtml(step.nombreTradicionalTecnica ?? step.nombreTecnica)}</div>
    <div class="paso-subtitulo">${escapeHtml(step.nombreEspanolTecnica ?? step.nombreTecnica)}</div>
    <div class="paso-meta">${escapeHtml(step.familiaNombreTradicional ?? step.familiaId ?? "")} · ${escapeHtml(step.ladoEjecutado)}</div>
    <div class="paso-razon">${escapeHtml(step.razonDeSeleccion)}</div>
  </article>
`;

const formatStandardCard = (step: GeneratedCombination["pasos"][number]): string => `
  <article class="paso paso-estandar" style="${cardStyle(step.familiaColor)}">
    <div class="paso-top">Paso ${step.numero}</div>
    <div class="paso-titulo">${escapeHtml(step.nombreTradicionalTecnica ?? step.nombreTecnica)}</div>
    <div class="paso-subtitulo">${escapeHtml(step.nombreEspanolTecnica ?? step.nombreTecnica)}</div>
    <div class="paso-meta">${escapeHtml(step.familiaNombreTradicional ?? step.familiaId ?? "")} · ${escapeHtml(step.ladoEjecutado)} · ${escapeHtml(step.fase.replaceAll("_", " "))}</div>
    <div class="paso-razon">${escapeHtml(step.razonDeSeleccion)}</div>
  </article>
`;

const formatCombination = (combination: GeneratedCombination, index: number, modoExportacion: ModoExportacion): string => {
  const renderCard = modoExportacion === "editorial" ? formatEditorialCard : formatStandardCard;
  const pasos = combination.pasos.map(renderCard).join("");

  return `
    <section class="combinacion">
      <div class="combinacion-header">Combinacion ${index + 1}</div>
      <div class="pasos ${modoExportacion === "editorial" ? "pasos-editorial" : "pasos-estandar"}">${pasos}</div>
      <div class="explicacion"><strong>Idea general:</strong> ${escapeHtml(combination.explicacionGeneral)}</div>
    </section>
  `;
};

const buildStyles = (modoExportacion: ModoExportacion): string => `
  @page { margin: 12mm; }
  body { font-family: Georgia, serif; margin: 0; color: #111827; background: #ffffff; }
  h1, h2, h3, p, div { margin: 0; }
  .documento { padding: 10mm; }
  .titulo { font-size: 20pt; font-weight: 700; letter-spacing: 0.01em; margin-bottom: 4mm; }
  .subtitulo { font-size: 9pt; color: #475569; margin-bottom: 5mm; }
  .combinacion { margin-bottom: 5mm; page-break-inside: avoid; }
  .combinacion-header { font-size: 10pt; font-weight: 700; margin-bottom: 2.5mm; text-transform: uppercase; letter-spacing: 0.08em; }
  .pasos { display: grid; gap: 2.5mm; }
  .pasos-editorial { grid-template-columns: repeat(auto-fit, minmax(44mm, 1fr)); }
  .pasos-estandar { grid-template-columns: repeat(auto-fit, minmax(52mm, 1fr)); }
  .paso { border-radius: 3mm; padding: ${modoExportacion === "editorial" ? "2.5mm" : "3.5mm"}; page-break-inside: avoid; }
  .paso-top { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin-bottom: 1mm; }
  .paso-titulo { font-size: ${modoExportacion === "editorial" ? "9.2pt" : "10pt"}; font-weight: 700; line-height: 1.15; }
  .paso-subtitulo { font-size: ${modoExportacion === "editorial" ? "8.4pt" : "9pt"}; line-height: 1.15; margin-top: 0.6mm; }
  .paso-meta { font-size: 7.6pt; color: #475569; margin-top: 1mm; }
  .paso-razon { font-size: ${modoExportacion === "editorial" ? "7.8pt" : "8.3pt"}; line-height: 1.2; margin-top: 1.1mm; }
  .explicacion { font-size: 8.4pt; line-height: 1.3; margin-top: 2.5mm; color: #334155; }
  @media print {
    .documento { padding: 0; }
  }
`;

const openPrintableWindow = (
  combinaciones: GeneratedCombination[],
  modoExportacion: ModoExportacion
): Window | null => {
  const popup = window.open("", "_blank", "width=1200,height=860");
  if (!popup) return null;

  popup.document.write(`
    <html>
      <head>
        <title>Laboratorio de Combinaciones - Defensa Personal Viva</title>
        <style>${buildStyles(modoExportacion)}</style>
      </head>
      <body>
        <main class="documento">
          <h1 class="titulo">Laboratorio de Combinaciones - Defensa Personal Viva</h1>
          <p class="subtitulo">Laboratorio tecnico de secuencias y combinaciones.</p>
          ${combinaciones.map((item, index) => formatCombination(item, index, modoExportacion)).join("")}
        </main>
      </body>
    </html>
  `);

  popup.document.close();
  return popup;
};

export const imprimirCombinaciones = (
  combinaciones: GeneratedCombination[],
  modoExportacion: ModoExportacion = "editorial"
): void => {
  const popup = openPrintableWindow(combinaciones, modoExportacion);
  popup?.print();
};

export const exportarCombinacionesPDF = (
  combinaciones: GeneratedCombination[],
  modoExportacion: ModoExportacion = "editorial"
): void => {
  const popup = openPrintableWindow(combinaciones, modoExportacion);
  popup?.print();
};
