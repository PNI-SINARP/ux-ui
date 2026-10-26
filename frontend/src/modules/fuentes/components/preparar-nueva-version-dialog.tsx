"use client";

import React, { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import {
  GitFork,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Server,
  Layers,
  Sparkles,
  GitBranch,
  Wrench,
  Database,
} from "lucide-react";
import { FuenteDatos } from "../data/fuentes-data";
import { toast } from "sonner";

interface PrepararNuevaVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuente: FuenteDatos | null;
  onContinuarConfiguracion: (
    fuenteClonada: FuenteDatos,
    nuevaVersion: string,
    tipoCambio: "MAJOR" | "MINOR" | "PATCH",
    justificacion: string
  ) => void;
}

export function PrepararNuevaVersionDialog({
  open,
  onOpenChange,
  fuente,
  onContinuarConfiguracion,
}: PrepararNuevaVersionDialogProps) {
  const [tipoCambio, setTipoCambio] = useState<"MAJOR" | "MINOR" | "PATCH">("MINOR");
  const [versionCalculada, setVersionCalculada] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [declaraIncompatibilidad, setDeclaraIncompatibilidad] = useState(false);

  // Calcular siguiente versión semántica según FUE-06/FUE-07
  useEffect(() => {
    if (!fuente) return;
    const baseVersion = fuente.version_propuesta || "v1.0.0";
    const clean = baseVersion.replace(/^v/, "");
    const parts = clean.split(".").map((n) => parseInt(n, 10) || 0);
    const major = parts[0] ?? 1;
    const minor = parts[1] ?? 0;
    const patch = parts[2] ?? 0;

    if (tipoCambio === "MAJOR") {
      setVersionCalculada(`v${major + 1}.0.0`);
    } else if (tipoCambio === "MINOR") {
      setVersionCalculada(`v${major}.${minor + 1}.0`);
    } else {
      setVersionCalculada(`v${major}.${minor}.${patch + 1}`);
    }
  }, [fuente, tipoCambio]);

  if (!fuente) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (justificacion.trim().length < 10) {
      toast.warning("Debe justificar el cambio semántico (mínimo 10 caracteres).");
      return;
    }
    if (tipoCambio === "MAJOR" && !declaraIncompatibilidad) {
      toast.warning("Debe confirmar que comprende el impacto de la versión incompatible (Breaking change).");
      return;
    }

    const fuenteNuevaVersion: FuenteDatos = {
      ...fuente,
      id: `${fuente.id}-v${versionCalculada.replace(/^v/, "").replace(/\./g, "")}`,
      version_propuesta: versionCalculada,
      estado: "BORRADOR",
      descripcion_fuente: `${fuente.descripcion_fuente} [Nueva versión ${versionCalculada}: ${justificacion}]`,
    };

    onContinuarConfiguracion(fuenteNuevaVersion, versionCalculada, tipoCambio, justificacion);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="space-y-1 shrink-0">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <GitFork className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-heading font-bold text-lg text-foreground">
                  FUE-06 / FUE-07 — Preparar nueva versión de fuente
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Declaración de cambios semánticos y configuración de contrato de interoperabilidad.
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px] font-bold">
                HU: FUE-06/07
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                BPM: Versionado Semántico
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Ficha Resumen de Fuente Original con Ícono */}
          <Card className="p-3.5 bg-surface-subtle/50 border border-border rounded-xl">
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-xs">
                  <Database className="size-5 text-primary" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Fuente original activa
                  </span>
                  <p className="text-xs font-bold text-foreground truncate">{fuente.nombre}</p>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">
                    ID: {fuente.id} · Inst: {fuente.institucion_proveedora_nombre}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge tone="neutral" appearance="outline" size="sm">
                  Versión actual: {fuente.version_propuesta || "v1.0.0"}
                </Badge>
                <Badge tone="success" appearance="soft" size="sm">
                  Publicada
                </Badge>
              </div>
            </div>
          </Card>

          {/* Selección de Tipo de Cambio Semántico */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              Tipo de cambio semántico
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* MINOR */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => setTipoCambio("MINOR")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTipoCambio("MINOR");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-3.5 w-full text-left",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  tipoCambio === "MINOR"
                    ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-xs"
                    : "bg-surface border-border hover:bg-muted/40"
                )}
                innerClassName="p-0 h-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        tipoCambio === "MINOR"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-primary/15 text-primary group-hover:scale-105"
                      )}
                    >
                      <GitBranch className="size-5" />
                    </div>
                    <Badge
                      tone="primary"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      Recomendado
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground font-heading">
                      Menor (MINOR)
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Nuevos campos o parámetros retrocompatibles.
                    </p>
                  </div>
                </div>
              </Card>

              {/* PATCH */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => setTipoCambio("PATCH")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTipoCambio("PATCH");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-3.5 w-full text-left",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  tipoCambio === "PATCH"
                    ? "bg-info/10 border-info ring-2 ring-info/30 shadow-xs"
                    : "bg-surface border-border hover:bg-muted/40"
                )}
                innerClassName="p-0 h-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        tipoCambio === "PATCH"
                          ? "bg-info text-white shadow-xs"
                          : "bg-info/15 text-info group-hover:scale-105"
                      )}
                    >
                      <Wrench className="size-5" />
                    </div>
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      Ajuste técnico
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground font-heading">
                      Parche (PATCH)
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Corrección de conexión o SLA sin alterar contrato.
                    </p>
                  </div>
                </div>
              </Card>

              {/* MAJOR */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => setTipoCambio("MAJOR")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setTipoCambio("MAJOR");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-3.5 w-full text-left",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  tipoCambio === "MAJOR"
                    ? "bg-danger/10 border-danger ring-2 ring-danger/30 shadow-xs"
                    : "bg-surface border-border hover:bg-muted/40"
                )}
                innerClassName="p-0 h-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        tipoCambio === "MAJOR"
                          ? "bg-danger text-white shadow-xs"
                          : "bg-danger/15 text-danger group-hover:scale-105"
                      )}
                    >
                      <AlertTriangle className="size-5" />
                    </div>
                    <Badge
                      tone="danger"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      Incompatible
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground font-heading">
                      Mayor (MAJOR)
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                      Cambio incompatible o eliminación de campos.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Versión Resultante */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="versionResultante" className="text-xs font-semibold text-foreground">
                Cadena de nueva versión resultante
              </Label>
              <Input
                id="versionResultante"
                value={versionCalculada}
                onChange={(e) => setVersionCalculada(e.target.value)}
                className="font-mono text-xs font-bold"
                required
              />
            </div>
            <div className="text-xs text-muted-foreground p-3 rounded-xl bg-surface border border-border">
              Se creará un nuevo expediente técnico en borrador preservando la versión original publicada.
            </div>
          </div>

          {/* Justificación Semántica */}
          <div className="space-y-1.5">
            <Label htmlFor="justificacionVersion" className="text-xs font-semibold text-foreground">
              Justificación técnica y normativa del cambio *
            </Label>
            <Textarea
              id="justificacionVersion"
              rows={3}
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describa el motivo de la nueva versión, qué campos o parámetros cambian y el impacto para los consumidores..."
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Advertencia Breaking Change */}
          {tipoCambio === "MAJOR" && (
            <Alert
              variant="danger"
              icon={<AlertTriangle className="size-4" />}
              title="Cambio Incompatible (Breaking Change)"
            >
              <div className="text-[11px] text-muted-foreground mt-1 space-y-2">
                <p>
                  Esta versión modificará contratos activos. Requerirá una ventana de transición regulada de 90 días para las instituciones consumidoras.
                </p>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground select-none">
                  <Checkbox
                    variant="error"
                    checked={declaraIncompatibilidad}
                    onCheckedChange={(checked) => setDeclaraIncompatibilidad(!!checked)}
                  />
                  <span className="text-xs">Confirmo y declaro el impacto incompatible de este cambio semántico</span>
                </label>
              </div>
            </Alert>
          )}

          {/* Acciones de configuración siguientes */}
          <div className="p-3 rounded-xl bg-surface border border-border space-y-1.5">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              Siguiente paso al iniciar el borrador:
            </p>
            <p className="text-[11px] text-muted-foreground">
              Se abrirá el editor modular para que configure los cambios en la conexión de base de datos, parámetros de consulta y selección de campos a compartir de interoperabilidad.
            </p>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 pt-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-2 shadow-xs"
            >
              <span>Continuar a configurar cambios</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
