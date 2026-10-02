"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ShieldCheck, Ban, AlertCircle } from "lucide-react";
import { AreaDinarp } from "../data/areas-types";
import { cn } from "@/lib/utils";

interface AreaEliminarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDinarp | null;
  onConfirm: (motivo?: string) => void;
}

export function AreaEliminarDialog({
  open,
  onOpenChange,
  area,
  onConfirm,
}: AreaEliminarDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  if (!area) return null;

  // Regla: Solo un borrador nunca referenciado puede eliminarse físicamente
  const esBorradorLimpio =
    area.estado === "Borrador" &&
    !area.referenciada &&
    area.usuarios.length === 0 &&
    area.tramites.length === 0 &&
    area.tareas.length === 0;

  const handleConfirm = () => {
    if (!esBorradorLimpio) {
      if (!motivo.trim()) {
        setErrorMotivo("El motivo de retiro lógico es obligatorio.");
        return;
      }
      if (motivo.trim().length < 8) {
        setErrorMotivo("Ingrese un motivo descriptivo (mínimo 8 caracteres).");
        return;
      }
    }

    onConfirm(motivo.trim() || undefined);
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
      variant="danger"
      icon={
        esBorradorLimpio ? (
          <Trash2 className="size-10 text-danger stroke-[2px]" />
        ) : (
          <Ban className="size-10 text-danger stroke-[2px]" />
        )
      }
      title={
        esBorradorLimpio
          ? "Eliminar Borrador de Área"
          : "Retiro Lógico de Área Orgánica"
      }
      description={
        esBorradorLimpio
          ? "Este borrador nunca ha sido referenciado ni vinculado. Se eliminará permanentemente de la base de datos."
          : "Un área previamente referenciada no puede eliminarse físicamente. Se conservará su historial y trazabilidad."
      }
      confirmText={
        esBorradorLimpio ? "Eliminar borrador" : "Confirmar retiro lógico"
      }
      cancelText="Cancelar"
      confirmVariant="danger"
      isConfirmDisabled={!esBorradorLimpio && motivo.trim().length < 8}
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
              Código: {area.codigo} · Versión: {area.version}
            </span>
          </div>
          <div className="min-w-0 space-y-1">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Estado institucional:</span>
              <Badge tone={area.estado === "Borrador" ? "warning" : "danger"} appearance="soft" size="sm">
                {area.estado}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Histórico registrado:</span>
              <span className="font-medium text-foreground block">
                {area.usuarios.length} cuentas · {area.tramites.length} trámites
              </span>
            </div>
          </div>
        </div>

        {/* Alerta según tipo de eliminación */}
        {esBorradorLimpio ? (
          <Alert
            variant="warning"
            icon={<AlertTriangle className="size-4" />}
            title="Confirmar eliminación permanente de borrador"
          >
            <p className="text-xs mt-1">
              Al no contar con referencias históricas ni dependencias activas, el registro se suprimirá de forma definitiva.
            </p>
          </Alert>
        ) : (
          <Alert
            variant="danger"
            icon={<ShieldCheck className="size-4" />}
            title="Regla de Preservación y Trazabilidad SINARP"
          >
            <p className="text-xs mt-1">
              La dirección pasará a estado Inactivo definitivo y se archivará. No podrá volver a crearse con el mismo código.
            </p>
          </Alert>
        )}

        {/* Campo obligatorio de motivo para retiro lógico */}
        {!esBorradorLimpio && (
          <div className="space-y-1.5">
            <Label htmlFor="motivo-retiro" className="text-xs font-semibold text-foreground">
              Motivo del retiro lógico <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-retiro"
              rows={2}
              state={errorMotivo ? "error" : "default"}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorMotivo) setErrorMotivo("");
              }}
              placeholder="EJ: Cese definitivo de competencias y archivo histórico según Resolución DINARP-2026-04..."
              className="text-xs min-h-[64px] resize-none"
              required
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Mínimo 8 caracteres. Quedará grabado en la auditoría inmutable del sistema.</span>
              <span className={cn(motivo.trim().length >= 8 ? "text-success font-semibold" : "text-muted-foreground")}>
                {motivo.trim().length}/8
              </span>
            </div>
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
