"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  FolderPlus,
  Layers,
  Sparkles,
  History,
  Calendar,
  Eye,
  ChevronRight,
  RotateCcw,
  Building2,
  Copy,
  Check,
  X,
  FileQuestion,
  Filter,
  Pencil,
  Edit2,
  FileText,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
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
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";
import { CrearProyectoDialog } from "@/modules/proyectos/components/crear-proyecto-dialog";
import { EditarProyectoDialog } from "@/modules/proyectos/components/editar-proyecto-dialog";
import { TrazabilidadProyectoDialog } from "@/modules/proyectos/components/trazabilidad-proyecto-dialog";

export function ProyectosView() {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const {
    proyectos,
    isLoaded,
    getProyectosPorInstitucion,
    restablecerDatosDemo,
  } = useProyectosStore();

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSolicitudes, setFilterSolicitudes] = useState<string>("TODOS");
  const [filterVersion, setFilterVersion] = useState<string>("TODAS");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<ProyectoInstitucional | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [trazabilidadProyecto, setTrazabilidadProyecto] = useState<ProyectoInstitucional | null>(null);
  const [isTrazabilidadDialogOpen, setIsTrazabilidadDialogOpen] = useState(false);

  // Resolver usuario coordinador institucional y su entidad
  const coordinadorUser =
    activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const institucionCoordinador =
    coordinadorUser?.institution || "Ministerio de Educación";
  const coordinadorNombre = coordinadorUser?.name || "Mariana Almeida";

  // Proyectos pertenecientes a la institución del Coordinador
  const proyectosInstitucionales = useMemo(() => {
    return getProyectosPorInstitucion(institucionCoordinador);
  }, [getProyectosPorInstitucion, institucionCoordinador]);

  // Métricas para tarjetas de resumen (KPIs)
  const totalProyectos = proyectosInstitucionales.length;
  const proyectosConSolicitudes = useMemo(
    () =>
      proyectosInstitucionales.filter(
        (p) => p.solicitudes && p.solicitudes.length > 0
      ).length,
    [proyectosInstitucionales]
  );
  const proyectosSinSolicitudes = totalProyectos - proyectosConSolicitudes;
  const proyectosVersionados = useMemo(
    () => proyectosInstitucionales.filter((p) => p.version > 1).length,
    [proyectosInstitucionales]
  );

  // Filtrado multivariable
  const proyectosFiltrados = useMemo(() => {
    return proyectosInstitucionales.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.id.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.proposito.toLowerCase().includes(q);

      const cantSol = p.solicitudes ? p.solicitudes.length : 0;
      let matchSol = true;
      if (filterSolicitudes === "CON_SOLICITUDES") {
        matchSol = cantSol > 0;
      } else if (filterSolicitudes === "SIN_SOLICITUDES") {
        matchSol = cantSol === 0;
      }

      let matchVer = true;
      if (filterVersion === "V1") {
        matchVer = p.version === 1;
      } else if (filterVersion === "VERSIONADOS") {
        matchVer = p.version > 1;
      }

      return matchSearch && matchSol && matchVer;
    });
  }, [proyectosInstitucionales, searchQuery, filterSolicitudes, filterVersion]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(proyectosFiltrados.length / pageSize));
  const paginatedProyectos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return proyectosFiltrados.slice(start, start + pageSize);
  }, [proyectosFiltrados, currentPage, pageSize]);

  // Verificación de filtros activos
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    filterSolicitudes !== "TODOS" ||
    filterVersion !== "TODAS";

  const handleSetFilterSolicitudes = (nuevo: string) => {
    setFilterSolicitudes(nuevo);
    const opt = opcionesSolicitudes.find((o) => o.value === nuevo);
    setSolicitudesSearch(nuevo === "TODOS" ? "" : opt ? opt.label : "");
    setCurrentPage(1);
  };

  const handleSetFilterVersion = (nueva: string) => {
    setFilterVersion(nueva);
    const opt = opcionesVersiones.find((o) => o.value === nueva);
    setVersionSearch(nueva === "TODAS" ? "" : opt ? opt.label : "");
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    handleSetFilterSolicitudes("TODOS");
    handleSetFilterVersion("TODAS");
    setCurrentPage(1);
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Código ${id} copiado`);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleProyectoCreado = (nuevo: ProyectoInstitucional) => {
    router.push(`/proyectos/${nuevo.id}`);
  };

  const handleOpenEdit = (p: ProyectoInstitucional, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProyecto(p);
    setIsEditDialogOpen(true);
  };

  const handleOpenTrazabilidad = (p: ProyectoInstitucional, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTrazabilidadProyecto(p);
    setIsTrazabilidadDialogOpen(true);
  };

  // Opciones de Combobox
  const opcionesSolicitudes = useMemo(() => [
    { value: "TODOS", label: "Todas las solicitudes" },
    { value: "CON_SOLICITUDES", label: "Con solicitudes vinculadas" },
    { value: "SIN_SOLICITUDES", label: "Sin solicitudes (Nuevos)" },
  ], []);

  const opcionesVersiones = useMemo(() => [
    { value: "TODAS", label: "Todas las versiones" },
    { value: "V1", label: "Versión original (v1)" },
    { value: "VERSIONADOS", label: "Modificados (v2+)" },
  ], []);

  const [solicitudesSearch, setSolicitudesSearch] = useState("");
  const [versionSearch, setVersionSearch] = useState("");

  const filteredOpcionesSolicitudes = useMemo(() => {
    if (!solicitudesSearch) return opcionesSolicitudes;
    return opcionesSolicitudes.filter((o) =>
      o.label.toLowerCase().includes(solicitudesSearch.toLowerCase())
    );
  }, [solicitudesSearch, opcionesSolicitudes]);

  const filteredOpcionesVersiones = useMemo(() => {
    if (!versionSearch) return opcionesVersiones;
    return opcionesVersiones.filter((o) =>
      o.label.toLowerCase().includes(versionSearch.toLowerCase())
    );
  }, [versionSearch, opcionesVersiones]);

  return (
    <WireframeDashboardLayout
      activeMenu="proyectos"
      currentUser={coordinadorUser}
      breadcrumbs={[{ label: "Proyectos" }]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal (Tarjetas, Encabezado y Tabla) */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal Institucional */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Proyectos institucionales
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Gestiona las iniciativas de tu institución. Desde aquí puedes registrar nuevos proyectos, consultar y actualizar su información, y dar seguimiento a las solicitudes de acceso a datos vinculadas a cada uno.
              </p>
            </div>

            {/* Acción de Cabecera: Crear Proyecto */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCrearDialogOpen(true)}
                leftIcon={<FolderPlus className="size-4" />}
                className="font-semibold shadow-xs"
              >
                Nuevo proyecto
              </Button>
            </div>
          </div>

          {/* Cards de Resumen Interactivas (Estilo Módulos del Administrador) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* Card 1: Total Proyectos */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterSolicitudes("TODOS");
                setFilterVersion("TODAS");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterSolicitudes("TODOS");
                  setFilterVersion("TODAS");
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterSolicitudes === "TODOS" && filterVersion === "TODAS"
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
                      filterSolicitudes === "TODOS" && filterVersion === "TODAS"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground"
                    )}
                  >
                    <FolderKanban className="size-5" />
                  </div>
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Registrados
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Total de proyectos
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {totalProyectos}
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 2: Con Solicitudes */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterSolicitudes(
                  filterSolicitudes === "CON_SOLICITUDES" ? "TODOS" : "CON_SOLICITUDES"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterSolicitudes(
                    filterSolicitudes === "CON_SOLICITUDES" ? "TODOS" : "CON_SOLICITUDES"
                  );
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterSolicitudes === "CON_SOLICITUDES"
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
                      filterSolicitudes === "CON_SOLICITUDES"
                        ? "bg-success text-white shadow-xs"
                        : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                    )}
                  >
                    <Layers className="size-5" />
                  </div>
                  <Badge
                    tone="success"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    En curso
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Con solicitudes vinculadas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {proyectosConSolicitudes}
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 3: Sin Solicitudes */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterSolicitudes(
                  filterSolicitudes === "SIN_SOLICITUDES" ? "TODOS" : "SIN_SOLICITUDES"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterSolicitudes(
                    filterSolicitudes === "SIN_SOLICITUDES" ? "TODOS" : "SIN_SOLICITUDES"
                  );
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterSolicitudes === "SIN_SOLICITUDES"
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
                      filterSolicitudes === "SIN_SOLICITUDES"
                        ? "bg-warning text-white shadow-xs"
                        : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                    )}
                  >
                    <Sparkles className="size-5" />
                  </div>
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Nuevos / Pendientes
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Sin solicitudes
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {proyectosSinSolicitudes}
                  </p>
                </div>
              </div>
            </Card>

            {/* Card 4: Proyectos Versionados */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterVersion(
                  filterVersion === "VERSIONADOS" ? "TODAS" : "VERSIONADOS"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterVersion(
                    filterVersion === "VERSIONADOS" ? "TODAS" : "VERSIONADOS"
                  );
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterVersion === "VERSIONADOS"
                  ? "bg-muted/60 border-foreground/30 ring-2 ring-foreground/20 shadow-xs"
                  : "bg-muted/30 hover:bg-muted/50 border-border/80 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterVersion === "VERSIONADOS"
                        ? "bg-muted-foreground text-background shadow-xs"
                        : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-muted-foreground group-hover:text-background"
                    )}
                  >
                    <History className="size-5" />
                  </div>
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Historial
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Con modificaciones
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {proyectosVersionados}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Búsqueda con UI Kit Oficial (Estilo Administrador) */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por código, nombre o propósito del proyecto..."
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

              {/* Filtros Combobox UI Kit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto shrink-0">
                {/* Filtro Solicitudes */}
                <div className="w-full xl:w-[230px] min-w-0">
                  <Combobox
                    value={filterSolicitudes === "TODOS" ? null : filterSolicitudes}
                    onValueChange={(val) => {
                      handleSetFilterSolicitudes(val || "TODOS");
                    }}
                    inputValue={solicitudesSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = opcionesSolicitudes.find(
                        (s) =>
                          s.value === newSearch ||
                          s.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setSolicitudesSearch(opt.label);
                      else if (newSearch === "TODOS") setSolicitudesSearch("");
                      else setSolicitudesSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las solicitudes"
                      showClear={filterSolicitudes !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[250px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por solicitudes</ComboboxLabel>
                          {filteredOpcionesSolicitudes.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredOpcionesSolicitudes.length === 0 && (
                          <ComboboxEmpty>No se encontraron opciones.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro Versión */}
                <div className="w-full xl:w-[220px] min-w-0">
                  <Combobox
                    value={filterVersion === "TODAS" ? null : filterVersion}
                    onValueChange={(val) => {
                      handleSetFilterVersion(val || "TODAS");
                    }}
                    inputValue={versionSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = opcionesVersiones.find(
                        (v) =>
                          v.value === newSearch ||
                          v.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setVersionSearch(opt.label);
                      else if (newSearch === "TODAS") setVersionSearch("");
                      else setVersionSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las versiones"
                      showClear={filterVersion !== "TODAS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[240px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por versión</ComboboxLabel>
                          {filteredOpcionesVersiones.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredOpcionesVersiones.length === 0 && (
                          <ComboboxEmpty>No se encontraron versiones.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            </div>

            {/* Chips de Filtros Activos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                  <Filter className="size-3 text-primary" />
                  Filtros activos:
                </span>

                {searchQuery.trim() !== "" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-2.5 pr-1 py-0.5 rounded-full text-xs h-6 gap-1 font-medium"
                  >
                    <span>Texto: &quot;{searchQuery}&quot;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterSolicitudes !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-2.5 pr-1 py-0.5 rounded-full text-xs h-6 gap-1 font-medium"
                  >
                    <span>
                      {filterSolicitudes === "CON_SOLICITUDES"
                        ? "Con solicitudes"
                        : "Sin solicitudes"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetFilterSolicitudes("TODOS")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterVersion !== "TODAS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-2.5 pr-1 py-0.5 rounded-full text-xs h-6 gap-1 font-medium"
                  >
                    <span>
                      {filterVersion === "V1" ? "Versión v1" : "Versión v2+"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSetFilterVersion("TODAS")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2 rounded-full"
                >
                  Limpiar filtros
                </Button>

                <div className="ml-auto text-xs text-muted-foreground">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={restablecerDatosDemo}
                    title="Restablecer datos demo originales"
                    className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="size-3 mr-1" />
                    Restablecer datos
                  </Button>
                </div>
              </div>
            )}
          </div>

          <TooltipProvider delayDuration={150}>
            {/* Tabla de Proyectos (Desktop md+) */}
            <div className="hidden md:block w-full">
              {!isLoaded ? (
                <div className="py-16 text-center text-xs text-muted-foreground">
                  Cargando bandeja de proyectos institucionales...
                </div>
              ) : proyectosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-3">
                  <FileQuestion className="size-10 text-muted-foreground" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-heading font-semibold text-foreground">
                      No se encontraron proyectos para los filtros aplicados
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Intenta modificar los parámetros de búsqueda o restablecer los filtros.
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      leftIcon={<X className="size-3.5" />}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <Table
                  className="w-full min-w-[980px]"
                  containerClassName="overflow-x-auto w-full"
                >
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left pl-6 text-white font-semibold">
                        CÓDIGO / ID
                      </TableHead>
                      <TableHead className="w-[280px] min-w-[260px] whitespace-nowrap text-left text-white font-semibold">
                        PROYECTO INSTITUCIONAL
                      </TableHead>
                      <TableHead className="min-w-[300px] text-left text-white font-semibold">
                        PROPÓSITO INSTITUCIONAL
                      </TableHead>
                      <TableHead className="w-[140px] whitespace-nowrap text-left text-white font-semibold">
                        FECHA CREACIÓN
                      </TableHead>
                      <TableHead className="w-[150px] whitespace-nowrap text-center text-white font-semibold">
                        SOLICITUDES
                      </TableHead>
                      <TableHead className="w-[140px] min-w-[130px] pr-6 whitespace-nowrap text-right text-white font-semibold">
                        ACCIONES
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProyectos.map((p) => {
                      const cantSol = p.solicitudes ? p.solicitudes.length : 0;
                      return (
                        <TableRow
                          key={p.id}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/proyectos/${p.id}`)}
                        >
                          {/* Columna 1: Código ID con botón copiar */}
                          <TableCell className="pl-6 py-3.5 align-middle">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
                              <span className="px-2 py-0.5 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                {p.id}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyId(p.id, e)}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                  >
                                    {copiedId === p.id ? (
                                      <Check className="size-3 text-success" />
                                    ) : (
                                      <Copy className="size-3" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Copiar código</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          {/* Columna 2: Nombre y Versión */}
                          <TableCell className="py-3.5 align-middle">
                            <div className="space-y-1">
                              <p className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {p.nombre}
                              </p>
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  tone={p.version > 1 ? "secondary" : "neutral"}
                                  appearance="soft"
                                  size="sm"
                                  className="font-semibold whitespace-nowrap px-2 py-0.5 text-[11px] h-5 inline-flex items-center"
                                >
                                  v{p.version}.0
                                </Badge>
                                {p.version > 1 && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 font-medium">
                                    <History className="size-2.5" />
                                    Actualizado
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* Columna 3: Propósito */}
                          <TableCell className="py-3.5 align-middle text-xs text-muted-foreground">
                            <p className="line-clamp-2 leading-relaxed">
                              {p.proposito}
                            </p>
                          </TableCell>

                          {/* Columna 4: Fecha de Creación */}
                          <TableCell className="py-3.5 align-middle whitespace-nowrap text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-muted-foreground/70" />
                              <span>{p.fechaCreacion.split(" ")[0]}</span>
                            </div>
                          </TableCell>

                          {/* Columna 5: Solicitudes (Estilo cuentas-internas) */}
                          <TableCell className="py-3.5 align-middle text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center">
                              {cantSol > 0 ? (
                                <Badge
                                  tone="success"
                                  appearance="soft"
                                  size="sm"
                                  className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center gap-1.5"
                                >
                                  <span className="size-1.5 rounded-full bg-success" />
                                  <span>{cantSol} {cantSol === 1 ? "solicitud" : "solicitudes"}</span>
                                </Badge>
                              ) : (
                                <Badge
                                  tone="neutral"
                                  appearance="soft"
                                  size="sm"
                                  className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center text-muted-foreground"
                                >
                                  0 vinculadas
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Columna 6: Acciones (Solo iconos con tooltips como cuentas-internas) */}
                          <TableCell
                            className="w-[140px] min-w-[130px] pr-6 text-right align-middle whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-0.5 justify-end w-full">
                              {/* Ver detalle (Siempre válido) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Ver detalle de ${p.nombre}`}
                                  >
                                    <Link href={`/proyectos/${p.id}`}>
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
                              </Tooltip>

                              {/* Editar */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => handleOpenEdit(p, e)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Editar metadatos de ${p.nombre}`}
                                  >
                                    <Edit2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Editar</TooltipContent>
                              </Tooltip>

                              {/* Trazabilidad */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => handleOpenTrazabilidad(p, e)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Ver trazabilidad de ${p.nombre}`}
                                  >
                                    <History className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Trazabilidad</TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Vista Mobile Cards (<md) con InteractiveCard del UI Kit */}
            <div className="block md:hidden w-full space-y-3.5">
              {paginatedProyectos.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <FolderKanban className="size-8 stroke-[1.5] text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">
                    No se encontraron proyectos institucionales
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros de búsqueda o crea un nuevo proyecto.
                  </p>
                </div>
              ) : (
                paginatedProyectos.map((p) => {
                  const cantSol = p.solicitudes ? p.solicitudes.length : 0;
                  return (
                    <InteractiveCard
                      key={p.id}
                      color={cantSol > 0 ? "primary" : "default"}
                      decorativeIcon={<FolderKanban className="size-20" />}
                      decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
                      className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
                    >
                      {/* Cabecera Mobile: Nombre y Estado */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
                        <div className="min-w-0 flex-1 space-y-1">
                          <Link
                            href={`/proyectos/${p.id}`}
                            className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug cursor-pointer block"
                          >
                            {p.nombre}
                          </Link>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                            <span>ID: {p.id}</span>
                            <span className="text-muted-foreground/40 font-bold">•</span>
                            <span>{p.institucion}</span>
                          </div>
                        </div>
                        <div className="shrink-0 pt-0.5">
                          {cantSol > 0 ? (
                            <Badge
                              tone="success"
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5 gap-1.5"
                            >
                              <span className="size-1.5 rounded-full bg-success" />
                              <span>{cantSol} sol.</span>
                            </Badge>
                          ) : (
                            <Badge
                              tone="neutral"
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5 text-muted-foreground"
                            >
                              0 sol.
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Bloque 1: Propósito Institucional */}
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-surface/80 backdrop-blur-xs px-3 py-2 rounded-lg border border-border/50 w-full">
                        <FileText className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-foreground text-xs leading-relaxed line-clamp-3 select-all flex-1 min-w-0">
                          {p.proposito}
                        </span>
                      </div>

                      {/* Bloque 2: Solicitudes vinculadas y Versión */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
                        <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Solicitudes vinculadas
                          </span>
                          <div className="flex flex-wrap items-center">
                            {cantSol > 0 ? (
                              <Badge
                                tone="success"
                                appearance="soft"
                                size="sm"
                                className="font-semibold text-xs gap-1.5 px-2 py-0.5"
                              >
                                <span className="size-1.5 rounded-full bg-success" />
                                <span>{cantSol} solicitud{cantSol !== 1 ? "es" : ""}</span>
                              </Badge>
                            ) : (
                              <Badge
                                tone="neutral"
                                appearance="soft"
                                size="sm"
                                className="font-semibold text-xs px-2 py-0.5 text-muted-foreground"
                              >
                                Sin solicitudes
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Control de versión
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge
                              tone="secondary"
                              appearance="soft"
                              size="sm"
                              className="font-semibold font-mono text-[11px] px-2 py-0.5"
                            >
                              v{p.version}.0
                            </Badge>
                            {p.version > 1 && (
                              <span className="text-[10px] text-muted-foreground font-medium">
                                ({p.historialVersiones?.length || p.version} cambios)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bloque 3: Trazabilidad y Fechas */}
                      <div className="space-y-2 pt-2 border-t border-border/50 text-xs w-full">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-muted-foreground font-medium">Coordinador:</span>
                          <span className="text-[11px] font-medium text-foreground">
                            {p.creadoPor}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                          <span className="text-[11px] text-muted-foreground font-medium">Última actualización:</span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {p.fechaActualizacion || p.fechaCreacion}
                          </span>
                        </div>
                      </div>

                      {/* Bloque 4: Acciones organizadas estilo Cuentas Internas */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                          <Calendar className="size-3.5 text-muted-foreground/70" />
                          <span>{p.fechaCreacion.split(" ")[0]}</span>
                        </div>
                        <div className="inline-flex items-center gap-0.5 justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon-sm"
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                aria-label={`Ver detalle de ${p.nombre}`}
                              >
                                <Link href={`/proyectos/${p.id}`}>
                                  <Eye className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Ver detalle</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenEdit(p)}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                aria-label={`Editar ${p.nombre}`}
                              >
                                <Edit2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Editar</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleOpenTrazabilidad(p)}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                aria-label={`Trazabilidad de ${p.nombre}`}
                              >
                                <History className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Trazabilidad</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </InteractiveCard>
                  );
                })
              )}
            </div>
          </TooltipProvider>

          {/* Paginación de Tabla (Estilo Idéntico al Administrador) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {proyectosFiltrados.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, proyectosFiltrados.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">
                  {proyectosFiltrados.length}
                </span>{" "}
                proyectos
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
                      className={cn(
                        currentPage === 1 &&
                          "pointer-events-none opacity-50 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        currentPage === 1 &&
                          "pointer-events-none opacity-50 cursor-not-allowed"
                      )}
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
                      (page === 2 && currentPage > 3) ||
                      (page === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${page}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={() => setCurrentPage(totalPages)}
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50 cursor-not-allowed"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </main>

      {/* Modal de Creación */}
      <CrearProyectoDialog
        open={isCrearDialogOpen}
        onOpenChange={setIsCrearDialogOpen}
        institucionPrecargada={institucionCoordinador}
        coordinadorNombre={coordinadorNombre}
        onProyectoCreado={handleProyectoCreado}
      />

      {/* Modal de Edición de Metadatos */}
      <EditarProyectoDialog
        proyecto={editingProyecto}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        coordinadorNombre={coordinadorNombre}
        onProyectoActualizado={(actualizado) => {
          setEditingProyecto(actualizado);
          setTrazabilidadProyecto(actualizado);
        }}
      />

      {/* Modal de Trazabilidad e Historial */}
      <TrazabilidadProyectoDialog
        proyecto={
          trazabilidadProyecto
            ? proyectos.find((p) => p.id === trazabilidadProyecto.id) || trazabilidadProyecto
            : null
        }
        open={isTrazabilidadDialogOpen}
        onOpenChange={setIsTrazabilidadDialogOpen}
      />
    </WireframeDashboardLayout>
  );
}
