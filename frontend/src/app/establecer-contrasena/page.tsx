import type { Metadata } from "next";
import { EstablecerContrasenaView } from "@/modules/auth/views/establecer-contrasena-view";
import { Wireframes2ThemeReset } from "@/components/layout/wireframes/wireframes2-theme-reset";

export const metadata: Metadata = {
  title: "Establecer Contraseña Inicial | DINARP",
  description:
    "Establecimiento de contraseña inicial para activación de cuentas institucionales DINARP.",
};

export default function EstablecerContrasenaPage() {
  return (
    <Wireframes2ThemeReset>
      <EstablecerContrasenaView />
    </Wireframes2ThemeReset>
  );
}
