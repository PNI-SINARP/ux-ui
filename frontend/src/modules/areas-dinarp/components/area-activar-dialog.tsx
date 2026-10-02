"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { AreaDinarp } from "../data/areas-types";
import { cn } from "@/lib/utils";

interface AreaActivarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDinarp | null;
  tipo: "ACTIVAR" | "REACTIVAR";
  onConfirm: (motivo: string) => void;
}

export function AreaActivarDialog({
  open,
  onOpenChange,
  area,
  tipo,
  onConfirm,
}: AreaActivarDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  if (!area) return null;

  const isReactivar = tipo === "REACTIVAR";
  const title = isReactivar ? "Reactivar Área Orgánica" : "Activar Área en Producción";
  const description = isReactivar
    ? "Al reactivar esta área orgánica, pasará a estado Activa y estará disponible inmediatamente para vinculación en cuentas internas."
    : "Al activar esta área en producción, estará disponible inmediatamente en los selectores de creación (ID-01) y edición (ID-02).";

  const handleConfirm = () => {
    if (!motivo.trim()) {
      setErrorMotivo("El motivo es obligatorio para el registro de auditoría.");
      return;
    }
    if (motivo.trim().length < 8) {
      setErrorMotivo("Ingrese un motivo descriptivo (mínimo 8 caracteres).");
      return;
    }

    onConfirm(motivo.trim());
    onOpenChange(false);
    setMotivo("");
    setErrorMotivo("");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(op) => {
        onOpenChange(op);
        if (!op) {
          setMotivo("");
          setErrorMotivo("");
        }
      }}
      variant="warning"
      icon={
        isReactivar ? (
          <RotateCcw className="size-10 text-warning stroke-[2px]" />
        ) : (
          <CheckCircle2 className="size-10 text-warning stroke-[2px]" />
        )
      }
      title={title}
      description={description}
      confirmText={isReactivar ? "Reactivar área" : "Activar área"}
      cancelText="Cancelar"
      confirmVariant="warning"
      isConfirmDisabled={motivo.trim().length < 8}
      onConfirm={handleConfirm}
      size="default"
      className="sm:max-w-[540px]"
    >
      <div className="space-y-4 pt-1 text-left w-full">
        {errorMotivo && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMotivo}</span>
          </div>
        )}

        {/* Resumen del Área */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface border border-border text-xs">
          <div className="min-w-0">
            <span className="text-muted-foreground block text-[11px] font-medium">Área Orgánica:</span>
            <span className="font-semibold text-foreground break-words block text-xs sm:text-sm">
              {area.nombre}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground block mt-0.5">
              Código: {area.codigo}
            </span>
          </div>
          <div className="min-w-0 space-y-1">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Estado actual:</span>
              <Badge tone={isReactivar ? "danger" : "warning"} appearance="soft" size="sm">
                {area.estado}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Responsable:</span>
              <span className="font-medium text-foreground truncate block">
                {area.responsableNombre}
              </span>
            </div>
          </div>
        </div>

        {/* Aviso de disponibilidad normativa */}
        <Alert
          variant="warning"
          icon={<AlertTriangle className="size-4" />}
          title="Disponibilidad inmediata para vinculación"
        >
          <p className="text-xs mt-1">
            Esta acción habilita la selección del área en las vistas de creación de cuenta interna (ID-01) y edición de usuario (ID-02).
          </p>
        </Alert>

        {/* Campo obligatorio: Motivo */}
        <div className="space-y-1.5">
          <Label htmlFor="motivo-activar" className="text-xs font-semibold text-foreground">
            Motivo de {isReactivar ? "reactivación" : "activación"} <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="motivo-activar"
            rows={2}
            state={errorMotivo ? "error" : "default"}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (errorMotivo) setErrorMotivo("");
            }}
            placeholder={
              isReactivar
                ? "EJ: Reanudación de operaciones de la unidad según Acuerdo Ministerial 2026..."
                : "EJ: Cumplimiento de fase preliminar y puesta en producción oficial..."
            }
            className="text-xs min-h-[64px] resize-none"
            required
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Mínimo 8 caracteres. Se registrará en la auditoría inmutable de la institución.</span>
            <span className={cn(motivo.trim().length >= 8 ? "text-success font-semibold" : "text-muted-foreground")}>
              {motivo.trim().length}/8
            </span>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  );
}
