import { RevisionGestionDetailView } from "@/modules/acceso-interoperabilidad/views/revision-gestion-detail-view";

export const dynamicParams = false;

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

interface RevisionGestionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RevisionGestionDetailPage({ params }: RevisionGestionDetailPageProps) {
  const { id } = await params;
  return <RevisionGestionDetailView id={id} />;
}
