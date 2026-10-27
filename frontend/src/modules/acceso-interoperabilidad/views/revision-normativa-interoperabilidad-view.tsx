"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Eye,
  Clock,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Check,
  X,
  FolderSearch,
  ShieldCheck,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
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
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REVISORES_DPI = [
  {
    id: "U-EQNORM",
    nombre: "Carlos Mora (Revisor DPI)",
    cargo: "Especialista Jurídico de Protección de Datos (DPI)",
  },
  {
    id: "U-EQNORM2",
    nombre: "Sofía Castro (Revisor DPI)",
    cargo: "Abogada Especialista DPI",
  },
];

const ESTADO_OPTIONS = [
  { value: "ALL", label: "Todos los estados DPI" },
  {
    value: "PENDIENTES_DICTAMEN",
    label: "En revisión DPI (Pendientes de dictamen)",
  },
  {
    value: "PENDIENTES_FIRMA_DIRECTOR",
    label: "Informe emitido (En firma Director DPI)",
  },
  {
    value: "Aprobada por Normatividad",
    label: "Aprobadas por DPI (Doble firma)",
  },
];

export function RevisionNormativaInteroperabilidadView() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { solicitudes, aprobarNormativa, observarNormativa } =
    useSolicitudesStore();

  const [activeRevisorId, setActiveRevisorId] = useState<string>("U-EQNORM");
  const activeRevisor =
    REVISORES_DPI.find((r) => r.id === activeRevisorId) || REVISORES_DPI[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Paginación homologada con Gestión de Usuarios
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (tabParam === "informes") {
      setEstadoFilter("PENDIENTES_FIRMA_DIRECTOR");
    } else if (!tabParam) {
      setEstadoFilter("ALL");
    }
    setCurrentPage(1);
  }, [tabParam]);

  const [solicitudReviewing, setSolicitudReviewing] =
    useState<SolicitudAcceso | null>(null);
  const [tabRevisionDpi, setTabRevisionDpi] = useState<"campos" | "informe">("campos");
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [isObservarModalOpen, setIsObservarModalOpen] = useState(false);
  const [textoObservacionJuridica, setTextoObservacionJuridica] = useState("");
  const [conclusionesInforme, setConclusionesInforme] = useState("");

  // Expedientes asignados al Revisor del Equipo DPI (SOL-07 y SOL-08)
  const baseSolicitudesDPI = useMemo(() => {
    return solicitudes.filter((s) => {
      const tieneConfidencial = s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      );
      if (!tieneConfidencial) return false;

      const enFlujoRevisor =
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        (s.estado.includes("Aprobada") && Boolean(s.informeNormativa));

      if (!enFlujoRevisor) return false;

      // Filtrar por el revisor DPI activo (coincidencia por ID o nombre)
      const baseName = activeRevisor.nombre.split(" (")[0];
      if (
        s.revisorNormativoAsignado &&
        s.revisorNormativoAsignadoId !== activeRevisor.id &&
        s.revisorNormativoAsignado !== activeRevisor.nombre &&
        !s.revisorNormativoAsignado.includes(baseName)
      ) {
        return false;
      }

      return true;
    });
  }, [solicitudes, activeRevisor.id, activeRevisor.nombre]);

  const misSolicitudesNormativas = useMemo(() => {
    return baseSolicitudesDPI.filter((s) => {
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "")
          .toLowerCase()
          .includes(term);
        if (!matchesId && !matchesInst && !matchesFuente) return false;
      }

      if (estadoFilter === "PENDIENTES_DICTAMEN") {
        return s.estado === "En revisión normativa" && !s.informeNormativa;
      }
      if (estadoFilter === "PENDIENTES_FIRMA_DIRECTOR") {
        return Boolean(s.informeNormativa);
      }
      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) {
        return false;
      }

      return true;
    });
  }, [baseSolicitudesDPI, searchTerm, estadoFilter]);

  const metricas = useMemo(() => {
    const total = baseSolicitudesDPI.length;
    const pendientesDictamen = baseSolicitudesDPI.filter(
      (s) => s.estado === "En revisión normativa" && !s.informeNormativa
    ).length;
    const pendientesFirmaDirector = baseSolicitudesDPI.filter(
      (s) =>
        Boolean(s.informeNormativa?.firmadoRevisor) &&
        !s.informeNormativa?.firmadoDirector
    ).length;
    const aprobadas = baseSolicitudesDPI.filter(
      (s) => s.estado === "Aprobada por Normatividad"
    ).length;
    return { total, pendientesDictamen, pendientesFirmaDirector, aprobadas };
  }, [baseSolicitudesDPI]);

  const hasActiveFilters = searchTerm.trim() !== "" || estadoFilter !== "ALL";

  const handleResetFilters = () => {
    setSearchTerm("");
    setEstadoFilter("ALL");
    setCurrentPage(1);
  };

  // Paginación
  const totalRows = misSolicitudesNormativas.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return misSolicitudesNormativas.slice(startIndex, startIndex + rowsPerPage);
  }, [misSolicitudesNormativas, currentPage, rowsPerPage]);

  const startRange = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endRange = Math.min(currentPage * rowsPerPage, totalRows);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // SOL-08: Aprobar confidenciales + generar informe en portal y firmar como Revisor DPI (1.ª Firma)
  const handleConfirmarAprobacionJuridica = () => {
    if (!solicitudReviewing) return;
    const revisorNombre =
      solicitudReviewing.revisorNormativoAsignado || activeRevisor.nombre;

    aprobarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      director: "Director de Protección de la Información (DPI)",
      fundamento:
        conclusionesInforme.trim() ||
        "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
    });

    toast.success("Informe de aprobación DPI emitido y firmado por el Revisor", {
      description: `1.ª firma registrada (${revisorNombre}). Enviado al Director de Protección de la Información (DPI) para su firma conjunta.`,
    });

    setIsAprobarModalOpen(false);
    setSolicitudReviewing(null);
    setConclusionesInforme("");
  };

  // SOL-07: Observar confidenciales (otorga 3 días hábiles PAR-13 / PAR-10 y regresa al Coordinador)
  const handleConfirmarObservacionJuridica = () => {
    if (!solicitudReviewing || !textoObservacionJuridica.trim()) {
      toast.error(
        "Debe ingresar la fundamentación jurídica de la observación."
      );
      return;
    }

    const revisorNombre =
      solicitudReviewing.revisorNormativoAsignado || activeRevisor.nombre;

    observarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      diasPlazo: 3,
      observaciones: [
        {
          id: `obs-dpi-${Date.now()}`,
          tipo: "justificacion",
          elementoNombre: "Campos confidenciales",
          descripcion: textoObservacionJuridica,
          fecha: new Date().toISOString().substring(0, 10),
          revisor: revisorNombre,
          etapa: "Protección de la Información (DPI)",
        },
      ],
    });

    toast.warning("Observación DPI notificada (Plazo: 3 días hábiles PAR-13)", {
      description:
        "El Coordinador SINARP tiene 3 días hábiles (según calendario PAR-10) para subsanar. Al reenviar, el expediente volverá al Director de Gestión para nueva asignación.",
    });

    setIsObservarModalOpen(false);
    setSolicitudReviewing(null);
    setTextoObservacionJuridica("");
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-normativa-fuentes"
      currentRole="EQ_NORMATIVA"
      currentUser={{
        ...MOCK_USERS_BY_ROLE.EQ_NORMATIVA,
        name: activeRevisor.nombre,
        roleTitle: activeRevisor.cargo,
      }}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Equipo DPI", href: "/revision-normativa/fuentes" },
        { label: "Revisión de Campos Confidenciales" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* CABECERA HOMOLOGADA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                {tabParam === "informes"
                  ? "Informes elaborados"
                  : "Revisar campos DPI"}
              </h1>
              <p className="text-body-sm text-muted-foreground max-w-3xl">
                Bandeja del{" "}
                <strong>
                  Revisor de la Dirección de Protección de la Información (DPI)
                </strong>{" "}
                (SOL-07 y SOL-08). Evalúe la finalidad y justificación jurídica
                (LOPDP) de los campos confidenciales: genere y firme el informe
                favorable (1.ª firma) u observe otorgando{" "}
                <strong>3 días hábiles (PAR-13 / PAR-10)</strong>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
              <div className="flex items-center gap-2">
                <span className="text-caption text-muted-foreground hidden xl:inline">
                  Revisor DPI activo:
                </span>
                <Combobox
                  items={REVISORES_DPI.map((r) => ({
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
                      setCurrentPage(1);
                    }
                  }}
                >
                  <ComboboxSelectTrigger className="h-9 text-caption min-w-56 bg-background border-border" />
                  <ComboboxContent align="end" className="w-72">
                    <ComboboxList>
                      {REVISORES_DPI.map((r) => (
                        <ComboboxItem
                          key={r.id}
                          value={{ value: r.id, label: `${r.nombre} (${r.cargo})` }}
                          className="text-caption"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{r.nombre}</p>
                            <p className="text-caption text-muted-foreground">
                              {r.cargo}
                            </p>
                          </div>
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <Badge
                tone="warning"
                appearance="soft"
                size="md"
                className="font-semibold px-3 py-1.5 text-caption shrink-0"
              >
                Rol: Revisor DPI ({activeRevisor.nombre})
              </Badge>
            </div>
          </div>

          {/* TARJETAS KPI INTERACTIVAS (Idénticas a Cuentas Internas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 shrink-0">
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter("ALL");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter("ALL");
                  setCurrentPage(1);
                }
              }}
              aria-pressed={estadoFilter === "ALL"}
              className={cn(
                "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                estadoFilter === "ALL" &&
                  "ring-2 ring-primary bg-primary/15 border-primary/50"
              )}
              innerClassName="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <Scale className="size-5 stroke-[2px]" />
                </div>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[11px]"
                >
                  Total DPI
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Asignados a mi bandeja
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight mt-0.5">
                  {metricas.total}
                </p>
              </div>
            </Card>

            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "PENDIENTES_DICTAMEN"
                    ? "ALL"
                    : "PENDIENTES_DICTAMEN"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "PENDIENTES_DICTAMEN"
                      ? "ALL"
                      : "PENDIENTES_DICTAMEN"
                  );
                  setCurrentPage(1);
                }
              }}
              aria-pressed={estadoFilter === "PENDIENTES_DICTAMEN"}
              className={cn(
                "bg-warning/5 hover:bg-warning/10 border-warning/30 shadow-2xs transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning",
                estadoFilter === "PENDIENTES_DICTAMEN" &&
                  "ring-2 ring-warning bg-warning/15 border-warning/60"
              )}
              innerClassName="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="size-10 rounded-xl bg-warning/15 flex items-center justify-center text-warning shrink-0">
                  <Clock className="size-5 stroke-[2px]" />
                </div>
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[11px]"
                >
                  Evaluación SOL-07
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Pendientes de dictamen
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight mt-0.5">
                  {metricas.pendientesDictamen}
                </p>
              </div>
            </Card>

            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "PENDIENTES_FIRMA_DIRECTOR"
                    ? "ALL"
                    : "PENDIENTES_FIRMA_DIRECTOR"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "PENDIENTES_FIRMA_DIRECTOR"
                      ? "ALL"
                      : "PENDIENTES_FIRMA_DIRECTOR"
                  );
                  setCurrentPage(1);
                }
              }}
              aria-pressed={estadoFilter === "PENDIENTES_FIRMA_DIRECTOR"}
              className={cn(
                "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
                estadoFilter === "PENDIENTES_FIRMA_DIRECTOR" &&
                  "ring-2 ring-info bg-info/15 border-info/50"
              )}
              innerClassName="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="size-10 rounded-xl bg-info/15 flex items-center justify-center text-info shrink-0">
                  <FileSignature className="size-5 stroke-[2px]" />
                </div>
                <Badge
                  tone="info"
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[11px]"
                >
                  1.ª Firma SOL-08
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  En firma Director DPI
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight mt-0.5">
                  {metricas.pendientesFirmaDirector}
                </p>
              </div>
            </Card>

            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(
                  estadoFilter === "Aprobada por Normatividad"
                    ? "ALL"
                    : "Aprobada por Normatividad"
                );
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(
                    estadoFilter === "Aprobada por Normatividad"
                      ? "ALL"
                      : "Aprobada por Normatividad"
                  );
                  setCurrentPage(1);
                }
              }}
              aria-pressed={estadoFilter === "Aprobada por Normatividad"}
              className={cn(
                "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs transition-all cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success",
                estadoFilter === "Aprobada por Normatividad" &&
                  "ring-2 ring-success bg-success/15 border-success/50"
              )}
              innerClassName="p-3.5 sm:p-4 flex flex-col justify-between gap-2.5 h-full"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="size-10 rounded-xl bg-success/15 flex items-center justify-center text-success shrink-0">
                  <CheckCircle2 className="size-5 stroke-[2px]" />
                </div>
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[11px]"
                >
                  Doble firma OK
                </Badge>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Aprobadas por DPI
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight mt-0.5">
                  {metricas.aprobadas}
                </p>
              </div>
            </Card>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS HOMOLOGADA */}
          <div className="flex flex-col gap-3 shrink-0 w-full">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 w-full">
              <div className="flex-1 min-w-[200px]">
                <Search
                  size="sm"
                  placeholder="Buscar por ID, institución o fuente con campos confidenciales..."
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

              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
                <div className="w-full sm:w-64 lg:w-72 min-w-0">
                  <Combobox
                    items={ESTADO_OPTIONS}
                    value={
                      ESTADO_OPTIONS.find((o) => o.value === estadoFilter) ||
                      null
                    }
                    onValueChange={(val: any) => {
                      const nextVal = !val
                        ? "ALL"
                        : typeof val === "string"
                        ? val
                        : val.value;
                      setEstadoFilter(nextVal);
                      setCurrentPage(1);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Estado del dictamen DPI"
                      showTrigger
                      showClear={estadoFilter !== "ALL"}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[260px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado DPI</ComboboxLabel>
                          {ESTADO_OPTIONS.map((item) => (
                            <ComboboxItem
                              key={item.value}
                              value={item}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {item.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
                <span className="text-caption font-medium text-muted-foreground">
                  Filtros activos:
                </span>
                {searchTerm.trim() !== "" && (
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-0.5"
                  >
                    <span>Búsqueda: &ldquo;{searchTerm}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none"
                      aria-label="Quitar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {estadoFilter !== "ALL" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="gap-1.5 pl-2.5 pr-1.5 py-0.5"
                  >
                    <span>
                      Estado:{" "}
                      {ESTADO_OPTIONS.find((o) => o.value === estadoFilter)
                        ?.label || estadoFilter}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEstadoFilter("ALL");
                        setCurrentPage(1);
                      }}
                      className="rounded-sm opacity-70 hover:opacity-100 focus-visible:outline-none"
                      aria-label="Quitar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-6 px-2 text-caption text-muted-foreground hover:text-foreground"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* LISTADO RESPONSIVE + TABLA DESKTOP */}
          {misSolicitudesNormativas.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/10 p-10 text-center flex flex-col items-center justify-center gap-3">
              <div className="size-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <FolderSearch className="size-5" />
              </div>
              <div className="space-y-1 max-w-md">
                <p className="text-body-sm font-semibold text-foreground">
                  No se encontraron expedientes asignados en DPI
                </p>
                <p className="text-caption text-muted-foreground">
                  No hay solicitudes con campos confidenciales que coincidan con
                  los criterios de búsqueda seleccionados.
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Restablecer filtros
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* VISTA TARJETAS (MÓVIL O MODO TARJETAS — Idéntica a Cuentas Internas) */}
              <div
                className={cn(
                  "grid grid-cols-1 gap-3",
                  viewMode === "cards" ? "md:grid-cols-2" : "md:hidden"
                )}
              >
                {paginatedRows.map((solicitud) => {
                  const camposConf =
                    solicitud.fuentes?.[0]?.campos?.filter(
                      (c) => c.clasificacion === "Confidencial"
                    ) || [];
                  const tieneInforme = Boolean(solicitud.informeNormativa);
                  const canDictaminar =
                    solicitud.estado === "En revisión normativa" &&
                    !tieneInforme;
                  const cardColor =
                    solicitud.estado === "Aprobada por Normatividad"
                      ? "success"
                      : tieneInforme
                      ? "info"
                      : "warning";

                  return (
                    <InteractiveCard
                      key={solicitud.id}
                      color={cardColor}
                      decorativeIcon={<Scale className="size-full" />}
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
                          <p className="text-sm font-bold text-foreground mt-1 truncate">
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
                          {solicitud.estado === "En revisión normativa"
                            ? tieneInforme
                              ? "Informe en firma Director"
                              : "En revisión DPI"
                            : solicitud.estado === "Aprobada por Normatividad"
                            ? "Aprobada por DPI"
                            : solicitud.estado}
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
                            Revisor DPI
                          </span>
                          <span className="font-semibold text-foreground truncate block">
                            {solicitud.revisorNormativoAsignado ||
                              activeRevisor.nombre}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSolicitudReviewing(solicitud)}
                          className="w-full justify-center gap-1.5 font-semibold bg-surface/80 text-xs"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>Ver expediente</span>
                        </Button>

                        {canDictaminar ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSolicitudReviewing(solicitud);
                              setIsAprobarModalOpen(true);
                            }}
                            className="w-full justify-center gap-1.5 font-semibold text-xs"
                          >
                            <FileSignature className="size-3.5" />
                            <span>Emitir informe</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSolicitudReviewing(solicitud);
                              setTabRevisionDpi("informe");
                            }}
                            className="w-full justify-center gap-1.5 font-semibold text-xs"
                          >
                            <FileText className="size-3.5 text-info" />
                            <span>Ver informe DPI</span>
                          </Button>
                        )}
                      </div>
                    </InteractiveCard>
                  );
                })}
              </div>

              {/* VISTA DESKTOP: TABLA ESTÁNDAR (Idéntica a Cuentas Internas) */}
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
                          REVISOR DPI
                        </TableHead>
                        <TableHead className="min-w-[190px]">
                          INFORME DPI Y FIRMAS
                        </TableHead>
                        <TableHead className="w-[180px]">
                          ESTADO
                        </TableHead>
                        <TableHead className="w-[140px] text-right pr-6">
                          ACCIONES
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRows.map((solicitud) => {
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
                        const canDictaminar =
                          solicitud.estado === "En revisión normativa" &&
                          !tieneInforme;

                        return (
                          <TableRow
                            key={solicitud.id}
                            className="group transition-colors"
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSolicitudReviewing(solicitud)
                                  }
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
                                  Validado en Gestión:{" "}
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
                                  {solicitud.proyectoId} ·{" "}
                                  {solicitud.proyectoNombre}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-warning">
                                <Lock className="size-3.5 shrink-0" />
                                <span>{camposConf.length} confidencial(es)</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground truncate block max-w-40">
                                {camposConf
                                  .map((c) => c.nombre || c.nombreCampo)
                                  .join(", ")}
                              </span>
                            </TableCell>

                            <TableCell className="text-xs">
                              <span className="font-medium text-foreground">
                                {solicitud.revisorNormativoAsignado ||
                                  activeRevisor.nombre}
                              </span>
                            </TableCell>

                            <TableCell className="text-xs">
                              {tieneInforme ? (
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1 text-[11px]">
                                    <Check className="size-3 text-success font-bold" />
                                    <span className="text-success font-medium">
                                      1.ª Revisor DPI:{" "}
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
                                      2.ª Director DPI:{" "}
                                      {firmaDirectorOk
                                        ? "Firmado"
                                        : "En espera firma Director"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic">
                                  Pendiente emitir dictamen DPI
                                </span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs">
                              <Badge
                                tone={
                                  solicitud.estado === "Aprobada por Normatividad"
                                    ? "success"
                                    : tieneInforme
                                    ? "info"
                                    : "warning"
                                }
                                appearance="soft"
                                size="sm"
                                className="font-semibold whitespace-nowrap"
                              >
                                {solicitud.estado === "En revisión normativa"
                                  ? tieneInforme
                                    ? "En firma Director DPI"
                                    : "En revisión DPI"
                                  : solicitud.estado ===
                                    "Aprobada por Normatividad"
                                  ? "Aprobada por DPI"
                                  : solicitud.estado}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-1">
                                {/* 1. Ver expediente e informe DPI en modal */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() =>
                                        setSolicitudReviewing(solicitud)
                                      }
                                      className="text-primary hover:bg-primary/10"
                                      aria-label="Ver expediente e informe DPI"
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent variant="surface" side="top">
                                    Ver expediente e informe DPI
                                  </TooltipContent>
                                </Tooltip>

                                {/* 2. Emitir y firmar informe favorable DPI (1.ª Firma SOL-08) */}
                                {canDictaminar && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setSolicitudReviewing(solicitud);
                                          setIsAprobarModalOpen(true);
                                        }}
                                        className="text-success hover:bg-success/10"
                                        aria-label="Generar y firmar informe de aprobación DPI"
                                      >
                                        <FileSignature className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent variant="surface" side="top">
                                      Generar y firmar informe favorable DPI (1.ª Firma SOL-08)
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 3. Observar jurídicamente (3 días hábiles PAR-13) */}
                                {canDictaminar && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setSolicitudReviewing(solicitud);
                                          setIsObservarModalOpen(true);
                                        }}
                                        className="text-warning hover:bg-warning/10"
                                        aria-label="Observar justificación jurídica en DPI"
                                      >
                                        <AlertTriangle className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent variant="surface" side="top">
                                      Observar justificación jurídica (3 días hábiles PAR-13)
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TooltipProvider>
              </div>

              {/* PAGINACIÓN HOMOLOGADA CON CUENTAS-INTERNAS */}
              <div className="pt-2 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <p className="text-caption text-muted-foreground font-medium">
                    Mostrando{" "}
                    <span className="font-bold text-foreground">
                      {startRange}-{endRange}
                    </span>{" "}
                    de{" "}
                    <span className="font-bold text-foreground">
                      {totalRows}
                    </span>{" "}
                    expedientes
                  </p>
                  <div className="hidden sm:flex items-center gap-1 text-caption text-muted-foreground">
                    <span>Filas:</span>
                    <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                      {[5, 10, 15].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setRowsPerPage(size);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "px-2 py-0.5 text-caption rounded-full transition-colors font-semibold cursor-pointer",
                            rowsPerPage === size
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationFirst
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(1);
                        }}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.max(1, p - 1));
                        }}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>

                    {getPageNumbers().map((p, idx) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === p}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(p);
                            }}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                        }}
                        className={cn(
                          currentPage === totalPages &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLast
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(totalPages);
                        }}
                        className={cn(
                          currentPage === totalPages &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </Card>

        {/* MODAL EXPEDIENTE DPI (HOMOLOGADO CON EXPEDIENTE-CUENTA-MODAL) */}
        <Dialog
          open={Boolean(solicitudReviewing)}
          onOpenChange={(open) => {
            if (!open) {
              setSolicitudReviewing(null);
              setTabRevisionDpi("campos");
            }
          }}
        >
          <DialogContent
            variant="standard"
            size="3xl"
            className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
          >
            {solicitudReviewing && (
              <>
                <DialogHeader className="pb-1">
                  <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
                    <div className="flex items-center gap-2.5 text-primary">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <Scale className="size-5 shrink-0" />
                      </div>
                      <div>
                        <DialogTitle className="font-heading text-lg font-extrabold text-foreground tracking-tight">
                          Evaluación de Campos Confidenciales (DPI) ·{" "}
                          {solicitudReviewing.id} (v
                          {solicitudReviewing.versionExpediente || 1})
                        </DialogTitle>
                        <DialogDescription className="text-caption text-muted-foreground mt-0.5">
                          {solicitudReviewing.institucion} ·{" "}
                          {solicitudReviewing.fuentePrincipal}
                        </DialogDescription>
                      </div>
                    </div>
                    <Badge
                      tone={
                        solicitudReviewing.estado ===
                        "Aprobada por Normatividad"
                          ? "success"
                          : "warning"
                      }
                      appearance="soft"
                      size="sm"
                      className="rounded-full font-semibold gap-1"
                    >
                      <Lock className="size-3" />
                      {solicitudReviewing.estado === "En revisión normativa"
                        ? "En revisión DPI"
                        : solicitudReviewing.estado ===
                          "Aprobada por Normatividad"
                        ? "Aprobada por DPI"
                        : solicitudReviewing.estado}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* TABS SEGMENTADAS AL ESTILO EXPEDIENTE-CUENTA-MODAL */}
                <div className="p-1 rounded-xl sm:rounded-full bg-muted/40 border border-border/60 flex items-center gap-1 shrink-0 overflow-x-auto modal-scroll-area max-w-full">
                  {(
                    [
                      {
                        id: "campos",
                        label: "Campos confidenciales (LOPDP)",
                        icon: Lock,
                      },
                      {
                        id: "informe",
                        label: "Informe y firmas DPI (SOL-08)",
                        icon: FileSignature,
                      },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const active = tabRevisionDpi === t.id;
                    return (
                      <Button
                        key={t.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setTabRevisionDpi(t.id)}
                        className={cn(
                          "flex-1 min-w-fit rounded-lg sm:rounded-full py-2 px-3 sm:px-4 text-xs sm:text-sm transition-all gap-1.5 h-auto whitespace-nowrap",
                          active
                            ? "bg-primary text-white shadow-xs font-bold hover:bg-primary hover:text-white"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40 font-medium"
                        )}
                      >
                        <Icon className="size-3.5 sm:size-4 shrink-0" />
                        <span>{t.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* CONTENIDO SCROLLABLE DE PESTAÑAS */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
                  {tabRevisionDpi === "campos" && (
                    <>
                      <div className="p-3.5 rounded-xl border border-success/30 bg-success/10 space-y-1 text-caption">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <CheckCircle2 className="size-4 text-success" />
                          <span>Aprobado previamente por Equipo de Gestión</span>
                        </div>
                        <p className="text-caption text-muted-foreground">
                          Gestión aprobó la pertinencia técnica, modalidad (
                          {solicitudReviewing.modalidadAprobada ||
                            solicitudReviewing.modalidad}
                          ) y cupo (
                          {solicitudReviewing.cupoAprobado ||
                            solicitudReviewing.cupo}{" "}
                          reg.).
                        </p>
                      </div>

                      <div className="space-y-3">
                        {(solicitudReviewing.fuentes?.[0]?.campos || [])
                          .filter((c) => c.clasificacion === "Confidencial")
                          .map((campo) => (
                            <div
                              key={campo.id || campo.nombreCampo}
                              className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 space-y-2 text-caption"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-foreground">
                                  {campo.nombre || campo.nombreCampo}
                                </span>
                                <Badge
                                  tone="warning"
                                  appearance="soft"
                                  size="sm"
                                  className="rounded-full"
                                >
                                  Confidencial
                                </Badge>
                              </div>

                              <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                <span className="text-caption font-bold text-muted-foreground uppercase">
                                  Finalidad de uso declarada:
                                </span>
                                <p className="text-foreground text-caption leading-relaxed">
                                  {campo.finalidad}
                                </p>
                              </div>

                              <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                <span className="text-caption font-bold text-warning uppercase">
                                  Justificación jurídica presentada (LOPDP):
                                </span>
                                <p className="text-foreground text-caption leading-relaxed">
                                  {campo.justificacionConfidencial ||
                                    campo.fundamento ||
                                    "Base legal conforme Ley Orgánica de Protección de Datos Personales (LOPDP)."}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  )}

                  {tabRevisionDpi === "informe" && (
                    <div className="space-y-3">
                      {solicitudReviewing.informeNormativa ? (
                        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3 text-caption">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <FileText className="size-4 text-primary" />
                              {solicitudReviewing.informeNormativa.numero} -{" "}
                              {solicitudReviewing.informeNormativa.titulo}
                            </span>
                            <span className="font-mono text-muted-foreground">
                              {solicitudReviewing.informeNormativa.fechaEmision}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic">
                            &ldquo;
                            {solicitudReviewing.informeNormativa.fundamento}
                            &rdquo;
                          </p>
                          <div className="pt-2 border-t border-border flex items-center justify-between">
                            <span className="text-muted-foreground">
                              1.ª Firma (Revisor DPI):
                            </span>
                            <Badge
                              tone="success"
                              appearance="soft"
                              size="sm"
                              className="rounded-full"
                            >
                              {solicitudReviewing.informeNormativa.revisorNombre}{" "}
                              (Firmado)
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">
                              2.ª Firma (Director DPI):
                            </span>
                            {solicitudReviewing.informeNormativa
                              .firmadoDirector ? (
                              <Badge
                                tone="success"
                                appearance="soft"
                                size="sm"
                                className="rounded-full"
                              >
                                {
                                  solicitudReviewing.informeNormativa
                                    .directorNombre
                                }{" "}
                                (Firmado)
                              </Badge>
                            ) : (
                              <Badge
                                tone="warning"
                                appearance="soft"
                                size="sm"
                                className="rounded-full"
                              >
                                En bandeja del Director DPI (
                                /revision-normativa/asignacion)
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 rounded-xl border border-dashed border-border text-center text-caption text-muted-foreground">
                          Aún no se ha generado el Informe de Aprobación DPI. Use
                          el botón{" "}
                          <strong className="text-foreground">
                            Generar y firmar informe DPI (1.ª Firma)
                          </strong>{" "}
                          para elaborarlo y remitirlo al Director DPI.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* FOOTER DEL MODAL */}
                <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:justify-between gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSolicitudReviewing(null)}
                    className="rounded-xl font-semibold"
                  >
                    Cerrar
                  </Button>

                  {solicitudReviewing.estado === "En revisión normativa" &&
                    !solicitudReviewing.informeNormativa && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsObservarModalOpen(true)}
                          className="rounded-xl font-semibold gap-1.5"
                        >
                          <AlertTriangle className="size-3.5 text-warning" />
                          <span>Observar (3 días hábiles PAR-13)</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsAprobarModalOpen(true)}
                          className="rounded-xl font-semibold gap-1.5"
                        >
                          <ShieldCheck className="size-3.5" />
                          <span>Generar y firmar informe DPI (1.ª Firma)</span>
                        </Button>
                      </div>
                    )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL: OBSERVAR JURÍDICAMENTE EN DPI (3 DÍAS HÁBILES PAR-13) */}
        <Dialog
          open={isObservarModalOpen}
          onOpenChange={setIsObservarModalOpen}
        >
          <DialogContent
            variant="warning"
            size="lg"
            className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
          >
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Notificar Observación de Protección de la Información (DPI)
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                Indique los fundamentos legales por los cuales debe subsanarse la justificación de los campos confidenciales (SOL-07).
              </DialogDescription>
            </DialogHeader>

            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left text-caption">
              <label className="font-semibold text-foreground block">
                Observación jurídica para subsanación{" "}
                <span className="text-danger">*</span>:
              </label>
              <Textarea
                rows={4}
                value={textoObservacionJuridica}
                onChange={(e) => setTextoObservacionJuridica(e.target.value)}
                placeholder="Indique qué competencia legal o justificación LOPDP debe subsanar el Coordinador SINARP..."
                className="text-caption bg-background rounded-xl"
              />
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-caption text-muted-foreground">
                <strong className="text-foreground">
                  Regla BPMN BN-07 (SOL-06 / SOL-07):
                </strong>{" "}
                Se notifica un plazo inicial de{" "}
                <strong>
                  3 días hábiles (parametrizable según PAR-13 y calendario
                  laboral PAR-10)
                </strong>{" "}
                al Coordinador SINARP. Toda corrección reenviada volverá al{" "}
                <strong>Director de Gestión</strong> para nueva asignación.
              </div>
            </div>

            <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
              <Button
                variant="ghost"
                onClick={() => setIsObservarModalOpen(false)}
                className="w-full sm:w-1/2 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                variant="warning"
                onClick={handleConfirmarObservacionJuridica}
                className="w-full sm:w-1/2 font-bold shadow-xs"
              >
                Notificar Subsanación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: APROBAR Y FIRMAR INFORME COMO REVISOR DPI (SOL-08) */}
        <Dialog open={isAprobarModalOpen} onOpenChange={setIsAprobarModalOpen}>
          <DialogContent
            variant="success"
            size="lg"
            className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
            icon={<CheckCircle2 className="size-10 text-success stroke-[2px]" />}
          >
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Generar y Firmar Informe de Aprobación DPI (1.ª Firma)
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                Genera el informe de aprobación en el portal con la firma electrónica del Revisor DPI y lo remite al Director DPI para la segunda firma conjunta (SOL-08).
              </DialogDescription>
            </DialogHeader>

            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left text-caption">
              <label className="font-semibold text-foreground block">
                Conclusiones y Dictamen de Protección de la Información (LOPDP):
              </label>
              <Textarea
                rows={3}
                value={conclusionesInforme}
                onChange={(e) => setConclusionesInforme(e.target.value)}
                placeholder="Se determina que el tratamiento de los datos confidenciales solicitados cuenta con base jurídica habilitante conforme a la LOPDP..."
                className="text-caption bg-background rounded-xl"
              />

              <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-caption space-y-1">
                <p className="font-bold text-foreground">
                  Requisito SOL-08: Doble firma electrónica en DPI
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  1. Al confirmar, se estampa la{" "}
                  <strong>1.ª firma (Revisor del Equipo DPI)</strong>.<br />
                  2. La solicitud no quedará aprobada por DPI hasta contar con
                  la <strong>2.ª firma del Director DPI</strong> en su bandeja (
                  <code>/revision-normativa/asignacion</code>).
                </p>
              </div>
            </div>

            <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
              <Button
                variant="ghost"
                onClick={() => setIsAprobarModalOpen(false)}
                className="w-full sm:w-1/2 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={handleConfirmarAprobacionJuridica}
                className="w-full sm:w-1/2 font-bold shadow-xs gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>Firmar y Enviar a Director DPI</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </WireframeDashboardLayout>
  );
}
