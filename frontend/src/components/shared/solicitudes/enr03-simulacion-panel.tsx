"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  MailWarning,
  ServerCrash,
  UserX,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { useEnr03SimulationStore } from "@/modules/gestion-solicitudes/data/enr03-store";
import { useSolicitudesIngresoStore } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

export function Enr03SimulacionPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const { activeUser, login } = useAuthStore();
  const sim = useEnr03SimulationStore();
  const store = useSolicitudesIngresoStore();

  const isDirector = activeUser?.role === "DIR_GESTION" || activeUser?.cedula === "1711223344";
  const isRevisor = activeUser?.role === "EQ_GESTION" || activeUser?.cedula === "1111111111";

  const handleSwitchUser = (cedula: "1711223344" | "1111111111") => {
    login(cedula);
    if (cedula === "1711223344") {
      toast.success("Sesión cambiada a Director de Gestión (1711223344)", {
        description: "Permisos habilitados: Asignar y Reasignar Anexo B. No dictamina.",
      });
    } else {
      toast.success("Sesión cambiada a Revisor de Gestión (1111111111)", {
        description: "Permisos habilitados: Resolver Anexos B asignados (Aprobar o Rechazar).",
      });
    }
  };

  const handleNavigateCase = (id: string) => {
    // Si estamos en asignacion-solicitudes o solicitudes-pendientes
    const basePath = pathname?.includes("solicitudes-pendientes")
      ? "/solicitudes-pendientes"
      : "/asignacion-solicitudes";

    router.push(`${basePath}/${id}`);
    toast.info(`Cargando expediente ${id}...`);
  };

  const handleResetData = () => {
    sim.resetSimulation();
    store.resetStore();
    toast.success("Datos y configuraciones de ENR-03 restablecidos", {
      description: "Trámites SOL-ING-008-B, 009-B y 010-B reiniciados a sus estados base.",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-auto">
      {isOpen ? (
        <div className="w-[340px] sm:w-[420px] bg-surface/95 dark:bg-neutral-900/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs">
          {/* Header del Panel */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold font-heading text-foreground text-xs">
                    Simulación ENR-03
                  </h4>
                  <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[9px] px-1 py-0">
                    ARP-R02
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Asignar y resolver Anexo B · Reglas de negocio
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="size-7 rounded-full text-muted-foreground hover:text-foreground"
              title="Cerrar panel de simulación"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>

          {/* 1. Conmutador Rápido de Cuenta y Rol (Director â†” Revisor) */}
          <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-foreground">Cuenta Activa:</span>
              <Badge
                tone={isDirector ? "primary" : isRevisor ? "success" : "neutral"}
                appearance="solid"
                size="sm"
                className="text-[10px] font-mono !text-white"
              >
                {activeUser?.name || "No autenticado"} ({activeUser?.cedula || "N/A"})
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant={isDirector ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSwitchUser("1711223344")}
                className="text-[11px] h-8 font-semibold justify-center"
              >
                <span>Director (1711223344)</span>
              </Button>
              <Button
                type="button"
                variant={isRevisor ? "primary" : "outline"}
                size="sm"
                onClick={() => handleSwitchUser("1111111111")}
                className="text-[11px] h-8 font-semibold justify-center"
              >
                <span>Revisor (1111111111)</span>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              {isDirector && "El Director solo asigna o reasigna. No dictamina aprobación/rechazo."}
              {isRevisor && "El Revisor solo resuelve trámites asignados a su cuenta."}
            </p>
          </div>

          {/* 2. Trámites Anexo B para Pruebas Rápidas */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
              Casos Rápidos de Trámite Anexo B:
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleNavigateCase("SOL-ING-008-B")}
                className="w-full text-left p-2 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary text-[11px]">SOL-ING-008-B</span>
                    <Badge tone="warning" appearance="soft" size="sm" className="text-[9px] py-0 px-1">
                      Por Asignar
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    GAD Municipal de Cuenca · Coordinador Titular
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateCase("SOL-ING-009-B")}
                className="w-full text-left p-2 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary text-[11px]">SOL-ING-009-B</span>
                    <Badge tone="info" appearance="soft" size="sm" className="text-[9px] py-0 px-1">
                      Asignado a Revisor
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    EP Petroecuador · Asignado a Revisor Gestión
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateCase("SOL-ING-010-B")}
                className="w-full text-left p-2 rounded-lg border border-border/80 bg-background/50 hover:bg-muted/40 transition-colors flex items-center justify-between group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-primary text-[11px]">SOL-ING-010-B</span>
                    <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] py-0 px-1">
                      Reasignado
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    IESS · Con historial de reasignación previa
                  </p>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary shrink-0 ml-2" />
              </button>
            </div>
          </div>

          {/* 3. Toggles de Reglas de Negocio y Simulación */}
          <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-2.5">
            <span className="font-bold text-foreground block text-[11px]">
              Condiciones de Negocio Simuladas:
            </span>

            {/* Toggle 1: Sin revisores activos (R2) */}
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <UserX className="size-3 text-warning" />
                  <span>Sin revisores activos (R2)</span>
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Alerta al Director y bloquea asignación.
                </p>
              </div>
              <Switch
                checked={sim.sinRevisoresActivos}
                onCheckedChange={(checked) => {
                  sim.setSinRevisoresActivos(checked);
                  toast.info(checked ? "Modo 'Sin revisores activos' activado" : "Revisores activos restaurados");
                }}
              />
            </div>

            {/* Toggle 2: Simular fallo de guardado (R5) */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <ServerCrash className="size-3 text-danger" />
                  <span>Fallo de guardado (R5)</span>
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Muestra alerta de reintento y no guarda.
                </p>
              </div>
              <Switch
                checked={sim.simularFalloGuardado}
                onCheckedChange={(checked) => {
                  sim.setSimularFalloGuardado(checked);
                  toast.info(checked ? "Modo 'Fallo de guardado' activado" : "Fallo de guardado desactivado");
                }}
              />
            </div>

            {/* Toggle 3: Notificación pendiente de envío (R10) */}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground flex items-center gap-1 text-[11px]">
                  <MailWarning className="size-3 text-warning" />
                  <span>Contingencia de correo (R10)</span>
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Alerta desacoplada de correo al resolver.
                </p>
              </div>
              <Switch
                checked={sim.simularNotificacionPendiente}
                onCheckedChange={(checked) => {
                  sim.setSimularNotificacionPendiente(checked);
                  toast.info(checked ? "Modo 'Contingencia de correo' activado" : "Servicio de correo normal");
                }}
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="text-[11px] h-7 gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>Restablecer todo</span>
            </Button>

            <span className="text-[10px] text-muted-foreground font-mono">
              ENR-03 v1.0 · DINARP
            </span>
          </div>
        </div>
      ) : (
        /* Botón Colapsado Estilo Píldora de Simulación */
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs bg-surface/95 backdrop-blur-md border border-border hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
          title="Desplegar opciones de simulación ENR-03"
        >
          <Sparkles className="size-3.5 text-primary" />
          <span className="font-semibold text-foreground">Simulación ENR-03</span>
          <ChevronUp className="size-3.5 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
