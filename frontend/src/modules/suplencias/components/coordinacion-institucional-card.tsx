"use client";

import React from "react";
import {
  Building2,
  ShieldCheck,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  Info,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface CoordinacionInstitucionalCardProps {
  suplencia: SuplenciaInstitucional;
  isSuplente?: boolean;
  showBottomProgramar?: boolean;
  showBorder?: boolean;
  onOpenProgramar?: () => void;
  onCancelarProgramacion?: () => void;
}

export function CoordinacionInstitucionalCard({
  suplencia,
  isSuplente = false,
  showBottomProgramar = true,
  showBorder = true,
  onOpenProgramar,
  onCancelarProgramacion,
}: CoordinacionInstitucionalCardProps) {
  const { titular, suplente, estado, modalidad, fechaInicial, fechaFinal } = suplencia;

  const isTitularActivo = titular.estado === "ACTIVO";
  const isSuplenteActivo = suplente.estado === "ACTIVO";
  const isSuplenciaActiva = estado === "ACTIVA";

  // Mapeo semántico de estados de la suplencia
  const getBadgeEstadoSuplencia = () => {
    switch (estado) {
      case "SIN_SUPLENCIA":
        return (
          <Badge tone="neutral" appearance="soft" size="md" className="font-semibold text-xs">
            Sin suplencia activa
          </Badge>
        );
      case "PROGRAMADA":
        return (
          <Badge tone="primary" appearance="solid" size="md" className="font-bold text-xs gap-1.5 shadow-2xs">
            <Calendar className="size-3 shrink-0" />
            Inactividad programada
          </Badge>
        );
      case "ACTIVA":
        return (
          <Badge tone="warning" appearance="solid" size="md" className="font-bold text-xs gap-1.5 shadow-2xs">
            <span className="size-2 rounded-full bg-white animate-pulse" />
            Suplencia activa
          </Badge>
        );
      case "ACTIVACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="soft" size="md" className="font-semibold text-xs gap-1">
            <Clock className="size-3 shrink-0" />
            Activación pendiente
          </Badge>
        );
      case "FINALIZADA":
        return (
          <Badge tone="success" appearance="soft" size="md" className="font-semibold text-xs gap-1">
            <CheckCircle2 className="size-3 shrink-0" />
            Finalizada
          </Badge>
        );
      case "DESACTIVADA_ADMINISTRATIVAMENTE":
        return (
          <Badge tone="neutral" appearance="soft" size="md" className="font-semibold text-xs gap-1">
            <XCircle className="size-3 shrink-0" />
            Desactivada administrativamente
          </Badge>
        );
      case "DESPLAZADA_POR_SUPLENCIA_MANUAL":
        return (
          <Badge tone="danger" appearance="soft" size="md" className="font-semibold text-xs gap-1">
            <AlertTriangle className="size-3 shrink-0" />
            Desplazada por suplencia manual
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* ALERTA O CARD DESTACADO CUANDO EL SUPLENTE ESTÁ ACTIVO      */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isSuplente && isSuplenteActivo && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5 sm:p-6 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="size-3 rounded-full bg-warning animate-pulse shrink-0" />
            <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
              Suplencia activa
            </h3>
            <Badge tone="warning" appearance="solid" size="sm" className="font-bold">
              En funciones
            </Badge>
          </div>
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            Actualmente estás ejerciendo temporalmente las funciones de Coordinador SINARP.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-warning/20 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Periodo:</span>
              <strong className="text-foreground">
                {fechaInicial && fechaFinal ? `${fechaInicial} al ${fechaFinal}` : "Indefinido (Hasta desactivación)"}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Modalidad:</span>
              <strong className="text-foreground">{modalidad === "ADMINISTRATIVA" ? "Administrativa" : "Programada"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Titular sustituido:</span>
              <strong className="text-foreground">{titular.nombre}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Estado:</span>
              <strong className="text-warning-600 dark:text-warning-400">Activa</strong>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* MENSAJE INFORMATIVO PARA SUPLENTE CUANDO NO HAY SUPLENCIA   */}
      {/* ──────────────────────────────────────────────────────────── */}
      {isSuplente && !isSuplenteActivo && (
        <Alert variant="info" icon={<Info className="size-4" />}>
          <div className="space-y-1">
            <p className="font-semibold text-foreground text-xs sm:text-sm">
              Coordinación titular ordinaria en curso
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Actualmente permaneces enrolada como coordinadora suplente sin acceso institucional activo.
            </p>
          </div>
        </Alert>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* CARD PRINCIPAL: COORDINACIÓN INSTITUCIONAL                  */}
      {/* ──────────────────────────────────────────────────────────── */}
      <Card
        className={cn(
          "w-full bg-surface rounded-2xl overflow-hidden",
          showBorder ? "border border-border shadow-xs" : "border-0 shadow-none bg-transparent"
        )}
        innerClassName={cn(
          "w-full flex flex-col gap-6",
          showBorder ? "p-5 sm:p-7" : "p-0"
        )}
      >
        {/* Cabecera a todo el ancho */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-border/70 w-full">
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Coordinación institucional
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              {suplencia.institucion}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>RUC: <strong className="text-foreground">{suplencia.rucInstitucion}</strong></span>
              <span>·</span>
              <span>Estado coordinación: <strong className="text-foreground font-sans">{isSuplenciaActiva ? "En suplencia temporal" : "Ordinaria activa"}</strong></span>
            </div>
          </div>

          {/* Estado de suplencia y badge alineados a la derecha */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0 sm:ml-auto text-left sm:text-right">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Estado de suplencia
            </span>
            {getBadgeEstadoSuplencia()}
          </div>
        </div>

        {/* Grid: Titular vs Suplente (aprovecha todo el ancho disponible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          {/* Titular: Estilo Tarjeta de Capacidad UI Kit con Primary e Ícono */}
          <div
            className={cn(
              "capacity-card group/titular relative overflow-hidden p-5 sm:p-6 rounded-2xl border transition-all duration-300 space-y-4 w-full",
              isTitularActivo
                ? "bg-primary/5 border-primary/25 shadow-xs hover:border-primary/40 hover:shadow-md"
                : "bg-muted/30 border-border opacity-90"
            )}
            style={{
              '--card-accent': 'var(--color-primary-500)',
              '--card-glow': 'rgba(var(--primitive-primary-500), 0.18)',
            } as React.CSSProperties}
          >
            {/* Ícono decorativo en segundo plano */}
            <div className="absolute -bottom-6 -right-6 pointer-events-none select-none transition-transform duration-500 group-hover/titular:scale-105 opacity-10 text-primary">
              <ShieldCheck className="size-36" />
            </div>

            <div className="flex items-start justify-between gap-3 w-full relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-2xs",
                    isTitularActivo
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <ShieldCheck className="size-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block truncate">
                    Coordinador Titular
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-foreground font-heading truncate">
                    {titular.nombre}
                  </h3>
                </div>
              </div>

              {/* Badge del estado alineado a la derecha */}
              <Badge
                tone={isTitularActivo ? "success" : "warning"}
                appearance="soft"
                size="sm"
                className="font-bold text-[10px] shrink-0"
              >
                {isTitularActivo ? "Activo" : "Temporalmente inactivo"}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 font-sans relative z-10 pt-1">
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-foreground font-semibold">C.I. {titular.cedula}</span>
                <span>·</span>
                <span className="truncate">{titular.cargo}</span>
              </p>
              <p className="text-muted-foreground truncate">{titular.correo}</p>
            </div>

            {!isTitularActivo && (
              <div className="pt-2.5 border-t border-border/60 relative z-10">
                <p className="text-xs text-warning flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 shrink-0" />
                  <span>Acceso institucional en pausa durante la suplencia.</span>
                </p>
              </div>
            )}
          </div>

          {/* Suplente: Color Neutral */}
          <div
            className={cn(
              "capacity-card group/suplente relative overflow-hidden p-5 sm:p-6 rounded-2xl border transition-all duration-300 space-y-4 w-full",
              isSuplenteActivo
                ? "bg-warning/10 border-warning/30 shadow-xs hover:border-warning/50"
                : "bg-surface border-border hover:border-border/80 hover:shadow-xs"
            )}
            style={{
              '--card-accent': isSuplenteActivo ? 'var(--color-warning-500)' : 'var(--color-neutral-400)',
              '--card-glow': isSuplenteActivo ? 'rgba(var(--primitive-warning-500), 0.18)' : 'rgba(150, 150, 150, 0.12)',
            } as React.CSSProperties}
          >
            {/* Ícono decorativo en segundo plano en tono neutro */}
            <div className="absolute -bottom-6 -right-6 pointer-events-none select-none transition-transform duration-500 group-hover/suplente:scale-105 opacity-5 text-foreground">
              <Users className="size-36" />
            </div>

            <div className="flex items-start justify-between gap-3 w-full relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors shadow-2xs",
                    isSuplenteActivo
                      ? "bg-warning text-white"
                      : "bg-muted text-muted-foreground border border-border/60"
                  )}
                >
                  <Users className="size-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                    Coordinadora Suplente
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-foreground font-heading truncate">
                    {suplente.nombre}
                  </h3>
                </div>
              </div>

              {/* Badge del estado alineado a la derecha */}
              <Badge
                tone={isSuplenteActivo ? "success" : "neutral"}
                appearance="soft"
                size="sm"
                className="font-bold text-[10px] shrink-0"
              >
                {isSuplenteActivo ? "ACTIVA" : "Enrolada · Sin acceso"}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 font-sans relative z-10 pt-1">
              <p className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-foreground font-semibold">C.I. {suplente.cedula}</span>
                <span>·</span>
                <span className="truncate">{suplente.cargo}</span>
              </p>
              <p className="text-muted-foreground truncate">{suplente.correo}</p>
            </div>

            <div className="pt-2.5 border-t border-border/60 relative z-10">
              {isSuplenteActivo ? (
                <p className="text-xs text-success flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  <span>Ejerciendo temporalmente funciones de Coordinador SINARP.</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="size-3.5 shrink-0 text-muted-foreground/80" />
                  <span>Sin acceso operativo activo hasta que inicie una suplencia.</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────── */}
        {/* SECCIÓN: INACTIVIDAD PROGRAMADA                              */}
        {/* ──────────────────────────────────────────────────────────── */}
        {estado === "PROGRAMADA" && fechaInicial && fechaFinal && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="size-4 text-primary shrink-0" />
                  <span className="font-bold text-sm text-foreground">
                    Inactividad programada
                  </span>
                  <Badge tone="primary" appearance="soft" size="sm" className="text-[10px]">
                    Modalidad: Programada
                  </Badge>
                  <Badge tone="primary" appearance="solid" size="sm" className="text-[10px] font-bold">
                    {fechaInicial} al {fechaFinal}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span>Periodo: <strong className="text-foreground">{fechaInicial}</strong> al <strong className="text-foreground">{fechaFinal}</strong></span>
                  <span>·</span>
                  <span>Titular: <strong className="text-foreground">{titular.nombre}</strong></span>
                  <span>·</span>
                  <span>Suplente: <strong className="text-foreground">{suplente.nombre}</strong></span>
                </div>
              </div>

              {!isSuplente && onCancelarProgramacion && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelarProgramacion}
                  className="text-xs text-danger hover:bg-danger/10 self-start sm:self-center cursor-pointer"
                >
                  Cancelar programación
                </Button>
              )}
            </div>

            <div className="p-3.5 bg-surface/80 rounded-xl border border-border/80 text-xs space-y-1.5">
              <p className="text-foreground font-semibold flex items-center gap-1.5">
                <Info className="size-4 text-primary shrink-0" />
                <span>
                  Solo tras guardar la programación muestra «Inactividad programada» con fecha inicial ({fechaInicial}) y fecha final ({fechaFinal}).
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground pl-5 leading-relaxed">
                «Al iniciar el período se verificará de nuevo si el suplente puede habilitarse», sin prometer acceso futuro ni presentar la programación como activación inmediata. El coordinador suplente será validado y activado por el administrador al inicio del periodo programado.
              </p>
            </div>
          </div>
        )}

        {/* Pie de card con acción exclusiva para Titular Activo */}
        {!isSuplente && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" />
              <span>Última actualización: {suplencia.ultimaActualizacion}</span>
            </div>

            {showBottomProgramar && isTitularActivo && estado !== "PROGRAMADA" && onOpenProgramar && (
              <Button
                variant="primary"
                size="default"
                onClick={onOpenProgramar}
                className="font-semibold gap-2 shadow-sm cursor-pointer w-full sm:w-auto"
              >
                <Calendar className="size-5" />
                <span>Programar inactividad</span>
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
