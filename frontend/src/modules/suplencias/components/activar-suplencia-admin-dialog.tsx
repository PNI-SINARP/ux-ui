"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Users,
  CheckCircle2,
  FileText,
  Clock,
  Info,
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

interface ActivarSuplenciaAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional | null;
  onConfirm: (idInstitucion: string, motivo: string) => boolean;
}

export function ActivarSuplenciaAdminDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: ActivarSuplenciaAdminDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!suplencia) return null;

  const handleConfirmar = () => {
    setErrorValidacion(null);

    if (!motivo || motivo.trim().length < 10) {
      setErrorValidacion("El motivo es obligatorio y debe tener al menos 10 caracteres (según norma PAR-07).");
      return;
    }

    if (!suplencia.suplente.enrolado) {
      setErrorValidacion("El suplente debe contar con Anexo B aprobado y estar enrolado en el sistema.");
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
          <div className="flex items-center gap-2 text-warning">
            <ShieldAlert className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Activar suplencia administrativamente (AUS-02)
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Activa la suplencia institucional cuando el coordinador titular no pueda realizar la programación preventiva.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card Resumen de Entidades */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2.5">
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="size-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground">{suplencia.institucion}</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground">Titular:</span>
                <span className="font-semibold text-foreground truncate">{suplencia.titular.nombre}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-secondary shrink-0" />
                <span className="text-muted-foreground">Suplente:</span>
                <span className="font-semibold text-foreground truncate">{suplencia.suplente.nombre}</span>
              </div>
            </div>
          </div>

          {/* Información de vigencia sin fecha final */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary shrink-0" />
            <span>
              <strong>Vigencia continua:</strong> La activación administrativa no requiere fecha final y permanecerá activa hasta que un Administrador la desactive manualmente.
            </span>
          </div>

          {/* Campo Motivo Obligatorio */}
          <div className="space-y-1.5">
            <Label htmlFor="motivo-activacion" className="text-xs font-semibold text-foreground flex items-center gap-1">
              <span>Motivo de activación administrativa</span>
              <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-activacion"
              placeholder="Indica la justificación o contingencia institucional (ej. Licencia de salud, comisión de servicios no programada, solicitud de máxima autoridad)..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorValidacion(null);
              }}
              className="text-xs font-sans min-h-24"
            />
            <p className="text-[11px] text-muted-foreground">
              Texto obligatorio auditable según criterio PAR-07 / TEC-00.
            </p>
          </div>

          {/* Error de validación */}
          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Advertencia obligatoria antes de confirmar */}
          <div className="p-3.5 bg-warning/10 rounded-xl border border-warning/30 space-y-2">
            <div className="flex items-center gap-2 text-warning-700 dark:text-warning-400 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Advertencia antes de confirmar</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed font-semibold">
              “Al activar la suplencia, el acceso institucional del coordinador titular será suspendido temporalmente y el coordinador suplente asumirá sus funciones.”
            </p>
            <p className="text-[11px] text-muted-foreground leading-normal pt-1 border-t border-warning/20">
              Regla fundamental: Ninguna institución puede tener al titular y al suplente activos simultáneamente.
            </p>
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
            className="text-xs font-semibold gap-1.5 bg-warning hover:bg-warning-600 text-white border-warning"
          >
            <CheckCircle2 className="size-4" />
            <span>Activar suplencia</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
