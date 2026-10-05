"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Users,
  CheckCircle2,
  Info,
  Clock,
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

interface DesactivarSuplenciaAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional | null;
  onConfirm: (idInstitucion: string, motivo: string) => boolean;
}

export function DesactivarSuplenciaAdminDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: DesactivarSuplenciaAdminDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!suplencia) return null;

  const handleConfirmar = () => {
    setErrorValidacion(null);

    if (!motivo || motivo.trim().length < 5) {
      setErrorValidacion("El motivo de desactivación es obligatorio (mínimo 5 caracteres).");
      return;
    }

    setIsSubmitting(true);
    const exito = onConfirm(suplencia.idInstitucion, motivo);
    setIsSubmitting(false);

    if (exito) {
      setMotivo("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <RotateCcw className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Desactivar suplencia institucional
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Finaliza la suplencia en curso y restituye las facultades institucionales completas al coordinador titular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card Resumen de la Acción */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="size-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground">{suplencia.institucion}</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-secondary shrink-0" />
                <span className="text-muted-foreground">Suplente saliente:</span>
                <span className="font-semibold text-foreground truncate">{suplencia.suplente.nombre}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-success shrink-0" />
                <span className="text-muted-foreground">Titular a restituir:</span>
                <span className="font-semibold text-foreground truncate">{suplencia.titular.nombre}</span>
              </div>
            </div>
          </div>

          {/* Campo Motivo Obligatorio */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo-desactivacion" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>Motivo de desactivación</span>
              <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-desactivacion"
              placeholder="Indica el motivo de restitución del titular (ej. Reincorporación regular, superación de la contingencia, orden de máxima autoridad)..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorValidacion(null);
              }}
              className="text-xs font-sans min-h-24"
            />
            <p className="text-[11px] text-muted-foreground">
              Texto obligatorio que quedará registrado en la trazabilidad del evento.
            </p>
          </div>

          {/* Error de validación */}
          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Resumen del impacto tras confirmación */}
          <div className="p-3.5 bg-primary/5 rounded-xl border border-primary/20 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wide text-[10px]">
              <Info className="size-3.5 shrink-0" />
              <span>Consecuencias de esta acción</span>
            </div>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside text-xs leading-relaxed">
              <li>El acceso institucional del suplente ({suplencia.suplente.nombre}) será retirado inmediatamente.</li>
              <li>El acceso institucional del titular ({suplencia.titular.nombre}) será restaurado de inmediato.</li>
              <li>El estado de la suplencia pasará a <strong>Desactivada administrativamente</strong>.</li>
              <li>Se enviará notificación formal al Coordinador Titular y al Director de Gestión.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/70">
          <DialogClose asChild>
            <Button variant="ghost" size="default" className="text-xs">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            size="default"
            onClick={handleConfirmar}
            disabled={isSubmitting}
            className="text-xs font-semibold gap-1.5"
          >
            <CheckCircle2 className="size-4" />
            <span>Confirmar desactivación</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
