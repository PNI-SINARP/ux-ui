import { AsignacionSolicitudesView } from "@/modules/gestion-solicitudes/views/asignacion-solicitudes-view";

export default function AsignacionAnexoCPage() {
  return (
    <AsignacionSolicitudesView
      procesoFixed="PROCESO_C_CAMBIO_COORDINADOR"
      basePath="/asignacion-anexo-c"
      activeMenu="asignacion-anexo-c"
    />
  );
}
