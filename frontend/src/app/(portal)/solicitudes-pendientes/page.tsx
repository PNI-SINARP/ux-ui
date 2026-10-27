import { SolicitudesPendientesView } from "@/modules/gestion-solicitudes/views/solicitudes-pendientes-view";

export default function SolicitudesPendientesPage() {
  return (
    <SolicitudesPendientesView
      procesoFixed="PROCESO_A_REGISTRO_INSTITUCION"
      basePath="/solicitudes-pendientes"
      activeMenu="solicitudes-pendientes"
    />
  );
}
