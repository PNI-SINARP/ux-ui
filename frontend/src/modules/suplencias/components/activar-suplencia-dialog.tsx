"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Building2,
  UserCheck,
  Users,
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

interface ActivarSuplenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional;
  onConfirm: (motivo: string) => boolean;
}

export function ActivarSuplenciaDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: ActivarSuplenciaDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmar = () => {
    setErrorValidacion(null);

    if (!motivo || motivo.trim().length < 10) {
      setErrorValidacion("El motivo de activación es obligatorio (mínimo 10 caracteres según PAR-07).");
      return;
    }

    if (!suplencia.suplente.enrolado) {
      setErrorValidacion("El suplente debe estar debidamente enrolado en la institución.");
      return;
    }

    if (suplencia.suplente.estado === "SUSPENDIDO") {
      setErrorValidacion("El suplente no se encuentra habilitado para asumir funciones.");
      return;
    }

    setIsSubmitting(true);
    const exito = onConfirm(motivo);
    setIsSubmitting(false);

    if (exito) {
      setMotivo("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning">
            <ShieldAlert className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Activar suplencia
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Activa la suplencia de manera administrativa e inmediata ante imprevistos o imposibilidad de programación del titular.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Información institucional no editable */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-3">
            <div className="flex items-start gap-2.5">
              <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Institución
                </span>
                <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                  {suplencia.institucion}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  RUC: {suplencia.rucInstitucion}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-border/50 text-xs">
              <div className="flex items-start gap-2">
                <UserCheck className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                    Coordinador titular
                  </span>
                  <p className="font-semibold text-foreground truncate">{suplencia.titular.nombre}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{suplencia.titular.cedula}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="size-3.5 text-secondary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">
                    Coordinador suplente
                  </span>
                  <p className="font-semibold text-foreground truncate">{suplencia.suplente.nombre}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{suplencia.suplente.cedula}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campo: Motivo obligatorio (Sin solicitar fecha final) */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo-activacion" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>Motivo de activación</span>
              <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-activacion"
              rows={3}
              placeholder="Describa el motivo administrativo o justificación de fuerza mayor (ej. Licencia médica, comisión urgente sin registro previo)..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorValidacion(null);
              }}
              className="text-xs resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>La suplencia permanecerá activa hasta que sea desactivada manualmente.</span>
              <span>{motivo.length} caracteres</span>
            </div>
          </div>

          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Advertencia obligatoria de impacto */}
          <div className="p-3.5 bg-warning/10 rounded-xl border border-warning/30 space-y-1.5">
            <div className="flex items-center gap-1.5 text-warning font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Impacto institucional</span>
            </div>
            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
              “Al activar la suplencia, el acceso institucional del coordinador titular será suspendido temporalmente y el coordinador suplente asumirá sus funciones.”
            </p>
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
            <ShieldAlert className="size-5" />
            <span>Activar suplencia</span>
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
