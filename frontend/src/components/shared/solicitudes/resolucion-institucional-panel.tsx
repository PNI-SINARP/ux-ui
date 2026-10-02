"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileSignature,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Clock,
  User,
  Building2,
  Calendar,
  Eye,
  Download,
  AlertCircle,
  ShieldCheck,
  Mail,
  Send,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { SolicitudIngreso, getEstadoBadgeProps } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { toast } from "sonner";

interface ResolucionInstitucionalPanelProps {
  solicitud: SolicitudIngreso;
  currentUserName: string;
  onIniciarGeneracion: (solicitudId: string) => void;
  onFalloGeneracion: (solicitudId: string, causa: string) => void;
  onReintentarGeneracion: (solicitudId: string) => void;
  onCompletarFirmaResolucion?: (solicitudId: string, exitosa: boolean, firmante?: string, motivoFallo?: string) => void;
  onPreviewDocumento?: (titulo: string, archivo: string) => void;
}

export function ResolucionInstitucionalPanel({
  solicitud,
  currentUserName,
  onIniciarGeneracion,
  onFalloGeneracion,
  onReintentarGeneracion,
  onCompletarFirmaResolucion,
  onPreviewDocumento
}: ResolucionInstitucionalPanelProps) {
  const router = useRouter();
  
  const [isFalloModalOpen, setIsFalloModalOpen] = useState(false);
  const [isFirmaExitoModalOpen, setIsFirmaExitoModalOpen] = useState(false);
  const [isFirmaFalloModalOpen, setIsFirmaFalloModalOpen] = useState(false);
  const [causaFalloInput, setCausaFalloInput] = useState("");
  const [causaFirmaFalloInput, setCausaFirmaFalloInput] = useState("");


  const numResolucionSugerido = React.useMemo(() => {
    return solicitud.resolucion || `RES-DINARP-2026-${String(Math.floor(100 + Math.random() * 900))}`;
  }, [solicitud.resolucion]);

  const { estado } = solicitud;
  const { tone, label } = getEstadoBadgeProps(estado, solicitud.revisionIniciada);



  const handleConfirmFallo = () => {
    if (!causaFalloInput.trim()) {
      toast.error("Debes ingresar la causa del fallo de generación.");
      return;
    }
    onFalloGeneracion(solicitud.id, causaFalloInput.trim());
    setIsFalloModalOpen(false);
    toast.warning("Generación pendiente registrada", {
      description: "El trámite se mantiene en estado pendiente con causa registrada para posterior atención."
    });
  };

  const handleConfirmFirmaExito = () => {
    if (onCompletarFirmaResolucion) {
      onCompletarFirmaResolucion(solicitud.id, true, "Mgs. Christian Ruiz (Director Nacional)");
      setIsFirmaExitoModalOpen(false);
      toast.success("Resolución firmada y verificada en FirmaEC", {
        description: "Institución activada exitosamente y 2 invitaciones independientes generadas (PAR-05)."
      });
    }
  };

  const handleConfirmFirmaFallo = () => {
    const motivo = causaFirmaFalloInput.trim() || "FirmaEC reportó error en la estampa de tiempo o certificado digital no revocado pendiente de validación.";
    if (onCompletarFirmaResolucion) {
      onCompletarFirmaResolucion(solicitud.id, false, undefined, motivo);
      setIsFirmaFalloModalOpen(false);
      toast.error("Firma de resolución no completada en FirmaEC", {
        description: "La institución permanece en estado pendiente y no se habilitan invitaciones B."
      });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
      {/* Cabecera del Panel */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
            <FileSignature className="size-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-heading font-bold text-sm text-foreground truncate">
              Resolución Institucional
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Responsable: <strong className="text-foreground">{solicitud.revisorNormatividad || currentUserName}</strong>
            </p>
          </div>
        </div>
        <Badge tone={tone} appearance="soft" size="sm" dot className="font-semibold text-[11px] shrink-0">
          {label}
        </Badge>
      </div>

      {/* Tarjeta Contextual de la Solicitud */}
      <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs space-y-2">
        <div className="flex justify-between items-start gap-2 text-[11px]">
          <span className="text-muted-foreground shrink-0">Institución requirente:</span>
          <strong className="text-foreground text-right truncate">{solicitud.institucion}</strong>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Fecha recepción:</span>
          <span className="font-mono text-foreground font-medium">{solicitud.fechaSolicitud}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Aprobación Gestión:</span>
          <span className="font-mono text-foreground font-medium">{solicitud.fechaAprobacionGestion || "Aprobado"}</span>
        </div>
        {solicitud.fechaAsignacionNormatividad && (
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Asignación Normatividad:</span>
            <span className="font-mono text-foreground font-medium">{solicitud.fechaAsignacionNormatividad}</span>
          </div>
        )}
      </div>

      {/* CASO 1: PENDIENTE DE GENERAR RESOLUCIÓN */}
      {estado === "PENDIENTE_GENERAR_RESOLUCION" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-info/10 border border-info/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-info">
              <Clock className="size-4 shrink-0" />
              <span>Resolución institucional pendiente</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              La solicitud fue aprobada previamente por Gestión. Genera y vincula la resolución institucional para continuar con el registro.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => {
              onIniciarGeneracion(solicitud.id);
              router.push(`/revision-normativa/${solicitud.id}/gestionar-resolucion`);
            }}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <FileSignature className="size-4" />
            <span>Generar resolución</span>
          </Button>
        </div>
      )}

      {/* CASO 2: EN GENERACIÓN DE RESOLUCIÓN */}
      {estado === "EN_GENERACION_RESOLUCION" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-primary">
              <FileSignature className="size-4 shrink-0" />
              <span>Estás gestionando la resolución</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Completa la generación y vinculación de la resolución institucional para continuar con el registro.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={() => router.push(`/revision-normativa/${solicitud.id}/gestionar-resolucion`)}
              className="w-full text-xs font-semibold gap-2 shadow-xs"
            >
              <CheckCircle2 className="size-4" />
              <span>Completar y vincular resolución</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFalloModalOpen(true)}
              className="w-full text-xs font-semibold gap-1.5 text-danger border-danger/30 hover:bg-danger/10"
            >
              <AlertTriangle className="size-3.5" />
              <span>Reportar fallo en la generación</span>
            </Button>
          </div>
        </div>
      )}

      {/* CASO 3: PENDIENTE DE FIRMA O RESOLUCIÓN GENERADA (INS-06 COMPLETADO -> INS-07 EN CURSO) */}
      {(estado === "RESOLUCION_GENERADA" || estado === "PENDIENTE_DE_FIRMA") && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Clock className="size-4 shrink-0 text-warning" />
              <span>INS-07 — Pendiente de Firma de Resolución</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              La resolución institucional fue generada formalmente. El expediente se encuentra a la espera de la suscripción electrónica externa por la <strong>Máxima Autoridad de DINARP</strong> mediante el aplicativo oficial <strong>FirmaEC</strong>.
            </p>
            <div className="p-2.5 bg-surface/90 rounded-lg border border-border text-[11px] text-muted-foreground space-y-1">
              <span className="font-semibold text-foreground block text-[11px]">Control de activación:</span>
              <p className="leading-snug">
                La institución permanece inactiva y la emisión de invitaciones de enrolamiento para coordinadores (Anexo B) está restringida hasta verificar la firma digital.
              </p>
            </div>
            <div className="pt-2 border-t border-border/80 space-y-1 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">N° Resolución:</span>
                <span className="font-mono font-bold text-foreground">{solicitud.resolucion || numResolucionSugerido}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fecha formulación:</span>
                <span className="font-mono text-foreground font-medium">{solicitud.fechaRevision || "26/09/2026 17:00"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Responsable normativo:</span>
                <span className="text-foreground font-medium">{solicitud.revisorNormatividad || currentUserName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Firmante requerido:</span>
                <span className="text-foreground font-medium">Máxima Autoridad DINARP (vía FirmaEC)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (onPreviewDocumento) {
                  onPreviewDocumento(
                    `Resolución Institucional ${solicitud.resolucion || numResolucionSugerido}`,
                    `${solicitud.resolucion || "RES-DINARP-2026-0042"}_Para_Firma.pdf`
                  );
                } else {
                  toast.info("Visualizando resolución institucional para firma", {
                    description: `Documento digital ${solicitud.resolucion || numResolucionSugerido}.`
                  });
                }
              }}
              className="flex-1 text-xs font-semibold gap-1.5 border-border"
            >
              <Eye className="size-3.5" />
              <span>Ver documento</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success("Descarga iniciada", {
                  description: `Archivo ${solicitud.resolucion || numResolucionSugerido}_Para_Firma.pdf`
                });
              }}
              className="flex-1 text-xs font-semibold gap-1.5 border-border"
            >
              <Download className="size-3.5" />
              <span>Descargar</span>
            </Button>
          </div>

          {/* SIMULACIÓN INTERACTIVA DE OPERACIÓN EXTERNA FIRMAEC */}
          {onCompletarFirmaResolucion && (
            <div className="pt-2 border-t border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Operación FirmaEC (Máxima Autoridad)
                </span>
                <Badge tone="neutral" appearance="outline" className="text-[10px] uppercase font-mono">
                  Simulación Demo
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsFirmaExitoModalOpen(true)}
                  className="w-full text-xs font-semibold gap-1.5 shadow-2xs"
                >
                  <ShieldCheck className="size-4" />
                  <span>Simular Firma Exitosa y Activación (INS-07)</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFirmaFalloModalOpen(true)}
                  className="w-full text-xs font-semibold gap-1.5 text-danger border-danger/30 hover:bg-danger/10"
                >
                  <AlertTriangle className="size-3.5" />
                  <span>Simular Fallo de Firma en FirmaEC</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CASO 3.5: INSTITUCIÓN ACTIVA (INS-07 COMPLETADO EXITOSAMENTE) */}
      {estado === "INSTITUCION_ACTIVA" && (
        <div className="space-y-4 pt-1">
          <div className="p-3.5 bg-success/10 border border-success/30 rounded-xl text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-success">
              <CheckCircle2 className="size-4.5 shrink-0" />
              <span className="text-sm">Institución Activa</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              La resolución institucional fue suscrita por la Máxima Autoridad y verificada en FirmaEC. La institución se encuentra plenamente habilitada en el SINARP y sus coordinadores han sido convocados para completar el Anexo B.
            </p>

            {/* Ficha técnica FirmaEC */}
            <div className="p-2.5 bg-surface/90 rounded-lg border border-success/20 text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-success font-semibold text-xs">
                <ShieldCheck className="size-3.5" />
                <span>Verificación de FirmaEC Oficial</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Firmante:</span>
                  <span className="font-semibold text-foreground">
                    {solicitud.datosFirmaResolucion?.firmante || "Mgs. Christian Ruiz"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Entidad Certificadora:</span>
                  <span className="font-semibold text-foreground">
                    {solicitud.datosFirmaResolucion?.entidadCertificadora || "Banco Central del Ecuador"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Resolución:</span>
                  <span className="font-mono font-bold text-foreground">
                    {solicitud.resolucion || "RES-DINARP-2026-0042"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Estado de Firma:</span>
                  <span className="text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Válida y Vigente
                  </span>
                </div>
              </div>
            </div>

            {/* Documentos de Resolución */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onPreviewDocumento) {
                    onPreviewDocumento(
                      `Resolución Institucional ${solicitud.resolucion || numResolucionSugerido}`,
                      `${solicitud.resolucion || "RES-DINARP-2026-0042"}_Firmada.pdf`
                    );
                  } else {
                    toast.info("Visualizando resolución institucional", {
                      description: `Documento oficial firmado.`
                    });
                  }
                }}
                className="flex-1 text-xs font-semibold gap-1.5 border-border"
              >
                <Eye className="size-3.5" />
                <span>Ver resolución firmada</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.success("Descarga iniciada", {
                    description: `Archivo ${solicitud.resolucion || numResolucionSugerido}_Firmada.pdf`
                  });
                }}
                className="flex-1 text-xs font-semibold gap-1.5 border-border"
              >
                <Download className="size-3.5" />
                <span>Descargar</span>
              </Button>
            </div>
          </div>

          {/* Tarjeta de Invitaciones B Emitidas */}
          <div className="p-3 bg-muted/30 border border-border rounded-xl text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Mail className="size-4 text-primary" />
                <span>Invitaciones B Emitidas (PAR-05)</span>
              </div>
              <Badge tone="success" appearance="soft" className="text-[10px] font-semibold">
                2 Vigentes
              </Badge>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Invitaciones de enrolamiento independientes con token de un solo uso despachadas por correo electrónico a los funcionarios designados en el Anexo A:
            </p>

            <div className="space-y-2 pt-1">
              {/* Invitación Titular */}
              <div className="p-2.5 bg-surface rounded-lg border border-border text-[11px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Coordinador Titular</span>
                  <Badge tone="primary" appearance="outline" className="text-[9px] uppercase font-mono">
                    {solicitud.invitacionesB?.[0]?.id || "INV-B-TIT"}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  Destinatario: <strong className="text-foreground">{solicitud.anexoA?.titularNombreCompleto || solicitud.nombreCompleto}</strong> ({solicitud.anexoA?.titularCedula || solicitud.cedula})
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between pt-0.5">
                  <span>Canal: Notificación por correo</span>
                  <span>Vigencia: 30 días calendario</span>
                </div>
              </div>

              {/* Invitación Suplente */}
              <div className="p-2.5 bg-surface rounded-lg border border-border text-[11px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Coordinador Suplente</span>
                  <Badge tone="primary" appearance="outline" className="text-[9px] uppercase font-mono">
                    {solicitud.invitacionesB?.[1]?.id || "INV-B-SUP"}
                  </Badge>
                </div>
                <div className="text-muted-foreground">
                  Destinatario: <strong className="text-foreground">{solicitud.anexoA?.suplenteNombreCompleto || "Coordinador Suplente"}</strong> ({solicitud.anexoA?.suplenteCedula || "1700000002"})
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between pt-0.5">
                  <span>Canal: Notificación por correo</span>
                  <span>Vigencia: 30 días calendario</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASO 4: GENERACIÓN PENDIENTE (FALLO CON CAUSA REGISTRADA) */}
      {estado === "GENERACION_PENDIENTE" && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-warning/10 border border-warning/40 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-warning-900 dark:text-warning-300">
              <AlertCircle className="size-4 shrink-0 text-warning" />
              <span>No fue posible generar la resolución</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              La solicitud se mantiene pendiente para subsanación o reintento de atención. No se han invitado coordinadores ni activado la institución.
            </p>
            <div className="pt-2 border-t border-warning/20">
              <span className="font-semibold text-foreground text-[11px] block mb-0.5">Causa registrada:</span>
              <p className="text-[11px] text-foreground/90 font-medium leading-snug p-2 bg-surface/80 rounded border border-warning/30">
                {solicitud.motivoRechazo || "Se requiere aclaración jurídica sobre alcance competencial institucional."}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => {
              onReintentarGeneracion(solicitud.id);
              router.push(`/revision-normativa/${solicitud.id}/gestionar-resolucion`);
            }}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <RotateCcw className="size-4" />
            <span>Reintentar generación</span>
          </Button>
        </div>
      )}



      {/* DIALOG DE REPORTE DE FALLO EN GENERACIÓN */}
      <Dialog open={isFalloModalOpen} onOpenChange={setIsFalloModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5 shrink-0" />
              <span>Reportar imposibilidad de generación</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              La solicitud pasará a &apos;Generación pendiente&apos;. No se activará la institución ni se invitarán coordinadores hasta que se atienda la causa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div>
              <label className="font-semibold text-foreground text-xs block mb-1">
                Causa del fallo / Impedimento detectado <span className="text-danger">*</span>
              </label>
              <Textarea
                placeholder="Describe la causa técnica, jurídica o documental que impide formular la resolución en este momento..."
                value={causaFalloInput}
                onChange={(e) => setCausaFalloInput(e.target.value)}
                className="text-xs min-h-[90px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFalloModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmFallo}
              className="text-xs font-semibold gap-1.5"
            >
              <AlertCircle className="size-3.5" />
              <span>Registrar fallo y pausar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG SIMULACIÓN FIRMA EXITOSA (INS-07) */}
      <Dialog open={isFirmaExitoModalOpen} onOpenChange={setIsFirmaExitoModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2 text-success">
              <ShieldCheck className="size-5 shrink-0" />
              <span>Simular Firma Digital y Activación (INS-07)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Representación de la operación externa de suscripción mediante el aplicativo FirmaEC por parte de la Máxima Autoridad de DINARP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Firmante:</span>
                <strong className="text-foreground">Mgs. Christian Ruiz (Director Nacional)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Resolución a suscribir:</span>
                <span className="font-mono font-bold text-foreground">{solicitud.resolucion || numResolucionSugerido}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Institución a activar:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">{solicitud.institucion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Entidad certificadora:</span>
                <span className="text-foreground">Banco Central del Ecuador (BCE)</span>
              </div>
            </div>

            <div className="p-2.5 bg-success/10 rounded-lg border border-success/30 text-[11px] text-muted-foreground space-y-1">
              <span className="font-bold text-success block">Acciones automáticas resultantes:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Registro de eventos de trazabilidad FirmaEC con estampa cronológica.</li>
                <li>Cambio de estado a <strong>INSTITUCIÓN ACTIVA</strong>.</li>
                <li>Emisión de 2 invitaciones independientes para Coordinador Titular y Suplente (PAR-05).</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFirmaExitoModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmFirmaExito}
              className="text-xs font-semibold gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Confirmar firma y activar institución</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG SIMULACIÓN FALLO DE FIRMA (INS-07 CASO ERROR) */}
      <Dialog open={isFirmaFalloModalOpen} onOpenChange={setIsFirmaFalloModalOpen}>
        <DialogContent className="max-w-lg p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2 text-danger">
              <AlertTriangle className="size-5 shrink-0" />
              <span>Simular Fallo de Firma en FirmaEC</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Simula una interrupción en el proceso de firma externa o un certificado revocado/no válido en FirmaEC.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2 text-xs">
            <div className="p-2.5 bg-danger/10 rounded-lg border border-danger/20 text-[11px] text-muted-foreground space-y-1">
              <span className="font-bold text-danger block">Impacto en el flujo:</span>
              <p>
                La institución <strong>NO se activará</strong>, <strong>NO se generarán invitaciones B</strong> y el trámite permanecerá en espera con el intento fallido asentado en la trazabilidad.
              </p>
            </div>

            <div>
              <label className="font-semibold text-foreground text-xs block mb-1">
                Motivo del fallo reportado por FirmaEC (opcional)
              </label>
              <Textarea
                placeholder="Ejemplo: Fallo en la comunicación con la entidad certificadora o token criptográfico no reconocido..."
                value={causaFirmaFalloInput}
                onChange={(e) => setCausaFirmaFalloInput(e.target.value)}
                className="text-xs min-h-[75px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFirmaFalloModalOpen(false)}
              className="text-xs font-semibold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmFirmaFallo}
              className="text-xs font-semibold gap-1.5"
            >
              <XCircle className="size-3.5" />
              <span>Registrar intento fallido</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

