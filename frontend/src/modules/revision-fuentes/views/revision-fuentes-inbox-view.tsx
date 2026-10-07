"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { EstadoFuente } from "@/modules/fuentes/data/fuentes-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FolderCheck,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  ArrowRight,
  Building2,
  ShieldCheck,
  Layers,
  Activity,
  XCircle,
  Eye,
  X,
} from "lucide-react";

interface RevisionFuentesInboxViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function RevisionFuentesInboxView({ currentUser }: RevisionFuentesInboxViewProps) {
  const { fuentes, isLoaded } = useFuentesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [estadoSearch, setEstadoSearch] = useState("");

  const ESTADOS_REVISION_OPCIONES = [
    { value: "ALL", label: "Todos los estados" },
    { value: "EN_REVISION", label: "En revisión (Pendientes)" },
    { value: "DEVUELTA", label: "Devuelta con observaciones" },
    { value: "APROBADA", label: "Aprobada para publicación" },
    { value: "PUBLICADA", label: "Publicada en catálogo" },
  ];

  // Filtro de fuentes disponibles para Gestión
  const fuentesFiltradas = useMemo(() => {
    return fuentes.filter((f) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.nombre.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.institucion_proveedora_nombre.toLowerCase().includes(q) ||
        f.conexion.tipo_conector.toLowerCase().includes(q);

      const matchesEstado =
        estadoFilter === "ALL" ? true : f.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [fuentes, searchTerm, estadoFilter]);

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_REVISION_OPCIONES;
    return ESTADOS_REVISION_OPCIONES.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase())
    );
  }, [estadoSearch]);

  const hasActiveFilters = searchTerm.trim() !== "" || estadoFilter !== "ALL";

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setEstadoFilter("ALL");
    setEstadoSearch("");
    setCurrentPage(1);
  };

  // Paginación UI Kit
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter]);

  const totalPages = Math.ceil(fuentesFiltradas.length / pageSize) || 1;
  const paginatedFuentes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return fuentesFiltradas.slice(start, start + pageSize);
  }, [fuentesFiltradas, currentPage, pageSize]);

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
        return <Badge tone="neutral" size="sm">{estado}</Badge>;
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
    <WireframeDashboardLayout
      activeMenu="revision-fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Gestión", href: "/revision-fuentes" },
        { label: "Revisión de fuentes" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header del Módulo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <FolderCheck className="size-6" />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight text-primary">
                  Revisión y Clasificación de Fuentes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  Área de Gestión · Flujo BN-06 (FUE-04 — Clasificar campos y aprobar publicación)
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards de Resumen Interactivas (Estilo Cuentas Internas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* En Revisión */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "EN_REVISION" ? "ALL" : "EN_REVISION");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "EN_REVISION" ? "ALL" : "EN_REVISION");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "EN_REVISION"
                  ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                  : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "EN_REVISION"
                        ? "bg-warning text-white shadow-xs"
                        : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                    )}
                  >
                    <Clock className="size-5" />
                  </div>
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Pendientes
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Revisión
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.pendientes}
                  </p>
                </div>
              </div>
            </Card>

            {/* Devueltas con Observaciones */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "DEVUELTA" ? "ALL" : "DEVUELTA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "DEVUELTA" ? "ALL" : "DEVUELTA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "DEVUELTA"
                  ? "bg-danger/15 border-danger ring-2 ring-danger/40 shadow-xs"
                  : "bg-danger/5 hover:bg-danger/10 border-danger/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "DEVUELTA"
                        ? "bg-danger text-white shadow-xs"
                        : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                    )}
                  >
                    <AlertTriangle className="size-5" />
                  </div>
                  <Badge
                    tone="danger"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Observadas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Devueltas con Obs.
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.devueltas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Aprobadas */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "APROBADA" ? "ALL" : "APROBADA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "APROBADA" ? "ALL" : "APROBADA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "APROBADA"
                  ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                  : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "APROBADA"
                        ? "bg-success text-white shadow-xs"
                        : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                    )}
                  >
                    <CheckCircle2 className="size-5" />
                  </div>
                  <Badge
                    tone="success"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Listas p/ Publicar
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Aprobadas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.aprobadas}
                  </p>
                </div>
              </div>
            </Card>

            {/* En Catálogo */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "PUBLICADA" ? "ALL" : "PUBLICADA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "PUBLICADA" ? "ALL" : "PUBLICADA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PUBLICADA"
                  ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                  : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "PUBLICADA"
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                    )}
                  >
                    <Globe className="size-5" />
                  </div>
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Catálogo DINARP
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Catálogo
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.publicadas}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Búsqueda con UI Kit Oficial (Estilo Cuentas Internas) */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por ID, nombre de fuente, conector o institución proveedora..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="w-full"
                />
              </div>

              {/* Filtro Combobox UI Kit */}
              <div className="w-full xl:w-[260px] min-w-0 shrink-0">
                <Combobox
                  value={estadoFilter === "ALL" ? null : estadoFilter}
                  onValueChange={(val) => {
                    setEstadoFilter(val || "ALL");
                  }}
                  inputValue={estadoSearch}
                  onInputValueChange={(newSearch) => {
                    const opt = ESTADOS_REVISION_OPCIONES.find(
                      (e) =>
                        e.value.toLowerCase() === newSearch.toLowerCase() ||
                        e.label.toLowerCase() === newSearch.toLowerCase()
                    );
                    if (opt) setEstadoSearch(opt.label);
                    else if (newSearch === "ALL") setEstadoSearch("");
                    else setEstadoSearch(newSearch);
                  }}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Todos los estados"
                    showClear={estadoFilter !== "ALL"}
                    showTrigger={true}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[280px] z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                        {filteredEstadosForFilter.map((opt) => (
                          <ComboboxItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs py-1.5 cursor-pointer"
                          >
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                      {filteredEstadosForFilter.length === 0 && (
                        <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            {/* Badges / Píldoras de Filtros Activos (UI Kit) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground mr-1">
                  Filtros activos:
                </span>

                {searchTerm.trim() !== "" && (
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Búsqueda: &ldquo;{searchTerm}&rdquo;
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Búsqueda: &ldquo;{searchTerm}&rdquo;
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {estadoFilter !== "ALL" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Estado: {ESTADOS_REVISION_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {ESTADOS_REVISION_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setEstadoFilter("ALL")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Tabla de Revisión con encabezados blancos, sin contenedor y solo iconos en acciones */}
          <div className="w-full">
            <Table className="w-full" containerClassName="overflow-x-auto w-full">
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="text-xs font-bold text-white pl-6">ID</TableHead>
                  <TableHead className="text-xs font-bold text-white">Fuente</TableHead>
                  <TableHead className="text-xs font-bold text-white">Institución Proveedora</TableHead>
                  <TableHead className="text-xs font-bold text-white text-center">Versión</TableHead>
                  <TableHead className="text-xs font-bold text-white">Campos</TableHead>
                  <TableHead className="text-xs font-bold text-white">Prueba Técnica</TableHead>
                  <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                  <TableHead className="text-xs font-bold text-white">Recepción</TableHead>
                  <TableHead className="text-xs font-bold text-white text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFuentes.length > 0 ? (
                  paginatedFuentes.map((fuente) => {
                    const isPendiente = fuente.estado === "EN_REVISION";
                    const totalCampos = fuente.campos.filter((c) => c.incluido).length;
                    const camposClasificados = fuente.campos.filter(
                      (c) => c.incluido && (c.clasificacion === "Accesible" || c.clasificacion === "Confidencial")
                    ).length;

                    const pruebaResultado = fuente.conexion.ultima_prueba?.resultado;
                    const pruebaLatencia = fuente.conexion.ultima_prueba?.latencia_ms;

                    return (
                      <TableRow
                        key={fuente.id}
                        className={`hover:bg-muted/20 transition-colors ${
                          isPendiente ? "bg-warning/5" : ""
                        }`}
                      >
                        <TableCell className="font-mono text-xs font-medium text-muted-foreground pl-6">
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

                        <TableCell className="font-mono text-xs text-muted-foreground text-center">
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

                        <TableCell>
                          {pruebaResultado === "Satisfactoria" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                              <CheckCircle2 className="size-3.5" />
                              <span>OK ({pruebaLatencia} ms)</span>
                            </span>
                          ) : pruebaResultado === "Fallida" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-danger font-semibold">
                              <XCircle className="size-3.5" />
                              <span>Fallo</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Pendiente
                            </span>
                          )}
                        </TableCell>

                        <TableCell>{getEstadoBadge(fuente.estado)}</TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(fuente.fecha_actualizacion)}
                        </TableCell>

                        <TableCell className="text-right pr-6">
                          <TooltipProvider delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/revision-fuentes/${fuente.id}`}>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Revisar fuente ${fuente.nombre}`}
                                  >
                                    {isPendiente ? (
                                      <FolderCheck className="size-4 text-primary" />
                                    ) : (
                                      <Eye className="size-4" />
                                    )}
                                  </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {isPendiente ? "Revisar y clasificar fuente (FUE-04)" : "Ver detalle de fuente"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                      No se encontraron fuentes para el criterio de búsqueda seleccionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación UI Kit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 w-full mt-4">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {fuentesFiltradas.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, fuentesFiltradas.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{fuentesFiltradas.length}</span> fuentes para revisión
              </p>

              {/* Selector de filas por página: 5, 10, 15 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Filas:</span>
                <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                  {[5, 10, 15].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                        pageSize === size
                          ? "bg-surface text-primary shadow-2xs font-bold border border-border/80"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 sm:order-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      onClick={() => setCurrentPage(1)}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={() => setCurrentPage(totalPages)}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
