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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, AlertCircle, Mail, User, Building2, CreditCard, Loader2, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { type SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

interface RechazarSolicitudDialogProps {
  solicitud: SolicitudIngreso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (solicitud: SolicitudIngreso, motivo: string) => void;
}

const MAX_MOTIVO_LENGTH = 500;

export function RechazarSolicitudDialog({
  solicitud,
  open,
  onOpenChange,
  onConfirm,
}: RechazarSolicitudDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"MOTIVO" | "CONFIRM">("MOTIVO");

  useEffect(() => {
    if (open) {
      setMotivo("");
      setTouched(false);
      setIsSubmitting(false);
      setStep("MOTIVO");
    }
  }, [open]);

  if (!solicitud) return null;

  const isMotivoEmpty = motivo.trim().length === 0;
  const isError = touched && isMotivoEmpty;

  const handleContinue = () => {
    setTouched(true);
    if (isMotivoEmpty) return;
    setStep("CONFIRM");
  };

  const handleReject = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm(solicitud, motivo.trim());
      onOpenChange(false);
      // El toast se manejará desde el componente padre
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="warning" className="max-w-md max-h-[90vh] overflow-y-auto">
        {step === "MOTIVO" ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-bold text-foreground">
                Rechazar solicitud
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Indica detalladamente la razón por la cual no se aprueba el trámite.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5 pt-1 w-full text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="motivo-rechazo" className="text-xs font-semibold text-foreground">
                  Motivo del rechazo <span className="text-danger">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {motivo.length}/{MAX_MOTIVO_LENGTH}
                </span>
              </div>

              <Textarea
                id="motivo-rechazo"
                value={motivo}
                maxLength={MAX_MOTIVO_LENGTH}
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (touched) setTouched(false);
                }}
                placeholder="Describe el motivo por el cual la solicitud será rechazada."
                className="min-h-[100px] text-xs resize-none"
                state={isError ? "error" : "default"}
              />

              {isError && (
                <p className="text-[11px] text-danger flex items-center gap-1 font-medium pt-0.5">
                  <AlertCircle className="size-3 shrink-0" />
                  Ingresa el motivo del rechazo.
                </p>
              )}

              <p className="text-[11px] text-muted-foreground pt-1 flex gap-1.5">
                <Mail className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                La institución será notificada por correo electrónico con el motivo registrado.
              </p>
            </div>

            <DialogFooter className="mt-4 flex flex-row w-full gap-3 sm:gap-3 [&>*]:flex-1">
              <Button
                type="button"
                variant="neutral"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="warning"
                onClick={handleContinue}
                className="w-full"
              >
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                ¿Confirmar rechazo?
              </DialogTitle>
              <DialogDescription>
                Estás a punto de rechazar esta solicitud y la acción no se puede deshacer. Se notificará a la institución con el motivo registrado: <br/> <span className="italic block mt-1">"{motivo}"</span>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex flex-row w-full gap-3 sm:gap-3 [&>*]:flex-1">
              <Button
                type="button"
                variant="neutral"
                disabled={isSubmitting}
                onClick={() => setStep("MOTIVO")}
                className="w-full"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="warning"
                disabled={isSubmitting}
                onClick={handleReject}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
