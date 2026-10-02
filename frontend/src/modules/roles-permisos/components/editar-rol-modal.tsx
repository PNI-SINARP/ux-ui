"use client";

import React, { useState, useEffect } from "react";
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
import {
  Edit3,
  Check,
  AlertCircle,
  Layers,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Rol,
  CATALOGO_CAPACIDADES,
  useRolesStore,
} from "@/modules/roles-permisos/data/roles-store";

interface EditarRolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: Rol | null;
  onSuccess?: () => void;
}

export function EditarRolModal({
  open,
  onOpenChange,
  rol,
  onSuccess,
}: EditarRolModalProps) {
  const { editarRol } = useRolesStore();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [motivo, setMotivo] = useState("");
  const [selectedCaps, setSelectedCaps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rol) {
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion);
      setMotivo("");
      setSelectedCaps(rol.capacidades.map((c) => c.codigo));
      setError(null);
    }
  }, [rol, open]);

  if (!rol) return null;

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

    if (!nombre.trim()) {
      setError("El nombre descriptivo del rol es obligatorio.");
      return;
    }
    if (!descripcion.trim()) {
      setError("La descripción del rol es obligatoria.");
      return;
    }
    if (selectedCaps.length === 0) {
      setError("Debe mantener al menos una capacidad autorizada asignada al rol.");
      return;
    }
    if (!motivo.trim()) {
      setError("El motivo de la modificación es obligatorio para el registro de auditoría.");
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = editarRol(rol.id, {
        nombre,
        descripcion,
        capacidadesCodigos: selectedCaps,
        motivo,
      });

      // Feedback Success solo después de persistir correctamente
      toast.success(
        `Rol '${updated?.nombre}' actualizado correctamente a versión ${updated?.version}.`
      );

      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar el rol.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="standard"
        size="3xl"
        className="p-6 sm:p-7 max-h-[90vh] flex flex-col overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col w-full flex-1 min-h-0 overflow-hidden">
          <DialogHeader className="shrink-0 text-left border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Edit3 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-heading text-foreground">
                  Editar rol: {rol.codigo}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Modifica las directivas operativas y capacidades. Se generará una nueva versión auditada.
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

          {/* Fila 1: Código (Solo lectura) y Nombre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Código del rol (Inmutable)
              </Label>
              <Input
                value={rol.codigo}
                disabled
                className="font-mono text-xs bg-muted/50 cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground">
                El código de rol no puede alterarse para preservar integridad referencial.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-rol-nombre" className="text-xs font-semibold text-foreground">
                Nombre público del rol <span className="text-danger">*</span>
              </Label>
              <Input
                id="edit-rol-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="text-xs"
                disabled={isSubmitting}
              />
              <p className="text-[11px] text-muted-foreground">
                Denominación institucional visible.
              </p>
            </div>
          </div>

          {/* Fila 2: Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-rol-desc" className="text-xs font-semibold text-foreground">
              Descripción del rol <span className="text-danger">*</span>
            </Label>
            <Textarea
              id="edit-rol-desc"
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-xs resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Fila 3: Capacidades */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                Capacidades autorizadas ({selectedCaps.length} asignadas){" "}
                <span className="text-danger">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Haz clic para activar o retirar capacidades
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
            <Label htmlFor="edit-rol-motivo" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              Motivo del cambio de capacidades (Auditoría obligatoria) <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-rol-motivo"
              placeholder="Ej. Inclusión de capacidad de revisión técnica por reorganización del equipo DGR"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="text-xs bg-background"
              disabled={isSubmitting}
            />
            <p className="text-[11px] text-muted-foreground">
              Esta justificación quedará registrada junto con el autor y la nueva versión incremental.
            </p>
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
              Guardar cambios y versionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
