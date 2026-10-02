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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxItem,
} from "@/components/ui/combobox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  Building2,
  Info,
  AlertCircle,
  Save,
  User,
  Briefcase,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AreaDinarp, EstadoArea } from "../data/areas-types";

interface AreaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaToEdit?: AreaDinarp | null;
  onSave: (data: {
    codigo: string;
    nombre: string;
    descripcion: string;
    responsableNombre: string;
    responsableCargo: string;
    responsableCorreo: string;
    estadoInicial?: EstadoArea;
    motivo: string;
  }) => { success: boolean; error?: string };
}

const ESTADOS_INICIALES: { value: EstadoArea; label: string; tone: "warning" | "success"; desc: string }[] = [
  { value: "Borrador", label: "Borrador", tone: "warning", desc: "En formulación institucional (No visible en ID-01/ID-02)" },
  { value: "Activa", label: "Activa", tone: "success", desc: "Operativa inmediata (Disponible en ID-01/ID-02)" },
];

export function AreaFormModal({
  open,
  onOpenChange,
  areaToEdit,
  onSave,
}: AreaFormModalProps) {
  const isEditing = Boolean(areaToEdit);

  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [responsableNombre, setResponsableNombre] = useState("");
  const [responsableCargo, setResponsableCargo] = useState("");
  const [responsableCorreo, setResponsableCorreo] = useState("");
  const [estadoInicial, setEstadoInicial] = useState<EstadoArea>("Borrador");
  const [motivo, setMotivo] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (areaToEdit) {
      setCodigo(areaToEdit.codigo);
      setNombre(areaToEdit.nombre);
      setDescripcion(areaToEdit.descripcion);
      setResponsableNombre(areaToEdit.responsableNombre);
      setResponsableCargo(areaToEdit.responsableCargo);
      setResponsableCorreo(areaToEdit.responsableCorreo);
      setEstadoInicial(areaToEdit.estado);
      setMotivo("");
    } else {
      setCodigo("");
      setNombre("");
      setDescripcion("");
      setResponsableNombre("");
      setResponsableCargo("");
      setResponsableCorreo("");
      setEstadoInicial("Borrador");
      setMotivo("");
    }
    setErrors({});
  }, [areaToEdit, open]);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!codigo.trim()) {
      errs.codigo = "El código institucional es obligatorio.";
    } else if (!/^[A-Z0-9_]{2,20}$/.test(codigo.trim().toUpperCase())) {
      errs.codigo = "Solo mayúsculas, números y guión bajo (2 a 20 caracteres).";
    }

    if (!nombre.trim()) {
      errs.nombre = "El nombre del área es obligatorio.";
    } else if (nombre.trim().length < 5) {
      errs.nombre = "Debe tener al menos 5 caracteres.";
    }

    if (!descripcion.trim()) {
      errs.descripcion = "La descripción de atribuciones es obligatoria.";
    } else if (descripcion.trim().length < 15) {
      errs.descripcion = "Debe tener al menos 15 caracteres.";
    }

    if (!responsableNombre.trim()) {
      errs.responsableNombre = "El nombre del responsable es obligatorio.";
    }

    if (!responsableCargo.trim()) {
      errs.responsableCargo = "El cargo institucional es obligatorio.";
    }

    if (!responsableCorreo.trim()) {
      errs.responsableCorreo = "El correo institucional es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsableCorreo.trim())) {
      errs.responsableCorreo = "Formato de correo electrónico inválido.";
    } else if (
      !responsableCorreo.trim().endsWith("@dinarp.gob.ec") &&
      !responsableCorreo.trim().endsWith("@glocation.com.co")
    ) {
      errs.responsableCorreo = "Debe pertenecer al dominio institucional (@dinarp.gob.ec).";
    }

    if (!motivo.trim()) {
      errs.motivo = "El motivo es obligatorio para el registro de trazabilidad.";
    } else if (motivo.trim().length < 10) {
      errs.motivo = "Ingrese un motivo detallado (mínimo 10 caracteres).";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const res = onSave({
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      responsableNombre: responsableNombre.trim(),
      responsableCargo: responsableCargo.trim(),
      responsableCorreo: responsableCorreo.trim().toLowerCase(),
      estadoInicial,
      motivo: motivo.trim(),
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        isEditing
          ? "Área actualizada exitosamente"
          : "Área orgánica creada exitosamente",
        {
          description: isEditing
            ? `Se actualizó la ficha orgánica de ${nombre} y se generó un nuevo registro en la trazabilidad.`
            : `El área [${codigo.toUpperCase()}] fue registrada en estado ${estadoInicial}.`,
        }
      );
      onOpenChange(false);
    } else {
      toast.error("Error al guardar área", {
        description: res.error || "Verifique los datos ingresados.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-heading text-foreground">
                {isEditing ? "Editar Área DINARP" : "Crear Nueva Área Orgánica"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Modifique los datos institucionales del área [${areaToEdit?.codigo}]. Se incrementará la versión para trazabilidad.`
                  : "Complete los datos para dar de alta una nueva área en el catálogo orgánico de DINARP."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Fila 1: Código y Nombre con InputGroup del UI Kit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="area-codigo" className="text-xs font-semibold text-foreground">
                  Código orgánico
                  <span className="text-danger ml-0.5">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground cursor-help"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent variant="surface" className="text-xs max-w-xs">
                    Identificador único de la dirección o unidad (ej: DGR, DN, DTD). No modificable una vez creado.
                  </TooltipContent>
                </Tooltip>
              </div>

              <InputGroup state={errors.codigo ? "error" : "default"} size="sm" className="w-full">
                <InputGroupAddon>
                  <Building2 className="size-3.5 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  id="area-codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="EJ: DGR, DN"
                  disabled={isEditing}
                  className="font-mono uppercase font-bold text-xs"
                />
              </InputGroup>

              {errors.codigo && (
                <div className="flex items-center gap-1 text-danger text-[11px]">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{errors.codigo}</span>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="area-nombre" className="text-xs font-semibold text-foreground">
                Nombre de la dirección o unidad
                <span className="text-danger ml-0.5">*</span>
              </Label>

              <InputGroup state={errors.nombre ? "error" : "default"} size="sm" className="w-full">
                <InputGroupInput
                  id="area-nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="EJ: Dirección de Gestión y Registro"
                  className="text-xs"
                />
              </InputGroup>

              {errors.nombre && (
                <div className="flex items-center gap-1 text-danger text-[11px]">
                  <AlertCircle className="size-3 shrink-0" />
                  <span>{errors.nombre}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fila 2: Descripción con Textarea del UI Kit */}
          <div className="space-y-1.5">
            <Label htmlFor="area-desc" className="text-xs font-semibold text-foreground">
              Descripción de funciones y competencias
              <span className="text-danger ml-0.5">*</span>
            </Label>
            <Textarea
              id="area-desc"
              rows={2}
              state={errors.descripcion ? "error" : "default"}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el alcance de funciones, atribuciones registrales o tecnológicas..."
              className="text-xs resize-none"
            />
            {errors.descripcion && (
              <div className="flex items-center gap-1 text-danger text-[11px]">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.descripcion}</span>
              </div>
            )}
          </div>

          {/* Fila 3: Responsable con InputGroups del UI Kit */}
          <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border space-y-3">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Responsable / Titular institucional</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="area-resp-nombre" className="text-[11px] font-medium text-muted-foreground">
                  Nombres completos *
                </Label>
                <InputGroup state={errors.responsableNombre ? "error" : "default"} size="sm" className="w-full">
                  <InputGroupAddon>
                    <User className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="area-resp-nombre"
                    value={responsableNombre}
                    onChange={(e) => setResponsableNombre(e.target.value)}
                    placeholder="EJ: Abg. Roberto Salazar"
                    className="text-xs"
                  />
                </InputGroup>
                {errors.responsableNombre && (
                  <p className="text-danger text-[10px]">{errors.responsableNombre}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="area-resp-cargo" className="text-[11px] font-medium text-muted-foreground">
                  Cargo institucional *
                </Label>
                <InputGroup state={errors.responsableCargo ? "error" : "default"} size="sm" className="w-full">
                  <InputGroupAddon>
                    <Briefcase className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="area-resp-cargo"
                    value={responsableCargo}
                    onChange={(e) => setResponsableCargo(e.target.value)}
                    placeholder="EJ: Director de Gestión"
                    className="text-xs"
                  />
                </InputGroup>
                {errors.responsableCargo && (
                  <p className="text-danger text-[10px]">{errors.responsableCargo}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="area-resp-correo" className="text-[11px] font-medium text-muted-foreground">
                  Correo institucional *
                </Label>
                <InputGroup state={errors.responsableCorreo ? "error" : "default"} size="sm" className="w-full">
                  <InputGroupAddon>
                    <Mail className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="area-resp-correo"
                    type="email"
                    value={responsableCorreo}
                    onChange={(e) => setResponsableCorreo(e.target.value)}
                    placeholder="usuario@dinarp.gob.ec"
                    className="text-xs font-mono"
                  />
                </InputGroup>
                {errors.responsableCorreo && (
                  <p className="text-danger text-[10px]">{errors.responsableCorreo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Estado inicial con Combobox del UI Kit */}
          {!isEditing && (
            <div className="p-3 rounded-xl bg-surface-subtle/50 border border-border space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold text-foreground">
                    Estado inicial al registrar
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Solo un área en estado Activa puede ser asignada en creación/edición de cuentas internas.
                  </p>
                </div>

                <div className="w-full sm:w-[220px]">
                  <Combobox
                    value={estadoInicial}
                    onValueChange={(val) => {
                      if (val === "Borrador" || val === "Activa") {
                        setEstadoInicial(val);
                      }
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Seleccionar estado..."
                      showClear={false}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="z-[90] min-w-[240px]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Estados permitidos al crear</ComboboxLabel>
                          {ESTADOS_INICIALES.map((item) => (
                            <ComboboxItem
                              key={item.value}
                              value={item.value}
                              className="text-xs py-2 cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full gap-2">
                                <span className="font-semibold text-foreground">{item.label}</span>
                                <Badge tone={item.tone} appearance="soft" size="sm">
                                  {item.value === "Activa" ? "Operativa" : "Formulación"}
                                </Badge>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            </div>
          )}

          {/* Motivo de la acción con Textarea del UI Kit */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="area-motivo" className="text-xs font-semibold text-foreground">
                Motivo / Justificación institucional
                <span className="text-danger ml-0.5">*</span>
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-muted-foreground hover:text-foreground cursor-help"
                  >
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent variant="surface" className="text-xs max-w-xs">
                  Este texto queda registrado permanentemente en la trazabilidad y auditoría del área.
                </TooltipContent>
              </Tooltip>
            </div>

            <Textarea
              id="area-motivo"
              rows={2}
              state={errors.motivo ? "error" : "default"}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="EJ: Actualización de competencias conforme al Estatuto Orgánico 2026..."
              className="text-xs resize-none"
            />
            {errors.motivo && (
              <div className="flex items-center gap-1 text-danger text-[11px]">
                <AlertCircle className="size-3 shrink-0" />
                <span>{errors.motivo}</span>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex sm:justify-between items-center gap-2">
            <Button
              type="button"
              variant="neutral"
              size="default"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="default"
              disabled={isSubmitting}
              className="gap-2"
            >
              <Save className="size-4" />
              <span>{isEditing ? "Guardar cambios" : "Crear área"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
