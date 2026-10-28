"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ShieldAlert,
  FileSignature,
  Building2,
  Mail,
  RefreshCw,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
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
    email: "carlos.mora@dinarp.gob.ec",
  },
  {
    id: "U-EQNORM2",
    nombre: "Sofía Castro (Revisor DPI)",
    cargo: "Abogada Especialista DPI",
    email: "sofia.castro@dinarp.gob.ec",
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
  const router = useRouter();
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

  // Paginación homologada con Cuentas Internas y Asignación DPI
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
  const [tabRevisionDpi, setTabRevisionDpi] = useState<
    "campos" | "informe" | "historial"
  >("campos");
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [isObservarModalOpen, setIsObservarModalOpen] = useState(false);
  const [textoObservacionJuridica, setTextoObservacionJuridica] = useState("");
  const [conclusionesInforme, setConclusionesInforme] = useState("");

  // Estados para simulación de FirmaEC (homologado a RegistroInstitucion y AsignacionDirector)
  const [firmaModalOpen, setFirmaModalOpen] = useState(false);
  const [solicitudAFirmar, setSolicitudAFirmar] =
    useState<SolicitudAcceso | null>(null);
  const [firmaEstado, setFirmaEstado] =
    useState<"validando" | "firmado">("validando");
  const [isConsultandoFirma, setIsConsultandoFirma] = useState(false);
  const [firmaTimestamp, setFirmaTimestamp] = useState<string>("");
  const [firmaCertId, setFirmaCertId] = useState<string>("");

  // Expedientes asignados al Revisor del Equipo DPI
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

  // Iniciar flujo de firma FirmaEC para el Revisor DPI (1.ª Firma SOL-08)
  const handleIniciarFirmaRevisor = (solicitud: SolicitudAcceso) => {
    setSolicitudAFirmar(solicitud);
    setFirmaEstado("validando");
    setIsConsultandoFirma(false);
    setFirmaTimestamp("");
    setFirmaCertId(
      `FEC-REV-2026-${Math.floor(100000 + Math.random() * 900000)}`
    );
    setIsAprobarModalOpen(false);
    setFirmaModalOpen(true);
  };

  // Simulación en vivo: Validación con FirmaEC tras notificación por correo
  useEffect(() => {
    if (!firmaModalOpen || firmaEstado !== "validando" || !solicitudAFirmar)
      return;

    const timer = setTimeout(() => {
      const now = new Date();
      const fechaHoraFormatted = `${now.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${now.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;

      setFirmaTimestamp(fechaHoraFormatted);
      setFirmaEstado("firmado");

      const revisorNombre =
        solicitudAFirmar.revisorNormativoAsignado || activeRevisor.nombre;

      aprobarNormativa(solicitudAFirmar.id, {
        revisor: revisorNombre,
        director: "Dr. Roberto Méndez (Director DPI)",
        fundamento:
          conclusionesInforme.trim() ||
          "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
      });

      toast.success(
        "1.ª Firma electrónica validada con éxito en FirmaEC (SOL-08)",
        {
          description: `El informe de ${solicitudAFirmar.id} fue suscrito por ${revisorNombre} y remitido al Director DPI para la refrenda.`,
        }
      );
    }, 2800);

    return () => clearTimeout(timer);
  }, [
    firmaModalOpen,
    firmaEstado,
    solicitudAFirmar,
    activeRevisor.nombre,
    conclusionesInforme,
    aprobarNormativa,
  ]);

  const handleConsultarEstadoFirmaManual = () => {
    if (isConsultandoFirma || firmaEstado === "firmado" || !solicitudAFirmar)
      return;
    setIsConsultandoFirma(true);
    setTimeout(() => {
      const now = new Date();
      const fechaHoraFormatted = `${now.toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })} ${now.toLocaleTimeString("es-EC", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`;

      setFirmaTimestamp(fechaHoraFormatted);
      setFirmaEstado("firmado");
      setIsConsultandoFirma(false);

      const revisorNombre =
        solicitudAFirmar.revisorNormativoAsignado || activeRevisor.nombre;

      aprobarNormativa(solicitudAFirmar.id, {
        revisor: revisorNombre,
        director: "Dr. Roberto Méndez (Director DPI)",
        fundamento:
          conclusionesInforme.trim() ||
          "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
      });

      toast.success(
        "1.ª Firma electrónica validada con éxito en FirmaEC (SOL-08)",
        {
          description: `El informe de ${solicitudAFirmar.id} fue suscrito por ${revisorNombre} y remitido al Director DPI para la refrenda.`,
        }
      );
    }, 800);
  };

  const handleCerrarModalFirma = () => {
    setFirmaModalOpen(false);
    setSolicitudAFirmar(null);
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

  const isElaborarInformesView =
    tabParam === "informes" || estadoFilter === "PENDIENTES_FIRMA_DIRECTOR";

  return (
    <WireframeDashboardLayout
      activeMenu={
        isElaborarInformesView
          ? "informes-elaborados-dpi"
          : "revision-normativa-fuentes"
      }
      currentRole="EQ_DPI"
      currentUser={{
        ...MOCK_USERS_BY_ROLE.EQ_DPI,
        name: activeRevisor.nombre,
        roleTitle: activeRevisor.cargo,
      }}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        {
          label: "Solicitudes de acceso a fuentes",
          href: "/revision-normativa/fuentes",
        },
        {
          label: isElaborarInformesView
            ? "Elaborar informes DPI"
            : "Evaluar datos confidenciales",
        },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* CABECERA HOMOLOGADA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="space-y-1.5">
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
                {isElaborarInformesView
                  ? "Elaborar informes DPI"
                  : "Evaluar datos confidenciales"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed font-normal">
                {isElaborarInformesView
                  ? "Genera en la plataforma los informes técnicos-jurídicos favorables de datos confidenciales y suscribe la primera firma electrónica con FirmaEC para remitirlos al Director DPI."
                  : "Evalúa la finalidad de uso y justificación jurídica de los campos confidenciales en las solicitudes asignadas para emitir observaciones o aprobar su procedencia."}
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
                      setActiveRevisorId(
                        typeof val === "string" ? val : val.value
                      );
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
                          value={{
                            value: r.id,
                            label: `${r.nombre} (${r.cargo})`,
                          }}
                          className="text-caption"
                        >
                          <div>
                            <p className="font-semibold text-foreground">
                              {r.nombre}
                            </p>
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
            </div>
          </div>

          {/* TARJETAS KPI INTERACTIVAS (Idénticas a Cuentas Internas y Asignación DPI) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
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
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "ALL"
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
                      estadoFilter === "ALL"
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                    )}
                  >
                    <Scale className="size-5" />
                  </div>
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Total DPI
                  </Badge>
                </div>
                <div className="space-y-0.5 text-left w-full">
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                    Asignados a mi bandeja
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {metricas.total}
                  </p>
                </div>
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
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PENDIENTES_DICTAMEN"
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
                      estadoFilter === "PENDIENTES_DICTAMEN"
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
                    SOL-07
                  </Badge>
                </div>
                <div className="space-y-0.5 text-left w-full">
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                    Pendientes de dictamen
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {metricas.pendientesDictamen}
                  </p>
                </div>
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
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PENDIENTES_FIRMA_DIRECTOR"
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
                      estadoFilter === "PENDIENTES_FIRMA_DIRECTOR"
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
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    1.ª Firma SOL-08
                  </Badge>
                </div>
                <div className="space-y-0.5 text-left w-full">
                  <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                    En firma Director DPI
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {metricas.pendientesFirmaDirector}
                  </p>
                </div>
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
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "Aprobada por Normatividad"
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
                      estadoFilter === "Aprobada por Normatividad"
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
                    Doble firma OK
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
              {/* VISTA TARJETAS (MÓVIL O MODO TARJETAS — Idéntica a Cuentas Internas y Asignación DPI) */}
              <div
                className={cn(
                  "grid grid-cols-1 gap-3.5",
                  viewMode === "cards" ? "md:grid-cols-2" : "md:hidden"
                )}
              >
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

                  const cardBadgeTone =
                    solicitud.estado === "Aprobada por Normatividad"
                      ? "success"
                      : tieneInforme
                      ? "info"
                      : "warning";

                  return (
                    <InteractiveCard
                      key={solicitud.id}
                      color="default"
                      decorativeIcon={<Scale className="size-full" />}
                      decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
                      className="p-4 flex flex-col justify-between gap-3.5 bg-surface hover:bg-surface border-border hover:border-primary/40 shadow-2xs transition-all"
                    >
                      {/* Cabecera de la tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/revision-normativa/fuentes/${solicitud.id}`
                                )
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
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm font-bold text-foreground mt-1 truncate cursor-default">
                                  {solicitud.institucion}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent variant="surface" side="top">
                                {solicitud.institucion}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {solicitud.fuentePrincipal}
                          </p>
                        </div>
                        <Badge
                          tone={cardBadgeTone}
                          appearance="soft"
                          size="sm"
                          className="shrink-0 font-semibold text-xs"
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

                      {/* Bloque de datos estructurados */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 rounded-xl p-3 border border-border/60">
                        <div className="min-w-0">
                          <span className="text-[11px] text-muted-foreground block">
                            Campos confidenciales
                          </span>
                          <span className="font-bold text-warning truncate flex items-center gap-1 mt-0.5">
                            <Lock className="size-3 shrink-0" />
                            {camposConf.length} campo(s) LOPDP
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] text-muted-foreground block">
                            Revisor DPI
                          </span>
                          <span className="font-semibold text-foreground truncate block mt-0.5">
                            {solicitud.revisorNormativoAsignado ||
                              activeRevisor.nombre}
                          </span>
                        </div>
                        <div className="min-w-0 pt-1.5 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground block">
                            1.ª Firma (Revisor DPI)
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-semibold flex items-center gap-1 mt-0.5",
                              firmaRevisorOk ? "text-success" : "text-warning"
                            )}
                          >
                            {firmaRevisorOk ? (
                              <>
                                <Check className="size-3 font-bold" />
                                Firmado
                              </>
                            ) : (
                              <>
                                <Clock className="size-3" />
                                Pendiente
                              </>
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 pt-1.5 border-t border-border/50">
                          <span className="text-[10px] text-muted-foreground block">
                            2.ª Firma (Director DPI)
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-semibold flex items-center gap-1 mt-0.5",
                              firmaDirectorOk ? "text-success" : "text-muted-foreground"
                            )}
                          >
                            {firmaDirectorOk ? (
                              <>
                                <Check className="size-3 font-bold" />
                                Firmado
                              </>
                            ) : (
                              <>
                                <Clock className="size-3" />
                                En espera
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción homologados con altura h-9 */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(
                              `/revision-normativa/fuentes/${solicitud.id}`
                            );
                          }}
                          className="w-full justify-center gap-1.5 font-semibold bg-surface/80 text-xs h-9 rounded-xl"
                        >
                          <Eye className="size-3.5 text-primary" />
                          <span>Ver expediente</span>
                        </Button>

                        {canDictaminar ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              router.push(
                                `/revision-normativa/fuentes/${solicitud.id}`
                              );
                            }}
                            className="w-full justify-center gap-1.5 font-semibold text-xs h-9 rounded-xl shadow-xs"
                          >
                            <FileSignature className="size-3.5" />
                            <span>Emitir informe</span>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              router.push(
                                `/revision-normativa/fuentes/${solicitud.id}`
                              );
                            }}
                            className="w-full justify-center gap-1.5 font-semibold text-xs h-9 rounded-xl text-info hover:text-info hover:bg-info/10"
                          >
                            <FileText className="size-3.5" />
                            <span>Ver informe DPI</span>
                          </Button>
                        )}
                      </div>
                    </InteractiveCard>
                  );
                })}
              </div>

              {/* VISTA DESKTOP: TABLA ESTÁNDAR (Idéntica a Cuentas Internas y Asignación DPI) */}
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
                            className="group transition-colors cursor-pointer hover:bg-muted/40"
                            onClick={() =>
                              router.push(
                                `/revision-normativa/fuentes/${solicitud.id}`
                              )
                            }
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/revision-normativa/fuentes/${solicitud.id}`
                                    );
                                  }}
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
                              <span className="text-[11px] text-muted-foreground truncate block max-w-44">
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
                                      1.ª Revisor:{" "}
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
                                      2.ª Director:{" "}
                                      {firmaDirectorOk
                                        ? "Firmado"
                                        : "En espera firma"}
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
                                {/* 1. Ver expediente e informe DPI */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                          `/revision-normativa/fuentes/${solicitud.id}`
                                        );
                                      }}
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/revision-normativa/fuentes/${solicitud.id}`
                                          );
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/revision-normativa/fuentes/${solicitud.id}`
                                          );
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

                                {/* 4. Ver informe emitido si ya existe */}
                                {tieneInforme && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(
                                            `/revision-normativa/fuentes/${solicitud.id}`
                                          );
                                        }}
                                        className="text-info hover:bg-info/10"
                                        aria-label="Ver informe DPI emitido"
                                      >
                                        <FileText className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent variant="surface" side="top">
                                      Ver informe DPI emitido
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

              {/* PAGINACIÓN HOMOLOGADA CON CUENTAS-INTERNAS Y ASIGNACIÓN DPI */}
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

        {/* MODAL 1: EXPEDIENTE DPI (HOMOLOGADO CON PESTAÑAS PILLS) */}
        <Dialog
          open={Boolean(solicitudReviewing) && !isAprobarModalOpen && !isObservarModalOpen && !firmaModalOpen}
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
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
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
                          : solicitudReviewing.informeNormativa
                          ? "info"
                          : "warning"
                      }
                      appearance="soft"
                      size="sm"
                      className="rounded-full font-semibold gap-1"
                    >
                      <Lock className="size-3" />
                      {solicitudReviewing.estado === "En revisión normativa"
                        ? solicitudReviewing.informeNormativa
                          ? "En firma Director DPI"
                          : "En revisión DPI"
                        : solicitudReviewing.estado ===
                          "Aprobada por Normatividad"
                        ? "Aprobada por DPI"
                        : solicitudReviewing.estado}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* TABS SEGMENTADAS TIPO PILLS */}
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
                      {
                        id: "historial",
                        label: "Historial y trazabilidad",
                        icon: History,
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
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0 modal-scroll-area">
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
                          .map((campo) => {
                            const isSensible =
                              campo.esSensible ||
                              campo.etiquetaSensibilidad === "Sensible";
                            return (
                              <div
                                key={campo.id || campo.nombreCampo}
                                className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 space-y-2.5 text-caption"
                              >
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-foreground text-xs">
                                    {campo.nombre || campo.nombreCampo}
                                  </span>
                                  <div className="inline-flex items-center gap-1.5 flex-wrap">
                                    <Badge
                                      tone="warning"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1 inline-flex font-semibold"
                                    >
                                      <Lock className="size-3" />
                                      Confidencial
                                    </Badge>
                                    {isSensible && (
                                      <Badge
                                        tone="danger"
                                        appearance="soft"
                                        size="sm"
                                        className="gap-1 inline-flex font-semibold"
                                      >
                                        <ShieldAlert className="size-3" />
                                        Sensible · LOPDP
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {isSensible && (
                                  <div className="p-2.5 rounded-lg border border-danger/30 bg-danger/5 flex items-center gap-2 text-xs text-foreground">
                                    <ShieldAlert className="size-4 text-danger shrink-0" />
                                    <span>
                                      <strong>Dato Confidencial Sensible:</strong>{" "}
                                      sujeto a tratamiento especial según Ley
                                      Orgánica de Protección de Datos Personales
                                      (LOPDP).
                                    </span>
                                  </div>
                                )}

                                <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                    Finalidad de uso declarada:
                                  </span>
                                  <p className="text-foreground text-caption leading-relaxed">
                                    {campo.finalidad}
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                  <span className="text-[11px] font-bold text-warning uppercase">
                                    Justificación jurídica presentada (LOPDP):
                                  </span>
                                  <p className="text-foreground text-caption leading-relaxed">
                                    {campo.justificacionConfidencial ||
                                      campo.fundamento ||
                                      "Base legal conforme Ley Orgánica de Protección de Datos Personales (LOPDP)."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}

                  {tabRevisionDpi === "informe" && (
                    <div className="space-y-3">
                      {solicitudReviewing.informeNormativa ? (
                        <div className="p-4 rounded-2xl border border-border bg-surface space-y-3 text-caption">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                              <FileText className="size-4 text-primary" />
                              {solicitudReviewing.informeNormativa.numero} -{" "}
                              {solicitudReviewing.informeNormativa.titulo}
                            </span>
                            <span className="font-mono text-muted-foreground text-[11px]">
                              {solicitudReviewing.informeNormativa.fechaEmision}
                            </span>
                          </div>
                          <p className="text-muted-foreground italic bg-muted/20 p-3 rounded-xl border border-border/60">
                            &ldquo;
                            {solicitudReviewing.informeNormativa.fundamento}
                            &rdquo;
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
                            <div className="p-3 rounded-xl bg-success/10 border border-success/30 space-y-1">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                1.ª Firma (Revisor DPI)
                              </span>
                              <div className="flex items-center gap-1.5 text-success font-bold text-xs">
                                <CheckCircle2 className="size-4 text-success" />
                                <span>
                                  {
                                    solicitudReviewing.informeNormativa
                                      .revisorNombre
                                  }
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground block font-mono">
                                Suscrito digitalmente con FirmaEC
                              </span>
                            </div>

                            <div
                              className={cn(
                                "p-3 rounded-xl border space-y-1",
                                solicitudReviewing.informeNormativa
                                  .firmadoDirector
                                  ? "bg-success/10 border-success/30"
                                  : "bg-warning/10 border-warning/30"
                              )}
                            >
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                2.ª Firma (Director DPI)
                              </span>
                              {solicitudReviewing.informeNormativa
                                .firmadoDirector ? (
                                <>
                                  <div className="flex items-center gap-1.5 text-success font-bold text-xs">
                                    <CheckCircle2 className="size-4 text-success" />
                                    <span>
                                      {
                                        solicitudReviewing.informeNormativa
                                          .directorNombre
                                      }
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground block font-mono">
                                    Refrendado con FirmaEC
                                  </span>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5 text-warning font-bold text-xs">
                                    <Clock className="size-4 text-warning" />
                                    <span>Pendiente refrenda</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground block">
                                    En bandeja del Director DPI (
                                    /revision-normativa/asignacion)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 rounded-2xl border border-dashed border-border text-center text-caption text-muted-foreground space-y-3">
                          <FileSignature className="size-8 mx-auto text-muted-foreground/60" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              Aún no se ha generado el Informe de Aprobación DPI
                            </p>
                            <p className="text-caption text-muted-foreground mt-1 max-w-md mx-auto">
                              Para dictaminar favorablemente los campos confidenciales y remitir el informe al Director DPI, utilice el botón de emisión y primera firma.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {tabRevisionDpi === "historial" && (
                    <div className="space-y-3">
                      {(solicitudReviewing.historial || []).map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-foreground">
                              {ev.evento}
                            </span>
                            <span className="font-mono text-muted-foreground text-[11px]">
                              {ev.fecha}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-caption">
                            <strong>Actor:</strong> {ev.actor}
                          </p>
                          {ev.detalle && (
                            <p className="text-caption text-foreground/80 leading-relaxed pt-1 border-t border-border/40">
                              {ev.detalle}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* FOOTER DEL MODAL EXPEDIENTE */}
                <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSolicitudReviewing(null)}
                    className="h-9 px-5 text-xs font-semibold rounded-xl cursor-pointer"
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
                          className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5 text-warning hover:text-warning hover:bg-warning/10"
                        >
                          <AlertTriangle className="size-3.5 text-warning" />
                          <span>Observar (3 días hábiles PAR-13)</span>
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsAprobarModalOpen(true)}
                          className="h-9 px-4 text-xs rounded-xl font-semibold gap-1.5 shadow-xs"
                        >
                          <FileSignature className="size-3.5" />
                          <span>Generar y firmar informe DPI (1.ª Firma)</span>
                        </Button>
                      </div>
                    )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL 2: OBSERVAR JURÍDICAMENTE EN DPI (3 DÍAS HÁBILES PAR-13) */}
        <Dialog
          open={isObservarModalOpen}
          onOpenChange={setIsObservarModalOpen}
        >
          <DialogContent
            variant="warning"
            size="lg"
            className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
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
                variant="neutral"
                size="sm"
                onClick={() => setIsObservarModalOpen(false)}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={handleConfirmarObservacionJuridica}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-bold shadow-xs"
              >
                Notificar Subsanación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 3: ELABORAR DICTAMEN JURÍDICO Y PROCEDER A FIRMA (SOL-08) */}
        <Dialog open={isAprobarModalOpen} onOpenChange={setIsAprobarModalOpen}>
          <DialogContent
            variant="success"
            size="lg"
            className="p-6 sm:p-7 max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
            icon={<CheckCircle2 className="size-10 text-success stroke-[2px]" />}
          >
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="font-heading text-xl font-bold text-foreground">
                Generar Informe de Aprobación DPI (1.ª Firma)
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-md mx-auto">
                Redacta las conclusiones del informe jurídico favorable y continúa con la suscripción electrónica FirmaEC (SOL-08).
              </DialogDescription>
            </DialogHeader>

            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left text-caption">
              <label className="font-semibold text-foreground block">
                Conclusiones y Dictamen de Protección de la Información (LOPDP):
              </label>
              <Textarea
                rows={4}
                value={conclusionesInforme}
                onChange={(e) => setConclusionesInforme(e.target.value)}
                placeholder="Se determina que el tratamiento de los datos confidenciales solicitados cuenta con base jurídica habilitante conforme a la LOPDP y cumple con el principio de finalidad y proporcionalidad..."
                className="text-caption bg-background rounded-xl"
              />

              <div className="p-3.5 rounded-2xl bg-success/10 border border-success/30 text-caption space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" />
                  <span>Flujo de doble firma electrónica en DPI (SOL-08)</span>
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  1. Al pulsar continuar, se validará la <strong>1.ª firma con FirmaEC</strong> del Revisor DPI ({activeRevisor.nombre}).<br />
                  2. El informe pasará de forma inmediata a la bandeja del <strong>Director DPI</strong> (<code>/revision-normativa/asignacion</code>) para la <strong>2.ª firma de refrenda</strong>.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setIsAprobarModalOpen(false)}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  if (solicitudReviewing) {
                    handleIniciarFirmaRevisor(solicitudReviewing);
                  }
                }}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-bold shadow-xs gap-1.5"
              >
                <Sparkles className="size-4" />
                <span>Continuar a FirmaEC (1.ª Firma)</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 4: SIMULACIÓN EN VIVO DE FIRMAEC REVISOR DPI (Homologado a RegistroInstitucion) */}
        <Dialog
          open={firmaModalOpen}
          onOpenChange={(open) => {
            if (!open) handleCerrarModalFirma();
          }}
        >
          <DialogContent
            variant="standard"
            size="lg"
            className="p-6 sm:p-7 max-w-xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
          >
            {solicitudAFirmar && (
              <div className="space-y-4 text-left">
                {/* 1. Cabecera */}
                <DialogHeader className="gap-2 text-left items-start pb-2 border-b border-border/50 shrink-0">
                  <div className="flex items-start justify-between w-full gap-3 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <FileSignature className="size-6 text-primary stroke-[2.2px]" />
                      </div>
                      <div>
                        <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground leading-tight">
                          Firma Electrónica del Dictamen DPI (FirmaEC)
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
                          Suscripción digital oficial del Revisor de Protección de la Información (1.ª Firma requerida - SOL-08).
                        </DialogDescription>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                {/* 2. Tarjeta resumen del expediente e informe */}
                <div className="p-3.5 bg-surface rounded-2xl border border-border/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="size-4 text-primary shrink-0" />
                      <span className="font-bold text-foreground truncate">
                        {solicitudAFirmar.institucion}
                      </span>
                    </div>
                    <Badge
                      tone="primary"
                      appearance="outline"
                      size="sm"
                      className="font-mono text-[10px]"
                    >
                      {solicitudAFirmar.id}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Expediente y fuente:
                      </span>
                      <strong className="text-foreground font-semibold truncate block">
                        {solicitudAFirmar.fuentePrincipal}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Revisor DPI firmante:
                      </span>
                      <strong className="text-foreground font-semibold truncate block">
                        {solicitudAFirmar.revisorNormativoAsignado ||
                          activeRevisor.nombre}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Estados Dinámicos: Validando con FirmaEC vs Firmado con Éxito */}
                {firmaEstado === "validando" ? (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* Alerta de notificación por correo (idéntica a registro-institución) */}
                    <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-primary">
                        <Mail className="size-4 shrink-0" />
                        <span>Notificación de firma enviada al correo institucional</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Se ha remitido la solicitud de suscripción digital al correo institucional{" "}
                        <strong className="text-foreground font-semibold">
                          {activeRevisor.email}
                        </strong>{" "}
                        (Revisor DPI).
                      </p>
                      <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5 pt-1">
                        <RefreshCw className="size-3.5 animate-spin shrink-0" />
                        <span>
                          Revisa tu correo. Cuando firmes con FirmaEC o Token criptográfico, el estado de esta pantalla se actualizará automáticamente.
                        </span>
                      </p>
                    </div>

                    {/* Barra interactiva de validación en vivo */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-surface border border-border shadow-2xs">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <LoadingSpinner size="sm" className="size-4 text-primary shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Validando 1.ª firma con FirmaEC en vivo...
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Comprobando certificado digital en la pasarela gubernamental oficial.
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleConsultarEstadoFirmaManual}
                        disabled={isConsultandoFirma}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto shrink-0 h-9 rounded-xl"
                      >
                        <RefreshCw
                          className={cn(
                            "size-3.5",
                            isConsultandoFirma && "animate-spin"
                          )}
                        />
                        <span>
                          {isConsultandoFirma
                            ? "Consultando..."
                            : "Consultar estado ahora"}
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    {/* Alerta de éxito con detalles del certificado (idéntica a registro-institución) */}
                    <Alert
                      variant="success"
                      icon={<CheckCircle2 className="size-4" />}
                      title="1.ª Firma electrónica validada con éxito en FirmaEC"
                    >
                      <div className="space-y-2.5 w-full">
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                          El informe favorable de confidencialidad ha sido suscrito digitalmente de forma válida por{" "}
                          <strong className="text-foreground font-semibold">
                            {solicitudAFirmar.revisorNormativoAsignado ||
                              activeRevisor.nombre}
                          </strong>
                          . La primera firma oficial ha quedado registrada en el expediente.
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs w-full">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-2xs text-foreground font-mono text-[11px]">
                            <span className="font-sans font-medium text-muted-foreground">
                              Fecha y Hora:
                            </span>
                            <strong className="text-foreground font-bold">
                              {firmaTimestamp || "28/10/2026 13:30:00"}
                            </strong>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-2xs text-foreground font-mono text-[11px]">
                            <span className="font-sans font-medium text-muted-foreground">
                              Serie Certificado / ID:
                            </span>
                            <strong className="text-foreground font-bold">
                              {firmaCertId || "FEC-REV-2026-802142"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </Alert>

                    {/* Banner de trámite remitido al Director DPI */}
                    <div className="p-3.5 rounded-2xl border border-primary/30 bg-primary/5 space-y-1 text-xs">
                      <div className="flex items-center gap-2 font-bold text-primary text-xs">
                        <ShieldCheck className="size-4 shrink-0" />
                        <span>
                          Informe remitido al Director DPI para segunda firma conjunta (SOL-08)
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        El informe ha sido enviado a la bandeja del Director de Protección de la Información en{" "}
                        <code className="text-primary font-mono text-[10px]">
                          /revision-normativa/asignacion
                        </code>
                        . Al completar la segunda firma, el expediente quedará formalmente aprobado.
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Footer con acciones */}
                <DialogFooter className="pt-3 w-full flex items-center justify-between border-t border-border/50 shrink-0 mt-2">
                  <Button
                    type="button"
                    variant="neutral"
                    size="sm"
                    onClick={handleCerrarModalFirma}
                    className="h-9 px-5 text-xs rounded-xl font-semibold cursor-pointer"
                  >
                    {firmaEstado === "firmado" ? "Cerrar" : "Cancelar"}
                  </Button>

                  {firmaEstado === "validando" ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleConsultarEstadoFirmaManual}
                      disabled={isConsultandoFirma}
                      className="font-semibold gap-1.5 h-9 px-5 text-xs rounded-xl shadow-xs"
                    >
                      <RefreshCw
                        className={cn(
                          "size-3.5",
                          isConsultandoFirma && "animate-spin"
                        )}
                      />
                      <span>Simular validación inmediata</span>
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleCerrarModalFirma}
                      className="font-semibold gap-1.5 h-9 px-5 text-xs rounded-xl shadow-xs"
                    >
                      <Check className="size-4" />
                      <span>Aceptar y ver bandeja</span>
                    </Button>
                  )}
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </WireframeDashboardLayout>
  );
}
