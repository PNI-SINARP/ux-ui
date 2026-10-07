"use client";

import React from "react";
import {
  History,
  Building,
  User,
  Shield,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  SuplenciaInstitucional,
  EstadoSuplencia,
} from "../data/suplencias-store";
import { SuplenciaTimeline } from "./suplencia-timeline";

interface TrazabilidadSuplenciaDialogProps {
  suplencia: SuplenciaInstitucional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrazabilidadSuplenciaDialog({
  suplencia,
  open,
  onOpenChange,
}: TrazabilidadSuplenciaDialogProps) {
  if (!suplencia) return null;

  const renderBadgeEstado = (estado: EstadoSuplencia) => {
    switch (estado) {
      case "SIN_SUPLENCIA":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-xs">
            Sin suplencia
          </Badge>
        );
      case "PROGRAMADA":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <Calendar className="size-3" />
            Programada
          </Badge>
        );
      case "ACTIVA":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-xs gap-1.5">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Activa
          </Badge>
        );
      case "ACTIVACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <Clock className="size-3" />
            Activación pendiente
          </Badge>
        );
      case "FINALIZADA":
        return (
          <Badge tone="neutral" appearance="outline" size="sm" className="font-medium text-xs gap-1">
            <CheckCircle2 className="size-3" />
            Finalizada
          </Badge>
        );
      case "DESACTIVADA_ADMINISTRATIVAMENTE":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <XCircle className="size-3" />
            Desactivada adm.
          </Badge>
        );
      case "DESPLAZADA_POR_SUPLENCIA_MANUAL":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <AlertTriangle className="size-3" />
            Desplazada por adm.
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="standard"
        size="3xl"
        className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
        showCloseButton={true}
      >
        {/* Cabecera del Diálogo */}
        <DialogHeader className="gap-2 text-left items-start pb-2 border-b border-border/60 shrink-0">
          <div className="flex items-start justify-between w-full gap-4 pr-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary shrink-0">
                <History className="size-6 text-primary stroke-[2.2px]" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
                  Trazabilidad de la coordinación
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Registro cronológico e inalterable de suplencias, inactividades y delegaciones institucionales.
                </DialogDescription>
              </div>
            </div>

            {/* Badge de Estado actual */}
            <div className="shrink-0 pt-0.5">
              {renderBadgeEstado(suplencia.estado)}
            </div>
          </div>
        </DialogHeader>

        {/* Resumen Organizado de la Coordinación */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border text-xs shrink-0">
          {/* Institución */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
              <Building className="size-3.5" />
              <span>Institución</span>
            </div>
            <p className="font-bold text-foreground text-xs sm:text-sm truncate">
              {suplencia.institucion}
            </p>
            <p className="font-mono text-[11px] text-muted-foreground">
              RUC: {suplencia.rucInstitucion}
            </p>
          </div>

          {/* Modalidad y Periodo */}
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
              <Shield className="size-3.5" />
              <span>Régimen operativo</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground text-xs">
                {suplencia.modalidad === "PROGRAMADA"
                  ? "Programada por titular"
                  : suplencia.modalidad === "ADMINISTRATIVA"
                  ? "Activación administrativa"
                  : "Operación titular ordinaria"}
              </span>
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">
              {suplencia.fechaInicial && suplencia.fechaFinal
                ? `${suplencia.fechaInicial} al ${suplencia.fechaFinal}`
                : suplencia.modalidad === "ADMINISTRATIVA" && suplencia.estado === "ACTIVA"
                ? "Vigente hasta desactivación manual"
                : "Sin periodo de inactividad vigente"}
            </p>
          </div>

          {/* Coordinador Titular */}
          <div className="min-w-0 space-y-0.5 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
              <User className="size-3.5" />
              <span>Coordinador Titular</span>
            </div>
            <p className="font-semibold text-foreground text-xs truncate">
              {suplencia.titular.nombre}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span>C.I. {suplencia.titular.cedula}</span>
              {suplencia.titular.estado === "ACTIVO" ? (
                <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                  Activo
                </Badge>
              ) : (
                <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                  Inactivo
                </Badge>
              )}
            </div>
          </div>

          {/* Coordinador Suplente */}
          <div className="min-w-0 space-y-0.5 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
              <Shield className="size-3.5" />
              <span>Coordinador Suplente</span>
            </div>
            <p className="font-semibold text-foreground text-xs truncate">
              {suplencia.suplente.nombre}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
              <span>C.I. {suplencia.suplente.cedula}</span>
              {suplencia.suplente.estado === "ACTIVO" ? (
                <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                  Activo
                </Badge>
              ) : (
                <Badge tone="neutral" appearance="soft" size="sm" className="font-medium text-[10px] px-1.5 py-0 h-4">
                  Enrolada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Sección del Timeline en Contenedor con Scroll */}
        <div className="space-y-2 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground shrink-0 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              Historial de eventos ({suplencia.trazabilidad.length})
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              Inalterable
            </span>
          </div>

          <div className="p-4 sm:p-5 bg-surface rounded-2xl border border-border overflow-y-auto flex-1 min-h-[220px] max-h-[46vh] shadow-2xs">
            <SuplenciaTimeline
              eventos={suplencia.trazabilidad}
              showHeader={false}
            />
          </div>
        </div>

        {/* Pie de la Modal */}
        <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-between sm:justify-between w-full shrink-0">
          <p className="text-[11px] text-muted-foreground">
            Última actualización: <span className="font-mono font-medium text-foreground">{suplencia.ultimaActualizacion}</span>
          </p>
          <Button
            variant="neutral"
            size="default"
            onClick={() => onOpenChange(false)}
            className="text-xs h-10 px-6 cursor-pointer font-semibold"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
