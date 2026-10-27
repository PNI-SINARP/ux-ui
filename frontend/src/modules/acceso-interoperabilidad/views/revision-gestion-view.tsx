"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  FileSignature,
  Clock,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  X,
  Eye,
  FileSearch,
  Building2,
  FolderKanban,
  ShieldAlert,
  History,
  FileText,
  Sparkles,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Search } from "@/components/ui/search";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxInput,
  ComboboxContent,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
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
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useSolicitudesStore,
  SolicitudAcceso,
  ObservacionItem,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { cn } from "@/lib/utils";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";

const REVISORES_GESTION = [
  { id: "U-EQGEST", nombre: "Ana Torres", cargo: "Revisora Técnica de Gestión" },
  { id: "U-EQGEST2", nombre: "Marcos Silva", cargo: "Revisor Funcional" },
  { id: "U-EQGEST3", nombre: "Elena Viteri", cargo: "Analista de Integración" },
];

const ESTADOS_FILTRO = [
  "Pendientes de evaluación",
  "Asignada a revisión de Gestión",
  "En revisión de Gestión",
  "Observada",
  "Aprobadas funcionalmente",
  "Aprobada por Gestión",
  "Pendiente de asignación en Normatividad",
];

const CLASIFICACION_FILTRO = [
  "Contiene campos confidenciales",
  "Solo campos accesibles",
];

type ExpedienteTabId = "resumen" | "campos" | "confidencial" | "trazabilidad";

