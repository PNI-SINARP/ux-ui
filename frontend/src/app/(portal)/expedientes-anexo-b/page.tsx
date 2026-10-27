import { ExpedientesAnexoPortalView } from "@/modules/gestion-solicitudes/views/expedientes-anexo-portal-view";

export default function ExpedientesAnexoBPage() {
  return (
    <ExpedientesAnexoPortalView
      mode="MIS_EXPEDIENTES_B"
      basePath="/expedientes-anexo-b"
      activeMenu="expedientes-anexo-b"
    />
  );
}
