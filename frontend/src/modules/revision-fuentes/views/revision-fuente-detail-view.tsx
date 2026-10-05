"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useFuentesStore } from "@/modules/fuentes/data/fuentes-store";
import { EstadoFuente, ClasificacionCampo } from "@/modules/fuentes/data/fuentes-data";
import { ClasificacionCamposTable } from "../components/clasificacion-campos-table";
import { AprobarFuenteDialog } from "../components/aprobar-fuente-dialog";
import { DevolverFuenteDialog } from "../components/devolver-fuente-dialog";
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
    fuentes,
    isLoaded,
    getFuenteById,
    clasificarCampo,
    clasificarTodosCampos,
  } = useFuentesStore();

  const [isAprobarOpen, setIsAprobarOpen] = useState(false);
  const [isDevolverOpen, setIsDevolverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"clasificacion" | "general" | "historial">("clasificacion");

  const fuente = getFuenteById(id);
  const revisorNombre = currentUser?.name || "Ana Torres (Gestión DINARP)";

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        Cargando revisión de la fuente...
      </div>
    );
  }

  if (!fuente) {
    return (
      <div className="py-16 text-center space-y-3">
        <FolderCheck className="size-10 text-muted-foreground/40 mx-auto" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Fuente no encontrada
        </h3>
        <p className="text-xs text-muted-foreground">
          No se encontró la fuente de datos solicitada para revisión.
        </p>
        <Link href="/revision-fuentes">
          <Button variant="outline" size="sm">
            Volver a la bandeja de revisión
          </Button>
        </Link>
      </div>
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

  const handleClasificarLote = (clasificaciones: Record<string, ClasificacionCampo>) => {
    clasificarTodosCampos(fuente.id, clasificaciones);
    toast.success("Clasificación normativa aplicada al lote de campos");
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
    <div className="space-y-6 max-w-6xl mx-auto">
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
              <h1 className="font-heading font-bold text-xl text-foreground">
                Revisión de Fuente: {fuente.nombre}
              </h1>
              <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border">
                {fuente.id}
              </span>
              {getEstadoBadge(fuente.estado)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
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
                className="gap-1.5 text-warning hover:text-warning hover:border-warning/50"
              >
                <AlertTriangle className="size-3.5" />
                Devolver con observaciones
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAprobarOpen(true)}
                disabled={!canApprove}
                className="gap-2 shadow-xs"
                title={
                  !canApprove
                    ? `Debe clasificar todos los campos (${camposSinClasificar.length} pendientes)`
                    : "Aprobar fuente y validar esquema"
                }
              >
                <CheckCircle2 className="size-4" />
                Aprobar fuente
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

      {/* Tabs */}
      <div className="border-b border-border flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("clasificacion")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "clasificacion"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          Clasificación de campos (FUE-04)
          {camposSinClasificar.length > 0 && (
            <Badge tone="warning" appearance="solid" size="sm">
              {camposSinClasificar.length}
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Server className="size-3.5" />
          Datos generales, SLA y Conexión técnica
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("historial")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "historial"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="size-3.5" />
          Trazabilidad ({fuente.historial.length})
        </button>
      </div>

      {/* Tab Clasificación de Campos */}
      {activeTab === "clasificacion" && (
        <div className="space-y-4">
          <div className="p-3 bg-muted/20 rounded-lg border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Regla de decisión normativa (FUE-04):</strong>{" "}
              Gestión no altera el esquema técnico ni los endpoints configurados por la institución proveedora. Su función consiste en clasificar cada campo como <strong>Accesible</strong> (para consumo regular bajo autorización institucional) o <strong>Confidencial</strong> (restringido a fines legales o específicos). Ningún campo puede quedar sin clasificación antes de aprobar.
            </div>
          </div>

          <ClasificacionCamposTable
            campos={fuente.campos}
            onClasificarCampo={handleClasificarIndividual}
            onClasificarLote={handleClasificarLote}
            readOnly={!isEnRevision}
          />
        </div>
      )}

      {/* Tab Datos Generales y Conexión */}
      {activeTab === "general" && (
        <div className="space-y-4">
          {/* Descripción y Parámetros */}
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Descripción Funcional y Alcance (PAR-07)
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              {fuente.descripcion_fuente}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SLA y Modalidades */}
            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                SLA y Modalidades Soportadas
              </h4>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Disponibilidad comprometida:</span>
                <span className="font-mono font-bold text-foreground">
                  {fuente.sla_fuente.disponibilidad_objetivo}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Latencia máxima objetivo:</span>
                <span className="font-mono font-bold text-foreground">
                  {fuente.sla_fuente.tiempo_maximo_respuesta_ms} ms
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-muted-foreground">Modalidades de consumo:</span>
                <span className="font-medium text-foreground">{fuente.modalidades_soportadas}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tipo de datos para pruebas:</span>
                <Badge tone={fuente.tipo_dato_pruebas === "Real" ? "warning" : "success"} appearance="soft" size="sm">
                  {fuente.tipo_dato_pruebas}
                </Badge>
              </div>
            </div>

            {/* Parámetros de Consulta */}
            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Parámetros de Consulta Requeridos
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fuente.parametros_consulta.map((p) => (
                  <div key={p.id_parametro} className="p-2 bg-muted/20 rounded border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-primary">{p.nombre}</span>
                      <Badge tone="neutral" appearance="soft" size="sm">{p.tipo}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {p.obligatorio && (
                        <Badge tone="danger" appearance="outline" size="sm">Obligatorio</Badge>
                      )}
                      {p.es_identificador_persona && (
                        <Badge tone="warning" appearance="soft" size="sm">Identificador Persona</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conexión Técnica Segura */}
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  Conexión Técnica e Infraestructura (Segura)
                </h4>
              </div>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Lock className="size-3 text-success" />
                Secretos Cifrados en KMS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Conector:</span>
                <span className="font-mono text-foreground">{fuente.conexion.tipo_conector}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Host/Destino:</span>
                <span className="font-mono text-foreground">
                  {fuente.conexion.host || fuente.conexion.url_endpoint || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Base / Recurso:</span>
                <span className="font-mono text-foreground">
                  {fuente.conexion.base_datos || fuente.conexion.esquema || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Usuario Lectura:</span>
                <span className="font-mono text-foreground">{fuente.conexion.usuario || "-"}</span>
              </div>
            </div>

            {/* Evidencia de prueba técnica */}
            {fuente.conexion.ultima_prueba && (
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-success" />
                    Prueba técnica verificada ({fuente.conexion.ultima_prueba.latencia_ms} ms latencia)
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ID: {fuente.conexion.ultima_prueba.id_prueba}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {fuente.conexion.ultima_prueba.etapas.map((et, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] p-1.5 bg-background rounded border border-border/60 flex items-center justify-between"
                    >
                      <span className="font-medium text-foreground">{et.etapa}</span>
                      <CheckCircle2 className="size-3 text-success shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Historial */}
      {activeTab === "historial" && (
        <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
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
                className="p-3 rounded-lg border border-border bg-background text-xs space-y-1"
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
                  <p className="text-[11px] text-foreground/80 bg-muted/20 p-2 rounded border border-border/50">
                    {evt.observaciones}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
