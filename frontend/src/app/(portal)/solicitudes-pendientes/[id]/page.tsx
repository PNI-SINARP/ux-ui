import { SolicitudPendienteDetailView } from "@/modules/gestion-solicitudes/views/solicitud-pendiente-detail-view";

export const dynamicParams = true;

const SOLICITUDES_INGRESOS_IDS = [
  "SOL-ING-101",
  "SOL-ING-102",
  "SOL-ING-103",
  "SOL-ING-104",
  "SOL-ING-105",
  "SOL-ING-106",
  "SOL-ING-107",
  "SOL-ING-108",
  "SOL-ING-109",
  "SOL-ING-110",
  "SOL-ING-111",
  "SOL-ING-112",
  "SOL-ING-113",
  "SOL-ING-114",
  "SOL-ING-115",
  "SOL-ING-116",
  "SOL-ING-117",
  "SOL-ING-001",
  "SOL-ING-002",
  "SOL-ING-003",
  "SOL-ING-004",
  "SOL-ING-005",
  "SOL-ING-006",
  "SOL-ING-007",
  "SOL-ING-008",
  "SOL-ING-009",
  "SOL-ING-010",
  "SOL-ING-011",
  "SOL-ING-012",
  "SOL-ING-013",
  "SOL-ING-014",
  "SOL-ING-015",
  "SOL-ING-016",
  "SOL-ING-008-B",
  "SOL-ING-009-B",
  "SOL-ING-010-B",
  "CAM-00023",
];

export function generateStaticParams() {
  return SOLICITUDES_INGRESOS_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SolicitudPendienteDetailView id={id} />;
}
