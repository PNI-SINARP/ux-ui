import { AsignacionSolicitudesView } from "@/modules/gestion-solicitudes/views/asignacion-solicitudes-view";

export default function AsignacionSolicitudesPage() {
  return (
    <AsignacionSolicitudesView
      procesoFixed="PROCESO_A_REGISTRO_INSTITUCION"
      basePath="/asignacion-solicitudes"
      activeMenu="asignacion-solicitudes"
    />
  );
}
