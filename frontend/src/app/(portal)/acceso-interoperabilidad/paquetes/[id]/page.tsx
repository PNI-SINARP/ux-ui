import { AccesoPaqueteDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-paquete-detail-view";

const PAQUETES_IDS = ["PKG-2026-001", "PKG-2026-002", "PKG-2026-003"];

export function generateStaticParams() {
  return PAQUETES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetallePaquetePage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoPaqueteDetailView id={id} />;
}
