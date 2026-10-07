import { Metadata } from "next";
import { HomologacionDetailView } from "@/modules/homologacion-fuentes/views/homologacion-detail-view";

export const metadata: Metadata = {
  title: "Detalle de Homologación Técnica | DINARP",
  description: "Revisión técnica y certificación de origen no soportado (FUE-12 / CNX-01)",
};

export default function HomologacionDetailPage() {
  return <HomologacionDetailView />;
}
