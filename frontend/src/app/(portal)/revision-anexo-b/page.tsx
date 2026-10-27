import { SolicitudesPendientesView } from "@/modules/gestion-solicitudes/views/solicitudes-pendientes-view";

export default function RevisionAnexoBPage() {
  return (
    <SolicitudesPendientesView
      procesoFixed="PROCESO_B_ENROLAMIENTO_COORDINADOR"
      basePath="/revision-anexo-b"
      activeMenu="revision-anexo-b"
    />
  );
}
