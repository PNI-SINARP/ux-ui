"use client";

import React from "react";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface SimulacionAus03BannerProps {
  suplencia: SuplenciaInstitucional;
  onSimularInicioAUS03: () => void;
  onSimularFinAUS03: () => void;
  onResetearDemo: () => void;
}

export function SimulacionAus03Banner({
  suplencia,
  onSimularInicioAUS03,
  onSimularFinAUS03,
  onResetearDemo,
}: SimulacionAus03BannerProps) {
  const { estado, titular, suplente, modalidad } = suplencia;

  // Verificación estricta de la regla fundamental
  const ambosActivos = titular.estado === "ACTIVO" && suplente.estado === "ACTIVO";

  return (
    <div className="p-4 rounded-xl border border-border/80 bg-surface/90 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary shrink-0" />
          <span className="text-xs font-bold font-heading text-foreground uppercase tracking-wider">
            Simulador de comportamiento automático del Portal (AUS-03)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            tone={ambosActivos ? "danger" : "success"}
            appearance="soft"
            size="sm"
            className="text-[10px] font-bold gap-1"
          >
            {ambosActivos ? (
              <span>Conflicto de concurrencia detectado</span>
            ) : (
              <>
                <CheckCircle2 className="size-2.5" />
                <span>Regla de exclusión mutua validada</span>
              </>
            )}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetearDemo}
            className="text-[11px] text-muted-foreground hover:text-foreground h-6 px-2 gap-1"
            title="Reiniciar datos de prueba al estado inicial"
          >
            <RotateCcw className="size-3" />
            <span>Reiniciar demo</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
        {/* Flujo de Estados Actual */}
        <div className="flex items-center gap-2 flex-wrap text-muted-foreground font-mono text-[11px]">
          <span className="font-sans font-semibold text-foreground">Estado conmutado:</span>
          <span
            className={
              titular.estado === "ACTIVO"
                ? "text-success font-bold"
                : "text-muted-foreground line-through"
            }
          >
            Titular ({titular.estado})
          </span>
          <ArrowRight className="size-3 text-muted-foreground/60 shrink-0" />
          <span
            className={
              suplente.estado === "ACTIVO"
                ? "text-success font-bold"
                : "text-muted-foreground"
            }
          >
            Suplente ({suplente.estado})
          </span>
        </div>

        {/* Botones de simulación según el estado */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {estado === "PROGRAMADA" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSimularInicioAUS03}
              className="text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 h-7 px-3"
            >
              <Play className="size-3 fill-primary" />
              <span>Simular llegada de fecha inicial (Activar)</span>
            </Button>
          )}

          {estado === "ACTIVA" && modalidad === "PROGRAMADA" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSimularFinAUS03}
              className="text-xs gap-1.5 border-success/40 text-success hover:bg-success/10 h-7 px-3"
            >
              <CheckCircle2 className="size-3 text-success" />
              <span>Simular fin del período (Restituir titular)</span>
            </Button>
          )}

          {estado === "SIN_SUPLENCIA" && (
            <span className="text-[11px] text-muted-foreground italic">
              Programa un periodo de inactividad para habilitar las simulaciones de fecha.
            </span>
          )}

          {estado === "ACTIVA" && modalidad === "ADMINISTRATIVA" && (
            <span className="text-[11px] text-muted-foreground italic">
              Suplencia administrativa activa: Se finaliza exclusivamente mediante acción manual del Administrador.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
