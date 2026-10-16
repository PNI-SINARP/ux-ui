"use client";

import React from "react";
import {
  FileText,
  Send,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Scale,
  FileSignature,
  Receipt,
  CreditCard,
  KeyRound,
  XCircle,
  Clock,
  ShieldCheck,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { TrazabilidadEvento } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

interface TrazabilidadTimelineProps {
  eventos?: TrazabilidadEvento[];
  historial?: TrazabilidadEvento[];
  className?: string;
  maxEvents?: number;
}

function getEventoIcon(evento: string) {
  const ev = evento.toLowerCase();
  if (ev.includes("cread") || ev.includes("borrador")) return FileText;
  if (ev.includes("enviad") || ev.includes("radicad")) return Send;
  if (ev.includes("asignad")) return UserCheck;
  if (ev.includes("observad") || ev.includes("correcci") || ev.includes("ajuste")) return AlertTriangle;
  if (ev.includes("subsanad") || ev.includes("reenviad")) return RotateCcw;
  if (ev.includes("jurídic") || ev.includes("normativ") || ev.includes("informe")) return Scale;
  if (ev.includes("contrato") || ev.includes("firm")) return FileSignature;
  if (ev.includes("factura")) return Receipt;
  if (ev.includes("pago")) return CreditCard;
  if (ev.includes("aprobac") || ev.includes("aprobada") || ev.includes("habilitad") || ev.includes("generad")) return CheckCircle2;
  if (ev.includes("vencid") || ev.includes("cerrad") || ev.includes("rechazad") || ev.includes("error") || ev.includes("fall")) return XCircle;
  if (ev.includes("técnic") || ev.includes("gateway") || ev.includes("aprovisionamiento")) return Server;
  return Clock;
}

function getEventoTone(evento: string): "neutral" | "brand" | "success" | "warning" | "danger" {
  const ev = evento.toLowerCase();
  if (ev.includes("aprobada") || ev.includes("habilitad") || ev.includes("firmado") || ev.includes("confirmado") || ev.includes("acceso generado")) return "success";
  if (ev.includes("observad") || ev.includes("correcci") || ev.includes("pendiente de pago") || ev.includes("ajuste")) return "warning";
  if (ev.includes("vencid") || ev.includes("cerrad") || ev.includes("rechazad") || ev.includes("fall") || ev.includes("error")) return "danger";
  if (ev.includes("enviad") || ev.includes("asignad") || ev.includes("normativ") || ev.includes("subsanad")) return "brand";
  return "neutral";
}

export function TrazabilidadTimeline({ eventos, historial, className, maxEvents }: TrazabilidadTimelineProps) {
  const lista = eventos || historial || [];
  const displayEvents = maxEvents ? lista.slice(-maxEvents) : lista;
  const sortedEvents = [...displayEvents].reverse(); // más reciente arriba

  if (!sortedEvents || sortedEvents.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        No se registran eventos en el historial del trámite.
      </div>
    );
  }

  return (
    <div className={cn("relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60", className)}>
      {sortedEvents.map((item, idx) => {
        const Icon = getEventoIcon(item.evento);
        const tone = getEventoTone(item.evento);

        const iconBg = {
          success: "bg-success/10 text-success border-success/30",
          warning: "bg-warning/10 text-warning border-warning/30",
          danger: "bg-destructive/10 text-destructive border-destructive/30",
          brand: "bg-primary/10 text-primary border-primary/30",
          neutral: "bg-muted text-muted-foreground border-border",
        }[tone];

        return (
          <div key={`${item.fecha}-${idx}`} className="relative group">
            {/* Dot/Icon */}
            <div
              className={cn(
                "absolute -left-6 top-0.5 size-5 rounded-full border flex items-center justify-center transition-transform group-hover:scale-110",
                iconBg
              )}
            >
              <Icon className="size-2.5" />
            </div>

            {/* Event Content */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-heading text-xs font-semibold text-foreground">
                  {item.evento}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {item.fecha}
                </span>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="font-medium text-foreground/80">{item.actor}</span>
              </div>

              {item.detalle && (
                <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed bg-muted/30 p-2.5 rounded-md border border-border/40">
                  {item.detalle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
