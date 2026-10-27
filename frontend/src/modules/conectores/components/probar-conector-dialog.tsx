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
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Loader2,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";
import { ConectorDefinicion, useConectoresStore, PruebaConector } from "../data/conectores-store";

interface ProbarConectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conector: ConectorDefinicion | null;
}

export function ProbarConectorDialog({
  open,
  onOpenChange,
  conector,
}: ProbarConectorDialogProps) {
  const { probarConector, cambiarEstadoConector } = useConectoresStore();

  const [isLoading, setIsLoading] = useState(false);
  const [simularFallo, setSimularFallo] = useState(false);
  const [resultado, setResultado] = useState<PruebaConector | null>(null);

  if (!conector) return null;

  const handleEjecutarPrueba = async () => {
    setIsLoading(true);
    try {
      const res = await probarConector(conector.id, simularFallo);
      setResultado(res);
    } catch {
      // handled in store toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleHabilitar = () => {
    cambiarEstadoConector(conector.id, "HABILITADO", "Certificación técnica superada en sandbox");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-info/10 text-info rounded-xl shrink-0">
              <Activity className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground">
                Prueba técnica en sandbox de laboratorio
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Verificación de handshake TLS, latencia y compatibilidad de driver según estándar CNX-02.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Ficha técnica rápida */}
          <Card className="p-4 bg-surface border border-border rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground font-heading">
                  {conector.nombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tipo: {conector.tipo} · Versión: {conector.version} · Protocolo: {conector.protocolo}
                </p>
              </div>
              <Badge
                tone={conector.estado === "HABILITADO" ? "success" : conector.estado === "EN_PRUEBAS" ? "warning" : "danger"}
                appearance="soft"
                size="sm"
              >
                {conector.estado}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] block">Puerto:</span>
                <span className="font-mono font-bold">{conector.puertoDefault}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Cifrado:</span>
                <span className="font-semibold">{conector.soportaSsl ? "TLS 1.3" : "Plano"}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Timeout:</span>
                <span className="font-mono font-semibold">{conector.timeoutSegundos}s</span>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] block">Fuentes en uso:</span>
                <span className="font-bold">{conector.fuentesAsociadasCount}</span>
              </div>
            </div>
          </Card>

          {/* Opciones de prueba */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/30">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={simularFallo}
                onCheckedChange={(checked) => setSimularFallo(!!checked)}
              />
              <span className="text-xs text-muted-foreground">
                Simular anomalía de red / fallo de protocolo (para diagnóstico)
              </span>
            </label>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleEjecutarPrueba}
              disabled={isLoading}
              className="gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Ejecutando prueba...
                </>
              ) : (
                <>
                  <Zap className="size-4" />
                  Iniciar Test (CNX-02)
                </>
              )}
            </Button>
          </div>

          {/* Resultado de la prueba */}
          {(resultado || conector.ultimaPrueba) && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-foreground">
                Diagnóstico de la prueba:
              </p>

              {(() => {
                const p = resultado || conector.ultimaPrueba!;
                const isOk = p.resultado === "EXITOSO";
                return (
                  <Alert
                    variant={isOk ? "success" : "danger"}
                    icon={isOk ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                    title={isOk ? `Prueba técnica superada (${p.latenciaMs}ms)` : "Fallo de conexión en sandbox"}
                  >
                    <div className="text-xs mt-1.5 space-y-2">
                      <p className="leading-relaxed">{p.detalle}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
                        <span>Handshake TLS: {p.handshakeTls ? "OK" : "NO"}</span>
                        <span>·</span>
                        <span>Protocolo: {p.protocoloProbado}</span>
                        <span>·</span>
                        <span>Ejecutado: {p.fecha}</span>
                      </div>
                    </div>
                  </Alert>
                );
              })()}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border gap-2 shrink-0">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>

          {conector.estado === "EN_PRUEBAS" && (resultado?.resultado === "EXITOSO" || conector.ultimaPrueba?.resultado === "EXITOSO") && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleHabilitar}
              className="gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              Habilitar en Catálogo (CNX-02)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
