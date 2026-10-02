"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  Eye,
  EyeOff,
  FolderArchive,
  Info,
  HelpCircle,
  ChevronDown,
  Building2,
  X,
  FileText,
  ExternalLink,
  MoreHorizontal,
  ArrowRight,
  Edit,
  ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDecorativeIcon } from "@/components/ui/card";
import { Search as SearchInput } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeTour, type TourStep } from "@/components/layout/wireframes/wireframe-tour";
import { INITIAL_INSTITUCIONES, MOCK_USERS_BY_ROLE, type FuenteEstado } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoGestionView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [institucionFilter, setInstitucionFilter] = useState<string>("ALL");

  // Estados del Onboarding Tour
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Comprobar si es la primera visita para abrir automáticamente el tour
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tourShown = localStorage.getItem("dinarp_gestion_tour_completed_v2");
      if (!tourShown) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleCloseTour = () => {
    setIsTourOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("dinarp_gestion_tour_completed_v2", "true");
    }
  };

  const handleStartTour = () => {
    setTourStep(0);
    setIsTourOpen(true);
  };

  // Pasos del recorrido guiado para Gestión del Catálogo
  const tourSteps: TourStep[] = useMemo(() => [
    {
      id: "step-resumen",
      target: '[data-tour="tour-resumen"]',
      title: "Resumen del catálogo",
      description: "Consulta el estado general de las fuentes administradas por DINARP.",
      placement: "bottom"
    },
    {
      id: "step-filtros",
      target: '[data-tour="tour-filtros"]',
      title: "Buscar y filtrar",
      description: "Encuentra una fuente por nombre, código, institución o estado.",
      placement: "bottom"
    },
    {
      id: "step-estado",
      target: '[data-tour="tour-estado"]',
      title: "Revisar el estado",
      description: "Identifica rápidamente si una fuente está publicada, oculta o desactivada.",
      placement: "bottom"
    },
    {
      id: "step-detalle",
      target: '[data-tour="tour-ver-detalle"]',
      title: "Ver detalle",
      description: "Consulta campos, clasificación, integración, novedades e historial.",
      placement: "bottom"
    },
    {
      id: "step-procesos",
      target: '[data-tour="tour-acciones-menu"]',
      title: "Procesos relacionados",
      description: "Desde una fuente puedes consultar su integración o iniciar una novedad cuando corresponda.",
      placement: "bottom"
    }
  ], []);

  // Aplanar todas las fuentes para el inventario administrativo de DINARP
  const allFuentes = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap(inst =>
      inst.fuentes.map(f => ({
        ...f,
        institucionSigla: inst.sigla,
        institucionNombreCompleto: inst.nombre,
        institucionSector: inst.sector
      }))
    );
  }, []);

  const stats = useMemo(() => {
    const total = allFuentes.length;
    const publicadas = allFuentes.filter(f => f.estado === "PUBLICADO").length;
    const ocultas = allFuentes.filter(f => f.estado === "OCULTO").length;
    const desactivadas = allFuentes.filter(f => f.estado === "DESACTIVADO").length;
    return { total, publicadas, ocultas, desactivadas };
  }, [allFuentes]);

  const fuentesFiltradas = useMemo(() => {
    return allFuentes.filter(f => {
      const matchSearch =
        searchTerm === "" ||
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.codigoServicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.institucionNombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.institucionSigla.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado = estadoFilter === "ALL" || f.estado === estadoFilter;
      const matchInst = institucionFilter === "ALL" || f.institucionId === institucionFilter;

      return matchSearch && matchEstado && matchInst;
    });
  }, [allFuentes, searchTerm, estadoFilter, institucionFilter]);

  const hasActiveFilters = searchTerm !== "" || estadoFilter !== "ALL" || institucionFilter !== "ALL";

  const getEstadoBadge = (estado: FuenteEstado) => {
    switch (estado) {
      case "PUBLICADO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 font-medium">
            <Eye className="size-3 text-muted-foreground" />
            PUBLICADO
          </Badge>
        );
      case "OCULTO":
        return (
          <Badge tone="neutral" appearance="outline" size="sm" className="gap-1 font-medium border-dashed text-muted-foreground">
            <EyeOff className="size-3 text-muted-foreground" />
            OCULTO
          </Badge>
        );
      case "DESACTIVADO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 font-medium bg-muted/40 text-muted-foreground/80">
            <FolderArchive className="size-3 text-muted-foreground" />
            DESACTIVADO
          </Badge>
        );
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <WireframeDashboardLayout
        activeMenu="gestion-catalogo"
        currentRole="DGR"
        currentUser={MOCK_USERS_BY_ROLE.DGR}
        breadcrumbs={[
          { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
          { label: "Gestión" }
        ]}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

          {/* Encabezado y Acciones Principales */}
          <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Gestión del Catálogo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Administra y consulta las fuentes que forman parte del Catálogo de Interoperabilidad.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartTour}
                  className="text-xs gap-1.5 border-border shadow-2xs hover:bg-muted"
                >
                  <HelpCircle className="size-3.5" />
                  <span>Ver recorrido</span>
                </Button>
              </div>
            </div>

            {/* Featured Cards para las 4 Métricas de Resumen */}
            <div data-tour="tour-resumen" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Total de fuentes */}
              <Card
                variant="featured"
                className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
                innerClassName="p-5 items-start text-left gap-1"
              >
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
                  {stats.total}
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  Total de fuentes
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Cantidad total registrada dentro del catálogo.
                </span>
                <CardDecorativeIcon>
                  <Database className="size-24 text-muted-foreground" />
                </CardDecorativeIcon>
              </Card>

              {/* 2. Publicadas */}
              <Card
                variant="featured"
                className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
                innerClassName="p-5 items-start text-left gap-1"
              >
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
                  {stats.publicadas}
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  Publicadas
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Fuentes disponibles para consulta.
                </span>
                <CardDecorativeIcon>
                  <Eye className="size-24 text-muted-foreground" />
                </CardDecorativeIcon>
              </Card>

              {/* 3. Ocultas */}
              <Card
                variant="featured"
                className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
                innerClassName="p-5 items-start text-left gap-1"
              >
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
                  {stats.ocultas}
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  Ocultas
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Fuentes existentes internamente, pero todavía no disponibles para consumidores.
                </span>
                <CardDecorativeIcon>
                  <EyeOff className="size-24 text-muted-foreground" />
                </CardDecorativeIcon>
              </Card>

              {/* 4. Desactivadas */}
              <Card
                variant="featured"
                className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
                innerClassName="p-5 items-start text-left gap-1"
              >
                <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
                  {stats.desactivadas}
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  Desactivadas
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Fuentes que ya no están disponibles para nuevas solicitudes, pero conservan su información e historial.
                </span>
                <CardDecorativeIcon>
                  <FolderArchive className="size-24 text-muted-foreground" />
                </CardDecorativeIcon>
              </Card>
            </div>
          </div>

          {/* Bloque de Inventario: Filtros y Tabla */}
          <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
            {/* Barra de Filtros */}
            <div data-tour="tour-filtros" className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                {/* Búsqueda general */}
                <div className="sm:col-span-12 lg:col-span-6 flex flex-col gap-1.5">
                  <label htmlFor="search-fuentes" className="text-xs font-medium text-muted-foreground">
                    Búsqueda general
                  </label>
                  <SearchInput
                    id="search-fuentes"
                    placeholder="Buscar por fuente, código o institución..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                    className="w-full bg-background"
                  />
                </div>

                {/* Filtro por Estado */}
                <div className="sm:col-span-6 lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Estado
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          {estadoFilter === "ALL" && "Todos los estados"}
                          {estadoFilter === "PUBLICADO" && (
                            <>
                              <Eye className="size-3.5 text-muted-foreground" />
                              PUBLICADO
                            </>
                          )}
                          {estadoFilter === "OCULTO" && (
                            <>
                              <EyeOff className="size-3.5 text-muted-foreground" />
                              OCULTO
                            </>
                          )}
                          {estadoFilter === "DESACTIVADO" && (
                            <>
                              <FolderArchive className="size-3.5 text-muted-foreground" />
                              DESACTIVADO
                            </>
                          )}
                        </span>
                        <ChevronDown className="size-4 opacity-60 ml-2 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuLabel className="text-xs">Estado en el catálogo</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={estadoFilter}
                        onValueChange={setEstadoFilter}
                      >
                        <DropdownMenuRadioItem value="ALL" className="text-xs">
                          Todos los estados
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="PUBLICADO" className="text-xs">
                          <Eye className="size-3.5 mr-1.5 text-muted-foreground" />
                          PUBLICADO
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="OCULTO" className="text-xs">
                          <EyeOff className="size-3.5 mr-1.5 text-muted-foreground" />
                          OCULTO
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="DESACTIVADO" className="text-xs">
                          <FolderArchive className="size-3.5 mr-1.5 text-muted-foreground" />
                          DESACTIVADO
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Filtro por Institución */}
                <div className="sm:col-span-6 lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Institución
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          {institucionFilter === "ALL"
                            ? "Todas las instituciones"
                            : INITIAL_INSTITUCIONES.find(i => i.id === institucionFilter)?.sigla || institucionFilter}
                        </span>
                        <ChevronDown className="size-4 opacity-60 ml-2 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 max-h-72 overflow-y-auto">
                      <DropdownMenuLabel className="text-xs">Institución proveedora</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={institucionFilter}
                        onValueChange={setInstitucionFilter}
                      >
                        <DropdownMenuRadioItem value="ALL" className="text-xs">
                          Todas las instituciones
                        </DropdownMenuRadioItem>
                        {INITIAL_INSTITUCIONES.map(inst => (
                          <DropdownMenuRadioItem key={inst.id} value={inst.id} className="text-xs">
                            <span className="font-medium mr-1.5">{inst.sigla}</span>
                            <span className="text-muted-foreground truncate">{inst.nombre}</span>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Fila de Filtros Activos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                  <span className="text-xs text-muted-foreground font-medium mr-1">Filtros aplicados:</span>

                  {searchTerm && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                    >
                      <span className="flex items-center gap-1">
                        <Search className="size-3 text-muted-foreground" />
                        Texto: <strong className="font-semibold text-foreground">"{searchTerm}"</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Eliminar filtro de búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {estadoFilter !== "ALL" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                    >
                      <span className="flex items-center gap-1">
                        Estado: <strong className="font-semibold text-foreground">{estadoFilter}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setEstadoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Eliminar filtro de estado"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {institucionFilter !== "ALL" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                    >
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3 text-muted-foreground" />
                        Institución: <strong className="font-semibold text-foreground">{INITIAL_INSTITUCIONES.find(i => i.id === institucionFilter)?.sigla || institucionFilter}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setInstitucionFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        aria-label="Eliminar filtro de institución"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setEstadoFilter("ALL");
                      setInstitucionFilter("ALL");
                    }}
                    className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  >
                    Limpiar todos
                  </Button>
                </div>
              )}
            </div>

            {/* Encabezado de Resultados y Conteo */}
            <div className="flex items-center justify-between border-t border-border/60 pt-4">
              <span className="text-xs text-muted-foreground">
                Mostrando <strong className="text-foreground font-semibold">{fuentesFiltradas.length}</strong> de{" "}
                <strong className="text-foreground font-semibold">{allFuentes.length}</strong> fuentes registradas
              </span>
            </div>

            {/* Tabla Principal Simplificada y Escaneable */}
            <div className="overflow-x-auto border-y border-border bg-card mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[220px]">Fuente</TableHead>
                    <TableHead className="min-w-[180px]">Institución</TableHead>
                    <TableHead className="min-w-[140px]" data-tour="tour-estado">
                      <div className="flex items-center gap-1.5">
                        <span>Estado</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex cursor-help focus:outline-hidden">
                              <Info className="size-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" sideOffset={6} className="w-72 p-3 text-left space-y-2.5">
                            <p className="font-semibold text-xs text-foreground">Estados en el Catálogo</p>
                            <div className="space-y-2 text-xs">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                  <Eye className="size-3 text-muted-foreground" />
                                  <span>PUBLICADO</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed pl-4.5">
                                  Fuente disponible para consulta dentro del catálogo.
                                </p>
                              </div>

                              <div className="border-t border-border/60" />

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                  <EyeOff className="size-3 text-muted-foreground" />
                                  <span>OCULTO</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed pl-4.5">
                                  Fuente registrada internamente pero no visible para consumidores.
                                </p>
                              </div>

                              <div className="border-t border-border/60" />

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-medium text-foreground">
                                  <FolderArchive className="size-3 text-muted-foreground" />
                                  <span>DESACTIVADO</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed pl-4.5">
                                  Fuente no disponible para nuevas solicitudes. Su historial se conserva.
                                </p>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="text-center min-w-[80px]">Campos</TableHead>
                    <TableHead className="min-w-[140px]">Última actualización</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuentesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                        No se encontraron fuentes bajo los criterios de búsqueda o filtros seleccionados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fuentesFiltradas.map((fuente, idx) => (
                      <TableRow key={fuente.id}>
                        {/* Fuente: Nombre y Código */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5 whitespace-normal">
                            <span className="font-semibold text-foreground text-sm leading-snug">
                              {fuente.nombre}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                              {fuente.codigoServicio}
                            </span>
                          </div>
                        </TableCell>

                        {/* Institución */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5 whitespace-normal">
                            <span className="font-medium text-foreground text-xs line-clamp-1">
                              {fuente.institucionSigla}
                            </span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {fuente.institucionNombreCompleto}
                            </span>
                          </div>
                        </TableCell>

                        {/* Estado */}
                        <TableCell>
                          {getEstadoBadge(fuente.estado)}
                        </TableCell>

                        {/* Cantidad de Campos */}
                        <TableCell className="text-center font-mono font-medium text-muted-foreground">
                          {fuente.campos?.length || 0}
                        </TableCell>

                        {/* Última Actualización */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fuente.ultimaActualizacion}
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                    <Link href={`/catalogo-interoperabilidad/gestion/fuente/${fuente.id}`}>
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Ver detalle</p>
                                </TooltipContent>
                              </Tooltip>

                              {(MOCK_USERS_BY_ROLE.DGR.role === "COORDINADOR_SINARP" || MOCK_USERS_BY_ROLE.DGR.role === "DTD") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <Edit className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Editar metadatos</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {MOCK_USERS_BY_ROLE.DGR.role === "DPI" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <ShieldAlert className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Revisar clasificación</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </div>

        </div>

        {/* Componente del Recorrido Guiado (Onboarding Tour) */}
        <WireframeTour
          isOpen={isTourOpen}
          onClose={handleCloseTour}
          steps={tourSteps}
          currentStep={tourStep}
          onStepChange={setTourStep}
        />
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
