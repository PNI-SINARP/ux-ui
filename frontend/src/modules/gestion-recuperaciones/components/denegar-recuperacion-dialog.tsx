"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CasoRecuperacion } from "../data/gestion-recuperaciones-types";
import { ShieldAlert, AlertCircle, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface DenegarRecuperacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caso: CasoRecuperacion | null;
  onConfirm: (params: { motivoDenegacion: string; mantenerBloqueoPreventivo: boolean }) => void;
  isLoading?: boolean;
}

export function DenegarRecuperacionDialog({
  open,
  onOpenChange,
  caso,
  onConfirm,
  isLoading = false,
}: DenegarRecuperacionDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorValidation, setErrorValidation] = useState("");

  if (!caso) return null;

  const handleConfirm = () => {
    if (motivo.trim().length < 10) {
      setErrorValidation("Debes especificar un motivo formal de denegación (mínimo 10 caracteres).");
      return;
    }
    setErrorValidation("");
    onConfirm({
      motivoDenegacion: motivo.trim(),
      mantenerBloqueoPreventivo: true,
    });
    setMotivo("");
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setErrorValidation("");
          setMotivo("");
        }
        onOpenChange(val);
      }}
      onConfirm={handleConfirm}
      variant="danger"
      title="Denegar recuperación"
      description={`Esta acción denegará la solicitud de recuperación asistida para ${caso.usuarioNombre}.`}
      confirmText="Denegar recuperación"
      cancelText="Cancelar"
      isConfirmDisabled={motivo.trim().length < 10 || isLoading}
      isLoading={isLoading}
      icon={<ShieldAlert className="size-6 text-danger" />}
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
        </div>

        {/* Campo obligatorio: Motivo de la denegación */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="motivo-denegacion" className="text-xs font-semibold text-foreground">
              Motivo de la denegación <span className="text-danger">*</span>
            </Label>
            <span className="text-[10px] text-muted-foreground">Mínimo 10 caracteres</span>
          </div>
          <Textarea
            id="motivo-denegacion"
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (errorValidation && e.target.value.trim().length >= 10) {
                setErrorValidation("");
              }
            }}
            placeholder="Indica la razón formal del rechazo de la solicitud..."
            className="text-xs min-h-[80px]"
            maxLength={400}
          />
          {errorValidation && (
            <p className="text-[11px] text-danger font-medium">{errorValidation}</p>
          )}
        </div>

        {/* Alerta breve */}
        <Alert variant="danger" icon={<AlertCircle className="size-4" />} className="text-xs">
          La decisión quedará registrada en la auditoría y el acceso no será restablecido.
        </Alert>

        {/* Consecuencia automática del bloqueo preventivo */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border">
          <Lock className="size-3.5 text-danger shrink-0 mt-0.5" />
          <span>
            El bloqueo preventivo vigente se mantendrá hasta que el caso sea resuelto mediante un nuevo proceso autorizado.
          </span>
        </div>
      </div>
    </ConfirmDialog>
  );
}
