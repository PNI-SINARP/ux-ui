import { SolicitudPendienteDetailView } from "@/modules/gestion-solicitudes/views/solicitud-pendiente-detail-view";
import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RevisionAnexoBDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SolicitudPendienteDetailView
      id={id}
      basePath="/revision-anexo-b"
      sectionTitle="Anexo B — Registro de coordinadores"
      activeMenu="revision-anexo-b"
    />
  );
}
