"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
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
  Hash,
  Copy,
  Check,
  Pencil,
  History,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Info,
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
} from "lucide-react";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";
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

export function ProyectoDetailView({ id: idProp, params }: ProyectoDetailViewProps) {
  const router = useRouter();
  const routeParams = useParams();

  // Resolver id de forma robusta
  const resolvedParams = params ? (params instanceof Promise ? React.use(params) : params) : null;
  const id = idProp || resolvedParams?.id || (routeParams?.id as string) || "";

  const { activeUser } = useAuthStore();
  const { getProyectoById, isLoaded } = useProyectosStore();

  const coordinadorUser = activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const coordinadorNombre = coordinadorUser?.name || "Mariana Almeida";

  // Estados locales
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrazabilidadDialogOpen, setIsTrazabilidadDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const proyecto = useMemo(() => {
    return getProyectoById(id);
  }, [getProyectoById, id]);

  const breadcrumbs = useMemo(() => {
    return [
      { label: "Proyectos institucionales", href: "/proyectos" },
      { label: proyecto ? proyecto.id : id },
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
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-xs">
            {estado}
          </Badge>
        );
    }
  };

  const cantSolicitudes = proyecto?.solicitudes ? proyecto.solicitudes.length : 0;
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
                      variant="outline"
                      size="sm"
                      className="size-9 p-0 shrink-0 mt-0.5 rounded-xl border-border/80"
                    >
                      <Link href="/proyectos">
                        <ArrowLeft className="size-4 text-foreground" />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Volver a la bandeja de proyectos
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
                    ACTIVO
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
                  {proyecto ? proyecto.nombre : "Detalle del proyecto"}
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
                        Nueva solicitud
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="end" className="max-w-xs text-xs font-normal">
                      Te llevará al formulario de solicitud de acceso a interoperabilidad vinculado a este proyecto
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
              <span>Cargando información del proyecto institucional...</span>
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
                <Link href="/proyectos">Volver a proyectos institucionales</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Navegación por Subtabs con Color Principal */}
              <div className="w-full -mt-2 mb-2">
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
                      <span>Información y metadatos</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="solicitudes"
                      className="px-5 py-2 text-xs font-bold gap-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:[&_svg]:text-white whitespace-nowrap cursor-pointer shadow-none data-[state=active]:shadow-xs"
                    >
                      <Network className="size-4 shrink-0" />
                      <span>Solicitudes vinculadas</span>
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
                      <span>Historial de versiones</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors",
                          activeTab === "trazabilidad"
                            ? "bg-white/25 text-white"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cantVersiones}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* 2. Contenido Dinámico: Pestaña 1 (Información y metadatos) */}
              {activeTab === "info" && (
                <div className="space-y-5 pt-1">
                  {/* Contenedor 1: Indicadores y Métricas Clave */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <Layers className="size-4 text-primary" />
                          Indicadores clave del proyecto
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Parámetros vigentes, estado de versionamiento y volumen de trámites vinculados.
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
                              Identificador
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

                      {/* Card 2: Versión Vigente */}
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

                      {/* Card 3: Solicitudes */}
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
                              {cantSolicitudes > 0 ? "Vinculadas" : "Sin solicitudes"}
                            </Badge>
                          </div>
                          <div className="text-left w-full space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground">
                              Solicitudes
                            </p>
                            <p className="text-xl sm:text-2xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                              {cantSolicitudes}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate pt-0.5">
                              Intercambio de datos formalizado
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

                  {/* Contenedor 2: Marco Normativo de Integridad SINARP */}
                  <Card className="p-5 sm:p-6 rounded-2xl border border-primary/25 bg-primary/5 shadow-xs flex items-start gap-3.5">
                    <ShieldAlert className="size-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                      <h4 className="text-sm font-heading font-bold text-foreground">
                        Reglas institucionales de integridad del proyecto (SINARP)
                      </h4>
                      <p>
                        El identificador <code className="font-mono text-primary font-bold">{proyecto.id}</code> y la entidad responsable (<strong>{proyecto.institucion}</strong>) son inmutables y de solo lectura. Para registrar cambios en la denominación o alcance del proyecto, utiliza la opción <strong>Crear nueva versión</strong> desde la pestaña de <em>Historial de versiones</em> con su debida justificación de trazabilidad.
                      </p>
                    </div>
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
                        Campos normativos protegidos contra modificaciones no autorizadas. Haz clic en cada campo para consultar el detalle.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {/* Campo 1: Código ID */}
                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: el ID de proyecto es definitivo e inmutable.");
                        }}
                        title="Campo de solo lectura. No se puede modificar."
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

                      {/* Campo 2: Institución Responsable */}
                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: la institución responsable es inmutable por normativa institucional.");
                        }}
                        title="Campo de solo lectura. No se puede modificar."
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

                      {/* Campo 3: Registro Histórico */}
                      <div
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/60 transition-colors cursor-not-allowed group"
                        onClick={() => {
                          toast.info("Esta información no se puede cambiar: la fecha de radicación es histórica y permanente.");
                        }}
                        title="Campo de solo lectura. No se puede modificar."
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

              {/* 3. Contenido Dinámico: Pestaña 2 (Solicitudes vinculadas) */}
              {activeTab === "solicitudes" && (
                <div className="space-y-5 pt-1">
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <Network className="size-4 text-primary" />
                          Solicitudes de acceso a datos vinculadas ({cantSolicitudes})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Cada solicitud formalizada que consume datos del Catálogo Nacional de Interoperabilidad bajo este proyecto.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSolicitarAcceso}
                        leftIcon={<Plus className="size-4" />}
                        rightIcon={<ArrowUpRight className="size-3.5" />}
                        className="font-semibold shadow-xs cursor-pointer"
                      >
                        Solicitar acceso a datos
                      </Button>
                    </div>

                    {cantSolicitudes === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl border border-dashed border-border/80 bg-surface-subtle/40 space-y-4">
                        <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                          <Network className="size-7" />
                        </div>
                        <div className="space-y-1.5 max-w-md">
                          <h4 className="text-base font-heading font-bold text-foreground">
                            No existen solicitudes vinculadas
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
                    ) : (
                      /* Cada solicitud dentro de su propio contenedor */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proyecto.solicitudes.map((sol) => (
                          <Card
                            key={sol.id}
                            className="bg-surface rounded-2xl border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-sm transition-all p-5 flex flex-col justify-between gap-4"
                          >
                            <div className="space-y-3.5">
                              {/* Cabecera de la tarjeta: Código y Estado */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                    Código de trámite
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

                              {/* Contenedor 1: Fuente proveedora */}
                              <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                  Fuente de interoperabilidad
                                </span>
                                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                  <Database className="size-3.5 text-primary shrink-0" />
                                  <span className="truncate">{sol.fuentePrincipal}</span>
                                </div>
                              </div>

                              {/* Contenedor 2: Servicio / Finalidad */}
                              <div className="p-3 rounded-xl bg-surface-subtle/80 border border-border/50 space-y-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                                  Servicio / Finalidad autorizada
                                </span>
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {sol.servicioPrincipal}
                                </p>
                              </div>
                            </div>

                            {/* Pie de la tarjeta: Fecha y Acción */}
                            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" />
                                <span>{sol.fecha}</span>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-xs h-8 px-3 font-semibold gap-1.5 hover:text-primary hover:border-primary/50 cursor-pointer"
                              >
                                <Link href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}>
                                  <Eye className="size-3.5" />
                                  <span>Ver expediente</span>
                                </Link>
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* 4. Contenido Dinámico: Pestaña 3 (Historial de versiones) */}
              {activeTab === "trazabilidad" && (
                <div className="space-y-5 pt-1">
                  <Card className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-6">
                    {/* Cabecera del Contenedor de Trazabilidad */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                      <div className="space-y-0.5">
                        <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                          <History className="size-4 text-primary" />
                          Historial de cambios y control de versiones ({cantVersiones})
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Registro cronológico inmutable de cada versión generada para este proyecto institucional bajo normativa SINARP.
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditDialogOpen(true)}
                        leftIcon={<Pencil className="size-3.5" />}
                        className="text-xs font-semibold cursor-pointer h-8 shadow-2xs"
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
                            {/* Columna Izquierda: Nodo y Línea Conectora */}
                            <div className="relative flex flex-col items-center shrink-0">
                              {/* Nodo del Timeline */}
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

                              {/* Línea Conectora Vertical */}
                              {!isLast && (
                                <div className="absolute top-11 bottom-[-28px] left-1/2 w-0.5 -translate-x-1/2 bg-border/80 dark:bg-border/60" />
                              )}
                            </div>

                            {/* Columna Derecha: Tarjeta de Contenido de la Versión */}
                            <div className="flex-1 min-w-0">
                              <Card
                                className={cn(
                                  "rounded-2xl border p-4 sm:p-5 space-y-3.5 transition-all shadow-xs",
                                  esVigente
                                    ? "border-primary/40 bg-surface ring-1 ring-primary/20 shadow-xs"
                                    : "border-border/70 bg-surface-subtle/50 hover:border-border"
                                )}
                              >
                                {/* Cabecera de la Versión */}
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

                                {/* Motivo o Justificación del Cambio si existe */}
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

                                {/* Contenedores de Información Registrada en esta Versión */}
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
