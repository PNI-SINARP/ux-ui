import { Metadata } from "next";
import { HomologacionDetailView } from "@/modules/homologacion-fuentes/views/homologacion-detail-view";
import { CASOS_HOMOLOGACION_INICIALES } from "@/modules/fuentes/data/fuentes-data";

export function generateStaticParams() {
  return CASOS_HOMOLOGACION_INICIALES.map((caso) => ({
    id: caso.id_caso,
  }));
}

export const metadata: Metadata = {
  title: "Homologación de origen | Portal PNI-SINARP",
  description:
    "Evaluación y dictamen técnico de homologación de motor no soportado.",
};

export default function DetalleHomologacionTecnologiaPage() {
  return <HomologacionDetailView />;
}
