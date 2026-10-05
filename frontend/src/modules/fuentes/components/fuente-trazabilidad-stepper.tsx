"use client";

import React from "react";
import { EstadoFuente } from "../data/fuentes-data";
import { cn } from "@/lib/utils";
import {
  FileEdit,
  Sliders,
  Clock,
  CheckCircle2,
  Globe,
  AlertTriangle,
} from "lucide-react";

interface FuenteTrazabilidadStepperProps {
  estado: EstadoFuente;
  className?: string;
}

const ETAPAS: {
  key: EstadoFuente;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  { key: "BORRADOR", label: "Borrador", sublabel: "FUE-01", icon: FileEdit },
  { key: "CONFIGURACION", label: "Conexión", sublabel: "FUE-02", icon: Sliders },
  { key: "EN_REVISION", label: "En revisión", sublabel: "FUE-03/04", icon: Clock },
  { key: "APROBADA", label: "Aprobada", sublabel: "FUE-04", icon: CheckCircle2 },
  { key: "PUBLICADA", label: "Publicada", sublabel: "FUE-05", icon: Globe },
];

const ORDER: Record<EstadoFuente, number> = {
  BORRADOR: 0,
  CONFIGURACION: 1,
  EN_REVISION: 2,
  DEVUELTA: 2, // Se ubica en la etapa de revisión pero con estado de observación
  APROBADA: 3,
  PUBLICADA: 4,
};

export function FuenteTrazabilidadStepper({ estado, className }: FuenteTrazabilidadStepperProps) {
  const currentStep = ORDER[estado] ?? 0;
  const isDevuelta = estado === "DEVUELTA";

  return (
    <div className={cn("w-full py-4 px-4 bg-surface rounded-xl border border-border shadow-xs", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Trazabilidad del ciclo de vida (BN-06)
        </span>
        {isDevuelta ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning bg-warning/10 px-2.5 py-1 rounded-md border border-warning/30">
            <AlertTriangle className="size-3.5" />
            Devuelta con observaciones
          </span>
        ) : estado === "PUBLICADA" ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-md border border-success/30">
            <CheckCircle2 className="size-3.5" />
            Disponible en catálogo
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            Estado actual: <strong className="text-foreground">{estado.replace("_", " ")}</strong>
          </span>
        )}
      </div>

      <div className="relative">
        {/* Progress track */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border hidden sm:block -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500 hidden sm:block -z-0"
          style={{
            width: `calc(${(Math.min(currentStep, 4) / 4) * 100}% - 3rem)`,
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative z-10">
          {ETAPAS.map((etapa, idx) => {
            const Icon = etapa.icon;
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            const isEtapaDevuelta = isCurrent && isDevuelta;

            return (
              <div key={etapa.key} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center transition-all border-2 mb-2",
                    isEtapaDevuelta
                      ? "bg-warning text-white border-warning ring-4 ring-warning/20 shadow-xs"
                      : isCurrent
                      ? "bg-primary text-white border-primary ring-4 ring-primary/20 shadow-xs"
                      : isCompleted
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-muted-foreground border-border"
                  )}
                >
                  {isEtapaDevuelta ? (
                    <AlertTriangle className="size-4" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : (
                    <Icon className="size-4" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold leading-tight",
                    isEtapaDevuelta
                      ? "text-warning"
                      : isCurrent
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {isEtapaDevuelta ? "Devuelta" : etapa.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {etapa.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
