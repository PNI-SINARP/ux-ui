import { AccesoSolicitudDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string; step?: string }>;
}

export default function SolicitudDetailPage(props: PageProps) {
  return <AccesoSolicitudDetailView {...props} />;
}
