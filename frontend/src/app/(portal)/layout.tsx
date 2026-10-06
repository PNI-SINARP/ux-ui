import type { Metadata } from "next";
import { Wireframes2ThemeReset } from "@/components/layout/wireframes/wireframes2-theme-reset";

export const metadata: Metadata = {
  title: "Portal de Interoperabilidad | DINARP",
  description: "Portal de Interoperabilidad DINARP.",
};

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <Wireframes2ThemeReset>
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </div>
    </Wireframes2ThemeReset>
  );
}
