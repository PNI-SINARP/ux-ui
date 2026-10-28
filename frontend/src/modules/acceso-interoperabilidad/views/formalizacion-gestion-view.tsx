"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { TrazabilidadTimeline } from "../components/trazabilidad-timeline";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<"TODAS" | "PUBLICA" | "PRIVADA">("TODAS");
  const [kpiFilter, setKpiFilter] = useState<"ALL" | "PUBLICAS_LISTAS" | "PRIVADAS_LISTAS" | "EXCEPCIONES">("ALL");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Vista de expediente inline (como Asignar cambios)
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"expediente" | "campos" | "trazabilidad">("expediente");

  // Modales de acciones operativas
  const [modalAprobacion, setModalAprobacion] = useState<SolicitudAcceso | null>(null);
  const [resolucionAdmin, setResolucionAdmin] = useState("RESOLUCION-DINARP-DIR-2026-089");
  const [simularFalloApigee, setSimularFalloApigee] = useState(false);

  const [modalDevolucion, setModalDevolucion] = useState<SolicitudAcceso | null>(null);
  const [areaDestinoDevolucion, setAreaDestinoDevolucion] = useState<"Gestión" | "Normatividad" | "Jurídica">("Jurídica");
  const [observacionDevolucion, setObservacionDevolucion] = useState("");

  const [modalReversionPago, setModalReversionPago] = useState<SolicitudAcceso | null>(null);
  const [motivoReversionPago, setMotivoReversionPago] = useState("");

  const [modalActualizarCupo, setModalActualizarCupo] = useState<SolicitudAcceso | null>(null);
  const [nuevoCupoApigee, setNuevoCupoApigee] = useState("250000");
  const [motivoActualizacionCupo, setMotivoActualizacionCupo] = useState("Ampliación autorizada por convenio modificatorio");

  // Solicitudes que están en etapa de Formalización / Aprobación Final / Habilitación
  const solicitudesFormalizacion = useMemo(() => {
    return solicitudes.filter(
      (s) =>
        s.estado === "Aprobada por Gestión" ||
        s.estado === "Aprobada por Normatividad" ||
        s.estado === "Pendiente de integración" ||
        s.estado === "En formalización" ||
        s.estado === "Pendiente de plantilla" ||
        s.estado === "Pendiente de firma" ||
        s.estado === "Pendiente de firma de contrato" ||
        s.estado === "Contrato firmado" ||
        s.estado === "Pendiente de pago" ||
        s.estado === "Pago pendiente" ||
        s.estado === "Divergencia de facturación" ||
        s.estado === "Pago en validación" ||
        s.estado === "Pago en verificación" ||
        s.estado === "Pago bloqueado por intentos" ||
        s.estado === "En conciliación" ||
        s.estado === "Pago verificado" ||
        s.estado === "Pago validado" ||
        s.estado === "Aprobación final" ||
        s.estado === "Solicitud aprobada — habilitación técnica pendiente" ||
        s.estado === "Habilitación técnica" ||
        s.estado === "Acceso habilitado" ||
        s.estado === "Acceso generado" ||
        s.estado === "Acceso suspendido" ||
        s.estado === "Cerrada por reversión"
    );
  }, [solicitudes]);

  const selectedSolicitud = useMemo(
    () => solicitudes.find((s) => s.id === selectedSolicitudId) || null,
    [solicitudes, selectedSolicitudId]
  );

  // KPIs
  const totalPublicasListas = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.tipoInstitucion === "Pública" &&
          (s.estado === "Aprobada por Gestión" ||
            s.estado === "Aprobada por Normatividad" ||
            s.estado === "En formalización" ||
            s.estado === "Aprobación final")
      ).length,
    [solicitudesFormalizacion]
  );

  const totalPrivadasListas = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago verificado" || s.estado === "Pago validado")
      ).length,
    [solicitudesFormalizacion]
  );

  const totalExcepcionesPendientes = useMemo(
    () =>
      solicitudesFormalizacion.filter(
        (s) =>
          s.estado === "Pendiente de integración" ||
          s.estado === "Divergencia de facturación" ||
          s.estado === "Pago bloqueado por intentos" ||
          s.estado === "En conciliación"
      ).length,
    [solicitudesFormalizacion]
  );

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>();
    solicitudesFormalizacion.forEach((s) => set.add(s.estado));
    return ["TODOS", ...Array.from(set)];
  }, [solicitudesFormalizacion]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesFormalizacion.filter((s) => {
      const matchTab =
        activeTab === "TODAS" ||
        (activeTab === "PUBLICA" && s.tipoInstitucion === "Pública") ||
        (activeTab === "PRIVADA" && s.tipoInstitucion === "Privada");

      const matchKpi =
        kpiFilter === "ALL" ||
        (kpiFilter === "PUBLICAS_LISTAS" &&
          s.tipoInstitucion === "Pública" &&
          (s.estado === "Aprobada por Gestión" ||
            s.estado === "Aprobada por Normatividad" ||
            s.estado === "En formalización" ||
            s.estado === "Aprobación final")) ||
        (kpiFilter === "PRIVADAS_LISTAS" &&
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago verificado" || s.estado === "Pago validado")) ||
        (kpiFilter === "EXCEPCIONES" &&
          (s.estado === "Pendiente de integración" ||
            s.estado === "Divergencia de facturación" ||
            s.estado === "Pago bloqueado por intentos" ||
            s.estado === "En conciliación"));

      const matchEstado = estadoFilter === "TODOS" || s.estado === estadoFilter;

      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.institucion.toLowerCase().includes(q) ||
        (s.proyectoNombre || "").toLowerCase().includes(q) ||
        (s.fuentePrincipal || "").toLowerCase().includes(q);

      return matchTab && matchKpi && matchEstado && matchSearch;
    });
  }, [solicitudesFormalizacion, activeTab, kpiFilter, estadoFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredSolicitudes.length / itemsPerPage));
  const paginatedSolicitudes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSolicitudes.slice(start, start + itemsPerPage);
  }, [filteredSolicitudes, currentPage, itemsPerPage]);

  const hasActiveFilters =
    activeTab !== "TODAS" ||
    kpiFilter !== "ALL" ||
    estadoFilter !== "TODOS" ||
    searchTerm.trim() !== "";

  const clearAllFilters = () => {
    setActiveTab("TODAS");
    setKpiFilter("ALL");
    setEstadoFilter("TODOS");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handlers de modales
  const handleConfirmarAprobacion = () => {
    if (!modalAprobacion) return;
    aprobarFinalGestion(modalAprobacion.id, {
      resolucionNumero: resolucionAdmin,
      directorNombre: "Dr. Roberto Andrade (Director de Gestión de la Información)",
      simularFalloApigee,
    });
    if (simularFalloApigee) {
      toast.warning("Solicitud aprobada con fallo simulado en Apigee (SOL-10 → ACC-02)", {
        description:
          "Aprovisionamiento pendiente: El Equipo TI puede reintentar sobre el mismo id_operacion_aprovisionamiento.",
      });
    } else {
      toast.success("Solicitud aprobada; habilitación técnica completada en Apigee (SOL-10 → ACC-01)", {
        description:
          "Se aprovisionó la credencial institucional con secreto temporal inicial en el almacén protegido.",
      });
    }
    setModalAprobacion(null);
    setSimularFalloApigee(false);
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
        s.estado === "Aprobación final");
    const isReadyForApprovalPrivate =
      !isPublic && (s.estado === "Pago verificado" || s.estado === "Pago validado");
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
      : isPendienteIntegracion ||
        s.estado === "Divergencia de facturación" ||
        s.estado === "Pago bloqueado por intentos" ||
        s.estado === "Cerrada por reversión"
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
      <TooltipProvider>
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          {selectedSolicitud ? (
            /* ══════════════════════════════════════════════════════════
               VISTA 1: EXPEDIENTE DEL TRÁMITE INLINE (1 CONTENEDOR CON TABS)
               ══════════════════════════════════════════════════════════ */
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 animate-in fade-in duration-200"
              innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
            >
              {(() => {
                const st = getStatusHelpers(selectedSolicitud);
                return (
                  <>
                    {/* Cabecera de Retorno y Acciones Contextuales (que abren Modales) */}
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
                              onClick={() => {
                                setResolucionAdmin(
                                  `RESOLUCION-DINARP-DIR-2026-${selectedSolicitud.id.replace(
                                    "SOL-2026-",
                                    ""
                                  )}`
                                );
                                setSimularFalloApigee(false);
                                setModalAprobacion(selectedSolicitud);
                              }}
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

                    {/* Pestañas Píldora del Expediente */}
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
                                : "1. Ruta Contractual y Financiera (DOC / FAC / PAG / SOL-10)"}
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
                                  <span>1. Contrato Interinstitucional Privado (DOC-01..03)</span>
                                </h3>
                                <Badge
                                  tone={
                                    selectedSolicitud.contratoDetalle?.estado === "Firmado" || selectedSolicitud.contrato
                                      ? "success"
                                      : "warning"
                                  }
                                  appearance="soft"
                                  size="sm"
                                >
                                  {selectedSolicitud.contratoDetalle?.estado ||
                                    (selectedSolicitud.contrato ? "Firmado" : "Pendiente")}
                                </Badge>
                              </div>

                              <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">ID Contrato y Versión:</span>
                                  <span className="font-mono font-semibold text-foreground">
                                    {selectedSolicitud.contratoDetalle?.numero || selectedSolicitud.contrato || "Sin generar"}{" "}
                                    (v{selectedSolicitud.contratoDetalle?.version || 1})
                                  </span>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Firma Coordinador SINARP:</span>
                                  <Badge
                                    tone={selectedSolicitud.contratoDetalle?.firmadoCoordinador ? "success" : "warning"}
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {selectedSolicitud.contratoDetalle?.firmadoCoordinador ? "Firmado" : "Pendiente"}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                                  <span className="text-muted-foreground">Firma Máxima Autoridad DINARP:</span>
                                  <Badge
                                    tone={selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad ? "success" : "warning"}
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad ? "Firmado" : "Pendiente"}
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
                                  <span>2. Facturación API y Pasarela (FAC-01 / PAG-02)</span>
                                </h3>
                                <Badge
                                  tone={
                                    selectedSolicitud.estado === "Pago verificado" ||
                                    selectedSolicitud.estado === "Pago validado" ||
                                    selectedSolicitud.estado === "Acceso habilitado" ||
                                    selectedSolicitud.estado === "Acceso generado"
                                      ? "success"
                                      : "warning"
                                  }
                                  appearance="soft"
                                  size="sm"
                                >
                                  {selectedSolicitud.estado === "Pago verificado" ||
                                  selectedSolicitud.estado === "Pago validado" ||
                                  selectedSolicitud.estado === "Acceso habilitado" ||
                                  selectedSolicitud.estado === "Acceso generado"
                                    ? "Pago confirmado"
                                    : selectedSolicitud.estado}
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
                              Solo los campos y modalidades aprobados en el expediente son aprovisionados en Apigee.
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
                      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-2xs animate-in fade-in duration-150">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
                          <History className="size-4 text-primary" />
                          <span>Historial y Auditoría del Expediente ({selectedSolicitud.id})</span>
                        </h3>
                        <TrazabilidadTimeline historial={selectedSolicitud.historial || []} />
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          ) : (
            /* ══════════════════════════════════════════════════════════
               VISTA 2: BANDEJA PRINCIPAL EN 1 CONTENEDOR (COMO ASIGNAR CAMBIOS)
               ══════════════════════════════════════════════════════════ */
            <Card
              className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
              innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
            >
              {/* 1. Cabecera Principal */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="primary" appearance="soft" size="sm" className="font-semibold text-[11px]">
                      Director de Gestión · SOL-09 · SOL-10 · ACC-01
                    </Badge>
                  </div>
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    Formalizar accesos
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
                    Constituye el expediente público de autorización (SOL-09) y verifica la ruta completa antes de dar la aprobación final y aprovisionar en Apigee (SOL-10 / ACC-01).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Link href="/formalizacion/contratos">
                      <FileSignature className="size-4 text-primary" />
                      <span>Contratos Privados (DOC-01..03)</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2 rounded-xl">
                    <Link href="/acceso-consumo">
                      <Server className="size-4 text-primary" />
                      <span>Aprovisionamiento TI (ACC-02/03)</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 2. Tarjetas KPI Interactivas Horizontales (Estilo Asignar cambios) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 w-full">
                {/* KPI 1: Públicas listas */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(kpiFilter === "PUBLICAS_LISTAS" ? "ALL" : "PUBLICAS_LISTAS");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "PUBLICAS_LISTAS"
                      ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                      : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
                  )}
                  innerClassName="p-0 h-full justify-center"
                >
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                          kpiFilter === "PUBLICAS_LISTAS"
                            ? "bg-primary text-white shadow-xs"
                            : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                        )}
                      >
                        <Building2 className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            Públicas listas (SOL-09)
                          </h3>
                          {kpiFilter === "PUBLICAS_LISTAS" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-normal truncate">
                          Expediente público sin contrato ni pago
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-heading font-extrabold text-3xl sm:text-4xl text-primary tracking-tight block leading-none">
                        {totalPublicasListas}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                        expedientes
                      </span>
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
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "PRIVADAS_LISTAS"
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
                          kpiFilter === "PRIVADAS_LISTAS"
                            ? "bg-success text-white shadow-xs"
                            : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                        )}
                      >
                        <CheckCircle2 className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-success transition-colors truncate">
                            Privadas listas (SOL-10)
                          </h3>
                          {kpiFilter === "PRIVADAS_LISTAS" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-success/20 text-success border border-success/30 shrink-0">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-normal truncate">
                          Contrato firmado + factura + pago validado
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-heading font-extrabold text-3xl sm:text-4xl text-success tracking-tight block leading-none">
                        {totalPrivadasListas}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                        solicitudes
                      </span>
                    </div>
                  </div>
                </Card>

                {/* KPI 3: Excepciones / Pendientes integración */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setKpiFilter(kpiFilter === "EXCEPCIONES" ? "ALL" : "EXCEPCIONES");
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    kpiFilter === "EXCEPCIONES"
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
                          kpiFilter === "EXCEPCIONES"
                            ? "bg-warning text-white shadow-xs"
                            : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                        )}
                      >
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-foreground group-hover:text-warning transition-colors truncate">
                            Excepciones activas
                          </h3>
                          {kpiFilter === "EXCEPCIONES" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-warning/20 text-warning border border-warning/30 shrink-0">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-normal truncate">
                          Integración pendiente (SOL-09) o conciliación
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-heading font-extrabold text-3xl sm:text-4xl text-warning tracking-tight block leading-none">
                        {totalExcepcionesPendientes}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                        casos
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 3. Barra de Pestañas, Búsqueda y Filtros */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => {
                      setActiveTab(v as typeof activeTab);
                      setCurrentPage(1);
                    }}
                    className="w-full lg:w-auto"
                  >
                    <TabsList className="h-auto p-1 rounded-full bg-muted/60 border border-border inline-flex gap-1">
                      <TabsTrigger
                        value="TODAS"
                        className="px-4 py-1.5 text-xs font-bold rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white"
                      >
                        Todas ({solicitudesFormalizacion.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="PUBLICA"
                        className="px-4 py-1.5 text-xs font-bold rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white"
                      >
                        Públicas · SOL-09
                      </TabsTrigger>
                      <TabsTrigger
                        value="PRIVADA"
                        className="px-4 py-1.5 text-xs font-bold rounded-full data-[state=active]:bg-primary-300 data-[state=active]:text-white"
                      >
                        Privadas · DOC + FAC + PAG
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex flex-wrap sm:flex-nowrap items-end gap-2.5 w-full lg:w-auto">
                    <div className="w-full sm:w-64 lg:w-72">
                      <Search
                        size="sm"
                        placeholder="Buscar por código, institución o proyecto..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        onClear={() => {
                          setSearchTerm("");
                          setCurrentPage(1);
                        }}
                        className="bg-surface border-border/80 shadow-2xs h-9 text-xs w-full rounded-full"
                      />
                    </div>

                    <div className="w-full sm:w-52">
                      <Combobox
                        value={estadoFilter}
                        onValueChange={(val) => {
                          setEstadoFilter(val || "TODOS");
                          setCurrentPage(1);
                        }}
                      >
                        <ComboboxInput
                          placeholder="Filtrar estado..."
                          className="h-9 text-xs bg-surface rounded-full border-border/80 px-2 shadow-2xs"
                        />
                        <ComboboxContent align="start" className="w-64 rounded-xl">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel className="text-[11px] px-3 py-1 font-bold text-muted-foreground">
                                Estado del Trámite
                              </ComboboxLabel>
                              {estadosDisponibles.map((est) => (
                                <ComboboxItem key={est} value={est} className="text-xs py-2 px-3">
                                  {est === "TODOS" ? "Todos los estados" : est}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                            <ComboboxEmpty className="text-xs py-2 px-3">Sin resultados</ComboboxEmpty>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <ViewModeToggle value={viewMode} onChange={setViewMode} />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">
                      Mostrando resultados filtrados por:
                    </span>
                    {activeTab !== "TODAS" && (
                      <Badge tone="primary" appearance="soft" className="gap-1.5 px-3 py-1 text-xs rounded-full">
                        <span>Tipo: {activeTab === "PUBLICA" ? "Pública (SOL-09)" : "Privada"}</span>
                        <X className="size-3.5 cursor-pointer" onClick={() => setActiveTab("TODAS")} />
                      </Badge>
                    )}
                    {kpiFilter !== "ALL" && (
                      <Badge tone="info" appearance="soft" className="gap-1.5 px-3 py-1 text-xs rounded-full">
                        <span>Filtro KPI: {kpiFilter}</span>
                        <X className="size-3.5 cursor-pointer" onClick={() => setKpiFilter("ALL")} />
                      </Badge>
                    )}
                    {estadoFilter !== "TODOS" && (
                      <Badge tone="neutral" appearance="soft" className="gap-1.5 px-3 py-1 text-xs rounded-full border border-border">
                        <span>Estado: {estadoFilter}</span>
                        <X className="size-3.5 cursor-pointer" onClick={() => setEstadoFilter("TODOS")} />
                      </Badge>
                    )}
                    {searchTerm.trim() !== "" && (
                      <Badge tone="neutral" appearance="soft" className="gap-1.5 px-3 py-1 text-xs rounded-full border border-border">
                        <span>Búsqueda: &quot;{searchTerm}&quot;</span>
                        <X className="size-3.5 cursor-pointer" onClick={() => setSearchTerm("")} />
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 rounded-full"
                    >
                      Restablecer todos
                    </Button>
                  </div>
                )}
              </div>

              {/* 4. Tabla Homologada con Acciones en Iconos con Tooltip */}
              <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
                <Table className="w-full table-fixed min-w-[1120px]" containerClassName="overflow-x-auto rounded-xl">
                  <TableHeader>
                    <TableRow className="border-0 h-11">
                      <TableHead className="w-[130px] px-3 py-2.5 whitespace-nowrap">TRÁMITE</TableHead>
                      <TableHead className="w-[220px] px-3 py-2.5 whitespace-nowrap">INSTITUCIÓN</TableHead>
                      <TableHead className="w-[210px] px-3 py-2.5 whitespace-nowrap">PROYECTO / FUENTE</TableHead>
                      <TableHead className="w-[115px] px-3 py-2.5 whitespace-nowrap">ENTIDAD</TableHead>
                      <TableHead className="w-[170px] px-3 py-2.5 whitespace-nowrap">RUTA / REQUISITOS</TableHead>
                      <TableHead className="w-[180px] px-3 py-2.5 whitespace-nowrap">ESTADO</TableHead>
                      <TableHead className="w-[140px] text-right pr-4">ACCIONES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSolicitudes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <FileCheck2 className="size-8 stroke-1 text-muted-foreground/60" />
                            <p className="text-sm font-medium">
                              No hay solicitudes en esta bandeja con los filtros seleccionados.
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
                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                          >
                            <TableCell className="px-3 font-mono text-xs">
                              <span className="font-bold text-foreground block truncate">{s.id}</span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {s.fecha}
                              </span>
                            </TableCell>

                            <TableCell className="px-3">
                              <span className="font-semibold text-foreground text-xs block truncate" title={s.institucion}>
                                {s.institucion}
                              </span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {s.coordinador}
                              </span>
                            </TableCell>

                            <TableCell className="px-3">
                              <span className="text-xs font-medium text-foreground block truncate">
                                {s.proyectoNombre || s.fuentePrincipal}
                              </span>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {s.fuentePrincipal || s.fuentes?.[0]?.nombre}
                              </span>
                            </TableCell>

                            <TableCell className="px-3">
                              <Badge
                                tone={st.isPublic ? "info" : "warning"}
                                appearance="soft"
                                size="sm"
                                className="text-[11px]"
                              >
                                {s.tipoInstitucion}
                              </Badge>
                            </TableCell>

                            <TableCell className="px-3 text-xs">
                              {st.isPublic ? (
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground text-[11px]">
                                    Convenio Público (SOL-09)
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Ref: {(s.cupo ?? 100000).toLocaleString()} cons.
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="font-mono font-semibold text-foreground text-[11px] truncate">
                                    {s.contratoDetalle?.numero || s.contrato || "Sin contrato"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    Cupo: {(s.cupo ?? 100000).toLocaleString()} cons.
                                  </span>
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="px-3">
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
                            <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
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
                                      className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10"
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
                                          onClick={() => {
                                            setResolucionAdmin(
                                              `RESOLUCION-DINARP-DIR-2026-${s.id.replace(
                                                "SOL-2026-",
                                                ""
                                              )}`
                                            );
                                            setSimularFalloApigee(false);
                                            setModalAprobacion(s);
                                          }}
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
                                        className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10"
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
                {paginatedSolicitudes.map((s) => {
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
                        <div>
                          <div className="flex items-center gap-2">
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
                          <p className="text-xs font-semibold text-foreground mt-0.5">
                            {s.institucion}
                          </p>
                        </div>
                        <Badge tone={st.badgeTone} appearance="soft" size="sm" dot>
                          {s.estado}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
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
                            onClick={() => setModalAprobacion(s)}
                            className="gap-1 text-xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            Aprobar (SOL-10)
                          </Button>
                        )}
                      </div>
                    </InteractiveCard>
                  );
                })}
              </div>

              {/* 5. Paginación Inferior Homologada */}
              {filteredSolicitudes.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Mostrando {paginatedSolicitudes.length} de {filteredSolicitudes.length} expedientes
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <span className="text-xs font-semibold px-2 text-foreground">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </main>

        {/* Modal Aprobación Final (SOL-10 + ACC-01/02) */}
        <Dialog
          open={!!modalAprobacion}
          onOpenChange={(open) => !open && setModalAprobacion(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="size-5 text-primary" />
                <span>Aprobación Final y Aprovisionamiento Apigee (SOL-10 → ACC-01)</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Verifica igualdad de cupo y dispara el aprovisionamiento automático en Apigee con idempotencia (`id_operacion_aprovisionamiento`) y secreto temporal (`ACC-01`).
              </DialogDescription>
            </DialogHeader>

            {modalAprobacion && (
              <div className="space-y-4 py-2">
                <div className="p-3.5 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
                  <p>
                    <span className="text-muted-foreground">Solicitud:</span>{" "}
                    <strong className="font-mono text-foreground">{modalAprobacion.id}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Institución:</span>{" "}
                    <strong className="text-foreground">
                      {modalAprobacion.institucion} ({modalAprobacion.tipoInstitucion})
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
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setModalAprobacion(null)}>
                Cancelar
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmarAprobacion} className="gap-1.5">
                <Check className="size-4" />
                Confirmar Aprobación Final (SOL-10)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Observar y Devolver al Área Correspondiente (SOL-10 Crit. 2) */}
        <Dialog
          open={!!modalDevolucion}
          onOpenChange={(open) => !open && setModalDevolucion(null)}
        >
          <DialogContent className="max-w-md">
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

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setModalDevolucion(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
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
          <DialogContent className="max-w-md">
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
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setModalReversionPago(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!motivoReversionPago.trim()}
                onClick={handleConfirmarReversionPago}
              >
                Confirmar Reversión y Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Actualizar Alcance / Cupo en Apigee (ACC-08) */}
        <Dialog
          open={!!modalActualizarCupo}
          onOpenChange={(open) => !open && setModalActualizarCupo(null)}
        >
          <DialogContent className="max-w-md">
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
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setModalActualizarCupo(null)}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmarActualizarCupo}>
                Sincronizar Nuevo Cupo en Apigee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </WireframeDashboardLayout>
  );
}
