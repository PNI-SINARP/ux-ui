import { CoordinadorDetailView } from "@/modules/coordinadores/views/coordinador-detail-view";

export function generateStaticParams() {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `COORD-${String(i + 1).padStart(3, "0")}`,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinadorDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CoordinadorDetailView id={id} />;
}
