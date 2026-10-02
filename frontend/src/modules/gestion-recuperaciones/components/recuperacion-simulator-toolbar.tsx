"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  KeyRound,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface RecuperacionSimulatorToolbarProps {
  onToggleSyncError: () => void;
  isSyncErrorActive: boolean;
  onSimulateTriggerAutorizar: () => void;
  onSimulateTriggerDenegar: () => void;
  onResetDemo: () => void;
  hasSelectedCaso: boolean;
  currentCasoEstado?: string;
}

export function RecuperacionSimulatorToolbar({
  onToggleSyncError,
  isSyncErrorActive,
  onSimulateTriggerAutorizar,
  onSimulateTriggerDenegar,
  onResetDemo,
  hasSelectedCaso,
  currentCasoEstado,
}: RecuperacionSimulatorToolbarProps) {
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
                  Simulador HU ID-08
                </span>
                <Badge tone="primary" appearance="soft" size="sm">
                  Recuperación 2FA
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

          {/* Botones de prueba de casos de uso ID-08 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant={isSyncErrorActive ? "danger" : "outline"}
              size="sm"
              onClick={onToggleSyncError}
              className="h-8 text-xs rounded-xl"
              title="Alterna si la invocación al Identity Platform falla, forzando estado En Conciliación y acceso denegado"
            >
              <ShieldAlert className="size-3.5 mr-1" />
              <span>{isSyncErrorActive ? "Desactivar fallo IdP" : "Simular fallo IdP / Sync"}</span>
            </Button>

            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={onSimulateTriggerAutorizar}
              className="h-8 text-xs rounded-xl font-semibold shadow-xs"
              title="Abre diálogo de autorización con invalidación de sesiones y advertencia"
            >
              <CheckCircle2 className="size-3.5 mr-1" />
              <span>Diálogo Autorizar (Warning)</span>
            </Button>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onSimulateTriggerDenegar}
              className="h-8 text-xs rounded-xl font-semibold shadow-xs"
              title="Abre diálogo de denegación con motivo obligatorio y bloqueo preventivo"
            >
              <XCircle className="size-3.5 mr-1" />
              <span>Diálogo Denegar (Danger)</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetDemo}
              className="h-8 text-xs rounded-xl text-muted-foreground hover:text-foreground ml-auto"
              title="Restablece los casos mock a su estado original"
            >
              <RotateCcw className="size-3 mr-1" />
              <span>Resetear datos</span>
            </Button>
          </div>

          {/* Resumen explicativo de reglas ID-08 */}
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <CheckCircle2 className="size-3 text-warning" /> Autorizar → Warning (Invalida sesiones, bloquea canal, sin clave temporal)
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <XCircle className="size-3 text-danger" /> Denegar → Danger (Motivo ≥ 10 caracteres, bloqueo preventivo)
            </span>
            <span className="inline-flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              <AlertTriangle className="size-3 text-warning" /> Fallo Sync → En Conciliación (Acceso se mantiene denegado)
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
          title="Desplegar simulador de casos HU ID-08"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Simulador HU ID-08</span>
          {isSyncErrorActive && (
            <span className="size-2 rounded-full bg-danger animate-ping" />
          )}
          <ChevronUp className="size-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
