import { Metadata } from "next";
import { AreasView } from "@/modules/areas-dinarp/views/areas-view";

export const metadata: Metadata = {
  title: "Áreas DINARP | GRisk GEOportal",
  description: "Catálogo orgánico institucional, control de versiones y gobernanza de áreas DINARP.",
};

export default function AreasPage() {
  return <AreasView />;
}
