import type { Metadata } from "next";
import { ConfiguracionIdentidadView } from "@/modules/configuracion-identidad/views/configuracion-identidad-view";

export const metadata: Metadata = {
  title: "Configuración de Identidad | DINARP",
  description: "Gestión técnica de Identity Platform, políticas de autenticación y entornos para el Administrador técnico autorizado.",
};

export default function ConfiguracionIdentidadPage() {
  return <ConfiguracionIdentidadView />;
}
