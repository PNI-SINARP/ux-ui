import { CoordinadorDetailView } from "@/modules/coordinadores/views/coordinador-detail-view";

export function generateStaticParams() {
  return [
    { id: "COORD-001" },
    { id: "COORD-002" },
    { id: "COORD-003" },
    { id: "COORD-004" },
    { id: "COORD-005" },
    { id: "COORD-006" },
    { id: "COORD-007" },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinadorDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CoordinadorDetailView id={id} />;
}
