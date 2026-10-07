"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { EstadoFuente, ClasificacionCampo } from "@/modules/fuentes/data/fuentes-data";
import { ClasificacionCamposTable } from "../components/clasificacion-campos-table";
import { AprobarFuenteDialog } from "../components/aprobar-fuente-dialog";
import { DevolverFuenteDialog } from "../components/devolver-fuente-dialog";
import { FuenteTrazabilidadStepper } from "@/modules/fuentes/components/fuente-trazabilidad-stepper";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FolderCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Layers,
  ShieldCheck,
  Clock,
  History,
  Calendar,
  Send,
  Sliders,
  FileCheck,
  Globe,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface RevisionFuenteDetailViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function RevisionFuenteDetailView({ currentUser }: RevisionFuenteDetailViewProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    isLoaded,
    getFuenteById,
    clasificarCampo,
  } = useFuentesStore();

  const [isAprobarOpen, setIsAprobarOpen] = useState(false);
  const [isDevolverOpen, setIsDevolverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"revision" | "historial">("revision");

  const fuente = getFuenteById(id);
  const revisorNombre = currentUser?.name || "Ana Torres (Gestión DINARP)";

  if (!isLoaded) {
    return (
      <WireframeDashboardLayout
        activeMenu="revision-fuentes"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Gestión", href: "/revision-fuentes" },
          { label: "Cargando..." },
        ]}
      >
        <div className="py-20 text-center text-xs text-muted-foreground">
          Cargando revisión de la fuente...
        </div>
      </WireframeDashboardLayout>
    );
  }

  if (!fuente) {
    return (
      <WireframeDashboardLayout
        activeMenu="revision-fuentes"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Gestión", href: "/revision-fuentes" },
          { label: "No encontrada" },
        ]}
      >
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 items-center justify-center p-8 text-center space-y-4"
          >
            <FolderCheck className="size-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Fuente no encontrada
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No se encontró la fuente de datos solicitada para revisión.
            </p>
            <Link href="/revision-fuentes">
              <Button variant="outline" size="sm">
                Volver a la bandeja de revisión
              </Button>
            </Link>
          </Card>
        </main>
      </WireframeDashboardLayout>
    );
  }

  const camposIncluidos = fuente.campos.filter((c) => c.incluido);
  const camposSinClasificar = camposIncluidos.filter(
    (c) => !c.clasificacion || (c.clasificacion !== "Accesible" && c.clasificacion !== "Confidencial")
  );
  const canApprove = camposSinClasificar.length === 0;

  const isEnRevision = fuente.estado === "EN_REVISION";

  const handleClasificarIndividual = (campoId: string, clasificacion: ClasificacionCampo) => {
    clasificarCampo(fuente.id, campoId, clasificacion);
    toast.success(`Campo clasificado como ${clasificacion}`);
  };

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "EN_REVISION":
        return <Badge tone="warning" appearance="soft">Pendiente de revisión</Badge>;
      case "DEVUELTA":
        return <Badge tone="danger" appearance="soft">Devuelta con observaciones</Badge>;
      case "APROBADA":
        return <Badge tone="success" appearance="soft">Aprobada por Gestión</Badge>;
      case "PUBLICADA":
        return <Badge tone="success" appearance="solid">Publicada en catálogo</Badge>;
      default:
        return <Badge tone="neutral">{estado}</Badge>;
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Gestión", href: "/revision-fuentes" },
        { label: `Revisión: ${fuente.id}` },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/revision-fuentes">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-extrabold text-2xl tracking-tight text-primary">
                    Revisión de Fuente: {fuente.nombre}
                  </h1>
                  <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border">
                    {fuente.id}
                  </span>
                  {getEstadoBadge(fuente.estado)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Building2 className="size-3.5 text-primary" />
                  <span>Institución proveedora: <strong className="text-foreground">{fuente.institucion_proveedora_nombre}</strong></span>
                  <span>•</span>
                  <span>Versión propuesta: <strong className="font-mono text-foreground">{fuente.version_propuesta}</strong></span>
                </p>
              </div>
            </div>

            {/* Acciones de Decisión FUE-04 */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {isEnRevision ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDevolverOpen(true)}
                    className="gap-1.5 text-warning hover:text-warning hover:border-warning/50 h-9 cursor-pointer"
                  >
                    <AlertTriangle className="size-3.5" />
                    <span>Devolver con observaciones</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAprobarOpen(true)}
                    disabled={!canApprove}
                    className="gap-2 shadow-xs h-9 cursor-pointer"
                    title={
                      !canApprove
                        ? `Debe clasificar todos los campos (${camposSinClasificar.length} pendientes)`
                        : "Aprobar fuente y validar esquema"
                    }
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Aprobar fuente</span>
                  </Button>
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 bg-muted/20 px-3 py-1.5 rounded-lg border border-border">
                  <FileCheck className="size-3.5 text-primary" />
                  <span>Esta fuente ya fue dictaminada ({fuente.estado.replace("_", " ")}).</span>
                </div>
              )}
            </div>
          </div>

          {/* Recordatorio Normativo para Gestión */}
          <div className="p-3 bg-muted/20 rounded-xl border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <Info className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground block">
                Alcance funcional del rol de Gestión (FUE-04):
              </span>
              <span>
                Gestión evalúa el cumplimiento normativo y clasifica cada campo como <strong>Accesible</strong> o <strong>Confidencial</strong>. Gestión <strong>NO</strong> publica la fuente. Una vez dictaminada como Aprobada, la acción de publicación en el Catálogo corresponde exclusivamente al Coordinador Institucional de la entidad proveedora (FUE-05).
              </span>
            </div>
          </div>

          {/* Observaciones activas si fue devuelta */}
          {fuente.estado === "DEVUELTA" && fuente.observaciones_gestion && (
            <div className="p-4 rounded-xl border border-danger/30 bg-danger/5 shadow-xs space-y-1.5">
              <div className="flex items-center gap-2 text-danger font-heading font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="size-4" />
                Observaciones notificadas al Coordinador Institucional
              </div>
              <p className="text-xs text-foreground bg-background/80 p-3 rounded-lg border border-border">
                {fuente.observaciones_gestion}
              </p>
              <span className="text-[11px] text-muted-foreground block pt-1">
                Emitidas por {fuente.revisor_gestion} el {new Date(fuente.fecha_observacion || "").toLocaleString("es-EC")}.
              </span>
            </div>
          )}

          {/* Ciclo de vida y trazabilidad oficial (BN-06) */}
          <FuenteTrazabilidadStepper
            estado={fuente.estado}
            fuente={fuente}
            historial={fuente.historial}
          />

          {/* Selector de Pestaña Principal UI Kit */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as "revision" | "historial")}
            className="w-full space-y-6"
          >
            <div className="overflow-x-auto w-full -mx-1 px-1 scrollbar-none">
              <TabsList className="h-auto p-1 rounded-full bg-surface-subtle border border-border/60 inline-flex gap-1 w-max justify-start flex-nowrap shadow-2xs">
                <TabsTrigger
                  value="revision"
                  className="px-4 py-2 text-xs font-bold gap-2 rounded-full cursor-pointer"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Evaluación Técnica y Clasificación</span>
                  {camposSinClasificar.length > 0 && isEnRevision && (
                    <Badge tone="warning" appearance="solid" size="sm" className="ml-1">
                      {camposSinClasificar.length} pendientes
                    </Badge>
                  )}
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

            <TabsContent value="revision" className="space-y-6 animate-in fade-in duration-200 outline-none">
              {/* Card 1: Resumen General */}
              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      1. Resumen General y Alcance
                    </h3>
                  </div>
                  <Badge tone="primary" appearance="soft" size="sm">
                    {fuente.modalidades_soportadas}
                  </Badge>
                </div>

                <p className="text-xs text-foreground leading-relaxed">
                  {fuente.descripcion_fuente}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Disponibilidad SLA:</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {fuente.sla_fuente.disponibilidad_objetivo}%
                    </span>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Latencia Máxima:</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {fuente.sla_fuente.tiempo_maximo_respuesta_ms} ms
                    </span>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Formato Respuesta:</span>
                    <code className="font-mono text-foreground text-xs">
                      {fuente.formato_respuesta}
                    </code>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-lg border border-border/60">
                    <span className="text-[11px] text-muted-foreground block font-medium">Datos en Pruebas:</span>
                    <Badge
                      tone={fuente.tipo_dato_pruebas === "Real" ? "warning" : "success"}
                      appearance="soft"
                      size="sm"
                      className="mt-0.5"
                    >
                      {fuente.tipo_dato_pruebas}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Card 2: Prueba Técnica de Conexión (Sin Secretos) */}
              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Server className="size-4 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      2. Prueba Técnica de Conexión y Parámetros Seguros
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                    <Lock className="size-3.5 text-success" />
                    Secretos Cifrados en KMS
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">Tipo Conector:</span>
                    <span className="font-mono text-foreground">{fuente.conexion.tipo_conector}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">Host / Endpoint:</span>
                    <span className="font-mono text-foreground">{fuente.conexion.host || fuente.conexion.url_endpoint || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">Puerto:</span>
                    <span className="font-mono text-foreground">{fuente.conexion.puerto || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground block">Usuario Lectura:</span>
                    <span className="font-mono text-foreground">{fuente.conexion.usuario || "-"}</span>
                  </div>
                </div>

                {fuente.conexion.ultima_prueba && (
                  <div className="pt-3 border-t border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-success" />
                        Prueba técnica verificada ({fuente.conexion.ultima_prueba.latencia_ms} ms latencia)
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        ID: {fuente.conexion.ultima_prueba.id_prueba}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                      {fuente.conexion.ultima_prueba.etapas.map((et, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] p-2 bg-background rounded-lg border border-border/60 flex items-center justify-between"
                        >
                          <span className="font-medium text-foreground">{et.etapa}</span>
                          <CheckCircle2 className="size-3.5 text-success shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card 3: Parámetros de Consulta */}
              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Sliders className="size-4 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      3. Parámetros de Consulta Requeridos (FUE-01)
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {fuente.parametros_consulta.length} parámetro(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {fuente.parametros_consulta.map((p) => (
                    <div key={p.id_parametro} className="p-3 bg-muted/20 rounded-xl border border-border/60 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">{p.nombre}</span>
                        <Badge tone="neutral" appearance="soft" size="sm">{p.tipo}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.obligatorio && (
                          <Badge tone="danger" appearance="outline" size="sm">Obligatorio</Badge>
                        )}
                        {p.es_identificador_persona && (
                          <Badge tone="warning" appearance="soft" size="sm">ID Persona</Badge>
                        )}
                      </div>
                      {p.restriccion?.patron && (
                        <code className="text-[10px] text-muted-foreground font-mono block pt-0.5">
                          Patrón: {p.restriccion.patron}
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Clasificación de Campos (FUE-04) */}
              <div className="p-5 bg-surface rounded-xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Layers className="size-4 text-primary" />
                    <h3 className="font-heading font-bold text-sm text-foreground uppercase tracking-wider">
                      4. Clasificación Normativa de Campos (FUE-04)
                    </h3>
                  </div>
                  <Badge
                    tone={canApprove ? "success" : "warning"}
                    appearance="soft"
                    size="sm"
                  >
                    {camposIncluidos.length - camposSinClasificar.length} de {camposIncluidos.length} clasificados
                  </Badge>
                </div>

                <ClasificacionCamposTable
                  campos={fuente.campos}
                  onClasificarCampo={handleClasificarIndividual}
                  readOnly={!isEnRevision}
                />
              </div>
            </TabsContent>

            <TabsContent value="historial" className="space-y-6 animate-in fade-in duration-200 outline-none">
              <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                    Historial de Revisión y Trazabilidad (AUD-01 / TEC-00)
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {fuente.historial.length} eventos
                  </span>
                </div>

                <div className="space-y-3">
                  {fuente.historial.map((evt) => (
                    <div
                      key={evt.id_evento}
                      className="p-3.5 rounded-xl border border-border bg-background text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{evt.accion}</span>
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
                        <span>Actor: <strong className="text-foreground">{evt.actor}</strong> ({evt.rol})</span>
                      </div>

                      {evt.observaciones && (
                        <p className="text-[11px] text-foreground/80 bg-muted/20 p-2.5 rounded-lg border border-border/60">
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

      {/* Diálogos de Decisión */}
      <AprobarFuenteDialog
        fuente={fuente}
        revisorNombre={revisorNombre}
        open={isAprobarOpen}
        onOpenChange={setIsAprobarOpen}
        onAprobado={() => {
          setIsAprobarOpen(false);
        }}
      />

      <DevolverFuenteDialog
        fuente={fuente}
        revisorNombre={revisorNombre}
        open={isDevolverOpen}
        onOpenChange={setIsDevolverOpen}
        onDevuelto={() => {
          setIsDevolverOpen(false);
        }}
      />
    </WireframeDashboardLayout>
  );
}
