import { SolicitudPendienteDetailView } from "@/modules/gestion-solicitudes/views/solicitud-pendiente-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SolicitudPendienteDetailView id={id} />;
}
