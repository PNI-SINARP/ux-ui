"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Database,
  FileText,
  AlertTriangle,
  RotateCcw,
  History,
  Scale,
  Check,
  ShieldCheck,
  Receipt,
  FileSignature,
  RefreshCw,
  Ban,
  SlidersHorizontal,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { TrazabilidadTimeline } from "@/modules/acceso-interoperabilidad/components/trazabilidad-timeline";
import { toast } from "sonner";
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

  const [activeTab, setActiveTab] = useState<"TODAS" | "PUBLICA" | "PRIVADA">("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAcceso | null>(null);

  // Modal Aprobación Final (SOL-10 + ACC-01/02)
  const [modalAprobacion, setModalAprobacion] = useState<SolicitudAcceso | null>(null);
  const [resolucionAdmin, setResolucionAdmin] = useState("RESOLUCION-DINARP-DIR-2026-");
  const [simularFalloApigee, setSimularFalloApigee] = useState(false);

  // Modal Devolver con Observaciones (SOL-10 Crit. 2)
  const [modalDevolucion, setModalDevolucion] = useState<SolicitudAcceso | null>(null);
  const [areaDestinoDevolucion, setAreaDestinoDevolucion] = useState<
    "Gestión" | "Normatividad" | "Jurídica"
  >("Gestión");
  const [observacionDevolucion, setObservacionDevolucion] = useState("");

  // Modal Revertir Pago Confirmado (PAG-04)
  const [modalReversionPago, setModalReversionPago] = useState<SolicitudAcceso | null>(null);
  const [motivoReversionPago, setMotivoReversionPago] = useState("");

  // Modal Actualizar Alcance / Cupo en Apigee (ACC-08)
  const [modalActualizarCupo, setModalActualizarCupo] = useState<SolicitudAcceso | null>(null);
  const [nuevoCupoApigee, setNuevoCupoApigee] = useState("200000");
  const [motivoActualizacionCupo, setMotivoActualizacionCupo] = useState(
    "Adenda aprobada formalmente para incremento de cupo transaccional."
  );

  // Casos en etapa de formalización / aprobación final / excepciones BN-08
  const solicitudesFormalizacion = useMemo(() => {
    return solicitudes.filter((s) => {
      const est = s.estado;
      return (
        est === "Pendiente de integración" ||
        est === "Aprobada por Gestión" ||
        est === "Aprobada por Normatividad" ||
        est === "En formalización" ||
        est === "Pendiente de plantilla" ||
        est === "Pendiente de firma" ||
        est === "Contrato firmado" ||
        est === "Divergencia de facturación" ||
        est === "Pendiente de pago" ||
        est === "Pago bloqueado por intentos" ||
        est === "En conciliación" ||
        est === "Pago verificado" ||
        est === "Pago validado" ||
        est === "Cerrada por reversión" ||
        est === "Aprobación final" ||
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado" ||
        est === "Acceso generado" ||
        est === "Acceso suspendido" ||
        est === "Acceso revocado"
      );
    });
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesFormalizacion.filter((s) => {
      if (activeTab === "PUBLICA" && s.tipoInstitucion !== "Pública") return false;
      if (activeTab === "PRIVADA" && s.tipoInstitucion !== "Privada") return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(term)) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term))
      );
    });
  }, [solicitudesFormalizacion, activeTab, searchTerm]);

  const totalPublicasListas = solicitudesFormalizacion.filter(
    (s) =>
      s.tipoInstitucion === "Pública" &&
      (s.estado === "Aprobada por Gestión" ||
        s.estado === "Aprobada por Normatividad" ||
        s.estado === "En formalización" ||
        s.estado === "Aprobación final")
  ).length;

  const totalExcepcionesPendientes = solicitudesFormalizacion.filter(
    (s) =>
      s.estado === "Pendiente de integración" ||
      s.estado === "Divergencia de facturación" ||
      s.estado === "Pago bloqueado por intentos" ||
      s.estado === "En conciliación"
  ).length;

  const totalPrivadasListas = solicitudesFormalizacion.filter(
    (s) =>
      s.tipoInstitucion === "Privada" &&
      (s.estado === "Pago verificado" || s.estado === "Pago validado")
  ).length;

  const handleConfirmarAprobacion = () => {
    if (!modalAprobacion) return;
    aprobarFinalGestion(modalAprobacion.id, {
      resolucionNumero: resolucionAdmin,
      directorNombre: "Dr. Roberto Andrade (Director de Gestión de la Información)",
      simularFalloApigee,
    });
    if (simularFalloApigee) {
      toast.warning(
        "Solicitud aprobada con fallo simulado en Apigee (SOL-10 → ACC-02)",
        {
          description:
            "La solicitud quedó en 'Habilitación técnica' con error registrado. El Equipo TI puede reintentar de forma idempotente.",
        }
      );
    } else {
      toast.success(
        "Solicitud aprobada y aprovisionada automáticamente en Apigee (SOL-10 → ACC-01)",
        {
          description:
            "Se creó el acceso en Apigee con secreto temporal para el primer uso (ACC-09).",
        }
      );
    }
    setModalAprobacion(null);
    setSimularFalloApigee(false);
    if (selectedSolicitud?.id === modalAprobacion.id) {
      setSelectedSolicitud(null);
    }
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
        "No se disparó el aprovisionamiento técnico en Apigee y se notificó al área responsable.",
    });
    setModalDevolucion(null);
    setObservacionDevolucion("");
    if (selectedSolicitud?.id === modalDevolucion.id) {
      setSelectedSolicitud(null);
    }
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
    if (selectedSolicitud?.id === modalReversionPago.id) {
      setSelectedSolicitud(null);
    }
  };

  const handleConfirmarActualizarCupo = () => {
    if (!modalActualizarCupo || !motivoActualizacionCupo.trim()) return;
    actualizarAlcanceCupoApigee(modalActualizarCupo.id, {
      nuevoCupo: Number(nuevoCupoApigee) || 200000,
      motivo: motivoActualizacionCupo.trim(),
      actor: "Dr. Roberto Andrade (Director de Gestión)",
    });
    toast.success("Alcance y cupo actualizados en Apigee (ACC-08)", {
      description: `El nuevo cupo vigente (${Number(nuevoCupoApigee).toLocaleString()} consultas) fue sincronizado con la política de cuota en Apigee.`,
    });
    setModalActualizarCupo(null);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="formalizacion-gestion"
      currentRole="DIR_GESTION"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary" appearance="soft" className="font-semibold text-xs">
                Director de Gestión
              </Badge>
              <Badge tone="info" appearance="outline" className="text-xs">
                BN-08 · SOL-09 · SOL-10 · PAG-04 · ACC-01 · ACC-08
              </Badge>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Formalizar accesos
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Verifica el cumplimiento de los requisitos técnicos, normativos, contractuales y financieros para ejecutar la aprobación final de acceso a interoperabilidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/formalizacion/contratos">
                <FileSignature className="size-4 text-primary" />
                Contratos Privados (DOC-01..03)
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/configuracion-financiera">
                <SlidersHorizontal className="size-4 text-primary" />
                Configuración Financiera (TAR / FAC / PAG)
              </Link>
            </Button>
          </div>
        </div>

        {/* Tarjetas de Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Públicas listas para Aprobación Final (SOL-09/10)
              </span>
              <Building2 className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPublicasListas}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Expediente público integrado sin contrato ni cobro
            </p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Privadas listas tras Pago en Pasarela (PAG-02 → SOL-10)
              </span>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPrivadasListas}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Contrato firmado + factura emitida + webhook de pago validado
            </p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Excepciones Técnicas / Financieras Activas
              </span>
              <AlertTriangle className="size-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning mt-2">{totalExcepcionesPendientes}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pendiente de integración (SOL-09) o conciliación (FAC-02/PAG-05)
            </p>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("TODAS")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "TODAS"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todas ({solicitudesFormalizacion.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PUBLICA")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "PUBLICA"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Públicas (SOL-09)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRIVADA")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "PRIVADA"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Privadas (DOC + FAC + PAG)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Search
                placeholder="Buscar por código, institución o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full bg-background"
              />
            </div>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Tabla Principal */}
        <Card
          className={cn(
            "border border-border bg-surface overflow-hidden shadow-xs",
            viewMode === "table" ? "hidden md:block" : "hidden"
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Proyecto / Paquete</TableHead>
                <TableHead>Tipo Entidad</TableHead>
                <TableHead>Estado BN-08</TableHead>
                <TableHead className="text-right">Acciones (SOL-09 / SOL-10 / PAG-04 / ACC-08)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileCheck2 className="size-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium">
                        No hay solicitudes en esta bandeja con los filtros seleccionados.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSolicitudes.map((s) => {
                  const isPublic = s.tipoInstitucion === "Pública";
                  const isPendienteIntegracion = s.estado === "Pendiente de integración";
                  const isReadyForApprovalPublic =
                    isPublic &&
                    (s.estado === "Aprobada por Gestión" ||
                      s.estado === "Aprobada por Normatividad" ||
                      s.estado === "En formalización" ||
                      s.estado === "Aprobación final");
                  const isReadyForApprovalPrivate =
                    !isPublic &&
                    (s.estado === "Pago verificado" || s.estado === "Pago validado");
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

                  return (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        {s.id}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={s.institucion}>
                        {s.institucion}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {s.proyectoNombre || s.fuentePrincipal}
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={isPublic ? "info" : "warning"}
                          appearance="soft"
                          className="text-xs"
                        >
                          {s.tipoInstitucion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            isAlreadyApproved
                              ? "success"
                              : isPendienteIntegracion ||
                                s.estado === "Divergencia de facturación" ||
                                s.estado === "Pago bloqueado por intentos" ||
                                s.estado === "Cerrada por reversión"
                              ? "danger"
                              : isReadyForApprovalPublic || isReadyForApprovalPrivate
                              ? "primary"
                              : "warning"
                          }
                          appearance="soft"
                          className="text-xs"
                        >
                          {s.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSolicitud(s)}
                            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                            Expediente
                          </Button>

                          {/* SOL-09 Crit. 3: Reintentar integración idempotente */}
                          {isPendienteIntegracion && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                reintentarIntegracionExpedientePublico(
                                  s.id,
                                  "Dr. Roberto Andrade (Director de Gestión)"
                                );
                                toast.success(
                                  "Expediente público integrado exitosamente (SOL-09 Crit. 3)",
                                  {
                                    description:
                                      "Reintento idempotente completado sin duplicar registros. Listo para Aprobación Final (SOL-10).",
                                  }
                                );
                              }}
                              className="gap-1.5 text-xs"
                            >
                              <RefreshCw className="size-3.5" />
                              Reintentar Integración (SOL-09)
                            </Button>
                          )}

                          {/* SOL-10: Aprobar o Devolver */}
                          {(isReadyForApprovalPublic || isReadyForApprovalPrivate) && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setModalDevolucion(s);
                                  setObservacionDevolucion("");
                                }}
                                className="gap-1 text-xs"
                              >
                                <RotateCcw className="size-3.5" />
                                Observar / Devolver
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
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
                                className="gap-1.5 text-xs"
                              >
                                <FileCheck2 className="size-3.5" />
                                Aprobar Final (SOL-10)
                              </Button>
                            </>
                          )}

                          {/* ACC-08: Actualizar cupo/alcance en Apigee */}
                          {(s.estado === "Acceso habilitado" ||
                            s.estado === "Acceso generado") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setModalActualizarCupo(s);
                                setNuevoCupoApigee(
                                  String((s.cupo || 100000) + 50000)
                                );
                              }}
                              className="gap-1 text-xs"
                            >
                              <SlidersHorizontal className="size-3.5" />
                              Actualizar Cupo (ACC-08)
                            </Button>
                          )}

                          {/* PAG-04: Revertir pago confirmado */}
                          {canRevertPayment && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setModalReversionPago(s);
                                setMotivoReversionPago("");
                              }}
                              className="gap-1 text-xs text-destructive"
                            >
                              <Ban className="size-3.5" />
                              Revertir Pago (PAG-04)
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
          {filteredSolicitudes.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-surface p-10 text-center flex flex-col items-center justify-center text-muted-foreground gap-2">
              <FileCheck2 className="size-8 stroke-1 text-muted-foreground/60" />
              <p className="text-sm font-medium">
                No hay solicitudes en esta bandeja con los filtros seleccionados.
              </p>
            </div>
          ) : (
            filteredSolicitudes.map((s) => {
              const isPublic = s.tipoInstitucion === "Pública";
              const isPendienteIntegracion =
                s.estado === "Pendiente de integración";
              const isReadyForApprovalPublic =
                isPublic &&
                (s.estado === "Aprobada por Gestión" ||
                  s.estado === "Aprobada por Normatividad" ||
                  s.estado === "En formalización" ||
                  s.estado === "Aprobación final");
              const isReadyForApprovalPrivate =
                !isPublic &&
                (s.estado === "Pago verificado" || s.estado === "Pago validado");
              const isAlreadyApproved =
                s.estado ===
                  "Solicitud aprobada — habilitación técnica pendiente" ||
                s.estado === "Habilitación técnica" ||
                s.estado === "Acceso habilitado" ||
                s.estado === "Acceso generado";
              const canRevertPayment =
                !isPublic &&
                (s.estado === "Pago verificado" ||
                  s.estado === "Pago validado" ||
                  s.estado === "Acceso habilitado" ||
                  s.estado === "Acceso generado");

              return (
                <InteractiveCard
                  key={s.id}
                  as="div"
                  className="p-4 flex flex-col gap-3 bg-surface border-border"
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {s.id}
                        </span>
                        <Badge
                          tone={isPublic ? "info" : "warning"}
                          appearance="soft"
                          className="text-xs"
                        >
                          {s.tipoInstitucion}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {s.institucion}
                      </p>
                    </div>
                    <Badge
                      tone={
                        isAlreadyApproved
                          ? "success"
                          : isPendienteIntegracion ||
                            s.estado === "Divergencia de facturación" ||
                            s.estado === "Pago bloqueado por intentos" ||
                            s.estado === "Cerrada por reversión"
                          ? "danger"
                          : isReadyForApprovalPublic || isReadyForApprovalPrivate
                          ? "primary"
                          : "warning"
                      }
                      appearance="soft"
                      className="text-xs shrink-0"
                    >
                      {s.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs w-full pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground block">
                        Proyecto / Paquete
                      </span>
                      <span className="font-medium text-foreground">
                        {s.proyectoNombre || s.fuentePrincipal}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        Fuente principal
                      </span>
                      <span className="font-medium text-foreground">
                        {s.fuentePrincipal || s.fuentes?.[0]?.nombre || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-border w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSolicitud(s)}
                      className="gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-3.5" />
                      Expediente
                    </Button>

                    {isPendienteIntegracion && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          reintentarIntegracionExpedientePublico(
                            s.id,
                            "Dr. Roberto Andrade (Director de Gestión)"
                          );
                          toast.success(
                            "Expediente público integrado exitosamente (SOL-09 Crit. 3)",
                            {
                              description:
                                "Reintento idempotente completado sin duplicar registros. Listo para Aprobación Final (SOL-10).",
                            }
                          );
                        }}
                        className="gap-1.5 text-xs"
                      >
                        <RefreshCw className="size-3.5" />
                        Reintentar Integración (SOL-09)
                      </Button>
                    )}

                    {(isReadyForApprovalPublic || isReadyForApprovalPrivate) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setModalDevolucion(s);
                            setObservacionDevolucion("");
                          }}
                          className="gap-1 text-xs"
                        >
                          <RotateCcw className="size-3.5" />
                          Observar / Devolver
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
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
                          className="gap-1.5 text-xs"
                        >
                          <FileCheck2 className="size-3.5" />
                          Aprobar Final (SOL-10)
                        </Button>
                      </>
                    )}

                    {(s.estado === "Acceso habilitado" ||
                      s.estado === "Acceso generado") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModalActualizarCupo(s);
                          setNuevoCupoApigee(
                            String((s.cupo || 100000) + 50000)
                          );
                        }}
                        className="gap-1 text-xs"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        Actualizar Cupo (ACC-08)
                      </Button>
                    )}

                    {canRevertPayment && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setModalReversionPago(s);
                          setMotivoReversionPago("");
                        }}
                        className="gap-1 text-xs text-destructive"
                      >
                        <Ban className="size-3.5" />
                        Revertir Pago (PAG-04)
                      </Button>
                    )}
                  </div>
                </InteractiveCard>
              );
            })
          )}
        </div>
      </div>

      {/* Drawer Amplio: Expediente de Autorización (Pública) o Checklist (Privada) */}
      <Sheet
        open={!!selectedSolicitud}
        onOpenChange={(open) => !open && setSelectedSolicitud(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-6 sm:p-8"
        >
          {selectedSolicitud && (
            <div className="flex flex-col gap-6">
              <SheetHeader className="p-0 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <Badge
                    tone={
                      selectedSolicitud.tipoInstitucion === "Pública"
                        ? "info"
                        : "warning"
                    }
                    appearance="soft"
                  >
                    {selectedSolicitud.tipoInstitucion === "Pública"
                      ? "Institución Pública (SOL-09)"
                      : "Institución Privada (DOC + FAC + PAG)"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedSolicitud.id}
                  </span>
                </div>
                <SheetTitle className="font-heading text-xl font-bold text-foreground mt-2">
                  {selectedSolicitud.tipoInstitucion === "Pública"
                    ? "Expediente Público Integrado de Autorización"
                    : "Verificación de Contrato Firmado, Factura API y Confirmación de Pasarela"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {selectedSolicitud.tipoInstitucion === "Pública"
                    ? "Revisión integral de la solicitud aprobada y dictámenes previos sin requerir contrato ni facturación (SOL-09)."
                    : "Comprobación de contrato bilateral firmado (DOC-03), factura emitida automáticamente (FAC-01) y confirmación de pago por webhook de pasarela (PAG-02)."}
                </SheetDescription>
              </SheetHeader>

              {selectedSolicitud.integracionPendienteDetalle && (
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-xs space-y-2">
                  <p className="font-bold text-foreground">
                    Error Técnico en Integración del Expediente Público (SOL-09 Crit. 3)
                  </p>
                  <p className="text-muted-foreground">
                    {selectedSolicitud.integracionPendienteDetalle}
                  </p>
                </div>
              )}

              {/* Bloque: Información del Trámite */}
              <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Institución:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSolicitud.institucion}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Proyecto:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSolicitud.proyectoNombre || "Trámites Institucionales"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fuente solicitada:</span>
                  <span className="font-semibold text-foreground">
                    {selectedSolicitud.fuentePrincipal ||
                      selectedSolicitud.fuentes?.[0]?.nombre}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Estado actual:</span>
                  <Badge tone="primary" appearance="soft" className="text-[11px] mt-0.5">
                    {selectedSolicitud.estado}
                  </Badge>
                </div>
              </div>

              {/* SI ES PÚBLICA */}
              {selectedSolicitud.tipoInstitucion === "Pública" ? (
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Database className="size-4 text-primary" />
                      Campos Aprobados y Finalidades de Uso
                    </h3>
                    <div className="divide-y divide-border">
                      {selectedSolicitud.fuentes
                        ?.flatMap((f) => f.campos || [])
                        .map((c) => (
                          <div
                            key={c.id}
                            className="py-2.5 first:pt-0 last:pb-0 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-semibold text-foreground">
                                {c.nombre}
                              </span>
                              <Badge
                                tone={
                                  c.clasificacion === "Confidencial"
                                    ? "warning"
                                    : "info"
                                }
                                appearance="soft"
                                className="text-[10px]"
                              >
                                {c.clasificacion}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              <strong className="text-foreground">Finalidad:</strong>{" "}
                              {c.finalidad}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-4 text-success" />
                      Dictámenes de Gestión y Normatividad Consolidados (SOL-09)
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      El expediente público consolida la solicitud aprobada y los dictámenes técnicos/jurídicos correspondientes sin generar orden contractual ni cobro tarifario.
                    </p>
                  </div>
                </div>
              ) : (
                /* SI ES PRIVADA: CHECKLIST CONTRATO + FACTURA API + PASARELA */
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileSignature className="size-4 text-primary" />
                      1. Contrato Interinstitucional Privado (DOC-01..03)
                    </h3>
                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Contrato formal:</span>
                        <span className="font-semibold text-foreground">
                          {selectedSolicitud.contratoDetalle?.numero ||
                            selectedSolicitud.contrato ||
                            "CON-PRIV-2026-005"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Firma Coordinador SINARP:
                        </span>
                        <Badge
                          tone={
                            selectedSolicitud.contratoDetalle?.firmadoCoordinador
                              ? "success"
                              : "warning"
                          }
                          appearance="soft"
                        >
                          {selectedSolicitud.contratoDetalle?.firmadoCoordinador
                            ? "Firmado electrónicamente"
                            : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Firma Máxima Autoridad DINARP:
                        </span>
                        <Badge
                          tone={
                            selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad
                              ? "success"
                              : "warning"
                          }
                          appearance="soft"
                        >
                          {selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad
                            ? "Firmado electrónicamente"
                            : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Receipt className="size-4 text-primary" />
                      2. Facturación Automática (API) y Confirmación de Pasarela (FAC-01 / PAG-02)
                    </h3>
                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Comprobante Electrónico (FAC-01):
                        </span>
                        <span className="font-semibold text-foreground font-mono">
                          {selectedSolicitud.factura?.numero ||
                            "FAC-001-002-000094821"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Versión Tarifaria Aplicada:
                        </span>
                        <span className="font-mono text-foreground">
                          {selectedSolicitud.factura?.versionTarifaria ||
                            "TAR-2026-V2.1"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Valor calculado por cupo ({(selectedSolicitud.cupo ?? 100000).toLocaleString()} cons.):
                        </span>
                        <span className="font-bold text-foreground">
                          {selectedSolicitud.factura?.valor || "$ 0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          Confirmación de Webhook Pasarela (PAG-02):
                        </span>
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
                        >
                          {selectedSolicitud.estado === "Pago verificado" ||
                          selectedSolicitud.estado === "Pago validado" ||
                          selectedSolicitud.estado === "Acceso habilitado" ||
                          selectedSolicitud.estado === "Acceso generado"
                            ? "Pago Confirmado por Pasarela"
                            : selectedSolicitud.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial del trámite */}
              <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  Historial y Trazabilidad del Trámite
                </h3>
                <TrazabilidadTimeline historial={selectedSolicitud.historial || []} />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal Aprobación Final (SOL-10 + ACC-01/02) */}
      <Dialog
        open={!!modalAprobacion}
        onOpenChange={(open) => !open && setModalAprobacion(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" />
              Aprobación Final y Disparo de Aprovisionamiento Apigee (SOL-10 → ACC-01)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Al aprobar finalmente la solicitud, el sistema dispara la creación automática del Developer App y API Product en Apigee (`ACC-01`) con secreto temporal (`ACC-09`).
            </DialogDescription>
          </DialogHeader>

          {modalAprobacion && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
                <p>
                  <span className="text-muted-foreground">Solicitud:</span>{" "}
                  <strong className="text-foreground">{modalAprobacion.id}</strong>
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

              <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-semibold text-foreground">
                    Simular fallo inicial de Apigee en aprovisionamiento (ACC-02)
                  </p>
                  <p className="text-muted-foreground">
                    Si se activa, el trámite quedará en estado &quot;Habilitación técnica&quot; para que TI ejecute el reintento idempotente.
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalAprobacion(null)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmarAprobacion}
              className="gap-1.5"
            >
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
              <strong>{modalDevolucion?.id}</strong>. No se disparará la creación del acceso en Apigee.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Área de Destino:
              </label>
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
                placeholder="Detalle la inconsistencia detectada en el expediente o contrato..."
                value={observacionDevolucion}
                onChange={(e) => setObservacionDevolucion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalDevolucion(null)}
            >
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
              <strong>Cerrada por reversión</strong> y se suspende cualquier credencial activa en Apigee (`ACC-06`).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <label className="font-semibold text-foreground">
              Motivo y Referencia de Reversión / Contracargo:
            </label>
            <Textarea
              rows={3}
              placeholder="Ej: Notificación bancaria de reversión REV-2026-991 por anulación del débito..."
              value={motivoReversionPago}
              onChange={(e) => setMotivoReversionPago(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalReversionPago(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!motivoReversionPago.trim()}
              onClick={handleConfirmarReversionPago}
            >
              Confirmar Reversión y Cerrar Solicitud
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
              Sincroniza la modificación aprobada de cupo o alcance con el API Product de{" "}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalActualizarCupo(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmarActualizarCupo}
            >
              Sincronizar Nuevo Cupo en Apigee (ACC-08)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
