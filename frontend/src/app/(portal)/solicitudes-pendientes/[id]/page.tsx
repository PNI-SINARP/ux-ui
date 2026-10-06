import { SolicitudPendienteDetailView } from "@/modules/gestion-solicitudes/views/solicitud-pendiente-detail-view";

export const dynamicParams = true;

const STATIC_SOLICITUDES_IDS = [
  ...Array.from({ length: 150 }, (_, i) => `SOL-ING-${String(i + 1).padStart(3, "0")}`),
  "SOL-ING-008-B",
  "SOL-ING-009-B",
  "SOL-ING-010-B",
  "CAM-00023",
  ...Array.from({ length: 25 }, (_, i) => `SOL-NORM-${String(i + 201).padStart(3, "0")}`),
];

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <SolicitudPendienteDetailView id={id} />;
}
