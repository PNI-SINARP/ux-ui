"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Ban,
  UserMinus,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AccionCuentaSimulatorToolbarProps {
  onSimulateEnrolamientoCompleto: () => void;
  onSimulate2FAPendiente: () => void;
  onSimulateTriggerSuspender: () => void;
  onSimulateTriggerReactivar: () => void;
  onSimulateTriggerActivar: () => void;
  onToggleSyncError: () => void;
  isSyncErrorActive: boolean;
}

export function AccionCuentaSimulatorToolbar({
  onSimulateEnrolamientoCompleto,
  onSimulate2FAPendiente,
  onSimulateTriggerSuspender,
  onSimulateTriggerReactivar,
  onSimulateTriggerActivar,
  onToggleSyncError,
  isSyncErrorActive,
}: AccionCuentaSimulatorToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)] pointer-events-auto">
      {expanded ? (
        <div className="flex flex-col gap-2.5 bg-surface/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-border shadow-2xl max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header del simulador */}
          <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="size-3.5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-heading font-bold text-foreground">
                  Simulador de Casos HU ID-03
                </span>
                <Badge tone="primary" appearance="soft" size="sm">
                  Ciclo de Vida
                </Badge>
                {isSyncErrorActive && (
                  <Badge tone="danger" appearance="soft" size="sm" className="animate-pulse">
                    Fallo IdP Activo
                  </Badge>
                )}
              </div>
            </div>

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

          {/* Botones de prueba de casos de uso ID-03 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={onSimulateEnrolamientoCompleto}
              className="h-8 text-xs rounded-xl border border-success/40 hover:bg-success/10 text-foreground"
              title="Configura contraseña y TOTP en la cuenta para habilitar el botón de activación"
            >
              <CheckCircle2 className="size-3.5 mr-1 text-success" />
              <span>Simular 2FA completo (Habilitar)</span>
            </Button>

            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={onSimulate2FAPendiente}
              className="h-8 text-xs rounded-xl border border-warning/40 hover:bg-warning/10 text-foreground"
              title="Marca contraseña o TOTP como pendientes para verificar botón deshabilitado"
            >
              <KeyRound className="size-3.5 mr-1 text-warning" />
              <span>Simular 2FA pendiente (Bloquear)</span>
            </Button>

            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={onSimulateTriggerActivar}
              className="h-8 text-xs rounded-xl font-semibold shadow-xs"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              <span>Diálogo Activar (Warning)</span>
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onSimulateTriggerSuspender}
              className="h-8 text-xs rounded-xl font-semibold shadow-xs"
            >
              <Ban className="size-3.5 mr-1" />
              <span>Diálogo Suspender (Danger)</span>
            </Button>

            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={onSimulateTriggerReactivar}
              className="h-8 text-xs rounded-xl font-semibold shadow-xs"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Diálogo Reactivar (Warning)</span>
            </Button>

            <Button
              type="button"
              variant={isSyncErrorActive ? "danger" : "outline"}
              size="sm"
              onClick={onToggleSyncError}
              className="h-8 text-xs rounded-xl ml-auto"
              title="Alternar simulación de error de Identity Platform / sincronización de sesiones"
            >
              <ShieldAlert className="size-3.5 mr-1" />
              <span>{isSyncErrorActive ? "Desactivar fallo IdP" : "Simular fallo IdP / Sincronización"}</span>
            </Button>
          </div>

          {/* Resumen explicativo de reglas ID-03 */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <UserMinus className="size-3 text-danger" /> Suspender → Danger (Sesiones invalidadas, trámites a reasignar)
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="size-3 text-warning" /> Activar → Warning (Requiere Contraseña + TOTP)
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <RotateCcw className="size-3 text-warning" /> Reactivar → Warning (Sin recuperar roles retirados)
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
          title="Desplegar simulador de casos HU ID-03"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Simulador HU ID-03</span>
          {isSyncErrorActive && (
            <span className="size-2 rounded-full bg-danger animate-ping" />
          )}
          <ChevronUp className="size-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
