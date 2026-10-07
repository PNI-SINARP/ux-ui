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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FolderPlus,
  Building2,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";

interface CrearProyectoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institucionPrecargada: string;
  coordinadorNombre: string;
  onProyectoCreado?: (proyecto: ProyectoInstitucional) => void;
}

export function CrearProyectoDialog({
  open,
  onOpenChange,
  institucionPrecargada,
  coordinadorNombre,
  onProyectoCreado,
}: CrearProyectoDialogProps) {
  const { crearProyecto } = useProyectosStore();

  const [nombre, setNombre] = useState("");
  const [proposito, setProposito] = useState("");
  const [touched, setTouched] = useState({ nombre: false, proposito: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setNombre("");
    setProposito("");
    setTouched({ nombre: false, proposito: false });
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onOpenChange(false);
  };

  const nombreValido = nombre.trim().length >= 3;
  const propositoValido = proposito.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, proposito: true });
    setErrorMessage(null);

    if (!nombre.trim()) {
      setErrorMessage("El nombre del proyecto es obligatorio.");
      return;
    }
    if (nombre.trim().length < 3) {
      setErrorMessage("El nombre del proyecto debe contener al menos 3 caracteres.");
      return;
    }
    if (!proposito.trim()) {
      setErrorMessage("El propósito del proyecto es obligatorio.");
      return;
    }
    if (proposito.trim().length < 10) {
      setErrorMessage(
        "El propósito del proyecto debe contener al menos 10 caracteres que describan su finalidad."
      );
      return;
    }

    setIsSubmitting(true);

    // Simular validación de existencia y datos del Portal PNI-SINARP
    await new Promise((resolve) => setTimeout(resolve, 600));

    const resultado = crearProyecto({
      nombre: nombre.trim(),
      proposito: proposito.trim(),
      institucion: institucionPrecargada,
      creadoPor: coordinadorNombre,
    });

    setIsSubmitting(false);

    if (!resultado.success) {
      setErrorMessage(resultado.error || "Ocurrió un error al registrar el proyecto.");
      toast.error(resultado.error || "No se pudo registrar el proyecto institucional.");
      return;
    }

    if (resultado.data) {
      toast.success(
        `Proyecto ${resultado.data.id} registrado exitosamente para ${institucionPrecargada}.`
      );
      onProyectoCreado?.(resultado.data);
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between w-full gap-3 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <FolderPlus className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-heading font-bold text-foreground">
                  Crear proyecto institucional
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Registro de nuevo proyecto para interoperabilidad
                </p>
              </div>
            </div>
            <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-xs shrink-0">
              Nuevo
            </Badge>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left">
            Registra una nueva iniciativa para tu institución. Luego podrás vincular las solicitudes de datos necesarias para llevarla a cabo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="Error de validación">
              {errorMessage}
            </Alert>
          )}

          {/* Campo 1: Institución Responsable (Precargada y en Solo Lectura) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-primary" />
                Institución responsable
              </Label>
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                <Lock className="size-3 text-muted-foreground/70" />
                Solo lectura · Precargada
              </span>
            </div>
            <div
              className="relative cursor-not-allowed group"
              onClick={() => {
                toast.info("Esta información no se puede cambiar: la entidad se asigna automáticamente según tu usuario.");
              }}
              title="Este campo es de solo lectura y no se puede modificar"
            >
              <Input
                type="text"
                value={institucionPrecargada}
                readOnly
                tabIndex={-1}
                className="bg-muted/50 cursor-not-allowed border-border/80 text-foreground font-medium pl-9 text-xs sm:text-sm pointer-events-none select-none"
              />
              <Building2 className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Lock className="size-3.5" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              La institución responsable es asignada automáticamente por el Portal según la entidad del Coordinador Institucional autenticado.
            </p>
          </div>

          {/* Campo 2: Nombre del Proyecto */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="nombre-proyecto" className="text-xs font-semibold text-foreground">
                Nombre del proyecto <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {nombre.length}/150
              </span>
            </div>
            <Input
              id="nombre-proyecto"
              type="text"
              placeholder="Ej. Sistema Único de Registro y Matrícula Estudiantil"
              value={nombre}
              maxLength={150}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, nombre: true }))}
              className={`text-xs sm:text-sm ${
                touched.nombre && !nombreValido ? "border-danger ring-1 ring-danger/30" : ""
              }`}
              disabled={isSubmitting}
              autoFocus
            />
            {touched.nombre && !nombreValido && (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1">
                <AlertCircle className="size-3 shrink-0" />
                El nombre debe contener al menos 3 caracteres.
              </p>
            )}
          </div>

          {/* Campo 3: Propósito */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="proposito-proyecto" className="text-xs font-semibold text-foreground">
                Propósito del proyecto <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {proposito.length}/500
              </span>
            </div>
            <Textarea
              id="proposito-proyecto"
              rows={4}
              placeholder="Describe detalladamente el objetivo institucional y la justificación para consumir datos públicos interoperables a través del SINARP..."
              value={proposito}
              maxLength={500}
              onChange={(e) => {
                setProposito(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, proposito: true }))}
              appearance="default"
              state={touched.proposito && !propositoValido ? "error" : "default"}
              disabled={isSubmitting}
            />
            {touched.proposito && !propositoValido ? (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1">
                <AlertCircle className="size-3 shrink-0" />
                El propósito debe contener al menos 10 caracteres descriptivos.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-tight">
                Indica la finalidad para la cual la institución requiere agrupar solicitudes de interoperabilidad de fuentes de datos.
              </p>
            )}
          </div>

          {/* Nota institucional */}
          <div className="rounded-xl border border-info/30 bg-info/5 p-3 flex items-start gap-2.5">
            <Info className="size-4 text-info mt-0.5 shrink-0" />
            <div className="text-[11px] text-muted-foreground leading-relaxed flex-1">
              <span className="font-semibold text-foreground block">
                Toma en cuenta:
              </span>
              Una vez creado el proyecto, su código y la institución responsable no podrán modificarse.
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-3 w-full">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )
              }
              className="cursor-pointer"
            >
              {isSubmitting ? "Registrando proyecto..." : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
