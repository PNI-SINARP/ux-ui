"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useFuentesStore } from "../data/fuentes-store";
import { EstadoFuente, FuenteDatos } from "../data/fuentes-data";
import { FuenteTrazabilidadStepper } from "../components/fuente-trazabilidad-stepper";
import { FuenteObservacionesAlert } from "../components/fuente-observaciones-alert";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import { PrepararNuevaVersionDialog } from "../components/preparar-nueva-version-dialog";
import { SolicitarBajaDialog } from "../components/solicitar-baja-dialog";
import { FuenteFormDialog } from "../components/fuente-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  Copy,
  Edit,
  RotateCcw,
  Cpu,
  Info,
  FileText,
  Activity,
  GitFork,
  AlertOctagon,
  Wrench,
  FileEdit,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

interface FuenteDetailViewProps {
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    roleTitle?: string;
    institution?: string;
    cedula?: string;
  };
}

export function FuenteDetailView({ currentUser: propUser }: FuenteDetailViewProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { activeUser } = useAuthStore();
  const effectiveUser = propUser || activeUser;
  const roleTitle = (effectiveUser?.roleTitle || "").toLowerCase();
  const roleName = (effectiveUser?.role || "").toLowerCase();
  const isCoordinadorConsumidor =
    roleTitle.includes("consumidor") ||
    roleTitle.includes("requirente") ||
    roleName.includes("consumidor") ||
    effectiveUser?.cedula === "1712345678";

  const currentUser = propUser || (activeUser ? {
    name: activeUser.name,
    role: activeUser.roleTitle || activeUser.role,
    institution: activeUser.institution,
  } : {
    name: "Carlos Mendoza",
    role: "Coordinador SINARP",
    institution: "Dirección General de Registro Civil",
  });

  const {
    isLoaded,
    getFuenteById,
    actualizarFuente,
    crearFuente,
    corregirFuenteYReenviar,
  } = useFuentesStore();

  const [activeTab, setActiveTab] = useState("ficha");

  // Modales
  const [showPublicarDialog, setShowPublicarDialog] = useState(false);
  const [showCorregirDialog, setShowCorregirDialog] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialStep, setFormInitialStep] = useState(0);
  const [isNuevaVersionOpen, setIsNuevaVersionOpen] = useState(false);
  const [isBajaOpen, setIsBajaOpen] = useState(false);

  // Form corrección rápida
  const [correcSlaDisp, setCorrecSlaDisp] = useState<number>(99.5);
  const [correcSlaMs, setCorrecSlaMs] = useState<number>(300);
  const [correcDesc, setCorrecDesc] = useState<string>("");
  const [motivoCorreccion, setMotivoCorreccion] = useState<string>("");
  const [isSubmittingCorrec, setIsSubmittingCorrec] = useState(false);

  const fuente = getFuenteById(id);
  const coordinadorNombre = currentUser.name || "Carlos Mendoza";

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
        description: "El estado cambió a 'En revisión' para evaluación de Gestión.",
      });
    }, 600);
  };

  const handleContinuarNuevaVersion = (
    fuenteClonada: FuenteDatos,
    nuevaVersion: string,
    _tipoCambio: "MAJOR" | "MINOR" | "PATCH",
    justificacion: string
  ) => {
    const nueva = crearFuente({
      nombre: fuenteClonada.nombre,
      descripcion_fuente: fuenteClonada.descripcion_fuente,
      version_propuesta: nuevaVersion,
      id_institucion_proveedora: fuenteClonada.id_institucion_proveedora,
      institucion_proveedora_nombre: fuenteClonada.institucion_proveedora_nombre,
      id_coordinador_registrador: currentUser.name || fuenteClonada.id_coordinador_registrador,
      coordinador_nombre: currentUser.name || fuenteClonada.coordinador_nombre,
      disponibilidad_objetivo: fuenteClonada.sla_fuente.disponibilidad_objetivo,
      tiempo_maximo_respuesta_ms: fuenteClonada.sla_fuente.tiempo_maximo_respuesta_ms,
      formato_respuesta: fuenteClonada.formato_respuesta,
      tipo_dato_pruebas: fuenteClonada.tipo_dato_pruebas,
      parametros_consulta: [...fuenteClonada.parametros_consulta],
      conexion: { ...fuenteClonada.conexion },
      campos: fuenteClonada.campos.map((c) => ({ ...c })),
      enviarInmediato: false,
    });

    toast.success(`Nueva versión borrador ${nuevaVersion} creada`, {
      description: `Justificación registrada: ${justificacion}`,
    });
    setIsNuevaVersionOpen(false);
    router.push(`/proveedor/fuentes/${nueva.id}`);
  };

  const handleBajaSolicitada = (fuenteId: string, motivo: string) => {
    actualizarFuente(
      fuenteId,
      {},
      {
        actor: currentUser.name || "Coordinador Autorizado",
        rol: "Coordinador SINARP",
        accion: "Solicitud formal de baja de fuente",
        observaciones: `Solicitud de baja registrada por motivo: ${motivo}. Período de notificación de 30 días activado.`,
      }
    );
    toast.success("Solicitud de baja tramitada ante Gestión.");
    setIsBajaOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return <Badge tone="neutral" appearance="soft" size="sm">Borrador</Badge>;
      case "CONEXION_PENDIENTE":
        return <Badge tone="warning" appearance="soft" size="sm">Conexión pendiente</Badge>;
      case "PENDIENTE_HOMOLOGACION":
        return <Badge tone="warning" appearance="soft" size="sm">Pendiente de homologación (TI)</Badge>;
      case "ESQUEMA_PENDIENTE_CORRECCION":
        return <Badge tone="danger" appearance="soft" size="sm">Esquema pendiente de corrección</Badge>;
      case "CONFIGURACION":
        return <Badge tone="info" appearance="soft" size="sm">Configuración</Badge>;
      case "EN_REVISION":
        return <Badge tone="warning" appearance="soft" size="sm">En revisión de Gestión</Badge>;
      case "DEVUELTA":
        return <Badge tone="danger" appearance="soft" size="sm">Devuelta con observaciones</Badge>;
      case "APROBADA":
        return <Badge tone="success" appearance="soft" size="sm">Aprobada por Gestión</Badge>;
      case "PUBLICACION_PENDIENTE":
        return <Badge tone="warning" appearance="soft" size="sm">Publicación pendiente</Badge>;
      case "PUBLICADA":
        return <Badge tone="success" appearance="solid" size="sm">Publicada en catálogo</Badge>;
      default:
        return <Badge size="sm">{estado}</Badge>;
    }
  };

  if (!isLoaded) {
    return (
      <WireframeDashboardLayout
        activeMenu="fuentes-proveedor"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Mis fuentes", onClick: () => router.push("/proveedor/fuentes") },
          { label: "Cargando..." },
        ]}
      >
        <div className="py-20 text-center text-xs text-muted-foreground">
          Cargando expediente de la fuente...
        </div>
      </WireframeDashboardLayout>
    );
  }

  if (!fuente) {
    return (
      <WireframeDashboardLayout
        activeMenu="fuentes-proveedor"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Mis fuentes", onClick: () => router.push("/proveedor/fuentes") },
          { label: "No encontrada" },
        ]}
      >
        <main className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-6 lg:px-8 py-6">
          <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-4 shadow-xs">
            <div className="size-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
              <XCircle className="size-6" />
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground">Fuente no encontrada</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No se encontró ninguna fuente de datos con el identificador <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{id}</code>.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/proveedor/fuentes")}
              className="h-10 px-4 text-xs font-semibold gap-1.5"
            >
              <ArrowLeft className="size-4" />
              <span>Volver a Mis fuentes</span>
            </Button>
          </div>
        </main>
      </WireframeDashboardLayout>
    );
  }

  const camposIncluidos = fuente.campos.filter((c) => c.incluido);
  const esEditable = ["BORRADOR", "CONFIGURACION", "CONEXION_PENDIENTE", "ESQUEMA_PENDIENTE_CORRECCION"].includes(fuente.estado);

  return (
    <WireframeDashboardLayout
      activeMenu="fuentes-proveedor"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Mis fuentes", onClick: () => router.push("/proveedor/fuentes") },
        { label: fuente.nombre, onClick: () => router.push(`/proveedor/fuentes/${fuente.id}`) },
        { label: fuente.id },
      ]}
    >
      <main className="w-full max-w-[1600px] mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Contenedor principal estilo trámite */}
        <div className="bg-surface border border-border rounded-xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-xs space-y-6">
          {/* Barra superior con botón volver y acciones según estado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/proveedor/fuentes")}
              className="h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted shrink-0 self-start"
              title="Volver a la bandeja"
            >
              <ArrowLeft className="size-3.5" />
              <span>Volver</span>
            </Button>

            {/* Acciones de ciclo de vida del Coordinador */}
            <div className="flex flex-wrap items-center gap-2">
              {esEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormInitialStep(0);
                    setIsFormModalOpen(true);
                  }}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  <Edit className="size-3.5" />
                  <span>Editar borrador</span>
                </Button>
              )}

              {fuente.estado === "DEVUELTA" && (
                <Button
                  type="button"
                  variant="warning"
                  size="sm"
                  onClick={handleOpenCorregir}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl shadow-xs cursor-pointer"
                >
                  <Edit className="size-3.5" />
                  <span>Corregir observaciones</span>
                </Button>
              )}

              {!isCoordinadorConsumidor && fuente.estado === "APROBADA" && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPublicarDialog(true)}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl shadow-xs cursor-pointer"
                >
                  <Globe className="size-3.5" />
                  <span>Publicar versión</span>
                </Button>
              )}

              {!isCoordinadorConsumidor && fuente.estado === "PUBLICACION_PENDIENTE" && (
                <Button
                  type="button"
                  variant="warning"
                  size="sm"
                  onClick={() => setShowPublicarDialog(true)}
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl shadow-xs cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reintentar publicación</span>
                </Button>
              )}

              {!isCoordinadorConsumidor && fuente.estado === "PENDIENTE_HOMOLOGACION" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl border-border cursor-pointer"
                >
                  <Link href="/homologacion-fuentes">
                    <Cpu className="size-3.5 text-warning" />
                    <span>Ver caso en TI</span>
                  </Link>
                </Button>
              )}

              {!isCoordinadorConsumidor && fuente.estado === "PUBLICADA" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNuevaVersionOpen(true)}
                    className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl border-border text-foreground hover:bg-muted cursor-pointer"
                  >
                    <GitFork className="size-3.5" />
                    <span>Preparar nueva versión</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBajaOpen(true)}
                    className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl border-danger/30 text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <AlertOctagon className="size-3.5" />
                    <span>Solicitar baja</span>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Encabezado del expediente */}
          <div className="pb-4 border-b border-border/80">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-foreground">
                  Fuente {fuente.id} · {fuente.nombre}
                </h1>
                {getEstadoBadge(fuente.estado)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 sm:line-clamp-1">
                Registrada el {new Date(fuente.fecha_creacion).toLocaleDateString("es-EC")} · {fuente.institucion_proveedora_nombre} · Versión propuesta: <strong className="font-mono text-foreground">{fuente.version_propuesta}</strong>
                {fuente.version_api && (
                  <> · API Gateway: <strong className="font-mono text-success">{fuente.version_api}</strong></>
                )}
              </p>
            </div>
          </div>

          {/* Banner contextual de Fuente Devuelta con Observaciones */}
          {fuente.estado === "DEVUELTA" && (
            <FuenteObservacionesAlert
              fuente={fuente}
              coordinadorNombre={coordinadorNombre}
            />
          )}

          {/* Banner contextual de Pendiente de Homologación TI */}
          {fuente.estado === "PENDIENTE_HOMOLOGACION" && (
            <div className="p-4 bg-warning/10 rounded-2xl border border-warning/30 flex items-start gap-3">
              <Cpu className="size-5 text-warning shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Proceso de Homologación Técnica en Curso
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta fuente utiliza un conector que requiere certificación de laboratorio por el Equipo de TI de DINARP. El caso se encuentra registrado y en diagnóstico.
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

          {/* Banner contextual de Fallo en Publicación */}
          {fuente.estado === "PUBLICACION_PENDIENTE" && fuente.fallo_publicacion && (
            <div className="p-4 bg-danger/10 rounded-2xl border border-danger/30 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-danger shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Fallo en el despliegue de la versión API (Publicación pendiente)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Etapa: <strong>{fuente.fallo_publicacion.etapa_fallida || fuente.fallo_publicacion.etapa}</strong> · Código:{" "}
                    <code className="font-mono text-danger font-bold">
                      {fuente.fallo_publicacion.codigo_referencia || fuente.fallo_publicacion.codigo}
                    </code>
                  </p>
                  <p className="text-xs text-foreground/90 font-mono bg-background/50 p-2 rounded border border-danger/20 mt-1">
                    {fuente.fallo_publicacion.mensaje}
                  </p>
                </div>
              </div>
              {!isCoordinadorConsumidor && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPublicarDialog(true)}
                  className="gap-2 shrink-0 shadow-xs cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reintentar</span>
                </Button>
              )}
            </div>
          )}

          {/* Banner contextual de Servicio Publicado */}
          {fuente.estado === "PUBLICADA" && fuente.despliegue && (
            <div className="p-4 rounded-2xl border border-success/30 bg-success/5 shadow-xs space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="size-5 text-success" />
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Servicio Publicado y Operativo en Producción
                  </h4>
                </div>
                <Badge tone="success" appearance="solid" size="sm">
                  {fuente.despliegue.ambiente}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
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
                      title="Copiar URL"
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
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
            </div>
          )}

          {/* Navegación por pestañas estructurada estilo trámite */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
              <div className="overflow-x-auto w-full sm:w-auto -mx-1 px-1">
                <TabsList className="h-auto p-1 rounded-full bg-background border border-border/40 inline-flex gap-1 w-max sm:w-auto justify-start flex-nowrap">
                  <TabsTrigger
                    value="ficha"
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                  >
                    <FileText className="size-3.5 sm:size-4 shrink-0" />
                    <span>Ficha General y SLA</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="conexion"
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                  >
                    <Server className="size-3.5 sm:size-4 shrink-0" />
                    <span>Conexión y Seguridad</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="campos"
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                  >
                    <Layers className="size-3.5 sm:size-4 shrink-0" />
                    <span>Campos Expuestos ({camposIncluidos.length})</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="trazabilidad"
                    className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs font-bold gap-1.5 sm:gap-2 shrink-0"
                  >
                    <History className="size-3.5 sm:size-4 shrink-0" />
                    <span>Trazabilidad ({fuente.historial.length})</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span>Expediente técnico:</span>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-mono border border-border">
                  {fuente.id}
                </Badge>
              </div>
            </div>

            {/* TAB 1: FICHA GENERAL Y SLA */}
            <TabsContent value="ficha" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Propósito Funcional y Descripción */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Descripción Técnica y Propósito Institucional (PAR-07)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Finalidad técnica y justificación institucional del conjunto de datos provisto.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-foreground leading-relaxed">
                  {fuente.descripcion_fuente}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Institución proveedora:</span>
                    <span className="font-bold text-foreground text-xs line-clamp-1 mt-0.5" title={fuente.institucion_proveedora_nombre}>
                      {fuente.institucion_proveedora_nombre}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Coordinador registrador:</span>
                    <span className="font-medium text-foreground text-xs line-clamp-1 mt-0.5" title={fuente.coordinador_nombre}>
                      {fuente.coordinador_nombre}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Formato de respuesta:</span>
                    <code className="font-mono font-bold text-primary text-xs mt-0.5 block">
                      {fuente.formato_respuesta}
                    </code>
                  </div>
                </div>
              </div>

              {/* SLA y Entornos */}
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
                      Parámetros de disponibilidad, tiempo de respuesta y políticas de privacidad en sandbox.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Disponibilidad Objetivo (Uptime)
                    </span>
                    <div className="flex items-baseline gap-2 py-1">
                      <span className="font-heading font-extrabold text-2xl text-foreground">
                        {fuente.sla_fuente.disponibilidad_objetivo}%
                      </span>
                      <span className="text-[11px] text-muted-foreground">mínimo garantizado</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight pt-1 border-t border-border/40">
                      Disponibilidad del endpoint conforme al compromiso de nivel de servicio comprometido.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Tiempo Máximo de Respuesta
                    </span>
                    <div className="flex items-baseline gap-2 py-1">
                      <span className="font-heading font-extrabold text-2xl text-foreground">
                        {fuente.sla_fuente.tiempo_maximo_respuesta_ms}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">milisegundos (ms)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight pt-1 border-t border-border/40">
                      Latencia máxima tolerada antes de que el Gateway reporte degradación técnica.
                    </p>
                  </div>

                  <div className="p-4 bg-muted/20 rounded-xl border border-border/60 space-y-2 text-xs">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                      Datos en Sandbox / Pruebas
                    </span>
                    <div className="flex items-center gap-2 py-1">
                      <Badge
                        tone={fuente.tipo_dato_pruebas === "Real" ? "warning" : "success"}
                        appearance="soft"
                        size="md"
                        className="font-bold text-xs"
                      >
                        {fuente.tipo_dato_pruebas}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight pt-1 border-t border-border/40">
                      {fuente.tipo_dato_pruebas === "Real"
                        ? "Restringido para sandbox institucional; requiere certificación para producción."
                        : "Habilitado para pruebas interactivas y validaciones en ambiente sandbox institucional."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parámetros de Consulta Requeridos */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Sliders className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Parámetros de Consulta Requeridos
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Criterios de búsqueda y filtros obligatorios para invocar la fuente de información.
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    {fuente.parametros_consulta.length} parámetros configurados
                  </Badge>
                </div>

                {fuente.parametros_consulta.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                    No se configuraron parámetros de consulta específicos para esta fuente.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {fuente.parametros_consulta.map((p) => (
                      <div
                        key={p.id_parametro}
                        className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs space-y-2"
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
                          <div className="pt-1 text-[11px] text-muted-foreground font-mono">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Patrón regex:</span>
                            <code className="break-all">{p.restriccion.patron}</code>
                          </div>
                        )}
                        {p.operadores_permitidos && p.operadores_permitidos.length > 0 && (
                          <div className="pt-1 text-[11px] text-muted-foreground">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Operadores:</span>
                            <span>{p.operadores_permitidos.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: CONEXIÓN Y SEGURIDAD */}
            <TabsContent value="conexion" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Parámetros de Red y Conexión */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Server className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Configuración Técnica del Conector ({fuente.conexion.tipo_conector})
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Canal seguro de comunicación con el repositorio o API de la institución proveedora.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-success font-semibold bg-success/10 px-2.5 py-1 rounded-md border border-success/30">
                    <ShieldCheck className="size-4" />
                    <span>Cifrado KMS y Red Privada</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Tipo de Conector:
                    </span>
                    <span className="font-bold text-foreground text-xs mt-0.5 block">
                      {fuente.conexion.tipo_conector}
                    </span>
                  </div>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Usuario de Lectura:
                    </span>
                    <span className="font-mono text-foreground font-medium text-xs mt-0.5 block">
                      {fuente.conexion.usuario || "-"}
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Referencia de Secreto KMS:
                    </span>
                    <code className="font-mono text-foreground font-medium text-xs break-all mt-0.5 block">
                      {fuente.conexion.secreto_referencia || "kms://arn:aws:kms:ec-dinarp:managed-secret"}
                    </code>
                  </div>
                </div>
              </div>

              {/* Custodia Criptográfica y Red Privada */}
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
                  Los secretos y credenciales de acceso se almacenan exclusivamente en el servicio de gestión de claves criptográficas (KMS) y nunca son expuestos en texto plano en la interfaz ni transmitidos a clientes web. Todo el tráfico transcurre sobre túneles VPN dedicados con TLS v1.3 conforme al estándar de seguridad gubernamental.
                </p>
              </div>

              {/* Evidencia de Última Prueba Técnica (FUE-02) */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Evidencia Técnica de Conectividad
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Comprobación de conectividad y latencia desde la red privada DINARP.
                      </p>
                    </div>
                  </div>
                  {fuente.conexion.ultima_prueba && (
                    <div className="flex items-center gap-2">
                      <Badge tone="success" appearance="soft" size="md">
                        {fuente.conexion.ultima_prueba.latencia_ms} ms latencia
                      </Badge>
                      <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border">
                        {fuente.conexion.ultima_prueba.id_prueba}
                      </span>
                    </div>
                  )}
                </div>

                {fuente.conexion.ultima_prueba ? (
                  <div className="space-y-3">
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
                ) : (
                  <div className="bg-muted/20 rounded-xl border border-dashed border-border p-8 text-center space-y-2">
                    <AlertTriangle className="size-8 text-warning mx-auto" />
                    <p className="text-xs font-semibold text-foreground">
                      No se registra evidencia técnica de prueba para esta fuente.
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Las pruebas técnicas se ejecutan durante la fase de configuración del conector o al corregir la conexión.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: CAMPOS EXPUESTOS */}
            <TabsContent value="campos" className="space-y-6 animate-in fade-in duration-200 outline-none">
              <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/10">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <Layers className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Esquema y Catálogo de Campos Expuestos
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Estructura técnica de datos mapeada para interoperabilidad del Estado.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {camposIncluidos.length} campos totales
                    </Badge>
                    <Badge tone="success" appearance="soft" size="sm">
                      {camposIncluidos.filter((c) => c.clasificacion === "Accesible").length} accesibles
                    </Badge>
                    <Badge tone="warning" appearance="soft" size="sm">
                      {camposIncluidos.filter((c) => c.clasificacion === "Confidencial").length} confidenciales
                    </Badge>
                    {camposIncluidos.some((c) => c.clasificacion === "Confidencial" && c.es_sensible) && (
                      <Badge tone="danger" appearance="soft" size="sm" className="border border-danger/30">
                        {camposIncluidos.filter((c) => c.clasificacion === "Confidencial" && c.es_sensible).length} sensibles · LOPDP
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/20 border-b border-border text-xs flex items-center gap-2.5 text-muted-foreground">
                  <Info className="size-4 text-foreground shrink-0" />
                  <span>
                    Conforme a la normativa institucional, la clasificación de confidencialidad de cada campo corresponde a la Dirección de Gestión y Registro de DINARP para proteger datos personales sensibles.
                  </span>
                </div>

                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="border-b border-border bg-muted/30">
                        <TableHead className="text-xs font-bold text-foreground pl-6">Nombre publicado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Ruta física origen</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Tipo normalizado</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Regla de conversión</TableHead>
                        <TableHead className="text-xs font-bold text-foreground">Clasificación (Gestión)</TableHead>
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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge tone="warning" appearance="soft" size="sm">
                                  Confidencial
                                </Badge>
                                {campo.es_sensible && (
                                  <Badge tone="danger" appearance="soft" size="sm" className="border border-danger/30">
                                    Sensible · LOPDP
                                  </Badge>
                                )}
                              </div>
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

            {/* TAB 4: TRAZABILIDAD Y CICLO DE VIDA */}
            <TabsContent value="trazabilidad" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Stepper visual del ciclo de vida dentro del tab de trazabilidad */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="pb-3 border-b border-border/80">
                  <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                    Ciclo de Vida de la Fuente de Información
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Etapas del flujo de registro, homologación, validación, revisión y publicación.
                  </p>
                </div>

                <FuenteTrazabilidadStepper
                  estado={fuente.estado}
                  fuente={fuente}
                  historial={fuente.historial}
                />
              </div>

              {/* Bitácora cronológica inmutable de eventos */}
              <div className="bg-surface rounded-2xl border border-border shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <History className="size-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                        Bitácora Cronológica de Eventos e Historial (AUD-01 / BN-06)
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Registro cronológico e inmutable de dictámenes, aprobaciones y transiciones de estado.
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
                        <p className="text-[11px] text-foreground/90 bg-surface p-3 rounded-lg border border-border mt-1 leading-relaxed">
                          {evt.observaciones}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Modal para Corregir Fuente Devuelta */}
      <Dialog open={showCorregirDialog} onOpenChange={setShowCorregirDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader className="space-y-1.5 pb-2">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
                <FileEdit className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground">
                  Corregir y reenviar fuente a revisión
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Modifique los parámetros observados por Gestión antes de reenviar la fuente.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {fuente.observaciones_gestion && (
              <div className="p-3 bg-danger/10 rounded-xl border border-danger/20 text-xs space-y-1">
                <span className="font-semibold text-danger block">
                  Observaciones emitidas por Gestión:
                </span>
                <p className="text-foreground leading-relaxed">
                  {fuente.observaciones_gestion}
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="correc-desc" className="text-xs font-semibold">
                Descripción de la fuente:
              </Label>
              <Textarea
                id="correc-desc"
                value={correcDesc}
                onChange={(e) => setCorrecDesc(e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="correc-sla-disp" className="text-xs font-semibold">
                  Disponibilidad SLA (%):
                </Label>
                <Input
                  id="correc-sla-disp"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={correcSlaDisp}
                  onChange={(e) => setCorrecSlaDisp(Number(e.target.value))}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="correc-sla-ms" className="text-xs font-semibold">
                  Tiempo máx respuesta (ms):
                </Label>
                <Input
                  id="correc-sla-ms"
                  type="number"
                  min="1"
                  value={correcSlaMs}
                  onChange={(e) => setCorrecSlaMs(Number(e.target.value))}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correc-motivo" className="text-xs font-semibold">
                Motivo / Justificación de la corrección:
              </Label>
              <Textarea
                id="correc-motivo"
                placeholder="Explique las subsanaciones realizadas para el revisor de Gestión..."
                value={motivoCorreccion}
                onChange={(e) => setMotivoCorreccion(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setShowCorregirDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmittingCorrec}
              onClick={handleConfirmarCorreccion}
            >
              {isSubmittingCorrec ? "Reenviando..." : "Subsanar y Reenviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Publicar Fuente (FUE-05) */}
      <PublicarFuenteDialog
        open={showPublicarDialog}
        onOpenChange={setShowPublicarDialog}
        fuente={fuente}
        coordinadorNombre={coordinadorNombre}
      />

      {/* Modal Wizard de Creación / Edición */}
      <FuenteFormDialog
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        fuenteAEditar={fuente}
        initialStep={formInitialStep}
        currentUser={currentUser}
        onSuccess={() => {
          setIsFormModalOpen(false);
        }}
      />

      {/* Modal Preparar Nueva Versión (FUE-06/FUE-07) */}
      <PrepararNuevaVersionDialog
        open={isNuevaVersionOpen}
        onOpenChange={setIsNuevaVersionOpen}
        fuente={fuente}
        onContinuarConfiguracion={handleContinuarNuevaVersion}
      />

      {/* Modal Solicitar Baja de Fuente (FUE-08) */}
      <SolicitarBajaDialog
        open={isBajaOpen}
        onOpenChange={setIsBajaOpen}
        fuente={fuente}
        onBajaSolicitada={handleBajaSolicitada}
      />
    </WireframeDashboardLayout>
  );
}
