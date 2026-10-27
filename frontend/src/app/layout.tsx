import { Montserrat } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeInitializer } from "@/components/theme-toggle";

import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/es.json";

/*
  TIPOGRAFÍAS
  ------------------------------------------------------------

  Metropolis:
  Se utiliza como tipografía institucional unificada tanto para
  títulos, subtítulos y encabezados (font-heading), como para
  cuerpo de texto, formularios, tablas, botones y navegación (font-sans).
*/

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata = {
  title: "DINARP KIT UX / UI",
  description: "Base frontend y sistema de diseño de DINARP.",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: `${basePath}/favicon-light.svg`,
      href: `${basePath}/favicon-light.svg`,
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: `${basePath}/favicon-dark.svg`,
      href: `${basePath}/favicon-dark.svg`,
    }
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const theme = "light";

  return (
    <html
      lang="es"
      data-theme={theme}
      className={cn(
        montserrat.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
        <link href="https://fonts.cdnfonts.com/css/metropolis-2" rel="stylesheet" />
      </head>

      <body>
        <ThemeInitializer />
        <NextIntlClientProvider
          locale="es"
          messages={messages}
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
