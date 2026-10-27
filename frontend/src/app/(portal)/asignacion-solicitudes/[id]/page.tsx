import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";
import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/asignacion-solicitudes"
      sectionTitle="Anexo A — Incorporación institucional"
      activeMenu="asignacion-solicitudes"
      showEnr03={true}
    />
  );
}
