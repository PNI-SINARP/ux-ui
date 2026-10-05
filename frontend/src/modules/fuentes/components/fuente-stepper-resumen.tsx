"use client";

import React from "react";
import { InfoFormData } from "./fuente-stepper-info";
import {
  ConfiguracionConexion,
  CampoFuente,
} from "../data/fuentes-data";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Server,
  Layers,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface FuenteStepperResumenProps {
  info: InfoFormData;
  conexion: ConfiguracionConexion;
  campos: CampoFuente[];
  institucionPrecargada: string;
}

export function FuenteStepperResumen({
  info,
  conexion,
  campos,
  institucionPrecargada,
}: FuenteStepperResumenProps) {
  const camposIncluidos = campos.filter((c) => c.incluido);

  return (
    <div className="space-y-6">
      {/* Alerta de Envío a Revisión */}
      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 flex items-start gap-3">
        <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0 mt-0.5">
          <Clock className="size-5" />
        </div>
        <div>
          <h4 className="font-heading font-bold text-sm text-primary">
            Confirmación previa al envío a Gestión (FUE-03 → FUE-04)
          </h4>
          <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
            Al enviar esta fuente, su estado cambiará a <strong>En revisión</strong>. El Área de Gestión de la DINARP revisará la configuración técnica, clasificará cada uno de los campos como <em>Accesible</em> o <em>Confidencial</em> y emitirá la decisión de aprobación o devolución con observaciones. El Coordinador no podrá publicar la fuente hasta contar con la aprobación final.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Info General & SLA */}
        <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                Información y SLA
              </h5>
            </div>
            <Badge tone="primary" appearance="soft" size="sm">
              {info.version_propuesta}
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Nombre de la fuente:</span>
              <span className="font-semibold text-foreground">{info.nombre || "Sin especificar"}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Institución proveedora:</span>
              <span className="font-medium text-foreground">{institucionPrecargada}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Descripción técnica:</span>
              <p className="text-muted-foreground line-clamp-2 text-[11px]">
                {info.descripcion_fuente || "Sin descripción"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Disponibilidad:</span>
                <span className="font-mono font-semibold text-foreground">
                  {info.disponibilidad_objetivo}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Latencia máx:</span>
                <span className="font-mono font-semibold text-foreground">
                  {info.tiempo_maximo_respuesta_ms} ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Modalidad:</span>
                <span className="font-medium text-foreground">{info.modalidades_soportadas}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Datos prueba:</span>
                <Badge tone={info.tipo_dato_pruebas === "Real" ? "warning" : "success"} appearance="soft" size="sm">
                  {info.tipo_dato_pruebas}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Card Conexión y Prueba Técnica */}
        <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-primary" />
              <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                Conexión y Prueba Técnica
              </h5>
            </div>
            <Badge tone="neutral" appearance="soft" size="sm" className="font-mono">
              {conexion.tipo_conector}
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px]">Host / Destino:</span>
                <span className="font-mono font-medium text-foreground truncate block">
                  {conexion.host || conexion.url_endpoint || "No configurado"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Base / Recurso:</span>
                <span className="font-mono font-medium text-foreground">
                  {conexion.base_datos || conexion.esquema || "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Usuario lectura:</span>
                <span className="font-mono font-medium text-foreground">
                  {conexion.usuario || "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Gestión credenciales:</span>
                <span className="font-mono text-success text-[11px] flex items-center gap-1">
                  <ShieldCheck className="size-3.5" />
                  KMS Cifrado
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground block text-[11px] mb-1">
                Resultado de la prueba técnica:
              </span>
              {conexion.ultima_prueba ? (
                <div className="p-2.5 rounded-lg bg-success/10 border border-success/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-success" />
                    <span className="font-semibold text-xs text-foreground">
                      {conexion.ultima_prueba.resultado}
                    </span>
                  </div>
                  <Badge tone="success" appearance="soft" size="sm">
                    {conexion.ultima_prueba.latencia_ms} ms latencia
                  </Badge>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2 text-warning text-xs">
                  <AlertCircle className="size-4" />
                  <span>Pendiente de ejecución satisfactoria</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Parámetros y Esquema */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary" />
            <h5 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Resumen de Esquema ({camposIncluidos.length} campos seleccionados)
            </h5>
          </div>
          <span className="text-xs text-muted-foreground">
            {info.parametros_consulta.length} parámetro(s) de consulta
          </span>
        </div>

        {/* Parámetros */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Parámetros de consulta:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {info.parametros_consulta.map((p) => (
              <span
                key={p.id_parametro}
                className="inline-flex items-center gap-1.5 text-xs bg-muted/40 px-2.5 py-1 rounded-md border border-border font-mono"
              >
                <strong>{p.nombre}</strong> ({p.tipo})
                {p.obligatorio && <span className="text-danger font-bold">*</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Campos */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Campos que se expondrán para clasificación por Gestión:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {camposIncluidos.map((c) => (
              <div
                key={c.id_campo}
                className="p-2 bg-background rounded-lg border border-border text-xs flex flex-col gap-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary">
                    {c.nombre_publicado}
                  </span>
                  <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                    {c.tipo_normalizado}
                  </Badge>
                </div>
                <span className="text-[10px] text-muted-foreground truncate">
                  {c.descripcion || c.ruta_origen}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
