"use client";

import React, { useState, useMemo } from "react";
import {
  Server,
  Terminal,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  KeyRound,
  Eye,
  RefreshCw,
  Ban,
  ShieldAlert,
  SlidersHorizontal,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
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
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { TrazabilidadTimeline } from "@/modules/acceso-interoperabilidad/components/trazabilidad-timeline";
import { CredencialTecnicaModal } from "@/modules/acceso-interoperabilidad/components/credencial-tecnica-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AccesoConsumoTIView() {
  const {
    solicitudes,
    reintentarAprovisionamiento,
    rotarCredencialInstitucional,
    suspenderRevocarAccesoTecnico,
    actualizarAlcanceCupoApigee,
    sustituirSecretoTemporal,
  } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<
    "ALL" | "FALLO" | "HABILITADO" | "SUSPENDIDO_REVOCADO"
  >("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [solicitudDetalle, setSolicitudDetalle] =
    useState<SolicitudAcceso | null>(null);
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
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term))
      );
    });
  }, [solicitudesTecnicas, filterEstado, searchTerm]);

  const totalFallos = solicitudesTecnicas.filter(
    (s) =>
      s.aprovisionamiento?.estado === "ERROR" ||
      !!s.credenciales?.alertaIncidenteSeguridad
  ).length;
  const totalHabilitados = solicitudesTecnicas.filter(
    (s) => s.estado === "Acceso habilitado" || s.estado === "Acceso generado"
  ).length;
  const totalSuspendidos = solicitudesTecnicas.filter(
    (s) =>
      s.estado === "Acceso suspendido" ||
      s.estado === "Acceso revocado" ||
      s.estado === "Cerrada por reversión"
  ).length;

  const handleReintentar = (id: string) => {
    setReintentandoId(id);
    setTimeout(() => {
      reintentarAprovisionamiento(id, {
        usuarioTI: "Ing. Jorge Alvear (Especialista Apigee TI DINARP)",
      });
      setReintentandoId(null);
      toast.success("Aprovisionamiento en Apigee completado de forma idempotente (ACC-02)", {
        description:
          "Developer App y API Product creados sin duplicidad con secreto temporal inicial (ACC-09).",
      });
      if (solicitudDetalle?.id === id) {
        setSolicitudDetalle(null);
      }
    }, 500);
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

  return (
    <WireframeDashboardLayout activeMenu="acceso-consumo-ti" currentRole="TI">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                tone="primary"
                appearance="soft"
                className="font-semibold text-xs"
              >
                Equipo TI & Seguridad Apigee
              </Badge>
              <Badge tone="info" appearance="outline" className="text-xs">
                BN-08 · ACC-01 al ACC-09
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Aprovisionar accesos
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Gestiona la creación de credenciales técnicas, cuotas de consumo, rotación de secretos y estado operativo de los accesos en Apigee.
            </p>
          </div>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Fallos / Incidentes en Apigee (ACC-02 / ACC-07)
              </span>
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive mt-2">
              {totalFallos}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Requieren reintento idempotente o revisión de seguridad
            </p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Accesos Activos en Apigee (ACC-01 / ACC-09)
              </span>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {totalHabilitados}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Cuota bloqueante (Privadas) / Referencia y alerta (Públicas)
            </p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Accesos Suspendidos o Revocados (ACC-06 / PAG-04)
              </span>
              <Ban className="size-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">
              {totalSuspendidos}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Bloqueo inmediato de tráfico en API Gateway
            </p>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setFilterEstado("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "ALL"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todos ({solicitudesTecnicas.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("FALLO")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "FALLO"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Con fallo / alerta ({totalFallos})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("HABILITADO")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "HABILITADO"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Activos ({totalHabilitados})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("SUSPENDIDO_REVOCADO")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "SUSPENDIDO_REVOCADO"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Suspendidos / Revocados ({totalSuspendidos})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Search
                placeholder="Buscar por código, institución o fuente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full bg-background"
              />
            </div>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Tabla de Aprovisionamiento y Gobierno Apigee */}
        <Card
          className={cn(
            "border border-border bg-surface overflow-hidden shadow-xs",
            viewMode === "table" ? "hidden md:block" : "hidden"
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud / Entidad</TableHead>
                <TableHead>Política de Cupo Apigee (ACC-01/08)</TableHead>
                <TableHead>Estado Secreto (ACC-09 / ACC-05)</TableHead>
                <TableHead>Estado Gateway</TableHead>
                <TableHead className="text-right">
                  Acciones Técnicas (ACC-02 · ACC-05 · ACC-06 · ACC-08 · ACC-09)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Server className="size-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium">
                        No hay registros técnicos en Apigee con estos filtros.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const prov = s.aprovisionamiento;
                  const creds = s.credenciales;
                  const isFallo = prov?.estado === "ERROR";
                  const isSuspendido =
                    s.estado === "Acceso suspendido" ||
                    s.estado === "Cerrada por reversión" ||
                    creds?.estadoApigee === "SUSPENDIDO";
                  const isRevocado =
                    s.estado === "Acceso revocado" ||
                    creds?.estadoApigee === "REVOCADO";
                  const isHabilitado =
                    !isFallo &&
                    !isSuspendido &&
                    !isRevocado &&
                    (s.estado === "Acceso habilitado" ||
                      s.estado === "Acceso generado");

                  return (
                    <TableRow
                      key={s.id}
                      className={cn(
                        "hover:bg-muted/40 transition-colors",
                        isFallo && "bg-destructive/5"
                      )}
                    >
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {s.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.institucion} ({s.tipoInstitucion})
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-semibold text-foreground">
                          {(
                            creds?.cupoAutorizadoVigente ?? s.cupo ?? 100000
                          ).toLocaleString()}{" "}
                          consultas
                        </div>
                        <Badge
                          tone={
                            s.tipoInstitucion === "Privada" ? "warning" : "info"
                          }
                          appearance="outline"
                          className="text-[10px] mt-0.5"
                        >
                          {s.tipoInstitucion === "Privada"
                            ? "BLOQUEANTE_PRIVADA"
                            : "REFERENCIA_ALERTA_PUBLICA"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {creds ? (
                          <div className="space-y-1">
                            <Badge
                              tone={
                                creds.esSecretoTemporal ? "warning" : "primary"
                              }
                              appearance="soft"
                              className="text-[11px]"
                            >
                              {creds.esSecretoTemporal
                                ? "Secreto Temporal (ACC-09)"
                                : "Secreto Definitivo"}
                            </Badge>
                            <div className="text-[11px] text-muted-foreground">
                              Rotaciones: {creds.rotacionCount ?? 0}
                            </div>
                            {creds.alertaIncidenteSeguridad && (
                              <div className="text-[11px] text-destructive font-semibold flex items-center gap-1">
                                <ShieldAlert className="size-3" />
                                Alerta ACC-07
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Pendiente de emisión
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {isFallo ? (
                          <Badge
                            tone="danger"
                            appearance="soft"
                            className="gap-1 text-xs font-semibold"
                          >
                            <AlertTriangle className="size-3" />
                            Fallo Apigee (ACC-02)
                          </Badge>
                        ) : isRevocado ? (
                          <Badge
                            tone="danger"
                            appearance="soft"
                            className="gap-1 text-xs font-semibold"
                          >
                            <Ban className="size-3" />
                            Acceso revocado (ACC-06)
                          </Badge>
                        ) : isSuspendido ? (
                          <Badge
                            tone="warning"
                            appearance="soft"
                            className="gap-1 text-xs font-semibold"
                          >
                            <Clock className="size-3" />
                            Acceso suspendido (ACC-06)
                          </Badge>
                        ) : isHabilitado ? (
                          <Badge
                            tone="success"
                            appearance="soft"
                            className="gap-1 text-xs"
                          >
                            <CheckCircle2 className="size-3" />
                            Activo en Apigee
                          </Badge>
                        ) : (
                          <Badge
                            tone="warning"
                            appearance="soft"
                            className="gap-1 text-xs"
                          >
                            <Clock className="size-3" />
                            En cola
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSolicitudDetalle(s)}
                            className="text-xs text-muted-foreground hover:text-foreground gap-1"
                          >
                            <Eye className="size-3.5" />
                            Diagnóstico
                          </Button>

                          {/* ACC-02: Reintentar aprovisionamiento */}
                          {isFallo && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleReintentar(s.id)}
                              disabled={reintentandoId === s.id}
                              className="gap-1.5 text-xs"
                            >
                              <RotateCcw
                                className={cn(
                                  "size-3.5",
                                  reintentandoId === s.id && "animate-spin"
                                )}
                              />
                              Reintentar Apigee (ACC-02)
                            </Button>
                          )}

                          {/* ACC-03 / ACC-04 / ACC-09 / ACC-05: Abrir Bóveda de Credencial */}
                          {creds && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCredencialModalSolicitud(s)}
                              className="gap-1 text-xs"
                            >
                              <KeyRound className="size-3.5 text-primary" />
                              Bóveda / Rotar (ACC-04/05/09)
                            </Button>
                          )}

                          {/* ACC-08: Actualizar cupo/alcance */}
                          {isHabilitado && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setModalCupoApigee(s);
                                setNuevoCupoValor(
                                  String(
                                    (creds?.cupoAutorizadoVigente ?? s.cupo ?? 100000) +
                                      50000
                                  )
                                );
                              }}
                              className="gap-1 text-xs"
                            >
                              <SlidersHorizontal className="size-3.5" />
                              Cupo (ACC-08)
                            </Button>
                          )}

                          {/* ACC-06: Suspender / Revocar / Reactivar */}
                          {isHabilitado && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setModalAccionApigee({
                                    solicitud: s,
                                    tipoAccion: "SUSPENDER",
                                  });
                                  setCausaAccionApigee("");
                                }}
                                className="gap-1 text-xs text-warning"
                              >
                                Suspender (ACC-06)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setModalAccionApigee({
                                    solicitud: s,
                                    tipoAccion: "REVOCAR",
                                  });
                                  setCausaAccionApigee("");
                                }}
                                className="gap-1 text-xs text-destructive"
                              >
                                Revocar (ACC-06)
                              </Button>
                            </>
                          )}

                          {isSuspendido && !isRevocado && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                setModalAccionApigee({
                                  solicitud: s,
                                  tipoAccion: "REACTIVAR",
                                });
                                setCausaAccionApigee("");
                              }}
                              className="gap-1 text-xs"
                            >
                              <Unlock className="size-3.5" />
                              Reactivar (ACC-06)
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Vista de Tarjetas (Móvil + Modo Cards) */}
        <div
          className={cn(
            "w-full",
            viewMode === "cards"
              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
              : "block md:hidden space-y-3.5"
          )}
        >
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-surface p-10 text-center flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Server className="size-8 stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">
                No hay registros técnicos en Apigee con estos filtros.
              </p>
            </div>
          ) : (
            filtered.map((s) => {
              const prov = s.aprovisionamiento;
              const creds = s.credenciales;
              const isFallo = prov?.estado === "ERROR";
              const isSuspendido =
                s.estado === "Acceso suspendido" ||
                s.estado === "Cerrada por reversión" ||
                creds?.estadoApigee === "SUSPENDIDO";
              const isRevocado =
                s.estado === "Acceso revocado" ||
                creds?.estadoApigee === "REVOCADO";
              const isHabilitado =
                !isFallo &&
                !isSuspendido &&
                !isRevocado &&
                (s.estado === "Acceso habilitado" ||
                  s.estado === "Acceso generado");

              return (
                <InteractiveCard
                  key={s.id}
                  as="div"
                  className={cn(
                    "p-4 flex flex-col gap-3 bg-surface border-border",
                    isFallo && "bg-destructive/5 border-destructive/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <div className="font-semibold text-foreground">{s.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.institucion} ({s.tipoInstitucion})
                      </div>
                    </div>
                    {isFallo ? (
                      <Badge
                        tone="danger"
                        appearance="soft"
                        className="gap-1 text-xs font-semibold shrink-0"
                      >
                        <AlertTriangle className="size-3" />
                        Fallo Apigee (ACC-02)
                      </Badge>
                    ) : isRevocado ? (
                      <Badge
                        tone="danger"
                        appearance="soft"
                        className="gap-1 text-xs font-semibold shrink-0"
                      >
                        <Ban className="size-3" />
                        Acceso revocado (ACC-06)
                      </Badge>
                    ) : isSuspendido ? (
                      <Badge
                        tone="warning"
                        appearance="soft"
                        className="gap-1 text-xs font-semibold shrink-0"
                      >
                        <Clock className="size-3" />
                        Acceso suspendido (ACC-06)
                      </Badge>
                    ) : isHabilitado ? (
                      <Badge
                        tone="success"
                        appearance="soft"
                        className="gap-1 text-xs shrink-0"
                      >
                        <CheckCircle2 className="size-3" />
                        Activo en Apigee
                      </Badge>
                    ) : (
                      <Badge
                        tone="warning"
                        appearance="soft"
                        className="gap-1 text-xs shrink-0"
                      >
                        <Clock className="size-3" />
                        En cola
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs w-full pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Política de Cupo Apigee
                      </span>
                      <div className="font-semibold text-foreground">
                        {(
                          creds?.cupoAutorizadoVigente ?? s.cupo ?? 100000
                        ).toLocaleString()}{" "}
                        consultas
                      </div>
                      <Badge
                        tone={s.tipoInstitucion === "Privada" ? "warning" : "info"}
                        appearance="outline"
                        className="text-[10px] mt-0.5"
                      >
                        {s.tipoInstitucion === "Privada"
                          ? "BLOQUEANTE_PRIVADA"
                          : "REFERENCIA_ALERTA_PUBLICA"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">
                        Estado Secreto
                      </span>
                      {creds ? (
                        <div className="space-y-1">
                          <Badge
                            tone={creds.esSecretoTemporal ? "warning" : "primary"}
                            appearance="soft"
                            className="text-[11px]"
                          >
                            {creds.esSecretoTemporal
                              ? "Secreto Temporal (ACC-09)"
                              : "Secreto Definitivo"}
                          </Badge>
                          <div className="text-[11px] text-muted-foreground">
                            Rotaciones: {creds.rotacionCount ?? 0}
                          </div>
                          {creds.alertaIncidenteSeguridad && (
                            <div className="text-[11px] text-destructive font-semibold flex items-center gap-1">
                              <ShieldAlert className="size-3" />
                              Alerta ACC-07
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Pendiente de emisión
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-border w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSolicitudDetalle(s)}
                      className="text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <Eye className="size-3.5" />
                      Diagnóstico
                    </Button>

                    {isFallo && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleReintentar(s.id)}
                        disabled={reintentandoId === s.id}
                        className="gap-1.5 text-xs"
                      >
                        <RotateCcw
                          className={cn(
                            "size-3.5",
                            reintentandoId === s.id && "animate-spin"
                          )}
                        />
                        Reintentar Apigee (ACC-02)
                      </Button>
                    )}

                    {creds && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCredencialModalSolicitud(s)}
                        className="gap-1 text-xs"
                      >
                        <KeyRound className="size-3.5 text-primary" />
                        Bóveda / Rotar (ACC-04/05/09)
                      </Button>
                    )}

                    {isHabilitado && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModalCupoApigee(s);
                          setNuevoCupoValor(
                            String(
                              (creds?.cupoAutorizadoVigente ?? s.cupo ?? 100000) +
                                50000
                            )
                          );
                        }}
                        className="gap-1 text-xs"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        Cupo (ACC-08)
                      </Button>
                    )}

                    {isHabilitado && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModalAccionApigee({
                              solicitud: s,
                              tipoAccion: "SUSPENDER",
                            });
                            setCausaAccionApigee("");
                          }}
                          className="gap-1 text-xs text-warning"
                        >
                          Suspender (ACC-06)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModalAccionApigee({
                              solicitud: s,
                              tipoAccion: "REVOCAR",
                            });
                            setCausaAccionApigee("");
                          }}
                          className="gap-1 text-xs text-destructive"
                        >
                          Revocar (ACC-06)
                        </Button>
                      </>
                    )}

                    {isSuspendido && !isRevocado && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setModalAccionApigee({
                            solicitud: s,
                            tipoAccion: "REACTIVAR",
                          });
                          setCausaAccionApigee("");
                        }}
                        className="gap-1 text-xs"
                      >
                        <Unlock className="size-3.5" />
                        Reactivar (ACC-06)
                      </Button>
                    )}
                  </div>
                </InteractiveCard>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Bóveda Credencial Técnica (ACC-03, ACC-04, ACC-05, ACC-07, ACC-09) */}
      <CredencialTecnicaModal
        solicitud={credencialModalSolicitud}
        isOpen={!!credencialModalSolicitud}
        onClose={() => setCredencialModalSolicitud(null)}
      />

      {/* Modal Suspender / Revocar / Reactivar en Apigee (ACC-06) */}
      <Dialog
        open={!!modalAccionApigee}
        onOpenChange={(open) => !open && setModalAccionApigee(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              {modalAccionApigee?.tipoAccion === "SUSPENDER"
                ? "Suspender Acceso Técnico en Apigee (ACC-06)"
                : modalAccionApigee?.tipoAccion === "REVOCAR"
                ? "Revocar Definitivamente Credencial en Apigee (ACC-06)"
                : "Reactivar Acceso Técnico en Apigee (ACC-06)"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {modalAccionApigee?.tipoAccion === "REVOCAR"
                ? "La revocación inhabilita definitivamente la credencial en Apigee y exige una nueva solicitud o habilitación formal para volver a consumir."
                : "El cambio de estado se aplica de inmediato sobre el Developer App en Apigee y queda auditado con usuario, fecha y causa."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <label className="font-semibold text-foreground">
              Causa Justificada de la Operación (Obligatoria):
            </label>
            <Textarea
              rows={3}
              placeholder="Ej: Alerta de tráfico anómalo / Vencimiento de vigencia / Subsanación técnica verificada..."
              value={causaAccionApigee}
              onChange={(e) => setCausaAccionApigee(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalAccionApigee(null)}
            >
              Cancelar
            </Button>
            <Button
              variant={
                modalAccionApigee?.tipoAccion === "REVOCAR"
                  ? "danger"
                  : "primary"
              }
              size="sm"
              disabled={!causaAccionApigee.trim()}
              onClick={handleConfirmarAccionApigee}
            >
              Confirmar {modalAccionApigee?.tipoAccion} en Apigee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Actualizar Cupo en Apigee (ACC-08) */}
      <Dialog
        open={!!modalCupoApigee}
        onOpenChange={(open) => !open && setModalCupoApigee(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground">
              Sincronizar Alcance y Cupo en Apigee (ACC-08)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Actualiza `cupo_autorizado_vigente` en el API Product asociado a{" "}
              <strong>{modalCupoApigee?.institucion}</strong> conservando historial del valor previo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Nuevo Cupo Autorizado Vigente:
              </label>
              <Input
                type="number"
                value={nuevoCupoValor}
                onChange={(e) => setNuevoCupoValor(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Motivo / Referencia de Modificación:
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
              size="sm"
              onClick={() => setModalCupoApigee(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmarActualizarCupo}
            >
              Aplicar en Apigee (ACC-08)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Diagnóstico Técnico (ACC-01 + ACC-02 + ACC-07) */}
      <Dialog
        open={!!solicitudDetalle}
        onOpenChange={(open) => !open && setSolicitudDetalle(null)}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Server className="size-5 text-primary" />
              Diagnóstico Técnico Apigee — {solicitudDetalle?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Trazabilidad técnica de aprovisionamiento, políticas de cuota y rotaciones en Apigee.
            </DialogDescription>
          </DialogHeader>

          {solicitudDetalle && (
            <div className="space-y-4 py-2">
              {solicitudDetalle.aprovisionamiento?.estado === "ERROR" && (
                <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <AlertTriangle className="size-4" />
                    Fallo en la habilitación técnica en Apigee (ACC-02)
                  </div>
                  <p className="text-xs text-foreground font-medium">
                    {solicitudDetalle.aprovisionamiento.mensajeResultado}
                  </p>
                </div>
              )}

              <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-2.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-primary" />
                  Parámetros en API Gateway Apigee
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Referencia Técnica:
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {solicitudDetalle.aprovisionamiento?.referenciaTecnica ||
                        "APIGEE-PROD-OK"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Reintentos (ACC-02):
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {solicitudDetalle.aprovisionamiento?.reintentosCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Política de Cupo:
                    </span>
                    <span className="text-foreground font-semibold">
                      {solicitudDetalle.tipoInstitucion === "Privada"
                        ? "BLOQUEANTE_PRIVADA"
                        : "REFERENCIA_ALERTA_PUBLICA"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">
                      Estado Secreto (ACC-09):
                    </span>
                    <span className="text-foreground font-semibold">
                      {solicitudDetalle.credenciales?.esSecretoTemporal
                        ? "Temporal (Pendiente sustitución)"
                        : "Definitivo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                <h4 className="text-xs font-bold text-foreground">
                  Historial Técnico y Auditoría
                </h4>
                <TrazabilidadTimeline
                  historial={solicitudDetalle.historial || []}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSolicitudDetalle(null)}
            >
              Cerrar
            </Button>
            {solicitudDetalle?.aprovisionamiento?.estado === "ERROR" && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleReintentar(solicitudDetalle.id)}
                disabled={reintentandoId === solicitudDetalle.id}
                className="gap-1.5"
              >
                <RotateCcw
                  className={cn(
                    "size-3.5",
                    reintentandoId === solicitudDetalle.id && "animate-spin"
                  )}
                />
                Reintentar Aprovisionamiento (ACC-02)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
