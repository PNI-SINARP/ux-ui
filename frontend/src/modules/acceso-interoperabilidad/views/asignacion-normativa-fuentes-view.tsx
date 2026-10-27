"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  UserCheck,
  Eye,
  Clock,
  Lock,
  FileText,
  CheckCircle2,
  FileSignature,
  ShieldCheck,
  Check,
  X,
  History,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Search } from "@/components/ui/search";
import { Textarea } from "@/components/ui/textarea";
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

const REVISORES_DPI = [
  {
    id: "U-EQNORM",
    nombre: "Carlos Mora (Revisor DPI)",
    cargo: "Analista Jurídico de Protección de la Información",
    especialidad: "Derecho Público, Sigilo y Reserva Legal",
  },
  {
    id: "U-EQNORM2",
    nombre: "Sofía Castro (Revisor DPI)",
    cargo: "Especialista en Protección de Datos Personales",
    especialidad: "LOPDP y Evaluación de Campos Confidenciales",
  },
];

const ESTADOS_FILTRO_DPI = [
  "Pendiente de asignación en DPI",
  "En revisión en DPI",
  "Pendiente firma Director DPI",
  "Aprobada por DPI (Lista para formalización)",
];

const REVISOR_FILTRO_DPI = [
  "Sin asignar",
  ...REVISORES_DPI.map((r) => r.nombre),
];

