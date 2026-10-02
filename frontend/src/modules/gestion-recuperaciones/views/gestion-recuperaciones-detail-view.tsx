"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  RefreshCw,
  Copy,
  Ban,
  Check,
  Info,
  Smartphone,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { CasoRecuperacion } from "../data/gestion-recuperaciones-types";
import {
  RecuperacionStatusBadge,
  RecuperacionDecisionBadge,
  RecuperacionTipoCuentaBadge,
} from "../components/recuperacion-status-badge";
import { AutorizarRecuperacionDialog } from "../components/autorizar-recuperacion-dialog";
import { DenegarRecuperacionDialog } from "../components/denegar-recuperacion-dialog";
import { EvidenciaUploadCard } from "../components/evidencia-upload-card";

export interface GestionRecuperacionesDetailViewProps {
  caso: CasoRecuperacion;
  onBack: () => void;
  onAutorizar: (params: { observaciones: string; bloquearCanalAnterior: boolean }) => void;
  onDenegar: (params: { motivoDenegacion: string; mantenerBloqueoPreventivo: boolean }) => void;
  onUploadEvidencia: (archivo: { nombre: string; tamano: string; tipo: string; subidoPor: string }) => void;
  onReintentarConciliacion: () => void;
  currentUser: string;
}

export type RecuperacionAccesoDetailViewProps = GestionRecuperacionesDetailViewProps;

