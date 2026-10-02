import { AccesoInteroperabilidadDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-interoperabilidad-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleSolicitudAccesoPage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoInteroperabilidadDetailView id={id} />;
}
