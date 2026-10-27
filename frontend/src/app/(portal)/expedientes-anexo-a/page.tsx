import { ExpedientesAnexoPortalView } from "@/modules/gestion-solicitudes/views/expedientes-anexo-portal-view";

export default function ExpedientesAnexoAPage() {
  return (
    <ExpedientesAnexoPortalView
      mode="MIS_EXPEDIENTES_A"
      basePath="/expedientes-anexo-a"
      activeMenu="expedientes-anexo-a"
    />
  );
}
