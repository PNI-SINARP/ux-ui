"use client";

import React, { useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  UserX,
  ShieldAlert,
  Calendar,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import type { EventoTrazabilidadSuplencia } from "../data/suplencias-store";

interface SuplenciaTimelineProps {
  eventos: EventoTrazabilidadSuplencia[];
  className?: string;
  showHeader?: boolean;
  institucionNombre?: string;
}

function mapEventoToTimelineItem(
  evt: EventoTrazabilidadSuplencia,
  index: number
): TimelineItem {
  const evLower = evt.evento.toLowerCase();

  let status: TimelineItem["status"] = "neutral";
  let icon: React.ReactNode = <Clock className="size-4" />;

  if (evLower.includes("finalizada") || evLower.includes("desactivada")) {
    status = "neutral";
    icon = <CheckCircle2 className="size-4 text-muted-foreground" />;
  } else if (evLower.includes("inhabilitado") || evLower.includes("cancelada") || evLower.includes("inactivo")) {
    status = "warning";
    icon = <UserX className="size-4 text-warning" />;
  } else if (evLower.includes("habilitado") || evLower.includes("restituido")) {
    status = "success";
    icon = <UserCheck className="size-4 text-success" />;
  } else if (evLower.includes("programada")) {
    status = "primary";
    icon = <Calendar className="size-4 text-primary" />;
  } else if (evLower.includes("notificado")) {
    status = "info";
    icon = <Send className="size-4 text-info" />;
  } else if (evLower.includes("desplazada") || evLower.includes("error")) {
    status = "danger";
    icon = <AlertTriangle className="size-4 text-danger" />;
  } else if (evLower.includes("activada") || evLower.includes("activo")) {
    status = "primary";
    icon = <ShieldAlert className="size-4 text-primary" />;
  }

  // Etiqueta semántica para el badge del item
  const statusLabel = evt.estado || evt.modalidad || "Registrado";

  // Descripción formateada
  let description = evt.motivo;
  if (!description && evt.modalidad) {
    description = `Modalidad: ${evt.modalidad}`;
  }

  return {
    id: evt.id || `evt-suplencia-${index}-${evt.fechaHora}`,
    title: evt.evento,
    description,
    date: evt.fechaHora,
    status,
    statusLabel,
    icon,
    user: evt.actor,
    isCurrent: index === 0,
  };
}

export function SuplenciaTimeline({
  eventos,
  className,
  showHeader = false,
  institucionNombre,
}: SuplenciaTimelineProps) {
  const timelineItems: TimelineItem[] = useMemo(() => {
    return (eventos || []).map(mapEventoToTimelineItem);
  }, [eventos]);

  if (!eventos || eventos.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground text-xs sm:text-sm bg-surface/50 rounded-xl border border-dashed border-border p-6">
        No se registran eventos de suplencia aún para esta coordinación.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div className="flex items-center gap-2">
            <History className="size-4.5 text-primary shrink-0" />
            <div>
              <h3 className="text-sm sm:text-base font-bold font-heading text-foreground">
                Trazabilidad de la suplencia
              </h3>
              {institucionNombre && (
                <p className="text-xs text-muted-foreground">{institucionNombre}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {eventos.length} evento{eventos.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Componente oficial Timeline del UI Kit */}
      <Timeline items={timelineItems} />
    </div>
  );
}
