import { use } from "react";
import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";

export default function ExpedienteAnexoADetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/expedientes-anexo-a"
      sectionTitle="Anexo A — Mis expedientes y seguimiento"
      showEnr03={false}
      activeMenu="expedientes-anexo-a"
    />
  );
}
