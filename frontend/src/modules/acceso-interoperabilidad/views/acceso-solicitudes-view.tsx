"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  ArrowLeft,
  Eye,
  Edit,
  X,
  Receipt,
  FileCheck2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  UploadCloud,
  Building2,
  ShieldCheck,
  Check,
  Info,
  KeyRound,
  Scale,
  FileSignature,
  FolderKanban,
  Database,
  Layers,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
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
import { toast } from "sonner";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";

import {
  MOCK_USERS_BY_ROLE,
  type UserRole,
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { isProviderInstitution } from "@/modules/fuentes/data/fuentes-data";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import {
  WireframeTour,
  TourStep,
} from "@/components/layout/wireframes/wireframe-tour";
import { CredencialTecnicaModal } from "@/modules/acceso-interoperabilidad/components/credencial-tecnica-modal";
import {
  Combobox,
  ComboboxInput,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";

const roleOptions = [
  { value: "COORDINADOR_SINARP", label: "1. Coordinador SINARP", route: "/acceso-interoperabilidad/solicitudes" },
  { value: "DIR_GESTION", label: "2. Director de Gestión", route: "/acceso-interoperabilidad/asignacion" },
  { value: "EQ_GESTION", label: "3. Revisor de Gestión", route: "/revision-gestion" },
  { value: "DIR_NORMATIVA", label: "4. Director DPI", route: "/revision-normativa/asignacion" },
  { value: "EQ_NORMATIVA", label: "5. Revisor DPI", route: "/revision-normativa/fuentes" },
  { value: "APROBADOR", label: "Aprobador (Entidad Emisora)", route: "/acceso-interoperabilidad/solicitudes" },
  { value: "FACTURACION", label: "Facturación (DINARP)", route: "/acceso-interoperabilidad/solicitudes" },
];

type KpiFilterGroup = "ALL" | "HABILITADAS" | "EN_REVISION" | "ACCION_REQUERIDA";

export function AccesoSolicitudesView() {
  const router = useRouter();
  const { activeUser, setRole: setStoreRole } = useAuthStore();
  const role = (activeUser?.role as UserRole) || ("COORDINADOR_SINARP" as UserRole);
  const effectiveUser = activeUser || MOCK_USERS_BY_ROLE[role];
  const isProvider =
    isProviderInstitution(effectiveUser?.institution) ||
    (effectiveUser?.roleTitle?.toLowerCase().includes("proveedor") ?? false) ||
    (effectiveUser?.roleTitle?.toLowerCase().includes("emisor") ?? false);

  const { solicitudes, validarPagoConCur, simularPagoRealizado } =
    useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [institucionFilter, setInstitucionFilter] = useState("ALL");
  const [estadoFilter, setEstadoFilter] = useState("ALL");
  const [proyectoFilter, setProyectoFilter] = useState("ALL");
  const [fuenteFilter, setFuenteFilter] = useState("ALL");
  const [responsableFilter, setResponsableFilter] = useState("ALL");
  const [fechaFilter, setFechaFilter] = useState("ALL");
  const [kpiGroup, setKpiGroup] = useState<KpiFilterGroup>("ALL");

  // Estados de búsqueda interna para ComboboxInput (UI Kit)
  const [estadoSearch, setEstadoSearch] = useState("");
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [proyectoSearch, setProyectoSearch] = useState("");
  const [fuenteSearch, setFuenteSearch] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modales de interacción
  const [modalFactura, setModalFactura] = useState<SolicitudAcceso | null>(null);
  const [modalCur, setModalCur] = useState<SolicitudAcceso | null>(null);
  const [modalValidarPago, setModalValidarPago] =
    useState<SolicitudAcceso | null>(null);
  const [modalConfirmarValidacion, setModalConfirmarValidacion] =
    useState<SolicitudAcceso | null>(null);
  const [modalCredenciales, setModalCredenciales] =
    useState<SolicitudAcceso | null>(null);
  const [curFile, setCurFile] = useState<File | null>(null);
  const [curFileError, setCurFileError] = useState(false);
  const [numeroCurInput, setNumeroCurInput] = useState("");

  // Sincronizar con ?tab=habilitadas ("Mis accesos") desde el sidebar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "habilitadas") {
        setKpiGroup("HABILITADAS");
      }
    }
  }, []);

  // Limpiar filtros al cambiar rol
  useEffect(() => {
    setSearchTerm("");
    setInstitucionFilter("ALL");
    setEstadoFilter("ALL");
    setProyectoFilter("ALL");
    setFuenteFilter("ALL");
    setResponsableFilter("ALL");
    setFechaFilter("ALL");
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "habilitadas") {
      setKpiGroup("HABILITADAS");
    } else {
      setKpiGroup("ALL");
    }
    setEstadoSearch("");
    setInstitucionSearch("");
    setProyectoSearch("");
    setFuenteSearch("");
    setCurrentPage(1);
  }, [role]);

  // Solicitudes visibles según rol
  const visibleSolicitudes = useMemo(() => {
    if (role === "APROBADOR") {
      const priorizadas = solicitudes.filter((s) => {
        const est = String(s.estado);
        return (
          est === "Por revisar" ||
          est === "En revisión" ||
          est === "Pendiente de aprobación" ||
          est === "Reenviada" ||
          est === "Reenviada para aprobación" ||
          est === "Aprobada" ||
          est === "Rechazada" ||
          est === "Con observaciones" ||
          est === "Acceso generado"
        );
      });
      return [...priorizadas].sort((a, b) => {
        const orderA =
          a.estado.includes("revis") || a.estado.includes("Reenviada") ? 0 : 1;
        const orderB =
          b.estado.includes("revis") || b.estado.includes("Reenviada") ? 0 : 1;
        return orderA - orderB;
      });
    }

    if (role === "FACTURACION") {
      return solicitudes.filter(
        (s) =>
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago pendiente" ||
            s.estado === "Pendiente de validación de pago" ||
            s.estado === "Pago en validación" ||
            s.estado === "Pago validado" ||
            s.estado === "Pago verificado" ||
            s.estado === "Acceso generado")
      );
    }

    return solicitudes;
  }, [role, solicitudes]);

  // Clasificadores de estado para KPIs de Coordinador SINARP
  const isEstadoHabilitado = (est: string) =>
    est === "Acceso habilitado" || est === "Acceso generado";

  const isEstadoAccionRequerida = (est: string) =>
    est === "Borrador" ||
    est === "Requiere corrección" ||
    est === "Observada" ||
    est === "Rechazada" ||
    est === "Con observaciones" ||
    est === "Pendiente de firma" ||
    est === "Pendiente de pago" ||
    est === "Pago pendiente";

  const isEstadoEnRevision = (est: string) =>
    !isEstadoHabilitado(est) &&
    !isEstadoAccionRequerida(est) &&
    est !== "Cerrada" &&
    est !== "Cerrada por vencimiento";

  // KPIs para Tarjetas de Resumen (UI Kit)
  const kpis = useMemo(() => {
    const total = visibleSolicitudes.length;
    const habilitadas = visibleSolicitudes.filter((s) =>
      isEstadoHabilitado(String(s.estado))
    ).length;
    const enRevision = visibleSolicitudes.filter((s) =>
      isEstadoEnRevision(String(s.estado))
    ).length;
    const accionRequerida = visibleSolicitudes.filter((s) =>
      isEstadoAccionRequerida(String(s.estado))
    ).length;
    return { total, habilitadas, enRevision, accionRequerida };
  }, [visibleSolicitudes]);

  // Listas para filtros dinámicos
  const institucionesList = useMemo(() => {
    return Array.from(
      new Set(visibleSolicitudes.map((s) => s.institucion))
    ).filter(Boolean);
  }, [visibleSolicitudes]);

  const estadosList = useMemo(() => {
    if (role === "FACTURACION") {
      return [
        "Pago pendiente",
        "Pendiente de validación de pago",
        "Pago validado",
        "Acceso generado",
      ];
    }
    if (role === "APROBADOR") {
      return [
        "Por revisar",
        "Reenviada",
        "Aprobada",
        "Rechazada",
        "Acceso generado",
      ];
    }
    return Array.from(new Set(visibleSolicitudes.map((s) => s.estado))).filter(
      Boolean
    );
  }, [role, visibleSolicitudes]);

  const proyectosList = useMemo(() => {
    return Array.from(
      new Set(visibleSolicitudes.map((s) => s.proyectoNombre).filter(Boolean))
    ) as string[];
  }, [visibleSolicitudes]);

  const fuentesList = useMemo(() => {
    return Array.from(
      new Set(
        visibleSolicitudes
          .map((s) => s.fuentePrincipal || s.fuentes?.[0]?.nombre)
          .filter(Boolean)
      )
    ) as string[];
  }, [visibleSolicitudes]);

  const institucionOptions = useMemo(
    () => [
      { value: "ALL", label: "Todas las instituciones" },
      ...institucionesList.map((inst) => ({ value: inst, label: inst })),
    ],
    [institucionesList]
  );

  const proyectoOptions = useMemo(
    () => [
      { value: "ALL", label: "Todos los proyectos" },
      ...proyectosList.map((p) => ({ value: p, label: p })),
    ],
    [proyectosList]
  );

  const fuenteOptions = useMemo(
    () => [
      { value: "ALL", label: "Todas las fuentes" },
      ...fuentesList.map((f) => ({ value: f, label: f })),
    ],
    [fuentesList]
  );

  const estadoOptions = useMemo(
    () => [
      { value: "ALL", label: "Todos los estados" },
      ...estadosList.map((est) => ({ value: est, label: est })),
    ],
    [estadosList]
  );

  const filteredEstadosForFilter = useMemo(() => {
    const selectedLabel = estadoOptions.find((e) => e.value === estadoFilter)?.label;
    if (!estadoSearch.trim() || estadoSearch === selectedLabel) {
      return estadoOptions;
    }
    const q = estadoSearch.toLowerCase();
    return estadoOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [estadoOptions, estadoSearch, estadoFilter]);

  const filteredInstitucionesForFilter = useMemo(() => {
    const selectedLabel = institucionOptions.find((i) => i.value === institucionFilter)?.label;
    if (!institucionSearch.trim() || institucionSearch === selectedLabel) {
      return institucionOptions;
    }
    const q = institucionSearch.toLowerCase();
    return institucionOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [institucionOptions, institucionSearch, institucionFilter]);

  const filteredProyectosForFilter = useMemo(() => {
    const selectedLabel = proyectoOptions.find((p) => p.value === proyectoFilter)?.label;
    if (!proyectoSearch.trim() || proyectoSearch === selectedLabel) {
      return proyectoOptions;
    }
    const q = proyectoSearch.toLowerCase();
    return proyectoOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [proyectoOptions, proyectoSearch, proyectoFilter]);

  const filteredFuentesForFilter = useMemo(() => {
    const selectedLabel = fuenteOptions.find((f) => f.value === fuenteFilter)?.label;
    if (!fuenteSearch.trim() || fuenteSearch === selectedLabel) {
      return fuenteOptions;
    }
    const q = fuenteSearch.toLowerCase();
    return fuenteOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [fuenteOptions, fuenteSearch, fuenteFilter]);

  const handleSetEstadoFilter = (val: string) => {
    setEstadoFilter(val);
    setKpiGroup("ALL");
    const opt = estadoOptions.find((e) => e.value === val);
    setEstadoSearch(val === "ALL" ? "" : opt?.label || val);
    setCurrentPage(1);
  };

  const handleSetInstitucionFilter = (val: string) => {
    setInstitucionFilter(val);
    const opt = institucionOptions.find((i) => i.value === val);
    setInstitucionSearch(val === "ALL" ? "" : opt?.label || val);
    setCurrentPage(1);
  };

  const handleSetProyectoFilter = (val: string) => {
    setProyectoFilter(val);
    const opt = proyectoOptions.find((p) => p.value === val);
    setProyectoSearch(val === "ALL" ? "" : opt?.label || val);
    setCurrentPage(1);
  };

  const handleSetFuenteFilter = (val: string) => {
    setFuenteFilter(val);
    const opt = fuenteOptions.find((f) => f.value === val);
    setFuenteSearch(val === "ALL" ? "" : opt?.label || val);
    setCurrentPage(1);
  };

  const handleSetKpiGroup = (group: KpiFilterGroup) => {
    setKpiGroup(group);
    setEstadoFilter("ALL");
    setEstadoSearch("");
    setCurrentPage(1);
  };

  const filteredSolicitudes = useMemo(() => {
    return visibleSolicitudes.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.proyectoNombre &&
          s.proyectoNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.servicioPrincipal &&
          s.servicioPrincipal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.fuentePrincipal &&
          s.fuentePrincipal.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchInstitucion =
        institucionFilter === "ALL" || s.institucion === institucionFilter;

      const matchProyecto =
        proyectoFilter === "ALL" || s.proyectoNombre === proyectoFilter;

      const fuenteNombre = s.fuentePrincipal || s.fuentes?.[0]?.nombre || "";
      const matchFuente =
        fuenteFilter === "ALL" || fuenteNombre === fuenteFilter;

      let matchKpi = true;
      const est = String(s.estado);
      if (kpiGroup === "HABILITADAS") {
        matchKpi = isEstadoHabilitado(est);
      } else if (kpiGroup === "EN_REVISION") {
        matchKpi = isEstadoEnRevision(est);
      } else if (kpiGroup === "ACCION_REQUERIDA") {
        matchKpi = isEstadoAccionRequerida(est);
      }

      let matchEstado = true;
      if (estadoFilter !== "ALL") {
        if (estadoFilter === "Por revisar" || estadoFilter === "En revisión") {
          matchEstado =
            est === "Por revisar" ||
            est === "En revisión" ||
            est === "Pendiente de aprobación";
        } else if (estadoFilter === "Reenviada") {
          matchEstado =
            est === "Reenviada" || est === "Reenviada para aprobación";
        } else if (estadoFilter === "Rechazada") {
          matchEstado =
            est === "Rechazada" ||
            est === "Con observaciones" ||
            est === "Requiere corrección" ||
            est === "Observada";
        } else if (estadoFilter === "Pendiente de validación de pago") {
          matchEstado =
            est === "Pendiente de validación de pago" ||
            est === "Pago en validación";
        } else if (estadoFilter === "Pago validado") {
          matchEstado = est === "Pago validado" || est === "Pago verificado";
        } else if (
          estadoFilter === "Acceso generado" ||
          estadoFilter === "Acceso habilitado"
        ) {
          matchEstado =
            est === "Acceso generado" || est === "Acceso habilitado";
        } else {
          matchEstado = est === estadoFilter;
        }
      }

      const matchResponsable =
        responsableFilter === "ALL" || s.responsable === responsableFilter;

      let matchFecha = true;
      if (fechaFilter === "7d") {
        const itemDate = new Date(s.fecha);
        const refDate = new Date("2026-09-23");
        const diffDays = Math.floor(
          (refDate.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
        );
        matchFecha = diffDays <= 7 && diffDays >= 0;
      } else if (fechaFilter === "30d") {
        const itemDate = new Date(s.fecha);
        const refDate = new Date("2026-09-23");
        const diffDays = Math.floor(
          (refDate.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
        );
        matchFecha = diffDays <= 30 && diffDays >= 0;
      }

      return (
        matchSearch &&
        matchInstitucion &&
        matchProyecto &&
        matchFuente &&
        matchKpi &&
        matchEstado &&
        matchResponsable &&
        matchFecha
      );
    });
  }, [
    visibleSolicitudes,
    searchTerm,
    institucionFilter,
    proyectoFilter,
    fuenteFilter,
    kpiGroup,
    estadoFilter,
    responsableFilter,
    fechaFilter,
  ]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / pageSize));
  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    institucionFilter !== "ALL" ||
    proyectoFilter !== "ALL" ||
    fuenteFilter !== "ALL" ||
    estadoFilter !== "ALL" ||
    kpiGroup !== "ALL" ||
    responsableFilter !== "ALL" ||
    fechaFilter !== "ALL";

  const clearAllFilters = () => {
    setSearchTerm("");
    setInstitucionFilter("ALL");
    setProyectoFilter("ALL");
    setFuenteFilter("ALL");
    setEstadoFilter("ALL");
    setKpiGroup("ALL");
    setResponsableFilter("ALL");
    setFechaFilter("ALL");
    setEstadoSearch("");
    setInstitucionSearch("");
    setProyectoSearch("");
    setFuenteSearch("");
    setCurrentPage(1);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Borrador":
        return (
          <Badge
            tone="neutral"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <Edit className="size-3.5 shrink-0" />
            <span>Borrador</span>
          </Badge>
        );
      case "Acceso habilitado":
      case "Acceso generado":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <ShieldCheck className="size-3.5 shrink-0" />
            <span>Acceso habilitado</span>
          </Badge>
        );
      case "Aprobada":
      case "Aprobada por Gestión":
      case "Aprobada por DPI":
      case "Pago validado":
      case "Pago verificado":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>{estado}</span>
          </Badge>
        );
      case "Habilitación técnica":
        return (
          <Badge
            tone="primary"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <Clock className="size-3.5 shrink-0" />
            <span>Habilitación técnica</span>
          </Badge>
        );
      case "Aprobación final":
        return (
          <Badge
            tone="primary"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span>Aprobación final</span>
          </Badge>
        );
      case "Pendiente de firma":
      case "Pendiente firma Director DPI":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <FileSignature className="size-3.5 shrink-0" />
            <span>{estado}</span>
          </Badge>
        );
      case "En formalización":
        return (
          <Badge
            tone="primary"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <Clock className="size-3.5 shrink-0" />
            <span>En formalización</span>
          </Badge>
        );
      case "En revisión jurídica":
      case "Pendiente de asignación en DPI":
      case "En revisión en DPI":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <Scale className="size-3.5 shrink-0" />
            <span>{estado}</span>
          </Badge>
        );
      case "Por revisar":
      case "En revisión":
      case "Pendiente de asignación":
      case "Subsanada - Pendiente de asignación":
      case "Pendiente de aprobación":
      case "Reenviada":
      case "Reenviada para aprobación":
        return (
          <Badge
            tone="info"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <Clock className="size-3.5 shrink-0" />
            <span>{estado}</span>
          </Badge>
        );
      case "Pendiente de pago":
      case "Pendiente de validación de pago":
      case "Pago en validación":
      case "Pago pendiente":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <CreditCard className="size-3.5 shrink-0" />
            <span>{estado}</span>
          </Badge>
        );
      case "Requiere corrección":
      case "Observada":
      case "Rechazada":
      case "Con observaciones":
        return (
          <Badge
            tone="danger"
            appearance="soft"
            size="sm"
            className="gap-1.5 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>Requiere corrección</span>
          </Badge>
        );
      case "Cerrada por vencimiento":
      case "Cerrada":
        return (
          <Badge
            tone="neutral"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            <span>Cerrada</span>
          </Badge>
        );
      default:
        return (
          <Badge
            tone="neutral"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            {estado}
          </Badge>
        );
    }
  };

  // Barra visual de plazo de subsanación (3 días hábiles — Exclusiva para el Coordinador SINARP)
  const renderSubsanacionPlazoBar = (s: SolicitudAcceso) => {
    if (role !== "COORDINADOR_SINARP") return null;

    const aplicaPlazo =
      s.estado === "Requiere corrección" ||
      s.estado === "Observada" ||
      s.estado === "Rechazada" ||
      s.estado === "Con observaciones" ||
      s.estado === "Cerrada" ||
      s.estado === "Cerrada por vencimiento";

    if (!aplicaPlazo) return null;

    const diasRestantes =
      s.estado === "Cerrada por vencimiento" || s.estado === "Cerrada"
        ? 0
        : typeof s.diasRestantesSubsanacion === "number"
          ? Math.max(0, Math.min(3, s.diasRestantesSubsanacion))
          : 3;

    const config =
      diasRestantes === 3
        ? {
            label: "Quedan 3 días para subsanar",
            counter: "0/3d",
            widthClass: "w-1/4",
            barClass: "bg-info",
            textClass: "text-info font-semibold",
            tooltip:
              "Plazo de subsanación activo: te quedan 3 de 3 días hábiles para subsanar las observaciones.",
          }
        : diasRestantes === 2
          ? {
              label: "Quedan 2 días para subsanar",
              counter: "1/3d",
              widthClass: "w-2/4",
              barClass: "bg-warning",
              textClass: "text-warning font-semibold",
              tooltip:
                "En plazo de subsanación: lleva 1 día transcurrido, te quedan 2 días hábiles para subsanar.",
            }
          : diasRestantes === 1
            ? {
                label: "¡Queda 1 día para subsanar!",
                counter: "2/3d",
                widthClass: "w-5/6",
                barClass: "bg-warning",
                textClass: "text-warning font-bold",
                tooltip:
                  "¡Alerta de vencimiento! Lleva 2 días transcurridos, te queda 1 día hábil para subsanar.",
              }
            : {
                label: "Plazo vencido (3/3 días)",
                counter: "3/3d",
                widthClass: "w-full",
                barClass: "bg-danger",
                textClass: "text-danger font-bold",
                tooltip:
                  "Plazo vencido: se cumplieron los 3 días hábiles sin subsanar.",
              };

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="pt-1 space-y-1 max-w-[185px] cursor-help">
            <div className="flex items-center justify-between gap-1 text-[10px] leading-none">
              <span className={cn("inline-flex items-center gap-1 truncate", config.textClass)}>
                <Clock className="size-2.5 shrink-0" />
                <span>{config.label}</span>
              </span>
              <span className="font-mono text-[9px] text-muted-foreground shrink-0">
                {config.counter}
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-sm overflow-hidden border border-border/50">
              <div
                className={cn(
                  "h-full rounded-sm transition-all",
                  config.widthClass,
                  config.barClass
                )}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          <p>{config.tooltip}</p>
          {s.fechaLimiteSubsanacion && (
            <p className="text-[10px] opacity-80 mt-0.5 font-mono">
              Fecha límite: {s.fechaLimiteSubsanacion}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  };

  // Color de acento de Tarjeta Interactiva según estado
  const getSolicitudCardColor = (
    estado: string
  ): "default" | "primary" | "info" | "warning" | "success" | "danger" => {
    if (isEstadoHabilitado(estado)) return "success";
    if (
      estado === "Requiere corrección" ||
      estado === "Observada" ||
      estado === "Rechazada" ||
      estado === "Con observaciones"
    ) {
      return "danger";
    }
    if (
      estado === "Pendiente de firma" ||
      estado === "Pendiente de pago" ||
      estado === "Pago pendiente"
    ) {
      return "warning";
    }
    if (isEstadoEnRevision(estado)) return "info";
    return "default";
  };

  // Renderizado de Tarjeta Interactiva (Mobile <md) para Coordinador SINARP
  const renderSolicitudMobileCard = (s: SolicitudAcceso) => {
    const fuenteNombre =
      s.fuentePrincipal ||
      s.fuentes?.[0]?.nombre ||
      "Dirección General de Registro Civil";
    const servicioNombre =
      s.servicioPrincipal || "Consulta de Interoperabilidad";
    const proyectoNombre = s.proyectoNombre || "Proyecto General";
    const totalCampos =
      s.camposCount ??
      s.fuentes?.reduce((acc, f) => acc + (f.campos?.length || 0), 0) ??
      2;
    const tieneConfidenciales =
      s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      ) ?? false;
    const isCerrada =
      s.estado === "Cerrada" || s.estado === "Cerrada por vencimiento";
    const isBorrador = s.estado === "Borrador";
    const isObservada =
      !isCerrada &&
      (s.estado === "Requiere corrección" ||
        s.estado === "Observada" ||
        s.estado === "Rechazada" ||
        s.estado === "Con observaciones");
    const isFirma = s.estado === "Pendiente de firma";
    const isPago =
      s.estado === "Pendiente de pago" || s.estado === "Pago pendiente";
    const isHabilitada =
      s.estado === "Acceso habilitado" || s.estado === "Acceso generado";

    return (
      <InteractiveCard
        key={s.id}
        color={getSolicitudCardColor(String(s.estado))}
        decorativeIcon={<FolderKanban className="size-full stroke-[0.8]" />}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
        className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
      >
        {/* Cabecera: ID, Proyecto y Estado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug block"
            >
              {proyectoNombre}
            </Link>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span className="font-bold text-primary">{s.id}</span>
              <span className="text-muted-foreground/40 font-bold">•</span>
              <span>{s.contrato || s.instrumento || "En formalización"}</span>
            </div>
          </div>
          <div className="shrink-0 pt-0.5 flex flex-col items-end gap-1">
            {getEstadoBadge(s.estado)}
            {renderSubsanacionPlazoBar(s)}
          </div>
        </div>

        {/* Bloque 1: Institución y Fuente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Institución y Fuente
            </span>
            <span className="text-xs font-semibold text-foreground block break-words leading-tight">
              {s.institucion}
            </span>
            <span className="text-[11px] text-muted-foreground block break-words">
              {fuenteNombre}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Alcance y Clasificación
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                tone="primary"
                appearance="outline"
                size="sm"
                className="text-[10px] font-semibold"
              >
                {totalCampos} campos
              </Badge>
              {tieneConfidenciales ? (
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-semibold gap-1"
                >
                  <AlertTriangle className="size-3" />
                  Confidencial
                </Badge>
              ) : (
                <Badge
                  tone="success"
                  appearance="soft"
                  size="sm"
                  className="text-[10px] font-semibold gap-1"
                >
                  <CheckCircle2 className="size-3" />
                  Accesible
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground block truncate">
              {servicioNombre}
            </span>
          </div>
        </div>

        {/* Bloque 2: Fechas y Responsable */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <span>
            Radicación:{" "}
            <strong className="font-mono text-foreground">
              {s.fecha.substring(0, 10)}
            </strong>
          </span>
          <span className="truncate max-w-[180px]">{s.responsable}</span>
        </div>

        {/* Bloque 3: Acciones */}
        <div className="pt-2 border-t border-border/60 w-full flex flex-wrap items-center gap-2">
          <Button
            asChild
            variant="neutral"
            size="sm"
            className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
          >
            <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
              <Eye className="size-3.5" />
              <span>Ver detalle</span>
            </Link>
          </Button>

          {isBorrador && (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
            >
              <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                <Edit className="size-3.5" />
                <span>Continuar</span>
              </Link>
            </Button>
          )}

          {isObservada && s.diasRestantesSubsanacion !== 0 && (
            <Button
              asChild
              variant="warning"
              size="sm"
              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
            >
              <Link
                href={`/acceso-interoperabilidad/solicitudes/${s.id}/corregir`}
              >
                <Edit className="size-3.5" />
                <span>Subsanar</span>
              </Link>
            </Button>
          )}

          {isFirma && (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
            >
              <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                <FileSignature className="size-3.5" />
                <span>Firmar</span>
              </Link>
            </Button>
          )}

          {isPago && (
            <Button
              asChild
              variant="primary"
              size="sm"
              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
            >
              <Link
                href={`/acceso-interoperabilidad/solicitudes/${s.id}/facturacion`}
              >
                <CreditCard className="size-3.5" />
                <span>Pagar</span>
              </Link>
            </Button>
          )}

          {isHabilitada && (
            <Button
              variant="success"
              size="sm"
              onClick={() => setModalCredenciales(s)}
              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
            >
              <KeyRound className="size-3.5" />
              <span>Credencial</span>
            </Button>
          )}
        </div>
      </InteractiveCard>
    );
  };

  // Títulos y descripciones dinámicos según rol
  const getHeaderInfo = () => {
    if (kpiGroup === "HABILITADAS") {
      return {
        title: "Mis accesos",
        desc: "Consulta los accesos habilitados de tu institución, descarga credenciales técnicas y verifica el cupo de consumo autorizado.",
        breadcrumb: "Mis accesos",
      };
    }
    if (role === "FACTURACION") {
      return {
        title: "Gestión de solicitudes pendientes de pago",
        desc: "Consulta las solicitudes privadas aprobadas, valida los pagos registrados en SIGEF y anexa los comprobantes financieros al proceso.",
        breadcrumb: "Gestión de solicitudes pendientes de pago",
      };
    }
    if (role === "APROBADOR") {
      return {
        title: "Gestión de solicitudes pendientes",
        desc: "Revisa las solicitudes de interoperabilidad pendientes de aprobación y valida la justificación y finalidad de uso de los datos solicitados.",
        breadcrumb: "Gestión de solicitudes pendientes",
      };
    }
    if (isProvider) {
      return {
        title: "Mis solicitudes de acceso",
        desc: "Consulta el estado de tus solicitudes de acceso a fuentes, realiza seguimiento a su evaluación o formalización y subsana observaciones dentro del plazo establecido.",
        breadcrumb: "Mis solicitudes de acceso",
      };
    }
    return {
      title: "Mis solicitudes de acceso",
      desc: "Consulta el estado de tus solicitudes de acceso a fuentes, realiza seguimiento a su evaluación o formalización y subsana observaciones dentro del plazo establecido.",
      breadcrumb: "Mis solicitudes de acceso",
    };
  };

  const headerInfo = getHeaderInfo();

  // Handlers para validar pago y CUR
  const handleOpenValidar = (sol: SolicitudAcceso) => {
    setModalValidarPago(sol);
    setCurFile(null);
    setCurFileError(false);
    setNumeroCurInput(`CUR-${Math.floor(Math.random() * 80000 + 10000)}`);
  };

  const handleProcederConfirmacion = () => {
    if (!curFile) {
      setCurFileError(true);
      return;
    }
    setModalConfirmarValidacion(modalValidarPago);
  };

  const handleConfirmarValidacionFinal = () => {
    if (modalConfirmarValidacion && curFile) {
      validarPagoConCur(modalConfirmarValidacion.id, {
        numeroCur: numeroCurInput || "CUR-009412",
        nombreArchivo: curFile.name,
        tamano: `${(curFile.size / (1024 * 1024)).toFixed(1)} MB`,
        usuarioResponsable: "Lcda. Patricia Morales (Facturación)",
      });
      toast.success("Pago validado y CUR anexado correctamente");
      setModalConfirmarValidacion(null);
      setModalValidarPago(null);
      setCurFile(null);
    }
  };

  // Tour guiado
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const getSteps = (): TourStep[] => {
    if (role === "FACTURACION") {
      return [
        {
          id: "step1",
          target: "#header-title",
          title: "Gestión de solicitudes pendientes de pago",
          description:
            "Visualiza solicitudes de instituciones privadas aprobadas que requieren verificación del pago en SIGEF y anexo de CUR.",
        },
        {
          id: "step2",
          target: "#table-solicitudes",
          title: "Bandeja financiera",
          description:
            "Consulta valores pendientes, emite comprobantes de factura y registra la validación de pagos acreditados.",
        },
      ];
    }
    if (role === "APROBADOR") {
      return [
        {
          id: "step1",
          target: "#header-title",
          title: "Gestión de solicitudes pendientes",
          description:
            "Revisa las solicitudes de interoperabilidad pendientes de aprobación y valida la justificación y finalidad de uso.",
        },
        {
          id: "step2",
          target: "#table-solicitudes",
          title: "Bandeja de aprobación",
          description:
            "Accede al detalle técnico de campos y justificaciones para aprobar o solicitar ajustes.",
        },
      ];
    }
    return [
      {
        id: "step1",
        target: "#header-title",
        title: "Gestión de solicitudes",
        description:
          "Crea, consulta y realiza seguimiento a las solicitudes de interoperabilidad durante todo su ciclo.",
      },
      {
        id: "step2",
        target: "#btn-nueva-solicitud",
        title: "Nueva solicitud",
        description:
          "Inicia el requerimiento institucional para consumir datos oficiales del Estado.",
      },
    ];
  };

  const steps = getSteps();

  return (
    <WireframeDashboardLayout
      activeMenu={kpiGroup === "HABILITADAS" ? "mis-accesos" : "mis-solicitudes"}
      currentUser={effectiveUser}
      currentRole={role}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        {
          label: "Solicitudes de acceso a fuentes",
          href: "/acceso-interoperabilidad/solicitudes",
        },
        {
          label: headerInfo.breadcrumb,
        },
      ]}
    >
      <WireframeTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal alineado a Administración de Usuarios */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 w-full"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col items-stretch gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1" id="header-title">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                {headerInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                {headerInfo.desc}
              </p>
            </div>

            {/* Acción de Cabecera: Nueva Solicitud SOLO para Coordinador SINARP */}
            {role === "COORDINADOR_SINARP" && (
              <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  id="btn-nueva-solicitud"
                >
                  <Link
                    href="/acceso-interoperabilidad/solicitudes/nueva"
                    className="gap-2"
                  >
                    <Plus className="size-4" />
                    <span>Nueva solicitud</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Cards de Resumen Compactas (4 Estados del Ciclo de Vida para Coordinador SINARP) */}
          {role === "COORDINADOR_SINARP" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* 1. Total Solicitudes */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => handleSetKpiGroup("ALL")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetKpiGroup("ALL");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiGroup === "ALL" && estadoFilter === "ALL"
                    ? "bg-primary/15 border-primary ring-2 ring-primary/30 shadow-xs"
                    : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full w-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiGroup === "ALL" && estadoFilter === "ALL"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground"
                      )}
                    >
                      <Layers className="size-5" />
                    </div>
                    <Badge
                      tone="primary"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      Expedientes
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Total de solicitudes
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.total}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 2. Accesos Habilitados */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleSetKpiGroup(
                    kpiGroup === "HABILITADAS" ? "ALL" : "HABILITADAS"
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetKpiGroup(
                      kpiGroup === "HABILITADAS" ? "ALL" : "HABILITADAS"
                    );
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiGroup === "HABILITADAS"
                    ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                    : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full w-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiGroup === "HABILITADAS"
                          ? "bg-success text-white shadow-xs"
                          : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                      )}
                    >
                      <ShieldCheck className="size-5" />
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
                    <p className="text-xs font-semibold text-muted-foreground">
                      Accesos habilitados
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.habilitadas}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 3. En Revisión y Formalización */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleSetKpiGroup(
                    kpiGroup === "EN_REVISION" ? "ALL" : "EN_REVISION"
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetKpiGroup(
                      kpiGroup === "EN_REVISION" ? "ALL" : "EN_REVISION"
                    );
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiGroup === "EN_REVISION"
                    ? "bg-info/15 border-info ring-2 ring-info/40 shadow-xs"
                    : "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full w-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiGroup === "EN_REVISION"
                          ? "bg-info text-white shadow-xs"
                          : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                      )}
                    >
                      <Activity className="size-5" />
                    </div>
                    <Badge
                      tone="info"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      En trámite DINARP
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      En revisión / formalización
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.enRevision}
                    </p>
                  </div>
                </div>
              </Card>

              {/* 4. Requieren Acción de la Entidad */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() =>
                  handleSetKpiGroup(
                    kpiGroup === "ACCION_REQUERIDA" ? "ALL" : "ACCION_REQUERIDA"
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetKpiGroup(
                      kpiGroup === "ACCION_REQUERIDA"
                        ? "ALL"
                        : "ACCION_REQUERIDA"
                    );
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  kpiGroup === "ACCION_REQUERIDA"
                    ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                    : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full w-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        kpiGroup === "ACCION_REQUERIDA"
                          ? "bg-warning text-white shadow-xs"
                          : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                      )}
                    >
                      <AlertTriangle className="size-5" />
                    </div>
                    <Badge
                      tone="warning"
                      appearance="soft"
                      size="sm"
                      className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                    >
                      Atención requerida
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Firma, pago o subsanación
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.accionRequerida}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Banner de contexto informativo para Rol Facturación */}
          {role === "FACTURACION" && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-3">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-foreground">
                  Gestión económica de convenios y contratos privados
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Las solicitudes privadas requieren validación de acreditación en{" "}
                  <strong className="text-foreground">
                    SIGEF (Sistema Integrado de Gestión Financiera)
                  </strong>
                  . Una vez corroborado el depósito bancario, adjunta el
                  Comprobante Único de Registro (CUR) para que el equipo técnico
                  habilite las credenciales de interoperabilidad.
                </p>
              </div>
            </div>
          )}

          {/* Filtros y Búsqueda con UI Kit Oficial */}
          <div className="space-y-3 w-full" id="toolbar-filtros">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-[200px]">
                <Search
                  size="sm"
                  placeholder={
                    role === "FACTURACION"
                      ? "Buscar por código, banco o factura..."
                      : role === "APROBADOR"
                      ? "Buscar por código, institución o fuente..."
                      : "Buscar por código, proyecto, servicio, fuente o institución..."
                  }
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

              {/* Filtros Combobox UI Kit al lado del Search */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
                {/* 1. Filtro Estado */}
                <div className="w-full sm:w-44 lg:w-44 xl:w-48 min-w-0">
                  <Combobox
                    value={estadoFilter === "ALL" ? null : estadoFilter}
                    onValueChange={(val) => {
                      handleSetEstadoFilter(val || "ALL");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = estadoOptions.find((e) => e.value === newSearch);
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
                    <ComboboxContent className="min-w-[240px] z-[80]">
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

                {/* 2. Filtro Proyecto (para Coordinador) */}
                {role === "COORDINADOR_SINARP" && (
                  <div className="w-full sm:w-44 lg:w-44 xl:w-48 min-w-0">
                    <Combobox
                      value={proyectoFilter === "ALL" ? null : proyectoFilter}
                      onValueChange={(val) => {
                        handleSetProyectoFilter(val || "ALL");
                      }}
                      inputValue={proyectoSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = proyectoOptions.find((p) => p.value === newSearch);
                        if (opt) setProyectoSearch(opt.label);
                        else if (newSearch === "ALL") setProyectoSearch("");
                        else setProyectoSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todos los proyectos"
                        showClear={proyectoFilter !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[260px] z-[80]">
                        <ComboboxList>
                          <ComboboxGroup>
                            <ComboboxLabel>Filtrar por proyecto</ComboboxLabel>
                            {filteredProyectosForFilter.map((opt) => (
                              <ComboboxItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs py-1.5 cursor-pointer"
                                title={opt.label}
                              >
                                <span className="truncate">{opt.label}</span>
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                          {filteredProyectosForFilter.length === 0 && (
                            <ComboboxEmpty>No se encontraron proyectos.</ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                )}

                {/* 3. Filtro Fuente (para Coordinador) */}
                {role === "COORDINADOR_SINARP" && (
                  <div className="w-full sm:w-44 lg:w-44 xl:w-48 min-w-0">
                    <Combobox
                      value={fuenteFilter === "ALL" ? null : fuenteFilter}
                      onValueChange={(val) => {
                        handleSetFuenteFilter(val || "ALL");
                      }}
                      inputValue={fuenteSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = fuenteOptions.find((f) => f.value === newSearch);
                        if (opt) setFuenteSearch(opt.label);
                        else if (newSearch === "ALL") setFuenteSearch("");
                        else setFuenteSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todas las fuentes"
                        showClear={fuenteFilter !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[280px] z-[80]">
                        <ComboboxList>
                          <ComboboxGroup>
                            <ComboboxLabel>Filtrar por fuente</ComboboxLabel>
                            {filteredFuentesForFilter.map((opt) => (
                              <ComboboxItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs py-1.5 cursor-pointer"
                                title={opt.label}
                              >
                                <span className="truncate">{opt.label}</span>
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                          {filteredFuentesForFilter.length === 0 && (
                            <ComboboxEmpty>No se encontraron fuentes.</ComboboxEmpty>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                )}

                {/* 4. Filtro Institución */}
                <div className="w-full sm:w-44 lg:w-44 xl:w-48 min-w-0">
                  <Combobox
                    value={institucionFilter === "ALL" ? null : institucionFilter}
                    onValueChange={(val) => {
                      handleSetInstitucionFilter(val || "ALL");
                    }}
                    inputValue={institucionSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = institucionOptions.find((i) => i.value === newSearch);
                      if (opt) setInstitucionSearch(opt.label);
                      else if (newSearch === "ALL") setInstitucionSearch("");
                      else setInstitucionSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las instituciones"
                      showClear={institucionFilter !== "ALL"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[280px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por institución</ComboboxLabel>
                          {filteredInstitucionesForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                              title={opt.label}
                            >
                              <span className="truncate">{opt.label}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredInstitucionesForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron instituciones.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {/* Badges / Píldoras de Filtros Activos (UI Kit) */}
            <TooltipProvider delayDuration={150}>
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
                        onClick={() => {
                          setSearchTerm("");
                          setCurrentPage(1);
                        }}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {kpiGroup !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <span className="truncate">
                        Grupo:{" "}
                        {kpiGroup === "HABILITADAS"
                          ? "Accesos habilitados"
                          : kpiGroup === "EN_REVISION"
                          ? "En revisión / formalización"
                          : "Requieren acción"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetKpiGroup("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de grupo KPI"
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
                      <span className="max-w-[180px] sm:max-w-[260px] truncate">
                        Estado: {estadoFilter}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSetEstadoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de estado"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {proyectoFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                            Proyecto: {proyectoFilter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                          Proyecto: {proyectoFilter}
                        </TooltipContent>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => handleSetProyectoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de proyecto"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {fuenteFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                            Fuente: {fuenteFilter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                          Fuente: {fuenteFilter}
                        </TooltipContent>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => handleSetFuenteFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de fuente"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {institucionFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                            Institución: {institucionFilter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                          Institución: {institucionFilter}
                        </TooltipContent>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => handleSetInstitucionFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de institución"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </TooltipProvider>
          </div>

          {/* TABLA PRINCIPAL SEGÚN ROL (Desktop md+) */}
          <TooltipProvider delayDuration={150}>
            <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
              <Table
                id="table-solicitudes"
                className="w-full min-w-[1380px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  {role === "COORDINADOR_SINARP" && (
                    <TableRow className="border-0">
                      <TableHead className="w-[155px] min-w-[145px] whitespace-nowrap text-left pl-6">
                        N.º SOLICITUD / CONVENIO
                      </TableHead>
                      <TableHead className="w-[245px] min-w-[225px] whitespace-nowrap text-left">
                        PROYECTO / SERVICIO
                      </TableHead>
                      <TableHead className="w-[265px] min-w-[240px] whitespace-nowrap text-left">
                        INSTITUCIÓN / FUENTE
                      </TableHead>
                      <TableHead className="w-[165px] min-w-[155px] whitespace-nowrap text-left">
                        ALCANCE
                      </TableHead>
                      <TableHead className="w-[145px] min-w-[135px] whitespace-nowrap text-left">
                        CLASIFICACIÓN
                      </TableHead>
                      <TableHead className="w-[185px] min-w-[175px] whitespace-nowrap text-left">
                        ESTADO DEL TRÁMITE
                      </TableHead>
                      <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap text-left">
                        RADICACIÓN
                      </TableHead>
                      <TableHead className="w-[165px] min-w-[155px] whitespace-nowrap text-right pr-6">
                        ACCIONES
                      </TableHead>
                    </TableRow>
                  )}

                  {role === "APROBADOR" && (
                    <TableRow className="border-0">
                      <TableHead className="pl-6">N.º DE SOLICITUD</TableHead>
                      <TableHead>INSTITUCIÓN SOLICITANTE</TableHead>
                      <TableHead>INSTITUCIÓN PROVEEDORA</TableHead>
                      <TableHead>FUENTE</TableHead>
                      <TableHead>FECHA DE ENVÍO</TableHead>
                      <TableHead>ESTADO</TableHead>
                      <TableHead className="w-24 text-right pr-6">ACCIONES</TableHead>
                    </TableRow>
                  )}

                  {role === "FACTURACION" && (
                    <TableRow className="border-0">
                      <TableHead className="pl-6">N.º DE SOLICITUD</TableHead>
                      <TableHead>INSTITUCIÓN</TableHead>
                      <TableHead>FUENTE</TableHead>
                      <TableHead>FECHA DE APROBACIÓN</TableHead>
                      <TableHead>VALOR</TableHead>
                      <TableHead>ESTADO</TableHead>
                      <TableHead className="w-24 text-right pr-6">ACCIONES</TableHead>
                    </TableRow>
                  )}
                </TableHeader>

                <TableBody>
                  {paginatedSolicitudes.map((s) => {
                    const fuenteNombre =
                      s.fuentePrincipal ||
                      s.fuentes?.[0]?.nombre ||
                      "Dirección General de Registro Civil, Identificación y Cedulación";
                    const servicioNombre =
                      s.servicioPrincipal || "Consulta de Datos de Identidad";
                    const fechaAprobacion =
                      s.fechaAprobacion || s.ultimaActualizacion.substring(0, 10);
                    const valorFactura = s.factura?.valor || "$ 150.00";

                    if (role === "COORDINADOR_SINARP") {
                      const proyectoNombre =
                        s.proyectoNombre || "Proyecto Institucional SINARP";
                      const totalCampos =
                        s.camposCount ??
                        s.fuentes?.reduce(
                          (acc, f) => acc + (f.campos?.length || 0),
                          0
                        ) ??
                        2;
                      const tieneConfidenciales =
                        s.fuentes?.some((f) =>
                          f.campos?.some((c) => c.clasificacion === "Confidencial")
                        ) ?? false;
                      const instrumentoRef =
                        s.contrato || s.instrumento || "En formalización";

                      const isCerrada =
                        s.estado === "Cerrada" ||
                        s.estado === "Cerrada por vencimiento";
                      const isBorrador = s.estado === "Borrador";
                      const isObservada =
                        !isCerrada &&
                        (s.estado === "Requiere corrección" ||
                          s.estado === "Observada" ||
                          s.estado === "Rechazada" ||
                          s.estado === "Con observaciones");
                      const isFirma = s.estado === "Pendiente de firma";
                      const isPago =
                        s.estado === "Pendiente de pago" ||
                        s.estado === "Pago pendiente";
                      const isHabilitada =
                        s.estado === "Acceso habilitado" ||
                        s.estado === "Acceso generado";

                      return (
                        <TableRow
                          key={s.id}
                          className="transition-colors hover:bg-muted/40"
                        >
                          {/* 1. N.º Solicitud / Instrumento */}
                          <TableCell className="w-[155px] min-w-[145px] text-left align-middle pl-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                  className="font-mono text-xs font-bold text-primary hover:underline transition-colors"
                                >
                                  {s.id}
                                </Link>
                                {s.versionExpediente && (
                                  <Badge
                                    tone="neutral"
                                    appearance="outline"
                                    size="sm"
                                    className="text-[10px] font-mono px-1.5 py-0 h-4"
                                  >
                                    v{s.versionExpediente}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono block truncate">
                                {instrumentoRef}
                              </span>
                            </div>
                          </TableCell>

                          {/* 2. Proyecto / Servicio */}
                          <TableCell className="w-[245px] min-w-[225px] text-left align-middle">
                            <div className="space-y-1 min-w-0 pr-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                    className="text-xs font-bold text-foreground hover:text-primary transition-colors block truncate max-w-full"
                                  >
                                    {proyectoNombre}
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {proyectoNombre} (clic para ver expediente)
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-[11px] text-muted-foreground block truncate cursor-help">
                                    {servicioNombre}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Servicio: {servicioNombre}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          {/* 3. Institución / Fuente */}
                          <TableCell className="w-[265px] min-w-[240px] text-left align-middle">
                            <div className="space-y-1 min-w-0 pr-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs font-semibold text-foreground block truncate cursor-help">
                                    {s.institucion}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Institución: {s.institucion}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[11px] text-muted-foreground block truncate cursor-help">
                                    {fuenteNombre}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Fuente: {fuenteNombre}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>

                          {/* 4. Alcance */}
                          <TableCell className="w-[165px] min-w-[155px] text-left align-middle">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  tone="primary"
                                  appearance="outline"
                                  size="sm"
                                  className="text-[10px] font-semibold px-2 py-0 h-5 whitespace-nowrap"
                                >
                                  <Database className="size-3 mr-1 shrink-0" />
                                  {totalCampos} campos
                                </Badge>
                              </div>
                            </div>
                          </TableCell>

                          {/* 5. Clasificación */}
                          <TableCell className="w-[145px] min-w-[135px] text-left align-middle">
                            {tieneConfidenciales ? (
                              <Badge
                                tone="warning"
                                appearance="soft"
                                size="sm"
                                className="gap-1 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
                              >
                                <AlertTriangle className="size-3.5 shrink-0" />
                                <span>Confidencial</span>
                              </Badge>
                            ) : (
                              <Badge
                                tone="success"
                                appearance="soft"
                                size="sm"
                                className="gap-1 font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
                              >
                                <CheckCircle2 className="size-3.5 shrink-0" />
                                <span>Accesible</span>
                              </Badge>
                            )}
                          </TableCell>

                          {/* 6. Estado del Trámite */}
                          <TableCell className="w-[185px] min-w-[175px] text-left align-middle">
                            <div className="space-y-1">
                              <div className="inline-flex items-center justify-start">
                                {getEstadoBadge(s.estado)}
                              </div>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] text-muted-foreground block truncate max-w-[175px] cursor-help">
                                    {s.responsable}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Responsable actual: {s.responsable}
                                </TooltipContent>
                              </Tooltip>
                              {renderSubsanacionPlazoBar(s)}
                            </div>
                          </TableCell>

                          {/* 7. Fecha / Radicación */}
                          <TableCell className="w-[130px] min-w-[120px] text-left align-middle whitespace-nowrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start text-left cursor-help">
                                  <span className="text-foreground font-semibold">
                                    {s.fecha.split(" ")[0]}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Act: {s.ultimaActualizacion.split(" ")[0]}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Radicada: {s.fecha} • Última actualización:{" "}
                                {s.ultimaActualizacion}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 8. Acciones (UI Kit estandarizado con icon-sm y Tooltip) */}
                          <TableCell className="w-[165px] min-w-[155px] pr-6 text-right align-middle">
                            <div className="inline-flex items-center gap-1 justify-end w-full">
                              {/* 1. Ver expediente completo */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                  >
                                    <Link
                                      href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                      aria-label={`Ver detalle de solicitud ${s.id}`}
                                    >
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Ver expediente completo
                                </TooltipContent>
                              </Tooltip>

                              {/* 2. Continuar borrador */}
                              {isBorrador && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    >
                                      <Link
                                        href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                        aria-label={`Continuar borrador ${s.id}`}
                                      >
                                        <Edit className="size-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Continuar edición de borrador
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* 3. Corregir / Subsanar observaciones */}
                              {isObservada && s.diasRestantesSubsanacion !== 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-warning hover:bg-warning/10 cursor-pointer"
                                    >
                                      <Link
                                        href={`/acceso-interoperabilidad/solicitudes/${s.id}/corregir`}
                                        aria-label={`Subsanar solicitud ${s.id}`}
                                      >
                                        <Edit className="size-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Subsanar observaciones del expediente
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* 4. Firmar instrumento */}
                              {isFirma && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    >
                                      <Link
                                        href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                        aria-label={`Firmar solicitud ${s.id}`}
                                      >
                                        <FileSignature className="size-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Revisar y firmar instrumento
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* 5. Gestionar pago */}
                              {isPago && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    >
                                      <Link
                                        href={`/acceso-interoperabilidad/solicitudes/${s.id}/facturacion`}
                                        aria-label={`Gestionar pago ${s.id}`}
                                      >
                                        <CreditCard className="size-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Gestionar facturación y pago
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* 6. Ver credenciales */}
                              {isHabilitada && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setModalCredenciales(s)}
                                      className="text-muted-foreground hover:text-success hover:bg-success/10 cursor-pointer"
                                      aria-label={`Ver credenciales ${s.id}`}
                                    >
                                      <KeyRound className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Ver credenciales Apigee
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    if (role === "APROBADOR") {
                      const st = String(s.estado);
                      const isPendiente =
                        st === "Por revisar" ||
                        st === "En revisión" ||
                        st === "Pendiente de aprobación" ||
                        st === "Reenviada";
                      return (
                        <TableRow
                          key={s.id}
                          className={cn(isPendiente && "bg-primary/[0.02]")}
                        >
                          <TableCell className="font-semibold text-foreground pl-6">
                            <div className="flex items-center gap-1.5">
                              {isPendiente && (
                                <span className="size-2 rounded-full bg-primary animate-pulse" />
                              )}
                              <span>{s.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {s.institucion}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {fuenteNombre}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {servicioNombre}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {s.fecha.substring(0, 10)}
                          </TableCell>
                          <TableCell>{getEstadoBadge(s.estado)}</TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Link
                                      href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                    >
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Ver detalle
                                </TooltipContent>
                              </Tooltip>

                              {s.estado === "Acceso generado" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => setModalCredenciales(s)}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <KeyRound className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Ver credenciales de acceso
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    if (role === "FACTURACION") {
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-semibold text-foreground pl-6">
                            {s.id}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {s.institucion}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-semibold text-foreground">
                                {fuenteNombre}
                              </span>
                              <span className="text-muted-foreground">
                                {servicioNombre}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {fechaAprobacion}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {valorFactura}
                          </TableCell>
                          <TableCell>{getEstadoBadge(s.estado)}</TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon-sm"
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  >
                                    <Link
                                      href={`/acceso-interoperabilidad/solicitudes/${s.id}`}
                                    >
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Ver detalle
                                </TooltipContent>
                              </Tooltip>

                              {s.estado === "Acceso generado" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => setModalCredenciales(s)}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <KeyRound className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Ver credenciales de acceso
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {(s.estado === "Pendiente de validación de pago" ||
                                s.estado === "Pago en validación") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => handleOpenValidar(s)}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Validar pago
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {(s.estado === "Pago validado" ||
                                s.estado === "Pago verificado") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => setModalCur(s)}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <FileCheck2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Ver CUR
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return null;
                  })}

                  {paginatedSolicitudes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FolderKanban className="size-8 stroke-[1.5] text-muted-foreground/60" />
                          <p className="text-sm font-semibold text-foreground">
                            No se encontraron solicitudes
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ajusta los filtros de búsqueda o inicia una nueva
                            solicitud de interoperabilidad.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista Cards (<md o cuando viewMode === "cards") con Tarjeta Interactiva del UI Kit */}
            <div
              className={cn(
                "w-full",
                viewMode === "cards"
                  ? paginatedSolicitudes.length === 1
                    ? "grid grid-cols-1 gap-4"
                    : "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "block md:hidden space-y-3.5"
              )}
            >
              {paginatedSolicitudes.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <FolderKanban className="size-8 stroke-[1.5] text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">
                    No se encontraron solicitudes
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros de búsqueda o inicia una nueva solicitud.
                  </p>
                </div>
              ) : (
                paginatedSolicitudes.map((s) => renderSolicitudMobileCard(s))
              )}
            </div>
          </TooltipProvider>

          {/* Paginación Estandarizada del UI Kit */}
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

      {/* ─── MODAL: VER FACTURA (ROL FACTURACIÓN / COORDINADOR) ─── */}
      <Dialog
        open={Boolean(modalFactura)}
        onOpenChange={(open) => !open && setModalFactura(null)}
      >
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              Factura Electrónica {modalFactura?.factura?.numero || "FAC-0028"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprobante de cobro emitido por tarifa de acceso a fuentes de
              interoperabilidad.
            </DialogDescription>
          </DialogHeader>

          {modalFactura && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/70">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Institución Privada:
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {modalFactura.institucion}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Contrato Asociado:
                  </span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {modalFactura.contrato || "CONTR-2026-0019"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Fecha de Emisión:
                  </span>
                  <span className="text-foreground">
                    {modalFactura.factura?.fechaEmision ||
                      modalFactura.fecha.substring(0, 10)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Estado financiero:
                  </span>
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="font-semibold"
                  >
                    Pago pendiente
                  </Badge>
                </div>
              </div>

              <div>
                <span className="font-semibold text-foreground text-xs block mb-2">
                  Desglose de fuentes tasadas:
                </span>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="p-2.5">Concepto / Fuente</TableHead>
                        <TableHead className="p-2.5 text-right">Tarifa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(
                        modalFactura.factura?.detalleServicios || [
                          {
                            servicio:
                              modalFactura.servicioPrincipal ||
                              "Consulta de Interoperabilidad",
                            valor: modalFactura.factura?.valor || "$ 150.00",
                          },
                        ]
                      ).map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="p-2.5 text-foreground">
                            {item.servicio}
                          </TableCell>
                          <TableCell className="p-2.5 text-right font-mono font-semibold text-foreground">
                            {item.valor}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/30 font-bold">
                        <TableCell className="p-2.5 text-foreground">
                          Total a Liquidar
                        </TableCell>
                        <TableCell className="p-2.5 text-right text-foreground font-mono text-sm">
                          {modalFactura.factura?.valor || "$ 150.00"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-background text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">
                  Instrucciones de pago para la entidad privada:
                </p>
                <p>
                  Transferencia a cuenta fiscal del Tesoro Nacional en Banco
                  Central del Ecuador (Sublínea DINARP 130108). Notificar
                  acreditación una vez efectuada.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  ¿Simular que el banco ya pagó?
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    simularPagoRealizado(modalFactura.id);
                    toast.success(
                      "Pago registrado externamente. La solicitud pasó a Pendiente de validación de pago."
                    );
                    setModalFactura(null);
                  }}
                  className="h-7 text-xs border-dashed"
                >
                  Simular pago realizado
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-between sm:justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalFactura(null)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Volver a la bandeja de solicitudes
            </Button>
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setModalFactura(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: VER CUR (ROL FACTURACIÓN) ─── */}
      <Dialog
        open={Boolean(modalCur)}
        onOpenChange={(open) => !open && setModalCur(null)}
      >
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-success" />
              Comprobante Único de Registro — CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Documento financiero oficial verificado en SIGEF y anexado al
              expediente de interoperabilidad.
            </DialogDescription>
          </DialogHeader>

          {modalCur && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-success">
                    Pago Verificado y Validado
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    El ingreso de fondos fue validado externamente en SIGEF y el
                    CUR ha sido incorporado formalmente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    N.º de CUR:
                  </span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {modalCur.cur?.numeroCur || "CUR-008814"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Archivo anexo:
                  </span>
                  <span className="font-medium text-primary flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {modalCur.cur?.nombreArchivo ||
                      "CUR_SIGEF_BancoGuayaquil.pdf"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Fecha y hora de registro:
                  </span>
                  <span className="text-foreground font-mono">
                    {modalCur.cur?.fechaRegistro || "2026-09-19 14:15"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Responsable de validación:
                  </span>
                  <span className="text-foreground font-semibold">
                    {modalCur.cur?.usuarioResponsable ||
                      "Lcda. Patricia Morales (Facturación)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-surface">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      {modalCur.cur?.nombreArchivo ||
                        "CUR_SIGEF_BancoGuayaquil.pdf"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {modalCur.cur?.tamano || "1.4 MB"} · PDF firmado
                      digitalmente
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Descargando CUR oficial...")}
                  className="h-8 text-xs gap-1.5"
                >
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setModalCur(null)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL / DRAWER: VALIDAR PAGO Y ANEXAR CUR (ROL FACTURACIÓN) ─── */}
      <Dialog
        open={Boolean(modalValidarPago)}
        onOpenChange={(open) => !open && setModalValidarPago(null)}
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Validar pago y anexar CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el Comprobante Único de Registro (CUR) descargado desde
              SIGEF tras confirmar la acreditación de fondos.
            </DialogDescription>
          </DialogHeader>

          {modalValidarPago && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-3.5 rounded-xl border border-warning/40 bg-warning/10 flex items-start gap-3">
                <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-warning">
                    Validación externa requerida
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Verifica en <strong className="text-foreground">SIGEF</strong>{" "}
                    que el pago de esta solicitud haya sido registrado antes de
                    continuar. SIGEF es una plataforma externa de finanzas
                    públicas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    N.º de solicitud:
                  </span>
                  <span className="font-bold text-foreground">
                    {modalValidarPago.id}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Institución:
                  </span>
                  <span className="font-semibold text-foreground truncate block">
                    {modalValidarPago.institucion}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Factura asociada:
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {modalValidarPago.factura?.numero || "FAC-0031"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Valor verificado:
                  </span>
                  <span className="font-bold text-foreground text-sm">
                    {modalValidarPago.factura?.valor || "$ 280.00"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Estado actual:
                  </span>
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="font-semibold"
                  >
                    Pendiente validación
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Usuario responsable:
                  </span>
                  <span className="text-foreground font-semibold">
                    Lcda. Patricia Morales
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Número de Comprobante Único de Registro (CUR){" "}
                  <span className="text-foreground">*</span>
                </label>
                <Input
                  type="text"
                  value={numeroCurInput}
                  onChange={(e) => setNumeroCurInput(e.target.value)}
                  placeholder="Ej: CUR-009412"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>
                    Comprobante Único de Registro — CUR (PDF obligatorio){" "}
                    <span className="text-danger">*</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Formato PDF hasta 10 MB
                  </span>
                </label>

                {!curFile ? (
                  <label
                    htmlFor="cur-file-input"
                    className={cn(
                      "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface hover:bg-muted/40",
                      curFileError
                        ? "border-danger bg-danger/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <UploadCloud className="size-8 text-primary mb-2" />
                    <span className="text-xs font-semibold text-foreground">
                      Haz clic para seleccionar el CUR emitido en SIGEF
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">
                      Archivo .pdf verificado con firma electrónica
                    </span>
                    <input
                      id="cur-file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCurFile(file);
                          setCurFileError(false);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileCheck2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {curFile.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {(curFile.size / 1024).toFixed(1)} KB · PDF Listo para
                          anexar
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurFile(null)}
                      className="text-xs text-muted-foreground hover:text-danger"
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                )}

                {curFileError && (
                  <p className="text-xs text-danger font-medium">
                    Debes adjuntar el archivo PDF del CUR para poder validar el
                    pago.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setModalValidarPago(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleProcederConfirmacion}
              className="font-semibold gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="size-4" />
              Anexar CUR y validar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: CONFIRMAR VALIDACIÓN DE PAGO ─── */}
      <Dialog
        open={Boolean(modalConfirmarValidacion)}
        onOpenChange={(open) => !open && setModalConfirmarValidacion(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Confirmar validación de pago
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Confirma que el pago fue verificado en SIGEF y que el CUR adjunto
              corresponde a esta solicitud.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 my-2 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Solicitud:</span>
              <strong className="text-foreground">
                {modalConfirmarValidacion?.id}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground truncate max-w-[200px]">
                {modalConfirmarValidacion?.institucion}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CUR adjunto:</span>
              <strong className="text-foreground font-mono">
                {numeroCurInput || "CUR-009412"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <strong className="text-primary">
                {modalConfirmarValidacion?.factura?.valor || "$ 280.00"}
              </strong>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setModalConfirmarValidacion(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmarValidacionFinal}
              className="font-semibold gap-1.5 shadow-xs"
            >
              <Check className="size-4" />
              Confirmar validación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL ACC-03: CREDENCIALES TÉCNICAS (CON RETO DE CONTRASEÑA Y SECRETO) ─── */}
      <CredencialTecnicaModal
        solicitud={modalCredenciales}
        isOpen={Boolean(modalCredenciales)}
        onClose={() => setModalCredenciales(null)}
      />
    </WireframeDashboardLayout>
  );
}
