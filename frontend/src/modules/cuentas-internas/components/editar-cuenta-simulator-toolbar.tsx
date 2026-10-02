"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Mail,
  RotateCcw,
  RefreshCw,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
  Ban,
  Layers,
  HelpCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface EditarCuentaSimulatorToolbarProps {
  onSimulateCambioExitoso: () => void;
  onSimulateRolNoPermitido: () => void;
  onSimulateAreaInactiva: () => void;
  onSimulateCambioCorreoPendiente: () => void;
  onSimulateEnlaceVencido: () => void;
  onSimulateEnlaceRevocado: () => void;
  onSimulateFalloEnviarEnlace: () => void;
  onSimulateFalloInvalidarSesiones: () => void;
  onSimulateCorreoConfirmado: () => void;
  onSimulatePerdidaCorreoAnterior: () => void;
  onResetForm: () => void;
  isEmailChangePending?: boolean;
  currentLinkState?: "Pendiente" | "Usado" | "Vencido" | "Revocado";
  hasSessionSyncError?: boolean;
}

export function EditarCuentaSimulatorToolbar({
  onSimulateCambioExitoso,
  onSimulateRolNoPermitido,
  onSimulateAreaInactiva,
  onSimulateCambioCorreoPendiente,
  onSimulateEnlaceVencido,
  onSimulateEnlaceRevocado,
  onSimulateFalloEnviarEnlace,
  onSimulateFalloInvalidarSesiones,
  onSimulateCorreoConfirmado,
  onSimulatePerdidaCorreoAnterior,
  onResetForm,
  isEmailChangePending,
  currentLinkState,
  hasSessionSyncError,
}: EditarCuentaSimulatorToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"cambios" | "correo" | "errores">("cambios");

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)] pointer-events-auto">
      {expanded ? (
        <div className="flex flex-col gap-2.5 bg-surface/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-border shadow-2xl max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header de la barra */}
          <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-heading font-bold text-foreground">
                  Simulador HU ID-02
                </span>
                <Badge tone="primary" appearance="soft" size="sm">
                  Edición de Cuenta
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="rounded-full size-7 hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Minimizar simulador"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
          </div>

          {/* Selector de categoría */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("cambios")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left",
                activeTab === "cambios"
                  ? "bg-surface text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cambios de Cuenta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("correo")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left",
                activeTab === "correo"
                  ? "bg-surface text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Flujo de Correo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("errores")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left",
                activeTab === "errores"
                  ? "bg-surface text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Errores y Seguridad
            </button>
          </div>

          {/* Botones de acción según pestaña */}
          {activeTab === "cambios" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateCambioExitoso}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-success/30 hover:bg-success/10 text-foreground"
              >
                <CheckCircle2 className="size-3.5 mr-1.5 text-success shrink-0" />
                <span>Cambio exitoso</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateRolNoPermitido}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-danger/30 hover:bg-danger/10 text-foreground"
              >
                <Ban className="size-3.5 mr-1.5 text-danger shrink-0" />
                <span>Rol no permitido / inactivo</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateAreaInactiva}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-danger/30 hover:bg-danger/10 text-foreground"
              >
                <ShieldAlert className="size-3.5 mr-1.5 text-danger shrink-0" />
                <span>Área inexistente o inactiva</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateFalloInvalidarSesiones}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-warning/30 hover:bg-warning/10 text-foreground"
              >
                <AlertTriangle className="size-3.5 mr-1.5 text-warning shrink-0" />
                <span>Fallo invalidar sesiones</span>
              </Button>
            </div>
          )}

          {activeTab === "correo" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateCambioCorreoPendiente}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-primary/30 hover:bg-primary/10 text-foreground"
              >
                <Mail className="size-3.5 mr-1.5 text-primary shrink-0" />
                <span>Correo pendiente (Declarado)</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateCorreoConfirmado}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-success/30 hover:bg-success/10 text-foreground"
              >
                <CheckCircle2 className="size-3.5 mr-1.5 text-success shrink-0" />
                <span>Confirmar cambio correo</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateEnlaceVencido}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-warning/30 hover:bg-warning/10 text-foreground"
              >
                <Clock className="size-3.5 mr-1.5 text-warning shrink-0" />
                <span>Enlace vencido</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateEnlaceRevocado}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-neutral/30 hover:bg-neutral/10 text-foreground"
              >
                <RotateCcw className="size-3.5 mr-1.5 text-muted-foreground shrink-0" />
                <span>Enlace revocado</span>
              </Button>

              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulateFalloEnviarEnlace}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-danger/30 hover:bg-danger/10 text-foreground sm:col-span-2"
              >
                <AlertTriangle className="size-3.5 mr-1.5 text-danger shrink-0" />
                <span>Fallo al enviar enlace de verificación</span>
              </Button>
            </div>
          )}

          {activeTab === "errores" && (
            <div className="flex flex-col gap-1.5 pt-1">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={onSimulatePerdidaCorreoAnterior}
                className="h-8 text-xs justify-start px-2.5 font-normal rounded-xl border border-primary/30 hover:bg-primary/10 text-foreground"
              >
                <HelpCircle className="size-3.5 mr-1.5 text-primary shrink-0" />
                <span>Pérdida de correo anterior (ID-08)</span>
              </Button>

              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 text-[10px] space-y-1 text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-primary" />
                  Regla de seguridad ID-02
                </span>
                <p>
                  Los cambios de rol y área invalidan las sesiones activas del funcionario. Un cambio de correo institucional no reemplaza el correo vigente hasta que el nuevo correo sea verificado con su enlace de verificación.
                </p>
              </div>
            </div>
          )}

          {/* Footer de la barra con estado y reset */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/70 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span>Estado enlace:</span>
              <Badge
                tone={
                  currentLinkState === "Usado"
                    ? "success"
                    : currentLinkState === "Pendiente"
                    ? "warning"
                    : currentLinkState === "Vencido"
                    ? "danger"
                    : "neutral"
                }
                appearance="soft"
                size="sm"
              >
                {currentLinkState || "No emitido"}
              </Badge>
              {hasSessionSyncError && (
                <Badge tone="danger" appearance="soft" size="sm">
                  Sesiones desincronizadas
                </Badge>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetForm}
              className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
            >
              Restablecer
            </Button>
          </div>
        </div>
      ) : (
        /* Barra flotante colapsada tipo píldora */
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => setExpanded(true)}
          className="rounded-full shadow-lg gap-2 text-xs font-semibold px-3.5 py-1.5 h-9 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Sparkles className="size-3.5" />
          <span>Simulador HU ID-02</span>
          <ChevronUp className="size-3.5 opacity-70" />
        </Button>
      )}
    </div>
  );
}
