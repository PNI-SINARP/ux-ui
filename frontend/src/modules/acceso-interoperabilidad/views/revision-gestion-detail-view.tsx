"use client";

import React, { useState, useMemo } from "react";
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
  Plus,
  Trash2,
  Sparkles,
  UserCheck,
  Activity,
  Info,
  ShieldCheck,
  FolderKanban,
  Server,
  Mail,
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
import { Input } from "@/components/ui/input";
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
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxSelectTrigger,
} from "@/components/ui/combobox";
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
  type SolicitudEstado,
  type ObservacionItem,
  type TipoElementoObservado,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

interface RevisionGestionDetailViewProps {
  id?: string;
  solicitudId?: string;
}

export function RevisionGestionDetailView({
  id,
  solicitudId,
}: RevisionGestionDetailViewProps) {
  const router = useRouter();
  const targetId = id || solicitudId || "";

  const {
    solicitudes,
    aprobarGestion,
    observarGestion,
  } = useSolicitudesStore();

  const solicitud = useMemo(
    () =>
      solicitudes.find((s) => s.id.toLowerCase() === targetId.toLowerCase()) ||
      null,
    [solicitudes, targetId]
  );

  // Sub-pestaña activa del expediente (0: Institución y Fuente, 1: Campos y Finalidades, 2: Cupo y Servicio, 3: Documentos)
  const [detailTab, setDetailTab] = useState<number>(0);

  // Modal Aprobar Solicitud Funcionalmente
  const [isModalAprobarOpen, setIsModalAprobarOpen] = useState(false);

  // Modal Observar Solicitud (SOL-06)
  const [isModalObservarOpen, setIsModalObservarOpen] = useState(false);
  const [plazoSubsanacionDias, setPlazoSubsanacionDias] = useState(3);
  const [listaObservaciones, setListaObservaciones] = useState<
    Array<{
      id: string;
      tipo: TipoElementoObservado;
      elementoNombre: string;
      descripcion: string;
    }>
  >([
    {
      id: "OBS-INIT-1",
      tipo: "finalidad",
      elementoNombre: "",
      descripcion: "",
    },
  ]);

  // Modal Visor de Documento de Soporte
  const [selectedDocPreview, setSelectedDocPreview] = useState<{
    nombre: string;
    fechaCarga: string;
  } | null>(null);

  if (!solicitud) {
    return (
      <WireframeDashboardLayout
        activeMenu="revision-gestion"
        breadcrumbs={[
          {
            label: "Revisar solicitudes de acceso",
            onClick: () => router.push("/revision-gestion"),
          },
          { label: "Solicitud no encontrada" },
        ]}
      >
        <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 my-8 mx-4">
          <div className="size-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
            <Database className="size-6" />
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
            onClick={() => router.push("/revision-gestion")}
            className="gap-1.5"
          >
            <ArrowLeft className="size-4" />
            <span>Volver a la bandeja</span>
          </Button>
        </div>
      </WireframeDashboardLayout>
    );
  }

  const campos = solicitud.fuentes.flatMap((fuente) =>
    (fuente.campos || []).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      descripcion: c.descripcion,
      clasificacion: c.clasificacion,
      esSensible: c.esSensible,
      finalidad: c.finalidad,
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
            nombre: solicitud.documentoSustentoNombre || "Oficio_Solicitud_Firmado.pdf",
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

  const enEvaluacion =
    solicitud.estado === "Asignada a revisión de Gestión" ||
    solicitud.estado === "En revisión de Gestión" ||
    solicitud.estado === "En revisión" ||
    solicitud.estado === "Por revisar" ||
    solicitud.estado === "Reenviada";

  const tipoOptions: { value: TipoElementoObservado; label: string }[] = [
    { value: "finalidad", label: "Finalidad por campo" },
    { value: "campo", label: "Campo solicitado" },
    { value: "documento", label: "Documento de soporte" },
    { value: "cupo", label: "Cupo estimado" },
    { value: "justificacion", label: "Justificación general" },
  ];

  const renderEstadoBadge = (estado: SolicitudEstado) => {
    switch (estado) {
      case "Asignada a revisión de Gestión":
      case "En revisión de Gestión":
      case "En revisión":
      case "Por revisar":
        return (
          <Badge tone="warning" appearance="soft" size="sm" dot>
            Pendiente por revisar
          </Badge>
        );
      case "Reenviada":
        return (
          <Badge tone="info" appearance="soft" size="sm" dot>
            Subsanada · Pendiente por revisar
          </Badge>
        );
      case "Observada":
      case "Requiere corrección":
      case "Con observaciones":
        return (
          <Badge tone="warning" appearance="soft" size="sm" dot>
            Observada por Gestión
          </Badge>
        );
      case "Aprobada por Gestión":
        return (
          <Badge tone="success" appearance="soft" size="sm" dot>
            Aprobada por Gestión
          </Badge>
        );
      case "Pendiente de asignación en Normatividad":
      case "En revisión normativa":
      case "En revisión jurídica":
        return (
          <Badge tone="info" appearance="soft" size="sm" dot>
            Derivada a DPI
          </Badge>
        );
      case "Cerrada":
      case "Cerrada por vencimiento":
        return (
          <Badge tone="danger" appearance="soft" size="sm" dot>
            Cerrada (Plazo vencido)
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm" dot>
            {estado}
          </Badge>
        );
    }
  };

  const handleOpenModalObservar = () => {
    setListaObservaciones([
      {
        id: `OBS-${Date.now()}`,
        tipo: "finalidad",
        elementoNombre: campos[0]?.nombre || "Finalidad específica",
        descripcion: "",
      },
    ]);
    setPlazoSubsanacionDias(3);
    setIsModalObservarOpen(true);
  };

  const handleAddObservacionItem = () => {
    setListaObservaciones((prev) => [
      ...prev,
      {
        id: `OBS-${Date.now()}-${prev.length + 1}`,
        tipo: "finalidad",
        elementoNombre: "",
        descripcion: "",
      },
    ]);
  };

  const handleRemoveObservacionItem = (obsId: string) => {
    if (listaObservaciones.length <= 1) return;
    setListaObservaciones((prev) => prev.filter((item) => item.id !== obsId));
  };

  const handleUpdateObservacionItem = (
    obsId: string,
    patch: Partial<{
      tipo: TipoElementoObservado;
      elementoNombre: string;
      descripcion: string;
    }>
  ) => {
    setListaObservaciones((prev) =>
      prev.map((item) => (item.id === obsId ? { ...item, ...patch } : item))
    );
  };

  const handleConfirmarObservacion = () => {
    const invalid = listaObservaciones.some(
      (o) => !o.elementoNombre.trim() || !o.descripcion.trim()
    );
    if (invalid) {
      toast.error("Completa todos los campos de las observaciones", {
        description:
          "Cada observación requiere indicar el elemento afectado y el detalle de la corrección solicitada.",
      });
      return;
    }

    const nowStr = new Date().toISOString().substring(0, 10);
    const revisorNombre = solicitud.revisorAsignado || "Ing. Sofía Viteri";

    const items: ObservacionItem[] = listaObservaciones.map((o) => ({
      id: o.id,
      tipo: o.tipo,
      elementoNombre: o.elementoNombre.trim(),
      descripcion: o.descripcion.trim(),
      fecha: nowStr,
      revisor: revisorNombre,
      etapa: "Gestión",
    }));

    observarGestion(solicitud.id, {
      revisor: revisorNombre,
      observaciones: items,
      diasPlazo: plazoSubsanacionDias,
    });
    setIsModalObservarOpen(false);
    toast.warning(`Solicitud ${solicitud.id} observada`, {
      description: `Se notificó al Coordinador solicitante con un plazo de ${plazoSubsanacionDias} días hábiles para subsanar.`,
    });
  };

  const handleConfirmarAprobacion = () => {
    const revisorNombre = solicitud.revisorAsignado || "Ing. Sofía Viteri";
    aprobarGestion(solicitud.id, {
      revisor: revisorNombre,
      camposAprobados: campos.map((c) => c.id),
      cupoAprobado: solicitud.cupo || 50000,
    });
    setIsModalAprobarOpen(false);

    if (tieneConfidenciales) {
      toast.success(`Evaluación de Gestión aprobada (${solicitud.id})`, {
        description:
          "Por contener campos confidenciales, el expediente fue derivado a la Dirección de Protección de la Información (DPI).",
      });
    } else {
      toast.success(`Solicitud ${solicitud.id} aprobada por Gestión`, {
        description:
          "Solo contiene campos accesibles. La solicitud quedó aprobada y pasa a formalización.",
      });
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-gestion"
      breadcrumbs={[
        {
          label: "Revisar solicitudes de acceso",
          onClick: () => router.push("/revision-gestion"),
        },
        { label: `Expediente ${solicitud.id}` },
      ]}
    >
      <main className="w-full px-2.5 sm:px-4 md:px-6 pb-4 pt-1 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor blanco principal (Mismo layout que SolicitudPendienteDetailView de Anexos A y B) */}
        <div className="bg-surface border border-border rounded-xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xs space-y-6 flex-1 min-h-0 overflow-y-auto">
          {/* Cabecera interna del trámite con botón Volver */}
          <div className="pb-4 border-b border-border/80 space-y-3">
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => router.push("/revision-gestion")}
                className="h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted shrink-0"
                title="Volver a la bandeja"
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
                  Acceso a fuentes · Solicitudes de acceso
                </Badge>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-foreground">
                  Trámite {solicitud.id}
                </h1>
                <Badge
                  tone={
                    solicitud.versionExpediente && solicitud.versionExpediente > 1
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

          {/* DISTRIBUCIÓN EN 2 COLUMNAS (Igual a Anexos A y B): IZQUIERDA EXPEDIENTE/TRAZABILIDAD (7 cols), DERECHA PANEL DE DECISIÓN (5 cols) */}
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
                        <Database className="size-3.5 sm:size-4 shrink-0" />
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
                          Solicitud formal de acceso a paquete de interoperabilidad del Catálogo de Fuentes del SINARP.
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
                  {/* Card Featured del Expediente (Estilo UI Kit idéntico a Anexo A/B) */}
                  <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                        PAQUETE DE INTEROPERABILIDAD · {codigoPaquete}
                      </CardBadge>
                      {tieneConfidenciales ? (
                        <Badge
                          tone="warning"
                          appearance="soft"
                          size="sm"
                          className="gap-1 text-[10px]"
                        >
                          <Lock className="size-3" />
                          <span>Contiene campos confidenciales (Requiere DPI)</span>
                        </Badge>
                      ) : (
                        <Badge
                          tone="success"
                          appearance="soft"
                          size="sm"
                          className="gap-1 text-[10px]"
                        >
                          <Unlock className="size-3" />
                          <span>Solo campos accesibles</span>
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                      {fuenteNombre}
                    </CardTitle>

                    <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                      Proveedor: {institucionProveedora} · Proyecto: {proyectoNombre}
                    </CardDescription>

                    <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                      <Database className="size-32 text-primary" />
                    </CardDecorativeIcon>
                  </Card>

                  {/* Pestañas Cápsula para navegar las 4 secciones del expediente (Igual que Anexo A) */}
                  <div className="overflow-x-auto py-1 -mx-1 px-1">
                    <Tabs
                      defaultValue="tab-0"
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
                          <span>2. Campos y Finalidades ({campos.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="tab-2"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 whitespace-nowrap data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white"
                        >
                          <Server className="size-3.5 shrink-0" />
                          <span>3. Cupo y Servicio</span>
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
                          Siguiente: 2. Campos y Finalidades →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 1: CAMPOS SOLICITADOS Y FINALIDAD POR CAMPO */}
                  {detailTab === 1 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-t-lg">
                        <div>
                          <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                            <Layers className="size-4 text-primary dark:text-primary-300 shrink-0" />
                            <span>
                              Sección II — Campos Solicitados y Finalidades Específicas
                            </span>
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Verifica que cada atributo requerido sea estrictamente pertinente y proporcional al proyecto declarado (SOL-05).
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

                      {tieneConfidenciales ? (
                        <Alert
                          variant="warning"
                          icon={<Lock className="size-4" />}
                          title="Bifurcación a Dirección de Protección de la Información (DPI)"
                          className="p-3.5 text-xs"
                        >
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            Esta solicitud incluye{" "}
                            <strong>{confidencialesCount} campo(s) confidencial(es)</strong>.
                            Al aprobarse funcionalmente en Gestión, el expediente pasará automáticamente a{" "}
                            <strong>Pendiente de asignación en DPI</strong> para evaluación normativa y legal.
                          </p>
                        </Alert>
                      ) : (
                        <Alert
                          variant="success"
                          icon={<Unlock className="size-4" />}
                          title="Flujo de aprobación directa en Gestión"
                          className="p-3.5 text-xs"
                        >
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                            Todos los campos solicitados son de sensibilidad{" "}
                            <strong>Accesible</strong>. La aprobación del Equipo de Gestión concluye la etapa de evaluación sin requerir paso por DPI.
                          </p>
                        </Alert>
                      )}

                      <div className="border border-border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/40">
                            <TableRow>
                              <TableHead className="text-xs font-bold uppercase text-muted-foreground w-[220px]">
                                Campo requerido
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase text-muted-foreground w-[140px]">
                                Sensibilidad
                              </TableHead>
                              <TableHead className="text-xs font-bold uppercase text-muted-foreground">
                                Finalidad específica declarada por el Coordinador
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {campos.map((campo, idx) => (
                              <TableRow key={idx} className="hover:bg-muted/20">
                                <TableCell className="align-top font-semibold text-xs text-foreground">
                                  {campo.nombre}
                                  {campo.descripcion && (
                                    <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                                      {campo.descripcion}
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="align-top">
                                  {campo.clasificacion === "Confidencial" ? (
                                    <Badge
                                      tone="warning"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1"
                                    >
                                      <Lock className="size-3" />
                                      Confidencial
                                    </Badge>
                                  ) : (
                                    <Badge
                                      tone="success"
                                      appearance="soft"
                                      size="sm"
                                      className="gap-1"
                                    >
                                      <Unlock className="size-3" />
                                      Accesible
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="align-top text-xs text-muted-foreground leading-relaxed">
                                  {campo.finalidad}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
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
                          Siguiente: 3. Cupo y Servicio →
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 2: CUPO ESTIMADO Y SERVICIO */}
                  {detailTab === 2 && (
                    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
                      <div className="bg-primary-100/20 dark:bg-black/35 border-b border-primary dark:border-primary/40 p-3.5 mb-5 rounded-t-lg">
                        <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <Server className="size-4 text-primary dark:text-primary-300 shrink-0" />
                          <span>
                            Sección III — Cupo Estimado y Servicio Web
                          </span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Revisión del volumen estimado de transacciones y del servicio asociado.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 p-4 rounded-xl border border-border bg-muted/20 space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Cupo estimado de consultas
                          </span>
                          <p className="text-sm font-bold font-mono text-primary">
                            {(solicitud.cupo || 50000).toLocaleString()} registros / año
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
                          Verifica la validez documental y firmas electrónicas de los archivos adjuntados por el Coordinador.
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
                          ← Volver a Cupo y Servicio
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
                                    {obs.tipo.toUpperCase()} · {obs.elementoNombre || "Elemento"}
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

            {/* COLUMNA DERECHA (5 cols): PANEL DE REVISIÓN Y DECISIÓN DE GESTIÓN (Igual que Anexos A y B) */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-5 lg:sticky lg:top-6">
              <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-4">
                {/* Encabezado: Revisión de la solicitud + Badge de estado */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-5 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      Revisión de la solicitud
                    </h3>
                  </div>
                  {renderEstadoBadge(solicitud.estado)}
                </div>

                {/* Resumen del contexto de revisión */}
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
                    <span className="text-muted-foreground">Alcance de campos:</span>
                    <strong className="text-foreground">
                      {campos.length} campos ({confidencialesCount} confidenciales)
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Cupo solicitado:</span>
                    <strong className="text-foreground font-mono">
                      {(solicitud.cupo || 50000).toLocaleString()} reg./año
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Revisor de Gestión:</span>
                    <strong className="text-foreground">
                      {solicitud.revisorAsignado || "Ing. Sofía Viteri"}
                    </strong>
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
                        "El Coordinador subsanó las observaciones previas dentro del plazo de 3 días hábiles."}
                    </p>
                  </Alert>
                )}

                {/* CASO 1: EN EVALUACIÓN FUNCIONAL */}
                {enEvaluacion && (
                  <div className="space-y-4 pt-1">
                    <Alert
                      variant="info"
                      icon={<Activity className="size-4" />}
                      title="Expediente asignado para evaluación"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        Revisa las 4 secciones del expediente en la columna izquierda y selecciona tu decisión para continuar.
                      </p>
                    </Alert>

                    {/* Bloque: ¿Cuál es tu decisión? (Idéntico a Anexos A y B) */}
                    <div className="space-y-3 pt-2 border-t border-border/70">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-foreground">
                          ¿Cuál es tu decisión?
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          En la etapa de Gestión no se solicita firma electrónica ni informe técnico PDF. Si existen inconsistencias, observa el expediente para su subsanación en 3 días hábiles.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleOpenModalObservar}
                          className="flex-1 text-xs font-semibold text-warning border-warning/40 hover:bg-warning/10 gap-1.5"
                        >
                          <AlertTriangle className="size-3.5" />
                          <span>Observar solicitud</span>
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => setIsModalAprobarOpen(true)}
                          className="flex-1 text-xs font-semibold gap-1.5 shadow-2xs"
                        >
                          <CheckCircle2 className="size-3.5" />
                          <span>Aprobar solicitud</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASO 2: OBSERVADA POR GESTIÓN (En espera de subsanación) */}
                {(solicitud.estado === "Observada" ||
                  solicitud.estado === "Requiere corrección" ||
                  solicitud.estado === "Con observaciones") && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="warning"
                      icon={<Clock className="size-4" />}
                      title="Solicitud observada — En espera de subsanación"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        Se notificó al Coordinador institucional para que subsane las observaciones y remita el expediente corregido.
                      </p>
                    </Alert>

                    {solicitud.observacionesEstructuradas &&
                      solicitud.observacionesEstructuradas.length > 0 && (
                        <div className="p-3 bg-warning/5 rounded-xl border border-warning/20 text-xs space-y-2">
                          <span className="font-semibold text-foreground block text-[11px]">
                            Observaciones enviadas ({solicitud.observacionesEstructuradas.length}):
                          </span>
                          <ul className="space-y-1.5 text-[11px]">
                            {solicitud.observacionesEstructuradas.map((obs) => (
                              <li key={obs.id} className="text-muted-foreground">
                                <strong className="text-foreground">
                                  {obs.elementoNombre}:
                                </strong>{" "}
                                {obs.descripcion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}

                {/* CASO 3: APROBADA POR GESTIÓN O DERIVADA A DPI */}
                {(solicitud.estado === "Aprobada por Gestión" ||
                  solicitud.estado === "Pendiente de asignación en Normatividad" ||
                  solicitud.estado === "En revisión normativa") && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="success"
                      icon={<CheckCircle2 className="size-4" />}
                      title="Evaluación funcional de Gestión completada"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        {tieneConfidenciales
                          ? "Aprobaste la pertinencia funcional en Gestión. El expediente fue derivado a la Dirección de Protección de la Información (DPI) por contener campos confidenciales."
                          : "Aprobaste funcionalmente esta solicitud. Al contener únicamente campos accesibles, quedó aprobada directamente por Gestión."}
                      </p>
                    </Alert>

                    <div className="p-3 rounded-xl bg-success/5 border border-success/20 text-[11px] space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cupo autorizado:</span>
                        <strong className="text-foreground font-mono">
                          {(
                            solicitud.cupoAprobado ||
                            solicitud.cupo ||
                            50000
                          ).toLocaleString()}{" "}
                          registros
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASO 4: CERRADA POR NO SUBSANACIÓN */}
                {(solicitud.estado === "Cerrada" ||
                  solicitud.estado === "Cerrada por vencimiento") && (
                  <div className="space-y-3 pt-1">
                    <Alert
                      variant="danger"
                      icon={<AlertTriangle className="size-4" />}
                      title="Solicitud cerrada por vencimiento de plazo"
                      className="p-3 text-xs"
                    >
                      <p className="text-[11px] leading-relaxed text-muted-foreground mt-0.5">
                        Expiró el plazo de 3 días hábiles sin que la entidad subsanara las observaciones formuladas.
                      </p>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            MODAL 1: CONFIRMAR APROBACIÓN FUNCIONAL (Organizado igual que Anexo A/B)
           ===================================================================== */}
        <Dialog open={isModalAprobarOpen} onOpenChange={setIsModalAprobarOpen}>
          <DialogContent variant="warning" className="sm:max-w-[500px]">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-bold font-heading text-foreground">
                Confirmar Aprobación Funcional — Acceso a Fuente
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Verifica los parámetros funcionales que quedarán autorizados por el Equipo de Gestión para este expediente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-1 text-left">
              {/* Badge Código Documental */}
              <div className="flex justify-center">
                <Badge
                  tone="warning"
                  appearance="soft"
                  size="sm"
                  className="border border-warning/30 font-semibold text-[11px]"
                >
                  {codigoPaquete} · {solicitud.id} · v
                  {solicitud.versionExpediente || 1}
                </Badge>
              </div>

              {/* Resumen estructurado de la solicitud */}
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Building2 className="size-3.5 text-muted-foreground" />{" "}
                    Institución:
                  </span>
                  <span className="font-bold text-foreground text-right truncate max-w-[230px]">
                    {solicitud.institucion}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Database className="size-3.5 text-muted-foreground" /> Fuente:
                  </span>
                  <span className="font-semibold text-foreground text-right truncate max-w-[230px]">
                    {fuenteNombre}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <User className="size-3.5 text-muted-foreground" /> Solicitante:
                  </span>
                  <span className="font-medium text-foreground text-right">
                    {solicitud.coordinador}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Layers className="size-3.5 text-muted-foreground" /> Alcance aprobado:
                  </span>
                  <span className="font-semibold text-foreground">
                    {campos.length} campos ({confidencialesCount} confidenciales)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-medium">
                    Cupo autorizado:
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {(solicitud.cupo || 50000).toLocaleString()} registros/año
                  </span>
                </div>
              </div>

              {/* Aviso de bifurcación según sensibilidad */}
              {tieneConfidenciales ? (
                <div className="p-3 bg-warning/10 rounded-xl border border-warning/30 text-[11px] text-warning-foreground flex items-start gap-2">
                  <Lock className="size-4 shrink-0 mt-0.5 text-warning" />
                  <span>
                    <strong>Derivación a DPI (SOL-07):</strong> Como el paquete incluye campos confidenciales, al confirmar pasará a{" "}
                    <strong>&ldquo;Pendiente de asignación en DPI&rdquo;</strong> para el dictamen jurídico de Protección de la Información.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-success/10 rounded-xl border border-success/30 text-[11px] text-foreground flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-success" />
                  <span>
                    <strong>Aprobación directa (SOL-08):</strong> Al contener solo campos accesibles, la solicitud pasará directamente a estado{" "}
                    <strong>&ldquo;Aprobada por Gestión&rdquo;</strong>.
                  </span>
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 flex flex-row w-full gap-3 sm:gap-3 [&>*]:flex-1">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setIsModalAprobarOpen(false)}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="warning"
                onClick={handleConfirmarAprobacion}
                className="w-full font-semibold"
              >
                Confirmar y Aprobar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =====================================================================
            MODAL 2: OBSERVAR SOLICITUD ESTRUCTURADAMENTE (Organizado como RechazarSolicitudDialog)
           ===================================================================== */}
        <Dialog open={isModalObservarOpen} onOpenChange={setIsModalObservarOpen}>
          <DialogContent
            variant="warning"
            className="max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-base font-bold font-heading text-foreground">
                Observar Solicitud de Acceso — {solicitud.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Registra las observaciones puntuales por elemento (campo, finalidad, documento o cupo) para que el Coordinador subsane el expediente.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 pt-1 text-left text-xs">
              {/* Resumen compacto del expediente */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Fuente: </span>
                  <strong className="text-foreground">{fuenteNombre}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Institución: </span>
                  <strong className="text-foreground">
                    {solicitud.institucion}
                  </strong>
                </div>
              </div>

              {/* Cabecera de lista de observaciones */}
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  Observaciones del expediente ({listaObservaciones.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddObservacionItem}
                  className="h-7 px-2.5 text-[11px] font-semibold gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Agregar observación</span>
                </Button>
              </div>

              {/* Ítems de observación */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {listaObservaciones.map((obs, idx) => (
                  <div
                    key={obs.id}
                    className="p-3.5 rounded-xl border border-border bg-surface space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        tone="warning"
                        appearance="soft"
                        size="sm"
                        className="text-[10px]"
                      >
                        Observación #{idx + 1}
                      </Badge>
                      {listaObservaciones.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveObservacionItem(obs.id)}
                          className="size-6 p-0 text-muted-foreground hover:text-danger"
                          title="Eliminar observación"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-foreground">
                          Categoría observada
                        </Label>
                        <Combobox
                          items={tipoOptions}
                          value={
                            tipoOptions.find((t) => t.value === obs.tipo) ||
                            tipoOptions[0]
                          }
                          onValueChange={(val: any) => {
                            if (val) {
                              handleUpdateObservacionItem(obs.id, {
                                tipo: (typeof val === "string"
                                  ? val
                                  : val.value) as TipoElementoObservado,
                              });
                            }
                          }}
                        >
                          <ComboboxSelectTrigger className="w-full h-8 justify-between text-xs bg-muted/30 border-border rounded-lg px-2.5 shadow-none" />
                          <ComboboxContent align="start" className="w-56">
                            <ComboboxList>
                              {tipoOptions.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt}
                                  className="text-xs"
                                >
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold text-foreground">
                          Campo o elemento específico{" "}
                          <span className="text-danger">*</span>
                        </Label>
                        <Input
                          value={obs.elementoNombre}
                          onChange={(e) =>
                            handleUpdateObservacionItem(obs.id, {
                              elementoNombre: e.target.value,
                            })
                          }
                          placeholder="Ej. Condición de cedulado, Oficio PDF..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold text-foreground">
                        Detalle de la corrección requerida{" "}
                        <span className="text-danger">*</span>
                      </Label>
                      <Textarea
                        rows={2}
                        value={obs.descripcion}
                        onChange={(e) =>
                          handleUpdateObservacionItem(obs.id, {
                            descripcion: e.target.value,
                          })
                        }
                        placeholder="Explica claramente qué debe corregir o complementar el Coordinador..."
                        className="text-xs resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 shrink-0" />
                <span>
                  El Coordinador institucional será notificado por correo electrónico con el detalle estructurado para su subsanación.
                </span>
              </p>
            </div>

            <DialogFooter className="mt-4 flex flex-row w-full gap-3 sm:gap-3 [&>*]:flex-1">
              <Button
                type="button"
                variant="neutral"
                onClick={() => setIsModalObservarOpen(false)}
                className="w-full"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="warning"
                onClick={handleConfirmarObservacion}
                className="w-full font-semibold"
              >
                Confirmar y notificar observación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =====================================================================
            MODAL 3: VISTA PREVIA DE DOCUMENTO DE SOPORTE
           ===================================================================== */}
        <Dialog
          open={Boolean(selectedDocPreview)}
          onOpenChange={(open) => {
            if (!open) setSelectedDocPreview(null);
          }}
        >
          <DialogContent className="max-w-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <span>Vista Previa — Documento Habilitante</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Visor de documento de soporte registrado en el expediente{" "}
                {solicitud.id}.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 bg-muted/30 border border-border rounded-2xl text-center space-y-3 my-2">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileText className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground break-all">
                  {selectedDocPreview?.nombre}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Cargado el {selectedDocPreview?.fechaCarga} ·{" "}
                  {solicitud.institucion}
                </p>
              </div>
              <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                <Check className="size-3" />
                Firma electrónica verificada en FirmaEC
              </Badge>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setSelectedDocPreview(null)}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  toast.success(`Descargando ${selectedDocPreview?.nombre}`);
                  setSelectedDocPreview(null);
                }}
              >
                <Download className="size-3.5" />
                <span>Descargar PDF</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </WireframeDashboardLayout>
  );
}
