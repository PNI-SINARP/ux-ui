"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Mail,
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  KeyRound,
} from "lucide-react";

interface DinarpRecoverySimulatorDrawerProps {
  cedula?: string;
}

export function DinarpRecoverySimulatorDrawer({
  cedula = "1712345602",
}: DinarpRecoverySimulatorDrawerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

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
                <Mail className="size-4 shrink-0" />
                <span className="text-xs font-semibold">Simulador de correo</span>
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4"
                >
                  2 enlaces
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Simular enlaces de recuperación recibidos por correo
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
                <KeyRound className="size-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-heading text-foreground">
                  Simulador de Canal Registrado
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Simula los enlaces temporales recibidos por el funcionario
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
          <div className="py-3 space-y-2.5">
            {/* Opción 1: Enlace Válido */}
            <div className="p-3 rounded-xl border border-border bg-background/50 hover:bg-muted/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Válido
                  </span>
                </div>
                <Badge tone="success" appearance="soft" size="sm" className="text-[10px] px-2">
                  Vigente (1 uso)
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Permite ingresar nueva contraseña respetando los requisitos de seguridad vigentes.
              </p>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  router.push(
                    `/restablecer-contrasena?token=tok_${cedula || "1712345602"}_valid`
                  );
                }}
                className="w-full text-xs font-semibold justify-between h-8 shadow-xs"
              >
                <span>Probar enlace válido</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </div>

            {/* Opción 2: Enlace Vencido o No Válido */}
            <div className="p-3 rounded-xl border border-border bg-background/50 hover:bg-muted/40 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-4 text-destructive" />
                  <span className="text-xs font-bold text-foreground">
                    Enlace Vencido / No Válido
                  </span>
                </div>
                <Badge tone="danger" appearance="soft" size="sm" className="text-[10px] px-2">
                  Expirado
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Muestra la vista de “Enlace vencido o no válido” y permite “Solicitar otro”.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/restablecer-contrasena?token=expired");
                }}
                className="w-full text-xs font-semibold justify-between h-8 border-border"
              >
                <span>Probar enlace vencido</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
