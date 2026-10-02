"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import ChatAssistant from "@/components/ui/ChatAssistant";
import { MessageSquare, Sparkles, Send, Bot } from "lucide-react";

import { Card } from "@/components/ui/card";




export function ChatAssistantShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  return (
    <div className="space-y-10 w-full">
      {/* Description */}
      <SubSection icon={Bot} id="chat-assistant" title="Chat Assistant & Lanzador Flotante" description="Prueba de la interfaz flotante del asistente." registerSection={registerSection}>
          <div className="p-8 rounded-xl border border-border bg-background shadow-sm flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Sparkles className="size-32 text-primary" />
            </div>

            <div className="text-center space-y-4 max-w-md relative z-10">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
                <Send className="size-6 text-primary animate-pulse" />
              </div>
              <h4 className="text-h4 font-heading font-semibold text-foreground">Asistente Virtual Activo</h4>
              <p className="text-body-sm text-muted-foreground">
                Haz clic en el botón flotante en la esquina inferior derecha para interactuar con el asistente virtual.
              </p>
            </div>

            {/* Note about position */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-[10px] text-muted-foreground/60 italic">
                * El componente se renderiza con posición fija (fixed) en la ventana global.
              </p>
            </div>
          </div>
        </SubSection>

        {/* Features list */}
        <SubSection title="Características de la Interfaz" description="Detalles y directrices visuales del chat.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-background shadow-sm">
              <h5 className="text-body-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-primary" />
                Diseño Premium
              </h5>
              <p className="text-caption text-muted-foreground leading-relaxed">
                Uso de glassmorphism, gradientes suaves y sombras profundas para una apariencia moderna.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background shadow-sm">
              <h5 className="text-body-sm font-bold text-foreground mb-1 flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-success" />
                Interactividad y Feedback
              </h5>
              <p className="text-caption text-muted-foreground leading-relaxed">
                Animaciones de entrada/salida y transiciones fluidas en el botón disparador.
              </p>
            </div>
          </div>
        </SubSection>
      {/* The actual component - it's fixed so it will appear in the corner of the whole page */}
      <ChatAssistant />
    </div>
  );
}
