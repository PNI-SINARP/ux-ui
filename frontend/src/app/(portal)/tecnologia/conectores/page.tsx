import { Metadata } from "next";
import { ConectoresInboxView } from "@/modules/conectores/views/conectores-inbox-view";

export const metadata: Metadata = {
  title: "Gestión de conectores | Portal PNI-SINARP",
  description:
    "Registra, configura, prueba y habilita los tipos de conectores necesarios para integrar las fuentes de datos institucionales.",
};

export default function TecnologiaConectoresPage() {
  return <ConectoresInboxView />;
}
