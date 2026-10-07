"use client";

import React, { useState, useMemo } from "react";
import {
  History,
  ShieldAlert,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  UserCheck,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSuplenciasStore,
  type SuplenciaInstitucional,
  type EstadoSuplencia,
} from "../data/suplencias-store";
import { SuplenciasStatusSummary } from "../components/suplencia-status-card";
import { TrazabilidadSuplenciaDialog } from "../components/trazabilidad-suplencia-dialog";
import { ActivarSuplenciaDialog } from "../components/activar-suplencia-dialog";
import { DesactivarSuplenciaDialog } from "../components/desactivar-suplencia-dialog";

const ESTADOS_CATALOGO = [
  { value: "TODOS", label: "Todos los estados" },
  { value: "ACTIVA", label: "Activa" },
  { value: "PROGRAMADA", label: "Programada" },
  { value: "ADMINISTRATIVA", label: "Activa adm." },
  { value: "SIN_SUPLENCIA", label: "Sin suplencia" },
  { value: "ACTIVACION_PENDIENTE", label: "Activación pendiente" },
  { value: "FINALIZADA", label: "Finalizada" },
  { value: "DESACTIVADA_ADMINISTRATIVAMENTE", label: "Desactivada adm." },
];

const MODALIDADES_CATALOGO = [
  { value: "TODAS", label: "Todas las modalidades" },
  { value: "PROGRAMADA", label: "Programada" },
  { value: "ADMINISTRATIVA", label: "Administrativa" },
  { value: "NINGUNA", label: "Ninguna" },
];

