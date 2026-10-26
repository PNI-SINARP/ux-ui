import { Metadata } from "next";
import { NuevaFuenteWizardView } from "@/modules/fuentes/views/nueva-fuente-wizard-view";

export const metadata: Metadata = {
  title: "Nueva fuente | Portal PNI-SINARP",
  description:
    "Incorporar y configurar nueva fuente de información institucional para su interoperabilidad.",
};

export default function NuevaFuenteProveedorPage() {
  return <NuevaFuenteWizardView />;
}
