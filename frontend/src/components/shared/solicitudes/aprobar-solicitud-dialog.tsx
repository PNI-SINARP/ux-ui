"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Mail, User, Building2, CreditCard, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

interface AprobarSolicitudDialogProps {
  solicitud: SolicitudIngreso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (solicitud: SolicitudIngreso, opcionCaso?: "CASO_A" | "CASO_B") => void;
}

export function AprobarSolicitudDialog({
  solicitud,
  open,
  onOpenChange,
  onConfirm,
}: AprobarSolicitudDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [opcionCaso, setOpcionCaso] = useState<"CASO_A" | "CASO_B">("CASO_B");

  if (!solicitud) return null;

  const isProcesoA = solicitud.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION";
  const isProcesoB = solicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR";
  const isProcesoC = solicitud.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" || solicitud.codigoDocumental === "ARP-R03" || solicitud.id.startsWith("CAM-");

  const title = isProcesoA
    ? "Confirmar Aprobación — Registro Institucional"
    : isProcesoB
    ? "Confirmar Aprobación y Activación"
    : "Confirmar Aprobación — Cambio de Coordinador";

  const description = isProcesoA
    ? "Al aprobar la solicitud, la institución queda dada de alta en el SINARP y sus coordinadores quedarán PRERREGISTRADOS con envío de invitación (no activos aún)."
    : isProcesoB
    ? "Al aprobar el Acuerdo de Confidencialidad (Anexo B), el coordinador queda ACTIVO y podrá iniciar sesión en la plataforma."
    : "Evalúa el expediente de sustitución ARP-R03. Selecciona la condición del nuevo coordinador según posea o no un Anexo B suscrito previamente.";

  const handleApprove = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm(solicitud, opcionCaso);
      onOpenChange(false);

      if (isProcesoA) {
        toast.success("Institución registrada exitosamente.", {
          description: "Se prerregistraron los coordinadores titular y suplente, enviando invitaciones de enrolamiento."
        });
      } else if (isProcesoB) {
        toast.success("Coordinador activado exitosamente.", {
          description: `${solicitud.nombreCompleto} ahora tiene estado ACTIVO para iniciar sesión.`
        });
      } else {
        if (opcionCaso === "CASO_A") {
          toast.success("Cambio de coordinador aplicado exitosamente (Caso A).", {
            description: "El nuevo coordinador cuenta con Anexo B vigente. El cambio entra en vigencia de forma inmediata."
          });
        } else {
          toast.success("Anexo C aprobado — Enrolamiento pendiente (Caso B).", {
            description: "Se remitió la invitación de enrolamiento para que suscriba el Acuerdo (Anexo B)."
          });
        }
      }
    }, 400);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="warning"
      title={title}
      description={description}
      onConfirm={handleApprove}
      confirmText="Confirmar y Aprobar"
      cancelText="Cancelar"
      confirmVariant="warning"
      isLoading={isSubmitting}
      isConfirmDisabled={isSubmitting}
      className="sm:max-w-[500px]"
    >
      <div className="space-y-3 pt-1">
        {/* Badge Código Documental */}
        <div className="flex justify-center">
          <Badge tone="warning" appearance="soft" size="sm" className="border border-warning/30 font-semibold text-[11px]">
            {solicitud.codigoDocumental} · {solicitud.id}
          </Badge>
        </div>

        {/* Resumen de la Solicitud */}
        <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Building2 className="size-3.5 text-muted-foreground" /> Entidad:
            </span>
            <span className="font-bold text-foreground text-right truncate max-w-[220px]">{solicitud.institucion}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <User className="size-3.5 text-muted-foreground" /> Funcionario / Enlace:
            </span>
            <span className="font-semibold text-foreground text-right">{solicitud.nombreCompleto}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <CreditCard className="size-3.5 text-muted-foreground" /> Cédula:
            </span>
            <span className="font-mono font-medium text-foreground">{solicitud.cedula}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Mail className="size-3.5 text-muted-foreground" /> Correo Institucional:
            </span>
            <span className="font-medium text-foreground truncate max-w-[220px]">{solicitud.correo}</span>
          </div>
        </div>

        {/* Selector de Condición de Anexo C (Regla CAM-03: Caso A vs Caso B) */}
        {isProcesoC && (
          <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2.5 text-xs">
            <span className="font-bold text-foreground block text-[11px] uppercase tracking-wider">
              Condición del Nuevo Coordinador (CAM-03)
            </span>
            <div className="space-y-2">
              <label className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all",
                opcionCaso === "CASO_B" ? "border-primary bg-primary/5 text-foreground" : "border-border/70 hover:bg-muted/30 text-muted-foreground"
              )}>
                <input
                  type="radio"
                  name="opcionCaso"
                  checked={opcionCaso === "CASO_B"}
                  onChange={() => setOpcionCaso("CASO_B")}
                  className="mt-0.5 text-primary"
                />
                <div>
                  <strong className="block text-foreground text-xs font-semibold">Caso B — No posee Anexo B suscrito (Recomendado)</strong>
                  <span className="text-[11px] text-muted-foreground">
                    El trámite pasa a estado <strong>&quot;Enrolamiento pendiente&quot;</strong> y se remite la invitación para suscribir el Acuerdo ARP-R02.
                  </span>
                </div>
              </label>

              <label className={cn(
                "flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all",
                opcionCaso === "CASO_A" ? "border-primary bg-primary/5 text-foreground" : "border-border/70 hover:bg-muted/30 text-muted-foreground"
              )}>
                <input
                  type="radio"
                  name="opcionCaso"
                  checked={opcionCaso === "CASO_A"}
                  onChange={() => setOpcionCaso("CASO_A")}
                  className="mt-0.5 text-primary"
                />
                <div>
                  <strong className="block text-foreground text-xs font-semibold">Caso A — Ya posee Anexo B suscrito previamente</strong>
                  <span className="text-[11px] text-muted-foreground">
                    El funcionario ya cuenta con acuerdo vigente. El trámite pasa directamente a estado <strong>&quot;Aplicado&quot;</strong> y sus credenciales quedan activas.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Advertencia Informativa de Confirmación */}
        <div className="p-3 bg-warning/10 rounded-xl border border-warning/30 text-[11px] text-warning-foreground flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-warning-foreground" />
          <span>
            <strong>Garantía operativa:</strong> La aprobación de este trámite preserva íntegros los proyectos, cupos, contratos y credenciales institucionales.
          </span>
        </div>
      </div>
    </ConfirmDialog>
  );
}

