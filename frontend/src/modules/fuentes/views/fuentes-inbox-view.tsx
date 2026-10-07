"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import { FuenteFormDialog } from "../components/fuente-form-dialog";
import { useFuentesStore } from "../data/fuentes-store";
import { EstadoFuente, FuenteDatos } from "../data/fuentes-data";
import {
  Server,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  FileEdit,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Layers,
  Building2,
  Cpu,
  MoreHorizontal,
  Eye,
  Rocket,
  Wrench,
  XCircle,
  X,
  Pencil,
  Edit,
} from "lucide-react";

interface FuentesInboxViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
  openNuevaOnInit?: boolean;
}

export function FuentesInboxView({ currentUser, openNuevaOnInit = false }: FuentesInboxViewProps) {
  const router = useRouter();
  const { fuentes, isLoaded, restablecerDatosDemo } = useFuentesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [modalidadFilter, setModalidadFilter] = useState<string>("TODOS");
  const [modalidadSearch, setModalidadSearch] = useState("");
  const [fuenteAPublicar, setFuenteAPublicar] = useState<FuenteDatos | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(openNuevaOnInit);
  const [fuenteAEditar, setFuenteAEditar] = useState<FuenteDatos | null>(null);

  const ESTADOS_FUENTES_OPCIONES = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PREPARACION", label: "En preparación (Borrador / Conexión)" },
    { value: "BORRADOR", label: "Borrador" },
    { value: "CONEXION_PENDIENTE", label: "Conexión pendiente" },
    { value: "PENDIENTE_HOMOLOGACION", label: "Pendiente de homologación (FUE-12)" },
    { value: "ESQUEMA_PENDIENTE_CORRECCION", label: "Esquema pendiente de corrección" },
    { value: "EN_REVISION", label: "En revisión (Gestión)" },
    { value: "DEVUELTA", label: "Devuelta con observaciones" },
    { value: "APROBADA", label: "Aprobada para publicación" },
    { value: "PUBLICADA", label: "Publicada en catálogo" },
  ];

  const MODALIDADES_OPCIONES = [
    { value: "TODOS", label: "Todas las modalidades" },
    { value: "API Individual", label: "API Individual" },
    { value: "Lote Masivo", label: "Lote Masivo" },
    { value: "Individual / Masivo", label: "Ambas (Individual / Masivo)" },
  ];

  const institucionActual =
    currentUser?.institution || "Dirección General de Registro Civil";

  // Filtro de fuentes
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
        estadoFilter === "ALL"
          ? true
          : estadoFilter === "PREPARACION"
          ? [
              "BORRADOR",
              "CONEXION_PENDIENTE",
              "PENDIENTE_HOMOLOGACION",
              "ESQUEMA_PENDIENTE_CORRECCION",
              "CONFIGURACION",
            ].includes(f.estado)
          : f.estado === estadoFilter;

      const matchesModalidad =
        modalidadFilter === "TODOS"
          ? true
          : f.modalidades_soportadas.toLowerCase().includes(modalidadFilter.toLowerCase());

      return matchesSearch && matchesEstado && matchesModalidad;
    });
  }, [fuentes, searchTerm, estadoFilter, modalidadFilter]);

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_FUENTES_OPCIONES;
    return ESTADOS_FUENTES_OPCIONES.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase())
    );
  }, [estadoSearch]);

  const filteredModalidadesForFilter = useMemo(() => {
    if (!modalidadSearch.trim()) return MODALIDADES_OPCIONES;
    return MODALIDADES_OPCIONES.filter((m) =>
      m.label.toLowerCase().includes(modalidadSearch.toLowerCase())
    );
  }, [modalidadSearch]);

  const hasActiveFilters =
    searchTerm.trim() !== "" || estadoFilter !== "ALL" || modalidadFilter !== "TODOS";

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setEstadoFilter("ALL");
    setEstadoSearch("");
    setModalidadFilter("TODOS");
    setModalidadSearch("");
    setCurrentPage(1);
  };

  // Paginación UI Kit
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter, modalidadFilter]);

  const totalPages = Math.ceil(fuentesFiltradas.length / pageSize) || 1;
  const paginatedFuentes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return fuentesFiltradas.slice(start, start + pageSize);
  }, [fuentesFiltradas, currentPage, pageSize]);

  // Métricas de estado
  const stats = useMemo(() => {
    return {
      total: fuentes.length,
      pendientesPrep: fuentes.filter((f) =>
        [
          "BORRADOR",
          "CONEXION_PENDIENTE",
          "PENDIENTE_HOMOLOGACION",
          "ESQUEMA_PENDIENTE_CORRECCION",
          "CONFIGURACION",
        ].includes(f.estado)
      ).length,
      enRevision: fuentes.filter((f) => f.estado === "EN_REVISION").length,
      devueltas: fuentes.filter((f) => f.estado === "DEVUELTA").length,
      aprobadas: fuentes.filter((f) =>
        ["APROBADA", "PUBLICACION_PENDIENTE"].includes(f.estado)
      ).length,
      publicadas: fuentes.filter((f) => f.estado === "PUBLICADA").length,
    };
  }, [fuentes]);

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <FileEdit className="size-3 mr-1" />
            Borrador
          </Badge>
        );
      case "CONEXION_PENDIENTE":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Wrench className="size-3 mr-1" />
            Conexión pendiente
          </Badge>
        );
      case "PENDIENTE_HOMOLOGACION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Cpu className="size-3 mr-1" />
            Pendiente de homologación
          </Badge>
        );
      case "ESQUEMA_PENDIENTE_CORRECCION":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <AlertTriangle className="size-3 mr-1" />
            Esquema a corregir
          </Badge>
        );
      case "CONFIGURACION":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Clock className="size-3 mr-1" />
            Configuración
          </Badge>
        );
      case "EN_REVISION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <Clock className="size-3 mr-1 animate-pulse" />
            En revisión
          </Badge>
        );
      case "DEVUELTA":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <AlertTriangle className="size-3 mr-1" />
            Devuelta con observaciones
          </Badge>
        );
      case "APROBADA":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <CheckCircle2 className="size-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "PUBLICACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="solid" size="sm" className="whitespace-nowrap font-semibold">
            <AlertTriangle className="size-3 mr-1" />
            Publicación pendiente
          </Badge>
        );
      case "PUBLICADA":
        return (
          <Badge tone="success" appearance="solid" size="sm" className="whitespace-nowrap font-semibold">
            <Globe className="size-3 mr-1" />
            Publicada
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

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
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
      activeMenu="fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Fuentes de información", href: "/fuentes" },
        { label: "Bandeja institucional" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header del Módulo siguiendo cuentas-internas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Server className="size-6 text-primary shrink-0" />
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Fuentes de información
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Registro, conexión técnica, definición de esquemas y publicación en catálogo de las fuentes provistas por {institucionActual}.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setFuenteAEditar(null);
                  setIsFormModalOpen(true);
                }}
                className="text-xs gap-2 shadow-xs h-9 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Nueva fuente</span>
              </Button>
            </div>
          </div>

          {/* Cards de Resumen Interactivas (Estilo Cuentas Internas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 w-full">
            {/* En Preparación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "PREPARACION" ? "ALL" : "PREPARACION");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "PREPARACION" ? "ALL" : "PREPARACION");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PREPARACION"
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
                      estadoFilter === "PREPARACION"
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
                    Configuración
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Preparación
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.pendientesPrep}
                  </p>
                </div>
              </div>
            </Card>

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
                    Gestión FUE-04
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Revisión
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.enRevision}
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
                    Devueltas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.devueltas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Aprobadas / Listas p/ Publicar */}
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
                    FUE-05
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Listas p/ Publicar
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.aprobadas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Publicadas en Catálogo */}
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
                    En Catálogo
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
                  placeholder="Buscar por ID, nombre de fuente, conector o institución..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="w-full"
                />
              </div>

              {/* Filtros Combobox UI Kit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto shrink-0">
                {/* Filtro Estado */}
                <div className="w-full xl:w-[250px] min-w-0">
                  <Combobox
                    value={estadoFilter === "ALL" ? null : estadoFilter}
                    onValueChange={(val) => {
                      setEstadoFilter(val || "ALL");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ESTADOS_FUENTES_OPCIONES.find(
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
                    <ComboboxContent className="min-w-[270px] z-[80]">
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
                <div className="w-full xl:w-[210px] min-w-0">
                  <Combobox
                    value={modalidadFilter === "TODOS" ? null : modalidadFilter}
                    onValueChange={(val) => {
                      setModalidadFilter(val || "TODOS");
                    }}
                    inputValue={modalidadSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = MODALIDADES_OPCIONES.find(
                        (m) =>
                          m.value.toLowerCase() === newSearch.toLowerCase() ||
                          m.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setModalidadSearch(opt.label);
                      else if (newSearch === "TODOS") setModalidadSearch("");
                      else setModalidadSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las modalidades"
                      showClear={modalidadFilter !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[230px] z-[80]">
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
                          Estado: {ESTADOS_FUENTES_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {ESTADOS_FUENTES_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
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

                {modalidadFilter !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Modalidad: {modalidadFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Modalidad: {modalidadFilter}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setModalidadFilter("TODOS")}
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

          {/* Tabla UI Kit con encabezados blancos, sin contenedor envolvente y solo iconos en acciones */}
          <div className="w-full">
            <Table className="w-full" containerClassName="overflow-x-auto w-full">
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="w-[110px] text-xs font-bold text-white pl-6">ID</TableHead>
                  <TableHead className="text-xs font-bold text-white">Fuente</TableHead>
                  <TableHead className="text-xs font-bold text-white">Institución Proveedora</TableHead>
                  <TableHead className="w-[85px] text-xs font-bold text-white text-center">Versión</TableHead>
                  <TableHead className="text-xs font-bold text-white">Modalidad</TableHead>
                  <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                  <TableHead className="w-[110px] text-xs font-bold text-white">Actualización</TableHead>
                  <TableHead className="w-[110px] text-right text-xs font-bold text-white pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                      Cargando fuentes de información...
                    </TableCell>
                  </TableRow>
                ) : fuentesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center space-y-2">
                      <Server className="size-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-medium text-foreground">
                        No se encontraron fuentes de información
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Ajusta los filtros de búsqueda o registra una nueva fuente institucional.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFuentes.map((fuente) => {
                    const isAprobada = fuente.estado === "APROBADA";
                    const isPublicada = fuente.estado === "PUBLICADA";
                    const isDevuelta = fuente.estado === "DEVUELTA";
                    const isFallida = fuente.estado === "PUBLICACION_PENDIENTE";
                    const isHomologacion = fuente.estado === "PENDIENTE_HOMOLOGACION";

                    return (
                      <TableRow key={fuente.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-semibold text-primary pl-6">
                          {fuente.id}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-foreground block">
                              {fuente.nombre}
                            </span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {fuente.descripcion_fuente}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {fuente.institucion_proveedora_nombre}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {fuente.version_propuesta}
                        </TableCell>
                        <TableCell>
                          <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                            {fuente.modalidades_soportadas}
                          </Badge>
                        </TableCell>
                        <TableCell>{getEstadoBadge(fuente.estado)}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                          {formatDate(fuente.fecha_actualizacion || fuente.fecha_creacion)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <TooltipProvider delayDuration={100}>
                              {/* CTA Contextual - Solo icono */}
                              {isAprobada && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setFuenteAPublicar(fuente)}
                                      className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      aria-label={`Publicar fuente ${fuente.nombre}`}
                                    >
                                      <Rocket className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Publicar en catálogo (FUE-05)</TooltipContent>
                                </Tooltip>
                              )}

                              {isFallida && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setFuenteAPublicar(fuente)}
                                      className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                      aria-label={`Reintentar despliegue de ${fuente.nombre}`}
                                    >
                                      <RotateCcw className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Reintentar despliegue</TooltipContent>
                                </Tooltip>
                              )}

                              {isDevuelta && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href={`/fuentes/${fuente.id}`}>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
                                        aria-label={`Corregir observaciones de ${fuente.nombre}`}
                                      >
                                        <AlertTriangle className="size-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Subsanar observaciones</TooltipContent>
                                </Tooltip>
                              )}

                              {isHomologacion && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href="/homologacion-fuentes">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                        aria-label={`Ver homologación técnica de ${fuente.nombre}`}
                                      >
                                        <Cpu className="size-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Ver homologación TI (FUE-12)</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Editar Fuente (Modal FUE-01/02/03) - Solo icono */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setFuenteAEditar(fuente);
                                      setIsFormModalOpen(true);
                                    }}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Editar fuente ${fuente.nombre}`}
                                  >
                                    <Pencil className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Editar fuente</TooltipContent>
                              </Tooltip>

                              {/* Ver Detalle (Siempre disponible, solo icono) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/fuentes/${fuente.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      aria-label={`Ver detalle de ${fuente.nombre}`}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
                              </Tooltip>

                              {isPublicada && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link href="/catalogo-interoperabilidad">
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label={`Ver en catálogo fuente ${fuente.nombre}`}
                                      >
                                        <Globe className="size-4" />
                                      </Button>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Ver en catálogo</TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                de <span className="font-semibold text-foreground">{fuentesFiltradas.length}</span> fuentes
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

      {/* Dialog de Publicación (FUE-05) */}
      <PublicarFuenteDialog
        fuente={fuenteAPublicar}
        open={!!fuenteAPublicar}
        onOpenChange={(open) => {
          if (!open) setFuenteAPublicar(null);
        }}
        onPublicada={() => {
          setFuenteAPublicar(null);
        }}
      />

      {/* Dialog de Creación y Edición de Fuente (Modal FUE-01/02/03) */}
      <FuenteFormDialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) setFuenteAEditar(null);
        }}
        fuenteAEditar={fuenteAEditar}
        currentUser={currentUser}
        onSuccess={(id) => {
          setIsFormModalOpen(false);
          setFuenteAEditar(null);
        }}
      />
    </WireframeDashboardLayout>
  );
}
