import { Metadata } from "next";
import { RevisionFuenteDetailView } from "@/modules/revision-fuentes/views/revision-fuente-detail-view";

const FUENTES_REVISION_IDS = [
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
  return FUENTES_REVISION_IDS.map((id) => ({ id }));
}

export const metadata: Metadata = {
  title: "Expediente de revisión de fuente | Portal PNI-SINARP",
  description:
    "Revisión, clasificación de campos LOPDP y resolución de aprobación o devolución.",
};

export default function DetalleRevisionFuentePage() {
  return <RevisionFuenteDetailView />;
}
