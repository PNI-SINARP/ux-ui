import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";
import { RevisionNormativaFuenteDetailView } from "@/modules/acceso-interoperabilidad/views/revision-normativa-fuente-detail-view";
import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export const dynamicParams = false;

const ACCESO_IDS = Array.from(
  { length: 50 },
  (_, i) => `SOL-2026-${String(i + 1).padStart(3, "0")}`
);

export function generateStaticParams() {
  const anexoAIds = STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
  const accesoIds = ACCESO_IDS.map((id) => ({ id }));
  return [...anexoAIds, ...accesoIds];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (id.startsWith("SOL-2026-")) {
    return <RevisionNormativaFuenteDetailView id={id} />;
  }

  return (
    <SolicitudDetalleView
      id={id}
      basePath="/revision-normativa"
      sectionTitle="Anexo A — Incorporación institucional"
      activeMenu="revision-normativa"
      showEnr03={false}
    />
  );
}
