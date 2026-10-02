import { AccesoSolicitudFacturacionView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-facturacion-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FacturacionPage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoSolicitudFacturacionView id={id} />;
}
