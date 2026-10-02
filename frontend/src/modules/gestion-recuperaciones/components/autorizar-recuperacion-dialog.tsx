"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CasoRecuperacion } from "../data/gestion-recuperaciones-types";
import { AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface AutorizarRecuperacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caso: CasoRecuperacion | null;
  onConfirm: (params: { observaciones: string; bloquearCanalAnterior: boolean }) => void;
  isLoading?: boolean;
}

export function AutorizarRecuperacionDialog({
  open,
  onOpenChange,
  caso,
  onConfirm,
  isLoading = false,
}: AutorizarRecuperacionDialogProps) {
  const [observaciones, setObservaciones] = useState("");

  if (!caso) return null;

  const handleConfirm = () => {
    onConfirm({
      observaciones: observaciones.trim() || "Autorización concedida conforme a protocolo de validación asistida.",
      bloquearCanalAnterior: true, // Consecuencia automática de la autorización
    });
    setObservaciones("");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) setObservaciones("");
        onOpenChange(val);
      }}
      onConfirm={handleConfirm}
      variant="warning"
      title="Autorizar recuperación"
      description={`¿Confirmas la autorización de recuperación asistida para ${caso.usuarioNombre}?`}
      confirmText="Autorizar recuperación"
      cancelText="Cancelar"
      isConfirmDisabled={isLoading}
      isLoading={isLoading}
      icon={<AlertTriangle className="size-6 text-warning" />}
    >
      <div className="space-y-3.5 pt-1 text-left">
        {/* Resumen compacto */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Caso
            </span>
            <span className="font-mono font-bold text-foreground block truncate">
              {caso.id}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Tipo de cuenta
            </span>
            <span className="font-medium text-foreground block truncate">
              {caso.tipoCuentaLabel}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Factor afectado
            </span>
            <span className="font-medium text-foreground block truncate">
              {caso.factorCanalPerdido}
            </span>
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Motivo
            </span>
            <span className="font-medium text-foreground block truncate">
              {caso.motivoLabel}
            </span>
          </div>
        </div>

        {/* Alerta breve de seguridad */}
        <Alert variant="warning" icon={<AlertTriangle className="size-4" />} className="text-xs">
          Al autorizar se invalidarán las sesiones activas y se iniciará el flujo seguro de recuperación. No se generarán contraseñas temporales.
        </Alert>

        {/* Único campo: Observaciones del operador */}
        <div className="space-y-1.5">
          <Label htmlFor="obs-autorizacion" className="text-xs font-semibold text-foreground">
            Observaciones del operador <span className="text-muted-foreground font-normal">(opcional)</span>
          </Label>
          <Textarea
            id="obs-autorizacion"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Registra cualquier constancia u observación de la validación efectuada..."
            className="text-xs min-h-[72px]"
            maxLength={300}
          />
        </div>
      </div>
    </ConfirmDialog>
  );
}
