"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Phone, Globe, Compass, ExternalLink } from "lucide-react";
import { cn, getAssetPath } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const defaultFooterConfig = {
  socials: {
    facebook: { url: "https://www.facebook.com/MinisterioEducacionEcuador", username: "@MinisterioEducacionEcuador", enabled: true },
    instagram: { url: "https://www.instagram.com/ministerioeducacionecuador/", username: "@MinisterioEducacionEcuador", enabled: true },
    x: { url: "https://x.com/Educacion_Ec", username: "@Educacion_Ec", enabled: true },
    tiktok: { url: "https://www.tiktok.com/@educacion_ec", username: "@Educacion_Ec", enabled: true },
    youtube: { url: "https://www.youtube.com/user/MinEducacionEcuador", username: "@MinEducacionEcuador", enabled: true },
    flickr: { url: "https://www.flickr.com/photos/educacionecuador/albums", username: "@educacionecuador", enabled: true },
  },
  contact: {
    address1: "Av. Amazonas N34-451 y Av. Atahualpa",
    address2: "Quito - Ecuador",
    phone: "1800-EDUCACION"
  },
  website: {
    url: "https://www.educacion.gob.ec",
    label: "www.educacion.gob.ec"
  },
  copyright: "© 2026 MINISTERIO DE EDUCACIÓN DEL ECUADOR. TODOS LOS DERECHOS RESERVADOS."
};

export function Footer() {
  const [config, setConfig] = useState(defaultFooterConfig);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_FOOTER' && e.data.payload) {
        setConfig(e.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <footer className="relative w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-7xl mx-auto bg-surface border border-border mt-8 sm:mt-12 mb-6 md:mb-8 rounded-[24px] sm:rounded-[32px] shadow-sm text-foreground overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 pt-10 sm:pt-14 md:pt-16 pb-8 md:pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">

          {/* Column 1: Logo & Info */}
          <div className="flex flex-col items-start text-left lg:pr-8">
            <Link href="/" className="mb-4 sm:mb-6 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              <>
<img
                src={getAssetPath("/logo-horizontal.svg")}
                alt="DINARP Logo"
                className="dark:hidden h-9 sm:h-12 w-auto object-contain"
              />
<img
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="DINARP Logo"
                className="hidden dark:block h-9 sm:h-12 w-auto object-contain"
              />
</>
            </Link>
            <p className="text-body-sm text-muted-foreground/80 leading-relaxed mb-4 sm:mb-6">
              Plataforma integral para centralizar, monitorear y gestionar riesgos, incidentes y emergencias, facilitando la coordinación, trazabilidad y toma de decisiones.
            </p>
          </div>


          {/* Column 2: Plataforma */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-heading mb-4 sm:mb-6 flex items-center gap-2">
              Plataforma
            </h3>
            <ul className="flex flex-col items-start font-sans text-body-sm text-muted-foreground gap-3 sm:gap-3.5">
              <li><Link href="/" className="hover:text-primary transition-colors duration-200">Inicio</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Interoperabilidad</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Solicitudes</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Centro de ayuda</Link></li>
            </ul>
          </div>

          {/* Column 3: Información */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-heading mb-4 sm:mb-6 flex items-center gap-2">
              Información
            </h3>
            <ul className="flex flex-col items-start font-sans text-body-sm text-muted-foreground gap-3 sm:gap-3.5">
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Acerca de DINARP</Link></li>
              <li><Link href="/uikit" className="hover:text-primary transition-colors duration-200">Documentación</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Contacto</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col items-start text-left">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest font-heading mb-4 sm:mb-6 flex items-center gap-2">
              Legal
            </h3>
            <ul className="flex flex-col items-start font-sans text-body-sm text-muted-foreground gap-3 sm:gap-3.5">
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Política de privacidad</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Términos y condiciones</Link></li>
              <li><Link href="/construccion" className="hover:text-primary transition-colors duration-200">Tratamiento de datos</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Copyright & Socials */}
      <div className="w-full border-t border-border/60 bg-surface">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 py-5 sm:py-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans text-center sm:text-left">
            © 2026 DINARP. Todos los derechos reservados.
          </div>

          <TooltipProvider delayDuration={200}>
            <div className="flex items-center gap-2.5">
              {config.socials.facebook.enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" onClick={(e) => e.preventDefault()} className="size-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted-foreground">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" variant="primary">Facebook</TooltipContent>
                </Tooltip>
              )}
              {config.socials.instagram.enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" onClick={(e) => e.preventDefault()} className="size-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted-foreground">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" variant="primary">Instagram</TooltipContent>
                </Tooltip>
              )}
              {config.socials.x.enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" onClick={(e) => e.preventDefault()} className="size-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted-foreground">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M20 4L4 20" /></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" variant="primary">X</TooltipContent>
                </Tooltip>
              )}
              {config.socials.tiktok.enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" onClick={(e) => e.preventDefault()} className="size-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted-foreground">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" variant="primary">TikTok</TooltipContent>
                </Tooltip>
              )}
              {config.socials.youtube.enabled && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href="#" onClick={(e) => e.preventDefault()} className="size-8 rounded-full bg-surface-subtle border border-border flex items-center justify-center transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 text-muted-foreground">
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" /><polygon points="10 15 15 12 10 9" /></svg>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" variant="primary">YouTube</TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
}
