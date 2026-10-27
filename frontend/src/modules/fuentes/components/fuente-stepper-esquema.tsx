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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
              Campos detectados en su origen de datos
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Seleccione qué columnas desea exponer a las instituciones y confirme su nombre y tipo de dato.
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
          El Coordinador define nombres comprensibles (en minúsculas), tipos de datos y transformaciones. La clasificación de seguridad (<strong>Accesible</strong> o <strong>Confidencial</strong>) será asignada por el equipo de Gestión de la DINARP.
        </div>
      </div>

      {/* Tabla de Mapeo y Configuración de Campos con encabezados adaptados al tema */}
      <div className="w-full">
        <Table className="w-full" containerClassName="overflow-x-auto w-full">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="w-14 text-center text-xs font-bold pl-6">Exponer</TableHead>
              <TableHead className="text-xs font-bold">Ruta Física Origen</TableHead>
              <TableHead className="text-xs font-bold">Nombre Publicado (snake_case)</TableHead>
              <TableHead className="text-xs font-bold">Tipo Físico</TableHead>
              <TableHead className="text-xs font-bold">Tipo Normalizado</TableHead>
              <TableHead className="text-xs font-bold">Regla Conversión</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold">Oblig.</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold">ID Pers.</TableHead>
              <TableHead className="w-14 text-center text-xs font-bold">Cons. Dir.</TableHead>
              <TableHead className="text-xs font-bold pr-6">Descripción Funcional</TableHead>
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
                    <div className="flex justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCampo(campo.id_campo)}
                        aria-label={`Exponer ${campo.ruta_origen}`}
                      />
                    </div>
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
                      className="h-8 text-xs font-mono min-w-[140px] max-w-[240px]"
                      placeholder="nombre_campo"
                    />
                  </TableCell>

                  <TableCell>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px]">
                      {campo.tipo_origen}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Select
                      disabled={!isSelected}
                      value={campo.tipo_normalizado}
                      onValueChange={(val) =>
                        updateCampo(campo.id_campo, {
                          tipo_normalizado: val as TipoDatoCanonico,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs min-w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_CANONICOS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <Select
                        disabled={!isSelected}
                        value={campo.regla_conversion}
                        onValueChange={(val) =>
                          updateCampo(campo.id_campo, {
                            regla_conversion: val as ReglaConversion,
                          })
                        }
                      >
                        <SelectTrigger
                          className={`h-8 text-xs font-mono min-w-[140px] ${
                            hasError
                              ? "border-danger text-danger bg-danger/10 font-bold"
                              : ""
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REGLAS_VALIDAS.map((r) => (
                            <SelectItem key={r} value={r} className="font-mono text-xs">
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <div className="flex justify-center">
                      <Checkbox
                        disabled={!isSelected}
                        checked={campo.obligatorio ?? !campo.admite_nulo}
                        onCheckedChange={(checked) =>
                          updateCampo(campo.id_campo, { obligatorio: !!checked })
                        }
                        aria-label={`Obligatorio para ${campo.nombre_publicado}`}
                      />
                    </div>
                  </TableCell>

                  {/* Es Identificador de Persona */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        disabled={!isSelected}
                        checked={campo.es_identificador_persona ?? false}
                        onCheckedChange={(checked) =>
                          updateCampo(campo.id_campo, { es_identificador_persona: !!checked })
                        }
                        aria-label={`Identificador de persona para ${campo.nombre_publicado}`}
                      />
                    </div>
                  </TableCell>

                  {/* Admite Consultas Directas */}
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Checkbox
                        disabled={!isSelected}
                        checked={campo.admite_consultas_directas ?? true}
                        onCheckedChange={(checked) =>
                          updateCampo(campo.id_campo, { admite_consultas_directas: !!checked })
                        }
                        aria-label={`Admite consulta directa para ${campo.nombre_publicado}`}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="pr-6">
                    <Input
                      disabled={!isSelected}
                      value={campo.descripcion}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { descripcion: e.target.value })
                      }
                      placeholder="Propósito del dato en el catálogo..."
                      className="h-8 text-xs min-w-[200px] w-full"
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
