import { Metadata } from "next";
import { AreaDetailView } from "@/modules/areas-dinarp/views/area-detail-view";

export const metadata: Metadata = {
  title: "Detalle de Área DINARP | GRisk GEOportal",
  description: "Ficha técnica, usuarios vinculados, trámites, tareas y trazabilidad del área orgánica.",
};

export function generateStaticParams() {
  return [
    { id: "DINARP_TI" },
    { id: "DGR" },
    { id: "DN" },
    { id: "DTD" },
    { id: "DPI" },
    { id: "DINARP_DIR" },
    { id: "DIR_FIN" },
    { id: "DINARP_HIST_DIS" },
    { id: "PLAN_EXP_01" },
    { id: "AUDIT_INT_02" },
  ];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AreaDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AreaDetailView id={id} />;
}
