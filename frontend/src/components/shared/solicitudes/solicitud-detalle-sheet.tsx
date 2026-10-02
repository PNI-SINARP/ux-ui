"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  CreditCard,
  Mail,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  UserCheck,
  FileText,
  Check,
  History
} from "lucide-react";
import { type SolicitudIngreso, getEstadoBadgeProps } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

interface SolicitudDetalleSheetProps {
  solicitud: SolicitudIngreso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproveClick: (solicitud: SolicitudIngreso) => void;
  onRejectClick: (solicitud: SolicitudIngreso) => void;
}

export function SolicitudDetalleSheet({
  solicitud,
  open,
  onOpenChange,
  onApproveClick,
  onRejectClick,
}: SolicitudDetalleSheetProps) {
  if (!solicitud) return null;

  const isPendiente = solicitud.estado === "Pendiente" || solicitud.estado === "PENDIENTE_ASIGNACION_GESTION" || solicitud.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD";
  const isAprobada = solicitud.estado === "Aprobada" || solicitud.estado === "APROBADO_FINAL";
  const isRechazada = solicitud.estado === "Rechazada";
  const badgeProps = getEstadoBadgeProps(solicitud.estado, solicitud.revisionIniciada);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col h-full bg-surface border-l border-border shadow-2xl"
      >
        {/* Header Superior del Sheet */}
        <div className="p-6 border-b border-border/70 shrink-0 bg-surface/50">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="font-mono text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {solicitud.id}
            </span>
            <Badge
              tone={badgeProps.tone}
              appearance="soft"
              size="sm"
              dot
              className="font-semibold text-[11px] normal-case tracking-normal whitespace-nowrap px-2.5 py-0.5 inline-flex shrink-0 shadow-2xs"
            >
              <span>{badgeProps.label}</span>
            </Badge>
          </div>

          <SheetTitle className="text-xl font-bold font-heading text-foreground">
            Detalle de solicitud de acceso
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground mt-1">
            Información enviada por el usuario desde el prerregistro de la plataforma.
          </SheetDescription>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Bloque Estado Dinámico (Aprobada / Rechazada / Pendiente) */}
          {isAprobada && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-foreground" />
                <span>Solicitud aprobada</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                El acceso fue autorizado. El usuario puede iniciar sesión en la plataforma utilizando su número de cédula y contraseña registrada.
              </p>
              <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de aprobación:</span>
                  <p className="font-semibold text-foreground">{solicitud.fechaRevision || "No registrada"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Aprobado por:</span>
                  <p className="font-semibold text-foreground">{solicitud.revisor || "Dirección de Gestión y Registro"}</p>
                </div>
              </div>
            </div>
          )}

          {isRechazada && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <XCircle className="size-4 shrink-0 text-muted-foreground" />
                <span>Solicitud rechazada</span>
              </div>

              {/* Motivo del Rechazo Destacado */}
              <div className="p-3 bg-surface rounded-xl border border-border text-xs">
                <span className="font-semibold text-foreground block mb-1">
                  Motivo del rechazo:
                </span>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {solicitud.motivoRechazo || "No se especificó motivo de rechazo."}
                </p>
              </div>

              <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de rechazo:</span>
                  <p className="font-semibold text-foreground">{solicitud.fechaRevision || "No registrada"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisado por:</span>
                  <p className="font-semibold text-foreground">{solicitud.revisor || "Dirección de Gestión y Registro"}</p>
                </div>
              </div>
            </div>
          )}

          {solicitud.estado === "INSTITUCION_ACTIVA" && (
            <div className="p-3.5 rounded-2xl bg-success/10 border border-success/30 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-success">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Institución Activa (INS-07 Concluido)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Resolución firmada en FirmaEC por la Máxima Autoridad. Institución habilitada plenamente e invitaciones independientes emitidas a los coordinadores (PAR-05).
              </p>
              <div className="pt-1.5 border-t border-success/20 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Resolución:</span>
                  <span className="font-mono font-bold text-foreground">{solicitud.resolucion || "RES-DINARP-2026-0042"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Invitaciones B:</span>
                  <span className="text-primary font-medium">2 invitaciones vigentes</span>
                </div>
              </div>
            </div>
          )}

          {solicitud.estado === "PENDIENTE_DE_FIRMA" && (
            <div className="p-3.5 rounded-2xl bg-warning/10 border border-warning/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Clock className="size-4 text-warning shrink-0" />
                <span>INS-07: Pendiente de Firma por Máxima Autoridad</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Resolución institucional generada. Esperando suscripción externa oficial mediante FirmaEC.
              </p>
            </div>
          )}

          {isPendiente && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
              <Clock className="size-4 text-foreground mt-0.5 shrink-0" />
              <span>
                Esta solicitud se encuentra <strong className="text-foreground">pendiente de revisión</strong>. Como revisor de la Dirección de Gestión y Registro, evalúa la pertinencia institucional para autorizar o denegar el acceso.
              </span>
            </div>
          )}

          {/* 1. Información Personal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pb-1 border-b border-border/60">
              <User className="size-3.5" /> Información Personal
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Cédula de Identidad</span>
                <span className="font-mono font-bold text-sm text-foreground">{solicitud.cedula}</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Nombres</span>
                <span className="font-semibold text-foreground">{solicitud.nombres}</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/60 sm:col-span-2">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Apellidos</span>
                <span className="font-semibold text-foreground">{solicitud.apellidos}</span>
              </div>
            </div>
          </div>

          {/* 2. Información Institucional */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pb-1 border-b border-border/60">
              <Building2 className="size-3.5" /> Información Institucional
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Correo institucional</span>
                  <span className="font-medium text-foreground">{solicitud.correo}</span>
                </div>
                <Mail className="size-4 text-muted-foreground" />
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-muted-foreground block mb-0.5">Institución perteneciente</span>
                  <span className="font-medium text-foreground">{solicitud.institucion}</span>
                </div>
                <Building2 className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* 3. Información de la Solicitud */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pb-1 border-b border-border/60">
              <Calendar className="size-3.5" /> Datos de la Solicitud
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Fecha y hora de prerregistro</span>
                <span className="font-mono font-medium text-foreground">{solicitud.fechaSolicitud}</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                <span className="text-[11px] text-muted-foreground block mb-0.5">Canal de origen</span>
                <span className="font-medium text-foreground">Portal Web DINARP (/login)</span>
              </div>
            </div>
          </div>

          {/* Historial del Trámite */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 pb-1 border-b border-border/60">
              <History className="size-3.5 text-primary" /> Historial del Trámite ({solicitud.id})
            </h3>

            <div className="relative pl-6 space-y-3.5 my-2 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              {/* Evento 1: Solicitud recibida */}
              <div className="relative group">
                <div className="absolute -left-6 top-1 size-3 rounded-full bg-primary ring-4 ring-primary/10" />
                <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Solicitud recibida</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{solicitud.fechaSolicitud}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Ingreso del trámite en Portal Web DINARP</p>
                </div>
              </div>

              {/* Eventos dinámicos del historial */}
              {solicitud.historial && solicitud.historial.length > 0 ? (
                solicitud.historial.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 size-3 rounded-full bg-info ring-4 ring-info/10" />
                    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{item.accion}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{item.fechaHora}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Realizado por: <strong className="text-foreground">{item.realizadoPor}</strong>
                      </p>
                      {item.detalles && <p className="text-[10px] text-muted-foreground">{item.detalles}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {solicitud.revisorGestion && (
                    <div className="relative group">
                      <div className="absolute -left-6 top-1 size-3 rounded-full bg-info ring-4 ring-info/10" />
                      <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">Asignada a {solicitud.revisorGestion}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{solicitud.fechaAsignacionGestion || "Fecha registrada"}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Realizado por: <strong className="text-foreground">Director Área de Gestión</strong></p>
                      </div>
                    </div>
                  )}
                  {solicitud.revisorNormatividad && (
                    <div className="relative group">
                      <div className="absolute -left-6 top-1 size-3 rounded-full bg-primary ring-4 ring-primary/10" />
                      <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 text-xs space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">Asignada a {solicitud.revisorNormatividad}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{solicitud.fechaAsignacionNormatividad || "Fecha registrada"}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">Realizado por: <strong className="text-foreground">Director Área de Normatividad</strong></p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 4. Documentos Habilitantes Adjuntos */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between pb-1 border-b border-border/60">
              <span className="flex items-center gap-2">
                <FileText className="size-3.5 text-foreground" /> Documentación Habilitante (3 Requeridos)
              </span>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px] border border-border text-foreground">
                3 de 3 cargados
              </Badge>
            </h3>
            <div className="space-y-2 text-xs">
              {(solicitud.documentos && solicitud.documentos.length > 0 ? solicitud.documentos : [
                "Cambio de Coordinador institucional titular y/o suplente",
                "Acuerdo de Uso y Confidencialidad",
                "Solicitud de acceso al DINARP"
              ]).map((docName: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/20 border border-border/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="size-7 rounded-lg bg-muted text-foreground border border-border font-bold text-[10px] flex items-center justify-center shrink-0">
                      PDF
                    </span>
                    <div className="truncate">
                      <p className="font-semibold text-foreground text-xs truncate">{docName}</p>
                      <span className="text-[10px] text-muted-foreground">Formato PDF firmado electrónicamente</span>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm" className="shrink-0 text-[10px] border border-border text-foreground">
                    <Check className="size-3 mr-1" /> Adjunto
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Nota de Seguridad de Contraseña */}
          <div className="p-3 rounded-xl bg-surface border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="size-4 text-foreground shrink-0" />
            <span>
              <strong className="text-foreground">Protección de credenciales:</strong> Por razones de seguridad y privacidad, la contraseña registrada en el prerregistro se almacena cifrada y no es visible para el revisor.
            </span>
          </div>
        </div>

        {/* Footer con Acciones (si está Pendiente) */}
        {isPendiente ? (
          <div className="p-4 border-t border-border/70 bg-surface shrink-0 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRejectClick(solicitud)}
              className="text-xs font-semibold border-border text-foreground hover:bg-muted gap-1.5"
            >
              <XCircle className="size-3.5" />
              <span>Rechazar</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onApproveClick(solicitud)}
              className="text-xs font-semibold gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Aprobar acceso</span>
            </Button>
          </div>
        ) : (
          <div className="p-4 border-t border-border/70 bg-surface shrink-0 flex items-center justify-between text-xs text-muted-foreground">
            <span>Esta solicitud ya fue gestionada.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold"
            >
              Cerrar
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