export function RevisionGestionView() {
  const {
    solicitudes,
    aprobarGestion,
    observarGestion,
  } = useSolicitudesStore();

  const [activeRevisorId, setActiveRevisorId] = useState<string>("U-EQGEST");
  const activeRevisor =
    REVISORES_GESTION.find((r) => r.id === activeRevisorId) ||
    REVISORES_GESTION[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [confidencialFilter, setConfidencialFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Estados de Modales (Homologados con Cuentas Internas y Solicitudes Pendientes)
  const [expedienteOpen, setExpedienteOpen] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(null);
  const [activeExpedienteTab, setActiveExpedienteTab] =
    useState<ExpedienteTabId>("resumen");

  const [aprobarOpen, setAprobarOpen] = useState(false);
  const [comentarioAprobacion, setComentarioAprobacion] = useState("");

  const [observarOpen, setObservarOpen] = useState(false);
  const [observacionGeneral, setObservacionGeneral] = useState("");
  const [campoObservadoTarget, setCampoObservadoTarget] = useState<string>("");
  const [campoObservadoTexto, setCampoObservadoTexto] = useState<string>("");

  const selectedSolicitud = useMemo(
    () => solicitudes.find((s) => s.id === selectedSolicitudId) || null,
    [solicitudes, selectedSolicitudId]
  );

  const tieneConfidenciales = (s: SolicitudAcceso) => {
    return (
      s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      ) || false
    );
  };

  // Solicitudes asignadas exclusivamente al revisor autenticado (SOL-04)
  const asignadasAlRevisor = useMemo(() => {
    return solicitudes.filter(
      (s) =>
        s.revisorAsignadoId === activeRevisor.id ||
        s.revisorAsignado === activeRevisor.nombre
    );
  }, [solicitudes, activeRevisor]);

  const filteredSolicitudes = useMemo(() => {
    return asignadasAlRevisor.filter((s) => {
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "").toLowerCase().includes(term);
        const matchesProyecto = (s.proyectoNombre || "").toLowerCase().includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesProyecto) {
          return false;
        }
      }

      if (estadoFilter !== "") {
        if (
          estadoFilter === "Pendientes de evaluación" &&
          (s.estado === "Asignada a revisión de Gestión" ||
            s.estado === "En revisión de Gestión")
        ) {
          // Agrupa asignadas y en revisión funcional
        } else if (
          estadoFilter === "Aprobadas funcionalmente" &&
          (s.estado === "Aprobada por Gestión" ||
            s.estado === "Pendiente de asignación en Normatividad")
        ) {
          // Agrupa aprobadas por Gestión (accesibles o derivadas a DPI)
        } else if (s.estado !== estadoFilter) {
          return false;
        }
      }

      if (
        confidencialFilter === "Contiene campos confidenciales" &&
        !tieneConfidenciales(s)
      ) {
        return false;
      }
      if (
        confidencialFilter === "Solo campos accesibles" &&
        tieneConfidenciales(s)
      ) {
        return false;
      }

      return true;
    });
  }, [asignadasAlRevisor, searchTerm, estadoFilter, confidencialFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter, confidencialFilter, activeRevisorId]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / pageSize));

  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  const metricas = useMemo(() => {
    const total = asignadasAlRevisor.length;
    const pendientesRevision = asignadasAlRevisor.filter(
      (s) =>
        s.estado === "Asignada a revisión de Gestión" ||
        s.estado === "En revisión de Gestión"
    ).length;
    const observadas = asignadasAlRevisor.filter(
      (s) => s.estado === "Observada"
    ).length;
    const aprobadas = asignadasAlRevisor.filter(
      (s) =>
        s.estado === "Aprobada por Gestión" ||
        s.estado === "Pendiente de asignación en Normatividad"
    ).length;
    return { total, pendientesRevision, observadas, aprobadas };
  }, [asignadasAlRevisor]);

  const hasActiveFilters =
    searchTerm !== "" || estadoFilter !== "" || confidencialFilter !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setEstadoFilter("");
    setConfidencialFilter("");
  };

  const openExpedienteModal = (
    solicitud: SolicitudAcceso,
    tab: ExpedienteTabId = "resumen"
  ) => {
    setSelectedSolicitudId(solicitud.id);
    setActiveExpedienteTab(tab);
    setExpedienteOpen(true);
  };

  const openAprobarModal = (solicitud: SolicitudAcceso) => {
    setSelectedSolicitudId(solicitud.id);
    setComentarioAprobacion(
      "Se verifica la pertinencia funcional de cada campo solicitado, su finalidad de uso institucional y la justificación normativa adjunta."
    );
    setAprobarOpen(true);
  };

  const openObservarModal = (solicitud: SolicitudAcceso) => {
    setSelectedSolicitudId(solicitud.id);
    setObservacionGeneral("");
    const firstField =
      solicitud.fuentes?.[0]?.campos?.[0]?.nombre ||
      solicitud.fuentes?.[0]?.campos?.[0]?.nombreCampo ||
      "";
    setCampoObservadoTarget(firstField);
    setCampoObservadoTexto("");
    setObservarOpen(true);
  };

  const handleConfirmAprobar = () => {
    if (!selectedSolicitud) return;
    const hasConf = tieneConfidenciales(selectedSolicitud);
    const camposAprobados =
      selectedSolicitud.fuentes?.[0]?.campos?.map(
        (c) => c.nombre || c.nombreCampo || c.id
      ) || [];
    aprobarGestion(selectedSolicitud.id, {
      revisor: activeRevisor.nombre,
      camposAprobados,
      modalidadesAutorizadas: selectedSolicitud.modalidad || "API individual",
      cupoAprobado: selectedSolicitud.cupo || 50000,
    });
    setAprobarOpen(false);
    setExpedienteOpen(false);
    setFeedbackBanner(
      hasConf
        ? `Solicitud ${selectedSolicitud.id} aprobada funcionalmente por ${activeRevisor.nombre}. Al contener campos confidenciales, fue derivada automáticamente al Director DPI (SOL-07).`
        : `Solicitud ${selectedSolicitud.id} aprobada funcionalmente por ${activeRevisor.nombre}. Al contener solo campos accesibles, avanza a Formalización e Instrumentación (BN-08).`
    );
  };

  const handleConfirmObservar = () => {
    if (!selectedSolicitud || !observacionGeneral.trim()) return;
    const today = new Date().toISOString().substring(0, 10);
    const observaciones: ObservacionItem[] = [
      {
        id: `obs-gen-${Date.now()}`,
        tipo: "general",
        elementoNombre: "Expediente general",
        descripcion: observacionGeneral.trim(),
        fecha: today,
        revisor: activeRevisor.nombre,
        etapa: "Gestión",
      },
    ];
    if (campoObservadoTarget && campoObservadoTexto.trim()) {
      observaciones.push({
        id: `obs-cmp-${Date.now() + 1}`,
        tipo: "campo",
        elementoNombre: campoObservadoTarget,
        descripcion: campoObservadoTexto.trim(),
        fecha: today,
        revisor: activeRevisor.nombre,
        etapa: "Gestión",
      });
    }
    observarGestion(selectedSolicitud.id, {
      revisor: activeRevisor.nombre,
      observaciones,
      diasPlazo: 3,
    });
    setObservarOpen(false);
    setExpedienteOpen(false);
    setFeedbackBanner(
      `Observaciones registradas en ${selectedSolicitud.id}. El expediente cambió a estado Observada y se notificó al Coordinador SINARP con plazo de 3 días hábiles (PAR-13).`
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-gestion"
      currentRole="EQ_GESTION"
      currentUser={{
        ...MOCK_USERS_BY_ROLE.EQ_GESTION,
        name: activeRevisor.nombre,
        roleTitle: activeRevisor.cargo,
      }}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Equipo de Gestión", href: "/revision-gestion" },
        { label: "Revisión de Solicitudes de Acceso" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* CABECERA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Revisar accesos
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Consulta y evalúa la finalidad de uso por campo, modalidad, cupo y documentos justificativos de las solicitudes de acceso que tienes asignadas.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden xl:inline">
                  Revisor activo:
                </span>
                <Combobox
                  items={REVISORES_GESTION.map((r) => ({
                    value: r.id,
                    label: `${r.nombre} (${r.cargo})`,
                  }))}
                  value={{
                    value: activeRevisor.id,
                    label: `${activeRevisor.nombre} (${activeRevisor.cargo})`,
                  }}
                  onValueChange={(val: any) => {
                    if (val) {
                      setActiveRevisorId(typeof val === "string" ? val : val.value);
                    }
                  }}
                >
                  <ComboboxSelectTrigger className="h-9 text-xs min-w-[220px] bg-background border-border/80" />
                  <ComboboxContent align="end" className="w-[300px]">
                    <ComboboxList>
                      {REVISORES_GESTION.map((r) => (
                        <ComboboxItem
                          key={r.id}
                          value={{ value: r.id, label: `${r.nombre} (${r.cargo})` }}
                          className="text-xs"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{r.nombre}</p>
                            <p className="text-[10px] text-muted-foreground">{r.cargo}</p>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <Badge
                tone="info"
                appearance="soft"
                size="md"
                className="font-semibold px-3 py-1.5 text-xs"
              >
                {metricas.pendientesRevision} pendiente(s) de evaluación
              </Badge>
            </div>
          </div>

          {feedbackBanner && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-xs text-foreground animate-fade-in shrink-0">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-success shrink-0" />
                <span className="font-medium">{feedbackBanner}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setFeedbackBanner(null)}
                aria-label="Cerrar notificación"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}

          {/* TARJETAS KPI INTERACTIVAS (Homologadas 100% con Cuentas Internas) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {/* KPI 1: Total Asignadas */}
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
                  Mi bandeja
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Asignadas a mi cargo
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.total}
                </p>
              </div>
            </Card>

            {/* KPI 2: Pendientes de Evaluación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter(
                  estadoFilter === "Pendientes de evaluación"
                    ? ""
                    : "Pendientes de evaluación"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Pendientes de evaluación"
                      ? ""
                      : "Pendientes de evaluación"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Pendientes de evaluación"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Pendientes de evaluación"
                  ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                  : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Pendientes de evaluación"
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
                  Por evaluar
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Pendientes de Evaluación
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.pendientesRevision}
                </p>
              </div>
            </Card>

            {/* KPI 3: Observadas en Subsanación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter(
                  estadoFilter === "Observada" ? "" : "Observada"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Observada" ? "" : "Observada"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Observada"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Observada"
                  ? "bg-danger/15 border-danger ring-2 ring-danger/40 shadow-xs"
                  : "bg-danger/5 hover:bg-danger/10 border-danger/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Observada"
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
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Plazo 3 días
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Observadas en Subsanación
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.observadas}
                </p>
              </div>
            </Card>

            {/* KPI 4: Aprobadas Funcionalmente */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() =>
                setEstadoFilter(
                  estadoFilter === "Aprobadas funcionalmente"
                    ? ""
                    : "Aprobadas funcionalmente"
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Aprobadas funcionalmente"
                      ? ""
                      : "Aprobadas funcionalmente"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Aprobadas funcionalmente"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Aprobadas funcionalmente"
                  ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                  : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Aprobadas funcionalmente"
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
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Dictaminadas
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Aprobadas Funcionalmente
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.aprobadas}
                </p>
              </div>
            </Card>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="flex flex-col gap-3 shrink-0 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full">
              <div className="flex-1 min-w-[200px]">
                <Search
                  size="sm"
                  placeholder="Buscar por ID, institución, fuente o proyecto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
                <div className="w-full sm:w-52 lg:w-56 min-w-0">
                  <Combobox
                    items={ESTADOS_FILTRO}
                    value={estadoFilter || null}
                    onValueChange={(val) => setEstadoFilter(val || "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado de revisión"
                      showTrigger
                      showClear={!!estadoFilter}
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
                              {item === "Pendiente de asignación en Normatividad"
                                ? "Derivada a DPI (Confidencial)"
                                : item}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <div className="w-full sm:w-48 lg:w-52 min-w-0">
                  <Combobox
                    items={CLASIFICACION_FILTRO}
                    value={confidencialFilter || null}
                    onValueChange={(val) => setConfidencialFilter(val || "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Sensibilidad de campos"
                      showTrigger
                      showClear={!!confidencialFilter}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[250px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por sensibilidad</ComboboxLabel>
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

                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground mr-1">
                    Filtros activos:
                  </span>
                  {searchTerm && (
                    <Badge tone="neutral" appearance="soft" size="sm" className="gap-1">
                      Búsqueda: {searchTerm}
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="hover:text-foreground"
                        aria-label="Quitar filtro de búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {estadoFilter && (
                    <Badge tone="primary" appearance="soft" size="sm" className="gap-1">
                      Estado: {estadoFilter}
                      <button
                        type="button"
                        onClick={() => setEstadoFilter("")}
                        className="hover:text-foreground"
                        aria-label="Quitar filtro de estado"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {confidencialFilter && (
                    <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                      Sensibilidad: {confidencialFilter}
                      <button
                        type="button"
                        onClick={() => setConfidencialFilter("")}
                        className="hover:text-foreground"
                        aria-label="Quitar filtro de sensibilidad"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* VISTA TARJETAS (CARDS - Homologada 100% con Cuentas Internas) */}
          <div
            className={cn(
              "grid grid-cols-1 gap-3",
              viewMode === "cards" ? "md:grid-cols-2" : "md:hidden"
            )}
          >
            {paginatedSolicitudes.length === 0 ? (
              <Card
                className="col-span-full"
                innerClassName="p-8 text-center flex flex-col items-center gap-2"
              >
                <FileSignature className="size-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">
                  No tienes solicitudes asignadas con estos filtros
                </p>
                <p className="text-xs text-muted-foreground">
                  Ajusta los criterios de búsqueda o limpia los filtros activos.
                </p>
              </Card>
            ) : (
              paginatedSolicitudes.map((solicitud) => {
                const hasConfidencial = tieneConfidenciales(solicitud);
                const isEvaluable =
                  solicitud.estado === "Asignada a revisión de Gestión" ||
                  solicitud.estado === "En revisión de Gestión";
                const cardColor = isEvaluable
                  ? "warning"
                  : solicitud.estado === "Observada"
                  ? "danger"
                  : "success";

                return (
                  <InteractiveCard
                    key={solicitud.id}
                    color={cardColor}
                    decorativeIcon={<FileSignature className="size-full" />}
                    decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
                    className="p-4 rounded-xl flex flex-col justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="space-y-3 relative z-10 w-full">
                      {/* Header Tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-primary">
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
                            <span className="text-[11px] text-muted-foreground">
                              • {solicitud.fecha}
                            </span>
                          </div>
                          <p className="font-bold text-sm text-foreground truncate mt-0.5">
                            {solicitud.institucion}
                          </p>
                        </div>
                        <Badge
                          tone={
                            isEvaluable
                              ? "warning"
                              : solicitud.estado === "Observada"
                              ? "danger"
                              : "success"
                          }
                          appearance="soft"
                          size="sm"
                          className="shrink-0"
                        >
                          {solicitud.estado ===
                          "Pendiente de asignación en Normatividad"
                            ? "Derivada a DPI"
                            : solicitud.estado}
                        </Badge>
                      </div>

                      {/* Cuerpo de información estructurado */}
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
                            Campos y Modalidad
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold font-mono text-foreground">
                              {solicitud.camposCount ||
                                solicitud.fuentes?.[0]?.campos?.length ||
                                0}{" "}
                              campos
                            </span>
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
                              {hasConfidencial ? "Confidencial" : "Accesibles"}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {solicitud.modalidad || "API individual"} •{" "}
                            {(solicitud.cupo || 50000).toLocaleString()} reg.
                          </p>
                        </div>
                      </div>

                      {/* Acciones de Tarjeta */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs justify-center gap-1.5 text-foreground"
                          onClick={() => openExpedienteModal(solicitud)}
                        >
                          <Eye className="size-3.5 text-primary shrink-0" />
                          <span className="truncate">Ver expediente</span>
                        </Button>

                        <Link
                          href={`/revision-gestion/${solicitud.id}`}
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-8 text-xs justify-center gap-1.5 text-foreground"
                          >
                            <FileSearch className="size-3.5 text-info shrink-0" />
                            <span className="truncate">Evaluar detalle</span>
                          </Button>
                        </Link>

                        {isEvaluable && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs justify-center gap-1.5 text-foreground"
                              onClick={() => openObservarModal(solicitud)}
                            >
                              <AlertTriangle className="size-3.5 text-warning shrink-0" />
                              <span className="truncate">Observar</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs justify-center gap-1.5 text-foreground"
                              onClick={() => openAprobarModal(solicitud)}
                            >
                              <CheckCircle2 className="size-3.5 text-success shrink-0" />
                              <span className="truncate">Aprobar</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                );
              })
            )}
          </div>

          {/* TABLA DESKTOP (Homologada 100% con Cuentas Internas) */}
          <div
            className={cn(
              "w-full",
              viewMode === "table" ? "hidden md:block" : "hidden"
            )}
          >
            <TooltipProvider>
              <Table
                className="w-full min-w-[1280px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[14%] min-w-[165px] pl-6">
                      ID SOLICITUD
                    </TableHead>
                    <TableHead className="w-[20%] min-w-[210px]">
                      INSTITUCIÓN SOLICITANTE
                    </TableHead>
                    <TableHead className="w-[21%] min-w-[220px]">
                      PROYECTO / FUENTE
                    </TableHead>
                    <TableHead className="w-[14%] min-w-[165px]">
                      CAMPOS / SENSIBILIDAD
                    </TableHead>
                    <TableHead className="w-[12%] min-w-[140px]">
                      MODALIDAD Y CUPO
                    </TableHead>
                    <TableHead className="w-[11%] min-w-[155px]">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[160px] min-w-[155px] pr-6 text-right">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSolicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-40 text-center text-muted-foreground text-sm"
                      >
                        No tienes solicitudes asignadas que coincidan con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSolicitudes.map((solicitud) => {
                      const hasConfidencial = tieneConfidenciales(solicitud);
                      const isEvaluable =
                        solicitud.estado === "Asignada a revisión de Gestión" ||
                        solicitud.estado === "En revisión de Gestión";

                      return (
                        <TableRow
                          key={solicitud.id}
                          className="group transition-colors"
                        >
                          {/* ID SOLICITUD */}
                          <TableCell className="pl-6 align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => openExpedienteModal(solicitud)}
                                  className="text-left group/id cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-xs text-primary group-hover/id:underline">
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
                                  <span className="text-[11px] font-normal text-muted-foreground block mt-0.5">
                                    {solicitud.fecha}
                                  </span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="start"
                                variant="surface"
                                className="max-w-xs space-y-1"
                              >
                                <p className="font-bold text-xs text-foreground">
                                  Expediente {solicitud.id}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Haz clic para abrir la vista rápida en modal o usa las acciones a la derecha.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* INSTITUCIÓN SOLICITANTE */}
                          <TableCell className="align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="space-y-0.5 max-w-[230px] cursor-default">
                                  <p className="font-semibold text-xs text-foreground truncate">
                                    {solicitud.institucion}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {solicitud.solicitanteNombre} • {solicitud.tipoInstitucion}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="start"
                                variant="surface"
                                className="max-w-xs space-y-1"
                              >
                                <p className="font-semibold text-xs">
                                  {solicitud.institucion}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Coordinador: {solicitud.solicitanteNombre} ({solicitud.solicitanteCargo})
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* PROYECTO / FUENTE */}
                          <TableCell className="align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="space-y-0.5 max-w-[240px] cursor-default">
                                  <p className="font-semibold text-xs text-foreground truncate">
                                    {solicitud.fuentePrincipal}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {solicitud.proyectoNombre || "Proyecto institucional"}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                align="start"
                                variant="surface"
                                className="max-w-xs space-y-1"
                              >
                                <p className="font-semibold text-xs">
                                  {solicitud.fuentePrincipal}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  Proyecto: {solicitud.proyectoNombre} ({solicitud.proyectoCodigo})
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* CAMPOS / SENSIBILIDAD */}
                          <TableCell className="align-middle">
                            <div className="flex flex-col items-start gap-1">
                              <span className="font-bold text-xs text-foreground font-mono">
                                {solicitud.camposCount ||
                                  solicitud.fuentes?.[0]?.campos?.length ||
                                  0}{" "}
                                campos solicitados
                              </span>
                              {hasConfidencial ? (
                                <Badge
                                  tone="warning"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[10px] gap-1 px-2 py-0.5"
                                >
                                  <Lock className="size-2.5" />
                                  Confidencial (Pasa a DPI)
                                </Badge>
                              ) : (
                                <Badge
                                  tone="neutral"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[10px] gap-1 px-2 py-0.5"
                                >
                                  <Unlock className="size-2.5" />
                                  Solo Accesibles
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* MODALIDAD Y CUPO */}
                          <TableCell className="align-middle">
                            <span className="font-semibold text-xs text-foreground block">
                              {solicitud.modalidad || "API individual"}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground">
                              {(solicitud.cupo || 50000).toLocaleString()} reg./mes
                            </span>
                          </TableCell>

                          {/* ESTADO */}
                          <TableCell className="align-middle">
                            <Badge
                              tone={
                                isEvaluable
                                  ? "warning"
                                  : solicitud.estado.includes("Aprobada") ||
                                    solicitud.estado ===
                                      "Pendiente de asignación en Normatividad"
                                  ? "success"
                                  : solicitud.estado === "Observada"
                                  ? "danger"
                                  : "info"
                              }
                              appearance="soft"
                              size="sm"
                              className="font-semibold"
                            >
                              {solicitud.estado ===
                              "Pendiente de asignación en Normatividad"
                                ? "Derivada a DPI (Confidencial)"
                                : solicitud.estado}
                            </Badge>
                          </TableCell>

                          {/* ACCIONES (Iconos con Tooltip idénticos a Cuentas Internas) */}
                          <TableCell className="w-[160px] min-w-[155px] pr-6 text-right align-middle">
                            <div className="inline-flex items-center gap-0.5 justify-end w-full">
                              {/* 1. Ver expediente en Modal */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Ver expediente de ${solicitud.id}`}
                                    onClick={() => openExpedienteModal(solicitud)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Ver expediente en modal
                                </TooltipContent>
                              </Tooltip>

                              {/* 2. Evaluar campo por campo en página de detalle */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link href={`/revision-gestion/${solicitud.id}`}>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      aria-label={`Evaluar campo por campo ${solicitud.id}`}
                                      className="text-muted-foreground hover:text-info hover:bg-info/15"
                                    >
                                      <FileSearch className="size-4" />
                                    </Button>
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Evaluación detallada línea por línea
                                </TooltipContent>
                              </Tooltip>

                              {/* 3. Aprobar solicitud directo con Modal */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={!isEvaluable}
                                      aria-label={`Aprobar revisión funcional de ${solicitud.id}`}
                                      onClick={() => openAprobarModal(solicitud)}
                                      className="text-success hover:text-success hover:bg-success/15 disabled:opacity-35"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isEvaluable
                                    ? "Aprobar revisión funcional (SOL-04)"
                                    : "Ya dictaminada o en subsanación"}
                                </TooltipContent>
                              </Tooltip>

                              {/* 4. Observar / Solicitar subsanación con Modal */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={!isEvaluable}
                                      aria-label={`Observar solicitud ${solicitud.id}`}
                                      onClick={() => openObservarModal(solicitud)}
                                      className="text-warning hover:text-warning hover:bg-warning/15 disabled:opacity-35"
                                    >
                                      <AlertTriangle className="size-4" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isEvaluable
                                    ? "Observar y solicitar subsanación (3 días hábiles)"
                                    : "Solo disponible en solicitudes por evaluar"}
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

          {/* PAGINACIÓN (Idéntica a Cuentas Internas) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full shrink-0">
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
                  {Math.min(currentPage * pageSize, filteredSolicitudes.length)}
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
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
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

      {/* ======================================================================= */}
      {/* MODAL 1: EXPEDIENTE DE SOLICITUD DE ACCESO (Homologado con Cuentas Internas) */}
      {/* ======================================================================= */}
      <Dialog open={expedienteOpen} onOpenChange={setExpedienteOpen}>
        <DialogContent
          variant="standard"
          size="3xl"
          className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
        >
          {selectedSolicitud && (
            <>
              <DialogHeader className="border-b border-border/60 pb-4 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                      {selectedSolicitud.id}
                    </span>
                    {selectedSolicitud.versionExpediente &&
                      selectedSolicitud.versionExpediente > 1 && (
                        <Badge tone="info" appearance="outline" size="sm">
                          Versión v{selectedSolicitud.versionExpediente}
                        </Badge>
                      )}
                    <Badge
                      tone={
                        selectedSolicitud.estado.includes("Aprobada") ||
                        selectedSolicitud.estado ===
                          "Pendiente de asignación en Normatividad"
                          ? "success"
                          : selectedSolicitud.estado === "Observada"
                          ? "danger"
                          : "warning"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {selectedSolicitud.estado ===
                      "Pendiente de asignación en Normatividad"
                        ? "Derivada a DPI (Confidencial)"
                        : selectedSolicitud.estado}
                    </Badge>
                  </div>
                  <Badge
                    tone={tieneConfidenciales(selectedSolicitud) ? "warning" : "neutral"}
                    appearance="soft"
                    size="sm"
                    className="gap-1"
                  >
                    {tieneConfidenciales(selectedSolicitud) ? (
                      <Lock className="size-3" />
                    ) : (
                      <Unlock className="size-3" />
                    )}
                    {tieneConfidenciales(selectedSolicitud)
                      ? "Contiene Campos Confidenciales (Pasa a DPI)"
                      : "Solo Campos Accesibles (Pasa a Formalización)"}
                  </Badge>
                </div>
                <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground mt-2 text-left">
                  {selectedSolicitud.institucion} — {selectedSolicitud.fuentePrincipal}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground text-left">
                  Proyecto vinculado:{" "}
                  <strong className="text-foreground">
                    {selectedSolicitud.proyectoNombre} ({selectedSolicitud.proyectoCodigo})
                  </strong>{" "}
                  • Solicitante: {selectedSolicitud.solicitanteNombre}
                </DialogDescription>
              </DialogHeader>

              {/* Navegación por Pestañas tipo Píldora (Idéntico a ExpedienteCuentaModal) */}
              <div className="p-1 rounded-xl sm:rounded-full bg-muted/40 border border-border/60 flex items-center gap-1 shrink-0 overflow-x-auto modal-scroll-area max-w-full">
                {[
                  {
                    id: "resumen" as const,
                    label: "1. Resumen y Proyecto",
                    icon: Building2,
                  },
                  {
                    id: "campos" as const,
                    label: `2. Campos y Finalidad (${
                      selectedSolicitud.fuentes?.[0]?.campos?.length || 0
                    })`,
                    icon: Database,
                  },
                  {
                    id: "confidencial" as const,
                    label: "3. Justificación Confidencial",
                    icon: ShieldAlert,
                  },
                  {
                    id: "trazabilidad" as const,
                    label: `4. Trazabilidad (${
                      selectedSolicitud.trazabilidad?.length || 0
                    })`,
                    icon: History,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeExpedienteTab === tab.id;
                  return (
                    <Button
                      key={tab.id}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveExpedienteTab(tab.id)}
                      className={cn(
                        "flex-1 min-w-fit rounded-lg sm:rounded-full py-2 px-3 sm:px-4 text-xs sm:text-sm transition-all gap-1.5 h-auto whitespace-nowrap",
                        active
                          ? "bg-primary text-white shadow-xs font-bold hover:bg-primary hover:text-white"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                      )}
                    >
                      <Icon className="size-3.5 sm:size-4 shrink-0" />
                      <span>{tab.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Contenido del Modal */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                {activeExpedienteTab === "resumen" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border/70 bg-surface p-3.5 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Institución Consumidora
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedSolicitud.institucion}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedSolicitud.tipoInstitucion} • Coordinador:{" "}
                          {selectedSolicitud.solicitanteNombre}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-surface p-3.5 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Parámetros Técnicos Solicitados
                        </p>
                        <p className="text-sm font-bold text-foreground">
                          {selectedSolicitud.modalidad} •{" "}
                          {(selectedSolicitud.cupo || 50000).toLocaleString()}{" "}
                          consultas/mes
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Revisor asignado:{" "}
                          <strong>{selectedSolicitud.revisorAsignado}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-surface p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <FolderKanban className="size-4" />
                        Justificación General y Objetivo del Proyecto
                      </p>
                      <p className="text-xs text-foreground leading-relaxed">
                        {selectedSolicitud.justificacionGeneral ||
                          selectedSolicitud.proyectoObjetivo}
                      </p>
                      <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          Documento de sustento:{" "}
                          <strong className="text-foreground font-mono">
                            {selectedSolicitud.documentoSustentoNombre ||
                              "Oficio_Justificacion_Institucional.pdf"}
                          </strong>
                        </span>
                        <Badge tone="success" appearance="soft" size="sm">
                          Verificado en repositorio
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {activeExpedienteTab === "campos" && (
                  <div className="space-y-3">
                    {(selectedSolicitud.fuentes?.[0]?.campos || []).map((c) => (
                      <div
                        key={c.nombreCampo}
                        className="rounded-xl border border-border/70 bg-surface p-3.5 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-primary">
                              {c.nombreCampo}
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              — {c.etiquetaFuncional}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              tone={
                                c.clasificacion === "Confidencial"
                                  ? "warning"
                                  : "success"
                              }
                              appearance="soft"
                              size="sm"
                            >
                              {c.clasificacion}
                            </Badge>
                            {c.etiquetaSensibilidad && (
                              <Badge tone="info" appearance="outline" size="sm">
                                {c.etiquetaSensibilidad}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="rounded-lg bg-surface-muted/40 p-2.5 text-xs">
                          <span className="font-semibold text-muted-foreground block mb-0.5">
                            Finalidad de uso funcional (SOL-01 / SOL-04):
                          </span>
                          <p className="text-foreground">{c.finalidadUso}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeExpedienteTab === "confidencial" && (
                  <div className="space-y-3">
                    {!tieneConfidenciales(selectedSolicitud) ? (
                      <div className="rounded-xl border border-border/70 bg-surface p-6 text-center space-y-1.5">
                        <Unlock className="size-7 text-success mx-auto" />
                        <p className="text-sm font-bold text-foreground">
                          Esta solicitud solo requiere campos Accesibles
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Al aprobar la revisión funcional en Gestión, pasará directamente a Formalización (BN-08) sin requerir dictamen de la DPI.
                        </p>
                      </div>
                    ) : (
                      (selectedSolicitud.fuentes?.[0]?.campos || [])
                        .filter((c) => c.clasificacion === "Confidencial")
                        .map((c) => (
                          <div
                            key={c.nombreCampo}
                            className="rounded-xl border border-warning/40 bg-warning/5 p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Lock className="size-3.5 text-warning" />
                                {c.nombreCampo} ({c.etiquetaFuncional})
                              </span>
                              <Badge tone="warning" appearance="soft" size="sm">
                                {c.etiquetaSensibilidad || "Dato Confidencial"}
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground">
                              <strong>Base legal / Justificación jurídica:</strong>{" "}
                              {c.justificacionConfidencial ||
                                "Sustentado en atribuciones legales vigentes y documento adjunto."}
                            </p>
                            {c.adjuntoConfidencialNombre && (
                              <p className="text-[11px] text-muted-foreground font-mono">
                                Adjunto legal: {c.adjuntoConfidencialNombre}
                              </p>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                )}

                {activeExpedienteTab === "trazabilidad" && (
                  <div className="space-y-2.5">
                    {(selectedSolicitud.historial || []).map((ev, idx) => (
                      <div
                        key={`${ev.fecha}-${idx}`}
                        className="rounded-xl border border-border/70 bg-surface p-3 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {ev.evento}
                            </span>
                            <Badge tone="neutral" appearance="outline" size="sm">
                              {ev.actor}
                            </Badge>
                          </div>
                          {ev.detalle && (
                            <p className="text-muted-foreground">{ev.detalle}</p>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                          {ev.fecha}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-border/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
                <Link href={`/revision-gestion/${selectedSolicitud.id}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
                    <FileSearch className="size-4 text-primary" />
                    <span>Evaluación línea por línea</span>
                  </Button>
                </Link>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpedienteOpen(false)}
                  >
                    Cerrar
                  </Button>
                  {(selectedSolicitud.estado ===
                    "Asignada a revisión de Gestión" ||
                    selectedSolicitud.estado === "En revisión de Gestión") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-warning/50 text-warning hover:bg-warning/10"
                        onClick={() => openObservarModal(selectedSolicitud)}
                      >
                        <AlertTriangle className="size-3.5" />
                        <span>Observar solicitud</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openAprobarModal(selectedSolicitud)}
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Aprobar revisión funcional</span>
                      </Button>
                    </>
                  )}
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* MODAL 2: CONFIRMAR APROBACIÓN FUNCIONAL (Homologado con AccionCuentaDialog) */}
      {/* ======================================================================= */}
      <Dialog open={aprobarOpen} onOpenChange={setAprobarOpen}>
        <DialogContent
          variant="success"
          size="lg"
          className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          icon={<CheckCircle2 className="size-10 text-success stroke-[2px]" />}
        >
          {selectedSolicitud && (
            <>
              <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
                <DialogTitle className="font-heading font-bold text-xl text-foreground">
                  ¿Aprobar revisión funcional de la solicitud?
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                  Confirmas que la finalidad de uso por campo, modalidad, cupo y documentos de respaldo cumplen con los criterios funcionales de la Dirección de Gestión (SOL-04).
                </DialogDescription>
              </DialogHeader>

              <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left">
                <div className="rounded-xl border border-border bg-surface-muted/40 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-primary">
                      {selectedSolicitud.id}
                    </span>
                    <Badge
                      tone={
                        tieneConfidenciales(selectedSolicitud) ? "warning" : "success"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {tieneConfidenciales(selectedSolicitud)
                        ? "Pasa a Director DPI (SOL-07)"
                        : "Pasa a Formalización (BN-08)"}
                    </Badge>
                  </div>
                  <p className="font-bold text-foreground">
                    {selectedSolicitud.institucion}
                  </p>
                  <p className="text-muted-foreground">
                    Fuente: {selectedSolicitud.fuentePrincipal} (
                    {selectedSolicitud.camposCount ||
                      selectedSolicitud.fuentes?.[0]?.campos?.length ||
                      0}{" "}
                    campos)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    Dictamen / Comentario de aprobación funcional
                  </Label>
                  <Textarea
                    rows={3}
                    value={comentarioAprobacion}
                    onChange={(e) => setComentarioAprobacion(e.target.value)}
                    placeholder="Ingrese el comentario técnico de aprobación..."
                    className="text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
                <Button
                  variant="ghost"
                  className="w-full sm:w-1/2 font-semibold"
                  onClick={() => setAprobarOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  className="w-full sm:w-1/2 font-bold shadow-xs gap-1.5"
                  onClick={handleConfirmAprobar}
                >
                  <CheckCircle2 className="size-4" />
                  <span>Confirmar Aprobación</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* MODAL 3: OBSERVAR SOLICITUD Y SOLICITAR SUBSANACIÓN (SOL-04 / PAR-13)   */}
      {/* ======================================================================= */}
      <Dialog open={observarOpen} onOpenChange={setObservarOpen}>
        <DialogContent
          variant="warning"
          size="lg"
          className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        >
          <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
            <DialogTitle className="font-heading font-bold text-xl text-foreground">
              Registrar observaciones y solicitar subsanación
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
              La solicitud cambiará a estado <strong>Observada</strong> y se notificará al Coordinador SINARP con un plazo de <strong>3 días hábiles (PAR-13)</strong> para subsanar únicamente los elementos observados.
            </DialogDescription>
          </DialogHeader>

          {selectedSolicitud && (
            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3.5 w-full flex-1 min-h-0 text-left">
              <div className="rounded-xl border border-border bg-surface-muted/40 p-3 text-xs space-y-1">
                <p className="font-mono font-bold text-primary">
                  {selectedSolicitud.id} • {selectedSolicitud.institucion}
                </p>
                <p className="text-muted-foreground">
                  Fuente: {selectedSolicitud.fuentePrincipal}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Observación general del expediente <span className="text-danger">*</span>
                </Label>
                <Textarea
                  rows={3}
                  value={observacionGeneral}
                  onChange={(e) => setObservacionGeneral(e.target.value)}
                  placeholder="Detalle qué elementos de la finalidad de uso, cupo o sustento normativo deben ser subsanados por el Coordinador SINARP..."
                  className="text-xs"
                />
              </div>

              <div className="rounded-xl border border-border/80 bg-surface p-3 space-y-2.5">
                <Label className="text-xs font-semibold block">
                  Observación puntual sobre un campo (Opcional)
                </Label>
                <Combobox
                  items={(selectedSolicitud.fuentes?.[0]?.campos || []).map(
                    (c) => c.nombreCampo
                  )}
                  value={campoObservadoTarget || null}
                  onValueChange={(val) => setCampoObservadoTarget(val || "")}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Seleccionar campo específico..."
                    showTrigger
                    showClear={!!campoObservadoTarget}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Sin campos</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {campoObservadoTarget && (
                  <Textarea
                    rows={2}
                    value={campoObservadoTexto}
                    onChange={(e) => setCampoObservadoTexto(e.target.value)}
                    placeholder={`Observación específica para el campo "${campoObservadoTarget}"...`}
                    className="text-xs"
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
            <Button
              variant="ghost"
              className="w-full sm:w-1/2 font-semibold"
              onClick={() => setObservarOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="warning"
              className="w-full sm:w-1/2 font-bold shadow-xs gap-1.5"
              disabled={!observacionGeneral.trim()}
              onClick={handleConfirmObservar}
            >
              <Send className="size-3.5" />
              <span>Notificar Subsanación</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
