import { Metadata } from "next";
import { FuenteDetailView } from "@/modules/fuentes/views/fuente-detail-view";

const FUENTES_IDS = [
  "FUE-RC-001",
  "FUE-ANT-002",
  "FUE-SRI-003",
  "FUE-MED-004",
  "FUE-IESS-005",
  "FUE-MSP-006",
  "FUE-AGRO-007",
  "FUE-JUD-008",
  "FUE-DEF-009",
  "FUE-BCE-007",
  "FUE-CJ-008",
  "FUE-CNT-010",
  "FUE-BCE-012",
];

export function generateStaticParams() {
  return FUENTES_IDS.map((id) => ({ id }));
}

export const metadata: Metadata = {
  title: "Detalle de fuente | Portal PNI-SINARP",
  description:
    "Expediente técnico, trazabilidad y publicación de fuentes de información del SINARP.",
};

export default function DetalleFuenteProveedorPage() {
  return <FuenteDetailView />;
}
