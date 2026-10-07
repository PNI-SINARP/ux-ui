import { AccesoInteroperabilidadDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-interoperabilidad-detail-view";

const ACCESO_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return ACCESO_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalleSolicitudAccesoPage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoInteroperabilidadDetailView id={id} />;
}
