"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  Eye,
  Clock,
  Building2,
  Briefcase,
  Database,
  Lock,
  Unlock,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  History,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";

// Personas activas del Equipo de Gestión
const REVISORES_GESTION = [
  { id: "U-EQGEST", nombre: "Ana Torres", cargo: "Revisora Técnica de Gestión", especialidad: "Interoperabilidad y Catálogos" },
  { id: "U-EQGEST2", nombre: "Marcos Silva", cargo: "Revisor Funcional", especialidad: "Modelos de Datos y Servicios" },
  { id: "U-EQGEST3", nombre: "Elena Viteri", cargo: "Analista de Integración", especialidad: "Arquitectura e Interconexión" },
];

const ESTADOS_FILTRO = [
  "Pendiente de asignación en Gestión",
  "Pendiente de nueva asignación",
  "Asignada a revisión de Gestión",
  "En revisión de Gestión",
  "Observada",
  "Aprobada por Gestión",
];

const CLASIFICACION_FILTRO = [
  "Contiene campos confidenciales",
  "Solo campos accesibles",
];

const REVISOR_FILTRO = [
  "Sin asignar",
  ...REVISORES_GESTION.map((r) => r.nombre),
];

export function AccesoAsignacionGestionView() {
  const { solicitudes, asignarRevisorGestion } = useSolicitudesStore();

  // Estados de filtros y paginación (idénticos al patrón de Gestión de Usuarios)
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [confidencialFilter, setConfidencialFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [revisorFilter, setRevisorFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Solicitud seleccionada para contexto del expediente (Modal estilo ExpedienteCuentaModal)
  const [selectedSolicitudExpediente, setSelectedSolicitudExpediente] = useState<SolicitudAcceso | null>(null);
  const [tabExpediente, setTabExpediente] = useState<"general" | "campos" | "historial">("general");

  // Solicitud para asignar revisor (Modal)
  const [solicitudToAssign, setSolicitudToAssign] = useState<SolicitudAcceso | null>(null);
  const [selectedRevisorId, setSelectedRevisorId] = useState<string>("U-EQGEST");
  const [observacionAsignacion, setObservacionAsignacion] = useState("");

  // Helper para verificar campos confidenciales
  const tieneCamposConfidenciales = (s: SolicitudAcceso) => {
    return (
      s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      ) || false
    );
  };

  // Pre-filtrar si viene desde ?tab=seguimiento en el sidebar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "seguimiento") {
        setEstadoFilter("En revisión de Gestión");
      }
    }
  }, []);

  // Excluir solicitudes en Borrador (aún no enviadas a Gestión)
  const solicitudesRecibidas = useMemo(
    () => solicitudes.filter((s) => s.estado !== "Borrador"),
    [solicitudes]
  );

  // Filtrado de solicitudes
  const filteredSolicitudes = useMemo(() => {
    return solicitudesRecibidas.filter((s) => {
      // Búsqueda libre
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "").toLowerCase().includes(term);
        const matchesServicio = (s.servicioPrincipal || "").toLowerCase().includes(term);
        const matchesProyecto = (s.proyectoNombre || "").toLowerCase().includes(term);
        const matchesRevisor = (s.revisorAsignado || "").toLowerCase().includes(term);
        if (
          !matchesId &&
          !matchesInst &&
          !matchesFuente &&
          !matchesServicio &&
          !matchesProyecto &&
          !matchesRevisor
        ) {
          return false;
        }
      }

      // Filtro de estado
      if (estadoFilter !== "") {
        if (
          estadoFilter === "En revisión de Gestión" &&
          (s.estado === "Asignada a revisión de Gestión" || s.estado === "En revisión de Gestión")
        ) {
          // Agrupa ambas etapas de revisión funcional cuando se filtra por KPI
        } else if (s.estado !== estadoFilter) {
          return false;
        }
      }

      // Filtro confidencial
      if (confidencialFilter === "Contiene campos confidenciales" && !tieneCamposConfidenciales(s)) {
        return false;
      }
      if (confidencialFilter === "Solo campos accesibles" && tieneCamposConfidenciales(s)) {
        return false;
      }

      // Filtro por revisor asignado
      if (revisorFilter !== "") {
        if (revisorFilter === "Sin asignar" && s.revisorAsignado) {
          return false;
        }
        if (
          revisorFilter !== "Sin asignar" &&
          s.revisorAsignado !== revisorFilter &&
          !s.revisorAsignado?.includes(revisorFilter.split(" (")[0])
        ) {
          return false;
        }
      }

      return true;
    });
  }, [solicitudesRecibidas, searchTerm, estadoFilter, confidencialFilter, revisorFilter]);

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter, confidencialFilter, revisorFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / pageSize));

  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  // Contadores métricos
  const metricas = useMemo(() => {
    const total = solicitudesRecibidas.length;
    const pendientesPrimera = solicitudesRecibidas.filter(
      (s) => s.estado === "Pendiente de asignación en Gestión"
    ).length;
    const pendientesNueva = solicitudesRecibidas.filter(
      (s) => s.estado === "Pendiente de nueva asignación"
    ).length;
    const enRevision = solicitudesRecibidas.filter(
      (s) =>
        s.estado === "Asignada a revisión de Gestión" ||
        s.estado === "En revisión de Gestión"
    ).length;
    return { total, pendientesPrimera, pendientesNueva, enRevision };
  }, [solicitudesRecibidas]);

  const hasActiveFilters =
    searchTerm !== "" ||
    estadoFilter !== "" ||
    confidencialFilter !== "" ||
    revisorFilter !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setEstadoFilter("");
    setConfidencialFilter("");
    setRevisorFilter("");
    setCurrentPage(1);
  };

  // Ejecutar confirmación de asignación
  const handleConfirmarAsignacion = () => {
    if (!solicitudToAssign) return;

    const revisor =
      REVISORES_GESTION.find((r) => r.id === selectedRevisorId) ||
      REVISORES_GESTION[0];
    const directorNombre = "Director Área de Gestión";
    const esReasig = Boolean(solicitudToAssign.revisorAsignado);
    if (esReasig && !observacionAsignacion.trim()) {
      toast.error("Debe especificar el motivo de la reasignación.");
      return;
    }

    asignarRevisorGestion(
      solicitudToAssign.id,
      revisor.id,
      revisor.nombre,
      directorNombre,
      observacionAsignacion.trim() || undefined
    );

    const fechaHoy = new Date().toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    toast.success("Revisor asignado", {
      description: `${revisor.nombre} · ${fechaHoy} · ID: ${solicitudToAssign.id}`,
    });

    setSolicitudToAssign(null);
    setObservacionAsignacion("");
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad-asignacion"
      currentRole="DIR_GESTION"
      currentUser={MOCK_USERS_BY_ROLE.DIR_GESTION}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Dirección de Gestión", href: "/acceso-interoperabilidad/asignacion" },
        { label: "Asignación de Solicitudes de Acceso" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* 1. Cabecera Principal (Mismo patrón visual que Gestión de Usuarios) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                {estadoFilter === "En revisión de Gestión"
                  ? "Seguimiento de accesos"
                  : "Asignar accesos"}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
                {estadoFilter === "En revisión de Gestión"
                  ? "Supervisa el avance y estado de evaluación de las solicitudes de acceso a interoperabilidad asignadas al equipo de Gestión."
                  : "Gestiona y asigna las solicitudes de acceso a fuentes de interoperabilidad a los revisores del equipo de Gestión."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge
                tone="info"
                appearance="soft"
                size="md"
                className="font-semibold px-3 py-1.5 text-xs"
              >
                Rol: Director de Gestión
              </Badge>
            </div>
          </div>

          {/* 2. Tarjetas de Resumen Interactivo (KPI Cards homologadas 100% con Cuentas Internas) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 w-full">
            {/* KPI 1: Total Expedientes BN-07 */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={handleClearFilters}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClearFilters();
                }
              }}
              aria-pressed={!hasActiveFilters}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                !hasActiveFilters
                  ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                  : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    !hasActiveFilters
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
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  BN-07
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Total expedientes recibidos
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.total}
                </p>
              </div>
            </Card>

            {/* KPI 2: Pendientes de 1ra Asignación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter((prev) =>
                  prev === "Pendiente de asignación en Gestión"
                    ? ""
                    : "Pendiente de asignación en Gestión"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter((prev) =>
                    prev === "Pendiente de asignación en Gestión"
                      ? ""
                      : "Pendiente de asignación en Gestión"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Pendiente de asignación en Gestión"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Pendiente de asignación en Gestión"
                  ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                  : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Pendiente de asignación en Gestión"
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
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Por asignar
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Pendientes de 1ra asignación
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.pendientesPrimera}
                </p>
              </div>
            </Card>

            {/* KPI 3: Subsanadas (Reasignación) */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter((prev) =>
                  prev === "Pendiente de nueva asignación"
                    ? ""
                    : "Pendiente de nueva asignación"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter((prev) =>
                    prev === "Pendiente de nueva asignación"
                      ? ""
                      : "Pendiente de nueva asignación"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Pendiente de nueva asignación"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Pendiente de nueva asignación"
                  ? "bg-info/15 border-info ring-2 ring-info/40 shadow-xs"
                  : "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Pendiente de nueva asignación"
                      ? "bg-info text-white shadow-xs"
                      : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                  )}
                >
                  <RotateCcw className="size-5" />
                </div>
                <Badge
                  tone="info"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Subsanadas
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Pendientes de nueva asignación
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.pendientesNueva}
                </p>
              </div>
            </Card>

            {/* KPI 4: En Revisión de Gestión */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter((prev) =>
                  prev === "En revisión de Gestión"
                    ? ""
                    : "En revisión de Gestión"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter((prev) =>
                    prev === "En revisión de Gestión"
                      ? ""
                      : "En revisión de Gestión"
                  );
                }
              }}
              aria-pressed={estadoFilter === "En revisión de Gestión"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "En revisión de Gestión"
                  ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                  : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "En revisión de Gestión"
                      ? "bg-success text-white shadow-xs"
                      : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                  )}
                >
                  <UserCheck className="size-5" />
                </div>
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Asignadas
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  En revisión de Gestión
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.enRevision}
                </p>
              </div>
            </Card>
          </div>

          {/* 3. Barra de Búsqueda y Filtros (Mismo diseño que Gestión de Usuarios) */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full">
              {/* Buscador a la izquierda */}
              <div className="flex-1 min-w-[200px]">
                <Search
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  placeholder="Buscar por ID, institución, fuente, proyecto o revisor..."
                  aria-label="Buscar solicitudes de acceso"
                  className="w-full"
                />
              </div>

              {/* Comboboxes de Filtros al lado del Search */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
                {/* Filtro por Estado */}
                <div className="w-full sm:w-44 lg:w-48 xl:w-52 min-w-0">
                  <Combobox
                    items={ESTADOS_FILTRO}
                    value={estadoFilter || null}
                    onValueChange={(val) => setEstadoFilter(val ?? "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado de solicitud"
                      showTrigger
                      showClear={!!estadoFilter}
                      aria-label="Filtrar por estado de solicitud"
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[260px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {ESTADOS_FILTRO.map((item) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {item}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro por Clasificación de Campos */}
                <div className="w-full sm:w-44 lg:w-48 xl:w-52 min-w-0">
                  <Combobox
                    items={CLASIFICACION_FILTRO}
                    value={confidencialFilter || null}
                    onValueChange={(val) => setConfidencialFilter(val ?? "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Clasificación de campos"
                      showTrigger
                      showClear={!!confidencialFilter}
                      aria-label="Filtrar por clasificación de campos"
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[250px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por clasificación</ComboboxLabel>
                          {CLASIFICACION_FILTRO.map((item) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {item}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        <ComboboxEmpty>No se encontraron opciones.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro por Revisor Asignado */}
                <div className="w-full sm:w-40 lg:w-44 xl:w-48 min-w-0">
                  <Combobox
                    items={REVISOR_FILTRO}
                    value={revisorFilter || null}
                    onValueChange={(val) => setRevisorFilter(val ?? "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Revisor asignado"
                      showTrigger
                      showClear={!!revisorFilter}
                      aria-label="Filtrar por revisor asignado"
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[240px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por revisor</ComboboxLabel>
                          {REVISOR_FILTRO.map((item) => (
                            <ComboboxItem
                              key={item}
                              value={item}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {item}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        <ComboboxEmpty>No se encontraron revisores.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {/* Píldoras de filtros activos */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Filtros activos:
                </span>

                {searchTerm && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border border-primary/20"
                  >
                    <span>Búsqueda: &ldquo;{searchTerm}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {estadoFilter && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border border-primary/20"
                  >
                    <span>Estado: {estadoFilter}</span>
                    <button
                      type="button"
                      onClick={() => setEstadoFilter("")}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {confidencialFilter && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border border-primary/20"
                  >
                    <span>Campos: {confidencialFilter}</span>
                    <button
                      type="button"
                      onClick={() => setConfidencialFilter("")}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de clasificación"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {revisorFilter && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium rounded-full border border-primary/20"
                  >
                    <span>Revisor: {revisorFilter}</span>
                    <button
                      type="button"
                      onClick={() => setRevisorFilter("")}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                      aria-label="Quitar filtro de revisor"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs text-muted-foreground hover:text-danger h-6 px-2 ml-1"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* 4. Vista Móvil / Tablet o Vista Tarjetas (Cards Responsivas) */}
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-3 w-full",
              viewMode === "cards" ? "md:grid-cols-2" : "md:hidden"
            )}
          >
            {paginatedSolicitudes.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-surface-muted/40">
                <p className="text-sm font-semibold text-foreground">
                  No se encontraron solicitudes con los filtros seleccionados
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Intente ajustar los términos de búsqueda o limpiar los filtros activos.
                </p>
              </div>
            ) : (
              paginatedSolicitudes.map((solicitud) => {
                const hasConfidencial = tieneCamposConfidenciales(solicitud);
                const isPendienteAsignacion =
                  solicitud.estado === "Pendiente de asignación en Gestión" ||
                  solicitud.estado === "Pendiente de nueva asignación";
                const isNuevaAsignacion =
                  solicitud.estado === "Pendiente de nueva asignación";
                const cardColor =
                  isNuevaAsignacion || isPendienteAsignacion
                    ? "warning"
                    : solicitud.estado.includes("Aprobada")
                    ? "success"
                    : solicitud.estado === "Observada"
                    ? "danger"
                    : "info";

                return (
                  <InteractiveCard
                    key={solicitud.id}
                    color={cardColor}
                    decorativeIcon={<Database className="size-full" />}
                    decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
                    className="p-4 rounded-xl flex flex-col justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="space-y-3 relative z-10 w-full">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {isNuevaAsignacion && (
                              <span
                                title="Atención requerida: Solicitud subsanada espera nueva asignación manual por el Director de Gestión (BN-07)."
                                className="inline-flex items-center justify-center size-5 rounded-md bg-warning/20 text-warning border border-warning/40 shrink-0"
                              >
                                <AlertTriangle className="size-3.5" />
                              </span>
                            )}
                            <span className="font-mono font-bold text-xs text-primary">
                              {solicitud.id}
                            </span>
                            {solicitud.versionExpediente &&
                              solicitud.versionExpediente > 1 && (
                                <Badge
                                  tone="info"
                                  appearance="outline"
                                  size="sm"
                                  className="font-mono text-[10px] px-1 py-0"
                                >
                                  v{solicitud.versionExpediente}
                                </Badge>
                              )}
                            <span className="text-[11px] text-muted-foreground">
                              • {solicitud.fecha.substring(0, 10)}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-foreground truncate mt-0.5">
                            {solicitud.institucion}
                          </p>
                        </div>
                        <Badge
                          tone={cardColor}
                          appearance="soft"
                          size="sm"
                          className="font-semibold shrink-0"
                        >
                          {solicitud.estado}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-surface/80 backdrop-blur-xs rounded-lg p-2.5 border border-border/40">
                        <div className="space-y-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Fuente y Proyecto
                          </p>
                          <p className="font-semibold text-foreground truncate">
                            {solicitud.fuentePrincipal}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {solicitud.proyectoNombre || "Proyecto institucional"}
                          </p>
                        </div>
                        <div className="space-y-1 min-w-0 sm:border-l sm:border-border/50 sm:pl-2.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Campos y Revisor
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              tone={hasConfidencial ? "warning" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="text-[10px] gap-1 px-1.5 py-0"
                            >
                              {hasConfidencial ? (
                                <Lock className="size-2.5" />
                              ) : (
                                <Unlock className="size-2.5" />
                              )}
                              {solicitud.camposCount ||
                                solicitud.fuentes?.[0]?.campos?.length ||
                                0}{" "}
                              campos · {hasConfidencial ? "Confidencial" : "Accesible"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Revisor:{" "}
                            <strong className="text-foreground">
                              {solicitud.revisorAsignado || "Sin asignar"}
                            </strong>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSolicitudExpediente(solicitud)}
                          className="w-full h-8 text-xs justify-center gap-1.5 text-foreground"
                        >
                          <Eye className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">Ver expediente</span>
                        </Button>
                        <Button
                          variant={isPendienteAsignacion ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSolicitudToAssign(solicitud);
                            setSelectedRevisorId(
                              solicitud.revisorAsignadoId || "U-EQGEST"
                            );
                            setObservacionAsignacion("");
                          }}
                          className="w-full h-8 text-xs justify-center gap-1.5 font-semibold"
                        >
                          <UserCheck className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {solicitud.revisorAsignado ? "Reasignar" : "Asignar"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </InteractiveCard>
                );
              })
            )}
          </div>

          {/* 5. Tabla Principal (Desktop — Homologada 100% con Cuentas Internas) */}
          <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
            <TooltipProvider>
              <Table
                className="w-full min-w-[1280px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[12%] min-w-[140px] pl-6">
                      ID SOLICITUD
                    </TableHead>
                    <TableHead className="w-[16%] min-w-[190px]">
                      INSTITUCIÓN SOLICITANTE
                    </TableHead>
                    <TableHead className="w-[15%] min-w-[175px]">
                      PROYECTO
                    </TableHead>
                    <TableHead className="w-[16%] min-w-[190px]">
                      FUENTE SOLICITADA
                    </TableHead>
                    <TableHead className="w-[12%] min-w-[140px]">
                      CAMPOS / TIPO
                    </TableHead>
                    <TableHead className="w-[9%] min-w-[110px]">
                      RECEPCIONADO
                    </TableHead>
                    <TableHead className="w-[13%] min-w-[160px]">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[11%] min-w-[140px]">
                      ASIGNADO A
                    </TableHead>
                    <TableHead className="w-[130px] min-w-[125px] pr-6 text-right">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSolicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-40 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">
                            No se encontraron solicitudes con los criterios seleccionados
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ajuste los filtros de búsqueda o limpie los filtros activos.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSolicitudes.map((solicitud) => {
                      const hasConfidencial = tieneCamposConfidenciales(solicitud);
                      const isPendienteAsignacion =
                        solicitud.estado ===
                          "Pendiente de asignación en Gestión" ||
                        solicitud.estado === "Pendiente de nueva asignación";
                      const isNuevaAsignacion =
                        solicitud.estado === "Pendiente de nueva asignación";

                      return (
                        <TableRow
                          key={solicitud.id}
                          className={cn(
                            "group transition-colors",
                            isNuevaAsignacion &&
                              "bg-warning/10 hover:bg-warning/15 border-l-4 border-l-warning"
                          )}
                        >
                          {/* ID Solicitud */}
                          <TableCell className="pl-6 align-middle">
                            <div className="flex items-center gap-2">
                              {isNuevaAsignacion && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex items-center justify-center size-6 rounded-lg bg-warning/20 text-warning border border-warning/40 shadow-2xs shrink-0 cursor-help animate-pulse">
                                      <AlertTriangle className="size-3.5" />
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    variant="surface"
                                    className="max-w-xs space-y-1 p-3 border-warning/40"
                                  >
                                    <p className="font-bold text-xs text-warning flex items-center gap-1.5">
                                      <AlertTriangle className="size-3.5 shrink-0" />
                                      Solicitud subsanada — Requiere nueva asignación
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                      El Coordinador corrigió las observaciones del expediente. Por regla del proceso BN-07,{" "}
                                      <strong className="text-foreground">
                                        no se envía automáticamente al revisor anterior
                                      </strong>{" "}
                                      y debe ser reasignada manualmente por el Director de Gestión.
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedSolicitudExpediente(solicitud)}
                                className="flex items-center gap-1.5 text-left group/id cursor-pointer"
                              >
                                <span className="font-mono font-bold text-xs text-primary group-hover/id:underline">
                                  {solicitud.id}
                                </span>
                                {solicitud.versionExpediente &&
                                  solicitud.versionExpediente > 1 && (
                                    <Badge
                                      tone={isNuevaAsignacion ? "warning" : "info"}
                                      appearance={isNuevaAsignacion ? "soft" : "outline"}
                                      size="sm"
                                      className="font-mono text-[10px] px-1.5 py-0"
                                    >
                                      v{solicitud.versionExpediente}
                                    </Badge>
                                  )}
                              </button>
                            </div>
                          </TableCell>

                          {/* Institución Solicitante */}
                          <TableCell className="max-w-[190px] text-left">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col truncate cursor-default">
                                  <span className="font-semibold text-foreground text-xs truncate">
                                    {solicitud.institucion}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {solicitud.tipoInstitucion}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface">
                                <p className="font-semibold text-xs">
                                  {solicitud.institucion}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {solicitud.tipoInstitucion} · Modalidad:{" "}
                                  {solicitud.modalidad || "API individual"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Proyecto */}
                          <TableCell className="max-w-[175px] text-left">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col truncate cursor-default">
                                  <span className="text-xs font-medium text-foreground truncate">
                                    {solicitud.proyectoNombre ||
                                      "Proyecto institucional"}
                                  </span>
                                  {(solicitud.proyectoId || solicitud.proyectoCodigo) && (
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {solicitud.proyectoId || solicitud.proyectoCodigo}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface">
                                <p className="font-semibold text-xs">
                                  {solicitud.proyectoNombre ||
                                    "Proyecto institucional"}
                                </p>
                                {(solicitud.proyectoId || solicitud.proyectoCodigo) && (
                                  <p className="text-[11px] font-mono text-muted-foreground">
                                    Código: {solicitud.proyectoId || solicitud.proyectoCodigo}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Fuente Solicitada */}
                          <TableCell className="max-w-[190px] text-left">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col truncate cursor-default">
                                  <span className="font-semibold text-xs text-foreground truncate">
                                    {solicitud.fuentePrincipal}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground truncate">
                                    {solicitud.servicioPrincipal || solicitud.modalidad}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface">
                                <p className="font-semibold text-xs">
                                  {solicitud.fuentePrincipal}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Servicio: {solicitud.servicioPrincipal || solicitud.modalidad}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* Campos / Clasificación */}
                          <TableCell className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-foreground">
                                {solicitud.camposCount ||
                                  solicitud.fuentes?.[0]?.campos?.length ||
                                  0}
                              </span>
                              {hasConfidencial ? (
                                <Badge
                                  tone="warning"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[11px] gap-1 px-2 py-0.5 rounded-full font-semibold"
                                >
                                  <Lock className="size-3" />
                                  Confidencial
                                </Badge>
                              ) : (
                                <Badge
                                  tone="neutral"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[11px] gap-1 px-2 py-0.5 rounded-full font-medium"
                                >
                                  <Unlock className="size-3" />
                                  Accesible
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* Fecha de Recepción */}
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap text-left">
                            {solicitud.fecha.substring(0, 10)}
                          </TableCell>

                          {/* Estado */}
                          <TableCell className="text-left">
                            <Badge
                              tone={
                                isNuevaAsignacion || isPendienteAsignacion
                                  ? "warning"
                                  : solicitud.estado.includes("Aprobada")
                                  ? "success"
                                  : solicitud.estado === "Observada"
                                  ? "danger"
                                  : "info"
                              }
                              appearance="soft"
                              size="sm"
                              className="text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full mr-1.5",
                                  isNuevaAsignacion || isPendienteAsignacion
                                    ? "bg-warning"
                                    : solicitud.estado.includes("Aprobada")
                                    ? "bg-success"
                                    : solicitud.estado === "Observada"
                                    ? "bg-danger"
                                    : "bg-info"
                                )}
                              />
                              {solicitud.estado}
                            </Badge>
                          </TableCell>

                          {/* Revisor Asignado */}
                          <TableCell className="text-left">
                            {solicitud.revisorAsignado ? (
                              <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                                  {solicitud.revisorAsignado.charAt(0)}
                                </div>
                                <span className="font-medium text-xs text-foreground whitespace-nowrap">
                                  {solicitud.revisorAsignado}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">
                                Sin asignar
                              </span>
                            )}
                          </TableCell>

                          {/* Acciones (Icon-sm con Tooltip idéntico a Cuentas Internas) */}
                          <TableCell className="w-[130px] min-w-[125px] pr-6 text-right align-middle">
                            <div className="inline-flex items-center justify-end gap-0.5 w-full">
                              {/* Ver Expediente (Contexto en Modal) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                      setSelectedSolicitudExpediente(solicitud)
                                    }
                                    aria-label={`Ver expediente de ${solicitud.id}`}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Ver expediente en modal
                                </TooltipContent>
                              </Tooltip>

                              {/* Asignar / Reasignar Revisor en Modal */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setSolicitudToAssign(solicitud);
                                      setSelectedRevisorId(
                                        solicitud.revisorAsignadoId ||
                                          "U-EQGEST"
                                      );
                                      setObservacionAsignacion("");
                                    }}
                                    aria-label={`Asignar o reasignar revisor para ${solicitud.id}`}
                                    className={cn(
                                      isPendienteAsignacion
                                        ? "text-warning hover:text-warning hover:bg-warning/15"
                                        : "text-primary hover:text-primary hover:bg-primary/10"
                                    )}
                                  >
                                    {solicitud.revisorAsignado ? (
                                      <RotateCcw className="size-4" />
                                    ) : (
                                      <UserCheck className="size-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {solicitud.revisorAsignado
                                    ? "Reasignar revisor del Equipo de Gestión"
                                    : "Asignar revisor del Equipo de Gestión"}
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
            </TooltipProvider>
          </div>

          {/* 6. Paginación Inferior (Idéntica a Gestión de Usuarios) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {filteredSolicitudes.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(
                    currentPage * pageSize,
                    filteredSolicitudes.length
                  )}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">
                  {filteredSolicitudes.length}
                </span>{" "}
                solicitudes
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
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
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
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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

      {/* DIALOG: ASIGNAR REVISOR DE GESTIÓN (Homologado con AccionCuentaDialog de Cuentas Internas) */}
      <Dialog
        open={!!solicitudToAssign}
        onOpenChange={(open) => !open && setSolicitudToAssign(null)}
      >
        <DialogContent
          variant="info"
          size="lg"
          className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          icon={<UserCheck className="size-10 text-info stroke-[2px]" />}
        >
          <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              {solicitudToAssign?.revisorAsignado
                ? "Recuperar y Reasignar Revisor de Gestión"
                : "Asignar Revisor del Equipo de Gestión"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
              Seleccione manualmente un revisor activo del Equipo de Gestión para realizar la revisión funcional del expediente (SOL-03).
            </DialogDescription>
          </DialogHeader>

          {solicitudToAssign && (
            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-4 text-xs flex-1 min-h-0 text-left">
              {/* Resumen del expediente a asignar */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Solicitud:</span>
                  <strong className="text-foreground font-mono">
                    {solicitudToAssign.id} (v
                    {solicitudToAssign.versionExpediente || 1})
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Institución solicitante:
                  </span>
                  <strong className="text-foreground">
                    {solicitudToAssign.institucion}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Proyecto:</span>
                  <strong className="text-foreground truncate max-w-[240px]">
                    {solicitudToAssign.proyectoNombre ||
                      "Proyecto institucional"}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Fuente solicitada:
                  </span>
                  <strong className="text-foreground truncate max-w-[240px]">
                    {solicitudToAssign.fuentePrincipal}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Director asignante:
                  </span>
                  <strong className="text-foreground">
                    Director Área de Gestión
                  </strong>
                </div>
              </div>

              {/* Aviso para solicitudes subsanadas */}
              {solicitudToAssign.estado === "Pendiente de nueva asignación" && (
                <div className="p-3 rounded-2xl border border-warning/30 bg-warning/10 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Esta solicitud fue{" "}
                    <strong>subsanada por el Coordinador</strong> (versión v
                    {solicitudToAssign.versionExpediente || 2}). Por estándar del proceso, requiere una nueva asignación formal que quedará debidamente registrada en la auditoría.
                  </p>
                </div>
              )}

              {/* Selector de Revisor Activo */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground block">
                  Seleccione persona activa del Equipo de Gestión{" "}
                  <span className="text-destructive">*</span>
                </label>
                <RadioGroup
                  value={selectedRevisorId}
                  onValueChange={setSelectedRevisorId}
                  className="grid grid-cols-1 gap-2.5"
                >
                  {REVISORES_GESTION.map((rev) => {
                    const isSel = selectedRevisorId === rev.id;
                    return (
                      <label
                        key={rev.id}
                        htmlFor={`revisor-gest-${rev.id}`}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer",
                          isSel
                            ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 shadow-xs"
                            : "border-border/80 bg-background hover:bg-muted/30 text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={rev.id}
                            id={`revisor-gest-${rev.id}`}
                          />
                          <div
                            className={cn(
                              "size-8 rounded-full flex items-center justify-center font-bold text-xs",
                              isSel
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            )}
                          >
                            {rev.nombre.charAt(0)}
                          </div>
                          <div>
                            <p
                              className={cn(
                                "text-xs font-bold",
                                isSel ? "text-primary" : "text-foreground"
                              )}
                            >
                              {rev.nombre}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {rev.cargo} · {rev.especialidad}
                            </p>
                          </div>
                        </div>
                        {isSel && (
                          <CheckCircle2 className="size-4 text-primary shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {solicitudToAssign.revisorAsignado && (
                <div className="rounded-2xl border border-border/80 bg-surface-muted/50 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Revisor actual:{" "}
                  </span>
                  {solicitudToAssign.revisorAsignado}
                  <p className="text-[11px] mt-0.5">
                    Al recuperar y reasignar la solicitud, se conserva íntegro el historial de acciones y comentarios previos registrados por el revisor anterior (SOL-03). Seleccione un nuevo revisor y especifique el motivo del cambio.
                  </p>
                </div>
              )}

              {/* Observaciones o instrucciones */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-foreground block">
                  {solicitudToAssign.revisorAsignado ? (
                    <>
                      Motivo de reasignación{" "}
                      <span className="text-destructive">*</span>
                    </>
                  ) : (
                    "Instrucciones u observaciones de asignación (Opcional):"
                  )}
                </label>
                <Textarea
                  rows={2}
                  value={observacionAsignacion}
                  onChange={(e) => setObservacionAsignacion(e.target.value)}
                  placeholder={
                    solicitudToAssign.revisorAsignado
                      ? "Detalle la justificación técnica u operativa del cambio..."
                      : "Indique prioridades, plazos sugeridos o notas para el revisor..."
                  }
                  className="text-xs bg-background border-border"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
            <Button
              variant="ghost"
              className="w-full sm:w-1/2 font-semibold"
              onClick={() => setSolicitudToAssign(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmarAsignacion}
              disabled={
                Boolean(solicitudToAssign?.revisorAsignado) &&
                (!observacionAsignacion.trim() ||
                  REVISORES_GESTION.find((r) => r.id === selectedRevisorId)
                    ?.nombre === solicitudToAssign?.revisorAsignado)
              }
              className="w-full sm:w-1/2 gap-1.5 font-bold shadow-xs"
            >
              <UserCheck className="size-4" />
              <span>
                {solicitudToAssign?.revisorAsignado
                  ? "Confirmar Reasignación"
                  : "Confirmar Asignación"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL EXPEDIENTE DE ACCESO (Idéntico a ExpedienteCuentaModal de Cuentas Internas) */}
      <Dialog
        open={!!selectedSolicitudExpediente}
        onOpenChange={(open) => {
          if (!open) setSelectedSolicitudExpediente(null);
        }}
      >
        <DialogContent
          variant="standard"
          size="3xl"
          className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
          showCloseButton={true}
        >
          {selectedSolicitudExpediente && (
            <>
              <DialogHeader className="gap-2 text-left items-start pb-2 border-b border-border/50 shrink-0">
                <div className="flex items-start justify-between w-full gap-4 pr-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Database className="size-6 text-primary stroke-[2.2px]" />
                    </div>
                    <div>
                      <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
                        Expediente Técnico de Acceso · {selectedSolicitudExpediente.id}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        Consulta informativa del expediente, campos solicitados, documentos y trazabilidad de asignaciones (v{selectedSolicitudExpediente.versionExpediente || 1}).
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    <Badge
                      tone={
                        selectedSolicitudExpediente.estado.includes("Pendiente")
                          ? "warning"
                          : selectedSolicitudExpediente.estado.includes("Aprobada")
                          ? "success"
                          : selectedSolicitudExpediente.estado === "Observada"
                          ? "danger"
                          : "info"
                      }
                      appearance="soft"
                      size="sm"
                      className="font-bold gap-1.5"
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {selectedSolicitudExpediente.estado}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              {/* Barra de pestañas segmentadas (Pills redondeadas idénticas a ExpedienteCuentaModal) */}
              <div className="p-1 rounded-xl sm:rounded-full bg-muted/40 border border-border/60 flex items-center gap-1 shrink-0 overflow-x-auto modal-scroll-area max-w-full">
                <button
                  type="button"
                  onClick={() => setTabExpediente("general")}
                  className={cn(
                    "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                    tabExpediente === "general"
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  Información general y documentos
                </button>
                <button
                  type="button"
                  onClick={() => setTabExpediente("campos")}
                  className={cn(
                    "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                    tabExpediente === "campos"
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  Fuente y campos ({selectedSolicitudExpediente.fuentes?.[0]?.campos?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setTabExpediente("historial")}
                  className={cn(
                    "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                    tabExpediente === "historial"
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  Auditoría y asignaciones
                </button>
              </div>

              {/* Contenido scrolleable de las pestañas */}
              <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-1 flex-1 min-h-0">
                {tabExpediente === "general" && (
                  <div className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                        <span className="text-[11px] text-muted-foreground block">
                          Institución solicitante:
                        </span>
                        <p className="font-bold text-sm text-foreground">
                          {selectedSolicitudExpediente.institucion}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {selectedSolicitudExpediente.tipoInstitucion}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                        <span className="text-[11px] text-muted-foreground block">
                          Proyecto activo vinculado:
                        </span>
                        <p className="font-bold text-sm text-foreground">
                          {selectedSolicitudExpediente.proyectoNombre ||
                            "Proyecto institucional"}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          Código: {selectedSolicitudExpediente.proyectoId || "PRJ-01"}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                        <span className="text-[11px] text-muted-foreground block">
                          Modalidad solicitada:
                        </span>
                        <p className="font-bold text-sm text-primary">
                          {selectedSolicitudExpediente.modalidad || "API individual"}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                        <span className="text-[11px] text-muted-foreground block">
                          Cupo solicitado:
                        </span>
                        <p className="font-mono font-bold text-sm text-foreground">
                          {(
                            selectedSolicitudExpediente.cupo || 50000
                          ).toLocaleString()}{" "}
                          registros
                        </p>
                      </div>
                    </div>

                    {/* Documentos de soporte */}
                    <div className="p-3.5 rounded-2xl bg-surface border border-border/70 space-y-2.5">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-4 text-primary" />
                        Documentos de Soporte Adjuntos
                      </h3>
                      <div className="space-y-2">
                        {(
                          selectedSolicitudExpediente.documentos || [
                            {
                              id: "d-1",
                              nombre: "Oficio_Solicitud_Interoperabilidad.pdf",
                              tipo: "Oficio",
                              tamano: "1.2 MB",
                              fechaCarga: "2026-09-24",
                              categoria: "Legal",
                            },
                          ]
                        ).map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="size-4 text-primary shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground">
                                  {doc.nombre}
                                </p>
                                <span className="text-[11px] text-muted-foreground">
                                  {doc.tipo} · {doc.fechaCarga}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                toast.info(`Visualizando documento: ${doc.nombre}`)
                              }
                              className="h-7 text-xs text-primary gap-1"
                            >
                              <ExternalLink className="size-3" />
                              Ver
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {tabExpediente === "campos" && (
                  <div className="space-y-3 text-left">
                    <div className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 text-xs space-y-1">
                      <span className="text-muted-foreground text-[11px] block">
                        Fuente única solicitada:
                      </span>
                      <strong className="text-foreground text-sm block">
                        {selectedSolicitudExpediente.fuentePrincipal}
                      </strong>
                      <span className="text-muted-foreground text-[11px] block">
                        Servicio: {selectedSolicitudExpediente.servicioPrincipal}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {selectedSolicitudExpediente.fuentes?.[0]?.campos?.map(
                        (campo) => (
                          <div
                            key={campo.id}
                            className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-foreground">
                                {campo.nombre}
                              </span>
                              {campo.clasificacion === "Confidencial" ? (
                                <Badge
                                  tone="warning"
                                  appearance="soft"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <Lock className="size-2.5" />
                                  Confidencial (DPI)
                                </Badge>
                              ) : (
                                <Badge
                                  tone="neutral"
                                  appearance="soft"
                                  size="sm"
                                  className="gap-1"
                                >
                                  <Unlock className="size-2.5" />
                                  Accesible
                                </Badge>
                              )}
                            </div>

                            {campo.descripcion && (
                              <p className="text-[11px] text-muted-foreground">
                                {campo.descripcion}
                              </p>
                            )}

                            <div className="p-2.5 rounded-xl bg-background border border-border/60 space-y-1">
                              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                                Finalidad declarada:
                              </span>
                              <p className="text-[11px] text-foreground leading-relaxed">
                                {campo.finalidad ||
                                  "Finalidad requerida para el trámite institucional."}
                              </p>
                            </div>

                            {campo.clasificacion === "Confidencial" && (
                              <div className="p-2.5 rounded-xl bg-warning/5 border border-warning/30 space-y-1">
                                <span className="text-[10px] font-semibold text-warning uppercase tracking-wide block">
                                  Justificación jurídica presentada (LOPDP):
                                </span>
                                <p className="text-[11px] text-foreground leading-relaxed">
                                  {campo.fundamento ||
                                    "Base legal de interoperabilidad conforme normativa vigente."}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {tabExpediente === "historial" && (
                  <div className="space-y-3 text-left">
                    {selectedSolicitudExpediente.historialAsignaciones &&
                    selectedSolicitudExpediente.historialAsignaciones.length >
                      0 ? (
                      <div className="space-y-2.5">
                        {selectedSolicitudExpediente.historialAsignaciones.map(
                          (asig) => (
                            <div
                              key={asig.id}
                              className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 text-xs space-y-1"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">
                                  Asignado a:{" "}
                                  <strong className="text-primary">
                                    {asig.revisorNombre}
                                  </strong>
                                </span>
                                <span className="text-[11px] font-mono text-muted-foreground">
                                  {asig.fecha}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Asignó: {asig.director} · Versión de expediente: v
                                {asig.versionExpediente}
                              </p>
                              {asig.observacion && (
                                <p className="text-[11px] text-foreground italic bg-background p-2 rounded-xl border border-border/60">
                                  &ldquo;{asig.observacion}&rdquo;
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-xs text-muted-foreground font-medium">
                        Aún no registra asignaciones previas.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2.5 w-full flex items-center justify-between border-t border-border/50 shrink-0 mt-1">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setSelectedSolicitudExpediente(null)}
                  className="h-9 px-5 text-xs !rounded-full font-semibold cursor-pointer"
                >
                  Cerrar expediente
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSolicitudToAssign(selectedSolicitudExpediente);
                    setSelectedRevisorId(
                      selectedSolicitudExpediente.revisorAsignadoId ||
                        "U-EQGEST"
                    );
                    setObservacionAsignacion("");
                    setSelectedSolicitudExpediente(null);
                  }}
                  className="gap-1.5 font-semibold h-9 px-5 text-xs !rounded-full shadow-xs"
                >
                  <UserCheck className="size-4" />
                  <span>
                    {selectedSolicitudExpediente.revisorAsignado
                      ? "Reasignar revisor ahora"
                      : "Asignar revisor ahora"}
                  </span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
