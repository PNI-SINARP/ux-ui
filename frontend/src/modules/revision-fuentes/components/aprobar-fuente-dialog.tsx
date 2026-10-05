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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { FuenteDatos } from "@/modules/fuentes/data/fuentes-data";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { toast } from "sonner";

interface AprobarFuenteDialogProps {
  fuente: FuenteDatos;
  revisorNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAprobado?: () => void;
}

export function AprobarFuenteDialog({
  fuente,
  revisorNombre,
  open,
  onOpenChange,
  onAprobado,
}: AprobarFuenteDialogProps) {
  const { aprobarFuente } = useFuentesStore();
  const [observaciones, setObservaciones] = useState(
    "Fuente técnica validada y campos clasificados de conformidad con las políticas de interoperabilidad y normativa de protección de datos personales."
  );
  const [submitting, setSubmitting] = useState(false);

  const camposIncluidos = fuente.campos.filter((c) => c.incluido);
  const camposSinClasificar = camposIncluidos.filter(
    (c) => !c.clasificacion || (c.clasificacion !== "Accesible" && c.clasificacion !== "Confidencial")
  );

  const canApprove = camposSinClasificar.length === 0;

  const handleAprobar = () => {
    if (!canApprove) return;
    setSubmitting(true);

    setTimeout(() => {
      const res = aprobarFuente(fuente.id, revisorNombre, observaciones);
      setSubmitting(false);

      if (res.success) {
        toast.success("Fuente aprobada por Gestión (FUE-04)", {
          description: `La fuente ${fuente.id} fue aprobada. Ahora el Coordinador Institucional puede publicarla en el catálogo.`,
        });
        onOpenChange(false);
        onAprobado?.();
      } else {
        toast.error("Error al aprobar la fuente", {
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
            <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <DialogTitle className="font-heading text-base">
              Aprobar fuente y validar campos
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Conforme a FUE-04, la aprobación valida que la fuente cumple con los criterios técnicos y que todos los campos han sido debidamente clasificados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {/* Validación de campos */}
          {!canApprove ? (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger flex items-start gap-2.5">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Aprobación bloqueada:</strong>
                <span>
                  Existen {camposSinClasificar.length} campo(s) sin clasificar. Debe asignar obligatoriamente la clasificación (Accesible o Confidencial) a todos los campos antes de aprobar.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success flex items-start gap-2.5">
              <ShieldCheck className="size-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Validación completa:</strong>
                <span>
                  Los {camposIncluidos.length} campos expuestos han sido clasificados correctamente.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="obs-aprob" className="text-xs font-medium text-foreground">
              Comentarios o fundamento de aprobación
            </Label>
            <Textarea
              id="obs-aprob"
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="p-2.5 bg-muted/20 rounded-lg border border-border text-[11px] text-muted-foreground">
            Al confirmar, el estado pasará a <strong>Aprobada</strong>. La publicación final corresponderá al Coordinador de la institución proveedora (FUE-05).
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
            variant="primary"
            size="sm"
            onClick={handleAprobar}
            disabled={!canApprove || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Aprobando...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3.5" />
                Confirmar aprobación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
