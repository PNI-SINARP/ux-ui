"use client";

import React, { useState, useMemo } from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  type SolicitudAcceso,
} from "../data/solicitudes-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardBadge,
  CardTitle,
  CardDescription,
  CardDecorativeIcon,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import {
  FileCheck2,
  Building2,
  CheckCircle2,
  Eye,
  Database,
  ShieldCheck,
  Receipt,
  FileSignature,
  History,
  Check,
  SlidersHorizontal,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Ban,
  ArrowLeft,
  X,
  Server,
  KeyRound,
  BellRing,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { TrazabilidadTimeline } from "../components/trazabilidad-timeline";
import { cn } from "@/lib/utils";

const TIPO_ENTIDAD_OPCIONES = [
  { value: "TODOS", label: "Todos los tipos" },
  { value: "Pública", label: "Entidad Pública (SOL-09)" },
  { value: "Privada", label: "Entidad Privada (SOL-10)" },
];

export function FormalizacionGestionView() {
  const {
    solicitudes,
    aprobarFinalGestion,
    reintentarIntegracionExpedientePublico,
    devolverDesdeAprobacionFinal,
    revertirPagoConfirmado,
    actualizarAlcanceCupoApigee,
  } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("TODOS");
  const [tipoSearch, setTipoSearch] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState<string>("TODOS");
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [kpiFilter, setKpiFilter] = useState<
    "ALL" | "PUBLICAS_LISTAS" | "PRIVADAS_LISTAS" | "INTEGRACION_PENDIENTE" | "APROBADOS"
  >("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Vista de expediente inline
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"expediente" | "campos" | "trazabilidad">("expediente");

  // Modales de acciones operativas del Director de Gestión
  const [modalAprobacion, setModalAprobacion] = useState<SolicitudAcceso | null>(null);
  const [resolucionAdmin, setResolucionAdmin] = useState("RESOLUCION-DINARP-DIR-2026-089");
  const [simularFalloApigee, setSimularFalloApigee] = useState(false);
  const [aprobacionStage, setAprobacionStage] = useState<"FORM" | "PROVISIONING" | "SUCCESS">("FORM");
  const [aprobacionStepIndex, setAprobacionStepIndex] = useState(0);

  const [modalDevolucion, setModalDevolucion] = useState<SolicitudAcceso | null>(null);
  const [areaDestinoDevolucion, setAreaDestinoDevolucion] = useState<"Gestión" | "Normatividad" | "Jurídica">("Jurídica");
  const [observacionDevolucion, setObservacionDevolucion] = useState("");

  const [modalReversionPago, setModalReversionPago] = useState<SolicitudAcceso | null>(null);
  const [motivoReversionPago, setMotivoReversionPago] = useState("");

  const [modalActualizarCupo, setModalActualizarCupo] = useState<SolicitudAcceso | null>(null);
  const [nuevoCupoApigee, setNuevoCupoApigee] = useState("250000");
  const [motivoActualizacionCupo, setMotivoActualizacionCupo] = useState("Ampliación autorizada por convenio modificatorio");

  // Alcance exclusivo del Director de Gestión (SOL-09, SOL-10, ACC-01, PAG-04, ACC-08):
  // Excluye estados intermedios de Jurídica (DOC-01..03) y Financiero/Pagos (FAC-01 / PAG-01..03)
  const solicitudesFormalizacion = useMemo(() => {
    return solicitudes.filter((s) => {
      if (s.tipoInstitucion === "Pública") {
        return (
          s.estado === "Aprobada por Gestión" ||
          s.estado === "Aprobada por Normatividad" ||
          s.estado === "Pendiente de integración" ||
          s.estado === "En formalización" ||
          s.estado === "Listo para aprobación final" ||
          s.estado === "Aprobación final" ||
          s.estado === "Solicitud aprobada — habilitación técnica pendiente" ||
          s.estado === "Habilitación técnica" ||
          s.estado === "Acceso habilitado" ||
          s.estado === "Acceso generado" ||
          s.estado === "Acceso suspendido"
        );
      }
      // Privada: únicamente cuando ya completó contrato + factura + pago validado (SOL-10) o posterior
      return (
        s.estado === "Pago verificado" ||
        s.estado === "Pago validado" ||
        s.estado === "Listo para aprobación final" ||
        s.estado === "Aprobación final" ||
        s.estado === "Solicitud aprobada — habilitación técnica pendiente" ||
        s.estado === "Habilitación técnica" ||
        s.estado === "Acceso habilitado" ||
        s.estado === "Acceso generado" ||
        s.estado === "Acceso suspendido" ||
        s.estado === "Cerrada por reversión"
      );
    });
  }, [solicitudes]);

  const selectedSolicitud = useMemo(
    () => solicitudes.find((s) => s.id === selectedSolicitudId) || null,
    [solicitudes, selectedSolicitudId]
  );

  // KPIs exclusivos de la bandeja del Director de Gestión
  const totalPublicasListas = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.tipoInstitucion === "Pública" &&
          (s.estado === "Aprobada por Gestión" ||
            s.estado === "Aprobada por Normatividad" ||
            s.estado === "En formalización" ||
            s.estado === "Listo para aprobación final" ||
            s.estado === "Aprobación final")
      ).length,
    [solicitudesFormalizacion]
  );

  const totalPrivadasListas = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago verificado" ||
            s.estado === "Pago validado" ||
            s.estado === "Listo para aprobación final" ||
            s.estado === "Aprobación final")
      ).length,
    [solicitudesFormalizacion]
  );

  const totalIntegracionPendiente = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.estado === "Pendiente de integración" ||
          s.estado === "Solicitud aprobada — habilitación técnica pendiente"
      ).length,
    [solicitudesFormalizacion]
  );

  const totalAprobados = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.estado === "Habilitación técnica" ||
          s.estado === "Acceso habilitado" ||
          s.estado === "Acceso generado"
      ).length,
    [solicitudesFormalizacion]
  );

  // Opciones dinámicas para Combobox
  const institucionesOpciones = useMemo(() => {
    const nombres = Array.from(new Set(solicitudesFormalizacion.map((s) => s.institucion)));
    return [
      { value: "TODOS", label: "Todas las instituciones" },
      ...nombres.map((inst) => ({ value: inst, label: inst })),
    ];
  }, [solicitudesFormalizacion]);

  const estadosOpciones = useMemo(() => {
    const estados = Array.from(new Set(solicitudesFormalizacion.map((s) => s.estado)));
    return [
      { value: "TODOS", label: "Todos los estados" },
      ...estados.map((est) => ({ value: est, label: est })),
    ];
  }, [solicitudesFormalizacion]);

  const filteredTiposForFilter = useMemo(() => {
    const q = tipoSearch.trim().toLowerCase();
    const selectedLabel = TIPO_ENTIDAD_OPCIONES.find((o) => o.value === tipoFilter)?.label.toLowerCase();
    if (!q || q === selectedLabel) return TIPO_ENTIDAD_OPCIONES;
    return TIPO_ENTIDAD_OPCIONES.filter((o) => o.label.toLowerCase().includes(q));
  }, [tipoSearch, tipoFilter]);

  const filteredInstitucionesForFilter = useMemo(() => {
    const q = institucionSearch.trim().toLowerCase();
    const selectedLabel = institucionesOpciones.find((o) => o.value === institucionFilter)?.label.toLowerCase();
    if (!q || q === selectedLabel) return institucionesOpciones;
    return institucionesOpciones.filter((o) => o.label.toLowerCase().includes(q));
  }, [institucionSearch, institucionFilter, institucionesOpciones]);

  const filteredEstadosForFilter = useMemo(() => {
    const q = estadoSearch.trim().toLowerCase();
    const selectedLabel = estadosOpciones.find((o) => o.value === estadoFilter)?.label.toLowerCase();
    if (!q || q === selectedLabel) return estadosOpciones;
    return estadosOpciones.filter((o) => o.label.toLowerCase().includes(q));
  }, [estadoSearch, estadoFilter, estadosOpciones]);

  const handleSetTipoFilter = (val: string) => {
    setTipoFilter(val);
    const opt = TIPO_ENTIDAD_OPCIONES.find((o) => o.value === val);
    setTipoSearch(val === "TODOS" ? "" : opt?.label || val);
    setCurrentPage(1);
  };

  const handleSetInstitucionFilter = (val: string) => {
    setInstitucionFilter(val);
    setInstitucionSearch(val === "TODOS" ? "" : val);
    setCurrentPage(1);
  };

  const handleSetEstadoFilter = (val: string) => {
    setEstadoFilter(val);
    setEstadoSearch(val === "TODOS" ? "" : val);
    setCurrentPage(1);
  };

  const filteredSolicitudes = useMemo(() => {
    return solicitudesFormalizacion.filter((s) => {
      const matchTipo =
        tipoFilter === "TODOS" || s.tipoInstitucion === tipoFilter;

      const matchInstitucion =
        institucionFilter === "TODOS" || s.institucion === institucionFilter;

      const matchKpi =
        kpiFilter === "ALL" ||
        (kpiFilter === "PUBLICAS_LISTAS" &&
          s.tipoInstitucion === "Pública" &&
          (s.estado === "Aprobada por Gestión" ||
            s.estado === "Aprobada por Normatividad" ||
            s.estado === "En formalización" ||
            s.estado === "Listo para aprobación final" ||
            s.estado === "Aprobación final")) ||
        (kpiFilter === "PRIVADAS_LISTAS" &&
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago verificado" ||
            s.estado === "Pago validado" ||
            s.estado === "Listo para aprobación final" ||
            s.estado === "Aprobación final")) ||
        (kpiFilter === "INTEGRACION_PENDIENTE" &&
          (s.estado === "Pendiente de integración" ||
            s.estado === "Solicitud aprobada — habilitación técnica pendiente")) ||
        (kpiFilter === "APROBADOS" &&
          (s.estado === "Habilitación técnica" ||
            s.estado === "Acceso habilitado" ||
            s.estado === "Acceso generado"));

      const matchEstado = estadoFilter === "TODOS" || s.estado === estadoFilter;

      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.institucion.toLowerCase().includes(q) ||
        s.coordinador.toLowerCase().includes(q) ||
        (s.proyectoNombre || "").toLowerCase().includes(q) ||
        (s.fuentePrincipal || "").toLowerCase().includes(q);

      return matchTipo && matchInstitucion && matchKpi && matchEstado && matchSearch;
    });
  }, [solicitudesFormalizacion, tipoFilter, institucionFilter, kpiFilter, estadoFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / pageSize));
  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolicitudes.slice(start, start + pageSize);
  }, [filteredSolicitudes, currentPage, pageSize]);

  const hasActiveFilters =
    tipoFilter !== "TODOS" ||
    institucionFilter !== "TODOS" ||
    kpiFilter !== "ALL" ||
    estadoFilter !== "TODOS" ||
    searchTerm.trim() !== "";

  const clearAllFilters = () => {
    setTipoFilter("TODOS");
    setTipoSearch("");
    setInstitucionFilter("TODOS");
    setInstitucionSearch("");
    setKpiFilter("ALL");
    setEstadoFilter("TODOS");
    setEstadoSearch("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handlers de modales
  const openModalAprobacion = (sol: SolicitudAcceso) => {
    setResolucionAdmin(
      `RESOLUCION-DINARP-DIR-2026-${sol.id.replace("SOL-2026-", "")}`
    );
    setSimularFalloApigee(false);
    setAprobacionStage("FORM");
    setAprobacionStepIndex(0);
    setModalAprobacion(sol);
  };

  const handleConfirmarAprobacion = () => {
    if (!modalAprobacion) return;
    const solId = modalAprobacion.id;
    setAprobacionStage("PROVISIONING");
    setAprobacionStepIndex(0);

    // Simulación de validación y precarga en tiempo real (SOL-10 -> ACC-01 -> AUD-01)
    setTimeout(() => setAprobacionStepIndex(1), 550);
    setTimeout(() => setAprobacionStepIndex(2), 1100);
    setTimeout(() => setAprobacionStepIndex(3), 1650);
    setTimeout(() => {
      aprobarFinalGestion(solId, {
        resolucionNumero: resolucionAdmin,
        directorNombre: "Dr. Roberto Andrade (Director de Gestión de la Información)",
        simularFalloApigee,
      });

      if (simularFalloApigee) {
        toast.warning("Solicitud aprobada con fallo simulado en Apigee (SOL-10 → ACC-02)", {
          description:
            "Aprovisionamiento pendiente: El Equipo TI puede reintentar sobre el mismo id_operacion_aprovisionamiento.",
        });
        setModalAprobacion(null);
        setSimularFalloApigee(false);
        setAprobacionStage("FORM");
      } else {
        setAprobacionStepIndex(4);
        setAprobacionStage("SUCCESS");
        toast.success("Grant OAuth 2.0 y Credencial creados en Apigee; Coordinador notificado (SOL-10 → ACC-01 → AUD-01)", {
          description:
            "Se habilitó el acceso técnico y se envió notificación oficial de Acceso habilitado al Coordinador SINARP.",
        });
      }
    }, 2200);
  };

  const handleConfirmarDevolucion = () => {
    if (!modalDevolucion || !observacionDevolucion.trim()) return;
    devolverDesdeAprobacionFinal(modalDevolucion.id, {
      areaDestino: areaDestinoDevolucion,
      observacion: observacionDevolucion.trim(),
      director: "Dr. Roberto Andrade (Director de Gestión)",
    });
    toast.info(`Solicitud devuelta a ${areaDestinoDevolucion} (SOL-10 Crit. 2)`, {
      description:
        "Aprobación pendiente: No se ejecutó ACC-01 y se notificó al área responsable para subsanación.",
    });
    setModalDevolucion(null);
    setObservacionDevolucion("");
  };

  const handleConfirmarReversionPago = () => {
    if (!modalReversionPago || !motivoReversionPago.trim()) return;
    revertirPagoConfirmado(
      modalReversionPago.id,
      motivoReversionPago.trim(),
      "Dr. Roberto Andrade (Director de Gestión)"
    );
    toast.error("Pago revertido y trámite cerrado por reversión (PAG-04 / ACC-06)", {
      description:
        "Si existía un acceso habilitado en Apigee, fue suspendido automáticamente por pérdida de validez financiera.",
    });
    setModalReversionPago(null);
    setMotivoReversionPago("");
  };

  const handleConfirmarActualizarCupo = () => {
    if (!modalActualizarCupo || !motivoActualizacionCupo.trim()) return;
    actualizarAlcanceCupoApigee(modalActualizarCupo.id, {
      nuevoCupo: Number(nuevoCupoApigee) || 200000,
      motivo: motivoActualizacionCupo.trim(),
      actor: "Dr. Roberto Andrade (Director de Gestión)",
    });
    toast.success("Alcance y cupo actualizados en Apigee (ACC-08)", {
      description: `El nuevo cupo vigente (${Number(nuevoCupoApigee).toLocaleString()} consultas) fue sincronizado con Apigee.`,
    });
    setModalActualizarCupo(null);
  };

  const getStatusHelpers = (s: SolicitudAcceso) => {
    const isPublic = s.tipoInstitucion === "Pública";
    const isPendienteIntegracion = s.estado === "Pendiente de integración";
    const isReadyForApprovalPublic =
      isPublic &&
      (s.estado === "Aprobada por Gestión" ||
        s.estado === "Aprobada por Normatividad" ||
        s.estado === "En formalización" ||
        s.estado === "Listo para aprobación final" ||
        s.estado === "Aprobación final");
    const isReadyForApprovalPrivate =
      !isPublic &&
      (s.estado === "Pago verificado" ||
        s.estado === "Pago validado" ||
        s.estado === "Listo para aprobación final" ||
        s.estado === "Aprobación final");
    const isAlreadyApproved =
      s.estado === "Solicitud aprobada — habilitación técnica pendiente" ||
      s.estado === "Habilitación técnica" ||
      s.estado === "Acceso habilitado" ||
      s.estado === "Acceso generado";
    const canRevertPayment =
      !isPublic &&
      (s.estado === "Pago verificado" ||
        s.estado === "Pago validado" ||
        s.estado === "Acceso habilitado" ||
        s.estado === "Acceso generado");
    const canUpdateQuota =
      s.estado === "Acceso habilitado" || s.estado === "Acceso generado";

    const badgeTone: "success" | "danger" | "primary" | "warning" = isAlreadyApproved
      ? "success"
      : isPendienteIntegracion || s.estado === "Cerrada por reversión"
      ? "danger"
      : isReadyForApprovalPublic || isReadyForApprovalPrivate
      ? "primary"
      : "warning";

    return {
      isPublic,
      isPendienteIntegracion,
      isReadyForApprovalPublic,
      isReadyForApprovalPrivate,
      isAlreadyApproved,
      canRevertPayment,
      canUpdateQuota,
      badgeTone,
    };
  };

  const getKpiLabel = (kpi: typeof kpiFilter) => {
    switch (kpi) {
      case "PUBLICAS_LISTAS":
        return "Públicas listas (SOL-09)";
      case "PRIVADAS_LISTAS":
        return "Privadas listas (SOL-10)";
      case "INTEGRACION_PENDIENTE":
        return "Integración pendiente (SOL-09)";
      case "APROBADOS":
        return "Accesos aprobados (ACC-01)";
      default:
        return "";
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="formalizacion-gestion"
      currentRole="DIR_GESTION"
      breadcrumbs={
        selectedSolicitud
          ? [
              {
                label: "Formalizar accesos",
                onClick: (e: React.MouseEvent) => {
                  e.preventDefault();
                  setSelectedSolicitudId(null);
                },
              },
              { label: selectedSolicitud.id },
            ]
          : undefined
      }
    >
      <TooltipProvider delayDuration={150}>
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          {selectedSolicitud ? (
            /* ══════════════════════════════════════════════════════════
               VISTA 1: EXPEDIENTE DEL TRÁMITE INLINE
               ══════════════════════════════════════════════════════════ */
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 animate-in fade-in duration-200"
              innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
            >
              {(() => {
                const st = getStatusHelpers(selectedSolicitud);
                return (
                  <>
                    {/* Cabecera de Retorno y Acciones Contextuales */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setSelectedSolicitudId(null)}
                        className="h-10 px-4 gap-2 text-xs font-semibold rounded-xl shadow-xs self-start"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver a la bandeja</span>
                      </Button>

                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {st.isPendienteIntegracion && (
                          <Button
                            type="button"
                            variant="primary"
                            onClick={() => {
                              reintentarIntegracionExpedientePublico(
                                selectedSolicitud.id,
                                "Dr. Roberto Andrade (Director de Gestión)"
                              );
                              toast.success(
                                "Expediente público listo para aprobación final (SOL-09 Crit. 4)",
                                {
                                  description: `Reintento idempotente completado para ${selectedSolicitud.id} sin crear otro convenio.`,
                                }
                              );
                            }}
                            className="h-10 px-4 text-xs font-semibold gap-2 shadow-xs rounded-xl"
                          >
                            <RefreshCw className="size-4" />
                            <span>Reintentar integración (SOL-09)</span>
                          </Button>
                        )}

                        {(st.isReadyForApprovalPublic || st.isReadyForApprovalPrivate) && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setModalDevolucion(selectedSolicitud);
                                setObservacionDevolucion("");
                              }}
                              className="h-10 px-4 text-xs font-semibold gap-2 border-border text-foreground hover:bg-muted rounded-xl"
                            >
                              <RotateCcw className="size-4" />
                              <span>Observar / Devolver (SOL-10)</span>
                            </Button>
                            <Button
                              type="button"
                              variant="primary"
                              onClick={() => openModalAprobacion(selectedSolicitud)}
                              className="h-10 px-4 text-xs font-semibold gap-2 shadow-xs rounded-xl"
                            >
                              <FileCheck2 className="size-4" />
                              <span>Aprobar final y aprovisionar (SOL-10)</span>
                            </Button>
                          </>
                        )}

                        {st.canUpdateQuota && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setModalActualizarCupo(selectedSolicitud);
                              setNuevoCupoApigee(
                                String((selectedSolicitud.cupo || 100000) + 50000)
                              );
                            }}
                            className="h-10 px-4 text-xs font-semibold gap-2 border-border rounded-xl"
                          >
                            <SlidersHorizontal className="size-4" />
                            <span>Actualizar cupo Apigee (ACC-08)</span>
                          </Button>
                        )}

                        {st.canRevertPayment && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setModalReversionPago(selectedSolicitud);
                              setMotivoReversionPago("");
                            }}
                            className="h-10 px-4 text-xs font-semibold gap-2 text-danger border-danger/30 hover:bg-danger/10 rounded-xl"
                          >
                            <Ban className="size-4" />
                            <span>Revertir pago (PAG-04)</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Encabezado Featured del Expediente */}
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 border-0">
                            {st.isPublic
                              ? `EXPEDIENTE PÚBLICO SOL-09 · ${selectedSolicitud.id}`
                              : `EXPEDIENTE PRIVADO SOL-10 · ${selectedSolicitud.id}`}
                          </CardBadge>
                          <Badge
                            tone={st.isPublic ? "info" : "warning"}
                            appearance="soft"
                            size="sm"
                            className="text-[11px] font-bold"
                          >
                            {selectedSolicitud.tipoInstitucion}
                          </Badge>
                        </div>
                        <Badge
                          tone={st.badgeTone}
                          appearance="soft"
                          size="md"
                          dot
                          className="font-semibold text-xs"
                        >
                          {selectedSolicitud.estado}
                        </Badge>
                      </div>

                      <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-primary">
                        {selectedSolicitud.institucion} — {selectedSolicitud.proyectoNombre || selectedSolicitud.fuentePrincipal}
                      </CardTitle>

                      <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium mt-1">
                        Coordinador SINARP: {selectedSolicitud.coordinador} · Fuente principal: {selectedSolicitud.fuentePrincipal || selectedSolicitud.fuentes?.[0]?.nombre} · Cupo aprobado SOL-04: {(selectedSolicitud.cupo ?? 100000).toLocaleString()} consultas
                      </CardDescription>

                      <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 pointer-events-none">
                        <Building2 className="size-36 text-primary" />
                      </CardDecorativeIcon>
                    </Card>

                    {/* Banner de alerta si está Pendiente de integración (SOL-09 Crit. 3) */}
                    {selectedSolicitud.integracionPendienteDetalle && (
                      <div className="p-4 rounded-2xl border border-danger/40 bg-danger/10 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-bold text-danger flex items-center gap-1.5">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span>Expediente Pendiente de integración (SOL-09 Criterio 3)</span>
                          </p>
                          <p className="text-foreground">
                            {selectedSolicitud.integracionPendienteDetalle}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            No se permite SOL-10 hasta vincular el elemento faltante. El reintento es idempotente y no crea otro convenio.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            reintentarIntegracionExpedientePublico(
                              selectedSolicitud.id,
                              "Dr. Roberto Andrade (Director de Gestión)"
                            );
                            toast.success("Expediente público listo para aprobación final (SOL-09)");
                          }}
                          className="gap-1.5 shrink-0"
                        >
                          <RefreshCw className="size-3.5" />
                          Reintentar vínculo
                        </Button>
                      </div>
                    )}

                    {/* Confirmación de Grant OAuth 2.0, Credencial Apigee y Notificación al Coordinador SINARP cuando ya está aprobado */}
                    {st.isAlreadyApproved && selectedSolicitud.credenciales && (
                      <div className="p-5 rounded-2xl border border-success/40 bg-success/10 space-y-4 animate-in fade-in duration-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-success/25 pb-3">
                          <div className="flex items-start gap-2.5">
                            <div className="size-9 rounded-xl bg-success text-white flex items-center justify-center shrink-0 mt-0.5">
                              <KeyRound className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-foreground">
                                  Grant OAuth 2.0 y Credencial Institucional Aprovisionados en Apigee (ACC-01)
                                </h3>
                                <Badge tone="success" appearance="soft" size="sm" dot>
                                  Acceso habilitado
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Notificación oficial enviada a <strong className="text-foreground">{selectedSolicitud.coordinador}</strong> ({selectedSolicitud.institucion}) — Credencial y secreto temporal disponibles en la bandeja del Coordinador SINARP (`AUD-01` / `ACC-03`).
                              </p>
                            </div>
                          </div>
                          <Badge tone="info" appearance="outline" size="sm" className="font-mono self-start sm:self-center shrink-0">
                            {selectedSolicitud.aprovisionamiento?.referenciaTecnica || selectedSolicitud.idOperacionTec00 || `OP-APG-2026-${selectedSolicitud.id.slice(-3)}`}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                            <span className="text-[11px] text-muted-foreground block">Client ID / Credencial (ACC-01)</span>
                            <span className="font-mono font-bold text-foreground block truncate">
                              {selectedSolicitud.credenciales.usuario}
                            </span>
                            <span className="text-[10px] text-success font-semibold block">
                              Estado Apigee: {selectedSolicitud.credenciales.estadoApigee || "ACTIVO"}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                            <span className="text-[11px] text-muted-foreground block">Grant Type & Autenticación</span>
                            <span className="font-semibold text-foreground block truncate">
                              {selectedSolicitud.credenciales.tipoAutenticacion || "OAuth 2.0 (Client Credentials Grant)"}
                            </span>
                            <span className="text-[10px] text-warning font-semibold block">
                              Secreto temporal inicial en bóveda (ACC-09)
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                            <span className="text-[11px] text-muted-foreground block">Alcance y Cupo Vigente</span>
                            <span className="font-mono font-bold text-foreground block">
                              {(selectedSolicitud.credenciales.cupoAutorizadoVigente ?? selectedSolicitud.cupo ?? 100000).toLocaleString()} consultas
                            </span>
                            <span className="text-[10px] text-muted-foreground block">
                              {selectedSolicitud.credenciales.camposAutorizados?.length || 4} campos · {st.isPublic ? "Referencia/Alerta" : "Cuota bloqueante"}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <BellRing className="size-3 text-primary" />
                              <span>Notificación Coordinador (AUD-01)</span>
                            </span>
                            <span className="font-semibold text-foreground block truncate">
                              {selectedSolicitud.coordinador}
                            </span>
                            <span className="text-[10px] text-success font-semibold block">
                              Notificado · Estado: Acceso habilitado
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pestañas del Expediente */}
                    <div className="overflow-x-auto py-1">
                      <Tabs
                        value={detailTab}
                        onValueChange={(v) => setDetailTab(v as typeof detailTab)}
                        className="w-full"
                      >
                        <TabsList className="h-auto p-1.5 rounded-full bg-background border border-border/40 inline-flex gap-1.5 flex-nowrap w-full sm:w-auto justify-start overflow-x-auto">
                          <TabsTrigger
                            value="expediente"
                            className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap"
                          >
                            <ShieldCheck className="size-4 shrink-0" />
                            <span>
                              {st.isPublic
                                ? "1. Expediente Público (SOL-09 / SOL-10)"
                                : "1. Ruta Contractual y Financiera Verificada (SOL-10)"}
                            </span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="campos"
                            className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap"
                          >
                            <Database className="size-4 shrink-0" />
                            <span>2. Fuentes, Campos y Cupo (SOL-04 / ACC-01)</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="trazabilidad"
                            className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap"
                          >
                            <History className="size-4 shrink-0" />
                            <span>3. Historial y Trazabilidad</span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Contenido Pestaña 1: Expediente Público o Ruta Privada */}
                    {detailTab === "expediente" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
                        {st.isPublic ? (
                          <>
                            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <ShieldCheck className="size-4 text-primary" />
                                  <span>Constitución del Expediente Público (SOL-09)</span>
                                </h3>
                                <Badge
                                  tone={st.isPendienteIntegracion ? "danger" : "success"}
                                  appearance="soft"
                                  size="sm"
                                >
                                  {st.isPendienteIntegracion
                                    ? "Pendiente de integración"
                                    : "Expediente público completo"}
                                </Badge>
                              </div>

                              <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Solicitud y revisión técnica (SOL-04):</span>
                                  <Badge tone="success" appearance="soft" size="sm">Vinculada · Aprobada</Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Informe técnico-jurídico confidenciales (SOL-08):</span>
                                  <Badge
                                    tone={st.isPendienteIntegracion ? "danger" : "success"}
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {st.isPendienteIntegracion ? "Falta vincular informe" : "Vinculado al expediente"}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Cupo solicitado como referencia pública:</span>
                                  <strong className="font-mono text-foreground">
                                    {(selectedSolicitud.cupo ?? 100000).toLocaleString()} consultas (Alerta sin bloqueo)
                                  </strong>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                  <span className="text-muted-foreground">Exención contractual y tarifaria (SOL-09 Crit. 2):</span>
                                  <span className="font-semibold text-success">Sin contrato privado · Sin factura ni cobro</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <Server className="size-4 text-primary" />
                                  <span>Estado de Aprobación Final y Apigee (SOL-10 / ACC-01)</span>
                                </h3>
                                <Badge tone={st.badgeTone} appearance="soft" size="sm">
                                  {selectedSolicitud.estado}
                                </Badge>
                              </div>

                              <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">ID Operación Aprovisionamiento (TEC-00 / ACC-01):</span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {selectedSolicitud.aprovisionamiento?.referenciaTecnica || selectedSolicitud.idOperacionTec00 || "Pendiente de SOL-10"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Política Apigee (PAR-11):</span>
                                  <Badge tone="info" appearance="outline" size="sm">
                                    REFERENCIA_ALERTA_PUBLICA
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                  <span className="text-muted-foreground">Credencial Institucional (ACC-01 / ACC-03):</span>
                                  <span className="font-mono text-foreground">
                                    {selectedSolicitud.credenciales?.usuario || "Pendiente confirmación Apigee"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <FileSignature className="size-4 text-primary" />
                                  <span>1. Contrato Interinstitucional Privado Suscrito</span>
                                </h3>
                                <Badge tone="success" appearance="soft" size="sm">
                                  {selectedSolicitud.contratoDetalle?.estado || "Firmado"}
                                </Badge>
                              </div>

                              <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">ID Contrato y Versión:</span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {selectedSolicitud.contratoDetalle?.numero || selectedSolicitud.contrato || "CTR-2026-V1"}{" "}
                                    (v{selectedSolicitud.contratoDetalle?.version || 1})
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Firma Coordinador SINARP:</span>
                                  <Badge tone="success" appearance="soft" size="sm">
                                    Firmado
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Firma Máxima Autoridad DINARP:</span>
                                  <Badge tone="success" appearance="soft" size="sm">
                                    Firmado
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                  <span className="text-muted-foreground">Igualdad de cupo (SOL-04 vs Contrato):</span>
                                  <span className="font-mono font-semibold text-success">
                                    {(selectedSolicitud.cupo ?? 100000).toLocaleString()} consultas (Verificado)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                              <div className="flex items-center justify-between border-b border-border pb-3">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                  <Receipt className="size-4 text-primary" />
                                  <span>2. Facturación y Pago Confirmado (SOL-10)</span>
                                </h3>
                                <Badge
                                  tone={
                                    selectedSolicitud.estado === "Cerrada por reversión"
                                      ? "danger"
                                      : "success"
                                  }
                                  appearance="soft"
                                  size="sm"
                                >
                                  {selectedSolicitud.estado === "Cerrada por reversión"
                                    ? "Revertido (PAG-04)"
                                    : "Pago confirmado"}
                                </Badge>
                              </div>

                              <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Comprobante Electrónico (FAC-01):</span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {selectedSolicitud.factura?.numero || "FAC-001-002-000094821"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Versión Tarifaria Aplicada:</span>
                                  <span className="font-mono text-foreground">
                                    {selectedSolicitud.factura?.versionTarifaria || "TAR-2026-V2.1"}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Monto Total Facturado:</span>
                                  <strong className="text-foreground">
                                    {selectedSolicitud.factura?.valor || "$ 1,250.00"}
                                  </strong>
                                </div>
                                <div className="flex items-center justify-between py-1.5">
                                  <span className="text-muted-foreground">ID Operación Apigee (ACC-01):</span>
                                  <span className="font-mono text-foreground">
                                    {selectedSolicitud.aprovisionamiento?.referenciaTecnica || selectedSolicitud.idOperacionTec00 || "Se genera al aprobar SOL-10"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Contenido Pestaña 2: Fuentes y Campos Autorizados */}
                    {detailTab === "campos" && (
                      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs animate-in fade-in duration-150">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                          <div>
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                              <Database className="size-4 text-primary" />
                              <span>Alcance Autorizado por Campo y Fuente (SOL-04 → ACC-01)</span>
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Solo los campos aprobados en el expediente son aprovisionados en Apigee.
                            </p>
                          </div>
                          <Badge tone="primary" appearance="soft" size="sm" className="font-mono">
                            Cupo aprobado: {(selectedSolicitud.cupo ?? 100000).toLocaleString()} consultas
                          </Badge>
                        </div>

                        <div className="divide-y divide-border">
                          {(selectedSolicitud.fuentes?.flatMap((f) => f.campos || []) || []).map((c) => (
                            <div key={c.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-foreground">{c.nombre}</span>
                                  <Badge
                                    tone={c.clasificacion === "Confidencial" ? "warning" : "info"}
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {c.clasificacion}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground">
                                  <strong className="text-foreground">Finalidad justificada:</strong> {c.finalidad}
                                </p>
                              </div>
                              <Badge tone="success" appearance="soft" size="sm" className="self-start sm:self-center shrink-0">
                                Incluido en alcance Apigee
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contenido Pestaña 3: Trazabilidad */}
                    {detailTab === "trazabilidad" && (
                      <div className="space-y-4 animate-in fade-in duration-150">
                        {(st.isReadyForApprovalPublic || st.isReadyForApprovalPrivate) && (
                          <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1 text-xs">
                              <p className="font-bold text-primary flex items-center gap-1.5">
                                <ShieldCheck className="size-4 shrink-0" />
                                <span>Trazabilidad verificada y lista para Aprobación Final (SOL-10 → ACC-01)</span>
                              </p>
                              <p className="text-muted-foreground">
                                Al aprobar el expediente se validan los antecedentes, se crea el Grant OAuth 2.0 y la credencial técnica en Apigee (`ACC-01`) y se notifica «Acceso habilitado» al Coordinador SINARP (`{selectedSolicitud.coordinador}`).
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                              onClick={() => openModalAprobacion(selectedSolicitud)}
                              className="gap-1.5 shrink-0 rounded-xl shadow-xs"
                            >
                              <FileCheck2 className="size-4" />
                              <span>Aprobar, crear Grant/Credencial y notificar (SOL-10)</span>
                            </Button>
                          </div>
                        )}

                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs">
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                            <History className="size-4 text-primary" />
                            <span>Historial y Auditoría del Expediente ({selectedSolicitud.id})</span>
                          </h3>
                          <TrazabilidadTimeline historial={selectedSolicitud.historial || []} />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          ) : (
            /* ══════════════════════════════════════════════════════════
               VISTA 2: BANDEJA PRINCIPAL HOMOLOGADA A CUENTAS INTERNAS
               ══════════════════════════════════════════════════════════ */
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
              innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
            >
              {/* 1. Cabecera Principal */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-[11px]">
                      Director de Gestión · SOL-09 · SOL-10 · ACC-01
                    </Badge>
                  </div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    Formalizar accesos
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                    Constituye el expediente público de autorización (SOL-09) y otorga la aprobación final sobre expedientes públicos completos o solicitudes privadas con contrato suscrito y pago confirmado para aprovisionar credenciales en Apigee (SOL-10 / ACC-01).
                  </p>
                </div>
              </div>

              {/* 2. Tarjetas KPI Interactivas (4 Estados del Ciclo del Director de Gestión) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
                {/* KPI 1: Públicas listas */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(kpiFilter === "PUBLICAS_LISTAS" ? "ALL" : "PUBLICAS_LISTAS");
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setKpiFilter(kpiFilter === "PUBLICAS_LISTAS" ? "ALL" : "PUBLICAS_LISTAS");
                      setCurrentPage(1);
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "PUBLICAS_LISTAS"
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
                          kpiFilter === "PUBLICAS_LISTAS"
                            ? "bg-primary text-white shadow-xs"
                            : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                        )}
                      >
                        <Building2 className="size-5" />
                      </div>
                      <Badge
                        tone="primary"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        SOL-09 · Sin cobro
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Públicas por aprobar
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {totalPublicasListas}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* KPI 2: Privadas listas tras pago */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(kpiFilter === "PRIVADAS_LISTAS" ? "ALL" : "PRIVADAS_LISTAS");
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setKpiFilter(kpiFilter === "PRIVADAS_LISTAS" ? "ALL" : "PRIVADAS_LISTAS");
                      setCurrentPage(1);
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "PRIVADAS_LISTAS"
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
                          kpiFilter === "PRIVADAS_LISTAS"
                            ? "bg-info text-white shadow-xs"
                            : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                        )}
                      >
                        <FileCheck2 className="size-5" />
                      </div>
                      <Badge
                        tone="info"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        SOL-10 · Pago OK
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Privadas por aprobar
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {totalPrivadasListas}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* KPI 3: Pendientes de integración */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(
                      kpiFilter === "INTEGRACION_PENDIENTE" ? "ALL" : "INTEGRACION_PENDIENTE"
                    );
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setKpiFilter(
                        kpiFilter === "INTEGRACION_PENDIENTE" ? "ALL" : "INTEGRACION_PENDIENTE"
                      );
                      setCurrentPage(1);
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "INTEGRACION_PENDIENTE"
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
                          kpiFilter === "INTEGRACION_PENDIENTE"
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
                        Reintento idempotente
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Integración pendiente
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {totalIntegracionPendiente}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* KPI 4: Accesos aprobados */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(kpiFilter === "APROBADOS" ? "ALL" : "APROBADOS");
                    setCurrentPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setKpiFilter(kpiFilter === "APROBADOS" ? "ALL" : "APROBADOS");
                      setCurrentPage(1);
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "APROBADOS"
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
                          kpiFilter === "APROBADOS"
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
                        ACC-01 · Apigee
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Accesos habilitados
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {totalAprobados}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. Barra de Búsqueda y Filtros Combobox del UI Kit (Sin Tabs) */}
              <div className="space-y-3 w-full">
                <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
                  {/* Buscador UI Kit */}
                  <div className="flex-1 min-w-0">
                    <Search
                      size="sm"
                      placeholder="Buscar por código de trámite, institución, coordinador, proyecto o fuente..."
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

                  {/* Filtros Combobox UI Kit */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full xl:w-auto shrink-0">
                    {/* Filtro 1: Tipo de Entidad */}
                    <div className="w-full xl:w-[205px] min-w-0">
                      <Combobox
                        value={tipoFilter === "TODOS" ? null : tipoFilter}
                        onValueChange={(val) => {
                          handleSetTipoFilter(val || "TODOS");
                        }}
                        inputValue={tipoSearch}
                        onInputValueChange={(newSearch) => {
                          const opt = TIPO_ENTIDAD_OPCIONES.find((o) => o.value === newSearch);
                          if (opt) setTipoSearch(opt.label);
                          else if (newSearch === "TODOS") setTipoSearch("");
                          else setTipoSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todos los tipos"
                          showClear={tipoFilter !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[230px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>Filtrar por tipo de entidad</ComboboxLabel>
                              {filteredTiposForFilter.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs py-1.5 cursor-pointer"
                                >
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                            {filteredTiposForFilter.length === 0 && (
                              <ComboboxEmpty>No se encontraron tipos.</ComboboxEmpty>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* Filtro 2: Institución */}
                    <div className="w-full xl:w-[215px] min-w-0">
                      <Combobox
                        value={institucionFilter === "TODOS" ? null : institucionFilter}
                        onValueChange={(val) => {
                          handleSetInstitucionFilter(val || "TODOS");
                        }}
                        inputValue={institucionSearch}
                        onInputValueChange={(newSearch) => {
                          if (newSearch === "TODOS") setInstitucionSearch("");
                          else setInstitucionSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todas las instituciones"
                          showClear={institucionFilter !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[260px] z-[80]">
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

                    {/* Filtro 3: Estado del Trámite */}
                    <div className="w-full xl:w-[210px] min-w-0">
                      <Combobox
                        value={estadoFilter === "TODOS" ? null : estadoFilter}
                        onValueChange={(val) => {
                          handleSetEstadoFilter(val || "TODOS");
                        }}
                        inputValue={estadoSearch}
                        onInputValueChange={(newSearch) => {
                          if (newSearch === "TODOS") setEstadoSearch("");
                          else setEstadoSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todos los estados"
                          showClear={estadoFilter !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[250px] z-[80]">
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
                  </div>

                  <div className="flex items-center justify-end shrink-0">
                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                  </div>
                </div>

                {/* Píldoras de Filtros Activos (UI Kit) */}
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
                        <span className="max-w-[180px] sm:max-w-[260px] truncate">
                          Búsqueda: &ldquo;{searchTerm}&rdquo;
                        </span>
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

                    {tipoFilter !== "TODOS" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                      >
                        <span className="max-w-[180px] sm:max-w-[260px] truncate">
                          Tipo: {tipoFilter === "Pública" ? "Entidad Pública (SOL-09)" : "Entidad Privada (SOL-10)"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetTipoFilter("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                          aria-label="Eliminar filtro de tipo"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {institucionFilter !== "TODOS" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                      >
                        <span className="max-w-[180px] sm:max-w-[260px] truncate">
                          Institución: {institucionFilter}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetInstitucionFilter("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                          aria-label="Eliminar filtro de institución"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {kpiFilter !== "ALL" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                      >
                        <span className="max-w-[180px] sm:max-w-[260px] truncate">
                          KPI: {getKpiLabel(kpiFilter)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setKpiFilter("ALL");
                            setCurrentPage(1);
                          }}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                          aria-label="Eliminar filtro KPI"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {estadoFilter !== "TODOS" && (
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
                          onClick={() => handleSetEstadoFilter("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                          aria-label="Eliminar filtro de estado"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>

              {/* 4. Tabla Homologada con Acciones en Iconos con Tooltip */}
              <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
                <Table className="w-full min-w-[1180px]" containerClassName="overflow-x-auto w-full">
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[145px] min-w-[135px] whitespace-nowrap text-left pl-6">
                        TRÁMITE
                      </TableHead>
                      <TableHead className="w-[240px] min-w-[220px] whitespace-nowrap text-left">
                        INSTITUCIÓN / COORDINADOR
                      </TableHead>
                      <TableHead className="w-[230px] min-w-[210px] whitespace-nowrap text-left">
                        PROYECTO / FUENTE
                      </TableHead>
                      <TableHead className="w-[125px] min-w-[115px] whitespace-nowrap text-left">
                        ENTIDAD
                      </TableHead>
                      <TableHead className="w-[190px] min-w-[175px] whitespace-nowrap text-left">
                        RUTA / CUPO SOL-04
                      </TableHead>
                      <TableHead className="w-[190px] min-w-[175px] whitespace-nowrap text-left">
                        ESTADO
                      </TableHead>
                      <TableHead className="w-[145px] min-w-[135px] whitespace-nowrap text-right pr-6">
                        ACCIONES
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSolicitudes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <FileCheck2 className="size-8 stroke-[1.5] text-muted-foreground/60" />
                            <p className="text-sm font-semibold text-foreground">
                              No se encontraron expedientes de formalización
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ajusta los filtros de búsqueda o limpia los criterios activos.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedSolicitudes.map((s) => {
                        const st = getStatusHelpers(s);
                        return (
                          <TableRow
                            key={s.id}
                            onClick={() => {
                              setSelectedSolicitudId(s.id);
                              setDetailTab("expediente");
                            }}
                            className="cursor-pointer transition-colors hover:bg-muted/40"
                          >
                            <TableCell className="pl-6 font-mono text-xs align-middle">
                              <span className="font-bold text-foreground block truncate">{s.id}</span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {s.fecha}
                              </span>
                            </TableCell>

                            <TableCell className="align-middle">
                              <div className="space-y-0.5 min-w-0 pr-3">
                                <span
                                  className="font-bold text-foreground hover:text-primary transition-colors text-xs block truncate"
                                  title={s.institucion}
                                >
                                  {s.institucion}
                                </span>
                                <span className="text-[11px] text-muted-foreground block truncate">
                                  {s.coordinador}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="align-middle">
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <span className="text-xs font-medium text-foreground block truncate">
                                  {s.proyectoNombre || s.fuentePrincipal}
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate">
                                  {s.fuentePrincipal || s.fuentes?.[0]?.nombre}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell className="align-middle">
                              <Badge
                                tone={st.isPublic ? "info" : "warning"}
                                appearance="soft"
                                size="sm"
                                className="text-[11px]"
                              >
                                {s.tipoInstitucion}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-xs align-middle">
                              {st.isPublic ? (
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground text-[11px]">
                                    Expediente Público (SOL-09)
                                  </span>
                                  <span className="text-[10px] font-mono text-primary font-semibold">
                                    Ref: {(s.cupo ?? 100000).toLocaleString()} cons.
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-mono font-semibold text-foreground text-[11px] truncate">
                                    {s.contratoDetalle?.numero || s.contrato || "Contrato suscrito"}
                                  </span>
                                  <span className="text-[10px] font-mono text-primary font-semibold">
                                    Cupo: {(s.cupo ?? 100000).toLocaleString()} cons.
                                  </span>
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="align-middle">
                              <Badge
                                tone={st.badgeTone}
                                appearance="soft"
                                size="sm"
                                dot
                                className="text-[11px] max-w-full truncate"
                              >
                                <span className="truncate">{s.estado}</span>
                              </Badge>
                            </TableCell>

                            {/* Acciones homologadas con botones de icono + Tooltip */}
                            <TableCell className="text-right pr-6 align-middle" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                {/* 1. Ver expediente completo */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => {
                                        setSelectedSolicitudId(s.id);
                                        setDetailTab("expediente");
                                      }}
                                      aria-label={`Ver expediente de ${s.id}`}
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Ver expediente</TooltipContent>
                                </Tooltip>

                                {/* 2. Reintentar integración pública (SOL-09 Crit. 3) */}
                                {st.isPendienteIntegracion && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          reintentarIntegracionExpedientePublico(
                                            s.id,
                                            "Dr. Roberto Andrade (Director de Gestión)"
                                          );
                                          toast.success(
                                            "Expediente público integrado exitosamente (SOL-09 Crit. 3)"
                                          );
                                        }}
                                        aria-label={`Reintentar integración ${s.id}`}
                                        className="text-warning hover:text-warning hover:bg-warning/10"
                                      >
                                        <RefreshCw className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Reintentar integración (SOL-09)
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 3. Aprobar Final (SOL-10 -> ACC-01) */}
                                {(st.isReadyForApprovalPublic || st.isReadyForApprovalPrivate) && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => openModalAprobacion(s)}
                                          aria-label={`Dar aprobación final a ${s.id}`}
                                          className="text-success hover:text-success hover:bg-success/10"
                                        >
                                          <CheckCircle2 className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Dar aprobación final (SOL-10)
                                      </TooltipContent>
                                    </Tooltip>

                                    {/* 4. Observar / Devolver (SOL-10 Crit. 2) */}
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => {
                                            setModalDevolucion(s);
                                            setObservacionDevolucion("");
                                          }}
                                          aria-label={`Observar y devolver ${s.id}`}
                                          className="text-muted-foreground hover:text-warning hover:bg-warning/10"
                                        >
                                          <RotateCcw className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Observar / Devolver al área (SOL-10)
                                      </TooltipContent>
                                    </Tooltip>
                                  </>
                                )}

                                {/* 5. Actualizar cupo Apigee (ACC-08) */}
                                {st.canUpdateQuota && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setModalActualizarCupo(s);
                                          setNuevoCupoApigee(
                                            String((s.cupo || 100000) + 50000)
                                          );
                                        }}
                                        aria-label={`Actualizar cupo Apigee ${s.id}`}
                                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                                      >
                                        <SlidersHorizontal className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Actualizar cupo Apigee (ACC-08)
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 6. Revertir pago confirmado (PAG-04) */}
                                {st.canRevertPayment && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setModalReversionPago(s);
                                          setMotivoReversionPago("");
                                        }}
                                        aria-label={`Revertir pago ${s.id}`}
                                        className="text-muted-foreground hover:text-danger hover:bg-danger/10"
                                      >
                                        <Ban className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Revertir pago confirmado (PAG-04)
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
              </div>

              {/* Vista de Tarjetas (Móvil + Modo Cards) */}
              <div
                className={cn(
                  "w-full",
                  viewMode === "cards"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                    : "block md:hidden space-y-3.5"
                )}
              >
                {paginatedSolicitudes.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                    <FileCheck2 className="size-8 stroke-[1.5] text-muted-foreground/60" />
                    <p className="text-sm font-semibold text-foreground">
                      No se encontraron expedientes de formalización
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ajusta los filtros de búsqueda o limpia los criterios activos.
                    </p>
                  </div>
                ) : (
                  paginatedSolicitudes.map((s) => {
                    const st = getStatusHelpers(s);
                    return (
                      <InteractiveCard
                        key={s.id}
                        as="div"
                        onClick={() => {
                          setSelectedSolicitudId(s.id);
                          setDetailTab("expediente");
                        }}
                        className="p-4 flex flex-col gap-3 bg-surface border-border cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 w-full">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-foreground text-sm">
                                {s.id}
                              </span>
                              <Badge
                                tone={st.isPublic ? "info" : "warning"}
                                appearance="soft"
                                size="sm"
                              >
                                {s.tipoInstitucion}
                              </Badge>
                            </div>
                            <p className="text-xs font-semibold text-foreground mt-1 truncate">
                              {s.institucion}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {s.proyectoNombre || s.fuentePrincipal} · Cupo:{" "}
                              {(s.cupo ?? 100000).toLocaleString()} cons.
                            </p>
                          </div>
                          <Badge tone={st.badgeTone} appearance="soft" size="sm" dot>
                            {s.estado}
                          </Badge>
                        </div>

                        <div
                          className="flex items-center justify-end gap-1.5 pt-2 border-t border-border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSolicitudId(s.id);
                              setDetailTab("expediente");
                            }}
                            className="gap-1 text-xs"
                          >
                            <Eye className="size-3.5" />
                            Ver expediente
                          </Button>
                          {(st.isReadyForApprovalPublic || st.isReadyForApprovalPrivate) && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => openModalAprobacion(s)}
                              className="gap-1 text-xs"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Aprobar (SOL-10)
                            </Button>
                          )}
                        </div>
                      </InteractiveCard>
                    );
                  })
                )}
              </div>

              {/* 5. Paginación Oficial del UI Kit */}
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
          )}
        </main>

        {/* Modal Aprobación Final (SOL-10 + ACC-01/02) con Validación/Precarga y Confirmación en Pantalla */}
        <Dialog
          open={!!modalAprobacion}
          onOpenChange={(open) => {
            if (!open && aprobacionStage !== "PROVISIONING") {
              setModalAprobacion(null);
              setAprobacionStage("FORM");
              setAprobacionStepIndex(0);
            }
          }}
        >
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                {aprobacionStage === "SUCCESS" ? (
                  <>
                    <CheckCircle2 className="size-5 text-success" />
                    <span>Grant OAuth 2.0 y Credencial Creados — Coordinador Notificado</span>
                  </>
                ) : aprobacionStage === "PROVISIONING" ? (
                  <>
                    <Loader2 className="size-5 text-primary animate-spin" />
                    <span>Validando Trazabilidad y Aprovisionando en Apigee...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="size-5 text-primary" />
                    <span>Aprobación Final y Aprovisionamiento Apigee (SOL-10 → ACC-01)</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {aprobacionStage === "SUCCESS"
                  ? "La aprobación final se registró con éxito. Se aprovisionó el Grant OAuth 2.0 y la credencial institucional en Apigee (`ACC-01`) y se notificó «Acceso habilitado» al Coordinador SINARP (`AUD-01` / `ACC-03`)."
                  : aprobacionStage === "PROVISIONING"
                  ? "Verificando expediente, generando id_operacion_aprovisionamiento idempotente y creando Grant OAuth 2.0 + Credencial institucional..."
                  : "Verifica la trazabilidad e igualdad de cupo y dispara el aprovisionamiento automático en Apigee con creación de Grant OAuth 2.0, credencial institucional (`ACC-01`) y notificación al Coordinador SINARP."}
              </DialogDescription>
            </DialogHeader>

            {modalAprobacion && aprobacionStage === "FORM" && (
              <>
                <div className="space-y-4 py-2">
                  <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
                    <p>
                      <span className="text-muted-foreground">Solicitud:</span>{" "}
                      <strong className="font-mono text-foreground">{modalAprobacion.id}</strong>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Institución y Coordinador SINARP:</span>{" "}
                      <strong className="text-foreground">
                        {modalAprobacion.institucion} ({modalAprobacion.tipoInstitucion}) — {modalAprobacion.coordinador}
                      </strong>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Política de Cupo Apigee:</span>{" "}
                      <strong className="text-foreground">
                        {modalAprobacion.tipoInstitucion === "Privada"
                          ? `Cuota Bloqueante (${(modalAprobacion.cupo ?? 100000).toLocaleString()} consultas)`
                          : `Referencia Operativa y Alerta sin Bloqueo (${(modalAprobacion.cupo ?? 100000).toLocaleString()} consultas)`}
                      </strong>
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="font-semibold text-foreground">
                      Número de Resolución / Acto de Aprobación Final:
                    </label>
                    <Input
                      value={resolucionAdmin}
                      onChange={(e) => setResolucionAdmin(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-warning/30 bg-warning/10 flex items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">
                        Simular fallo inicial de Apigee en aprovisionamiento (ACC-02)
                      </p>
                      <p className="text-muted-foreground">
                        Si se activa, el trámite mostrará «Aprovisionamiento pendiente» para que TI ejecute el reintento idempotente.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={simularFalloApigee ? "danger" : "outline"}
                      onClick={() => setSimularFalloApigee(!simularFalloApigee)}
                    >
                      {simularFalloApigee ? "Fallo Activo" : "Apigee OK"}
                    </Button>
                  </div>
                </div>

                <DialogFooter stacked>
                  <Button
                    variant="neutral"
                    className="w-full"
                    onClick={() => setModalAprobacion(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    className="w-full gap-1.5"
                    onClick={handleConfirmarAprobacion}
                  >
                    <Check className="size-4" />
                    Confirmar Aprobación Final, Crear Grant/Credencial y Notificar (SOL-10)
                  </Button>
                </DialogFooter>
              </>
            )}

            {modalAprobacion && aprobacionStage === "PROVISIONING" && (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 space-y-3">
                  {[
                    {
                      idx: 0,
                      title: "1. Validando trazabilidad completa e igualdad de cupo (SOL-04 / SOL-09 / SOL-10)",
                      desc: `Verificando antecedentes del expediente ${modalAprobacion.id} y cupo autorizado de ${(modalAprobacion.cupo ?? 100000).toLocaleString()} consultas.`,
                    },
                    {
                      idx: 1,
                      title: "2. Registrando resolución administrativa e id_operacion_aprovisionamiento (TEC-00)",
                      desc: `Acto ${resolucionAdmin} · Clave idempotente OP-APG-2026-${modalAprobacion.id.slice(-3)}.`,
                    },
                    {
                      idx: 2,
                      title: "3. Creando Grant OAuth 2.0 (client_credentials) y Developer App en Apigee (ACC-01)",
                      desc: `Configurando alcance de campos autorizados y política ${modalAprobacion.tipoInstitucion === "Privada" ? "BLOQUEANTE_PRIVADA" : "REFERENCIA_ALERTA_PUBLICA"}.`,
                    },
                    {
                      idx: 3,
                      title: "4. Emitiendo credencial institucional (ACC-09) y notificando al Coordinador SINARP (AUD-01)",
                      desc: `Enviando confirmación de Acceso habilitado a ${modalAprobacion.coordinador} (${modalAprobacion.institucion}).`,
                    },
                  ].map((item) => {
                    const isDone = aprobacionStepIndex > item.idx;
                    const isCurrent = aprobacionStepIndex === item.idx;
                    return (
                      <div
                        key={item.idx}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-start gap-3 text-xs",
                          isDone
                            ? "bg-success/10 border-success/30 text-foreground"
                            : isCurrent
                            ? "bg-surface border-primary shadow-2xs text-foreground"
                            : "bg-surface/60 border-border/60 text-muted-foreground opacity-60"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : isCurrent ? (
                            <Loader2 className="size-4 text-primary animate-spin" />
                          ) : (
                            <div className="size-4 rounded-full border border-border" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-bold leading-snug">{item.title}</p>
                          <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {modalAprobacion && aprobacionStage === "SUCCESS" && (() => {
              const updatedSol = solicitudes.find((s) => s.id === modalAprobacion.id) || modalAprobacion;
              const cleanName = updatedSol.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10);
              const clientId = updatedSol.credenciales?.usuario || `ws_${cleanName}_${updatedSol.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
              const idOp = updatedSol.aprovisionamiento?.referenciaTecnica || updatedSol.idOperacionTec00 || `OP-APG-2026-${updatedSol.id.slice(-3)}`;

              return (
                <>
                  <div className="space-y-4 py-2 text-xs">
                    <div className="p-4 rounded-2xl border border-success/40 bg-success/10 space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-success/25 pb-2.5">
                        <span className="font-bold text-success flex items-center gap-1.5">
                          <KeyRound className="size-4" />
                          <span>Grant OAuth 2.0 y Credencial Aprovisionados (ACC-01)</span>
                        </span>
                        <Badge tone="success" appearance="soft" size="sm" dot>
                          Acceso habilitado
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="text-[10px] text-muted-foreground block">Client ID / Usuario Técnico</span>
                          <span className="font-mono font-bold text-foreground block truncate">{clientId}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="text-[10px] text-muted-foreground block">Grant OAuth 2.0</span>
                          <span className="font-semibold text-foreground block truncate">Client Credentials · Bearer Token</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="text-[10px] text-muted-foreground block">Secreto Temporal Inicial (ACC-09)</span>
                          <span className="font-semibold text-warning block">Almacenado en bóveda (1 sola visualización)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-border">
                          <span className="text-[10px] text-muted-foreground block">ID Operación Idempotente (TEC-00)</span>
                          <span className="font-mono font-bold text-foreground block">{idOp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/10 flex items-start gap-3">
                      <BellRing className="size-4 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground">
                          Notificación enviada al Coordinador SINARP (AUD-01 / ACC-03)
                        </p>
                        <p className="text-muted-foreground">
                          Se notificó a <strong className="text-foreground">{updatedSol.coordinador}</strong> ({updatedSol.institucion}) que la solicitud <strong className="font-mono text-foreground">{updatedSol.id}</strong> cambió a estado <strong className="text-success">Acceso habilitado</strong> y su credencial ya está disponible para consumo e intercambio de secreto temporal.
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter stacked>
                    <Button
                      variant="neutral"
                      className="w-full"
                      onClick={() => {
                        setModalAprobacion(null);
                        setAprobacionStage("FORM");
                        setAprobacionStepIndex(0);
                      }}
                    >
                      Cerrar y volver a la bandeja
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full gap-1.5"
                      onClick={() => {
                        const targetId = modalAprobacion.id;
                        setModalAprobacion(null);
                        setAprobacionStage("FORM");
                        setAprobacionStepIndex(0);
                        setSelectedSolicitudId(targetId);
                        setDetailTab("trazabilidad");
                      }}
                    >
                      <History className="size-4" />
                      Ver expediente y trazabilidad actualizada
                    </Button>
                  </DialogFooter>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Modal Observar y Devolver al Área Correspondiente (SOL-10 Crit. 2) */}
        <Dialog
          open={!!modalDevolucion}
          onOpenChange={(open) => !open && setModalDevolucion(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Observar y Devolver Solicitud (SOL-10 Crit. 2)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Seleccione el área responsable a la cual se devuelve el expediente{" "}
                <strong>{modalDevolucion?.id}</strong>. No se ejecuta rechazo definitivo ni ACC-01.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Área de Destino:</label>
                <div className="flex gap-2">
                  {(["Gestión", "Normatividad", "Jurídica"] as const).map((area) => (
                    <Button
                      key={area}
                      type="button"
                      size="sm"
                      variant={areaDestinoDevolucion === area ? "primary" : "outline"}
                      onClick={() => setAreaDestinoDevolucion(area)}
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Observación Motivada (Obligatoria):
                </label>
                <Textarea
                  rows={3}
                  placeholder="Detalle la discrepancia o requisito específico pendiente..."
                  value={observacionDevolucion}
                  onChange={(e) => setObservacionDevolucion(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter stacked>
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => setModalDevolucion(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="w-full"
                disabled={!observacionDevolucion.trim()}
                onClick={handleConfirmarDevolucion}
              >
                Devolver a {areaDestinoDevolucion}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Revertir Pago Confirmado (PAG-04) */}
        <Dialog
          open={!!modalReversionPago}
          onOpenChange={(open) => !open && setModalReversionPago(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Revertir Pago Confirmado y Cerrar Trámite (PAG-04)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Al registrar un contracargo o anulación confirmada sobre{" "}
                <strong>{modalReversionPago?.id}</strong>, la solicitud pasa a{" "}
                <strong>Cerrada por reversión</strong> y suspende la credencial en Apigee (`ACC-06`).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <label className="font-semibold text-foreground">
                Motivo y Referencia de Reversión / Contracargo:
              </label>
              <Textarea
                rows={3}
                placeholder="Ej: Notificación bancaria de reversión REV-2026-991..."
                value={motivoReversionPago}
                onChange={(e) => setMotivoReversionPago(e.target.value)}
              />
            </div>
            <DialogFooter stacked>
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => setModalReversionPago(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="w-full"
                disabled={!motivoReversionPago.trim()}
                onClick={handleConfirmarReversionPago}
              >
                Confirmar Reversión y Cerrar (PAG-04)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Actualizar Alcance / Cupo en Apigee (ACC-08) */}
        <Dialog
          open={!!modalActualizarCupo}
          onOpenChange={(open) => !open && setModalActualizarCupo(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-foreground">
                Actualizar Alcance o Cupo Autorizado en Apigee (ACC-08)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Sincroniza la modificación aprobada de cupo con el API Product de{" "}
                <strong>{modalActualizarCupo?.institucion}</strong> en Apigee.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Nuevo Cupo Autorizado Vigente (`cupo_autorizado_vigente`):
                </label>
                <Input
                  type="number"
                  value={nuevoCupoApigee}
                  onChange={(e) => setNuevoCupoApigee(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Justificación / Acto Modificatorio:
                </label>
                <Textarea
                  rows={3}
                  value={motivoActualizacionCupo}
                  onChange={(e) => setMotivoActualizacionCupo(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter stacked>
              <Button
                variant="neutral"
                className="w-full"
                onClick={() => setModalActualizarCupo(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleConfirmarActualizarCupo}
              >
                Sincronizar Nuevo Cupo en Apigee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </WireframeDashboardLayout>
  );
}
