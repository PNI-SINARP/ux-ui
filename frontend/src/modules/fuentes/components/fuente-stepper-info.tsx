"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ParametroConsulta,
  TipoDatoPruebas,
  TipoDatoCanonico,
} from "../data/fuentes-data";
import {
  Building2,
  Sliders,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
} from "lucide-react";

export interface InfoFormData {
  nombre: string;
  descripcion_fuente: string;
  version_propuesta: string;
  disponibilidad_objetivo: number;
  tiempo_maximo_respuesta_ms: number;
  formato_respuesta: "application/json" | "application/xml";
  tipo_dato_pruebas: TipoDatoPruebas;
  parametros_consulta: ParametroConsulta[];
  endpoint_pruebas?: string;
  endpoint_produccion?: string;
}

interface FuenteStepperInfoProps {
  formData: InfoFormData;
  onChange: (data: Partial<InfoFormData>) => void;
  institucionPrecargada: string;
  coordinadorNombre?: string;
  coordinadorId?: string;
  isCoordinadorConsumidor?: boolean;
}

export function FuenteStepperInfo({
  formData,
  onChange,
  institucionPrecargada,
  coordinadorNombre,
  coordinadorId,
  isCoordinadorConsumidor = false,
}: FuenteStepperInfoProps) {
  const [nuevoParametro, setNuevoParametro] = useState<Partial<ParametroConsulta>>({
    nombre: "",
    tipo: "Texto",
    obligatorio: true,
    es_identificador_persona: false,
    operadores_permitidos: ["Igual"],
    restriccion: { patron: "" },
  });

  const agregarParametro = () => {
    if (!nuevoParametro.nombre?.trim()) return;

    const id = `PAR-${String(formData.parametros_consulta.length + 1).padStart(2, "0")}`;
    const param: ParametroConsulta = {
      id_parametro: id,
      nombre: nuevoParametro.nombre.trim(),
      tipo: nuevoParametro.tipo || "Texto",
      obligatorio: nuevoParametro.obligatorio ?? true,
      es_identificador_persona: nuevoParametro.es_identificador_persona ?? false,
      operadores_permitidos:
        nuevoParametro.operadores_permitidos && nuevoParametro.operadores_permitidos.length > 0
          ? nuevoParametro.operadores_permitidos
          : ["Igual"],
      restriccion: (nuevoParametro.restriccion?.patron ||
        nuevoParametro.restriccion?.valor_min !== undefined ||
        nuevoParametro.restriccion?.valor_max !== undefined)
        ? {
            patron: nuevoParametro.restriccion.patron?.trim() || undefined,
            valor_min: nuevoParametro.restriccion.valor_min || undefined,
            valor_max: nuevoParametro.restriccion.valor_max || undefined,
          }
        : undefined,
    };

    onChange({
      parametros_consulta: [...formData.parametros_consulta, param],
    });

    setNuevoParametro({
      nombre: "",
      tipo: "Texto",
      obligatorio: true,
      es_identificador_persona: false,
      operadores_permitidos: ["Igual"],
      restriccion: { patron: "" },
    });
  };

  const eliminarParametro = (id: string) => {
    onChange({
      parametros_consulta: formData.parametros_consulta.filter((p) => p.id_parametro !== id),
    });
  };

  const isTestRestricted =
    formData.tipo_dato_pruebas === "Real" || formData.tipo_dato_pruebas === "Indeterminado";

  return (
    <div className="space-y-6">
      {/* Institución Proveedora Precargada en Card con Ícono con Color (FUE-01) */}
      <Card
        size="sm"
        className="bg-surface/90 border-border/70 shadow-xs rounded-2xl"
        innerClassName="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="size-11 sm:size-12 rounded-xl bg-primary/15 border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="size-5.5 sm:size-6 text-primary" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              {isCoordinadorConsumidor ? "Institución requirente (Precargada por sesión)" : "Institución proveedora (Precargada por sesión)"}
            </span>
            <span className="font-heading font-extrabold text-sm sm:text-base text-foreground block truncate">
              {institucionPrecargada}
            </span>
            {coordinadorNombre && (
              <span className="text-xs text-muted-foreground block truncate">
                Coordinador registrador: <strong className="text-foreground">{coordinadorNombre}</strong>
                {coordinadorId && <span className="font-mono text-[11px] ml-1.5 opacity-80">({coordinadorId})</span>}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Badge
            tone="primary"
            appearance="soft"
            size="sm"
            className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-primary/25"
          >
            {isCoordinadorConsumidor ? "Entidad Requirente" : "Capacidad Proveedora Activa"}
          </Badge>
          <Badge tone="neutral" appearance="outline" size="sm" className="font-semibold text-[10px] sm:text-[11px]">
            {isCoordinadorConsumidor ? "Coordinador Consumidor" : "Coordinador Proveedor"}
          </Badge>
          <Badge tone="neutral" appearance="outline" size="sm" className="font-medium text-[10px] sm:text-[11px]">
            Borrador
          </Badge>
        </div>
      </Card>

      {/* Datos Básicos de la Fuente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">
            Nombre descriptivo de la fuente <span className="text-danger">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Ej. Servicio de Consulta y Validación de Cédulas de Identidad"
            value={formData.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
            className="text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="version" className="text-xs font-semibold text-foreground">
            Versión propuesta <span className="text-danger">*</span>
          </Label>
          <Input
            id="version"
            placeholder="v1.0.0"
            value={formData.version_propuesta}
            onChange={(e) => onChange({ version_propuesta: e.target.value })}
            className="text-xs font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">
            Descripción funcional de la fuente <span className="text-danger">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Texto según estándar TEC-00/PAR-07 ({formData.descripcion_fuente.length} caracteres)
          </span>
        </div>
        <Textarea
          id="descripcion"
          rows={3}
          placeholder="Describa el propósito de la fuente, qué tipo de registros expone, frecuencia de actualización y base legal según TEC-00/PAR-07..."
          value={formData.descripcion_fuente}
          onChange={(e) => onChange({ descripcion_fuente: e.target.value })}
          className="text-xs"
        />
      </div>

      {/* SLA y Entornos */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-primary" />
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
            Acuerdo de Nivel de Servicio (SLA)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sla-disp" className="text-xs font-medium text-muted-foreground">
              Disponibilidad objetivo (%) <span className="text-danger">*</span>
            </Label>
            <Input
              id="sla-disp"
              type="number"
              step="0.1"
              min="90"
              max="100"
              value={formData.disponibilidad_objetivo}
              onChange={(e) =>
                onChange({ disponibilidad_objetivo: parseFloat(e.target.value) || 0 })
              }
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sla-ms" className="text-xs font-medium text-muted-foreground">
              Tiempo máx. respuesta (ms) <span className="text-danger">*</span>
            </Label>
            <Input
              id="sla-ms"
              type="number"
              min="50"
              max="5000"
              value={formData.tiempo_maximo_respuesta_ms}
              onChange={(e) =>
                onChange({ tiempo_maximo_respuesta_ms: parseInt(e.target.value) || 0 })
              }
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="formato" className="text-xs font-medium text-muted-foreground">
              Formato de respuesta <span className="text-danger">*</span>
            </Label>
            <Select
              value={formData.formato_respuesta}
              onValueChange={(val) =>
                onChange({
                  formato_respuesta: val as "application/json" | "application/xml",
                })
              }
            >
              <SelectTrigger id="formato" className="h-9 text-xs">
                <SelectValue placeholder="Seleccione formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="application/json">application/json (Recomendado)</SelectItem>
                <SelectItem value="application/xml">application/xml</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-2 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo-prueba" className="text-xs font-medium text-muted-foreground">
              Tipo de datos para entorno de Pruebas <span className="text-danger">*</span>
            </Label>
            <Select
              value={formData.tipo_dato_pruebas}
              onValueChange={(val) =>
                onChange({ tipo_dato_pruebas: val as TipoDatoPruebas })
              }
            >
              <SelectTrigger id="tipo-prueba" className="h-9 text-xs">
                <SelectValue placeholder="Seleccione tipo de datos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sintético">Sintético (datos de prueba autogenerados)</SelectItem>
                <SelectItem value="Anonimizado">Anonimizado (datos reales enmascarados)</SelectItem>
                <SelectItem value="Real">Real (datos auténticos de producción)</SelectItem>
                <SelectItem value="Indeterminado">Indeterminado (pendiente de certificación)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center">
            {isTestRestricted ? (
              <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-[11px] flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Restricción:</strong> Declarar datos &quot;Real&quot; o &quot;Indeterminado&quot; inhabilita consultas en ambiente de Pruebas. Solo se autorizará para Producción.
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-success/10 border border-success/30 text-success text-[11px] flex items-start gap-2">
                <Sparkles className="size-4 shrink-0 mt-0.5" />
                <span>
                  Datos aptos para verificación interactiva en el ambiente de Pruebas (API-01).
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Endpoints de Entornos (Pruebas y Producción) */}
        <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="endpoint-pruebas" className="text-xs font-medium text-muted-foreground">
              Endpoint entorno de Pruebas (URL base)
            </Label>
            <Input
              id="endpoint-pruebas"
              placeholder="https://pruebas-api.institucion.gob.ec/v1"
              value={formData.endpoint_pruebas || ""}
              onChange={(e) => onChange({ endpoint_pruebas: e.target.value })}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endpoint-produccion" className="text-xs font-medium text-muted-foreground">
              Endpoint entorno de Producción (URL base)
            </Label>
            <Input
              id="endpoint-produccion"
              placeholder="https://api.institucion.gob.ec/v1"
              value={formData.endpoint_produccion || ""}
              onChange={(e) => onChange({ endpoint_produccion: e.target.value })}
              className="text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Parámetros de consulta (FUE-01) */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Parámetros de Consulta
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Defina las variables de entrada requeridas para invocar esta fuente.
            </p>
          </div>
          <Badge tone="neutral" appearance="outline" size="sm">
            {formData.parametros_consulta.length} configurado(s)
          </Badge>
        </div>

        {/* Lista de parámetros configurados */}
        {formData.parametros_consulta.length > 0 ? (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {formData.parametros_consulta.map((p) => (
              <div key={p.id_parametro} className="p-3 flex items-center justify-between gap-3 text-xs bg-background/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-primary">{p.nombre}</span>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    {p.tipo}
                  </Badge>
                  {p.obligatorio && (
                    <Badge tone="danger" appearance="outline" size="sm">
                      Obligatorio
                    </Badge>
                  )}
                  {p.es_identificador_persona && (
                    <Badge tone="warning" appearance="soft" size="sm">
                      ID Persona
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    Op: {p.operadores_permitidos.join(", ")}
                  </span>
                  {p.restriccion?.patron && (
                    <code className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                      Regex: {p.restriccion.patron}
                    </code>
                  )}
                  {p.restriccion?.valor_min !== undefined && p.restriccion?.valor_min !== "" && (
                    <code className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                      Mín: {p.restriccion.valor_min}
                    </code>
                  )}
                  {p.restriccion?.valor_max !== undefined && p.restriccion?.valor_max !== "" && (
                    <code className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                      Máx: {p.restriccion.valor_max}
                    </code>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => eliminarParametro(p.id_parametro)}
                  className="text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No se han añadido parámetros de consulta aún.
          </div>
        )}

        {/* Formulario rápido para añadir parámetro */}
        <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-3">
          <span className="text-xs font-semibold text-foreground block">
            Añadir nuevo parámetro
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div>
              <Label className="text-[11px] text-muted-foreground">Nombre</Label>
              <Input
                placeholder="ej. numero_cedula"
                value={nuevoParametro.nombre}
                onChange={(e) =>
                  setNuevoParametro({ ...nuevoParametro, nombre: e.target.value })
                }
                className="h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Tipo de dato</Label>
              <Select
                value={nuevoParametro.tipo}
                onValueChange={(val) =>
                  setNuevoParametro({
                    ...nuevoParametro,
                    tipo: val as TipoDatoCanonico,
                  })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Texto">Texto</SelectItem>
                  <SelectItem value="Entero">Entero</SelectItem>
                  <SelectItem value="Decimal">Decimal</SelectItem>
                  <SelectItem value="Fecha">Fecha</SelectItem>
                  <SelectItem value="Booleano">Booleano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Patrón Regex (Opcional)</Label>
              <Input
                placeholder="^[0-9]{10}$"
                value={nuevoParametro.restriccion?.patron || ""}
                onChange={(e) =>
                  setNuevoParametro({
                    ...nuevoParametro,
                    restriccion: { patron: e.target.value },
                  })
                }
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={agregarParametro}
                disabled={!nuevoParametro.nombre?.trim()}
                className="w-full h-8 gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                Añadir
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                checked={!!nuevoParametro.obligatorio}
                onCheckedChange={(checked) =>
                  setNuevoParametro({ ...nuevoParametro, obligatorio: !!checked })
                }
              />
              <span>Obligatorio</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <Checkbox
                checked={!!nuevoParametro.es_identificador_persona}
                onCheckedChange={(checked) =>
                  setNuevoParametro({
                    ...nuevoParametro,
                    es_identificador_persona: !!checked,
                  })
                }
              />
              <span>Identificador de persona (Cédula/RUC)</span>
            </label>
          </div>

          {/* Operadores permitidos (FUE-01: subconjunto no vacío) */}
          <div className="pt-2 border-t border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Operadores permitidos:
            </span>
            <div className="flex flex-wrap items-center gap-3">
              {(["Igual", "En lista", "Mayor que", "Mayor o igual", "Menor que", "Menor o igual"] as const).map(
                (op) => {
                  const currentOps = nuevoParametro.operadores_permitidos || ["Igual"];
                  const isChecked = currentOps.includes(op);
                  return (
                    <label
                      key={op}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let nextOps: string[];
                          if (checked) {
                            nextOps = [...currentOps, op];
                          } else {
                            nextOps = currentOps.filter((o) => o !== op);
                            if (nextOps.length === 0) nextOps = ["Igual"]; // no vacío
                          }
                          setNuevoParametro({
                            ...nuevoParametro,
                            operadores_permitidos: nextOps,
                          });
                        }}
                      />
                      <span>{op}</span>
                    </label>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
