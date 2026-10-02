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
  Printer
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

interface SolicitudAnexoBDetailProps {
  solicitud: SolicitudIngreso;
}

export function SolicitudAnexoBDetail({ solicitud }: SolicitudAnexoBDetailProps) {
  // Selector de modo de vista: "pasos" | "documento"
  const [viewMode, setViewMode] = useState<"pasos" | "documento">("pasos");
  // Navegación dentro de "pasos": 0 = Coordinador, 1 = Cláusulas, 2 = Revisión, 3 = Firma y Envío
  const [bStep, setBStep] = useState<number>(0);

  const anexoB = solicitud.anexoB;

  return (
    <div className="space-y-6">
      {/* â”€â”€ BARRA SUPERIOR: SELECTOR DE MODO DE VISTA (POR PASOS | POR DOCUMENTO) â”€â”€ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 bg-surface border border-border rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[11px] font-bold">
            ARP-R02
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

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â”€â”€ MODO 1: VISTA POR PASOS (4 PASOS SOLO LECTURA) â”€â”€ */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {viewMode === "pasos" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Navegador de Pasos Cápsula */}
          <div className="overflow-x-auto py-1">
            <Tabs
              defaultValue="step-0"
              value={`step-${bStep}`}
              onValueChange={(val) => setBStep(Number(val.replace("step-", "")))}
              className="w-full"
            >
              <TabsList className="h-auto p-1 rounded-full bg-background border border-border/50 inline-flex gap-1 flex-nowrap w-max sm:w-auto justify-start">
                <TabsTrigger
                  value="step-0"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <User className="size-3.5 shrink-0" />
                  <span>1. Coordinador e Institución</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-1"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span>2. Acuerdo y Cláusulas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-2"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <FileCheck2 className="size-3.5 shrink-0" />
                  <span>3. Revisión del Expediente</span>
                </TabsTrigger>
                <TabsTrigger
                  value="step-3"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-white dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                  <span>4. Firma y Envío</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* â”€â”€ PASO 1: COORDINADOR E INSTITUCIÓN â”€â”€ */}
          {bStep === 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <User className="size-4 text-primary shrink-0" />
                    <span>Identificación del Coordinador e Institución Solicitante</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expediente verificado y remitido formalmente bajo trámite {solicitud.id}.
                  </p>
                </div>
                <Badge tone="primary" appearance="solid" size="sm" className="font-bold shrink-0 !text-white shadow-xs">
                  {anexoB?.rolAsignado || "COORDINADOR TITULAR"}
                </Badge>
              </div>

              {/* Tarjeta del Coordinador */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="size-4 text-primary" />
                  <span>Datos del Coordinador Designado</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nombres y Apellidos:</span>
                    <strong className="text-foreground text-sm font-semibold">{anexoB?.funcionarioNombre || solicitud.nombreCompleto}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Cédula de Identidad:</span>
                    <strong className="text-foreground font-mono text-sm">{anexoB?.funcionarioCedula || solicitud.cedula}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Cargo Institucional:</span>
                    <strong className="text-foreground">{anexoB?.funcionarioCargo || "Director de TI / Sistemas"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Correo Institucional:</span>
                    <strong className="text-foreground">{anexoB?.funcionarioEmail || solicitud.correo}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Rol Registrado en SINARP:</span>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold mt-0.5">
                      {anexoB?.rolAsignado || "COORDINADOR TITULAR"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Fecha de Recepción de Solicitud:</span>
                    <span className="font-mono text-foreground font-medium">{solicitud.fechaSolicitud}</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de la Institución Solicitante */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <span>Institución Requirente y Representación Legal</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Nombre de la Entidad:</span>
                    <strong className="text-foreground text-sm">{anexoB?.nombreEntidad || solicitud.institucion}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Domicilio Legal Institucional:</span>
                    <span className="text-foreground">{anexoB?.domicilioEntidad || "Calle Bolívar y Borrero, Cuenca, Azuay"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Máxima Autoridad / Representante Legal:</span>
                    <strong className="text-foreground">{anexoB?.representanteLegalNombre || "Alcalde / Máxima Autoridad"}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Misión / Objeto Institucional:</span>
                    <p className="text-muted-foreground mt-0.5 italic">
                      {anexoB?.misionVisionInstitucional || "Garantizar la provisión oportuna de servicios públicos e interoperabilidad registral conforme a derecho."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setBStep(1)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Acuerdo y Cláusulas â†’</span>
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ PASO 2: ACUERDO Y CLÁUSULAS (10 CLÁUSULAS LEGALES OFICIALES ARP-R02) â”€â”€ */}
          {bStep === 1 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span>Acuerdo de Uso y Confidencialidad (ARP-R02 · Versión 1.0)</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Texto oficial íntegro de las 10 cláusulas legales suscritas por los intervinientes.
                  </p>
                </div>
                <Badge tone="neutral" appearance="outline" size="sm" className="font-mono text-[10px] self-start sm:self-auto">
                  Vigencia: 20-06-2025
                </Badge>
              </div>

              {/* Visor Scrollable con las 10 Cláusulas Oficiales de Anexo B */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4 max-h-[460px] overflow-y-auto text-xs leading-relaxed divide-y divide-border/60">
                {/* Cláusula Primera */}
                <div className="pt-2 first:pt-0 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">01.</span>
                    <span>CLÁUSULA PRIMERA. - INTERVINIENTES</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Comparecen a la suscripción del presente Acuerdo de Uso y Confidencialidad, por una parte, la entidad requirente <strong className="text-foreground">{anexoB?.nombreEntidad || solicitud.institucion}</strong>, domiciliada en <strong className="text-foreground">{anexoB?.domicilioEntidad || "Ecuador"}</strong>, representada legalmente por <strong className="text-foreground">{anexoB?.representanteLegalNombre || "Máxima Autoridad"}</strong>; y por otra parte, el/la servidor/a público/a <strong className="text-foreground">{anexoB?.funcionarioNombre || solicitud.nombreCompleto}</strong> con C.I. <strong className="text-foreground">{anexoB?.funcionarioCedula || solicitud.cedula}</strong> en su calidad de <strong className="text-foreground">{anexoB?.rolAsignado || "COORDINADOR TITULAR"}</strong>.
                  </p>
                </div>

                {/* Cláusula Segunda */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">02.</span>
                    <span>CLÁUSULA SEGUNDA. - ANTECEDENTES</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    La entidad requirente declara que requiere acceso a los datos registrales para el cumplimiento de sus fines legales y constitucionales: <em className="text-foreground">{anexoB?.misionVisionInstitucional || "Garantizar la interoperabilidad técnica y custodia estricta de las fuentes registrales del SINARP."}</em>
                  </p>
                </div>

                {/* Cláusula Tercera */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">03.</span>
                    <span>CLÁUSULA TERCERA. - BASE LEGAL</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    El presente instrumento se sustenta en el Art. 66 num. 19 de la Constitución de la República del Ecuador; Arts. 4, 27, 28 y 29 de la Ley Orgánica del Sistema Nacional de Registros Públicos; Arts. 2, 7, 10, 38 y 46 de la Ley Orgánica de Protección de Datos Personales (LOPDP); Ley Orgánica para la Optimización y Eficiencia de Trámites Administrativos; y Arts. 178 y 229 del Código Orgánico Integral Penal (COIP).
                  </p>
                </div>

                {/* Cláusula Cuarta */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">04.</span>
                    <span>CLÁUSULA CUARTA. - DE LA PROTECCIÓN DE LA INFORMACIÓN Y EL TRATAMIENTO</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Toda información contenida en las herramientas del SINARP se sujeta a las condiciones de legitimación para el tratamiento de datos personales y a los principios de legalidad, finalidad, pertinencia, minimización y confidencialidad. Los intervinientes quedan obligados a utilizar única y exclusivamente la información para los fines autorizados por la DINARP.
                  </p>
                </div>

                {/* Cláusula Quinta */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">05.</span>
                    <span>CLÁUSULA QUINTA. - OBLIGACIONES DE LOS INTERVINIENTES</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] pl-1">
                    <li>Utilizar los accesos al SINARP exclusivamente para los propósitos inherentes a sus funciones o cargo institucional.</li>
                    <li>Velar por la custodia y buen uso de la información que integra el Sistema Nacional de Registros Públicos.</li>
                    <li>Implementar y utilizar medidas técnicas y organizativas de seguridad frente a amenazas cibernéticas.</li>
                    <li>Mantener políticas de trazabilidad y bitácoras de auditoría de cada consulta realizada en la plataforma.</li>
                    <li>Notificar de inmediato a DINARP cualquier incidente o vulneración de seguridad que afecte los datos.</li>
                    <li>Al concluir funciones, elaborar el acta entrega-recepción formal del estado de los accesos.</li>
                  </ul>
                </div>

                {/* Cláusula Sexta */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">06.</span>
                    <span>CLÁUSULA SEXTA. - PROHIBICIONES DE LOS INTERVINIENTES</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] pl-1">
                    <li>Modificar, alterar, divulgar, comercializar o ceder total o parcialmente la información y herramientas provistas.</li>
                    <li>Publicar o compartir credenciales, tokens o accesos al SINARP con terceros no autorizados.</li>
                    <li>Hacer uso de las credenciales institucionales durante períodos de vacaciones o permisos laborales.</li>
                  </ul>
                </div>

                {/* Cláusula Séptima */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">07.</span>
                    <span>CLÁUSULA SÉPTIMA. - RESPONSABILIDAD</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Los intervinientes asumirán las responsabilidades civiles, administrativas y penales pertinentes en caso de inobservancia o uso no autorizado de la información registral protegida.
                  </p>
                </div>

                {/* Cláusula Octava */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">08.</span>
                    <span>CLÁUSULA OCTAVA. - DECLARACIONES</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Los intervinientes declaran conocer plenamente los servicios que brinda la DINARP y la normativa rectora, comprometiéndose a guardar absoluta reserva y sigilo legal sobre los datos de carácter confidencial consultados.
                  </p>
                </div>

                {/* Cláusula Novena */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">09.</span>
                    <span>CLÁUSULA NOVENA. - VIGENCIA</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    El presente acuerdo mantendrá su vigencia mientras el Coordinador designado desempeñe activamente sus funciones en la entidad requirente, debiendo notificarse formalmente a la DINARP ante cualquier desvinculación o relevo de cargo.
                  </p>
                </div>

                {/* Cláusula Décima */}
                <div className="pt-3 space-y-1">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="text-primary font-mono">10.</span>
                    <span>CLÁUSULA DÉCIMA. - ACEPTACIÓN</span>
                  </h4>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Los intervinientes aceptan el contenido íntegro de las cláusulas precedentes y para constancia formal suscriben el presente instrumento mediante firma electrónica reconocida por el marco legal de la República del Ecuador.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setBStep(0)}
                  className="text-xs font-semibold gap-1.5"
                >
                  â† Paso 1: Coordinador
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setBStep(2)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Revisión de Expediente â†’</span>
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ PASO 3: REVISIÓN DE EXPEDIENTE (SOLO LECTURA) â”€â”€ */}
          {bStep === 2 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <FileCheck2 className="size-4 text-primary shrink-0" />
                    <span>Revisión y Trazabilidad del Expediente Digital</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Resumen consolidado de procedencia, integridad de recaudos y trazabilidad previa de asignaciones.
                  </p>
                </div>
                <Badge tone="info" appearance="soft" size="sm" className="font-bold">
                  EXPEDIENTE DIGITAL ARP-R02
                </Badge>
              </div>

              {/* Verificación de Integridad de Recaudos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    Procedencia del Trámite
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span>Vinculado a Registro Aprobado</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Invitación originada tras dictamen institucional favorable en SINARP.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    Instrumento Legal
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                    <FileText className="size-4 text-primary shrink-0" />
                    <span>Formulario ARP-R02 v1.0</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    10 cláusulas jurídicas íntegras sin modificaciones ni adendas.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                    Asignación Operativa
                  </span>
                  <div className="flex items-center gap-2 text-foreground font-bold text-xs">
                    <Clock className="size-4 text-primary shrink-0" />
                    <span>{solicitud.revisorGestion ? `Asignado a ${solicitud.revisorGestion}` : "Pendiente de asignación"}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {solicitud.asignacionActual?.id_asignacion || "A la espera de asignación manual"}
                  </p>
                </div>
              </div>

              {/* Histórico de Asignaciones si existe */}
              {solicitud.historialAsignaciones && solicitud.historialAsignaciones.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>Trazabilidad de Asignaciones (ENR-03 R1/R4)</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {solicitud.historialAsignaciones.map((asig, idx) => (
                      <div
                        key={asig.id_asignacion || idx}
                        className={cn(
                          "p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2",
                          asig.vigente
                            ? "border-primary/40 bg-primary/5 dark:bg-primary/10"
                            : "border-border/60 bg-muted/20 opacity-70"
                        )}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-primary">{asig.id_asignacion}</span>
                            <Badge
                              tone={asig.vigente ? "success" : "neutral"}
                              appearance={asig.vigente ? "solid" : "soft"}
                              size="sm"
                              className="text-[10px]"
                            >
                              {asig.vigente ? "ASIGNACIÓN ACTIVA" : "CERRADA / HISTÓRICA"}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            <span>Revisor: <strong className="text-foreground">{asig.nombre_revisor}</strong> ({asig.id_revisor})</span>
                            <span className="mx-1.5">·</span>
                            <span>Asignado por: <strong className="text-foreground">{asig.nombre_asignador || asig.id_asignador}</strong></span>
                          </div>
                          {asig.motivo_reasignacion && (
                            <p className="text-[10px] text-muted-foreground italic">
                              Motivo: {asig.motivo_reasignacion}
                            </p>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground shrink-0">
                          {asig.instante_asignacion}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setBStep(1)}
                  className="text-xs font-semibold gap-1.5"
                >
                  â† Paso 2: Cláusulas
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setBStep(3)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <span>Siguiente: Firma y Envío â†’</span>
                </Button>
              </div>
            </div>
          )}

          {/* â”€â”€ PASO 4: FIRMA Y ENVÍO (VERIFICACIÓN TÉCNICA FIRMAEC Y DESAMBIGUACIÓN LEGAL) â”€â”€ */}
          {bStep === 3 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
              <div className="bg-primary/5 dark:bg-black/35 border-b border-primary/20 p-3.5 rounded-t-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                    <ShieldCheck className="size-4 text-primary shrink-0" />
                    <span>Verificación de Firma Electrónica y Recepción Formal</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Evidencia técnica criptográfica de suscripción del Anexo B mediante FirmaEC.
                  </p>
                </div>
                <Badge tone="success" appearance="solid" size="sm" className="font-bold !text-white shadow-2xs">
                  FIRMAEC VALIDADA
                </Badge>
              </div>

              {/* Título y Estado Formal Requerido */}
              <div className="p-4.5 rounded-2xl border border-success/30 bg-success/5 dark:bg-success/10 space-y-4">
                <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        Anexo B firmado por el Coordinador y validado mediante FirmaEC
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Certificado digital vigente y cadena de confianza gubernamental verificada sin alteraciones.
                      </p>
                    </div>
                  </div>
                  <Badge tone="success" appearance="soft" size="sm" className="font-mono text-[10px] font-bold uppercase">
                    Criptográficamente Válido
                  </Badge>
                </div>

                {/* Evidencia Técnica Detallada */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs pt-3 border-t border-success/20">
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Firmante Designado:</span>
                    <strong className="text-foreground text-xs">{anexoB?.funcionarioNombre || solicitud.nombreCompleto}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Cédula del Firmante:</span>
                    <strong className="text-foreground font-mono text-xs">{anexoB?.funcionarioCedula || solicitud.cedula}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Fecha y Hora de Estampado:</span>
                    <strong className="text-foreground font-mono text-xs">{solicitud.fechaSolicitud}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Versión del Documento:</span>
                    <span className="text-foreground font-mono text-xs">ARP-R02 Versión 1.0</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Entidad Certificadora:</span>
                    <span className="text-foreground text-xs">Banco Central del Ecuador / Security Data</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Algoritmo Criptográfico:</span>
                    <span className="text-foreground font-mono text-xs">SHA-256 with RSA 2048</span>
                  </div>
                </div>
              </div>

              {/* NOTA DE DESAMBIGUACIÓN LEGAL OBLIGATORIA ENR-03 */}
              <Alert variant="info" className="text-xs">
                <div>
                  <span className="font-bold text-foreground block text-xs">
                    Aclaración de competencia jurídica y operativa (ENR-03):
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed mt-1">
                    La firma electrónica válida constituye el requisito previo formal de suscripción por parte del coordinador compareciente y <strong>no debe confundirse con la aprobación de Gestión</strong>, la cual se emite exclusivamente mediante dictamen técnico y registro de decisión formal por parte del Revisor designado.
                  </p>
                </div>
              </Alert>

              {/* Archivo Asociado */}
              <div className="p-4 rounded-xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <FileSignature className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-xs text-foreground">
                      ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Documento oficial firmado electrónicamente · 245 KB · Integridad sellada
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success("Verificando firma en los servidores oficiales de FirmaEC...");
                      setTimeout(() => {
                        toast.success("Certificado válido emitido por BCE. Sello de tiempo vigente.");
                      }, 1000);
                    }}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>Verificar con FirmaEC</span>
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      toast.success("Descargando documento firmado ARP-R02 con estampas de FirmaEC...");
                    }}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <Download className="size-3.5" />
                    <span>Descargar PDF</span>
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setBStep(2)}
                  className="text-xs font-semibold gap-1.5"
                >
                  â† Paso 3: Revisión
                </Button>
                <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px]">
                  Expediente verificado · Listo para resolución de Gestión
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* â”€â”€ MODO 2: VISTA POR DOCUMENTO (HOJA DE OFICIO OFICIAL ARP-R02 SUSCRITA) â”€â”€ */}
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {viewMode === "documento" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Barra de Acciones del Documento */}
          <div className="flex items-center justify-between p-3.5 bg-surface border border-border rounded-xl shadow-xs">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="size-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Visor Oficial de Oficio ARP-R02</span>
              <span className="text-muted-foreground hidden sm:inline">· Vista íntegra del instrumento legal suscrito</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="text-xs font-semibold gap-1.5"
              >
                <Printer className="size-3.5" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Generando copia fidedigna en PDF del Acuerdo ARP-R02...");
                }}
                className="text-xs font-semibold gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Descargar PDF Oficial</span>
              </Button>
            </div>
          </div>

          {/* Hoja de Oficio Formal del Documento Anexo B (ARP-R02) */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 space-y-6 shadow-md max-w-4xl mx-auto border-t-4 border-t-primary">
            {/* Encabezado Institucional Oficial DINARP */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-horizontal.svg"
                  alt="DINARP"
                  className="dark:hidden h-10 w-auto object-contain"
                />
                <img
                  src="/logo-horizontal-blanco.svg"
                  alt="DINARP"
                  className="hidden dark:block h-10 w-auto object-contain"
                />
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-primary block">
                  CÓDIGO: ARP-R02
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  ANEXO B · SISTEMA NACIONAL DE REGISTROS PÚBLICOS
                </span>
              </div>
            </div>

            {/* Título Principal del Documento */}
            <div className="text-center space-y-1">
              <h4 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-wide">
                ACUERDO DE USO Y CONFIDENCIALIDAD PARA COORDINADORES DEL SINARP
              </h4>
              <p className="text-[11px] text-muted-foreground italic">
                Suscrito al amparo del Art. 66 num. 19 de la Constitución y Arts. 4 y 28 de la Ley del SINARP
              </p>
            </div>

            {/* Cuerpo de las 10 Cláusulas Formales */}
            <div className="space-y-4 text-[11px] sm:text-xs leading-relaxed text-muted-foreground text-justify p-4 rounded-xl border border-border/60 bg-muted/10 max-h-[480px] overflow-y-auto pr-3">
              <p>
                <strong>CLÁUSULA PRIMERA. - INTERVINIENTES:</strong><br />
                Por una parte, comparece <strong>{anexoB?.nombreEntidad || solicitud.institucion}</strong>, con domicilio legal en <strong>{anexoB?.domicilioEntidad || "Ecuador"}</strong>, representada legalmente por <strong>{anexoB?.representanteLegalNombre || "Máxima Autoridad"}</strong>, en adelante EL SOLICITANTE; y por otra parte, el/la servidor/a público/a <strong>{anexoB?.funcionarioNombre || solicitud.nombreCompleto}</strong> con C.I. <strong>{anexoB?.funcionarioCedula || solicitud.cedula}</strong>, en su calidad de <strong>{anexoB?.funcionarioCargo || "Director de TI"}</strong>, en adelante EL <strong>{anexoB?.rolAsignado || "COORDINADOR TITULAR"}</strong>. En lo sucesivo se denominarán conjuntamente como LOS INTERVINIENTES.
              </p>

              <p>
                <strong>CLÁUSULA SEGUNDA. - ANTECEDENTES:</strong><br />
                {anexoB?.misionVisionInstitucional || "La entidad solicitante requiere acceso regulado a las bases registrales públicas administradas por la DINARP con el objeto de garantizar el cumplimiento de sus competencias constitucionales y legales de servicio a la ciudadanía."}
              </p>

              <p>
                <strong>CLÁUSULA TERCERA. – BASE LEGAL:</strong><br />
                1. El artículo 66 numeral 19 de la Constitución de la República del Ecuador reconoce y garantiza a las personas el derecho a la protección de datos de carácter personal.<br />
                2. La Ley Orgánica del Sistema Nacional de Registros Públicos (Arts. 4, 27, 28 y 29) responsabiliza a las instituciones por la integridad, protección, custodia y debido uso de los datos registrales.<br />
                3. La Ley Orgánica de Protección de Datos Personales (Arts. 2, 7, 10, 38 y 46) consagra los principios de juridicidad, finalidad, pertinencia, minimización y confidencialidad.<br />
                4. El Código Orgánico Integral Penal en sus Arts. 178 y 229 tipifica las sanciones para la divulgación indebida o violación de intimidad de datos personales.
              </p>

              <p>
                <strong>CLÁUSULA CUARTA. - DE LA PROTECCIÓN DE LA INFORMACIÓN Y EL TRATAMIENTO:</strong><br />
                Los intervinientes se obligan a guardar estricta confidencialidad y reserva sobre el acceso a las plataformas provistas por la DINARP. Toda consulta se someterá a los principios de necesidad institucional y proporcionalidad técnica, prohibiéndose expresamente el uso de información para fines comerciales, proselitistas o personales ajenos a la función encomendada.
              </p>

              <p>
                <strong>CLÁUSULA QUINTA. – OBLIGACIONES DE LOS INTERVINIENTES:</strong><br />
                a. Utilizar las herramientas del SINARP exclusivamente en el marco estricto de sus funciones oficiales.<br />
                b. Adoptar y mantener medidas de seguridad informática acordes al estado de la técnica.<br />
                c. Garantizar la trazabilidad y auditoría de cada operación y consulta efectuada.<br />
                d. Notificar oportunamente a la DINARP cualquier amenaza o incidente de ciberseguridad.<br />
                e. Elaborar y suscribir el acta de entrega-recepción formal al término de sus funciones.
              </p>

              <p>
                <strong>CLÁUSULA SEXTA. - PROHIBICIONES DE LOS INTERVINIENTES:</strong><br />
                Queda expresamente prohibido modificar, reproducir, ceder, revelar o comercializar credenciales o información provista por el SINARP, así como operar credenciales durante licencias, permisos o períodos vacacionales.
              </p>

              <p>
                <strong>CLÁUSULA SÉPTIMA. – RESPONSABILIDAD:</strong><br />
                Los intervinientes asumirán las responsabilidades legales administrativas, civiles y penales derivadas del mal uso de las credenciales y datos suministrados. La DINARP queda exenta de responsabilidad por el uso ilegítimo de las herramientas informáticas por parte de los usuarios autorizados.
              </p>

              <p>
                <strong>CLÁUSULA OCTAVA. - DECLARACIONES:</strong><br />
                LOS INTERVINIENTES declaran bajo juramento conocer las disposiciones técnicas y normativas rectoras del SINARP y comprometen su estricto acatamiento.
              </p>

              <p>
                <strong>CLÁUSULA NOVENA. - VIGENCIA:</strong><br />
                El presente acuerdo regirá desde la fecha de suscripción y mantendrá su vigencia durante el ejercicio del cargo del Coordinador acreditado, debiendo notificarse su cese dentro de los términos legales.
              </p>

              <p>
                <strong>CLÁUSULA DÉCIMA. - ACEPTACIÓN:</strong><br />
                LOS INTERVINIENTES aceptan en su totalidad las cláusulas precedentes y para constancia formal suscriben el presente instrumento mediante firma digital válida.
              </p>
            </div>

            {/* Bloque de Firmas Electrónicas Validadas */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Firma 1: Representante Legal */}
              <div className="p-5 rounded-xl border border-border bg-muted/20 text-center space-y-3 relative">
                <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <FileSignature className="size-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 border border-success/30 text-success text-[10px] font-bold">
                  <CheckCircle2 className="size-3" />
                  <span>Firma Electrónica Autorizada</span>
                </div>
                <div className="border-t border-border/80 pt-3">
                  <strong className="block text-foreground text-xs font-semibold">
                    {anexoB?.representanteLegalNombre || "Representante Legal"}
                  </strong>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Máxima Autoridad / Delegado Institucional
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                    {anexoB?.nombreEntidad || solicitud.institucion}
                  </span>
                </div>
              </div>

              {/* Firma 2: Coordinador Designado con FirmaEC */}
              <div className="p-5 rounded-xl border border-success/30 bg-success/5 dark:bg-success/10 text-center space-y-3 relative">
                <div className="size-10 rounded-full bg-success/20 border border-success/40 flex items-center justify-center text-success mx-auto">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/20 border border-success/40 text-success text-[10px] font-bold">
                  <CheckCircle2 className="size-3" />
                  <span>Firmado y Validado con FirmaEC</span>
                </div>
                <div className="border-t border-success/30 pt-3">
                  <strong className="block text-foreground text-xs font-semibold">
                    {anexoB?.funcionarioNombre || solicitud.nombreCompleto}
                  </strong>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {anexoB?.rolAsignado || "COORDINADOR TITULAR"} · C.I. {anexoB?.funcionarioCedula || solicitud.cedula}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                    Certificado BCE · {solicitud.fechaSolicitud}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
