import { RevisionGestionDetailView } from "@/modules/acceso-interoperabilidad/views/revision-gestion-detail-view";

export const dynamicParams = false;

const ACCESO_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

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
