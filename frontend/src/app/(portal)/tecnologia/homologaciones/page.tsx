import { Metadata } from "next";
import { HomologacionesInboxView } from "@/modules/homologacion-fuentes/views/homologaciones-inbox-view";

export const metadata: Metadata = {
  title: "Homologación de orígenes | Portal PNI-SINARP",
  description:
    "Gestiona y verifica los orígenes de datos no soportados y las transformaciones excepcionales antes de habilitar su integración.",
};

export default function TecnologiaHomologacionesPage() {
  return <HomologacionesInboxView />;
}
