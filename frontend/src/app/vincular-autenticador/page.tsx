import type { Metadata } from "next";
import { Wireframes2ThemeReset } from "@/components/layout/wireframes/wireframes2-theme-reset";
import { VincularAutenticadorView } from "@/modules/auth/views/vincular-autenticador-view";

export const metadata: Metadata = {
  title: "Vincular Google Authenticator | SURI DINARP",
  description: "Enrolamiento de segundo factor de autenticación TOTP.",
};

export default function VincularAutenticadorPage() {
  return (
    <Wireframes2ThemeReset>
      <VincularAutenticadorView />
    </Wireframes2ThemeReset>
  );
}
