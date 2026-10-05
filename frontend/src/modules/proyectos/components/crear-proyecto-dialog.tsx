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
  const [simularErrorRed, setSimularErrorRed] = useState(false);

  const resetForm = () => {
    setNombre("");
    setProposito("");
    setTouched({ nombre: false, proposito: false });
    setErrorMessage(null);
    setSimularErrorRed(false);
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

    // Simular validación de existencia y datos del Portal PNI-SINARP (BPMN: Validar existencia y datos -> Registrar proyecto)
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (simularErrorRed) {
      setIsSubmitting(false);
      setErrorMessage(
        "Error de comunicación simulado: No se pudo verificar la existencia del proyecto en el registro central. Intente nuevamente."
      );
      toast.error("Error al validar el proyecto con el Portal PNI-SINARP.");
      return;
    }

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
          <div className="flex items-center gap-2.5 mb-1">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FolderPlus className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-heading font-bold text-foreground">
                Crear proyecto institucional
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Flujo BN-05 · Proceso PRJ-01
              </p>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left">
            Registra un nuevo proyecto para la institución. Podrás asociar solicitudes de interoperabilidad de fuentes de datos autorizadas por el SINARP.
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
            <div className="relative">
              <Input
                type="text"
                value={institucionPrecargada}
                readOnly
                disabled
                className="bg-muted/50 cursor-not-allowed border-border/80 text-foreground font-medium pl-9 text-xs sm:text-sm"
              />
              <Building2 className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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

          {/* Nota de simulación técnica */}
          <div className="rounded-xl border border-info/30 bg-info/5 p-3 flex items-start gap-2.5">
            <Info className="size-4 text-info mt-0.5 shrink-0" />
            <div className="text-[11px] text-muted-foreground leading-relaxed flex-1">
              <span className="font-semibold text-foreground block">
                Regla institucional BN-05:
              </span>
              Una vez registrado, el ID del proyecto y la institución responsable quedan consolidados en el catálogo SINARP y no admiten cambios.
            </div>
          </div>

          {/* Switch de prueba para simular error */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={simularErrorRed}
                onChange={(e) => setSimularErrorRed(e.target.checked)}
                className="size-3.5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-[11px]">Simular error de validación en red</span>
            </label>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
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
            >
              {isSubmitting ? "Registrando proyecto..." : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
