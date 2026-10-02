"use client";

import React from "react";
import { SubSection } from "./sub-section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, User, Send, Sparkles, RefreshCw, FileText, Database, ExternalLink, AlertTriangle, Smile, ShieldQuestion, MessageCircle } from "lucide-react";
import { ChatAssistantShowcase } from "./chat-assistant-showcase";
import { ChatIntranetShowcase } from "./chat-intranet-showcase";




export function ConversationalAssistantShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [messages, setMessages] = React.useState<Array<{ sender: "user" | "assistant" | "system" | "error"; text: string }>>([
    { sender: "assistant", text: "¡Hola! Soy el asistente virtual del Geoportal DINARP. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [inputText, setInputText] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { sender: "assistant", text: `Entendido. He procesado tu consulta sobre: "${userMsg}". Según la base de datos geográfica, existen 12 predios coincidentes en la Zona 3.` }
      ]);
    }, 1800);
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. CHAT LAUNCHER */}
      <SubSection icon={MessageCircle} id="chat-launcher" title="Chat Launcher" description="Botón flotante disparador de acceso rápido al asistente." registerSection={registerSection}>
        <div className="flex items-center gap-4">
          <Button variant="primary" className="size-14 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center justify-center p-0">
            <Bot className="size-7 text-white" />
          </Button>
          <span className="text-xs text-muted-foreground font-semibold">Launcher de acceso flotante</span>
        </div>
      </SubSection>

      {/* 3. SOURCE ITEM & RICH RESULT CARD */}
      <SubSection icon={Sparkles} id="rich-result" title="Source Item & Rich Result Card" description="Identificación de fuentes oficiales de respuesta y tarjetas con resultados enriquecidos." registerSection={registerSection}>
        <div className="space-y-4 max-w-lg">
          {/* Source Item */}
          <div className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-primary" />
              <span className="font-semibold text-foreground">Fuente: Geodatabase Catastral DINARP</span>
            </div>
            <Badge tone="neutral" appearance="soft">API Oficial</Badge>
          </div>

          {/* Rich Result Card */}
          <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Unidad Educativa Manuela Cañizares</span>
              <Badge tone="error" appearance="soft">Riesgo Alto</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Código AMIE: 17H00012 • Zona 3 • Pichincha</p>
            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm" className="text-xs">
                Abrir Ficha Técnica <ExternalLink className="size-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </SubSection>

      {/* 4. CHAT EMPTY STATE & ERROR STATE */}
      <SubSection icon={ShieldQuestion} id="chat-states" title="Chat Empty State & Error State" description="Variaciones de estados iniciales y de error con opción de reintento." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Empty State */}
          <div className="group relative p-8 rounded-3xl border border-info/30 bg-gradient-to-b from-info/10 to-surface text-center space-y-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-info/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
            <div className="relative z-10 size-16 rounded-[20px] bg-info/20 text-info flex items-center justify-center mx-auto shadow-inner border border-info/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Sparkles className="size-8" />
            </div>
            <div className="relative z-10 space-y-1.5">
              <h5 className="text-base font-bold text-foreground tracking-tight">¿En qué puedo ayudarte?</h5>
              <p className="text-sm text-foreground/70 max-w-[260px] mx-auto leading-relaxed font-medium">Consulta capas territoriales, estadísticas de predios o solicita reportes en tiempo aareal.</p>
            </div>
          </div>

          {/* Error State */}
          <div className="group relative p-8 rounded-3xl border border-danger/30 bg-gradient-to-b from-danger/10 to-surface text-center space-y-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-danger/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
            <div className="relative z-10 size-16 rounded-[20px] bg-danger/10 text-danger flex items-center justify-center mx-auto shadow-inner border border-danger/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
              <AlertTriangle className="size-8" />
            </div>
            <div className="relative z-10 space-y-2 flex flex-col items-center">
              <h5 className="text-base font-bold text-foreground tracking-tight">Error de Conexión con IA</h5>
              <p className="text-sm text-foreground/70 max-w-[260px] mx-auto leading-relaxed font-medium">No pudimos procesar tu solicitud en este momento.</p>
              <Button variant="danger" size="default" className="mt-2 w-fit">
                <RefreshCw className="size-4 mr-2" /> Reintentar
              </Button>
            </div>
          </div>
        </div>
      </SubSection>
      <ChatAssistantShowcase registerSection={registerSection} />
      <ChatIntranetShowcase registerSection={registerSection} />
    </div>
  );
}
