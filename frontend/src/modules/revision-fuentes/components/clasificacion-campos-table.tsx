"use client";

import React from "react";
import { CampoFuente, ClasificacionCampo } from "@/modules/fuentes/data/fuentes-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface ClasificacionCamposTableProps {
  campos: CampoFuente[];
  onClasificarCampo: (campoId: string, clasificacion: ClasificacionCampo) => void;
  onClasificarLote?: (clasificaciones: Record<string, ClasificacionCampo>) => void;
  readOnly?: boolean;
}

export function ClasificacionCamposTable({
  campos,
  onClasificarCampo,
  onClasificarLote,
  readOnly = false,
}: ClasificacionCamposTableProps) {
  const camposIncluidos = campos.filter((c) => c.incluido);
  const camposClasificados = camposIncluidos.filter(
    (c) => c.clasificacion === "Accesible" || c.clasificacion === "Confidencial"
  ).length;

  const todosClasificados =
    camposIncluidos.length > 0 && camposClasificados === camposIncluidos.length;

  // Acciones en lote para agilizar el flujo de revisión
  const marcarRestantesAccesibles = () => {
    if (!onClasificarLote) return;
    const batch: Record<string, ClasificacionCampo> = {};
    camposIncluidos.forEach((c) => {
      if (!c.clasificacion) {
        batch[c.id_campo] = "Accesible";
      }
    });
    onClasificarLote(batch);
  };

  const clasificarSugeridoNormativo = () => {
    if (!onClasificarLote) return;
    const batch: Record<string, ClasificacionCampo> = {};
    camposIncluidos.forEach((c) => {
      // Regla de sugerencia: si es identificador de persona o contiene "sensible/huella/foto/firma" -> Confidencial; caso contrario Accesible
      const lower = (c.nombre_publicado + " " + c.ruta_origen).toLowerCase();
      if (
        c.es_identificador_persona ||
        lower.includes("huella") ||
        lower.includes("foto") ||
        lower.includes("firma") ||
        lower.includes("biometric")
      ) {
        batch[c.id_campo] = "Confidencial";
      } else {
        batch[c.id_campo] = "Accesible";
      }
    });
    onClasificarLote(batch);
  };

  return (
    <div className="space-y-3">
      {/* Barra de Estado de Clasificación */}
      <div className="p-3 bg-surface rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg ${
              todosClasificados
                ? "bg-success/10 text-success"
                : "bg-warning/10 text-warning"
            }`}
          >
            {todosClasificados ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
          </div>
          <div>
            <span className="text-xs font-heading font-bold text-foreground block">
              Clasificación de Campos Obligatoria (FUE-04)
            </span>
            <span className="text-[11px] text-muted-foreground">
              {todosClasificados
                ? "Todos los campos cuentan con clasificación normativa asignada."
                : `Faltan ${camposIncluidos.length - camposClasificados} campo(s) por clasificar antes de poder aprobar.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Badge
            tone={todosClasificados ? "success" : "warning"}
            appearance="soft"
            size="md"
          >
            {camposClasificados} de {camposIncluidos.length} clasificados
          </Badge>

          {!readOnly && onClasificarLote && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clasificarSugeridoNormativo}
                className="gap-1 text-xs"
              >
                <Sparkles className="size-3 text-primary" />
                Sugerir según LOPDP
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={marcarRestantesAccesibles}
                className="text-xs text-muted-foreground"
              >
                Completar como Accesible
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabla de Campos */}
      <div className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Campo publicado</TableHead>
              <TableHead className="text-xs font-semibold">Ruta origen</TableHead>
              <TableHead className="text-xs font-semibold">Tipo canónico</TableHead>
              <TableHead className="text-xs font-semibold">Identificador</TableHead>
              <TableHead className="text-xs font-semibold">Descripción (PAR-07)</TableHead>
              <TableHead className="text-xs font-semibold text-center w-56">
                Clasificación de Gestión <span className="text-danger">*</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camposIncluidos.map((campo) => {
              const isAccesible = campo.clasificacion === "Accesible";
              const isConfidencial = campo.clasificacion === "Confidencial";
              const isPendiente = !isAccesible && !isConfidencial;

              return (
                <TableRow
                  key={campo.id_campo}
                  className={`text-xs hover:bg-muted/10 transition-colors ${
                    isPendiente ? "bg-warning/5" : ""
                  }`}
                >
                  <TableCell>
                    <span className="font-mono font-bold text-primary">
                      {campo.nombre_publicado}
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-muted-foreground text-[11px]">
                    {campo.ruta_origen}
                  </TableCell>

                  <TableCell>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px]">
                      {campo.tipo_normalizado}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {campo.es_identificador_persona ? (
                      <Badge tone="warning" appearance="soft" size="sm">
                        ID Persona
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground max-w-xs">
                    <span className="line-clamp-2">{campo.descripcion || "-"}</span>
                  </TableCell>

                  <TableCell className="text-center">
                    {readOnly ? (
                      <div>
                        {isAccesible && (
                          <Badge tone="success" appearance="solid" size="sm" className="gap-1">
                            <Unlock className="size-3" />
                            Accesible
                          </Badge>
                        )}
                        {isConfidencial && (
                          <Badge tone="warning" appearance="solid" size="sm" className="gap-1">
                            <Lock className="size-3" />
                            Confidencial
                          </Badge>
                        )}
                        {isPendiente && (
                          <Badge tone="neutral" appearance="outline" size="sm">
                            Sin clasificar
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="inline-flex rounded-lg border border-border p-0.5 bg-background shadow-2xs">
                        <button
                          type="button"
                          onClick={() => onClasificarCampo(campo.id_campo, "Accesible")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isAccesible
                              ? "bg-success text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Unlock className="size-3" />
                          Accesible
                        </button>
                        <button
                          type="button"
                          onClick={() => onClasificarCampo(campo.id_campo, "Confidencial")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isConfidencial
                              ? "bg-warning text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Lock className="size-3" />
                          Confidencial
                        </button>
                      </div>
                    )}
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
