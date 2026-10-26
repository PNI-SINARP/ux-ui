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
  CampoFuente,
} from "../data/fuentes-data";
import { FuenteStepperEsquema } from "./fuente-stepper-esquema";
import { useFuentesStore } from "../data/fuentes-store";
import {
  Layers,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface DefinirEsquemaDialogProps {
  fuente: FuenteDatos | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGuardado?: () => void;
  onEnviarARevision?: (fuenteId: string) => void;
}

export function DefinirEsquemaDialog({
  fuente,
  open,
  onOpenChange,
  onGuardado,
  onEnviarARevision,
}: DefinirEsquemaDialogProps) {
  const { actualizarFuente } = useFuentesStore();

  const [camposLocales, setCamposLocales] = useState<CampoFuente[]>([]);
  const [tieneIncompatibilidades, setTieneIncompatibilidades] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (fuente) {
      setCamposLocales(JSON.parse(JSON.stringify(fuente.campos || [])));
    } else {
      setCamposLocales([]);
    }
  }, [fuente, open]);

  if (!fuente) return null;

  const camposVisibles = camposLocales.length;
  const puedeEnviar = camposVisibles > 0 && !tieneIncompatibilidades;

  const handleGuardarEsquema = (enviarRevision = false) => {
    if (camposLocales.length === 0) {
      toast.error("Debe definir al menos un campo en el esquema");
      return;
    }

    if (enviarRevision && tieneIncompatibilidades) {
      toast.error("Hay incompatibilidades en las reglas de conversión", {
        description: "Corrija los tipos y reglas señalados antes de enviar a revisión de Gestión.",
      });
      return;
    }

    setGuardando(true);
    const nuevoEstado = enviarRevision ? "EN_REVISION" : fuente.estado;
    const eventoLog = {
      actor: "Coordinador SINARP",
      rol: "Coordinador SINARP",
      accion: enviarRevision
        ? "Envío a revisión de Gestión (FUE-04)"
        : "Esquema y reglas de normalización actualizados (FUE-03)",
      observaciones: enviarRevision
        ? "Esquema y normalización finalizados. Enviado formalmente a revisión de Gestión (FUE-04)."
        : `${camposLocales.length} campos y reglas de normalización guardados.`,
    };

    setTimeout(() => {
      actualizarFuente(
        fuente.id,
        {
          campos: camposLocales,
          estado: nuevoEstado,
        },
        eventoLog
      );

      setGuardando(false);

      if (enviarRevision) {
        toast.success("Fuente enviada a revisión de Gestión", {
          description: `El expediente de ${fuente.nombre} pasó a estado EN REVISIÓN.`,
        });
        if (onEnviarARevision) onEnviarARevision(fuente.id);
      } else {
        toast.success("Esquema guardado exitosamente", {
          description: `${camposLocales.length} campos y reglas de normalización guardados para ${fuente.nombre}.`,
        });
        if (onGuardado) onGuardado();
      }

      onOpenChange(false);
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-5xl max-h-[92vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1.5 shrink-0 border-b border-border pb-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Layers className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-heading font-bold text-lg text-foreground">
                  FUE-03 — Definir esquema y normalización de fuente
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Mapea los atributos de origen, define los tipos canónicos de interoperabilidad y valida la coherencia de las reglas de conversión.
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px] font-bold">
                HU: FUE-03
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                BPM: Paso 3 — Mapeo y Normalización
              </Badge>
            </div>
          </div>

          {/* Ficha rápida de fuente */}
          <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{fuente.nombre}</span>
              <span className="text-muted-foreground font-mono">({fuente.id})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                Conector: {fuente.conexion.tipo_conector} ({fuente.conexion.host}:{fuente.conexion.puerto})
              </span>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                {camposVisibles} campos configurados
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Cuerpo con StepperEsquema */}
        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0 pr-1">
          <FuenteStepperEsquema
            campos={camposLocales}
            onChange={setCamposLocales}
            onHasIncompatibilitiesChange={setTieneIncompatibilidades}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="shrink-0 border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {tieneIncompatibilidades ? (
              <span className="text-danger font-medium inline-flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                Incompatibilidad en reglas de conversión detectada.
              </span>
            ) : camposVisibles === 0 ? (
              <span className="text-warning font-medium inline-flex items-center gap-1.5">
                <AlertTriangle className="size-4" />
                Agregue al menos un campo para completar el contrato de interoperabilidad.
              </span>
            ) : (
              <span className="text-success font-medium inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-4" />
                Esquema canónico consistente y listo para revisión técnica.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleGuardarEsquema(false)}
              disabled={guardando}
              className="gap-1.5"
            >
              <Save className="size-3.5" />
              Guardar borrador
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleGuardarEsquema(true)}
              disabled={guardando || !puedeEnviar}
              className="gap-1.5"
            >
              <Send className="size-3.5" />
              <span>Enviar a revisión (FUE-04)</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
