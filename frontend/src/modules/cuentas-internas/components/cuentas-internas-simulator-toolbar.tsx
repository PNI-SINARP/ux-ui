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
  UserCheck,
  Power,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CuentasInternasSimulatorToolbarProps {
  onSimulateAltaExitosa: () => void;
  onSimulateCedulaDuplicada: () => void;
  onSimulateRolNoPermitido: () => void;
  onSimulateAreaInactiva: () => void;
  onSimulateCorreoNoEntregado: () => void;
  onSimulateFalloGenerarEnlace: () => void;
  onSimulateReenviarEnlace: () => void;
  onSimulateNuevoEnlace: () => void;
  onSimulateEnlaceVencido: () => void;
  onSimulateUsarEnlace: () => void;
  onSimulateEnrolamientoCompletado?: () => void;
  onSimulate2FAPendiente?: () => void;
  onSimulateFalloIdentityPlatform?: () => void;
  onSimulateSuspender?: () => void;
  onSimulateReactivar?: () => void;
  onResetForm: () => void;
  hasActiveAccount: boolean;
  currentLinkState?: "Pendiente" | "Usado" | "Vencido" | "Revocado";
  currentDeliveryState?: "Entregado" | "FalloEntrega" | "FalloGeneracion";
}

export function CuentasInternasSimulatorToolbar({
  onSimulateAltaExitosa,
  onSimulateCedulaDuplicada,
  onSimulateRolNoPermitido,
  onSimulateAreaInactiva,
  onSimulateCorreoNoEntregado,
  onSimulateFalloGenerarEnlace,
  onSimulateReenviarEnlace,
  onSimulateNuevoEnlace,
  onSimulateEnlaceVencido,
  onSimulateUsarEnlace,
  onSimulateEnrolamientoCompletado,
  onSimulate2FAPendiente,
  onSimulateFalloIdentityPlatform,
  onSimulateSuspender,
  onSimulateReactivar,
  onResetForm,
  hasActiveAccount,
  currentLinkState,
  currentDeliveryState,
}: CuentasInternasSimulatorToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"alta" | "acciones" | "errores" | "enlace">("alta");

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
                  Simulador de Casos HU ID-01 / ID-03
                </span>
                <Badge tone="primary" appearance="soft" size="sm">
                  Cuentas Internas
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

          {/* Sub-selector de categoría */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl text-[11px] overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("alta")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left shrink-0",
                activeTab === "alta"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Alta y Entrega
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("acciones")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left shrink-0",
                activeTab === "acciones"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Activar / Suspender (ID-03)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("errores")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left shrink-0",
                activeTab === "errores"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Validaciones (Inline)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("enlace")}
              className={cn(
                "px-2.5 py-1 rounded-lg font-medium transition-colors text-left shrink-0",
                activeTab === "enlace"
                  ? "bg-surface text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Ciclo Enlace 2FA
            </button>
          </div>

          {/* Contenido de botones según categoría */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activeTab === "alta" && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={onSimulateAltaExitosa}
                  className="rounded-full px-3 text-xs h-8 shadow-xs"
                >
                  <CheckCircle2 className="size-3.5" /> Alta exitosa
                </Button>

                <Button
                  type="button"
                  variant="warning"
                  size="default"
                  onClick={onSimulateCorreoNoEntregado}
                  className="rounded-full px-3 text-xs h-8"
                >
                  <Mail className="size-3.5" /> Correo no entregado
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  size="default"
                  onClick={onSimulateFalloGenerarEnlace}
                  className="rounded-full px-3 text-xs h-8"
                >
                  <AlertTriangle className="size-3.5" /> Fallo al generar enlace
                </Button>
              </>
            )}

            {activeTab === "acciones" && (
              <>
                {onSimulateEnrolamientoCompletado && (
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onSimulateEnrolamientoCompletado}
                    className="h-8 text-xs rounded-xl border border-success/30 hover:bg-success/10 text-foreground"
                  >
                    <CheckCircle2 className="size-3.5 mr-1 text-success" />
                    <span>Simular 2FA completado (Habilitar activar)</span>
                  </Button>
                )}

                {onSimulate2FAPendiente && (
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onSimulate2FAPendiente}
                    className="h-8 text-xs rounded-xl border border-warning/30 hover:bg-warning/10 text-foreground"
                  >
                    <KeyRound className="size-3.5 mr-1 text-warning" />
                    <span>Simular 2FA pendiente (Bloquear activar)</span>
                  </Button>
                )}

                {onSimulateFalloIdentityPlatform && (
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onSimulateFalloIdentityPlatform}
                    className="h-8 text-xs rounded-xl border border-danger/30 hover:bg-danger/10 text-foreground"
                  >
                    <ShieldAlert className="size-3.5 mr-1 text-danger" />
                    <span>Simular fallo Identity Platform / Sincronización</span>
                  </Button>
                )}

                {onSimulateSuspender && (
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onSimulateSuspender}
                    className="h-8 text-xs rounded-xl border border-danger/30 hover:bg-danger/10 text-foreground"
                  >
                    <Ban className="size-3.5 mr-1 text-danger" />
                    <span>Suspender (Trámites a reasignar)</span>
                  </Button>
                )}

                {onSimulateReactivar && (
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={onSimulateReactivar}
                    className="h-8 text-xs rounded-xl border border-warning/30 hover:bg-warning/10 text-foreground"
                  >
                    <RotateCcw className="size-3.5 mr-1 text-warning" />
                    <span>Reactivar (Sin recuperar roles retirados)</span>
                  </Button>
                )}
              </>
            )}

            {activeTab === "errores" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateCedulaDuplicada}
                  className="rounded-full px-3 text-xs h-8 border-danger/40 text-danger hover:bg-danger/10"
                >
                  <ShieldAlert className="size-3.5" /> Cédula duplicada
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateRolNoPermitido}
                  className="rounded-full px-3 text-xs h-8 border-danger/40 text-danger hover:bg-danger/10"
                >
                  <Ban className="size-3.5" /> Rol no permitido
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateAreaInactiva}
                  className="rounded-full px-3 text-xs h-8 border-danger/40 text-danger hover:bg-danger/10"
                >
                  <AlertTriangle className="size-3.5" /> Área inexistente / inactiva
                </Button>
              </>
            )}

            {activeTab === "enlace" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateReenviarEnlace}
                  disabled={!hasActiveAccount || currentLinkState === "Revocado" || currentLinkState === "Usado"}
                  className="rounded-full px-3 text-xs h-8"
                >
                  <RotateCcw className="size-3.5" /> Reenviar enlace vigente
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateNuevoEnlace}
                  disabled={!hasActiveAccount || currentLinkState === "Usado"}
                  className="rounded-full px-3 text-xs h-8"
                >
                  <RefreshCw className="size-3.5" /> Nuevo enlace (revoca anterior)
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={onSimulateEnlaceVencido}
                  disabled={!hasActiveAccount || currentLinkState === "Usado"}
                  className="rounded-full px-3 text-xs h-8 text-warning border-warning/40 hover:bg-warning/10"
                >
                  <Ban className="size-3.5" /> Marcar enlace vencido
                </Button>

                <Button
                  type="button"
                  variant="success"
                  size="default"
                  onClick={onSimulateUsarEnlace}
                  disabled={!hasActiveAccount || currentLinkState === "Revocado" || currentLinkState === "Vencido"}
                  className="rounded-full px-3 text-xs h-8"
                >
                  <KeyRound className="size-3.5" /> Usar enlace y activar (TOTP)
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="default"
              onClick={onResetForm}
              className="rounded-full px-2.5 text-xs h-8 text-muted-foreground hover:text-foreground ml-auto"
            >
              Restablecer
            </Button>
          </div>

          {/* Bloque informativo de alcance y seguridad */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <ShieldCheck className="size-3 text-primary" /> Sin rol Coordinador SINARP
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <Layers className="size-3 text-primary" /> Sin acceso técnico consumidora
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <KeyRound className="size-3 text-primary" /> Credenciales nunca en claro
            </span>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
          className="rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs bg-surface/95 backdrop-blur-md border border-border hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Desplegar opciones de simulación HU ID-01 y ID-03"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Simulador HU ID-01 / ID-03</span>
          <ChevronUp className="size-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
