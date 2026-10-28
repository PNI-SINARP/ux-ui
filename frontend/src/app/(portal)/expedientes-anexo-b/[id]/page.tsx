import { use } from "react";
import { SolicitudDetalleView } from "@/modules/gestion-solicitudes/views/solicitud-detalle-view";
import { STATIC_SOLICITUDES_IDS } from "@/modules/gestion-solicitudes/data/static-solicitudes-ids";

export const dynamicParams = false;

export function generateStaticParams() {
  return STATIC_SOLICITUDES_IDS.map((id) => ({ id }));
}

export default function ExpedienteAnexoBDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <SolicitudDetalleView
      id={id}
      basePath="/expedientes-anexo-b"
      sectionTitle="Anexo B — Seguimiento de coordinadores"
      showEnr03={false}
      activeMenu="expedientes-anexo-b"
    />
  );
}
