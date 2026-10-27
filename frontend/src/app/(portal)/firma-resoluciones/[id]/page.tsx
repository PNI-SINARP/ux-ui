import { use } from "react";
import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";

export default function FirmaResolucionDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/firma-resoluciones"
      sectionTitle="Anexo A — Firma de resoluciones"
      showEnr03={false}
      activeMenu="firma-resoluciones"
    />
  );
}
