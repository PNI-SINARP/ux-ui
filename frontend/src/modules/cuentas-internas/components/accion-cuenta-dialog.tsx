"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Ban,
  RotateCcw,
  KeyRound,
  Fingerprint,
  AlertCircle,
  FileText,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserMinus,
  UserCheck,
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
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UsuarioInterno,
  useUsuariosStore,
} from "@/modules/usuarios/data/usuarios-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { RolBadge } from "./rol-badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type TipoAccionCuenta = "ACTIVAR" | "SUSPENDER" | "REACTIVAR";

export interface AccionCuentaDialogProps {
  tipo: TipoAccionCuenta | null;
  usuario: UsuarioInterno | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedUser: UsuarioInterno, tipo: TipoAccionCuenta) => void;
  simulateSyncError?: boolean;
}

export function AccionCuentaDialog({
  tipo,
  usuario,
  open,
  onOpenChange,
  onSuccess,
  simulateSyncError = false,
}: AccionCuentaDialogProps) {
  const { activarUsuario, suspenderUsuario, reactivarUsuario } = useUsuariosStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  const [causa, setCausa] = useState("");
  const [touched, setTouched] = useState(false);
  const [errorCausa, setErrorCausa] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de feedback posterior
  const [feedbackSuccess, setFeedbackSuccess] = useState<TipoAccionCuenta | null>(null);
  const [syncError, setSyncError] = useState<{ incidentRef: string; message: string } | null>(null);

  // Reiniciar estado al cambiar de usuario o acción
  useEffect(() => {
    if (open) {
      setCausa("");
      setTouched(false);
      setErrorCausa(null);
      setIsSubmitting(false);
      setFeedbackSuccess(null);
      setSyncError(null);
    }
  }, [open, tipo, usuario]);

  if (!usuario || !tipo) return null;

  // Validación de requisitos previos para ACTIVAR
  const requisitosCompletos =
    Boolean(usuario.credencialesConfiguradas) && Boolean(usuario.totpConfigurado);

  // Validación de causa para SUSPENDER y REACTIVAR
  const validateCausa = (text: string) => {
    const clean = text.trim();
    if (!clean) return "La causa de la acción es obligatoria para la bitácora de auditoría.";
    if (clean.length < 10) return "La causa debe contener al menos 10 caracteres explicativos.";
    return null;
  };

  const handleCausaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCausa(val);
    if (touched) {
      setErrorCausa(validateCausa(val));
    }
  };

  const handleCausaBlur = () => {
    setTouched(true);
    setErrorCausa(validateCausa(causa));
  };

  const handleConfirm = () => {
    if (tipo === "SUSPENDER" || tipo === "REACTIVAR") {
      setTouched(true);
      const err = validateCausa(causa);
      setErrorCausa(err);
      if (err) return;
    }

    if (tipo === "ACTIVAR" && !requisitosCompletos) {
      return;
    }

    setIsSubmitting(true);

    // Si está activa la simulación de error de Identity Platform / sincronización
    if (simulateSyncError) {
      setIsSubmitting(false);
      setSyncError({
        incidentRef: "INC-IDP-2026-0814",
        message:
          "El cambio de estado se registró localmente en auditoría, pero Identity Platform o el servicio de sincronización de sesiones no respondió. La sincronización se encuentra pendiente.",
      });
      return;
    }

    let res: { ok: boolean; error?: string } = { ok: false };
    let estadoFinal: "ACTIVO" | "SUSPENDIDO" = "ACTIVO";

    if (tipo === "ACTIVAR") {
      res = activarUsuario(usuario.id, currentUser.name);
      estadoFinal = "ACTIVO";
    } else if (tipo === "SUSPENDER") {
      res = suspenderUsuario(usuario.id, causa.trim(), currentUser.name);
      estadoFinal = "SUSPENDIDO";
    } else if (tipo === "REACTIVAR") {
      res = reactivarUsuario(usuario.id, causa.trim(), currentUser.name);
      estadoFinal = "ACTIVO";
    }

    setIsSubmitting(false);

    if (!res.ok) {
      setErrorCausa(res.error || "Ocurrió un error al procesar la acción.");
      toast.error("Operación no completada", {
        description: res.error,
      });
      return;
    }

    const updatedUser: UsuarioInterno = {
      ...usuario,
      estado: estadoFinal,
    };

    if (onSuccess) {
      onSuccess(updatedUser, tipo);
    }

    const labels = {
      ACTIVAR: "Cuenta activada exitosamente",
      SUSPENDER: "Cuenta suspendida exitosamente",
      REACTIVAR: "Cuenta reactivada exitosamente",
    };
    const descriptions = {
      ACTIVAR: `La cuenta de ${usuario.nombreCompleto} se encuentra ahora ACTIVA.`,
      SUSPENDER: `La cuenta de ${usuario.nombreCompleto} ha sido suspendida.`,
      REACTIVAR: `La cuenta de ${usuario.nombreCompleto} ha sido reactivada.`,
    };

    toast.success(labels[tipo], {
      description: descriptions[tipo],
    });

    setCausa("");
    setTouched(false);
    setErrorCausa("");
    setFeedbackSuccess(null);
    onOpenChange(false);
  };

  const handleCloseAll = () => {
    setFeedbackSuccess(null);
    setSyncError(null);
    onOpenChange(false);
  };

  return (
    <>
      {/* ── 1. CONFIRMATION DIALOG FUNCIONAL (PATRÓN UI KIT) ── */}
      <Dialog open={open && !feedbackSuccess && !syncError} onOpenChange={onOpenChange}>
        <DialogContent
          variant={tipo === "SUSPENDER" ? "danger" : "warning"}
          size="lg"
          icon={
            tipo === "SUSPENDER" ? (
              <UserMinus className="size-10 text-danger stroke-[2px]" />
            ) : tipo === "ACTIVAR" ? (
              <UserCheck className="size-10 text-warning stroke-[2px]" />
            ) : (
              <RotateCcw className="size-10 text-warning stroke-[2px]" />
            )
          }
          className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          showCloseButton={true}
        >
          {/* Cabecera fija */}
          <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
            <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
              {tipo === "SUSPENDER" && "Suspender cuenta interna"}
              {tipo === "ACTIVAR" && "Activar cuenta interna"}
              {tipo === "REACTIVAR" && "Reactivar cuenta interna"}
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center max-w-md">
              {tipo === "SUSPENDER" &&
                "Se invalidarán de inmediato las sesiones activas, se impedirá el acceso y no se le asignarán nuevos trámites."}
              {tipo === "ACTIVAR" &&
                "Habilita el acceso y asignación de trámites institucionales para el funcionario tras validar requisitos de seguridad."}
              {tipo === "REACTIVAR" &&
                "Restaura el acceso del funcionario tras su suspensión administrativa registrando la causa en auditoría."}
            </DialogDescription>
          </DialogHeader>

          {/* Cuerpo con scroll solo cuando exceda la pantalla (pantallas grandes no scrollean) */}
          <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-2.5 space-y-3 w-full flex-1 min-h-0">
            {/* Ficha resumida del funcionario */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface border border-border text-xs text-left my-1">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">Funcionario:</span>
                <span className="font-semibold text-foreground break-words block text-xs sm:text-sm">{usuario.nombreCompleto}</span>
                <span className="font-mono text-[11px] text-muted-foreground block mt-0.5">C.I. {usuario.cedula}</span>
              </div>
              <div className="min-w-0 flex flex-col justify-center sm:items-start">
                <span className="text-muted-foreground block text-[11px] font-medium mb-1">Rol institucional:</span>
                <RolBadge rol={usuario.rol} label={usuario.rolLabel} size="sm" className="max-w-full" />
              </div>
            </div>

            {/* ── CUERPO ESPECÍFICO SEGÚN ACCIÓN ── */}

          {/* CASO A: SUSPENDER (DANGER) */}
          {tipo === "SUSPENDER" && (
            <div className="w-full space-y-3 text-left">
              <Alert variant="danger" icon={<Ban className="size-4" />} title="Impacto de la suspensión">
                <div className="space-y-1 text-xs leading-relaxed">
                  <p>• Las sesiones activas se invalidarán inmediatamente en toda la plataforma.</p>
                  <p>• Se bloqueará el inicio de sesión y no se remitirán nuevas asignaciones.</p>
                  <p>
                    • Los <strong>{usuario.tareasActivas} trámites asignados</strong> permanecen conservados y quedan disponibles para que el <strong>Director del área los reasigne oportunamente</strong>.
                  </p>
                </div>
              </Alert>

              <div className="space-y-1.5">
                <Label htmlFor="causa-suspension" className="text-xs font-semibold text-foreground">
                  Causa obligatoria de suspensión
                  <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                </Label>
                <Textarea
                  id="causa-suspension"
                  appearance="compact"
                  placeholder="Detalla el motivo administrativo de la suspensión (mínimo 10 caracteres)..."
                  rows={2}
                  value={causa}
                  onChange={handleCausaChange}
                  onBlur={handleCausaBlur}
                  className={cn(
                    "text-xs resize-none rounded-xl",
                    errorCausa && "border-danger ring-2 ring-danger/20"
                  )}
                />
                {errorCausa && (
                  <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errorCausa}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CASO B: ACTIVAR (WARNING) */}
          {tipo === "ACTIVAR" && (
            <div className="w-full space-y-3 text-left">
              {/* Comprobación de requisitos */}
              <div className="p-3 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Comprobación previa de factores de seguridad:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <KeyRound className="size-3.5 text-primary" />
                      Contraseña establecida
                    </span>
                    {usuario.credencialesConfiguradas ? (
                      <Badge tone="success" appearance="soft" size="sm">Completado</Badge>
                    ) : (
                      <Badge tone="warning" appearance="soft" size="sm">Pendiente</Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60 text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Fingerprint className="size-3.5 text-primary" />
                      Google Authenticator (TOTP)
                    </span>
                    {usuario.totpConfigurado ? (
                      <Badge tone="success" appearance="soft" size="sm">Completado</Badge>
                    ) : (
                      <Badge tone="warning" appearance="soft" size="sm">Pendiente</Badge>
                    )}
                  </div>
                </div>
              </div>

              {!requisitosCompletos ? (
                <Alert
                  variant="warning"
                  icon={<AlertTriangle className="size-4" />}
                  title="Requisitos de seguridad pendientes"
                >
                  La cuenta no puede activarse hasta que el funcionario establezca su contraseña y vincule Google Authenticator mediante su enlace de activación.
                </Alert>
              ) : (
                <Alert
                  variant="success"
                  icon={<CheckCircle2 className="size-4" />}
                  title="Seguridad verificada"
                >
                  Todos los requisitos de seguridad han sido verificados. La cuenta está lista para activarse.
                </Alert>
              )}
            </div>
          )}

          {/* CASO C: REACTIVAR (WARNING) */}
          {tipo === "REACTIVAR" && (
            <div className="w-full space-y-3 text-left">
              <Alert
                variant="warning"
                icon={<AlertTriangle className="size-4" />}
                title="Alcance de la reactivación"
              >
                La reactivación restablece el acceso institucional, pero <strong>no restaura roles o permisos retirados previamente</strong>. Se mantendrá exclusivamente el rol actual ({usuario.rolLabel}).
              </Alert>

              <div className="space-y-1.5">
                <Label htmlFor="causa-reactivacion" className="text-xs font-semibold text-foreground">
                  Causa obligatoria de reactivación
                  <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                </Label>
                <Textarea
                  id="causa-reactivacion"
                  appearance="compact"
                  placeholder="Detalla el motivo administrativo que justifica la reactivación (mínimo 10 caracteres)..."
                  rows={2}
                  value={causa}
                  onChange={handleCausaChange}
                  onBlur={handleCausaBlur}
                  className={cn(
                    "text-xs resize-none rounded-xl",
                    errorCausa && "border-danger ring-2 ring-danger/20"
                  )}
                />
                {errorCausa && (
                  <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <span>{errorCausa}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>

          {/* Botones de acción del diálogo */}
          <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-1/2"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={tipo === "SUSPENDER" ? "danger" : "warning"}
              onClick={handleConfirm}
              disabled={
                isSubmitting ||
                (tipo === "ACTIVAR" && !requisitosCompletos) ||
                ((tipo === "SUSPENDER" || tipo === "REACTIVAR") && causa.trim().length < 10)
              }
              className="w-full sm:w-1/2 font-semibold shadow-xs gap-1.5 whitespace-nowrap"
            >
              {isSubmitting ? (
                "Procesando..."
              ) : tipo === "SUSPENDER" ? (
                <>
                  <UserMinus className="size-4 shrink-0" />
                  <span>Suspender cuenta</span>
                </>
              ) : tipo === "ACTIVAR" ? (
                <>
                  <UserCheck className="size-4 shrink-0" />
                  <span>Activar cuenta</span>
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 shrink-0" />
                  <span>Reactivar cuenta</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 2. FEEDBACK FINAL DE ÉXITO (VARIANT="SUCCESS" ÚNICAMENTE AQUÍ) ── */}
      {feedbackSuccess && (
        <Dialog open={Boolean(feedbackSuccess)} onOpenChange={handleCloseAll}>
          <DialogContent
            variant="success"
            size="default"
            className="p-6 sm:p-7 max-w-md text-center max-h-[90vh] flex flex-col overflow-hidden"
            showCloseButton={true}
          >
            {/* Cabecera fija */}
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-2 border-b border-border/50">
              <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                {feedbackSuccess === "ACTIVAR" && "Cuenta activada"}
                {feedbackSuccess === "SUSPENDER" && "Cuenta suspendida"}
                {feedbackSuccess === "REACTIVAR" && "Cuenta reactivada"}
              </DialogTitle>

              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
                {feedbackSuccess === "ACTIVAR" &&
                  "La cuenta institucional ha sido activada exitosamente. El funcionario puede iniciar sesión con contraseña y Google Authenticator."}
                {feedbackSuccess === "SUSPENDER" &&
                  "La cuenta ha sido suspendida. Las sesiones activas fueron revocadas y los trámites asignados están disponibles para reasignación por el Director."}
                {feedbackSuccess === "REACTIVAR" &&
                  "La cuenta ha sido reactivada a estado ACTIVO. El acceso ha quedado habilitado sin restaurar roles previamente retirados."}
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo cuando exceda la pantalla */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-3 space-y-3 flex-1 min-h-0">
              <div className="w-full grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-surface border border-border text-xs text-left my-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">ID Cuenta:</span>
                  <span className="font-mono font-bold text-primary">{usuario.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Estado resultante:</span>
                  <Badge
                    tone={feedbackSuccess === "SUSPENDER" ? "danger" : "success"}
                    appearance="soft"
                    size="sm"
                  >
                    {feedbackSuccess === "SUSPENDER" ? "SUSPENDIDO" : "ACTIVO"}
                  </Badge>
                </div>
                <div className="col-span-2 pt-1 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Autor: <strong className="text-foreground">{currentUser.name}</strong></span>
                  <span>Registro: <strong className="text-foreground">Auditoría inmutable</strong></span>
                </div>
              </div>
            </div>

            {/* Footer fijo */}
            <DialogFooter className="mt-auto pt-3 border-t border-border w-full shrink-0">
              <Button
                type="button"
                variant="primary"
                onClick={handleCloseAll}
                className="w-full font-semibold"
              >
                Entendido
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── 3. FEEDBACK DE ERROR DE SINCRONIZACIÓN / IDENTITY PLATFORM ── */}
      {syncError && (
        <Dialog open={Boolean(syncError)} onOpenChange={handleCloseAll}>
          <DialogContent
            variant="danger"
            size="default"
            className="p-6 sm:p-7 max-w-md text-center max-h-[90vh] flex flex-col overflow-hidden"
            showCloseButton={true}
          >
            {/* Cabecera fija */}
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-2 border-b border-border/50">
              <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                Cambio de cuenta pendiente de sincronización
              </DialogTitle>

              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
                {syncError.message}
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo cuando exceda la pantalla */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-3 space-y-3 flex-1 min-h-0">
              <Alert variant="danger" icon={<ShieldAlert className="size-4" />} title="Referencia de incidencia">
                Incidencia reportada: <strong className="font-mono text-foreground">{syncError.incidentRef}</strong>. Las credenciales o sesiones remotas no pudieron sincronizarse con Identity Platform.
              </Alert>
            </div>

            {/* Footer fijo */}
            <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2 w-full shrink-0">
              <Button
                type="button"
                variant="neutral"
                onClick={handleCloseAll}
                className="w-full sm:w-1/2"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  toast.info("Reintentando sincronización con Identity Platform...");
                  setTimeout(() => {
                    setSyncError(null);
                    setFeedbackSuccess(null);
                    onOpenChange(false);
                    toast.success("Sincronización manual completada.");
                  }, 600);
                }}
                className="w-full sm:w-1/2 font-semibold"
              >
                Reintentar sincronización
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
