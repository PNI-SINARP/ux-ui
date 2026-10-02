"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Building2,
  Mail,
  UserCheck,
  KeyRound,
  FileText,
  UserPlus,
  RefreshCw,
  Search,
  Check,
  Info,
  Users,
  Landmark,
  Fingerprint,
  FileSignature,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Card,
  CardTitle,
  CardDescription,
  CardDecorativeIcon,
} from "@/components/ui/card";
import { useSolicitudesIngresoStore } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { DinarpTestAccountsDrawer } from "./dinarp-test-accounts-drawer";

function validarCedula(cedula: string) {
  if (cedula.length !== 10) return false;
  if (/\D/.test(cedula)) return false;
  // Cédulas oficiales de prueba para roles del wireframe DINARP
  if (
    [
      "1799999999",
      "1711223344",
      "1111111111",
      "2222222222",
      "3333333333",
      "1712345678",
      "1714443322",
      "1714443376",
      "1715489621",
      "1712345602",
      "1724589632",
      "1718956234",
      "0999999999",
      "1788888888",
      "1234567890",
    ].includes(cedula)
  ) {
    return true;
  }

  const digitoRegion = parseInt(cedula.substring(0, 2), 10);
  if (digitoRegion < 1 || digitoRegion > 24) return false;
  const ultimoDigito = parseInt(cedula.substring(9, 10), 10);
  const pares =
    parseInt(cedula.substring(1, 2), 10) +
    parseInt(cedula.substring(3, 4), 10) +
    parseInt(cedula.substring(5, 6), 10) +
    parseInt(cedula.substring(7, 8), 10);
  let impares = 0;
  for (let i = 0; i < 9; i += 2) {
    let num = parseInt(cedula.charAt(i), 10) * 2;
    if (num > 9) num -= 9;
    impares += num;
  }
  const sumaTotal = pares + impares;
  const decenaInmediata = Math.ceil(sumaTotal / 10) * 10;
  let digitoValidador = decenaInmediata - sumaTotal;
  if (digitoValidador === 10) digitoValidador = 0;
  return digitoValidador === ultimoDigito;
}

function getCedulaErrorMessage(val: string) {
  if (!val) return null;
  if (/\D/.test(val)) return "Ingresa únicamente dígitos numéricos.";
  if (val.length < 10) return "La cédula debe contener exactamente 10 dígitos numéricos.";
  if (!validarCedula(val)) return "El número de cédula ingresado no es válido.";
  return null;
}

interface DinarpWireframe2LoginFlowProps {
  dashboardRoute?: string;
}

