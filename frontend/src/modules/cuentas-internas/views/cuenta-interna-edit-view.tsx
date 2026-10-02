"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Building,
  User,
  AlertTriangle,
  AlertCircle,
  Save,
  ShieldCheck,
  Info,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Stepper, Step } from "@/components/ui/stepper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useUsuariosStore,
  UsuarioInterno,
  RolInterno,
  ROLES_INTERNOS_CATALOGO,
} from "@/modules/usuarios/data/usuarios-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface CuentaInternaEditClientProps {
  id: string;
}

const STEPS: Step[] = [
  { id: "paso-1", title: "Datos y asignación" },
  { id: "paso-2", title: "Justificación y guardado" },
];

export function CuentaInternaEditView({ id }: CuentaInternaEditClientProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/cuentas-internas/${id}`);
  }, [router, id]);

  const { usuarios, editarUsuario } = useUsuariosStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Buscar usuario
  const usuario = useMemo(() => {
    return (
      usuarios.find((u) => u.id === id || u.cedula === id) ||
      usuarios.find((u) => u.id === "USR-INT-001") ||
      null
    );
  }, [usuarios, id]);

  // Pasos del formulario
  const [activeStep, setActiveStep] = useState(0);

  // Estados del formulario
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolInterno>("EQ_GESTION");
  const [ambitoCodigo, setAmbitoCodigo] = useState("DGR");
  const [motivo, setMotivo] = useState("");
  // Estados de errores y toque por campo
  const [errors, setErrors] = useState<{
    correo?: string;
    nombreCompleto?: string;
    rol?: string;
    ambitoCodigo?: string;
    motivo?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Referencias para accesibilidad y autofoco en inputs con error
  const stepHeaderRef = useRef<HTMLHeadingElement>(null);
  const correoInputRef = useRef<HTMLInputElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const motivoInputRef = useRef<HTMLTextAreaElement>(null);

  // Inicializar formulario cuando cargue el usuario
  useEffect(() => {
    if (usuario) {
      setNombreCompleto(usuario.nombreCompleto);
      setCorreo(usuario.correo);
      setRol(usuario.rol);
      setAmbitoCodigo(usuario.ambitoCodigo);
    }
  }, [usuario]);

  // Rol config actual y ámbitos permitidos (Solo áreas Activas conforme a regla)
  const rolConfigActual = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol);
  const ambitosPermitidos = (rolConfigActual?.ambitosPermitidos || []).filter((a) => a.activa !== false);

  const handleRolChange = (nuevoRol: RolInterno) => {
    setRol(nuevoRol);
    const config = ROLES_INTERNOS_CATALOGO.find((r) => r.id === nuevoRol);
    const ambitosActivos = (config?.ambitosPermitidos || []).filter((a) => a.activa !== false);
    if (ambitosActivos.length > 0) {
      const yaPermitido = ambitosActivos.some((a) => a.codigo === ambitoCodigo);
      if (!yaPermitido) {
        setAmbitoCodigo(ambitosActivos[0].codigo);
      }
    }
  };

  // Detección de cambio de autorización (rol o ámbito)
  const cambioAutorizacion = useMemo(() => {
    if (!usuario) return false;
    return usuario.rol !== rol || usuario.ambitoCodigo !== ambitoCodigo;
  }, [usuario, rol, ambitoCodigo]);

  // Validaciones dinámicas por campo
  const validateCorreo = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return "El correo electrónico institucional es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return "Ingresa un correo institucional con formato válido (ej. usuario@dinarp.gob.ec).";
    }
    if (usuarios.some((u) => u.id !== usuario?.id && u.correo.toLowerCase() === clean.toLowerCase())) {
      return "El correo institucional ya se encuentra asignado a otra cuenta.";
    }
    return null;
  };

  const validateNombre = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return "Los nombres y apellidos completos son obligatorios.";
    if (clean.length < 5) return "Ingresa nombres y apellidos completos (mínimo 5 caracteres).";
    return null;
  };

  const validateMotivo = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return "El motivo de la modificación es obligatorio para la bitácora de auditoría.";
    if (clean.length < 8) return `Detalla la justificación (mínimo 8 caracteres, actual: ${clean.length}/8).`;
    return null;
  };

  // Manejadores dinámicos con validación
  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCorreo(val);
    if (touched.correo) {
      const err = validateCorreo(val);
      setErrors((prev) => ({ ...prev, correo: err || undefined }));
    }
  };

  const handleCorreoBlur = () => {
    setTouched((prev) => ({ ...prev, correo: true }));
    const err = validateCorreo(correo);
    setErrors((prev) => ({ ...prev, correo: err || undefined }));
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNombreCompleto(val);
    if (touched.nombreCompleto) {
      const err = validateNombre(val);
      setErrors((prev) => ({ ...prev, nombreCompleto: err || undefined }));
    }
  };

  const handleNombreBlur = () => {
    setTouched((prev) => ({ ...prev, nombreCompleto: true }));
    const err = validateNombre(nombreCompleto);
    setErrors((prev) => ({ ...prev, nombreCompleto: err || undefined }));
  };

  const handleMotivoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMotivo(val);
    if (touched.motivo || val.length > 0) {
      const err = validateMotivo(val);
      setErrors((prev) => ({ ...prev, motivo: err || undefined }));
    }
  };

  const handleMotivoBlur = () => {
    setTouched((prev) => ({ ...prev, motivo: true }));
    const err = validateMotivo(motivo);
    setErrors((prev) => ({ ...prev, motivo: err || undefined }));
  };

  // Validaciones de pasos
  const validateStep1 = () => {
    const correoErr = validateCorreo(correo);
    const nombreErr = validateNombre(nombreCompleto);

    setTouched((prev) => ({
      ...prev,
      correo: true,
      nombreCompleto: true,
    }));

    setErrors((prev) => ({
      ...prev,
      correo: correoErr || undefined,
      nombreCompleto: nombreErr || undefined,
    }));

    if (correoErr) {
      correoInputRef.current?.focus();
      return false;
    }
    if (nombreErr) {
      nombreInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const motivoErr = validateMotivo(motivo);

    setTouched((prev) => ({
      ...prev,
      motivo: true,
    }));

    setErrors((prev) => ({
      ...prev,
      motivo: motivoErr || undefined,
    }));

    if (motivoErr) {
      motivoInputRef.current?.focus();
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
      setActiveStep(1);
      setTimeout(() => stepHeaderRef.current?.focus(), 100);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setTimeout(() => stepHeaderRef.current?.focus(), 100);
    }
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    if (!validateStep1() || !validateStep2()) return;

    setIsSaving(true);

    try {
      const res = editarUsuario(usuario.id, {
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        rol,
        ambitoCodigo,
        motivoCambio: motivo.trim(),
        actor: currentUser.name,
      });

      if (!res.ok) {
        toast.error("No se pudo actualizar la cuenta", {
          description: res.error || "Ocurrió un error al actualizar la cuenta.",
        });
        setIsSaving(false);
        return;
      }

      toast.success("Cuenta interna actualizada", {
        description: cambioAutorizacion
          ? `Se modificó la autorización de ${usuario.nombreCompleto}. Las sesiones activas han sido cerradas preventivamente.`
          : `Se actualizaron los datos institucionales de ${usuario.nombreCompleto}.`,
      });

      router.push(`/cuentas-internas/${usuario.id}`);
    } catch {
      toast.error("Error inesperado", {
        description: "Ocurrió un error inesperado al procesar la actualización.",
      });
      setIsSaving(false);
    }
  };

  if (!usuario) {
    return (
      <WireframeDashboardLayout
        activeMenu="cuentas-internas"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Cuentas internas", href: "/cuentas-internas" },
          { label: "Editar" },
        ]}
      >
        <div className="p-8 text-center space-y-4">
          <p className="text-base font-semibold text-foreground">Cuenta interna no encontrada</p>
          <Link href="/cuentas-internas">
            <Button variant="neutral" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Volver a cuentas internas
            </Button>
          </Link>
        </div>
      </WireframeDashboardLayout>
    );
  }

  return (
    <WireframeDashboardLayout
      activeMenu="cuentas-internas"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Cuentas internas", href: "/cuentas-internas" },
        { label: usuario.nombreCompleto, href: `/cuentas-internas/${usuario.id}` },
        { label: "Editar" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/80">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Editar cuenta interna
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal mt-0.5">
                Modificación de atribuciones, rol y datos de contacto institucional.
              </p>
            </div>

            <Badge tone="primary" appearance="soft" size="md" className="self-start sm:self-center font-mono">
              ID: {usuario.id}
            </Badge>
          </div>

          <TooltipProvider delayDuration={200}>
            {/* Contenedor Unificado del Proceso (ocupa todo el ancho, stepper y pasos integrados) */}
            <div className="w-full rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden flex flex-col">
              {/* 1. Stepper Integrado en Cabecera del Contenedor */}
              <div className="p-6 sm:p-8 bg-surface/50 border-b border-border/70 w-full">
                <Stepper
                  steps={STEPS}
                  activeStep={activeStep}
                  onStepClick={(index) => {
                    if (index < activeStep) {
                      setActiveStep(index);
                    } else if (index === 1 && activeStep === 0) {
                      if (validateStep1()) setActiveStep(1);
                    }
                  }}
                />
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                {/* PASO 1: DATOS Y ASIGNACIÓN */}
                {activeStep === 0 && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-primary/10 border-b border-primary/20">
                      <div className="flex items-center gap-2.5">
                        <User className="size-5 text-primary shrink-0" />
                        <h2
                          ref={stepHeaderRef}
                          tabIndex={-1}
                          className="text-base sm:text-lg font-bold font-heading tracking-tight text-foreground outline-none"
                        >
                          Paso 1: Identidad, contacto y atribuciones
                        </h2>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-8 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                            aria-label="Información complementaria del Paso 1"
                          >
                            <Info className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          variant="surface"
                          title="Información de edición"
                          description="La cédula es inmutable para asegurar la trazabilidad institucional. Si modificas el rol o el ámbito, las sesiones activas se cerrarán automáticamente por seguridad."
                        />
                      </Tooltip>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Cédula inmutable */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="cedula-disabled" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              <Lock className="size-3 text-muted-foreground" />
                              Cédula de identidad (No editable)
                            </Label>
                            <span className="text-[10px] text-muted-foreground font-semibold">Inmutable</span>
                          </div>
                          <Input
                            id="cedula-disabled"
                            type="text"
                            value={usuario.cedula}
                            disabled
                            readOnly
                            className="text-xs font-mono bg-muted/60 text-muted-foreground cursor-not-allowed select-none border-dashed h-10"
                          />
                        </div>

                        {/* Correo institucional */}
                        <div className="space-y-1.5">
                          <Label htmlFor="correo" className="text-xs font-semibold text-foreground">
                            Correo institucional <span className="text-warning">*</span>
                          </Label>
                          <Input
                            ref={correoInputRef}
                            id="correo"
                            type="email"
                            value={correo}
                            onChange={handleCorreoChange}
                            onBlur={handleCorreoBlur}
                            aria-invalid={!!errors.correo}
                            aria-describedby={errors.correo ? "correo-error" : undefined}
                            className="text-xs h-10"
                            required
                          />
                          {errors.correo && (
                            <p
                              id="correo-error"
                              className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-fade-in"
                              role="alert"
                            >
                              <AlertCircle className="size-3.5 shrink-0" />
                              <span>{errors.correo}</span>
                            </p>
                          )}
                        </div>

                        {/* Nombres completos */}
                        <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                          <Label htmlFor="nombreCompleto" className="text-xs font-semibold text-foreground">
                            Nombres y apellidos completos <span className="text-warning">*</span>
                          </Label>
                          <Input
                            ref={nombreInputRef}
                            id="nombreCompleto"
                            type="text"
                            value={nombreCompleto}
                            onChange={handleNombreChange}
                            onBlur={handleNombreBlur}
                            aria-invalid={!!errors.nombreCompleto}
                            aria-describedby={errors.nombreCompleto ? "nombreCompleto-error" : undefined}
                            className="text-xs h-10"
                            required
                          />
                          {errors.nombreCompleto && (
                            <p
                              id="nombreCompleto-error"
                              className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-fade-in"
                              role="alert"
                            >
                              <AlertCircle className="size-3.5 shrink-0" />
                              <span>{errors.nombreCompleto}</span>
                            </p>
                          )}
                        </div>

                        {/* Rol institucional */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-foreground">
                            Rol institucional asignado <span className="text-warning">*</span>
                          </Label>
                          <Combobox
                            items={ROLES_INTERNOS_CATALOGO.map((r) => ({
                              value: r.id,
                              label: r.nombre,
                            }))}
                            value={{
                              value: rol,
                              label: rolConfigActual?.nombre || rol,
                            }}
                            onValueChange={(item) => {
                              if (item) handleRolChange(item.value as RolInterno);
                            }}
                          >
                            <ComboboxSelectTrigger className="w-full text-xs h-10 bg-surface rounded-full px-4" />
                            <ComboboxContent className="min-w-[280px]">
                              <ComboboxList>
                                {ROLES_INTERNOS_CATALOGO.map((r) => (
                                  <ComboboxItem key={r.id} value={{ value: r.id, label: r.nombre }} title={r.nombre}>
                                    {r.nombre}
                                  </ComboboxItem>
                                ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </div>

                        {/* Ámbito institucional */}
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-foreground">
                            Ámbito institucional <span className="text-warning">*</span>
                          </Label>
                          <Combobox
                            items={ambitosPermitidos.map((a) => ({
                              value: a.codigo,
                              label: a.nombre,
                            }))}
                            value={{
                              value: ambitoCodigo,
                              label:
                                ambitosPermitidos.find((a) => a.codigo === ambitoCodigo)?.nombre ||
                                ambitoCodigo,
                            }}
                            onValueChange={(item) => {
                              if (item) setAmbitoCodigo(item.value);
                            }}
                          >
                            <ComboboxSelectTrigger className="w-full text-xs h-10 bg-surface rounded-full px-4" />
                            <ComboboxContent className="min-w-[320px]">
                              <ComboboxList>
                                {ambitosPermitidos.map((a) => (
                                  <ComboboxItem key={a.codigo} value={{ value: a.codigo, label: a.nombre }}>
                                    {a.nombre}
                                  </ComboboxItem>
                                ))}
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
                        </div>
                      </div>

                      {/* Advertencia preventiva si cambia la autorización */}
                      {cambioAutorizacion && (
                        <div className="p-4 rounded-xl bg-warning/15 border border-warning/30 text-xs space-y-1.5 text-warning-foreground animate-fade-in">
                          <div className="flex items-center gap-2 font-bold text-warning">
                            <AlertTriangle className="size-4 shrink-0" />
                            <span>Aviso de seguridad por cambio de autorización:</span>
                          </div>
                          <p className="text-xs leading-relaxed">
                            Has modificado el <strong>rol</strong> o el <strong>ámbito institucional</strong>. Al guardar los cambios, <strong>todas las sesiones activas del funcionario serán finalizadas inmediatamente</strong> en todos los dispositivos para forzar la actualización de permisos en su próximo ingreso.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PASO 2: JUSTIFICACIÓN Y CONFIRMACIÓN */}
                {activeStep === 1 && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between p-4 sm:p-5 bg-primary/10 border-b border-primary/20">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="size-5 text-primary shrink-0" />
                        <h2
                          ref={stepHeaderRef}
                          tabIndex={-1}
                          className="text-base sm:text-lg font-bold font-heading tracking-tight text-foreground outline-none"
                        >
                          Paso 2: Justificación y confirmación de cambios
                        </h2>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-8 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                            aria-label="Información complementaria del Paso 2"
                          >
                            <Info className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          variant="surface"
                          title="Trazabilidad oficial"
                          description="El motivo queda asentado en la bitácora de auditoría junto al autor administrativo, fecha y los valores anteriores de la cuenta."
                        />
                      </Tooltip>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6 flex-1">
                      {/* Resumen de cambios detectados */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 rounded-xl bg-muted/40 border border-border/70 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[11px] font-medium">Funcionario:</span>
                          <span className="font-bold text-foreground text-sm">{nombreCompleto}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] font-medium">Cédula:</span>
                          <span className="font-mono font-medium text-foreground text-sm">{usuario.cedula}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] font-medium">Correo:</span>
                          <span className="font-medium text-foreground text-sm">{correo}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[11px] font-medium">Rol nuevo / actual:</span>
                          <span className="font-semibold text-primary text-sm">
                            {rolConfigActual?.nombre || rol}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground block text-[11px] font-medium">Ámbito:</span>
                          <span className="font-medium text-foreground text-sm">
                            {ambitosPermitidos.find((a) => a.codigo === ambitoCodigo)?.nombre || ambitoCodigo}
                          </span>
                        </div>
                      </div>

                      {/* Motivo obligatorio */}
                      <div className="space-y-2 p-5 rounded-xl border border-primary/25 bg-primary/5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="motivo" className="text-xs font-bold text-foreground">
                            Motivo obligatorio de la modificación <span className="text-warning">*</span>
                          </Label>
                          <span
                            className={cn(
                              "text-[11px] font-mono transition-colors",
                              motivo.trim().length >= 8
                                ? "text-success font-semibold"
                                : errors.motivo
                                  ? "text-destructive font-semibold"
                                  : "text-muted-foreground"
                            )}
                          >
                            {motivo.trim().length} / 8 mín.
                          </span>
                        </div>
                        <Textarea
                          ref={motivoInputRef}
                          id="motivo"
                          placeholder="Detalla el memorando, encargo de funciones, cambio de coordinación o resolución que justifica la modificación..."
                          value={motivo}
                          onChange={handleMotivoChange}
                          onBlur={handleMotivoBlur}
                          state={errors.motivo ? "error" : "default"}
                          aria-invalid={!!errors.motivo}
                          aria-describedby={errors.motivo ? "motivo-error" : undefined}
                          className="text-xs min-h-[100px] bg-background"
                          required
                        />
                        {errors.motivo && (
                          <p
                            id="motivo-error"
                            className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1.5 animate-fade-in"
                            role="alert"
                          >
                            <AlertCircle className="size-3.5 shrink-0" />
                            <span>{errors.motivo}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer con Botones del UI Kit: primary siguiente, secondary anterior, neutral atras */}
                <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                      variant="neutral"
                      size="default"
                      asChild
                      leftIcon={<ArrowLeft className="size-4" />}
                    >
                      <Link href={`/cuentas-internas/${usuario.id}`}>
                        Volver al detalle de la cuenta
                      </Link>
                    </Button>

                    {activeStep > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        onClick={handlePrevStep}
                        leftIcon={<ChevronLeft className="size-4" />}
                      >
                        Paso anterior
                      </Button>
                    )}
                  </div>

                  <div className="w-full sm:w-auto">
                    {activeStep === 0 ? (
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        onClick={handleNextStep}
                        rightIcon={<ChevronRight className="size-4" />}
                        className="w-full sm:w-auto font-semibold"
                      >
                        Siguiente paso
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="primary"
                        size="default"
                        disabled={isSaving}
                        leftIcon={<Save className="size-4" />}
                        className="w-full sm:w-auto font-semibold"
                      >
                        {isSaving ? "Guardando..." : "Guardar cambios"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </TooltipProvider>
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
