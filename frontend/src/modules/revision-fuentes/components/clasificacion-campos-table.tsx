"use client";

import React from "react";
import { CampoFuente, ClasificacionCampo } from "@/modules/fuentes/data/fuentes-data";
import { Badge } from "@/components/ui/badge";
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
  Info,
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
                ? "Todos los campos cuentan con clasificación normativa individual asignada."
                : `Faltan ${camposIncluidos.length - camposClasificados} campo(s) por clasificar individualmente antes de poder aprobar.`}
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
        </div>
      </div>

      {/* Nota normativa sobre Confidencialidad */}
      <div className="p-3 bg-muted/20 rounded-lg border border-border text-[11px] text-muted-foreground flex items-start gap-2">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div>
          <strong className="text-foreground">Criterio normativo:</strong> Clasificar un campo como{" "}
          <strong className="text-warning">Confidencial</strong> no rechaza ni inhabilita la fuente;
          únicamente determina que las solicitudes de consumo posteriores requerirán acreditación de
          base legal específica o consentimiento expreso del titular según la LOPDP (flujos BN-01 y BN-02).
        </div>
      </div>

      {/* Tabla de Campos con encabezados blancos y sin contenedor */}
      <div className="w-full">
        <Table className="w-full" containerClassName="overflow-x-auto w-full">
          <TableHeader>
            <TableRow className="border-0">
              <TableHead className="text-xs font-bold text-white pl-6">Campo publicado</TableHead>
              <TableHead className="text-xs font-bold text-white">Ruta física origen</TableHead>
              <TableHead className="text-xs font-bold text-white">Tipo canónico</TableHead>
              <TableHead className="text-xs font-bold text-white">Identificador</TableHead>
              <TableHead className="text-xs font-bold text-white">Descripción</TableHead>
              <TableHead className="text-xs font-bold text-white text-center w-56 pr-6">
                Clasificación Gestión <span className="text-danger">*</span>
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
                  <TableCell className="pl-6">
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

                  <TableCell className="text-center pr-6">
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
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isAccesible
                              ? "bg-success text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Unlock className="size-3" />
                          <span>Accesible</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onClasificarCampo(campo.id_campo, "Confidencial")}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isConfidencial
                              ? "bg-warning text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Lock className="size-3" />
                          <span>Confidencial</span>
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