export function DinarpWireframe2LoginFlow({
  dashboardRoute = "/catalogo-interoperabilidad",
}: DinarpWireframe2LoginFlowProps) {
  const router = useRouter();
  const { buscarPreregistroPorCedula } = useSolicitudesIngresoStore();
  const { login } = useAuthStore();

  // Modo principal:
  // 1. "login": Iniciar sesión para usuarios/coordinadores con cuenta activa
  // 2. "enrolamiento": Completar enrolamiento mediante validación de cédula preregistrada (Proceso B)
  const [activeTab, setActiveTab] = useState<"login" | "enrolamiento">("login");

  // Estado del Login
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Estado 2FA / OTP
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Estado Verificación Enrolamiento (Proceso B)
  const [cedulaEnrolar, setCedulaEnrolar] = useState("");
  const [isSearchingPreregistro, setIsSearchingPreregistro] = useState(false);
  const [preregistroResultado, setPreregistroResultado] = useState<{
    buscado: boolean;
    valido: boolean;
    datos?: ReturnType<typeof buscarPreregistroPorCedula>;
    mensaje?: string;
  }>({ buscado: false, valido: false });

  // Manejo de Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanCedula = cedula.trim();

    if (!cleanCedula) {
      setLoginError("Ingresa tu número de cédula.");
      return;
    }
    if (!validarCedula(cleanCedula)) {
      setLoginError("La cédula no es válida o no está registrada en el sistema.");
      return;
    }
    if (password.length < 4) {
      setLoginError("Ingresa tu contraseña.");
      return;
    }

    setIsSubmittingLogin(true);

    // Simular validación de credenciales
    setTimeout(() => {
      setIsSubmittingLogin(false);

      if (cleanCedula === "1714443322" || cleanCedula === "1714443376") {
        login(cleanCedula);
        toast.info("Contraseña temporal detectada", {
          description: "Debes cambiar tu contraseña temporal antes de ingresar al portal.",
        });
        router.push("/cambiar-contrasena-temporal?cedula=1714443322");
        return;
      }

      // Simular usuario conocido de demo o acceso general
      setIsOtpStep(true);
      toast.info("Verificación en dos pasos", {
        description: "Ingresa el código que aparece en Google Authenticator.",
      });
    }, 500);
  };

  // Manejo de OTP
  const handleOtpChange = (index: number, value: string) => {
    const cleanDigits = value.replace(/\D/g, "");
    if (!cleanDigits && value !== "") return;

    if (cleanDigits.length > 1) {
      const newOtp = [...otp];
      const digits = cleanDigits.slice(0, 6).split("");
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(index + digits.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanDigits;
    setOtp(newOtp);

    if (cleanDigits && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    setIsSubmittingOtp(true);
    setOtpError("");

    setTimeout(() => {
      setIsSubmittingOtp(false);
      toast.success("Autenticación exitosa", {
        description: "Bienvenido al portal institucional del SINARP.",
      });
      const loggedUser = login(cedula);
      if (loggedUser?.role === "ADMIN") { router.push("/cuentas-internas"); } else if (loggedUser?.role === "DIR_GESTION" || loggedUser?.role === "DIR_NORMATIVA") { router.push("/asignacion-solicitudes"); } else if (loggedUser?.role === "EQ_GESTION") { router.push("/solicitudes-pendientes"); } else if (loggedUser?.role === "EQ_NORMATIVA") { router.push("/revision-normativa"); } else { router.push("/catalogo-interoperabilidad"); }
    }, 600);
  };

  // Verificación de preregistro para enrolamiento (Proceso B)
  const handleBuscarPreregistro = (e: React.FormEvent) => {
    e.preventDefault();
    const errCedula = getCedulaErrorMessage(cedulaEnrolar);
    if (errCedula || !cedulaEnrolar) {
      toast.error("Número de cédula inválido", {
        description: errCedula || "Ingresa tu número de cédula.",
      });
      return;
    }

    setIsSearchingPreregistro(true);

    setTimeout(() => {
      setIsSearchingPreregistro(false);
      const res = buscarPreregistroPorCedula(cedulaEnrolar);

      if (res.encontrado && res.tipo) {
        setPreregistroResultado({
          buscado: true,
          valido: true,
          datos: res,
        });
      } else {
        setPreregistroResultado({
          buscado: true,
          valido: false,
          mensaje:
            "No se encontró un prerregistro institucional activo con la cédula ingresada. La entidad debe realizar primero el proceso de solicitud de acceso institucional (Anexo A) o cambio de coordinador (Anexo C).",
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-4 relative">
      {/* â”€â”€ Flotante de Cuentas y Roles de Prueba (Desplegable / Ocultable en esquina derecha) â”€â”€ */}
      <DinarpTestAccountsDrawer
        onSelectCedula={(c) => {
          setCedula(c);
          setPassword(c === "1714443322" ? "Temporal2026*" : "Admin2026*");
          toast.success("Autenticación automática", { description: "Redirigiendo a tu bandeja..." });
          const loggedUser = login(c);
          if (loggedUser?.role === "ADMIN") { router.push("/cuentas-internas"); } 
          else if (loggedUser?.role === "DIR_GESTION" || loggedUser?.role === "DIR_NORMATIVA") { router.push("/asignacion-solicitudes"); } 
          else if (loggedUser?.role === "EQ_GESTION") { router.push("/solicitudes-pendientes"); } 
          else if (loggedUser?.role === "EQ_NORMATIVA") { router.push("/revision-normativa"); } 
          else { router.push("/catalogo-interoperabilidad"); }
        }}
      />

      {/* â”€â”€ CASO 1: LOGIN HABITUAL (USUARIOS ACTIVOS) â”€â”€ */}
      {activeTab === "login" && !isOtpStep && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-heading text-primary">
              Acceso al Portal de Interoperabilidad
            </h1>
          </div>

          {loginError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Cédula */}
          <FormField
            label="Cédula de Identidad"
            htmlFor="login-cedula"
            error={getCedulaErrorMessage(cedula) || undefined}
            className="space-y-2"
          >
            <InputGroup leftIcon={<Fingerprint className="size-4 text-muted-foreground" />}>
              <InputGroupInput
                id="login-cedula"
                type="text"
                maxLength={10}
                placeholder="Ingresa tu cédula de 10 dígitos"
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                className="text-xs font-mono"
                required
              />
            </InputGroup>
          </FormField>

          {/* Contraseña */}
          <FormField
            label="Contraseña"
            htmlFor="login-password"
            className="space-y-2"
          >
            <InputGroup>
              <InputGroupInput
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                required
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <InputGroupButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </InputGroupButton>
                </TooltipTrigger>
                <TooltipContent>
                  {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                </TooltipContent>
              </Tooltip>
            </InputGroup>
            <div className="flex justify-end pt-1">
              <Link
                href="/recuperar-contrasena"
                className="text-xs font-medium text-primary hover:text-primary-400 active:text-primary-400 hover:underline transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </FormField>

          <Button
            type="submit"
            variant="primary"
            size="default"
            disabled={isSubmittingLogin}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            {isSubmittingLogin ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Validando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          {/* Separador y Opciones Adicionales */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border/70"></div>
            <span className="shrink-0 px-3 text-xs text-muted-foreground font-medium">
              ¿Aún no tienes acceso?
            </span>
            <div className="flex-grow border-t border-border/70"></div>
          </div>

          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Enrolamiento Coordinador */}
              <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-secondary/5 border border-secondary/20 transition-all duration-500 hover:-translate-y-1 hover:border-transparent !shadow-sm hover:!shadow-lg hover:shadow-secondary/20">
                {/* Border Spin */}
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,var(--color-secondary)_0%,var(--color-secondary)_85%,white_100%)] opacity-0 group-hover:opacity-100 group-hover:animate-[spin_6s_linear_infinite] z-0 pointer-events-none blur-[1px] transition-opacity duration-500" />

                {/* Background Mask (Solid to hide the inner part of the spinning border) */}
                <div className="absolute inset-[1px] bg-background rounded-[calc(1rem-1px)] z-[1] pointer-events-none" />

                {/* Hover Tint */}
                <div className="absolute inset-[1px] bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[calc(1rem-1px)] z-[2] pointer-events-none" />

                {/* Internal Diffused Glow that follows the border */}
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,transparent_85%,var(--color-secondary)_100%)] opacity-0 group-hover:opacity-30 group-hover:animate-[spin_6s_linear_infinite] z-[3] pointer-events-none blur-[80px] transition-opacity duration-500" />

                <div className="relative z-10 p-4 gap-3 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-2 w-full relative z-20">
                    <div className="bg-secondary/10 text-secondary p-2.5 rounded-xl shrink-0 shadow-xs border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-colors duration-300">
                      <Users className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xs sm:text-sm font-bold text-secondary leading-tight">
                        ¿Fuiste designado como Coordinador SINARP?
                      </CardTitle>
                      <CardDescription className="text-[11px] text-muted-foreground leading-snug font-normal">
                        Completa tu prerregistro mediante el Anexo B si recibiste una invitación.
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/enrolamiento-coordinador" className="w-full mt-1">
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full text-xs h-9 px-3 relative z-20 shadow-xs justify-center"
                    >
                      <span className="font-semibold">Completar prerregistro</span>
                      <ArrowRight className="size-4 ml-2 opacity-80" />
                    </Button>
                  </Link>
                  <Users className="absolute -bottom-4 -right-3 size-24 text-secondary/5 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 -z-10 pointer-events-none" />
                </div>
              </div>

              {/* Card 2: Registro Institucional */}
              <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-neutral-500/5 border border-neutral-500/20 transition-all duration-500 hover:-translate-y-1 hover:border-transparent !shadow-sm hover:!shadow-lg hover:shadow-neutral-500/20">
                {/* Border Spin */}
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#888_0%,#888_85%,white_100%)] opacity-0 group-hover:opacity-100 group-hover:animate-[spin_6s_linear_infinite] z-0 pointer-events-none blur-[1px] transition-opacity duration-500" />

                {/* Background Mask (Solid to hide the inner part of the spinning border) */}
                <div className="absolute inset-[1px] bg-background rounded-[calc(1rem-1px)] z-[1] pointer-events-none" />

                {/* Hover Tint */}
                <div className="absolute inset-[1px] bg-neutral-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[calc(1rem-1px)] z-[2] pointer-events-none" />

                {/* Internal Diffused Glow that follows the border */}
                <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0%,transparent_85%,#888_100%)] opacity-0 group-hover:opacity-30 group-hover:animate-[spin_6s_linear_infinite] z-[3] pointer-events-none blur-[80px] transition-opacity duration-500" />

                <div className="relative z-10 p-4 gap-3 h-full flex flex-col justify-between">
                  <div className="flex items-start gap-2 w-full relative z-20">
                    <div className="bg-neutral-500/10 text-neutral-500 p-2.5 rounded-xl shrink-0 shadow-xs border border-neutral-500/10 group-hover:bg-neutral-500 group-hover:text-white transition-colors duration-300">
                      <Landmark className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xs sm:text-sm font-bold text-neutral-600 leading-tight">
                        Enrolamiento de Institución <br className="hidden sm:inline" /> al SINARP
                      </CardTitle>
                      <CardDescription className="text-[11px] text-muted-foreground leading-snug font-normal">
                        Solicita el registro para <br />
                        incorporar tu entidad al SINARP.
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/registro-institucion" className="w-full mt-1">
                    <Button
                      type="button"
                      variant="neutral"
                      className="w-full text-xs h-9 px-3 relative z-20 shadow-xs justify-center"
                    >
                      <span className="font-semibold text-[11px] text-white">Solicitar enrolamiento</span>
                      <ArrowRight className="size-4 ml-1 opacity-80 text-white" />
                    </Button>
                  </Link>
                  <Landmark className="absolute -bottom-4 -right-3 size-24 text-neutral-500/5 opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 -z-10 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Accesos Directos Internos (Ocultos visualmente) */}
            {false && (
            <div className="mt-6 pt-4 border-t border-border/70 space-y-3">
              <span className="px-1 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block text-center">Accesos rápidos (Bandejas Internas)</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Button type="button" variant="outline" onClick={() => { login("1111111111"); router.push("/solicitudes-pendientes"); }} className="h-auto flex-col p-3 items-center justify-center gap-1.5 border-border shadow-xs hover:border-primary/30 hover:bg-primary/5">
                  <FileText className="size-5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground text-center">Bandeja<br/>Revisor Gestión</span>
                </Button>
                <Button type="button" variant="outline" onClick={() => { login("3333333333"); router.push("/revision-normativa"); }} className="h-auto flex-col p-3 items-center justify-center gap-1.5 border-border shadow-xs hover:border-primary/30 hover:bg-primary/5">
                  <FileSignature className="size-5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground text-center">Bandeja<br/>Gestión Normatividad</span>
                </Button>
                <Button type="button" variant="outline" onClick={() => { login("2222222222"); router.push("/asignacion-solicitudes"); }} className="h-auto flex-col p-3 items-center justify-center gap-1.5 border-border shadow-xs hover:border-primary/30 hover:bg-primary/5">
                  <UserCheck className="size-5 text-primary" />
                  <span className="text-[10px] font-bold text-foreground text-center">Bandeja<br/>Dir. Normatividad</span>
                </Button>
              </div>
            </div>
            )}
          </div>
        </form>
      )}

      {/* â”€â”€ CASO 2: VERIFICACIÓN Y ENROLAMIENTO (PROCESO B) â”€â”€ */}
      {activeTab === "enrolamiento" && !isOtpStep && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-heading text-primary">
              Completar preregistro de coordinador
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tu cédula para validar tu preregistro y continuar con el proceso de acceso a la plataforma. Luego podrás completar y suscribir el Acuerdo de Confidencialidad (Anexo B).
            </p>
          </div>

          <form onSubmit={handleBuscarPreregistro} className="space-y-4">
            <FormField
              label="Cédula del Coordinador Designado"
              htmlFor="enrolar-cedula"
              error={getCedulaErrorMessage(cedulaEnrolar) || undefined}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <Input
                  id="enrolar-cedula"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Cédula de 10 dígitos"
                  value={cedulaEnrolar}
                  onChange={(e) => {
                    setCedulaEnrolar(e.target.value);
                    if (preregistroResultado.buscado) {
                      setPreregistroResultado({ buscado: false, valido: false });
                    }
                  }}
                  className="text-xs font-mono h-11"
                  aria-invalid={!!getCedulaErrorMessage(cedulaEnrolar)}
                  required
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="default"
                  disabled={isSearchingPreregistro}
                  className="shrink-0 text-xs font-semibold gap-1.5 h-11"
                >
                  {isSearchingPreregistro ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Search className="size-3.5" />
                  )}
                  <span>Consultar</span>
                </Button>
              </div>
            </FormField>
            <p className="text-[11px] text-muted-foreground mt-1">
              Cédulas de prueba precargadas: <code className="font-mono text-foreground font-semibold">1715489621</code> (Suplente MSP), <code className="font-mono text-foreground font-semibold">1712345602</code> (Titular DINARP).
            </p>
          </form>

          {/* Resultado de Búsqueda */}
          {preregistroResultado.buscado && preregistroResultado.valido && preregistroResultado.datos && (
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-foreground" />
                  <span className="text-xs font-bold text-foreground">
                    Prerregistro Verificado
                  </span>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm" className="border border-border text-foreground">
                  {preregistroResultado.datos.tipo}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Funcionario:</span>
                  <span className="font-semibold text-foreground">{preregistroResultado.datos.nombreCompleto}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Institución:</span>
                  <span className="font-semibold text-foreground">{preregistroResultado.datos.institucion}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Cargo Institucional:</span>
                  <span className="font-semibold text-foreground">{preregistroResultado.datos.cargo}</span>
                </div>
              </div>

              {preregistroResultado.datos.yaEnrolado ? (
                <div className="p-3 rounded-lg bg-muted border border-border text-xs text-foreground flex items-center justify-between gap-2">
                  <span>Este coordinador ya cuenta con enrolamiento activo.</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setCedula(cedulaEnrolar);
                      setActiveTab("login");
                    }}
                    className="text-xs font-semibold shrink-0"
                  >
                    Ir al login
                  </Button>
                </div>
              ) : (
                <Link href={`/enrolamiento-coordinador?cedula=${cedulaEnrolar}`} className="w-full">
                  <Button
                    type="button"
                    variant="neutral"
                    size="default"
                    className="w-full text-xs font-semibold gap-2 mt-2 shadow-xs"
                  >
                    <span className="text-white">Suscribir Acuerdo de Confidencialidad (Anexo B)</span>
                    <ArrowRight className="size-4 text-white" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {preregistroResultado.buscado && !preregistroResultado.valido && (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="size-4 shrink-0" />
                <span>Prerregistro no encontrado</span>
              </div>
              <p className="text-[11px] leading-relaxed text-destructive/90">
                {preregistroResultado.mensaje}
              </p>
            </div>
          )}
        </div>
      )}

      {/* â”€â”€ CASO 3: SEGUNDO FACTOR DE AUTENTICACIÓN (OTP / 2FA) â”€â”€ */}
      {isOtpStep && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h1 className="text-xl font-bold font-heading text-primary">
              Verificación en dos pasos
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ingresa el código de 6 dígitos que aparece en Google Authenticator para acceder al portal.
            </p>
          </div>

          {otpError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{otpError}</span>
            </div>
          )}

          {/* Campos de código redondos y separados con animación de barrido suave de color primary */}
          <div className="flex justify-center items-center gap-3 sm:gap-4 my-8 sm:my-10 py-2">
            {otp.map((digit, index) => (
              <div
                key={index}
                className={cn(
                  "size-11 sm:size-12 shrink-0 aspect-square flex items-center justify-center relative overflow-hidden rounded-full border transition-all duration-300",
                  digit
                    ? "border-primary/60 bg-primary/5 shadow-xs ring-1 ring-primary/40"
                    : "border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                )}
              >
                <Input
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-full h-full text-center text-lg font-bold font-mono p-0 border-0 bg-transparent focus-visible:ring-0 focus-visible:border-transparent rounded-full"
                />

                {/* Animación de barrido suave del color primary al escribir cada número */}
                {digit && (
                  <div
                    key={`sweep-${index}-${digit}`}
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-otp-sweep"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:gap-5 pt-2">
            <Button
              type="button"
              variant="primary"
              size="default"
              disabled={isSubmittingOtp || otp.join("").length !== 6}
              onClick={handleVerifyOtp}
              className="w-full text-xs font-semibold gap-2 shadow-xs"
            >
              {isSubmittingOtp ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Verificando e ingresando...</span>
                </>
              ) : (
                <>
                  <span>Verificar e ingresar</span>
                  <Check className="size-4" />
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              type="button"
              size="default"
              onClick={() => {
                setIsOtpStep(false);
                setOtp(Array(6).fill(""));
              }}
              className="w-full text-xs font-semibold gap-2 shadow-xs"
            >
              Volver atrás
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}








