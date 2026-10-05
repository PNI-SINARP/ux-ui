"use client";

import React from "react";
import { CheckCircle2, Clock, Send, UserCheck, ShieldAlert, FileText, UserPlus, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrazabilidadEventoAnexoC } from "../data/cambio-coordinador-store";

interface CambioCoordinadorTimelineProps {
  eventos: TrazabilidadEventoAnexoC[];
  className?: string;
}

export function CambioCoordinadorTimeline({
  eventos,
  className
}: CambioCoordinadorTimelineProps) {
  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-caption">
        No hay registros de trazabilidad disponibles.
      </div>
    );
  }

  const getIcon = (accion: string) => {
    const act = accion.toLowerCase();
    if (act.includes("rechazado") || act.includes("rechazo")) {
      return <XCircle className="h-4 w-4 text-danger" />;
    }
    if (act.includes("aplicado") || act.includes("aprobado")) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    if (act.includes("enrolamiento")) {
      return <UserPlus className="h-4 w-4 text-warning" />;
    }
    if (act.includes("asignación") || act.includes("revisor")) {
      return <UserCheck className="h-4 w-4 text-primary" />;
    }
    if (act.includes("firma") || act.includes("firmaec")) {
      return <CheckCircle2 className="h-4 w-4 text-primary" />;
    }
    if (act.includes("enviado")) {
      return <Send className="h-4 w-4 text-primary" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative pl-6 border-l-2 border-border/80 space-y-6 my-2">
        {eventos.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Punto o ícono en la línea de tiempo */}
            <div className="absolute -left-[33px] top-0 h-6 w-6 rounded-full bg-surface border-2 border-border flex items-center justify-center shadow-xs">
              {getIcon(evt.accion)}
            </div>

            {/* Contenido del evento */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-body-sm font-semibold text-foreground">
                  {evt.accion}
                </span>
                <span className="text-caption text-muted-foreground font-mono">
                  {evt.fecha}
                </span>
              </div>

              <div className="text-caption text-muted-foreground">
                <strong className="text-foreground">{evt.actor}</strong> &bull; {evt.rol}
              </div>

              {evt.detalle && (
                <p className="text-body-sm text-foreground/80 bg-muted/20 p-2.5 rounded-md border border-border/60 mt-1.5 leading-relaxed">
                  {evt.detalle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
