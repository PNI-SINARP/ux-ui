import { RevisionFuentesInboxView } from "@/modules/revision-fuentes/views/revision-fuentes-inbox-view";

export const metadata = {
  title: "Revisión de Fuentes | Portal PNI-SINARP",
  description: "Bandeja de revisión técnica y normativa de fuentes del SINARP para el Área de Gestión.",
};

export default function RevisionFuentesPage() {
  return <RevisionFuentesInboxView />;
}
