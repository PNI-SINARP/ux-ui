import { RevisionFuenteDetailView } from "@/modules/revision-fuentes/views/revision-fuente-detail-view";

const REVISION_FUENTES_IDS = [
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
  return REVISION_FUENTES_IDS.map((id) => ({ id }));
}

export const metadata = {
  title: "Revisión y Clasificación de Fuente | Portal PNI-SINARP",
  description: "Clasificación de campos y dictamen de aprobación de fuentes del SINARP.",
};

export default function RevisionFuenteDetailPage() {
  return <RevisionFuenteDetailView />;
}
