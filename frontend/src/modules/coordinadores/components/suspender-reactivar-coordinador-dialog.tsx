"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  type CoordinadorCuenta,
  useCoordinadoresStore
} from "@/modules/coordinadores/data/coordinadores-store";

interface SuspenderReactivarCoordinadorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordinador: CoordinadorCuenta | null;
  mode: "suspender" | "reactivar";
}

export function SuspenderReactivarCoordinadorDialog({
  open,
  onOpenChange,
  coordinador,
  mode,
}: SuspenderReactivarCoordinadorDialogProps) {
  const { suspenderCoordinador, reactivarCoordinador } = useCoordinadoresStore();

  const isSuspension = mode === "suspender";
  const [causa, setCausa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened with coordinator
  useEffect(() => {
    if (open) {
      setCausa("");
      setIsSubmitting(false);
    }
  }, [open, coordinador]);

  if (!coordinador) return null;

  // Validación previa de requisitos para Reactivar (ID-11):
  // 1. Anexo B aprobado
  // 2. Rol institucional vigente
  // 3. TOTP vinculado
  const requisitosFaltantes: string[] = [];
  if (!coordinador.anexoBAprobado) {
    requisitosFaltantes.push("Acuerdo Anexo B aprobado");
  }
  if (!coordinador.designacionVigente) {
    requisitosFaltantes.push("Rol o designación institucional vigente");
  }
  if (!coordinador.totpConfigurado) {
    requisitosFaltantes.push("Segundo factor TOTP vinculado");
  }

  const cumpleRequisitos = isSuspension || requisitosFaltantes.length === 0;
  const esValido = causa.trim().length >= 5 && cumpleRequisitos;

  const handleConfirm = () => {
    if (!esValido) return;

    setIsSubmitting(true);
    if (isSuspension) {
      const res = suspenderCoordinador(coordinador.id, {
        causa: causa.trim(),
        actor: "Administrador DINARP",
      });
      setIsSubmitting(false);
      onOpenChange(false);

      if (res.success) {
        toast.success("Cuenta de coordinador suspendida", {
          description:
            "Se invalidaron las sesiones activas y se impidió el nuevo acceso. El suplente no ha sido habilitado.",
        });
      }
    } else {
      const res = reactivarCoordinador(coordinador.id, {
        causa: causa.trim(),
        actor: "Administrador DINARP",
      });
      setIsSubmitting(false);
      onOpenChange(false);

      if (res.success) {
        toast.success("Cuenta reactivada exitosamente", {
          description:
            "Se validaron los requisitos y se restableció el acceso del coordinador.",
        });
      }
    }
  };

  // MODO SUSPENDER: Confirm Dialog Variante Danger
  if (isSuspension) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        variant="danger"
        title="¿Suspender cuenta de Coordinador?"
        description="La suspensión invalidará sesiones e impedirá nuevos ingresos."
        confirmText="Suspender cuenta"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmDisabled={!esValido}
        isLoading={isSubmitting}
        onConfirm={handleConfirm}
      >
        <div className="space-y-3.5 text-xs">
          {/* Resumen breve */}
          <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Coordinador:</span>
              <span className="font-semibold text-foreground text-right">{coordinador.nombreCompleto}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Institución:</span>
              <span className="text-foreground text-right max-w-[240px] truncate">{coordinador.institucion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Designación:</span>
              {coordinador.tipoDesignacion === "TITULAR" ? (
                <Badge tone="primary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                  <ShieldCheck className="size-2.5 text-white shrink-0" />
                  Titular
                </Badge>
              ) : (
                <Badge tone="secondary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                  <Users className="size-2.5 text-white shrink-0" />
                  Suplente
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">Estado actual:</span>
              <Badge tone="success" appearance="soft" size="sm" className="font-semibold">
                {coordinador.estado}
              </Badge>
            </div>
          </div>

          {/* Advertencia concisa ID-11 */}
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Esta acción impedirá el ingreso al portal y cerrará las sesiones activas. <strong>No habilita automáticamente al suplente</strong>.
          </p>

          {/* Causa obligatoria */}
          <div className="space-y-1 pt-1">
            <Label htmlFor="causa-suspension" className="text-xs font-semibold text-foreground">
              Causa obligatoria de la suspensión (*):
            </Label>
            <Textarea
              id="causa-suspension"
              rows={3}
              value={causa}
              onChange={(e) => setCausa(e.target.value)}
              placeholder="Indique el motivo administrativo o de seguridad de la suspensión..."
              className="text-xs resize-none"
              required
              autoFocus
            />
          </div>
        </div>
      </ConfirmDialog>
    );
  }

  // MODO REACTIVAR: Confirm Dialog Variante Warning
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="warning"
      title="¿Reactivar cuenta de Coordinador?"
      description="Se restaurará el acceso tras comprobar el cumplimiento normativo."
      confirmText="Reactivar cuenta"
      cancelText="Cancelar"
      confirmVariant="warning"
      isConfirmDisabled={!esValido}
      isLoading={isSubmitting}
      onConfirm={handleConfirm}
    >
      <div className="space-y-3.5 text-xs">
        {/* Resumen breve */}
        <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Coordinador:</span>
            <span className="font-semibold text-foreground text-right">{coordinador.nombreCompleto}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Institución:</span>
            <span className="text-foreground text-right max-w-[240px] truncate">{coordinador.institucion}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Designación:</span>
            {coordinador.tipoDesignacion === "TITULAR" ? (
              <Badge tone="primary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                <ShieldCheck className="size-2.5 text-white shrink-0" />
                Titular
              </Badge>
            ) : (
              <Badge tone="secondary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                <Users className="size-2.5 text-white shrink-0" />
                Suplente
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Estado actual:</span>
            <Badge tone="danger" appearance="soft" size="sm" className="font-semibold">
              {coordinador.estado}
            </Badge>
          </div>
        </div>

        {/* Validación previa de requisitos: si falla, mostrar únicamente el requisito incumplido */}
        {!cumpleRequisitos ? (
          <div className="p-3 rounded-xl border border-danger/30 bg-danger/10 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-danger">
              <XCircle className="size-4 shrink-0" />
              <span>
                {requisitosFaltantes.length === 1
                  ? "Requisito incumplido para reactivación:"
                  : "Requisitos incumplidos para reactivación:"}
              </span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-danger space-y-0.5">
              {requisitosFaltantes.map((req, idx) => (
                <li key={idx} className="font-medium">
                  {req}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-danger/20">
              No es posible reactivar la cuenta hasta subsanar el requisito faltante.
            </p>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg border border-success/30 bg-success/10 flex items-center gap-2 text-success">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="text-[11px] font-medium">
              Requisitos validados: Anexo B aprobado, rol vigente y TOTP vinculado.
            </span>
          </div>
        )}

        {/* Causa obligatoria (solo si cumple los requisitos) */}
        {cumpleRequisitos && (
          <div className="space-y-1 pt-1">
            <Label htmlFor="causa-reactivacion" className="text-xs font-semibold text-foreground">
              Causa obligatoria de la reactivación (*):
            </Label>
            <Textarea
              id="causa-reactivacion"
              rows={3}
              value={causa}
              onChange={(e) => setCausa(e.target.value)}
              placeholder="Indique el motivo o resolución de la reactivación formal..."
              className="text-xs resize-none"
              required
              autoFocus
            />
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
