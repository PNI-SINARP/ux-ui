"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { useFuentesStore } from "../data/fuentes-store";
import { EstadoFuente, FuenteDatos, CampoFuente } from "../data/fuentes-data";
import { FuenteTrazabilidadStepper } from "../components/fuente-trazabilidad-stepper";
import { FuenteObservacionesAlert } from "../components/fuente-observaciones-alert";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import { FuenteFormDialog } from "../components/fuente-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Server,
  Building2,
  Globe,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  Calendar,
  Lock,
  ExternalLink,
  Copy,
  Edit,
  Send,
  Play,
  RotateCcw,
  Cpu,
  Clock,
  Sparkles,
  Info,
  FileText,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

interface FuenteDetailViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

type TabType = "resumen" | "configuracion" | "campos" | "pruebas" | "historial";

export function FuenteDetailView({ currentUser }: FuenteDetailViewProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { isLoaded, getFuenteById, corregirFuenteYReenviar } = useFuentesStore();
  const [activeTab, setActiveTab] = useState<TabType>("resumen");
  const [showPublicarDialog, setShowPublicarDialog] = useState(false);
  const [showCorregirDialog, setShowCorregirDialog] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Formulario de corrección rápida para fuente devuelta
  const [correcSlaDisp, setCorrecSlaDisp] = useState<number>(99.5);
  const [correcSlaMs, setCorrecSlaMs] = useState<number>(300);
  const [correcDesc, setCorrecDesc] = useState<string>("");
  const [motivoCorreccion, setMotivoCorreccion] = useState<string>("");
  const [isSubmittingCorrec, setIsSubmittingCorrec] = useState(false);

  const fuente = getFuenteById(id);
  const coordinadorNombre = currentUser?.name || "Carlos Mendoza";

  // Prellenar form de corrección cuando abra modal
  const handleOpenCorregir = () => {
    if (!fuente) return;
    setCorrecSlaDisp(fuente.sla_fuente.disponibilidad_objetivo);
    setCorrecSlaMs(fuente.sla_fuente.tiempo_maximo_respuesta_ms);
    setCorrecDesc(fuente.descripcion_fuente);
    setMotivoCorreccion("");
    setShowCorregirDialog(true);
  };

  const handleConfirmarCorreccion = () => {
    if (!fuente) return;
    setIsSubmittingCorrec(true);

    setTimeout(() => {
      corregirFuenteYReenviar(
        fuente.id,
        {
          descripcion_fuente: correcDesc,
          sla_fuente: {
            ...fuente.sla_fuente,
            disponibilidad_objetivo: correcSlaDisp,
            tiempo_maximo_respuesta_ms: correcSlaMs,
          },
        },
        coordinadorNombre,
        motivoCorreccion || "Ajuste de SLA y especificaciones técnicas solicitadas por Gestión."
      );
      setIsSubmittingCorrec(false);
      setShowCorregirDialog(false);
      toast.success("Fuente corregida y reenviada a Gestión", {
        description: `El estado cambió a 'En revisión' para evaluación de Gestión.`,
      });
    }, 600);
  };

  if (!isLoaded) {
    return (
      <WireframeDashboardLayout
        activeMenu="fuentes"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Fuentes de información", href: "/fuentes" },
          { label: "Cargando..." },
        ]}
      >
        <div className="py-20 text-center text-xs text-muted-foreground">
          Cargando información de la fuente...
        </div>
      </WireframeDashboardLayout>
    );
  }

  if (!fuente) {
    return (
      <WireframeDashboardLayout
        activeMenu="fuentes"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Fuentes de información", href: "/fuentes" },
          { label: "No encontrada" },
        ]}
      >
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 items-center justify-center p-8 text-center space-y-4"
          >
            <Server className="size-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Fuente no encontrada
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No se encontró ninguna fuente de datos con el identificador &quot;{id}&quot;.
            </p>
            <Link href="/fuentes">
              <Button variant="outline" size="sm">
                Volver a la bandeja de fuentes
              </Button>
            </Link>
          </Card>
        </main>
      </WireframeDashboardLayout>
    );
  }

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return <Badge tone="neutral" appearance="soft">Borrador</Badge>;
      case "CONEXION_PENDIENTE":
        return <Badge tone="warning" appearance="soft">Conexión pendiente</Badge>;
      case "PENDIENTE_HOMOLOGACION":
        return <Badge tone="warning" appearance="soft">Pendiente de homologación (TI)</Badge>;
      case "ESQUEMA_PENDIENTE_CORRECCION":
        return <Badge tone="danger" appearance="soft">Esquema pendiente de corrección</Badge>;
      case "CONFIGURACION":
        return <Badge tone="info" appearance="soft">Configuración</Badge>;
      case "EN_REVISION":
        return <Badge tone="warning" appearance="soft">En revisión de Gestión</Badge>;
      case "DEVUELTA":
        return <Badge tone="danger" appearance="soft">Devuelta con observaciones</Badge>;
      case "APROBADA":
        return <Badge tone="success" appearance="soft">Aprobada</Badge>;
      case "PUBLICACION_PENDIENTE":
        return <Badge tone="warning" appearance="soft">Publicación pendiente (Reintento)</Badge>;
      case "PUBLICADA":
        return <Badge tone="success" appearance="solid">Publicada en catálogo</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const camposIncluidos = fuente.campos.filter((c) => c.incluido);

  return (
    <WireframeDashboardLayout
      activeMenu="fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Fuentes de información", href: "/fuentes" },
        { label: fuente.id },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header de la Fuente */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/fuentes">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-extrabold text-2xl tracking-tight text-primary">
                    {fuente.nombre}
                  </h1>
                  <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border">
                    {fuente.id}
                  </span>
                  {getEstadoBadge(fuente.estado)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Building2 className="size-3.5 text-primary" />
                  <span>{fuente.institucion_proveedora_nombre}</span>
                  <span>•</span>
                  <span>Versión: <strong className="font-mono text-foreground">{fuente.version_propuesta}</strong></span>
                  {fuente.version_api && (
                    <>
                      <span>•</span>
                      <span>API Gateway: <strong className="font-mono text-success">{fuente.version_api}</strong></span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* CTAs Contextuales */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {/* Botón de Edición en Modal (FUE-01/02/03) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2 shadow-2xs cursor-pointer text-xs"
              >
                <Edit className="size-3.5" />
                <span>Editar fuente</span>
              </Button>

              {fuente.estado === "DEVUELTA" && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleOpenCorregir}
                  className="gap-2 shadow-xs cursor-pointer"
                >
                  <Edit className="size-3.5" />
                  <span>Corregir fuente</span>
                </Button>
              )}

              {fuente.estado === "APROBADA" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPublicarDialog(true)}
                  className="gap-2 shadow-xs cursor-pointer"
                >
                  <Globe className="size-4" />
                  <span>Publicar fuente (FUE-05)</span>
                </Button>
              )}

              {fuente.estado === "PUBLICACION_PENDIENTE" && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => setShowPublicarDialog(true)}
                  className="gap-2 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                  <span>Reintentar publicación</span>
                </Button>
              )}

              {fuente.estado === "PENDIENTE_HOMOLOGACION" && (
                <Link href="/homologacion-fuentes">
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Cpu className="size-3.5 text-warning" />
                    <span>Ver caso en TI</span>
                  </Button>
                </Link>
              )}

              {fuente.estado === "PUBLICADA" && (
                <Badge tone="success" appearance="soft" size="lg" className="gap-1.5 py-1.5 px-3">
                  <CheckCircle2 className="size-4" />
                  Disponible en Catálogo Nacional
                </Badge>
              )}
            </div>
          </div>

          {/* Banner si está DEVUELTA */}
          {fuente.estado === "DEVUELTA" && (
            <FuenteObservacionesAlert
              fuente={fuente}
              coordinadorNombre={coordinadorNombre}
            />
          )}

          {/* Banner si está en PENDIENTE DE HOMOLOGACION */}
          {fuente.estado === "PENDIENTE_HOMOLOGACION" && (
            <div className="p-4 bg-warning/10 rounded-xl border border-warning/30 flex items-start gap-3">
              <Cpu className="size-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Proceso de Homologación Técnica en Curso (FUE-12 / CNX-01 / CNX-02)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta fuente utiliza una tecnología que requiere certificación de laboratorio por el Equipo de TI de DINARP. El caso ha sido registrado y se encuentra en diagnóstico. La publicación o reenvío no podrá proceder hasta la certificación del conector.
                </p>
                {fuente.caso_homologacion && (
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="font-mono font-bold text-foreground">
                      Caso: {fuente.caso_homologacion.id_caso}
                    </span>
                    <span>·</span>
                    <span className="text-muted-foreground">
                      Tecnología: {fuente.caso_homologacion.tecnologia}
                    </span>
                    <span>·</span>
                    <span className="text-warning font-semibold">
                      Estado: {fuente.caso_homologacion.estado}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Banner si falló la publicación */}
          {fuente.estado === "PUBLICACION_PENDIENTE" && fuente.fallo_publicacion && (
            <div className="p-4 bg-danger/10 rounded-xl border border-danger/30 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-danger shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Fallo en el despliegue de la versión API (Publicación pendiente)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Etapa: <strong>{fuente.fallo_publicacion.etapa_fallida || fuente.fallo_publicacion.etapa}</strong> | Código:{" "}
                    <code className="font-mono text-danger font-bold">
                      {fuente.fallo_publicacion.codigo_referencia || fuente.fallo_publicacion.codigo}
                    </code>
                  </p>
                  <p className="text-xs text-foreground/90 font-mono bg-background/50 p-2 rounded border border-danger/20">
                    {fuente.fallo_publicacion.mensaje}
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowPublicarDialog(true)}
                className="gap-2 shrink-0 shadow-xs cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
                <span>Reintentar</span>
              </Button>
            </div>
          )}

          {/* Banner de Fuente Publicada */}
          {fuente.estado === "PUBLICADA" && fuente.despliegue && (
            <div className="p-4 rounded-xl border border-success/30 bg-success/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="size-5 text-success" />
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Servicio Publicado y Operativo en Producción (FUE-05)
                  </h4>
                </div>
                <Badge tone="success" appearance="solid" size="sm">
                  {fuente.despliegue.ambiente}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-background/80 rounded-lg border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    URL Pública Apigee (Endpoint):
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-foreground break-all">
                      {fuente.despliegue.url_publica}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => copyToClipboard(fuente.despliegue?.url_publica || "")}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-background/80 rounded-lg border border-border space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground block">
                    ID de Despliegue y Fecha:
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-foreground">
                      {fuente.despliegue.id_despliegue}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {new Date(fuente.despliegue.fecha_publicacion).toLocaleString("es-EC")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-success/10 rounded-lg text-[11px] text-success flex items-center gap-2">
                <Info className="size-4 shrink-0" />
                <span>
                  <strong>Importante:</strong> La publicación habilita esta fuente para ser visualizada y solicitada en el Catálogo de Interoperabilidad. No otorga autorizaciones automáticas de consumo a terceros (requiere flujo BN-01 / BN-02).
                </span>
              </div>
            </div>
          )}

          {/* Trazabilidad visual de etapas del ciclo de vida */}
          <FuenteTrazabilidadStepper
            estado={fuente.estado}
            fuente={fuente}
            historial={fuente.historial}
          />

          {/* Navegación por Pestañas del UI Kit */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabType)}
            className="w-full space-y-6"
          >
            {/* Lista de pestañas UI Kit estilo pill institucional */}
            <div className="overflow-x-auto w-full -mx-1 px-1 scrollbar-none">
              <TabsList className="h-auto p-1 rounded-full bg-surface-subtle border border-border/60 inline-flex gap-1 w-max justify-start flex-nowrap shadow-2xs">
                <TabsTrigger
                  value="resumen"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <Building2 className="size-3.5" />
                  <span>Resumen</span>
                </TabsTrigger>

                <TabsTrigger
                  value="configuracion"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <Sliders className="size-3.5" />
                  <span>Configuración</span>
                </TabsTrigger>

                <TabsTrigger
                  value="campos"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <Layers className="size-3.5" />
                  <span>Campos ({camposIncluidos.length})</span>
                </TabsTrigger>

                <TabsTrigger
                  value="pruebas"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <Play className="size-3.5" />
                  <span>Pruebas Técnicas</span>
                </TabsTrigger>

                <TabsTrigger
                  value="historial"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <History className="size-3.5" />
                  <span>Historial ({fuente.historial.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Resumen */}
            <TabsContent value="resumen" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Contenedor 1: Identificación y Registro Institucional */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Identificación Institucional y Registro
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Entidad proveedora de datos y trazabilidad administrativa del expediente.
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" appearance="soft" size="sm">
                    {fuente.modalidades_soportadas}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Institución proveedora:</span>
                    <span className="font-bold text-foreground text-xs line-clamp-1 mt-0.5" title={fuente.institucion_proveedora_nombre}>
                      {fuente.institucion_proveedora_nombre}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Versión propuesta:</span>
                    <span className="font-mono font-bold text-primary text-xs mt-0.5 block">
                      {fuente.version_propuesta}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Coordinador registrador:</span>
                    <span className="font-medium text-foreground text-xs line-clamp-1 mt-0.5" title={fuente.coordinador_nombre}>
                      {fuente.coordinador_nombre}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Fecha de registro:</span>
                    <span className="font-mono text-muted-foreground text-xs mt-0.5 block">
                      {new Date(fuente.fecha_creacion).toLocaleDateString("es-EC")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenedor 2: Descripción Técnica y Propósito (PAR-07) */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/80">
                  <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      Descripción Técnica y Propósito Funcional (PAR-07)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Finalidad técnica y justificación institucional del conjunto de datos provisto.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-foreground leading-relaxed pt-1">
                  {fuente.descripcion_fuente}
                </p>
              </div>

              {/* Contenedor 3: Acuerdo de Nivel de Servicio (SLA) y Entornos */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-border/80">
                  <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      Acuerdo de Nivel de Servicio (SLA) y Entornos
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Parámetros de disponibilidad, latencia y políticas de privacidad en sandbox institucional.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Acuerdo de Nivel de Servicio (SLA)
                    </span>
                    <div className="flex justify-between items-center py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Disponibilidad objetivo:</span>
                      <span className="font-mono font-bold text-foreground">
                        {fuente.sla_fuente.disponibilidad_objetivo}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Tiempo máx. respuesta:</span>
                      <span className="font-mono font-bold text-foreground">
                        {fuente.sla_fuente.tiempo_maximo_respuesta_ms} ms
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Modalidades y Formato
                    </span>
                    <div className="flex justify-between items-center py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Modalidades soportadas:</span>
                      <span className="font-medium text-foreground">{fuente.modalidades_soportadas}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Formato de respuesta:</span>
                      <code className="font-mono text-[11px] font-bold text-primary">{fuente.formato_respuesta}</code>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Datos en Pruebas (Sandbox)
                    </span>
                    <div className="flex justify-between items-center py-1 border-b border-border/60">
                      <span className="text-muted-foreground">Nivel de privacidad:</span>
                      <Badge tone={fuente.tipo_dato_pruebas === "Real" ? "warning" : "success"} appearance="soft" size="sm">
                        {fuente.tipo_dato_pruebas}
                      </Badge>
                    </div>
                    <div className="py-1">
                      <span className="text-[11px] text-muted-foreground block leading-tight">
                        {fuente.tipo_dato_pruebas === "Real"
                          ? "Restringido para sandbox institucional; requiere certificación para producción."
                          : "Habilitado para pruebas interactivas y validaciones en ambiente sandbox."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Configuración */}
            <TabsContent value="configuracion" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Contenedor 1: Parámetros de Red y Conexión */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Server className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Parámetros de Red y Conexión ({fuente.conexion.tipo_conector})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Configuración técnica del canal seguro de comunicación con el origen institucional.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success font-semibold bg-success/10 px-2.5 py-1 rounded-md border border-success/30">
                    <ShieldCheck className="size-4" />
                    <span>Cifrado KMS Activo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Host / Destino:
                    </span>
                    <span className="font-mono text-foreground font-medium text-xs break-all mt-0.5 block">
                      {fuente.conexion.host || fuente.conexion.url_endpoint || "-"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">Puerto:</span>
                    <span className="font-mono text-foreground font-medium text-xs mt-0.5 block">
                      {fuente.conexion.puerto || "-"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Base / Esquema:
                    </span>
                    <span className="font-mono text-foreground font-medium text-xs mt-0.5 block">
                      {fuente.conexion.base_datos || fuente.conexion.esquema || "-"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Usuario Lectura:
                    </span>
                    <span className="font-mono text-foreground font-medium text-xs mt-0.5 block">
                      {fuente.conexion.usuario || "-"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="size-3.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">Referencia de Secreto KMS:</span>
                  </div>
                  <code className="text-[11px] font-mono text-foreground bg-background px-2.5 py-1 rounded border border-border">
                    {fuente.conexion.secreto_referencia || "kms://arn:aws:kms:ec-dinarp:managed-secret"}
                  </code>
                </div>
              </div>

              {/* Contenedor 2: Custodia de Secretos */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/80">
                  <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Lock className="size-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      Custodia Criptográfica y Red Privada DINARP
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Lineamientos de seguridad institucional para secretos técnicos.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Los secretos y credenciales de acceso se almacenan exclusivamente en el servicio de gestión de claves criptográficas (KMS) y nunca son expuestos en texto plano en la interfaz ni transmitidos a clientes web. Todo el tráfico transcurre sobre túneles VPN dedicados con TLS v1.3.
                </p>
              </div>
            </TabsContent>

            {/* Tab 3: Campos */}
            <TabsContent value="campos" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Contenedor 1: Parámetros de Consulta Requeridos (FUE-01) */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Sliders className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Parámetros de Consulta Requeridos (FUE-01)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Criterios de búsqueda y filtros obligatorios para invocar la fuente de información.
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    {fuente.parametros_consulta.length} parámetros definidos
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {fuente.parametros_consulta.map((p) => (
                    <div
                      key={p.id_parametro}
                      className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">{p.nombre}</span>
                        <Badge tone="neutral" appearance="soft" size="sm">
                          {p.tipo}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {p.obligatorio && (
                          <Badge tone="danger" appearance="outline" size="sm">
                            Obligatorio
                          </Badge>
                        )}
                        {p.es_identificador_persona && (
                          <Badge tone="warning" appearance="soft" size="sm">
                            ID Persona
                          </Badge>
                        )}
                      </div>
                      {p.restriccion?.patron && (
                        <code className="text-[10px] text-muted-foreground block pt-1 font-mono">
                          Patrón: {p.restriccion.patron}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenedor 2: Esquema y Catálogo de Campos Expuestos (FUE-03) */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle/40">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Esquema y Catálogo de Campos Expuestos (FUE-03)
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estructura técnica de datos expuesta para interoperabilidad y clasificación de confidencialidad.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {camposIncluidos.length} campos totales
                    </Badge>
                    <Badge tone="success" appearance="soft" size="sm">
                      {camposIncluidos.filter(c => c.clasificacion === "Accesible").length} accesibles
                    </Badge>
                    <Badge tone="warning" appearance="soft" size="sm">
                      {camposIncluidos.filter(c => c.clasificacion === "Confidencial").length} confidenciales
                    </Badge>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/30">
                        <TableHead className="text-xs font-bold text-foreground pl-6">Nombre publicado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Ruta física origen</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Tipo normalizado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Regla de conversión</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Clasificación (Gestión FUE-04)</TableHead>
                        <TableHead className="text-xs font-bold text-foreground pr-6">Descripción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {camposIncluidos.map((campo) => (
                        <TableRow key={campo.id_campo} className="text-xs border-b border-border/60 hover:bg-muted/10">
                          <TableCell className="font-mono font-semibold text-primary pl-6">
                            {campo.nombre_publicado}
                          </TableCell>
                          <TableCell className="font-mono text-muted-foreground">
                            {campo.ruta_origen}
                          </TableCell>
                          <TableCell>
                            <Badge tone="neutral" appearance="soft" size="sm">
                              {campo.tipo_normalizado}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {campo.regla_conversion}
                          </TableCell>
                          <TableCell>
                            {campo.clasificacion === "Accesible" ? (
                              <Badge tone="success" appearance="soft" size="sm">
                                Accesible
                              </Badge>
                            ) : campo.clasificacion === "Confidencial" ? (
                              <Badge tone="warning" appearance="soft" size="sm">
                                Confidencial
                              </Badge>
                            ) : (
                              <Badge tone="neutral" appearance="outline" size="sm">
                                Sin clasificar
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground pr-6">
                            {campo.descripcion || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Pruebas Técnicas */}
            <TabsContent value="pruebas" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {fuente.conexion.ultima_prueba ? (
                <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                        <CheckCircle2 className="size-4" />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                          Última Prueba Técnica de Conexión (FUE-02)
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          Ejecutada con éxito desde la red privada VPN DINARP
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="success" appearance="soft" size="md">
                        {fuente.conexion.ultima_prueba.latencia_ms} ms latencia
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border">
                        {fuente.conexion.ultima_prueba.id_prueba}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground block">
                      Etapas de Verificación Técnica de Red:
                    </span>
                    <div className="space-y-2">
                      {fuente.conexion.ultima_prueba.etapas.map((et, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-muted/20 border border-border/60"
                        >
                          <span className="font-medium text-foreground">{et.etapa}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{et.detalle}</span>
                            {et.estado === "ok" ? (
                              <CheckCircle2 className="size-4 text-success shrink-0" />
                            ) : (
                              <XCircle className="size-4 text-danger shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface rounded-2xl border border-dashed border-border p-8 text-center space-y-2 shadow-xs">
                  <AlertTriangle className="size-8 text-warning mx-auto" />
                  <p className="text-xs font-semibold text-foreground">
                    No se registra evidencia técnica de prueba para esta fuente.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab 5: Historial */}
            <TabsContent value="historial" className="space-y-6 animate-in fade-in duration-200 outline-none">
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <History className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Bitácora de Trazabilidad y Eventos (BN-06 / AUD-01)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Registro cronológico e inmutable de dictámenes y cambios de estado.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {fuente.historial.length} eventos registrados
                  </span>
                </div>

                <div className="space-y-3">
                  {fuente.historial.map((evt) => (
                    <div
                      key={evt.id_evento}
                      className="p-4 rounded-xl border border-border bg-muted/10 text-xs space-y-2 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-xs">{evt.accion}</span>
                          <Badge tone="primary" appearance="outline" size="sm">
                            {evt.estado_resultante}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(evt.fecha).toLocaleString("es-EC")}
                        </span>
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>Actor responsable: <strong className="text-foreground">{evt.actor}</strong> ({evt.rol})</span>
                      </div>

                      {evt.observaciones && (
                        <p className="text-[11px] text-foreground/90 bg-background/80 p-3 rounded-lg border border-border mt-1 leading-relaxed">
                          {evt.observaciones}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Modal para Corregir Fuente Devuelta */}
      <Dialog open={showCorregirDialog} onOpenChange={setShowCorregirDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">
              Corregir y Reenviar Fuente a Revisión
            </DialogTitle>
            <DialogDescription className="text-xs">
              Modifique los parámetros observados por Gestión antes de reenviar la fuente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="desc-correc" className="text-xs font-semibold">
                Descripción funcional
              </Label>
              <Textarea
                id="desc-correc"
                rows={3}
                value={correcDesc}
                onChange={(e) => setCorrecDesc(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="disp-correc" className="text-xs font-semibold">
                  Disponibilidad SLA (%)
                </Label>
                <Input
                  id="disp-correc"
                  type="number"
                  step="0.1"
                  value={correcSlaDisp}
                  onChange={(e) => setCorrecSlaDisp(parseFloat(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lat-correc" className="text-xs font-semibold">
                  Tiempo máx respuesta (ms)
                </Label>
                <Input
                  id="lat-correc"
                  type="number"
                  value={correcSlaMs}
                  onChange={(e) => setCorrecSlaMs(parseInt(e.target.value) || 0)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="motivo-correc" className="text-xs font-semibold">
                Nota de subsanación para Gestión <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="motivo-correc"
                rows={2}
                placeholder="Describa los cambios aplicados en respuesta a las observaciones..."
                value={motivoCorreccion}
                onChange={(e) => setMotivoCorreccion(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCorregirDialog(false)}
              disabled={isSubmittingCorrec}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmarCorreccion}
              disabled={isSubmittingCorrec || !motivoCorreccion.trim()}
              className="gap-2 shadow-xs cursor-pointer"
            >
              <Send className="size-3.5" />
              <span>Reenviar a revisión</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Publicación */}
      <PublicarFuenteDialog
        fuente={fuente}
        coordinadorNombre={coordinadorNombre}
        open={showPublicarDialog}
        onOpenChange={setShowPublicarDialog}
      />

      {/* Modal de Edición de Fuente Completa (FUE-01/02/03) */}
      {fuente && (
        <FuenteFormDialog
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          fuenteAEditar={fuente}
          currentUser={currentUser}
          onSuccess={() => {
            setIsEditModalOpen(false);
          }}
        />
      )}
    </WireframeDashboardLayout>
  );
}
