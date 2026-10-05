"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useFuentesStore } from "../data/fuentes-store";
import { EstadoFuente, FuenteDatos } from "../data/fuentes-data";
import { FuenteTrazabilidadStepper } from "../components/fuente-trazabilidad-stepper";
import { FuenteObservacionesAlert } from "../components/fuente-observaciones-alert";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Server,
  Building2,
  Globe,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Calendar,
  Lock,
  ExternalLink,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface FuenteDetailViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function FuenteDetailView({ currentUser }: FuenteDetailViewProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { fuentes, isLoaded, getFuenteById } = useFuentesStore();
  const [activeTab, setActiveTab] = useState<"info" | "conexion" | "campos" | "historial">("info");
  const [showPublicarDialog, setShowPublicarDialog] = useState(false);

  const fuente = getFuenteById(id);
  const coordinadorNombre = currentUser?.name || "Carlos Mendoza";

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        Cargando información de la fuente...
      </div>
    );
  }

  if (!fuente) {
    return (
      <div className="py-16 text-center space-y-3">
        <Server className="size-10 text-muted-foreground/40 mx-auto" />
        <h3 className="font-heading font-bold text-base text-foreground">
          Fuente no encontrada
        </h3>
        <p className="text-xs text-muted-foreground">
          No se encontró la fuente de datos con el identificador especificado.
        </p>
        <Link href="/fuentes">
          <Button variant="outline" size="sm">
            Volver a la bandeja
          </Button>
        </Link>
      </div>
    );
  }

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return <Badge tone="neutral" appearance="soft">Borrador</Badge>;
      case "CONFIGURACION":
        return <Badge tone="info" appearance="soft">Configuración</Badge>;
      case "EN_REVISION":
        return <Badge tone="warning" appearance="soft">En revisión de Gestión</Badge>;
      case "DEVUELTA":
        return <Badge tone="danger" appearance="soft">Devuelta con observaciones</Badge>;
      case "APROBADA":
        return <Badge tone="success" appearance="soft">Aprobada</Badge>;
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/fuentes">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading font-bold text-xl text-foreground">
                {fuente.nombre}
              </h1>
              <span className="font-mono text-xs text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border">
                {fuente.id}
              </span>
              {getEstadoBadge(fuente.estado)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
              <Building2 className="size-3.5 text-primary" />
              <span>{fuente.institucion_proveedora_nombre}</span>
              <span>•</span>
              <span>Versión propuesta: <strong className="font-mono text-foreground">{fuente.version_propuesta}</strong></span>
              {fuente.version_api && (
                <>
                  <span>•</span>
                  <span>Versión API: <strong className="font-mono text-success">{fuente.version_api}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* CTA Principal según Estado */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {fuente.estado === "APROBADA" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPublicarDialog(true)}
              className="gap-2 shadow-xs"
            >
              <Globe className="size-4" />
              Publicar fuente (FUE-05)
            </Button>
          )}

          {fuente.estado === "PUBLICADA" && (
            <Badge tone="success" appearance="soft" size="lg" className="gap-1.5 py-1.5 px-3">
              <CheckCircle2 className="size-4" />
              Disponible en Catálogo Nacional
            </Badge>
          )}
        </div>
      </div>

      {/* Trazabilidad visual de etapas */}
      <FuenteTrazabilidadStepper estado={fuente.estado} />

      {/* Alerta si fue devuelta por Gestión */}
      {fuente.estado === "DEVUELTA" && (
        <FuenteObservacionesAlert
          fuente={fuente}
          coordinadorNombre={coordinadorNombre}
        />
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
        </div>
      )}

      {/* Tabs de Contenido */}
      <div className="border-b border-border flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "info"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="size-3.5" />
          Información general y SLA
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("conexion")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "conexion"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Server className="size-3.5" />
          Conexión técnica (Segura)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("campos")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "campos"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-3.5" />
          Campos y Parámetros ({camposIncluidos.length})
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

      {/* Tab 1: Info General */}
      {activeTab === "info" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Descripción y Alcance (PAR-07)
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              {fuente.descripcion_fuente}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                SLA y Rendimiento
              </span>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Disponibilidad objetivo:</span>
                <span className="font-mono font-bold text-foreground">
                  {fuente.sla_fuente.disponibilidad_objetivo}%
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Tiempo máx respuesta:</span>
                <span className="font-mono font-bold text-foreground">
                  {fuente.sla_fuente.tiempo_maximo_respuesta_ms} ms
                </span>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Protocolo y Modalidad
              </span>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Modalidades:</span>
                <span className="font-medium text-foreground">{fuente.modalidades_soportadas}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground">Formato:</span>
                <code className="font-mono text-[11px]">{fuente.formato_respuesta}</code>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Datos de Prueba (FUE-04)
              </span>
              <div className="flex justify-between items-center py-1 border-b border-border">
                <span className="text-muted-foreground">Tipo de datos:</span>
                <Badge tone={fuente.tipo_dato_pruebas === "Real" ? "warning" : "success"} appearance="soft" size="sm">
                  {fuente.tipo_dato_pruebas}
                </Badge>
              </div>
              <div className="py-1">
                <span className="text-[10px] text-muted-foreground block">
                  {fuente.tipo_dato_pruebas === "Real"
                    ? "Requiere producción directa; no se habilita sandbox de pruebas."
                    : "Habilitado para consultas interactivas de prueba."}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Conexión Técnica */}
      {activeTab === "conexion" && (
        <div className="space-y-4">
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Server className="size-4 text-primary" />
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  Parámetros de Red y Conector ({fuente.conexion.tipo_conector})
                </h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
                <ShieldCheck className="size-4" />
                Seguridad KMS Activa
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Host / Endpoint:
                </span>
                <span className="font-mono text-foreground">
                  {fuente.conexion.host || fuente.conexion.url_endpoint || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">Puerto:</span>
                <span className="font-mono text-foreground">{fuente.conexion.puerto || "-"}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Base / Esquema:
                </span>
                <span className="font-mono text-foreground">
                  {fuente.conexion.base_datos || fuente.conexion.esquema || "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Usuario Lectura:
                </span>
                <span className="font-mono text-foreground">{fuente.conexion.usuario || "-"}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Almacén de secretos KMS:</span>
              <code className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                {fuente.conexion.secreto_referencia || "arn:aws:kms:secret-store:managed"}
              </code>
            </div>
          </div>

          {/* Evidencia de la prueba técnica */}
          {fuente.conexion.ultima_prueba && (
            <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" />
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                    Evidencia de Prueba Técnica (Red DINARP)
                  </h4>
                </div>
                <Badge tone="success" appearance="soft" size="sm">
                  {fuente.conexion.ultima_prueba.latencia_ms} ms latencia
                </Badge>
              </div>

              <div className="space-y-1.5">
                {fuente.conexion.ultima_prueba.etapas.map((et, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 px-3 rounded bg-muted/20 border border-border/50"
                  >
                    <span className="font-medium text-foreground">{et.etapa}</span>
                    <span className="text-[11px] text-muted-foreground">{et.detalle}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Campos y Parámetros */}
      {activeTab === "campos" && (
        <div className="space-y-4">
          {/* Parámetros de consulta */}
          <div className="p-4 bg-surface rounded-xl border border-border space-y-3">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Parámetros de Consulta Requeridos (FUE-01)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {fuente.parametros_consulta.map((p) => (
                <div
                  key={p.id_parametro}
                  className="p-3 rounded-lg border border-border bg-background text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-primary">{p.nombre}</span>
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {p.tipo}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
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

          {/* Tabla de Campos expuestos */}
          <div className="rounded-xl border border-border overflow-hidden bg-surface shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs">Nombre publicado</TableHead>
                  <TableHead className="text-xs">Ruta física origen</TableHead>
                  <TableHead className="text-xs">Tipo normalizado</TableHead>
                  <TableHead className="text-xs">Regla de conversión</TableHead>
                  <TableHead className="text-xs">Clasificación (Gestión)</TableHead>
                  <TableHead className="text-xs">Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {camposIncluidos.map((campo) => (
                  <TableRow key={campo.id_campo} className="text-xs">
                    <TableCell className="font-mono font-semibold text-primary">
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
                    <TableCell className="text-muted-foreground">
                      {campo.descripcion || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab 4: Historial de Trazabilidad */}
      {activeTab === "historial" && (
        <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Bitácora de Trazabilidad y Auditoría (AUD-01 / TEC-00)
            </h4>
            <span className="text-xs text-muted-foreground">
              {fuente.historial.length} eventos registrados
            </span>
          </div>

          <div className="space-y-3">
            {fuente.historial.map((evt) => (
              <div
                key={evt.id_evento}
                className="p-3 rounded-lg border border-border bg-background text-xs space-y-1.5"
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

      {/* Dialog Publicación */}
      <PublicarFuenteDialog
        fuente={fuente}
        coordinadorNombre={coordinadorNombre}
        open={showPublicarDialog}
        onOpenChange={setShowPublicarDialog}
      />
    </div>
  );
}
