import { AsignacionSolicitudesView } from "@/modules/gestion-solicitudes/views/asignacion-solicitudes-view";

export default function AsignacionAnexoBPage() {
  return (
    <AsignacionSolicitudesView
      procesoFixed="PROCESO_B_ENROLAMIENTO_COORDINADOR"
      basePath="/asignacion-anexo-b"
      activeMenu="asignacion-anexo-b"
    />
  );
}
