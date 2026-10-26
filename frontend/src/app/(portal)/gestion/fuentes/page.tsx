import { Metadata } from "next";
import { RevisionFuentesInboxView } from "@/modules/revision-fuentes/views/revision-fuentes-inbox-view";

export const metadata: Metadata = {
  title: "Revisión y aprobación de fuentes | Portal PNI-SINARP",
  description:
    "Revisa las fuentes registradas por las instituciones proveedoras, clasifica sus campos y gestiona las decisiones de aprobación o devolución.",
};

export default function RevisionAprobacionFuentesPage() {
  return <RevisionFuentesInboxView />;
}
