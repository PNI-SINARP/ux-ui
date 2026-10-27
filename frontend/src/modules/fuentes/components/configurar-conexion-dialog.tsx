"use client";

import React, { useState, useEffect } from "react";
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
import { Card } from "@/components/ui/card";
import {
  FuenteDatos,
  ConfiguracionConexion,
  EvidenciaPruebaConexion,
  HomologacionCaso,
} from "../data/fuentes-data";
import { FuenteStepperConexion } from "./fuente-stepper-conexion";
import { useFuentesStore } from "../data/fuentes-store";
import {
  Server,
  Plug,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface ConfigurarConexionDialogProps {
  fuente: FuenteDatos | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardado?: () => void;
  onProcederAEsquema?: (fuente: FuenteDatos) => void;
}

export function ConfigurarConexionDialog({
  fuente,
  open,
  onOpenChange,
  onGuardado,
  onProcederAEsquema,
}: ConfigurarConexionDialogProps) {
  const { actualizarFuente } = useFuentesStore();

  const [conexionLocal, setConexionLocal] = useState<ConfiguracionConexion | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (fuente) {
      setConexionLocal(JSON.parse(JSON.stringify(fuente.conexion)));
    } else {
      setConexionLocal(null);
    }
  }, [fuente, open]);

  if (!fuente || !conexionLocal) return null;

  const tienePruebaExitosa =
    conexionLocal.ultima_prueba?.resultado === "Satisfactoria";
  const tienePruebaFallida =
    conexionLocal.ultima_prueba?.resultado === "Fallida";

  const handlePruebaSatisfactoria = (evidencia: EvidenciaPruebaConexion) => {
    setConexionLocal((prev) => (prev ? { ...prev, ultima_prueba: evidencia } : prev));
  };

  const handleGuardarConfiguracion = (irAEsquema = false) => {
    if (!conexionLocal) return;

    setGuardando(true);
    const nuevoEstado: FuenteDatos["estado"] = tienePruebaExitosa
      ? "CONFIGURACION"
      : tienePruebaFallida
      ? "CONEXION_PENDIENTE"
      : fuente.estado;

    const eventoLog = {
      actor: "Coordinador SINARP",
      rol: "Coordinador SINARP",
      accion: tienePruebaExitosa
        ? "Conexión técnica probada y verificada exitosamente (FUE-02)"
        : tienePruebaFallida
        ? "Prueba de conexión técnica no superada (FUE-02)"
        : "Parámetros de conexión técnica actualizados (FUE-02)",
      observaciones: tienePruebaExitosa
        ? `Conector ${conexionLocal.tipo_conector} verificado. Latencia: ${conexionLocal.ultima_prueba?.latencia_ms}ms.`
        : `Parámetros de host y credenciales actualizados para ${fuente.nombre}.`,
    };

    setTimeout(() => {
      actualizarFuente(
        fuente.id,
        {
          conexion: conexionLocal,
          estado: nuevoEstado,
        },
        eventoLog
      );

      setGuardando(false);
      toast.success("Configuración de conexión guardada", {
        description: tienePruebaExitosa
          ? `Conexión con ${conexionLocal.tipo_conector} validada técnicamente.`
          : `Parámetros actualizados para ${fuente.nombre}.`,
      });

      if (onGuardado) onGuardado();
      onOpenChange(false);

      if (irAEsquema && onProcederAEsquema) {
        onProcederAEsquema({
          ...fuente,
          conexion: conexionLocal,
          estado: nuevoEstado,
        });
      }
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="5xl" className="w-[96vw] max-w-5xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5 shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Plug className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground">
                    Configurar y probar conexión de fuente
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Establece el tipo de conector, credenciales de lectura y verifica la conectividad técnica (VPN/SSL) hacia el origen de datos.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px] font-bold">
                HU: FUE-02
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                BPM: Paso 2 — Conexión técnica
              </Badge>
            </div>
          </div>

          {/* Ficha rápida de fuente en Card institucional con ícono */}
          <div className="bg-surface border border-border rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-3 flex-wrap mt-3">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Database className="size-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-xs">{fuente.nombre}</span>
                  <span className="text-muted-foreground font-mono text-[11px]">({fuente.id})</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{fuente.institucion_proveedora_nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  tienePruebaExitosa
                    ? "success"
                    : tienePruebaFallida
                    ? "danger"
                    : "warning"
                }
                appearance="soft"
                size="sm"
                className="text-[10px] font-semibold"
              >
                {tienePruebaExitosa
                  ? "Conexión Verificada"
                  : tienePruebaFallida
                  ? "Conexión Fallida"
                  : "Conexión Pendiente"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo con StepperConexion */}
        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-1">
          <FuenteStepperConexion
            conexion={conexionLocal}
            onChange={setConexionLocal}
            onPruebaSatisfactoria={handlePruebaSatisfactoria}
            nombreFuente={fuente.nombre}
            institucionNombre={fuente.institucion_proveedora_nombre}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {tienePruebaExitosa ? (
              <span className="text-success font-medium inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Prueba superada (Latencia: {conexionLocal.ultima_prueba?.latencia_ms}ms)
              </span>
            ) : tienePruebaFallida ? (
              <span className="text-danger font-medium inline-flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                La prueba técnica falló. Corrija host o credenciales.
              </span>
            ) : (
              <span>Ejecute la prueba técnica antes de avanzar a la definición del esquema.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleGuardarConfiguracion(false)}
              disabled={guardando}
              className="text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="size-3.5" />
              Guardar configuración
            </Button>

            {tienePruebaExitosa && onProcederAEsquema && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleGuardarConfiguracion(true)}
                disabled={guardando}
                className="text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Avanzar a Esquema (FUE-03)</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
