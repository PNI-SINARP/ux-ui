import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search, Send, Mail, Sparkles, CheckCircle2, AlertCircle, Eye, Info } from "lucide-react";

export function InputGroupShowcase() {
  const states = [
    { id: "default", label: "Default", color: "text-primary" },
    { id: "success", label: "Success", color: "text-success" },
    { id: "error", label: "Error", color: "text-danger" },
  ] as const;

  const compositions = [
    { id: "icon", label: "Con Icono", icon: Search },
    { id: "mixed", label: "Mixto (Icon + Button)", isMixed: true },
    { id: "button", label: "Con Botón", isButton: true },
    { id: "disabled", label: "Deshabilitado", isDisabled: true },
  ] as const;

  return (
    <div className="space-y-8">

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[1000px]">
          {/* HEADER ROW */}
          <div className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-end mb-6 border-b border-border pb-4">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
              Composición
            </div>
            {states.map((state) => (
              <div key={state.id} className="text-center space-y-2">
                <div className={`text-xs font-bold ${state.color}`}>{state.label}</div>
                <div className={`text-[10px] ${state.color} bg-current/5 px-2 py-0.5 rounded-full border border-current/20 inline-block font-mono uppercase`}>
                  state=&quot;{state.id}&quot;
                </div>
              </div>
            ))}
          </div>

          {/* CONTENT ROWS */}
          <div className="space-y-8">
            {compositions.map((comp) => (
              <div key={comp.id} className="grid grid-cols-[160px_repeat(3,1fr)] gap-6 items-center">
                {/* COMP LABEL */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold capitalize text-foreground">{comp.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">type=&quot;{comp.id}&quot;</span>
                </div>

                {/* STATE CELLS */}
                {states.map((state) => (
                  <div key={`${comp.id}-${state.id}`} className="flex justify-center w-full">
                    <InputGroup
                      state={state.id}
                      className="w-full"
                      disabled={comp.id === "disabled"}
                      leftIcon={
                        <>
                          {comp.id === "icon" && <comp.icon className="size-4" />}
                          {comp.id === "mixed" && <Mail className="size-4" />}
                          {comp.id === "button" && <Search className="size-4" />}
                          {comp.id === "disabled" && <Mail className="size-4" />}
                        </>
                      }
                      rightIcon={
                        <>
                          {state.id === "success" && <CheckCircle2 className="size-4" />}
                          {state.id === "error" && <AlertCircle className="size-4" />}

                          {comp.id === "mixed" && (
                            <InputGroupButton variant="ghost" size="icon-xs">
                              <Eye className="size-3.5" />
                            </InputGroupButton>
                          )}
                          {(comp.id === "button" || comp.id === "disabled") && (
                            <InputGroupButton
                              variant="ghost"
                              size="icon-xs"
                              disabled={comp.id === "disabled"}
                            >
                              {comp.id === "button" ? (
                                <Send className="size-3.5" />
                              ) : (
                                <Eye className="size-3.5" />
                              )}
                            </InputGroupButton>
                          )}
                          {comp.id === "icon" && state.id === "default" && (
                            <Info className="size-4 text-muted-foreground" />
                          )}
                        </>
                      }
                    >
                      <InputGroupInput
                        placeholder={`Entrada ${state.label}...`}
                        disabled={comp.id === "disabled"}
                      />
                    </InputGroup>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIZES SECTION */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
          Tamaños Disponibles (Coherencia con Botones)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Pequeño</span>
              <span className="text-[10px] text-muted-foreground font-mono">size=&quot;sm&quot; (h-9)</span>
            </div>
            <InputGroup size="sm" leftIcon={<Search className="size-3.5" />}>
              <InputGroupInput placeholder="Búsqueda pequeña..." />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Estándar</span>
              <span className="text-[10px] text-muted-foreground font-mono">size=&quot;default&quot; (h-11)</span>
            </div>
            <InputGroup size="default" leftIcon={<Search className="size-4" />}>
              <InputGroupInput placeholder="Búsqueda estándar..." />
            </InputGroup>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Grande</span>
              <span className="text-[10px] text-muted-foreground font-mono">size=&quot;lg&quot; (h-14)</span>
            </div>
            <InputGroup size="lg" leftIcon={<Search className="size-5" />}>
              <InputGroupInput placeholder="Búsqueda grande..." />
            </InputGroup>
          </div>
        </div>
      </div>

      {/* COMPONENT HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Interacción Dinámica
          </h3>
          <p className="text-xs text-muted-foreground">
            Haz clic o pasa el mouse sobre cualquier input arriba para ver el efecto de **Soft Radial** y el **Glow** perimetral que se adapta cromáticamente a cada estado.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
            Notas de Esúútilo
          </h3>
          <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
            <li>Soporte de tamaños <code className="text-foreground">sm</code>, <code className="text-foreground">default</code> y <code className="text-foreground">lg</code> alineados con el sistema de botones.</li>
            <li>Borde de <code className="text-foreground">2px</code> para mayor definición en estados de validación.</li>
            <li>Aislamiento de capas (<code className="text-foreground">isolate</code>) para efectos visuales sión sangrado de color.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
