import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";

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
  "SOL-NORM-201",
  "SOL-NORM-202",
  "SOL-NORM-203",
  "SOL-NORM-204",
  "SOL-NORM-205",
];

export function generateStaticParams() {
  return SOLICITUDES_INGRESOS_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/revision-normativa"
      showEnr03={false}
    />
  );
}
