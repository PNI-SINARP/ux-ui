"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ServerCrash,
  RefreshCw,
} from "lucide-react";

interface DinarpActivationSimulatorDrawerProps {
  currentScenario?: string;
  onSelectScenario?: (scenario: string) => void;
}

export function DinarpActivationSimulatorDrawer({
  currentScenario: initialScenario,
  onSelectScenario,
}: DinarpActivationSimulatorDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentScenario =
    initialScenario || searchParams.get("estado") || "valido";
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (scenario: string) => {
    setIsOpen(false);
    if (onSelectScenario) {
      onSelectScenario(scenario);
    } else {
      router.push(`/establecer-contrasena?estado=${scenario}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Botón flotante para alternar apertura / cierre */}
      {!isOpen && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3.5 py-2 h-auto flex items-center gap-2 border border-primary/20 backdrop-blur-md animate-fade-in"
              >
                <Sparkles className="size-4 shrink-0 text-primary-foreground" />
                <span className="text-xs font-semibold">Simulador de activación</span>
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4"
                >
                  ID-09
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Simular estados del enlace de activación inicial
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Panel flotante desplegable */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-surface/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading text-foreground">
                  Simulador de Enlace ID-09
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Prueba los estados y validaciones del enlace de activación
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Opciones de simulación */}
          <div className="py-3 space-y-2 overflow-y-auto max-h-[60vh] pr-1">
            {/* 1. Enlace Válido */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "valido"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-success" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Válido
                  </span>
                </div>
                <Badge tone="success" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Pendiente (1 uso)
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                Enlace vigente, no revocado. Permite definir la contraseña inicial.
              </p>
              <Button
                type="button"
                variant={currentScenario === "valido" ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSelect("valido")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Cargar enlace válido</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* 2. Enlace Vencido */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "vencido"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-destructive" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Vencido
                  </span>
                </div>
                <Badge tone="danger" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Caducado
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                El enlace superó la ventana temporal permitida sin haber sido completado.
              </p>
              <Button
                type="button"
                variant={currentScenario === "vencido" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleSelect("vencido")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Simular enlace vencido</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* 3. Enlace Ya Usado */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "usado"
                  ? "border-warning bg-warning/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-warning" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Ya Usado
                  </span>
                </div>
                <Badge tone="warning" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Consumido
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                El enlace de un solo uso ya fue completado previamente.
              </p>
              <Button
                type="button"
                variant={currentScenario === "usado" ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleSelect("usado")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Simular enlace usado</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* 4. Enlace Revocado */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "revocado"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="size-3.5 text-destructive" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Revocado
                  </span>
                </div>
                <Badge tone="danger" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Anulado
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                El enlace fue revocado por emisión de uno nuevo o decisión administrativa.
              </p>
              <Button
                type="button"
                variant={currentScenario === "revocado" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleSelect("revocado")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Simular enlace revocado</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* 5. Fallo Identity Platform */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "error-identity"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ServerCrash className="size-3.5 text-destructive" />
                  <span className="text-xs font-bold text-foreground">
                    Fallo Identity Platform
                  </span>
                </div>
                <Badge tone="danger" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Error backend
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                Simula rechazo o indisponibilidad en Identity Platform (el enlace no se consume).
              </p>
              <Button
                type="button"
                variant={currentScenario === "error-identity" ? "danger" : "outline"}
                size="sm"
                onClick={() => handleSelect("error-identity")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Probar fallo Identity</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>

            {/* 6. Sincronización Pendiente */}
            <div
              className={`p-2.5 rounded-xl border transition-colors space-y-1.5 ${
                currentScenario === "sync-pendiente"
                  ? "border-warning bg-warning/5"
                  : "border-border bg-background/50 hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="size-3.5 text-warning" />
                  <span className="text-xs font-bold text-foreground">
                    Sincronización Pendiente
                  </span>
                </div>
                <Badge tone="warning" appearance="soft" size="sm" className="text-[9px] px-1.5">
                  Replicación
                </Badge>
              </div>
              <p className="text-[10.5px] text-muted-foreground leading-snug">
                Confirmación exitosa en Identity Platform pero propagación de directorio pendiente.
              </p>
              <Button
                type="button"
                variant={currentScenario === "sync-pendiente" ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleSelect("sync-pendiente")}
                className="w-full text-xs font-semibold justify-between h-7"
              >
                <span>Probar sync pendiente</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
