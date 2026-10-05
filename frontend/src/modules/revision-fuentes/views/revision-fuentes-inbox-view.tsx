"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { EstadoFuente } from "@/modules/fuentes/data/fuentes-data";
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
  FolderCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  ArrowRight,
  RotateCcw,
  Building2,
  ShieldCheck,
  Layers,
} from "lucide-react";

interface RevisionFuentesInboxViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function RevisionFuentesInboxView({ currentUser }: RevisionFuentesInboxViewProps) {
  const { fuentes, isLoaded, restablecerDatosDemo } = useFuentesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");

  // Filtro de fuentes disponibles para Gestión
  const fuentesFiltradas = useMemo(() => {
    return fuentes.filter((f) => {
      // Búsqueda
      const matchesSearch =
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.institucion_proveedora_nombre.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de estado
      const matchesEstado =
        estadoFilter === "ALL" ? true : f.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [fuentes, searchTerm, estadoFilter]);

  // Contadores
  const stats = useMemo(() => {
    return {
      total: fuentes.length,
      pendientes: fuentes.filter((f) => f.estado === "EN_REVISION").length,
      devueltas: fuentes.filter((f) => f.estado === "DEVUELTA").length,
      aprobadas: fuentes.filter((f) => f.estado === "APROBADA").length,
      publicadas: fuentes.filter((f) => f.estado === "PUBLICADA").length,
    };
  }, [fuentes]);

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return <Badge tone="neutral" appearance="soft" size="sm">Borrador</Badge>;
      case "CONFIGURACION":
        return <Badge tone="info" appearance="soft" size="sm">Configuración</Badge>;
      case "EN_REVISION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold">
            <Clock className="size-3 mr-1" />
            En revisión
          </Badge>
        );
      case "DEVUELTA":
        return (
          <Badge tone="danger" appearance="soft" size="sm">
            <AlertTriangle className="size-3 mr-1" />
            Devuelta
          </Badge>
        );
      case "APROBADA":
        return (
          <Badge tone="success" appearance="soft" size="sm">
            <CheckCircle2 className="size-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "PUBLICADA":
        return (
          <Badge tone="success" appearance="solid" size="sm">
            <Globe className="size-3 mr-1" />
            Publicada
          </Badge>
        );
      default:
        return <Badge size="sm">{estado}</Badge>;
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Gestión */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <FolderCheck className="size-5" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">
              Revisión y Clasificación de Fuentes
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="size-3.5 text-primary" />
              Área de Gestión · Flujo BN-06 (FUE-04 — Clasificar campos y aprobar publicación)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={restablecerDatosDemo}
            className="text-xs gap-1.5"
            title="Restablecer fuentes de demostración"
          >
            <RotateCcw className="size-3.5" />
            Restablecer demo
          </Button>
        </div>
      </div>

      {/* Métricas de Revisión */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-warning block">
              Pendientes de Revisión
            </span>
            <span className="font-heading font-bold text-lg text-warning">{stats.pendientes}</span>
          </div>
          <div className="p-2 bg-warning/10 rounded-lg text-warning">
            <Clock className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block">
              Devueltas con Obs.
            </span>
            <span className="font-heading font-bold text-lg text-danger">{stats.devueltas}</span>
          </div>
          <div className="p-2 bg-danger/10 rounded-lg text-danger">
            <AlertTriangle className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-success block">
              Aprobadas por Gestión
            </span>
            <span className="font-heading font-bold text-lg text-success">{stats.aprobadas}</span>
          </div>
          <div className="p-2 bg-success/10 rounded-lg text-success">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="p-3.5 bg-surface rounded-xl border border-border shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary block">
              Publicadas en Catálogo
            </span>
            <span className="font-heading font-bold text-lg text-primary">{stats.publicadas}</span>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Globe className="size-4" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 bg-surface rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por fuente, ID o institución..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="size-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0 font-medium">Estado:</span>
          <div className="flex items-center gap-1">
            {[
              { key: "ALL", label: "Todas" },
              { key: "EN_REVISION", label: "En revisión" },
              { key: "DEVUELTA", label: "Devueltas" },
              { key: "APROBADA", label: "Aprobadas" },
              { key: "PUBLICADA", label: "Publicadas" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setEstadoFilter(opt.key)}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  estadoFilter === opt.key
                    ? "bg-primary text-white shadow-xs"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de Revisión */}
      <div className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">ID</TableHead>
              <TableHead className="text-xs font-semibold">Fuente</TableHead>
              <TableHead className="text-xs font-semibold">Institución Proveedora</TableHead>
              <TableHead className="text-xs font-semibold">Versión</TableHead>
              <TableHead className="text-xs font-semibold">Campos</TableHead>
              <TableHead className="text-xs font-semibold">Estado</TableHead>
              <TableHead className="text-xs font-semibold">Recepción</TableHead>
              <TableHead className="text-xs font-semibold text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuentesFiltradas.length > 0 ? (
              fuentesFiltradas.map((fuente) => {
                const isPendiente = fuente.estado === "EN_REVISION";
                const totalCampos = fuente.campos.filter((c) => c.incluido).length;
                const camposClasificados = fuente.campos.filter(
                  (c) => c.incluido && (c.clasificacion === "Accesible" || c.clasificacion === "Confidencial")
                ).length;

                return (
                  <TableRow
                    key={fuente.id}
                    className={`hover:bg-muted/20 transition-colors ${
                      isPendiente ? "bg-warning/5" : ""
                    }`}
                  >
                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                      {fuente.id}
                    </TableCell>

                    <TableCell>
                      <Link
                        href={`/revision-fuentes/${fuente.id}`}
                        className="font-semibold text-xs text-foreground hover:text-primary transition-colors block"
                      >
                        {fuente.nombre}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        {fuente.modalidades_soportadas}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                        <Building2 className="size-3 text-muted-foreground" />
                        {fuente.institucion_proveedora_nombre}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {fuente.version_propuesta}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">
                          {totalCampos} campos
                        </span>
                        {camposClasificados === totalCampos ? (
                          <Badge tone="success" appearance="soft" size="sm">100%</Badge>
                        ) : (
                          <Badge tone="warning" appearance="soft" size="sm">
                            {camposClasificados}/{totalCampos}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getEstadoBadge(fuente.estado)}</TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(fuente.fecha_actualizacion)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Link href={`/revision-fuentes/${fuente.id}`}>
                        <Button
                          variant={isPendiente ? "primary" : "outline"}
                          size="sm"
                          className="gap-1 shadow-xs"
                        >
                          {isPendiente ? "Revisar" : "Ver detalle"}
                          <ArrowRight className="size-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                  No se encontraron fuentes para el criterio de búsqueda seleccionado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
