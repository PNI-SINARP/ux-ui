"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Calendar,
  XCircle,
  FileText,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { EventoTrazabilidadSuplencia } from "../data/suplencias-store";

interface SuplenciasTrazabilidadProps {
  eventos: EventoTrazabilidadSuplencia[];
  className?: string;
  showHeader?: boolean;
}

export function SuplenciasTrazabilidad({
  eventos,
  className,
  showHeader = true,
}: SuplenciasTrazabilidadProps) {
  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-xs sm:text-sm">
        No hay registros de trazabilidad registrados aún.
      </div>
    );
  }

  const getEventIcon = (evento: string) => {
    const ev = evento.toLowerCase();
    if (ev.includes("desactivada") || ev.includes("finalizada")) {
      return <CheckCircle2 className="size-3.5 text-success" />;
    }
    if (ev.includes("inhabilitado") || ev.includes("cancelada")) {
      return <UserX className="size-3.5 text-warning" />;
    }
    if (ev.includes("habilitado") || ev.includes("restituido")) {
      return <UserCheck className="size-3.5 text-success" />;
    }
    if (ev.includes("programada")) {
      return <Calendar className="size-3.5 text-primary" />;
    }
    if (ev.includes("notificado")) {
      return <Send className="size-3.5 text-info" />;
    }
    if (ev.includes("desplazada")) {
      return <AlertTriangle className="size-3.5 text-danger" />;
    }
    if (ev.includes("activada")) {
      return <ShieldAlert className="size-3.5 text-warning" />;
    }
    return <Clock className="size-3.5 text-muted-foreground" />;
  };

  const getBadgeTone = (modalidad: string) => {
    switch (modalidad) {
      case "Programada":
        return "primary";
      case "Administrativa":
        return "warning";
      case "Automática (Portal)":
      default:
        return "neutral";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <History className="size-4.5 text-primary shrink-0" />
            <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
              Historial y trazabilidad institucional
            </h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {eventos.length} evento{eventos.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="relative pl-6 sm:pl-7 border-l-2 border-border/80 space-y-6 my-2">
        {eventos.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            {/* Ícono de evento en el eje de la línea de tiempo */}
            <div className="absolute -left-[35px] sm:-left-[39px] top-0 size-6 sm:size-7 rounded-full bg-surface border-2 border-border flex items-center justify-center shadow-xs">
              {getEventIcon(evt.evento)}
            </div>

            {/* Contenido del evento */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {evt.evento}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {evt.fechaHora}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>
                  Actor: <strong className="text-foreground">{evt.actor}</strong>
                </span>
                <span>·</span>
                <Badge
                  tone={getBadgeTone(evt.modalidad)}
                  appearance="soft"
                  size="sm"
                  className="text-[9px] font-bold"
                >
                  {evt.modalidad}
                </Badge>
                {evt.estado && (
                  <>
                    <span>·</span>
                    <span className="text-[11px] text-muted-foreground">
                      Estado: <span className="font-semibold text-foreground">{evt.estado}</span>
                    </span>
                  </>
                )}
              </div>

              {evt.motivo && (
                <div className="p-2.5 bg-muted/40 rounded-lg border border-border/60 text-xs text-foreground/80 leading-relaxed mt-1">
                  <span className="font-semibold text-muted-foreground">Motivo: </span>
                  {evt.motivo}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
