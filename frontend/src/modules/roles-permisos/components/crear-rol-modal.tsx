"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ShieldPlus,
  Check,
  AlertCircle,
  Layers,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CATALOGO_CAPACIDADES,
  useRolesStore,
} from "@/modules/roles-permisos/data/roles-store";

interface CrearRolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CrearRolModal({
  open,
  onOpenChange,
  onSuccess,
}: CrearRolModalProps) {
  const { crearRol } = useRolesStore();

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [iniciarComoActivo, setIniciarComoActivo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCodigo("");
    setNombre("");
    setDescripcion("");
    setMotivo("");
    setSelectedCaps([]);
    setIniciarComoActivo(false);
    setError(null);
    setIsSubmitting(false);
  };

  const handleToggleCap = (capCodigo: string) => {
    setSelectedCaps((prev) =>
      prev.includes(capCodigo)
        ? prev.filter((c) => c !== capCodigo)
        : [...prev, capCodigo]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!codigo.trim()) {
      setError("El código institucional del rol es obligatorio.");
      return;
    }
    if (!nombre.trim()) {
      setError("El nombre descriptivo del rol es obligatorio.");
      return;
    }
    if (!descripcion.trim()) {
      setError("La descripción del rol es obligatoria.");
      return;
    }
    if (selectedCaps.length === 0) {
      setError("Debe asociar al menos una capacidad autorizada al rol.");
      return;
    }
    if (!motivo.trim()) {
      setError("El motivo o justificación técnica para la auditoría es obligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      const nuevo = crearRol({
        codigo,
        nombre,
        descripcion,
        capacidadesCodigos: selectedCaps,
        motivo,
        iniciarComoActivo,
      });

      // Solo después de persistir correctamente (Regla de negocio)
      toast.success(
        `Rol '${nuevo.nombre}' creado exitosamente en estado ${nuevo.estado}.`
      );

      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear el rol.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
      }}
    >
      <DialogContent
        variant="standard"
        size="3xl"
        className="p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col w-full flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="shrink-0 text-left border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldPlus className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-heading text-foreground">
                  Crear nuevo rol institucional
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Define las capacidades, directivas de seguridad y registro de auditoría para el nuevo rol de usuario.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-4 space-y-5 flex-1 min-h-0">
          {error && (
            <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/30 text-danger text-xs flex items-start gap-2.5">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Fila 1: Código y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rol-codigo" className="text-xs font-semibold text-foreground">
                Código del rol <span className="text-danger">*</span>
              </Label>
              <Input
                id="rol-codigo"
                placeholder="Ej. ANALISTA_NORMATIVA"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                className="font-mono text-xs uppercase"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador único sin espacios (convención SNA/SURI).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rol-nombre" className="text-xs font-semibold text-foreground">
                Nombre público del rol <span className="text-danger">*</span>
              </Label>
              <Input
                id="rol-nombre"
                placeholder="Ej. Analista de Cumplimiento Jurídico"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="text-xs"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Denominación oficial visible en perfiles de funcionario.
              </p>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="rol-desc" className="text-xs font-semibold text-foreground">
              Descripción del alcance y propósito <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="rol-desc"
              rows={2}
              placeholder="Describe el ámbito operativo, atribuciones y responsabilidades institucionales del rol..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-xs resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Fila 3: Capacidades autorizadas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Capacidades autorizadas ({selectedCaps.length} seleccionadas){" "}
                <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Selecciona los privilegios que conferirá este rol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 border border-border rounded-xl bg-surface/50">
              {CATALOGO_CAPACIDADES.map((cap) => {
                const isChecked = selectedCaps.includes(cap.codigo);
                return (
                  <div
                    key={cap.codigo}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleCap(cap.codigo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleCap(cap.codigo);
                      }
                    }}
                    className={cn(
                      "p-3 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between gap-2 select-none",
                      isChecked
                        ? "bg-primary/10 border-primary ring-1 ring-primary/40 shadow-2xs"
                        : "bg-surface hover:bg-muted/40 border-border/80"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[11px] font-bold text-foreground block">
                          {cap.codigo}
                        </span>
                        <p className="text-xs font-semibold text-foreground">
                          {cap.nombre}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "size-5 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                          isChecked
                            ? "bg-primary text-white border-primary"
                            : "border-border bg-background"
                        )}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge tone="info" appearance="outline" size="sm" className="text-[9px]">
                        {cap.accion}
                      </Badge>
                      <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px]">
                        {cap.ambito}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {cap.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fila 4: Motivo de auditoría obligatorio */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/40 border border-border">
            <Label htmlFor="rol-motivo" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Motivo o justificación de creación (Auditoría) <span className="text-danger">*</span>
            </Label>
            <Input
              id="rol-motivo"
              placeholder="Ej. Creación de rol por solicitud de Dirección de Normativa (Memo DINARP-2026-089)"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="text-xs bg-background"
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Quedará registrado de forma inmutable con su usuario, fecha y versión.
            </p>
          </div>

          {/* Fila 5: Estado inicial */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block">
                Publicar como rol Activo de inmediato
              </span>
              <p className="text-[11px] text-muted-foreground">
                Si está desactivado, el rol se guardará como <strong>Borrador</strong> para revisión previa.
              </p>
            </div>
            <Switch
              checked={iniciarComoActivo}
              onCheckedChange={setIniciarComoActivo}
              variant="primary"
              disabled={isSubmitting}
            />
          </div>

          </div>

          <DialogFooter className="shrink-0 mt-3 pt-4 border-t border-border flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Guardar rol
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