export function GestionRecuperacionesDetailView({
  caso,
  onBack,
  onAutorizar,
  onDenegar,
  onUploadEvidencia,
  onReintentarConciliacion,
  currentUser,
}: RecuperacionAccesoDetailViewProps) {
  const [modalAutorizarOpen, setModalAutorizarOpen] = useState(false);
  const [modalDenegarOpen, setModalDenegarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Acciones disponibles únicamente mientras el caso esté pendiente de resolución o en conciliación
  const canTakeAction = caso.decision === "PENDIENTE" || caso.estado === "EN_CONCILIACION";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles", {
      description: `${label}: ${text}`,
    });
  };

  const handleAutorizarConfirm = (params: {
    observaciones: string;
    bloquearCanalAnterior: boolean;
  }) => {
    setIsProcessing(true);
    setTimeout(() => {
      onAutorizar(params);
      setIsProcessing(false);
      setModalAutorizarOpen(false);
    }, 400);
  };

  const handleDenegarConfirm = (params: {
    motivoDenegacion: string;
    mantenerBloqueoPreventivo: boolean;
  }) => {
    setIsProcessing(true);
    setTimeout(() => {
      onDenegar(params);
      setIsProcessing(false);
      setModalDenegarOpen(false);
    }, 400);
  };

  // Mapeo cronológico de eventos para el componente oficial Timeline del UI Kit
  const timelineItems: TimelineItem[] = caso.historial.map((hist, index) => {
    let iconNode: React.ReactNode = <Clock className="size-4" />;
    let status: TimelineItem["status"] = "neutral";
    let statusLabel = "Evento";

    if (hist.tipo === "success" || hist.accion.toLowerCase().includes("autoriz") || hist.accion.toLowerCase().includes("completad")) {
      iconNode = <CheckCircle2 className="size-4 text-success" />;
      status = "success";
      statusLabel = "Autorizado";
    } else if (hist.tipo === "danger" || hist.accion.toLowerCase().includes("denega") || hist.accion.toLowerCase().includes("rechaz") || hist.accion.toLowerCase().includes("bloque")) {
      iconNode = <XCircle className="size-4 text-danger" />;
      status = "danger";
      statusLabel = hist.accion.toLowerCase().includes("denega") || hist.accion.toLowerCase().includes("rechaz") ? "Denegado" : "Seguridad";
    } else if (hist.tipo === "warning" || hist.accion.toLowerCase().includes("concilia") || hist.accion.toLowerCase().includes("fallo") || hist.accion.toLowerCase().includes("solicitud") || hist.accion.toLowerCase().includes("pendient")) {
      iconNode = <AlertTriangle className="size-4 text-warning" />;
      status = "warning";
      statusLabel = hist.accion.toLowerCase().includes("solicitud") ? "Solicitud" : "Alerta";
    } else if (hist.accion.toLowerCase().includes("evidencia") || hist.accion.toLowerCase().includes("document")) {
      iconNode = <FileText className="size-4 text-primary" />;
      status = "primary";
      statusLabel = "Documental";
    } else if (hist.accion.toLowerCase().includes("verific") || hist.accion.toLowerCase().includes("identidad")) {
      iconNode = <ShieldCheck className="size-4 text-primary" />;
      status = "primary";
      statusLabel = "Identidad";
    } else if (hist.tipo === "info") {
      iconNode = <Info className="size-4 text-info" />;
      status = "info";
      statusLabel = "Informativo";
    }

    return {
      id: hist.id,
      title: hist.accion,
      description: hist.detalle,
      date: hist.fecha,
      user: hist.actor,
      status,
      statusLabel,
      icon: iconNode,
      isCurrent: index === 0, // El primer evento de la lista es el más reciente/activo
    };
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* =========================================================================
         ENCABEZADO PRINCIPAL DEL CASO CON ACCIONES SUPERIORES
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full border-b border-border/60 pb-4">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="rounded-xl size-9 p-0 flex items-center justify-center shrink-0 border border-border mt-0.5 sm:mt-0 cursor-pointer"
                  aria-label="Volver a la gestión de recuperaciones"
                >
                  <ArrowLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Volver a la gestión de recuperaciones
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight text-foreground break-words">
                Caso {caso.id}
              </h1>
              {/* Estado principal del caso mostrado una sola vez (coherente con decisión) */}
              <RecuperacionStatusBadge estado={caso.estado} decision={caso.decision} />
            </div>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Recuperación asistida de segundo factor (2FA)</span>
              <span>•</span>
              <span className="font-mono">Solicitado el {caso.fechaSolicitud}</span>
            </p>
          </div>
        </div>

        {/* Acciones principales superiores: Denegar -> Danger / Autorizar -> Warning (apiladas en mobile) */}
        {canTakeAction ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 self-stretch sm:self-center">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setModalDenegarOpen(true)}
              className="w-full sm:w-auto rounded-xl text-xs font-semibold shadow-xs justify-center"
            >
              <XCircle className="size-3.5 mr-1.5" />
              <span>Denegar</span>
            </Button>

            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={() => setModalAutorizarOpen(true)}
              className="w-full sm:w-auto rounded-xl text-xs font-semibold shadow-xs justify-center"
            >
              <CheckCircle2 className="size-3.5 mr-1.5" />
              <span>Autorizar recuperación</span>
            </Button>
          </div>
        ) : caso.decision === "DENEGADA" ? (
          <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger font-semibold w-full sm:w-auto shrink-0 self-stretch sm:self-center">
            <XCircle className="size-3.5" />
            <span>Resolución: Denegada</span>
          </div>
        ) : caso.decision === "AUTORIZADA" ? (
          <div className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-success/10 border border-success/30 text-xs text-success font-semibold w-full sm:w-auto shrink-0 self-stretch sm:self-center">
            <CheckCheck className="size-3.5" />
            <span>Resolución: Autorizada</span>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground font-medium w-full sm:w-auto shrink-0 self-stretch sm:self-center">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>En trámite</span>
          </div>
        )}
      </div>

      {/* =========================================================================
         BANNER DE RESOLUCIÓN FORMAL (DENEGADA / AUTORIZADA)
      ========================================================================= */}
      {caso.decision === "DENEGADA" && (
        <Alert
          variant="danger"
          icon={<XCircle className="size-5" />}
          title="Solicitud de recuperación denegada"
          className="rounded-2xl"
        >
          <div className="space-y-1 text-xs">
            <p className="text-foreground leading-relaxed">
              Esta solicitud fue denegada formalmente el {caso.fechaResolucion || "recientemente"} por {caso.operadorAsignado}.
            </p>
            {caso.motivoDecision && (
              <p className="text-foreground font-medium">
                <strong>Motivo de denegación:</strong> {caso.motivoDecision}
              </p>
            )}
            <p className="text-muted-foreground text-[11px] pt-0.5">
              Por razones de seguridad, el acceso no fue restablecido y el bloqueo preventivo del canal anterior permanece activo.
            </p>
          </div>
        </Alert>
      )}

      {caso.decision === "AUTORIZADA" && (
        <Alert
          variant="success"
          icon={<CheckCircle2 className="size-5" />}
          title="Recuperación autorizada y registrada"
          className="rounded-2xl"
        >
          <div className="space-y-1 text-xs">
            <p className="text-foreground leading-relaxed">
              Solicitud autorizada el {caso.fechaResolucion || "recientemente"} bajo referencia oficial{" "}
              <strong className="font-mono">{caso.referenciaAutorizacion || "AUT-ID08-2026-0042"}</strong> por {caso.operadorAsignado}.
            </p>
            <p className="text-muted-foreground text-[11px]">
              Se invalidaron las sesiones previas en Identity Platform y el titular debe continuar por el flujo seguro de re-vinculación{" "}
              <strong className="text-foreground">
                {caso.tipoCuenta === "CUENTA_INTERNA" ? "Cuenta interna DINARP" : "Coordinador institucional"}
              </strong>.
            </p>
          </div>
        </Alert>
      )}

      {/* =========================================================================
         ALERTA DEL UI KIT SI ESTÁ EN CONCILIACIÓN POR FALLO TÉCNICO DE IdP
      ========================================================================= */}
      {caso.estado === "EN_CONCILIACION" && caso.incidenciaConciliacion && (
        <Alert
          variant="warning"
          icon={<AlertTriangle className="size-5" />}
          title={`Incidencia técnica en sincronización IdP (${caso.incidenciaConciliacion.codigoIncidencia})`}
          className="rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="space-y-1 text-xs">
              <p className="text-foreground leading-relaxed break-words">
                {caso.incidenciaConciliacion.descripcion}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                <span><strong>Módulo afectado:</strong> {caso.incidenciaConciliacion.moduloAfectado}</span>
                <span>•</span>
                <span><strong>Fecha de fallo:</strong> {caso.incidenciaConciliacion.fechaFallo}</span>
                <span>•</span>
                <span className="text-danger font-semibold">Acceso preventivo restringido</span>
              </div>
            </div>

            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={onReintentarConciliacion}
              className="w-full sm:w-auto rounded-xl shrink-0 text-xs font-semibold shadow-xs justify-center"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              <span>Reintentar conciliación</span>
            </Button>
          </div>
        </Alert>
      )}

      {/* =========================================================================
         LOS 6 CONTENEDORES PRINCIPALES SIGUIENDO EL PATRÓN DE /registro-institucion
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* =======================================================================
           COLUMNA IZQUIERDA: Identidad, Motivo/Método y Evidencia Documental
        ======================================================================= */}
        <div className="flex flex-col gap-6">
          {/* 1. CONTENEDOR: Datos de identidad y cuenta relacionada */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor con acento Primary sutil */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Datos de identidad y cuenta relacionada
                </h2>
              </div>
              {/* Tipo de cuenta mostrado una sola vez aportando contexto real */}
              <RecuperacionTipoCuentaBadge tipo={caso.tipoCuenta} />
            </div>

            {/* Contenido sin cards anidadas: grid label + value */}
            <div className="p-3.5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 text-xs">
                {/* Cédula */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Cédula de identidad
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {caso.cedula}
                    </span>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleCopy(caso.cedula, "Cédula")}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Copiar cédula"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Copiar cédula</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* ID de Cuenta */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    ID de cuenta
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      tone="primary"
                      appearance="soft"
                      size="sm"
                      className="font-mono text-xs normal-case tracking-normal px-2.5 py-0.5"
                    >
                      {caso.cuentaRelacionada}
                    </Badge>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleCopy(caso.cuentaRelacionada, "Cuenta relacionada")}
                            className="size-6 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Copiar ID de cuenta"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Copiar ID de cuenta</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Persona Titular */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Persona titular
                  </span>
                  <span className="font-bold text-foreground text-xs sm:text-sm block break-words">
                    {caso.usuarioNombre}
                  </span>
                </div>

                {/* Correo Institucional */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Correo institucional registrado
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-foreground block break-all">
                      {caso.usuarioCorreo}
                    </span>
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => handleCopy(caso.usuarioCorreo, "Correo institucional")}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Copiar correo"
                          >
                            <Copy className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Copiar correo</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Institución / Dependencia */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-3 pt-3 border-t border-border/50">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Institución / Dependencia
                  </span>
                  <span className="font-medium text-foreground text-xs block break-words">
                    {caso.institucionNombre || "Dirección Nacional de Registros Públicos (DINARP)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CONTENEDOR: Motivo y método de verificación */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <KeyRound className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Motivo y método de verificación
                </h2>
              </div>
            </div>

            {/* Contenido sin cards anidadas: grid label + value */}
            <div className="p-3.5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Canal / Factor Perdido */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Canal / factor perdido
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <Smartphone className="size-4 text-primary shrink-0" />
                    <span>{caso.factorCanalPerdido}</span>
                  </div>
                </div>

                {/* Motivo de la Solicitud */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Motivo de la solicitud
                  </span>
                  <span className="font-semibold text-foreground text-xs block break-words">
                    {caso.motivoLabel}
                  </span>
                </div>

                {/* Método de Verificación Aplicado */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Método de verificación aplicado
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>{caso.metodoAplicadoLabel}</span>
                  </div>
                </div>

                {/* Descripción o Justificación Registrada */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Descripción o justificación registrada
                  </span>
                  <p className="text-foreground leading-relaxed text-xs break-words">
                    {caso.motivoDescripcion}
                  </p>
                </div>
              </div>


            </div>
          </div>

          {/* 3. CONTENEDOR: Evidencia documental */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Evidencia documental
                </h2>
              </div>
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px]">
                PDF, PNG, JPG (máx. 10MB)
              </Badge>
            </div>

            <div className="p-3.5 sm:p-6">
              <EvidenciaUploadCard
                evidencias={caso.evidencias}
                onUpload={onUploadEvidencia}
                currentUser={currentUser}
                readOnly={!canTakeAction}
              />
            </div>
          </div>
        </div>

        {/* =======================================================================
           COLUMNA DERECHA: Bloqueo/Seguridad, Resolución/Trazabilidad y Línea de Tiempo
        ======================================================================= */}
        <div className="flex flex-col gap-6">
          {/* 4. CONTENEDOR: Estado del bloqueo y seguridad */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Lock className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Estado del bloqueo y seguridad
                </h2>
              </div>
              {caso.bloqueoCanalAnterior.activo ? (
                <Badge tone="danger" appearance="soft" size="sm" className="font-semibold">
                  <Ban className="size-3 mr-1" />
                  Bloqueo activo
                </Badge>
              ) : (
                <Badge tone="success" appearance="soft" size="sm" className="font-semibold">
                  <Check className="size-3 mr-1" />
                  Desbloqueado
                </Badge>
              )}
            </div>

            {/* Contenido sin cards anidadas: grid label + value */}
            <div className="p-3.5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Estado del Bloqueo */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Estado del bloqueo
                  </span>
                  <span className="font-semibold text-foreground text-xs block">
                    {caso.bloqueoCanalAnterior.activo ? "Bloqueo preventivo vigente" : "Acceso habilitado"}
                  </span>
                </div>

                {/* Sesiones Invalidadas */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Sesiones invalidadas
                  </span>
                  <span className="font-semibold text-foreground text-xs block">
                    {caso.bloqueoCanalAnterior.sesionesInvalidadas} sesiones en IdP
                  </span>
                </div>

                {/* Canal / Factor Afectado */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Canal / factor afectado
                  </span>
                  <span className="font-mono text-xs text-foreground block break-words">
                    {caso.bloqueoCanalAnterior.canalBloqueado || "Canal previo revocado"}
                  </span>
                </div>
              </div>

              {/* Mensaje de protocolo relevante mediante Alert oficial */}
              <Alert variant="default" icon={<Info className="size-4" />} title="Protocolo de seguridad institucional" className="text-xs">
                Bajo ninguna circunstancia se emiten ni visualizan contraseñas temporales. La recuperación asistida revoca el secreto TOTP anterior y exige una nueva vinculación segura de Google Authenticator.
              </Alert>

              {/* Datos Técnicos de Conexión Discretos */}
              <div className="pt-2 border-t border-border/50 text-[10px] font-mono text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                <span>IP de registro: 192.168.10.42</span>
                <span>IdP: Keycloak-DINARP-Federated</span>
              </div>
            </div>
          </div>

          {/* 5. CONTENEDOR: Resolución y trazabilidad */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <ShieldAlert className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Resolución y trazabilidad
                </h2>
              </div>
              <RecuperacionDecisionBadge decision={caso.decision} />
            </div>

            {/* Contenido sin cards anidadas y sin duplicar badges de estado */}
            <div className="p-3.5 sm:p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Operador Asignado */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Operador responsable
                  </span>
                  <span className="font-medium text-foreground text-xs block break-words">
                    {caso.operadorAsignado}
                  </span>
                </div>

                {/* Fecha / Hora Resolución */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Fecha de resolución
                  </span>
                  <span className="font-mono text-foreground text-xs block">
                    {caso.fechaResolucion || "Pendiente de dictamen"}
                  </span>
                </div>

                {/* Referencia de Autorización cuando Exista */}
                {caso.referenciaAutorizacion && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Referencia de autorización
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone="primary"
                        appearance="soft"
                        size="sm"
                        className="font-mono text-xs normal-case tracking-normal break-all px-2.5 py-1"
                      >
                        {caso.referenciaAutorizacion}
                      </Badge>
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleCopy(caso.referenciaAutorizacion!, "Referencia")}
                              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                              aria-label="Copiar referencia"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Copiar referencia</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {/* Motivo de la Decisión cuando Exista */}
                {caso.motivoDecision && (
                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Motivo del dictamen
                    </span>
                    <p className="text-foreground text-xs leading-relaxed break-words">
                      {caso.motivoDecision}
                    </p>
                  </div>
                )}
              </div>

              {/* Continuación del Proceso si se Autorizó mediante Alert del UI Kit */}
              {caso.decision === "AUTORIZADA" && (
                <Alert variant="success" icon={<CheckCircle2 className="size-4" />} title="Continuación obligatoria autorizada" className="text-xs">
                  Se continúa por el flujo de{" "}
                  <strong>
                    {caso.tipoCuenta === "CUENTA_INTERNA"
                      ? "Cuenta interna DINARP"
                      : "Coordinador institucional"}
                  </strong>{" "}
                  para la re-vinculación obligatoria de Google Authenticator.
                </Alert>
              )}

              {/* Dictamen en firme si se Denegó mediante Alert del UI Kit */}
              {caso.decision === "DENEGADA" && (
                <Alert variant="danger" icon={<XCircle className="size-4" />} title="Resolución formal en firme" className="text-xs">
                  {caso.motivoDecision ? (
                    <span>
                      <strong>Dictamen emitido:</strong> {caso.motivoDecision}.
                    </span>
                  ) : (
                    <span>La solicitud fue denegada por inconsistencias o incumplimiento reglamentario.</span>
                  )}{" "}
                  La resolución ha sido registrada en la auditoría del sistema y el acceso no ha sido restablecido.
                </Alert>
              )}

              {/* Si sigue Pendiente */}
              {caso.decision === "PENDIENTE" && (
                <Alert variant="warning" icon={<Clock className="size-4" />} title="Dictamen pendiente" className="text-xs">
                  El caso se encuentra en espera de evaluación y revisión documental por el operador asignado para dictar autorización o denegación.
                </Alert>
              )}
            </div>
          </div>

          {/* 6. CONTENEDOR: Línea de tiempo */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
            {/* Encabezado real del contenedor */}
            <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-primary/15 dark:border-primary-800/30 p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <Clock className="size-5 text-primary dark:text-primary-300 shrink-0" />
                <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 break-words">
                  Línea de tiempo
                </h2>
              </div>
              <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px]">
                {timelineItems.length} eventos
              </Badge>
            </div>

            {/* Componente Timeline oficial del UI Kit */}
            <div className="p-3.5 sm:p-6">
              <Timeline items={timelineItems} />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
         MODALES DE CONFIRMACIÓN (Confirmation Dialog Warning / Danger)
      ========================================================================= */}
      <AutorizarRecuperacionDialog
        open={modalAutorizarOpen}
        onOpenChange={setModalAutorizarOpen}
        caso={caso}
        onConfirm={handleAutorizarConfirm}
        isLoading={isProcessing}
      />

      <DenegarRecuperacionDialog
        open={modalDenegarOpen}
        onOpenChange={setModalDenegarOpen}
        caso={caso}
        onConfirm={handleDenegarConfirm}
        isLoading={isProcessing}
      />
    </div>
  );
}

export const RecuperacionAccesoDetailView = GestionRecuperacionesDetailView;

