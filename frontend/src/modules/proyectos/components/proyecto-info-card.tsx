"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Building2,
  Lock,
  Calendar,
  Hash,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  History,
  AlertCircle,
  ShieldAlert,
  Loader2,
  GitBranch,
  Sparkles,
} from "lucide-react";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";
import { EditarProyectoDialog } from "./editar-proyecto-dialog";
import { TrazabilidadProyectoDialog } from "./trazabilidad-proyecto-dialog";

interface ProyectoInfoCardProps {
  proyecto: ProyectoInstitucional;
  coordinadorNombre: string;
  onProyectoActualizado?: (proyecto: ProyectoInstitucional) => void;
}

export function ProyectoInfoCard({
  proyecto,
  coordinadorNombre,
  onProyectoActualizado,
}: ProyectoInfoCardProps) {
  const { actualizarProyecto } = useProyectosStore();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTrazabilidadDialogOpen, setIsTrazabilidadDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nombreEdit, setNombreEdit] = useState(proyecto.nombre);
  const [propositoEdit, setPropositoEdit] = useState(proyecto.proposito);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  // Sync state if external proyecto prop changes
  React.useEffect(() => {
    setNombreEdit(proyecto.nombre);
    setPropositoEdit(proyecto.proposito);
    setIsEditing(false);
    setErrorMessage(null);
  }, [proyecto.id, proyecto.version]);

  const handleCopyId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(proyecto.id);
      setCopiedId(true);
      toast.success(`Código ${proyecto.id} copiado al portapapeles`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleStartEditing = () => {
    setNombreEdit(proyecto.nombre);
    setPropositoEdit(proyecto.proposito);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setNombreEdit(proyecto.nombre);
    setPropositoEdit(proyecto.proposito);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nombreTrim = nombreEdit.trim();
    const propositoTrim = propositoEdit.trim();

    if (!nombreTrim) {
      setErrorMessage("El nombre del proyecto es obligatorio.");
      return;
    }
    if (nombreTrim.length < 3) {
      setErrorMessage("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    if (!propositoTrim) {
      setErrorMessage("El propósito del proyecto es obligatorio.");
      return;
    }
    if (propositoTrim.length < 10) {
      setErrorMessage("El propósito debe tener al menos 10 caracteres.");
      return;
    }

    // Comprobar si hubo cambios reales
    if (
      nombreTrim === proyecto.nombre.trim() &&
      propositoTrim === proyecto.proposito.trim()
    ) {
      setIsEditing(false);
      toast.info("No se realizaron cambios en el nombre ni propósito del proyecto.");
      return;
    }

    setIsSubmitting(true);
    // Simular registro de nueva versión (BPMN: Edita nombre o propósito -> Registrar nueva versión)
    await new Promise((resolve) => setTimeout(resolve, 500));

    const res = actualizarProyecto(proyecto.id, {
      nombre: nombreTrim,
      proposito: propositoTrim,
      modificadoPor: coordinadorNombre,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "No se pudo actualizar el proyecto.");
      toast.error(res.error || "Error al registrar la nueva versión.");
      return;
    }

    if (res.data) {
      toast.success(
        `Nueva versión (v${res.data.version}) registrada correctamente en el portal.`
      );
      setIsEditing(false);
      onProyectoActualizado?.(res.data);
    }
  };

  return (
    <Card
      className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
      innerClassName="p-4 sm:p-6 lg:p-7 flex flex-col gap-6"
    >
      {/* Cabecera de la tarjeta con acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-heading font-bold text-foreground">
              Información general del proyecto
            </h2>
            <Badge
              tone={proyecto.version > 1 ? "secondary" : "neutral"}
              appearance="soft"
              size="sm"
              className="font-semibold text-xs px-2.5 py-0.5 h-6"
            >
              Versión v{proyecto.version}.0
            </Badge>
            <Badge tone="success" appearance="soft" size="sm" className="font-bold gap-1.5 px-2.5 py-0.5 text-xs h-6">
              <span className="size-1.5 rounded-full bg-success"></span>
              ACTIVO
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Datos institucionales constitutivos y vigencia del proyecto.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            leftIcon={<Edit3 className="size-3.5" />}
            className="cursor-pointer"
          >
            Editar metadatos
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsTrazabilidadDialogOpen(true)}
            leftIcon={<History className="size-3.5" />}
            className="text-xs cursor-pointer"
          >
            Trazabilidad ({proyecto.historialVersiones.length})
          </Button>
        </div>
      </div>

      {/* Banner de inmutabilidad normativa */}
      <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-start gap-3">
        <ShieldAlert className="size-4.5 text-secondary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">
            Restricciones normativas de integridad institucional:
          </span>{" "}
          El código identificador y la institución responsable son definitivos e inmutables. Conforme a las reglas del SINARP, los proyectos institucionales no admiten cambio de entidad ni eliminación/cierre voluntario.
        </div>
      </div>

      {/* Metadatos en solo lectura: ID, Institución, Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-background/60 border border-border/60">
        {/* ID del Proyecto (Solo Lectura) */}
        <div
          className="space-y-1 p-2 rounded-lg transition-colors hover:bg-muted/40 cursor-not-allowed group"
          onClick={() => {
            toast.info("Esta información no se puede cambiar: el ID de proyecto es definitivo e inmutable.");
          }}
          title="Campo de solo lectura. No se puede modificar."
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Hash className="size-3.5 text-primary" />
            <span>ID de proyecto</span>
            <Lock className="size-3 text-muted-foreground/70" />
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-xs sm:text-sm font-semibold">
              {proyecto.id}
            </code>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId();
              }}
              title="Copiar código del proyecto"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
            >
              {copiedId ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Inmutable · Solo lectura</p>
        </div>

        {/* Institución Responsable (Solo Lectura) */}
        <div
          className="space-y-1 p-2 rounded-lg transition-colors hover:bg-muted/40 cursor-not-allowed group"
          onClick={() => {
            toast.info("Esta información no se puede cambiar: la institución responsable es inmutable por normativa institucional.");
          }}
          title="Campo de solo lectura. No se puede modificar."
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Building2 className="size-3.5 text-primary" />
            <span>Institución responsable</span>
            <Lock className="size-3 text-muted-foreground/70" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {proyecto.institucion}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Entidad asignada automáticamente
          </p>
        </div>

        {/* Fecha de Creación (Solo Lectura) */}
        <div
          className="space-y-1 p-2 rounded-lg transition-colors hover:bg-muted/40 cursor-not-allowed group"
          onClick={() => {
            toast.info("Esta información no se puede cambiar: la fecha de registro es histórica y permanente.");
          }}
          title="Campo de solo lectura. No se puede modificar."
        >
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar className="size-3.5 text-primary" />
            <span>Fecha de creación</span>
            <Lock className="size-3 text-muted-foreground/70" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {proyecto.fechaCreacion}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Registrado por {proyecto.creadoPor}
          </p>
        </div>
      </div>

      {/* Formulario / Visualización de Nombre y Propósito */}
      {isEditing ? (
        <form onSubmit={handleSaveVersion} className="space-y-4 pt-1">
          <Alert
            variant="warning"
            icon={<GitBranch className="size-4" />}
            title="Registrando nueva versión institucional"
          >
            Modificar el nombre o el propósito creará formalmente la versión{" "}
            <strong>v{proyecto.version + 1}</strong> en la trazabilidad del proyecto.
          </Alert>

          {errorMessage && (
            <Alert
              variant="danger"
              icon={<AlertCircle className="size-4" />}
              title="Error al guardar cambios"
            >
              {errorMessage}
            </Alert>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-nombre" className="text-xs font-semibold text-foreground">
                Nombre del proyecto <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {nombreEdit.length}/150
              </span>
            </div>
            <Input
              id="edit-nombre"
              type="text"
              value={nombreEdit}
              maxLength={150}
              onChange={(e) => setNombreEdit(e.target.value)}
              disabled={isSubmitting}
              className="text-xs sm:text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-proposito" className="text-xs font-semibold text-foreground">
                Propósito del proyecto <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {propositoEdit.length}/500
              </span>
            </div>
            <Textarea
              id="edit-proposito"
              rows={4}
              value={propositoEdit}
              maxLength={500}
              onChange={(e) => setPropositoEdit(e.target.value)}
              disabled={isSubmitting}
              appearance="default"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelEditing}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )
              }
            >
              {isSubmitting
                ? "Guardando versión..."
                : `Guardar versión v${proyecto.version + 1}`}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Nombre en modo lectura */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Nombre del proyecto
            </span>
            <p className="text-base sm:text-lg font-heading font-bold text-foreground leading-snug">
              {proyecto.nombre}
            </p>
          </div>

          {/* Propósito en modo lectura */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Propósito institucional
            </span>
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
              {proyecto.proposito}
            </div>
          </div>
        </div>
      )}

      {/* Historial de Versiones (BPMN: Registrar nueva versión) */}
      {showHistorial && (
        <div className="rounded-xl border border-border/80 p-4 bg-muted/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <History className="size-3.5 text-primary" />
              Trazabilidad de versiones del proyecto
            </h3>
            <span className="text-[11px] text-muted-foreground">
              {proyecto.historialVersiones.length} versiones registradas
            </span>
          </div>

          <div className="space-y-2.5">
            {proyecto.historialVersiones.map((v) => (
              <div
                key={v.version}
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  v.version === proyecto.version
                    ? "bg-primary/5 border-primary/30"
                    : "bg-surface border-border/60"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={v.version === proyecto.version ? "primary" : "neutral"}
                      appearance="soft"
                      size="sm"
                      className="font-semibold text-xs px-2 py-0.5"
                    >
                      v{v.version}.0
                    </Badge>
                    <span className="font-semibold text-foreground">
                      {v.nombre}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="size-3" />
                    {v.fecha} · {v.modificadoPor}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] line-clamp-2">
                  {v.proposito}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modales de Edición y Trazabilidad */}
      <EditarProyectoDialog
        proyecto={proyecto}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        coordinadorNombre={coordinadorNombre}
        onProyectoActualizado={(actualizado) => {
          onProyectoActualizado?.(actualizado);
        }}
      />

      <TrazabilidadProyectoDialog
        proyecto={proyecto}
        open={isTrazabilidadDialogOpen}
        onOpenChange={setIsTrazabilidadDialogOpen}
      />
    </Card>
  );
}
