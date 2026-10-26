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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertOctagon,
  Calendar,
  Send,
  Loader2,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import { FuenteDatos } from "../data/fuentes-data";
import { toast } from "sonner";

interface SolicitarBajaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuente: FuenteDatos | null;
  onBajaSolicitada?: (fuenteId: string, motivo: string) => void;
}

export function SolicitarBajaDialog({
  open,
  onOpenChange,
  fuente,
  onBajaSolicitada,
}: SolicitarBajaDialogProps) {
  const [motivoBaja, setMotivoBaja] = useState("OBSOLESCENCIA");
  const [justificacion, setJustificacion] = useState("");
  const [fechaRetiro, setFechaRetiro] = useState("");
  const [planMitigacion, setPlanMitigacion] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!fuente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (justificacion.trim().length < 15) {
      toast.warning("Debe detallar la justificación técnica y legal del retiro (mínimo 15 caracteres).");
      return;
    }
    if (!fechaRetiro) {
      toast.warning("Debe indicar una fecha estimada de cese del servicio.");
      return;
    }
    if (!confirmado) {
      toast.warning("Debe confirmar la solicitud formal de baja.");
      return;
    }

    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      toast.success("Solicitud de baja enviada a Dirección de Gestión", {
        description: `Expediente de baja para ${fuente.nombre} registrado. Se notificará a los consumidores vigentes.`,
      });
      if (onBajaSolicitada) {
        onBajaSolicitada(fuente.id, justificacion);
      }
      onOpenChange(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-w-xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger">
              <AlertOctagon className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-heading font-bold text-lg text-foreground">
                Solicitar baja de fuente
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Trámite exclusivo del responsable autorizado ante la Dirección de Gestión y Registro.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Ficha Resumen */}
          <Card className="p-3 bg-surface-subtle/50 border border-border">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-xs font-bold text-foreground">{fuente.nombre}</p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  ID: {fuente.id} · Coordinador responsable: {fuente.coordinador_nombre}
                </p>
              </div>
              <Badge tone="danger" appearance="soft" size="sm">
                Baja regulada
              </Badge>
            </div>
          </Card>

          {/* Alerta de Impacto */}
          <Alert
            variant="warning"
            icon={<ShieldAlert className="size-4" />}
            title="Aviso de Interoperabilidad Nacional"
          >
            <p className="text-[11px] text-muted-foreground mt-1">
              La solicitud será evaluada por DGR. Toda baja de fuente activa requiere un plazo de transición mínimo de 30 días para no interrumpir trámites ciudadanos dependientes.
            </p>
          </Alert>

          {/* Motivo de la Baja */}
          <div className="space-y-1.5">
            <Label htmlFor="motivoBaja" className="text-xs font-semibold text-foreground">
              Motivo principal del retiro *
            </Label>
            <Select value={motivoBaja} onValueChange={setMotivoBaja}>
              <SelectTrigger id="motivoBaja" className="text-xs">
                <SelectValue placeholder="Seleccione el motivo de baja..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OBSOLESCENCIA" className="text-xs">
                  Obsolescencia tecnológica de la base de datos o API
                </SelectItem>
                <SelectItem value="FUSION_SUSTITUCION" className="text-xs">
                  Sustitución por una fuente unificada o nueva versión mayor
                </SelectItem>
                <SelectItem value="CESE_COMPETENCIA" className="text-xs">
                  Cese de atribución legal o competencia institucional
                </SelectItem>
                <SelectItem value="OTRO" className="text-xs">
                  Otro motivo justificado normativamente
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha propuesta de cese */}
          <div className="space-y-1.5">
            <Label htmlFor="fechaRetiro" className="text-xs font-semibold text-foreground">
              Fecha propuesta de cese definitivo *
            </Label>
            <Input
              id="fechaRetiro"
              type="date"
              value={fechaRetiro}
              onChange={(e) => setFechaRetiro(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          {/* Justificación Detallada */}
          <div className="space-y-1.5">
            <Label htmlFor="justificacionBaja" className="text-xs font-semibold text-foreground">
              Justificación técnico-legal para DGR *
            </Label>
            <Textarea
              id="justificacionBaja"
              rows={3}
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Explique las razones institucionales, normativas o técnicas que motivan la baja definitiva..."
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Plan de Mitigación */}
          <div className="space-y-1.5">
            <Label htmlFor="planMitigacion" className="text-xs font-semibold text-foreground">
              Plan de transición o fuente sustituta para consumidores
            </Label>
            <Input
              id="planMitigacion"
              value={planMitigacion}
              onChange={(e) => setPlanMitigacion(e.target.value)}
              placeholder="Ej: Migración recomendada a la fuente alternativa v2.0"
              className="text-xs"
            />
          </div>

          {/* Checkbox de Confirmación */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-danger/20 bg-danger/5 cursor-pointer select-none">
            <Checkbox
              variant="error"
              checked={confirmado}
              onCheckedChange={(checked) => setConfirmado(!!checked)}
              className="mt-0.5"
            />
            <span className="text-xs text-foreground font-medium">
              Como responsable autorizado de la institución proveedora, solicito formalmente el inicio del proceso de baja regulada de esta fuente ante la DINARP.
            </span>
          </label>

          <DialogFooter className="gap-2 pt-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={enviando}
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              disabled={enviando}
              className="text-xs gap-1.5 shadow-xs"
            >
              {enviando ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              <span>Enviar solicitud de baja</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
