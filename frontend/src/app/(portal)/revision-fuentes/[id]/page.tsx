import { RevisionFuenteDetailView } from "@/modules/revision-fuentes/views/revision-fuente-detail-view";

export const dynamicParams = true;

const REVISION_FUENTES_IDS = [
  "FUE-RC-001",
  "FUE-ANT-002",
  "FUE-SRI-003",
  "FUE-MED-004",
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