export function AsignacionNormativaFuentesView() {
  const { solicitudes, asignarRevisorNormativa, firmarInformeNormativa } =
    useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");
  const [revisorFilter, setRevisorFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [solicitudToAssign, setSolicitudToAssign] =
    useState<SolicitudAcceso | null>(null);
  const [selectedRevisorNormId, setSelectedRevisorNormId] =
    useState<string>("U-EQNORM");
  const [observacionAsignacion, setObservacionAsignacion] = useState("");
  const [solicitudInspecting, setSolicitudInspecting] =
    useState<SolicitudAcceso | null>(null);
  const [tabExpedienteDpi, setTabExpedienteDpi] = useState<"campos" | "informe" | "historial">("campos");

  // Sincronizar con ?tab=informes o ?tab=seguimiento del sidebar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "informes") {
        setEstadoFilter("Pendiente firma Director DPI");
      } else if (tab === "seguimiento") {
        setEstadoFilter("En revisión en DPI");
      }
    }
  }, []);

  // Expedientes que llegan al carril de DPI (con campos confidenciales y aprobados por Gestión)
  const solicitudesDpiBase = useMemo(() => {
    return solicitudes.filter((s) => {
      const tieneConfidencial = s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      );
      if (!tieneConfidencial) return false;

      const enFlujoDpi =
        s.estado === "Pendiente de asignación en Normatividad" ||
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        (s.estado.includes("Aprobada") && Boolean(s.informeNormativa));

      return enFlujoDpi;
    });
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesDpiBase.filter((s) => {
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "")
          .toLowerCase()
          .includes(term);
        const matchesRevisor = (s.revisorNormativoAsignado || "")
          .toLowerCase()
          .includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesRevisor) {
          return false;
        }
      }

      if (estadoFilter !== "") {
        if (
          estadoFilter === "Pendiente de asignación en DPI" &&
          s.estado !== "Pendiente de asignación en Normatividad"
        ) {
          return false;
        }
        if (
          estadoFilter === "En revisión en DPI" &&
          s.estado !== "En revisión normativa"
        ) {
          return false;
        }
        if (
          estadoFilter === "Pendiente firma Director DPI" &&
          !(
            Boolean(s.informeNormativa?.firmadoRevisor) &&
            !s.informeNormativa?.firmadoDirector
          )
        ) {
          return false;
        }
        if (
          estadoFilter === "Aprobada por DPI (Lista para formalización)" &&
          s.estado !== "Aprobada por Normatividad"
        ) {
          return false;
        }
      }

      if (revisorFilter !== "") {
        if (revisorFilter === "Sin asignar" && s.revisorNormativoAsignado) {
          return false;
        }
        if (
          revisorFilter !== "Sin asignar" &&
          s.revisorNormativoAsignado !== revisorFilter &&
          !s.revisorNormativoAsignado?.includes(revisorFilter.split(" (")[0])
        ) {
          return false;
        }
      }

      return true;
    });
  }, [solicitudesDpiBase, searchTerm, estadoFilter, revisorFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter, revisorFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSolicitudes.length / pageSize)
  );

  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  const metricas = useMemo(() => {
    const total = solicitudesDpiBase.length;
    const pendientesAsig = solicitudesDpiBase.filter(
      (s) => s.estado === "Pendiente de asignación en Normatividad"
    ).length;
    const pendientesFirmaDirector = solicitudesDpiBase.filter(
      (s) =>
        Boolean(s.informeNormativa?.firmadoRevisor) &&
        !s.informeNormativa?.firmadoDirector
    ).length;
    const aprobadas = solicitudesDpiBase.filter(
      (s) => s.estado === "Aprobada por Normatividad"
    ).length;
    return { total, pendientesAsig, pendientesFirmaDirector, aprobadas };
  }, [solicitudesDpiBase]);

  const hasActiveFilters =
    searchTerm !== "" || estadoFilter !== "" || revisorFilter !== "";

  const handleClearFilters = () => {
    setSearchTerm("");
    setEstadoFilter("");
    setRevisorFilter("");
  };

  const handleConfirmarAsignacionDpi = () => {
    if (!solicitudToAssign) return;
    const revisor =
      REVISORES_DPI.find((r) => r.id === selectedRevisorNormId) ||
      REVISORES_DPI[0];
    const director =
      "Dr. Roberto Méndez (Director de Protección de la Información - DPI)";

    const esReasignacion = Boolean(solicitudToAssign.revisorNormativoAsignado);

    asignarRevisorNormativa(
      solicitudToAssign.id,
      revisor.id,
      revisor.nombre,
      director,
      observacionAsignacion.trim() || undefined
    );

    toast.success(
      esReasignacion
        ? "Revisión DPI recuperada y reasignada"
        : "Revisor del Equipo DPI asignado",
      {
        description: esReasignacion
          ? `Expediente ${solicitudToAssign.id} reasignado a ${revisor.nombre} conservando el trabajo previo (SOL-07).`
          : `Expediente ${solicitudToAssign.id} asignado a ${revisor.nombre} para evaluar campos confidenciales (SOL-07).`,
      }
    );
    setSolicitudToAssign(null);
    setObservacionAsignacion("");
  };

  const handleFirmarDirector = (solicitudId: string) => {
    firmarInformeNormativa(
      solicitudId,
      "DIRECTOR",
      "Dr. Roberto Méndez (Director DPI)"
    );
    toast.success(
      "Informe firmado electrónicamente por el Director DPI (SOL-08)",
      {
        description:
          "Doble firma completada (Revisor DPI + Director DPI). La solicitud quedó aprobada por DPI y lista para formalización (BN-08).",
      }
    );
    if (solicitudInspecting?.id === solicitudId) {
      setSolicitudInspecting(null);
    }
  };

  const getEstadoDpiLabel = (estado: string) => {
    if (estado === "Pendiente de asignación en Normatividad") {
      return "Pendiente de asignación en DPI";
    }
    if (estado === "En revisión normativa") {
      return "En revisión en DPI";
    }
    if (estado === "Aprobada por Normatividad") {
      return "Aprobada por DPI (Lista para formalización)";
    }
    return estado;
  };

  return (
    <WireframeDashboardLayout
      activeMenu="asignacion-normativa-fuentes"
      currentRole="DIR_NORMATIVA"
      currentUser={MOCK_USERS_BY_ROLE.DIR_NORMATIVA}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Dirección DPI", href: "/revision-normativa/asignacion" },
        { label: "Asignación y Firma DPI" },
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
                {estadoFilter === "Pendiente firma Director DPI"
                  ? "Informes de aprobación"
                  : estadoFilter === "En revisión en DPI"
                  ? "Seguimiento DPI"
                  : "Asignar revisiones DPI"}
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {estadoFilter === "Pendiente firma Director DPI"
                  ? "Revisa y suscribe electrónicamente los informes favorables de campos confidenciales elaborados por el equipo de Protección de la Información."
                  : estadoFilter === "En revisión en DPI"
                  ? "Consulta la trazabilidad y el estado de evaluación de las solicitudes de acceso con campos confidenciales en Protección de la Información."
                  : "Gestiona y asigna a los revisores de Protección de la Información las solicitudes de acceso que contienen campos confidenciales."}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <Badge
                tone="primary"
                appearance="soft"
                size="md"
                className="font-semibold px-3 py-1.5 text-xs"
              >
                Rol: Director DPI
              </Badge>
            </div>
          </div>

          {/* TARJETAS KPI INTERACTIVAS (Homologadas 100% con Cuentas Internas) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {/* KPI 1: Expedientes en DPI */}
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
                  <Lock className="size-5" />
                </div>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  Confidenciales
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Expedientes en DPI
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.total}
                </p>
              </div>
            </Card>

            {/* KPI 2: Por Asignar Revisor DPI */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "Pendiente de asignación en DPI"
                    ? ""
                    : "Pendiente de asignación en DPI"
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Pendiente de asignación en DPI"
                      ? ""
                      : "Pendiente de asignación en DPI"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Pendiente de asignación en DPI"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Pendiente de asignación en DPI"
                  ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                  : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Pendiente de asignación en DPI"
                      ? "bg-warning text-white shadow-xs"
                      : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                  )}
                >
                  <UserCheck className="size-5" />
                </div>
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  SOL-07
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Por Asignar Revisor DPI
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.pendientesAsig}
                </p>
              </div>
            </Card>

            {/* KPI 3: Informes por Firmar (SOL-08) */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "Pendiente firma Director DPI"
                    ? ""
                    : "Pendiente firma Director DPI"
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Pendiente firma Director DPI"
                      ? ""
                      : "Pendiente firma Director DPI"
                  );
                }
              }}
              aria-pressed={estadoFilter === "Pendiente firma Director DPI"}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Pendiente firma Director DPI"
                  ? "bg-info/15 border-info ring-2 ring-info/40 shadow-xs"
                  : "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Pendiente firma Director DPI"
                      ? "bg-info text-white shadow-xs"
                      : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                  )}
                >
                  <FileSignature className="size-5" />
                </div>
                <Badge
                  tone="info"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-bold px-2 py-0.5"
                >
                  2.ª Firma
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Informes por Firmar (SOL-08)
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                  {metricas.pendientesFirmaDirector}
                </p>
              </div>
            </Card>

            {/* KPI 4: Aprobadas por DPI */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "Aprobada por DPI (Lista para formalización)"
                    ? ""
                    : "Aprobada por DPI (Lista para formalización)"
                );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Aprobada por DPI (Lista para formalización)"
                      ? ""
                      : "Aprobada por DPI (Lista para formalización)"
                  );
                }
              }}
              aria-pressed={
                estadoFilter === "Aprobada por DPI (Lista para formalización)"
              }
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring select-none",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Aprobada por DPI (Lista para formalización)"
                  ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                  : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
              )}
              innerClassName="p-3 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                    estadoFilter === "Aprobada por DPI (Lista para formalización)"
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
                  Habilitadas
                </Badge>
              </div>
              <div className="space-y-0.5 text-left w-full">
                <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  Aprobadas por DPI
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
                  placeholder="Buscar por ID, institución, fuente o revisor DPI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
                <div className="w-full sm:w-52 lg:w-56 min-w-0">
                  <Combobox
                    items={ESTADOS_FILTRO_DPI}
                    value={estadoFilter || null}
                    onValueChange={(val) => setEstadoFilter(val || "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado en DPI"
                      showTrigger
                      showClear={!!estadoFilter}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[260px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado en DPI</ComboboxLabel>
                          {ESTADOS_FILTRO_DPI.map((item) => (
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

                <div className="w-full sm:w-48 lg:w-52 min-w-0">
                  <Combobox
                    items={REVISOR_FILTRO_DPI}
                    value={revisorFilter || null}
                    onValueChange={(val) => setRevisorFilter(val || "")}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Revisor del Equipo DPI"
                      showTrigger
                      showClear={!!revisorFilter}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[250px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por revisor DPI</ComboboxLabel>
                          {REVISOR_FILTRO_DPI.map((item) => (
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
                  {revisorFilter && (
                    <Badge tone="info" appearance="soft" size="sm" className="gap-1">
                      Revisor DPI: {revisorFilter}
                      <button
                        type="button"
                        onClick={() => setRevisorFilter("")}
                        className="hover:text-foreground"
                        aria-label="Quitar filtro de revisor"
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

          {/* VISTA TARJETAS (CARDS — Idéntica a Cuentas Internas) */}
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
                <ShieldCheck className="size-8 text-muted-foreground/50" />
                <p className="text-sm font-semibold text-foreground">
                  No existen expedientes en DPI con estos filtros
                </p>
              </Card>
            ) : (
              paginatedSolicitudes.map((solicitud) => {
                const camposConf =
                  solicitud.fuentes?.[0]?.campos?.filter(
                    (c) => c.clasificacion === "Confidencial"
                  ) || [];
                const tieneInforme = Boolean(solicitud.informeNormativa);
                const firmaRevisorOk = Boolean(
                  solicitud.informeNormativa?.firmadoRevisor
                );
                const firmaDirectorOk = Boolean(
                  solicitud.informeNormativa?.firmadoDirector
                );
                const cardColor =
                  solicitud.estado === "Aprobada por Normatividad"
                    ? "success"
                    : solicitud.estado ===
                      "Pendiente de asignación en Normatividad"
                    ? "warning"
                    : "info";

                return (
                  <InteractiveCard
                    key={solicitud.id}
                    color={cardColor}
                    decorativeIcon={<ShieldCheck className="size-full" />}
                    decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
                    className="p-4 flex flex-col justify-between gap-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-primary">
                            {solicitud.id}
                          </span>
                          <Badge
                            tone="neutral"
                            appearance="outline"
                            size="sm"
                            className="text-[10px] px-1.5 py-0"
                          >
                            v{solicitud.versionExpediente || 1}
                          </Badge>
                        </div>
                        <p className="font-bold text-sm text-foreground mt-1 truncate">
                          {solicitud.institucion}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {solicitud.fuentePrincipal}
                        </p>
                      </div>
                      <Badge
                        tone={cardColor}
                        appearance="soft"
                        size="sm"
                        className="shrink-0 font-semibold"
                      >
                        {getEstadoDpiLabel(solicitud.estado)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-surface/80 backdrop-blur-xs rounded-lg p-2.5 border border-border/40">
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Campos confidenciales
                        </span>
                        <span className="font-bold text-warning truncate block">
                          {camposConf.length} campo(s) LOPDP
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] text-muted-foreground block">
                          Revisor Equipo DPI
                        </span>
                        <span className="font-semibold text-foreground truncate block">
                          {solicitud.revisorNormativoAsignado || "Sin asignar"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSolicitudInspecting(solicitud)}
                        className="w-full justify-center gap-1.5 font-semibold bg-surface/80 text-xs"
                      >
                        <Eye className="size-3.5 text-primary" />
                        <span>Ver expediente</span>
                      </Button>

                      {tieneInforme && firmaRevisorOk && !firmaDirectorOk ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleFirmarDirector(solicitud.id)}
                          className="w-full justify-center gap-1.5 font-semibold text-xs"
                        >
                          <FileSignature className="size-3.5" />
                          <span>Firmar informe</span>
                        </Button>
                      ) : (
                        <Button
                          variant={
                            solicitud.estado ===
                            "Pendiente de asignación en Normatividad"
                              ? "primary"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSolicitudToAssign(solicitud);
                            setSelectedRevisorNormId(
                              solicitud.revisorNormativoAsignadoId ||
                                "U-EQNORM"
                            );
                            setObservacionAsignacion("");
                          }}
                          className="w-full justify-center gap-1.5 font-semibold text-xs"
                        >
                          {solicitud.revisorNormativoAsignado ? (
                            <RotateCcw className="size-3.5" />
                          ) : (
                            <UserCheck className="size-3.5" />
                          )}
                          <span>
                            {solicitud.revisorNormativoAsignado
                              ? "Reasignar"
                              : "Asignar"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </InteractiveCard>
                );
              })
            )}
          </div>

          {/* TABLA DESKTOP (Idéntica a Cuentas Internas) */}
          <div
            className={cn(
              "w-full",
              viewMode === "table" ? "hidden md:block" : "hidden"
            )}
          >
            <TooltipProvider delayDuration={200}>
              <Table
                className="w-full min-w-[1280px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[140px] pl-6">
                      ID / VERSIÓN
                    </TableHead>
                    <TableHead className="min-w-[210px]">
                      INSTITUCIÓN REQUIRENTE
                    </TableHead>
                    <TableHead className="min-w-[230px]">
                      FUENTE Y PROYECTO
                    </TableHead>
                    <TableHead className="min-w-[190px]">
                      CAMPOS CONFIDENCIALES
                    </TableHead>
                    <TableHead className="min-w-[160px]">
                      REVISOR EQUIPO DPI
                    </TableHead>
                    <TableHead className="min-w-[190px]">
                      FIRMAS INFORME DPI (SOL-08)
                    </TableHead>
                    <TableHead className="w-[190px]">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[130px] text-right pr-6">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSolicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-40 text-center text-muted-foreground text-sm"
                      >
                        No existen expedientes con campos confidenciales en este estado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSolicitudes.map((solicitud) => {
                      const camposConf =
                        solicitud.fuentes?.[0]?.campos?.filter(
                          (c) => c.clasificacion === "Confidencial"
                        ) || [];
                      const tieneInforme = Boolean(solicitud.informeNormativa);
                      const firmaRevisorOk = Boolean(
                        solicitud.informeNormativa?.firmadoRevisor
                      );
                      const firmaDirectorOk = Boolean(
                        solicitud.informeNormativa?.firmadoDirector
                      );

                      return (
                        <TableRow
                          key={solicitud.id}
                          className="group transition-colors"
                        >
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSolicitudInspecting(solicitud)}
                                className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                {solicitud.id}
                              </button>
                              <Badge
                                tone="neutral"
                                appearance="outline"
                                size="sm"
                                className="text-[10px] px-1.5 py-0"
                              >
                                v{solicitud.versionExpediente || 1}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col max-w-[230px]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-semibold text-xs text-foreground truncate cursor-default">
                                    {solicitud.institucion}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent variant="surface" side="top">
                                  {solicitud.institucion}
                                </TooltipContent>
                              </Tooltip>
                              <span className="text-[11px] text-muted-foreground truncate">
                                Aprobado en Gestión:{" "}
                                {solicitud.revisorAsignado || "Ana Torres"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col max-w-[240px]">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-semibold text-xs text-foreground truncate cursor-default">
                                    {solicitud.fuentePrincipal}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent variant="surface" side="top">
                                  {solicitud.fuentePrincipal}
                                </TooltipContent>
                              </Tooltip>
                              <span className="text-[11px] text-muted-foreground font-mono truncate">
                                {solicitud.proyectoId} · {solicitud.proyectoNombre}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5 font-bold text-xs text-warning">
                              <Lock className="size-3.5 shrink-0" />
                              <span>{camposConf.length} confidencial(es)</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate block max-w-44">
                              {camposConf
                                .map((c) => c.nombre || c.nombreCampo)
                                .join(", ")}
                            </span>
                          </TableCell>

                          <TableCell className="text-xs">
                            {solicitud.revisorNormativoAsignado ? (
                              <span className="font-medium text-foreground">
                                {solicitud.revisorNormativoAsignado}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-xs">
                                Sin asignar
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-xs">
                            {tieneInforme ? (
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-[11px]">
                                  {firmaRevisorOk ? (
                                    <Check className="size-3 text-success font-bold" />
                                  ) : (
                                    <Clock className="size-3 text-muted-foreground" />
                                  )}
                                  <span
                                    className={
                                      firmaRevisorOk
                                        ? "text-success font-medium"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    Revisor DPI:{" "}
                                    {firmaRevisorOk ? "Firmado" : "Pendiente"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px]">
                                  {firmaDirectorOk ? (
                                    <Check className="size-3 text-success font-bold" />
                                  ) : (
                                    <Clock className="size-3 text-warning" />
                                  )}
                                  <span
                                    className={
                                      firmaDirectorOk
                                        ? "text-success font-medium"
                                        : "text-warning font-medium"
                                    }
                                  >
                                    Director DPI:{" "}
                                    {firmaDirectorOk ? "Firmado" : "Pendiente"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">
                                En espera de dictamen DPI
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-xs">
                            <Badge
                              tone={
                                solicitud.estado === "Aprobada por Normatividad"
                                  ? "success"
                                  : solicitud.estado ===
                                    "Pendiente de asignación en Normatividad"
                                  ? "warning"
                                  : "info"
                              }
                              appearance="soft"
                              size="sm"
                              className="font-semibold whitespace-nowrap"
                            >
                              {getEstadoDpiLabel(solicitud.estado)}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              {/* 1. Ver expediente y dictamen en modal */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() =>
                                      setSolicitudInspecting(solicitud)
                                    }
                                    aria-label="Ver expediente DPI en modal"
                                    className="text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent variant="surface" side="top">
                                  Ver campos confidenciales, historial e informe DPI
                                </TooltipContent>
                              </Tooltip>

                              {/* 2. Asignar o Reasignar revisor DPI */}
                              {(solicitud.estado ===
                                "Pendiente de asignación en Normatividad" ||
                                (solicitud.estado === "En revisión normativa" &&
                                  !tieneInforme)) && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => {
                                        setSolicitudToAssign(solicitud);
                                        setSelectedRevisorNormId(
                                          solicitud.revisorNormativoAsignadoId ||
                                            "U-EQNORM"
                                        );
                                        setObservacionAsignacion("");
                                      }}
                                      aria-label={
                                        solicitud.revisorNormativoAsignado
                                          ? "Recuperar y reasignar revisor DPI"
                                          : "Asignar revisor del Equipo DPI"
                                      }
                                      className={cn(
                                        solicitud.revisorNormativoAsignado
                                          ? "text-warning hover:bg-warning/10"
                                          : "text-success hover:bg-success/10"
                                      )}
                                    >
                                      {solicitud.revisorNormativoAsignado ? (
                                        <RotateCcw className="size-4" />
                                      ) : (
                                        <UserCheck className="size-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent variant="surface" side="top">
                                    {solicitud.revisorNormativoAsignado
                                      ? "Recuperar y reasignar revisor del Equipo DPI (SOL-07)"
                                      : "Asignar revisor del Equipo DPI (SOL-07)"}
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* 3. Firmar informe como Director DPI (SOL-08) */}
                              {tieneInforme &&
                                firmaRevisorOk &&
                                !firmaDirectorOk && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                          handleFirmarDirector(solicitud.id)
                                        }
                                        aria-label="Firmar informe como Director DPI"
                                        className="text-success hover:bg-success/10"
                                      >
                                        <FileSignature className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent variant="surface" side="top">
                                      Firmar informe como Director DPI (2.ª Firma SOL-08)
                                    </TooltipContent>
                                  </Tooltip>
                                )}
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
                expedientes
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

        {/* MODAL: ASIGNAR O REASIGNAR REVISOR DEL EQUIPO DPI (SOL-07 — Homologado AccionCuentaDialog) */}
        <Dialog
          open={Boolean(solicitudToAssign)}
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
                {solicitudToAssign?.revisorNormativoAsignado
                  ? "Recuperar y Reasignar Revisión DPI"
                  : "Asignar Revisor del Equipo DPI"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                Seleccione al especialista activo del Equipo de Protección de la Información (DPI) que evaluará la justificación legal de los campos confidenciales (SOL-07).
              </DialogDescription>
            </DialogHeader>

            {solicitudToAssign && (
              <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-4 text-xs flex-1 min-h-0 text-left">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solicitud:</span>
                    <strong className="text-foreground font-mono">
                      {solicitudToAssign.id} (v
                      {solicitudToAssign.versionExpediente || 1})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institución:</span>
                    <strong className="text-foreground">
                      {solicitudToAssign.institucion}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuente:</span>
                    <strong className="text-foreground truncate max-w-56">
                      {solicitudToAssign.fuentePrincipal}
                    </strong>
                  </div>
                </div>

                {solicitudToAssign.revisorNormativoAsignado && (
                  <div className="rounded-2xl border border-border/80 bg-surface-muted/50 p-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Revisor DPI actual:{" "}
                    </span>
                    {solicitudToAssign.revisorNormativoAsignado}
                    <p className="text-[11px] mt-0.5">
                      Al recuperar y reasignar la solicitud, se conserva íntegro el trabajo previo y el historial de evaluación en DPI (SOL-07).
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Seleccione Especialista del Equipo DPI{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <RadioGroup
                    value={selectedRevisorNormId}
                    onValueChange={setSelectedRevisorNormId}
                    className="space-y-2"
                  >
                    {REVISORES_DPI.map((rev) => {
                      const isSel = selectedRevisorNormId === rev.id;
                      return (
                        <label
                          key={rev.id}
                          htmlFor={`rev-dpi-${rev.id}`}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-2xl border text-left cursor-pointer transition-all",
                            isSel
                              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 shadow-xs"
                              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={rev.id}
                              id={`rev-dpi-${rev.id}`}
                            />
                            <div>
                              <p className="font-bold text-foreground text-xs">
                                {rev.nombre}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {rev.cargo} · {rev.especialidad}
                              </p>
                            </div>
                          </div>
                          {isSel && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground block">
                    {solicitudToAssign.revisorNormativoAsignado ? (
                      <>
                        Motivo de reasignación en DPI{" "}
                        <span className="text-destructive">*</span>
                      </>
                    ) : (
                      "Instrucciones u observaciones para el Revisor DPI (Opcional):"
                    )}
                  </label>
                  <Textarea
                    rows={2}
                    value={observacionAsignacion}
                    onChange={(e) => setObservacionAsignacion(e.target.value)}
                    placeholder={
                      solicitudToAssign.revisorNormativoAsignado
                        ? "Indique el motivo de recuperación y reasignación del expediente..."
                        : "Instrucciones de evaluación de LOPDP o prioridad..."
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
                onClick={handleConfirmarAsignacionDpi}
                disabled={
                  Boolean(solicitudToAssign?.revisorNormativoAsignado) &&
                  !observacionAsignacion.trim()
                }
                className="w-full sm:w-1/2 font-bold gap-1.5 shadow-xs"
              >
                <UserCheck className="size-4" />
                <span>
                  {solicitudToAssign?.revisorNormativoAsignado
                    ? "Confirmar Reasignación DPI"
                    : "Confirmar Asignación DPI"}
                </span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL EXPEDIENTE E INFORME PARA FIRMA DEL DIRECTOR DPI (Idéntico a ExpedienteCuentaModal) */}
        <Dialog
          open={Boolean(solicitudInspecting)}
          onOpenChange={(open) => !open && setSolicitudInspecting(null)}
        >
          <DialogContent
            variant="standard"
            size="3xl"
            className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
            showCloseButton={true}
          >
            {solicitudInspecting && (
              <>
                <DialogHeader className="gap-2 text-left items-start pb-2 border-b border-border/50 shrink-0">
                  <div className="flex items-start justify-between w-full gap-4 pr-6">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                        <ShieldCheck className="size-6 text-primary stroke-[2.2px]" />
                      </div>
                      <div>
                        <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
                          Expediente DPI y Firma Electrónica · {solicitudInspecting.id}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          Supervisión de campos confidenciales (LOPDP), informe favorable y segunda firma electrónica del Director DPI (SOL-08).
                        </DialogDescription>
                      </div>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      <Badge
                        tone={
                          solicitudInspecting.estado === "Aprobada por Normatividad"
                            ? "success"
                            : solicitudInspecting.estado ===
                              "Pendiente de asignación en Normatividad"
                            ? "warning"
                            : "info"
                        }
                        appearance="soft"
                        size="sm"
                        className="font-bold gap-1.5"
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {getEstadoDpiLabel(solicitudInspecting.estado)}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                {/* Barra de pestañas segmentadas (Pills redondeadas idénticas a ExpedienteCuentaModal) */}
                <div className="p-1 rounded-xl sm:rounded-full bg-muted/40 border border-border/60 flex items-center gap-1 shrink-0 overflow-x-auto modal-scroll-area max-w-full">
                  <button
                    type="button"
                    onClick={() => setTabExpedienteDpi("campos")}
                    className={cn(
                      "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                      tabExpedienteDpi === "campos"
                        ? "bg-primary text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    Campos confidenciales
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabExpedienteDpi("informe")}
                    className={cn(
                      "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                      tabExpedienteDpi === "informe"
                        ? "bg-primary text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    Informe y firmas DPI (SOL-08)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabExpedienteDpi("historial")}
                    className={cn(
                      "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
                      tabExpedienteDpi === "historial"
                        ? "bg-primary text-white shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    Historial de asignaciones
                  </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-1 flex-1 min-h-0">
                  {tabExpedienteDpi === "campos" && (
                    <div className="space-y-3 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                          <span className="text-[11px] text-muted-foreground block">
                            Institución solicitante:
                          </span>
                          <p className="font-bold text-sm text-foreground">
                            {solicitudInspecting.institucion}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1">
                          <span className="text-[11px] text-muted-foreground block">
                            Fuente y proyecto:
                          </span>
                          <p className="font-bold text-sm text-foreground truncate">
                            {solicitudInspecting.fuentePrincipal}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            {solicitudInspecting.proyectoId} · {solicitudInspecting.proyectoNombre}
                          </p>
                        </div>
                      </div>

                      {(solicitudInspecting.fuentes?.[0]?.campos || [])
                        .filter((c) => c.clasificacion === "Confidencial")
                        .map((campo) => (
                          <div
                            key={campo.id || campo.nombreCampo}
                            className="p-3.5 rounded-2xl border border-border/70 bg-muted/20 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-foreground">
                                {campo.nombre || campo.nombreCampo}
                              </span>
                              <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                                <Lock className="size-2.5" />
                                Confidencial
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              <strong className="text-foreground">Finalidad:</strong>{" "}
                              {campo.finalidad}
                            </p>
                            <p className="text-muted-foreground">
                              <strong className="text-foreground">
                                Justificación jurídica (LOPDP):
                              </strong>{" "}
                              {campo.justificacionConfidencial || campo.fundamento}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {tabExpedienteDpi === "informe" && (
                    <div className="space-y-4 text-left">
                      {solicitudInspecting.informeNormativa ? (
                        <div className="p-4 rounded-2xl border border-border/70 bg-muted/30 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <FileText className="size-4 text-primary" />
                              {solicitudInspecting.informeNormativa.numero} ·{" "}
                              {solicitudInspecting.informeNormativa.titulo}
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {solicitudInspecting.informeNormativa.fechaEmision}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic leading-relaxed">
                            &ldquo;{solicitudInspecting.informeNormativa.fundamento}
                            &rdquo;
                          </p>
                          <div className="pt-2 border-t border-border/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                1.ª Firma Electrónica (Revisor Equipo DPI):
                              </span>
                              <Badge tone="success" appearance="soft" size="sm">
                                {solicitudInspecting.informeNormativa.revisorNombre}{" "}
                                (Firmado)
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                2.ª Firma Electrónica (Director DPI):
                              </span>
                              {solicitudInspecting.informeNormativa
                                .firmadoDirector ? (
                                <Badge tone="success" appearance="soft" size="sm">
                                  {
                                    solicitudInspecting.informeNormativa
                                      .directorNombre
                                  }{" "}
                                  (Firmado)
                                </Badge>
                              ) : (
                                <Badge tone="warning" appearance="soft" size="sm">
                                  Pendiente de su firma (SOL-08)
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl border border-border/70 bg-muted/20 text-xs text-center text-muted-foreground">
                          El Revisor del Equipo DPI aún no ha emitido ni firmado el informe favorable de aprobación.
                        </div>
                      )}
                    </div>
                  )}

                  {tabExpedienteDpi === "historial" && (
                    <div className="space-y-3 text-left">
                      {solicitudInspecting.historialAsignaciones &&
                      solicitudInspecting.historialAsignaciones.length > 0 ? (
                        solicitudInspecting.historialAsignaciones.map((asig) => (
                          <div
                            key={asig.id}
                            className="p-3.5 rounded-2xl border border-border/70 bg-muted/30 text-xs space-y-1"
                          >
                            <div className="flex justify-between">
                              <span className="font-semibold text-foreground">
                                {asig.revisorNombre}
                              </span>
                              <span className="font-mono text-muted-foreground">
                                {asig.fecha}
                              </span>
                            </div>
                            <p className="text-muted-foreground">
                              Asignó: {asig.director}
                            </p>
                            {asig.observacion && (
                              <p className="italic text-foreground bg-background p-2 rounded-xl border border-border/60">
                                &ldquo;{asig.observacion}&rdquo;
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-xs text-muted-foreground">
                          Sin historial de asignaciones registrado.
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
                    onClick={() => setSolicitudInspecting(null)}
                    className="h-9 px-5 text-xs !rounded-full font-semibold cursor-pointer"
                  >
                    Cerrar expediente
                  </Button>
                  {solicitudInspecting.informeNormativa?.firmadoRevisor &&
                    !solicitudInspecting.informeNormativa?.firmadoDirector && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          handleFirmarDirector(solicitudInspecting.id)
                        }
                        className="font-semibold gap-1.5 h-9 px-5 text-xs !rounded-full shadow-xs"
                      >
                        <FileSignature className="size-4" />
                        <span>
                          Firmar informe como Director DPI y habilitar formalización
                        </span>
                      </Button>
                    )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </WireframeDashboardLayout>
  );
}
