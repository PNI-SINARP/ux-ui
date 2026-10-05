"use client";

import React from "react";
import {
  Building2,
  ShieldCheck,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface CoordinacionInstitucionalCardProps {
  suplencia: SuplenciaInstitucional;
  onOpenProgramar: () => void;
  onCancelarProgramacion: () => void;
  onSimularInicioAUS03?: () => void;
  onSimularFinAUS03?: () => void;
}

export function CoordinacionInstitucionalCard({
  suplencia,
  onOpenProgramar,
  onCancelarProgramacion,
  onSimularInicioAUS03,
  onSimularFinAUS03,
}: CoordinacionInstitucionalCardProps) {
  const { titular, suplente, estado, modalidad, fechaInicial, fechaFinal } = suplencia;

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
    <Card
      className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
      innerClassName="p-5 sm:p-7 flex flex-col gap-6"
    >
      {/* Cabecera de la Card */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5 border-b border-border/70">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Coordinación institucional
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {suplencia.institucion}
          </h2>
          <p className="text-xs text-muted-foreground font-mono">
            RUC: <span className="text-foreground font-semibold">{suplencia.rucInstitucion}</span>
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Estado de suplencia
          </span>
          {getBadgeEstadoSuplencia()}
        </div>
      </div>

      {/* Grid: Coordinador Titular vs Coordinador Suplente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Coordinador Titular */}
        <div
          className={cn(
            "p-4 sm:p-5 rounded-xl border transition-all space-y-3",
            titular.estado === "ACTIVO"
              ? "bg-primary/5 border-primary/20 shadow-2xs"
              : "bg-muted/40 border-border opacity-90"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                  titular.estado === "ACTIVO"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Coordinador Titular
                </span>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {titular.nombre}
                </h3>
              </div>
            </div>

            <Badge
              tone={titular.estado === "ACTIVO" ? "success" : "warning"}
              appearance="soft"
              size="sm"
              className="font-bold text-[10px]"
            >
              {titular.estado === "ACTIVO"
                ? "Titular activo"
                : titular.estado === "INACTIVO_TEMPORAL"
                ? "Inactivo temporalmente"
                : "Suspendido"}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 font-sans">
            <p className="flex items-center gap-1.5">
              <span className="font-mono text-foreground font-semibold">C.I. {titular.cedula}</span>
              <span>·</span>
              <span className="truncate">{titular.cargo}</span>
            </p>
            <p className="text-muted-foreground truncate">{titular.correo}</p>
          </div>

          {titular.estado === "INACTIVO_TEMPORAL" && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-warning flex items-center gap-1.5 font-medium">
                <Clock className="size-3.5 shrink-0" />
                <span>Acceso institucional en pausa durante la suplencia.</span>
              </p>
            </div>
          )}
        </div>

        {/* Coordinador Suplente */}
        <div
          className={cn(
            "p-4 sm:p-5 rounded-xl border transition-all space-y-3",
            suplente.estado === "ACTIVO"
              ? "bg-warning/10 border-warning/30 shadow-2xs"
              : "bg-surface border-border"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "size-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                  suplente.estado === "ACTIVO"
                    ? "bg-warning text-white"
                    : "bg-secondary/20 text-secondary"
                )}
              >
                <Users className="size-4.5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                  Coordinador Suplente
                </span>
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {suplente.nombre}
                </h3>
              </div>
            </div>

            <Badge
              tone={
                suplente.estado === "ACTIVO"
                  ? "success"
                  : suplente.enrolado
                  ? "neutral"
                  : "danger"
              }
              appearance="soft"
              size="sm"
              className="font-bold text-[10px]"
            >
              {suplente.estado === "ACTIVO"
                ? "Suplente activo"
                : suplente.enrolado
                ? "Enrolado sin acceso"
                : "No enrolado"}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 font-sans">
            <p className="flex items-center gap-1.5">
              <span className="font-mono text-foreground font-semibold">C.I. {suplente.cedula}</span>
              <span>·</span>
              <span className="truncate">{suplente.cargo}</span>
            </p>
            <p className="text-muted-foreground truncate">{suplente.correo}</p>
          </div>

          {suplente.estado === "ACTIVO" ? (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-success flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span>Asume temporalmente las funciones de Coordinador SINARP.</span>
              </p>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 shrink-0 text-muted-foreground/80" />
                <span>Sin acceso operativo activo hasta que se conmute la suplencia.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alerta de programación desplazada (si existió AUS-02 que solapó AUS-01) */}
      {suplencia.programacionPreviaDesplazada && (
        <Alert variant="warning" icon={<AlertTriangle />}>
          <div className="space-y-1">
            <p className="font-semibold text-foreground text-xs sm:text-sm">
              Programación previa desplazada por activación administrativa
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              La inactividad programada del{" "}
              <strong>{suplencia.programacionPreviaDesplazada.fechaInicial}</strong> al{" "}
              <strong>{suplencia.programacionPreviaDesplazada.fechaFinal}</strong> fue desplazada por una intervención
              administrativa de DINARP. No se reactivará automáticamente; deberás programar un nuevo periodo si lo requieres.
            </p>
          </div>
        </Alert>
      )}

      {/* Sección condicional según el estado de la suplencia */}
      {estado === "PROGRAMADA" && fechaInicial && fechaFinal && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span className="font-bold text-sm text-foreground">
                  Inactividad programada en curso
                </span>
                <Badge tone="primary" appearance="soft" size="sm" className="text-[10px]">
                  Modalidad: Programada (AUS-01)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Periodo establecido: <strong className="text-foreground">{fechaInicial}</strong> al{" "}
                <strong className="text-foreground">{fechaFinal}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelarProgramacion}
                className="text-xs text-danger hover:bg-danger/10"
              >
                Cancelar programación
              </Button>
            </div>
          </div>

          <div className="p-3 bg-surface/70 rounded-lg border border-border/80 text-xs text-muted-foreground space-y-1">
            <p className="text-foreground font-medium flex items-center gap-1.5">
              <Info className="size-3.5 text-primary shrink-0" />
              <span>
                Durante este periodo, <strong>{suplente.nombre}</strong> asumirá temporalmente las funciones de Coordinador SINARP.
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground pl-5">
              Al iniciar el período se verificará de nuevo si el suplente puede habilitarse (AUS-03).
            </p>
          </div>
        </div>
      )}

      {estado === "ACTIVA" && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-warning animate-pulse" />
            <h4 className="font-bold text-sm text-foreground">
              Suplencia institucional en curso ({modalidad === "ADMINISTRATIVA" ? "Activación Administrativa" : "Periodo Programado"})
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tu acceso como Coordinador Titular se encuentra suspendido de forma temporal para garantizar la regla de no concurrencia.{" "}
            <strong>{suplente.nombre}</strong> se encuentra actualmente operando con plenas facultades en el Portal.
          </p>
          {suplencia.motivo && (
            <div className="p-2.5 bg-surface rounded-md border border-border/70 text-xs text-foreground/90 font-sans">
              <span className="font-semibold text-muted-foreground">Motivo registrado:</span> {suplencia.motivo}
            </div>
          )}
        </div>
      )}

      {/* Barra de Acciones Principales */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" />
          <span>Última actualización de coordinación: {suplencia.ultimaActualizacion}</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end">
          {estado !== "ACTIVA" && estado !== "PROGRAMADA" && (
            <Button
              variant="primary"
              size="default"
              onClick={onOpenProgramar}
              className="text-xs font-semibold gap-2 shadow-sm cursor-pointer w-full sm:w-auto"
            >
              <Calendar className="size-4" />
              <span>Programar inactividad</span>
            </Button>
          )}

          {estado === "PROGRAMADA" && (
            <Button
              variant="outline"
              size="default"
              onClick={onOpenProgramar}
              className="text-xs font-semibold gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Calendar className="size-4 text-primary" />
              <span>Modificar fechas</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
