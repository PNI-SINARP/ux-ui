"use client";

import React, { useMemo } from "react";
import {
  CampoFuente,
  TipoDatoCanonico,
  ReglaConversion,
  isReglaCompatible,
} from "../data/fuentes-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Layers,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  FileCheck,
} from "lucide-react";

interface FuenteStepperEsquemaProps {
  campos: CampoFuente[];
  onChange: (campos: CampoFuente[]) => void;
  onHasIncompatibilitiesChange?: (hasErrors: boolean) => void;
}

const REGLAS_VALIDAS: ReglaConversion[] = [
  "Identidad",
  "TextoAEntero",
  "TextoADecimal",
  "TextoAFechaISO",
  "TextoABooleano",
  "EnteroADecimal",
];

const TIPOS_CANONICOS: TipoDatoCanonico[] = [
  "Texto",
  "Entero",
  "Decimal",
  "Fecha",
  "Booleano",
];

export function FuenteStepperEsquema({
  campos,
  onChange,
  onHasIncompatibilitiesChange,
}: FuenteStepperEsquemaProps) {
  const toggleCampo = (id: string) => {
    onChange(
      campos.map((c) => (c.id_campo === id ? { ...c, incluido: !c.incluido } : c))
    );
  };

  const updateCampo = (id: string, updates: Partial<CampoFuente>) => {
    onChange(
      campos.map((c) => (c.id_campo === id ? { ...c, ...updates } : c))
    );
  };

  const seleccionarTodos = () => {
    onChange(campos.map((c) => ({ ...c, incluido: true })));
  };

  const deseleccionarTodos = () => {
    onChange(campos.map((c) => ({ ...c, incluido: false })));
  };

  // Normalizar a snake_case y minúsculas
  const handleNormalizarNombre = (id: string, val: string) => {
    const formatted = val
      .toLowerCase()
      .trim()
      .replace(/[\s\-]+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    updateCampo(id, { nombre_publicado: formatted });
  };

  // Verificar incompatibilidades en los campos incluidos
  const camposConError = useMemo(() => {
    return campos.filter(
      (c) => c.incluido && !isReglaCompatible(c.tipo_origen, c.regla_conversion, c.tipo_normalizado).valida
    );
  }, [campos]);

  const hasIncompatibilities = camposConError.length > 0;

  React.useEffect(() => {
    onHasIncompatibilitiesChange?.(hasIncompatibilities);
  }, [hasIncompatibilities, onHasIncompatibilitiesChange]);

  const camposIncluidos = campos.filter((c) => c.incluido).length;

  return (
    <div className="space-y-6">
      {/* Encabezado del Esquema Detectado */}
      <div className="p-4 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="size-4 text-primary" />
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Esquema de Datos Detectado Automáticamente (FUE-03)
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Solo es posible seleccionar campos que pertenezcan a la estructura física detectada. Configure los atributos publicados y valide la compatibilidad de conversiones de tipo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={seleccionarTodos}
            className="text-xs h-7 cursor-pointer"
          >
            Seleccionar todos
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deseleccionarTodos}
            className="text-xs h-7 cursor-pointer"
          >
            Deseleccionar
          </Button>
          <Badge tone="primary" appearance="soft" size="md">
            {camposIncluidos} de {campos.length} seleccionados
          </Badge>
        </div>
      </div>

      {/* Alerta si existen incompatibilidades de tipo detectadas */}
      {hasIncompatibilities && (
        <div className="p-4 bg-danger/10 rounded-xl border border-danger/30 space-y-2">
          <div className="flex items-center gap-2 text-danger font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="size-4" />
            <span>
              Esquema pendiente de corrección ({camposConError.length} conversión(es) incompatible(s))
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Se han detectado reglas de normalización incompatibles con el tipo de dato físico de origen (por ejemplo, intentar convertir una fecha a booleano). Debe corregir la regla o tipo antes de enviar a revisión.
          </p>
        </div>
      )}

      {/* Aviso Metodológico FUE-03 / FUE-04 */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">
            Normalización técnica vs. Clasificación de acceso:
          </span>{" "}
          El Coordinador define nombres normalizados (en minúsculas y snake_case), tipos y reglas de transformación. La clasificación de seguridad (<strong>Accesible</strong> o <strong>Confidencial</strong>) será asignada obligatoriamente por Gestión en FUE-04.
        </div>
      </div>

      {/* Tabla de Mapeo y Configuración de Campos con encabezados blancos y sin contenedor */}
      <div className="w-full">
        <Table className="w-full" containerClassName="overflow-x-auto w-full">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="w-14 text-center text-xs font-bold text-white pl-6">Exponer</TableHead>
              <TableHead className="text-xs font-bold text-white">Ruta Física Origen</TableHead>
              <TableHead className="text-xs font-bold text-white">Nombre Publicado (snake_case)</TableHead>
              <TableHead className="text-xs font-bold text-white">Tipo Físico</TableHead>
              <TableHead className="text-xs font-bold text-white">Tipo Normalizado</TableHead>
              <TableHead className="text-xs font-bold text-white">Regla Conversión</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold text-white">Oblig.</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold text-white">ID Pers.</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold text-white">Cons. Dir.</TableHead>
              <TableHead className="text-xs font-bold text-white pr-6">Descripción Funcional</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campos.map((campo) => {
              const isSelected = campo.incluido;
              const isCompatible = isReglaCompatible(campo.tipo_origen, campo.regla_conversion, campo.tipo_normalizado).valida;
              const hasError = isSelected && !isCompatible;

              return (
                <TableRow
                  key={campo.id_campo}
                  className={`transition-colors ${
                    hasError
                      ? "bg-danger/10 border-danger/40 hover:bg-danger/15"
                      : isSelected
                      ? "bg-background hover:bg-muted/30"
                      : "bg-muted/10 opacity-50 hover:opacity-80"
                  }`}
                >
                  <TableCell className="text-center pl-6">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCampo(campo.id_campo)}
                      className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                    />
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                    {campo.ruta_origen}
                  </TableCell>

                  <TableCell>
                    <Input
                      disabled={!isSelected}
                      value={campo.nombre_publicado}
                      onChange={(e) => updateCampo(campo.id_campo, { nombre_publicado: e.target.value })}
                      onBlur={(e) => handleNormalizarNombre(campo.id_campo, e.target.value)}
                      className="h-8 text-xs font-mono max-w-[150px]"
                      placeholder="nombre_campo"
                    />
                  </TableCell>

                  <TableCell>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px]">
                      {campo.tipo_origen}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <select
                      disabled={!isSelected}
                      value={campo.tipo_normalizado}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, {
                          tipo_normalizado: e.target.value as TipoDatoCanonico,
                        })
                      }
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {TIPOS_CANONICOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <select
                        disabled={!isSelected}
                        value={campo.regla_conversion}
                        onChange={(e) =>
                          updateCampo(campo.id_campo, {
                            regla_conversion: e.target.value as ReglaConversion,
                          })
                        }
                        className={`h-8 rounded-md border px-2 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                          hasError
                            ? "border-danger text-danger bg-danger/10 font-bold"
                            : "border-input bg-background"
                        }`}
                      >
                        {REGLAS_VALIDAS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      {hasError && (
                        <span className="text-[10px] text-danger font-semibold flex items-center gap-1">
                          <XCircle className="size-3 shrink-0" />
                          Incompatible con {campo.tipo_origen}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Obligatorio */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      disabled={!isSelected}
                      checked={campo.obligatorio ?? !campo.admite_nulo}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { obligatorio: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-primary size-3.5 cursor-pointer"
                    />
                  </TableCell>

                  {/* Es Identificador de Persona */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      disabled={!isSelected}
                      checked={campo.es_identificador_persona ?? false}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { es_identificador_persona: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-primary size-3.5 cursor-pointer"
                    />
                  </TableCell>

                  {/* Admite Consultas Directas */}
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      disabled={!isSelected}
                      checked={campo.admite_consultas_directas ?? true}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { admite_consultas_directas: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-primary size-3.5 cursor-pointer"
                    />
                  </TableCell>

                  <TableCell className="pr-6">
                    <Input
                      disabled={!isSelected}
                      value={campo.descripcion}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { descripcion: e.target.value })
                      }
                      placeholder="Propósito del dato en el catálogo..."
                      className="h-8 text-xs min-w-[180px]"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
