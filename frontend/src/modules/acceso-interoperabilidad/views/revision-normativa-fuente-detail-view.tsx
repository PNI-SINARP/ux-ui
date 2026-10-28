"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Lock,
  Unlock,
  Clock,
  Building2,
  User,
  Layers,
  History,
  Check,
  Sparkles,
  UserCheck,
  Activity,
  Info,
  ShieldCheck,
  ShieldAlert,
  FolderKanban,
  Server,
  Mail,
  Scale,
  FileSignature,
  RefreshCw,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardTitle,
  CardDescription,
  CardBadge,
  CardDecorativeIcon,
} from "@/components/ui/card";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  useSolicitudesStore,
  type SolicitudAcceso,
  type SolicitudEstado,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { cn } from "@/lib/utils";

interface RevisionNormativaFuenteDetailViewProps {
  id?: string;
  solicitudId?: string;
}

export function RevisionNormativaFuenteDetailView({
  id,
  solicitudId,
}: RevisionNormativaFuenteDetailViewProps) {
  const router = useRouter();
  const targetId = id || solicitudId || "";

  const {
    solicitudes,
    aprobarNormativa,
    observarNormativa,
  } = useSolicitudesStore();

  const solicitud = useMemo(
    () =>
      solicitudes.find((s) => s.id.toLowerCase() === targetId.toLowerCase()) ||
      null,
    [solicitudes, targetId]
  );

  // Sub-pestaña activa del expediente (0: Institución y Fuente, 1: Campos y Finalidades, 2: Modalidad y Cupo, 3: Documentos)
  const [detailTab, setDetailTab] = useState<number>(1); // Default to Campos y Finalidades for DPI Reviewer

  // Modal Elaborar Dictamen Jurídico y Proceder a Firma
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [conclusionesInforme, setConclusionesInforme] = useState("");

  // Modal Observar Solicitud Jurídicamente (SOL-07 / PAR-13)
  const [isObservarModalOpen, setIsObservarModalOpen] = useState(false);
  const [textoObservacionJuridica, setTextoObservacionJuridica] = useState("");

  // Modal Simulación de FirmaEC (1.ª Firma Revisor DPI)
  const [firmaModalOpen, setFirmaModalOpen] = useState(false);
  const [firmaEstado, setFirmaEstado] =
    useState<"validando" | "firmado">("validando");
  const [isConsultandoFirma, setIsConsultandoFirma] = useState(false);
  const [firmaTimestamp, setFirmaTimestamp] = useState<string>("");
  const [firmaCertId, setFirmaCertId] = useState<string>("");

  // Modal Visor de Documento de Soporte
  const [selectedDocPreview, setSelectedDocPreview] = useState<{
    nombre: string;
    fechaCarga: string;
  } | null>(null);

  // Simulación en vivo de validación FirmaEC
  useEffect(() => {
    if (!firmaModalOpen || firmaEstado !== "validando" || !solicitud) return;

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
        solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)";

      aprobarNormativa(solicitud.id, {
        revisor: revisorNombre,
        director: "Dr. Roberto Méndez (Director DPI)",
        fundamento:
          conclusionesInforme.trim() ||
          "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
      });

      toast.success(
        "1.ª Firma electrónica validada con éxito en FirmaEC (SOL-08)",
        {
          description: `El dictamen de ${solicitud.id} fue suscrito por ${revisorNombre} y remitido al Director DPI para la refrenda.`,
        }
      );
    }, 2800);

    return () => clearTimeout(timer);
  }, [
    firmaModalOpen,
    firmaEstado,
    solicitud,
    conclusionesInforme,
    aprobarNormativa,
  ]);

  const handleIniciarFirmaRevisor = () => {
    setFirmaEstado("validando");
    setIsConsultandoFirma(false);
    setFirmaTimestamp("");
    setFirmaCertId(
      `FEC-REV-2026-${Math.floor(100000 + Math.random() * 900000)}`
    );
    setIsAprobarModalOpen(false);
    setFirmaModalOpen(true);
  };

  const handleConsultarEstadoFirmaManual = () => {
    if (isConsultandoFirma || firmaEstado === "firmado" || !solicitud) return;
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
        solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)";

      aprobarNormativa(solicitud.id, {
        revisor: revisorNombre,
        director: "Dr. Roberto Méndez (Director DPI)",
        fundamento:
          conclusionesInforme.trim() ||
          "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
      });

      toast.success(
        "1.ª Firma electrónica validada con éxito en FirmaEC (SOL-08)",
        {
          description: `El dictamen de ${solicitud.id} fue suscrito por ${revisorNombre} y remitido al Director DPI para la refrenda.`,
        }
      );
    }, 800);
  };

  const handleCerrarModalFirma = () => {
    setFirmaModalOpen(false);
    setConclusionesInforme("");
  };

  const handleConfirmarObservacionJuridica = () => {
    if (!solicitud || !textoObservacionJuridica.trim()) {
      toast.error("Debe ingresar la fundamentación jurídica de la observación.");
      return;
    }

    const revisorNombre =
      solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)";

    observarNormativa(solicitud.id, {
      revisor: revisorNombre,
      diasPlazo: 3,
      observaciones: [
        {
          id: `obs-dpi-${Date.now()}`,
          tipo: "justificacion",
          elementoNombre: "Campos confidenciales",
          descripcion: textoObservacionJuridica.trim(),
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
    setTextoObservacionJuridica("");
  };

  if (!solicitud) {
    return (
      <WireframeDashboardLayout
        activeMenu="revision-normativa-fuentes"
        currentRole="EQ_DPI"
        currentUser={{
          ...MOCK_USERS_BY_ROLE.EQ_DPI,
          name: "Carlos Mora (Revisor DPI)",
          roleTitle: "Especialista Jurídico de Protección de Datos (DPI)",
        }}
        breadcrumbs={[
          {
            label: "Solicitudes de acceso a fuentes",
            onClick: () => router.push("/revision-normativa/fuentes"),
          },
          { label: "Solicitud no encontrada" },
        ]}
      >
        <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 my-8 mx-4">
          <div className="size-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
            <Scale className="size-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-foreground">
            Solicitud no encontrada
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No se encontró ninguna solicitud de acceso con el código{" "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded">
              {targetId}
            </code>
            .
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/revision-normativa/fuentes")}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a la bandeja DPI</span>
          </Button>
        </div>
      </WireframeDashboardLayout>
    );
  }

  const campos = solicitud.fuentes.flatMap((fuente) =>
    (fuente.campos || []).map((c) => ({
      id: c.id,
      nombre: c.nombre || c.nombreCampo || "",
      descripcion: c.descripcion,
      clasificacion: c.clasificacion,
      esSensible: c.esSensible || c.etiquetaSensibilidad === "Sensible",
      finalidad: c.finalidad || c.finalidadUso || "",
      justificacionConfidencial:
        c.justificacionConfidencial ||
        c.fundamento ||
        "Base legal conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).",
      fuenteNombre: fuente.nombre,
    }))
  );

  const confidencialesCount = campos.filter(
    (c) => c.clasificacion === "Confidencial"
  ).length;
  const accesiblesCount = campos.length - confidencialesCount;
  const tieneConfidenciales = confidencialesCount > 0;

  const docs =
    solicitud.documentos && solicitud.documentos.length > 0
      ? solicitud.documentos
      : [
          {
            id: "DOC-1",
            nombre:
              solicitud.documentoSustentoNombre ||
              "Oficio_Solicitud_Firmado.pdf",
            tipo: "PDF",
            tamano: "1.4 MB",
            fechaCarga: solicitud.fecha,
            categoria: "Oficio de Solicitud",
          },
        ];

  const fuenteNombre =
    solicitud.fuentePrincipal ||
    solicitud.fuentes?.[0]?.nombre ||
    "Fuente de Interoperabilidad";
  const institucionProveedora =
    solicitud.fuentes?.[0]?.institucion ||
    "Dirección General de Registro Civil";
  const codigoPaquete =
    solicitud.proyectoCodigo || solicitud.fuentes?.[0]?.id || "PAQ-SINARP-01";
  const proyectoNombre =
    solicitud.proyectoNombre || "Proyecto de Interoperabilidad Institucional";
  const justificacionGeneral =
    solicitud.justificacionGeneral ||
    solicitud.proyectoObjetivo ||
    campos[0]?.finalidad ||
    "Intercambio seguro de información en el marco del Sistema Nacional de Registros Públicos (SINARP).";

  const tieneInforme = Boolean(solicitud.informeNormativa);
  const firmaRevisorOk = Boolean(solicitud.informeNormativa?.firmadoRevisor);
  const firmaDirectorOk = Boolean(solicitud.informeNormativa?.firmadoDirector);
  const enEvaluacionNormativa =
    solicitud.estado === "En revisión normativa" && !tieneInforme;

  const renderEstadoBadge = (estado: SolicitudEstado) => {
    if (estado === "En revisión normativa") {
      if (tieneInforme) {
        return (
          <Badge tone="info" appearance="soft" size="sm" dot>
            Informe en firma Director DPI
          </Badge>
        );
      }
      return (
        <Badge tone="warning" appearance="soft" size="sm" dot>
          En revisión DPI (Pendiente dictamen)
        </Badge>
      );
    }
    if (estado === "Aprobada por Normatividad") {
      return (
        <Badge tone="success" appearance="soft" size="sm" dot>
          Aprobada por DPI (Doble firma)
        </Badge>
      );
    }
    if (
      estado === "Observada" ||
      estado === "Requiere corrección" ||
      estado === "Con observaciones"
    ) {
      return (
        <Badge tone="warning" appearance="soft" size="sm" dot>
          Observada por DPI (PAR-13)
        </Badge>
      );
    }
    return (
      <Badge tone="neutral" appearance="soft" size="sm" dot>
        {estado}
      </Badge>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-normativa-fuentes"
      currentRole="EQ_DPI"
      currentUser={{
        ...MOCK_USERS_BY_ROLE.EQ_DPI,
        name:
          solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)",
        roleTitle: "Especialista Jurídico de Protección de Datos (DPI)",
      }}
      breadcrumbs={[
        {
          label: "Solicitudes de acceso a fuentes",
          onClick: () => router.push("/revision-normativa/fuentes"),
        },
        { label: `Expediente ${solicitud.id}` },
      ]}
    >
      <main className="w-full px-2.5 sm:px-4 md:px-6 pb-4 pt-1 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor blanco principal (Idéntico a revisión de gestión y anexos) */}
        <div className="bg-surface border border-border rounded-xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xs space-y-6 flex-1 min-h-0 overflow-y-auto">
          {/* Cabecera interna del trámite con botón Volver */}
          <div className="pb-4 border-b border-border/80 space-y-3">
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/revision-normativa/fuentes")}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted shrink-0"
                title="Volver a la bandeja de datos confidenciales"
              >
                <ArrowLeft className="size-3.5" />
                <span>Volver</span>
              </Button>
            </div>

            <div className="min-w-0 space-y-1">
              <div>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="font-semibold text-[11px]"
                >
                  Acceso a fuentes · Revisión de datos confidenciales (DPI)
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-foreground">
                  Trámite {solicitud.id}
                </h1>
                <Badge
                  tone={
                    solicitud.versionExpediente &&
                    solicitud.versionExpediente > 1
                      ? "info"
                      : "neutral"
                  }
                  appearance="soft"
                  size="sm"
                  className="font-mono text-xs"
                >
                  Versión v{solicitud.versionExpediente || 1}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 sm:line-clamp-1">
                {fuenteNombre} ({codigoPaquete}) · Registrado el {solicitud.fecha} ·{" "}
                {solicitud.institucion}
              </p>
            </div>
          </div>

          {/* DISTRIBUCIÓN EN 2 COLUMNAS: IZQUIERDA EXPEDIENTE/TRAZABILIDAD (7 cols), DERECHA PANEL DE DICTAMEN DPI (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA IZQUIERDA (7 cols): EXPEDIENTE ORGANIZADO POR SECCIONES Y TRAZABILIDAD */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6">
              <Tabs defaultValue="resumen" className="w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                  <div className="overflow-x-auto w-full sm:w-auto -mx-1 px-1">
                    <TabsList className="h-auto p-1 rounded-full bg-background border border-border/40 inline-flex gap-1 w-max sm:w-auto justify-start flex-nowrap">
                      <TabsTrigger
                        value="resumen"
                        className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                      >
                        <Scale className="size-3.5 sm:size-4 shrink-0" />
                        <span>Expediente de Acceso a Fuente</span>
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
                    <span>Paquete de datos:</span>
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      size="sm"
                      className="font-mono border border-border"
                    >
                      {codigoPaquete}
                    </Badge>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-5 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground transition-colors cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label="Información del Paquete de Interoperabilidad"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          variant="primary"
                          className="max-w-xs text-xs leading-relaxed"
                        >
                          Evaluación normativa y legal de la Dirección de Protección de la Información (DPI) sobre datos confidenciales solicitados.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* TAB 1: RESUMEN DEL EXPEDIENTE DE ACCESO */}
                <TabsContent
                  value="resumen"
                  className="space-y-6 animate-in fade-in duration-200"
                >
                  {/* Card Featured del Expediente */}
                  <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                        PAQUETE DE INTEROPERABILIDAD · {codigoPaquete}
                      </CardBadge>
                      <Badge
                        tone="warning"
                        appearance="soft"
                        size="sm"
                        className="gap-1 text-[10px]"
                      >
                        <Lock className="size-3" />
                        <span>
                          {confidencialesCount} campo(s) confidencial(es) en revisión DPI
                        </span>
                      </Badge>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                      {fuenteNombre}
                    </CardTitle>

                    <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                      Proveedor: {institucionProveedora} · Proyecto: {proyectoNombre}
                    </CardDescription>

                    <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                      <Scale className="size-32 text-primary" />
                    </CardDecorativeIcon>
                  </Card>

                  {/* Pestañas Cápsula para navegar las 4 secciones del expediente */}
                  <div className="overflow-x-auto py-1 -mx-1 px-1">
                    <Tabs
                      defaultValue="tab-1"
                      value={`tab-${detailTab}`}
                      onValueChange={(val) =>
                        setDetailTab(Number(val.replace("tab-", "")))
                      }
                      className="w-full"
                    >
                      <TabsList className="h-auto p-1 rounded-full bg-background border border-border/40 inline-flex gap-1 flex-nowrap w-max sm:w-auto justify-start">
                        <TabsTrigger
                          value="tab-0"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                        >
                          <Building2 className="size-3.5 shrink-0" />
                          <span>1. Institución y Fuente</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="tab-1"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                        >
                          <Layers className="size-3.5 shrink-0" />
                          <span>2. Campos y Finalidades LOPDP ({campos.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="tab-2"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                        >
                          <Server className="size-3.5 shrink-0" />
                          <span>3. Modalidad y Cupo</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="tab-3"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                        >
                          <FileText className="size-3.5 shrink-0" />
                          <span>4. Documentos ({docs.length})</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* SECCIÓN 0: INSTITUCIÓN SOLICITANTE, PROYECTO Y FUENTE */}
                  {detailTab === 0 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-lg">
                        <div>
                          <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                            <Building2 className="size-4 text-primary dark:text-primary-300 shrink-0" />
                            <span>
                              Sección I — Institución Solicitante, Proyecto y Fuente Requerida
                            </span>
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Identificación de la entidad consumidora, proyecto vinculado y justificación general de necesidad funcional.
                          </p>
                        </div>
                        <Badge
                          tone="primary"
                          appearance="solid"
                          size="sm"
                          className="font-bold shrink-0 !text-white shadow-xs"
                        >
                          {solicitud.tipoInstitucion.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            Institución Solicitante (Consumidora)
                          </Label>
                          <InputGroup
                            leftIcon={
                              <Building2 className="size-4 text-muted-foreground" />
                            }
                          >
                            <InputGroupInput
                              value={solicitud.institucion}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            Coordinador Institucional Solicitante
                          </Label>
                          <InputGroup
                            leftIcon={
                              <User className="size-4 text-muted-foreground" />
                            }
                          >
                            <InputGroupInput
                              value={solicitud.coordinador}
                              disabled
                              className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            Proyecto Institucional Vinculado
                          </Label>
                          <InputGroup
                            leftIcon={
                              <FolderKanban className="size-4 text-muted-foreground" />
                            }
                          >
                            <InputGroupInput
                              value={proyectoNombre}
                              disabled
                              className="bg-muted/30 cursor-not-allowed text-xs text-foreground font-medium"
                            />
                          </InputGroup>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            Institución Proveedora de la Fuente
                          </Label>
                          <InputGroup
                            leftIcon={
                              <Database className="size-4 text-muted-foreground" />
                            }
                          >
                            <InputGroupInput
                              value={institucionProveedora}
                              disabled
                              className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                            />
                          </InputGroup>
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <Label className="text-xs font-semibold text-foreground">
                            Justificación General y Finalidad Institucional del Trámite
                          </Label>
                          <Textarea
                            value={justificacionGeneral}
                            disabled
                            rows={3}
                            className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3.5 border-border/80"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border flex justify-end">
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(1)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: 2. Campos y Finalidades LOPDP →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 1: CAMPOS SOLICITADOS, FINALIDADES Y JUSTIFICACIÓN JURÍDICA LOPDP */}
                  {detailTab === 1 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-lg">
                        <div>
                          <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                            <Scale className="size-4 text-primary dark:text-primary-300 shrink-0" />
                            <span>
                              Sección II — Campos Confidenciales, Finalidades y Justificación LOPDP
                            </span>
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Auditoría de pertinencia jurídica, base legal habilitante y principios de proporcionalidad (SOL-07).
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge tone="success" appearance="soft" size="sm">
                            {accesiblesCount} Accesibles
                          </Badge>
                          <Badge
                            tone={confidencialesCount > 0 ? "warning" : "neutral"}
                            appearance="soft"
                            size="sm"
                          >
                            {confidencialesCount} Confidenciales
                          </Badge>
                        </div>
                      </div>

                      <Alert
                        variant="warning"
                        icon={<Lock className="size-4" />}
                        title="Evaluación de Datos Confidenciales asignada a la DPI (SOL-07)"
                        className="p-3.5 text-xs"
                      >
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          Esta solicitud fue aprobada por el Equipo de Gestión y contiene{" "}
                          <strong>{confidencialesCount} campo(s) confidencial(es)</strong>.
                          Como Revisor DPI, evalúa que cada atributo cuente con fundamentación legal suficiente conforme a la Ley Orgánica de Protección de Datos Personales (LOPDP).
                        </p>
                      </Alert>

                      {/* Lista detallada de campos con foco en justificación jurídica LOPDP */}
                      <div className="space-y-3.5">
                        {campos.map((campo, idx) => {
                          const isConf = campo.clasificacion === "Confidencial";
                          return (
                            <div
                              key={campo.id || idx}
                              className={cn(
                                "p-4 rounded-xl border space-y-3 transition-all",
                                isConf
                                  ? "border-warning/30 bg-warning/5"
                                  : "border-border bg-muted/20"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-foreground text-xs">
                                    {campo.nombre}
                                  </span>
                                  {campo.descripcion && (
                                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                      — {campo.descripcion}
                                    </span>
                                  )}
                                </div>
                                <div className="inline-flex items-center gap-1.5 flex-wrap">
                                  {isConf ? (
                                    <Badge
                                      tone="warning"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1 font-semibold"
                                    >
                                      <Lock className="size-3" />
                                      Confidencial
                                    </Badge>
                                  ) : (
                                    <Badge
                                      tone="success"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1 font-semibold"
                                    >
                                      <Unlock className="size-3" />
                                      Accesible
                                    </Badge>
                                  )}
                                  {campo.esSensible && (
                                    <Badge
                                      tone="danger"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1 font-semibold"
                                    >
                                      <ShieldAlert className="size-3" />
                                      Sensible · LOPDP
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {campo.esSensible && (
                                <div className="p-2.5 rounded-lg border border-danger/30 bg-danger/5 flex items-center gap-2 text-xs text-foreground">
                                  <ShieldAlert className="size-4 text-danger shrink-0" />
                                  <span>
                                    <strong>Dato Confidencial Sensible:</strong> sujeto a tratamiento de máxima reserva según la LOPDP.
                                  </span>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                                <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                                    Finalidad específica declarada:
                                  </span>
                                  <p className="text-foreground text-xs leading-relaxed">
                                    {campo.finalidad}
                                  </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                                  <span className="text-[10px] font-bold text-warning uppercase block">
                                    Justificación jurídica presentada (LOPDP):
                                  </span>
                                  <p className="text-foreground text-xs leading-relaxed">
                                    {campo.justificacionConfidencial}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          onClick={() => setDetailTab(0)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          ← Volver a Institución y Fuente
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(2)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: 3. Modalidad y Cupo →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 2: MODALIDAD DE CONSUMO Y CUPO ESTIMADO */}
                  {detailTab === 2 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 rounded-t-lg">
                        <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <Server className="size-4 text-primary dark:text-primary-300 shrink-0" />
                          <span>
                            Sección III — Modalidad Autorizada y Cupo de Consultas
                          </span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Parámetros técnicos previamente validados por el Equipo de Gestión.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Modalidad autorizada por Gestión
                          </span>
                          <p className="text-sm font-bold text-foreground">
                            {solicitud.modalidadAprobada ||
                              solicitud.modalidad ||
                              "API individual"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Modalidad de consumo validada en la primera etapa de revisión.
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Cupo anual autorizado
                          </span>
                          <p className="text-sm font-bold font-mono text-primary">
                            {(
                              solicitud.cupoAprobado ||
                              solicitud.cupo ||
                              50000
                            ).toLocaleString()}{" "}
                            registros / año
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Volumen anual proyectado para el proyecto {proyectoNombre}
                          </p>
                        </div>

                        <div className="sm:col-span-2 p-4 rounded-xl border border-border bg-muted/20 space-y-1.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Servicio Web / Endpoint Técnico Asociado
                          </span>
                          <p className="text-xs font-mono font-semibold text-foreground">
                            {solicitud.servicioPrincipal ||
                              `ws_${codigoPaquete.toLowerCase().replace(/[^a-z0-9]/g, "_")}_consulta_v2`}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Bus de Interoperabilidad Gubernamental SINARP · Protocolo seguro con autenticación mutua.
                          </p>
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
                          ← Volver a Campos y Finalidades
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setDetailTab(3)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          Siguiente: 4. Documentos de Soporte →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 3: DOCUMENTOS DE SOPORTE */}
                  {detailTab === 3 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 rounded-t-lg">
                        <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary dark:text-primary-300 shrink-0" />
                          <span>
                            Sección IV — Documentos Habilitantes y Soportes Adjuntos
                          </span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verifica la validez jurídica, competencia institucional y firmas electrónicas de los adjuntos.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl border border-border bg-surface hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <FileText className="size-5" />
                              </div>
                              <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-mono font-bold text-xs text-foreground truncate">
                                    {doc.nombre}
                                  </p>
                                  <Badge
                                    tone="success"
                                    appearance="soft"
                                    size="sm"
                                    className="text-[10px] gap-1"
                                  >
                                    <Check className="size-3" />
                                    FirmaEC verificada
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  Categoría: {doc.categoria || "Soporte documental"} · Formato{" "}
                                  {doc.tipo || "PDF"} · Tamaño: {doc.tamano || "1.4 MB"} · Cargado:{" "}
                                  {doc.fechaCarga}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs font-semibold gap-1.5"
                                onClick={() =>
                                  setSelectedDocPreview({
                                    nombre: doc.nombre,
                                    fechaCarga: doc.fechaCarga,
                                  })
                                }
                              >
                                <Eye className="size-3.5 text-primary" />
                                <span>Vista previa</span>
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2.5 text-xs font-semibold gap-1"
                                onClick={() =>
                                  toast.success(`Descargando ${doc.nombre}`, {
                                    description:
                                      "Archivo con firma electrónica institucional verificada.",
                                  })
                                }
                              >
                                <Download className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-border flex justify-start">
                        <Button
                          type="button"
                          variant="neutral"
                          size="sm"
                          onClick={() => setDetailTab(2)}
                          className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                        >
                          ← Volver a Modalidad y Cupo
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: TRAZABILIDAD E HISTORIAL DE OBSERVACIONES */}
                <TabsContent
                  value="trazabilidad"
                  className="space-y-4 animate-in fade-in duration-200"
                >
                  <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-info-100/30 dark:bg-info-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <CardBadge className="bg-info/20 text-info text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 flex items-center gap-1.5">
                        <History className="size-3.5 text-info" />
                        <span>
                          {(solicitud.historial || []).length} EVENTOS REGISTRADOS
                        </span>
                      </CardBadge>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold font-heading text-info mt-1">
                      Trazabilidad y Línea de Tiempo del Expediente
                    </CardTitle>

                    <CardDescription className="text-xs text-info-800/80 dark:text-info-200/80 font-medium">
                      Historial cronológico de envíos, asignaciones, observaciones estructuradas, subsanaciones y dictámenes.
                    </CardDescription>

                    <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                      <History className="size-32 text-info" />
                    </CardDecorativeIcon>
                  </Card>

                  {/* Historial de Observaciones Estructuradas si existen */}
                  {solicitud.observacionesEstructuradas &&
                    solicitud.observacionesEstructuradas.length > 0 && (
                      <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 shadow-xs">
                        <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                          <AlertTriangle className="size-4 text-warning" />
                          <span>Historial de Observaciones Registradas</span>
                        </h3>
                        <div className="space-y-2.5">
                          {solicitud.observacionesEstructuradas.map((obs) => (
                            <div
                              key={obs.id}
                              className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <Badge tone="warning" appearance="soft" size="sm">
                                    {obs.tipo.toUpperCase()} ·{" "}
                                    {obs.elementoNombre || "Elemento"}
                                  </Badge>
                                  <span className="text-[11px] text-muted-foreground">
                                    Por {obs.revisor} ({obs.fecha})
                                  </span>
                                </div>
                                <Badge tone="neutral" appearance="soft" size="sm">
                                  Etapa: {obs.etapa}
                                </Badge>
                              </div>
                              <p className="text-foreground leading-relaxed">
                                {obs.descripcion}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Línea de tiempo cronológica */}
                  <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
                    <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-border">
                      {(solicitud.historial || []).map((ev, i) => (
                        <div key={i} className="relative pl-8">
                          <span className="absolute left-1.5 top-1.5 size-3 rounded-full bg-primary ring-4 ring-surface" />
                          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-bold text-foreground">
                                {ev.evento}
                              </span>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                {ev.fecha}
                              </span>
                            </div>
                            {ev.detalle && (
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {ev.detalle}
                              </p>
                            )}
                            {ev.actor && (
                              <div className="text-[11px] text-muted-foreground pt-1">
                                Actor: <strong className="text-foreground">{ev.actor}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* COLUMNA DERECHA (5 cols): PANEL DE REVISIÓN Y DICTAMEN DPI (Idéntico a revisión de gestión y anexos) */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-5 lg:sticky lg:top-6">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
                {/* Encabezado: Dictamen de datos confidenciales + Badge de estado */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <Scale className="size-5 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Dictamen de datos confidenciales (DPI)
                    </h3>
                  </div>
                  {renderEstadoBadge(solicitud.estado)}
                </div>

                {/* Resumen del contexto de revisión DPI */}
                <div className="p-3.5 bg-muted/30 rounded-xl border border-border text-xs space-y-2">
                  <div className="flex flex-col gap-0.5 text-[11px]">
                    <span className="text-muted-foreground">
                      Fuente / Paquete requerido:
                    </span>
                    <strong className="text-foreground leading-snug">
                      {fuenteNombre} ({codigoPaquete})
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border/50">
                    <span className="text-muted-foreground">
                      Institución solicitante:
                    </span>
                    <strong className="text-foreground truncate max-w-[190px] text-right">
                      {solicitud.institucion}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">
                      Coordinador solicitante:
                    </span>
                    <strong className="text-foreground">{solicitud.coordinador}</strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Campos confidenciales auditados:</span>
                    <strong className="text-warning font-semibold">
                      {confidencialesCount} campos LOPDP
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Revisor DPI asignado:</span>
                    <strong className="text-foreground">
                      {solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)"}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border/50">
                    <span className="text-muted-foreground">1.ª Firma (Revisor DPI):</span>
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1",
                        firmaRevisorOk ? "text-success" : "text-warning"
                      )}
                    >
                      {firmaRevisorOk ? (
                        <>
                          <Check className="size-3 font-bold" />
                          Firmado con FirmaEC
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" />
                          Pendiente de dictamen
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">2.ª Firma (Director DPI):</span>
                    <span
                      className={cn(
                        "font-semibold flex items-center gap-1",
                        firmaDirectorOk ? "text-success" : "text-muted-foreground"
                      )}
                    >
                      {firmaDirectorOk ? (
                        <>
                          <Check className="size-3 font-bold" />
                          Refrendado
                        </>
                      ) : (
                        <>
                          <Clock className="size-3" />
                          En espera de refrenda
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Alerta de reingreso subsanado si aplica */}
                {(solicitud.versionExpediente || 1) > 1 && (
                  <Alert
                    variant="success"
                    icon={<Sparkles className="size-4" />}
                    title={`Reingreso subsanado (Versión v${solicitud.versionExpediente})`}
                    className="p-3 text-xs"
                  >
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {solicitud.detalleSubsanacion ||
                        "El Coordinador subsanó las observaciones jurídicas de los campos confidenciales."}
                    </p>
                  </Alert>
                )}

                {/* CASO 1: EN EVALUACIÓN NORMATIVA DPI (Pendiente de dictamen y 1.ª firma) */}
                {enEvaluacionNormativa && (
                  <div className="space-y-4 pt-1">
                    <Alert
                      variant="info"
                      icon={<Activity className="size-4" />}
                      title="Expediente asignado para evaluación de confidencialidad"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        Verifica en la columna izquierda la fundamentación jurídica LOPDP de los campos confidenciales y emite tu dictamen.
                      </p>
                    </Alert>

                    {/* Bloque: ¿Cuál es tu decisión jurídica? */}
                    <div className="space-y-3 pt-2 border-t border-border/70">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          ¿Cuál es tu decisión jurídica?
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          Si los datos confidenciales no cuentan con base jurídica suficiente, notifica observaciones (3 días hábiles PAR-13). Si proceden, emite el dictamen y suscribe la primera firma digital con FirmaEC (SOL-08).
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsObservarModalOpen(true)}
                          className="flex-1 text-xs font-semibold text-warning border-warning/40 hover:bg-warning/10 gap-1.5"
                        >
                          <AlertTriangle className="size-3.5" />
                          <span>Observar (PAR-13)</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setIsAprobarModalOpen(true)}
                          className="flex-1 text-xs font-semibold gap-1.5 shadow-2xs"
                        >
                          <FileSignature className="size-3.5" />
                          <span>Emitir informe y firmar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASO 2: INFORME GENERADO CON 1.ª FIRMA — ESPERANDO REFRENTA DEL DIRECTOR DPI */}
                {tieneInforme && !firmaDirectorOk && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="info"
                      icon={<Clock className="size-4" />}
                      title="1.ª Firma registrada — En espera de refrenda del Director DPI (SOL-08)"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        El informe técnico-jurídico fue suscrito con FirmaEC por el Revisor DPI. El expediente se encuentra en la bandeja del Director DPI para la segunda firma oficial.
                      </p>
                    </Alert>

                    {solicitud.informeNormativa && (
                      <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-bold text-foreground">
                            {solicitud.informeNormativa.numero}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {solicitud.informeNormativa.fechaEmision}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic line-clamp-3">
                          &ldquo;{solicitud.informeNormativa.fundamento}&rdquo;
                        </p>

                        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[11px]">
                          <span className="text-muted-foreground">Firmado por:</span>
                          <strong className="text-success font-semibold flex items-center gap-1">
                            <CheckCircle2 className="size-3.5 text-success" />
                            {solicitud.informeNormativa.revisorNombre}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASO 3: APROBADA POR NORMATIVIDAD CON DOBLE FIRMA */}
                {(solicitud.estado === "Aprobada por Normatividad" ||
                  firmaDirectorOk) && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="success"
                      icon={<CheckCircle2 className="size-4" />}
                      title="Doble firma electrónica completada — Aprobada por DPI"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        El informe técnico-jurídico cuenta con la refrenda del Director DPI. Los datos confidenciales fueron formalmente autorizados y continúan al proceso de suscripción de convenio/contrato.
                      </p>
                    </Alert>

                    {solicitud.informeNormativa && (
                      <div className="p-3.5 rounded-xl border border-success/30 bg-success/5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-bold text-foreground">
                            {solicitud.informeNormativa.numero}
                          </span>
                          <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                            Completado
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-success/20 text-[11px]">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">
                              1.ª Firma (Revisor DPI):
                            </span>
                            <strong className="text-foreground font-semibold truncate block">
                              {solicitud.informeNormativa.revisorNombre}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground block">
                              2.ª Firma (Director DPI):
                            </span>
                            <strong className="text-foreground font-semibold truncate block">
                              {solicitud.informeNormativa.directorNombre ||
                                "Dr. Roberto Méndez (Director DPI)"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASO 4: OBSERVADA POR DPI */}
                {(solicitud.estado === "Observada" ||
                  solicitud.estado === "Requiere corrección" ||
                  solicitud.estado === "Con observaciones") && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="warning"
                      icon={<Clock className="size-4" />}
                      title="Solicitud observada por DPI (PAR-13)"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        Se notificó al Coordinador institucional con un plazo de 3 días hábiles para subsanar los fundamentos de confidencialidad.
                      </p>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL 1: OBSERVAR JURÍDICAMENTE EN DPI (3 DÍAS HÁBILES PAR-13) */}
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

            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left text-xs">
              <label className="font-semibold text-foreground block">
                Observación jurídica para subsanación{" "}
                <span className="text-danger">*</span>:
              </label>
              <Textarea
                rows={4}
                value={textoObservacionJuridica}
                onChange={(e) => setTextoObservacionJuridica(e.target.value)}
                placeholder="Indique qué competencia legal o justificación LOPDP debe subsanar el Coordinador SINARP..."
                className="text-xs bg-background rounded-xl p-3"
              />
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-[11px] text-muted-foreground">
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
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setIsObservarModalOpen(false)}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
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

        {/* MODAL 2: ELABORAR DICTAMEN JURÍDICO Y PROCEDER A FIRMA (SOL-08) */}
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

            <div className="modal-scroll-area overflow-y-auto pr-2 py-2.5 space-y-3 w-full flex-1 min-h-0 text-left text-xs">
              <label className="font-semibold text-foreground block">
                Conclusiones y Dictamen de Protección de la Información (LOPDP):
              </label>
              <Textarea
                rows={4}
                value={conclusionesInforme}
                onChange={(e) => setConclusionesInforme(e.target.value)}
                placeholder="Se determina que el tratamiento de los datos confidenciales solicitados cuenta con base jurídica habilitante conforme a la LOPDP y cumple con el principio de finalidad y proporcionalidad..."
                className="text-xs bg-background rounded-xl p-3"
              />

              <div className="p-3.5 rounded-2xl bg-success/10 border border-success/30 text-xs space-y-1">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-success" />
                  <span>Flujo de doble firma electrónica en DPI (SOL-08)</span>
                </p>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  1. Al pulsar continuar, se validará la <strong>1.ª firma con FirmaEC</strong> del Revisor DPI ({solicitud.revisorNormativoAsignado || "Carlos Mora"}).<br />
                  2. El informe pasará de forma inmediata a la bandeja del <strong>Director DPI</strong> (<code>/revision-normativa/asignacion</code>) para la <strong>2.ª firma de refrenda</strong>.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setIsAprobarModalOpen(false)}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="success"
                size="sm"
                onClick={handleIniciarFirmaRevisor}
                className="w-full sm:w-1/2 h-9 text-xs rounded-xl font-bold shadow-xs gap-1.5"
              >
                <Sparkles className="size-4" />
                <span>Continuar a FirmaEC (1.ª Firma)</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 3: SIMULACIÓN EN VIVO DE FIRMAEC REVISOR DPI (Homologado a RegistroInstitucion) */}
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

              {/* 2. Tarjeta resumen del expediente */}
              <div className="p-3.5 bg-surface rounded-2xl border border-border/80 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="size-4 text-primary shrink-0" />
                    <span className="font-bold text-foreground truncate">
                      {solicitud.institucion}
                    </span>
                  </div>
                  <Badge
                    tone="primary"
                    appearance="outline"
                    size="sm"
                    className="font-mono text-[10px]"
                  >
                    {solicitud.id}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/50 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      Expediente y fuente:
                    </span>
                    <strong className="text-foreground font-semibold truncate block">
                      {fuenteNombre}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      Revisor DPI firmante:
                    </span>
                    <strong className="text-foreground font-semibold truncate block">
                      {solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* 3. Estados Dinámicos: Validando con FirmaEC vs Firmado con Éxito */}
              {firmaEstado === "validando" ? (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl border border-primary/25 bg-primary/5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Mail className="size-4 shrink-0" />
                      <span>Notificación de firma enviada al correo institucional</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Se ha remitido la solicitud de suscripción digital al correo institucional{" "}
                      <strong className="text-foreground font-semibold">
                        carlos.mora@dinarp.gob.ec
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
                  <Alert
                    variant="success"
                    icon={<CheckCircle2 className="size-4" />}
                    title="1.ª Firma electrónica validada con éxito en FirmaEC"
                  >
                    <div className="space-y-2.5 w-full">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        El dictamen favorable de confidencialidad ha sido suscrito digitalmente de forma válida por{" "}
                        <strong className="text-foreground font-semibold">
                          {solicitud.revisorNormativoAsignado || "Carlos Mora (Revisor DPI)"}
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
                    <span>Aceptar y continuar</span>
                  </Button>
                )}
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* MODAL 4: VISOR DE DOCUMENTO */}
        <Dialog
          open={Boolean(selectedDocPreview)}
          onOpenChange={(open) => !open && setSelectedDocPreview(null)}
        >
          <DialogContent
            variant="standard"
            size="lg"
            className="p-6 max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl"
          >
            <DialogHeader className="items-center text-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <span>{selectedDocPreview?.nombre}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Documento de soporte con firma electrónica oficial verificada.
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 my-4 rounded-2xl border border-dashed border-border bg-muted/20 text-center space-y-3">
              <FileText className="size-12 text-primary/60 mx-auto" />
              <div>
                <p className="font-semibold text-xs text-foreground">
                  Visor de Documento Digital SINARP
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fecha de carga: {selectedDocPreview?.fechaCarga} · Validación FirmaEC: Válida
                </p>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDocPreview(null)}
                className="text-xs rounded-xl h-8 px-4"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success(
                    `Descargando ${selectedDocPreview?.nombre || "documento.pdf"}`
                  );
                  setSelectedDocPreview(null);
                }}
                className="text-xs rounded-xl h-8 px-4 gap-1.5"
              >
                <Download className="size-3.5" />
                <span>Descargar archivo</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </WireframeDashboardLayout>
  );
}
