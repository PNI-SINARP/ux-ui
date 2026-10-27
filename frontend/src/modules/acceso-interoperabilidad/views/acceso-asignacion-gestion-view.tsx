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
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [revisorFilter, setRevisorFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Solicitud seleccionada para contexto del expediente (Drawer)
  const [selectedSolicitudExpediente, setSelectedSolicitudExpediente] = useState<SolicitudAcceso | null>(null);

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

  // Filtrado de solicitudes
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
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
        if (revisorFilter !== "Sin asignar" && s.revisorAsignado !== revisorFilter) {
          return false;
        }
      }

      return true;
    });
  }, [solicitudes, searchTerm, estadoFilter, confidencialFilter, revisorFilter]);

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
    const total = solicitudes.length;
    const pendientesPrimera = solicitudes.filter(
      (s) => s.estado === "Pendiente de asignación en Gestión"
    ).length;
    const pendientesNueva = solicitudes.filter(
      (s) => s.estado === "Pendiente de nueva asignación"
    ).length;
    const enRevision = solicitudes.filter(
      (s) =>
        s.estado === "Asignada a revisión de Gestión" ||
        s.estado === "En revisión de Gestión"
    ).length;
    return { total, pendientesPrimera, pendientesNueva, enRevision };
  }, [solicitudes]);

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
                Asignación de Solicitudes de Acceso a Fuentes
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-2xl leading-relaxed">
                Bandeja exclusiva para el <strong>Director de Gestión</strong> (BN-07 · SOL-03). Verifique el expediente recibido y gestione manualmente la asignación o reasignación de revisores técnicos.
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

          {/* Banner de alerta: Solicitudes subsanadas pendientes de nueva asignación */}
          {metricas.pendientesNueva > 0 && (
            <div className="p-4 rounded-2xl border border-warning/30 bg-warning/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Atención requerida: {metricas.pendientesNueva} solicitud(es) subsanada(s) esperan nueva asignación
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    El Coordinador corrigió las observaciones del expediente. Por regla del proceso BN-07,{" "}
                    <strong>no se envían automáticamente al revisor anterior</strong> y deben ser reasignadas manualmente por el Director de Gestión.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEstadoFilter((prev) =>
                    prev === "Pendiente de nueva asignación"
                      ? ""
                      : "Pendiente de nueva asignación"
                  )
                }
                className="shrink-0 text-xs border-warning/40 text-warning hover:bg-warning/15"
              >
                {estadoFilter === "Pendiente de nueva asignación"
                  ? "Ver todas"
                  : "Filtrar subsanadas"}
              </Button>
            </div>
          )}

          {/* 2. Tarjetas de Resumen Interactivo (KPI Cards featured como Gestión de Usuarios) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* Total Expedientes BN-07 */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => setEstadoFilter("")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter("");
                }
              }}
              aria-pressed={estadoFilter === ""}
              className={cn(
                "cursor-pointer text-left border-t-primary",
                estadoFilter === "" &&
                  "ring-2 ring-primary bg-primary/5 shadow-sm"
              )}
              innerClassName="p-4 sm:p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Database className="size-4.5" />
                </div>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-primary/20"
                >
                  BN-07
                </Badge>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  {metricas.total}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Total expedientes recibidos
                </p>
              </div>
            </Card>

            {/* Pendientes de 1ra Asignación */}
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
                "cursor-pointer text-left border-t-warning",
                estadoFilter === "Pendiente de asignación en Gestión" &&
                  "ring-2 ring-warning bg-warning/5 shadow-sm"
              )}
              innerClassName="p-4 sm:p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                  <Clock className="size-4.5" />
                </div>
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-warning/20"
                >
                  Por asignar
                </Badge>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  {metricas.pendientesPrimera}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Pendientes de 1ra asignación
                </p>
              </div>
            </Card>

            {/* Subsanadas (Reasignación) */}
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
                "cursor-pointer text-left border-t-info",
                estadoFilter === "Pendiente de nueva asignación" &&
                  "ring-2 ring-info bg-info/5 shadow-sm"
              )}
              innerClassName="p-4 sm:p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-info/10 text-info flex items-center justify-center">
                  <RotateCcw className="size-4.5" />
                </div>
                <Badge
                  tone="info"
                  appearance="soft"
                  size="sm"
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-info/20"
                >
                  Subsanadas
                </Badge>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  {metricas.pendientesNueva}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Pendientes de nueva asignación
                </p>
              </div>
            </Card>

            {/* En Revisión de Gestión */}
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
                "cursor-pointer text-left border-t-success",
                estadoFilter === "En revisión de Gestión" &&
                  "ring-2 ring-success bg-success/5 shadow-sm"
              )}
              innerClassName="p-4 sm:p-5 flex flex-col justify-between gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <UserCheck className="size-4.5" />
                </div>
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-success/20"
                >
                  Asignadas
                </Badge>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                  {metricas.enRevision}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  En revisión de Gestión
                </p>
              </div>
            </Card>
          </div>

          {/* 3. Barra de Búsqueda y Filtros (Mismo diseño que Gestión de Usuarios) */}
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
              {/* Buscador a la izquierda */}
              <div className="w-full lg:max-w-sm">
                <Search
                  size="sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  placeholder="Buscar por ID, institución, fuente, proyecto o revisor..."
                  aria-label="Buscar solicitudes de acceso"
                />
              </div>

              {/* Comboboxes de Filtros a la derecha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2.5">
                {/* Filtro por Estado */}
                <div className="w-full lg:w-56">
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
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Sin estados</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro por Clasificación de Campos */}
                <div className="w-full lg:w-56">
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
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Sin opciones</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro por Revisor Asignado */}
                <div className="w-full lg:w-48">
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
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>Sin revisores</ComboboxEmpty>
                      <ComboboxList>
                        {(item) => (
                          <ComboboxItem key={item} value={item}>
                            {item}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
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

          {/* 4. Vista Móvil / Tablet (Cards Responsivas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden w-full">
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

                return (
                  <InteractiveCard
                    key={solicitud.id}
                    className="p-4 flex flex-col justify-between gap-3 bg-surface border-border/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
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
                        </div>
                        <p className="font-bold text-sm text-foreground truncate mt-0.5">
                          {solicitud.institucion}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {solicitud.fuentePrincipal}
                        </p>
                      </div>
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
                        className="font-semibold shrink-0"
                      >
                        {solicitud.estado}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge
                        tone={hasConfidencial ? "warning" : "neutral"}
                        appearance="soft"
                        size="sm"
                        className="text-[11px] gap-1"
                      >
                        {hasConfidencial ? (
                          <Lock className="size-3" />
                        ) : (
                          <Unlock className="size-3" />
                        )}
                        {solicitud.camposCount ||
                          solicitud.fuentes?.[0]?.campos?.length ||
                          0}{" "}
                        campos · {hasConfidencial ? "Confidencial" : "Accesible"}
                      </Badge>
                      <span className="text-[11px]">
                        Revisor:{" "}
                        <strong className="text-foreground">
                          {solicitud.revisorAsignado || "Sin asignar"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground">
                        Recepción: {solicitud.fecha.substring(0, 10)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSolicitudExpediente(solicitud)}
                          className="gap-1 h-7 px-2 text-xs"
                        >
                          <Eye className="size-3.5" />
                          Expediente
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
                          className="gap-1 font-semibold h-7 px-2.5 text-xs"
                        >
                          <UserCheck className="size-3.5" />
                          {solicitud.revisorAsignado ? "Reasignar" : "Asignar"}
                        </Button>
                      </div>
                    </div>
                  </InteractiveCard>
                );
              })
            )}
          </div>

          {/* 5. Tabla Principal (Desktop — Mismo estándar que Gestión de Usuarios) */}
          <div className="hidden md:block w-full">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap text-left">
                      ID SOLICITUD
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      INSTITUCIÓN SOLICITANTE
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      PROYECTO
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      FUENTE SOLICITADA
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      CAMPOS / TIPO
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      RECEPCIONADO
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      ESTADO
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-left">
                      ASIGNADO A
                    </TableHead>
                    <TableHead className="whitespace-nowrap text-right">
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
                        <TableRow key={solicitud.id} className="group">
                          {/* ID Solicitud */}
                          <TableCell className="text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-primary">
                                {solicitud.id}
                              </span>
                              {solicitud.versionExpediente &&
                                solicitud.versionExpediente > 1 && (
                                  <Badge
                                    tone="info"
                                    appearance="outline"
                                    size="sm"
                                    className="font-mono text-[10px] px-1.5 py-0"
                                  >
                                    v{solicitud.versionExpediente}
                                  </Badge>
                                )}
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
                              <TooltipContent side="top">
                                <p className="font-semibold">
                                  {solicitud.institucion}
                                </p>
                                <p className="text-[11px] opacity-80">
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
                                  {solicitud.proyectoId && (
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {solicitud.proyectoId}
                                    </span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-semibold">
                                  {solicitud.proyectoNombre ||
                                    "Proyecto institucional"}
                                </p>
                                {solicitud.proyectoId && (
                                  <p className="text-[11px] font-mono opacity-80">
                                    Código: {solicitud.proyectoId}
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
                                    {solicitud.servicioPrincipal}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-semibold">
                                  {solicitud.fuentePrincipal}
                                </p>
                                <p className="text-[11px] opacity-80">
                                  Servicio: {solicitud.servicioPrincipal}
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

                          {/* Acciones */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Ver Expediente (Contexto) */}
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
                                  Ver expediente como contexto
                                </TooltipContent>
                              </Tooltip>

                              {/* Asignar / Reasignar Revisor */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={
                                      isPendienteAsignacion
                                        ? "primary"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={() => {
                                      setSolicitudToAssign(solicitud);
                                      setSelectedRevisorId(
                                        solicitud.revisorAsignadoId ||
                                          "U-EQGEST"
                                      );
                                      setObservacionAsignacion("");
                                    }}
                                    className="gap-1.5 font-semibold px-2.5 h-7 text-xs"
                                  >
                                    <UserCheck className="size-3.5" />
                                    <span>
                                      {solicitud.revisorAsignado
                                        ? "Reasignar"
                                        : "Asignar"}
                                    </span>
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

      {/* DIALOG: ASIGNAR REVISOR DE GESTIÓN */}
      <Dialog
        open={!!solicitudToAssign}
        onOpenChange={(open) => !open && setSolicitudToAssign(null)}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              {solicitudToAssign?.revisorAsignado
                ? "Reasignar revisor de Gestión"
                : "Asignar revisor de Gestión"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Seleccione manualmente un revisor activo del Equipo de Gestión para realizar la revisión funcional del expediente.
            </DialogDescription>
          </DialogHeader>

          {solicitudToAssign && (
            <div className="space-y-4 my-2 text-xs">
              {/* Resumen del expediente a asignar */}
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
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
                <div className="p-3 rounded-xl border border-warning/30 bg-warning/10 flex items-start gap-2.5">
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
                          "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
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
                <div className="rounded-xl border border-border/80 bg-surface-muted/50 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Revisor actual:{" "}
                  </span>
                  {solicitudToAssign.revisorAsignado}
                  <p className="text-[11px] mt-0.5">
                    Seleccione un nuevo revisor y especifique el motivo del cambio.
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

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSolicitudToAssign(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmarAsignacion}
              disabled={
                Boolean(solicitudToAssign?.revisorAsignado) &&
                (!observacionAsignacion.trim() ||
                  REVISORES_GESTION.find((r) => r.id === selectedRevisorId)
                    ?.nombre === solicitudToAssign?.revisorAsignado)
              }
              className="gap-1.5 font-semibold shadow-xs"
            >
              <UserCheck className="size-4" />
              <span>
                {solicitudToAssign?.revisorAsignado
                  ? "Confirmar reasignación"
                  : "Confirmar asignación"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SHEET (DRAWER): CONSULTA DE EXPEDIENTE COMO CONTEXTO */}
      <Sheet
        open={!!selectedSolicitudExpediente}
        onOpenChange={(open) => !open && setSelectedSolicitudExpediente(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6"
        >
          {selectedSolicitudExpediente && (
            <>
              <SheetHeader className="pb-4 border-b border-border/70 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-base text-foreground">
                    {selectedSolicitudExpediente.id}
                  </span>
                  <Badge tone="info" appearance="soft" size="sm">
                    v{selectedSolicitudExpediente.versionExpediente || 1}
                  </Badge>
                </div>
                <SheetTitle className="text-xl font-bold text-foreground">
                  Expediente Técnico de Acceso
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Consulta informativa para el Director de Gestión. La revisión funcional la efectúa el revisor asignado.
                </SheetDescription>
              </SheetHeader>

              {/* Ficha Resumen */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[11px]">
                    Institución solicitante:
                  </span>
                  <strong className="text-foreground">
                    {selectedSolicitudExpediente.institucion}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[11px]">
                    Proyecto:
                  </span>
                  <strong
                    className="text-foreground truncate block"
                    title={selectedSolicitudExpediente.proyectoNombre}
                  >
                    {selectedSolicitudExpediente.proyectoNombre ||
                      "Proyecto institucional"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[11px]">
                    Modalidad solicitada:
                  </span>
                  <strong className="text-primary block">
                    {selectedSolicitudExpediente.modalidad || "API individual"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <span className="text-muted-foreground block text-[11px]">
                    Cupo solicitado:
                  </span>
                  <strong className="text-foreground font-mono block">
                    {(
                      selectedSolicitudExpediente.cupo || 50000
                    ).toLocaleString()}{" "}
                    registros
                  </strong>
                </div>
              </div>

              {/* Fuente y Campos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Database className="size-4 text-primary" />
                    Fuente y Campos Requeridos
                  </h3>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    {selectedSolicitudExpediente.fuentes?.[0]?.campos?.length ||
                      0}{" "}
                    campos
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 bg-background text-xs space-y-1">
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

                {/* Lista de Campos con Finalidad y Justificación */}
                <div className="space-y-3 pt-2">
                  {selectedSolicitudExpediente.fuentes?.[0]?.campos?.map(
                    (campo) => (
                      <div
                        key={campo.id}
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
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
                              Confidencial
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

                        <div className="p-2.5 rounded-lg bg-background border border-border/60 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                            Finalidad declarada:
                          </span>
                          <p className="text-[11px] text-foreground leading-relaxed">
                            {campo.finalidad ||
                              "Finalidad requerida para el trámite institucional."}
                          </p>
                        </div>

                        {campo.clasificacion === "Confidencial" && (
                          <div className="p-2.5 rounded-lg bg-warning/5 border border-warning/30 space-y-1">
                            <span className="text-[10px] font-semibold text-warning uppercase tracking-wide block">
                              Justificación jurídica presentada:
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

              {/* Documentos de soporte */}
              <div className="space-y-2 pt-2 border-t border-border/70">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="size-4 text-primary" />
                  Documentos de Soporte
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
                      className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background text-xs"
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

              {/* Historial de Asignaciones y Reasignaciones */}
              <div className="space-y-3 pt-2 border-t border-border/70">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <History className="size-4 text-primary" />
                  Historial de Asignaciones
                </h3>

                {selectedSolicitudExpediente.historialAsignaciones &&
                selectedSolicitudExpediente.historialAsignaciones.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedSolicitudExpediente.historialAsignaciones.map(
                      (asig) => (
                        <div
                          key={asig.id}
                          className="p-3 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">
                              Asignado a:{" "}
                              <strong className="text-primary">
                                {asig.revisorNombre}
                              </strong>
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {asig.fecha}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Asignó: {asig.director} · Versión de expediente: v
                            {asig.versionExpediente}
                          </p>
                          {asig.observacion && (
                            <p className="text-[11px] text-foreground italic bg-background p-1.5 rounded-lg border border-border/60">
                              &ldquo;{asig.observacion}&rdquo;
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Aún no registra asignaciones previas.
                  </p>
                )}
              </div>

              {/* Botón de acción directo desde el drawer */}
              <div className="pt-4 border-t border-border/70 flex justify-end">
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
                  className="gap-1.5 font-semibold shadow-xs"
                >
                  <UserCheck className="size-4" />
                  <span>Asignar revisor ahora</span>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </WireframeDashboardLayout>
  );
}
