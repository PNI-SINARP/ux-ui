"use client";

import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Pencil,
  Building2,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldCheck,
  FolderKanban,
} from "lucide-react";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";

interface EditarProyectoDialogProps {
  proyecto: ProyectoInstitucional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordinadorNombre: string;
  onProyectoActualizado?: (proyecto: ProyectoInstitucional) => void;
}

export function EditarProyectoDialog({
  proyecto,
  open,
  onOpenChange,
  coordinadorNombre,
  onProyectoActualizado,
}: EditarProyectoDialogProps) {
  const { actualizarProyecto } = useProyectosStore();

  const [nombre, setNombre] = useState("");
  const [proposito, setProposito] = useState("");
  const [motivo, setMotivo] = useState("");
  const [touched, setTouched] = useState({ nombre: false, proposito: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (proyecto && open) {
      setNombre(proyecto.nombre);
      setProposito(proyecto.proposito);
      setMotivo("");
      setTouched({ nombre: false, proposito: false });
      setErrorMessage(null);
    }
  }, [proyecto, open]);

  if (!proyecto) return null;

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  const cantSolicitudes = proyecto.solicitudes ? proyecto.solicitudes.length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ nombre: true, proposito: true });
    setErrorMessage(null);

    const nombreTrim = nombre.trim();
    const propositoTrim = proposito.trim();

    if (!nombreTrim) {
      setErrorMessage("El nombre del proyecto es obligatorio.");
      return;
    }
    if (nombreTrim.length < 3) {
      setErrorMessage("El nombre debe contener al menos 3 caracteres.");
      return;
    }
    if (!propositoTrim) {
      setErrorMessage("El propósito del proyecto es obligatorio.");
      return;
    }
    if (propositoTrim.length < 10) {
      setErrorMessage(
        "El propósito debe contener al menos 10 caracteres que describan su finalidad."
      );
      return;
    }

    // Verificar si hubo cambios
    if (
      nombreTrim === proyecto.nombre.trim() &&
      propositoTrim === proyecto.proposito.trim()
    ) {
      toast.info("No se realizaron modificaciones en el nombre ni propósito del proyecto.");
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const res = actualizarProyecto(proyecto.id, {
      nombre: nombreTrim,
      proposito: propositoTrim,
      modificadoPor: coordinadorNombre,
      motivo: motivo.trim() || "Actualización de metadatos descriptivos",
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "No se pudo actualizar el proyecto.");
      toast.error(res.error || "Error al actualizar los datos del proyecto.");
      return;
    }

    if (res.data) {
      toast.success(
        `Proyecto actualizado exitosamente. Versión v${res.data.version}.0 registrada en la trazabilidad e historial.`
      );
      onProyectoActualizado?.(res.data);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="lg" className="sm:max-w-[620px] p-6 sm:p-7">
        <DialogHeader className="space-y-2 pb-2">
          <div className="flex items-start justify-between w-full gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Pencil className="size-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <DialogTitle className="text-lg font-heading font-bold text-foreground">
                  Editar metadatos del proyecto
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-primary">{proyecto.id}</span>
                  <span>•</span>
                  <Badge
                    tone={proyecto.version > 1 ? "secondary" : "neutral"}
                    appearance="soft"
                    size="sm"
                    className="font-semibold text-[11px] px-2 py-0 h-5"
                  >
                    v{proyecto.version}.0
                  </Badge>
                </div>
              </div>
            </div>

            {/* Pill de estado igual a cuentas-internas */}
            <div className="shrink-0 pt-0.5">
              <Badge tone="success" appearance="soft" size="sm" className="font-bold gap-1.5">
                <span className="size-1.5 rounded-full bg-success"></span>
                ACTIVO
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
            Actualiza el nombre descriptivo o el propósito institucional de la iniciativa. Esta acción generará una nueva versión en el historial de trazabilidad.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Identificador del Proyecto (Solo lectura) */}
          <div className="space-y-1.5">
            <Label htmlFor="id-proyecto-edit" className="text-xs font-semibold text-foreground">
              Código / ID del proyecto (Solo lectura)
            </Label>
            <div
              className="relative cursor-not-allowed"
              onClick={() => {
                toast.info("Esta información no se puede cambiar: el código del proyecto es inmutable.");
              }}
              title="Este campo es de solo lectura y no se puede modificar"
            >
              <Input
                id="id-proyecto-edit"
                value={proyecto.id}
                readOnly
                tabIndex={-1}
                className="bg-muted/60 text-muted-foreground font-mono text-xs cursor-not-allowed border-border/80 pointer-events-none select-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock className="size-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Institución Responsable (Solo lectura / Disabled) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="institucion-proyecto-edit"
                className="text-xs font-semibold text-foreground"
              >
                Institución responsable (No editable)
              </Label>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                Asignada
              </Badge>
            </div>
            <div
              className="relative cursor-not-allowed"
              onClick={() => {
                toast.info("Esta información no se puede cambiar: la institución responsable es inmutable por normativa institucional.");
              }}
              title="Este campo es de solo lectura y no se puede modificar"
            >
              <Input
                id="institucion-proyecto-edit"
                value={proyecto.institucion}
                readOnly
                tabIndex={-1}
                className="bg-muted/60 text-muted-foreground text-xs cursor-not-allowed border-border/80 pl-9 pointer-events-none select-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="size-3.5" />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Por normativa, la institución responsable es fija y no puede modificarse.
            </p>
          </div>

          {/* Nombre del Proyecto (Editable) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="nombre-proyecto-edit" className="text-xs font-semibold text-foreground">
                Nombre del proyecto <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {nombre.length}/150 caracteres
              </span>
            </div>
            <Input
              id="nombre-proyecto-edit"
              placeholder="Ej. Sistema de Intercambio y Verificación Ciudadana..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, nombre: true }))}
              maxLength={150}
              disabled={isSubmitting}
              className="text-xs"
              autoFocus
            />
            {touched.nombre && !nombre.trim() && (
              <p className="text-[11px] text-destructive">El nombre es requerido.</p>
            )}
          </div>

          {/* Propósito del Proyecto (Editable) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="proposito-proyecto-edit" className="text-xs font-semibold text-foreground">
                Propósito institucional <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {proposito.length}/500 caracteres
              </span>
            </div>
            <Textarea
              id="proposito-proyecto-edit"
              placeholder="Describe el objetivo y la finalidad del proyecto..."
              value={proposito}
              onChange={(e) => setProposito(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, proposito: true }))}
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
              className="text-xs resize-none"
            />
            {touched.proposito && proposito.trim().length < 10 && (
              <p className="text-[11px] text-destructive">
                El propósito debe tener al menos 10 caracteres.
              </p>
            )}
          </div>

          {/* Motivo de la Modificación (Trazabilidad) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="motivo-proyecto-edit" className="text-xs font-semibold text-foreground">
                Motivo o justificación del cambio{" "}
                <span className="text-[11px] text-muted-foreground font-normal">
                  (asentado en trazabilidad)
                </span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {motivo.length}/200 caracteres
              </span>
            </div>
            <Input
              id="motivo-proyecto-edit"
              placeholder="Ej. Ampliación de alcance, cambio de objetivo sectorial o nueva base legal..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              maxLength={200}
              disabled={isSubmitting}
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Este motivo quedará asentado en el historial de versiones y auditoría del proyecto.
            </p>
          </div>

          {/* Banner de Garantía: No altera solicitudes aprobadas */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 flex items-start gap-3">
            <ShieldCheck className="size-4 text-success mt-0.5 shrink-0" />
            <div className="text-[11px] text-muted-foreground leading-relaxed flex-1 space-y-1">
              <span className="font-semibold text-foreground block">
                Garantía de interoperabilidad:
              </span>
              <span>
                La modificación de metadatos descriptivos (nombre y propósito){" "}
                <strong className="text-foreground font-semibold">
                  no altera ni invalida
                </strong>{" "}
                las solicitudes de acceso a datos previamente tramitadas o aprobadas.
                {cantSolicitudes > 0 && (
                  <span className="block mt-0.5 text-success font-medium">
                    • Este proyecto mantiene {cantSolicitudes}{" "}
                    {cantSolicitudes === 1 ? "solicitud vinculada intacta" : "solicitudes vinculadas intactas"}.
                  </span>
                )}
              </span>
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
              {isSubmitting ? "Guardando cambios..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
