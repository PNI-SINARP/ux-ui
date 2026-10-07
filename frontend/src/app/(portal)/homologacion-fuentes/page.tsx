import { Metadata } from "next";
import { HomologacionesInboxView } from "@/modules/homologacion-fuentes/views/homologaciones-inbox-view";

export const metadata: Metadata = {
  title: "Homologación Técnica de Fuentes | DINARP",
  description: "Bandeja del Equipo de TI para homologación de orígenes de datos no soportados (FUE-12)",
};

export default function HomologacionFuentesPage() {
  return <HomologacionesInboxView />;
}
