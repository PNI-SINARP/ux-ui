"use client";

import React from "react";
import { getAssetPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { DinarpWireframe2LoginFlow } from "@/modules/auth/components/dinarp-wireframe2-login-flow";

export function LoginView() {
  return (
    <WireframeAuthLayout imageSrc={getAssetPath("/fondo.png")} imageFit="contain">
      {/* â”€â”€ Cabecera Superior del Formulario: Logo DINARP + Modo Claro/Oscuro â”€â”€ */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
        <div>
          <img
            src={getAssetPath("/logo-horizontal.svg")}
            alt="Logo DINARP"
            className="dark:hidden h-11 sm:h-12 w-auto max-w-[220px] sm:max-w-[240px] object-contain"
          />
          <img
            src={getAssetPath("/logo-horizontal-outline-blanco.svg")}
            alt="Logo DINARP"
            className="hidden dark:block h-11 sm:h-12 w-auto max-w-[220px] sm:max-w-[240px] object-contain opacity-90"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
        </div>
      </div>

      {/* â”€â”€ Flujo Integral de Acceso y Enrolamiento BPM DINARP â”€â”€ */}
      <DinarpWireframe2LoginFlow dashboardRoute="/catalogo-interoperabilidad" />
    </WireframeAuthLayout>
  );
}
