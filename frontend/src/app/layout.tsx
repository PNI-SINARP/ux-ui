import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/es.json";

/*
  TIPOGRAFÍAS
  ------------------------------------------------------------

  Montserrat:
  Se utiliza como tipografía principal para textos, formularios,
  tablas, botones, menús y navegación.

  Metropolis:
  Se utiliza para títulos, subtítulos y encabezados institucionales.

  Las variables creadas aquí se conectan con las variables
  configuradas en globals.css:

  --font-heading: var(--font-metropolis);
  --font-sans: var(--font-montserrat);
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
        <link href="https://fonts.cdnfonts.com/css/metropolis-2" rel="stylesheet" />
      </head>

      <body>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem("glocation-theme");
                  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  const theme = storedTheme || systemTheme;
                  document.documentElement.setAttribute("data-theme", theme);
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                    document.documentElement.classList.remove("light");
                  } else {
                    document.documentElement.classList.add("light");
                    document.documentElement.classList.remove("dark");
                  }
                  if (!document.cookie.includes("glocation-theme=")) {
                    document.cookie = "glocation-theme=" + theme + "; path=/; max-age=31536000; SameSite=Lax";
                  }
                } catch (error) {}
              })();
            `,
          }}
        />
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
