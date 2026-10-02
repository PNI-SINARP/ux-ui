"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Users,
  FileText,
  CheckSquare,
  ShieldAlert,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Info,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AreaDinarp, ImpactoArea } from "../data/areas-types";
import { cn } from "@/lib/utils";

interface AreaImpactoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaDinarp | null;
  impacto: ImpactoArea | null;
  isInactivating?: boolean; // Si es true, es el flujo para inactivar. Si false, solo ver impacto.
  onConfirmInactivar?: (motivo: string) => void;
  onSimularResolucion?: (areaId: string) => void;
}

export function AreaImpactoDialog({
  open,
  onOpenChange,
  area,
  impacto,
  isInactivating = false,
  onConfirmInactivar,
  onSimularResolucion,
}: AreaImpactoDialogProps) {
  const [motivo, setMotivo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  if (!area || !impacto) return null;

  const handleInactivarSubmit = () => {
    if (!impacto.puedeInactivar) {
      toast.error("Inactivación denegada", {
        description: "Existen obligaciones vigentes que impiden la inactivación del área orgánica.",
      });
      return;
    }

    if (!motivo.trim()) {
      setErrorMotivo("El motivo de inactivación es obligatorio.");
      return;
    }
    if (motivo.trim().length < 10) {
      setErrorMotivo("El motivo debe tener al menos 10 caracteres.");
      return;
    }

    onConfirmInactivar?.(motivo.trim());
    onOpenChange(false);
    setMotivo("");
    setErrorMotivo("");
  };

  const cuentasActivas = area.usuarios.filter((u) => u.estado !== "RETIRADO");
  const tramitesVigentes = area.tramites.filter((t) => t.vigente && t.estado !== "Cerrado");
  const tareasVigentes = area.tareas.filter((t) => t.vigente && t.estado !== "Completada");

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(op) => {
        onOpenChange(op);
        if (!op) {
          setMotivo("");
          setErrorMotivo("");
        }
      }}
      variant={isInactivating ? "danger" : "info"}
      icon={
        isInactivating ? (
          <Ban className="size-10 text-danger stroke-[2px]" />
        ) : (
          <ShieldAlert className="size-10 text-primary stroke-[2px]" />
        )
      }
      title={
        isInactivating
          ? `Inactivar Área: ${area.nombre}`
          : `Matriz de Impacto: ${area.nombre}`
      }
      description={
        isInactivating
          ? "El área orgánica dejará de admitir nuevas cuentas ni trámites. Se preservará su histórico para auditoría."
          : "Inspección de dependencias, expedientes y cuentas asignadas a esta unidad orgánica."
      }
      confirmText={isInactivating ? "Inactivar área" : "Entendido"}
      cancelText={isInactivating ? "Cancelar" : ""}
      confirmVariant={isInactivating ? "danger" : "primary"}
      isConfirmDisabled={
        isInactivating ? !impacto.puedeInactivar || motivo.trim().length < 10 : false
      }
      onConfirm={isInactivating ? handleInactivarSubmit : () => onOpenChange(false)}
      size="lg"
      className="sm:max-w-[620px]"
    >
      <div className="space-y-4 pt-1 text-left w-full">
        {/* Resumen del Área */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface border border-border text-xs">
          <div className="min-w-0">
            <span className="text-muted-foreground block text-[11px] font-medium">Área Orgánica:</span>
            <span className="font-semibold text-foreground break-words block text-xs sm:text-sm">
              {area.nombre}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground block mt-0.5">
              Código: {area.codigo} · Versión: {area.version}
            </span>
          </div>
          <div className="min-w-0 space-y-1">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Estado institucional:</span>
              <Badge tone={area.estado === "Activa" ? "success" : "warning"} appearance="soft" size="sm">
                {area.estado}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Responsable:</span>
              <span className="font-medium text-foreground truncate block">
                {area.responsableNombre}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de bloqueo si existen obligaciones vigentes */}
        {isInactivating && !impacto.puedeInactivar && (
          <Alert
            variant="danger"
            icon={<Lock className="size-5" />}
            title="Inactivación Bloqueada: Existen Obligaciones Vigentes"
          >
            <div className="space-y-2 mt-1">
              <p className="text-xs">
                Por normativa institucional, no se permite inactivar un área con recursos o compromisos en curso.
                Debe resolver o reasignar las siguientes obligaciones antes de proceder:
              </p>
              <ul className="list-disc list-inside text-xs space-y-1 font-medium">
                {impacto.motivosBloqueo.map((mot, idx) => (
                  <li key={idx} className="text-danger-700 dark:text-danger-300">
                    {mot}
                  </li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {/* Alerta de confirmación permitida cuando no hay obligaciones */}
        {isInactivating && impacto.puedeInactivar && (
          <Alert
            variant="warning"
            icon={<AlertTriangle className="size-5" />}
            title="Atención: Esta acción retirará el área de operación"
          >
            <p className="text-xs mt-1">
              El área orgánica no tiene obligaciones activas pendientes. Al inactivarla, dejará de aparecer inmediatamente
              en los selectores de enrolamiento y creación de cuentas (ID-01 e ID-02).
            </p>
          </Alert>
        )}

        {/* Tarjetas resumen de las 3 dimensiones de impacto */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Cuentas vinculadas */}
          <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Cuentas vinculadas</span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-foreground">
                {cuentasActivas.length}
              </span>
              <span className="text-[11px] text-muted-foreground">activas</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {cuentasActivas.length === 0
                ? "Sin cuentas activas asociadas."
                : `${cuentasActivas.length} usuario(s) institucional(es).`}
            </p>
          </div>

          {/* 2. Trámites vigentes */}
          <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Trámites en curso</span>
              <FileText className="size-4 text-warning" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-foreground">
                {tramitesVigentes.length}
              </span>
              <span className="text-[11px] text-muted-foreground">pendientes</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {tramitesVigentes.length === 0
                ? "Sin expedientes activos."
                : `${tramitesVigentes.length} trámite(s) en resolución.`}
            </p>
          </div>

          {/* 3. Tareas operativas */}
          <div className="p-3.5 rounded-xl bg-surface border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Tareas operativas</span>
              <CheckSquare className="size-4 text-info" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-heading text-foreground">
                {tareasVigentes.length}
              </span>
              <span className="text-[11px] text-muted-foreground">en curso</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {tareasVigentes.length === 0
                ? "Sin tareas asignadas."
                : `${tareasVigentes.length} actividad(es) operativa(s).`}
            </p>
          </div>
        </div>

        {/* Desglose detallado de obligaciones */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-foreground">
            Detalle de dependencias y obligaciones operativas
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {/* Cuentas vinculadas */}
            {cuentasActivas.length > 0 && (
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="size-3.5 text-primary" />
                    <span>Cuentas con asignación activa:</span>
                  </span>
                  <Badge tone="danger" appearance="soft" size="sm">
                    {cuentasActivas.length} cuentas
                  </Badge>
                </div>
                <div className="space-y-1 pl-5">
                  {cuentasActivas.map((u) => (
                    <div key={u.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground">{u.nombreCompleto}</span>
                      <span className="text-muted-foreground font-mono">{u.correo}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trámites vigentes */}
            {tramitesVigentes.length > 0 && (
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-warning" />
                    <span>Trámites registrales no cerrados:</span>
                  </span>
                  <Badge tone="danger" appearance="soft" size="sm">
                    {tramitesVigentes.length} trámites
                  </Badge>
                </div>
                <div className="space-y-1 pl-5">
                  {tramitesVigentes.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-primary font-bold">{t.codigo}</span>
                      <span className="text-foreground truncate max-w-[200px]">{t.asunto}</span>
                      <Badge tone="warning" appearance="soft" size="sm">
                        {t.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tareas vigentes */}
            {tareasVigentes.length > 0 && (
              <div className="p-2.5 rounded-lg bg-surface border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <CheckSquare className="size-3.5 text-info" />
                    <span>Tareas operativas en curso:</span>
                  </span>
                  <Badge tone="danger" appearance="soft" size="sm">
                    {tareasVigentes.length} tareas
                  </Badge>
                </div>
                <div className="space-y-1 pl-5">
                  {tareasVigentes.map((tar) => (
                    <div key={tar.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground truncate max-w-[240px]">{tar.titulo}</span>
                      <span className="text-muted-foreground text-[10px]">
                        Límite: {tar.fechaLimite}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {impacto.totalObligaciones === 0 && (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center space-y-1">
                <CheckCircle2 className="size-5 text-success mx-auto" />
                <p className="text-xs font-bold text-success">
                  Área libre de compromisos u obligaciones pendientes
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No existen funcionarios asignados ni trámites sin resolver en esta unidad orgánica.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Herramienta de simulación de resolución para QA/Demostración */}
        {!impacto.puedeInactivar && onSimularResolucion && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span>Simulador de desbloqueo (Ambiente de pruebas)</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Simula la transferencia de cuentas y el cierre de trámites/tareas para desbloquear la inactivación.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                onSimularResolucion(area.id);
                toast.success("Obligaciones resueltas en simulación", {
                  description: "Se cerraron los trámites y se reasignaron los usuarios vinculados.",
                });
              }}
              className="text-xs shrink-0"
            >
              Resolver obligaciones
            </Button>
          </div>
        )}

        {/* Formulario de motivo si está en flujo de inactivación */}
        {isInactivating && (
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="motivo-inactivar" className="text-xs font-semibold text-foreground">
              Motivo de inactivación (Trazabilidad obligatoria) <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="motivo-inactivar"
              rows={2}
              state={errorMotivo ? "error" : "default"}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (errorMotivo) setErrorMotivo("");
              }}
              disabled={!impacto.puedeInactivar}
              placeholder="EJ: Reestructuración institucional según Resolución DINARP-2026-04..."
              className="text-xs min-h-[64px] resize-none"
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Mínimo 10 caracteres. Se registrará en la auditoría inmutable de la institución.</span>
              <span className={cn(motivo.trim().length >= 10 ? "text-success font-semibold" : "text-muted-foreground")}>
                {motivo.trim().length}/10
              </span>
            </div>
            {errorMotivo && (
              <div className="flex items-center gap-1 text-danger text-[11px]">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errorMotivo}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ConfirmDialog>
  );
}
