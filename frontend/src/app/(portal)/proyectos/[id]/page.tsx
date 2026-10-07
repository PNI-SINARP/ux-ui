import { ProyectoDetailView } from "@/modules/proyectos/views/proyecto-detail-view";

const PROYECTOS_PREGENERADOS = Array.from(
  { length: 50 },
  (_, i) => `PRJ-2026-${String(i + 1).padStart(3, "0")}`
);

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
