import { FuenteDetailView } from "@/modules/fuentes/views/fuente-detail-view";

export const dynamicParams = true;

const FUENTES_IDS = [
  "FUE-RC-001",
  "FUE-ANT-002",
  "FUE-SRI-003",
  "FUE-MED-004",
];

export function generateStaticParams() {
  return FUENTES_IDS.map((id) => ({ id }));
}

export const metadata = {
  title: "Detalle de Fuente de Información | Portal PNI-SINARP",
  description: "Detalle, trazabilidad y publicación de fuentes de información del SINARP.",
};

export default function FuenteDetailPage() {
  return <FuenteDetailView />;
}
