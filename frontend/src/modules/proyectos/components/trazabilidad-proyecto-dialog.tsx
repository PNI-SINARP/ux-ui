"use client";

import React, { useMemo } from "react";
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
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import {
  History,
  FolderKanban,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  User,
  CheckCircle2,
  GitBranch,
} from "lucide-react";
import type {
  ProyectoInstitucional,
  HistorialVersionProyecto,
} from "@/modules/proyectos/data/proyectos-store";

interface TrazabilidadProyectoDialogProps {
  proyecto: ProyectoInstitucional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrazabilidadProyectoDialog({
  proyecto,
  open,
  onOpenChange,
}: TrazabilidadProyectoDialogProps) {
  if (!proyecto) return null;

  const cantSolicitudes = proyecto.solicitudes ? proyecto.solicitudes.length : 0;

  // Mapear historial de versiones al formato de TimelineItem
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items = proyecto.historialVersiones || [];
    return items.map((h, index) => {
      const isCurrent = index === 0;
      const isInitial = h.version === 1;

      const motivoText = h.motivo ? `\n\nMotivo del cambio: "${h.motivo}"` : "";
      return {
        id: `version-${h.version}-${h.fecha}`,
        title: isInitial
          ? `Registro inicial del proyecto (v${h.version}.0)`
          : `Actualización de metadatos descriptivos (v${h.version}.0)`,
        description: `Nombre: "${h.nombre}"\n\nPropósito: ${h.proposito}${motivoText}`,
        date: h.fecha,
        status: isCurrent ? "primary" : "neutral",
        statusLabel: isCurrent ? "Versión vigente" : `Versión ${h.version}.0`,
        icon: isInitial ? (
          <Sparkles className="size-4 text-primary" />
        ) : (
          <GitBranch className="size-4 text-secondary" />
        ),
        user: h.modificadoPor || "Coordinador Institucional",
        isCurrent,
      };
    });
  }, [proyecto.historialVersiones]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="sm:max-w-[700px] p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Encabezado */}
        <DialogHeader className="space-y-2 pb-3 border-b border-border/60 shrink-0">
          <div className="flex items-start justify-between w-full gap-3">
            <div className="flex items-center gap-2.5">
              <div className="size-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <History className="size-5" />
              </div>
              <div className="space-y-0.5 text-left">
                <DialogTitle className="text-lg font-heading font-bold text-foreground">
                  Trazabilidad e historial de versiones
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono font-medium text-primary">{proyecto.id}</span>
                  <span>•</span>
                  <span>{proyecto.institucion}</span>
                </div>
              </div>
            </div>

            {/* Pill de estado igual a cuentas-internas */}
            <div className="shrink-0 pt-0.5">
              <Badge tone="success" appearance="soft" size="sm" className="font-bold gap-1.5">
                <span className="size-1.5 rounded-full bg-success"></span>
                ACTIVO
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
            Registro cronológico de creación y actualizaciones de metadatos del proyecto. Las solicitudes de datos vinculadas se conservan inalteradas a lo largo de las versiones.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del Proyecto */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 px-3.5 bg-muted/40 rounded-xl border border-border/80 text-xs shrink-0">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Código ID</span>
            <p className="font-mono font-bold text-foreground">{proyecto.id}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Versión actual</span>
            <div className="flex items-center gap-1">
              <Badge
                tone={proyecto.version > 1 ? "secondary" : "neutral"}
                appearance="soft"
                size="sm"
                className="font-semibold text-[11px] px-2 py-0.5 h-5 inline-flex items-center"
              >
                v{proyecto.version}.0
              </Badge>
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Solicitudes</span>
            <div className="flex items-center gap-1">
              {cantSolicitudes > 0 ? (
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="font-semibold text-[11px] px-2 py-0.5 h-5 inline-flex items-center gap-1"
                >
                  <span className="size-1.5 rounded-full bg-success" />
                  <span>{cantSolicitudes} {cantSolicitudes === 1 ? "solicitud" : "solicitudes"}</span>
                </Badge>
              ) : (
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="font-semibold text-[11px] px-2 py-0.5 h-5 inline-flex items-center text-muted-foreground"
                >
                  0 vinculadas
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[10px] uppercase font-semibold">Creación</span>
            <p className="text-muted-foreground font-mono">{proyecto.fechaCreacion.split(" ")[0]}</p>
          </div>
        </div>

        {/* Contenido con Scroll para el Timeline */}
        <div className="flex-1 overflow-y-auto pr-2 py-3 min-h-0">
          {timelineItems.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No se registran eventos de versiones para este proyecto.
            </div>
          ) : (
            <div className="pl-1">
              <Timeline items={timelineItems} />
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="pt-3 border-t border-border/60 shrink-0 flex justify-end">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
