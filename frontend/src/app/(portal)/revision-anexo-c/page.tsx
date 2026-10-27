import { SolicitudesPendientesView } from "@/modules/gestion-solicitudes/views/solicitudes-pendientes-view";

export default function RevisionAnexoCPage() {
  return (
    <SolicitudesPendientesView
      procesoFixed="PROCESO_C_CAMBIO_COORDINADOR"
      basePath="/revision-anexo-c"
      activeMenu="revision-anexo-c"
    />
  );
}
