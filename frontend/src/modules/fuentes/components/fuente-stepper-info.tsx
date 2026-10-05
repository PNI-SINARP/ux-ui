"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  ParametroConsulta,
  ModalidadSoportada,
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
  modalidades_soportadas: ModalidadSoportada;
  formato_respuesta: "application/json" | "application/xml";
  tipo_dato_pruebas: TipoDatoPruebas;
  parametros_consulta: ParametroConsulta[];
}

interface FuenteStepperInfoProps {
  formData: InfoFormData;
  onChange: (data: Partial<InfoFormData>) => void;
  institucionPrecargada: string;
}

export function FuenteStepperInfo({
  formData,
  onChange,
  institucionPrecargada,
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
      operadores_permitidos: nuevoParametro.operadores_permitidos || ["Igual"],
      restriccion: nuevoParametro.restriccion?.patron
        ? { patron: nuevoParametro.restriccion.patron.trim() }
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
      {/* Institución Proveedora Precargada */}
      <div className="p-4 bg-muted/20 rounded-xl border border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
            <Building2 className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Institución proveedora (Precargada por sesión)
            </span>
            <span className="font-heading font-bold text-sm text-foreground">
              {institucionPrecargada}
            </span>
          </div>
        </div>
        <Badge tone="primary" appearance="soft" size="sm">
          Capacidad Proveedora Activa
        </Badge>
      </div>

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
        <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">
          Descripción técnica y alcance funcional (PAR-07) <span className="text-danger">*</span>
        </Label>
        <Textarea
          id="descripcion"
          rows={3}
          placeholder="Describa el propósito de la fuente, qué tipo de registros expone, frecuencia de actualización y base legal..."
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
            Acuerdo de Nivel de Servicio (SLA) y Modalidades
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <Label htmlFor="modalidad" className="text-xs font-medium text-muted-foreground">
              Modalidades soportadas <span className="text-danger">*</span>
            </Label>
            <select
              id="modalidad"
              value={formData.modalidades_soportadas}
              onChange={(e) =>
                onChange({ modalidades_soportadas: e.target.value as ModalidadSoportada })
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Ambas modalidades">Ambas modalidades (individual y masiva)</option>
              <option value="API individual">API individual (tiempo real)</option>
              <option value="API masiva">API masiva (lotes)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="formato" className="text-xs font-medium text-muted-foreground">
              Formato de respuesta <span className="text-danger">*</span>
            </Label>
            <select
              id="formato"
              value={formData.formato_respuesta}
              onChange={(e) =>
                onChange({
                  formato_respuesta: e.target.value as "application/json" | "application/xml",
                })
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="application/json">application/json (Recomendado)</option>
              <option value="application/xml">application/xml</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo-prueba" className="text-xs font-medium text-muted-foreground">
              Tipo de datos para entorno de Pruebas <span className="text-danger">*</span>
            </Label>
            <select
              id="tipo-prueba"
              value={formData.tipo_dato_pruebas}
              onChange={(e) =>
                onChange({ tipo_dato_pruebas: e.target.value as TipoDatoPruebas })
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="Sintético">Sintético (datos de prueba autogenerados)</option>
              <option value="Anonimizado">Anonimizado (datos reales enmascarados)</option>
              <option value="Real">Real (datos auténticos de producción)</option>
              <option value="Indeterminado">Indeterminado (pendiente de certificación)</option>
            </select>
          </div>

          <div className="flex items-center">
            {isTestRestricted ? (
              <div className="p-2.5 rounded-lg bg-warning/10 border border-warning/30 text-warning text-[11px] flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Restricción FUE-04:</strong> Declarar datos &quot;Real&quot; o &quot;Indeterminado&quot; inhabilita consultas en ambiente de Pruebas. Solo se autorizará para Producción.
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
      </div>

      {/* Parámetros de consulta (FUE-01) */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Parámetros de Consulta (FUE-01)
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
              <select
                value={nuevoParametro.tipo}
                onChange={(e) =>
                  setNuevoParametro({
                    ...nuevoParametro,
                    tipo: e.target.value as TipoDatoCanonico,
                  })
                }
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Texto">Texto</option>
                <option value="Entero">Entero</option>
                <option value="Decimal">Decimal</option>
                <option value="Fecha">Fecha</option>
                <option value="Booleano">Booleano</option>
              </select>
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

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoParametro.obligatorio}
                onChange={(e) =>
                  setNuevoParametro({ ...nuevoParametro, obligatorio: e.target.checked })
                }
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              Obligatorio
            </label>

            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={nuevoParametro.es_identificador_persona}
                onChange={(e) =>
                  setNuevoParametro({
                    ...nuevoParametro,
                    es_identificador_persona: e.target.checked,
                  })
                }
                className="rounded border-input text-primary focus:ring-primary size-3.5"
              />
              Identificador de persona (Cédula/RUC)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
