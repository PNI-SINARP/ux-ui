"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  CheckSquare,
  History,
  Edit2,
  CheckCircle2,
  Ban,
  RotateCcw,
  ShieldAlert,
  Trash2,
  Mail,
  User,
  Briefcase,
  Calendar,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { toast } from "sonner";
import { useAreasStore } from "../data/areas-store";
import { AreaFormModal } from "./area-form-modal";
import { AreaImpactoDialog } from "./area-impacto-dialog";
import { AreaActivarDialog } from "./area-activar-dialog";
import { AreaEliminarDialog } from "./area-eliminar-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface AreaDetailClientProps {
  id: string;
}

export function AreaDetailClient({ id }: AreaDetailClientProps) {
  const router = useRouter();
  const {
    areas,
    getArea,
    calcularImpacto,
    editarArea,
    activarArea,
    inactivarArea,
    reactivarArea,
    eliminarArea,
    simularResolucionObligaciones,
  } = useAreasStore();

  const area = getArea(id) || areas.find((a) => a.id === id || a.codigo === id);

  const [activeTab, setActiveTab] = useState("usuarios");

  // Modales
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalImpactoOpen, setModalImpactoOpen] = useState(false);
  const [isInactivatingFlow, setIsInactivatingFlow] = useState(false);
  const [modalActivarOpen, setModalActivarOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);

  // Modal de confirmación de éxito tras acción completada (ConfirmDialog Success)
  const [successFeedback, setSuccessFeedback] = useState<{
    title: string;
    description: string;
    areaNombre: string;
    codigo: string;
    nuevoEstado: string;
    version: string;
  } | null>(null);

  if (!area) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="size-12 rounded-xl bg-danger/10 text-danger mx-auto flex items-center justify-center">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-heading text-foreground">Área no encontrada</h2>
          <p className="text-xs text-muted-foreground">
            No existe un área orgánica con el identificador o código especificado [{id}].
          </p>
        </div>
        <Link href="/areas">
          <Button variant="primary" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            <span>Volver a la bandeja de áreas</span>
          </Button>
        </Link>
      </div>
    );
  }

  const impacto = calcularImpacto(area);

  // Mapear trazabilidad al componente Timeline
  const timelineItems: TimelineItem[] = area.trazabilidad.map((t, idx) => {
    let status: TimelineItem["status"] = "neutral";
    if (t.tipoAccion === "CREACION" || t.tipoAccion === "EDICION") status = "primary";
    if (t.tipoAccion === "ACTIVACION" || t.tipoAccion === "REACTIVACION") status = "warning";
    if (t.tipoAccion === "INACTIVACION" || t.tipoAccion === "RETIRO_LOGICO") status = "danger";

    return {
      id: t.id,
      title: `${t.tipoAccion}: ${t.version}`,
      description: `Motivo: ${t.motivo}${t.detalles ? ` · ${t.detalles}` : ""}`,
      date: t.fecha,
      user: `${t.autor}${t.autorCargo ? ` (${t.autorCargo})` : ""}`,
      status,
      statusLabel: t.version,
      isCurrent: idx === 0,
    };
  });

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "Activa":
        return <Badge tone="success" appearance="solid" size="md">Activa</Badge>;
      case "Borrador":
        return <Badge tone="warning" appearance="soft" size="md">Borrador</Badge>;
      case "Inactiva":
        return <Badge tone="danger" appearance="soft" size="md">Inactiva</Badge>;
      default:
        return <Badge tone="neutral" size="md">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de navegación y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                asChild
                aria-label="Volver a áreas DINARP"
                className="rounded-full shrink-0 cursor-pointer"
              >
                <Link href="/areas">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Volver a áreas DINARP</TooltipContent>
          </Tooltip>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-surface-subtle font-bold border border-border">
                {area.codigo}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                {area.nombre}
              </h1>
              {getBadgeEstado(area.estado)}
              <Badge tone="primary" appearance="outline" size="sm">
                Versión {area.version}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ficha institucional y gobernanza orgánica del SINARP
            </p>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Ver Impacto */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsInactivatingFlow(false);
              setModalImpactoOpen(true);
            }}
            className="text-xs gap-1.5"
          >
            <ShieldAlert className="size-3.5 text-warning" />
            <span>Ver impacto</span>
          </Button>

          {/* Botón Editar */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setModalEditOpen(true)}
            className="text-xs gap-1.5"
          >
            <Edit2 className="size-3.5" />
            <span>Editar</span>
          </Button>

          {/* Botón Activar (si es Borrador) -> Warning */}
          {area.estado === "Borrador" && (
            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={() => setModalActivarOpen(true)}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Activar área</span>
            </Button>
          )}

          {/* Botón Inactivar (si es Activa) -> Danger */}
          {area.estado === "Activa" && (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                setIsInactivatingFlow(true);
                setModalImpactoOpen(true);
              }}
              className="text-xs gap-1.5"
            >
              <Ban className="size-3.5" />
              <span>Inactivar</span>
            </Button>
          )}

          {/* Botón Reactivar (si es Inactiva) -> Warning */}
          {area.estado === "Inactiva" && (
            <Button
              type="button"
              variant="warning"
              size="sm"
              onClick={() => setModalActivarOpen(true)}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Reactivar</span>
            </Button>
          )}

          {/* Botón Retirar / Eliminar -> Danger */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setModalEliminarOpen(true)}
            className="text-xs gap-1.5 text-danger hover:bg-danger/10"
          >
            <Trash2 className="size-3.5" />
            <span>
              {area.estado === "Borrador" && !area.referenciada ? "Eliminar" : "Retirar"}
            </span>
          </Button>
        </div>
      </div>

      {/* Grid de Metadatos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta 1: Información Orgánica */}
        <Card className="p-4 bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Building2 className="size-4" />
            <span>Información Orgánica</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Código oficial</span>
              <span className="font-mono font-bold text-foreground">{area.codigo}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Nombre institucional</span>
              <span className="font-semibold text-foreground">{area.nombre}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Descripción y competencias</span>
              <p className="text-muted-foreground leading-relaxed mt-0.5">{area.descripcion}</p>
            </div>
          </div>
        </Card>

        {/* Tarjeta 2: Responsable / Titular */}
        <Card className="p-4 bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <User className="size-4" />
            <span>Responsable a Cargo</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Titular</span>
              <span className="font-bold text-foreground text-sm">{area.responsableNombre}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Cargo institucional</span>
              <span className="font-medium text-foreground">{area.responsableCargo}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Correo electrónico</span>
              <a
                href={`mailto:${area.responsableCorreo}`}
                className="font-mono text-primary hover:underline flex items-center gap-1.5 mt-0.5"
              >
                <Mail className="size-3.5" />
                <span>{area.responsableCorreo}</span>
              </a>
            </div>
          </div>
        </Card>

        {/* Tarjeta 3: Estado, Versión e Impacto */}
        <Card className="p-4 bg-surface border border-border shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Layers className="size-4" />
            <span>Estado y Gobernanza</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Estado institucional</span>
              {getBadgeEstado(area.estado)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Versión vigente</span>
              <span className="font-mono font-bold text-foreground">{area.version}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Fecha de creación</span>
              <span className="text-muted-foreground">{area.fechaCreacion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">Última actualización</span>
              <span className="text-muted-foreground">{area.ultimaActualizacion}</span>
            </div>
            <div className="pt-1 border-t border-border/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Obligaciones activas</span>
              <Badge
                tone={impacto.totalObligaciones === 0 ? "success" : "danger"}
                appearance="soft"
                size="sm"
              >
                {impacto.totalObligaciones} vigentes
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Pestañas de detalle: Usuarios, Trámites, Tareas y Trazabilidad */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-surface border border-border rounded-xl">
          <TabsTrigger value="usuarios" className="gap-2 text-xs py-2 rounded-lg">
            <Users className="size-4" />
            <span>Usuarios vinculados ({area.usuarios.length})</span>
          </TabsTrigger>
          <TabsTrigger value="tramites" className="gap-2 text-xs py-2 rounded-lg">
            <FileText className="size-4" />
            <span>Trámites ({area.tramites.length})</span>
          </TabsTrigger>
          <TabsTrigger value="tareas" className="gap-2 text-xs py-2 rounded-lg">
            <CheckSquare className="size-4" />
            <span>Tareas ({area.tareas.length})</span>
          </TabsTrigger>
          <TabsTrigger value="trazabilidad" className="gap-2 text-xs py-2 rounded-lg">
            <History className="size-4" />
            <span>Trazabilidad ({area.trazabilidad.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Usuarios vinculados */}
        <TabsContent value="usuarios" className="pt-3">
          <Card className="p-4 bg-surface border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold font-heading text-foreground">
                  Cuentas y Funcionarios Asignados
                </h3>
                <p className="text-xs text-muted-foreground">
                  Usuarios que tienen asignada esta área orgánica como su ámbito institucional.
                </p>
              </div>
              <Badge tone="primary" appearance="soft" size="sm">
                {area.usuarios.length} registrados
              </Badge>
            </div>
            <div className="divide-y divide-border/60 pt-1">
              {area.usuarios.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No existen funcionarios vinculados actualmente a esta dirección orgánica.
                </div>
              ) : (
                area.usuarios.map((usr) => (
                  <div key={usr.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {usr.nombreCompleto.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{usr.nombreCompleto}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {usr.correo} · Cédula: <span className="font-mono">{usr.cedula}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-12 sm:pl-0">
                      <Badge tone="neutral" appearance="soft" size="sm">
                        {usr.rol}
                      </Badge>
                      <Badge
                        tone={usr.estado === "ACTIVO" ? "success" : "neutral"}
                        appearance="soft"
                        size="sm"
                      >
                        {usr.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Trámites asociados */}
        <TabsContent value="tramites" className="pt-3">
          <Card className="p-4 bg-surface border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold font-heading text-foreground">
                  Trámites y Solicitudes Institucionales
                </h3>
                <p className="text-xs text-muted-foreground">
                  Expedientes en trámite asignados a la responsabilidad resolutiva de esta unidad.
                </p>
              </div>
              <Badge tone="warning" appearance="soft" size="sm">
                {area.tramites.filter((t) => t.vigente).length} vigentes
              </Badge>
            </div>
            <div className="divide-y divide-border/60 pt-1">
              {area.tramites.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No existen trámites asociados ni pendientes en esta dirección.
                </div>
              ) : (
                area.tramites.map((trm) => (
                  <div key={trm.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-primary">{trm.codigo}</span>
                        <Badge
                          tone={trm.vigente ? "warning" : "success"}
                          appearance="soft"
                          size="sm"
                        >
                          {trm.estado}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-foreground">{trm.asunto}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Entidad solicitante: {trm.institucion} ({trm.solicitante}) · Fecha: {trm.fecha}
                      </p>
                    </div>
                    <div>
                      {trm.vigente ? (
                        <Badge tone="danger" appearance="soft" size="sm">
                          Obligación vigente
                        </Badge>
                      ) : (
                        <Badge tone="success" appearance="soft" size="sm">
                          Cerrado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Tareas operativas */}
        <TabsContent value="tareas" className="pt-3">
          <Card className="p-4 bg-surface border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-sm font-bold font-heading text-foreground">
                  Tareas y Actividades Operativas
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compromisos operativos asignados al equipo de trabajo de esta dirección.
                </p>
              </div>
              <Badge tone="info" appearance="soft" size="sm">
                {area.tareas.filter((t) => t.vigente).length} activas
              </Badge>
            </div>
            <div className="divide-y divide-border/60 pt-1">
              {area.tareas.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground italic">
                  No existen tareas operativas pendientes en esta área.
                </div>
              ) : (
                area.tareas.map((tar) => (
                  <div key={tar.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground">{tar.titulo}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Asignado a: <span className="font-medium text-foreground">{tar.asignadoA}</span> ·
                        Fecha límite: <span className="font-mono">{tar.fechaLimite}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          tar.prioridad === "Alta"
                            ? "danger"
                            : tar.prioridad === "Media"
                            ? "warning"
                            : "neutral"
                        }
                        appearance="outline"
                        size="sm"
                      >
                        Prioridad {tar.prioridad}
                      </Badge>
                      <Badge
                        tone={tar.vigente ? "info" : "success"}
                        appearance="soft"
                        size="sm"
                      >
                        {tar.estado}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Trazabilidad institucional con Timeline */}
        <TabsContent value="trazabilidad" className="pt-3">
          <Card className="p-4 bg-surface border border-border">
            <div className="pb-3 border-b border-border mb-4">
              <h3 className="text-sm font-bold font-heading text-foreground">
                Trazabilidad y Control de Versiones
              </h3>
              <p className="text-xs text-muted-foreground">
                Registro inmutable de autor, versión, motivo y fecha de cada evento del ciclo de vida.
              </p>
            </div>
            <Timeline items={timelineItems} />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modales integrados */}
      <AreaFormModal
        open={modalEditOpen}
        onOpenChange={setModalEditOpen}
        areaToEdit={area}
        onSave={(data) => {
          return editarArea(area.id, data, data.motivo);
        }}
      />

      <AreaImpactoDialog
        open={modalImpactoOpen}
        onOpenChange={setModalImpactoOpen}
        area={area}
        impacto={impacto}
        isInactivating={isInactivatingFlow}
        onConfirmInactivar={(motivo) => {
          const res = inactivarArea(area.id, motivo);
          if (res.success) {
            toast.success("Área inactivada exitosamente", {
              description: `El área [${area.codigo}] pasó a estado Inactiva. Versión actualizada a ${res.version}.`,
            });
            setSuccessFeedback({
              title: "Área inactivada exitosamente",
              description: "La dirección orgánica ha sido retirada del servicio activo. Su historial y expedientes se conservan intactos para fines de auditoría.",
              areaNombre: area.nombre,
              codigo: area.codigo,
              nuevoEstado: "Inactiva",
              version: res.version || area.version,
            });
          } else {
            toast.error("Inactivación fallida", {
              description: res.error,
            });
          }
        }}
        onSimularResolucion={(areaId) => {
          simularResolucionObligaciones(areaId);
        }}
      />

      <AreaActivarDialog
        open={modalActivarOpen}
        onOpenChange={setModalActivarOpen}
        area={area}
        tipo={area.estado === "Inactiva" ? "REACTIVAR" : "ACTIVAR"}
        onConfirm={(motivo) => {
          if (area.estado === "Inactiva") {
            const res = reactivarArea(area.id, motivo);
            if (res.success) {
              toast.success("Área reactivada exitosamente", {
                description: `El área vuelve a estar disponible en ID-01 e ID-02. Versión: ${res.version}.`,
              });
              setSuccessFeedback({
                title: "Área reactivada exitosamente",
                description: "La dirección orgánica vuelve a estar disponible inmediatamente en los selectores de enrolamiento (ID-01) y edición (ID-02).",
                areaNombre: area.nombre,
                codigo: area.codigo,
                nuevoEstado: "Activa",
                version: res.version || area.version,
              });
            }
          } else {
            const res = activarArea(area.id, motivo);
            if (res.success) {
              toast.success("Área activada exitosamente", {
                description: `El área fue promovida a producción oficial. Versión: ${res.version}.`,
              });
              setSuccessFeedback({
                title: "Área activada en producción",
                description: "La dirección orgánica ha sido habilitada oficialmente y se encuentra lista para vinculación de funcionarios institucionales.",
                areaNombre: area.nombre,
                codigo: area.codigo,
                nuevoEstado: "Activa",
                version: res.version || area.version,
              });
            }
          }
        }}
      />

      <AreaEliminarDialog
        open={modalEliminarOpen}
        onOpenChange={setModalEliminarOpen}
        area={area}
        onConfirm={(motivo) => {
          const res = eliminarArea(area.id, motivo);
          if (res.success) {
            if (res.tipo === "FISICO") {
              toast.success("Borrador eliminado", {
                description: res.mensaje,
              });
              router.push("/areas");
            } else {
              toast.success("Retiro lógico completado", {
                description: res.mensaje,
              });
              setSuccessFeedback({
                title: "Retiro lógico completado",
                description: "El área fue archivada permanentemente. Por normativa de auditoría institucional inmutable, su código no podrá ser reasignado a otra unidad.",
                areaNombre: area.nombre,
                codigo: area.codigo,
                nuevoEstado: "Archivada / Retiro Lógico",
                version: area.version,
              });
            }
          }
        }}
      />

      {/* FEEDBACK SUCCESS TRAS CONFIRMAR ACCIÓN (ConfirmDialog Success UI Kit) */}
      {successFeedback && (
        <ConfirmDialog
          open={Boolean(successFeedback)}
          onOpenChange={(open) => {
            if (!open) setSuccessFeedback(null);
          }}
          variant="success"
          title={successFeedback.title}
          description={successFeedback.description}
          confirmText="Entendido"
          cancelText=""
          confirmVariant="primary"
          onConfirm={() => setSuccessFeedback(null)}
          size="default"
          className="sm:max-w-[480px]"
        >
          <div className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-2 text-left my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Área DINARP:</span>
                <span className="font-semibold text-foreground break-words block">
                  {successFeedback.areaNombre}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Código oficial:</span>
                <span className="font-mono text-foreground font-bold">{successFeedback.codigo}</span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Nuevo estado:</span>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
                  {successFeedback.nuevoEstado}
                </Badge>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Versión vigente:</span>
                <span className="font-mono text-foreground font-bold">v{successFeedback.version}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Auditoría registrada: <strong className="text-foreground">Administrador SINARP</strong></span>
              <span className="text-success font-semibold">Trazabilidad inalterable</span>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </div>
  );
}
