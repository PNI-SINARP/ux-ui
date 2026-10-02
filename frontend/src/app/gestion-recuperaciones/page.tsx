import { Metadata } from "next";
import { Wireframes2ThemeReset } from "@/components/layout/wireframes/wireframes2-theme-reset";
import { GestionRecuperacionesView } from "@/modules/gestion-recuperaciones/views/gestion-recuperaciones-view";

export const metadata: Metadata = {
  title: "Gestión de Recuperaciones | DINARP",
  description:
    "Gestiona los casos de usuarios que perdieron acceso a su correo o segundo factor y requieren validación de identidad para recuperar su cuenta.",
};

export default function GestionRecuperacionesPage() {
  return (
    <Wireframes2ThemeReset>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased flex flex-col">
        <GestionRecuperacionesView />
      </div>
    </Wireframes2ThemeReset>
  );
}
