"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { WireframeDashboardLayout, MockUser } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cpu,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Building2,
  ExternalLink,
  Layers,
  ArrowRight,
  MoreHorizontal,
  Eye,
  X,
} from "lucide-react";
import { useHomologacionStore } from "../data/homologacion-store";
import { EstadoHomologacion, HomologacionCaso } from "@/modules/fuentes/data/fuentes-data";

interface HomologacionesInboxViewProps {
  currentUser?: MockUser;
}

export function HomologacionesInboxView({ currentUser }: HomologacionesInboxViewProps) {
  const { casos, isLoaded } = useHomologacionStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [estadoSearch, setEstadoSearch] = useState("");

  const ESTADOS_HOMOLOGACION_OPCIONES = [
    { value: "ALL", label: "Todos los estados" },
    { value: "Registrado", label: "Registrado" },
    { value: "En homologación", label: "En homologación" },
    { value: "Homologado", label: "Homologado" },
    { value: "No homologado", label: "No homologado" },
  ];

  const casosFiltrados = useMemo(() => {
    return casos.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.id_caso.toLowerCase().includes(q) ||
        c.fuente_nombre.toLowerCase().includes(q) ||
        c.institucion_nombre.toLowerCase().includes(q) ||
        c.tecnologia_solicitada.toLowerCase().includes(q) ||
        (c.responsable_ti && c.responsable_ti.toLowerCase().includes(q));

      const matchesEstado =
        estadoFilter === "ALL" ? true : c.estado === estadoFilter;

      return matchesSearch && matchesEstado;
    });
  }, [casos, searchTerm, estadoFilter]);

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_HOMOLOGACION_OPCIONES;
    return ESTADOS_HOMOLOGACION_OPCIONES.filter((e) =>
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

  const totalPages = Math.ceil(casosFiltrados.length / pageSize) || 1;
  const paginatedCasos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return casosFiltrados.slice(start, start + pageSize);
  }, [casosFiltrados, currentPage, pageSize]);

  const stats = useMemo(() => {
    return {
      total: casos.length,
      registrados: casos.filter((c) => c.estado === "Registrado").length,
      enHomologacion: casos.filter((c) => c.estado === "En homologación").length,
      homologados: casos.filter((c) => c.estado === "Homologado").length,
      noHomologados: casos.filter((c) => c.estado === "No homologado").length,
    };
  }, [casos]);

  const getEstadoBadge = (estado: EstadoHomologacion) => {
    switch (estado) {
      case "Registrado":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="font-semibold whitespace-nowrap">
            <Clock className="size-3 mr-1" />
            Registrado
          </Badge>
        );
      case "En homologación":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold whitespace-nowrap">
            <Cpu className="size-3 mr-1 animate-pulse" />
            En homologación
          </Badge>
        );
      case "Homologado":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold whitespace-nowrap">
            <CheckCircle2 className="size-3 mr-1" />
            Homologado
          </Badge>
        );
      case "No homologado":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold whitespace-nowrap">
            <XCircle className="size-3 mr-1" />
            No homologado
          </Badge>
        );
      case "Cerrado sin homologar":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold whitespace-nowrap">
            Cerrado
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="homologacion-fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Homologación técnica", href: "/homologacion-fuentes" },
        { label: "Bandeja de casos" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Cpu className="size-6 text-primary shrink-0" />
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Homologación técnica de fuentes
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Bandeja del Equipo de TI de DINARP para el diagnóstico, laboratorio y certificación de orígenes de datos no soportados y conector reutilizable.
              </p>
            </div>
          </div>

          {/* KPI Cards de Resumen Interactivas (Estilo Cuentas Internas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* Registrados */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "Registrado" ? "ALL" : "Registrado");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "Registrado" ? "ALL" : "Registrado");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Registrado"
                  ? "bg-info/15 border-info ring-2 ring-info/40 shadow-xs"
                  : "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "Registrado"
                        ? "bg-info text-white shadow-xs"
                        : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                    )}
                  >
                    <Layers className="size-5" />
                  </div>
                  <Badge
                    tone="info"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Nuevos Casos
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Registrados
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.registrados}
                  </p>
                </div>
              </div>
            </Card>

            {/* En homologación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "En homologación" ? "ALL" : "En homologación");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "En homologación" ? "ALL" : "En homologación");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "En homologación"
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
                      estadoFilter === "En homologación"
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
                    Laboratorio TI
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En homologación
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.enHomologacion}
                  </p>
                </div>
              </div>
            </Card>

            {/* Homologados */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "Homologado" ? "ALL" : "Homologado");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "Homologado" ? "ALL" : "Homologado");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Homologado"
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
                      estadoFilter === "Homologado"
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
                    Conector Certificado
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Homologados
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.homologados}
                  </p>
                </div>
              </div>
            </Card>

            {/* No homologados */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "No homologado" ? "ALL" : "No homologado");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "No homologado" ? "ALL" : "No homologado");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "No homologado"
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
                      estadoFilter === "No homologado"
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
                    Rechazados
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    No homologados
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.noHomologados}
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
                  placeholder="Buscar por caso, tecnología, fuente o institución..."
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
                    const opt = ESTADOS_HOMOLOGACION_OPCIONES.find(
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
                          Estado: {ESTADOS_HOMOLOGACION_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {ESTADOS_HOMOLOGACION_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
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

          {/* Tabla de Casos FUE-12 con encabezados blancos, sin contenedor y solo iconos en acciones */}
          <div className="w-full">
            <Table className="w-full" containerClassName="overflow-x-auto w-full">
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="w-[110px] text-xs font-bold text-white pl-6">ID Caso</TableHead>
                  <TableHead className="text-xs font-bold text-white">Tecnología Solicitada</TableHead>
                  <TableHead className="text-xs font-bold text-white">Institución Proveedora</TableHead>
                  <TableHead className="text-xs font-bold text-white">Fuente Asociada</TableHead>
                  <TableHead className="text-xs font-bold text-white">Diagnóstico Preliminar</TableHead>
                  <TableHead className="text-xs font-bold text-white">Responsable TI</TableHead>
                  <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                  <TableHead className="w-[100px] text-xs font-bold text-white">Fecha</TableHead>
                  <TableHead className="w-[90px] text-right text-xs font-bold text-white pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-xs text-muted-foreground">
                      Cargando casos de homologación técnica...
                    </TableCell>
                  </TableRow>
                ) : casosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center space-y-2">
                      <Cpu className="size-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-medium text-foreground">
                        No se encontraron casos de homologación técnica
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Ajusta los filtros o los términos de búsqueda.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCasos.map((caso) => (
                    <TableRow key={caso.id_caso} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-primary pl-6">
                        {caso.id_caso}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-foreground block">
                            {caso.tecnologia_solicitada}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {caso.protocolo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-medium">
                        {caso.institucion_nombre}
                      </TableCell>
                      <TableCell className="text-xs text-foreground font-medium">
                        {caso.fuente_nombre}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={caso.diagnostico}>
                        {caso.diagnostico}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {caso.responsable_ti || "Sin asignar"}
                      </TableCell>
                      <TableCell>{getEstadoBadge(caso.estado)}</TableCell>
                      <TableCell className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(caso.fecha_solicitud).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/homologacion-fuentes/${caso.id_caso}`}>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                  aria-label={`Revisar homologación de ${caso.fuente_nombre}`}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top">Revisar caso técnico (FUE-12)</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
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
                  {casosFiltrados.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, casosFiltrados.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{casosFiltrados.length}</span> casos técnicos
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
