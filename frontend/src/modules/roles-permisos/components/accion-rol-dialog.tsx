"use client";

import React, { useState, useEffect } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  UserCheck,
  UserX,
  RotateCcw,
  Trash2,
  Lock,
  FileText,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Rol, useRolesStore } from "@/modules/roles-permisos/data/roles-store";

export type TipoAccionRol =
  | "activar"
  | "retirar"
  | "reactivar"
  | "eliminar_borrador";

interface AccionRolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: Rol | null;
  tipo: TipoAccionRol | null;
  onSuccess?: () => void;
}

export function AccionRolDialog({
  open,
  onOpenChange,
  rol,
  tipo,
  onSuccess,
}: AccionRolDialogProps) {
  const {
    activarRol,
    retirarRol,
    reactivarRol,
    eliminarBorrador,
    simularResolverDependencias,
  } = useRolesStore();

  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMotivo("");
    setError(null);
    setIsSubmitting(false);
  }, [open, tipo, rol]);

  if (!rol || !tipo) return null;

  const totalCuentas = rol.dependencias.cuentas.length;
  const totalTareas = rol.dependencias.tareas.length;
  const tieneDependenciasBloqueantes =
    tipo === "retirar" && (totalCuentas > 0 || totalTareas > 0);
  const esProtegidoBloqueado = tipo === "retirar" && rol.esProtegido;

  const handleSimularResolver = () => {
    simularResolverDependencias(rol.id);
    toast.success("Dependencias simuladas resueltas. Ahora es posible retirar el rol.");
  };

  // Regla: 'warning' para retiro, activar y reactivar; 'danger' para eliminar borrador
  const isDanger = tipo === "eliminar_borrador";
  const dialogVariant = isDanger ? "danger" : "warning";

  const getDialogTitle = () => {
    switch (tipo) {
      case "activar":
        return `Activar rol institucional: ${rol.codigo}`;
      case "retirar":
        return `Retirar rol: ${rol.codigo} (Baja lógica)`;
      case "reactivar":
        return `Reactivar rol: ${rol.codigo}`;
      case "eliminar_borrador":
        return `Eliminar borrador no utilizado: ${rol.codigo}`;
    }
  };

  const getDialogDescription = () => {
    switch (tipo) {
      case "activar":
        return "El rol pasará a estado Activo y podrá ser asignado a funcionarios de DINARP.";
      case "retirar":
        return "El rol pasará lógicamente a estado Inactivo. Ningún usuario podrá recibir este rol en el futuro.";
      case "reactivar":
        return "El rol volverá a estar vigente para su asignación y uso en la plataforma.";
      case "eliminar_borrador":
        return "Este borrador nunca fue publicado ni utilizado. Se eliminará permanentemente de la base de datos.";
    }
  };

  const getConfirmText = () => {
    switch (tipo) {
      case "activar":
        return "Confirmar activación";
      case "retirar":
        return "Confirmar retiro lógico";
      case "reactivar":
        return "Confirmar reactivación";
      case "eliminar_borrador":
        return "Confirmar eliminación";
    }
  };

  const getIcon = () => {
    switch (tipo) {
      case "activar":
        return <UserCheck className="size-10 text-warning stroke-[2px]" />;
      case "retirar":
        return <UserX className="size-10 text-warning stroke-[2px]" />;
      case "reactivar":
        return <RotateCcw className="size-10 text-warning stroke-[2px]" />;
      case "eliminar_borrador":
        return <Trash2 className="size-10 text-danger stroke-[2px]" />;
    }
  };

  const handleConfirmAction = () => {
    setError(null);

    if (!motivo.trim()) {
      setError("El motivo o justificación técnica de auditoría es obligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (tipo === "activar") {
        const res = activarRol(rol.id, { motivo });
        toast.success(`Rol '${res?.nombre}' activado exitosamente.`);
      } else if (tipo === "retirar") {
        const res = retirarRol(rol.id, { motivo });
        toast.success(`Rol '${res?.nombre}' retirado lógicamente (Inactivo).`);
      } else if (tipo === "reactivar") {
        const res = reactivarRol(rol.id, { motivo });
        toast.success(`Rol '${res?.nombre}' reactivado exitosamente.`);
      } else if (tipo === "eliminar_borrador") {
        eliminarBorrador(rol.id, { motivo });
        toast.success(`Borrador '${rol.codigo}' eliminado permanentemente.`);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar la acción.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant={dialogVariant}
      icon={getIcon()}
      title={getDialogTitle()}
      description={getDialogDescription()}
      confirmText={getConfirmText()}
      cancelText="Cancelar"
      confirmVariant={dialogVariant}
      isConfirmDisabled={
        isSubmitting ||
        Boolean(esProtegidoBloqueado) ||
        Boolean(tieneDependenciasBloqueantes) ||
        !motivo.trim()
      }
      isLoading={isSubmitting}
      onConfirm={handleConfirmAction}
      size="lg"
      className="sm:max-w-[560px]"
    >
      <div className="space-y-3.5 text-xs text-left w-full pt-1">
        {/* Error si ocurre */}
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Bloqueo si el rol es protegido */}
        {esProtegidoBloqueado && (
          <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Lock className="size-4 shrink-0" />
              <span>Rol de Seguridad Protegido</span>
            </div>
            <p className="text-muted-foreground">
              El rol <strong>Administrador del Sistema</strong> es el componente central de seguridad de DINARP y no puede ser retirado ni inactivado.
            </p>
          </div>
        )}

        {/* Bloqueo si hay dependencias no resueltas */}
        {tieneDependenciasBloqueantes && (
          <div className="p-3.5 rounded-xl bg-warning/15 border border-warning text-xs space-y-2.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-warning">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Cambio bloqueado por dependencias activas</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Existen <strong>{totalCuentas} cuenta(s) asociada(s)</strong> y{" "}
                <strong>{totalTareas} tarea(s) pendiente(s)</strong> vinculadas a este rol.
                No se permite el retiro de un rol mientras sus capacidades estén en uso activo.
              </p>
            </div>

            {/* Botón de ayuda para la prueba */}
            <div className="pt-2 border-t border-warning/30 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                ¿Deseas simular la reasignación para probar la baja lógica?
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSimularResolver}
                leftIcon={<Sparkles className="size-3.5" />}
                className="text-xs shrink-0"
              >
                Simular resolución
              </Button>
            </div>
          </div>
        )}

        {/* Resumen del Rol Afectado */}
        <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Nombre del rol:</span>
            <span className="font-bold text-foreground">{rol.nombre}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Código de identificación:</span>
            <Badge tone="primary" appearance="soft" size="sm">{rol.codigo}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Cuentas vinculadas:</span>
            <span className="font-bold text-foreground">{rol.cuentasAsociadas}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-muted-foreground">Capacidades asignadas:</span>
            <span className="font-bold text-foreground">{rol.capacidades.length}</span>
          </div>
        </div>

        {/* Campo obligatorio de Motivo / Justificación (Auditoría) */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-surface border border-border">
          <Label htmlFor="accion-rol-motivo" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <FileText className="size-3.5 text-primary" />
            Motivo o justificación técnica (Auditoría obligatoria) <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="accion-rol-motivo"
            rows={3}
            placeholder={
              tipo === "retirar"
                ? "Ej. Cese de competencias operativas por reestructuración orgánica DINARP-2026..."
                : tipo === "activar"
                ? "Ej. Aprobación final de dictamen técnico y habilitación para asignación institucional..."
                : tipo === "reactivar"
                ? "Ej. Reactivación transitoria para solventar contingencia operativa..."
                : "Ej. Borrador duplicado descartado por el Administrador..."
            }
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if (error) setError(null);
            }}
            className="text-xs resize-none"
            disabled={isSubmitting || Boolean(esProtegidoBloqueado) || Boolean(tieneDependenciasBloqueantes)}
          />
          <p className="text-[11px] text-muted-foreground">
            Se registrará con el usuario Administrador actual, marca de tiempo y trazabilidad inalterable.
          </p>
        </div>
      </div>
    </ConfirmDialog>
  );
}
