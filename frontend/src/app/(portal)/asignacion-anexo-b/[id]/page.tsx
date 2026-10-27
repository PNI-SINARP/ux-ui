import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";
import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AsignacionAnexoBDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/asignacion-anexo-b"
      sectionTitle="Anexo B — Registro de coordinadores"
      activeMenu="asignacion-anexo-b"
      showEnr03={true}
    />
  );
}
