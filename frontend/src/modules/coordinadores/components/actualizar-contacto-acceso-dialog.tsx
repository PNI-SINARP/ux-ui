"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  Mail,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  type CoordinadorCuenta,
  useCoordinadoresStore
} from "@/modules/coordinadores/data/coordinadores-store";

interface ActualizarContactoAccesoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coordinador: CoordinadorCuenta | null;
}

export function ActualizarContactoAccesoDialog({
  open,
  onOpenChange,
  coordinador,
}: ActualizarContactoAccesoDialogProps) {
  const {
    declararNuevoCorreo,
    verificarNuevoCorreo,
    cancelarNuevoCorreoPendiente,
    reiniciarTotp,
  } = useCoordinadoresStore();

  // Estados locales para nuevo correo (ID-10)
  const [declararCorreo, setDeclararCorreo] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState("");

  // Estados locales para reinicio de TOTP (ID-10)
  const [solicitarReinicioTotp, setSolicitarReinicioTotp] = useState(false);
  const [motivoReinicioTotp, setMotivoReinicioTotp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!coordinador) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const esNuevoCorreoValido =
    !declararCorreo ||
    (emailRegex.test(nuevoCorreo.trim()) && nuevoCorreo.trim() !== coordinador.correo);

  const esMotivoTotpValido =
    !solicitarReinicioTotp || motivoReinicioTotp.trim().length >= 5;

  const hayCambios =
    (declararCorreo && nuevoCorreo.trim().length > 0 && esNuevoCorreoValido) ||
    (solicitarReinicioTotp && esMotivoTotpValido);

  const puedeGuardar = hayCambios && esNuevoCorreoValido && esMotivoTotpValido;

  const handleResetForm = () => {
    setDeclararCorreo(false);
    setNuevoCorreo("");
    setSolicitarReinicioTotp(false);
    setMotivoReinicioTotp("");
    setIsSubmitting(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleResetForm();
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeGuardar) return;

    setIsSubmitting(true);
    let operacionesRealizadas = 0;

    // 1. Declarar nuevo correo (queda Pendiente de verificación, no sustituye el vigente)
    if (declararCorreo && nuevoCorreo.trim()) {
      const res = declararNuevoCorreo(coordinador.id, {
        nuevoCorreo: nuevoCorreo.trim(),
        motivo: "Actualización de correo institucional declarada por Administrador",
        caso: "TR-CORREO",
        autorizacion: "Oficio Institucional",
        actor: "Administrador DINARP",
      });
      if (res.success) {
        operacionesRealizadas++;
      }
    }

    // 2. Reiniciar TOTP (únicamente permitido si existe recuperación autorizada)
    if (solicitarReinicioTotp && coordinador.recuperacionId08Autorizada) {
      const res = reiniciarTotp(coordinador.id, {
        motivo: motivoReinicioTotp.trim(),
        caso: coordinador.codigoRecuperacionId08 || "CASO-REC-AUT",
        autorizacion: coordinador.codigoRecuperacionId08 || "REC-AUT",
        actor: "Administrador DINARP",
      });
      if (res.success) {
        operacionesRealizadas++;
      }
    }

    setIsSubmitting(false);
    handleResetForm();
    onOpenChange(false);

    if (operacionesRealizadas > 0) {
      toast.success("Contacto y factor actualizados", {
        description:
          "Se registraron los cambios en la trazabilidad de auditoría.",
      });
    }
  };

  // Sustitución cuando el correo pendiente es confirmado
  const handleConfirmarNuevoCorreo = () => {
    setIsSubmitting(true);
    const res = verificarNuevoCorreo(coordinador.id, {
      actor: "Administrador DINARP",
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Correo oficial sustituido", {
        description: `El nuevo correo ${coordinador.nuevoCorreoPendiente} quedó verificado y es el canal oficial vigente.`,
      });
      handleClose(false);
    }
  };

  // Descartar correo pendiente
  const handleCancelarNuevoCorreo = () => {
    setIsSubmitting(true);
    const res = cancelarNuevoCorreoPendiente(coordinador.id, {
      actor: "Administrador DINARP",
      motivo: "Cancelación de declaración de correo por Administrador.",
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.info("Declaración descartada", {
        description: "Se conservó intacto el correo institucional verificado.",
      });
      handleClose(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                Corregir contacto / factor
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap pt-0.5">
                <span>{coordinador.nombreCompleto} · {coordinador.institucion}</span>
                {coordinador.tipoDesignacion === "TITULAR" ? (
                  <Badge tone="primary" appearance="solid" size="sm" className="font-bold gap-0.5 text-[9px] py-0 px-1.5 text-white shadow-2xs">
                    <ShieldCheck className="size-2.5 text-white shrink-0" />
                    Titular
                  </Badge>
                ) : (
                  <Badge tone="secondary" appearance="solid" size="sm" className="font-bold gap-0.5 text-[9px] py-0 px-1.5 text-white shadow-2xs">
                    <Users className="size-2.5 text-white shrink-0" />
                    Suplente
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* SECCIÓN 1: CANAL DE CORREO ELECTRÓNICO */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" />
                Canal de correo institucional
              </span>
              <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold text-[10px]">
                <CheckCircle2 className="size-3" />
                Verificado
              </Badge>
            </div>

            {/* Correo actual como dato de consulta (read-only) */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="text-[11px] text-muted-foreground block">
                Correo oficial vigente (dato de consulta):
              </span>
              <p className="font-mono text-xs font-semibold text-foreground select-all break-all">
                {coordinador.correo}
              </p>
            </div>

            {/* Si ya existe un nuevo correo pendiente declarado */}
            {coordinador.nuevoCorreoPendiente ? (
              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-warning flex items-center gap-1.5">
                    <Clock className="size-3.5 shrink-0" />
                    Nuevo correo declarado
                  </span>
                  <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                    Pendiente de verificación
                  </Badge>
                </div>
                <p className="font-mono text-xs font-bold text-foreground break-all">
                  {coordinador.nuevoCorreoPendiente}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  No sustituye al correo verificado hasta que se confirme su verificación.
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-3 pb-1 border-t border-warning/25 mt-2">
                  <Button
                    type="button"
                    variant="warning"
                    size="sm"
                    onClick={handleConfirmarNuevoCorreo}
                    disabled={isSubmitting}
                    className="text-xs h-9 py-2 px-3.5 gap-2 shadow-2xs font-semibold"
                  >
                    <CheckCircle2 className="size-3.5" />
                    Confirmar verificación
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={handleCancelarNuevoCorreo}
                    disabled={isSubmitting}
                    className="text-xs h-9 py-2 px-3.5 gap-2 shadow-2xs font-semibold"
                  >
                    <XCircle className="size-3.5" />
                    Descartar
                  </Button>
                </div>
              </div>
            ) : (
              /* Declarar nuevo correo */
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="declarar-correo"
                    checked={declararCorreo}
                    onCheckedChange={(checked) => setDeclararCorreo(!!checked)}
                  />
                  <Label htmlFor="declarar-correo" className="text-xs font-medium cursor-pointer text-foreground">
                    Declarar un nuevo correo institucional
                  </Label>
                </div>

                {declararCorreo && (
                  <div className="space-y-1.5 pl-6 animate-fade-in">
                    <Label htmlFor="input-nuevo-correo" className="text-[11px] text-muted-foreground">
                      Nuevo correo institucional:
                    </Label>
                    <Input
                      id="input-nuevo-correo"
                      type="email"
                      placeholder="nuevo.coordinador@institucion.gob.ec"
                      value={nuevoCorreo}
                      onChange={(e) => setNuevoCorreo(e.target.value)}
                      className="text-xs h-9 font-mono bg-white dark:bg-surface border-border shadow-2xs"
                      autoFocus
                    />
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Quedará en estado <strong>Declarado / Pendiente de verificación</strong>; no reemplazará inmediatamente el correo verificado.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECCIÓN 2: REINICIO DE SEGUNDO FACTOR TOTP */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" />
                Segundo Factor de Autenticación (TOTP)
              </span>
              <Badge
                tone={coordinador.totpConfigurado ? "success" : "neutral"}
                appearance="soft"
                size="sm"
                className="text-[10px]"
              >
                {coordinador.totpConfigurado ? "Configurado" : "Sin TOTP"}
              </Badge>
            </div>

            {/* Condición estricta: únicamente con caso de recuperación autorizado */}
            {coordinador.recuperacionId08Autorizada ? (
              <div className="p-3 rounded-lg border border-success/30 bg-success/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-success flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 shrink-0" />
                    Caso de recuperación autorizado
                  </span>
                  <Badge tone="success" appearance="outline" size="sm" className="font-mono text-[10px]">
                    {coordinador.codigoRecuperacionId08 || "REC-AUT"}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-success/20">
                  <Checkbox
                    id="reiniciar-totp"
                    checked={solicitarReinicioTotp}
                    onCheckedChange={(checked) => setSolicitarReinicioTotp(!!checked)}
                  />
                  <Label htmlFor="reiniciar-totp" className="text-xs font-semibold cursor-pointer text-danger">
                    Reiniciar segundo factor TOTP (Invalida sesiones activas)
                  </Label>
                </div>

                {solicitarReinicioTotp && (
                  <div className="space-y-1.5 pt-1 animate-fade-in">
                    <Label htmlFor="motivo-totp" className="text-[11px] font-semibold text-foreground">
                      Motivo del reinicio TOTP (*):
                    </Label>
                    <Textarea
                      id="motivo-totp"
                      rows={2}
                      value={motivoReinicioTotp}
                      onChange={(e) => setMotivoReinicioTotp(e.target.value)}
                      placeholder="Indique la causa administrativa respaldada por el trámite de recuperación..."
                      className="text-xs resize-none bg-white dark:bg-surface border border-border/80 shadow-2xs rounded-xl"
                      required
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <AlertTriangle className="size-3.5 text-warning shrink-0" />
                  <span>Reinicio de TOTP inhabilitado</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  El reinicio de factor está estrictamente condicionado a la existencia previa de un caso de recuperación autorizado.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!puedeGuardar || isSubmitting}
              className="w-full sm:w-auto text-xs"
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
