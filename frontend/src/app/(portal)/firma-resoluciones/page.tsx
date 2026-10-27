import { ExpedientesAnexoPortalView } from "@/modules/gestion-solicitudes/views/expedientes-anexo-portal-view";

export default function FirmaResolucionesPage() {
  return (
    <ExpedientesAnexoPortalView
      mode="FIRMA_RESOLUCIONES"
      basePath="/firma-resoluciones"
      activeMenu="firma-resoluciones"
    />
  );
}
