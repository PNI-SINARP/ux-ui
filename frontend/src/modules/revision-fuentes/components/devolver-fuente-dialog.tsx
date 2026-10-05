"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Send, Loader2 } from "lucide-react";
import { FuenteDatos } from "@/modules/fuentes/data/fuentes-data";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { toast } from "sonner";

interface DevolverFuenteDialogProps {
  fuente: FuenteDatos;
  revisorNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDevuelto?: () => void;
}

export function DevolverFuenteDialog({
  fuente,
  revisorNombre,
  open,
  onOpenChange,
  onDevuelto,
}: DevolverFuenteDialogProps) {
  const { devolverFuente } = useFuentesStore();
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = observaciones.trim().length >= 10;

  const handleDevolver = () => {
    if (!canSubmit) {
      toast.error("Observaciones requeridas", {
        description: "Debe ingresar una observación detallada explicando el motivo de la devolución (mínimo 10 caracteres).",
      });
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const res = devolverFuente(fuente.id, revisorNombre, observaciones.trim());
      setSubmitting(false);

      if (res.success) {
        toast.warning("Fuente devuelta con observaciones (FUE-04)", {
          description: `La fuente ${fuente.id} fue devuelta al Coordinador de ${fuente.institucion_proveedora_nombre} para su subsanación.`,
        });
        onOpenChange(false);
        onDevuelto?.();
      } else {
        toast.error("Error al devolver la fuente", {
          description: res.error,
        });
      }
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
            <DialogTitle className="font-heading text-base">
              Devolver fuente con observaciones
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Indique de manera clara y precisa las observaciones técnicas o normativas que el Coordinador debe corregir antes de reenviar la fuente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="obs-dev" className="text-xs font-semibold text-foreground">
              Detalle de observaciones y requerimientos de ajuste <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="obs-dev"
              rows={4}
              placeholder="Ej: Se requiere ajustar la regla de normalización del campo fecha y precisar el patrón de validación en los parámetros de consulta..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="text-xs"
            />
            <span className="text-[10px] text-muted-foreground block">
              Obligatorio conforme a PAR-07. Mínimo 10 caracteres.
            </span>
          </div>

          <div className="p-2.5 bg-warning/10 rounded-lg border border-warning/30 text-[11px] text-warning">
            El estado de la fuente cambiará a <strong>Devuelta</strong>. El Coordinador de la institución proveedora recibirá la notificación con sus observaciones para corregir y reenviar.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="warning"
            size="sm"
            onClick={handleDevolver}
            disabled={!canSubmit || submitting}
            className="gap-2 shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Devolviendo...
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Devolver fuente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
