"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, AlertOctagon, Ban } from "lucide-react";
import { ConectorDefinicion, useConectoresStore } from "../data/conectores-store";

interface RetirarConectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conector: ConectorDefinicion | null;
}

export function RetirarConectorDialog({
  open,
  onOpenChange,
  conector,
}: RetirarConectorDialogProps) {
  const { cambiarEstadoConector } = useConectoresStore();

  const [accion, setAccion] = useState<"RETIRADO" | "EN_PRUEBAS">("RETIRADO");
  const [motivo, setMotivo] = useState("Obsolescencia del driver y migración a versión moderna");
  const [justificacion, setJustificacion] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  if (!conector) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmado) return;

    cambiarEstadoConector(
      conector.id,
      accion,
      `${motivo} - ${justificacion.trim()}`
    );

    onOpenChange(false);
    setJustificacion("");
    setConfirmado(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-danger/10 text-danger rounded-xl shrink-0">
              <AlertOctagon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground">
                Gestionar ciclo de vida / Retirar tipo de conector
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Reglamentación técnica CNX-02 para deshabilitar o retirar conectores de la plataforma.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {conector.fuentesAsociadasCount > 0 && (
            <Alert
              variant="warning"
              icon={<AlertTriangle className="size-4" />}
              title="Atención: Conector en uso institucional activo"
            >
              <p className="text-xs mt-1">
                Este conector tiene <strong>{conector.fuentesAsociadasCount} fuentes de información</strong> activas configuradas.
                Si se retira, los nuevos expedientes técnicos no podrán seleccionarlo, pero las conexiones existentes se mantendrán durante el periodo de transición.
              </p>
            </Alert>
          )}

          {/* Acción a tomar */}
          <div className="space-y-1.5">
            <Label htmlFor="accionCiclo" className="text-xs font-semibold text-foreground">
              Acción de ciclo de vida requerida *
            </Label>
            <Select value={accion} onValueChange={(v) => setAccion(v as any)}>
              <SelectTrigger id="accionCiclo" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RETIRADO" className="text-xs">
                  Retirar definitivamente del catálogo (Inhabilitar para nuevas fuentes)
                </SelectItem>
                <SelectItem value="EN_PRUEBAS" className="text-xs">
                  Suspender a estado de Pruebas (Mantenimiento técnico correctivo)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <Label htmlFor="motivoRetiro" className="text-xs font-semibold text-foreground">
              Causa técnica o normativa *
            </Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger id="motivoRetiro" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Obsolescencia del driver y migración a versión moderna" className="text-xs">
                  Obsolescencia del driver y migración a versión moderna
                </SelectItem>
                <SelectItem value="Vulnerabilidad de seguridad CVE reportada en biblioteca cliente" className="text-xs">
                  Vulnerabilidad de seguridad CVE reportada en biblioteca cliente
                </SelectItem>
                <SelectItem value="Sustitución por conector homologado de mayor rendimiento" className="text-xs">
                  Sustitución por conector homologado de mayor rendimiento
                </SelectItem>
                <SelectItem value="Incompatibilidad con nueva versión del sistema operativo o JVM" className="text-xs">
                  Incompatibilidad con nueva versión del sistema operativo o JVM
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justificación */}
          <div className="space-y-1.5">
            <Label htmlFor="justificacionRetiro" className="text-xs font-semibold text-foreground">
              Detalle y plan de contingencia para proveedores *
            </Label>
            <Textarea
              id="justificacionRetiro"
              rows={3}
              placeholder="Describa el motivo técnico y el conector sustituto recomendado para las instituciones proveedoras..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Checkbox confirmación UI Kit */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-danger/25 bg-danger/5 cursor-pointer select-none">
            <Checkbox
              variant="error"
              checked={confirmado}
              onCheckedChange={(checked) => setConfirmado(!!checked)}
              className="mt-0.5"
            />
            <span className="text-xs text-foreground font-medium">
              Confirmo como responsable de TI de DINARP la modificación de estado de disponibilidad del conector {conector.nombre}.
            </span>
          </label>

          <DialogFooter className="gap-2 sm:gap-2 pt-2 shrink-0">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={accion === "RETIRADO" ? "danger" : "primary"}
              size="sm"
              disabled={!confirmado || !justificacion.trim()}
              className="gap-1.5"
            >
              <Ban className="size-4" />
              {accion === "RETIRADO" ? "Confirmar Retiro (CNX-02)" : "Suspender a Pruebas (CNX-02)"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
