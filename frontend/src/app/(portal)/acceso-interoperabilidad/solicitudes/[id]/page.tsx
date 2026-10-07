import { AccesoSolicitudDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-detail-view";

const SOLICITUDES_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SolicitudDetailPage({ params }: PageProps) {
  return <AccesoSolicitudDetailView params={params} />;
}
