"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  AlertTriangle,
  Building2,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface DesactivarSuplenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional;
  onConfirm: (motivoDesactivacion: string) => boolean;
}

export function DesactivarSuplenciaDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: DesactivarSuplenciaDialogProps) {
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmar = () => {
    setErrorValidacion(null);

    if (!motivoDesactivacion || motivoDesactivacion.trim().length < 5) {
      setErrorValidacion("El motivo de desactivación es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    const exito = onConfirm(motivoDesactivacion);
    setIsSubmitting(false);

    if (exito) {
      setMotivoDesactivacion("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <RotateCcw className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Desactivar suplencia
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Finaliza la suplencia administrativa, revoca el acceso del suplente y restaura el acceso institucional del coordinador titular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Resumen de coordinación */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground truncate">{suplencia.institucion}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/50">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Titular a restituir:
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {suplencia.titular.nombre}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                  Suplente en funciones:
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {suplencia.suplente.nombre}
                </span>
              </div>
            </div>
          </div>

          {/* Campo: Motivo de desactivación * */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo-desactivacion" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>Motivo de desactivación</span>
              <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-desactivacion"
              rows={3}
              placeholder="Indique el motivo por el cual se finaliza la suplencia (ej. Reincorporación del titular a sus funciones)..."
              value={motivoDesactivacion}
              onChange={(e) => {
                setMotivoDesactivacion(e.target.value);
                setErrorValidacion(null);
              }}
              className="text-xs resize-none"
            />
          </div>

          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Advertencia de confirmación */}
          <div className="p-3 bg-muted/50 rounded-xl border border-border/70 text-xs text-muted-foreground space-y-1">
            <span className="font-bold text-foreground block">Acciones inmediatas tras confirmar:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              <li>Retirar acceso institucional al coordinador suplente ({suplencia.suplente.nombre}).</li>
              <li>Restablecer acceso al coordinador titular ({suplencia.titular.nombre}).</li>
              <li>Actualizar el estado a Desactivada administrativamente y registrar en la trazabilidad.</li>
            </ul>
          </div>
        </div>

        <DialogFooter stacked className="flex flex-col gap-3 pt-4 border-t border-border/70 w-full">
          <Button
            variant="primary"
            size="default"
            onClick={handleConfirmar}
            disabled={isSubmitting}
            className="w-full h-11 font-semibold gap-2 shadow-sm cursor-pointer"
          >
            <RotateCcw className="size-5" />
            <span>Desactivar suplencia</span>
          </Button>
          <DialogClose asChild>
            <Button
              variant="neutral"
              size="default"
              className="w-full h-11 font-semibold cursor-pointer"
            >
              Cancelar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
