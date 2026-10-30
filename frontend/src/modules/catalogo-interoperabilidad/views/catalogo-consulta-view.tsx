"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Database,
  Building2,
  Lock,
  Unlock,
  ShieldAlert,
  Settings2,
  ChevronRight,
  Layers,
  Scale,
  Clock,
  Eye,
  EyeOff,
  Send,
  X,
  Search as SearchIcon,
  FileText,
  CornerDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { InteractiveCard } from "@/components/ui/data-display";
import {
  ViewModeToggle,
  type ViewMode,
} from "@/components/shared/view-mode-toggle";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { cn } from "@/lib/utils";
import {
  INITIAL_INSTITUCIONES,
  MOCK_USERS_BY_ROLE,
  applyCatalogoOverridesToInstituciones,
  saveCatalogoCampoClasificacion,
  type FuenteServicio,
  type Institucion,
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface FuenteConInstitucion {
  fuente: FuenteServicio;
  institucion: Institucion;
  camposAccesibles: number;
  camposConfidenciales: number;
  camposSensibles: number;
}

export function CatalogoConsultaView() {
  const [instituciones, setInstituciones] = useState<Institucion[]>(
    () => INITIAL_INSTITUCIONES
  );
  const [modoParametrizacion, setModoParametrizacion] = useState(false);

  useEffect(() => {
    setInstituciones(
      applyCatalogoOverridesToInstituciones(INITIAL_INSTITUCIONES)
    );
  }, []);

  const handleParametrizarCampo = (
    fuenteId: string,
    campoId: string,
    clasificacion: "Accesible" | "Confidencial",
    esSensible: boolean
  ) => {
    saveCatalogoCampoClasificacion(
      fuenteId,
      campoId,
      clasificacion,
      esSensible
    );
    setInstituciones(
      applyCatalogoOverridesToInstituciones(INITIAL_INSTITUCIONES)
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitucion, setSelectedInstitucion] = useState<string>("ALL");
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [selectedClasificacion, setSelectedClasificacion] =
    useState<string>("ALL");
  const [clasificacionSearch, setClasificacionSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Estado de instituciones expandidas (Agrupación por institución proveedora)
  const [expandedInstituciones, setExpandedInstituciones] = useState<
    Record<string, boolean>
  >({});

  const toggleInstitucion = (id: string) => {
    setExpandedInstituciones((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  // Estado de filas expandidas (Expandable Row del UI Kit)
  const [expandedFuentes, setExpandedFuentes] = useState<
    Record<string, boolean>
  >({
    "FNT-001": true,
  });

  // Paginación UI Kit por fuentes
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleFuente = (id: string) => {
    setExpandedFuentes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const institucionOptions = useMemo(
    () => [
      { value: "ALL", label: "Todas las Instituciones" },
      ...instituciones.map((inst) => ({
        value: inst.id,
        label: `${inst.sigla} — ${inst.nombre}`,
      })),
    ],
    [instituciones]
  );

  const clasificacionOptions = useMemo(
    () => [
      { value: "ALL", label: "Todos los requisitos de acceso" },
      { value: "Accesible", label: "Accesibles (solo finalidad de uso)" },
      {
        value: "Confidencial",
        label: "Confidenciales (finalidad y justificación jurídica)",
      },
      {
        value: "Confidencial_Sensible",
        label: "↳ Confidenciales sensibles (tratamiento especial LOPDP)",
      },
    ],
    []
  );

  const filteredInstitucionOptions = useMemo(() => {
    const selectedLabel = institucionOptions.find(
      (o) => o.value === selectedInstitucion
    )?.label;
    if (!institucionSearch.trim() || institucionSearch === selectedLabel) {
      return institucionOptions;
    }
    return institucionOptions.filter((opt) =>
      opt.label.toLowerCase().includes(institucionSearch.toLowerCase())
    );
  }, [institucionOptions, institucionSearch, selectedInstitucion]);

  const filteredClasificacionOptions = useMemo(() => {
    const selectedLabel = clasificacionOptions.find(
      (o) => o.value === selectedClasificacion
    )?.label;
    if (!clasificacionSearch.trim() || clasificacionSearch === selectedLabel) {
      return clasificacionOptions;
    }
    return clasificacionOptions.filter((opt) =>
      opt.label.toLowerCase().includes(clasificacionSearch.toLowerCase())
    );
  }, [clasificacionOptions, clasificacionSearch, selectedClasificacion]);

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
    searchTerm.trim() !== "" ||
    selectedInstitucion !== "ALL" ||
    selectedClasificacion !== "ALL";

  // Base de fuentes publicadas filtradas por búsqueda e institución (antes del filtro de clasificación)
  const fuentesBase = useMemo<FuenteConInstitucion[]>(() => {
    const items: FuenteConInstitucion[] = [];

    for (const inst of instituciones) {
      if (selectedInstitucion !== "ALL" && inst.id !== selectedInstitucion) {
        continue;
      }

      const fuentesPublicadas = inst.fuentes.filter(
        (f) => f.estado === "PUBLICADO"
      );

      for (const f of fuentesPublicadas) {
        const q = searchTerm.trim().toLowerCase();
        const matchSearch =
          q === "" ||
          f.nombre.toLowerCase().includes(q) ||
          f.codigoServicio.toLowerCase().includes(q) ||
          f.descripcion.toLowerCase().includes(q) ||
          inst.nombre.toLowerCase().includes(q) ||
          inst.sigla.toLowerCase().includes(q) ||
          f.campos.some(
            (c) =>
              c.nombre.toLowerCase().includes(q) ||
              c.descripcion.toLowerCase().includes(q)
          );

        if (matchSearch) {
          const camposAccesibles = f.campos.filter(
            (c) => c.clasificacion === "Accesible"
          ).length;
          const camposConfidenciales = f.campos.filter(
            (c) => c.clasificacion === "Confidencial"
          ).length;
          const camposSensibles = f.campos.filter(
            (c) => c.clasificacion === "Confidencial" && c.esSensible
          ).length;

          items.push({
            fuente: f,
            institucion: inst,
            camposAccesibles,
            camposConfidenciales,
            camposSensibles,
          });
        }
      }
    }

    // Mantener el orden agrupado por Institución proveedora → Fuente de información
    return items;
  }, [instituciones, searchTerm, selectedInstitucion]);

  // Separación de fuentes con campos accesibles
  const fuentesSoloAccesiblesBase = useMemo(
    () => fuentesBase.filter((item) => item.camposAccesibles > 0),
    [fuentesBase]
  );

  const fuentesConConfidencialesBase = useMemo(
    () => fuentesBase.filter((item) => item.camposConfidenciales > 0),
    [fuentesBase]
  );

  const fuentesConSensiblesBase = useMemo(
    () => fuentesBase.filter((item) => item.camposSensibles > 0),
    [fuentesBase]
  );

  // Filtrado por clasificación seleccionada (Todas / Fuentes Accesibles / Fuentes Confidenciales / Sensibles)
  const fuentesFiltradas = useMemo<FuenteConInstitucion[]>(() => {
    if (selectedClasificacion === "Accesible") {
      return fuentesSoloAccesiblesBase;
    }
    if (selectedClasificacion === "Confidencial") {
      return fuentesConConfidencialesBase;
    }
    if (selectedClasificacion === "Confidencial_Sensible") {
      return fuentesConSensiblesBase;
    }
    return fuentesBase;
  }, [
    selectedClasificacion,
    fuentesBase,
    fuentesSoloAccesiblesBase,
    fuentesConConfidencialesBase,
    fuentesConSensiblesBase,
  ]);

  // Cálculos de Paginación UI Kit
  const totalPages = Math.max(1, Math.ceil(fuentesFiltradas.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFuentes = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return fuentesFiltradas.slice(start, start + pageSize);
  }, [fuentesFiltradas, safeCurrentPage, pageSize]);

  // Agrupación obligatoria: Institución proveedora → Fuente de información → Campos disponibles
  const groupedPaginatedInstituciones = useMemo(() => {
    const map = new Map<
      string,
      {
        institucion: Institucion;
        items: FuenteConInstitucion[];
      }
    >();
    for (const item of paginatedFuentes) {
      const instId = item.institucion.id;
      if (!map.has(instId)) {
        map.set(instId, { institucion: item.institucion, items: [] });
      }
      map.get(instId)!.items.push(item);
    }
    return Array.from(map.values());
  }, [paginatedFuentes]);

  const totalFuentesPublicadas = useMemo(() => {
    return instituciones
      .flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO").length;
  }, [instituciones]);

  const totalCampos = useMemo(() => {
    return instituciones
      .flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .reduce((acc, f) => acc + f.campos.length, 0);
  }, [instituciones]);

  const totalCamposAccesibles = useMemo(() => {
    return instituciones
      .flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .flatMap((f) => f.campos)
      .filter((c) => c.clasificacion === "Accesible").length;
  }, [instituciones]);

  const totalCamposConfidenciales = useMemo(() => {
    return instituciones
      .flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .flatMap((f) => f.campos)
      .filter((c) => c.clasificacion === "Confidencial").length;
  }, [instituciones]);

  const totalCamposSensibles = useMemo(() => {
    return instituciones
      .flatMap((i) => i.fuentes)
      .filter((f) => f.estado === "PUBLICADO")
      .flatMap((f) => f.campos)
      .filter((c) => c.clasificacion === "Confidencial" && c.esSensible).length;
  }, [instituciones]);

  // Renderizado de Card para Vista en Tarjetas (viewMode === "cards" y Mobile <md)
  const renderFuenteCard = ({
    fuente,
    institucion,
    camposAccesibles,
    camposConfidenciales,
    camposSensibles,
  }: FuenteConInstitucion) => {
    const isExpanded = expandedFuentes[fuente.id] ?? false;
    const listaAccesibles =
      selectedClasificacion === "Confidencial" ||
      selectedClasificacion === "Confidencial_Sensible"
        ? []
        : fuente.campos.filter((c) => c.clasificacion === "Accesible");
    const listaConfidenciales =
      selectedClasificacion === "Accesible"
        ? []
        : fuente.campos.filter(
            (c) =>
              c.clasificacion === "Confidencial" &&
              (selectedClasificacion !== "Confidencial_Sensible" || c.esSensible)
          );
    const tieneConfidenciales = camposConfidenciales > 0;

    return (
      <InteractiveCard
        key={fuente.id}
        color="default"
        decorativeIcon={<Database className="size-full stroke-[0.8]" />}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-25 dark:opacity-15 group-hover:opacity-40"
        className={cn(
          "p-4 sm:p-5 bg-surface hover:bg-surface border-border shadow-xs hover:border-primary/40 flex flex-col justify-between gap-4 w-full",
          isExpanded && "lg:col-span-2"
        )}
      >
        <div className="space-y-3.5 w-full">
          {/* Cabecera de la Card */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  tone="primary"
                  appearance="solid"
                  size="sm"
                  className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                >
                  {institucion.sigla}
                </Badge>
                <span className="text-[11px] font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {fuente.codigoServicio}
                </span>
                <Badge
                  tone="neutral"
                  appearance="outline"
                  size="sm"
                  className="text-[10px] font-mono"
                >
                  v{fuente.version}
                </Badge>
              </div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-foreground leading-snug pt-0.5">
                {fuente.nombre}
              </h3>
            </div>

            <Badge
              tone={tieneConfidenciales ? "warning" : "success"}
              appearance="soft"
              size="sm"
              className="shrink-0 font-semibold text-[10px] gap-1"
            >
              {tieneConfidenciales ? (
                <>
                  <Lock className="size-3" />
                  <span>Con Reserva</span>
                </>
              ) : (
                <>
                  <Unlock className="size-3" />
                  <span>100% Accesible</span>
                </>
              )}
            </Badge>
          </div>

          {/* Descripción */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {fuente.descripcion}
          </p>

          {/* Metadatos en 2 bloques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
            <div className="p-2.5 rounded-lg bg-muted/25 border border-border/50 space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Building2 className="size-3 text-primary" />
                Institución Proveedora
              </span>
              <span className="text-xs font-semibold text-foreground block leading-tight">
                {institucion.nombre}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono block">
                RUC: {institucion.codigoInstitucion}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-muted/25 border border-border/50 space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Scale className="size-3 text-primary" />
                Base Legal y Tipo de Servicio
              </span>
              <span
                className="text-xs font-medium text-foreground block line-clamp-1"
                title={fuente.baseLegal}
              >
                {fuente.baseLegal}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 shrink-0" />
                Actualizado: {fuente.ultimaActualizacion}
              </span>
            </div>
          </div>

          {/* Resumen de Clasificación de Campos */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Desglose de {fuente.campos.length} campos:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {camposAccesibles > 0 && (
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="gap-1 font-semibold text-[10px]"
                >
                  <Unlock className="size-3" />
                  <span>{camposAccesibles} ACCESIBLES</span>
                </Badge>
              )}
              {camposConfidenciales > 0 && (
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="gap-1 font-semibold text-[10px]"
                >
                  <Lock className="size-3" />
                  <span>{camposConfidenciales} CONFIDENCIALES</span>
                </Badge>
              )}
              {camposSensibles > 0 && (
                <Badge
                  tone="danger"
                  appearance="soft"
                  size="sm"
                  className="gap-1 font-bold text-[10px]"
                >
                  <ShieldAlert className="size-3" />
                  <span>{camposSensibles} SENSIBLE{camposSensibles > 1 ? "S" : ""} · LOPDP</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Sección Expandible de Campos dentro de la Card (Separados en Accesibles vs Confidenciales) */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out overflow-hidden",
              isExpanded
                ? "grid-rows-[1fr] opacity-100 pt-1"
                : "grid-rows-[0fr] opacity-0 pt-0"
            )}
          >
            <div className="min-h-0">
              <div className="p-3 rounded-xl border border-border/60 bg-surface space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" />
                    Campos separados por clasificación ({fuente.campos.length})
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {fuente.tipoConsumo}
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 [scrollbar-width:thin]">
                  {/* Bloque 1: Campos Accesibles */}
                  {listaAccesibles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/25">
                        <span className="text-[11px] font-bold text-success flex items-center gap-1.5">
                          <Unlock className="size-3.5" />
                          Campos Accesibles ({listaAccesibles.length})
                        </span>
                        <span className="text-[10px] font-medium text-success">
                          Solo finalidad de uso (PAR-11)
                        </span>
                      </div>
                      <div
                        className={cn(
                          "grid gap-2 w-full",
                          listaAccesibles.length === 1
                            ? "grid-cols-1"
                            : listaAccesibles.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        )}
                      >
                        {listaAccesibles.map((campo) => (
                          <div
                            key={campo.id}
                            className="p-2.5 rounded-lg bg-muted/35 border border-border/60 flex flex-col justify-between gap-1.5 w-full"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xs text-foreground">
                                  {campo.nombre}
                                </span>
                                <Badge
                                  tone="success"
                                  appearance="soft"
                                  size="sm"
                                  className="gap-1 text-[10px] font-semibold shrink-0"
                                >
                                  <Unlock className="size-2.5" />
                                  ACCESIBLE
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {campo.descripcion}
                              </p>
                            </div>
                            {modoParametrizacion && (
                              <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-border/40">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="success"
                                  onClick={() =>
                                    handleParametrizarCampo(
                                      fuente.id,
                                      campo.id,
                                      "Accesible",
                                      false
                                    )
                                  }
                                  className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                >
                                  <Unlock className="size-2.5" />
                                  Accesible
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleParametrizarCampo(
                                      fuente.id,
                                      campo.id,
                                      "Confidencial",
                                      false
                                    )
                                  }
                                  className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                >
                                  <Lock className="size-2.5" />
                                  Confidencial
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleParametrizarCampo(
                                      fuente.id,
                                      campo.id,
                                      "Confidencial",
                                      true
                                    )
                                  }
                                  className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                >
                                  <ShieldAlert className="size-2.5" />
                                  Conf. Sensible
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bloque 2: Campos Confidenciales */}
                  {listaConfidenciales.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-warning/10 border border-warning/25">
                        <span className="text-[11px] font-bold text-warning flex items-center gap-1.5">
                          <Lock className="size-3.5" />
                          Campos Confidenciales ({listaConfidenciales.length})
                        </span>
                        <span className="text-[10px] font-medium text-warning">
                          Finalidad + Base jurídica (PAR-12)
                        </span>
                      </div>
                      <div
                        className={cn(
                          "grid gap-2 w-full",
                          listaConfidenciales.length === 1
                            ? "grid-cols-1"
                            : listaConfidenciales.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        )}
                      >
                        {listaConfidenciales.map((campo) => {
                          const esSensible = Boolean(campo.esSensible);
                          return (
                            <div
                              key={campo.id}
                              className={cn(
                                "p-2.5 rounded-lg flex flex-col justify-between gap-1.5 w-full",
                                esSensible
                                  ? "bg-danger/10 dark:bg-danger-900/25 border-2 border-danger/55 shadow-2xs"
                                  : "bg-warning-50/60 dark:bg-warning-900/10 border border-warning-300/80"
                              )}
                            >
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-1.5 flex-wrap">
                                  <span className="font-mono font-bold text-xs text-foreground">
                                    {campo.nombre}
                                  </span>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <Badge
                                      tone="warning"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1 text-[10px] font-semibold shrink-0"
                                    >
                                      <Lock className="size-2.5" />
                                      CONFIDENCIAL
                                    </Badge>
                                    {esSensible && (
                                      <Badge
                                        tone="danger"
                                        appearance="solid"
                                        size="sm"
                                        className="gap-1 text-[10px] font-bold shrink-0"
                                      >
                                        <ShieldAlert className="size-2.5" />
                                        SENSIBLE · LOPDP
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                  {campo.descripcion}
                                </p>
                                {esSensible && (
                                  <p className="text-[10px] font-bold text-danger bg-danger/12 border border-danger/30 rounded-md px-2 py-1 leading-tight">
                                    Dato confidencial sensible: tratamiento especial LOPDP.
                                  </p>
                                )}
                              </div>
                              {modoParametrizacion && (
                                <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-border/40">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleParametrizarCampo(
                                        fuente.id,
                                        campo.id,
                                        "Accesible",
                                        false
                                      )
                                    }
                                    className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                  >
                                    <Unlock className="size-2.5" />
                                    Accesible
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={!esSensible ? "warning" : "ghost"}
                                    onClick={() =>
                                      handleParametrizarCampo(
                                        fuente.id,
                                        campo.id,
                                        "Confidencial",
                                        false
                                      )
                                    }
                                    className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                  >
                                    <Lock className="size-2.5" />
                                    Confidencial
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={esSensible ? "danger" : "ghost"}
                                    onClick={() =>
                                      handleParametrizarCampo(
                                        fuente.id,
                                        campo.id,
                                        "Confidencial",
                                        true
                                      )
                                    }
                                    className="h-6 px-1.5 text-[10px] font-semibold gap-1"
                                  >
                                    <ShieldAlert className="size-2.5" />
                                    Conf. Sensible
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de la Card */}
        <div className="pt-2 border-t border-border/60 w-full flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => toggleFuente(fuente.id)}
            className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
          >
            {isExpanded ? (
              <>
                <EyeOff className="size-3.5" />
                <span>Ocultar campos ({fuente.campos.length})</span>
              </>
            ) : (
              <>
                <Eye className="size-3.5" />
                <span>Ver campos ({fuente.campos.length})</span>
              </>
            )}
          </Button>

          <Button
            variant="primary"
            size="sm"
            asChild
            className="flex-1 gap-1.5 text-xs font-semibold h-9 justify-center cursor-pointer"
          >
            <Link
              href={`/acceso-interoperabilidad/solicitudes/nueva?fuente=${fuente.id}`}
            >
              <Send className="size-3.5" />
              <span>Solicitar acceso</span>
            </Link>
          </Button>
        </div>
      </InteractiveCard>
    );
  };

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
                  Catálogo de fuentes
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Consulta las fuentes de datos disponibles para interoperar
                  entre instituciones y despliega cada fila o tarjeta para
                  revisar los campos y su clasificación.
                </p>
              </div>
            </div>

            {/* Cards de Resumen KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* Fuentes Publicadas */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSelectInstitucion("ALL");
                      handleSelectClasificacion("ALL");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectInstitucion("ALL");
                        handleSelectClasificacion("ALL");
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      selectedClasificacion === "ALL" &&
                        selectedInstitucion === "ALL"
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
                            selectedClasificacion === "ALL" &&
                              selectedInstitucion === "ALL"
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
                  Total de fuentes de información activas en el catálogo
                  oficial.
                </TooltipContent>
              </Tooltip>

              {/* Datos Consultables */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSelectClasificacion("ALL");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectClasificacion("ALL");
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
                  Total de campos o atributos individuales que se pueden
                  solicitar.
                </TooltipContent>
              </Tooltip>

              {/* Accesibles */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSelectClasificacion(
                        selectedClasificacion === "Accesible"
                          ? "ALL"
                          : "Accesible"
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectClasificacion(
                          selectedClasificacion === "Accesible"
                            ? "ALL"
                            : "Accesible"
                        );
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
                  Datos de libre consulta: para solicitarlos solo necesitas
                  registrar la finalidad de uso.
                </TooltipContent>
              </Tooltip>

              {/* Confidenciales */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSelectClasificacion(
                        selectedClasificacion === "Confidencial"
                          ? "ALL"
                          : "Confidencial"
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectClasificacion(
                          selectedClasificacion === "Confidencial"
                            ? "ALL"
                            : "Confidencial"
                        );
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
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                            {totalCamposConfidenciales}
                          </p>
                          {totalCamposSensibles > 0 && (
                            <Badge
                              tone="danger"
                              appearance="soft"
                              size="sm"
                              className="text-[10px] font-bold gap-1 px-1.5 py-0"
                            >
                              <ShieldAlert className="size-2.5" />
                              {totalCamposSensibles} Sensibles · LOPDP
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-warning font-medium">
                          Requieren finalidad y base jurídica
                        </p>
                      </div>
                    </div>
                  </Card>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  Datos protegidos: para solicitarlos debes registrar la
                  finalidad de uso y adjuntar justificación jurídica.
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col lg:flex-row gap-3 w-full items-stretch lg:items-center">
                <div className="flex-1 min-w-0">
                  <Search
                    size="sm"
                    placeholder="Buscar por código, fuente, institución o campo..."
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

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                  {/* Combobox Instituciones */}
                  <div className="w-full sm:w-[250px] min-w-0">
                    <Combobox
                      value={
                        selectedInstitucion === "ALL"
                          ? null
                          : selectedInstitucion
                      }
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
                            <ComboboxEmpty>
                              No se encontraron instituciones.
                            </ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  {/* Combobox Clasificación / Requisitos */}
                  <div className="w-full sm:w-[260px] min-w-0">
                    <Combobox
                      value={
                        selectedClasificacion === "ALL"
                          ? null
                          : selectedClasificacion
                      }
                      onValueChange={handleSelectClasificacion}
                      inputValue={clasificacionSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = clasificacionOptions.find(
                          (o) =>
                            o.value.toLowerCase() === newSearch.toLowerCase() ||
                            o.label.toLowerCase() === newSearch.toLowerCase()
                        );
                        if (opt) setClasificacionSearch(opt.label);
                        else if (newSearch === "ALL")
                          setClasificacionSearch("");
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
                            <ComboboxEmpty>
                              No se encontraron opciones.
                            </ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>

              {/* Píldoras de Filtros Activos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Filtros aplicados:
                  </span>
                  {searchTerm && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      size="sm"
                      className="gap-1 text-[11px]"
                    >
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
                    <Badge
                      tone="primary"
                      appearance="soft"
                      size="sm"
                      className="gap-1 text-[11px]"
                    >
                      <span>
                        {institucionOptions.find(
                          (o) => o.value === selectedInstitucion
                        )?.label || selectedInstitucion}
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
                      tone={
                        selectedClasificacion === "Accesible"
                          ? "success"
                          : "warning"
                      }
                      appearance="soft"
                      size="sm"
                      className="gap-1 text-[11px]"
                    >
                      <span>
                        {clasificacionOptions.find(
                          (o) => o.value === selectedClasificacion
                        )?.label || selectedClasificacion}
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

            {/* Contenido Principal */}
            {fuentesFiltradas.length === 0 ? (
              <Card className="border-dashed border-border p-12 text-center flex flex-col items-center justify-center gap-3 bg-muted/20 w-full">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <SearchIcon className="size-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  No se encontraron fuentes
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  No existen fuentes o datos que coincidan con los filtros
                  seleccionados.
                </p>
              </Card>
            ) : (
              <div className="space-y-4 w-full">
                {/* 1. VISTA TABULAR CON EXPANDABLE ROW DEL UI KIT */}
                <div
                  className={cn(
                    "w-full",
                    viewMode === "table" ? "hidden md:block" : "hidden"
                  )}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center"></TableHead>
                        <TableHead>Fuente de Información</TableHead>
                        <TableHead>Institución Proveedora</TableHead>
                        <TableHead>Base Legal y Vigencia</TableHead>
                        <TableHead>Campos y Requisitos</TableHead>
                        <TableHead className="w-20 text-center">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedPaginatedInstituciones.map(
                        ({ institucion: groupInst, items: groupItems }) => {
                          const isInstExpanded =
                            expandedInstituciones[groupInst.id] ?? true;
                          const totalInstCampos = groupItems.reduce(
                            (acc, it) => acc + it.fuente.campos.length,
                            0
                          );
                          const totalInstAccesibles = groupItems.reduce(
                            (acc, it) => acc + it.camposAccesibles,
                            0
                          );
                          const totalInstConfidenciales = groupItems.reduce(
                            (acc, it) => acc + it.camposConfidenciales,
                            0
                          );
                          const totalInstSensibles = groupItems.reduce(
                            (acc, it) => acc + it.camposSensibles,
                            0
                          );
                          const ultimaActInst =
                            groupItems[0]?.fuente.ultimaActualizacion ?? "—";
                          const baseLegalPrincipal =
                            groupItems[0]?.fuente.baseLegal ?? "Normativa institucional vigente";

                          return (
                            <React.Fragment key={`inst-group-${groupInst.id}`}>
                              {/* NIVEL 1 (PRIMARIO): INSTITUCIÓN PROVEEDORA ALINEADA A LAS 6 COLUMNAS */}
                              <TableRow
                                onClick={() => toggleInstitucion(groupInst.id)}
                                className="cursor-pointer bg-primary/10 hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/25 border-l-4 border-l-primary border-y border-border transition-colors"
                              >
                                {/* Col 1: Expandir institución */}
                                <TableCell
                                  className="text-center py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => toggleInstitucion(groupInst.id)}
                                    aria-expanded={isInstExpanded}
                                    aria-label={
                                      isInstExpanded
                                        ? `Contraer fuentes de ${groupInst.nombre}`
                                        : `Expandir fuentes de ${groupInst.nombre}`
                                    }
                                    className="size-8 rounded-lg bg-primary/15 text-primary hover:bg-primary/25"
                                  >
                                    <ChevronRight
                                      className={cn(
                                        "size-4 transition-transform duration-200",
                                        isInstExpanded && "rotate-90"
                                      )}
                                    />
                                  </Button>
                                </TableCell>

                                {/* Col 2: Fuente de Información (Resumen de fuentes de la institución) */}
                                <TableCell className="py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge
                                        tone="primary"
                                        appearance="solid"
                                        size="sm"
                                        className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs gap-1"
                                      >
                                        <Database className="size-3" />
                                        <span>
                                          {groupItems.length}{" "}
                                          {groupItems.length === 1
                                            ? "FUENTE PUBLICADA"
                                            : "FUENTES PUBLICADAS"}
                                        </span>
                                      </Badge>
                                      {groupItems.map((it) => (
                                        <span
                                          key={it.fuente.id}
                                          className="font-mono text-[10px] font-semibold text-primary bg-surface/80 border border-primary/25 px-1.5 py-0.5 rounded"
                                        >
                                          {it.fuente.codigoServicio}
                                        </span>
                                      ))}
                                    </div>
                                    <p className="font-heading font-bold text-xs sm:text-sm text-foreground leading-snug">
                                      Catálogo de servicios de {groupInst.sigla}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {isInstExpanded
                                        ? "Mostrando fuentes desplegadas en segundo nivel"
                                        : "Haga clic para desplegar las fuentes de esta institución"}
                                    </p>
                                  </div>
                                </TableCell>

                                {/* Col 3: Institución Proveedora */}
                                <TableCell className="py-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <Building2 className="size-3.5 text-primary shrink-0" />
                                      <Badge
                                        tone="primary"
                                        appearance="solid"
                                        size="sm"
                                        className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                                      >
                                        {groupInst.sigla}
                                      </Badge>
                                      <span className="text-[11px] font-mono text-muted-foreground">
                                        RUC: {groupInst.codigoInstitucion}
                                      </span>
                                    </div>
                                    <p className="font-heading font-bold text-xs sm:text-sm text-foreground leading-snug">
                                      {groupInst.nombre}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {groupInst.sector}
                                    </p>
                                  </div>
                                </TableCell>

                                {/* Col 4: Base Legal y Vigencia */}
                                <TableCell className="py-3">
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                                      <Scale className="size-3.5 text-primary shrink-0" />
                                      <span
                                        className="line-clamp-1"
                                        title={baseLegalPrincipal}
                                      >
                                        {groupItems.length === 1
                                          ? baseLegalPrincipal
                                          : `${groupItems.length} marcos normativos vigentes`}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                      <Clock className="size-3 shrink-0" />
                                      <span>Actualizado: {ultimaActInst}</span>
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Col 5: Campos y Requisitos */}
                                <TableCell className="py-3">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge
                                      tone="primary"
                                      appearance="soft"
                                      size="sm"
                                      className="text-[10px] font-bold"
                                    >
                                      {totalInstCampos} CAMPOS TOTALES
                                    </Badge>
                                    {totalInstAccesibles > 0 && (
                                      <Badge
                                        tone="success"
                                        appearance="soft"
                                        size="sm"
                                        className="gap-1 font-semibold text-[10px]"
                                      >
                                        <Unlock className="size-3" />
                                        <span>{totalInstAccesibles} ACC.</span>
                                      </Badge>
                                    )}
                                    {totalInstConfidenciales > 0 && (
                                      <Badge
                                        tone="warning"
                                        appearance="soft"
                                        size="sm"
                                        className="gap-1 font-semibold text-[10px]"
                                      >
                                        <Lock className="size-3" />
                                        <span>{totalInstConfidenciales} CONF.</span>
                                      </Badge>
                                    )}
                                    {totalInstSensibles > 0 && (
                                      <Badge
                                        tone="danger"
                                        appearance="soft"
                                        size="sm"
                                        className="gap-1 font-bold text-[10px]"
                                      >
                                        <ShieldAlert className="size-3" />
                                        <span>{totalInstSensibles} SENS.</span>
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Col 6: Acciones */}
                                <TableCell
                                  className="text-center py-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => toggleInstitucion(groupInst.id)}
                                          className="text-primary hover:text-primary hover:bg-primary/15"
                                          aria-label={
                                            isInstExpanded
                                              ? `Ocultar fuentes de ${groupInst.nombre}`
                                              : `Ver fuentes de ${groupInst.nombre}`
                                          }
                                        >
                                          {isInstExpanded ? (
                                            <EyeOff className="size-4" />
                                          ) : (
                                            <Eye className="size-4 text-primary" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        {isInstExpanded
                                          ? `Ocultar las ${groupItems.length} fuentes de ${groupInst.sigla}`
                                          : `Desplegar ${groupItems.length} fuentes de ${groupInst.sigla}`}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* NIVEL 2 (SECUNDARIO INDENTADO): FUENTES DE INFORMACIÓN DE LA INSTITUCIÓN */}
                              {isInstExpanded &&
                                groupItems.map(
                        ({
                          fuente,
                          institucion,
                          camposAccesibles,
                          camposConfidenciales,
                          camposSensibles,
                        }) => {
                          const isExpanded =
                            expandedFuentes[fuente.id] ?? false;
                          const rowContentId = `expandable-fuente-${fuente.id}`;
                          const listaAccesibles =
                            selectedClasificacion === "Confidencial" ||
                            selectedClasificacion === "Confidencial_Sensible"
                              ? []
                              : fuente.campos.filter(
                                  (c) => c.clasificacion === "Accesible"
                                );
                          const listaConfidenciales =
                            selectedClasificacion === "Accesible"
                              ? []
                              : fuente.campos.filter(
                                  (c) =>
                                    c.clasificacion === "Confidencial" &&
                                    (selectedClasificacion !==
                                      "Confidencial_Sensible" ||
                                      c.esSensible)
                                );

                          return (
                            <React.Fragment key={fuente.id}>
                              <TableRow
                                id={`row-${fuente.id}`}
                                onClick={() => toggleFuente(fuente.id)}
                                className={cn(
                                  "group cursor-pointer transition-all duration-200 bg-surface hover:bg-primary/10 dark:hover:bg-primary/15 border-l-4 border-l-primary/35",
                                  isExpanded &&
                                    "bg-primary/10 dark:bg-primary/15 font-medium shadow-xs border-l-primary"
                                )}
                              >
                                {/* Col 1: Conector de 2do nivel + Botón Expandable Row */}
                                <TableCell
                                  className="text-center pl-4 pr-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-end gap-0.5">
                                    <CornerDownRight className="size-3.5 text-primary/60 shrink-0" />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => toggleFuente(fuente.id)}
                                      aria-expanded={isExpanded}
                                      aria-controls={rowContentId}
                                      aria-label={
                                        isExpanded
                                          ? `Contraer información de ${fuente.nombre}`
                                          : `Expandir información de ${fuente.nombre}`
                                      }
                                      className="size-7 rounded-lg group-hover:bg-primary/15 hover:bg-primary/25 text-primary transition-all duration-200"
                                    >
                                      <ChevronRight
                                        className={cn(
                                          "size-4 transition-transform duration-300",
                                          isExpanded && "rotate-90 text-primary"
                                        )}
                                      />
                                    </Button>
                                  </div>
                                </TableCell>

                                {/* Col 2: Fuente de Información (Indentada más a la derecha / adentro) */}
                                <TableCell className="pl-5 sm:pl-7">
                                  <div className="space-y-1 max-w-md pl-3.5 border-l-2 border-primary/35">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                        {fuente.codigoServicio}
                                      </span>
                                      <Badge
                                        tone="neutral"
                                        appearance="outline"
                                        size="sm"
                                        className="text-[10px] font-mono"
                                      >
                                        v{fuente.version}
                                      </Badge>
                                    </div>
                                    <p className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                                      {fuente.nombre}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {fuente.descripcion}
                                    </p>
                                  </div>
                                </TableCell>

                                {/* Col 3: Institución Proveedora */}
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <Badge
                                        tone="primary"
                                        appearance="soft"
                                        size="sm"
                                        className="font-bold text-[10px] tracking-wider px-2 py-0.5"
                                      >
                                        {institucion.sigla}
                                      </Badge>
                                      <span className="text-[11px] font-mono text-muted-foreground">
                                        RUC: {institucion.codigoInstitucion}
                                      </span>
                                    </div>
                                    <p className="text-xs font-medium text-foreground/90 leading-snug">
                                      {institucion.nombre}
                                    </p>
                                  </div>
                                </TableCell>

                                {/* Base Legal y Vigencia */}
                                <TableCell>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                                      <Scale className="size-3.5 text-primary shrink-0" />
                                      <span
                                        className="line-clamp-1"
                                        title={fuente.baseLegal}
                                      >
                                        {fuente.baseLegal}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                      <Clock className="size-3 shrink-0" />
                                      <span>
                                        Actualizado:{" "}
                                        {fuente.ultimaActualizacion}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>

                                {/* Campos y Requisitos */}
                                <TableCell>
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    {camposAccesibles > 0 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex">
                                            <Badge
                                              tone="success"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-semibold text-[10px]"
                                            >
                                              <Unlock className="size-3" />
                                              <span>
                                                {camposAccesibles} ACCESIBLES
                                              </span>
                                            </Badge>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="text-xs"
                                        >
                                          Requieren únicamente finalidad de uso
                                          (PAR-11)
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    {camposConfidenciales > 0 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex">
                                            <Badge
                                              tone="warning"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-semibold text-[10px]"
                                            >
                                              <Lock className="size-3" />
                                              <span>
                                                {camposConfidenciales}{" "}
                                                CONFIDENCIALES
                                              </span>
                                            </Badge>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="text-xs"
                                        >
                                          Requieren finalidad de uso y
                                          justificación jurídica LOPDP (PAR-12)
                                        </TooltipContent>
                                      </Tooltip>
                                    )}

                                    {camposSensibles > 0 && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex">
                                            <Badge
                                              tone="danger"
                                              appearance="soft"
                                              size="sm"
                                              className="gap-1 font-bold text-[10px]"
                                            >
                                              <ShieldAlert className="size-3" />
                                              <span>
                                                {camposSensibles} SENSIBLE
                                                {camposSensibles > 1
                                                  ? "S"
                                                  : ""}{" "}
                                                · LOPDP
                                              </span>
                                            </Badge>
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="text-xs max-w-xs"
                                        >
                                          Subclasificación dentro de
                                          Confidenciales: datos con tratamiento
                                          especial según la Ley de Protección de
                                          Datos Personales
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </TableCell>

                                {/* Acciones en fila */}
                                <TableCell
                                  className="text-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex items-center justify-center">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() =>
                                            toggleFuente(fuente.id)
                                          }
                                          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                          aria-label={
                                            isExpanded
                                              ? "Ocultar campos de la fuente"
                                              : "Ver campos de la fuente"
                                          }
                                        >
                                          {isExpanded ? (
                                            <EyeOff className="size-4" />
                                          ) : (
                                            <Eye className="size-4 text-primary" />
                                          )}
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="text-xs"
                                      >
                                        {isExpanded
                                          ? "Ocultar campos y requisitos"
                                          : `Ver ${fuente.campos.length} campos disponibles`}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </TableCell>
                              </TableRow>

                              {/* EXPANDABLE ROW DEL UI KIT (CON CAMPOS SEPARADOS EN ACCESIBLES VS CONFIDENCIALES) */}
                              <TableRow className="bg-transparent dark:bg-transparent hover:bg-transparent dark:hover:bg-transparent">
                                <TableCell
                                  colSpan={6}
                                  className="p-0 border-0 h-auto"
                                >
                                  <div
                                    id={rowContentId}
                                    role="region"
                                    aria-labelledby={`row-${fuente.id}`}
                                    className={cn(
                                      "grid transition-all duration-300 ease-in-out overflow-hidden",
                                      isExpanded
                                        ? "grid-rows-[1fr] opacity-100 py-3"
                                        : "grid-rows-[0fr] opacity-0 py-0"
                                    )}
                                  >
                                    <div className="min-h-0 px-4 pb-2">
                                      <div className="p-5 rounded-2xl border border-border/60 bg-surface shadow-sm space-y-5 text-xs text-left animate-in fade-in duration-300">
                                        {/* Cabecera del Expandable Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                                          <div className="space-y-1">
                                            <span className="font-bold text-foreground text-sm flex items-center gap-2">
                                              <Database className="size-4 text-primary" />
                                              Datos Disponibles en{" "}
                                              {fuente.nombre} (
                                              {fuente.campos.length} campos)
                                            </span>
                                            <p className="text-xs text-muted-foreground">
                                              {fuente.descripcion} • Servicio:{" "}
                                              <strong className="text-foreground">
                                                {fuente.tipoConsumo}
                                              </strong>
                                            </p>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                              size="sm"
                                              asChild
                                              className="gap-1.5 text-xs shadow-xs"
                                            >
                                              <Link
                                                href={`/acceso-interoperabilidad/solicitudes/nueva?fuente=${fuente.id}`}
                                              >
                                                <Send className="size-3.5" />
                                                <span>
                                                  Solicitar acceso a esta fuente
                                                </span>
                                              </Link>
                                            </Button>
                                          </div>
                                        </div>

                                        {/* Sub-sección 1: Campos Accesibles */}
                                        {listaAccesibles.length > 0 && (
                                          <div className="space-y-2.5">
                                            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/25">
                                              <span className="font-bold text-xs text-success flex items-center gap-1.5">
                                                <Unlock className="size-3.5" />
                                                Campos Accesibles (
                                                {listaAccesibles.length})
                                              </span>
                                              <span className="text-[11px] font-medium text-success">
                                                Requisito: Solo finalidad de uso
                                                (PAR-11)
                                              </span>
                                            </div>

                                            <div
                                              className={cn(
                                                "grid gap-3 w-full",
                                                listaAccesibles.length === 1
                                                  ? "grid-cols-1"
                                                  : listaAccesibles.length === 2
                                                  ? "grid-cols-1 sm:grid-cols-2"
                                                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                              )}
                                            >
                                              {listaAccesibles.map((campo) => (
                                                <div
                                                  key={campo.id}
                                                  className="p-3.5 rounded-xl bg-muted/35 border border-border/60 flex flex-col justify-between gap-2.5 hover:border-success/40 transition-colors w-full"
                                                >
                                                  <div className="space-y-1.5">
                                                    <div className="flex items-start justify-between gap-2">
                                                      <span className="font-mono font-bold text-xs text-foreground break-all">
                                                        {campo.nombre}
                                                      </span>
                                                      <Badge
                                                        tone="success"
                                                        appearance="soft"
                                                        size="sm"
                                                        className="gap-1 text-[10px] font-semibold shrink-0"
                                                      >
                                                        <Unlock className="size-3" />
                                                        ACCESIBLE
                                                      </Badge>
                                                    </div>
                                                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                      {campo.descripcion}
                                                    </p>
                                                  </div>

                                                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 text-[10px]">
                                                    <span className="text-muted-foreground font-mono">
                                                      Tipo: {campo.tipo}
                                                    </span>
                                                    <span className="font-semibold text-success">
                                                      Solo finalidad (PAR-11)
                                                    </span>
                                                  </div>
                                                  {modoParametrizacion && (
                                                    <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40">
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="success"
                                                        onClick={() =>
                                                          handleParametrizarCampo(
                                                            fuente.id,
                                                            campo.id,
                                                            "Accesible",
                                                            false
                                                          )
                                                        }
                                                        className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                      >
                                                        <Unlock className="size-2.5" />
                                                        Accesible
                                                      </Button>
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                          handleParametrizarCampo(
                                                            fuente.id,
                                                            campo.id,
                                                            "Confidencial",
                                                            false
                                                          )
                                                        }
                                                        className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                      >
                                                        <Lock className="size-2.5" />
                                                        Confidencial
                                                      </Button>
                                                      <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() =>
                                                          handleParametrizarCampo(
                                                            fuente.id,
                                                            campo.id,
                                                            "Confidencial",
                                                            true
                                                          )
                                                        }
                                                        className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                      >
                                                        <ShieldAlert className="size-2.5" />
                                                        Conf. Sensible
                                                      </Button>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* Sub-sección 2: Campos Confidenciales */}
                                        {listaConfidenciales.length > 0 && (
                                          <div className="space-y-2.5">
                                            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-warning/10 border border-warning/25">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-xs text-warning flex items-center gap-1.5">
                                                  <Lock className="size-3.5" />
                                                  Campos Confidenciales (
                                                  {listaConfidenciales.length})
                                                </span>
                                                {camposSensibles > 0 && (
                                                  <Badge
                                                    tone="danger"
                                                    appearance="soft"
                                                    size="sm"
                                                    className="gap-1 text-[10px] font-bold"
                                                  >
                                                    <ShieldAlert className="size-3" />
                                                    Incluye {camposSensibles} Confidencial{camposSensibles > 1 ? "es" : ""} Sensible{camposSensibles > 1 ? "s" : ""} (LOPDP)
                                                  </Badge>
                                                )}
                                              </div>
                                              <span className="text-[11px] font-semibold text-warning-700 dark:text-warning-400">
                                                Requisito: Finalidad de uso +
                                                Justificación jurídica LOPDP
                                                (PAR-12)
                                              </span>
                                            </div>

                                            <div
                                              className={cn(
                                                "grid gap-3 w-full",
                                                listaConfidenciales.length === 1
                                                  ? "grid-cols-1"
                                                  : listaConfidenciales.length === 2
                                                  ? "grid-cols-1 sm:grid-cols-2"
                                                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                              )}
                                            >
                                              {listaConfidenciales.map(
                                                (campo) => {
                                                  const esSensible = Boolean(
                                                    campo.esSensible
                                                  );
                                                  return (
                                                    <div
                                                      key={campo.id}
                                                      className={cn(
                                                        "p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-colors w-full",
                                                        esSensible
                                                          ? "bg-danger/10 dark:bg-danger-900/25 border-2 border-danger/55 hover:border-danger shadow-2xs"
                                                          : "bg-warning-50/60 dark:bg-warning-900/10 border border-warning-300/80 hover:border-warning"
                                                      )}
                                                    >
                                                      <div className="space-y-1.5">
                                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                                          <span className="font-mono font-bold text-xs text-foreground break-all">
                                                            {campo.nombre}
                                                          </span>
                                                          <div className="flex items-center gap-1 flex-wrap">
                                                            <Badge
                                                              tone="warning"
                                                              appearance="soft"
                                                              size="sm"
                                                              className="gap-1 text-[10px] font-semibold shrink-0"
                                                            >
                                                              <Lock className="size-3" />
                                                              CONFIDENCIAL
                                                            </Badge>
                                                            {esSensible && (
                                                              <Badge
                                                                tone="danger"
                                                                appearance="solid"
                                                                size="sm"
                                                                className="gap-1 text-[10px] font-bold shrink-0"
                                                              >
                                                                <ShieldAlert className="size-3" />
                                                                SENSIBLE · LOPDP
                                                              </Badge>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                                                          {campo.descripcion}
                                                        </p>
                                                        {esSensible && (
                                                          <p className="text-[10px] font-bold text-danger bg-danger/12 border border-danger/30 rounded-md px-2 py-1 leading-snug">
                                                            Tratamiento especial según Ley Orgánica de Protección de Datos Personales (LOPDP).
                                                          </p>
                                                        )}
                                                      </div>

                                                      <div
                                                        className={cn(
                                                          "flex items-center justify-between gap-2 pt-2 border-t text-[10px]",
                                                          esSensible
                                                            ? "border-danger/30"
                                                            : "border-border/40"
                                                        )}
                                                      >
                                                        <span className="text-muted-foreground font-mono">
                                                          Tipo: {campo.tipo}
                                                        </span>
                                                        <span
                                                          className={cn(
                                                            "font-bold",
                                                            esSensible
                                                              ? "text-danger"
                                                              : "text-warning-700 dark:text-warning-400"
                                                          )}
                                                        >
                                                          {esSensible
                                                            ? "Finalidad + Jurídica (Sensible LOPDP)"
                                                            : "Finalidad + Jurídica (PAR-12)"}
                                                        </span>
                                                      </div>

                                                      {modoParametrizacion && (
                                                        <div className="flex flex-wrap items-center gap-1 pt-2 border-t border-border/40">
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() =>
                                                              handleParametrizarCampo(
                                                                fuente.id,
                                                                campo.id,
                                                                "Accesible",
                                                                false
                                                              )
                                                            }
                                                            className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                          >
                                                            <Unlock className="size-2.5" />
                                                            Accesible
                                                          </Button>
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                              !esSensible
                                                                ? "warning"
                                                                : "ghost"
                                                            }
                                                            onClick={() =>
                                                              handleParametrizarCampo(
                                                                fuente.id,
                                                                campo.id,
                                                                "Confidencial",
                                                                false
                                                              )
                                                            }
                                                            className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                          >
                                                            <Lock className="size-2.5" />
                                                            Confidencial
                                                          </Button>
                                                          <Button
                                                            type="button"
                                                            size="sm"
                                                            variant={
                                                              esSensible
                                                                ? "danger"
                                                                : "ghost"
                                                            }
                                                            onClick={() =>
                                                              handleParametrizarCampo(
                                                                fuente.id,
                                                                campo.id,
                                                                "Confidencial",
                                                                true
                                                              )
                                                            }
                                                            className="h-6 px-2 text-[10px] font-semibold gap-1"
                                                          >
                                                            <ShieldAlert className="size-2.5" />
                                                            Conf. Sensible
                                                          </Button>
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                }
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            </React.Fragment>
                          );
                        }
                      )}
                            </React.Fragment>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* 2. VISTA DE TARJETAS AGRUPADA POR INSTITUCIÓN (viewMode === "cards" o Mobile <md) */}
                <div
                  className={cn(
                    "w-full space-y-4",
                    viewMode === "cards" ? "block" : "block md:hidden"
                  )}
                >
                  {groupedPaginatedInstituciones.map(
                    ({ institucion: groupInst, items: groupItems }) => {
                      const isInstExpanded =
                        expandedInstituciones[groupInst.id] ?? true;
                      const totalInstCampos = groupItems.reduce(
                        (acc, it) => acc + it.fuente.campos.length,
                        0
                      );
                      return (
                        <div
                          key={`card-inst-group-${groupInst.id}`}
                          className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs"
                        >
                          <div
                            onClick={() => toggleInstitucion(groupInst.id)}
                            className="cursor-pointer px-4 py-3 bg-primary/10 hover:bg-primary/15 dark:bg-primary/15 dark:hover:bg-primary/25 border-l-4 border-l-primary flex flex-wrap items-center justify-between gap-2 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <ChevronRight
                                className={cn(
                                  "size-4 text-primary transition-transform duration-200",
                                  isInstExpanded && "rotate-90"
                                )}
                              />
                              <Building2 className="size-4 text-primary shrink-0" />
                              <Badge
                                tone="primary"
                                appearance="solid"
                                size="sm"
                                className="font-bold text-[10px] tracking-wider !text-white px-2 py-0.5 shadow-2xs"
                              >
                                {groupInst.sigla}
                              </Badge>
                              <span className="font-heading font-bold text-xs sm:text-sm text-foreground">
                                {groupInst.nombre}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                tone="primary"
                                appearance="soft"
                                size="sm"
                                className="text-[11px] font-semibold"
                              >
                                {groupItems.length}{" "}
                                {groupItems.length === 1
                                  ? "fuente"
                                  : "fuentes"}
                              </Badge>
                              <Badge
                                tone="neutral"
                                appearance="outline"
                                size="sm"
                                className="text-[11px] font-semibold"
                              >
                                {totalInstCampos} campos
                              </Badge>
                            </div>
                          </div>
                          {isInstExpanded && (
                            <div className="p-3 sm:p-4 border-t border-border/60 bg-muted/10">
                              <div
                                className={cn(
                                  groupItems.length === 1
                                    ? "grid grid-cols-1 gap-4"
                                    : "grid grid-cols-1 lg:grid-cols-2 gap-4"
                                )}
                              >
                                {groupItems.map((item) => renderFuenteCard(item))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Paginación UI Kit */}
            {fuentesFiltradas.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border mt-2 w-full">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-muted-foreground order-2 sm:order-1">
                  <p>
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {(safeCurrentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(
                        safeCurrentPage * pageSize,
                        fuentesFiltradas.length
                      )}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">
                      {fuentesFiltradas.length}
                    </span>{" "}
                    fuentes disponibles
                  </p>

                  <div className="flex items-center gap-2">
                    <span>Fuentes por página:</span>
                    <div className="inline-flex rounded-full border border-border p-0.5 bg-surface shadow-2xs">
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
                          className={cn(
                            safeCurrentPage <= 1 &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={cn(
                            safeCurrentPage <= 1 &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= safeCurrentPage - 1 &&
                            page <= safeCurrentPage + 1)
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
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className={cn(
                            safeCurrentPage >= totalPages &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLast
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn(
                            safeCurrentPage >= totalPages &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
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
