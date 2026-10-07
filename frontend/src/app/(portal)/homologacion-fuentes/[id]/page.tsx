import { Metadata } from "next";
import { HomologacionDetailView } from "@/modules/homologacion-fuentes/views/homologacion-detail-view";
import { CASOS_HOMOLOGACION_INICIALES } from "@/modules/fuentes/data/fuentes-data";


export function generateStaticParams() {
  return CASOS_HOMOLOGACION_INICIALES.map((caso) => ({
    id: caso.id_caso,
  }));
}

export const metadata: Metadata = {
  title: "Detalle de Homologación Técnica | DINARP",
  description: "Revisión técnica y certificación de origen no soportado (FUE-12 / CNX-01)",
};

export default function HomologacionDetailPage() {
  return <HomologacionDetailView />;
}
