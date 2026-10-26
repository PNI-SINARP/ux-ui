import { Metadata } from "next";
import { FuentesInboxView } from "@/modules/fuentes/views/fuentes-inbox-view";

export const metadata: Metadata = {
  title: "Mis fuentes | Portal PNI-SINARP",
  description:
    "Registra, configura y administra las fuentes de datos de tu institución para su revisión y publicación en el catálogo de interoperabilidad.",
};

export default function MisFuentesProveedorPage() {
  return <FuentesInboxView />;
}
