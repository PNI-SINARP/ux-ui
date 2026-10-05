import { FuentesInboxView } from "@/modules/fuentes/views/fuentes-inbox-view";

export const metadata = {
  title: "Fuentes de Información | Portal PNI-SINARP",
  description: "Bandeja y gestión de fuentes de información institucionales para proveedores del SINARP.",
};

export default function FuentesPage() {
  return <FuentesInboxView />;
}
