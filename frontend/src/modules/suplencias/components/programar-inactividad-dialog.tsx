"use client";

import React, { useState } from "react";
import {
  Calendar,
  AlertTriangle,
  Info,
  ShieldCheck,
  Users,
  CheckCircle2,
  CalendarDays,
  Clock,
  ArrowRight,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface ProgramarInactividadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional;
  onConfirm: (fechaInicial: string, fechaFinal: string) => boolean;
}

export function ProgramarInactividadDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: ProgramarInactividadDialogProps) {
  const [fechaInicial, setFechaInicial] = useState(suplencia.fechaInicial || "");
  const [fechaFinal, setFechaFinal] = useState(suplencia.fechaFinal || "");
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fecha mínima: hoy (en formato YYYY-MM-DD local Ecuador)
  const todayStr = new Date().toISOString().split("T")[0];

  const handleValidarYConfirmar = () => {
    setErrorValidacion(null);

    // Validación: Campos obligatorios
    if (!fechaInicial) {
      setErrorValidacion("La fecha inicial es obligatoria.");
      return;
    }
    if (!fechaFinal) {
      setErrorValidacion("La fecha final es obligatoria.");
      return;
    }

    // Validación: Rango temporal
    if (fechaInicial > fechaFinal) {
      setErrorValidacion("La fecha inicial no puede ser posterior a la fecha final.");
      return;
    }

    // Validación: Vigencia del titular
    if (suplencia.titular.estado !== "ACTIVO") {
      setErrorValidacion("El titular debe mantener rol y cuenta activa para programar su inactividad.");
      return;
    }

    // Validación: Existencia de suplente enrolado
    if (!suplencia.suplente.enrolado) {
      setErrorValidacion("Debe existir un coordinador suplente con Anexo B aprobado y enrolado.");
      return;
    }

    setIsSubmitting(true);
    const exito = onConfirm(fechaInicial, fechaFinal);
    setIsSubmitting(false);

    if (exito) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Programar inactividad del titular
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Define el rango de fechas en el que te ausentarás para delegar temporalmente tus funciones institucionales.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Card resumen de coordinación institucional */}
          <div className="p-3.5 bg-muted/30 rounded-xl border border-border/70 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wide">
                Institución
              </span>
              <span className="font-semibold text-foreground">{suplencia.institucion}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-border/50">
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

          {/* Formulario de Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fecha-inicial" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Fecha inicial</span>
                <span className="text-danger">*</span>
              </Label>
              <Input
                id="fecha-inicial"
                type="date"
                min={todayStr}
                value={fechaInicial}
                onChange={(e) => {
                  setFechaInicial(e.target.value);
                  setErrorValidacion(null);
                }}
                className="text-xs font-sans"
              />
              <span className="text-[11px] text-muted-foreground">Inicio de inactividad</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fecha-final" className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Fecha final</span>
                <span className="text-danger">*</span>
              </Label>
              <Input
                id="fecha-final"
                type="date"
                min={fechaInicial || todayStr}
                value={fechaFinal}
                onChange={(e) => {
                  setFechaFinal(e.target.value);
                  setErrorValidacion(null);
                }}
                className="text-xs font-sans"
              />
              <span className="text-[11px] text-muted-foreground">Fin de inactividad</span>
            </div>
          </div>

          {/* Error de validación visible */}
          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Resumen del impacto y advertencia formal requerida */}
          <div className="p-3.5 bg-warning/10 rounded-xl border border-warning/30 space-y-2">
            <div className="flex items-center gap-2 text-warning-700 dark:text-warning-400 font-bold text-xs uppercase tracking-wide">
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>Advertencia antes de confirmar</span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed font-medium">
              “Durante este periodo, <strong>{suplencia.suplente.nombre}</strong> asumirá temporalmente las funciones de Coordinador SINARP de la institución.”
            </p>
            <p className="text-[11px] text-muted-foreground leading-normal pt-1 border-t border-warning/20">
              Nota: Programar la inactividad no significa activar inmediatamente al suplente. Al llegar la fecha inicial el sistema verificará automáticamente las condiciones de acceso (AUS-03).
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
            onClick={handleValidarYConfirmar}
            disabled={isSubmitting}
            className="text-xs font-semibold gap-1.5"
          >
            <CheckCircle2 className="size-4" />
            <span>Confirmar programación</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
