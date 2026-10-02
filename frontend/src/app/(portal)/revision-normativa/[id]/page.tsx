import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/revision-normativa"
      sectionTitle="Solicitudes generación resolución"
      showEnr03={false}
    />
  );
}
