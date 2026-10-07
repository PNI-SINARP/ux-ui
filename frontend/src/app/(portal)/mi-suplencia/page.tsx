import { Metadata } from "next";
import { MiSuplenciaView } from "@/modules/suplencias/views/mi-suplencia-view";

export const metadata: Metadata = {
  title: "Mi Suplencia | Coordinación SINARP | DINARP",
  description: "Consulta el estado de tu coordinación y gestiona la suplencia temporal institucional.",
};

export default function MiSuplenciaPage() {
  return <MiSuplenciaView />;
}
