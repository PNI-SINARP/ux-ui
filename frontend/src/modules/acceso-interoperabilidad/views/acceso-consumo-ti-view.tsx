"use client";

import React, { useState, useMemo } from "react";
import {
  Server,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Eye,
  RefreshCw,
  Ban,
  SlidersHorizontal,
  Unlock,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { TrazabilidadTimeline } from "@/modules/acceso-interoperabilidad/components/trazabilidad-timeline";
import { CredencialTecnicaModal } from "@/modules/acceso-interoperabilidad/components/credencial-tecnica-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export function AccesoConsumoTIView() {
  const {
    solicitudes,
    reintentarAprovisionamiento,
    suspenderRevocarAccesoTecnico,
    actualizarAlcanceCupoApigee,
  } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);

  // Expediente inline dentro del único contenedor
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expedienteTab, setExpedienteTab] = useState<string>("apigee");

  // Modales operativos
  const [credencialModalSolicitud, setCredencialModalSolicitud] =
    useState<SolicitudAcceso | null>(null);
  const [reintentandoId, setReintentandoId] = useState<string | null>(null);

  // Modal Suspender / Revocar / Reactivar en Apigee (ACC-06)
  const [modalAccionApigee, setModalAccionApigee] = useState<{
    solicitud: SolicitudAcceso;
    tipoAccion: "SUSPENDER" | "REVOCAR" | "REACTIVAR";
  } | null>(null);
  const [causaAccionApigee, setCausaAccionApigee] = useState("");

  // Modal Actualizar Alcance / Cupo en Apigee (ACC-08)
  const [modalCupoApigee, setModalCupoApigee] =
    useState<SolicitudAcceso | null>(null);
  const [nuevoCupoValor, setNuevoCupoValor] = useState("150000");
  const [motivoCupoValor, setMotivoCupoValor] = useState(
    "Actualización sincronizada de cuota operativa en API Product de Apigee."
  );

  // Filtrar solicitudes con ciclo técnico en Apigee
  const solicitudesTecnicas = useMemo(() => {
    return solicitudes.filter((s) => {
      const est = s.estado;
      return (
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado" ||
        est === "Acceso generado" ||
        est === "Acceso suspendido" ||
        est === "Acceso revocado" ||
        est === "Cerrada por reversión" ||
        s.aprovisionamiento !== undefined ||
        s.credenciales !== undefined
      );
    });
  }, [solicitudes]);

  const selectedSolicitud = useMemo(
    () => solicitudesTecnicas.find((s) => s.id === selectedId) || null,
    [solicitudesTecnicas, selectedId]
  );

  const totalFallos = useMemo(
    () =>
      solicitudesTecnicas.filter(
        (s) =>
          s.aprovisionamiento?.estado === "ERROR" ||
          !!s.credenciales?.alertaIncidenteSeguridad
      ).length,
    [solicitudesTecnicas]
  );

  const totalHabilitados = useMemo(
    () =>
      solicitudesTecnicas.filter(
        (s) => s.estado === "Acceso habilitado" || s.estado === "Acceso generado"
      ).length,
    [solicitudesTecnicas]
  );

  const totalSuspendidos = useMemo(
    () =>
      solicitudesTecnicas.filter(
        (s) =>
          s.estado === "Acceso suspendido" ||
          s.estado === "Acceso revocado" ||
          s.estado === "Cerrada por reversión"
      ).length,
    [solicitudesTecnicas]
  );

  const filtered = useMemo(() => {
    return solicitudesTecnicas.filter((s) => {
      const isFallo =
        s.aprovisionamiento?.estado === "ERROR" ||
        !!s.credenciales?.alertaIncidenteSeguridad;
      const isSuspendidoRevocado =
        s.estado === "Acceso suspendido" ||
        s.estado === "Acceso revocado" ||
        s.estado === "Cerrada por reversión" ||
        s.credenciales?.estadoApigee === "SUSPENDIDO" ||
        s.credenciales?.estadoApigee === "REVOCADO";
      const isHabilitado =
        !isFallo &&
        !isSuspendidoRevocado &&
        (s.estado === "Acceso habilitado" || s.estado === "Acceso generado");

      if (filterEstado === "FALLO" && !isFallo) return false;
      if (filterEstado === "HABILITADO" && !isHabilitado) return false;
      if (filterEstado === "SUSPENDIDO_REVOCADO" && !isSuspendidoRevocado)
        return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term)) ||
        (s.aprovisionamiento?.referenciaTecnica &&
          s.aprovisionamiento.referenciaTecnica.toLowerCase().includes(term))
      );
    });
  }, [solicitudesTecnicas, filterEstado, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const hasActiveFilters = filterEstado !== "ALL" || searchTerm.trim() !== "";

  const clearAllFilters = () => {
    setFilterEstado("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleOpenExpediente = (s: SolicitudAcceso) => {
    setSelectedId(s.id);
    setExpedienteTab("apigee");
  };

  const handleReintentar = (id: string) => {
    setReintentandoId(id);
    setTimeout(() => {
      reintentarAprovisionamiento(id, {
        usuarioTI: "Ing. Jorge Alvear (Especialista Apigee TI DINARP)",
      });
      setReintentandoId(null);
      toast.success(
        "Aprovisionamiento en Apigee completado de forma idempotente (ACC-02)",
        {
          description:
            "Developer App y API Product creados reutilizando id_operacion_aprovisionamiento sin duplicar credencial.",
        }
      );
    }, 450);
  };

  const handleConfirmarAccionApigee = () => {
    if (!modalAccionApigee || !causaAccionApigee.trim()) return;
    suspenderRevocarAccesoTecnico(modalAccionApigee.solicitud.id, {
      tipoAccion: modalAccionApigee.tipoAccion,
      causa: causaAccionApigee.trim(),
      actor: "Ing. Jorge Alvear (Especialista Apigee TI DINARP)",
    });
    toast.success(
      `Acción en Apigee ejecutada: ${modalAccionApigee.tipoAccion} (ACC-06)`,
      {
        description:
          "El estado técnico de la credencial fue actualizado inmediatamente en el Gateway.",
      }
    );
    setModalAccionApigee(null);
    setCausaAccionApigee("");
  };

  const handleConfirmarActualizarCupo = () => {
    if (!modalCupoApigee || !motivoCupoValor.trim()) return;
    actualizarAlcanceCupoApigee(modalCupoApigee.id, {
      nuevoCupo: Number(nuevoCupoValor) || 150000,
      motivo: motivoCupoValor.trim(),
      actor: "Ing. Jorge Alvear (Especialista Apigee TI DINARP)",
    });
    toast.success("Alcance y cuota sincronizados en Apigee (ACC-08)");
    setModalCupoApigee(null);
  };

  const renderAccionesTI = (s: SolicitudAcceso, isInline = false) => {
    const isFallo = s.aprovisionamiento?.estado === "ERROR";
    const isSuspendido =
      s.estado === "Acceso suspendido" ||
      s.credenciales?.estadoApigee === "SUSPENDIDO";
    const isRevocado =
      s.estado === "Acceso revocado" ||
      s.estado === "Cerrada por reversión" ||
      s.credenciales?.estadoApigee === "REVOCADO";

    if (isInline) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          {isFallo && (
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={reintentandoId === s.id}
              onClick={() => handleReintentar(s.id)}
            >
              <RefreshCw
                className={cn(
                  "size-3.5",
                  reintentandoId === s.id && "animate-spin"
                )}
              />
              Reintentar aprovisionamiento (ACC-02)
            </Button>
          )}

          {s.credenciales && !isRevocado && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setCredencialModalSolicitud(s)}
            >
              <KeyRound className="size-3.5 text-primary" />
              Bóveda de credencial (ACC-03 / ACC-09)
            </Button>
          )}

          {s.credenciales && !isRevocado && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                setNuevoCupoValor(
                  String(
                    s.credenciales?.cupoAutorizadoVigente ||
                      s.cupoAprobado ||
                      s.cupo ||
                      100000
                  )
                );
                setModalCupoApigee(s);
              }}
            >
              <SlidersHorizontal className="size-3.5" />
              Actualizar cuota (ACC-08)
            </Button>
          )}

          {s.credenciales && !isRevocado && (
            <>
              {isSuspendido ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalAccionApigee({
                      solicitud: s,
                      tipoAccion: "REACTIVAR",
                    })
                  }
                >
                  <Unlock className="size-3.5" />
                  Reactivar acceso (ACC-06)
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalAccionApigee({
                      solicitud: s,
                      tipoAccion: "SUSPENDER",
                    })
                  }
                >
                  <Ban className="size-3.5" />
                  Suspender en Apigee (ACC-06)
                </Button>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => handleOpenExpediente(s)}
              aria-label={`Ver expediente técnico ${s.id}`}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            Ver expediente técnico Apigee
          </TooltipContent>
        </Tooltip>

        {isFallo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={reintentandoId === s.id}
                onClick={() => handleReintentar(s.id)}
                aria-label="Reintentar aprovisionamiento ACC-02"
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    reintentandoId === s.id && "animate-spin"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Reintentar aprovisionamiento idempotente (ACC-02)
            </TooltipContent>
          </Tooltip>
        )}

        {s.credenciales && !isRevocado && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setCredencialModalSolicitud(s)}
                  aria-label="Bóveda de credencial técnica"
                >
                  <KeyRound className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Entregar / Gestionar credencial técnica (ACC-03 / ACC-09)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-info hover:text-info hover:bg-info/10"
                  onClick={() => {
                    setNuevoCupoValor(
                      String(
                        s.credenciales?.cupoAutorizadoVigente ||
                          s.cupoAprobado ||
                          s.cupo ||
                          100000
                      )
                    );
                    setModalCupoApigee(s);
                  }}
                  aria-label="Actualizar cuota Apigee"
                >
                  <SlidersHorizontal className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Actualizar alcance / cuota en Apigee (ACC-08)
              </TooltipContent>
            </Tooltip>

            {isSuspendido ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-success hover:text-success hover:bg-success/10"
                    onClick={() =>
                      setModalAccionApigee({
                        solicitud: s,
                        tipoAccion: "REACTIVAR",
                      })
                    }
                    aria-label="Reactivar en Apigee"
                  >
                    <Unlock className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Reactivar credencial en Apigee (ACC-06)
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-warning hover:text-warning hover:bg-warning/10"
                    onClick={() =>
                      setModalAccionApigee({
                        solicitud: s,
                        tipoAccion: "SUSPENDER",
                      })
                    }
                    aria-label="Suspender en Apigee"
                  >
                    <Ban className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Suspender / Revocar acceso en Apigee (ACC-06)
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <WireframeDashboardLayout activeMenu="acceso-consumo-ti" currentRole="TI">
      <TooltipProvider delayDuration={200}>
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {selectedSolicitud ? (
              /* =========================================================
               * VISTA INLINE DEL EXPEDIENTE TÉCNICO APIGEE (1 CONTENEDOR)
               * ========================================================= */
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Barra superior de retorno y acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="gap-2 self-start text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ArrowLeft className="size-4" />
                    Volver a la bandeja de aprovisionamiento
                  </Button>

                  {renderAccionesTI(selectedSolicitud, true)}
                </div>

                {/* Encabezado destacado del trámite técnico */}
                <Card
                  variant="featured"
                  className={cn(
                    "bg-surface border-border border-l-4 shadow-xs my-0",
                    selectedSolicitud.aprovisionamiento?.estado === "ERROR"
                      ? "border-l-destructive"
                      : "border-l-primary"
                  )}
                  innerClassName="p-4 sm:p-5 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone="primary"
                        appearance="solid"
                        size="sm"
                        className="font-mono"
                      >
                        {selectedSolicitud.id}
                      </Badge>
                      <Badge
                        tone={
                          selectedSolicitud.tipoInstitucion === "Pública"
                            ? "info"
                            : "warning"
                        }
                        appearance="soft"
                        size="sm"
                      >
                        Entidad {selectedSolicitud.tipoInstitucion}
                      </Badge>
                      <Badge
                        tone="neutral"
                        appearance="outline"
                        size="sm"
                        className="font-mono"
                      >
                        Op:{" "}
                        {selectedSolicitud.aprovisionamiento
                          ?.referenciaTecnica ||
                          selectedSolicitud.idOperacionTec00 ||
                          "OP-APIGEE-2026"}
                      </Badge>
                    </div>

                    <Badge
                      tone={
                        selectedSolicitud.aprovisionamiento?.estado === "ERROR"
                          ? "danger"
                          : selectedSolicitud.estado === "Acceso habilitado" ||
                              selectedSolicitud.estado === "Acceso generado"
                            ? "success"
                            : "warning"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {selectedSolicitud.aprovisionamiento?.estado === "ERROR"
                        ? "Aprovisionamiento pendiente / Fallido (ACC-02)"
                        : selectedSolicitud.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Institución y Coordinador Habilitado
                      </p>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        {selectedSolicitud.institucion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coordinador: {selectedSolicitud.coordinador}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Endpoint (ACC-01)
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5 font-mono truncate">
                        {selectedSolicitud.credenciales?.endpoint ||
                          "https://api.interoperabilidad.gob.ec/v2/dinarp"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fuente: {selectedSolicitud.fuentePrincipal}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Política de Cupo en Gateway (ACC-01 Crit. 1 y 3)
                      </p>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {(
                          selectedSolicitud.credenciales
                            ?.cupoAutorizadoVigente ||
                          selectedSolicitud.cupoAprobado ||
                          selectedSolicitud.cupo ||
                          100000
                        ).toLocaleString()}{" "}
                        consultas
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSolicitud.tipoInstitucion === "Privada"
                          ? "Límite bloqueante (Quota Policy)"
                          : "Referencia de alerta (sin bloqueo)"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Banner de Diagnóstico si hay Fallo ACC-02 */}
                {selectedSolicitud.aprovisionamiento?.estado === "ERROR" && (
                  <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-destructive shrink-0" />
                        <span className="text-xs font-bold text-destructive">
                          Fallo en aprovisionamiento Apigee — Reintentos:{" "}
                          {selectedSolicitud.aprovisionamiento.reintentosCount}
                        </span>
                      </div>
                      <p className="text-xs text-foreground">
                        {selectedSolicitud.aprovisionamiento.mensajeResultado ||
                          "Timeout o error de comunicación al aprovisionar Developer App en Apigee."}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        id_operacion_aprovisionamiento:{" "}
                        {selectedSolicitud.aprovisionamiento
                          .referenciaTecnica || "OP-APIGEE-2026-PEND"}{" "}
                        · El Portal no anuncia habilitación ni permite consumo hasta confirmación (ACC-02 Crit. 2).
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5 shrink-0"
                      disabled={reintentandoId === selectedSolicitud.id}
                      onClick={() => handleReintentar(selectedSolicitud.id)}
                    >
                      <RefreshCw
                        className={cn(
                          "size-3.5",
                          reintentandoId === selectedSolicitud.id &&
                            "animate-spin"
                        )}
                      />
                      Reintentar idempotente (ACC-02)
                    </Button>
                  </div>
                )}

                {/* Pestañas del Expediente Técnico */}
                <Tabs
                  value={expedienteTab}
                  onValueChange={setExpedienteTab}
                  className="w-full"
                >
                  <TabsList className="bg-muted/40 p-1 rounded-lg border border-border w-full sm:w-auto overflow-x-auto justify-start h-auto gap-1">
                    <TabsTrigger
                      value="apigee"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      1. Operación Apigee e Idempotencia (ACC-01 / ACC-02)
                    </TabsTrigger>
                    <TabsTrigger
                      value="credencial"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      2. Credencial Institucional y Secreto Temporal (ACC-03 / ACC-09)
                    </TabsTrigger>
                    <TabsTrigger
                      value="trazabilidad"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      3. Bitácora Técnica ({selectedSolicitud.historial.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: OPERACIÓN APIGEE */}
                  <TabsContent value="apigee" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Server className="size-3.5 text-primary" />
                          Parámetros de Aprovisionamiento (ACC-01)
                        </span>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-border/60">
                            <span className="text-muted-foreground">
                              id_operacion_aprovisionamiento:
                            </span>
                            <span className="font-mono font-semibold text-foreground">
                              {selectedSolicitud.aprovisionamiento
                                ?.referenciaTecnica || "OP-APIGEE-2026-001"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/60">
                            <span className="text-muted-foreground">
                              Último intento registrado (TEC-00):
                            </span>
                            <span className="font-mono text-foreground">
                              {selectedSolicitud.aprovisionamiento
                                ?.ultimoIntento || "Sin reintentos manuales"}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-border/60">
                            <span className="text-muted-foreground">
                              Reintentos acumulados (ACC-02):
                            </span>
                            <span className="font-mono text-foreground">
                              {selectedSolicitud.aprovisionamiento
                                ?.reintentosCount || 0}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">
                              Política PAR-11 aplicada:
                            </span>
                            <span className="font-mono text-success">
                              PAR-11-APIGEE-2026 (OAuth2 + mTLS)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Terminal className="size-3.5 text-primary" />
                          Diagnóstico del Gateway (ACC-01 / ACC-02)
                        </span>
                        <p className="text-xs text-foreground leading-relaxed bg-surface p-3 rounded-lg border border-border">
                          {selectedSolicitud.aprovisionamiento
                            ?.mensajeResultado ||
                            "Aprovisionamiento automático confirmado en Apigee tras decisión favorable SOL-10."}
                        </p>
                        {selectedSolicitud.aprovisionamiento
                          ?.fechaHabilitacion && (
                          <p className="text-[11px] font-mono text-success">
                            Fecha de habilitación en Gateway:{" "}
                            {
                              selectedSolicitud.aprovisionamiento
                                .fechaHabilitacion
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 2: CREDENCIAL Y SECRETO TEMPORAL */}
                  <TabsContent value="credencial" className="mt-4 space-y-4">
                    {!selectedSolicitud.credenciales ? (
                      <div className="p-6 rounded-xl border border-dashed border-border bg-muted/10 text-center space-y-2">
                        <KeyRound className="size-8 text-muted-foreground mx-auto stroke-1" />
                        <p className="text-sm font-semibold text-foreground">
                          Credencial aún no emitida por Apigee
                        </p>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Complete el aprovisionamiento (ACC-01 / ACC-02) para que Apigee genere el identificador institucional y el secreto técnico temporal en el almacén protegido.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Client ID Institucional:
                            </span>
                            <code className="font-mono text-xs font-bold text-primary bg-surface px-2 py-0.5 rounded border border-border">
                              {selectedSolicitud.credenciales.usuario}
                            </code>
                            <Badge
                              tone={
                                selectedSolicitud.credenciales.esSecretoTemporal
                                  ? "warning"
                                  : "success"
                              }
                              appearance="soft"
                              size="sm"
                            >
                              {selectedSolicitud.credenciales.esSecretoTemporal
                                ? "Requiere cambio de secreto temporal (ACC-09)"
                                : "Secreto definitivo activo (ACC-09 completado)"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Endpoint:{" "}
                            <span className="font-mono text-foreground">
                              {selectedSolicitud.credenciales.endpoint}
                            </span>{" "}
                            · Rotaciones (ACC-04):{" "}
                            {selectedSolicitud.credenciales.rotacionCount || 0}
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          onClick={() =>
                            setCredencialModalSolicitud(selectedSolicitud)
                          }
                        >
                          <KeyRound className="size-4" />
                          Abrir bóveda de credencial (ACC-03)
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB 3: TRAZABILIDAD */}
                  <TabsContent value="trazabilidad" className="mt-4">
                    <TrazabilidadTimeline
                      eventos={selectedSolicitud.historial}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* =========================================================
               * VISTA BANDEJA PRINCIPAL TI (1 CONTENEDOR)
               * ========================================================= */
              <>
                {/* Encabezado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone="primary"
                        appearance="soft"
                        size="sm"
                        className="font-semibold"
                      >
                        Equipo TI & Seguridad Apigee
                      </Badge>
                      <Badge tone="info" appearance="outline" size="sm">
                        ACC-01 · ACC-02 · ACC-03 · ACC-06 · ACC-08 · ACC-09
                      </Badge>
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Aprovisionar accesos
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-3xl">
                      Supervisa el aprovisionamiento idempotente en Apigee, reintenta operaciones fallidas sin duplicar credenciales y gestiona la bóveda de entrega única del secreto temporal.
                    </p>
                  </div>
                </div>

                {/* Tarjetas KPI interactivas horizontales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Card
                    variant="featured"
                    onClick={() => {
                      setFilterEstado(
                        filterEstado === "FALLO" ? "ALL" : "FALLO"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-destructive shadow-xs transition-all cursor-pointer my-0",
                      filterEstado === "FALLO" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Fallos / Reintento (ACC-02)
                        </span>
                        <span className="text-xl font-bold font-heading text-destructive leading-none">
                          {totalFallos}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        Reintento idempotente sin duplicar
                      </span>
                    </div>
                  </Card>

                  <Card
                    variant="featured"
                    onClick={() => {
                      setFilterEstado(
                        filterEstado === "HABILITADO" ? "ALL" : "HABILITADO"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-success shadow-xs transition-all cursor-pointer my-0",
                      filterEstado === "HABILITADO" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Accesos Activos (ACC-01 / 03)
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {totalHabilitados}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        Credencial y cuota en Gateway
                      </span>
                    </div>
                  </Card>

                  <Card
                    variant="featured"
                    onClick={() => {
                      setFilterEstado(
                        filterEstado === "SUSPENDIDO_REVOCADO"
                          ? "ALL"
                          : "SUSPENDIDO_REVOCADO"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-warning shadow-xs transition-all cursor-pointer my-0",
                      filterEstado === "SUSPENDIDO_REVOCADO" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                      <Ban className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Suspendidos / Revocados
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {totalSuspendidos}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        ACC-06 y reversión PAG-04
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Barra de Tabs + Búsqueda + ViewModeToggle */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <Tabs
                      value={filterEstado}
                      onValueChange={(v) => {
                        setFilterEstado(v);
                        setCurrentPage(1);
                      }}
                      className="w-full lg:w-auto"
                    >
                      <TabsList className="bg-muted/40 p-1 rounded-lg border border-border w-full lg:w-auto overflow-x-auto justify-start h-auto gap-1">
                        <TabsTrigger
                          value="ALL"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Todos ({solicitudesTecnicas.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="FALLO"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Fallos Apigee ({totalFallos})
                        </TabsTrigger>
                        <TabsTrigger
                          value="HABILITADO"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Activos ({totalHabilitados})
                        </TabsTrigger>
                        <TabsTrigger
                          value="SUSPENDIDO_REVOCADO"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Suspendidos / Revocados ({totalSuspendidos})
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <div className="w-full sm:w-72">
                        <Search
                          size="sm"
                          placeholder="Buscar trámite, institución o id_operacion..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          onClear={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                          }}
                          className="w-full bg-background"
                        />
                      </div>
                      <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </div>
                  </div>

                  {/* Chips de filtros activos */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">
                        Mostrando resultados filtrados por:
                      </span>
                      {filterEstado !== "ALL" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          size="sm"
                          className="gap-1.5 pl-2.5 pr-1.5"
                        >
                          Filtro: {filterEstado}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-4 hover:bg-primary/20"
                            onClick={() => setFilterEstado("ALL")}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      {searchTerm.trim() !== "" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          size="sm"
                          className="gap-1.5 pl-2.5 pr-1.5"
                        >
                          Búsqueda: &ldquo;{searchTerm}&rdquo;
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-4 hover:bg-primary/20"
                            onClick={() => setSearchTerm("")}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs h-auto px-2 py-0.5 text-primary"
                      >
                        Limpiar todo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tabla de Accesos Técnicos */}
                <div
                  className={cn(
                    "border border-border rounded-xl overflow-hidden bg-surface shadow-xs",
                    viewMode === "table" ? "hidden md:block" : "hidden"
                  )}
                >
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Trámite / Op. Apigee
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Institución y Tipo
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Endpoint y Credencial
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Cuota / Regla (ACC-01)
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Estado Gateway
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                              <Server className="size-8 stroke-1 text-muted-foreground/60" />
                              <p className="text-sm font-medium">
                                No se encontraron registros técnicos en Apigee bajo este filtro.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((s) => {
                          const isFallo =
                            s.aprovisionamiento?.estado === "ERROR";
                          const isSuspendido =
                            s.estado === "Acceso suspendido" ||
                            s.credenciales?.estadoApigee === "SUSPENDIDO";
                          const isRevocado =
                            s.estado === "Acceso revocado" ||
                            s.estado === "Cerrada por reversión" ||
                            s.credenciales?.estadoApigee === "REVOCADO";

                          return (
                            <TableRow
                              key={s.id}
                              onClick={() => handleOpenExpediente(s)}
                              className="cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-xs font-bold text-primary">
                                    {s.id}
                                  </span>
                                  <span className="font-mono text-[11px] text-muted-foreground">
                                    {s.aprovisionamiento?.referenciaTecnica ||
                                      "OP-APIGEE-2026"}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col items-start gap-1">
                                  <span className="text-sm font-semibold text-foreground">
                                    {s.institucion}
                                  </span>
                                  <Badge
                                    tone={
                                      s.tipoInstitucion === "Pública"
                                        ? "info"
                                        : "warning"
                                    }
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {s.tipoInstitucion}
                                  </Badge>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-xs font-medium text-foreground">
                                    {s.credenciales?.usuario ||
                                      "Sin Client ID emitido"}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                                    {s.fuentePrincipal}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-foreground">
                                    {(
                                      s.credenciales?.cupoAutorizadoVigente ||
                                      s.cupoAprobado ||
                                      s.cupo ||
                                      100000
                                    ).toLocaleString()}{" "}
                                    req
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {s.tipoInstitucion === "Privada"
                                      ? "Cuota bloqueante"
                                      : "Referencia alerta"}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col items-start gap-1">
                                  <Badge
                                    tone={
                                      isFallo || isRevocado
                                        ? "danger"
                                        : isSuspendido
                                          ? "warning"
                                          : "success"
                                    }
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {isFallo
                                      ? "Fallo Apigee (ACC-02)"
                                      : s.estado}
                                  </Badge>
                                  {s.credenciales && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {s.credenciales.esSecretoTemporal
                                        ? "Secreto temporal (ACC-09)"
                                        : "Secreto definitivo"}
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="text-right align-top py-3">
                                {renderAccionesTI(s, false)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Tarjetas (Móvil o modo Cards) */}
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-4",
                    viewMode === "cards" ? "grid" : "grid md:hidden"
                  )}
                >
                  {paginatedItems.map((s) => {
                    const isFallo = s.aprovisionamiento?.estado === "ERROR";
                    return (
                      <InteractiveCard
                        key={s.id}
                        onClick={() => handleOpenExpediente(s)}
                        className="p-4 flex flex-col justify-between gap-3 bg-surface border-border"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-primary">
                              {s.id}
                            </span>
                            <h3 className="text-sm font-bold text-foreground mt-0.5">
                              {s.institucion}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {s.fuentePrincipal}
                            </p>
                          </div>
                          <Badge
                            tone={isFallo ? "danger" : "success"}
                            appearance="soft"
                            size="sm"
                          >
                            {isFallo ? "Fallo Apigee" : s.estado}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground font-mono">
                            {s.aprovisionamiento?.referenciaTecnica || s.id}
                          </span>
                          {renderAccionesTI(s, false)}
                        </div>
                      </InteractiveCard>
                    );
                  })}
                </div>

                {/* Paginación */}
                {filtered.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Mostrando {paginatedItems.length} de {filtered.length}{" "}
                      accesos técnicos
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
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
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </main>

        {/* =========================================================
         * MODAL ACC-03 / ACC-04 / ACC-05 / ACC-09: BÓVEDA DE CREDENCIAL
         * ========================================================= */}
        {credencialModalSolicitud && (
          <CredencialTecnicaModal
            solicitud={credencialModalSolicitud}
            isOpen={!!credencialModalSolicitud}
            onClose={() => setCredencialModalSolicitud(null)}
          />
        )}

        {/* =========================================================
         * MODAL ACC-06: SUSPENDER / REVOCAR / REACTIVAR EN APIGEE
         * ========================================================= */}
        <Dialog
          open={!!modalAccionApigee}
          onOpenChange={(open) => !open && setModalAccionApigee(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {modalAccionApigee?.tipoAccion === "REACTIVAR"
                  ? "Reactivar acceso técnico en Apigee (ACC-06)"
                  : "Suspender o revocar acceso en Apigee (ACC-06)"}
              </DialogTitle>
              <DialogDescription>
                Actualiza inmediatamente el estado de la Developer App de{" "}
                <span className="font-semibold text-foreground">
                  {modalAccionApigee?.solicitud.institucion}
                </span>{" "}
                en el API Gateway.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-foreground">
                Causa técnica o administrativa (AUD-01)
              </label>
              <Textarea
                rows={3}
                value={causaAccionApigee}
                onChange={(e) => setCausaAccionApigee(e.target.value)}
                placeholder="Ingrese la justificación para registrar en bitácora..."
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalAccionApigee(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={
                  modalAccionApigee?.tipoAccion === "REACTIVAR"
                    ? "primary"
                    : "danger"
                }
                disabled={!causaAccionApigee.trim()}
                onClick={handleConfirmarAccionApigee}
              >
                Confirmar {modalAccionApigee?.tipoAccion}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =========================================================
         * MODAL ACC-08: ACTUALIZAR ALCANCE / CUOTA EN APIGEE
         * ========================================================= */}
        <Dialog
          open={!!modalCupoApigee}
          onOpenChange={(open) => !open && setModalCupoApigee(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Actualizar cuota autorizada en Apigee (ACC-08)
              </DialogTitle>
              <DialogDescription>
                Sincroniza el límite de consumo para{" "}
                <span className="font-semibold text-foreground">
                  {modalCupoApigee?.institucion}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nuevo cupo vigente (consultas)
                </label>
                <Input
                  type="number"
                  value={nuevoCupoValor}
                  onChange={(e) => setNuevoCupoValor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Motivo de actualización (SOL-11 / ACC-08)
                </label>
                <Textarea
                  rows={3}
                  value={motivoCupoValor}
                  onChange={(e) => setMotivoCupoValor(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalCupoApigee(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmarActualizarCupo}
              >
                Sincronizar en Apigee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </WireframeDashboardLayout>
  );
}
