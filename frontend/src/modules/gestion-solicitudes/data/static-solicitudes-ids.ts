/**
 * IDs generados estáticamente para Next.js static export (GitHub Pages).
 * Cubre todos los trámites de ingreso (Anexo A, B, C), trámites de director (SOL-ING-DIR-*),
 * cambio de coordinador (CAM-*) y normativa (SOL-NORM-*).
 */
export const STATIC_SOLICITUDES_IDS: string[] = Array.from(
  new Set([
    // Trámites generales SOL-ING-001 a SOL-ING-200
    ...Array.from({ length: 200 }, (_, i) => `SOL-ING-${String(i + 1).padStart(3, "0")}`),
    // Casos especiales y Director SOL-ING-DIR-001 a SOL-ING-DIR-050
    ...Array.from({ length: 50 }, (_, i) => `SOL-ING-DIR-${String(i + 1).padStart(3, "0")}`),
    // Casos de enrolamiento coordinador Anexo B
    ...Array.from({ length: 30 }, (_, i) => `SOL-ING-${String(i + 1).padStart(3, "0")}-B`),
    // Trámites de Cambio de Coordinador Anexo C (CAM-*)
    "CAM-00023",
    ...Array.from({ length: 50 }, (_, i) => `CAM-${String(i + 1).padStart(5, "0")}`),
    // Trámites de Normativa SOL-NORM-201 a SOL-NORM-250
    ...Array.from({ length: 50 }, (_, i) => `SOL-NORM-${String(i + 201).padStart(3, "0")}`),
  ])
);
