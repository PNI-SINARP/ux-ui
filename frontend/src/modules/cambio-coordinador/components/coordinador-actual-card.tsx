"use client";

import React from "react";
import {
  Building2,
  User,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  InstitucionConfig,
  CaracterCoordinador
} from "../data/cambio-coordinador-store";

interface CoordinadorActualCardProps {
  institucion: InstitucionConfig;
  onSolicitarCambio: (caracter: CaracterCoordinador) => void;
}

export function CoordinadorActualCard({
  institucion,
  onSolicitarCambio
}: CoordinadorActualCardProps) {
  const { titular, suplente } = institucion;

  return (
    <div className="space-y-6">
      {/* Contexto institucional en subcontenedor redondeado 2xl */}
      <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Building2 className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-heading font-bold text-foreground">
                  {institucion.nombre}
                </h2>
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="gap-1 border border-success/20 font-medium"
                >
                  <CheckCircle2 className="size-3 text-success" />
                  <span>{institucion.estado}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                RUC: <span className="font-mono font-medium text-foreground">{institucion.ruc}</span> &bull;{" "}
                Representante: <span className="text-foreground font-medium">{institucion.representanteLegal}</span>
              </p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border shrink-0 self-start md:self-auto">
            <span>Ámbito:</span> <strong className="text-foreground">Sector Público / Educación</strong>
          </div>
        </div>
      </div>

      {/* Grid de Coordinadores Vigentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-heading font-bold text-foreground">
              Coordinadores Institucionales Vigentes
            </h3>
            <p className="text-xs text-muted-foreground">
              Personas autorizadas ante el SINARP para gestionar accesos, cupos y servicios de la institución.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tarjeta Coordinador Titular */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="gap-1 font-medium border border-primary/20"
                >
                  <ShieldCheck className="size-3.5 text-primary" />
                  <span>Coordinador Titular</span>
                </Badge>
                <Badge
                  tone={titular.estado === "ACTIVO" ? "success" : "warning"}
                  appearance="soft"
                  size="sm"
                  className="border border-border font-medium"
                >
                  {titular.estado === "ACTIVO" ? "Activo" : titular.estado}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold font-heading text-foreground">
                  {titular.nombreCompleto}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {titular.cargo}
                </p>
              </div>

              <div className="pt-2 border-t border-border space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Cédula:</span>
                  <span className="font-mono font-medium text-foreground">{titular.cedula}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Correo:</span>
                  <span className="text-foreground truncate">{titular.correo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Anexo B:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Aprobado / Vigente
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-end">
              <Button
                variant="primary"
                size="default"
                className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-xs"
                onClick={() => onSolicitarCambio("TITULAR")}
              >
                <span>Solicitar cambio de Coordinador Titular</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Tarjeta Coordinador Suplente */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:border-primary/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="gap-1 font-medium border border-border"
                >
                  <UserCheck className="size-3.5 text-muted-foreground" />
                  <span>Coordinador Suplente</span>
                </Badge>
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="border border-success/20 font-medium"
                >
                  {suplente.estado === "ACTIVO" ? "Activo" : "Enrolado"}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm sm:text-base font-bold font-heading text-foreground">
                  {suplente.nombreCompleto}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {suplente.cargo}
                </p>
              </div>

              <div className="pt-2 border-t border-border space-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Cédula:</span>
                  <span className="font-mono font-medium text-foreground">{suplente.cedula}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Correo:</span>
                  <span className="text-foreground truncate">{suplente.correo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-muted-foreground">Anexo B:</span>
                  <span className="text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Aprobado / Vigente
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-end">
              <Button
                variant="primary"
                size="default"
                className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-xs"
                onClick={() => onSolicitarCambio("SUPLENTE")}
              >
                <span>Solicitar cambio de Coordinador Suplente</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
