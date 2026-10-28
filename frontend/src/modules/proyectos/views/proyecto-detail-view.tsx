"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Lock,
  Calendar,
  Copy,
  Check,
  Pencil,
  History,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Network,
  FileText,
  GitBranch,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileQuestion,
  Layers,
  Eye,
  Sparkles,
  Activity,
  XCircle,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useProyectosStore,
} from "@/modules/proyectos/data/proyectos-store";
import {
  useSolicitudesStore,
  type SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { EditarProyectoDialog } from "@/modules/proyectos/components/editar-proyecto-dialog";
import { TrazabilidadProyectoDialog } from "@/modules/proyectos/components/trazabilidad-proyecto-dialog";

interface ProyectoDetailViewProps {
  id?: string;
  params?: Promise<{ id: string }> | { id: string };
}

type TabKey = "info" | "solicitudes" | "trazabilidad";

interface SolicitudProyectoEnriquecida {
  id: string;
  fuentePrincipal: string;
  servicioPrincipal: string;
  estado: string;
  fecha: string;
  ultimaActualizacion: string;
  camposCount: number;
  accesiblesCount: number;
  confidencialesCount: number;
  sensiblesCount: number;
  modalidad: string;
  coordinador: string;
  etapaActual: string;
  quePasoResumen: string;
  ultimoActor: string;
  trazabilidad: {
    fecha: string;
    actor: string;
    accion: string;
    detalle?: string;
  }[];
}

export function ProyectoDetailView({ id: idProp, params }: ProyectoDetailViewProps) {
  const router = useRouter();
  const routeParams = useParams();

  // Resolver id de forma robusta
  const resolvedParams = params ? (params instanceof Promise ? React.use(params) : params) : null;
  const id = idProp || resolvedParams?.id || (routeParams?.id as string) || "";

  const { activeUser } = useAuthStore();
  const { getProyectoById, isLoaded } = useProyectosStore();
  const { solicitudes: storeSolicitudes } = useSolicitudesStore();

  const coordinadorUser = activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const coordinadorNombre = coordinadorUser?.name || "Mariana Almeida";

  // Estados locales
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [solicitudesViewMode, setSolicitudesViewMode] = useState<ViewMode>("cards");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrazabilidadDialogOpen, setIsTrazabilidadDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const proyecto = useMemo(() => {
    return getProyectoById(id);
  }, [getProyectoById, id]);

  // Cruzar solicitudes del proyecto con el store de Solicitudes para saber exactamente qué pasó con cada una
  const solicitudesEnriquecidas = useMemo<SolicitudProyectoEnriquecida[]>(() => {
    if (!proyecto) return [];

    const mapById = new Map<string, SolicitudAcceso>();
    storeSolicitudes.forEach((s) => {
      mapById.set(s.id, s);
    });

    const baseSolicitudes = [...(proyecto.solicitudes || [])];

    // Incorporar también solicitudes creadas en el store que apunten a este proyecto y no estén en el arreglo estático
    storeSolicitudes.forEach((s) => {
      const matchesProject =
        s.proyectoId === proyecto.id ||
        s.proyectoCodigo === proyecto.id ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase() === proyecto.nombre.toLowerCase());
      if (matchesProject && !baseSolicitudes.some((b) => b.id === s.id)) {
        const firstFuente = s.fuentes?.[0];
        baseSolicitudes.unshift({
          id: s.id,
          fuentePrincipal: firstFuente?.institucion || s.fuentePrincipal || "Catálogo Nacional SINARP",
          servicioPrincipal: firstFuente?.nombre || s.servicioPrincipal || "Consumo de interoperabilidad institucional",
          estado: s.estado,
          fecha: s.fecha,
          camposCount: s.camposCount,
          coordinador: s.responsable || proyecto.creadoPor,
        });
      }
    });

    return baseSolicitudes.map((sol) => {
      const match = mapById.get(sol.id);
      const estadoActual = match?.estado || sol.estado;
      const estadoLower = estadoActual.toLowerCase();

      // Contabilizar campos por clasificación si existen en el store
      let accesiblesCount = 0;
      let confidencialesCount = 0;
      let sensiblesCount = 0;

      if (match?.fuentes && match.fuentes.length > 0) {
        match.fuentes.forEach((f) => {
          f.campos.forEach((c) => {
            if (c.clasificacion === "Accesible") {
              accesiblesCount += 1;
            } else {
              confidencialesCount += 1;
              if (c.esSensible) {
                sensiblesCount += 1;
              }
            }
          });
        });
      } else {
        // Desglose representativo cuando proviene del resumen del proyecto
        const total = sol.camposCount || 6;
        accesiblesCount = Math.max(1, Math.floor(total * 0.6));
        confidencialesCount = Math.max(0, total - accesiblesCount);
        sensiblesCount = confidencialesCount >= 3 ? 1 : 0;
      }

      const ultimoEventoStore = match?.trazabilidad?.[0];

      let etapaActual = "En gestión institucional";
      let quePasoResumen = "";
      let ultimoActor = ultimoEventoStore?.actor || "Dirección de Interoperabilidad DINARP";

      if (estadoLower === "acceso generado" || estadoLower === "aprobada") {
        etapaActual = "Habilitación técnica activa · Credenciales emitidas";
        quePasoResumen =
          ultimoEventoStore?.detalle ||
          match?.observaciones ||
          `Solicitud aprobada por DINARP y DPI. Se autorizó el consumo de ${sol.camposCount} campos de ${sol.fuentePrincipal} y se generaron credenciales para el servicio "${sol.servicioPrincipal}".`;
        ultimoActor = ultimoEventoStore?.actor || "Dirección de Protección de la Información (DPI)";
      } else if (estadoLower === "en revisión" || estadoLower === "en proceso") {
        etapaActual = "Evaluación técnica y jurídica (DPI) en curso";
        quePasoResumen =
          ultimoEventoStore?.detalle ||
          match?.observaciones ||
          `Expediente radicado y admitido a trámite. Actualmente en validación de finalidad de uso y base legal para los campos solicitados a ${sol.fuentePrincipal}.`;
        ultimoActor = ultimoEventoStore?.actor || "Analista de Revisión / DPI DINARP";
      } else if (estadoLower === "por revisar" || estadoLower === "pendiente") {
        etapaActual = "Radicada en bandeja · Pendiente de asignación";
        quePasoResumen =
          ultimoEventoStore?.detalle ||
          `Solicitud enviada por ${sol.coordinador} con documento habilitante firmado. En espera de apertura de revisión por parte de DINARP.`;
        ultimoActor = ultimoEventoStore?.actor || sol.coordinador || "Coordinador SINARP";
      } else if (estadoLower === "observada") {
        etapaActual = "Subsanación requerida por la entidad solicitante";
        quePasoResumen =
          match?.observaciones ||
          ultimoEventoStore?.detalle ||
          `DINARP registró observaciones sobre la justificación normativa de campos confidenciales. Requiere alcance del coordinador SINARP.`;
        ultimoActor = ultimoEventoStore?.actor || "Revisor Jurídico DINARP";
      } else if (estadoLower === "rechazada") {
        etapaActual = "Trámite denegado · Archivo normativo";
        quePasoResumen =
          match?.motivoRechazo ||
          ultimoEventoStore?.detalle ||
          `Solicitud no autorizada por falta de competencia legal expresa para los datos solicitados.`;
        ultimoActor = ultimoEventoStore?.actor || "Dirección de Protección de la Información (DPI)";
      } else {
        etapaActual = `Estado: ${estadoActual}`;
        quePasoResumen =
          ultimoEventoStore?.detalle ||
          `Trámite vinculado al proyecto para el servicio ${sol.servicioPrincipal}.`;
      }

      const trazabilidad =
        match?.trazabilidad && match.trazabilidad.length > 0
          ? match.trazabilidad
          : [
              {
                fecha: `${sol.fecha} 15:40`,
                actor: ultimoActor,
                accion: etapaActual,
                detalle: quePasoResumen,
              },
              {
                fecha: `${sol.fecha} 09:15`,
                actor: `${sol.coordinador} (Coordinador SINARP)`,
                accion: "Vinculación y envío de solicitud a fuente",
                detalle: `Se asoció el servicio "${sol.servicioPrincipal}" (${sol.fuentePrincipal}) al proyecto ${proyecto.id}.`,
              },
            ];

      return {
        id: sol.id,
        fuentePrincipal: sol.fuentePrincipal,
        servicioPrincipal: sol.servicioPrincipal,
        estado: estadoActual,
        fecha: sol.fecha,
        ultimaActualizacion: match?.ultimaActualizacion || sol.fecha,
        camposCount: match?.camposCount || sol.camposCount || 6,
        accesiblesCount,
        confidencialesCount,
        sensiblesCount,
        modalidad: match?.modalidad || "Consumo permanente",
        coordinador: match?.responsable || sol.coordinador || proyecto.creadoPor,
        etapaActual,
        quePasoResumen,
        ultimoActor,
        trazabilidad,
      };
    });
  }, [proyecto, storeSolicitudes]);

  const resumenEstados = useMemo(() => {
    let habilitadas = 0;
    let enRevision = 0;
    let observadasRechazadas = 0;
    const fuentesUnicas = new Set<string>();

    solicitudesEnriquecidas.forEach((s) => {
      fuentesUnicas.add(s.fuentePrincipal);
      const est = s.estado.toLowerCase();
      if (est === "acceso generado" || est === "aprobada") {
        habilitadas += 1;
      } else if (est === "observada" || est === "rechazada") {
        observadasRechazadas += 1;
      } else {
        enRevision += 1;
      }
    });

    return {
      total: solicitudesEnriquecidas.length,
      habilitadas,
      enRevision,
      observadasRechazadas,
      fuentesCount: fuentesUnicas.size,
      fuentesLista: Array.from(fuentesUnicas),
    };
  }, [solicitudesEnriquecidas]);

  const breadcrumbs = useMemo(() => {
    return [
      { label: "Gestión de proyectos", href: "/proyectos" },
      { label: proyecto ? `Expediente ${proyecto.id}` : id },
    ];
  }, [proyecto, id]);

  const handleCopyId = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!proyecto) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(proyecto.id);
      setCopiedId(true);
      toast.success(`Código ${proyecto.id} copiado al portapapeles`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleSolicitarAcceso = () => {
    if (!proyecto) return;
    const url = `/acceso-interoperabilidad/solicitudes/nueva?proyectoId=${encodeURIComponent(
      proyecto.id
    )}&proyectoNombre=${encodeURIComponent(proyecto.nombre)}`;
    router.push(url);
  };

  const getBadgePorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "acceso generado":
      case "aprobada":
        return (
          <Badge tone="success" appearance="solid" size="sm" className="font-semibold text-xs">
            <CheckCircle2 className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "en revisión":
      case "en proceso":
        return (
          <Badge tone="info" appearance="solid" size="sm" className="font-semibold text-xs">
            <Clock className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "por revisar":
      case "pendiente":
        return (
          <Badge tone="warning" appearance="solid" size="sm" className="font-semibold text-xs">
            <AlertCircle className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "observada":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-xs">
            <AlertCircle className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "rechazada":
        return (
          <Badge tone="danger" appearance="solid" size="sm" className="font-semibold text-xs">
            <XCircle className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-xs">
            {estado}
          </Badge>
        );
    }
  };

  const cantSolicitudes = solicitudesEnriquecidas.length;
  const cantVersiones = proyecto?.historialVersiones ? proyecto.historialVersiones.length : 1;

  return (
    <WireframeDashboardLayout
      activeMenu="proyectos"
      currentUser={coordinadorUser}
      breadcrumbs={breadcrumbs}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal Unificado */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* 1. Barra de Encabezado Superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70 w-full">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 mt-0.5 cursor-pointer"
                      aria-label="Volver a Gestión de proyectos"
                    >
                      <Link href="/proyectos">
                        <ArrowLeft className="size-4" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Volver a Gestión de proyectos
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold cursor-pointer hover:bg-primary/15 transition-colors"
                    title="Clic para copiar código del proyecto"
                  >
                    <span>{proyecto?.id || id}</span>
                    {copiedId ? (
                      <Check className="size-3 text-success shrink-0" />
                    ) : (
                      <Copy className="size-3 opacity-70 shrink-0" />
                    )}
                  </div>

                  <Badge
                    tone="success"
                    appearance="soft"
                    size="sm"
                    className="font-bold gap-1.5 px-2.5 py-0.5 text-xs h-6"
                  >
                    <span className="size-1.5 rounded-full bg-success"></span>
                    EXPEDIENTE ACTIVO
                  </Badge>

                  <Badge
                    tone={cantSolicitudes > 0 ? "info" : "warning"}
                    appearance="soft"
                    size="sm"
                    className="font-bold text-xs h-6"
                  >
                    {cantSolicitudes > 0
                      ? `${cantSolicitudes} ${cantSolicitudes === 1 ? "solicitud a fuente asociada" : "solicitudes a fuentes asociadas"}`
                      : "Sin solicitudes a fuentes"}
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
                  {proyecto ? proyecto.nombre : "Expediente del proyecto"}
                </h1>

                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary shrink-0" />
                  <span>{proyecto?.institucion || "Entidad responsable"}</span>
                </p>
              </div>
            </div>

            {/* Acciones de Cabecera */}
            {proyecto && (
              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center sm:ml-auto">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  leftIcon={<Pencil className="size-3.5" />}
                  className="font-semibold cursor-pointer"
                >
                  Editar proyecto
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSolicitarAcceso}
                        leftIcon={<Plus className="size-4" />}
                        className="font-semibold shadow-xs cursor-pointer"
                      >
                        Nueva solicitud a fuente
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="max-w-xs text-xs font-normal">
                      Asociar una nueva solicitud de acceso a fuentes del Catálogo Nacional a este proyecto
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          {/* Estado de Carga o No Encontrado */}
          {!isLoaded ? (
            <div className="py-24 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Clock className="size-6 animate-spin text-primary" />
              <span>Cargando expediente del proyecto institucional...</span>
            </div>
          ) : !proyecto ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl border border-dashed border-border bg-muted/10 space-y-4">
              <div className="size-14 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                <FileQuestion className="size-8" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-lg font-heading font-bold text-foreground">
                  Proyecto no encontrado
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  No se encontró ningún proyecto institucional con el código{" "}
                  <code className="text-primary font-mono font-semibold">{id}</code>. Verifica el identificador en la bandeja general.
                </p>
              </div>
              <Button asChild variant="primary" size="sm">
                <Link href="/proyectos">Volver a Gestión de proyectos</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Navegación por Subtabs Organizada */}
              <div className="w-full -mt-2 mb-1">
                <Tabs
                  value={activeTab}
                  onValueChange={(val) => setActiveTab(val as TabKey)}
                  className="w-full"
                >
                  <TabsList className="h-auto p-1.5 rounded-full bg-background border border-border/50 inline-flex gap-1.5 flex-nowrap w-full sm:w-auto justify-start overflow-x-auto shadow-2xs">
                    <TabsTrigger
                      value="info"
                      className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap cursor-pointer shadow-none data-[state=active]:shadow-xs"
                    >
                      <FileText className="size-4 shrink-0" />
                      <span>Resumen del expediente</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="solicitudes"
                      className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap cursor-pointer shadow-none data-[state=active]:shadow-xs"
                    >
                      <Network className="size-4 shrink-0" />
                      <span>Solicitudes a fuentes y seguimiento</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors",
                          activeTab === "solicitudes"
                            ? "bg-white/25 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cantSolicitudes}
                      </span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="trazabilidad"
                      className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap cursor-pointer shadow-none data-[state=active]:shadow-xs"
                    >
                      <History className="size-4 shrink-0" />
                      <span>Trazabilidad y versiones</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors",
                          activeTab === "trazabilidad"
                            ? "bg-white/25 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cantVersiones + cantSolicitudes}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* =====================================================================
                  PESTAÑA 1: RESUMEN DEL EXPEDIENTE (Visión general + ¿Qué pasó con las fuentes?)
                 ===================================================================== */}
              {activeTab === "info" && (
                <div className="space-y-5 pt-1">
                  {/* Contenedor 1: Indicadores Clave del Expediente */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <Layers className="size-4 text-primary" />
                          Indicadores generales del expediente
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Estado general del proyecto, fuentes de datos asociadas y versión institucional vigente.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
                      {/* Card 1: Identificador */}
                      <Card
                        variant="featured"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: el ID y la entidad son inmutables por normativa.");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toast.info("Esta información no se puede cambiar: el ID y la entidad son inmutables por normativa.");
                          }
                        }}
                        className={cn(
                          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-2xl outline-none select-none p-4 w-full",
                          "hover:-translate-y-0.5 hover:shadow-md",
                          "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
                        )}
                        innerClassName="p-0 h-full"
                      >
                        <div className="flex flex-col justify-between h-full gap-3 w-full">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                              <Lock className="size-5" />
                            </div>
                            <Badge
                              tone="neutral"
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                            >
                              Inmutable
                            </Badge>
                          </div>
                          <div className="text-left w-full space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Código de expediente
                            </p>
                            <p className="text-lg sm:text-xl font-extrabold font-mono text-primary leading-tight tracking-tight">
                              {proyecto.id}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate pt-0.5" title={proyecto.institucion}>
                              {proyecto.institucion}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Card 2: Solicitudes a fuentes asociadas */}
                      <Card
                        variant="featured"
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveTab("solicitudes")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveTab("solicitudes");
                          }
                        }}
                        className={cn(
                          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-2xl outline-none select-none p-4 w-full",
                          "hover:-translate-y-0.5 hover:shadow-md",
                          cantSolicitudes > 0
                            ? "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
                            : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                        )}
                        innerClassName="p-0 h-full"
                      >
                        <div className="flex flex-col justify-between h-full gap-3 w-full">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div
                              className={cn(
                                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                                cantSolicitudes > 0
                                  ? "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                                  : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                              )}
                            >
                              <Network className="size-5" />
                            </div>
                            <Badge
                              tone={cantSolicitudes > 0 ? "success" : "warning"}
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                            >
                              {cantSolicitudes > 0
                                ? `${resumenEstados.habilitadas} habilitada(s)`
                                : "Sin solicitudes"}
                            </Badge>
                          </div>
                          <div className="text-left w-full space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Solicitudes a fuentes
                            </p>
                            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                              {cantSolicitudes}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                              {cantSolicitudes > 0
                                ? `${resumenEstados.fuentesCount} fuente(s) · ${resumenEstados.enRevision} en revisión`
                                : "Aún no se asocian fuentes"}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Card 3: Versión Vigente */}
                      <Card
                        variant="featured"
                        role="button"
                        tabIndex={0}
                        onClick={() => setActiveTab("trazabilidad")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setActiveTab("trazabilidad");
                          }
                        }}
                        className={cn(
                          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-2xl outline-none select-none p-4 w-full",
                          "hover:-translate-y-0.5 hover:shadow-md",
                          "bg-secondary/5 hover:bg-secondary/10 border-secondary/25 shadow-2xs"
                        )}
                        innerClassName="p-0 h-full"
                      >
                        <div className="flex flex-col justify-between h-full gap-3 w-full">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-secondary/15 text-secondary group-hover:scale-105 group-hover:bg-secondary group-hover:text-white">
                              <GitBranch className="size-5" />
                            </div>
                            <Badge
                              tone={proyecto.version > 1 ? "secondary" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                            >
                              {proyecto.version > 1 ? "Modificado" : "Inicial"}
                            </Badge>
                          </div>
                          <div className="text-left w-full space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Versión Vigente
                            </p>
                            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                              v{proyecto.version}.0
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                              {cantVersiones} {cantVersiones === 1 ? "registro histórico" : "versiones registradas"}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Card 4: Fecha de Alta */}
                      <Card
                        variant="featured"
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: la fecha de registro original es histórica.");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toast.info("Esta información no se puede cambiar: la fecha de registro original es histórica.");
                          }
                        }}
                        className={cn(
                          "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-2xl outline-none select-none p-4 w-full",
                          "hover:-translate-y-0.5 hover:shadow-md",
                          "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
                        )}
                        innerClassName="p-0 h-full"
                      >
                        <div className="flex flex-col justify-between h-full gap-3 w-full">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <div className="size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white">
                              <Calendar className="size-5" />
                            </div>
                            <Badge
                              tone="neutral"
                              appearance="soft"
                              size="sm"
                              className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                            >
                              Histórico
                            </Badge>
                          </div>
                          <div className="text-left w-full space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Fecha de Alta
                            </p>
                            <p className="text-lg sm:text-xl font-bold font-mono text-foreground leading-tight tracking-tight">
                              {proyecto.fechaCreacion.split(" ")[0]}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate pt-0.5" title={`Registrado por ${proyecto.creadoPor}`}>
                              Registrado por {proyecto.creadoPor}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Card>

                  {/* Contenedor 2 (NUEVO): Panorama general de Solicitudes a Fuentes Asociadas y ¿Qué pasó? */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                            <Activity className="size-4 text-primary" />
                            Estado general de solicitudes a fuentes asociadas
                          </h3>
                          <Badge
                            tone={cantSolicitudes > 0 ? "primary" : "warning"}
                            appearance="soft"
                            size="sm"
                            className="text-xs font-bold"
                          >
                            {cantSolicitudes > 0
                              ? `${cantSolicitudes} ${cantSolicitudes === 1 ? "trámite vinculado" : "trámites vinculados"}`
                              : "Sin trámites asociados"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Resumen ejecutivo de las fuentes del Catálogo Nacional asociadas a este proyecto, su estado actual y qué ocurrió en la última actuación.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cantSolicitudes > 0 && (
                          <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={() => setActiveTab("solicitudes")}
                            rightIcon={<ArrowRight className="size-3.5" />}
                            className="text-xs font-semibold cursor-pointer"
                          >
                            Ver pestaña de solicitudes
                          </Button>
                        )}
                      </div>
                    </div>

                    {cantSolicitudes === 0 ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-warning/50 bg-warning/5">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0 mt-0.5">
                            <AlertCircle className="size-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-heading font-bold text-foreground">
                              Este proyecto aún no tiene solicitudes a fuentes asociadas
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              El proyecto institucional está creado y activo, pero todavía no se ha vinculado ninguna solicitud de acceso a datos del Catálogo Nacional de Interoperabilidad.
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleSolicitarAcceso}
                          leftIcon={<Plus className="size-4" />}
                          className="shrink-0 font-semibold cursor-pointer"
                        >
                          Asociar primera solicitud
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Cinta de resumen rápido por resultado */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-semibold text-muted-foreground block">
                                Con acceso generado / aprobadas
                              </span>
                              <span className="text-xs font-bold text-foreground">
                                Consumo técnico habilitado
                              </span>
                            </div>
                            <Badge tone="success" appearance="solid" size="md" className="font-mono font-bold">
                              {resumenEstados.habilitadas}
                            </Badge>
                          </div>

                          <div className="p-3 rounded-xl border border-info/30 bg-info/5 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-semibold text-muted-foreground block">
                                En revisión / por revisar
                              </span>
                              <span className="text-xs font-bold text-foreground">
                                Evaluación DINARP / DPI
                              </span>
                            </div>
                            <Badge tone="info" appearance="solid" size="md" className="font-mono font-bold">
                              {resumenEstados.enRevision}
                            </Badge>
                          </div>

                          <div className="p-3 rounded-xl border border-border/80 bg-surface-subtle/60 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-semibold text-muted-foreground block">
                                Observadas / rechazadas
                              </span>
                              <span className="text-xs font-bold text-foreground">
                                Requieren atención o archivo
                              </span>
                            </div>
                            <Badge
                              tone={resumenEstados.observadasRechazadas > 0 ? "danger" : "neutral"}
                              appearance={resumenEstados.observadasRechazadas > 0 ? "solid" : "soft"}
                              size="md"
                              className="font-mono font-bold"
                            >
                              {resumenEstados.observadasRechazadas}
                            </Badge>
                          </div>
                        </div>

                        {/* Lista general de "¿Qué pasó con cada solicitud vinculada?" */}
                        <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
                          <Table>
                            <TableHeader className="bg-surface-subtle/80">
                              <TableRow>
                                <TableHead className="text-xs font-bold w-[140px]">Solicitud</TableHead>
                                <TableHead className="text-xs font-bold">Fuente y servicio asociado</TableHead>
                                <TableHead className="text-xs font-bold w-[160px]">Estado actual</TableHead>
                                <TableHead className="text-xs font-bold">¿Qué pasó? · Etapa y última actuación</TableHead>
                                <TableHead className="text-xs font-bold text-right w-[130px]">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {solicitudesEnriquecidas.map((sol) => (
                                <TableRow key={sol.id} className="hover:bg-muted/30 transition-colors">
                                  <TableCell className="align-top py-3.5">
                                    <Link
                                      href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}
                                      className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                      <span>{sol.id}</span>
                                      <ExternalLink className="size-3 opacity-70" />
                                    </Link>
                                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                                      Radicada: {sol.fecha}
                                    </span>
                                  </TableCell>

                                  <TableCell className="align-top py-3.5">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                        <Database className="size-3.5 text-primary shrink-0" />
                                        <span>{sol.fuentePrincipal}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground leading-snug">
                                        {sol.servicioPrincipal}
                                      </p>
                                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                        <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                                          {sol.camposCount} campos
                                        </Badge>
                                        {sol.confidencialesCount > 0 && (
                                          <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                                            {sol.confidencialesCount} confidenciales
                                          </Badge>
                                        )}
                                        {sol.sensiblesCount > 0 && (
                                          <Badge tone="danger" appearance="solid" size="sm" className="text-[10px]">
                                            {sol.sensiblesCount} sensible · LOPDP
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>

                                  <TableCell className="align-top py-3.5">
                                    {getBadgePorEstado(sol.estado)}
                                  </TableCell>

                                  <TableCell className="align-top py-3.5">
                                    <div className="space-y-1 max-w-md">
                                      <p className="text-xs font-bold text-foreground">
                                        {sol.etapaActual}
                                      </p>
                                      <p className="text-xs text-muted-foreground leading-relaxed">
                                        {sol.quePasoResumen}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground/90 flex items-center gap-1 pt-0.5">
                                        <UserCheck className="size-3 text-primary shrink-0" />
                                        <span>Actuación: <strong>{sol.ultimoActor}</strong> ({sol.ultimaActualizacion})</span>
                                      </p>
                                    </div>
                                  </TableCell>

                                  <TableCell className="align-top py-3.5 text-right">
                                    <Button
                                      asChild
                                      variant="neutral"
                                      size="sm"
                                      className="h-8 px-2.5 text-xs font-semibold gap-1.5 cursor-pointer"
                                    >
                                      <Link href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}>
                                        <Eye className="size-3.5" />
                                        <span>Ver trámite</span>
                                      </Link>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Contenedor 3: Propósito y Alcance Institucional */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-3.5">
                    <div className="pb-2 border-b border-border/60 space-y-0.5">
                      <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        Propósito y alcance institucional del proyecto
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Objetivo oficial que justifica el consumo de fuentes de interoperabilidad en DINARP.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-subtle/80 border border-border/60 text-xs sm:text-sm text-foreground leading-relaxed font-sans">
                      {proyecto.proposito}
                    </div>
                  </Card>

                  {/* Contenedor 4: Metadatos Normativos Inmutables */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
                    <div className="space-y-0.5 pb-2 border-b border-border/60">
                      <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                        <Lock className="size-4 text-muted-foreground" />
                        Metadatos normativos inmutables (Auditoría SINARP)
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Campos normativos protegidos contra modificaciones no autorizadas.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: el ID de proyecto es definitivo e inmutable.");
                        }}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold">Código del proyecto</span>
                          <Lock className="size-3" />
                        </div>
                        <div className="font-mono text-sm font-bold text-primary">
                          {proyecto.id}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Asignado automáticamente por DINARP
                        </p>
                      </div>

                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: la institución responsable es inmutable por normativa institucional.");
                        }}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold">Institución responsable</span>
                          <Lock className="size-3" />
                        </div>
                        <div className="text-sm font-bold text-foreground truncate">
                          {proyecto.institucion}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Entidad titular de la iniciativa
                        </p>
                      </div>

                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: la fecha de radicación es histórica y permanente.");
                        }}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="font-semibold">Fecha de radicación</span>
                          <Lock className="size-3" />
                        </div>
                        <div className="text-sm font-bold text-foreground">
                          {proyecto.fechaCreacion}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                          Por {proyecto.creadoPor}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* =====================================================================
                  PESTAÑA 2: SOLICITUDES A FUENTES Y SEGUIMIENTO DETALLADO
                 ===================================================================== */}
              {activeTab === "solicitudes" && (
                <div className="space-y-5 pt-1">
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <Network className="size-4 text-primary" />
                          Solicitudes a fuentes asociadas y resultado de revisión ({cantSolicitudes})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Detalle de cada fuente solicitada bajo este proyecto, clasificación de datos requeridos y qué pasó en el flujo de aprobación DINARP / DPI.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                        {cantSolicitudes > 0 && (
                          <ViewModeToggle
                            value={solicitudesViewMode}
                            onChange={setSolicitudesViewMode}
                          />
                        )}
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleSolicitarAcceso}
                          leftIcon={<Plus className="size-4" />}
                          rightIcon={<ArrowUpRight className="size-3.5" />}
                          className="font-semibold shadow-xs cursor-pointer"
                        >
                          Solicitar acceso a fuente
                        </Button>
                      </div>
                    </div>

                    {cantSolicitudes === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-border/80 bg-surface-subtle/40 space-y-4">
                        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                          <Network className="size-7" />
                        </div>
                        <div className="space-y-1.5 max-w-md">
                          <h4 className="text-base font-heading font-bold text-foreground">
                            No existen solicitudes a fuentes asociadas
                          </h4>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Este proyecto aún no registra solicitudes de acceso formalizadas. Inicia una nueva solicitud para seleccionar la institución proveedora y los campos requeridos.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={handleSolicitarAcceso}
                          leftIcon={<Plus className="size-4" />}
                          className="font-semibold shadow-xs cursor-pointer"
                        >
                          Crear primera solicitud
                        </Button>
                      </div>
                    ) : solicitudesViewMode === "table" ? (
                      <div className="rounded-xl border border-border/80 overflow-hidden bg-background">
                        <Table>
                          <TableHeader className="bg-surface-subtle/80">
                            <TableRow>
                              <TableHead className="text-xs font-bold">Código / Fecha</TableHead>
                              <TableHead className="text-xs font-bold">Fuente y Servicio</TableHead>
                              <TableHead className="text-xs font-bold">Campos y Clasificación</TableHead>
                              <TableHead className="text-xs font-bold">Estado</TableHead>
                              <TableHead className="text-xs font-bold">¿Qué pasó? · Última actuación</TableHead>
                              <TableHead className="text-xs font-bold text-right">Expediente</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {solicitudesEnriquecidas.map((sol) => (
                              <TableRow key={sol.id} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="align-top py-4">
                                  <Link
                                    href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}
                                    className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                  >
                                    <span>{sol.id}</span>
                                    <ExternalLink className="size-3 opacity-70" />
                                  </Link>
                                  <span className="text-[11px] text-muted-foreground block mt-1">
                                    Alta: {sol.fecha}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground block">
                                    Resp: {sol.coordinador}
                                  </span>
                                </TableCell>

                                <TableCell className="align-top py-4">
                                  <div className="space-y-1 max-w-xs">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                      <Database className="size-3.5 text-primary shrink-0" />
                                      <span>{sol.fuentePrincipal}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                      {sol.servicioPrincipal}
                                    </p>
                                    <span className="text-[11px] text-muted-foreground/80 block">
                                      Modalidad: {sol.modalidad}
                                    </span>
                                  </div>
                                </TableCell>

                                <TableCell className="align-top py-4">
                                  <div className="flex flex-col gap-1.5 items-start">
                                    <Badge tone="neutral" appearance="soft" size="sm" className="text-xs font-bold">
                                      {sol.camposCount} campos totales
                                    </Badge>
                                    <div className="flex flex-wrap gap-1">
                                      {sol.accesiblesCount > 0 && (
                                        <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                                          {sol.accesiblesCount} Accesibles
                                        </Badge>
                                      )}
                                      {sol.confidencialesCount > 0 && (
                                        <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                                          {sol.confidencialesCount} Confidenciales
                                        </Badge>
                                      )}
                                      {sol.sensiblesCount > 0 && (
                                        <Badge tone="danger" appearance="solid" size="sm" className="text-[10px]">
                                          {sol.sensiblesCount} Sensibles LOPDP
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell className="align-top py-4">
                                  {getBadgePorEstado(sol.estado)}
                                </TableCell>

                                <TableCell className="align-top py-4">
                                  <div className="space-y-1 max-w-sm">
                                    <p className="text-xs font-bold text-foreground">
                                      {sol.etapaActual}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {sol.quePasoResumen}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground pt-0.5">
                                      Por: <strong className="text-foreground">{sol.ultimoActor}</strong> · {sol.ultimaActualizacion}
                                    </p>
                                  </div>
                                </TableCell>

                                <TableCell className="align-top py-4 text-right">
                                  <Button
                                    asChild
                                    variant="neutral"
                                    size="sm"
                                    className="text-xs h-8 px-3 font-semibold gap-1.5 cursor-pointer"
                                  >
                                    <Link href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}>
                                      <Eye className="size-3.5" />
                                      <span>Ver expediente</span>
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      /* Vista en Cards usando InteractiveCard y Button del UI Kit */
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {solicitudesEnriquecidas.map((sol) => (
                          <InteractiveCard
                            key={sol.id}
                            className="p-5 rounded-2xl border border-border/80 bg-surface flex flex-col justify-between gap-4 shadow-xs"
                          >
                            <div className="space-y-3.5">
                              {/* Cabecera: Código + Estado */}
                              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/60">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Solicitud de acceso vinculada
                                  </span>
                                  <Link
                                    href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}
                                    className="font-mono text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
                                  >
                                    <span>{sol.id}</span>
                                    <ExternalLink className="size-3.5 opacity-60" />
                                  </Link>
                                </div>
                                <div>{getBadgePorEstado(sol.estado)}</div>
                              </div>

                              {/* Fuente y Servicio */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Fuente proveedora
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                    <Database className="size-3.5 text-primary shrink-0" />
                                    <span className="truncate" title={sol.fuentePrincipal}>
                                      {sol.fuentePrincipal}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Servicio consumido
                                  </span>
                                  <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug" title={sol.servicioPrincipal}>
                                    {sol.servicioPrincipal}
                                  </p>
                                </div>
                              </div>

                              {/* Clasificación de campos solicitados */}
                              <div className="flex items-center justify-between gap-2 flex-wrap px-3 py-2 rounded-xl bg-muted/40 border border-border/50">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  Alcance de datos ({sol.camposCount} campos):
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {sol.accesiblesCount > 0 && (
                                    <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                                      {sol.accesiblesCount} Accesibles
                                    </Badge>
                                  )}
                                  {sol.confidencialesCount > 0 && (
                                    <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                                      {sol.confidencialesCount} Confidenciales
                                    </Badge>
                                  )}
                                  {sol.sensiblesCount > 0 && (
                                    <Badge tone="danger" appearance="solid" size="sm" className="text-[10px]">
                                      {sol.sensiblesCount} Sensible · LOPDP
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Bloque Destacado: ¿Qué pasó con esta solicitud? */}
                              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/25 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                                    <Activity className="size-3" />
                                    ¿Qué pasó? · Estado y resolución
                                  </span>
                                  <span className="text-[11px] font-mono text-muted-foreground">
                                    {sol.ultimaActualizacion}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-foreground">
                                  {sol.etapaActual}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {sol.quePasoResumen}
                                </p>
                                <p className="text-[11px] text-muted-foreground pt-0.5 flex items-center gap-1">
                                  <UserCheck className="size-3 text-primary shrink-0" />
                                  <span>Responsable de actuación: <strong className="text-foreground">{sol.ultimoActor}</strong></span>
                                </p>
                              </div>
                            </div>

                            {/* Pie de tarjeta con botones del UI Kit */}
                            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
                                <span>Radicada: {sol.fecha}</span>
                              </div>
                              <Button
                                asChild
                                variant="neutral"
                                size="sm"
                                className="text-xs h-8 px-3 font-semibold gap-1.5 cursor-pointer"
                              >
                                <Link href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}>
                                  <Eye className="size-3.5" />
                                  <span>Ver expediente de solicitud</span>
                                </Link>
                              </Button>
                            </div>
                          </InteractiveCard>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* =====================================================================
                  PESTAÑA 3: TRAZABILIDAD DE SOLICITUDES E HISTORIAL DE VERSIONES
                 ===================================================================== */}
              {activeTab === "trazabilidad" && (
                <div className="space-y-5 pt-1">
                  {/* Bloque 1: Hitos de Solicitudes a Fuentes Asociadas */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <Network className="size-4 text-primary" />
                          Bitácora de actuaciones en solicitudes a fuentes ({cantSolicitudes})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Seguimiento cronológico de qué ocurrió con cada solicitud de acceso a datos vinculada a este proyecto.
                        </p>
                      </div>
                    </div>

                    {cantSolicitudes === 0 ? (
                      <p className="text-xs text-muted-foreground py-4">
                        No se registran eventos de solicitudes porque el proyecto aún no tiene fuentes vinculadas.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {solicitudesEnriquecidas.map((sol) => (
                          <div
                            key={sol.id}
                            className="p-4 rounded-xl border border-border/80 bg-surface-subtle/50 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                              <div>
                                <Link
                                  href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}
                                  className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <span>{sol.id}</span>
                                  <ExternalLink className="size-3" />
                                </Link>
                                <p className="text-xs font-semibold text-foreground mt-0.5">
                                  {sol.fuentePrincipal} · {sol.servicioPrincipal}
                                </p>
                              </div>
                              {getBadgePorEstado(sol.estado)}
                            </div>

                            <div className="space-y-2.5 pl-2 border-l-2 border-primary/30">
                              {sol.trazabilidad.slice(0, 3).map((ev, idx) => (
                                <div key={idx} className="space-y-0.5">
                                  <div className="flex items-center justify-between gap-2 text-[11px]">
                                    <span className="font-bold text-foreground">{ev.accion}</span>
                                    <span className="font-mono text-muted-foreground">{ev.fecha}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">
                                    {ev.actor}
                                  </p>
                                  {ev.detalle && (
                                    <p className="text-xs text-muted-foreground/90 leading-snug">
                                      {ev.detalle}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Bloque 2: Historial de Versiones del Proyecto */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <History className="size-4 text-primary" />
                          Historial de versiones del proyecto ({cantVersiones})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Registro cronológico inmutable de cada versión generada para este proyecto institucional bajo normativa SINARP.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="neutral"
                        size="sm"
                        onClick={() => setIsEditDialogOpen(true)}
                        leftIcon={<Pencil className="size-3.5" />}
                        className="text-xs font-semibold cursor-pointer h-8"
                      >
                        Crear nueva versión
                      </Button>
                    </div>

                    {/* Timeline Vertical de Versiones */}
                    <div className="relative pl-1 sm:pl-3 space-y-7">
                      {proyecto.historialVersiones.map((v, index) => {
                        const esVigente = v.version === proyecto.version;
                        const isLast = index === proyecto.historialVersiones.length - 1;
                        const isInitial = v.version === 1;

                        return (
                          <div key={v.version} className="relative flex gap-3.5 sm:gap-5">
                            <div className="relative flex flex-col items-center shrink-0">
                              <div
                                className={cn(
                                  "relative z-10 flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-full border bg-surface transition-all shadow-xs",
                                  esVigente
                                    ? "border-primary bg-primary/10 text-primary ring-4 ring-primary/20"
                                    : "border-border/80 bg-surface-subtle text-muted-foreground"
                                )}
                              >
                                {esVigente && (
                                  <span className="absolute -top-1 -right-1 flex size-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-success" />
                                    <span className="relative inline-flex rounded-full size-3 bg-success" />
                                  </span>
                                )}
                                {isInitial ? (
                                  <Sparkles className={cn("size-4 sm:size-4.5", esVigente ? "text-primary" : "text-muted-foreground")} />
                                ) : (
                                  <GitBranch className={cn("size-4 sm:size-4.5", esVigente ? "text-primary" : "text-muted-foreground")} />
                                )}
                              </div>

                              {!isLast && (
                                <div className="absolute top-11 bottom-[-28px] left-1/2 w-0.5 -translate-x-1/2 bg-border/80 dark:bg-border/60" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <Card
                                className={cn(
                                  "rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all shadow-xs",
                                  esVigente
                                    ? "border-primary/40 bg-surface ring-1 ring-primary/20 shadow-xs"
                                    : "border-border/70 bg-surface-subtle/50 hover:border-border"
                                )}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-border/50">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                      tone={esVigente ? "primary" : "neutral"}
                                      appearance={esVigente ? "solid" : "soft"}
                                      size="sm"
                                      className="font-bold text-xs px-2.5 py-0.5"
                                    >
                                      Versión v{v.version}.0
                                    </Badge>
                                    {esVigente ? (
                                      <Badge
                                        tone="success"
                                        appearance="soft"
                                        size="sm"
                                        className="text-xs font-bold gap-1 px-2 py-0.5"
                                      >
                                        <span className="size-1.5 rounded-full bg-success"></span>
                                        Vigente oficial
                                      </Badge>
                                    ) : (
                                      <Badge
                                        tone="neutral"
                                        appearance="soft"
                                        size="sm"
                                        className="text-xs font-medium text-muted-foreground"
                                      >
                                        Histórico
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                      <Calendar className="size-3.5 text-muted-foreground/70" />
                                      {v.fecha}
                                    </span>
                                  </div>

                                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <span>Modificado por:</span>
                                    <strong className="text-foreground font-semibold">{v.modificadoPor}</strong>
                                  </div>
                                </div>

                                {v.motivo && (
                                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                      Motivo o justificación de trazabilidad
                                    </span>
                                    <p className="text-xs font-medium text-foreground italic leading-relaxed">
                                      &ldquo;{v.motivo}&rdquo;
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                      Nombre institucional registrado
                                    </span>
                                    <div className="text-xs font-bold text-foreground">
                                      {v.nombre}
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                      Propósito y alcance registrado
                                    </span>
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                      {v.proposito}
                                    </p>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </Card>
      </main>

      {/* Modales de Edición y Trazabilidad */}
      {proyecto && (
        <>
          <EditarProyectoDialog
            proyecto={proyecto}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            coordinadorNombre={coordinadorNombre}
            onProyectoActualizado={() => {
              setActiveTab("trazabilidad");
            }}
          />

          <TrazabilidadProyectoDialog
            proyecto={proyecto}
            open={isTrazabilidadDialogOpen}
            onOpenChange={setIsTrazabilidadDialogOpen}
          />
        </>
      )}
    </WireframeDashboardLayout>
  );
}
