"use client";

import React, { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Send, CheckCircle2, UserCheck, Calendar } from "lucide-react";
import { FuenteDatos } from "../data/fuentes-data";
import { useFuentesStore } from "../data/fuentes-store";
import { toast } from "sonner";

interface FuenteObservacionesAlertProps {
  fuente: FuenteDatos;
  coordinadorNombre: string;
}

export function FuenteObservacionesAlert({
  fuente,
  coordinadorNombre,
}: FuenteObservacionesAlertProps) {
  const { enviarARevision } = useFuentesStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [respuestaNotas, setRespuestaNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (fuente.estado !== "DEVUELTA") return null;

  const handleReenviar = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      enviarARevision(
        fuente.id,
        coordinadorNombre,
        "Coordinador SINARP"
      );
      setIsSubmitting(false);
      setIsDialogOpen(false);
      toast.success("Fuente reenviada a revisión de Gestión", {
        description: "Se notificó al equipo de Gestión para una nueva clasificación y validación.",
      });
    }, 600);
  };

  const fechaFormateada = fuente.fecha_observacion
    ? new Date(fuente.fecha_observacion).toLocaleString("es-EC", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Reciente";

  return (
    <>
      <div className="rounded-xl border border-warning/40 bg-warning/5 p-4 text-foreground shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-warning/10 rounded-lg text-warning shrink-0 mt-0.5">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-bold text-sm text-warning-foreground">
                  Fuente devuelta con observaciones por Gestión
                </span>
                <span className="text-[11px] font-medium text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border flex items-center gap-1">
                  <Calendar className="size-3" />
                  {fechaFormateada}
                </span>
                {fuente.revisor_gestion && (
                  <span className="text-[11px] font-medium text-muted-foreground bg-surface px-2 py-0.5 rounded border border-border flex items-center gap-1">
                    <UserCheck className="size-3" />
                    {fuente.revisor_gestion}
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-sans bg-background/60 p-3 rounded-lg border border-border/60">
                {fuente.observaciones_gestion ||
                  "Se requieren ajustes en los parámetros de consulta o en el esquema de datos antes de proceder con la aprobación."}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Revise la configuración de campos, parámetros y datos de prueba. Una vez corregidos los puntos observados, reenvíe la fuente a revisión.
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2 shadow-xs"
            >
              <Send className="size-3.5" />
              Reenviar a revisión
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">Reenviar fuente a Gestión</DialogTitle>
            <DialogDescription className="text-xs">
              Confirme que ha subsanado las observaciones técnicas indicadas por el Área de Gestión antes de proceder.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3 bg-muted/30 rounded-lg border border-border text-xs space-y-1">
              <span className="font-semibold text-muted-foreground block text-[11px]">
                Observación formulada:
              </span>
              <p className="text-foreground">{fuente.observaciones_gestion}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="respuesta" className="text-xs font-medium">
                Nota de subsanación o cambios aplicados (Opcional)
              </Label>
              <Textarea
                id="respuesta"
                rows={3}
                placeholder="Describa brevemente las correcciones realizadas en los campos o parámetros..."
                value={respuestaNotas}
                onChange={(e) => setRespuestaNotas(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleReenviar}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <span>Reenviando...</span>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" />
                  Confirmar reenvío
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
