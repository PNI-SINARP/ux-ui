"use client"

import { Switch } from "@/components/ui/switch"
import { Info, CheckCircle2, AlertCircle, ToggleLeft } from "lucide-react"

export function SwitchShowcase() {
  const variants = [
    { name: "Primary", id: "primary" as const },
    { name: "Secondary", id: "secondary" as const },
    { name: "Success", id: "success" as const },
    { name: "Error", id: "error" as const },
    { name: "Warning", id: "warning" as const },
    { name: "Info", id: "info" as const },
  ]

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <ToggleLeft className="size-5 text-primary" />
        <h2 className="text-xl font-heading font-semibold text-foreground">Switch</h2>
      </div>

      <div className="overflow-x-auto pb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-border">
              <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground tracking-widest">Variante</th>
              <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground tracking-widest text-center">Checked</th>
              <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground tracking-widest text-center">Unchecked</th>
              <th className="py-3 px-4 text-xs font-bold uppercase text-muted-foreground tracking-widest text-center">Disabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {variants.map((variant) => (
              <tr key={variant.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-foreground">{variant.name}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    <Switch variant={variant.id} defaultChecked />
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    <Switch variant={variant.id} />
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex justify-center">
                    <Switch variant={variant.id} disabled defaultChecked />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FEATURES SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Tamaños Disponibles
          </h3>
          <div className="flex items-center gap-8 p-4 rounded-xl border border-border w-fit">
            <div className="flex flex-col items-center gap-2">
              <Switch size="sm" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">sm</span>
                <span className="text-[10px] font-bold text-primary">14px</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Switch size="default" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">default</span>
                <span className="text-[10px] font-bold text-primary">18px</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Switch size="lg" defaultChecked />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">lg</span>
                <span className="text-[10px] font-bold text-primary">24px</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Soporta tamaños compacto y estándar para diferentes densidades de UI.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Estados de Validación
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle2 className="size-3.5" />
              <span>Variante **Success**: Ideal para configuraciones activadas exitosamente.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-info">
              <Info className="size-3.5" />
              <span>Variante **Info**: Resalta información de configuración relevante.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertCircle className="size-3.5" />
              <span>Variante **Error**: Indica configuraciones que requieren atención o fallidas.</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ToggleLeft className="size-3.5" />
              <span>Variante **Secondary**: Uso para toggles de menor jerarquía visual.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
