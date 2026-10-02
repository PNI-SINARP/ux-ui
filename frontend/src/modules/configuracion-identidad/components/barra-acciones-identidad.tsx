"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Save,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Bug,
} from "lucide-react";
import { ConfiguracionIdentidad } from "../data/types";
import { detectarDatosPruebaEnProduccion } from "../data/mock-data";
import { cn } from "@/lib/utils";

interface BarraAccionesIdentidadProps {
  configuracion: ConfiguracionIdentidad;
  isTesting: boolean;
  onGuardarBorrador: () => void;
  onProbarConfiguracion: (forzarFallo?: boolean) => void;
  onActivar: () => void;
  onRestaurarActivaPrevia: () => void;
}

export function BarraAccionesIdentidad({
  configuracion,
  isTesting,
  onGuardarBorrador,
  onProbarConfiguracion,
  onActivar,
  onRestaurarActivaPrevia,
}: BarraAccionesIdentidadProps) {
  const [simularFallo, setSimularFallo] = useState(false);

  const hayIncompatibilidad = detectarDatosPruebaEnProduccion(
    configuracion.proyectoId,
    configuracion.entorno
  );

  // La activación exige estrictamente haber superado la prueba técnica y estar en estado pendiente de prueba
  const puedeActivar =
    configuracion.pruebaSuperada &&
    configuracion.estado === "Pendiente de prueba" &&
    !hayIncompatibilidad &&
    !isTesting;

  const getTooltipActivar = () => {
    if (hayIncompatibilidad) {
      return "Configuración no activa; corrige la incompatibilidad de entorno antes de probar y activar.";
    }
    if (!configuracion.pruebaSuperada || configuracion.estado !== "Pendiente de prueba") {
      return "Configuración no activa; revisa la prueba técnica antes de proceder con la activación.";
    }
    return "La prueba técnica fue satisfactoria. Listo para activar en el cluster de identidad.";
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Información y estado de validación */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground">Acciones de Despliegue</span>
            <span className="text-muted-foreground/40">•</span>
            {configuracion.pruebaSuperada ? (
              <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                <CheckCircle2 className="size-3" />
                <span>Prueba técnica aprobada</span>
              </Badge>
            ) : (
              <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                <AlertTriangle className="size-3" />
                <span>Requiere prueba previa</span>
              </Badge>
            )}

            {configuracion.estado === "Activa" && (
              <Badge tone="primary" appearance="solid" size="sm" className="gap-1">
                <ShieldCheck className="size-3" />
                <span>Operando en tiempo real</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {configuracion.estado === "Activa"
              ? "La configuración actual se encuentra activa en el servicio de identidad."
              : puedeActivar
              ? "Prueba técnica completada con éxito. Presione 'Activar' para aplicar."
              : "Guarde un borrador o ejecute la prueba técnica para habilitar la activación."}
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Opción de simulación técnica para pruebas de laboratorio */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSimularFallo(!simularFallo)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-colors",
                    simularFallo
                      ? "border-danger text-danger bg-danger/10"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                  aria-label="Simular fallo de prueba o sincronización"
                >
                  <Bug className="size-3.5" />
                  <span>{simularFallo ? "Fallo forzado activo" : "Simular fallo"}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                Activa una falla en la prueba/sincronización para comprobar la regla de rollback y preservación del estado previo activo.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 1. Guardar Borrador */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onGuardarBorrador}
            disabled={isTesting}
            leftIcon={<Save className="size-3.5" />}
          >
            Guardar borrador
          </Button>

          {/* 2. Probar Configuración */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onProbarConfiguracion(simularFallo)}
            disabled={isTesting || hayIncompatibilidad}
            leftIcon={
              isTesting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )
            }
          >
            {isTesting ? "Comprobando..." : "Probar configuración"}
          </Button>

          {/* 3. Activar */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    variant="success"
                    size="sm"
                    onClick={onActivar}
                    disabled={!puedeActivar}
                    leftIcon={<CheckCircle2 className="size-3.5" />}
                  >
                    Activar
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {getTooltipActivar()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Indicador de Fallida con opción de Restauración Inmediata */}
      {configuracion.estado === "Fallida" && (
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-danger font-medium">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="size-4 shrink-0" />
            La última prueba no fue superada. Se mantiene la configuración anterior para garantizar la continuidad del servicio.
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRestaurarActivaPrevia}
            className="text-xs text-danger hover:bg-danger/10 hover:text-danger h-8 px-3"
            leftIcon={<RotateCcw className="size-3" />}
          >
            Restaurar activa previa
          </Button>
        </div>
      )}
    </div>
  );
}
