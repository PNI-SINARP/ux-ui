"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Lock,
  Unlock,
  Clock,
  Layers,
  RotateCcw,
  Sparkles,
  FileSearch,
  FileText,
  Building2,
  User,
  X,
  Search as SearchIcon,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { cn } from "@/lib/utils";
import {
  useSolicitudesStore,
  type SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

type KpiFilter = "ALL" | "POR_EVALUAR" | "SUBSANADAS" | "OBSERVADAS" | "APROBADAS";

interface FilterComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

function FilterCombobox({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
}: FilterComboboxProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;
  const [inputValue, setInputValue] = useState(selectedLabel);
  const [isFiltering, setIsFiltering] = useState(false);

  React.useEffect(() => {
    setInputValue(options.find((o) => o.value === value)?.label ?? value);
    setIsFiltering(false);
  }, [value, options]);

  const filtered = isFiltering
    ? options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))
    : options;

  return (
    <Combobox
      value={value}
      onValueChange={(val: string | null) => {
        if (val !== null) {
          onChange(val);
          const match = options.find((o) => o.value === val);
          if (match) setInputValue(match.label);
          setIsFiltering(false);
        }
      }}
      onOpenChange={(open: boolean) => {
        if (!open) {
          setInputValue(selectedLabel);
          setIsFiltering(false);
        }
      }}
    >
      <ComboboxInput
        placeholder={placeholder}
        value={inputValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInputValue(e.target.value);
          setIsFiltering(true);
        }}
        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
          e.target.select();
          setIsFiltering(false);
        }}
        showTrigger
        className="h-9 text-xs bg-surface border-border/80 shadow-2xs w-full rounded-full [&_input]:text-xs [&_input]:font-medium [&_input]:text-foreground [&_input]:px-3.5"
      />
      <ComboboxContent className="min-w-[200px]">
        <ComboboxList>
          {filtered.length === 0 ? (
            <ComboboxEmpty>Sin coincidencias</ComboboxEmpty>
          ) : (
            filtered.map((opt) => (
              <ComboboxItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </ComboboxItem>
            ))
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export function RevisionGestionView() {
  const router = useRouter();
  const { solicitudes } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [kpiFilter, setKpiFilter] = useState<KpiFilter>("ALL");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [institucionFilter, setInstitucionFilter] = useState<string>("TODAS");
  const [sensibilidadFilter, setSensibilidadFilter] = useState<string>("TODAS");
  const [sortOrder, setSortOrder] = useState<"recientes" | "antiguos">("recientes");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Bandeja del Revisor del Equipo de Gestión
  const bandejaGestion = useMemo(() => {
    return solicitudes.filter(
      (s) =>
        s.estado === "Asignada a revisión de Gestión" ||
        s.estado === "En revisión de Gestión" ||
        s.estado === "En revisión" ||
        s.estado === "Por revisar" ||
        s.estado === "Reenviada" ||
        s.estado === "Observada" ||
        s.estado === "Con observaciones" ||
        s.estado === "Requiere corrección" ||
        s.estado === "Aprobada por Gestión" ||
        s.estado === "Pendiente de asignación en Normatividad" ||
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        s.estado === "Cerrada" ||
        s.estado === "Cerrada por vencimiento" ||
        Boolean(s.revisorAsignado)
    );
  }, [solicitudes]);

  const isPorEvaluar = (s: SolicitudAcceso) =>
    s.estado === "Asignada a revisión de Gestión" ||
    s.estado === "En revisión de Gestión" ||
    s.estado === "En revisión" ||
    s.estado === "Por revisar" ||
    s.estado === "Reenviada";

  const isObservada = (s: SolicitudAcceso) =>
    s.estado === "Observada" ||
    s.estado === "Con observaciones" ||
    s.estado === "Requiere corrección" ||
    s.estado === "Cerrada" ||
    s.estado === "Cerrada por vencimiento";

  const isAprobadaGestion = (s: SolicitudAcceso) =>
    s.estado === "Aprobada por Gestión" ||
    s.estado === "Pendiente de asignación en Normatividad" ||
    s.estado === "En revisión normativa" ||
    s.estado === "Aprobada por Normatividad" ||
    s.estado === "En formalización" ||
    s.estado === "Pendiente de firma" ||
    s.estado === "Acceso habilitado" ||
    s.estado === "Acceso generado";

  const hasConfidenciales = (s: SolicitudAcceso) =>
    s.fuentes?.some((f) => f.campos?.some((c) => c.clasificacion === "Confidencial")) ?? false;

  const hasSensibles = (s: SolicitudAcceso) =>
    s.fuentes?.some((f) => f.campos?.some((c) => c.esSensible)) ?? false;

  // Métricas KPI
  const kpis = useMemo(() => {
    const porEvaluar = bandejaGestion.filter(isPorEvaluar).length;
    const subsanadas = bandejaGestion.filter(
      (s) => (s.versionExpediente && s.versionExpediente > 1) || s.estado === "Reenviada"
    ).length;
    const observadas = bandejaGestion.filter(isObservada).length;
    const aprobadas = bandejaGestion.filter(isAprobadaGestion).length;

    return {
      total: bandejaGestion.length,
      porEvaluar,
      subsanadas,
      observadas,
      aprobadas,
    };
  }, [bandejaGestion]);

  const institucionesUnicas = useMemo(() => {
    const set = new Set<string>();
    bandejaGestion.forEach((s) => {
      if (s.institucion) set.add(s.institucion);
    });
    return Array.from(set);
  }, [bandejaGestion]);

  const filteredSolicitudes = useMemo(() => {
    const filtered = bandejaGestion.filter((s) => {
      const q = searchTerm.trim().toLowerCase();
      const fuenteNombre = s.fuentePrincipal || s.fuentes?.[0]?.nombre || "";
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        fuenteNombre.toLowerCase().includes(q) ||
        s.institucion.toLowerCase().includes(q) ||
        s.coordinador.toLowerCase().includes(q) ||
        (s.proyectoNombre || "").toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (kpiFilter === "POR_EVALUAR" && !isPorEvaluar(s)) return false;
      if (
        kpiFilter === "SUBSANADAS" &&
        !((s.versionExpediente && s.versionExpediente > 1) || s.estado === "Reenviada")
      ) {
        return false;
      }
      if (kpiFilter === "OBSERVADAS" && !isObservada(s)) return false;
      if (kpiFilter === "APROBADAS" && !isAprobadaGestion(s)) return false;

      if (estadoFilter === "POR_EVALUAR" && !isPorEvaluar(s)) return false;
      if (estadoFilter === "OBSERVADAS" && !isObservada(s)) return false;
      if (estadoFilter === "APROBADAS" && !isAprobadaGestion(s)) return false;

      if (institucionFilter !== "TODAS" && s.institucion !== institucionFilter) {
        return false;
      }

      const tieneConf = hasConfidenciales(s);
      const tieneSens = hasSensibles(s);
      if (sensibilidadFilter === "SENSIBLE" && !tieneSens) return false;
      if (sensibilidadFilter === "CONFIDENCIAL" && !tieneConf) return false;
      if (sensibilidadFilter === "SOLO_ACCESIBLES" && tieneConf) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      const aPorEval = isPorEvaluar(a) ? 0 : 1;
      const bPorEval = isPorEvaluar(b) ? 0 : 1;
      if (aPorEval !== bPorEval) return aPorEval - bPorEval;
      const cmp = b.id.localeCompare(a.id);
      return sortOrder === "recientes" ? cmp : -cmp;
    });
  }, [
    bandejaGestion,
    searchTerm,
    kpiFilter,
    estadoFilter,
    institucionFilter,
    sensibilidadFilter,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / itemsPerPage));
  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSolicitudes.slice(start, start + itemsPerPage);
  }, [filteredSolicitudes, currentPage, itemsPerPage]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    kpiFilter !== "ALL" ||
    estadoFilter !== "TODOS" ||
    institucionFilter !== "TODAS" ||
    sensibilidadFilter !== "TODAS";

  const handleResetFilters = () => {
    setSearchTerm("");
    setKpiFilter("ALL");
    setEstadoFilter("TODOS");
    setInstitucionFilter("TODAS");
    setSensibilidadFilter("TODAS");
    setSortOrder("recientes");
    setCurrentPage(1);
  };

  const renderEstadoBadge = (sol: SolicitudAcceso) => {
    if (isPorEvaluar(sol)) {
      if ((sol.versionExpediente && sol.versionExpediente > 1) || sol.estado === "Reenviada") {
        return (
          <Badge tone="info" appearance="soft" size="sm" dot>
            Subsanada · Pendiente por revisar (v{sol.versionExpediente || 2})
          </Badge>
        );
      }
      return (
        <Badge tone="warning" appearance="soft" size="sm" dot>
          Pendiente por revisar
        </Badge>
      );
    }

    if (sol.estado === "Cerrada" || sol.estado === "Cerrada por vencimiento") {
      return (
        <Badge tone="danger" appearance="soft" size="sm" dot>
          Cerrada
        </Badge>
      );
    }

    if (isObservada(sol)) {
      const obsDpi = sol.observacionesEstructuradas?.some(
        (o) => o.etapa === "Protección de la Información (DPI)"
      );
      return (
        <Badge tone="warning" appearance="soft" size="sm" dot>
          {obsDpi ? "Observada en DPI" : "Observada por Gestión"}
        </Badge>
      );
    }

    if (sol.estado === "Pendiente de asignación en Normatividad") {
      return (
        <Badge tone="info" appearance="soft" size="sm" dot>
          Aprobada en Gestión · Por asignar en DPI
        </Badge>
      );
    }

    if (sol.estado === "En revisión normativa") {
      const pendienteFirmaDir =
        sol.informeNormativa?.firmadoRevisor && !sol.informeNormativa?.firmadoDirector;
      return (
        <Badge tone="info" appearance="soft" size="sm" dot>
          {pendienteFirmaDir
            ? "Aprobada en Gestión · Firma Directora DPI"
            : "Aprobada en Gestión · En revisión DPI"}
        </Badge>
      );
    }

    if (sol.estado === "Aprobada por Normatividad") {
      return (
        <Badge tone="success" appearance="soft" size="sm" dot>
          Aprobada por Gestión y DPI
        </Badge>
      );
    }

    if (isAprobadaGestion(sol)) {
      return (
        <Badge tone="success" appearance="soft" size="sm" dot>
          Aprobada por Gestión
        </Badge>
      );
    }

    return (
      <Badge tone="neutral" appearance="soft" size="sm" dot>
        {sol.estado}
      </Badge>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-gestion"
      breadcrumbs={[
        { label: "Acceso a fuentes" },
        { label: "Revisar solicitudes de acceso" },
      ]}
    >
      <TooltipProvider delayDuration={180}>
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 pr-6 sm:pr-8 lg:pr-10 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* ── 1. Encabezado Principal ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 w-full">
                <div className="flex items-center gap-2">
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="font-semibold text-[11px]"
                  >
                    Acceso a fuentes · Solicitudes de acceso
                  </Badge>
                </div>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Revisar solicitudes de acceso
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Evalúa la pertinencia funcional, modalidad de consumo, cupo y documentos de soporte de las solicitudes de acceso a fuentes asignadas a tu bandeja. Ingresa al detalle de cada solicitud para revisar el expediente y registrar tu decisión en la columna derecha.
                </p>
              </div>
            </div>

            {/* ── 2. Resumen Superior (Tarjetas Interactivas con Layout Horizontal Optimizado) ── */}
            <div
              aria-label="Indicadores de revisión de solicitudes de acceso"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full shrink-0"
            >
              {/* Card 1: Total asignadas */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setKpiFilter("ALL");
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setKpiFilter("ALL");
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiFilter === "ALL"
                    ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                    : "bg-surface hover:bg-muted/30 border-border/70 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiFilter === "ALL"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                      )}
                    >
                      <FileText className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          Total asignadas
                        </h3>
                        {kpiFilter === "ALL" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        Todas las solicitudes
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block leading-none">
                      {kpis.total}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>

              {/* Card 2: Pendientes por revisar */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setKpiFilter((prev) => (prev === "POR_EVALUAR" ? "ALL" : "POR_EVALUAR"));
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setKpiFilter((prev) => (prev === "POR_EVALUAR" ? "ALL" : "POR_EVALUAR"));
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiFilter === "POR_EVALUAR"
                    ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                    : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiFilter === "POR_EVALUAR"
                          ? "bg-warning text-white shadow-xs"
                          : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                      )}
                    >
                      <Clock className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-warning transition-colors truncate">
                          Pendientes por revisar
                        </h3>
                        {kpiFilter === "POR_EVALUAR" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-warning/20 text-warning border border-warning/30 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        Por evaluar y resolver
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-warning tracking-tight block leading-none">
                      {kpis.porEvaluar}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>

              {/* Card 3: Aprobadas en Gestión */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setKpiFilter((prev) => (prev === "APROBADAS" ? "ALL" : "APROBADAS"));
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setKpiFilter((prev) => (prev === "APROBADAS" ? "ALL" : "APROBADAS"));
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiFilter === "APROBADAS"
                    ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                    : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiFilter === "APROBADAS"
                          ? "bg-success text-white shadow-xs"
                          : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-success transition-colors truncate">
                          Aprobadas en Gestión
                        </h3>
                        {kpiFilter === "APROBADAS" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-success/20 text-success border border-success/30 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        Dictamen funcional favorable
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-success tracking-tight block leading-none">
                      {kpis.aprobadas}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>

              {/* Card 4: Observadas */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setKpiFilter((prev) => (prev === "OBSERVADAS" ? "ALL" : "OBSERVADAS"));
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setKpiFilter((prev) => (prev === "OBSERVADAS" ? "ALL" : "OBSERVADAS"));
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiFilter === "OBSERVADAS"
                    ? "bg-danger/15 border-danger ring-2 ring-danger/40 shadow-xs"
                    : "bg-danger/5 hover:bg-danger/10 border-danger/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiFilter === "OBSERVADAS"
                          ? "bg-danger text-white shadow-xs"
                          : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                      )}
                    >
                      <AlertTriangle className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-danger transition-colors truncate">
                          Observadas
                        </h3>
                        {kpiFilter === "OBSERVADAS" && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-danger/20 text-danger border border-danger/30 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        En espera de subsanación
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-danger tracking-tight block leading-none">
                      {kpis.observadas}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            {/* ── Línea separadora entre KPI Cards y Filtros ── */}
            <div className="w-full h-[1.5px] bg-border my-1 shrink-0" />

            {/* ── 3. Buscador y Filtros por Combobox en Una Fila Sin Caja ── */}
            <div className="space-y-3 shrink-0">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 w-full">
                {/* Buscador amplio y flexible */}
                <div className="flex-1 min-w-[260px] sm:min-w-[340px] lg:min-w-[420px]">
                  <Search
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    onClear={() => {
                      setSearchTerm("");
                      setCurrentPage(1);
                    }}
                    placeholder="Buscar por código SOL, fuente, institución, coordinador o proyecto..."
                    className="bg-surface border-border/80 shadow-2xs h-9 text-xs w-full rounded-full"
                  />
                </div>

                {/* Filtros Combobox del UI Kit anchos e independientes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap items-end gap-2.5">
                  <div className="flex flex-col gap-1 w-full lg:w-[195px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left ml-1 truncate">
                      Estado
                    </span>
                    <FilterCombobox
                      value={estadoFilter}
                      onChange={(val) => {
                        setEstadoFilter(val || "TODOS");
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "TODOS", label: "Todos los estados" },
                        { value: "POR_EVALUAR", label: "Pendiente por revisar" },
                        { value: "OBSERVADAS", label: "Observadas / Subsanación" },
                        { value: "APROBADAS", label: "Aprobadas / En DPI" },
                      ]}
                      placeholder="Estado"
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-full lg:w-[210px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left ml-1 truncate">
                      Institución
                    </span>
                    <FilterCombobox
                      value={institucionFilter}
                      onChange={(val) => {
                        setInstitucionFilter(val || "TODAS");
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "TODAS", label: "Todas las instituciones" },
                        ...institucionesUnicas.map((inst) => ({ value: inst, label: inst })),
                      ]}
                      placeholder="Institución"
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-full lg:w-[190px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left ml-1 truncate">
                      Sensibilidad
                    </span>
                    <FilterCombobox
                      value={sensibilidadFilter}
                      onChange={(val) => {
                        setSensibilidadFilter(val || "TODAS");
                        setCurrentPage(1);
                      }}
                      options={[
                        { value: "TODAS", label: "Todas las sensibilidades" },
                        { value: "CONFIDENCIAL", label: "Contiene Confidenciales (DPI)" },
                        { value: "SENSIBLE", label: "Contiene Datos Sensibles (LOPDP)" },
                        { value: "SOLO_ACCESIBLES", label: "Solo Accesibles" },
                      ]}
                      placeholder="Sensibilidad"
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-full lg:w-[165px]">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left ml-1 truncate">
                      Orden
                    </span>
                    <FilterCombobox
                      value={sortOrder}
                      onChange={(val) => {
                        if (val === "recientes" || val === "antiguos") setSortOrder(val);
                      }}
                      options={[
                        { value: "recientes", label: "Más recientes" },
                        { value: "antiguos", label: "Más antiguos" },
                      ]}
                      placeholder="Ordenar por"
                    />
                  </div>

                  <ViewModeToggle value={viewMode} onChange={setViewMode} />
                </div>
              </div>

              {/* Badges / Chips de filtros activos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Mostrando resultados filtrados por:
                  </span>

                  {searchTerm.trim() !== "" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full border border-border"
                    >
                      <span>Búsqueda: &quot;{searchTerm}&quot;</span>
                      <X
                        className="size-3.5 cursor-pointer hover:text-foreground/80 transition-colors"
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}

                  {kpiFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      dot
                      className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full"
                    >
                      <span>
                        Indicador:{" "}
                        {kpiFilter === "POR_EVALUAR"
                          ? "Pendientes por revisar"
                          : kpiFilter === "APROBADAS"
                            ? "Aprobadas en Gestión"
                            : kpiFilter === "OBSERVADAS"
                              ? "Observadas"
                              : "Subsanadas (v2+)"}
                      </span>
                      <X
                        className="size-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setKpiFilter("ALL")}
                      />
                    </Badge>
                  )}

                  {estadoFilter !== "TODOS" && (
                    <Badge
                      tone="info"
                      appearance="soft"
                      dot
                      className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full"
                    >
                      <span>Estado: {estadoFilter}</span>
                      <X
                        className="size-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setEstadoFilter("TODOS")}
                      />
                    </Badge>
                  )}

                  {institucionFilter !== "TODAS" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full border border-border"
                    >
                      <span>Institución: {institucionFilter}</span>
                      <X
                        className="size-3.5 cursor-pointer hover:text-foreground/80 transition-colors"
                        onClick={() => setInstitucionFilter("TODAS")}
                      />
                    </Badge>
                  )}

                  {sensibilidadFilter !== "TODAS" && (
                    <Badge
                      tone="warning"
                      appearance="soft"
                      className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full"
                    >
                      <span>Sensibilidad: {sensibilidadFilter}</span>
                      <X
                        className="size-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSensibilidadFilter("TODAS")}
                      />
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 rounded-full"
                  >
                    Restablecer todos
                  </Button>
                </div>
              )}
            </div>

            {/* ── 4. Tabla de Solicitudes (Sin contenedor extra, idéntica a Cuentas Internas) ── */}
            {/* Vista de Tabla para Escritorio */}
            <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
              <Table
                className="w-full min-w-[1080px] table-fixed"
                containerClassName="overflow-x-auto rounded-xl"
              >
                <TableHeader>
                  <TableRow className="border-0 h-11">
                    <TableHead className="w-[135px] px-2 py-2.5 whitespace-nowrap">
                      TRÁMITE
                    </TableHead>
                    <TableHead className="w-[210px] px-2 py-2.5 whitespace-nowrap">
                      FUENTE Y PROYECTO
                    </TableHead>
                    <TableHead className="w-[180px] px-2 py-2.5 whitespace-nowrap">
                      SOLICITANTE
                    </TableHead>
                    <TableHead className="w-[210px] px-2 py-2.5 whitespace-nowrap">
                      INSTITUCIÓN
                    </TableHead>
                    <TableHead className="w-[175px] px-2 py-2.5 whitespace-nowrap">
                      SENSIBILIDAD
                    </TableHead>
                    <TableHead className="w-[130px] px-2 py-2.5 whitespace-nowrap">
                      FECHA ASIGNACIÓN
                    </TableHead>
                    <TableHead className="w-[195px] px-2 py-2.5 whitespace-nowrap">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-20 text-right pr-4">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSolicitudes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-2">
                          <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                            <SearchIcon className="size-6" />
                          </div>
                          <h3 className="font-heading font-bold text-base text-foreground">
                            No hay solicitudes registradas
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            No se encontraron solicitudes que coincidan con los filtros seleccionados.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSolicitudes.map((sol) => {
                      const fuenteNombre =
                        sol.fuentePrincipal || sol.fuentes?.[0]?.nombre || "Fuente SINARP";
                      const tieneConfidenciales = hasConfidenciales(sol);
                      const tieneSensibles = hasSensibles(sol);
                      const totalCampos =
                        sol.fuentes?.reduce((acc, f) => acc + (f.campos?.length || 0), 0) ||
                        sol.camposCount ||
                        0;
                      const modalidadTexto = sol.modalidadAprobada || sol.modalidad || "API individual";

                      return (
                        <TableRow
                          key={sol.id}
                          className="cursor-pointer transition-colors hover:bg-muted/40"
                          onClick={() => router.push(`/revision-gestion/${sol.id}`)}
                        >
                          {/* 1. Trámite */}
                          <TableCell className="px-2 font-mono text-xs overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 truncate cursor-pointer">
                                  <span className="font-bold text-foreground truncate">{sol.id}</span>
                                  <Badge
                                    tone={sol.versionExpediente && sol.versionExpediente > 1 ? "info" : "neutral"}
                                    appearance="soft"
                                    size="sm"
                                    className="text-[10px] px-1.5 py-0 font-mono shrink-0"
                                  >
                                    v{sol.versionExpediente || 1}
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                <p className="font-bold text-xs text-foreground font-sans">Identificador de solicitud</p>
                                <p className="font-mono text-xs text-primary font-bold">
                                  {sol.id} · Versión v{sol.versionExpediente || 1}
                                </p>
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  Instrumento: {sol.instrumento || "Convenio"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 2. Fuente y Proyecto */}
                          <TableCell className="px-2 overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col min-w-0 group/proc cursor-pointer">
                                  <span
                                    className="font-semibold text-foreground text-xs leading-snug truncate"
                                    title={fuenteNombre}
                                  >
                                    {fuenteNombre}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className="truncate">
                                      {sol.proyectoNombre || "Interoperabilidad Institucional"}
                                    </span>
                                    <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/proc:bg-primary/10 group-hover/proc:text-primary transition-colors shrink-0">
                                      +
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                <p className="font-bold text-xs text-foreground font-sans">{fuenteNombre}</p>
                                <p className="text-[11px] text-muted-foreground">
                                  Proyecto: {sol.proyectoNombre || "Interoperabilidad Institucional"}
                                </p>
                                <p className="font-mono text-[10px] text-primary mt-1 border-t border-border/60 pt-1">
                                  {totalCampos} campos · {modalidadTexto} · Cupo {(sol.cupoAprobado || sol.cupo || 0).toLocaleString()}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 3. Solicitante */}
                          <TableCell className="px-2 overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col min-w-0 group/sol cursor-pointer">
                                  <span
                                    className="font-bold text-foreground text-xs leading-snug truncate"
                                    title={sol.coordinador}
                                  >
                                    {sol.coordinador}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                    <span className="truncate">
                                      {sol.tipoInstitucion} · {modalidadTexto}
                                    </span>
                                    <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/sol:bg-primary/10 group-hover/sol:text-primary transition-colors shrink-0">
                                      +
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface" className="p-3 max-w-xs flex flex-col items-start gap-1">
                                <p className="font-bold text-xs text-foreground font-sans">{sol.coordinador}</p>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  Coordinador SINARP · Entidad {sol.tipoInstitucion}
                                </p>
                                <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-1 mt-1">
                                  {sol.institucion}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 4. Institución */}
                          <TableCell className="px-2 text-muted-foreground text-xs font-medium overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col truncate cursor-pointer group/inst">
                                  <span className="truncate font-semibold text-foreground group-hover/inst:text-primary transition-colors">
                                    {sol.institucion}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                    <span className="truncate">
                                      {totalCampos} campos ({sol.fuentesCount || sol.fuentes?.length || 1} fuente)
                                    </span>
                                    <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/inst:bg-primary/10 group-hover/inst:text-primary transition-colors shrink-0">
                                      +
                                    </span>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-1">
                                <p className="font-bold text-xs text-foreground leading-snug font-sans">
                                  {sol.institucion}
                                </p>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  Tipo: {sol.tipoInstitucion} · Instrumento: {sol.instrumento}
                                </p>
                                <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-1 mt-0.5">
                                  Revisor asignado: {sol.revisorAsignado || "Ana Torres (Equipo de Gestión)"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 5. Sensibilidad */}
                          <TableCell className="px-2 overflow-hidden">
                            {tieneSensibles ? (
                              <Badge tone="danger" appearance="soft" size="sm" className="gap-1">
                                <Lock className="size-3" />
                                <span>Confidencial · Sensible</span>
                              </Badge>
                            ) : tieneConfidenciales ? (
                              <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                                <Lock className="size-3" />
                                <span>Confidencial (DPI)</span>
                              </Badge>
                            ) : (
                              <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                                <Unlock className="size-3" />
                                <span>Solo Accesibles</span>
                              </Badge>
                            )}
                          </TableCell>

                          {/* 6. Fecha de asignación */}
                          <TableCell className="px-2 text-muted-foreground font-mono text-xs overflow-hidden">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="block truncate cursor-pointer hover:text-foreground transition-colors">
                                  {sol.fecha}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                <p className="font-bold text-xs text-foreground font-sans">Fecha de registro</p>
                                <p className="font-mono text-xs text-muted-foreground">{sol.fecha}</p>
                                {sol.ultimaActualizacion && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Actualizado: {sol.ultimaActualizacion}
                                  </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 7. Estado */}
                          <TableCell className="px-2 overflow-hidden">
                            {renderEstadoBadge(sol)}
                          </TableCell>

                          {/* 8. Acciones */}
                          <TableCell
                            className="text-right pr-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1.5">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      router.push(`/revision-gestion/${sol.id}`);
                                    }}
                                    aria-label={`Ver detalle de solicitud ${sol.id}`}
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
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

            {/* Vista Mobile / Cards (Idéntica a Cuentas Internas) */}
            <div className={cn("w-full", viewMode === "cards" ? "block" : "block md:hidden")}>
              {paginatedSolicitudes.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                    <SearchIcon className="size-6" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground">
                    No hay solicitudes registradas
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    No se encontraron solicitudes asignadas que coincidan con los filtros seleccionados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedSolicitudes.map((sol) => {
                    const fuenteNombre =
                      sol.fuentePrincipal || sol.fuentes?.[0]?.nombre || "Fuente SINARP";
                    const tieneConfidenciales = hasConfidenciales(sol);
                    const totalCampos =
                      sol.fuentes?.reduce((acc, f) => acc + (f.campos?.length || 0), 0) ||
                      sol.camposCount ||
                      0;

                    return (
                      <div
                        key={sol.id}
                        onClick={() => router.push(`/revision-gestion/${sol.id}`)}
                        className="p-4 rounded-xl border border-border bg-surface space-y-3 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-xs cursor-pointer"
                      >
                        {/* Cabecera: ID + Versión + Badge de Estado */}
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
                            <span className="font-bold text-xs font-mono text-primary whitespace-nowrap">
                              {sol.id}
                            </span>
                            <Badge
                              tone={sol.versionExpediente && sol.versionExpediente > 1 ? "info" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="text-[10px] px-1.5 py-0 font-mono"
                            >
                              v{sol.versionExpediente || 1}
                            </Badge>
                          </div>
                          <div className="min-w-0 flex justify-end shrink">
                            {renderEstadoBadge(sol)}
                          </div>
                        </div>

                        {/* Cuerpo: Fuente + Institución + Solicitante */}
                        <div className="space-y-2 py-0.5">
                          <div>
                            <p className="font-bold text-sm text-foreground leading-snug">
                              {fuenteNombre}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Proyecto: {sol.proyectoNombre || "Interoperabilidad Institucional"}
                            </p>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            <div className="flex items-start gap-2 text-foreground font-medium">
                              <Building2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                              <div className="flex flex-col min-w-0">
                                <span className="break-words leading-tight">{sol.institucion}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  {sol.tipoInstitucion} · {totalCampos} campos · {sol.modalidadAprobada || sol.modalidad || "API individual"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-muted-foreground">
                              <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-foreground font-medium break-words leading-tight">
                                  {sol.coordinador}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground mt-0.5">
                                  {tieneConfidenciales ? (
                                    <span className="text-warning font-semibold">Contiene Confidenciales (DPI)</span>
                                  ) : (
                                    <span className="text-success font-semibold">Solo Accesibles</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pie: Fecha + Botón Acción */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-border/60 gap-2 flex-wrap sm:flex-nowrap">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] text-muted-foreground">Fecha de registro:</span>
                            <span className="font-mono text-xs text-foreground font-medium whitespace-nowrap">
                              {sol.fecha}
                            </span>
                          </div>

                          <div className="shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/revision-gestion/${sol.id}`);
                                  }}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  aria-label={`Ver detalle de solicitud ${sol.id}`}
                                >
                                  <Eye className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Ver detalle</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── 5. Paginación y Contador de filas (Idéntico a Cuentas Internas) ── */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 sm:gap-4 pt-4 pb-2 w-full border-t border-border/50">
              {/* Información y Selector de filas */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 w-full md:w-auto text-center md:text-left">
                <p className="text-xs text-muted-foreground font-medium text-center md:text-left">
                  Mostrando{" "}
                  <span className="font-bold text-foreground">
                    {filteredSolicitudes.length === 0
                      ? 0
                      : (currentPage - 1) * itemsPerPage + 1}{" "}
                    - {Math.min(currentPage * itemsPerPage, filteredSolicitudes.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-foreground">
                    {filteredSolicitudes.length}
                  </span>{" "}
                  solicitudes
                </p>

                {/* Selector de filas por página */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Filas:</span>
                  <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                    {[5, 10, 20, 50].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setItemsPerPage(size);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all",
                          itemsPerPage === size
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

              {/* Controles de paginación */}
              <div className="w-full md:w-auto flex items-center justify-center md:justify-end overflow-x-auto py-1">
                <Pagination className="mx-auto md:mx-0 w-auto justify-center">
                  <PaginationContent className="gap-1 sm:gap-1.5 flex-nowrap justify-center">
                    <PaginationItem className="hidden sm:inline-flex">
                      <PaginationFirst
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(1);
                        }}
                        className={cn(
                          "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                          currentPage <= 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                        )}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={cn(
                          "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                          currentPage <= 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                        )}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          className={cn(
                            "size-8 rounded-full font-semibold text-xs transition-all",
                            page === currentPage
                              ? "bg-primary text-white font-bold shadow-2xs"
                              : "border border-border/70 hover:bg-muted/30 text-foreground"
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={cn(
                          "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                          currentPage >= totalPages ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                        )}
                      />
                    </PaginationItem>

                    <PaginationItem className="hidden sm:inline-flex">
                      <PaginationLast
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(totalPages);
                        }}
                        className={cn(
                          "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                          currentPage >= totalPages ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </Card>
        </main>
      </TooltipProvider>
    </WireframeDashboardLayout>
  );
}
