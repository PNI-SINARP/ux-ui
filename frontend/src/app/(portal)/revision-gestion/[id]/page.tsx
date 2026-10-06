import { RevisionGestionDetailView } from "@/modules/acceso-interoperabilidad/views/revision-gestion-detail-view";

interface RevisionGestionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RevisionGestionDetailPage({ params }: RevisionGestionDetailPageProps) {
  const { id } = await params;
  return <RevisionGestionDetailView id={id} />;
}
