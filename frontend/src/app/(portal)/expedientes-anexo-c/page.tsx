import { ExpedientesAnexoPortalView } from "@/modules/gestion-solicitudes/views/expedientes-anexo-portal-view";

export default function ExpedientesAnexoCPage() {
  return (
    <ExpedientesAnexoPortalView
      mode="MIS_EXPEDIENTES_C"
      basePath="/expedientes-anexo-c"
      activeMenu="expedientes-anexo-c"
    />
  );
}
