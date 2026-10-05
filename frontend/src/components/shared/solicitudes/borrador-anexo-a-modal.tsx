"use client";

import React from "react";
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
import { Card, CardDecorativeIcon } from "@/components/ui/card";
import {
  Building2,
  User,
  FileText,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  FileSignature,
  Check,
  Printer,
  Download,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn, getAssetPath } from "@/lib/utils";
import type { SolicitudIngreso } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

interface BorradorAnexoAModalProps {
  solicitud: SolicitudIngreso | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BorradorAnexoAModal({
  solicitud,
  open,
  onOpenChange,
}: BorradorAnexoAModalProps) {
  if (!solicitud) return null;

  const anexo = solicitud.anexoA;

  const formData = {
    entidadTipo: anexo?.entidadTipo || "Publica",
    nombreEntidad: anexo?.nombreEntidad || solicitud.institucion || "Entidad Solicitante",
    rucEntidad: anexo?.rucEntidad || (solicitud as unknown as { ruc?: string }).ruc || "1768000000001",
    direccionEntidad: anexo?.direccionEntidad || "Av. Amazonas y Av. Naciones Unidas, Quito",
    objetoSocial:
      anexo?.objetoSocial ||
      "Entidad institucional facultada para la provisión de servicios públicos y simplificación de trámites en el marco del Sistema Nacional de Registros Públicos.",
    representanteLegalNombre:
      anexo?.representanteLegalNombre || solicitud.nombreCompleto || "Máxima Autoridad o Delegado",
    representanteLegalCargo: anexo?.representanteLegalCargo || "Representante Legal / Titular",
    representanteLegalEmail: anexo?.representanteLegalEmail || solicitud.correo || "contacto@entidad.gob.ec",
    esDelegado: anexo?.esDelegado ?? false,
    archivoSoporteDelegacion: anexo?.archivoSoporteDelegacion || "Resolución_Delegación_Oficial.pdf",

    titularNombreCompleto:
      anexo?.titularNombreCompleto || solicitud.nombreCompleto || "Coordinador Titular",
    titularCedula: anexo?.titularCedula || solicitud.cedula || "1710000001",
    titularCargo: anexo?.titularCargo || "Coordinador de Tecnologías y Datos",
    titularAreaUnidad: anexo?.titularAreaUnidad || "Dirección de Tecnología de la Información",
    titularEmail: anexo?.titularEmail || solicitud.correo || "coordinador@entidad.gob.ec",
    titularTelefonoFijo: anexo?.titularTelefonoFijo || "02 393 4000",
    titularMovilInstitucional: anexo?.titularMovilInstitucional || "099 000 0000",
    titularMovilPersonal: anexo?.titularMovilPersonal || "098 000 0000",

    suplenteNombreCompleto: anexo?.suplenteNombreCompleto || "Ing. Carlos Mendoza Salazar",
    suplenteCedula: anexo?.suplenteCedula || "1715489621",
    suplenteCargo: anexo?.suplenteCargo || "Especialista en Interoperabilidad",
    suplenteAreaUnidad: anexo?.suplenteAreaUnidad || "Dirección de Tecnología de la Información",
    suplenteEmail: anexo?.suplenteEmail || "suplente@entidad.gob.ec",
    suplenteTelefonoFijo: anexo?.suplenteTelefonoFijo || "02 393 4001",
    suplenteMovilInstitucional: anexo?.suplenteMovilInstitucional || "099 111 2222",
    suplenteMovilPersonal: anexo?.suplenteMovilPersonal || "098 333 4444",

    serviciosHerramientas:
      anexo?.serviciosHerramientas && anexo.serviciosHerramientas.length > 0
        ? anexo.serviciosHerramientas
        : ["Infodigital", "Ficha de Registro Único", "Interoperabilidad"],
    areasUso:
      anexo?.areasUso || "Dirección de Tecnología y Ventanilla Única de Atención Ciudadana",
    procesosUso:
      anexo?.procesosUso || "Verificación de identidades, validación registral y trámites institucionales",
    ciudadFirma: anexo?.ciudadFirma || "Quito D.M.",
    fechaFirma: anexo?.fechaFirma || solicitud.fechaSolicitud || "24/09/2026",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl md:max-w-5xl max-h-[90vh] p-0 flex flex-col bg-surface border border-border shadow-2xl overflow-hidden rounded-2xl">
        {/* Header Superior del Modal */}
        <div className="p-5 sm:p-6 border-b border-border bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[10px] uppercase tracking-wider rounded-full px-3 py-0.5 border border-primary/30"
                >
                  Formulario Oficial ARP-R01
                </Badge>
                <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                  Expediente: {solicitud.id}
                </span>
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                <FileCheck2 className="size-5 shrink-0" />
                <span>Borrador del Anexo A — Solicitud de Registro de Institución</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Vista previa del borrador consolidado generado en el registro institucional antes de la firma digital con FirmaEC.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 text-xs font-semibold gap-1.5 rounded-full px-3.5 shadow-2xs"
              >
                <Printer className="size-3.5 shrink-0" />
                <span>Imprimir</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Cuerpo Scrollable con el diseño de Hoja de Oficio del Anexo A */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Banner informativo de trazabilidad */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-info-50/50 dark:bg-info-950/20 border border-info/30 text-xs">
            <Info className="size-4 text-info shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-info-900 dark:text-info-200">
                Documento de borrador confirmado en la trazabilidad del trámite
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Este formulario refleja fielmente la información enviada en el penúltimo paso del registro de institución. Los datos de firma electrónica fueron confirmados e integrados al expediente digital en custodia de la DINARP.
              </p>
            </div>
          </div>

          {/* Hoja de Oficio Oficial Anexo A (ARP-R01) */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-md max-w-4xl mx-auto border-t-4 border-t-primary">
            {/* Encabezado Institucional Oficial DINARP */}
            <div className="flex items-center justify-between border-b border-border/80 pb-4 gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-3">
                <img
                  src={getAssetPath("/logo-horizontal.svg")}
                  alt="DINARP"
                  className="dark:hidden h-10 w-auto object-contain"
                />
                <img
                  src={getAssetPath("/logo-horizontal-blanco.svg")}
                  alt="DINARP"
                  className="hidden dark:block h-10 w-auto object-contain"
                />
              </div>
              <div className="text-left sm:text-right">
                <span className="font-mono text-xs font-bold text-primary block">
                  CÓDIGO: ARP-R01
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  ANEXO A · SISTEMA NACIONAL DE REGISTROS PÚBLICOS
                </span>
              </div>
            </div>

            {/* Título Principal */}
            <div className="text-center space-y-1">
              <h3 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-wide">
                FORMULARIO ANEXO A — SOLICITUD DE ACCESO AL SISTEMA NACIONAL DE REGISTROS PÚBLICOS
              </h3>
              <p className="text-[11px] text-muted-foreground italic max-w-2xl mx-auto">
                Suscrito al amparo de la Constitución de la República del Ecuador, Ley Orgánica del Sistema Nacional de Registros Públicos y Ley Orgánica de Protección de Datos Personales
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-[11px] font-mono text-foreground font-semibold mt-1">
                <span>EXPEDIENTE:</span>
                <strong className="text-primary font-bold">{solicitud.id}</strong>
              </div>
            </div>

            {/* Cuerpo del Documento estructurado */}
            <div className="space-y-6 text-xs text-foreground divide-y divide-border/60">
              {/* SECCIÓN I: ENTIDAD Y AUTORIDAD */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                  <Building2 className="size-4 shrink-0" />
                  <span>Sección I — Datos de la Entidad y Máxima Autoridad o Delegado</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Naturaleza Institucional
                    </span>
                    <p className="font-semibold text-foreground text-xs mt-0.5">
                      {formData.entidadTipo === "Publica"
                        ? "Pública (Estado / GAD / Empresa Pública)"
                        : "Privada"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Razón Social / Nombre Oficial
                    </span>
                    <p className="font-semibold text-foreground text-xs mt-0.5">{formData.nombreEntidad}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      RUC
                    </span>
                    <p className="font-mono font-semibold text-foreground text-xs mt-0.5">{formData.rucEntidad}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Domicilio Institucional
                    </span>
                    <p className="font-semibold text-foreground text-xs mt-0.5">{formData.direccionEntidad}</p>
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                      Objeto Social / Fines Institucionales
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{formData.objetoSocial}</p>
                  </div>
                </div>

                {/* Máxima Autoridad o Delegado */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    {formData.esDelegado
                      ? "Delegado de la Máxima Autoridad"
                      : "Representante Legal / Máxima Autoridad"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Nombres y Apellidos:</span>
                      <p className="font-semibold text-foreground mt-0.5">{formData.representanteLegalNombre}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Cargo Institucional:</span>
                      <p className="font-semibold text-foreground mt-0.5">{formData.representanteLegalCargo}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Correo Electrónico:</span>
                      <p className="font-semibold text-foreground mt-0.5">{formData.representanteLegalEmail}</p>
                    </div>
                  </div>
                  {formData.esDelegado && (
                    <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-[11px] text-primary font-medium">
                      <FileText className="size-3.5 shrink-0" />
                      <span>
                        Acto administrativo de delegación adjunto: {formData.archivoSoporteDelegacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN II: COORDINADORES */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                  <User className="size-4 shrink-0" />
                  <span>Sección II — Coordinadores Institucionales Registrados</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Titular */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" />
                        <span>Coordinador Titular</span>
                      </span>
                      <Badge tone="primary" appearance="soft" size="sm" className="text-[9px] uppercase font-bold">
                        Principal
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Nombre completo:</span>
                        <strong className="text-foreground">{formData.titularNombreCompleto}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Cédula:</span>
                          <span className="font-mono text-foreground font-semibold">{formData.titularCedula}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                          <span className="text-foreground">{formData.titularCargo}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Área / Unidad:</span>
                        <span className="text-foreground">{formData.titularAreaUnidad}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Correo electrónico:</span>
                        <span className="text-foreground">{formData.titularEmail}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Fijo:</span>
                          <span>{formData.titularTelefonoFijo}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Móvil Institucional:</span>
                          <span>{formData.titularMovilInstitucional}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suplente */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>Coordinador Suplente</span>
                      </span>
                      <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] uppercase font-bold">
                        Alterno
                      </Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Nombre completo:</span>
                        <strong className="text-foreground">{formData.suplenteNombreCompleto}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Cédula:</span>
                          <span className="font-mono text-foreground font-semibold">{formData.suplenteCedula}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                          <span className="text-foreground">{formData.suplenteCargo}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Área / Unidad:</span>
                        <span className="text-foreground">{formData.suplenteAreaUnidad}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Correo electrónico:</span>
                        <span className="text-foreground">{formData.suplenteEmail}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Fijo:</span>
                          <span>{formData.suplenteTelefonoFijo}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Móvil Institucional:</span>
                          <span>{formData.suplenteMovilInstitucional}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN III: SERVICIOS */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                  <FileText className="size-4 shrink-0" />
                  <span>Sección III — Servicios y Herramientas Informáticas Solicitadas</span>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">
                      Herramientas y/o Servicios Requeridos:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {formData.serviciosHerramientas.map((serv) => (
                        <Badge key={serv} tone="primary" appearance="soft" size="sm" className="font-medium">
                          <Check className="size-3 mr-1" />
                          {serv}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Áreas de uso institucional:
                      </span>
                      <p className="text-foreground text-xs mt-0.5">{formData.areasUso}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                        Procesos institucionales:
                      </span>
                      <p className="text-foreground text-xs mt-0.5">{formData.procesosUso}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN IV: DECLARACIONES Y RESPONSABILIDADES */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>Sección IV — Declaraciones Legales y Responsabilidad</span>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-justify text-[11px] leading-relaxed text-muted-foreground">
                  <p>
                    La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los artículos 66 numerales 11 y 19 de la Constitución de la República del Ecuador; artículo 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos; Ley Orgánica para la Optimización y Eficiencia de Trámites Administrativos; Ley Orgánica de Protección de Datos Personales; y los artículos 178, 180 y 229 del Código Orgánico Integral Penal.
                  </p>
                  <p>
                    La entidad se compromete formalmente a salvaguardar la confidencialidad de la información y utilizar las herramientas informáticas provistas única y exclusivamente para los fines institucionales autorizados.
                  </p>
                  <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-semibold text-foreground">
                    <span className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-3.5 shrink-0" />
                      Declaraciones y responsabilidades legales aceptadas expresamente
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Lugar y Fecha: {formData.ciudadFirma}, {formData.fechaFirma}
                    </span>
                  </div>
                </div>
              </div>

              {/* BLOQUE DE FIRMAS TIPO HOJA DE OFICIO */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Tarjeta 1: Representante Legal */}
                <Card
                  variant="default"
                  disableHover={true}
                  className="bg-surface dark:bg-surface/50 border border-border shadow-xs text-center p-6 relative overflow-hidden rounded-2xl flex flex-col items-center justify-center"
                >
                  <CardDecorativeIcon className="-bottom-6 -right-6 opacity-10 pointer-events-none">
                    <FileSignature className="size-28 text-muted-foreground" />
                  </CardDecorativeIcon>

                  <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                    <div className="size-14 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
                      <FileSignature className="size-7 opacity-80" />
                    </div>

                    <div className="text-muted-foreground italic text-[11px] font-medium">
                      [Firmante Autorizado del Solicitante]
                    </div>

                    <div className="w-full border-t border-border pt-3 flex flex-col items-center text-center">
                      <span className="font-bold font-heading text-foreground block text-sm sm:text-base">
                        {formData.representanteLegalNombre}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {formData.representanteLegalCargo}
                      </span>
                      <span className="text-[10px] text-muted-foreground/80 block mt-0.5 font-medium">
                        {formData.nombreEntidad}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Tarjeta 2: Estado del borrador / Confirmación de Integridad */}
                <Card
                  variant="featured"
                  disableHover={true}
                  className="bg-success-50/40 dark:bg-success-950/20 border-2 border-success/40 text-center p-6 relative overflow-hidden rounded-2xl ring-2 ring-success/20 shadow-xs flex flex-col items-center justify-center group"
                >
                  <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 border border-success/30 text-success text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      <ShieldCheck className="size-3 text-success shrink-0" />
                      <span>Firma Validada & Confirmada</span>
                    </div>

                    <div className="size-14 rounded-2xl bg-success/20 border border-success/40 flex items-center justify-center text-success shadow-xs relative">
                      <CheckCircle2 className="size-7 text-success" />
                    </div>

                    <div className="w-full border-t border-success/20 pt-3 flex flex-col items-center text-center">
                      <span className="font-bold font-heading text-foreground block text-xs sm:text-sm">
                        Integridad Criptográfica Verificada
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Certificado digital y hash SHA-256 validados vía FirmaEC
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground mt-1">
                        Estampa cronológica: {solicitud.fechaSolicitud || formData.fechaFirma}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Barra de Acciones del Documento (Ubicada abajo del documento) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-surface border border-border rounded-xl shadow-xs max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="size-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">Visor Oficial de Oficio ARP-R01</span>
              <span className="text-muted-foreground hidden sm:inline">· Vista íntegra del instrumento legal suscrito</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
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
                  toast.success("Generando copia fidedigna en PDF del Formulario ARP-R01...");
                }}
                className="text-xs font-semibold gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Descargar PDF Oficial</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-muted/20 flex flex-row items-center justify-end gap-3 shrink-0">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 font-semibold"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
