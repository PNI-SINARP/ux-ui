"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Card } from "@/components/ui/card";
import { ToggleLeft } from "lucide-react";




export function ToggleShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <Card innerClassName="items-start text-left" className="p-8 rounded-xl shadow-lg border-border overflow-hidden space-y-10">
      {/* Section Header */}
      <div className="flex items-start gap-3.5 text-left pb-6 border-b border-border/60">
        <ToggleLeft className="w-7 h-7 text-primary flex-shrink-0 mt-1" />
        <div>
          <h2 className="text-h2 font-heading font-bold text-primary-500">Toggle</h2>
          <p className="text-muted-foreground text-sm mt-1">Botones de estado binario para activar o desactivar opciones y agrupar selecciones.</p>
        </div>
      </div>

      <div className="space-y-10">
        <SubSection title="Variantes y Estados" description="Diferentes esúútilos visuales y estados de interacción del toggle básico.">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Por defecto</p>
              <Toggle aria-label="Toggle bold">
                <Bold className="size-4" />
              </Toggle>
            </div>
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Contorno</p>
              <Toggle variant="outline" aria-label="Toggle italic">
                <Italic className="size-4" />
              </Toggle>
            </div>
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">With Text</p>
              <Toggle variant="outline" className="gap-2 px-3">
                <Underline className="size-4" />
                Underline
              </Toggle>
            </div>
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Disabled</p>
              <Toggle disabled aria-label="Disabled toggle">
                <Bold className="size-4" />
              </Toggle>
            </div>
          </div>
        </SubSection>

        <SubSection title="Tamaños" description="Variaciones de dimensiones de escala para integrarse en diferentes densidades de contenido.">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Pequeño</p>
              <Toggle size="sm" variant="outline">
                <Bold className="size-4" />
              </Toggle>
            </div>
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Por defecto</p>
              <Toggle variant="outline">
                <Bold className="size-4" />
              </Toggle>
            </div>
            <div className="space-y-2">
              <p className="text-caption text-muted-foreground">Grande</p>
              <Toggle size="lg" variant="outline">
                <Bold className="size-4" />
              </Toggle>
            </div>
          </div>
        </SubSection>

        <SubSection title="Toggle Group (Single)" description="Conjunto de botones mutuamente excluyentes donde solo uno puede estar activo.">
          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">Alineación de Texto</p>
            <ToggleGroup type="single" variant="outline" defaultValue="center">
              <ToggleGroupItem value="left" aria-label="Align left">
                <AlignLeft className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Align center">
                <AlignCenter className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Align right">
                <AlignRight className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </SubSection>

        <SubSection title="Toggle Group (Multiple)" description="Grupo de botones independientes que admiten activación simultánea múltiple.">
          <div className="space-y-2">
            <p className="text-caption text-muted-foreground">Esúútilos de Formato</p>
            <ToggleGroup type="multiple" variant="outline">
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </SubSection>
      </div>
    </Card>
  );
}

