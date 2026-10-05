"use client";

import React from "react";
import {
  CheckCircle2,
  FileCheck2,
  Building2,
  Calendar,
  Send,
  Eye,
  Download,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { DocumentoStatusBadge, TramiteStatusBadge } from "./cambio-coordinador-status";
import type { TramiteCambioCoordinador } from "../data/cambio-coordinador-store";

interface CambioCoordinadorResultProps {
  tramite: TramiteCambioCoordinador;
  onVerSeguimiento: () => void;
  onNuevoTramite: () => void;
}

export function CambioCoordinadorResult({
  tramite,
  onVerSeguimiento,
  onNuevoTramite
}: CambioCoordinadorResultProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2 animate-in fade-in duration-300">
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>

        <div className="space-y-2">
          <Badge
            tone="success"
            appearance="soft"
            size="md"
            className="font-medium border border-success/20 gap-1.5"
          >
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Trámite remitido formalmente</span>
          </Badge>
          <h2 className="text-h2 font-heading font-bold text-foreground">
            Anexo C firmado y enviado a Gestión
          </h2>
          <p className="text-body text-muted-foreground max-w-lg mx-auto">
            La solicitud de sustitución de Coordinador institucional ha sido registrada con éxito en el sistema
            SINARP y remitida a la bandeja del Director del Área de Gestión para su asignación.
          </p>
        </div>

        {/* Resumen del Comprobante */}
        <div className="p-5 rounded-lg bg-muted/20 border border-border text-left space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
              Identificador del Trámite
            </span>
            <span className="text-h4 font-mono font-bold text-primary">
              {tramite.numeroTramite}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm">
            <div>
              <span className="text-caption text-muted-foreground block">Institución:</span>
              <strong className="text-foreground">{tramite.institucion}</strong>
            </div>

            <div>
              <span className="text-caption text-muted-foreground block">Fecha y hora de envío:</span>
              <span className="text-foreground">{tramite.fechaSolicitud}</span>
            </div>

            <div>
              <span className="text-caption text-muted-foreground block">Estado del documento:</span>
              <div className="mt-1">
                <DocumentoStatusBadge status={tramite.estadoDocumento} size="sm" />
              </div>
            </div>

            <div>
              <span className="text-caption text-muted-foreground block">Estado del trámite:</span>
              <div className="mt-1">
                <TramiteStatusBadge status={tramite.estadoTramite} size="sm" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption">
            <div>
              <span className="text-muted-foreground block">Coordinador Saliente:</span>
              <span className="text-foreground font-medium">
                {tramite.coordinadorSaliente.nombreCompleto} ({tramite.caracter === "TITULAR" ? "Titular" : "Suplente"})
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block">Coordinador Entrante:</span>
              <span className="text-foreground font-medium">
                {tramite.coordinadorEntrante.nombreCompleto}
              </span>
            </div>
          </div>
        </div>

        {/* Alerta de siguientes pasos */}
        <Alert variant="default" icon={<UserCheck className="size-4 text-primary shrink-0" />} className="text-left border-border">
          <div className="text-caption text-foreground">
            <strong>Próximos pasos: </strong>
            El Director del Área de Gestión asignará un revisor legal. Podrás dar seguimiento a la revisión
            y al enrolamiento posterior del nuevo funcionario en esta misma pantalla.
          </div>
        </Alert>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            size="default"
            className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-xs sm:min-w-[170px]"
            onClick={onVerSeguimiento}
          >
            <Eye className="size-4" />
            <span>Ver seguimiento</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            className="w-full sm:w-auto text-xs font-semibold shadow-xs sm:min-w-[150px]"
            onClick={onNuevoTramite}
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
