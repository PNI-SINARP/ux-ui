import { Metadata } from "next";
import { GestionSuplenciasView } from "@/modules/suplencias/views/gestion-suplencias-view";

export const metadata: Metadata = {
  title: "Gestión de Suplencias | Administración | DINARP",
  description: "Bandeja administrativa para la supervisión y activación de suplencias temporales.",
};

export default function GestionSuplenciasPage() {
  return <GestionSuplenciasView />;
}
