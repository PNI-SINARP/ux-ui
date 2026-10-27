"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  FileText,
  Calendar,
  Building2,
  ShieldCheck
} from "lucide-react";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { cn } from "@/lib/utils";
import {
  DocumentoStatusBadge,
  TramiteStatusBadge
} from "./cambio-coordinador-status";
import type { TramiteCambioCoordinador } from "../data/cambio-coordinador-store";

interface CambioCoordinadorTableProps {
  tramites: TramiteCambioCoordinador[];
  onVerDetalle: (tramite: TramiteCambioCoordinador) => void;
}

export function CambioCoordinadorTable({
  tramites,
  onVerDetalle
}: CambioCoordinadorTableProps) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const tramitesFiltrados = tramites.filter((t) => {
    const term = busqueda.toLowerCase().trim();
    const matchTerm =
      !term ||
      t.numeroTramite.toLowerCase().includes(term) ||
      t.coordinadorEntrante.nombreCompleto.toLowerCase().includes(term) ||
      t.coordinadorSaliente.nombreCompleto.toLowerCase().includes(term) ||
      t.institucion.toLowerCase().includes(term);

    const matchEstado =
      filtroEstado === "TODOS" || t.estadoTramite === filtroEstado;

    return matchTerm && matchEstado;
  });

  return (
    <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
      {/* Barra de Filtros */}
      <div className="p-4 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <InputGroup leftIcon={<Search className="size-4 text-muted-foreground" />}>
            <InputGroupInput
              type="text"
              placeholder="Buscar por Nro. de trámite, funcionario o cédula..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="text-xs"
            />
          </InputGroup>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filtroEstado === "TODOS" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("TODOS")}
          >
            Todos ({tramites.length})
          </Button>
          <Button
            variant={filtroEstado === "Pendiente de asignación" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("Pendiente de asignación")}
          >
            Pendientes
          </Button>
          <Button
            variant={filtroEstado === "En revisión" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("En revisión")}
          >
            En revisión
          </Button>
          <Button
            variant={filtroEstado === "Aplicado" || filtroEstado === "Aprobado" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFiltroEstado("Aplicado")}
          >
            Aplicados
          </Button>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Tabla */}
      <div className={cn("overflow-x-auto", viewMode === "table" ? "hidden md:block" : "hidden")}>
        <table className="w-full text-body-sm text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border text-caption text-muted-foreground uppercase font-semibold">
              <th className="py-3 px-4">Trámite</th>
              <th className="py-3 px-4">Carácter</th>
              <th className="py-3 px-4">Coordinador Saliente</th>
              <th className="py-3 px-4">Coordinador Entrante</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Estado Documento</th>
              <th className="py-3 px-4">Estado Trámite</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tramitesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground text-body-sm">
                  No se encontraron trámites de cambio de coordinador con los criterios seleccionados.
                </td>
              </tr>
            ) : (
              tramitesFiltrados.map((t) => (
                <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-primary">
                    {t.numeroTramite}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      tone={t.caracter === "TITULAR" ? "primary" : "neutral"}
                      appearance="soft"
                      size="sm"
                      className="border border-border font-medium"
                    >
                      {t.caracter === "TITULAR" ? "Titular" : "Suplente"}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-foreground">{t.coordinadorSaliente.nombreCompleto}</div>
                    <div className="text-caption text-muted-foreground font-mono">{t.coordinadorSaliente.cedula}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{t.coordinadorEntrante.nombreCompleto}</div>
                    <div className="text-caption text-muted-foreground font-mono">{t.coordinadorEntrante.cedula}</div>
                  </td>
                  <td className="py-3.5 px-4 text-caption text-muted-foreground whitespace-nowrap">
                    {t.fechaSolicitud}
                  </td>
                  <td className="py-3.5 px-4">
                    <DocumentoStatusBadge status={t.estadoDocumento} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <TramiteStatusBadge status={t.estadoTramite} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                      onClick={() => onVerDetalle(t)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detalle</span>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas (Móvil + Modo Cards) */}
      <div
        className={cn(
          "w-full p-4",
          viewMode === "cards"
            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
            : "block md:hidden space-y-3.5"
        )}
      >
        {tramitesFiltrados.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted-foreground text-body-sm">
            No se encontraron trámites de cambio de coordinador con los criterios seleccionados.
          </div>
        ) : (
          tramitesFiltrados.map((t) => (
            <InteractiveCard
              key={t.id}
              as="div"
              className="p-4 flex flex-col gap-3 bg-surface border-border"
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-semibold text-primary text-body-sm">
                    {t.numeroTramite}
                  </span>
                  <Badge
                    tone={t.caracter === "TITULAR" ? "primary" : "neutral"}
                    appearance="soft"
                    size="sm"
                    className="border border-border font-medium"
                  >
                    {t.caracter === "TITULAR" ? "Titular" : "Suplente"}
                  </Badge>
                </div>
                <TramiteStatusBadge status={t.estadoTramite} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-caption w-full">
                <div>
                  <span className="text-muted-foreground block">Coordinador Saliente</span>
                  <span className="font-medium text-foreground block">{t.coordinadorSaliente.nombreCompleto}</span>
                  <span className="text-muted-foreground font-mono">{t.coordinadorSaliente.cedula}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Coordinador Entrante</span>
                  <span className="font-semibold text-foreground block">{t.coordinadorEntrante.nombreCompleto}</span>
                  <span className="text-muted-foreground font-mono">{t.coordinadorEntrante.cedula}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fecha</span>
                  <span className="text-foreground font-medium">{t.fechaSolicitud}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5">Estado Documento</span>
                  <DocumentoStatusBadge status={t.estadoDocumento} size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-border w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/40"
                  onClick={() => onVerDetalle(t)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Detalle</span>
                </Button>
              </div>
            </InteractiveCard>
          ))
        )}
      </div>
    </div>
  );
}
