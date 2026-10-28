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
  ShieldAlert,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface ClasificacionCamposTableProps {
  campos: CampoFuente[];
  onClasificarCampo: (campoId: string, clasificacion: ClasificacionCampo, esSensible?: boolean) => void;
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
  const totalSensibles = camposIncluidos.filter(
    (c) => c.clasificacion === "Confidencial" && c.es_sensible
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
              Parametrización de Clasificación de Campos por DINARP (FUE-04)
            </span>
            <span className="text-[11px] text-muted-foreground">
              {todosClasificados
                ? "Todos los campos cuentan con clasificación normativa asignada (Accesible / Confidencial / Confidencial sensible)."
                : `Faltan ${camposIncluidos.length - camposClasificados} campo(s) por clasificar individualmente antes de poder aprobar.`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {totalSensibles > 0 && (
            <Badge tone="danger" appearance="soft" size="sm" className="gap-1 border border-danger/30">
              <ShieldAlert className="size-3" />
              {totalSensibles} Sensible{totalSensibles !== 1 ? "s" : ""} · LOPDP
            </Badge>
          )}
          <Badge
            tone={todosClasificados ? "success" : "warning"}
            appearance="soft"
            size="md"
          >
            {camposClasificados} de {camposIncluidos.length} clasificados
          </Badge>
        </div>
      </div>

      {/* Nota normativa sobre Confidencialidad y Subclasificación Sensible */}
      <div className="p-3 bg-muted/20 rounded-lg border border-border text-[11px] text-muted-foreground flex items-start gap-2">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div>
            <strong className="text-foreground">Criterio normativo DINARP:</strong> Existen dos clasificaciones principales:{" "}
            <strong className="text-success">Accesibles</strong> y <strong className="text-warning">Confidenciales</strong> (revisión por DPI).
          </div>
          <div>
            Dentro de los datos <strong className="text-warning">Confidenciales</strong>, DINARP puede parametrizar la subclasificación{" "}
            <strong className="text-danger">Confidencial sensible (LOPDP)</strong> para aquellos atributos que requieren tratamiento especial por su nivel de sensibilidad conforme a la Ley Orgánica de Protección de Datos Personales, manteniendo el mismo flujo de revisión por DPI.
          </div>
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
              <TableHead className="text-xs font-bold text-white text-center w-80 pr-6">
                Clasificación DINARP <span className="text-danger">*</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camposIncluidos.map((campo) => {
              const isAccesible = campo.clasificacion === "Accesible";
              const isConfidencial = campo.clasificacion === "Confidencial";
              const isSensible = isConfidencial && Boolean(campo.es_sensible);
              const isPendiente = !isAccesible && !isConfidencial;

              return (
                <TableRow
                  key={campo.id_campo}
                  className={`text-xs hover:bg-muted/10 transition-colors ${
                    isPendiente ? "bg-warning/5" : isSensible ? "bg-danger/5" : ""
                  }`}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-primary">
                        {campo.nombre_publicado}
                      </span>
                      {isSensible && (
                        <Badge tone="danger" appearance="soft" size="sm" className="gap-1 text-[10px] border border-danger/30">
                          <ShieldAlert className="size-2.5" />
                          Sensible · LOPDP
                        </Badge>
                      )}
                    </div>
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
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {isAccesible && (
                          <Badge tone="success" appearance="solid" size="sm" className="gap-1">
                            <Unlock className="size-3" />
                            Accesible
                          </Badge>
                        )}
                        {isConfidencial && !isSensible && (
                          <Badge tone="warning" appearance="solid" size="sm" className="gap-1">
                            <Lock className="size-3" />
                            Confidencial
                          </Badge>
                        )}
                        {isSensible && (
                          <>
                            <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                              <Lock className="size-3" />
                              Confidencial
                            </Badge>
                            <Badge tone="danger" appearance="solid" size="sm" className="gap-1">
                              <ShieldAlert className="size-3" />
                              Sensible · LOPDP
                            </Badge>
                          </>
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
                          onClick={() => onClasificarCampo(campo.id_campo, "Accesible", false)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
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
                          onClick={() => onClasificarCampo(campo.id_campo, "Confidencial", false)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            isConfidencial && !isSensible
                              ? "bg-warning text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                        >
                          <Lock className="size-3" />
                          <span>Confidencial</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onClasificarCampo(campo.id_campo, "Confidencial", true)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            isSensible
                              ? "bg-danger text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}
                          title="Subclasificación dentro de Confidenciales: Dato sensible con tratamiento especial según la LOPDP"
                        >
                          <ShieldAlert className="size-3" />
                          <span>Conf. Sensible</span>
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
