import { AccesoSolicitudFacturacionView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-facturacion-view";

const FACTURACION_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  return FACTURACION_IDS.map((id) => ({ id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FacturacionPage({ params }: PageProps) {
  const { id } = await params;
  return <AccesoSolicitudFacturacionView id={id} />;
}
