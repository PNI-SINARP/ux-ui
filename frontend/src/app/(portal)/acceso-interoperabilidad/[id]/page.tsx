import { AccesoInteroperabilidadDetailView } from "@/modules/acceso-interoperabilidad/views/acceso-interoperabilidad-detail-view";

const ACCESO_IDS = [
  "SOL-2026-001",
  "SOL-2026-002",
  "SOL-2026-004",
  "SOL-2026-005",
  "SOL-2026-006",
  "SOL-2026-007",
  "SOL-2026-008",
  "SOL-2026-009",
  "SOL-2026-010",
];

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
