import { NuevaFuenteWizardView } from "@/modules/fuentes/views/nueva-fuente-wizard-view";

export const metadata = {
  title: "Nueva Fuente de Información | Portal PNI-SINARP",
  description: "Flujo de configuración e incorporación técnica de fuentes para proveedores del SINARP.",
};

export default function NuevaFuentePage() {
  return <NuevaFuenteWizardView />;
}
