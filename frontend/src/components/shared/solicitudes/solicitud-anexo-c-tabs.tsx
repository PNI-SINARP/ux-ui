"use client";

import React, { useState } from "react";
import {
  Building2,
  User,
  ShieldCheck,
  FileText,
  FileSignature,
  Download,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Phone,
  Briefcase,
  Layers,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Printer,
  Eye,
  X,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { type TramiteCambioCoordinador } from "@/modules/cambio-coordinador/data/cambio-coordinador-store";

interface SolicitudAnexoCDetailProps {
  solicitud: SolicitudIngreso;
  tramite?: TramiteCambioCoordinador | null;
}

export function SolicitudAnexoCDetail({ solicitud, tramite }: SolicitudAnexoCDetailProps) {
  // Modo de visualización: "pasos" | "documento"
  const [viewMode, setViewMode] = useState<"pasos" | "documento">("pasos");
  // Navegación dentro de "pasos": 0 = Entidad y Autoridad, 1 = Coordinadores, 2 = Documentos Digitales, 3 = Firma y FirmaEC
  const [cStep, setCStep] = useState<number>(0);

  // Modales de visualización documental
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAuthDocOpen, setIsAuthDocOpen] = useState(false);

  const anexoC = solicitud.anexoC || tramite?.datosAnexoC;
  const esDelegado = anexoC?.esDelegado ?? (tramite?.firmanteTipo === "DELEGADO_AUTORIZADO");
  const esTitular = anexoC?.aplicaCambioTitular ?? (tramite?.caracter === "TITULAR" || true);

  const salienteNombre = tramite?.coordinadorSaliente?.nombreCompleto || "Juan Pérez";
  const salienteCedula = tramite?.coordinadorSaliente?.cedula || "1712345678";
  const salienteCorreo = tramite?.coordinadorSaliente?.correo || "juan.perez@educacion.gob.ec";
  const salienteCargo = tramite?.coordinadorSaliente?.cargo || "Director de Tecnologías de la Información";

  const entranteNombre = anexoC?.nuevoTitularNombre || anexoC?.nuevoSuplenteNombre || tramite?.coordinadorEntrante?.nombreCompleto || solicitud.nombreCompleto || "Roberto Carlos Dávila Silva";
  const entranteCedula = anexoC?.nuevoTitularCedula || anexoC?.nuevoSuplenteCedula || tramite?.coordinadorEntrante?.cedula || solicitud.cedula || "1721345987";
  const entranteCorreo = anexoC?.nuevoTitularEmail || anexoC?.nuevoSuplenteEmail || tramite?.coordinadorEntrante?.correo || solicitud.correo || "roberto.davila@educacion.gob.ec";
  const entranteCargo = anexoC?.nuevoTitularCargo || anexoC?.nuevoSuplenteCargo || tramite?.coordinadorEntrante?.cargo || "Director Nacional de Tecnologías y Conectividad";
  const entranteMotivo = anexoC?.nuevoTitularMotivo || anexoC?.nuevoSuplenteMotivo || tramite?.coordinadorEntrante?.motivo || "Reestructuración administrativa interna de la institución educativa.";

  const poseeAnexoB = tramite?.coordinadorEntrante?.poseeAnexoBAprobado ?? false;

  return (
    <div className="space-y-6">
      {/* ── BARRA SUPERIOR: SELECTOR DE MODO DE VISTA (POR PASOS | POR DOCUMENTO) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-surface border border-border rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[11px] font-bold">
            ARP-R03
          </Badge>
          <div className="text-xs">
            <span className="font-bold text-foreground">Modo de consulta del expediente:</span>
            <span className="text-muted-foreground ml-1.5 hidden md:inline">
              {viewMode === "pasos" ? "Flujo desglosado paso a paso en solo lectura" : "Vista documental oficial para impresión o descarga"}
            </span>
          </div>
        </div>

        {/* Interruptor Segmentado */}
        <div className="inline-flex items-center p-1 bg-muted/40 rounded-xl border border-border/60 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("pasos")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === "pasos"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" />
            <span>Por pasos</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("documento")}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              viewMode === "documento"
                ? "bg-primary text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="size-3.5" />
            <span>Por documento</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODO 1: VISTA POR PASOS (4 PASOS SOLO LECTURA) ── */}
      {/* ════════════════════════════════════════════════════════════════════════════════ */}
      {viewMode === "pasos" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Navegador de Pasos Cápsula */}
          <div className="overflow-x-auto py-1">
            <Tabs
              defaultValue="step-0"
              value={`step-${cStep}`}
              onValueChange={(val) => setCStep(Number(val.replace("step-", "")))}
              className="w-full"
            >
              <TabsList className="h-auto p-1 rounded-full bg-background border border-border/50 inline-flex gap-1 flex-nowrap w-max sm:w-auto justify-start">
                <TabsTrigger
                  value="step-0"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <Building2 className="size-3.5 shrink-0" />
                  <span>1. Entidad y Autoridad</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-1"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <User className="size-3.5 shrink-0" />
                  <span>2. Coordinadores</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-2"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span>3. Documentos Digitales</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-3"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                  <span>4. Firma y FirmaEC</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* ── PASO 0: ENTIDAD Y AUTORIDAD COMPARECIENTE ── */}
          {cStep === 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span>Sección I — Identificación Institucional y Autoridad Compareciente</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expediente institucional registrado formalmente bajo trámite {solicitud.id}.
                  </p>
                </div>
                <Badge tone="primary" appearance="solid" size="sm" className="font-bold shrink-0 !text-white shadow-xs">
                  {esTitular ? "CAMBIO COORDINADOR TITULAR" : "CAMBIO COORDINADOR SUPLENTE"}
                </Badge>
              </div>

              {/* Tarjeta de la Entidad */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>Institución Requirente Acreditada</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Razón Social / Entidad:</span>
                    <strong className="text-foreground text-sm font-semibold">{anexoC?.nombreEntidad || solicitud.institucion}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">RUC Institucional:</span>
                    <strong className="text-foreground font-mono text-sm">{tramite?.ruc || "1760004560001"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Estado Institucional:</span>
                    <Badge tone="success" appearance="soft" size="sm" className="font-semibold mt-0.5">
                      Institución activa
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Carácter de la Sustitución:</span>
                    <span className="font-semibold text-foreground">{esTitular ? "Coordinador Titular" : "Coordinador Suplente"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Fecha de Ingreso de Solicitud:</span>
                    <span className="font-mono text-foreground font-medium">{solicitud.fechaSolicitud}</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de la Autoridad o Delegado Compareciente */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span>Firmante del Instrumento (Anexo C)</span>
                  </h3>
                  <Badge tone={esDelegado ? "warning" : "primary"} appearance="soft" size="sm" className="font-semibold">
                    {esDelegado ? "DELEGADO AUTORIZADO" : "MÁXIMA AUTORIDAD"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nombres y Apellidos del Firmante:</span>
                    <strong className="text-foreground text-sm">{anexoC?.representanteLegalNombre || "Carlos Andrade"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Calidad de Comparecencia:</span>
                    <span className="text-foreground font-medium">
                      {esDelegado ? "Delegado facultado por Resolución de la Máxima Autoridad" : "Máxima Autoridad Institucional"}
                    </span>
                  </div>
                  {esDelegado && (
                    <div className="sm:col-span-2 p-3 bg-warning/5 rounded-lg border border-warning/20 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs">
                        <FileSignature className="size-4 text-warning shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground block">Resolución de Delegación Formal</span>
                          <span className="text-[11px] text-muted-foreground">Documento habilitante verificado legalmente</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAuthDocOpen(true)}
                        className="text-xs font-semibold gap-1.5 shrink-0"
                      >
                        <Eye className="size-3.5" />
                        <span>Ver documento</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCStep(1)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Coordinadores Saliente y Entrante →</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── PASO 1: COORDINADORES (SALIENTE VS ENTRANTE) ── */}
          {cStep === 1 && (
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <User className="size-4 text-primary shrink-0" />
                    <span>Sección II — Sustitución de Coordinador Institucional</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Comparativa detallada del funcionario saliente y del nuevo funcionario designado.
                  </p>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
                  {esTitular ? "Coordinador Titular" : "Coordinador Suplente"}
                </Badge>
              </div>

              {/* Grid 2 Columnas: Coordinador Saliente vs Coordinador Entrante */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Coordinador Saliente */}
                <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 dark:bg-danger/10 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-danger/20">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center font-bold text-xs">
                        SAL
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Coordinador Saliente</h4>
                        <span className="text-[10px] text-danger font-semibold">Desvinculación solicitada</span>
                      </div>
                    </div>
                    <Badge tone="danger" appearance="soft" size="sm" className="font-bold text-[10px]">
                      RETIRAR ACCESOS
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Nombres y Apellidos:</span>
                      <strong className="text-foreground font-semibold">{salienteNombre}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Cédula:</span>
                        <span className="font-mono text-foreground font-medium">{salienteCedula}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Carácter:</span>
                        <span className="text-foreground">{esTitular ? "Titular" : "Suplente"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Correo institucional:</span>
                      <span className="text-foreground font-mono text-[11px]">{salienteCorreo}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Cargo en la entidad:</span>
                      <span className="text-foreground">{salienteCargo}</span>
                    </div>
                    <div className="pt-2 border-t border-danger/20 flex items-center gap-1.5 text-[11px] text-danger">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <span>Al aprobarse el cambio, su cuenta y credenciales asociadas serán desvinculadas.</span>
                    </div>
                  </div>
                </div>

                {/* Coordinador Entrante */}
                <div className="p-4 rounded-xl border border-success/30 bg-success/5 dark:bg-success/10 space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-success/20">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold text-xs">
                        ENT
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">Coordinador Entrante</h4>
                        <span className="text-[10px] text-success font-semibold">Nuevo funcionario designado</span>
                      </div>
                    </div>
                    <Badge tone="success" appearance="soft" size="sm" className="font-bold text-[10px]">
                      NUEVO DESIGNADO
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Nombres y Apellidos:</span>
                      <strong className="text-foreground font-semibold text-sm">{entranteNombre}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Cédula:</span>
                        <span className="font-mono text-foreground font-bold">{entranteCedula}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Carácter:</span>
                        <span className="text-foreground font-semibold">{esTitular ? "Titular" : "Suplente"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Correo institucional:</span>
                      <span className="text-foreground font-mono text-[11px] font-semibold">{entranteCorreo}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Cargo en la entidad:</span>
                      <span className="text-foreground">{entranteCargo}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground block">Motivo registrado del reemplazo:</span>
                      <p className="text-muted-foreground italic text-[11px] bg-surface p-2 rounded border border-border/60">
                        &quot;{entranteMotivo}&quot;
                      </p>
                    </div>
                    <div className="pt-2 border-t border-success/20 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Estado de cuenta / Anexo B:</span>
                      <Badge tone={poseeAnexoB ? "success" : "warning"} appearance="soft" size="sm" className="font-bold text-[10px]">
                        {poseeAnexoB ? "Anexo B aprobado (Caso A)" : "Sin Anexo B previo (Caso B)"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerta Informativa Oficial de Continuidad Operativa (Requisito 5) */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-foreground block">
                    Garantía Institucional de Continuidad Operativa
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Los proyectos, solicitudes, contratos, cupos y credenciales de la institución no se eliminan por el cambio de Coordinador. El nuevo funcionario hereda la representación técnica de la entidad.
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCStep(0)}
                  className="text-xs font-semibold"
                >
                  ← Anterior
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCStep(2)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Documentos Digitales →</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── PASO 2: DOCUMENTOS DIGITALES DEL EXPEDIENTE ── */}
          {cStep === 2 && (
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span>Sección III — Expediente Documental Digital</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Instrumentos jurídicos suscritos e incorporados al trámite {solicitud.id}.
                  </p>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-xs">
                  {esDelegado ? "2 DOCUMENTOS" : "1 DOCUMENTO"}
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Documento 1: Formulario Oficial Anexo C */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-foreground">
                          ARP-R03_Cambio_Coordinador.pdf
                        </strong>
                        <Badge tone="success" appearance="soft" size="sm" className="font-bold text-[10px]">
                          FIRMADO DIGITALMENTE
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Formulario oficial de Solicitud de Cambio de Coordinador Institucional (Anexo C) · 248 KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPreviewOpen(true)}
                      className="text-xs font-semibold gap-1.5"
                    >
                      <Eye className="size-3.5" />
                      <span>Ver documento firmado</span>
                    </Button>
                  </div>
                </div>

                {/* Documento 2: Autorización de Delegación (si firmó delegado) */}
                {esDelegado ? (
                  <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 dark:bg-warning/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
                        <FileSignature className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs font-bold text-foreground">
                            {anexoC?.archivoSoporteDelegacion || "Resolucion_Delegacion_Firma.pdf"}
                          </strong>
                          <Badge tone="warning" appearance="soft" size="sm" className="font-bold text-[10px]">
                            ADJUNTADO Y VERIFICADO
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          Resolución o Instrumento Jurídico de Delegación de Firma de la Máxima Autoridad · 1.2 MB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAuthDocOpen(true)}
                        className="text-xs font-semibold gap-1.5"
                      >
                        <Eye className="size-3.5" />
                        <span>Ver autorización</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border border-dashed border-border bg-muted/10 text-xs text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>No requiere autorización adjunta al haber sido suscrito directamente por la Máxima Autoridad.</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCStep(1)}
                  className="text-xs font-semibold"
                >
                  ← Anterior
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setCStep(3)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Firma y Validación FirmaEC →</span>
                </Button>
              </div>
            </div>
          )}

          {/* ── PASO 3: FIRMA Y VALIDACIÓN FIRMAEC ── */}
          {cStep === 3 && (
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>Sección IV — Validación Criptográfica FirmaEC</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Certificación de no repudio y validez jurídica del certificado digital suscriptor.
                  </p>
                </div>
                <Badge tone="success" appearance="solid" size="sm" className="font-bold shrink-0 !text-white shadow-xs">
                  CERTIFICADO VÁLIDO
                </Badge>
              </div>

              {/* Panel de Validación Criptográfica */}
              <div className="p-5 rounded-xl border border-success/30 bg-success/5 dark:bg-success/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-success/20">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-success/20 text-success flex items-center justify-center font-bold">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Sello de Firma Electrónica Confirmada</h4>
                      <p className="text-[11px] text-muted-foreground">Validado por FirmaEC / Agencia de Regulación y Control Postal</p>
                    </div>
                  </div>
                  <Badge tone="success" appearance="soft" size="sm" className="font-bold text-xs self-start sm:self-auto">
                    ESTADO: VÁLIDA
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Firmante Digital Acreditado:</span>
                    <strong className="text-foreground text-sm font-semibold">{anexoC?.representanteLegalNombre || "Carlos Andrade"}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Entidad Certificadora (PSC):</span>
                    <strong className="text-foreground">{tramite?.firmaEC?.entidadCertificadora || "Banco Central del Ecuador (BCE)"}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">ID Transacción FirmaEC:</span>
                    <span className="font-mono text-foreground font-semibold">{tramite?.firmaEC?.transaccionId || "FEC-2026-90412"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground block">Fecha y Hora de Firma:</span>
                    <span className="font-mono text-foreground">{tramite?.firmaEC?.fechaFirma || solicitud.fechaSolicitud || "04/10/2026 10:15"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[11px] text-muted-foreground block">Huella Digital Criptográfica (SHA-256):</span>
                    <code className="text-[11px] font-mono bg-surface p-2 rounded-lg border border-border/60 block text-foreground break-all select-all">
                      {tramite?.firmaEC?.huellaSha256 || "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1"}
                    </code>
                  </div>
                </div>
              </div>

              <div className="flex justify-start pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCStep(2)}
                  className="text-xs font-semibold"
                >
                  ← Anterior: Documentos Digitales
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════════════ */}
      {/* ── MODO 2: VISTA POR DOCUMENTO OFICIAL (ARP-R03) ── */}
      {/* ════════════════════════════════════════════════════════════════════════════════ */}
      {viewMode === "documento" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 bg-surface border border-border rounded-2xl shadow-xs space-y-6 max-w-4xl mx-auto">
            {/* Cabecera Documental Oficial DINARP */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border text-center sm:text-left">
              <div>
                <span className="font-mono text-xs font-bold text-primary block">
                  REPÚBLICA DEL ECUADOR · DINARP
                </span>
                <span className="text-xs text-muted-foreground uppercase font-semibold">
                  DIRECCIÓN NACIONAL DE REGISTROS PÚBLICOS
                </span>
              </div>
              <div className="text-center sm:text-right">
                <span className="font-mono text-xs font-bold text-primary block">
                  CÓDIGO: ARP-R03
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  ANEXO C · SUSTITUCIÓN DE COORDINADOR
                </span>
              </div>
            </div>

            {/* Título Principal */}
            <div className="text-center space-y-1">
              <h4 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-wide">
                SOLICITUD DE CAMBIO DE COORDINADOR INSTITUCIONAL DEL SINARP
              </h4>
              <p className="text-[11px] text-muted-foreground italic">
                Formulario Oficial ARP-R03 al amparo de la Ley del SINARP y Ley Orgánica de Protección de Datos Personales
              </p>
            </div>

            {/* Cláusulas Formales del Instrumento */}
            <div className="space-y-4 text-[11px] sm:text-xs leading-relaxed text-muted-foreground text-justify p-4 rounded-xl border border-border/60 bg-muted/10 max-h-[500px] overflow-y-auto pr-3">
              <p>
                <strong>CLÁUSULA PRIMERA. - COMPARECENCIA Y REPRESENTACIÓN LEGAL:</strong><br />
                Comparece a la suscripción del presente instrumento formal el/la ciudadano/a <strong>{anexoC?.representanteLegalNombre || "Carlos Andrade"}</strong>, en su calidad de <strong>{esDelegado ? "Delegado facultado por Resolución de la Máxima Autoridad" : "Máxima Autoridad"}</strong> de <strong>{anexoC?.nombreEntidad || solicitud.institucion}</strong> con RUC institucional <strong>{tramite?.ruc || "1760004560001"}</strong>, en adelante LA ENTIDAD SOLICITANTE.
              </p>

              <p>
                <strong>CLÁUSULA SEGUNDA. - SOLICITUD DE SUSTITUCIÓN:</strong><br />
                LA ENTIDAD SOLICITANTE solicita formalmente a la Dirección Nacional de Registros Públicos (DINARP) la desvinculación funcional de <strong>{salienteNombre}</strong>, portador de la C.I. <strong>{salienteCedula}</strong>, quien venía desempeñándose como <strong>Coordinador {esTitular ? "Titular" : "Suplente"}</strong> institucional, y su respectiva sustitución por el funcionario entrante debidamente acreditado.
              </p>

              <p>
                <strong>CLÁUSULA TERCERA. - DESIGNACIÓN DEL COORDINADOR ENTRANTE:</strong><br />
                Se designa como nuevo Coordinador {esTitular ? "Titular" : "Suplente"} institucional al/la servidor/a público/a <strong>{entranteNombre}</strong> con C.I. <strong>{entranteCedula}</strong>, correo institucional <strong>{entranteCorreo}</strong> y cargo de <strong>{entranteCargo}</strong>. La sustitución obedece a la siguiente justificación técnica y administrativa: <em>&quot;{entranteMotivo}&quot;</em>.
              </p>

              <p>
                <strong>CLÁUSULA CUARTA. - BASE LEGAL APLICABLE:</strong><br />
                El presente instrumento se suscribe en estricto cumplimiento del Art. 66 num. 19 de la Constitución de la República del Ecuador, los Arts. 4 y 28 de la Ley Orgánica del Sistema Nacional de Registros Públicos (SINARP), y los principios de seguridad de la información y protección de datos personales consagrados en la Ley Orgánica de Protección de Datos Personales.
              </p>

              <p>
                <strong>CLÁUSULA QUINTA. - CONTINUIDAD DE OBLIGACIONES Y CUPOS INSTITUCIONALES:</strong><br />
                Se deja expresa constancia de que los contratos, convenios de interoperabilidad, proyectos en curso, cupos de consumo y credenciales institucionales asignadas a LA ENTIDAD SOLICITANTE no se extinguen ni suspenden por efecto del presente cambio de Coordinador, subrogando el nuevo funcionario las facultades y deberes inherentes a dicho rol.
              </p>

              <p>
                <strong>CLÁUSULA SEXTA. - DECLARACIÓN BAJO JURAMENTO Y FIRMA DIGITAL:</strong><br />
                El compareciente declara bajo juramento la veracidad, autenticidad e integridad de la información y documentos consignados, sometiéndose a las responsabilidades civiles y penales en caso de falsedad, y suscribe el presente documento mediante firma electrónica avanzada y válida conforme a la legislación nacional.
              </p>
            </div>

            {/* Sello de Firma Electrónica Validada */}
            <div className="pt-4 max-w-md mx-auto text-xs">
              <div className="p-4 rounded-xl border border-success/30 bg-success/5 dark:bg-success/10 text-center space-y-2">
                <div className="size-9 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-[10px] font-bold">
                  <CheckCircle2 className="size-3" />
                  <span>Suscrito con FirmaEC</span>
                </div>
                <div>
                  <strong className="block text-foreground text-xs font-semibold">
                    {anexoC?.representanteLegalNombre || "Carlos Andrade"}
                  </strong>
                  <span className="text-[11px] text-muted-foreground block">
                    {esDelegado ? "Delegado de la Máxima Autoridad" : "Máxima Autoridad"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                    Transacción: {tramite?.firmaEC?.transaccionId || "FEC-2026-90412"} · {solicitud.fechaSolicitud}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Documento oficial generado con código de trámite <strong>{solicitud.id}</strong>.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Printer className="size-3.5" />
                  <span>Imprimir</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => toast.success("Descargando copia oficial fidedigna del Anexo C (ARP-R03)...")}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Download className="size-3.5" />
                  <span>Descargar PDF Oficial</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Vista Previa del Anexo C Firmado */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>Visor Oficial — Anexo C (ARP-R03)</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Documento suscrito formalmente para el cambio de coordinador institucional.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-border bg-muted/20 text-xs leading-relaxed text-muted-foreground">
            <div className="text-center pb-2 border-b border-border">
              <span className="font-bold text-foreground block">REPÚBLICA DEL ECUADOR · DINARP</span>
              <span className="font-mono text-primary font-bold">FORMULARIO OFICIAL ARP-R03</span>
            </div>
            <p><strong>Entidad:</strong> {anexoC?.nombreEntidad || solicitud.institucion} (RUC: {tramite?.ruc || "1760004560001"})</p>
            <p><strong>Firmante:</strong> {anexoC?.representanteLegalNombre || "Carlos Andrade"} ({esDelegado ? "Delegado Autorizado" : "Máxima Autoridad"})</p>
            <p><strong>Coordinador Saliente:</strong> {salienteNombre} (C.I. {salienteCedula}) - Desvinculación solicitada.</p>
            <p><strong>Coordinador Entrante:</strong> {entranteNombre} (C.I. {entranteCedula}, {entranteCorreo}) - Nuevo designado ({esTitular ? "Titular" : "Suplente"}).</p>
            <p><strong>Motivo:</strong> &quot;{entranteMotivo}&quot;</p>
            <div className="p-3 rounded-lg border border-success/30 bg-success/10 text-success text-[11px] flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Firma electrónica válida verificada por FirmaEC con certificado digital del Banco Central del Ecuador.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Vista de Autorización de Delegación */}
      <Dialog open={isAuthDocOpen} onOpenChange={setIsAuthDocOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] flex flex-col p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading flex items-center gap-2">
              <FileSignature className="size-5 text-warning" />
              <span>Resolución de Delegación de Firma</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Instrumento legal habilitante de la Máxima Autoridad a favor del delegado compareciente.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl border border-border bg-muted/20 text-xs leading-relaxed text-muted-foreground">
            <div className="p-3 bg-warning/10 rounded-lg border border-warning/20 text-warning-foreground font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 text-warning" />
              <span>Instrumento verificado y conforme a la normativa vigente.</span>
            </div>
            <p><strong>Documento:</strong> {anexoC?.archivoSoporteDelegacion || "Resolucion_Delegacion_Firma.pdf"}</p>
            <p><strong>Otorgante:</strong> Máxima Autoridad Institucional</p>
            <p><strong>Delegado:</strong> {anexoC?.representanteLegalNombre || "Carlos Andrade"}</p>
            <p><strong>Facultad:</strong> Suscripción de instrumentos de cambio y designación de coordinadores institucionales ante el SINARP.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
