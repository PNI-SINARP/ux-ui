import { Metadata } from "next";
import { AreaDetailView } from "@/modules/areas-dinarp/views/area-detail-view";

export const metadata: Metadata = {
  title: "Detalle de Área DINARP | GRisk GEOportal",
  description: "Ficha técnica, usuarios vinculados, trámites, tareas y trazabilidad del área orgánica.",
};

export function generateStaticParams() {
  const codigos = [
    "DINARP_TI",
    "DGR",
    "DN",
    "DTD",
    "DPI",
    "DINARP_DIR",
    "DIR_FIN",
    "DINARP_HIST_DIS",
    "PLAN_EXP_01",
    "AUDIT_INT_02",
  ];
  const areaIds = Array.from({ length: 20 }, (_, i) => `AREA-${String(i + 1).padStart(3, "0")}`);
  return [...codigos, ...areaIds].map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AreaDetailView id={id} />;
}
