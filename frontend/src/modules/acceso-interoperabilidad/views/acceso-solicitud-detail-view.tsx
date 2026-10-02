"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  Download,
  Scale,
  Database,
  ListChecks,
  Send,
  RotateCcw,
  FileSignature,
  Building2,
  Calendar,
  User,
  Check,
  FileCheck2,
  Layers,
  History,
  Edit,
  ChevronDown,
  ChevronUp,
  Receipt,
  CreditCard,
  UploadCloud,
  X,
  Info,
  KeyRound,
  Copy,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { FileUpload as AdvancedFileUpload, type FileItemData } from "@/components/ui/file-input";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import { MOCK_USERS_BY_ROLE, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useSolicitudesStore, INITIAL_SOLICITUDES, SolicitudAcceso } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { CorregirSolicitudFlow } from "@/modules/acceso-interoperabilidad/components/corregir-solicitud-flow";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ edit?: string; step?: string }>;
}

const roleOptions = [
  { value: "COORDINADOR_SINARP", label: "Coordinador SINARP" },
  { value: "APROBADOR", label: "Aprobador" },
  { value: "FACTURACION", label: "Facturación" },
];

export function AccesoSolicitudDetailView({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : undefined;

  const [role, setRole] = useSimulatedRole("COORDINADOR_SINARP");
  const {
    solicitudes,
    getSolicitudById,
    aprobarSolicitud,
    rechazarSolicitud,
    reenviarSolicitud,
    simularPagoRealizado,
    validarPagoConCur
  } = useSolicitudesStore();

  // Control de modo corrección para Coordinador
  const [modoCorreccion, setModoCorreccion] = useState<boolean>(() => {
    if (resolvedSearchParams?.edit === "true") return true;
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("edit") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (resolvedSearchParams?.edit === "true") {
      setModoCorreccion(true);
    }
  }, [resolvedSearchParams?.edit]);

  // Obtener la solicitud activa del store
  const solicitud: SolicitudAcceso =
    solicitudes.find((s) => s.id === resolvedParams.id) ||
    getSolicitudById(resolvedParams.id) ||
    INITIAL_SOLICITUDES[0];

  // Detección automática del paso al que debe dirigirse la corrección
  const obsCorrection = `${solicitud?.motivoRechazo || ""} ${solicitud?.observaciones || ""}`.toLowerCase();
  const targetCorrectionStep = (
    obsCorrection.includes("eliminar campo") ||
    obsCorrection.includes("quitar campo") ||
    obsCorrection.includes("cambiar fuente") ||
    obsCorrection.includes("campo no autorizado") ||
    obsCorrection.includes("seleccionar otro")
  )
    ? 1
    : (solicitud?.fuentes && solicitud.fuentes.length > 0 ? 2 : 1);

  const [correctionStep, setCorrectionStep] = useState<number>(() => {
    if (resolvedSearchParams?.step) {
      const s = parseInt(resolvedSearchParams.step, 10);
      if (s >= 1 && s <= 3) return s;
    }
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const s = sp.get("step");
      if (s && ["1", "2", "3"].includes(s)) return parseInt(s, 10);
    }
    return 2;
  });

  useEffect(() => {
    if (resolvedSearchParams?.step) {
      const s = parseInt(resolvedSearchParams.step, 10);
      if (s >= 1 && s <= 3) setCorrectionStep(s);
    }
  }, [resolvedSearchParams?.step]);

  // Tabs de detalle
  const [activeTab, setActiveTab] = useState<string>("resumen");
  const [expandedJustificaciones, setExpandedJustificaciones] = useState<Record<string, boolean>>({});

  // Archivos de subida de informe para aprobación
  const informeExistenteNombre = solicitud?.informeJustificacion?.nombre;
  const [uploadedFiles, setUploadedFiles] = useState<FileItemData[]>(() => {
    if (solicitud?.informeJustificacion?.nombre) {
      return [
        {
          id: "informe-existente",
          file: new File([""], solicitud.informeJustificacion.nombre),
          status: "success",
          errorType: null,
          progress: 100,
        }
      ];
    }
    return [];
  });

  // Modales Aprobador
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [isConfirmarAprobacionModalOpen, setIsConfirmarAprobacionModalOpen] = useState(false);
  const [isRechazarModalOpen, setIsRechazarModalOpen] = useState(false);
  const [motivoRechazoTexto, setMotivoRechazoTexto] = useState("");
  const [motivoRechazoError, setMotivoRechazoError] = useState(false);

  // Modales Facturación
  const [modalFactura, setModalFactura] = useState(false);
  const [modalCur, setModalCur] = useState(false);
  const [modalValidarPago, setModalValidarPago] = useState(false);
  const [modalConfirmarValidacion, setModalConfirmarValidacion] = useState(false);
  const [curFile, setCurFile] = useState<File | null>(null);
  const [curFileError, setCurFileError] = useState(false);
  const [numeroCurInput, setNumeroCurInput] = useState("");

  // Modal Credenciales
  const [isModalCredencialesOpen, setIsModalCredencialesOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Mensaje de feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ tipo: "success" | "warning"; texto: string } | null>(null);

  // Cargar informe existente si la solicitud ya está aprobada
  useEffect(() => {
    if (informeExistenteNombre) {
      setUploadedFiles(prev => {
        if (prev.length === 1 && prev[0].id === "informe-existente" && prev[0].file.name === informeExistenteNombre) {
          return prev;
        }
        return [
          {
            id: "informe-existente",
            file: new File([""], informeExistenteNombre),
            status: "success",
            errorType: null,
            progress: 100,
          }
        ];
      });
    }
  }, [informeExistenteNombre]);

  const handleSelectInforme = (files: File[]) => {
    const newItems: FileItemData[] = files.map((f, idx) => ({
      id: `file-inf-${Date.now()}-${idx}`,
      file: f,
      status: "uploading",
      errorType: null,
      progress: 40,
    }));
    setUploadedFiles(newItems);

    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((item) => ({
          ...item,
          status: "success",
          progress: 100,
        }))
      );
    }, 500);
  };

  const handleRemoveInforme = (id: string) => {
    setUploadedFiles((prev) => prev.filter((i) => i.id !== id));
  };

  // Abrir confirmación de aprobación
  const handleProcederConfirmarAprobacion = () => {
    setIsAprobarModalOpen(false);
    setIsConfirmarAprobacionModalOpen(true);
  };

  // Ejecución final de aprobación
  const handleFirmarYEnviarFinal = () => {
    const fileName = uploadedFiles[0]?.file?.name || "Informe_Tecnico_Justificacion_Aprobado.pdf";
    aprobarSolicitud(solicitud.id, fileName);
    setIsConfirmarAprobacionModalOpen(false);
    const esPrivada = solicitud.tipoInstitucion === "Privada";

    setFeedbackMessage({
      tipo: "success",
      texto: esPrivada
        ? "Solicitud aprobada formalmente. Por ser institución privada pasa a estado 'Pago pendiente' e interviene Facturación."
        : "Solicitud aprobada y firmada digitalmente con éxito. Continuará mediante Convenio interinstitucional."
    });
    toast.success("Solicitud aprobada exitosamente");
    setTimeout(() => setFeedbackMessage(null), 6000);
  };

  // Rechazar solicitud (Aprobador)
  const handleConfirmarRechazo = () => {
    if (!motivoRechazoTexto.trim()) {
      setMotivoRechazoError(true);
      return;
    }
    rechazarSolicitud(solicitud.id, motivoRechazoTexto);
    setIsRechazarModalOpen(false);
    setMotivoRechazoTexto("");
    setMotivoRechazoError(false);
    setFeedbackMessage({
      tipo: "warning",
      texto: "La solicitud fue rechazada y devuelta al Coordinador SINARP para su corrección."
    });
    toast.warning("Solicitud rechazada con observaciones");
    setTimeout(() => setFeedbackMessage(null), 6000);
  };

  // Facturación: Validar Pago
  const handleOpenValidarPago = () => {
    setNumeroCurInput(`CUR-${Math.floor(Math.random() * 80000 + 10000)}`);
    setCurFile(null);
    setCurFileError(false);
    setModalValidarPago(true);
  };

  const handleProcederConfirmarPago = () => {
    if (!curFile) {
      setCurFileError(true);
      return;
    }
    setModalValidarPago(false);
    setModalConfirmarValidacion(true);
  };

  const handleConfirmarValidacionPagoFinal = () => {
    if (curFile) {
      validarPagoConCur(solicitud.id, {
        numeroCur: numeroCurInput || "CUR-009412",
        nombreArchivo: curFile.name,
        tamano: `${(curFile.size / (1024 * 1024)).toFixed(1)} MB`,
        usuarioResponsable: "Lcda. Patricia Morales (Facturación)"
      });
      setModalConfirmarValidacion(false);
      setCurFile(null);
      setFeedbackMessage({
        tipo: "success",
        texto: "Pago verificado en SIGEF y CUR anexado correctamente. Solicitud en estado 'Pago validado'."
      });
      toast.success("Pago validado y CUR anexado correctamente");
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  // Lista de campos
  const todosLosCampos = solicitud.fuentes?.flatMap((f) =>
    (f.campos || []).map((c) => ({ ...c, fuenteNombre: f.nombre, fuenteInstitucion: f.institucion }))
  ) || [];

  const getBreadcrumbTitle = () => {
    if (role === "FACTURACION") return "Gestión de solicitudes pendientes de pago";
    if (role === "APROBADOR") return "Gestión de solicitudes pendientes";
    return "Gestión de solicitudes";
  };

  const estadoStr = String(solicitud.estado);
  const isAprobadorPending =
    role === "APROBADOR" &&
    (estadoStr === "Por revisar" ||
      estadoStr === "En revisión" ||
      estadoStr === "Pendiente de aprobación" ||
      estadoStr === "Reenviada" ||
      estadoStr === "Reenviada para aprobación");

  const isRechazada = solicitud.estado === "Rechazada" || solicitud.estado === "Con observaciones";

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad"
      currentUser={MOCK_USERS_BY_ROLE[role]}
      currentRole={role}
      onRoleChange={(r) => setRole(r)}
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: getBreadcrumbTitle(), href: "/acceso-interoperabilidad/solicitudes" },
        {
          label: solicitud.id,
          ...(modoCorreccion && isRechazada ? { href: `/acceso-interoperabilidad/solicitudes/${solicitud.id}` } : {})
        },
        ...(modoCorreccion && isRechazada ? [{ label: "Corregir solicitud" }] : [])
      ]}
      headerSlot={
        <div className="flex items-center gap-2">
          <Combobox
            items={roleOptions}
            value={roleOptions.find((opt) => opt.value === role) || roleOptions[0]}
            onValueChange={(val) => {
              if (val) setRole(val.value as UserRole);
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-xs min-w-[185px]" />
            <ComboboxContent align="start" className="min-w-[200px]">
              <ComboboxList>
                {roleOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      }
    >
      {modoCorreccion && role === "COORDINADOR_SINARP" && isRechazada ? (
        <CorregirSolicitudFlow
          solicitud={solicitud}
          initialStep={correctionStep}
          onCancel={() => setModoCorreccion(false)}
          onReenviar={(comentario: string, nuevasFuentes: any) => {
            reenviarSolicitud(solicitud.id, comentario, nuevasFuentes);
            setModoCorreccion(false);
            setFeedbackMessage({
              tipo: "success",
              texto: "Solicitud subsanada y reenviada exitosamente. Vuelve a estar en la bandeja del Director de Gestión."
            });
            toast.success("Solicitud corregida y reenviada para aprobación");
          }}
        />
      ) : (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Barra superior de navegación */}
          <div className="flex items-center justify-between">
            <Link
              href="/acceso-interoperabilidad/solicitudes"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="size-4" />
              Volver a la bandeja de solicitudes
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rol activo:</span>
              <Badge tone="neutral" appearance="outline" className="font-semibold text-xs">
                {role === "COORDINADOR_SINARP" ? "Coordinador SINARP" : role === "APROBADOR" ? "Aprobador" : "Facturación"}
              </Badge>
            </div>
          </div>

          {/* Mensaje de feedback si ocurrió una acción */}
          {feedbackMessage && (
            <div
              className={cn(
                "p-4 rounded-xl border flex items-center gap-3 animate-in fade-in-50 duration-200",
                feedbackMessage.tipo === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              )}
            >
              {feedbackMessage.tipo === "success" ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <AlertTriangle className="size-5 shrink-0" />
              )}
              <p className="text-sm font-medium">{feedbackMessage.texto}</p>
            </div>
          )}

          {/* Banner de Observaciones Rechazada (para Coordinador SINARP) */}
          {isRechazada && (
            <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">Solicitud rechazada con observaciones</p>
                    <Badge tone="warning" appearance="soft" className="text-[11px] font-semibold">
                      {targetCorrectionStep === 1 ? "Corregir en Paso 1 (Campos)" : "Corregir en Paso 2 (Justificación)"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <strong className="text-foreground">Motivo del rechazo: </strong>
                    {solicitud.motivoRechazo || solicitud.observaciones || "Se requiere corregir inconsistencias en la justificación jurídica."}
                  </p>
                </div>
              </div>
              {role === "COORDINADOR_SINARP" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setCorrectionStep(targetCorrectionStep);
                    setModoCorreccion(true);
                  }}
                  className="shrink-0 gap-1.5 shadow-sm"
                >
                  <Edit className="size-3.5" />
                  Corregir solicitud
                </Button>
              )}
            </div>
          )}

          {/* Banner de Solicitud Reenviada tras Subsanación */}
          {(estadoStr === "Reenviada" || estadoStr === "Reenviada para aprobación") && (
            <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-500/10 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-foreground">Solicitud subsanada y reenviada</p>
                  <Badge tone="info" appearance="soft" className="text-[11px] font-semibold">
                    Por revisar por el Aprobador
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Las subsanaciones y justificaciones corregidas fueron remitidas al Aprobador para emisión de dictamen.
                  {solicitud.observaciones && (
                    <span className="block mt-1 font-medium text-foreground">
                      Nota de subsanación: {solicitud.observaciones}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Banner SIGEF para Rol Facturación cuando está en "Pendiente de validación de pago" */}
          {role === "FACTURACION" && (solicitud.estado === "Pendiente de validación de pago" || solicitud.estado === "Pago en validación") && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  Validación externa requerida en SIGEF
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Verifica en <strong className="text-foreground">SIGEF</strong> que el pago de esta solicitud haya sido registrado antes de continuar. (SIGEF es una plataforma externa de finanzas públicas donde se concilian las cuentas fiscales del Estado).
                </p>
              </div>
            </div>
          )}

          {/* Header Principal del Expediente */}
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {solicitud.id}
                </h1>
                <Badge
                  tone={
                    solicitud.estado === "Acceso generado"
                      ? "success"
                      : solicitud.estado === "Aprobada" || solicitud.estado === "Pago validado"
                      ? "success"
                      : isRechazada
                      ? "danger"
                      : solicitud.estado.includes("Pago") || solicitud.estado.includes("validación")
                      ? "warning"
                      : "info"
                  }
                  appearance="soft"
                  className={cn(
                    "px-3 py-1 text-xs font-semibold gap-1.5",
                    solicitud.estado === "Acceso generado" && "border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                  )}
                >
                  {solicitud.estado === "Acceso generado" && <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />}
                  <span>{solicitud.estado}</span>
                </Badge>
              </div>

              <div className={cn(
                "grid gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground",
                role === "COORDINADOR_SINARP"
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              )}>
                <p className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                  Institución: <strong className="text-foreground">{solicitud.institucion}</strong>
                </p>
                {role !== "COORDINADOR_SINARP" && (
                  <p className="flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground shrink-0" />
                    Solicitante: <strong className="text-foreground">{solicitud.coordinador}</strong>
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                  Fecha radicación: <span className="text-foreground">{solicitud.fecha.substring(0, 10)}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <History className="size-3.5 text-muted-foreground shrink-0" />
                  Última actualización: <span className="text-foreground">{solicitud.ultimaActualizacion.substring(0, 10)}</span>
                </p>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN SEGÚN ROL */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Rol Aprobador */}
              {isAprobadorPending && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMotivoRechazoTexto("");
                      setMotivoRechazoError(false);
                      setIsRechazarModalOpen(true);
                    }}
                    className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                  >
                    <AlertTriangle className="size-4" />
                    Rechazar solicitud
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsAprobarModalOpen(true)}
                    className="gap-2 font-semibold shadow-sm bg-primary text-primary-foreground"
                  >
                    <FileSignature className="size-4" />
                    Aprobar solicitud
                  </Button>
                </>
              )}

              {/* Rol Facturación */}
              {role === "FACTURACION" && (
                <>
                  {solicitud.estado === "Pago pendiente" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        simularPagoRealizado(solicitud.id);
                        toast.success("Pago registrado externamente. Solicitud pasó a Pendiente de validación de pago.");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Simular pago bancario (externo)
                    </Button>
                  )}

                  {(solicitud.estado === "Pendiente de validación de pago" || solicitud.estado === "Pago en validación") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModalFactura(true)}
                        className="gap-1.5"
                      >
                        <Receipt className="size-4 text-primary" />
                        Ver factura
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleOpenValidarPago}
                        className="gap-2 font-semibold shadow-sm bg-primary text-primary-foreground"
                      >
                        <CheckCircle2 className="size-4" />
                        Validar pago
                      </Button>
                    </>
                  )}

                  {(solicitud.estado === "Pago validado" || solicitud.estado === "Pago verificado") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModalFactura(true)}
                        className="gap-1.5"
                      >
                        <Receipt className="size-4" />
                        Factura
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModalCur(true)}
                        className="gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <FileCheck2 className="size-4" />
                        Ver CUR
                      </Button>
                    </>
                  )}
                </>
              )}

              {/* Rol Coordinador: si es privada con factura o corregir solicitud cuando está rechazada */}
              {role === "COORDINADOR_SINARP" && (
                <>
                  {solicitud.tipoInstitucion === "Privada" && solicitud.factura && solicitud.estado !== "Pago pendiente" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModalFactura(true)}
                      className="gap-1.5 border-border"
                    >
                      <Receipt className="size-4 text-primary" />
                      Ver factura
                    </Button>
                  )}
                  {isRechazada && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setCorrectionStep(targetCorrectionStep);
                        setModoCorreccion(true);
                      }}
                      className="gap-2 font-semibold shadow-sm bg-primary text-primary-foreground"
                    >
                      <Edit className="size-4" />
                      Corregir solicitud
                    </Button>
                  )}
                </>
              )}

              {/* Acción para Acceso generado (disponible para todos los roles) */}
              {solicitud.estado === "Acceso generado" && (
                <Button
                  size="sm"
                  onClick={() => setIsModalCredencialesOpen(true)}
                  className="gap-2 font-semibold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <KeyRound className="size-4" />
                  Ver credenciales
                </Button>
              )}
            </div>
          </div>

          {/* â”€â”€â”€ VISTA UNIFICADA POR TABS â”€â”€â”€ */}
          <div className="space-y-6">
            <div className="flex gap-2 sm:gap-4 border-b border-border" id="tabs-container">
              <button
                onClick={() => setActiveTab("resumen")}
                className={cn(
                  "pb-2.5 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors",
                  activeTab === "resumen"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="size-4" />
                Resumen de la solicitud
              </button>
              <button
                onClick={() => setActiveTab("seguimiento")}
                className={cn(
                  "pb-2.5 px-1 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors",
                  activeTab === "seguimiento"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <History className="size-4" />
                Historial y trazabilidad
                <Badge tone="neutral" appearance="soft" className="text-[10px] h-5 px-1.5 font-bold">
                  {solicitud.historial?.length || 0}
                </Badge>
              </button>
            </div>

            {/* CONTENIDO DE TABS */}
            <div className="mt-2" id="tab-content">
              {/* TAB RESUMEN DE LA SOLICITUD (3 PASOS COMO EN CREACIÓN) */}
              {activeTab === "resumen" && (
                <div className="space-y-6">
                  {/* COMPONENTE FINANCIERO (Si es privada o rol Facturación) */}
                  {(solicitud.tipoInstitucion === "Privada" || role === "FACTURACION") && (
                    <Card className="p-6 bg-card border-primary/20 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <CreditCard className="size-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">Componente Financiero y Liquidación</h3>
                            <p className="text-xs text-muted-foreground">
                              Control de tarifas, contrato de prestación y comprobante oficial SIGEF.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {solicitud.factura && solicitud.estado !== "Pago pendiente" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalFactura(true)}
                              className="h-8 text-xs gap-1.5"
                            >
                              <Receipt className="size-3.5 text-primary" />
                              Ver factura
                            </Button>
                          )}
                          {solicitud.cur && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalCur(true)}
                              className="h-8 text-xs gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                            >
                              <FileCheck2 className="size-3.5" />
                              Ver CUR
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 rounded-lg border border-border bg-muted/20">
                          <span className="text-muted-foreground block text-[11px]">Tipo de Contrato:</span>
                          <span className="font-bold text-foreground">{solicitud.instrumento || "Contrato"}</span>
                          <span className="text-[10px] text-muted-foreground block font-mono">{solicitud.contrato || "CONTR-2026-0019"}</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-muted/20">
                          <span className="text-muted-foreground block text-[11px]">Facturación:</span>
                          <span className="font-bold text-foreground font-mono">
                            {solicitud.estado === "Pago pendiente" ? "Sistema externo (SIGEF)" : (solicitud.factura?.numero || "FAC-0028")}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {solicitud.estado === "Pago pendiente" ? "Emisión y pago externo" : (solicitud.factura?.fechaEmision || solicitud.fecha.substring(0, 10))}
                          </span>
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-muted/20">
                          <span className="text-muted-foreground block text-[11px]">Valor Liquidado:</span>
                          <span className="font-bold text-primary text-sm">{solicitud.factura?.valor || "$ 150.00"}</span>
                          <span className="text-[10px] text-muted-foreground block">Tarifa aprobada</span>
                        </div>
                        <div className="p-3 rounded-lg border border-border bg-muted/20">
                          <span className="text-muted-foreground block text-[11px]">Estado del Pago:</span>
                          <Badge
                            tone={solicitud.cur ? "success" : "warning"}
                            appearance="soft"
                            size="sm"
                            className="mt-0.5"
                          >
                            {solicitud.cur ? "Validado con CUR" : solicitud.estado}
                          </Badge>
                        </div>
                      </div>

                      {solicitud.cur && (
                        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileCheck2 className="size-4 text-emerald-600" />
                            <div>
                              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                                Comprobante Único de Registro ({solicitud.cur.numeroCur})
                              </span>
                              <p className="text-[11px] text-muted-foreground">
                                Verificado en SIGEF y anexado por {solicitud.cur.usuarioResponsable} el {solicitud.cur.fechaRegistro}.
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setModalCur(true)}
                            className="text-xs text-primary font-semibold"
                          >
                            Consultar comprobante
                          </Button>
                        </div>
                      )}
                    </Card>
                  )}

                  {/* Encabezado del Resumen */}
                  <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      Resumen de la solicitud
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Revisión de toda la información y justificaciones ingresadas en los pasos anteriores.
                    </p>
                  </div>

                  {/* PASO 1: Campos seleccionados */}
                  <Card className="p-6 bg-card border-border shadow-xs space-y-4 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                          1
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            Paso 1: Campos seleccionados
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Institución: <strong className="text-foreground font-semibold">{solicitud.fuentes?.[0]?.nombre || solicitud.fuentePrincipal || "Registro Civil de Ciudadanos"}</strong>
                            {solicitud.servicioPrincipal && (
                              <span className="text-muted-foreground font-normal"> · Fuente: <strong className="text-foreground font-semibold">{solicitud.servicioPrincipal}</strong></span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                          {todosLosCampos.length} campo(s)
                        </Badge>
                        {role === "COORDINADOR_SINARP" && isRechazada && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCorrectionStep(1);
                              setModoCorreccion(true);
                            }}
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="size-3" />
                            Editar campos
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Campos seleccionados */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <ListChecks className="size-3.5 text-muted-foreground" />
                        Campos seleccionados de la fuente:
                      </label>
                      <div className={cn(
                        "grid gap-3 w-full",
                        todosLosCampos.length === 1
                          ? "grid-cols-1"
                          : todosLosCampos.length === 2
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                      )}>
                        {todosLosCampos.map((item) => (
                          <div
                            key={`p1-res-${item.id || item.nombre}`}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20 gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-mono font-bold text-xs text-foreground truncate">
                                {item.nombre}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {item.descripcion}
                              </p>
                            </div>
                            <Badge
                              tone="neutral"
                              appearance="outline"
                              className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider shrink-0",
                                item.clasificacion === "Confidencial"
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  : "border-border bg-muted/60 text-muted-foreground"
                              )}
                            >
                              {item.clasificacion === "Confidencial" ? (
                                <Lock className="size-2.5 mr-1 inline" />
                              ) : (
                                <Check className="size-2.5 mr-1 inline" />
                              )}
                              {item.clasificacion}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* PASO 2: Justificaciones declaradas */}
                  <Card className="p-6 bg-card border-border shadow-xs space-y-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                          2
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            Paso 2: Finalidad de uso y justificación jurídica declaradas
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Finalidad de uso (campos accesibles) y justificación jurídica (campos confidenciales)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                          {todosLosCampos.length} justificado(s)
                        </Badge>
                        {role === "COORDINADOR_SINARP" && isRechazada && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setCorrectionStep(2);
                              setModoCorreccion(true);
                            }}
                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="size-3" />
                            Editar justificaciones
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {todosLosCampos.map((item) => (
                        <div
                          key={`p2-res-${item.id || item.nombre}`}
                          className="p-4 sm:p-5 border border-border/80 bg-muted/10 space-y-3.5 rounded-xl w-full"
                        >
                          <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono font-bold text-sm text-foreground">
                                {item.nombre}
                              </span>
                              <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                                — {item.descripcion}
                              </span>
                            </div>
                            <Badge
                              tone="neutral"
                              appearance="outline"
                              className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider shrink-0",
                                item.clasificacion === "Confidencial"
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                  : "border-border bg-muted/60 text-muted-foreground"
                              )}
                            >
                              {item.clasificacion === "Confidencial" ? (
                                <Lock className="size-2.5 mr-1 inline" />
                              ) : (
                                <Check className="size-2.5 mr-1 inline" />
                              )}
                              {item.clasificacion}
                            </Badge>
                          </div>

                          <div className={cn(
                            "w-full",
                            item.clasificacion === "Confidencial"
                              ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                              : "flex flex-col"
                          )}>
                            <div className="space-y-1.5 w-full">
                              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <FileText className="size-3.5 text-primary" />
                                Finalidad de uso declarada
                              </label>
                              <Textarea
                                disabled
                                className="w-full rounded-xl min-h-[75px] text-xs sm:text-sm bg-background border-border/80 opacity-90 cursor-not-allowed"
                                value={item.finalidad || "Finalidad de verificación institucional y consulta de elegibilidad."}
                              />
                            </div>

                            {item.clasificacion === "Confidencial" && (
                              <div className="space-y-1.5 w-full">
                                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                  <Scale className="size-3.5 text-amber-600 dark:text-amber-400" />
                                  Justificación jurídica requerida
                                </label>
                                <Textarea
                                  disabled
                                  className="w-full rounded-xl min-h-[75px] text-xs sm:text-sm bg-background border-amber-500/30 opacity-90 cursor-not-allowed"
                                  value={item.fundamento || "Art. 89 del Código Orgánico de la Economía Social de los Conocimientos y Ley Orgánica de Protección de Datos Personales."}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* PASO 3: Documentos soporte y resoluciones */}
                  <Card className="p-6 bg-card border-border shadow-xs space-y-4 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                          3
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            Paso 3: Documentos soporte y formalización
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Expediente documental, dictámenes técnicos y resoluciones de aprobación
                          </p>
                        </div>
                      </div>
                      <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                        {(solicitud.documentos?.length || 0) + (solicitud.informeJustificacion ? 1 : 0) + (solicitud.cur ? 1 : 0)} documento(s)
                      </Badge>
                    </div>

                    {/* Si está aprobada o tiene informe / CUR / documentos */}
                    {solicitud.informeJustificacion || (solicitud.documentos && solicitud.documentos.length > 0) || solicitud.cur ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {solicitud.informeJustificacion && (
                          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                                <FileSignature className="size-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">{solicitud.informeJustificacion.nombre}</p>
                                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                                  Informe de Justificación Aprobado · {solicitud.informeJustificacion.tamano}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  Firmado por {solicitud.informeJustificacion.firmadoPor}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Descargando ${solicitud.informeJustificacion?.nombre}...`)}
                              className="text-xs gap-1 text-emerald-700 dark:text-emerald-300"
                            >
                              <Download className="size-3.5" />
                              Descargar
                            </Button>
                          </div>
                        )}

                        {solicitud.cur && (
                          <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                <FileCheck2 className="size-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">{solicitud.cur.nombreArchivo}</p>
                                <p className="text-[11px] text-primary font-semibold">
                                  Comprobante Único de Registro ({solicitud.cur.numeroCur}) · {solicitud.cur.tamano}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Descargando ${solicitud.cur?.nombreArchivo}...`)}
                              className="text-xs gap-1 text-primary"
                            >
                              <Download className="size-3.5" />
                              Descargar
                            </Button>
                          </div>
                        )}

                        {(solicitud.documentos || []).map((doc) => (
                          <div key={doc.id} className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="size-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-foreground">{doc.nombre}</p>
                                <p className="text-[11px] text-muted-foreground">{doc.categoria} · {doc.tamano}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toast.info(`Descargando ${doc.nombre}...`)}
                              className="text-xs gap-1"
                            >
                              <Download className="size-3.5" />
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
                        <Info className="size-4 text-primary shrink-0" />
                        <span>
                          Los documentos de soporte formal (informe técnico de viabilidad, dictamen legal y resolución de acceso) se incorporan a este expediente una vez aprobada la solicitud.
                        </span>
                      </div>
                    )}
                  </Card>

                  {/* Banner de acción de corrección si la solicitud está rechazada o con observaciones */}
                  {role === "COORDINADOR_SINARP" && isRechazada && (
                    <div className="p-4 sm:p-5 rounded-2xl border border-destructive/40 bg-destructive/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-foreground">Solicitud pendiente de corrección y subsanación</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {solicitud.motivoRechazo || solicitud.observaciones || "Ajuste los campos o justificaciones observadas y remita nuevamente la solicitud para aprobación."}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setCorrectionStep(targetCorrectionStep);
                          setModoCorreccion(true);
                        }}
                        className="gap-2 bg-primary text-primary-foreground font-semibold shrink-0 shadow-sm"
                      >
                        <Edit className="size-4" />
                        Corregir solicitud ahora
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB SEGUIMIENTO Y HISTORIAL (Punto 14 - Timeline compartido) */}
              {activeTab === "seguimiento" && (
                <Card className="p-6">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-4">
                    <History className="size-4 text-primary" />
                    Historial y Trazabilidad Compartida
                  </h3>
                  <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border pl-1 pt-1">
                    {solicitud.historial?.map((s, i) => (
                      <div key={i} className="flex gap-4 relative z-10 items-start">
                        <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex-shrink-0 flex items-center justify-center mt-0.5">
                          <div className="size-2 rounded-full bg-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5 w-full">
                          <div className="flex justify-between items-start flex-wrap gap-1">
                            <p className="text-sm font-bold text-foreground">{s.evento}</p>
                            <span className="text-xs font-mono text-muted-foreground">{s.fecha}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Responsable: <strong className="text-foreground">{s.actor}</strong>
                          </p>
                          {s.detalle && (
                            <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-lg mt-1 border border-border/60">
                              {s.detalle}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ MODAL 1: APROBAR SOLICITUD (ROL APROBADOR - CARGA DE INFORME) â”€â”€â”€ */}
      <Dialog open={isAprobarModalOpen} onOpenChange={setIsAprobarModalOpen}>
        <DialogContent size="4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileSignature className="size-5 text-primary" />
              Aprobar solicitud de interoperabilidad
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Adjunta el Informe Técnico de Justificación formal en formato PDF. Al aprobar, continuará el flujo correspondiente según el tipo de institución ({solicitud.tipoInstitucion}).
            </DialogDescription>
          </DialogHeader>

          <div className="w-full text-left space-y-4 my-2">
            <AdvancedFileUpload
              allowedFormats="PDF"
              maxSizeMB={20}
              maxFiles={1}
              items={uploadedFiles}
              onFileSelect={handleSelectInforme}
              onRemove={handleRemoveInforme}
            />
          </div>

          <DialogFooter className="w-full flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/60 justify-end">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setIsAprobarModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleProcederConfirmarAprobacion}
              className="bg-primary text-primary-foreground gap-1.5 shadow-sm font-semibold"
            >
              <ArrowRight className="size-4" />
              Continuar a confirmación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL 2: CONFIRMAR FIRMA Y APROBACIÓN (ROL APROBADOR) â”€â”€â”€ */}
      <Dialog open={isConfirmarAprobacionModalOpen} onOpenChange={setIsConfirmarAprobacionModalOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Firmar y aprobar solicitud
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Al firmar y enviar, la solicitud quedará aprobada y continuará con el proceso correspondiente según el tipo de institución.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 my-2 rounded-xl bg-muted/30 border border-border text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Solicitud:</span>
              <strong className="text-foreground">{solicitud.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground truncate max-w-[200px]">{solicitud.institucion}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipo de Entidad:</span>
              <Badge tone="neutral" appearance="soft" size="sm">{solicitud.tipoInstitucion}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Efecto:</span>
              <span className="font-semibold text-primary">
                {solicitud.tipoInstitucion === "Privada"
                  ? "Pasa a Pago pendiente (Facturación)"
                  : "Aprobación definitiva (Convenio)"}
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="neutral" size="sm" onClick={() => setIsConfirmarAprobacionModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleFirmarYEnviarFinal}
              className="bg-primary text-primary-foreground font-semibold gap-1.5 shadow-sm"
            >
              <Check className="size-4" />
              Firmar y enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL 3: RECHAZAR SOLICITUD (ROL APROBADOR) â”€â”€â”€ */}
      <Dialog open={isRechazarModalOpen} onOpenChange={setIsRechazarModalOpen}>
        <DialogContent variant="danger" size="lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Rechazar solicitud
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              La solicitud pasará al estado &quot;Rechazada&quot; y se devolverá a la bandeja del Coordinador SINARP para su corrección.
            </DialogDescription>
          </DialogHeader>

          <div className="w-full text-left space-y-2 my-2">
            <label className="text-xs font-semibold text-foreground">
              Motivo del rechazo <span className="text-destructive">*</span>
            </label>
            <textarea
              rows={4}
              value={motivoRechazoTexto}
              onChange={(e) => {
                setMotivoRechazoTexto(e.target.value);
                if (e.target.value.trim()) setMotivoRechazoError(false);
              }}
              placeholder="Describe los ajustes que debe realizar el Coordinador SINARP."
              className={cn(
                "w-full p-3 text-xs rounded-xl border bg-background focus:outline-none focus:ring-2 resize-none",
                motivoRechazoError
                  ? "border-destructive focus:ring-destructive/20"
                  : "border-border/80 focus:ring-primary/20"
              )}
            />
            {motivoRechazoError && (
              <p className="text-xs text-destructive font-medium">
                El motivo del rechazo es obligatorio para devolver la solicitud.
              </p>
            )}
          </div>

          <DialogFooter className="w-full flex flex-col sm:flex-row gap-2 pt-3 border-t border-border/60 justify-end">
            <Button
              variant="neutral"
              size="sm"
              onClick={() => setIsRechazarModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarRechazo}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-1.5 shadow-sm font-semibold"
            >
              <RotateCcw className="size-3.5" />
              Rechazar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL FACTURACIÓN: VER FACTURA â”€â”€â”€ */}
      <Dialog open={modalFactura} onOpenChange={setModalFactura}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              Factura Electrónica {solicitud.factura?.numero || "FAC-0028"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprobante de cobro oficial por acceso a fuentes de interoperabilidad.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/70">
              <div>
                <span className="text-muted-foreground block text-[11px]">Institución Privada:</span>
                <span className="font-bold text-foreground text-sm">{solicitud.institucion}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Contrato Asociado:</span>
                <span className="font-mono font-bold text-foreground text-sm">{solicitud.contrato || "CONTR-2026-0019"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Fecha de Emisión:</span>
                <span className="text-foreground">{solicitud.factura?.fechaEmision || solicitud.fecha.substring(0, 10)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Estado:</span>
                <Badge
                  tone={solicitud.cur ? "success" : "warning"}
                  appearance="soft"
                  size="sm"
                >
                  {solicitud.cur ? "Pagado y validado" : "Pago pendiente"}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-semibold text-foreground text-xs block mb-2">Desglose de fuentes tasadas:</span>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-muted/70 text-muted-foreground border-b border-border text-left">
                    <tr>
                      <th className="p-2.5">Concepto / Fuente</th>
                      <th className="p-2.5 text-right">Tarifa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(solicitud.factura?.detalleServicios || [
                      { servicio: solicitud.servicioPrincipal || "Consulta de Interoperabilidad", valor: solicitud.factura?.valor || "$ 150.00" }
                    ]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-foreground">{item.servicio}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-foreground">{item.valor}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-bold">
                      <td className="p-2.5 text-foreground">Total Liquidado</td>
                      <td className="p-2.5 text-right text-foreground font-mono text-sm">{solicitud.factura?.valor || "$ 150.00"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-between sm:justify-between w-full">
            <Link href="/acceso-interoperabilidad/solicitudes">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setModalFactura(false)}
              >
                <ArrowLeft className="size-3.5" />
                Volver a la bandeja de solicitudes
              </Button>
            </Link>
            <Button variant="neutral" size="sm" onClick={() => setModalFactura(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL FACTURACIÓN: VER CUR â”€â”€â”€ */}
      <Dialog open={modalCur} onOpenChange={setModalCur}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-emerald-600" />
              Comprobante Único de Registro — CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprobante financiero verificado en SIGEF y anexado formalmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-emerald-800 dark:text-emerald-300">Pago Verificado y Validado</p>
                <p className="text-muted-foreground text-[11px]">
                  El ingreso de fondos fue validado en SIGEF y el CUR ha sido incorporado formalmente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-muted/20">
              <div>
                <span className="text-muted-foreground block text-[11px]">N.º de CUR:</span>
                <span className="font-mono font-bold text-foreground text-sm">{solicitud.cur?.numeroCur || "CUR-008814"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Archivo anexo:</span>
                <span className="font-medium text-primary flex items-center gap-1">
                  <FileText className="size-3.5" />
                  {solicitud.cur?.nombreArchivo || "CUR_SIGEF_Comprobante.pdf"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Fecha y hora de registro:</span>
                <span className="text-foreground font-mono">{solicitud.cur?.fechaRegistro || "2026-09-19 14:15"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Responsable de validación:</span>
                <span className="text-foreground font-semibold">{solicitud.cur?.usuarioResponsable || "Lcda. Patricia Morales (Facturación)"}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button variant="neutral" size="sm" onClick={() => setModalCur(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL FACTURACIÓN: VALIDAR PAGO Y ANEXAR CUR â”€â”€â”€ */}
      <Dialog open={modalValidarPago} onOpenChange={setModalValidarPago}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Validar pago y anexar CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el Comprobante Único de Registro (CUR) descargado desde SIGEF tras verificar la acreditación de fondos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-xs">
            <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900 dark:text-amber-300">Validación externa requerida</p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Verifica en <strong className="text-foreground">SIGEF</strong> que el pago de esta solicitud haya sido registrado antes de continuar. (SIGEF es una plataforma externa de finanzas públicas).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
              <div>
                <span className="text-muted-foreground block text-[11px]">N.º de solicitud:</span>
                <span className="font-bold text-foreground">{solicitud.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Institución:</span>
                <span className="font-semibold text-foreground truncate block">{solicitud.institucion}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Factura asociada:</span>
                <span className="font-mono font-semibold text-foreground">{solicitud.factura?.numero || "FAC-0031"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Valor verificado:</span>
                <span className="font-bold text-primary text-sm">{solicitud.factura?.valor || "$ 280.00"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Estado actual:</span>
                <Badge tone="warning" appearance="soft" size="sm">Pendiente validación</Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Usuario responsable:</span>
                <span className="text-foreground font-semibold">Lcda. Patricia Morales</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Número de Comprobante Único de Registro (CUR) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={numeroCurInput}
                onChange={(e) => setNumeroCurInput(e.target.value)}
                placeholder="Ej: CUR-009412"
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Comprobante Único de Registro — CUR (PDF obligatorio) <span className="text-destructive">*</span></span>
                <span className="text-[10px] text-muted-foreground">Formato PDF hasta 10 MB</span>
              </label>

              {!curFile ? (
                <label
                  htmlFor="cur-file-input-detail"
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface hover:bg-muted/40",
                    curFileError ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <UploadCloud className="size-8 text-primary mb-2" />
                  <span className="text-xs font-semibold text-foreground">Haz clic para seleccionar el CUR emitido en SIGEF</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Archivo .pdf verificado con firma electrónica</span>
                  <input
                    id="cur-file-input-detail"
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
                      <p className="text-xs font-bold text-foreground">{curFile.name}</p>
                      <p className="text-[10px] text-muted-foreground">{(curFile.size / 1024).toFixed(1)} KB · PDF Listo para anexar</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurFile(null)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Cambiar archivo
                  </Button>
                </div>
              )}

              {curFileError && (
                <p className="text-xs text-destructive font-medium">
                  Debes adjuntar el archivo PDF del CUR para poder validar el pago.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="neutral" size="sm" onClick={() => setModalValidarPago(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleProcederConfirmarPago}
              className="bg-primary text-primary-foreground font-semibold gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="size-4" />
              Anexar CUR y validar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL FACTURACIÓN: CONFIRMAR VALIDACIÓN DE PAGO â”€â”€â”€ */}
      <Dialog open={modalConfirmarValidacion} onOpenChange={setModalConfirmarValidacion}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Confirmar validación de pago
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Confirma que el pago fue verificado en SIGEF y que el CUR adjunto corresponde a esta solicitud.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 my-2 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Solicitud:</span>
              <strong className="text-foreground">{solicitud.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground truncate max-w-[200px]">{solicitud.institucion}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CUR adjunto:</span>
              <strong className="text-foreground font-mono">{numeroCurInput || "CUR-009412"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <strong className="text-primary">{solicitud.factura?.valor || "$ 280.00"}</strong>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="neutral" size="sm" onClick={() => setModalConfirmarValidacion(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarValidacionPagoFinal}
              className="bg-primary text-primary-foreground font-semibold gap-1.5 shadow-sm"
            >
              <Check className="size-4" />
              Confirmar validación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL: CREDENCIALES â”€â”€â”€ */}
      <Dialog open={isModalCredencialesOpen} onOpenChange={setIsModalCredencialesOpen}>
        <DialogContent size="lg" className="max-w-2xl">
          {(() => {
            const creds = solicitud.credenciales || {
              usuario: `ws_${solicitud.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}_${solicitud.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              contrasena: `Dinarp$ec2026_${solicitud.id.replace(/[^0-9]/g, "")}*K9`,
              endpoint: `https://interoperabilidad.dinarp.gob.ec/api/v2/servicios/${solicitud.id.toLowerCase()}`,
              tipoAutenticacion: "OAuth 2.0 (Bearer Token)",
              ambiente: "Producción (Ambiente Seguro DINARP)",
              fechaGeneracion: solicitud.ultimaActualizacion || "2026-08-25",
              fechaExpiracion: "2027-08-25 23:59 (Activa)",
              camposAutorizados: solicitud.fuentes?.flatMap((f) => f.campos?.map((c) => c.nombre) || []) || ["cedulaCiudadania", "nombresCompletos"]
            };

            const camposDetalle = solicitud.fuentes?.flatMap((f) => f.campos || []) || [];

            const handleCopy = (text: string, label: string) => {
              navigator.clipboard.writeText(text);
              setCopiedField(label);
              toast.success(`${label} copiado al portapapeles`);
              setTimeout(() => setCopiedField(null), 2000);
            };

            const handleCopyAll = () => {
              const listadoCampos = camposDetalle.length > 0
                ? camposDetalle.map((c) => `  - ${c.nombre} (${c.clasificacion}): ${c.finalidad || c.descripcion || ""}`).join("\n")
                : (creds.camposAutorizados || []).map((c) => `  - ${c}`).join("\n");

              const fullText = [
                `=== CREDENCIALES DE ACCESO A INTEROPERABILIDAD ===`,
                `Solicitud: ${solicitud.id}`,
                `Institución: ${solicitud.institucion}`,
                `Servicio: ${solicitud.servicioPrincipal || solicitud.fuentePrincipal || "Consulta de Interoperabilidad"}`,
                `Ambiente: ${creds.ambiente || "Producción"}`,
                `Tipo de Autenticación: ${creds.tipoAutenticacion || "OAuth 2.0"}`,
                `Endpoint: ${creds.endpoint}`,
                `Usuario: ${creds.usuario}`,
                `Contraseña: ${creds.contrasena}`,
                `Vigencia: ${creds.fechaExpiracion || "1 año"}`,
                `\nCampos autorizados:\n${listadoCampos}`,
                `\nDINARP - Dirección Nacional de Registros Públicos`
              ].join("\n");

              navigator.clipboard.writeText(fullText);
              toast.success("Credenciales completas copiadas al portapapeles");
            };

            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between pr-6">
                    <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <KeyRound className="size-4" />
                      </div>
                      <span>Credenciales</span>
                    </DialogTitle>
                    <Badge tone="success" appearance="soft" size="sm" className="border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                      Acceso activo
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground mt-1">
                    Credenciales técnicas y catálogo de campos autorizados para el consumo del servicio de interoperabilidad.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-2 max-h-[70vh] overflow-y-auto pr-1">
                  {/* Resumen de servicio e institución */}
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Solicitud:</span>
                      <strong className="text-foreground font-mono">{solicitud.id}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Institución:</span>
                      <strong className="text-foreground truncate block">{solicitud.institucion}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Servicio de Interoperabilidad:</span>
                      <strong className="text-foreground truncate block">{solicitud.servicioPrincipal || solicitud.fuentePrincipal || "Consulta de Datos"}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Ambiente y Autenticación:</span>
                      <span className="text-foreground font-medium">{creds.tipoAutenticacion || "OAuth 2.0"} · {creds.ambiente?.split(" ")[0] || "Producción"}</span>
                    </div>
                  </div>

                  {/* Parámetros de conexión: Usuario y Contraseña */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Usuario</span>
                        <span className="text-[10px] text-muted-foreground">Identificador de cliente (Client ID / API User)</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          readOnly
                          value={creds.usuario}
                          className="w-full px-3 py-2 pr-10 text-xs font-mono rounded-lg border border-border bg-muted/20 text-foreground select-all focus:outline-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          type="button"
                          onClick={() => handleCopy(creds.usuario, "Usuario")}
                          className="absolute right-1 text-muted-foreground hover:text-foreground"
                          title="Copiar usuario"
                        >
                          {copiedField === "Usuario" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Contraseña</span>
                        <span className="text-[10px] text-muted-foreground">Secreto de autenticación (Client Secret / Token)</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          readOnly
                          value={creds.contrasena}
                          className="w-full px-3 py-2 pr-20 text-xs font-mono rounded-lg border border-border bg-muted/20 text-foreground select-all focus:outline-none"
                        />
                        <div className="absolute right-1 flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground"
                            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                          >
                            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                            onClick={() => handleCopy(creds.contrasena, "Contraseña")}
                            className="text-muted-foreground hover:text-foreground"
                            title="Copiar contraseña"
                          >
                            {copiedField === "Contraseña" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Endpoint</span>
                        <span className="text-[10px] text-muted-foreground">URL base para el consumo seguro</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          readOnly
                          value={creds.endpoint}
                          className="w-full px-3 py-2 pr-10 text-xs font-mono rounded-lg border border-border bg-muted/20 text-foreground select-all focus:outline-none"
                        />
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          type="button"
                          onClick={() => handleCopy(creds.endpoint, "Endpoint")}
                          className="absolute right-1 text-muted-foreground hover:text-foreground"
                          title="Copiar endpoint"
                        >
                          {copiedField === "Endpoint" ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Campos autorizados */}
                  <div className="space-y-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-foreground">Campos autorizados</label>
                        <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] px-1.5 py-0">
                          {camposDetalle.length || creds.camposAutorizados?.length || 0} campos
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Habilitados en la credencial</span>
                    </div>

                    <div className="rounded-xl border border-border/80 overflow-hidden divide-y divide-border/60 bg-surface">
                      {camposDetalle.length > 0 ? (
                        camposDetalle.map((campo) => (
                          <div key={campo.id || campo.nombre} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 transition-colors">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">{campo.nombre}</span>
                                <Badge
                                  tone={campo.clasificacion === "Confidencial" ? "warning" : "neutral"}
                                  appearance="outline"
                                  size="sm"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {campo.clasificacion}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{campo.finalidad || campo.descripcion}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(campo.nombre, `Campo ${campo.nombre}`)}
                              className="self-end sm:self-center text-[10px] text-muted-foreground hover:text-foreground gap-1 h-6 px-2"
                            >
                              <Copy className="size-3" />
                              <span>Copiar campo</span>
                            </Button>
                          </div>
                        ))
                      ) : (
                        (creds.camposAutorizados || []).map((nombreCampo) => (
                          <div key={nombreCampo} className="p-2.5 text-xs flex items-center justify-between hover:bg-muted/20">
                            <span className="font-mono font-semibold text-foreground bg-muted/60 px-1.5 py-0.5 rounded text-[11px]">{nombreCampo}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(nombreCampo, `Campo ${nombreCampo}`)}
                              className="text-[10px] text-muted-foreground hover:text-foreground gap-1 h-6 px-2"
                            >
                              <Copy className="size-3" />
                              <span>Copiar</span>
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Advertencia de confidencialidad */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                      <strong>Uso confidencial:</strong> Las credenciales son intransferibles y deben almacenarse de forma segura en los servidores de la institución solicitante. No deben incluirse en código fuente público ni exponerse en clientes frontend.
                    </p>
                  </div>
                </div>

                <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyAll}
                    className="w-full sm:w-auto text-xs font-semibold gap-1.5 border-border"
                  >
                    <Copy className="size-3.5" />
                    <span>Copiar credenciales</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setIsModalCredencialesOpen(false)}
                    className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold"
                  >
                    Cerrar
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
