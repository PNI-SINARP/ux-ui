"use client"

import { SubSection } from "./sub-section";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, Info, CircleCheckIcon, TriangleAlertIcon, OctagonXIcon, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react"

const semanticVariants = [
  { id: "primary", label: "Primary", description: "Información relacionada con acciones o elementos principales." },
  { id: "secondary", label: "Secondary", description: "Información complementaria o de menor jerarquía." },
  { id: "success", label: "Success", description: "Confirma una condición o resultado satisfactorio." },
  { id: "warning", label: "Warning", description: "Advierte sobre una condición que requiere atención." },
  { id: "danger", label: "Danger", description: "Comunica riesgo, error o una acción potencialmente destructiva." },
  { id: "info", label: "Info", description: "Amplía información contextual sión representar una alerta." },
] as const

const sides = [
  { id: "top", label: "Arriba", icon: ArrowUp },
  { id: "bottom", label: "Abajo", icon: ArrowDown },
  { id: "left", label: "Izquierda", icon: ArrowLeft },
  { id: "right", label: "Derecha", icon: ArrowRight },
] as const




export function TooltipShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-10 w-full">
        {/* ─── SEMANTIC VARIANTS ─── */}
        <SubSection icon={HelpCircle} id="tooltip" title="Tooltip & Variantes Semánticas" description={<>Mensaje breve que aparece al pasar el cursor o enfocar un elemento y proporciona información adicional sión ocupar espacio permanente en la interfaz.<br/><br/><span className="text-muted-foreground italic">Recomendación: Uúútilizar Tooltip principalmente en íconos, controles compactos o conceptos que necesiten una aclaración breve.</span></>} registerSection={registerSection}>
            <div className="flex flex-wrap gap-4 items-center">
              {semanticVariants.map((v) => (
                <div key={v.id} className="flex flex-col items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="neutral" size="sm">
                        {v.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent variant={v.id} side="top" sideOffset={8}>
                      {v.description}
                    </TooltipContent>
                  </Tooltip>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    variant=&quot;{v.id}&quot;
                  </span>
                </div>
              ))}
            </div>
          </SubSection>

          {/* ─── SIDE POSITIONS ─── */}
          <SubSection title="Posición" description="El Tooltip puede aparecer en diferentes posiciones según el espacio disponible y la ubicación del elemento que necesita explicar.">
            <div className="flex flex-wrap gap-8 items-center justify-center py-4">
              {sides.map((s) => {
                const SideIcon = s.icon
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="neutral" size="icon-sm">
                          <SideIcon className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent
                        variant="primary"
                        side={s.id}
                        sideOffset={8}
                      >
                        Tooltip {s.label}
                      </TooltipContent>
                    </Tooltip>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      side=&quot;{s.id}&quot;
                    </span>
                  </div>
                )
              })}
            </div>
          </SubSection>

          {/* ─── VARIANTS × SIDES MATRIX ─── */}
          <SubSection title="Variantes y posiciones" description="Comparación visual de las variantes semánticas del Tooltip en las cuatro posiciones disponibles.">
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[700px]">
                {/* Header Row */}
                <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-4 items-end mb-6 border-b border-border pb-4">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                    Variante
                  </div>
                  {sides.map((s) => (
                    <div key={s.id} className="text-center space-y-2">
                      <div className="text-xs font-bold text-foreground">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border inline-block font-mono uppercase">
                        {s.id}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content Rows */}
                <div className="space-y-8">
                  {semanticVariants.map((v) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-[140px_repeat(4,1fr)] gap-4 items-center"
                    >
                      {/* Variant Label */}
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold capitalize text-foreground">
                          {v.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          variant=&quot;{v.id}&quot;
                        </span>
                      </div>

                      {/* Side Cells */}
                      {sides.map((s) => (
                        <div key={s.id} className="flex justify-center items-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="neutral" size="icon-sm">
                                <s.icon className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent
                              variant={v.id}
                              side={s.id}
                              sideOffset={8}
                            >
                              {v.label} · {s.label}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SubSection>

          {/* ─── USE CASES ─── */}
          <SubSection title="Casos de Uso Comunes" description="Ejemplos de situaciones habituales donde un Tooltip ayuda a explicar controles o conceptos sin añadir texto permanente a la interfaz.">
            <div className="flex flex-wrap gap-8 py-2">
              {/* Icon Button with Tooltip */}
              <div className="space-y-2">
                <span className="text-sm font-bold block text-foreground">Botón con ícono</span>
                <p className="text-xs text-muted-foreground pb-2 max-w-xs">Permite explicar la función de un ícono cuando su significado puede no ser evidente por sí solo.</p>
                <div className="flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="success" size="icon-sm">
                        <CircleCheckIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent variant="success" sideOffset={8}>
                      Descargar reporte
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="danger" size="icon-sm">
                        <OctagonXIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent variant="danger" sideOffset={8}>
                      Eliminar
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="info" size="icon-sm">
                        <Info className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent variant="info" sideOffset={8}>
                      Acerca de
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Inline Text Tooltip */}
              <div className="space-y-2">
                <span className="text-sm font-bold block text-foreground">Texto inline</span>
                <p className="text-sm text-foreground leading-relaxed max-w-xs mt-2">
                  La{" "}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline decoration-primary decoration-dotted underline-offset-4 cursor-help font-medium text-primary">
                        geolocalización
                      </span>
                    </TooltipTrigger>
                    <TooltipContent variant="primary" sideOffset={8}>
                      Ubicación asociada mediante coordenadas geográficas.
                    </TooltipContent>
                  </Tooltip>{" "}
                  permite relacionar información institucional con una ubicación específica en el territorio.
                </p>
              </div>

              {/* Disabled State */}
              <div className="space-y-2">
                <span className="text-sm font-bold block text-foreground">Estado deshabilitado</span>
                <p className="text-xs text-muted-foreground pb-2 max-w-xs">Puede explicar por qué una acción no está disponible y qué condición debe cumplirse para habilitarla.</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-flex">
                      <Button variant="neutral" size="sm" disabled>
                        <TriangleAlertIcon className="size-4" />
                        Generar reporte
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="warning" sideOffset={8}>
                    Selecciona al menos una institución para generar el reporte.
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SubSection>

          {/* ─── DESIGN NOTES ─── */}
          <SubSection title="Notas de Diseño y Comportamiento" description="Directrices de uso y diseño del sistema.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Arquitectura de Tokens
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  Las variantes útilizan los colores semánticos definidos en el Design System para mantener consistencia visual entre estados, mensajes y componentes.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Variables de <code className="text-foreground">globals.css</code>: <code className="text-foreground">bg-*</code> y <code className="text-foreground">text-*-foreground</code>.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Comportamiento
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  El Tooltip aparece automáticamente en la posición configurada, útiliza una animación breve de entrada y salida y mantiene su flecha visual alineada con el elemento que está explicando.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Referencia técnica: <code className="text-foreground">top</code> · <code className="text-foreground">bottom</code> · <code className="text-foreground">left</code> · <code className="text-foreground">right</code>.
                </p>
              </div>
            </div>
          </SubSection>
      </div>
    </TooltipProvider>
  );
}
