import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TextareaShowcase() {
  const states = [
    { id: "default", label: "Default" },
    { id: "error", label: "Error" },
  ] as const;

  return (
    <div className="space-y-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Variantes de Estado
          </h3>
          <div className="grid gap-6">
            {states.map((state) => (
              <div key={`textarea-${state.id}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{state.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    state=&quot;{state.id}&quot;
                  </span>
                </div>
                <Textarea
                  placeholder={`Escribe algo aquí (${state.label})...`}
                  state={state.id}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Variante con Acción
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Chat Style</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  showSendButton={"true"}
                </span>
              </div>
              <InteractiveChatInput />
              <p className="text-[10px] text-muted-foreground italic mt-4">
                * Variante Chat (Uúútilizada en el asistente).
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* COMPONENT HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 border-t border-border pt-8">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Interacción
          </h3>
          <p className="text-xs text-muted-foreground">
            Incluye efectos de **Soft Radial** seguidor de cursor y **Glow** perimetral adaptativo, elevando la experiencia tácúútil y visual.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Auto-ajuste
          </h3>
          <p className="text-xs text-muted-foreground">
            Uúútiliza <code className="text-foreground">field-sizing-content</code> para una expansión fluida, manteniendo los efectos visuales alineados.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
            Botón Integrado
          </h3>
          <p className="text-xs text-muted-foreground">
            Soporta una acción de envío integrada con posicionamiento inteligente y ajuste de padding automático para evitar solapamiento de contenido.
          </p>
        </div>
      </div>
    </div>
  );
}

function InteractiveChatInput() {
  const [val, setVal] = React.useState("");

  return (
    <div className="w-full">
      <Textarea
        appearance="chat"
        color="primary"
        placeholder="Escribe tu consulta..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
        showSendButton={true}
        onSend={() => setVal("")}
      />
    </div>
  )
}

