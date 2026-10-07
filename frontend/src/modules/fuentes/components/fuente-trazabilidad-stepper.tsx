"use client";

import React, { useState } from "react";
import { EstadoFuente, FuenteDatos, TrazabilidadEvento } from "../data/fuentes-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  FileEdit,
  Sliders,
  Clock,
  ShieldCheck,
  Globe,
  AlertTriangle,
  AlertCircle,
  Check,
  Calendar,
  User,
  ArrowRight,
  Info,
  Layers,
} from "lucide-react";

interface FuenteTrazabilidadStepperProps {
  estado: EstadoFuente;
  fuente?: FuenteDatos;
  historial?: TrazabilidadEvento[];
  className?: string;
  showInspector?: boolean;
}

type StageStatus = "completed" | "current" | "warning" | "error" | "pending";

interface EtapaConfig {
  key: string;
  index: number;
  prefix: string;
  codigoHU: string;
  title: string;
  sublabel: string;
  descripcion: string;
  responsableRol: string;
  icon: React.ElementType;
  status: StageStatus;
  badgeLabel: string;
  badgeTone: "success" | "primary" | "warning" | "danger" | "neutral";
  badgeAppearance: "solid" | "soft";
  fecha?: string;
  actor?: string;
  observacion?: string;
}

export function FuenteTrazabilidadStepper({
  estado,
  fuente,
  historial: propHistorial,
  className,
  showInspector = true,
}: FuenteTrazabilidadStepperProps) {
  const historial = propHistorial || fuente?.historial || [];

  // Helper para buscar eventos en historial
  const findEvento = (condition: (e: TrazabilidadEvento) => boolean): TrazabilidadEvento | undefined => {
    return historial.find(condition);
  };

  const evtBorrador = findEvento((e) => e.estado_resultante === "BORRADOR" || e.accion.toLowerCase().includes("creación") || e.accion.toLowerCase().includes("registro"));
  const evtConexion = findEvento((e) => e.accion.toLowerCase().includes("conexión") || e.accion.toLowerCase().includes("esquema") || e.estado_resultante === "CONFIGURACION");
  const evtRevision = findEvento((e) => e.estado_resultante === "EN_REVISION" || e.estado_resultante === "DEVUELTA" || e.accion.toLowerCase().includes("revisión"));
  const evtAprobacion = findEvento((e) => e.estado_resultante === "APROBADA" || e.accion.toLowerCase().includes("aprobación") || e.accion.toLowerCase().includes("aprobar"));
  const evtPublicacion = findEvento((e) => e.estado_resultante === "PUBLICADA" || e.accion.toLowerCase().includes("publicación") || e.accion.toLowerCase().includes("publicar"));

  const formatFecha = (isoString?: string) => {
    if (!isoString) return undefined;
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return undefined;
    }
  };

  // 1. Etapa Borrador
  let s1Status: StageStatus = "completed";
  let s1Badge = "Registrado";
  let s1Tone: "success" | "primary" | "warning" | "danger" | "neutral" = "success";
  if (estado === "BORRADOR") {
    s1Status = "current";
    s1Badge = "En elaboración";
    s1Tone = "primary";
  }

  // 2. Etapa Conexión y Esquema
  let s2Status: StageStatus = "pending";
  let s2Badge = "Pendiente";
  let s2Tone: "success" | "primary" | "warning" | "danger" | "neutral" = "neutral";
  if (estado === "BORRADOR") {
    s2Status = "pending";
    s2Badge = "Pendiente";
    s2Tone = "neutral";
  } else if (estado === "CONFIGURACION" || estado === "CONEXION_PENDIENTE") {
    s2Status = "current";
    s2Badge = "En configuración";
    s2Tone = "primary";
  } else if (estado === "PENDIENTE_HOMOLOGACION") {
    s2Status = "warning";
    s2Badge = "Homologación TI";
    s2Tone = "warning";
  } else {
    s2Status = "completed";
    s2Badge = "Conectado";
    s2Tone = "success";
  }

  // 3. Etapa Revisión Técnica
  let s3Status: StageStatus = "pending";
  let s3Badge = "Pendiente";
  let s3Tone: "success" | "primary" | "warning" | "danger" | "neutral" = "neutral";
  if (["BORRADOR", "CONFIGURACION", "CONEXION_PENDIENTE", "PENDIENTE_HOMOLOGACION"].includes(estado)) {
    s3Status = "pending";
    s3Badge = "Pendiente";
    s3Tone = "neutral";
  } else if (estado === "EN_REVISION") {
    s3Status = "current";
    s3Badge = "En revisión";
    s3Tone = "primary";
  } else if (estado === "DEVUELTA" || estado === "ESQUEMA_PENDIENTE_CORRECCION") {
    s3Status = "warning";
    s3Badge = "Devuelta c/ obs.";
    s3Tone = "warning";
  } else {
    s3Status = "completed";
    s3Badge = "Clasificada";
    s3Tone = "success";
  }

  // 4. Etapa Dictamen y Aprobación
  let s4Status: StageStatus = "pending";
  let s4Badge = "Pendiente";
  let s4Tone: "success" | "primary" | "warning" | "danger" | "neutral" = "neutral";
  if (["BORRADOR", "CONFIGURACION", "CONEXION_PENDIENTE", "PENDIENTE_HOMOLOGACION", "EN_REVISION"].includes(estado)) {
    s4Status = "pending";
    s4Badge = "Pendiente";
    s4Tone = "neutral";
  } else if (estado === "DEVUELTA" || estado === "ESQUEMA_PENDIENTE_CORRECCION") {
    s4Status = "pending";
    s4Badge = "En espera";
    s4Tone = "neutral";
  } else {
    s4Status = "completed";
    s4Badge = "Aprobada";
    s4Tone = "success";
  }

  // 5. Etapa Publicación en Catálogo
  let s5Status: StageStatus = "pending";
  let s5Badge = "Pendiente";
  let s5Tone: "success" | "primary" | "warning" | "danger" | "neutral" = "neutral";
  if (estado === "APROBADA") {
    s5Status = "current";
    s5Badge = "Lista para publicar";
    s5Tone = "primary";
  } else if (estado === "PUBLICACION_PENDIENTE") {
    s5Status = "error";
    s5Badge = "Fallo despliegue";
    s5Tone = "danger";
  } else if (estado === "PUBLICADA") {
    s5Status = "completed";
    s5Badge = "Publicada";
    s5Tone = "success";
  } else {
    s5Status = "pending";
    s5Badge = "Pendiente";
    s5Tone = "neutral";
  }

  const etapas: EtapaConfig[] = [
    {
      key: "BORRADOR",
      index: 0,
      prefix: "Etapa 1",
      codigoHU: "FUE-01",
      title: "Borrador",
      sublabel: "Metadatos y SLA inicial",
      descripcion: "Definición de nombre, descripción, SLA, parámetros de consulta y versión propuesta por la entidad proveedora.",
      responsableRol: "Coordinador Institucional",
      icon: FileEdit,
      status: s1Status,
      badgeLabel: s1Badge,
      badgeTone: s1Tone,
      badgeAppearance: s1Status === "completed" ? "soft" : "soft",
      fecha: formatFecha(evtBorrador?.fecha || fuente?.fecha_creacion),
      actor: evtBorrador?.actor || fuente?.coordinador_nombre,
    },
    {
      key: "CONEXION",
      index: 1,
      prefix: "Etapa 2",
      codigoHU: "FUE-02 / FUE-03",
      title: "Conexión y esquema",
      sublabel: "Verificación de red y campos",
      descripcion: "Conexión cifrada vía KMS, verificación técnica de latencia y selección de campos expuestos del origen de datos.",
      responsableRol: estado === "PENDIENTE_HOMOLOGACION" ? "Equipo TI DINARP" : "Coordinador Institucional",
      icon: Sliders,
      status: s2Status,
      badgeLabel: s2Badge,
      badgeTone: s2Tone,
      badgeAppearance: s2Status === "warning" ? "soft" : "soft",
      fecha: formatFecha(evtConexion?.fecha || fuente?.conexion?.ultima_prueba?.instante_prueba),
      actor: estado === "PENDIENTE_HOMOLOGACION" ? "Laboratorio TI DINARP" : evtConexion?.actor || fuente?.coordinador_nombre,
      observacion: estado === "PENDIENTE_HOMOLOGACION" ? "Conector no estándar requiere certificación técnica por el Equipo de TI (FUE-12 / CNX-01)." : undefined,
    },
    {
      key: "REVISION",
      index: 2,
      prefix: "Etapa 3",
      codigoHU: "FUE-04",
      title: "Revisión técnica",
      sublabel: "Clasificación de campos",
      descripcion: "Inspección técnica de seguridad por Gestión y clasificación individual de campos como Accesibles o Confidenciales.",
      responsableRol: "Dirección de Gestión (DINARP)",
      icon: Clock,
      status: s3Status,
      badgeLabel: s3Badge,
      badgeTone: s3Tone,
      badgeAppearance: s3Status === "warning" ? "soft" : "soft",
      fecha: formatFecha(evtRevision?.fecha || fuente?.fecha_observacion),
      actor: fuente?.revisor_gestion || evtRevision?.actor || "Equipo de Gestión",
      observacion: (estado === "DEVUELTA" || estado === "ESQUEMA_PENDIENTE_CORRECCION") ? (fuente?.observaciones_gestion || evtRevision?.observaciones) : undefined,
    },
    {
      key: "APROBACION",
      index: 3,
      prefix: "Etapa 4",
      codigoHU: "FUE-04",
      title: "Dictamen formal",
      sublabel: "Aprobación de publicación",
      descripcion: "Validación de cumplimiento normativo y dictamen favorable para habilitar la publicación en catálogo.",
      responsableRol: "Dirección de Gestión (DINARP)",
      icon: ShieldCheck,
      status: s4Status,
      badgeLabel: s4Badge,
      badgeTone: s4Tone,
      badgeAppearance: s4Status === "completed" ? "soft" : "soft",
      fecha: formatFecha(evtAprobacion?.fecha),
      actor: evtAprobacion?.actor || fuente?.revisor_gestion || "Dirección de Gestión",
    },
    {
      key: "PUBLICACION",
      index: 4,
      prefix: "Etapa 5",
      codigoHU: "FUE-05",
      title: "Publicación",
      sublabel: "Catálogo Nacional",
      descripcion: "Despliegue del proxy en Apigee API Gateway y alta oficial de la fuente en el Catálogo de Interoperabilidad.",
      responsableRol: "Coordinador Institucional",
      icon: Globe,
      status: s5Status,
      badgeLabel: s5Badge,
      badgeTone: s5Tone,
      badgeAppearance: s5Status === "completed" ? "solid" : "soft",
      fecha: formatFecha(evtPublicacion?.fecha || fuente?.despliegue?.fecha_publicacion),
      actor: evtPublicacion?.actor || fuente?.coordinador_nombre,
      observacion: estado === "PUBLICACION_PENDIENTE" && fuente?.fallo_publicacion ? fuente.fallo_publicacion.mensaje : undefined,
    },
  ];

  // Identificar la etapa activa por defecto
  const defaultActiveIndex =
    estado === "BORRADOR"
      ? 0
      : ["CONFIGURACION", "CONEXION_PENDIENTE", "PENDIENTE_HOMOLOGACION"].includes(estado)
      ? 1
      : ["EN_REVISION", "DEVUELTA", "ESQUEMA_PENDIENTE_CORRECCION"].includes(estado)
      ? 2
      : estado === "APROBADA"
      ? 4 // Habilita la etapa 5 de publicación
      : 4;

  const [inspectedIndex, setInspectedIndex] = useState<number>(defaultActiveIndex);
  const etapaInspeccionada = etapas[inspectedIndex] ?? etapas[defaultActiveIndex];

  return (
    <div className={cn("w-full bg-surface rounded-2xl border border-border shadow-xs overflow-hidden", className)}>
      {/* 1. Header institucional de la trazabilidad */}
      <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle/50">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-sm text-foreground">
                Ciclo de vida y trazabilidad (BN-06)
              </h3>
              <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px]">
                FUE-01 → FUE-05
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trazabilidad técnica por etapas desde el borrador inicial hasta la publicación en el Catálogo Nacional.
            </p>
          </div>
        </div>

        {/* Badge resumen de estado */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs text-muted-foreground hidden md:inline">Estado actual:</span>
          {estado === "DEVUELTA" ? (
            <Badge tone="warning" appearance="soft" size="sm" className="font-semibold gap-1.5">
              <AlertTriangle className="size-3.5" />
              Devuelta con observaciones
            </Badge>
          ) : estado === "PUBLICADA" ? (
            <Badge tone="success" appearance="solid" size="sm" className="font-semibold gap-1.5">
              <Check className="size-3.5 stroke-[3px]" />
              Publicada en Catálogo
            </Badge>
          ) : estado === "APROBADA" ? (
            <Badge tone="success" appearance="soft" size="sm" className="font-semibold gap-1.5">
              <Check className="size-3.5 stroke-[3px]" />
              Aprobada por Gestión
            </Badge>
          ) : estado === "EN_REVISION" ? (
            <Badge tone="primary" appearance="soft" size="sm" className="font-semibold gap-1.5">
              <Clock className="size-3.5" />
              En revisión por Gestión
            </Badge>
          ) : estado === "PENDIENTE_HOMOLOGACION" ? (
            <Badge tone="warning" appearance="soft" size="sm" className="font-semibold gap-1.5">
              <AlertTriangle className="size-3.5" />
              Pendiente de homologación TI
            </Badge>
          ) : (
            <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
              {estado.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Stepper Track Visual */}
      <div className="p-4 sm:p-6 lg:p-7 overflow-x-auto scrollbar-none">
        <ol className="flex items-start justify-between min-w-[680px] md:min-w-0 w-full relative">
          {etapas.map((etapa, idx) => {
            const isSelected = inspectedIndex === idx;
            const IconComponent = etapa.icon;

            // Determinar color de la línea conectora hacia el siguiente paso
            let connectorProgressClass = "w-0";
            if (idx < etapas.length - 1) {
              const nextEtapa = etapas[idx + 1];
              if (etapa.status === "completed") {
                if (nextEtapa.status === "completed") {
                  connectorProgressClass = "w-full bg-success";
                } else if (nextEtapa.status === "warning") {
                  connectorProgressClass = "w-full bg-warning";
                } else if (nextEtapa.status === "error") {
                  connectorProgressClass = "w-full bg-danger";
                } else if (nextEtapa.status === "current") {
                  connectorProgressClass = "w-full bg-primary";
                }
              }
            }

            return (
              <li
                key={etapa.key}
                onClick={() => setInspectedIndex(idx)}
                className={cn(
                  "relative group flex flex-col items-center flex-1 min-w-0 px-1 text-center cursor-pointer transition-all outline-none",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-xl"
                )}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setInspectedIndex(idx);
                  }
                }}
                aria-label={`${etapa.prefix}: ${etapa.title} (${etapa.badgeLabel})`}
              >
                {/* Línea conectora horizontal entre nodos */}
                {idx < etapas.length - 1 && (
                  <div className="absolute top-[20px] left-[50%] right-[-50%] h-[2px] bg-border z-0">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 origin-left",
                        connectorProgressClass
                      )}
                    />
                  </div>
                )}

                {/* Nodo circular del paso */}
                <div className="relative z-10 mb-2.5">
                  <div
                    className={cn(
                      "size-10 sm:size-11 rounded-full flex items-center justify-center transition-all duration-300 font-bold select-none",
                      etapa.status === "completed" && "bg-success text-white border-2 border-success shadow-xs",
                      etapa.status === "current" && "bg-primary text-white border-2 border-primary shadow-xs ring-4 ring-primary/20",
                      etapa.status === "warning" && "bg-warning text-white border-2 border-warning shadow-xs ring-4 ring-warning/20",
                      etapa.status === "error" && "bg-danger text-white border-2 border-danger shadow-xs ring-4 ring-danger/20",
                      etapa.status === "pending" && "bg-surface border-2 border-dashed border-border text-muted-foreground",
                      isSelected && "scale-105 ring-2 ring-foreground/20"
                    )}
                  >
                    {etapa.status === "completed" ? (
                      <Check className="size-4.5 stroke-[3px]" />
                    ) : etapa.status === "warning" ? (
                      <AlertTriangle className="size-4.5" />
                    ) : etapa.status === "error" ? (
                      <AlertCircle className="size-4.5" />
                    ) : (
                      <IconComponent
                        className={cn(
                          "size-4.5",
                          etapa.status === "current" ? "text-white" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                </div>

                {/* Textos del paso */}
                <div className="flex flex-col items-center w-full min-w-0">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                    {etapa.prefix} · {etapa.codigoHU}
                  </span>

                  <span
                    className={cn(
                      "text-xs sm:text-sm font-bold leading-tight transition-colors line-clamp-1 max-w-full px-1",
                      isSelected
                        ? "text-foreground underline decoration-primary decoration-2 underline-offset-4"
                        : etapa.status === "current"
                        ? "text-primary"
                        : etapa.status === "completed"
                        ? "text-foreground"
                        : etapa.status === "warning"
                        ? "text-warning"
                        : etapa.status === "error"
                        ? "text-danger"
                        : "text-muted-foreground"
                    )}
                  >
                    {etapa.title}
                  </span>

                  {/* Badge de estado del paso */}
                  <div className="mt-1.5">
                    <Badge
                      tone={etapa.badgeTone}
                      appearance={etapa.badgeAppearance}
                      size="sm"
                      className="text-[10px] font-bold tracking-tight px-2 py-0.5 gap-1"
                    >
                      {etapa.status === "completed" && <Check className="size-2.5 stroke-[3px]" />}
                      {etapa.status === "warning" && <AlertTriangle className="size-2.5" />}
                      {etapa.badgeLabel}
                    </Badge>
                  </div>

                  {/* Metadatos de trazabilidad: fecha / actor */}
                  {etapa.fecha ? (
                    <div className="mt-2 text-[10px] text-muted-foreground flex flex-col items-center gap-0.5">
                      <span className="font-mono text-muted-foreground/80 flex items-center gap-1">
                        <Calendar className="size-2.5 shrink-0" />
                        {etapa.fecha}
                      </span>
                      {etapa.actor && (
                        <span className="text-[10px] font-medium text-foreground truncate max-w-[120px]" title={etapa.actor}>
                          {etapa.actor}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-[10px] text-muted-foreground/60 italic truncate max-w-[120px]">
                      {etapa.responsableRol}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 3. Inspector contextual de la etapa seleccionada */}
      {showInspector && etapaInspeccionada && (
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-border/80 bg-surface-subtle/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div
              className={cn(
                "size-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 sm:mt-0",
                etapaInspeccionada.status === "completed" && "bg-success/10 text-success",
                etapaInspeccionada.status === "current" && "bg-primary/10 text-primary",
                etapaInspeccionada.status === "warning" && "bg-warning/10 text-warning",
                etapaInspeccionada.status === "error" && "bg-danger/10 text-danger",
                etapaInspeccionada.status === "pending" && "bg-muted text-muted-foreground"
              )}
            >
              <Info className="size-3.5" />
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-foreground">
                  {etapaInspeccionada.prefix}: {etapaInspeccionada.title} ({etapaInspeccionada.codigoHU})
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="size-3 text-primary" />
                  Responsable: <strong className="text-foreground">{etapaInspeccionada.responsableRol}</strong>
                </span>
                {etapaInspeccionada.fecha && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground font-mono">
                      Registrado: {etapaInspeccionada.fecha}
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground leading-relaxed line-clamp-2">
                {etapaInspeccionada.descripcion}
              </p>

              {etapaInspeccionada.observacion && (
                <p className="text-warning font-medium mt-1 leading-relaxed bg-warning/10 p-2 rounded-lg border border-warning/20">
                  <strong>Observación registrada:</strong> {etapaInspeccionada.observacion}
                </p>
              )}
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground/80 shrink-0 self-end sm:self-center italic">
            Paso {inspectedIndex + 1} de {etapas.length}
          </div>
        </div>
      )}
    </div>
  );
}
