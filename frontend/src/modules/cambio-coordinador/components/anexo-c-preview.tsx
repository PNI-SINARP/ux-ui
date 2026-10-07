"use client";

import React from "react";
import {
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  UserCheck,
  UserX,
  Sparkles,
  Info,
  Scale,
  FileSignature
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardDecorativeIcon } from "@/components/ui/card";
import { cn, getAssetPath } from "@/lib/utils";
import type {
  InstitucionConfig,
  CaracterCoordinador,
  CoordinadorInstitucional
} from "../data/cambio-coordinador-store";
import type { FormNuevoCoordinadorData } from "./coordinador-entrante-form";
import type { DatosInstrumentoAnexoC } from "./anexo-c-form";

interface AnexoCPreviewProps {
  institucion: InstitucionConfig;
  caracter: CaracterCoordinador;
  coordinadorSaliente: CoordinadorInstitucional;
  coordinadorEntrante: FormNuevoCoordinadorData;
  datosInstrumento?: DatosInstrumentoAnexoC;
  firmanteNombre?: string;
  esDelegado?: boolean;
}

export function AnexoCPreview({
  institucion,
  caracter,
  coordinadorSaliente,
  coordinadorEntrante,
  datosInstrumento,
  firmanteNombre = "Carlos Andrade",
  esDelegado = false
}: AnexoCPreviewProps) {
  const now = new Date();
  const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const fechaFormal = `${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      {/* Barra de estado del documento oficial (Sin botón de imprimir) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/40 border border-border">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Scale className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold font-heading text-foreground">
                Instrumento Jurídico Oficial ARP-R03 (Anexo C)
              </span>
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[10px]">
                Versión 1.0 Oficial
              </Badge>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                Borrador generado en tiempo real
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Toda la información ingresada se encuentra estructurada en el documento formal conforme al estándar DINARP. Revisa los datos previo a la suscripción electrónica.
            </p>
          </div>
        </div>
      </div>

      {/* Hoja Membretada Oficial del Documento Anexo C */}
      <div className="bg-surface rounded-2xl border-2 border-border/80 shadow-sm p-6 sm:p-10 lg:p-12 space-y-8 font-sans leading-relaxed relative overflow-hidden">
        {/* Marca de agua institucional sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.025] dark:opacity-[0.04] select-none">
          <img
            src={getAssetPath("/escudo-light.svg")}
            alt="Escudo de Agua"
            className="w-[420px] h-[420px] object-contain"
          />
        </div>

        {/* Encabezado Membretado Oficial de la DINARP */}
        <div className="border-b-2 border-border/80 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={getAssetPath("/escudo-light.svg")}
                alt="Escudo del Ecuador"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div>
                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase font-mono">
                  REPÚBLICA DEL ECUADOR
                </p>
                <h1 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-tight">
                  DIRECCIÓN NACIONAL DE REGISTROS PÚBLICOS — DINARP
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Sistema Nacional de Registro de Datos Públicos (SINARP)
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60 self-stretch sm:self-auto flex sm:flex-col justify-between sm:justify-center items-end">
              <div>
                <span className="text-[10px] font-mono font-bold text-primary block uppercase tracking-wider">
                  FORMULARIO OFICIAL
                </span>
                <span className="text-sm font-mono font-bold text-foreground block">
                  ARP-R03
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono block mt-0.5">
                Emisión: {fechaStr}
              </span>
            </div>
          </div>

          <div className="text-center pt-3 pb-1 border-t border-border/60">
            <h2 className="text-sm sm:text-base font-bold font-heading text-primary uppercase tracking-wide">
              SOLICITUD FORMAL DE CAMBIO Y DESIGNACIÓN DE COORDINADOR INSTITUCIONAL
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instrumento Jurídico de Sustitución para el Acceso e Interoperabilidad en el SINARP
            </p>
          </div>
        </div>

        {/* Cláusula Primera — Comparecientes y Antecedentes Institucionales */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <Building2 className="size-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Primera. — Comparecencia y Calidad de la Entidad Requirente
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 text-justify leading-relaxed">
            Comparece a la suscripción del presente instrumento la institución pública{" "}
            <strong className="text-foreground">{institucion.nombre}</strong>, con Registro Único de Contribuyentes (RUC) Nro.{" "}
            <strong className="font-mono text-foreground">{institucion.ruc}</strong>, legalmente representada por{" "}
            <strong className="text-foreground">{institucion.representanteLegal}</strong>, en su calidad de Máxima Autoridad /
            Representante Legal de la entidad requirente, solicitando formalmente a la Dirección Nacional de Registros Públicos
            (DINARP) la actualización y sustitución del funcionario designado en calidad de{" "}
            <strong className="text-primary font-semibold">
              Coordinador Institucional {caracter === "TITULAR" ? "Titular" : "Suplente"}
            </strong>{" "}
            ante el Sistema Nacional de Registro de Datos Públicos.
          </p>
        </section>

        {/* Cláusula Segunda — Desvinculación y Designación */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <UserCheck className="size-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Segunda. — Desvinculación de Funciones y Nueva Designación
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 text-justify leading-relaxed">
            De conformidad con la normativa interna de la entidad y las disposiciones técnicas vigentes de la DINARP, se
            procede al relevo formal de responsabilidades operativas y de custodia:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Tarjeta del Funcionario Saliente */}
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-bold text-danger text-xs flex items-center gap-1.5">
                  <UserX className="size-3.5 text-danger shrink-0" />
                  <span>Funcionario Saliente (Cesado en rol)</span>
                </span>
                <Badge tone="danger" appearance="soft" size="sm" className="font-mono text-[9px] font-bold">
                  DESVINCULACIÓN
                </Badge>
              </div>
              <div className="space-y-1 pt-1 text-foreground">
                <p className="font-bold text-sm">{coordinadorSaliente.nombreCompleto}</p>
                <p className="text-muted-foreground text-xs font-mono">CI: {coordinadorSaliente.cedula}</p>
                <p className="text-muted-foreground text-xs">Cargo: {coordinadorSaliente.cargo}</p>
                <p className="text-muted-foreground text-[11px]">Correo: {coordinadorSaliente.correo}</p>
                <p className="text-muted-foreground text-[11px]">Teléfono: {coordinadorSaliente.telefono || "02-3934400"}</p>
              </div>
            </div>

            {/* Tarjeta del Funcionario Entrante */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-xs flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-primary shrink-0" />
                  <span>Nuevo Funcionario Designado (Entrante)</span>
                </span>
                <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-[9px] font-bold">
                  {caracter === "TITULAR" ? "NUEVO TITULAR" : "NUEVO SUPLENTE"}
                </Badge>
              </div>
              <div className="space-y-1 pt-1 text-foreground">
                <p className="font-bold text-sm">{coordinadorEntrante.nombreCompleto}</p>
                <p className="text-muted-foreground text-xs font-mono">CI: {coordinadorEntrante.cedula}</p>
                <p className="text-muted-foreground text-xs">Cargo: {coordinadorEntrante.cargo}</p>
                <p className="text-muted-foreground text-[11px]">Correo: {coordinadorEntrante.correo}</p>
                <p className="text-muted-foreground text-[11px]">Teléfono Institucional: 02-3934400</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cláusula Tercera — Respaldo Administrativo y Motivo */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <FileText className="size-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Tercera. — Respaldo Administrativo y Causal del Cambio
            </h2>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Documento de Designación Oficial:
                </span>
                <p className="font-semibold text-foreground font-mono mt-0.5">
                  {datosInstrumento
                    ? `${datosInstrumento.tipoDocumento} Nro. ${datosInstrumento.numeroDocumento}`
                    : "Acción de Personal / Resolución Nro. 2026-DP-094"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Fecha de Vigencia de la Designación:
                </span>
                <p className="font-semibold text-foreground mt-0.5">
                  {datosInstrumento?.fechaVigencia || "A partir de la presente suscripción y confirmación DINARP"}
                </p>
              </div>

              {(datosInstrumento?.motivoSustitucion || coordinadorEntrante.motivo) && (
                <div className="sm:col-span-2 pt-1 border-t border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                    Justificación y Motivo Institucional del Cambio:
                  </span>
                  <p className="text-xs text-foreground italic mt-1 bg-surface p-2.5 rounded-lg border border-border">
                    "{datosInstrumento?.motivoSustitucion || coordinadorEntrante.motivo}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cláusula Cuarta — Continuidad Operativa y Derechos Institucionales */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <ShieldCheck className="size-4 text-success shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Cuarta. — Garantía Expresa de Continuidad Operativa
            </h2>
          </div>
          <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-2">
            <p className="text-xs sm:text-sm text-foreground/90 text-justify leading-relaxed">
              Las partes dejan expresa constancia de que la presente sustitución de Coordinador responde exclusivamente a una
              actualización de nómina y representación administrativa institucional. Por consiguiente,{" "}
              <strong>
                los proyectos aprobados, solicitudes de interoperabilidad en curso, contratos de adhesión suscritos, cupos de consumo
                asignados y credenciales técnicas de integración de la institución permanecen plenamente vigentes, inalterados y
                operativos
              </strong>, garantizando la continuidad ininterrumpida de los servicios de intercambio de datos públicos entre entidades.
            </p>
          </div>
        </section>

        {/* Cláusula Quinta — Declaración de Responsabilidad y Normativa */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <Scale className="size-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Quinta. — Declaración de Responsabilidad y Compromiso Normativo
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 text-justify leading-relaxed">
            La entidad compareciente y el funcionario designado declaran bajo fe de juramento que la información proporcionada es
            fidedigna y se someten a las auditorías de accesos, lineamientos de seguridad de la información, protección de datos
            personales y términos de confidencialidad estipulados en el marco regulatorio del SINARP.
          </p>
        </section>

        {/* Cláusula Sexta — Suscripción y Formalización Electrónica */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
            <FileText className="size-4 text-primary shrink-0" />
            <h2 className="text-xs sm:text-sm font-bold font-heading uppercase tracking-wider text-foreground">
              Cláusula Sexta. — Aceptación y Suscripción Digital (FirmaEC)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-justify leading-relaxed">
            Para debida constancia y pleno efecto jurídico, el presente documento será suscrito de forma electrónica
            mediante certificado digital válido emitido por una entidad certificadora autorizada a través de la plataforma
            FirmaEC en la ciudad de Quito D.M., a los {fechaFormal}.
          </p>

          {/* Cajas de Suscripción Digital en Paralelo estilo Registro Institución */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Tarjeta 1: Representante Legal o Delegado (Variante Neutral) */}
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
                    {firmanteNombre || "Máxima Autoridad o Delegado"}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {esDelegado ? "Delegado Autorizado" : "Representante Legal / Máxima Autoridad"}
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 block mt-0.5 font-medium truncate max-w-full">
                    {institucion.nombre}
                  </span>
                </div>
              </div>
            </Card>

            {/* Tarjeta 2: Pendiente FirmaEC (Paso 3) */}
            <Card
              variant="featured"
              disableHover={true}
              className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/40 text-center p-6 relative overflow-hidden rounded-2xl ring-2 ring-primary/20 shadow-sm flex flex-col items-center justify-center group"
            >
              <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  <Sparkles className="size-3 text-primary animate-pulse shrink-0" />
                  <span>Acción Requerida en Paso 3</span>
                </div>

                <div className="size-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm relative">
                  <ShieldCheck className="size-7 text-primary" />
                  <span className="absolute -top-1 -right-1 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                  </span>
                </div>

                <div className="text-primary font-bold text-xs sm:text-sm tracking-wide">
                  Pendiente FirmaEC (Paso 3)
                </div>

                <div className="w-full border-t border-primary/25 pt-3 flex flex-col items-center text-center">
                  <span className="font-bold font-heading text-primary block text-sm sm:text-base">
                    Suscripción Electrónica Oficial
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    Validez jurídica mediante FirmaEC
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
