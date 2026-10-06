"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  FileText,
  ShieldCheck,
  History,
  CheckCircle2,
  XCircle,
  UserPlus,
  RotateCcw,
  FileSignature,
  Mail,
  Check,
  Clock,
  Download,
  Eye,
  X,
  FileSpreadsheet,
  AlertTriangle,
  Info,
  MapPin,
  CreditCard,
  Phone,
  Smartphone,
  Calendar,
  UserCheck,
  Home,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/ui/stepper";
import { Card, CardTitle, CardDescription, CardBadge, CardDecorativeIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  puedeReasignarSolicitud,
  type SolicitudIngreso,
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { AprobarSolicitudDialog } from "@/components/shared/solicitudes/aprobar-solicitud-dialog";
import { RechazarSolicitudDialog } from "@/components/shared/solicitudes/rechazar-solicitud-dialog";
import { AsignarRevisorDialog, AsignarRevisorPanel } from "@/components/shared/solicitudes/asignar-revisor-dialog";
import { ResolucionInstitucionalPanel } from "@/components/shared/solicitudes/resolucion-institucional-panel";
import { SolicitudAnexoBDetail } from "@/components/shared/solicitudes/solicitud-anexo-b-tabs";
import { Enr03SimulacionPanel } from "@/components/shared/solicitudes/enr03-simulacion-panel";
import { useEnr03SimulationStore } from "@/modules/gestion-solicitudes/data/enr03-store";
import { buildTramiteTimelineItems } from "@/components/shared/solicitudes/tramite-timeline-helper";
import { BorradorAnexoAModal } from "@/components/shared/solicitudes/borrador-anexo-a-modal";
import {
  useCambioCoordinadorStore,
  asignarRevisorStandalone,
  aprobarCambioStandalone,
  rechazarCambioStandalone,
} from "@/modules/cambio-coordinador/data/cambio-coordinador-store";
import { SolicitudAnexoCDetail } from "@/components/shared/solicitudes/solicitud-anexo-c-tabs";

interface SolicitudDetalleViewProps { id: string; basePath?: string; sectionTitle?: string; showEnr03?: boolean; }

export function SolicitudDetalleView({ id, basePath = "/asignacion-solicitudes", sectionTitle, showEnr03 = true }: SolicitudDetalleViewProps) {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const currentUser = activeUser || MOCK_USERS_BY_ROLE.DIR_GESTION;
  const isDirector = currentUser.role === "DIR_GESTION" || currentUser.role === "DIR_NORMATIVA";
  const isRevisor = currentUser.role === "EQ_GESTION" || currentUser.role === "EQ_NORMATIVA";

  const store = useSolicitudesIngresoStore();
  const {
    solicitudes,
    isLoaded,
    aprobarSolicitud,
    rechazarSolicitud,
    pausarRevision,
    iniciarRevision,
  } = store;

  const cambioStore = useCambioCoordinadorStore();
  const tramiteCambioFromStore = cambioStore.getTramiteById(id);

  const solicitud = useMemo(() => {
    const found = solicitudes.find((s) => s.id.toLowerCase() === id.toLowerCase());
    if (found) return found;
    if (tramiteCambioFromStore) {
      return {
        id: tramiteCambioFromStore.id,
        tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
        codigoDocumental: "ARP-R03",
        tituloTramite: "Cambio de coordinador · Anexo C",
        cedula: tramiteCambioFromStore.coordinadorEntrante.cedula,
        nombres: tramiteCambioFromStore.coordinadorEntrante.nombreCompleto.split(" ")[0] || "Roberto",
        apellidos: tramiteCambioFromStore.coordinadorEntrante.nombreCompleto.split(" ").slice(1).join(" ") || "Dávila",
        nombreCompleto: tramiteCambioFromStore.coordinadorEntrante.nombreCompleto,
        iniciales: "RD",
        correo: tramiteCambioFromStore.coordinadorEntrante.correo,
        institucion: tramiteCambioFromStore.institucion,
        fechaSolicitud: tramiteCambioFromStore.fechaSolicitud,
        estado: (tramiteCambioFromStore.estadoTramite === "En revisión"
          ? "EN_REVISION_GESTION"
          : tramiteCambioFromStore.estadoTramite === "Aprobado" || tramiteCambioFromStore.estadoTramite === "Aplicado"
          ? "Aprobada"
          : tramiteCambioFromStore.estadoTramite === "Rechazado"
          ? "Rechazada"
          : "PENDIENTE_ASIGNACION_GESTION") as any,
        revisorGestion: tramiteCambioFromStore.revisorAsignado?.nombre,
        revisor: tramiteCambioFromStore.revisorAsignado?.nombre,
        fechaAsignacionGestion: tramiteCambioFromStore.revisorAsignado?.fechaAsignacion,
        observacionesAsignacion: tramiteCambioFromStore.revisorAsignado?.observaciones,
        documentos: ["ARP-R03_Cambio_Coordinador.pdf"],
        historial: (tramiteCambioFromStore.trazabilidad || []).map((t) => ({
          id: t.id,
          fechaHora: t.fecha,
          accion: t.accion,
          realizadoPor: t.actor,
          rol: t.rol,
          detalles: t.detalle,
        })),
        anexoC: tramiteCambioFromStore.datosAnexoC,
      } as SolicitudIngreso;
    }
    return null;
  }, [solicitudes, id, tramiteCambioFromStore]);

  const isAnexoC =
    solicitud?.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ||
    solicitud?.codigoDocumental === "ARP-R03" ||
    Boolean(solicitud?.anexoC) ||
    id.startsWith("CAM-") ||
    Boolean(solicitud?.tituloTramite?.toLowerCase().includes("anexo c"));

  const esAnexoB =
    solicitud?.codigoDocumental === "ARP-R02" ||
    solicitud?.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ||
    Boolean(solicitud?.anexoB) ||
    id.endsWith("-B") ||
    Boolean(solicitud?.tituloTramite?.toLowerCase().includes("anexo b"));

  const [detailTab, setDetailTab] = useState<number>(0);
  const sim = useEnr03SimulationStore();

  const [isBorradorOpen, setIsBorradorOpen] = useState(false);

  // Línea de tiempo cronológica enriquecida con jerarquía semántica, diferenciación visual y deduplicación
  const timelineItems: TimelineItem[] = useMemo(() => {
    return buildTramiteTimelineItems(solicitud, {
      onViewBorradorAnexoA: () => {
        setIsBorradorOpen(true);
      },
    });
  }, [solicitud]);

  // Dialog states
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  // Preview document modal
  const [previewDoc, setPreviewDoc] = useState<{
    titulo: string;
    archivo: string;
  } | null>(null);

  const activeSectionTitle = useMemo(() => { if (sectionTitle) return sectionTitle; if (currentUser.role === "DIR_GESTION" || currentUser.role === "DIR_NORMATIVA") return "Asignación de solicitudes"; if (currentUser.role === "EQ_NORMATIVA") return "Solicitudes pendientes"; if (currentUser.role === "EQ_GESTION") return "Solicitudes pendientes"; return "Gestión de ingresos"; }, [currentUser.role, sectionTitle]);

  const handleConfirmAsignacion = (
    solicitudId: string,
    revisorNombre: string,
    asignadoPor: string = currentUser.name,
    observaciones?: string
  ) => {
    if (sim.simularFalloGuardado) {
      toast.error("No se guardó la asignación; reintenta", {
        description: "Error transaccional simulado al persistir la asignación (ENR-03 R5).",
      });
      return;
    }
    if (solicitud?.estado.includes("NORMATIVIDAD") || currentUser.role === "DIR_NORMATIVA") {
      store.asignarRevisorNormatividad(solicitudId, revisorNombre, asignadoPor, observaciones);
    } else {
      store.asignarRevisorGestion(solicitudId, revisorNombre, asignadoPor, observaciones);
    }

    if (isAnexoC || solicitudId.startsWith("CAM-")) {
      asignarRevisorStandalone(solicitudId, {
        id: "1111111111",
        nombre: revisorNombre,
        cargo: "Revisor Área de Gestión",
        observaciones,
      });
    }

    if (isAnexoC) {
      toast.success(`Revisor del Anexo C asignado: ${revisorNombre} (${solicitudId})`, {
        description: "Trámite asignado formalmente en el Equipo de Gestión para revisión de cambio de coordinador.",
      });
    } else if (esAnexoB) {
      toast.success(`Revisor del Anexo B asignado: ${revisorNombre} (${solicitudId})`, {
        description: "Trámite asignado formalmente en el Equipo de Gestión.",
      });
    } else {
      toast.success("Revisor asignado exitosamente", {
        description: `El trámite ${solicitudId} fue asignado a ${revisorNombre}.`,
      });
    }
  };

  const renderEstadoBadge = (estado: any, revisionIniciada?: boolean) => {
    const { tone, label } = getEstadoBadgeProps(estado, revisionIniciada);
    return (
      <Badge
        tone={tone}
        appearance="soft"
        size="sm"
        dot
        className="font-semibold text-[11px] normal-case tracking-normal px-2.5 py-0.5 inline-flex items-center shrink-0 shadow-2xs max-w-full"
      >
        <span className="truncate max-w-[200px] sm:max-w-none">{label}</span>
      </Badge>
    );
  };

  const tramiteCambio =
    tramiteCambioFromStore ||
    (solicitud?.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" || id.startsWith("CAM-")
      ? {
          id: solicitud?.id || id,
          numeroTramite: solicitud?.id || id,
          institucion: solicitud?.institucion || "Ministerio de Educación",
          ruc: "1760004560001",
          fechaSolicitud: solicitud?.fechaSolicitud || "04/10/2026 10:30",
          caracter: (solicitud?.anexoC?.aplicaCambioTitular ? "TITULAR" : "SUPLENTE") as any,
          coordinadorSaliente: {
            nombreCompleto: "Juan Pérez",
            cedula: "1712345678",
            correo: "juan.perez@educacion.gob.ec",
            cargo: "Director de Tecnologías de la Información",
            caracter: "TITULAR",
            estado: "ACTIVO",
            anexoBAprobado: true,
          },
          coordinadorEntrante: {
            nombreCompleto:
              solicitud?.nombreCompleto ||
              solicitud?.anexoC?.nuevoTitularNombre ||
              "Roberto Carlos Dávila Silva",
            cedula:
              solicitud?.cedula ||
              solicitud?.anexoC?.nuevoTitularCedula ||
              "1721345987",
            correo:
              solicitud?.correo ||
              solicitud?.anexoC?.nuevoTitularEmail ||
              "roberto.davila@educacion.gob.ec",
            cargo:
              solicitud?.anexoC?.nuevoTitularCargo ||
              "Director Nacional de Tecnologías",
            motivo:
              solicitud?.anexoC?.nuevoTitularMotivo ||
              "Reestructuración administrativa interna de la institución.",
            poseeCuentaSistema: false,
            poseeAnexoBAprobado: false,
          },
          firmanteTipo: (solicitud?.anexoC?.esDelegado
            ? "DELEGADO_AUTORIZADO"
            : "MAXIMA_AUTORIDAD") as any,
          estadoDocumento: "Firma verificada",
          estadoTramite: (solicitud?.estado === "Aprobada"
            ? "Aprobado"
            : solicitud?.estado === "Rechazada"
            ? "Rechazado"
            : solicitud?.revisorGestion
            ? "En revisión"
            : "Pendiente de asignación") as any,
          firmaEC: {
            estado: "VALIDA",
            transaccionId: "FEC-2026-90412",
            firmante:
              solicitud?.anexoC?.representanteLegalNombre || "Carlos Andrade",
            fechaFirma: solicitud?.fechaSolicitud || "04/10/2026 10:30",
            huellaSha256:
              "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1",
            entidadCertificadora: "Banco Central del Ecuador (BCE)",
          },
          revisorAsignado: solicitud?.revisorGestion
            ? {
                id: "1111111111",
                nombre: solicitud.revisorGestion,
                cargo: "Revisor Área de Gestión",
                fechaAsignacion:
                  solicitud.fechaAsignacionGestion || solicitud.fechaSolicitud,
              }
            : undefined,
          trazabilidad: (solicitud?.historial || []).map((h) => ({
            id: h.id,
            fecha: h.fechaHora || solicitud?.fechaSolicitud || "",
            accion: h.accion,
            actor: h.realizadoPor || "",
            rol: h.rol || "",
            detalle: h.detalles || "",
          })),
          datosAnexoC: (solicitud?.anexoC || {}) as any,
        }
      : null);

  if (isLoaded && !solicitud) {
    return (
      <WireframeDashboardLayout
        breadcrumbs={[
          { label: activeSectionTitle, onClick: () => router.push(basePath) },
          { label: "Trámite no encontrado" },
        ]}
      >
        <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 my-8">
          <div className="size-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
            <XCircle className="size-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">Solicitud no encontrada</h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No se encontró ninguna solicitud con el código <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{id}</code>.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(basePath)}
            className="h-10 px-4 text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a la bandeja</span>
          </Button>
        </div>
      </WireframeDashboardLayout>
    );
  }

  if (!solicitud) {
    return (
      <WireframeDashboardLayout breadcrumbs={[{ label: activeSectionTitle }]}>
        <div className="p-8 text-center text-xs text-muted-foreground">Cargando datos del trámite...</div>
      </WireframeDashboardLayout>
    );
  }

  return (
    <WireframeDashboardLayout
      breadcrumbs={[
        {
          label: activeSectionTitle,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            router.push(basePath);
          },
        },
        {
          label: solicitud.tituloTramite || "Solicitud de Registro de Institución",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            router.push(basePath);
          },
        },
        { label: solicitud.id },
      ]}
    >
      <main className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* White outer container card holding all page information */}
        <div className="bg-surface border border-border rounded-xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xs space-y-6">
          {/* Barra superior interna con botón Volver y acciones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push(basePath)}
              className="h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted shrink-0 self-start"
              title="Volver a la bandeja"
            >
              <ArrowLeft className="size-3.5" />
              <span>Volver</span>
            </Button>

            {/* Botones de acción en la cabecera */}
            {currentUser.role === "EQ_GESTION" && (solicitud.estado === "EN_REVISION_GESTION" || solicitud.estado === "PENDIENTE_ASIGNACION_GESTION" || solicitud.estado === "Pendiente") ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs font-semibold gap-2 border-danger/30 text-danger hover:bg-danger/10 rounded-xl w-full sm:w-auto"
                >
                  <XCircle className="size-4" />
                  <span>Rechazar solicitud</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsApproveOpen(true)}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs font-semibold gap-2 shadow-xs w-full sm:w-auto"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Aprobar solicitud</span>
                </Button>
              </div>
            ) : null}

            {/* Botones de acción en la cabecera para EQ_NORMATIVA */}
            {currentUser.role === "EQ_NORMATIVA" && (solicitud.estado === "PENDIENTE_GENERAR_RESOLUCION" || solicitud.estado === "EN_GENERACION_RESOLUCION" || solicitud.estado === "GENERACION_PENDIENTE") ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs font-semibold gap-2 border-danger/30 text-danger hover:bg-danger/10 rounded-xl w-full sm:w-auto"
                >
                  <XCircle className="size-4" />
                  <span>Rechazar trámite</span>
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    store.iniciarRevision(solicitud.id, currentUser.name);
                    router.push(`${basePath}/${solicitud.id}/gestionar-resolucion`);
                  }}
                  className="h-9 sm:h-10 px-3 sm:px-4 text-xs font-semibold gap-2 shadow-xs w-full sm:w-auto"
                >
                  <FileSignature className="size-4" />
                  <span>Generar resolución</span>
                </Button>
              </div>
            ) : null}
          </div>

          <div className="pb-4 border-b border-border/80">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-foreground">
                  Trámite {solicitud.id}
                </h1>
                {renderEstadoBadge(solicitud.estado, solicitud.revisionIniciada)}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">
                {solicitud.tituloTramite} · Registrado el {solicitud.fechaSolicitud} · {solicitud.institucion}
              </p>
            </div>
          </div>

          {/* Banners contextuales según estado (Solo visibles para Gestión; en Normatividad todo se concentra en la columna lateral derecha) */}
          {currentUser.role !== "DIR_NORMATIVA" && currentUser.role !== "EQ_NORMATIVA" && (solicitud.estado === "EN_REVISION_GESTION" || solicitud.estado === "PENDIENTE_ASIGNACION_GESTION" || solicitud.estado === "Pendiente") && (
            <div className="p-4 rounded-2xl border text-foreground space-y-2 animate-in fade-in duration-150 bg-warning/5 border-warning/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl border flex items-center justify-center shrink-0 bg-warning/10 border-warning/20 text-warning">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Solicitud pendiente de revisión
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      El expediente está asignado al revisor, pendiente de emitir la decisión técnica de aprobación o rechazo.
                    </p>
                  </div>
                </div>
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="md"
                  className="font-bold text-xs shrink-0 self-start sm:self-auto"
                >
                  PENDIENTE DE REVISIÓN
                </Badge>
              </div>

              <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] border-warning/10">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">Tipo de solicitud:</span>
                  <strong className="text-foreground font-semibold">
                    {solicitud.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION"
                      ? "Anexo A — Solicitud de Registro de Institución"
                      : solicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR"
                      ? "Anexo B — Solicitud de Registro de Coordinador"
                      : solicitud.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR"
                      ? "Anexo C — Solicitud de Cambio de Coordinador"
                      : "Solicitud de Ingreso"}
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisor responsable: </span>
                  <strong className="text-foreground">
                    {solicitud.revisorGestion || solicitud.revisor || "Revisor asignado"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {currentUser.role !== "DIR_NORMATIVA" && currentUser.role !== "EQ_NORMATIVA" && solicitud.estado === "Aprobada" && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-foreground" />
                <span>
                  {solicitud.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" &&
                    "Institución aprobada: Coordinadores prerregistrados e invitados al Proceso B"}
                  {solicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" &&
                    "Acuerdo de Confidencialidad aprobado: Coordinador institucional ACTIVO"}
                  {solicitud.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" &&
                    "Cambio aprobado: Nuevo coordinador prerregistrado e invitado al Proceso B"}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de resolución: </span>
                  <strong className="text-foreground">{solicitud.fechaRevision || "Reciente"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisado por: </span>
                  <strong className="text-foreground">{solicitud.revisor || "Dirección de Gestión y Registro"}</strong>
                </div>
              </div>
            </div>
          )}

          {currentUser.role !== "DIR_NORMATIVA" && currentUser.role !== "EQ_NORMATIVA" && solicitud.estado === "Rechazada" && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <XCircle className="size-4 shrink-0 text-muted-foreground" />
                <span>Trámite Denegado / Observado</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border text-xs">
                <span className="font-semibold text-foreground block mb-1">Motivo registrado para notificación:</span>
                <p className="text-foreground leading-relaxed">{solicitud.motivoRechazo || "No se especificó motivo de rechazo."}</p>
              </div>
              <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de resolución: </span>
                  <strong className="text-foreground">{solicitud.fechaRevision || "Reciente"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisado por: </span>
                  <strong className="text-foreground">{solicitud.revisor || "Dirección de Gestión y Registro"}</strong>
                </div>
              </div>
            </div>
          )}

          {currentUser.role !== "DIR_NORMATIVA" && currentUser.role !== "EQ_NORMATIVA" && solicitud.estado === "Cancelada" && (
            <div className="p-5 rounded-2xl bg-danger/5 border border-danger/30 text-foreground space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-danger">
                <AlertTriangle className="size-5 shrink-0" />
                <span>Trámite Cerrado y Cancelado Definitivamente</span>
              </div>
              <div className="p-3.5 bg-surface rounded-xl border border-danger/20 text-xs">
                <span className="font-semibold text-danger block mb-1">
                  Dictamen técnico de revisión:
                </span>
                <p className="text-foreground leading-relaxed">
                  {solicitud.motivoRechazo ||
                    "Revisión técnica desfavorable por documentación caducada o inconsistencias insubsanables en la firma. La solicitud ha sido cancelada y cerrada formalmente."}
                </p>
              </div>
              <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs flex items-start gap-2.5 text-muted-foreground">
                <Info className="size-4 shrink-0 text-foreground mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-foreground">Acción obligatoria para la institución:</strong> Al haberse cerrado y cancelado este trámite formalmente, no admite subsanación en esta instancia. La entidad requirente debe regularizar sus requisitos habilitantes y realizar un nuevo ingreso de solicitud desde cero en el portal.
                </p>
              </div>
              <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de cancelación: </span>
                  <strong className="text-foreground">{solicitud.fechaRevision || "20/09/2026 16:45"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisado por: </span>
                  <strong className="text-foreground">{solicitud.revisor || "Ana Torres (Área de Gestión)"}</strong>
                </div>
              </div>
            </div>
          )}

          {currentUser.role !== "DIR_NORMATIVA" && currentUser.role !== "EQ_NORMATIVA" && solicitud.estado === "APROBADO_FINAL" && (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span>Trámite Aprobado con Resolución Oficial Emitida</span>
              </div>
              <div className="p-3 bg-surface rounded-xl border border-border text-xs">
                <span className="font-semibold text-foreground block mb-1">Resolución Final:</span>
                <p className="font-mono font-bold text-primary">{solicitud.resolucion || "RES-DINARP-2026-088"}</p>
              </div>
              <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fecha de resolución: </span>
                  <strong className="text-foreground">{solicitud.fechaRevision || "Reciente"}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Revisores intervinientes: </span>
                  <strong className="text-foreground">
                    {solicitud.revisorGestion ? `${solicitud.revisorGestion} (Gestión)` : "Gestión"} ·{" "}
                    {solicitud.revisorNormatividad ? `${solicitud.revisorNormatividad} (Normatividad)` : "Normatividad"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* DISTRIBUCIÓN EN 2 COLUMNAS: IZQUIERDA RESUMEN/TRAZABILIDAD, DERECHA PANEL DE ASIGNACIÓN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA IZQUIERDA (7 cols en lg, 7 en xl): RESUMEN DE SOLICITUD Y TRAZABILIDAD */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6">
              <Tabs defaultValue="resumen" className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                  <div className="overflow-x-auto w-full sm:w-auto -mx-1 px-1">
                    <TabsList className="h-auto p-1 rounded-full bg-background border border-border/40 inline-flex gap-1 w-max sm:w-auto justify-start flex-nowrap">
                      <TabsTrigger
                        value="resumen"
                        className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                      >
                        <Building2 className="size-3.5 sm:size-4 shrink-0" />
                        <span className="truncate max-w-[210px] sm:max-w-none">Solicitud Registro Institución</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="trazabilidad"
                        className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                      >
                        <History className="size-3.5 sm:size-4 shrink-0" />
                        <span>Trazabilidad</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <span>Formulario oficial:</span>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-mono border border-border">
                      {solicitud.codigoDocumental}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-5 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Información del Formulario Oficial"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" variant="primary" className="max-w-xs text-xs leading-relaxed">
                          Anexo A: Formulario diligenciado por la institución solicitante para iniciar su proceso de registro en el SINARP.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* TAB 1: RESUMEN DE SOLICITUD (FORMULARIO CON PESTAÑAS CÁPSULA SIN ESTADOS PENDIENTES) */}
                <TabsContent value="resumen" className="space-y-6 animate-in fade-in duration-200">
                  {/* Encabezado del Trámite en Card Featured estilo UI Kit con Badge Primary e Icono */}
                  {isAnexoC ? (
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                          FORMULARIO OFICIAL ARP-R03
                        </CardBadge>
                      </div>

                      <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                        Anexo C — Cambio de Coordinador Institucional
                      </CardTitle>

                      <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                        Proceso C · Sustitución de Coordinador titular o suplente mediante Anexo C
                      </CardDescription>

                      <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                        <FileText className="size-32 text-primary" />
                      </CardDecorativeIcon>
                    </Card>
                  ) : esAnexoB ? (
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                          FORMULARIO OFICIAL ARP-R02
                        </CardBadge>
                      </div>

                      <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                        Anexo B — Enrolamiento de Coordinador Institucional
                      </CardTitle>

                      <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                        Proceso B · Acuerdo de uso y confidencialidad para coordinadores
                      </CardDescription>

                      <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                        <FileText className="size-32 text-primary" />
                      </CardDecorativeIcon>
                    </Card>
                  ) : (
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2">
                        <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                          FORMULARIO OFICIAL ARP-R01
                        </CardBadge>
                      </div>

                      <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                        Anexo A — Solicitud de Registro de Institución
                      </CardTitle>

                      <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                        Proceso A · Enrolamiento institucional al SINARP
                      </CardDescription>

                      <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                        <FileText className="size-32 text-primary" />
                      </CardDecorativeIcon>
                    </Card>
                  )}

                  {/* Renderizado de contenido según tipo de anexo */}
                  {isAnexoC ? (
                    <SolicitudAnexoCDetail solicitud={solicitud} tramite={tramiteCambio} />
                  ) : esAnexoB ? (
                    <SolicitudAnexoBDetail solicitud={solicitud} />
                  ) : (
                    <>
                      {/* Pestañas Cápsula UI Kit para navegar secciones (sin badges de estado) */}
                      <div className="overflow-x-auto py-1 -mx-1 px-1">
                        <Tabs
                          defaultValue="tab-0"
                          value={`tab-${detailTab}`}
                          onValueChange={(val) => setDetailTab(Number(val.replace("tab-", "")))}
                          className="w-full"
                        >
                          <TabsList className="h-auto p-1 rounded-full bg-background border border-border/40 inline-flex gap-1 flex-nowrap w-max sm:w-auto justify-start">
                            <TabsTrigger
                              value="tab-0"
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                            >
                              <Building2 className="size-3.5 shrink-0" />
                              <span>1. Entidad y Autoridad</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="tab-1"
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                            >
                              <User className="size-3.5 shrink-0" />
                              <span>2. Coordinadores</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="tab-2"
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                            >
                              <FileText className="size-3.5 shrink-0" />
                              <span>3. Servicios y Procesos</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="tab-3"
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                            >
                              <ShieldCheck className="size-3.5 shrink-0" />
                              <span>4. Declaraciones y firma</span>
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                  {/* â”€â”€ PASO 0: ENTIDAD Y AUTORIDAD COMPARECIENTE â”€â”€ */}
                  {detailTab === 0 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      {/* Naturaleza y Datos de la Entidad */}
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-lg">
                        <div>
                          <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                            <Building2 className="size-4 text-primary dark:text-primary-300 shrink-0" />
                            <span>Sección I — Datos de la Institución y Máxima Autoridad</span>
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Información de identificación de la institución solicitante y de su máxima autoridad o delegado.
                          </p>
                        </div>
                        <Badge tone="primary" appearance="solid" size="sm" className="font-bold shrink-0 !text-white shadow-xs">
                          {solicitud.anexoA?.entidadTipo === "Privada" ? "ENTIDAD PRIVADA" : "ENTIDAD PÚBLICA"}
                        </Badge>
                      </div>

                      <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl border border-border/40">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                              1.1 Naturaleza de la Entidad
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Información general de la institución requirente y personería jurídica.
                            </p>
                          </div>
                        </div>
                        <Badge tone="primary" appearance="solid" size="sm" className="shrink-0 self-start sm:self-auto font-bold !text-white shadow-2xs">
                          ENTIDAD
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground block">Naturaleza de la Entidad</Label>
                          <div className="flex items-center gap-6 pt-1">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                              <input
                                type="radio"
                                name="entidadTipoDetail"
                                checked={solicitud.anexoA?.entidadTipo !== "Privada"}
                                disabled
                                className="size-4 text-primary accent-primary cursor-not-allowed"
                              />
                              <span>Entidad Pública</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                              <input
                                type="radio"
                                name="entidadTipoDetail"
                                checked={solicitud.anexoA?.entidadTipo === "Privada"}
                                disabled
                                className="size-4 text-primary accent-primary cursor-not-allowed"
                              />
                              <span>Entidad Privada</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Nombre de la Entidad</Label>
                          <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.nombreEntidad || solicitud.institucion}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">RUC de la Entidad (13 dígitos)</Label>
                          <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.rucEntidad || "1768000000001"}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-mono text-xs text-foreground font-semibold"
                            />
                          </InputGroup>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Dirección de la Entidad</Label>
                          <InputGroup leftIcon={<Home className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.direccionEntidad || "Av. 6 de Diciembre N25-75 y Av. Colón, Quito"}
                              disabled
                              className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Objeto Social y/o Misión Institucional</Label>
                          <Textarea
                            value={solicitud.anexoA?.objetoSocial || "Rectoría y formulación de políticas públicas de telecomunicaciones y gobierno digital."}
                            disabled
                            rows={3}
                            className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3 border-border/80"
                          />
                        </div>

                        {/* Datos del firmante del Anexo A */}
                        <div className="sm:col-span-2 pt-4">
                          <div className="bg-muted/50 p-3.5 mb-4 flex items-start sm:items-center justify-between gap-3 rounded-xl border border-border/40">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                                  Datos del firmante del Anexo A
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Información de la máxima autoridad o delegado institucional que suscribirá mediante FirmaEC.
                                </p>
                              </div>
                            </div>
                            <Badge tone="primary" appearance="solid" size="sm" className="shrink-0 self-start sm:self-auto font-bold !text-white shadow-2xs">
                              FIRMANTE
                            </Badge>
                          </div>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5 pb-2">
                          <Label className="text-xs font-semibold text-foreground block">¿Quién firmará el Anexo A?</Label>
                          <div className="flex flex-col sm:flex-row gap-4 pt-1">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                              <input
                                type="radio"
                                name="esDelegadoRadio"
                                checked={!solicitud.anexoA?.esDelegado}
                                disabled
                                className="size-4 text-primary accent-primary cursor-not-allowed"
                              />
                              <span>Máxima autoridad institucional</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                              <input
                                type="radio"
                                name="esDelegadoRadio"
                                checked={Boolean(solicitud.anexoA?.esDelegado)}
                                disabled
                                className="size-4 text-primary accent-primary cursor-not-allowed"
                              />
                              <span>Delegado de la máxima autoridad</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Nombre completo</Label>
                          <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.representanteLegalNombre || solicitud.nombreCompleto}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Denominación del cargo</Label>
                          <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.representanteLegalCargo || "Ministro de Telecomunicaciones (Representante Legal)"}
                              disabled
                              className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">Correo electrónico institucional</Label>
                          <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              value={solicitud.anexoA?.representanteLegalEmail || solicitud.correo || "ministro@mintel.gob.ec"}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-mono text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        {solicitud.anexoA?.esDelegado && (
                          <div className="sm:col-span-2 p-3.5 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="size-4 text-primary shrink-0" />
                              <div>
                                <Label className="text-xs font-semibold text-foreground block">
                                  Autorización de delegación
                                </Label>
                                <span className="text-xs font-semibold text-muted-foreground truncate block">
                                  {solicitud.anexoA?.archivoSoporteDelegacion || "Resolucion_Delegacion_Firma.pdf"}
                                </span>
                              </div>
                            </div>
                            <Badge tone="success" appearance="solid" size="sm" className="shrink-0 gap-1 font-bold self-start sm:self-auto !text-white shadow-2xs">
                              <CheckCircle2 className="size-3 text-white" />
                              <span>Adjuntado</span>
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-border flex justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(1)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: 2. Coordinadores â†’
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ PASO 1: COORDINADORES INSTITUCIONALES â”€â”€ */}
                  {detailTab === 1 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="space-y-6">
                        {/* Coordinador Titular */}
                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                          <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                                  1.2 Coordinador Institucional Principal (Titular)
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Datos del coordinador institucional titular designado por la entidad.
                                </p>
                              </div>
                            </div>
                            <Badge tone="primary" appearance="solid" size="sm" className="shrink-0 self-start sm:self-auto font-bold !text-white shadow-2xs">
                              TITULAR
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Nombre Completo</Label>
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularNombreCompleto || "Ing. Esteban Javier Morales Salazar"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía</Label>
                              <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularCedula || "1718956234"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground font-semibold" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularCargo || "Director de Gobierno Digital"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularAreaUnidad || "Viceministerio de Tecnologías de la Información"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional</Label>
                              <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularEmail || "esteban.morales@mintel.gob.ec"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularTelefonoFijo || "022200200 ext 120"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularMovilInstitucional || "0995544332"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Personal</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.titularMovilPersonal || "0984433221"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>
                          </div>
                        </div>

                        {/* Coordinador Suplente */}
                        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                          <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                                  1.3 Coordinador Institucional Suplente
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Datos del coordinador institucional alterno registrado para soporte institucional.
                                </p>
                              </div>
                            </div>
                            <Badge tone="primary" appearance="solid" size="sm" className="shrink-0 self-start sm:self-auto font-bold !text-white shadow-2xs">
                              SUPLENTE
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Nombre Completo</Label>
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteNombreCompleto || "Lic. Carmen Elena Vinueza Proaño"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía</Label>
                              <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteCedula || "1714523698"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground font-semibold" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteCargo || "Especialista de Interoperabilidad Gubernamental"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteAreaUnidad || "Dirección de Gobierno Digital"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional</Label>
                              <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteEmail || "carmen.vinueza@mintel.gob.ec"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteTelefonoFijo || "022200200 ext 125"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteMovilInstitucional || "0991122334"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Personal</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput value={solicitud.anexoA?.suplenteMovilPersonal || "0982233445"} disabled className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground" />
                              </InputGroup>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          onClick={() => setDetailTab(0)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          â† Volver a Entidad
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(2)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: Servicios y Procesos â†’
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ PASO 2: SERVICIOS Y PROCESOS DE USO â”€â”€ */}
                  {detailTab === 2 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 rounded-t-lg">
                        <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <FileCheck2 className="size-4 text-primary dark:text-primary-300 shrink-0" />
                          <span>Sección II — Servicios y Herramientas Informáticas</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Procesos y áreas en las que se van a utilizar los servicios y/o herramientas provistos por la DINARP.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* 2.1 Servicios */}
                        <div className="space-y-3">
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                              <FileCheck2 className="size-4 text-muted-foreground shrink-0" />
                              <span>2.1 Servicios y/o herramientas requeridas *</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Selecciona al menos uno de los servicios provistos por la DINARP.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {["Interoperabilidad", "Infodigital", "Ficha de Registro Único del Ciudadano"].map((s) => {
                              const isChecked = solicitud.anexoA?.serviciosHerramientas
                                ? solicitud.anexoA.serviciosHerramientas.includes(s)
                                : true;
                              return (
                                <div key={s} className="p-3.5 rounded-2xl border border-border bg-surface flex items-center gap-2.5 shadow-2xs">
                                  <Checkbox checked={isChecked} disabled />
                                  <span className="text-xs font-bold text-foreground">{s}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2.2 Áreas */}
                        <div className="space-y-3">
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                              <Building2 className="size-4 text-muted-foreground shrink-0" />
                              <span>2.2 Áreas de uso institucional *</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Indica las áreas administrativas o técnicas de la institución que utilizarán el servicio.
                            </p>
                          </div>

                          <Textarea
                            value={solicitud.anexoA?.areasUso || "Dirección de Tecnologías de la Información, Dirección de Atención Ciudadana"}
                            disabled
                            rows={2}
                            className="bg-muted/30 cursor-not-allowed text-xs font-medium text-foreground rounded-2xl p-3.5 border-border/80"
                          />
                        </div>

                        {/* 2.3 Procesos */}
                        <div className="space-y-3">
                          <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                              <FileText className="size-4 text-muted-foreground shrink-0" />
                              <span>2.3 Procesos para los cuales utilizará los servicios *</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Describe los procesos internos, trámites o plataformas para los cuales se consumirán los datos.
                            </p>
                          </div>

                          <Textarea
                            value={solicitud.anexoA?.procesosUso || "Validación de identidad ciudadana, verificación de registros y simplificación de trámites institucionales."}
                            disabled
                            rows={2}
                            className="bg-muted/30 cursor-not-allowed text-xs font-medium text-foreground rounded-2xl p-3.5 border-border/80"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          onClick={() => setDetailTab(1)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          â† Volver a Coordinadores
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(3)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: Declaraciones y firma â†’
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ PASO 3: DECLARACIONES Y FIRMA â”€â”€ */}
                  {detailTab === 3 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 rounded-t-lg">
                        <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary dark:text-primary-300 shrink-0" />
                          <span>Sección III — Declaraciones y Firma</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Declaraciones correspondientes a la solicitud y formalización mediante la firma de la máxima autoridad o delegado.
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* 2.2 Cláusula Segunda */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                          <h3 className="font-bold text-foreground text-sm">2.2 Cláusula Segunda: Declaraciones del Solicitante</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los arts. 66 numerales 11 y 19 de la Constitución, art. 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos, Ley de Optimización de Trámites, Ley Orgánica de Protección de Datos Personales, y arts. 178, 180 y 229 del COIP. La institución queda obligada a dar a la información el uso exclusivo para el que le sea concedido y custodiarla con prudencia.
                          </p>

                          <div className="flex items-start gap-3 pt-4 border-t border-border/60">
                            <Checkbox checked={solicitud.anexoA?.declaracionesAceptadas ?? true} disabled className="shrink-0 mt-0.5 cursor-not-allowed" />
                            <Label className="text-xs font-bold text-foreground cursor-not-allowed">
                              Acepto expresamente las declaraciones legales, términos y responsabilidades del Anexo A.
                            </Label>
                          </div>
                        </div>

                        {/* Resumen de Firmante */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Card
                            variant="featured"
                            disableHover={true}
                            className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                          >
                            <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                              <User className="size-3.5 text-secondary" />
                              <span>Firmante Autorizado</span>
                            </CardBadge>

                            <div className="space-y-0.5 mt-2">
                              <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                                {solicitud.anexoA?.representanteLegalNombre || "Ing. César Antonio Martín Moreno"}
                              </CardTitle>

                              <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium break-words">
                                {solicitud.anexoA?.representanteLegalCargo || "Ministro de Telecomunicaciones (Representante Legal)"}
                              </CardDescription>
                            </div>

                            <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                              <User className="size-28 text-secondary" />
                            </CardDecorativeIcon>
                          </Card>

                          <Card
                            variant="featured"
                            disableHover={true}
                            className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                          >
                            <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                              <Calendar className="size-3.5 text-secondary" />
                              <span>Fecha y Ciudad de Suscripción</span>
                            </CardBadge>

                            <div className="space-y-0.5 mt-2">
                              <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                                {solicitud.anexoA?.ciudadFirma || "Quito D.M., Ecuador"}
                              </CardTitle>

                              <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium">
                                {solicitud.anexoA?.fechaFirma || solicitud.fechaSolicitud || "24/09/2026"}
                              </CardDescription>
                            </div>

                            <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                              <Calendar className="size-28 text-secondary" />
                            </CardDecorativeIcon>
                          </Card>
                        </div>

                        {/* Certificación de datos */}
                        <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
                          <Checkbox checked={solicitud.anexoA?.firmadoDigitalmente ?? true} disabled className="cursor-not-allowed" />
                          <span className="text-xs font-bold text-foreground">
                            Confirmo que la información ingresada es verídica y corresponde a los antecedentes institucionales.
                          </span>
                        </div>

                        {/* Certificación y Documento Firmado FirmaEC */}
                        <div className="p-5 rounded-2xl border border-success/30 bg-success/5 space-y-4 shadow-2xs">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3.5 min-w-0">
                              <div className="p-2.5 rounded-xl bg-success/10 text-success shrink-0 mt-0.5">
                                <CheckCircle2 className="size-5" />
                              </div>

                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground">
                                    {solicitud.anexoA?.archivoDocumentoFirmado || `ARP-R01_Solicitud_Acceso_SINARP_${(solicitud.anexoA?.entidadSiglas || "ENTIDAD").toUpperCase()}.pdf`}
                                  </h4>
                                  <Badge tone="success" appearance="solid" size="sm" className="font-bold text-[10px] px-2 py-0.5 shrink-0 !text-white shadow-2xs">
                                    Firma verificada en FirmaEC
                                  </Badge>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  Documento firmado electrónicamente por el Representante Legal. La firma fue confirmada y validada mediante FirmaEC, incluyendo su estampado cronológico. El documento se encuentra disponible para revisión.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          onClick={() => setDetailTab(2)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          â† Volver a Servicios
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            alert(`Descargando documento firmado ARP-R01_Solicitud_Acceso_SINARP_${(solicitud.anexoA?.entidadSiglas || "ENTIDAD").toUpperCase()}.pdf con validación FirmaEC...`);
                          }}
                          className="w-full sm:w-auto h-9 px-4 text-xs font-semibold gap-2 shadow-xs"
                        >
                          <Download className="size-4" />
                          <span>Descargar Anexo A</span>
                        </Button>
                      </div>
                    </div>
                  )}
                    </>
                  )}
                </TabsContent>

                {/* TAB 2: TRAZABILIDAD (TIMELINE DEL UI KIT) */}
                <TabsContent value="trazabilidad" className="space-y-4 animate-in fade-in duration-200">
                  {/* Encabezado Trazabilidad en Card Featured variante Info (Arriba del contenedor) */}
                  <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-info-100/30 dark:bg-info-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <CardBadge className="bg-info/20 text-info text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 flex items-center gap-1.5">
                        <History className="size-3.5 text-info" />
                        <span>{timelineItems.length} {timelineItems.length === 1 ? "EVENTO REGISTRADO" : "EVENTOS REGISTRADOS"}</span>
                      </CardBadge>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold font-heading text-info mt-1">
                      Trazabilidad y Línea de Tiempo del Trámite
                    </CardTitle>

                    <CardDescription className="text-xs text-info-800/80 dark:text-info-200/80 font-medium">
                      Historial cronológico completo de envíos, asignaciones, revisiones técnicas y resoluciones emitidas.
                    </CardDescription>

                    <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                      <History className="size-32 text-info" />
                    </CardDecorativeIcon>
                  </Card>

                  {/* Contenedor principal de la sección */}
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="pt-2 max-w-4xl">
                      <Timeline items={timelineItems} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* COLUMNA DERECHA (5 cols en lg, 5 en xl): PANEL SEGÚN ROL */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-5 lg:sticky lg:top-6">
              {/* SI ES DIRECTOR (DIR_GESTION / DIR_NORMATIVA): Exclusivamente Asignación / Reasignación */}
              {isDirector && (
                <div className="bg-surface dark:bg-neutral-900/70 border border-border/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs">
                  <AsignarRevisorPanel
                    solicitud={solicitud}
                    tipoArea={
                      solicitud.estado.includes("NORMATIVIDAD") || currentUser.role === "DIR_NORMATIVA"
                        ? "NORMATIVIDAD"
                        : "GESTION"
                    }
                    directorNombre={currentUser.name}
                    allSolicitudes={solicitudes}
                    isCardMode={true}
                    onConfirmAsignacion={(solId, revisor, dirNombre, observaciones) => {
                      handleConfirmAsignacion(solId, revisor, dirNombre, observaciones);
                    }}
                  />
                </div>
              )}

              {/* SI ES REVISOR DE GESTIÓN (EQ_GESTION): Panel de Revisión Técnica y Dictamen */}
              {currentUser.role === "EQ_GESTION" && (
                <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-5 text-primary" />
                      <div>
                        <h3 className="font-heading font-bold text-sm text-foreground">
                          Revisión Técnica Asignada
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                          Responsable: <strong className="text-foreground">{currentUser.name}</strong>
                        </p>
                      </div>
                    </div>
                    {renderEstadoBadge(solicitud.estado, solicitud.revisionIniciada)}
                  </div>

                  <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Institución requirente:</span>
                      <strong className="text-foreground truncate max-w-[180px]">{solicitud.institucion}</strong>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Fecha de registro:</span>
                      <strong className="text-foreground">{solicitud.fechaSolicitud}</strong>
                    </div>
                    {solicitud.revisor && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground">Revisor asignado:</span>
                        <strong className="text-foreground">{solicitud.revisor}</strong>
                      </div>
                    )}
                  </div>

                  {/* Acciones de dictamen para Revisor de Gestión */}
                  {(solicitud.estado === "EN_REVISION_GESTION" ||
                    solicitud.estado === "PENDIENTE_ASIGNACION_GESTION" ||
                    solicitud.estado === "Pendiente") && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Dictamen y Validación
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Verifica la documentación del trámite y emite el dictamen de aprobación o rechazo correspondiente.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRejectOpen(true)}
                            className="flex-1 text-xs font-semibold text-danger border-danger/30 hover:bg-danger/10 gap-1.5"
                          >
                            <XCircle className="size-3.5" />
                            <span>Rechazar</span>
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => setIsApproveOpen(true)}
                            className="flex-1 text-xs font-semibold gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="size-3.5" />
                            <span>Aprobar</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Si el trámite culminó en INSTITUCIÓN ACTIVA, mostrar resumen del cierre institucional para Revisor de Gestión */}
                  {solicitud.estado === "INSTITUCION_ACTIVA" && (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-success">
                          <CheckCircle2 className="size-4 shrink-0" />
                          <span>Institución Activa — Registro Concluido</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          La resolución fue suscrita por la Máxima Autoridad en FirmaEC y la institución está activa. Se han emitido 2 invitaciones independientes para los coordinadores (Anexo B).
                        </p>
                        <div className="pt-1.5 border-t border-success/20 space-y-1 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">N° Resolución:</span>
                            <span className="font-mono font-bold text-foreground">{solicitud.resolucion || "RES-DINARP-2026-0042"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Invitaciones B:</span>
                            <span className="text-primary font-medium">2 invitaciones (Titular y Suplente)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SI ES PERSONAL DE NORMATIVIDAD (EQ_NORMATIVA) O DIRECTOR DE NORMATIVIDAD: Panel de Resolución Institucional e INS-07 */}
              {(currentUser.role === "EQ_NORMATIVA" || (currentUser.role === "DIR_NORMATIVA" && (solicitud.estado === "INSTITUCION_ACTIVA" || solicitud.estado === "PENDIENTE_DE_FIRMA" || solicitud.estado === "RESOLUCION_GENERADA"))) && (
                <ResolucionInstitucionalPanel
                  solicitud={solicitud}
                  currentUserName={currentUser.name}
                  onIniciarGeneracion={(solId) => {
                    store.iniciarRevision(solId, currentUser.name);
                  }}
                  onFalloGeneracion={(solId, causa) => {
                    store.fallarGeneracionResolucion(solId, causa, currentUser.name);
                  }}
                  onReintentarGeneracion={(solId) => {
                    store.reintentarGeneracionResolucion(solId, currentUser.name);
                  }}
                  onCompletarFirmaResolucion={(solId, exitosa, firmante, motivoFallo) => {
                    store.completarFirmaResolucion(solId, exitosa, firmante, motivoFallo);
                  }}
                  onPreviewDocumento={(titulo, archivo) => {
                    setPreviewDoc({ titulo, archivo });
                  }}
                  onRechazarSolicitud={(solId, motivo) => {
                    store.rechazarSolicitud(solId, motivo, currentUser.name);
                    toast.success("Solicitud rechazada correctamente", {
                      description: "No se generó la resolución institucional y se notificó el motivo a la entidad.",
                    });
                    router.push(basePath);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* DIÁLOGOS Y MODALES */}
        <AprobarSolicitudDialog
          solicitud={solicitud}
          open={isApproveOpen}
          onOpenChange={setIsApproveOpen}
          onConfirm={(sol, opcionCaso) => {
            if (isAnexoC) {
              aprobarCambioStandalone(sol.id, opcionCaso || "CASO_B");
              store.aprobarGestion(sol.id, currentUser.name, `Dictamen de aprobación de Anexo C (${opcionCaso || "CASO_B"}).`);
            } else {
              store.aprobarGestion(sol.id, currentUser.name);
            }
            toast.success("Solicitud aprobada correctamente.");
          }}
        />

        <RechazarSolicitudDialog
          solicitud={solicitud}
          open={isRejectOpen}
          onOpenChange={setIsRejectOpen}
          directConfirm={true}
          title={
            currentUser.role === "EQ_NORMATIVA"
              ? "Confirmar rechazo de la solicitud"
              : isAnexoC
              ? "Rechazar solicitud de cambio de coordinador"
              : "Rechazar solicitud de trámite"
          }
          description={
            currentUser.role === "EQ_NORMATIVA"
              ? "Si determinas que no procede emitir la resolución institucional, indica la justificación técnica o legal del rechazo."
              : isAnexoC
              ? "Indica detalladamente la causa legal o técnica por la cual se desestima el Anexo C presentado."
              : "Indica detalladamente la razón por la cual no se aprueba el trámite."
          }
          warningNotice={
            currentUser.role === "EQ_NORMATIVA"
              ? "Atención: Al confirmar el rechazo, se cancelará la generación de la resolución institucional y el trámite pasará a estado Rechazada."
              : isAnexoC
              ? "Atención: Al rechazar el trámite, el Coordinador actual mantendrá su vinculación y funciones institucionales activas."
              : "Atención: Esta acción cancelará definitivamente el trámite y enviará el motivo registrado a la institución requirente."
          }
          confirmLabel="Confirmar rechazo"
          onConfirm={(sol, motivo) => {
            if (isAnexoC) {
              rechazarCambioStandalone(sol.id, motivo);
            }
            store.rechazarSolicitud(sol.id, motivo, currentUser.name);
            toast.success("Solicitud rechazada correctamente", {
              description: "Se registró el motivo del rechazo y se notificó a la entidad.",
            });
            router.push(basePath);
          }}
        />

        <AsignarRevisorDialog
          solicitud={solicitud}
          open={isAssignOpen}
          onOpenChange={setIsAssignOpen}
          tipoArea={currentUser.role === "DIR_NORMATIVA" || (solicitud?.estado.includes("NORMATIVIDAD") ?? false) ? "NORMATIVIDAD" : "GESTION"}
          directorNombre={currentUser.name}
          allSolicitudes={solicitudes}
          onConfirmAsignacion={(solId, revisor) => {
            handleConfirmAsignacion(solId, revisor);
          }}
        />

        {/* PREVIEW DE DOCUMENTO */}
        {previewDoc && (
          <Dialog open={Boolean(previewDoc)} onOpenChange={() => setPreviewDoc(null)}>
            <DialogContent className="max-w-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-base font-bold font-heading text-foreground">
                  Vista Previa — {previewDoc.titulo}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Visor de documento digital habilitante registrado.
                </DialogDescription>
              </DialogHeader>

              <div className="p-8 bg-muted/30 border border-border rounded-xl text-center space-y-3 my-2">
                <FileText className="size-12 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-foreground">{previewDoc.titulo}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Formato PDF · Firma digital válida</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setPreviewDoc(null)}
                  className="h-10 px-4 text-xs font-semibold"
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* MODAL DE BORRADOR DE ANEXO A */}
        <BorradorAnexoAModal
          solicitud={solicitud}
          open={isBorradorOpen}
          onOpenChange={setIsBorradorOpen}
        />

        {showEnr03 && <Enr03SimulacionPanel />}
      </main>
    </WireframeDashboardLayout>
  );
}
