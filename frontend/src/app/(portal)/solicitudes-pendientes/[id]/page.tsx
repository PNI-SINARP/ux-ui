import { SolicitudPendienteDetailView } from "@/modules/gestion-solicitudes/views/solicitud-pendiente-detail-view";

export const dynamicParams = false;

import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SolicitudPendienteDetailView id={id} />;
}
