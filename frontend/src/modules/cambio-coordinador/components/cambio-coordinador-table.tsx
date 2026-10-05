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
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
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
    </div>
  );
}
