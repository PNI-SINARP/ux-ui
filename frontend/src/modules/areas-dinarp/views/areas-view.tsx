"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Eye,
  Edit2,
  ShieldAlert,
  CheckCircle2,
  Ban,
  RotateCcw,
  Trash2,
  Users,
  FileText,
  CheckSquare,
  AlertCircle,
  Clock,
  X,
  UserCheck,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
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
  ComboboxGroup,
  ComboboxLabel,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAreasStore } from "../data/areas-store";
import { AreaDinarp, EstadoArea } from "../data/areas-types";
import { AreaFormModal } from "../components/area-form-modal";
import { AreaImpactoDialog } from "../components/area-impacto-dialog";
import { AreaActivarDialog } from "../components/area-activar-dialog";
import { AreaEliminarDialog } from "../components/area-eliminar-dialog";

const ESTADOS_OPCIONES = [
  { value: "TODOS", label: "Todos los estados" },
  { value: "Activa", label: "Activa" },
  { value: "Borrador", label: "Borrador" },
  { value: "Inactiva", label: "Inactiva" },
];

export function AreasView() {
  const {
    areas,
    isLoaded,
    calcularImpacto,
    crearArea,
    editarArea,
    activarArea,
    inactivarArea,
    reactivarArea,
    eliminarArea,
    simularResolucionObligaciones,
  } = useAreasStore();

  // Filtros y búsqueda (estilo cuentas-internas)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");

  // Paginación (estilo cuentas-internas: selector 5, 10, 15)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Estados de modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [areaParaEditar, setAreaParaEditar] = useState<AreaDinarp | null>(null);

  const [modalImpactoOpen, setModalImpactoOpen] = useState(false);
  const [areaSeleccionada, setAreaSeleccionada] = useState<AreaDinarp | null>(null);
  const [esFlujoInactivacion, setEsFlujoInactivacion] = useState(false);

  const [modalActivarOpen, setModalActivarOpen] = useState(false);
  const [tipoActivacion, setTipoActivacion] = useState<"ACTIVAR" | "REACTIVAR">("ACTIVAR");

  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);

  // Modal de confirmación de éxito tras acción completada (ConfirmDialog Success)
  const [successFeedback, setSuccessFeedback] = useState<{
    title: string;
    description: string;
    areaNombre: string;
    codigo: string;
    nuevoEstado: string;
    version: string;
  } | null>(null);

  // Métricas / KPIs
  const kpis = useMemo(() => {
    return {
      total: areas.length,
      activas: areas.filter((a) => a.estado === "Activa").length,
      borradores: areas.filter((a) => a.estado === "Borrador").length,
      inactivas: areas.filter((a) => a.estado === "Inactiva").length,
    };
  }, [areas]);

  // Manejo de filtro de estado
  const handleSetFilterEstado = (nuevoEstado: string) => {
    setFilterEstado(nuevoEstado);
    const opt = ESTADOS_OPCIONES.find((e) => e.value === nuevoEstado);
    setEstadoSearch(nuevoEstado === "TODOS" ? "" : opt ? opt.label : nuevoEstado);
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterEstado("TODOS");
    setEstadoSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || filterEstado !== "TODOS";

  // Filtrado de estados para el Combobox
  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_OPCIONES;
    const q = estadoSearch.toLowerCase();
    return ESTADOS_OPCIONES.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [estadoSearch]);

  // Filtrado de áreas
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchEstado =
        filterEstado === "TODOS" || area.estado.toLowerCase() === filterEstado.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchTexto =
        !q ||
        area.codigo.toLowerCase().includes(q) ||
        area.nombre.toLowerCase().includes(q) ||
        area.responsableNombre.toLowerCase().includes(q) ||
        area.descripcion.toLowerCase().includes(q);

      return matchEstado && matchTexto;
    });
  }, [areas, searchQuery, filterEstado]);

  // Paginación calculada
  const totalPages = Math.ceil(filteredAreas.length / pageSize) || 1;
  const paginatedAreas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAreas.slice(start, start + pageSize);
  }, [filteredAreas, currentPage, pageSize]);

  // Acciones
  const handleAbrirCrear = () => {
    setAreaParaEditar(null);
    setModalFormOpen(true);
  };

  const handleAbrirEditar = (area: AreaDinarp) => {
    setAreaParaEditar(area);
    setModalFormOpen(true);
  };

  const handleAbrirImpacto = (area: AreaDinarp, isInactivating: boolean = false) => {
    setAreaSeleccionada(area);
    setEsFlujoInactivacion(isInactivating);
    setModalImpactoOpen(true);
  };

  const handleAbrirActivar = (area: AreaDinarp) => {
    setAreaSeleccionada(area);
    setTipoActivacion(area.estado === "Inactiva" ? "REACTIVAR" : "ACTIVAR");
    setModalActivarOpen(true);
  };

  const handleAbrirEliminar = (area: AreaDinarp) => {
    setAreaSeleccionada(area);
    setModalEliminarOpen(true);
  };

  // Helper de badge de estado consistente con UI Kit
  const getEstadoBadge = (estado: EstadoArea) => {
    switch (estado) {
      case "Activa":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Activa
          </Badge>
        );
      case "Borrador":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Borrador
          </Badge>
        );
      case "Inactiva":
        return (
          <Badge
            tone="danger"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Inactiva
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

  // Color de acento de Tarjeta Interactiva según el estado para mobile
  const getEstadoCardColor = (
    estado: EstadoArea
  ): "default" | "primary" | "info" | "warning" | "success" | "danger" => {
    switch (estado) {
      case "Activa":
        return "success";
      case "Borrador":
        return "warning";
      case "Inactiva":
        return "danger";
      default:
        return "default";
    }
  };

  // Renderizado de tarjeta interactiva para Mobile (<md)
  const renderAreaCard = (area: AreaDinarp) => {
    const impacto = calcularImpacto(area);
    const cuentasActivas = area.usuarios.filter((u) => u.estado !== "RETIRADO").length;

    return (
      <InteractiveCard
        key={area.id}
        color={getEstadoCardColor(area.estado)}
        decorativeIcon={<Building2 className="size-full stroke-[0.8]" />}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
        className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
      >
        {/* Cabecera de tarjeta */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              href={`/areas/${area.codigo}`}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug cursor-pointer block"
            >
              {area.nombre}
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span className="font-bold text-primary">CÓD: {area.codigo}</span>
              <span className="text-muted-foreground/40 font-bold">•</span>
              <span>Versión {area.version}</span>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">{getEstadoBadge(area.estado)}</div>
        </div>

        {/* Descripción */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {area.descripcion}
        </p>

        {/* Responsable & Cuentas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Responsable
            </span>
            <p className="text-xs font-semibold text-foreground truncate">{area.responsableNombre}</p>
            <p className="text-[10px] text-muted-foreground truncate">{area.responsableCargo}</p>
          </div>

          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Vínculos institucionales
            </span>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-primary">
                <Users className="size-3" /> {cuentasActivas} usuarios
              </span>
              <span className="text-muted-foreground/40 font-bold">•</span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <FileText className="size-3" /> {area.tramites.length} trámites
              </span>
            </div>
          </div>
        </div>

        {/* Acciones móviles */}
        <div className="pt-2 border-t border-border/60 w-full grid grid-cols-2 gap-2">
          <Link href={`/areas/${area.codigo}`} className="w-full">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
            >
              <Eye className="size-3.5 text-muted-foreground" />
              <span>Ver detalle</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAbrirEditar(area)}
            className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
          >
            <Edit2 className="size-3.5 text-muted-foreground" />
            <span>Editar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAbrirImpacto(area, false)}
            className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
          >
            <ShieldAlert className="size-3.5" />
            <span>Impacto</span>
          </Button>

          {area.estado === "Borrador" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAbrirActivar(area)}
              className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Activar</span>
            </Button>
          )}

          {area.estado === "Activa" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAbrirImpacto(area, true)}
              className="w-full text-xs font-semibold gap-1.5 text-danger border-danger/40 hover:bg-danger/10 hover:text-danger cursor-pointer h-9 justify-center"
            >
              <Ban className="size-3.5" />
              <span>Inactivar</span>
            </Button>
          )}

          {area.estado === "Inactiva" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAbrirActivar(area)}
              className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
            >
              <RotateCcw className="size-3.5" />
              <span>Reactivar</span>
            </Button>
          )}
        </div>
      </InteractiveCard>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="areas"
      allowedRoles={["ADMIN"]}
      breadcrumbs={[{ label: "Áreas DINARP" }]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal (Tarjetas, Encabezado y Tabla) - Mismo estándar que /cuentas-internas */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Gestión de Áreas DINARP
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Administra el catálogo orgánico institucional, control de versiones, trazabilidad y análisis de impacto del SINARP.
              </p>
            </div>

            {/* Acción de Cabecera: Creación */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAbrirCrear}
                leftIcon={<Plus className="size-4" />}
              >
                Nueva área
              </Button>
            </div>
          </div>

          {/* Cards de Resumen Compactas (4 Estados / Métricas Interactivas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* Activas */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "Activa" ? "TODOS" : "Activa");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "Activa" ? "TODOS" : "Activa");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "Activa"
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
                      filterEstado === "Activa"
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
                    Operativas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Áreas Activas</p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.activas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Borradores */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "Borrador" ? "TODOS" : "Borrador");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "Borrador" ? "TODOS" : "Borrador");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "Borrador"
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
                      filterEstado === "Borrador"
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
                    Formulación
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Borradores</p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.borradores}
                  </p>
                </div>
              </div>
            </Card>

            {/* Inactivas */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "Inactiva" ? "TODOS" : "Inactiva");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "Inactiva" ? "TODOS" : "Inactiva");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "Inactiva"
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
                      filterEstado === "Inactiva"
                        ? "bg-danger text-white shadow-xs"
                        : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                    )}
                  >
                    <Ban className="size-5" />
                  </div>
                  <Badge
                    tone="danger"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Retiradas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Áreas Inactivas</p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.inactivas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total General */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado("TODOS");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado("TODOS");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "TODOS"
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
                      filterEstado === "TODOS"
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                    )}
                  >
                    <Building2 className="size-5" />
                  </div>
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Catálogo
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">Total de Áreas</p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.total}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Búsqueda con UI Kit Oficial (Mismo estándar que /cuentas-internas) */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por código, nombre, responsable o descripción..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Filtro Estado Combobox */}
              <div className="w-full xl:w-[220px] min-w-0 shrink-0">
                <Combobox
                  value={filterEstado === "TODOS" ? null : filterEstado}
                  onValueChange={(val) => {
                    handleSetFilterEstado(val || "TODOS");
                  }}
                  inputValue={estadoSearch}
                  onInputValueChange={(newSearch) => {
                    const opt = ESTADOS_OPCIONES.find((e) => e.value === newSearch);
                    if (opt) setEstadoSearch(opt.label);
                    else if (newSearch === "TODOS") setEstadoSearch("");
                    else setEstadoSearch(newSearch);
                  }}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Todos los estados"
                    showClear={filterEstado !== "TODOS"}
                    showTrigger={true}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[230px] z-[80]">
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

                {searchQuery.trim() !== "" && (
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                  >
                    <span className="max-w-[180px] sm:max-w-[260px] truncate">
                      Búsqueda: &ldquo;{searchQuery}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterEstado !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <span>Estado: {filterEstado}</span>
                    <button
                      type="button"
                      onClick={() => handleSetFilterEstado("TODOS")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
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

          <TooltipProvider delayDuration={150}>
            {/* Tabla de Áreas DINARP (Desktop md+) */}
            <div className="hidden md:block w-full">
              <Table
                className="w-full min-w-[1100px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[120px] min-w-[110px] whitespace-nowrap text-left pl-6">
                      CÓDIGO
                    </TableHead>
                    <TableHead className="w-[260px] min-w-[240px] whitespace-nowrap text-left">
                      NOMBRE DEL ÁREA
                    </TableHead>
                    <TableHead className="w-[280px] min-w-[240px] whitespace-nowrap text-left">
                      DESCRIPCIÓN
                    </TableHead>
                    <TableHead className="w-[200px] min-w-[180px] whitespace-nowrap text-left">
                      RESPONSABLE
                    </TableHead>
                    <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-center">
                      USUARIOS VINCULADOS
                    </TableHead>
                    <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap text-center">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[90px] min-w-[80px] whitespace-nowrap text-center">
                      VERSIÓN
                    </TableHead>
                    <TableHead className="w-[160px] min-w-[150px] whitespace-nowrap text-right pr-6">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAreas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Building2 className="size-8 stroke-[1.5] text-muted-foreground/60" />
                          <p className="text-sm font-semibold text-foreground">
                            No se encontraron áreas orgánicas
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ajusta los filtros de búsqueda o registra una nueva área DINARP.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAreas.map((area) => {
                      const impacto = calcularImpacto(area);
                      const cuentasActivas = area.usuarios.filter(
                        (u) => u.estado !== "RETIRADO"
                      ).length;

                      return (
                        <TableRow
                          key={area.id}
                          className="transition-colors hover:bg-muted/40"
                        >
                          {/* 1. Código */}
                          <TableCell className="w-[120px] min-w-[110px] text-left align-middle pl-6">
                            <Link
                              href={`/areas/${area.codigo}`}
                              className="font-mono text-xs font-bold text-primary hover:underline"
                            >
                              {area.codigo}
                            </Link>
                          </TableCell>

                          {/* 2. Nombre */}
                          <TableCell className="w-[260px] min-w-[240px] text-left align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link
                                  href={`/areas/${area.codigo}`}
                                  className="text-xs font-bold text-foreground hover:text-primary transition-colors block text-left truncate cursor-pointer max-w-full"
                                >
                                  {area.nombre}
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {area.nombre} (clic para ver detalle)
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 3. Descripción */}
                          <TableCell className="w-[280px] min-w-[240px] text-left align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground block truncate cursor-help">
                                  {area.descripcion}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-sm text-xs">
                                {area.descripcion}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 4. Responsable */}
                          <TableCell className="w-[200px] min-w-[180px] text-left align-middle">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-foreground truncate">
                                {area.responsableNombre}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate">
                                {area.responsableCargo}
                              </p>
                            </div>
                          </TableCell>

                          {/* 5. Usuarios vinculados */}
                          <TableCell className="w-[150px] min-w-[140px] text-center align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface border border-border text-xs font-semibold cursor-help shadow-2xs">
                                  <Users className="size-3 text-primary" />
                                  <span>{cuentasActivas} activos</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {cuentasActivas === 0
                                  ? "Sin cuentas institucionales asignadas."
                                  : `${cuentasActivas} funcionario(s) con acceso en esta área.`}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 6. Estado */}
                          <TableCell className="w-[130px] min-w-[120px] text-center align-middle">
                            {getEstadoBadge(area.estado)}
                          </TableCell>

                          {/* 7. Versión */}
                          <TableCell className="w-[90px] min-w-[80px] text-center align-middle">
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-muted/60 border border-border/80 text-foreground">
                              {area.version}
                            </span>
                          </TableCell>

                          {/* 8. Acciones */}
                          <TableCell className="w-[160px] min-w-[150px] text-right align-middle pr-6">
                            <div className="flex items-center justify-end gap-1">
                              {/* Ver Detalle */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/areas/${area.codigo}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      aria-label={`Ver detalle de ${area.nombre}`}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
                              </Tooltip>

                              {/* Editar */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleAbrirEditar(area)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Editar ${area.nombre}`}
                                  >
                                    <Edit2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Editar</TooltipContent>
                              </Tooltip>

                              {/* Ver Impacto */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleAbrirImpacto(area, false)}
                                    className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                    aria-label="Ver matriz de impacto"
                                  >
                                    <ShieldAlert className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver impacto</TooltipContent>
                              </Tooltip>

                              {/* Activar (Borrador -> Activa) */}
                              {area.estado === "Borrador" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleAbrirActivar(area)}
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                      aria-label="Activar área en producción"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Activar área</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Inactivar (Activa -> Inactiva) */}
                              {area.estado === "Activa" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleAbrirImpacto(area, true)}
                                      className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                      aria-label="Inactivar área"
                                    >
                                      <Ban className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Inactivar área</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Reactivar (Inactiva -> Activa) */}
                              {area.estado === "Inactiva" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleAbrirActivar(area)}
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                      aria-label="Reactivar área orgánica"
                                    >
                                      <RotateCcw className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Reactivar área</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Retiro lógico / Eliminar borrador */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleAbrirEliminar(area)}
                                    className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                    aria-label="Eliminar o retirar área"
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {area.estado === "Borrador" && !area.referenciada
                                    ? "Eliminar borrador"
                                    : "Retiro lógico"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista Mobile Cards (<md) con Tarjeta Interactiva del UI Kit */}
            <div className="block md:hidden w-full space-y-3.5">
              {paginatedAreas.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <Building2 className="size-8 stroke-[1.5] text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">
                    No se encontraron áreas orgánicas
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros de búsqueda o crea una nueva área.
                  </p>
                </div>
              ) : (
                paginatedAreas.map((area) => renderAreaCard(area))
              )}
            </div>
          </TooltipProvider>

          {/* Paginación - Mismo estándar que /cuentas-internas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {filteredAreas.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, filteredAreas.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{filteredAreas.length}</span> áreas DINARP
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

      {/* Modales Compartidos */}
      <AreaFormModal
        open={modalFormOpen}
        onOpenChange={setModalFormOpen}
        areaToEdit={areaParaEditar}
        onSave={(data) => {
          if (areaParaEditar) {
            return editarArea(areaParaEditar.id, data, data.motivo);
          } else {
            return crearArea(data, data.motivo);
          }
        }}
      />

      <AreaImpactoDialog
        open={modalImpactoOpen}
        onOpenChange={setModalImpactoOpen}
        area={areaSeleccionada}
        impacto={areaSeleccionada ? calcularImpacto(areaSeleccionada) : null}
        isInactivating={esFlujoInactivacion}
        onConfirmInactivar={(motivo) => {
          if (!areaSeleccionada) return;
          const res = inactivarArea(areaSeleccionada.id, motivo);
          if (res.success) {
            toast.success("Área inactivada exitosamente", {
              description: `El área [${areaSeleccionada.codigo}] pasó a estado Inactiva. Versión actualizada a ${res.version}.`,
            });
            setSuccessFeedback({
              title: "Área inactivada exitosamente",
              description: "La dirección orgánica ha sido retirada del servicio activo. Su historial y expedientes se conservan intactos para fines de auditoría.",
              areaNombre: areaSeleccionada.nombre,
              codigo: areaSeleccionada.codigo,
              nuevoEstado: "Inactiva",
              version: res.version || areaSeleccionada.version,
            });
          } else {
            toast.error("Inactivación denegada", {
              description: res.error,
            });
          }
        }}
        onSimularResolucion={(areaId) => {
          simularResolucionObligaciones(areaId);
          const updated = areas.find((a) => a.id === areaId);
          if (updated) setAreaSeleccionada(updated);
        }}
      />

      <AreaActivarDialog
        open={modalActivarOpen}
        onOpenChange={setModalActivarOpen}
        area={areaSeleccionada}
        tipo={tipoActivacion}
        onConfirm={(motivo) => {
          if (!areaSeleccionada) return;
          if (tipoActivacion === "REACTIVAR") {
            const res = reactivarArea(areaSeleccionada.id, motivo);
            if (res.success) {
              toast.success("Área reactivada exitosamente", {
                description: `El área vuelve a estar disponible en ID-01 e ID-02. Versión: ${res.version}.`,
              });
              setSuccessFeedback({
                title: "Área reactivada exitosamente",
                description: "La dirección orgánica vuelve a estar disponible inmediatamente en los selectores de enrolamiento (ID-01) y edición (ID-02).",
                areaNombre: areaSeleccionada.nombre,
                codigo: areaSeleccionada.codigo,
                nuevoEstado: "Activa",
                version: res.version || areaSeleccionada.version,
              });
            }
          } else {
            const res = activarArea(areaSeleccionada.id, motivo);
            if (res.success) {
              toast.success("Área activada exitosamente", {
                description: `El área fue promovida a producción oficial. Versión: ${res.version}.`,
              });
              setSuccessFeedback({
                title: "Área activada en producción",
                description: "La dirección orgánica ha sido habilitada oficialmente y se encuentra lista para vinculación de funcionarios institucionales.",
                areaNombre: areaSeleccionada.nombre,
                codigo: areaSeleccionada.codigo,
                nuevoEstado: "Activa",
                version: res.version || areaSeleccionada.version,
              });
            }
          }
        }}
      />

      <AreaEliminarDialog
        open={modalEliminarOpen}
        onOpenChange={setModalEliminarOpen}
        area={areaSeleccionada}
        onConfirm={(motivo) => {
          if (!areaSeleccionada) return;
          const res = eliminarArea(areaSeleccionada.id, motivo);
          if (res.success) {
            if (res.tipo === "FISICO") {
              toast.success("Borrador eliminado", {
                description: res.mensaje,
              });
            } else {
              toast.success("Retiro lógico completado", {
                description: res.mensaje,
              });
              setSuccessFeedback({
                title: "Retiro lógico completado",
                description: "El área fue archivada permanentemente. Por normativa de auditoría institucional inmutable, su código no podrá ser reasignado a otra unidad.",
                areaNombre: areaSeleccionada.nombre,
                codigo: areaSeleccionada.codigo,
                nuevoEstado: "Archivada / Retiro Lógico",
                version: areaSeleccionada.version,
              });
            }
          }
        }}
      />

      {/* FEEDBACK SUCCESS TRAS CONFIRMAR ACCIÓN (ConfirmDialog Success UI Kit) */}
      {successFeedback && (
        <ConfirmDialog
          open={Boolean(successFeedback)}
          onOpenChange={(open) => {
            if (!open) setSuccessFeedback(null);
          }}
          variant="success"
          title={successFeedback.title}
          description={successFeedback.description}
          confirmText="Entendido"
          cancelText=""
          confirmVariant="primary"
          onConfirm={() => setSuccessFeedback(null)}
          size="default"
          className="sm:max-w-[480px]"
        >
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-2 text-left my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Área DINARP:</span>
                <span className="font-semibold text-foreground break-words block">
                  {successFeedback.areaNombre}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Código oficial:</span>
                <span className="font-mono text-foreground font-bold">{successFeedback.codigo}</span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Nuevo estado:</span>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
                  {successFeedback.nuevoEstado}
                </Badge>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Versión vigente:</span>
                <span className="font-mono text-foreground font-bold">v{successFeedback.version}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Auditoría registrada: <strong className="text-foreground">Administrador SINARP</strong></span>
              <span className="text-success font-semibold">Trazabilidad inalterable</span>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </WireframeDashboardLayout>
  );
}