export function GestionSuplenciasView() {
  const store = useSuplenciasStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroModalidad, setFiltroModalidad] = useState<string>("TODAS");

  const [estadoSearch, setEstadoSearch] = useState("");
  const [modalidadSearch, setModalidadSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Diálogos de acción
  const [suplenciaActivar, setSuplenciaActivar] = useState<SuplenciaInstitucional | null>(null);
  const [suplenciaDesactivar, setSuplenciaDesactivar] = useState<SuplenciaInstitucional | null>(null);
  const [trazabilidadSeleccionada, setTrazabilidadSeleccionada] = useState<SuplenciaInstitucional | null>(null);

  // Conteos para el resumen superior (4 cards compactas del UI Kit)
  const stats = useMemo(() => {
    let activas = 0;
    let programadas = 0;
    let administrativas = 0;
    let sinSuplencia = 0;

    store.suplencias.forEach((s) => {
      if (s.estado === "ACTIVA") activas++;
      if (s.estado === "PROGRAMADA") programadas++;
      if (s.modalidad === "ADMINISTRATIVA" && s.estado === "ACTIVA") administrativas++;
      if (s.estado === "SIN_SUPLENCIA") sinSuplencia++;
    });

    return { activas, programadas, administrativas, sinSuplencia };
  }, [store.suplencias]);

  // Filtrado de la tabla institucional
  const listaFiltrada = useMemo(() => {
    return store.suplencias.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.institucion.toLowerCase().includes(q) ||
        item.rucInstitucion.includes(q) ||
        item.titular.nombre.toLowerCase().includes(q) ||
        item.titular.cedula.includes(q) ||
        item.suplente.nombre.toLowerCase().includes(q) ||
        item.suplente.cedula.includes(q);

      const matchEstado =
        filtroEstado === "TODOS" ||
        item.estado === filtroEstado ||
        (filtroEstado === "ADMINISTRATIVA" && item.modalidad === "ADMINISTRATIVA");

      const matchModalidad =
        filtroModalidad === "TODAS" || item.modalidad === filtroModalidad;

      return matchSearch && matchEstado && matchModalidad;
    });
  }, [store.suplencias, searchTerm, filtroEstado, filtroModalidad]);

  // Paginación
  const totalPages = Math.ceil(listaFiltrada.length / pageSize) || 1;
  const paginatedLista = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return listaFiltrada.slice(start, start + pageSize);
  }, [listaFiltrada, currentPage, pageSize]);

  // Opciones filtradas en comboboxes
  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_CATALOGO;
    return ESTADOS_CATALOGO.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase())
    );
  }, [estadoSearch]);

  const filteredModalidadesForFilter = useMemo(() => {
    if (!modalidadSearch.trim()) return MODALIDADES_CATALOGO;
    return MODALIDADES_CATALOGO.filter((m) =>
      m.label.toLowerCase().includes(modalidadSearch.toLowerCase())
    );
  }, [modalidadSearch]);

  const handleSetFilterEstado = (estado: string) => {
    setFiltroEstado(estado);
    const opt = ESTADOS_CATALOGO.find((e) => e.value === estado);
    if (opt && opt.value !== "TODOS") {
      setEstadoSearch(opt.label);
    } else {
      setEstadoSearch("");
    }
    setCurrentPage(1);
  };

  const handleSetFilterModalidad = (modalidad: string) => {
    setFiltroModalidad(modalidad);
    const opt = MODALIDADES_CATALOGO.find((m) => m.value === modalidad);
    if (opt && opt.value !== "TODAS") {
      setModalidadSearch(opt.label);
    } else {
      setModalidadSearch("");
    }
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setFiltroEstado("TODOS");
    setFiltroModalidad("TODAS");
    setEstadoSearch("");
    setModalidadSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() !== "" ||
    filtroEstado !== "TODOS" ||
    filtroModalidad !== "TODAS"
  );

  const handleActivarConfirm = (motivo: string) => {
    if (!suplenciaActivar) return false;
    return store.activarSuplenciaAdministrativa(suplenciaActivar.idInstitucion, motivo);
  };

  const handleDesactivarConfirm = (motivoDesactivacion: string) => {
    if (!suplenciaDesactivar) return false;
    return store.desactivarSuplenciaAdministrativa(suplenciaDesactivar.idInstitucion, motivoDesactivacion);
  };

  // Helper para renderizar Badge de Estado con estilos del UI Kit
  const renderBadgeEstado = (estado: EstadoSuplencia) => {
    switch (estado) {
      case "SIN_SUPLENCIA":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-xs">
            Sin suplencia
          </Badge>
        );
      case "PROGRAMADA":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <Calendar className="size-3" />
            Programada
          </Badge>
        );
      case "ACTIVA":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-xs gap-1.5">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Activa
          </Badge>
        );
      case "ACTIVACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <Clock className="size-3" />
            Activación pendiente
          </Badge>
        );
      case "FINALIZADA":
        return (
          <Badge tone="neutral" appearance="outline" size="sm" className="font-medium text-xs gap-1">
            <CheckCircle2 className="size-3" />
            Finalizada
          </Badge>
        );
      case "DESACTIVADA_ADMINISTRATIVAMENTE":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <XCircle className="size-3" />
            Desactivada adm.
          </Badge>
        );
      case "DESPLAZADA_POR_SUPLENCIA_MANUAL":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold text-xs gap-1">
            <AlertTriangle className="size-3" />
            Desplazada por adm.
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <WireframeDashboardLayout
      currentRole="ADMIN"
      breadcrumbs={[
        { label: "Administración", href: "/gestion-suplencias" },
        { label: "Gestión de suplencias" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal (Tarjetas, Encabezado y Tabla) */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* ──────────────────────────────────────────────────────────── */}
          {/* ENCABEZADO PRINCIPAL                                         */}
          {/* ──────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Gestión de suplencias
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Consulta el estado de las coordinaciones institucionales y gestiona activaciones administrativas cuando un titular no pueda programar su inactividad.
              </p>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* CARDS KPI / RESUMEN (ESTILO CUENTAS INTERNAS)                */}
          {/* ──────────────────────────────────────────────────────────── */}
          <SuplenciasStatusSummary
            activas={stats.activas}
            programadas={stats.programadas}
            administrativas={stats.administrativas}
            sinSuplencia={stats.sinSuplencia}
            filtroEstadoSeleccionado={filtroEstado}
            onSelectFiltro={(nuevoFiltro) => {
              handleSetFilterEstado(nuevoFiltro);
            }}
          />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* FILTROS Y BÚSQUEDA (ESTILO CUENTAS INTERNAS)                 */}
          {/* ──────────────────────────────────────────────────────────── */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por institución, RUC, titular o suplente..."
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

              {/* Filtros Combobox UI Kit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto shrink-0">
                {/* Filtro Estado */}
                <div className="w-full xl:w-[220px] min-w-0">
                  <Combobox
                    value={filtroEstado === "TODOS" ? null : filtroEstado}
                    onValueChange={(val) => {
                      handleSetFilterEstado(val || "TODOS");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ESTADOS_CATALOGO.find(
                        (e) => e.value.toLowerCase() === newSearch.toLowerCase() || e.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setEstadoSearch(opt.label);
                      else if (newSearch === "TODOS") setEstadoSearch("");
                      else setEstadoSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todos los estados"
                      showClear={filtroEstado !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[240px] z-[80]">
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

                {/* Filtro Modalidad */}
                <div className="w-full xl:w-[200px] min-w-0">
                  <Combobox
                    value={filtroModalidad === "TODAS" ? null : filtroModalidad}
                    onValueChange={(val) => {
                      handleSetFilterModalidad(val || "TODAS");
                    }}
                    inputValue={modalidadSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = MODALIDADES_CATALOGO.find(
                        (m) => m.value.toLowerCase() === newSearch.toLowerCase() || m.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setModalidadSearch(opt.label);
                      else if (newSearch === "TODAS") setModalidadSearch("");
                      else setModalidadSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las modalidades"
                      showClear={filtroModalidad !== "TODAS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[220px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por modalidad</ComboboxLabel>
                          {filteredModalidadesForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredModalidadesForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron modalidades.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
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
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filtroEstado !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Estado: {ESTADOS_CATALOGO.find((e) => e.value === filtroEstado)?.label || filtroEstado}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {ESTADOS_CATALOGO.find((e) => e.value === filtroEstado)?.label || filtroEstado}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetFilterEstado("TODOS");
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filtroModalidad !== "TODAS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Modalidad: {MODALIDADES_CATALOGO.find((m) => m.value === filtroModalidad)?.label || filtroModalidad}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Modalidad: {MODALIDADES_CATALOGO.find((m) => m.value === filtroModalidad)?.label || filtroModalidad}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetFilterModalidad("TODAS");
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de modalidad"
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

          {/* ──────────────────────────────────────────────────────────── */}
          {/* TABLA SIN CONTENEDOR (ESTILO CUENTAS INTERNAS)               */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TooltipProvider delayDuration={150}>
            {/* Desktop Table (md+) */}
            <div className="hidden md:block w-full">
              <Table
                className="w-full min-w-[1240px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[280px] min-w-[260px] whitespace-nowrap text-left pl-6">
                      INSTITUCIÓN
                    </TableHead>
                    <TableHead className="w-[230px] min-w-[210px] whitespace-nowrap text-left">
                      COORDINADOR TITULAR
                    </TableHead>
                    <TableHead className="w-[230px] min-w-[210px] whitespace-nowrap text-left">
                      COORDINADOR SUPLENTE
                    </TableHead>
                    <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-left">
                      MODALIDAD
                    </TableHead>
                    <TableHead className="w-[170px] min-w-[160px] whitespace-nowrap text-left">
                      PERIODO
                    </TableHead>
                    <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left">
                      ÚLTIMA ACTUALIZACIÓN
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[110px] whitespace-nowrap text-right pr-6">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLista.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Users className="size-8 stroke-[1.5] text-muted-foreground/60" />
                          <p className="text-sm font-semibold text-foreground">
                            No se encontraron coordinaciones
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ajusta los filtros de búsqueda para consultar otros registros.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLista.map((item) => (
                      <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                        {/* 1. Institución y RUC */}
                        <TableCell className="w-[280px] min-w-[260px] text-left align-middle pl-6">
                          <div className="space-y-0.5 min-w-0 pr-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs font-bold text-foreground block truncate max-w-full cursor-help">
                                  {item.institucion}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {item.institucion}
                              </TooltipContent>
                            </Tooltip>
                            <p className="text-[11px] text-muted-foreground font-mono block">
                              RUC: {item.rucInstitucion}
                            </p>
                          </div>
                        </TableCell>

                        {/* 2. Coordinador Titular */}
                        <TableCell className="w-[230px] min-w-[210px] text-left align-middle">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className="text-xs font-semibold text-foreground truncate block">
                              {item.titular.nombre}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                              <span>C.I. {item.titular.cedula}</span>
                              {item.titular.estado === "ACTIVO" ? (
                                <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 3. Coordinador Suplente */}
                        <TableCell className="w-[230px] min-w-[210px] text-left align-middle">
                          <div className="space-y-0.5 min-w-0 pr-2">
                            <p className="text-xs font-semibold text-foreground truncate block">
                              {item.suplente.nombre}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                              <span>C.I. {item.suplente.cedula}</span>
                              {item.suplente.estado === "ACTIVO" ? (
                                <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] px-1.5 py-0 h-4">
                                  Activo
                                </Badge>
                              ) : (
                                <Badge tone="neutral" appearance="soft" size="sm" className="font-medium text-[10px] px-1.5 py-0 h-4">
                                  Enrolada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* 4. Modalidad */}
                        <TableCell className="w-[140px] min-w-[130px] text-left align-middle whitespace-nowrap">
                          {item.modalidad === "PROGRAMADA" ? (
                            <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-xs">
                              Programada
                            </Badge>
                          ) : item.modalidad === "ADMINISTRATIVA" ? (
                            <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs">
                              Administrativa
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          )}
                        </TableCell>

                        {/* 5. Periodo */}
                        <TableCell className="w-[170px] min-w-[160px] text-left align-middle whitespace-nowrap">
                          {item.fechaInicial && item.fechaFinal ? (
                            <div className="space-y-0.5 font-mono text-[11px]">
                              <span className="text-foreground font-semibold block">{item.fechaInicial}</span>
                              <span className="text-muted-foreground block text-[10px]">al {item.fechaFinal}</span>
                            </div>
                          ) : item.modalidad === "ADMINISTRATIVA" && item.estado === "ACTIVA" ? (
                            <span className="text-[11px] font-medium text-warning font-sans">
                              Vigente hasta desactivación
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground font-mono">—</span>
                          )}
                        </TableCell>

                        {/* 6. Estado */}
                        <TableCell className="w-[150px] min-w-[140px] text-left align-middle whitespace-nowrap">
                          <div className="inline-flex items-center justify-start">
                            {renderBadgeEstado(item.estado)}
                          </div>
                        </TableCell>

                        {/* 7. Última actualización */}
                        <TableCell className="w-[150px] min-w-[140px] text-left align-middle whitespace-nowrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start text-left cursor-help">
                                <span className="text-foreground font-semibold">
                                  {item.ultimaActualizacion.split(" ")[0]}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {item.ultimaActualizacion.split(" ")[1] || ""}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Última actualización: {item.ultimaActualizacion}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>

                        {/* 8. Acciones (Solo icono + Tooltip) */}
                        <TableCell className="w-[120px] min-w-[110px] pr-6 text-right align-middle whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 justify-end w-full">
                            {/* Ver trazabilidad */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setTrazabilidadSeleccionada(item)}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                  aria-label={`Ver trazabilidad de ${item.institucion}`}
                                >
                                  <History className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Ver trazabilidad</TooltipContent>
                            </Tooltip>

                            {/* Desactivar suplencia administrativa */}
                            {item.estado === "ACTIVA" && item.modalidad === "ADMINISTRATIVA" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setSuplenciaDesactivar(item)}
                                    className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
                                    aria-label="Desactivar suplencia administrativa"
                                  >
                                    <RotateCcw className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Desactivar suplencia</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Activa por programación de titular (informativo) */}
                            {item.estado === "ACTIVA" && item.modalidad === "PROGRAMADA" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled
                                    className="text-muted-foreground/30 cursor-not-allowed"
                                    aria-label="Activa por titular"
                                  >
                                    <ShieldCheck className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Activa por programación del titular</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Programada por titular (informativo) */}
                            {item.estado === "PROGRAMADA" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    disabled
                                    className="text-muted-foreground/30 cursor-not-allowed"
                                    aria-label="Programada a futuro"
                                  >
                                    <Calendar className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Inactividad programada por titular</TooltipContent>
                              </Tooltip>
                            )}

                            {/* Activar suplencia administrativa (cuando no hay suplencia activa) */}
                            {(item.estado === "SIN_SUPLENCIA" || item.estado === "FINALIZADA" || item.estado === "DESACTIVADA_ADMINISTRATIVAMENTE") && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setSuplenciaActivar(item)}
                                    className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                    aria-label="Activar suplencia administrativa"
                                  >
                                    <ShieldAlert className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Activar suplencia administrativa</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards (<md) */}
            <div className="block md:hidden w-full space-y-3.5">
              {paginatedLista.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <Users className="size-8 stroke-[1.5] text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">No se encontraron coordinaciones</p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros de búsqueda para consultar otros registros.
                  </p>
                </div>
              ) : (
                paginatedLista.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/70">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground break-words">{item.institucion}</p>
                        <p className="text-[11px] font-mono text-muted-foreground">RUC: {item.rucInstitucion}</p>
                      </div>
                      <div className="shrink-0">{renderBadgeEstado(item.estado)}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-surface/80 border border-border/40 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Titular</span>
                          {item.titular.estado === "ACTIVO" ? (
                            <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[9px] px-1 py-0 h-3.5">
                              Activo
                            </Badge>
                          ) : (
                            <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-[9px] px-1 py-0 h-3.5">
                              Inactivo
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-foreground truncate">{item.titular.nombre}</p>
                        <span className="text-[10px] font-mono text-muted-foreground block">{item.titular.cedula}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface/80 border border-border/40 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">Suplente</span>
                          {item.suplente.estado === "ACTIVO" ? (
                            <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[9px] px-1 py-0 h-3.5">
                              Activo
                            </Badge>
                          ) : (
                            <Badge tone="neutral" appearance="soft" size="sm" className="font-medium text-[9px] px-1 py-0 h-3.5">
                              Enrolada
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-foreground truncate">{item.suplente.nombre}</p>
                        <span className="text-[10px] font-mono text-muted-foreground block">{item.suplente.cedula}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {item.ultimaActualizacion}
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setTrazabilidadSeleccionada(item)}
                              aria-label="Ver trazabilidad"
                            >
                              <History className="size-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Ver trazabilidad</TooltipContent>
                        </Tooltip>

                        {item.estado === "ACTIVA" && item.modalidad === "ADMINISTRATIVA" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSuplenciaDesactivar(item)}
                                aria-label="Desactivar suplencia"
                              >
                                <RotateCcw className="size-4 text-danger" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Desactivar suplencia</TooltipContent>
                          </Tooltip>
                        )}

                        {(item.estado === "SIN_SUPLENCIA" || item.estado === "FINALIZADA" || item.estado === "DESACTIVADA_ADMINISTRATIVAMENTE") && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setSuplenciaActivar(item)}
                                aria-label="Activar suplencia"
                              >
                                <ShieldAlert className="size-4 text-warning" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Activar suplencia administrativa</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TooltipProvider>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* PAGINACIÓN ESTÁNDAR (ESTILO CUENTAS INTERNAS)                */}
          {/* ──────────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {listaFiltrada.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, listaFiltrada.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{listaFiltrada.length}</span> coordinaciones
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

            {/* Navegación de páginas con UI Kit */}
            <div className="order-1 sm:order-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(1);
                      }}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
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
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────── */}
          {/* MODAL DE TRAZABILIDAD (DIALOG ORGANIZADO)                    */}
          {/* ──────────────────────────────────────────────────────────── */}
          <TrazabilidadSuplenciaDialog
            suplencia={trazabilidadSeleccionada}
            open={!!trazabilidadSeleccionada}
            onOpenChange={(open) => {
              if (!open) setTrazabilidadSeleccionada(null);
            }}
          />

          {/* ──────────────────────────────────────────────────────────── */}
          {/* DIÁLOGOS DE ACTIVACIÓN Y DESACTIVACIÓN ADMINISTRATIVA        */}
          {/* ──────────────────────────────────────────────────────────── */}
          {suplenciaActivar && (
            <ActivarSuplenciaDialog
              open={!!suplenciaActivar}
              onOpenChange={(open) => {
                if (!open) setSuplenciaActivar(null);
              }}
              suplencia={suplenciaActivar}
              onConfirm={handleActivarConfirm}
            />
          )}

          {suplenciaDesactivar && (
            <DesactivarSuplenciaDialog
              open={!!suplenciaDesactivar}
              onOpenChange={(open) => {
                if (!open) setSuplenciaDesactivar(null);
              }}
              suplencia={suplenciaDesactivar}
              onConfirm={handleDesactivarConfirm}
            />
          )}
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
