"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, CheckCircle2, AlertCircle, Info } from "lucide-react"

export function CheckboxShowcase() {
  const variants = [
    { id: "primary", label: "Primario" },
    { id: "secondary", label: "Secundario" },
    { id: "success", label: "Éxito" },
    { id: "warning", label: "Aviso" },
    { id: "error", label: "Error" },
    { id: "info", label: "Información" },
  ] as const;

  const states = [
    { id: "checked", label: "Seleccionado" },
    { id: "unchecked", label: "No Seleccionado" },
    { id: "disabled", label: "Deshabilitado" },
  ] as const;

  return (
    <section className="grid gap-8">
      <div className="space-y-2">
        <h2 className="text-h3 font-bold flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Matriz de Componentes: Checkbox
        </h2>
        <p className="text-sm text-muted-foreground">
          Selectores de estado binario con soporte para variantes semánticas y estados nativos.
        </p>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-end mb-6 border-b border-border pb-4">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
              Variante
            </div>
            {states.map((state) => (
              <div key={state.id} className="text-center space-y-2">
                <div className="text-xs font-bold text-foreground">{state.label}</div>
                <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border inline-block font-mono uppercase">
                  {state.id}
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div className="space-y-8">
            {variants.map((variant) => (
              <div key={variant.id} className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-center">
                {/* VARIANT LABEL */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold capitalize text-foreground">{variant.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">variant=&quot;{variant.id}&quot;</span>
                </div>

                {/* STATE CELLS */}
                <div className="flex justify-center items-center w-full">
                  <Checkbox variant={variant.id as React.ComponentProps<typeof Checkbox>["variant"]} defaultChecked />
                </div>
                <div className="flex justify-center items-center w-full">
                  <Checkbox variant={variant.id as React.ComponentProps<typeof Checkbox>["variant"]} />
                </div>
                <div className="flex justify-center items-center w-full">
                  <Checkbox variant={variant.id as React.ComponentProps<typeof Checkbox>["variant"]} disabled defaultChecked />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* USAGE EXAMPLE */}
      <div className="space-y-6 pt-4 border-t border-border">
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Uso con Etiquetas
          </h3>
          <p className="text-xs text-muted-foreground">
            Combinación de checkbox con etiquetas descriptivas para formularios.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-sm p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-3 group">
            <Checkbox id="termas" />
            <label
              htmlFor="termas"
              className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
            >
              Acepto los términos y condiciones
            </label>
          </div>
          <div className="flex items-center space-x-3 group">
            <Checkbox id="marketing" variant="secondary" defaultChecked />
            <label
              htmlFor="marketing"
              className="text-sm font-medium leading-none cursor-pointer group-hover:text-secondary transition-colors"
            >
              Suscribirme al boletín informativo
            </label>
          </div>
          <div className="flex items-center space-x-3 group opacity-50 cursor-not-allowed">
            <Checkbox id="aareadonly" disabled defaultChecked />
            <label
              htmlFor="aareadonly"
              className="text-sm font-medium leading-none"
            >
              Opción obligatoria (Pre-seleccionada)
            </label>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Tamaños Disponibles
          </h3>
          <div className="flex items-center gap-8 p-4 rounded-lg border border-border w-fit">
            <div className="flex flex-col items-center gap-2">
              <Checkbox size="sm" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">sm</span>
                <span className="text-[10px] font-bold text-primary">14px</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Checkbox size="md" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">md</span>
                <span className="text-[10px] font-bold text-primary">16px</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Checkbox size="lg" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">lg</span>
                <span className="text-[10px] font-bold text-primary">20px</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            El tamaño del icono interno se ajusta automáticamente según el tamaño del contenedor.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Estados de Validación
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="size-3.5" />
              <span>Variante **Success**: Ideal para confirmaciones positivas.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertCircle className="size-3.5" />
              <span>Variante **Error**: Resalta selecciones inválidas o críticas.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-info">
              <Info className="size-3.5" />
              <span>Variante **Info**: Resalta información de selección relevante.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" />
              <span>Variante **Secondary**: Uso para acciones complementarias.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
