"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Building,
  User,
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
import { Stepper, Step } from "@/components/ui/stepper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

const STEPS: Step[] = [
  { id: "paso-1", title: "Datos personales" },
  { id: "paso-2", title: "Rol y asignación" },
  { id: "paso-3", title: "Confirmación" },
];

export function CuentasInternasNuevaView() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/cuentas-internas");
  }, [router]);

  const { crearUsuarioInterno, usuarios } = useUsuariosStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Pasos del formulario
  const [activeStep, setActiveStep] = useState(0);

  // Estados del formulario
  const [cedula, setCedula] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolInterno>("EQ_GESTION");
  const [ambitoCodigo, setAmbitoCodigo] = useState("DGR");
  // Estados de errores y toque por campo
  const [errors, setErrors] = useState<{
    cedula?: string;
    correo?: string;
    nombreCompleto?: string;
    rol?: string;
    ambitoCodigo?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string>("");
  const [createdUser, setCreatedUser] = useState<UsuarioInterno | null>(null);

  // Referencias para accesibilidad y foco por teclado
  const stepHeaderRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const cedulaInputRef = useRef<HTMLInputElement>(null);
  const correoInputRef = useRef<HTMLInputElement>(null);
  const nombreInputRef = useRef<HTMLInputElement>(null);

  // Configuración de rol y ámbitos institucionales permitidos (Solo áreas Activas conforme a regla)
  const rolConfigActual = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol);
  const ambitosPermitidos = (rolConfigActual?.ambitosPermitidos || []).filter((a) => a.activa !== false);

  const handleRolChange = (nuevoRol: RolInterno) => {
    setRol(nuevoRol);
    setErrors((prev) => ({ ...prev, rol: undefined }));
    const config = ROLES_INTERNOS_CATALOGO.find((r) => r.id === nuevoRol);
    const ambitosActivos = (config?.ambitosPermitidos || []).filter((a) => a.activa !== false);
    if (ambitosActivos.length > 0) {
      setAmbitoCodigo(ambitosActivos[0].codigo);
      setErrors((prev) => ({ ...prev, ambitoCodigo: undefined }));
    }
  };

  // Validaciones dinámicas por campo
  const validateCedula = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return "La cédula de identidad es obligatoria.";
    if (!/^\d+$/.test(clean)) return "La cédula debe contener solo números.";
    if (clean.length < 10) return `Debe tener 10 dígitos numéricos (${clean.length}/10).`;
    if (clean.length > 10) return "La cédula no puede superar 10 dígitos.";
    if (usuarios.some((u) => u.cedula === clean)) {
      return "La cédula de identidad ingresada ya se encuentra registrada en el sistema.";
    }
    return null;
  };

  const validateCorreo = (val: string): string | null => {
    const clean = val.trim();
    if (!clean) return "El correo electrónico institucional es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return "Ingresa un correo institucional con formato válido (ej. usuario@dinarp.gob.ec).";
    }
    if (usuarios.some((u) => u.correo.toLowerCase() === clean.toLowerCase())) {
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

  const validateRol = (val: string): string | null => {
    if (!val) return "Debes seleccionar un rol institucional permitido.";
    return null;
  };

  const validateAmbito = (val: string): string | null => {
    if (!val) return "Debes seleccionar un ámbito institucional asignado.";
    return null;
  };

  // Manejadores con validación dinámica en tiempo real
  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setCedula(val);
    if (touched.cedula || val.length > 0) {
      const err = validateCedula(val);
      setErrors((prev) => ({ ...prev, cedula: err || undefined }));
    }
  };

  const handleCedulaBlur = () => {
    setTouched((prev) => ({ ...prev, cedula: true }));
    const err = validateCedula(cedula);
    setErrors((prev) => ({ ...prev, cedula: err || undefined }));
  };

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

  // Validación del Paso 1
  const validateStep1 = () => {
    const cedulaErr = validateCedula(cedula);
    const correoErr = validateCorreo(correo);
    const nombreErr = validateNombre(nombreCompleto);

    setTouched((prev) => ({
      ...prev,
      cedula: true,
      correo: true,
      nombreCompleto: true,
    }));

    setErrors((prev) => ({
      ...prev,
      cedula: cedulaErr || undefined,
      correo: correoErr || undefined,
      nombreCompleto: nombreErr || undefined,
    }));

    if (cedulaErr) {
      cedulaInputRef.current?.focus();
      return false;
    }
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

  // Validación del Paso 2
  const validateStep2 = () => {
    const rolErr = validateRol(rol);
    const ambitoErr = validateAmbito(ambitoCodigo);

    setTouched((prev) => ({
      ...prev,
      rol: true,
      ambitoCodigo: true,
    }));

    setErrors((prev) => ({
      ...prev,
      rol: rolErr || undefined,
      ambitoCodigo: ambitoErr || undefined,
    }));

    if (rolErr || ambitoErr) return false;
    return true;
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!validateStep1()) return;
      setActiveStep(1);
      setTimeout(() => stepHeaderRef.current?.focus(), 100);
    } else if (activeStep === 1) {
      if (!validateStep2()) return;
      setActiveStep(2);
      setTimeout(() => stepHeaderRef.current?.focus(), 100);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      setTimeout(() => stepHeaderRef.current?.focus(), 100);
    }
  };

  // Manejador del submit final
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2()) return;

    const res = crearUsuarioInterno({
      cedula: cedula.trim(),
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      rol,
      ambitoCodigo,
      actor: currentUser.name,
    });

    if (!res.ok) {
      toast.error("No se pudo crear la cuenta", {
        description: res.error || "Error al registrar la cuenta interna.",
      });
      return;
    }

    if (res.usuario) {
      setCreatedUser(res.usuario);
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="cuentas-internas"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Cuentas internas", href: "/cuentas-internas" },
        { label: "Crear cuenta" },
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
                Nueva cuenta interna
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal mt-0.5">
                Registro de cuenta de acceso institucional para funcionarios de DINARP.
              </p>
            </div>

            <Badge tone="warning" appearance="soft" size="md" className="self-start sm:self-center font-semibold">
              Estado inicial: Pendiente de activación
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
                      } else if (index === 2 && activeStep === 1) {
                        if (validateStep2()) setActiveStep(2);
                      }
                    }}
                  />
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                  {/* PASO 1: DATOS PERSONALES */}
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
                            Paso 1: Datos de identidad y contacto
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
                            title="Requisitos de registro"
                            description="La cédula debe tener exactamente 10 dígitos y se valida contra duplicados existentes. El correo institucional recibirá el enlace seguro temporal para establecer credenciales de acceso."
                          />
                        </Tooltip>
                      </div>

                      <div className="p-6 sm:p-8 space-y-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Cédula */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="cedula" className="text-xs font-semibold text-foreground">
                                Cédula de identidad (10 dígitos) <span className="text-warning">*</span>
                              </Label>
                              <span
                                className={cn(
                                  "text-[11px] font-mono transition-colors",
                                  cedula.length === 10 && !errors.cedula
                                    ? "text-success font-semibold"
                                    : errors.cedula
                                      ? "text-destructive font-semibold"
                                      : "text-muted-foreground"
                                )}
                              >
                                {cedula.length}/10
                              </span>
                            </div>
                            <Input
                              ref={cedulaInputRef}
                              id="cedula"
                              type="text"
                              inputMode="numeric"
                              maxLength={10}
                              placeholder="Ej. 1712345678"
                              value={cedula}
                              onChange={handleCedulaChange}
                              onBlur={handleCedulaBlur}
                              aria-invalid={!!errors.cedula}
                              aria-describedby={errors.cedula ? "cedula-error" : undefined}
                              className="text-xs font-mono h-10"
                              required
                            />
                            {errors.cedula && (
                              <p
                                id="cedula-error"
                                className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-fade-in"
                                role="alert"
                              >
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>{errors.cedula}</span>
                              </p>
                            )}
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
                              placeholder="nombre.apellido@dinarp.gob.ec"
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
                              placeholder="Ej. Ing. Carlos Alberto Morales Pérez"
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
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PASO 2: ROL Y ASIGNACIÓN */}
                  {activeStep === 1 && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between p-4 sm:p-5 bg-primary/10 border-b border-primary/20">
                        <div className="flex items-center gap-2.5">
                          <Building className="size-5 text-primary shrink-0" />
                          <h2
                            ref={stepHeaderRef}
                            tabIndex={-1}
                            className="text-base sm:text-lg font-bold font-heading tracking-tight text-foreground outline-none"
                          >
                            Paso 2: Rol y asignación institucional
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
                            title="Asignación de atribuciones"
                            description="El rol define los permisos operativos en el portal. Las opciones de ámbito institucional se ajustan automáticamente a las direcciones compatibles con el rol seleccionado."
                          />
                        </Tooltip>
                      </div>

                      <div className="p-6 sm:p-8 space-y-6 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Selector de Rol */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">
                              Rol institucional permitido <span className="text-warning">*</span>
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
                              <ComboboxSelectTrigger
                                className={cn(
                                  "w-full text-xs h-10 bg-surface rounded-full px-4",
                                  errors.rol && "border-destructive ring-2 ring-destructive/20"
                                )}
                              />
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
                            {errors.rol && (
                              <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-fade-in" role="alert">
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>{errors.rol}</span>
                              </p>
                            )}
                          </div>

                          {/* Selector de Ámbito */}
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-foreground">
                              Ámbito institucional asignado <span className="text-warning">*</span>
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
                                if (item) {
                                  setAmbitoCodigo(item.value);
                                  setErrors((prev) => ({ ...prev, ambitoCodigo: undefined }));
                                }
                              }}
                            >
                              <ComboboxSelectTrigger
                                className={cn(
                                  "w-full text-xs h-10 bg-surface rounded-full px-4",
                                  errors.ambitoCodigo && "border-destructive ring-2 ring-destructive/20"
                                )}
                              />
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
                            {errors.ambitoCodigo && (
                              <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1 animate-fade-in" role="alert">
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>{errors.ambitoCodigo}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Aviso institucional */}
                        <div className="p-4 rounded-xl bg-info/10 border border-info/20 text-xs space-y-1.5 text-foreground">
                          <div className="flex items-center gap-2 font-bold text-info">
                            <Info className="size-4 shrink-0" />
                            <span>Regla de exclusión institucional:</span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Este registro corresponde exclusivamente a cuentas de funcionarios internos de DINARP. La calidad de Coordinador SINARP no puede asignarse aquí, dado que corresponde a delegados de instituciones externas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PASO 3: CONFIRMACIÓN Y ACTIVACIÓN */}
                  {activeStep === 2 && (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between p-4 sm:p-5 bg-primary/10 border-b border-primary/20">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="size-5 text-primary shrink-0" />
                          <h2
                            ref={stepHeaderRef}
                            tabIndex={-1}
                            className="text-base sm:text-lg font-bold font-heading tracking-tight text-foreground outline-none"
                          >
                            Paso 3: Revisión de datos y confirmación
                          </h2>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center size-8 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                              aria-label="Información complementaria del Paso 3"
                            >
                              <Info className="size-4" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            variant="surface"
                            title="Activación inicial"
                            description="Al crear la cuenta, el funcionario recibirá un correo con el enlace para definir su contraseña y vincular Google Authenticator como segundo factor."
                          />
                        </Tooltip>
                      </div>

                      <div className="p-6 sm:p-8 space-y-6 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 rounded-xl bg-muted/40 border border-border/70 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[11px] font-medium">Funcionario:</span>
                            <span className="font-bold text-foreground text-sm">{nombreCompleto}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px] font-medium">Cédula de identidad:</span>
                            <span className="font-mono font-medium text-foreground text-sm">{cedula}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px] font-medium">Correo institucional:</span>
                            <span className="font-medium text-foreground text-sm">{correo}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px] font-medium">Rol asignado:</span>
                            <span className="font-semibold text-primary text-sm">{rolConfigActual?.nombre || rol}</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-muted-foreground block text-[11px] font-medium">Ámbito asignado:</span>
                            <span className="font-medium text-foreground text-sm">
                              {ambitosPermitidos.find((a) => a.codigo === ambitoCodigo)?.nombre || ambitoCodigo}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/80 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-foreground">
                            <ShieldCheck className="size-4 text-success" />
                            <span>Procedimiento de activación institucional</span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Al confirmar, la cuenta quedará registrada en estado <strong>Pendiente de activación</strong> y se enviará el enlace de un solo uso para establecer la contraseña y vincular el segundo factor de autenticación.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Footer con Botones del UI Kit: primary siguiente, secondary anterior, neutral atras */}
                  <div className="p-4 sm:p-6 bg-muted/20 border-t border-border/80 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      <Button
                        variant="neutral"
                        size="default"
                        asChild
                        leftIcon={<ArrowLeft className="size-4" />}
                      >
                        <Link href="/cuentas-internas">Volver a cuentas internas</Link>
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
                      {activeStep < 2 ? (
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
                          leftIcon={<UserPlus className="size-4" />}
                          className="w-full sm:w-auto font-semibold"
                        >
                          Crear cuenta interna
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </TooltipProvider>

            {/* Modal Dialog Variant Success de Confirmación */}
            {createdUser && (
              <Dialog
                open={Boolean(createdUser)}
                onOpenChange={(open) => {
                  if (!open) {
                    router.push("/cuentas-internas");
                  }
                }}
              >
                <DialogContent
                  variant="success"
                  size="lg"
                  className="sm:max-w-xl"
                  showCloseButton={true}
                >
                  <DialogHeader className="text-center items-center">
                    <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                      ¡Cuenta interna registrada exitosamente!
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1 leading-relaxed text-center">
                      La cuenta ha quedado creada en el sistema en estado{" "}
                      <strong className="text-foreground font-semibold">
                        Pendiente de activación
                      </strong>.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 sm:p-5 rounded-xl bg-muted/40 border border-border/80 text-xs text-left my-2">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Funcionario:</span>
                      <span className="font-bold text-foreground text-sm">{createdUser.nombreCompleto}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Cédula de identidad:</span>
                      <span className="font-mono font-medium text-foreground">{createdUser.cedula}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Correo institucional validado:</span>
                      <span className="font-medium text-foreground">{createdUser.correo}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Rol institucional:</span>
                      <span className="font-semibold text-primary">{createdUser.rolLabel}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[11px]">Ámbito institucional:</span>
                      <span className="font-medium text-foreground">{createdUser.ambito}</span>
                    </div>
                  </div>

                  <DialogFooter className="w-full flex flex-col-reverse sm:flex-row gap-2 pt-2" showCloseButton={false}>
                    <Button
                      variant="neutral"
                      size="default"
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link href="/cuentas-internas">
                        Volver a cuentas internas
                      </Link>
                    </Button>
                    <Button
                      variant="primary"
                      size="default"
                      asChild
                      className="w-full sm:w-auto font-semibold"
                    >
                      <Link href={`/cuentas-internas/${createdUser.id}`}>
                        Ver expediente de la cuenta
                      </Link>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
