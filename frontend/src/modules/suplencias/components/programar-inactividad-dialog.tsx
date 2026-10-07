"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Users,
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
import { DateField } from "@/components/ui/date-field";
import { Alert } from "@/components/ui/alert";
import type { SuplenciaInstitucional } from "../data/suplencias-store";

interface ProgramarInactividadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suplencia: SuplenciaInstitucional;
  onConfirm: (fechaInicial: string, fechaFinal: string) => boolean;
}

const parseDateString = (str?: string): Date | undefined => {
  if (!str) return undefined;
  const parts = str.split("-");
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
};

const formatDateToString = (d?: Date): string => {
  if (!d || isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function ProgramarInactividadDialog({
  open,
  onOpenChange,
  suplencia,
  onConfirm,
}: ProgramarInactividadDialogProps) {
  const [dateInicial, setDateInicial] = useState<Date | undefined>(() =>
    parseDateString(suplencia.fechaInicial)
  );
  const [dateFinal, setDateFinal] = useState<Date | undefined>(() =>
    parseDateString(suplencia.fechaFinal)
  );
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setDateInicial(parseDateString(suplencia.fechaInicial));
      setDateFinal(parseDateString(suplencia.fechaFinal));
      setErrorValidacion(null);
    }
  }, [open, suplencia.fechaInicial, suplencia.fechaFinal]);

  const handleValidarYConfirmar = () => {
    setErrorValidacion(null);

    // Validación: Campos obligatorios
    if (!dateInicial) {
      setErrorValidacion("La fecha inicial es obligatoria.");
      return;
    }
    if (!dateFinal) {
      setErrorValidacion("La fecha final es obligatoria.");
      return;
    }

    const fechaInicialStr = formatDateToString(dateInicial);
    const fechaFinalStr = formatDateToString(dateFinal);

    // Validación: Rango temporal
    if (fechaInicialStr > fechaFinalStr) {
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
      setErrorValidacion("Debe existir un coordinador suplente enrolado en la institución.");
      return;
    }

    // Validación: Suplente habilitado para asumir
    if (suplencia.suplente.estado === "SUSPENDIDO") {
      setErrorValidacion("El coordinador suplente debe estar habilitado para asumir la suplencia.");
      return;
    }

    setIsSubmitting(true);
    const exito = onConfirm(fechaInicialStr, fechaFinalStr);
    setIsSubmitting(false);

    if (exito) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="size-5" />
            <DialogTitle className="text-xl font-heading font-bold text-foreground">
              Programar inactividad
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Define el periodo durante el cual tu coordinador suplente asumirá temporalmente tus funciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Bloque informativo del suplente institucional asignado */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Suplente asignada
            </span>
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                <Users className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {suplencia.suplente.nombre}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  C.I. {suplencia.suplente.cedula} · Coordinadora Suplente
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de Fechas con componente DateField del UI Kit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DateField
              label="Fecha inicial"
              required
              placeholder="dd/mm/aaaa"
              helpText="Inicio del periodo"
              value={dateInicial}
              onChange={(d) => {
                setDateInicial(d);
                setErrorValidacion(null);
              }}
              state={errorValidacion && !dateInicial ? "error" : "default"}
            />

            <DateField
              label="Fecha final"
              required
              placeholder="dd/mm/aaaa"
              helpText="Fin del periodo"
              value={dateFinal}
              onChange={(d) => {
                setDateFinal(d);
                setErrorValidacion(null);
              }}
              state={errorValidacion && !dateFinal ? "error" : "default"}
            />
          </div>

          {/* Error de validación visible */}
          {errorValidacion && (
            <Alert variant="danger" icon={<AlertTriangle />}>
              <span className="text-xs font-medium">{errorValidacion}</span>
            </Alert>
          )}

          {/* Resumen del impacto y aviso de negocio */}
          <div className="p-3.5 bg-muted/50 rounded-xl border border-border/80 space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Solo tras guardar la programación se registrará como «Inactividad programada» con fecha inicial y final.
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  «Al iniciar el período se verificará de nuevo si el suplente puede habilitarse», sin prometer acceso futuro ni presentar la programación como activación inmediata. El suplente será activado por el administrador.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter stacked className="flex flex-col gap-3 pt-4 border-t border-border/70 w-full">
          <Button
            variant="primary"
            size="default"
            onClick={handleValidarYConfirmar}
            disabled={isSubmitting}
            className="w-full h-11 font-semibold gap-2 shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="size-5" />
            <span>Confirmar programación</span>
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
