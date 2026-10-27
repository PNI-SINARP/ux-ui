"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Building2,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Layers,
  Scale,
  Clock,
  Info,
  Eye,
  EyeOff,
  Send,
  X,
  Search as SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
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
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { cn } from "@/lib/utils";
import { INITIAL_INSTITUCIONES, MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoConsultaView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitucion, setSelectedInstitucion] = useState<string>("ALL");
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>("ALL");
  const [clasificacionSearch, setClasificacionSearch] = useState("");

  // Paginación UI Kit
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(2);

  const institucionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las Instituciones" },
    ...INITIAL_INSTITUCIONES.map((inst) => ({
      value: inst.id,
      label: `${inst.sigla} — ${inst.nombre}`
    }))
  ], []);

  const clasificacionOptions = useMemo(() => [
    { value: "ALL", label: "Todos los requisitos de acceso" },
    { value: "Accesible", label: "Accesibles (solo finalidad de uso)" },
    { value: "Confidencial", label: "Confidenciales (finalidad y justificación jurídica)" },
  ], []);

  const filteredInstitucionOptions = useMemo(() => {
    if (!institucionSearch.trim()) return institucionOptions;
    return institucionOptions.filter((opt) =>
      opt.label.toLowerCase().includes(institucionSearch.toLowerCase())
    );
  }, [institucionOptions, institucionSearch]);

  const filteredClasificacionOptions = useMemo(() => {
    if (!clasificacionSearch.trim()) return clasificacionOptions;
    return clasificacionOptions.filter((opt) =>
      opt.label.toLowerCase().includes(clasificacionSearch.toLowerCase())
    );
  }, [clasificacionOptions, clasificacionSearch]);

  const handleSelectInstitucion = (val: string | null) => {
    const newVal = val || "ALL";
    setSelectedInstitucion(newVal);
    if (newVal === "ALL") {
      setInstitucionSearch("");
    } else {
      const opt = institucionOptions.find((o) => o.value === newVal);
      if (opt) setInstitucionSearch(opt.label);
    }
    setCurrentPage(1);
  };

  const handleSelectClasificacion = (val: string | null) => {
    const newVal = val || "ALL";
    setSelectedClasificacion(newVal);
    if (newVal === "ALL") {
      setClasificacionSearch("");
    } else {
      const opt = clasificacionOptions.find((o) => o.value === newVal);
      if (opt) setClasificacionSearch(opt.label);
    }
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedInstitucion("ALL");
    setInstitucionSearch("");
    setSelectedClasificacion("ALL");
    setClasificacionSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || selectedInstitucion !== "ALL" || selectedClasificacion !== "ALL";

  const [expandedInstituciones, setExpandedInstituciones] = useState<Record<string, boolean>>({
    "INST-001": true,
    "INST-002": true,
    "INST-003": true
  });
  const [expandedFuentes, setExpandedFuentes] = useState<Record<string, boolean>>({
    "FNT-001": true
  });

  const toggleInstitucion = (id: string) => {
    setExpandedInstituciones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFuente = (id: string) => {
    setExpandedFuentes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrar estrictamente solo fuentes en estado PUBLICADO
  const institucionesFiltradas = useMemo(() => {
    return INITIAL_INSTITUCIONES.map((inst) => {
      const fuentesPublicadas = inst.fuentes.filter((f) => f.estado === "PUBLICADO");

      const fuentesFiltradas = fuentesPublicadas.filter((f) => {
        const matchSearch =
          searchTerm === "" ||
          f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.campos.some(
            (c) =>
              c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchClasificacion =
          selectedClasificacion === "ALL" ||
          f.campos.some((c) => c.clasificacion === selectedClasificacion);

        return matchSearch && matchClasificacion;
      });

      return {
        ...inst,
        fuentes: fuentesFiltradas
      };
    }).filter((inst) => {
      const matchInst = selectedInstitucion === "ALL" || inst.id === selectedInstitucion;
      return matchInst && inst.fuentes.length > 0;
    });
  }, [searchTerm, selectedInstitucion, selectedClasificacion]);

  // Cálculos de Paginación UI Kit
  const totalPages = Math.max(1, Math.ceil(institucionesFiltradas.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedInstituciones = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return institucionesFiltradas.slice(start, start + pageSize);
  }, [institucionesFiltradas, safeCurrentPage, pageSize]);

  const totalFuentesPublicadas = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap((i) => i.fuentes).filter((f) => f.estado === "PUBLICADO").length;
  }, []);

  const totalCampos = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .reduce((acc, f) => acc + f.campos.length, 0);
  }, []);

  const totalCamposAccesibles = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .flatMap((f) => f.campos)
      .filter((c) => c.clasificacion === "Accesible").length;
  }, []);

  const totalCamposConfidenciales = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .flatMap((f) => f.campos)
      .filter((c) => c.clasificacion === "Confidencial").length;
  }, []);

  return (
    <TooltipProvider delayDuration={150}>
      <WireframeDashboardLayout
        activeMenu="catalogo-interoperabilidad"
        currentUser={MOCK_USERS_BY_ROLE.COORDINADOR_SINARP}
      >
        <main className="w-full flex-1 min-h-0 flex flex-col p-2 sm:p-4 lg:p-5 overflow-hidden">
          {/* Contenedor Principal Ancho Completo */}
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 w-full"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col items-stretch gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* Encabezado Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="space-y-1 min-w-0 flex-1">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Catálogo de Fuentes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Consulta las fuentes de datos disponibles para interoperar entre instituciones públicas y conoce qué requisitos necesitas para solicitar cada dato.
                </p>
              </div>
            </div>

            {/* Cards de Resumen: 1 Solo Color para Accesibles (Verde/Success) y 1 Solo Color para Confidenciales (Ámbar/Warning) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* Fuentes Publicadas (Color Primario Institucional) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedInstitucion("ALL");
                      setSelectedClasificacion("ALL");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedInstitucion("ALL");
                        setSelectedClasificacion("ALL");
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      selectedClasificacion === "ALL" && selectedInstitucion === "ALL"
                        ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                        : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full w-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            selectedClasificacion === "ALL" && selectedInstitucion === "ALL"
                              ? "bg-primary text-white shadow-xs"
                              : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                          )}
                        >
                          <Database className="size-5" />
                        </div>
                        <Badge
                          tone="primary"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          Disponibles
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Fuentes Publicadas
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {totalFuentesPublicadas}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Servicios listos para consultar
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  Total de fuentes de información activas en el catálogo oficial.
                </TooltipContent>
              </Tooltip>

              {/* Datos Consultables (Color Neutral) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedClasificacion("ALL");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedClasificacion("ALL");
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      selectedClasificacion === "ALL"
                        ? "bg-muted/60 border-border ring-2 ring-foreground/20 shadow-xs"
                        : "bg-muted/20 hover:bg-muted/40 border-border/60 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full w-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            selectedClasificacion === "ALL"
                              ? "bg-foreground text-background shadow-xs"
                              : "bg-muted text-foreground group-hover:scale-105 group-hover:bg-foreground group-hover:text-background"
                          )}
                        >
                          <Layers className="size-5" />
                        </div>
                        <Badge
                          tone="neutral"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          Total
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Datos Consultables
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {totalCampos}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Campos de datos disponibles
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  Total de campos o atributos individuales que se pueden solicitar.
                </TooltipContent>
              </Tooltip>

              {/* Accesibles: 1 SOLO COLOR UNIFICADO (success / verde) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedClasificacion(selectedClasificacion === "Accesible" ? "ALL" : "Accesible");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedClasificacion(selectedClasificacion === "Accesible" ? "ALL" : "Accesible");
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      selectedClasificacion === "Accesible"
                        ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                        : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full w-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            selectedClasificacion === "Accesible"
                              ? "bg-success text-white shadow-xs"
                              : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                          )}
                        >
                          <Unlock className="size-5" />
                        </div>
                        <Badge
                          tone="success"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          Solo Finalidad
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Datos Accesibles
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {totalCamposAccesibles}
                        </p>
                        <p className="text-[11px] text-success font-medium">
                          Solo requieren finalidad de uso
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  Datos de libre consulta: para solicitarlos solo necesitas registrar la finalidad de uso.
                </TooltipContent>
              </Tooltip>

              {/* Confidenciales: 1 SOLO COLOR UNIFICADO (warning / ámbar) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedClasificacion(selectedClasificacion === "Confidencial" ? "ALL" : "Confidencial");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedClasificacion(selectedClasificacion === "Confidencial" ? "ALL" : "Confidencial");
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      selectedClasificacion === "Confidencial"
                        ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                        : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full w-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            selectedClasificacion === "Confidencial"
                              ? "bg-warning text-white shadow-xs"
                              : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                          )}
                        >
                          <Lock className="size-5" />
                        </div>
                        <Badge
                          tone="warning"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          Finalidad + Jurídica
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Datos Confidenciales
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {totalCamposConfidenciales}
                        </p>
                        <p className="text-[11px] text-warning font-medium">
                          Requieren finalidad y base jurídica
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  Datos protegidos: para solicitarlos debes registrar la finalidad de uso y adjuntar justificación jurídica.
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Barra de Filtros y Búsqueda (Suelto, sin Card contenedora) */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col md:flex-row gap-3 w-full items-stretch md:items-center">
                <div className="flex-1 min-w-0">
                  <Search
                    size="sm"
                    placeholder="Buscar por institución, fuente o dato..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    onClear={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                  {/* Combobox Instituciones */}
                  <div className="w-full sm:w-[260px] min-w-0">
                    <Combobox
                      value={selectedInstitucion === "ALL" ? null : selectedInstitucion}
                      onValueChange={handleSelectInstitucion}
                      inputValue={institucionSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = institucionOptions.find(
                          (o) =>
                            o.value.toLowerCase() === newSearch.toLowerCase() ||
                            o.label.toLowerCase() === newSearch.toLowerCase()
                        );
                        if (opt) setInstitucionSearch(opt.label);
                        else if (newSearch === "ALL") setInstitucionSearch("");
                        else setInstitucionSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todas las instituciones"
                        showClear={selectedInstitucion !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[280px] max-w-[340px] z-[80]">
                        <ComboboxList>
                          <ComboboxGroup>
                            <ComboboxLabel>Instituciones</ComboboxLabel>
                            {filteredInstitucionOptions.map((opt) => (
                              <ComboboxItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs py-1.5 cursor-pointer"
                              >
                                {opt.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                          {filteredInstitucionOptions.length === 0 && (
                            <ComboboxEmpty>No se encontraron instituciones.</ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {/* Combobox Clasificación / Requisitos */}
                  <div className="w-full sm:w-[280px] min-w-0">
                    <Combobox
                      value={selectedClasificacion === "ALL" ? null : selectedClasificacion}
                      onValueChange={handleSelectClasificacion}
                      inputValue={clasificacionSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = clasificacionOptions.find(
                          (o) =>
                            o.value.toLowerCase() === newSearch.toLowerCase() ||
                            o.label.toLowerCase() === newSearch.toLowerCase()
                        );
                        if (opt) setClasificacionSearch(opt.label);
                        else if (newSearch === "ALL") setClasificacionSearch("");
                        else setClasificacionSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todos los requisitos"
                        showClear={selectedClasificacion !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[280px] z-[80]">
                        <ComboboxList>
                          <ComboboxGroup>
                            <ComboboxLabel>Requisitos de acceso</ComboboxLabel>
                            {filteredClasificacionOptions.map((opt) => (
                              <ComboboxItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs py-1.5 cursor-pointer"
                              >
                                {opt.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                          {filteredClasificacionOptions.length === 0 && (
                            <ComboboxEmpty>No se encontraron opciones.</ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAllFilters}
                      className="text-xs text-muted-foreground hover:text-foreground shrink-0 h-9 px-2.5"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Píldoras de Filtros Activos (UI Kit) */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">Filtros aplicados:</span>
                  {searchTerm && (
                    <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-[11px]">
                      <span>Búsqueda: &quot;{searchTerm}&quot;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setCurrentPage(1);
                        }}
                        className="hover:opacity-75 focus:outline-none"
                        aria-label="Quitar filtro de búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedInstitucion !== "ALL" && (
                    <Badge tone="primary" appearance="soft" size="sm" className="gap-1 text-[11px]">
                      <span>
                        {institucionOptions.find((o) => o.value === selectedInstitucion)?.label || selectedInstitucion}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectInstitucion("ALL")}
                        className="hover:opacity-75 focus:outline-none"
                        aria-label="Quitar filtro de institución"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedClasificacion !== "ALL" && (
                    <Badge
                      tone={selectedClasificacion === "Accesible" ? "success" : "warning"}
                      appearance="soft"
                      size="sm"
                      className="gap-1 text-[11px]"
                    >
                      <span>
                        {clasificacionOptions.find((o) => o.value === selectedClasificacion)?.label || selectedClasificacion}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectClasificacion("ALL")}
                        className="hover:opacity-75 focus:outline-none"
                        aria-label="Quitar filtro de requisito"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-xs text-primary p-1 h-auto hover:bg-transparent hover:underline"
                  >
                    Restablecer todo
                  </Button>
                </div>
              )}
            </div>

            {/* Listado de Fuentes por Institución */}
            <div className="flex flex-col gap-6 w-full">
              {institucionesFiltradas.length === 0 ? (
                <Card className="border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-3 bg-muted/20 w-full">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <SearchIcon className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">No se encontraron fuentes</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No existen fuentes o datos que coincidan con los filtros seleccionados.
                  </p>
                </Card>
              ) : (
                paginatedInstituciones.map((institucion) => {
                  const isInstExpanded = expandedInstituciones[institucion.id] ?? true;

                  return (
                    <div
                      key={institucion.id}
                      className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs w-full"
                    >
                      {/* Encabezado Institución (Estilo registro-institución) */}
                      <div
                        onClick={() => toggleInstitucion(institucion.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleInstitucion(institucion.id);
                          }
                        }}
                        className="bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none w-full"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                            <Building2 className="size-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="font-heading text-base sm:text-lg font-bold text-primary leading-snug">
                                {institucion.nombre}
                              </h2>
                              <Badge
                                tone="primary"
                                appearance="solid"
                                size="sm"
                                className="font-bold text-[10px] tracking-wider !text-white rounded-full px-2.5 py-0.5 shadow-2xs"
                              >
                                {institucion.sigla}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span>{institucion.sector}</span>
                              <span className="text-muted-foreground/40">•</span>
                              <span className="font-mono text-[11px]">RUC: {institucion.codigoInstitucion}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <Badge tone="primary" appearance="soft" size="sm" className="font-semibold px-2.5 py-0.5">
                            {institucion.fuentes.length} {institucion.fuentes.length === 1 ? "fuente disponible" : "fuentes disponibles"}
                          </Badge>
                          <div className="size-8 rounded-lg bg-surface/80 border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground">
                            {isInstExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Lista de Fuentes de la Institución */}
                      {isInstExpanded && (
                        <div className="p-4 sm:p-6 flex flex-col gap-6 bg-card w-full">
                          {institucion.fuentes.map((fuente) => {
                            const isFuenteExpanded = expandedFuentes[fuente.id] ?? false;
                            const camposAccesibles = fuente.campos.filter((c) => c.clasificacion === "Accesible").length;
                            const camposConfidenciales = fuente.campos.filter((c) => c.clasificacion === "Confidencial").length;

                            return (
                              <div
                                key={fuente.id}
                                className="border border-border rounded-xl bg-surface overflow-hidden shadow-2xs transition-all hover:border-primary/40 w-full"
                              >
                                {/* Encabezado de la Fuente */}
                                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border bg-muted/10 w-full">
                                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                      <h3 className="font-heading text-base font-bold text-foreground">
                                        {fuente.nombre}
                                      </h3>
                                      <span className="text-xs text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded">
                                        {fuente.codigoServicio}
                                      </span>
                                    </div>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {fuente.descripcion}
                                    </p>

                                    <div className="text-[11px] text-muted-foreground flex items-center gap-3 pt-0.5 flex-wrap">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="flex items-center gap-1 cursor-help hover:text-foreground">
                                            <Scale className="size-3 text-primary" />
                                            <span>Base Legal: {fuente.baseLegal}</span>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs max-w-sm">
                                          Marco legal que ampara el intercambio de información
                                        </TooltipContent>
                                      </Tooltip>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="size-3 text-muted-foreground" />
                                        <span>Actualizado: {fuente.ultimaActualizacion}</span>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                                    {/* Badges con Colores Unificados: Verde (Success) para Accesibles y Ámbar (Warning) para Confidenciales */}
                                    <div className="flex items-center gap-2.5 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 text-xs">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            tabIndex={0}
                                            aria-label={`${camposAccesibles} accesibles: Requieren únicamente finalidad de uso`}
                                            className="cursor-help inline-flex items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group/acc"
                                          >
                                            <Badge tone="success" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                              <Unlock className="size-3" />
                                              <span>{camposAccesibles} ACCESIBLES</span>
                                            </Badge>
                                            <Info className="size-3.5 text-muted-foreground group-hover/acc:text-success transition-colors shrink-0" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                          Requieren únicamente finalidad de uso
                                        </TooltipContent>
                                      </Tooltip>

                                      <span className="text-muted-foreground/40">•</span>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            tabIndex={0}
                                            aria-label={`${camposConfidenciales} confidenciales: Requieren finalidad de uso y justificación jurídica`}
                                            className="cursor-help inline-flex items-center gap-1 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group/conf"
                                          >
                                            <Badge tone="warning" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                              <Lock className="size-3" />
                                              <span>{camposConfidenciales} CONFIDENCIALES</span>
                                            </Badge>
                                            <Info className="size-3.5 text-muted-foreground group-hover/conf:text-warning transition-colors shrink-0" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                          Requieren finalidad de uso y justificación jurídica
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>

                                    {/* Botón Solo Icono para Ver/Ocultar Datos con Tooltip Encima */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => toggleFuente(fuente.id)}
                                          className="size-9 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                                          aria-label={isFuenteExpanded ? "Ocultar datos" : "Ver datos"}
                                        >
                                          {isFuenteExpanded ? (
                                            <EyeOff className="size-4" />
                                          ) : (
                                            <Eye className="size-4 text-primary" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        {isFuenteExpanded ? "Ocultar datos" : "Ver datos disponibles"}
                                      </TooltipContent>
                                    </Tooltip>
                                    {/* Botón Solicitar acceso a la fuente */}
                                    <Button
                                      size="sm"
                                      asChild
                                      className="gap-1.5 shrink-0 text-xs shadow-xs"
                                    >
                                      <Link href={`/acceso-interoperabilidad/solicitudes/nueva?fuente=${fuente.id}`}>
                                        <Send className="size-3.5" />
                                        <span>Solicitar acceso</span>
                                      </Link>
                                    </Button>
                                  </div>
                                </div>

                                {/* Tabla de Datos y Requisitos de Acceso */}
                                {isFuenteExpanded && (
                                  <div className="p-4 sm:p-5 flex flex-col gap-4 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                          Datos disponibles en esta fuente ({fuente.campos.length})
                                        </h4>
                                      </div>
                                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                        <Info className="size-3.5 text-primary" />
                                        <span>Cada dato indica qué necesitas presentar al momento de solicitarlo</span>
                                      </div>
                                    </div>

                                    <div className="border border-border rounded-xl overflow-x-auto bg-card w-full">
                                      <table className="w-full text-left text-xs min-w-full">
                                        <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                                          <tr>
                                            <th className="py-2.5 px-4 w-[28%]">Nombre del Dato</th>
                                            <th className="py-2.5 px-4 w-[50%]">Qué Información Contiene</th>
                                            <th className="py-2.5 px-4 w-[22%]">Requisito para Solicitar</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {fuente.campos.map((campo) => {
                                            const esAccesible = campo.clasificacion === "Accesible";

                                            return (
                                              <tr key={campo.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="py-3 px-4 font-medium text-foreground">
                                                  <span className="block font-mono text-xs">{campo.nombre}</span>
                                                </td>
                                                <td className="py-3 px-4 text-muted-foreground leading-relaxed">
                                                  {campo.descripcion}
                                                </td>
                                                <td className="py-3 px-4">
                                                  {esAccesible ? (
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <span
                                                          tabIndex={0}
                                                          aria-label="Accesible: Requiere solo finalidad de uso"
                                                          className="inline-flex items-center gap-1.5 cursor-help rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group/req"
                                                        >
                                                          <Badge tone="success" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                                            <Unlock className="size-3" />
                                                            ACCESIBLE
                                                          </Badge>
                                                          <Info className="size-3.5 text-muted-foreground group-hover/req:text-success transition-colors shrink-0" />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent side="top" className="text-xs">
                                                        Requiere: Solo finalidad de uso
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  ) : (
                                                    <Tooltip>
                                                      <TooltipTrigger asChild>
                                                        <span
                                                          tabIndex={0}
                                                          aria-label="Confidencial: Requiere finalidad y justificación jurídica"
                                                          className="inline-flex items-center gap-1.5 cursor-help rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group/req"
                                                        >
                                                          <Badge tone="warning" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                                            <Lock className="size-3" />
                                                            CONFIDENCIAL
                                                          </Badge>
                                                          <Info className="size-3.5 text-muted-foreground group-hover/req:text-warning transition-colors shrink-0" />
                                                        </span>
                                                      </TooltipTrigger>
                                                      <TooltipContent side="top" className="text-xs">
                                                        Requiere: Finalidad de uso y justificación jurídica
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Paginación UI Kit */}
            {institucionesFiltradas.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-2 w-full">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-muted-foreground order-2 sm:order-1">
                  <p>
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {(safeCurrentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(safeCurrentPage * pageSize, institucionesFiltradas.length)}
                    </span>{" "}
                    de <span className="font-semibold text-foreground">{institucionesFiltradas.length}</span> instituciones
                  </p>

                  <div className="flex items-center gap-2">
                    <span>Instituciones por página:</span>
                    <div className="inline-flex rounded-full border border-border p-0.5 bg-surface shadow-2xs">
                      {[1, 2, 5].map((size) => (
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
                              ? "bg-surface text-primary shadow-2xs font-bold border border-border"
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
                          className={cn(safeCurrentPage <= 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={cn(safeCurrentPage <= 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === safeCurrentPage}
                                onClick={() => setCurrentPage(page)}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (
                          (page === safeCurrentPage - 2 && page > 1) ||
                          (page === safeCurrentPage + 2 && page < totalPages)
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
                          className={cn(safeCurrentPage >= totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLast
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn(safeCurrentPage >= totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </Card>
        </main>
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
