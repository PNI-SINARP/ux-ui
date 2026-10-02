import { AccesoPaqueteDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-paquete-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetallePaquetePage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoPaqueteDetailView id={id} />;
}
