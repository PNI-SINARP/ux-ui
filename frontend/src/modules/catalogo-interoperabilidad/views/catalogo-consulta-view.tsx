"use client";

import React, { useState, useMemo } from "react";
import {
  Database,
  Building2,
  Search,
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { cn } from "@/lib/utils";
import { INITIAL_INSTITUCIONES, MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoConsultaView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitucion, setSelectedInstitucion] = useState<string>("ALL");
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>("ALL");

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
        breadcrumbs={[{ label: "Catálogo de Fuentes" }]}
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
                        <p className="text-[11px] text-warning-700 dark:text-warning-300 font-medium">
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

            {/* Barra de Filtros y Búsqueda */}
            <Card size="sm" className="bg-card border-border shadow-2xs w-full" innerClassName="p-4 w-full">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-stretch md:items-center">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por institución, fuente o dato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-background w-full"
                  />
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-3 shrink-0">
                  <Combobox
                    items={institucionOptions}
                    value={institucionOptions.find((o) => o.value === selectedInstitucion) || institucionOptions[0]}
                    onValueChange={(val) => {
                      if (val) setSelectedInstitucion(val.value);
                    }}
                  >
                    <ComboboxSelectTrigger className="h-9 text-xs min-w-[220px] bg-background border-border" />
                    <ComboboxContent align="start" className="w-72 max-h-72 overflow-y-auto">
                      <ComboboxList>
                        {institucionOptions.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt} className="text-xs">
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>

                  <Combobox
                    items={clasificacionOptions}
                    value={clasificacionOptions.find((o) => o.value === selectedClasificacion) || clasificacionOptions[0]}
                    onValueChange={(val) => {
                      if (val) setSelectedClasificacion(val.value);
                    }}
                  >
                    <ComboboxSelectTrigger className="h-9 text-xs min-w-[240px] bg-background border-border" />
                    <ComboboxContent align="start" className="w-80">
                      <ComboboxList>
                        {clasificacionOptions.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt} className="text-xs">
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>

                  {(searchTerm || selectedInstitucion !== "ALL" || selectedClasificacion !== "ALL") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedInstitucion("ALL");
                        setSelectedClasificacion("ALL");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground shrink-0"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Listado de Fuentes por Institución */}
            <div className="flex flex-col gap-6 w-full">
              {institucionesFiltradas.length === 0 ? (
                <Card className="border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-3 bg-muted/20 w-full">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Search className="size-6" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">No se encontraron fuentes</h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No existen fuentes o datos que coincidan con los filtros seleccionados.
                  </p>
                </Card>
              ) : (
                institucionesFiltradas.map((institucion) => {
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
                        className="bg-primary/5 dark:bg-primary-950/20 hover:bg-primary/10 dark:hover:bg-primary-950/30 transition-colors cursor-pointer border-b border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none w-full"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                            <Building2 className="size-5 text-primary dark:text-primary-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="font-heading text-base sm:text-lg font-bold text-primary dark:text-primary-300 leading-snug">
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
                                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 text-xs">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="cursor-help flex items-center gap-1.5">
                                            <Badge tone="success" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                              <Unlock className="size-3" />
                                              <span>{camposAccesibles} accesibles</span>
                                            </Badge>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                          Requieren únicamente finalidad de uso
                                        </TooltipContent>
                                      </Tooltip>

                                      <span className="text-muted-foreground/40">•</span>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="cursor-help flex items-center gap-1.5">
                                            <Badge tone="warning" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                              <Lock className="size-3" />
                                              <span>{camposConfidenciales} confidenciales</span>
                                            </Badge>
                                          </div>
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
                                            <th className="py-2.5 px-4 w-[42%]">Qué Información Contiene</th>
                                            <th className="py-2.5 px-4 w-[30%]">Requisito para Solicitar</th>
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
                                                    <div className="flex items-center gap-2">
                                                      <Badge tone="success" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                                        <Unlock className="size-3" />
                                                        Accesible
                                                      </Badge>
                                                      <span className="text-[11px] text-muted-foreground">
                                                        Solo finalidad de uso
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div className="flex items-center gap-2">
                                                      <Badge tone="warning" appearance="soft" size="sm" className="gap-1 inline-flex font-semibold">
                                                        <Lock className="size-3" />
                                                        Confidencial
                                                      </Badge>
                                                      <span className="text-[11px] text-warning-700 dark:text-warning-400 font-medium">
                                                        Finalidad y justificación jurídica
                                                      </span>
                                                    </div>
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
          </Card>
        </main>
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
