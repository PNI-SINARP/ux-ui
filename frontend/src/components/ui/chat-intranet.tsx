"use client";

import * as React from "react";
import {
  MessageCircle,
  FileText,
  Lightbulb,
  ArrowUp,
  MoreHorizontal,
  Bot,
  User,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ChatIntranetProps {
  className?: string;
  documentTitle?: string;
}

export function ChatIntranet({
  className,
  documentTitle = "un documento de la tabla",
}: ChatIntranetProps) {
  const [messages, setMessages] = React.useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const [isTyping, setIsTyping] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const isWriting = isFocused || inputValue.trim().length > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const query = text.trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInputValue("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        `He analizado "${query}" sobre el documento seleccionado. Los datos registrales coinciden y se encuentran vigentes en la plataforma DINARP.`,
        `Referente a tu consulta de "${query}": los puntos clave del documento han sido verificados. ¿Requieres generar un resumen formal o descargar los anexos?`,
        `Procesé la información sobre "${query}". El trámite y sus especificaciones técnicas cumplen con la normativa establecida.`,
      ];
      const randomResponse =
        responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: randomResponse },
      ]);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-background rounded-2xl border border-border shadow-md overflow-hidden w-full max-w-4xl mx-auto min-h-[600px] transition-all",
        className
      )}
    >
      {/* ── Encabezado del Chat ── */}
      <div className="px-6 py-4 relative bg-surface border-b border-border flex items-center justify-between sticky top-0 z-20 shadow-2xs">
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/60 via-info/40 to-transparent" />

        <div className="flex items-center gap-3 relative z-10">
          <Avatar className="size-9 sm:size-10 shadow-xs border border-primary/20 bg-primary/10">
            <AvatarFallback className="text-primary font-bold text-xs !bg-transparent">
              <Bot className="size-5 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <h3 className="font-semibold text-foreground text-sm tracking-wide leading-none">
              Asistente DINARP IA
            </h3>
            <span className="text-[10px] text-success font-medium flex items-center gap-1 mt-1">
              <span className="size-1.5 rounded-full bg-success animate-pulse inline-block" />
              En línea
            </span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted cursor-pointer"
            title="Reiniciar chat"
          >
            <RotateCcw className="size-3.5" />
            <span>Nuevo chat</span>
          </button>
        )}
      </div>

      {/* ── Área Principal de Mensajes / Bienvenida ── */}
      <div
        className={cn(
          "flex-1 p-4 sm:p-6 flex flex-col relative",
          messages.length > 0 ? "overflow-y-auto scrollbar-thin" : "overflow-hidden"
        )}
      >
        {messages.length === 0 ? (
          /* ── Pantalla de Bienvenida ── */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl mx-auto w-full text-center">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Contenido Creativo */}
            <div className="relative z-10 w-full animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-col items-center">
              {/* Ícono Creativo */}
              <div className="mb-4 size-12 rounded-2xl bg-gradient-to-br from-primary/15 to-info/10 border border-primary/20 flex items-center justify-center shadow-xs">
                <Sparkles className="size-6 text-primary animate-pulse" />
              </div>

              {/* Título Creativo */}
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2 flex-wrap">
                <span>¡Hola!</span>
                <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
                <span>Pregúntame lo que necesites</span>
              </h2>

              {/* Subtítulo */}
              <p className="text-muted-foreground text-sm max-w-md mt-2 mb-6 leading-relaxed font-normal">
                Veo que has seleccionado un documento de la tabla. Hazme una
                pregunta sobre él o utiliza una de las acciones sugeridas.
              </p>

              {/* Divisor Sutil */}
              <div className="w-full max-w-md h-px bg-border/60 mb-6" />

              {/* Badges del UI Kit como opciones de consulta */}
              <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg">
                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      "¿Cuáles son las preguntas frecuentes sobre este documento?"
                    )
                  }
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none"
                >
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="lg"
                    className="gap-1.5 px-3.5 py-1.5 h-auto text-xs font-bold"
                  >
                    <MessageCircle className="size-3.5" />
                    <span>RESPONDE TUS PREGUNTAS</span>
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      "Por favor genera un resumen y análisis de los puntos principales."
                    )
                  }
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none"
                >
                  <Badge
                    tone="info"
                    appearance="soft"
                    size="lg"
                    className="gap-1.5 px-3.5 py-1.5 h-auto text-xs font-bold"
                  >
                    <FileText className="size-3.5" />
                    <span>RESUME Y ANALIZA</span>
                  </Badge>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSend(
                      "Extrae los datos clave y fechas importantes del documento."
                    )
                  }
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none"
                >
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="lg"
                    className="gap-1.5 px-3.5 py-1.5 h-auto text-xs font-bold"
                  >
                    <Lightbulb className="size-3.5" />
                    <span>EXTRAE LO IMPORTANTE</span>
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Conversación Activa ── */
          <div className="space-y-6 flex-1 w-full pb-4">
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div
                  key={i}
                  className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-300"
                >
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface border border-border shadow-sm">
                    <Bot className="size-5 text-primary" />
                  </div>
                  <div className="max-w-[85%] rounded-[1.25rem] rounded-tl-sm bg-white dark:bg-surface border border-border shadow-sm text-left px-5 py-4">
                    <div className="text-sm text-foreground leading-relaxed">
                      {msg.text &&
                        msg.text.split("\n").map((line, j) => (
                          <React.Fragment key={j}>
                            {line}
                            {j < msg.text.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={i}
                  className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-right-4 duration-300"
                >
                  <div className="max-w-[85%] rounded-[1.25rem] rounded-tr-sm bg-white dark:bg-surface border border-border text-foreground px-5 py-4 text-sm shadow-sm leading-relaxed text-left">
                    {msg.text}
                  </div>
                </div>
              )
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-[0_0_12px_rgba(var(--primary),0.25)] animate-pulse overflow-hidden">
                  <Bot className="size-5 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-surface border border-border px-4 py-3 shadow-sm flex items-center gap-1.5 h-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-info opacity-70" />
                  <div
                    className="size-2 rounded-full bg-primary/70 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="size-2 rounded-full bg-info/70 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="size-2 rounded-full bg-danger/70 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Footer / Input Area (Estructura Original con Borde Degradado Animado) ── */}
      <div className="p-4 sm:p-6 shrink-0 w-full bg-background relative z-10 flex justify-center pb-8">
        {/* Ambient radial glow behind the composer */}
        <div
          className={cn(
            "absolute bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/20 blur-[100px] pointer-events-none rounded-full transition-opacity duration-700",
            isFocused ? "opacity-100" : "opacity-0"
          )}
        />

        <div
          className={cn(
            "relative w-full max-w-4xl rounded-3xl p-[1px] transition-all duration-300 ease-out group",
            isFocused
              ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] -translate-y-1"
              : "shadow-md hover:shadow-lg hover:-translate-y-0.5"
          )}
        >
          {/* Animated gradient border on focus / typing */}
          <div
            className={cn(
              "absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none",
              isWriting
                ? "bg-gradient-to-r from-primary via-secondary to-primary opacity-100 animate-gradient-border-flow"
                : "bg-border opacity-50 group-hover:opacity-100"
            )}
          />

          <div className="relative bg-surface/95 backdrop-blur-xl rounded-[calc(1.5rem-1px)] w-full flex flex-col p-4 sm:p-5 transition-all duration-300">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-2.5 transition-all duration-500",
                  isTyping ? "animate-pulse text-primary" : "text-muted-foreground"
                )}
              >
                <Sparkles className="size-5" />
              </div>
              <textarea
                ref={textareaRef}
                placeholder="Escribe tu consulta aquí..."
                value={inputValue}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground/60 resize-none outline-none border-0 ring-0 focus:ring-0 focus:outline-none focus:border-0 p-1 min-h-[48px]"
                rows={1}
                style={{ height: "auto" }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                {/* Empty left side placeholder for potential future actions */}
              </div>
              <Button
                size="icon"
                variant="primary"
                disabled={!inputValue.trim() || isTyping}
                onClick={() => handleSend(inputValue)}
                className="size-10 rounded-full flex-shrink-0 cursor-pointer"
              >
                {isTyping ? (
                  <MoreHorizontal className="size-5 animate-pulse" />
                ) : (
                  <ArrowUp className="size-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
