"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAssetPath } from "@/lib/utils";

interface WireframeTramitePublicoLayoutProps {
  children: React.ReactNode;
}

/**
 * Marco de los trámites que se inician sin cuenta desde la pantalla de ingreso (INS-00):
 * solo logo y tema, sin menú lateral ni sesión del Portal.
 */
export function WireframeTramitePublicoLayout({ children }: WireframeTramitePublicoLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-x-hidden">
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 h-20 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src={getAssetPath("/logo-horizontal.svg")}
              alt="Logo DINARP"
              className="dark:hidden h-11 sm:h-12 w-auto object-contain"
            />
            <img
              src={getAssetPath("/logo-horizontal-blanco.svg")}
              alt="Logo DINARP"
              className="hidden dark:block h-11 sm:h-12 w-auto object-contain"
            />
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
