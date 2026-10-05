import { ProyectoDetailView } from "@/modules/proyectos/views/proyecto-detail-view";

const PROYECTOS_PREGENERADOS = [
  "PRJ-2026-001",
  "PRJ-2026-002",
  "PRJ-2026-003",
  "PRJ-2026-004",
  "PRJ-2026-005",
  "PRJ-2026-006",
  "PRJ-2026-007",
  "PRJ-2026-008",
];

export function generateStaticParams() {
  return PROYECTOS_PREGENERADOS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Detalle de Proyecto Institucional | Portal PNI-SINARP",
  description: "Consulta y edición restringida de proyectos institucionales de interoperabilidad.",
};

export default function ProyectoDetailPage({ params }: PageProps) {
  return <ProyectoDetailView params={params} />;
}
