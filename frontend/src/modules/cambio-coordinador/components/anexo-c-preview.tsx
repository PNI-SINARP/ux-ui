"use client";

import React, { useState } from "react";
import {
  FileText,
  Eye,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  ShieldCheck,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  InstitucionConfig,
  CaracterCoordinador,
  CoordinadorInstitucional
} from "../data/cambio-coordinador-store";
import type { FormNuevoCoordinadorData } from "./coordinador-entrante-form";

interface AnexoCPreviewProps {
  institucion: InstitucionConfig;
  caracter: CaracterCoordinador;
  coordinadorSaliente: CoordinadorInstitucional;
  coordinadorEntrante: FormNuevoCoordinadorData;
  firmanteNombre?: string;
  esDelegado?: boolean;
}

export function AnexoCPreview({
  institucion,
  caracter,
  coordinadorSaliente,
  coordinadorEntrante,
  firmanteNombre = "Carlos Andrade",
  esDelegado = false
}: AnexoCPreviewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const now = new Date();
  const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <FileText className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base sm:text-lg font-heading font-bold text-foreground">
                  Documento Normativo Anexo C (ARP-R03)
                </h4>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="font-mono text-[10px] font-bold border border-primary/20"
                >
                  ARP-R03 v1.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estructurado conforme a la normativa DINARP para el relevo y sustitución de Coordinadores del SINARP.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="default"
            className="text-xs font-semibold gap-1.5 shrink-0 shadow-xs hover:bg-primary/5 hover:text-primary hover:border-primary/40"
            onClick={() => setModalOpen(true)}
          >
            <Eye className="size-4" />
            <span>Revisar documento</span>
          </Button>
        </div>

        {/* Resumen de Cláusulas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-border text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Cláusula 1 — Antecedentes
            </span>
            <span className="text-foreground font-bold block">{institucion.nombre}</span>
            <span className="text-muted-foreground block font-mono text-[11px]">RUC: {institucion.ruc}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Cláusula 2 — Sustitución
            </span>
            <span className="text-foreground font-bold block">
              Coordinador {caracter === "TITULAR" ? "Titular" : "Suplente"}
            </span>
            <span className="text-muted-foreground block truncate">
              Entrante: {coordinadorEntrante.nombreCompleto}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Cláusula 4 — Suscripción
            </span>
            <span className="text-foreground font-bold block">Quito D.M., {fechaStr}</span>
            <span className="text-muted-foreground block truncate">
              {firmanteNombre} ({esDelegado ? "Delegado" : "Máxima Autoridad"})
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa Oficial del Documento ARP-R03 */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-h3 font-heading font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Vista previa: Formulario Oficial Anexo C</span>
                </DialogTitle>
                <DialogDescription className="text-body-sm text-muted-foreground mt-1">
                  Dirección Nacional de Registros Públicos — Sistema Nacional de Registro de Datos Públicos
                </DialogDescription>
              </div>
              <Badge tone="primary" appearance="soft" size="md" className="font-mono">
                ARP-R03
              </Badge>
            </div>
          </DialogHeader>

          {/* Hoja de estilo formal del documento oficial */}
          <div className="mt-4 p-8 bg-surface rounded-lg border border-border/80 shadow-inner font-sans text-body-sm text-foreground space-y-6 leading-relaxed">
            {/* Encabezado Institucional */}
            <div className="text-center border-b-2 border-border pb-4 space-y-1">
              <h2 className="text-h4 font-heading font-bold uppercase tracking-wider text-foreground">
                Dirección Nacional de Registros Públicos (DINARP)
              </h2>
              <p className="text-caption font-semibold text-muted-foreground uppercase tracking-widest">
                Sistema Nacional de Registro de Datos Públicos (SINARP)
              </p>
              <div className="inline-block bg-muted px-3 py-1 rounded text-caption font-mono font-semibold text-foreground mt-1">
                ANEXO C — CAMBIO DE COORDINADOR INSTITUCIONAL TITULAR Y/O SUPLENTE
              </div>
            </div>

            {/* Cláusula Primera */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-foreground uppercase text-body border-b border-border/50 pb-1">
                Cláusula Primera. — Antecedentes
              </h3>
              <p className="text-justify text-muted-foreground">
                La entidad pública <strong className="text-foreground">{institucion.nombre}</strong>, con Registro
                Único de Contribuyentes Nro. <strong className="text-foreground">{institucion.ruc}</strong>, debidamente
                representada por <strong className="text-foreground">{firmanteNombre}</strong>, en calidad de{" "}
                <strong className="text-foreground">{esDelegado ? "Delegado Autorizado" : "Máxima Autoridad"}</strong>,
                conforme a las disposiciones de la Ley Orgánica del Sistema Nacional de Registro de Datos Públicos y
                la normativa vigente para el acceso a la interoperabilidad gubernamental, formaliza la presente
                solicitud de cambio institucional.
              </p>
            </div>

            {/* Cláusula Segunda */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-foreground uppercase text-body border-b border-border/50 pb-1">
                Cláusula Segunda. — Sustitución de Coordinador Institucional {caracter === "TITULAR" ? "Titular" : "Suplente"}
              </h3>
              <p className="text-justify text-muted-foreground">
                Por medio del presente instrumento se solicita la revocatoria y desvinculación formal del
                Coordinador institucional saliente:
              </p>
              <div className="bg-muted/30 p-3 rounded-md border border-border space-y-1 text-caption">
                <p>
                  <strong>Coordinador saliente: </strong> {coordinadorSaliente.nombreCompleto} &bull; C.I.:{" "}
                  <span className="font-mono">{coordinadorSaliente.cedula}</span> &bull; Cargo:{" "}
                  {coordinadorSaliente.cargo}
                </p>
              </div>

              <p className="text-justify text-muted-foreground pt-2">
                Y se designa en su lugar al siguiente funcionario para asumir la representación técnica y operativa:
              </p>
              <div className="bg-primary/5 p-3 rounded-md border border-primary/20 space-y-1 text-caption">
                <p>
                  <strong className="text-primary">Coordinador entrante ({caracter === "TITULAR" ? "Titular" : "Suplente"}): </strong>
                  <span className="text-foreground font-semibold">{coordinadorEntrante.nombreCompleto}</span>
                </p>
                <p>
                  <strong>Cédula de Identidad: </strong>
                  <span className="font-mono text-foreground font-semibold">{coordinadorEntrante.cedula}</span> &bull;{" "}
                  <strong>Correo: </strong>
                  <span className="text-foreground">{coordinadorEntrante.correo}</span>
                </p>
                <p>
                  <strong>Cargo en la entidad: </strong>
                  <span className="text-foreground">{coordinadorEntrante.cargo}</span>
                </p>
                <p>
                  <strong>Motivo de la designación: </strong>
                  <span className="italic text-foreground">"{coordinadorEntrante.motivo}"</span>
                </p>
              </div>
            </div>

            {/* Cláusula Tercera */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-foreground uppercase text-body border-b border-border/50 pb-1">
                Cláusula Tercera. — Continuidad Operativa
              </h3>
              <p className="text-justify text-muted-foreground">
                Se ratifica expresamente que los proyectos aprobados, solicitudes de interoperabilidad, contratos,
                cupos de consumo y credenciales institucionales otorgados a favor de{" "}
                <strong className="text-foreground">{institucion.nombre}</strong> permanecen inalterados y
                plenamente válidos, sin que la sustitución del Coordinador implique interrupción alguna de los servicios.
              </p>
            </div>

            {/* Cláusula Cuarta */}
            <div className="space-y-2">
              <h3 className="font-heading font-bold text-foreground uppercase text-body border-b border-border/50 pb-1">
                Cláusula Cuarta. — Aceptación y Firmas
              </h3>
              <p className="text-justify text-muted-foreground">
                Para constancia y validez legal, el presente documento se suscribe de manera electrónica mediante la
                plataforma oficial FirmaEC en la ciudad de Quito D.M., a los {fechaStr}.
              </p>
            </div>

            {/* Cuadros de Suscripción Digital */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-caption text-center">
              <div className="border border-dashed border-border rounded-lg p-4 bg-muted/10 space-y-1">
                <div className="font-semibold text-foreground">{firmanteNombre}</div>
                <div className="text-muted-foreground">
                  {esDelegado ? "Delegado Autorizado" : "Máxima Autoridad / Representante"}
                </div>
                <div className="text-muted-foreground font-mono text-[11px]">{institucion.nombre}</div>
                <div className="pt-2 text-primary text-[11px] font-medium flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Suscripción digital requerida (FirmaEC)
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-1">
                <div className="font-semibold text-foreground">Dirección Nacional de Registros Públicos</div>
                <div className="text-muted-foreground">Dirección de Gestión y Registro</div>
                <div className="text-muted-foreground font-mono text-[11px]">SINARP - DINARP</div>
                <div className="pt-2 text-muted-foreground text-[11px]">
                  Pendiente de verificación y asignación formal
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cerrar vista previa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
