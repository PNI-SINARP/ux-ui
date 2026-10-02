"use client";

import React from "react";
import { cn, getAssetPath } from "@/lib/utils";

interface WireframeAuthLayoutProps {
  children: React.ReactNode;
  imageSrc?: string;
}

export function WireframeAuthLayout({
  children,
  imageSrc = getAssetPath("/fondo.png"),
  imageFit = "contain",
}: WireframeAuthLayoutProps & { imageFit?: "contain" | "cover" }) {
  return (
    <div className="h-screen w-full max-h-screen overflow-hidden bg-background text-foreground flex items-center justify-center p-2 sm:p-3 lg:p-4 2xl:p-5">
      {/* Contenedor principal 2 columnas (imagen con encuadre ajustado a la derecha / login amplio para cards) */}
      <div className="w-full max-w-[1600px] xl:max-w-[1760px] 2xl:max-w-[1920px] bg-surface border border-border/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch h-full max-h-[94vh] lg:max-h-[96vh]">
        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COLUMNA IZQUIERDA: Poster Institucional (Encuadre a la izquierda para mostrar info de servicios)
           â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-6 2xl:col-span-7 relative items-center justify-center bg-muted/10 border-r border-border/60 overflow-hidden p-0 h-full">
          <img
            src={imageSrc}
            alt="Portal de Interoperabilidad DINARP"
            className="w-full h-full object-cover object-left select-none block"
          />
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            COLUMNA DERECHA: Card dinámico (Slot Login amplio)
           â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-6 2xl:col-span-5 w-full h-full flex items-center justify-center bg-surface p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto lg:overflow-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-full max-w-xl xl:max-w-2xl flex flex-col my-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
