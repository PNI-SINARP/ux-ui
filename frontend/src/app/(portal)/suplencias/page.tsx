import { Metadata } from "next";
import { SuplenciasView } from "@/modules/suplencias/views/suplencias-view";

export const metadata: Metadata = {
  title: "Gestión de Suplencias | DINARP",
  description:
    "Flujo BN-04: Suplencia temporal o activación administrativa del Portal DINARP.",
};

export default function SuplenciasPage() {
  return <SuplenciasView />;
}
