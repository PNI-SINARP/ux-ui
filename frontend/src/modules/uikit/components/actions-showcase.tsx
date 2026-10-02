"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { MousePointerClick, Link } from "lucide-react";

import { RadialButtonShowcase } from "./radial-button-showcase";
import { LinkShowcase } from "./link-showcase";

import { SubSection } from "./sub-section";

export function ActionsShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      <SubSection
        icon={MousePointerClick} id="button"
        registerSection={registerSection}
        title="Botón (Button)"
        description="Permite al usuario ejecutar una acción dentro de la interfaz, como guardar información, continuar un proceso, confirmar una decisión o cancelar una operación."
      >
        <RadialButtonShowcase />
      </SubSection>

      <SubSection
        icon={Link} id="link"
        registerSection={registerSection}
        title="Enlace (Link)"
        description="Permite acceder a otra página, sección o recurso relacionado mediante una acción de navegación textual."
      >
        <LinkShowcase registerSection={registerSection} />
      </SubSection>
    </div>
  );
}
