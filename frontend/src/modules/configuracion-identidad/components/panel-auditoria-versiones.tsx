"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EventoAuditoria } from "../data/types";
import { EstadoConfiguracionBadge } from "./estado-configuracion-badge";
import { History, ShieldCheck, Hash, UserCheck } from "lucide-react";

interface PanelAuditoriaVersionesProps {
  eventos: EventoAuditoria[];
}

export function PanelAuditoriaVersiones({ eventos }: PanelAuditoriaVersionesProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-bold font-heading text-foreground flex items-center gap-2">
            <History className="size-4.5 text-primary" />
            Trazabilidad, Versiones y Registro de Auditoría
          </h2>
          <p className="text-xs text-muted-foreground">
            Bitácora inmutable de cambios técnicos para el rol Administrador Técnico Autorizado.
          </p>
        </div>
        <Badge tone="neutral" appearance="soft" size="sm" className="gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>{eventos.length} registros auditados</span>
        </Badge>
      </div>

      <Table containerClassName="max-h-96">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs font-semibold text-foreground w-28">Versión</TableHead>
            <TableHead className="text-xs font-semibold text-foreground w-36">Fecha / Hora</TableHead>
            <TableHead className="text-xs font-semibold text-foreground w-40">Acción</TableHead>
            <TableHead className="text-xs font-semibold text-foreground w-28">Entorno</TableHead>
            <TableHead className="text-xs font-semibold text-foreground w-40">Estado</TableHead>
            <TableHead className="text-xs font-semibold text-foreground min-w-[200px]">Detalles Técnicos</TableHead>
            <TableHead className="text-xs font-semibold text-foreground w-36">Hash Criptográfico</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventos.map((evento) => (
            <TableRow key={evento.id} className="text-xs hover:bg-muted/40 transition-colors">
              <TableCell className="font-mono font-bold text-foreground">
                {evento.version}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {evento.fecha}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                <span className="inline-block px-2 py-0.5 rounded-md bg-muted/60 border border-border text-[11px]">
                  {evento.accion}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  tone={evento.entorno === "Producción" ? "primary" : "warning"}
                  appearance="soft"
                  size="sm"
                  className="text-[10px]"
                >
                  {evento.entorno}
                </Badge>
              </TableCell>
              <TableCell>
                <EstadoConfiguracionBadge estado={evento.estadoResultante} size="sm" />
              </TableCell>
              <TableCell className="text-muted-foreground leading-relaxed">
                <div className="space-y-0.5">
                  <p className="text-foreground font-medium">{evento.detalles}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <UserCheck className="size-3" />
                    {evento.actor}
                  </p>
                </div>
              </TableCell>
              <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                <div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded border border-border/60">
                  <Hash className="size-3 text-primary shrink-0" />
                  <span className="truncate max-w-[100px]">{evento.hashTransaccion.replace("SHA256:", "")}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
