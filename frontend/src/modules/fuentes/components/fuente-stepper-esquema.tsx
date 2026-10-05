"use client";

import React from "react";
import { CampoFuente, TipoDatoCanonico, ReglaConversion } from "../data/fuentes-data";
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
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";

interface FuenteStepperEsquemaProps {
  campos: CampoFuente[];
  onChange: (campos: CampoFuente[]) => void;
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

export function FuenteStepperEsquema({ campos, onChange }: FuenteStepperEsquemaProps) {
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

  const camposIncluidos = campos.filter((c) => c.incluido).length;

  return (
    <div className="space-y-6">
      {/* Encabezado del Esquema Detectado */}
      <div className="p-4 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="size-4 text-primary" />
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Esquema de Datos Detectado (FUE-03)
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Seleccione los campos a exponer públicamente y configure sus nombres publicados, tipos canónicos y reglas de normalización.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={seleccionarTodos}
            className="text-xs h-7"
          >
            Seleccionar todos
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={deseleccionarTodos}
            className="text-xs h-7"
          >
            Deseleccionar
          </Button>
          <Badge tone="primary" appearance="soft" size="md">
            {camposIncluidos} de {campos.length} seleccionados
          </Badge>
        </div>
      </div>

      {/* Aviso Metodológico FUE-03 / FUE-04 */}
      <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">
            Responsabilidad de normalización vs. Clasificación:
          </span>{" "}
          El Coordinador define el esquema técnico y nombres normalizados. La clasificación de seguridad (<strong>Accesible</strong> o <strong>Confidencial</strong>) será realizada por el Área de Gestión durante la etapa de revisión (FUE-04).
        </div>
      </div>

      {/* Tabla de Mapeo de Campos */}
      <div className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-12 text-center text-xs">Exponer</TableHead>
              <TableHead className="text-xs">Ruta física origen</TableHead>
              <TableHead className="text-xs">Nombre publicado</TableHead>
              <TableHead className="text-xs">Tipo físico</TableHead>
              <TableHead className="text-xs">Tipo normalizado</TableHead>
              <TableHead className="text-xs">Regla conversión</TableHead>
              <TableHead className="text-xs text-center">Nulo</TableHead>
              <TableHead className="text-xs">Descripción del campo (PAR-07)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campos.map((campo) => {
              const isSelected = campo.incluido;

              return (
                <TableRow
                  key={campo.id_campo}
                  className={isSelected ? "bg-background" : "bg-muted/10 opacity-60"}
                >
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCampo(campo.id_campo)}
                      className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
                    />
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {campo.ruta_origen}
                  </TableCell>

                  <TableCell>
                    <Input
                      disabled={!isSelected}
                      value={campo.nombre_publicado}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { nombre_publicado: e.target.value })
                      }
                      className="h-7 text-xs font-mono max-w-[160px]"
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
                      className="h-7 rounded border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {TIPOS_CANONICOS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  <TableCell>
                    <select
                      disabled={!isSelected}
                      value={campo.regla_conversion}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, {
                          regla_conversion: e.target.value as ReglaConversion,
                        })
                      }
                      className="h-7 rounded border border-input bg-background px-2 text-xs font-mono shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {REGLAS_VALIDAS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </TableCell>

                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      disabled={!isSelected}
                      checked={campo.admite_nulo}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { admite_nulo: e.target.checked })
                      }
                      className="rounded border-input text-primary focus:ring-primary size-3.5"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      disabled={!isSelected}
                      value={campo.descripcion}
                      onChange={(e) =>
                        updateCampo(campo.id_campo, { descripcion: e.target.value })
                      }
                      placeholder="Propósito del dato..."
                      className="h-7 text-xs min-w-[200px]"
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
