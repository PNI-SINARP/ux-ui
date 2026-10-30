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
import { useSolicitudesIngresoStore } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { DinarpTestAccountsDrawer } from "./dinarp-test-accounts-drawer";
import { ValidacionInstitucionModal } from "./validacion-institucion-modal";
import { ValidacionCoordinadorModal } from "./validacion-coordinador-modal";

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
      "4444444444",
      "5555555555",
      "6666666666",
      "7777777777",
      "1712345678",
      "1714443322",
      "1714443376",
      "1715489621",
      "1712345602",
      "1724589632",
      "1718956234",
      "1716789019",
      "1719876543",
      "1718765432",
      "0999999999",
      "1788888888",
      "1234567890",
      "1710001112",
      "1720304050", // Carlos Mendoza (Coordinador Proveedor - Registro Civil)
      "1716543210", // Carlos Mena (TI DTD)
      "1717654321", // María Torres (DGR)
      "1715432109", // Daniela Ruiz (DPI)
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
  const [cedulaInputError, setCedulaInputError] = useState<string | null>(null);
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

  // Modales de validación previa para Anexo A, B y C
  const [isAnexoAModalOpen, setIsAnexoAModalOpen] = useState(false);
  const [isAnexoBModalOpen, setIsAnexoBModalOpen] = useState(false);
  const [isAnexoCModalOpen, setIsAnexoCModalOpen] = useState(false);

  useEffect(() => {
    router.prefetch("/registro-institucion");
    router.prefetch("/enrolamiento-coordinador");
    router.prefetch("/cambio-coordinador");
  }, [router]);

  // Estado Verificación Enrolamiento (Proceso B)
  const [cedulaEnrolar, setCedulaEnrolar] = useState("");
  const [cedulaEnrolarError, setCedulaEnrolarError] = useState<string | null>(null);
  const [isSearchingPreregistro, setIsSearchingPreregistro] = useState(false);
  const [preregistroResultado, setPreregistroResultado] = useState<{
    buscado: boolean;
    valido: boolean;
    datos?: ReturnType<typeof buscarPreregistroPorCedula>;
    mensaje?: string;
  }>({ buscado: false, valido: false });

  const handleCedulaKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegación y control
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Escape" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      if (cedulaInputError && (e.key === "Backspace" || e.key === "Delete")) {
        setCedulaInputError(null);
      }
      return;
    }

    // Bloquear si es letra o carácter especial
    if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaInputError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "La cédula de identidad únicamente admite números (dígitos del 0 al 9).",
        id: "cedula-invalid-letter",
      });
      return;
    }

    if (/\d/.test(e.key) && cedulaInputError) {
      setCedulaInputError(null);
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (/[^\d]/.test(rawValue)) {
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaInputError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "La cédula de identidad únicamente admite números (dígitos del 0 al 9).",
        id: "cedula-invalid-letter",
      });
    } else if (cedulaInputError) {
      setCedulaInputError(null);
    }

    const digitsOnly = rawValue.replace(/\D/g, "");
    setCedula(digitsOnly);
    if (loginError) setLoginError("");
  };

  const handleCedulaPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (/[^\d]/.test(pastedText)) {
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaInputError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "El contenido pegado contenía letras o símbolos no permitidos. Solo se admiten números.",
        id: "cedula-invalid-letter",
      });
    }
  };

  const handleCedulaEnrolarKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Enter" ||
      e.key === "Escape" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    ) {
      if (cedulaEnrolarError && (e.key === "Backspace" || e.key === "Delete")) {
        setCedulaEnrolarError(null);
      }
      return;
    }

    if (e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault();
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaEnrolarError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "La cédula de identidad únicamente admite números (dígitos del 0 al 9).",
        id: "cedula-enrolar-invalid-letter",
      });
      return;
    }

    if (/\d/.test(e.key) && cedulaEnrolarError) {
      setCedulaEnrolarError(null);
    }
  };

  const handleCedulaEnrolarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (/[^\d]/.test(rawValue)) {
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaEnrolarError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "La cédula de identidad únicamente admite números (dígitos del 0 al 9).",
        id: "cedula-enrolar-invalid-letter",
      });
    } else if (cedulaEnrolarError) {
      setCedulaEnrolarError(null);
    }

    const digitsOnly = rawValue.replace(/\D/g, "");
    setCedulaEnrolar(digitsOnly);
    if (preregistroResultado.buscado) {
      setPreregistroResultado({ buscado: false, valido: false });
    }
  };

  const handleCedulaEnrolarPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (/[^\d]/.test(pastedText)) {
      const errorMsg = "Solo se permiten dígitos numéricos. No se permiten letras ni caracteres especiales.";
      setCedulaEnrolarError(errorMsg);
      toast.error("Carácter no permitido", {
        description: "El contenido pegado contenía letras o símbolos no permitidos. Solo se admiten números.",
        id: "cedula-enrolar-invalid-letter",
      });
    }
  };

  // Manejo de Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanCedula = cedula.trim();

    if (!cleanCedula) {
      const msg = "Ingresa tu número de cédula.";
      setLoginError(msg);
      setCedulaInputError(msg);
      return;
    }
    if (cleanCedula.length < 10) {
      const msg = "La cédula debe contener exactamente 10 dígitos numéricos.";
      setLoginError(msg);
      setCedulaInputError(msg);
      return;
    }
    if (!validarCedula(cleanCedula)) {
      const msg = "La cédula no es válida o no está registrada en el sistema.";
      setLoginError(msg);
      setCedulaInputError("El número de cédula ingresado no es válido.");
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
        router.push("/establecer-contrasena?cedula=1714443322");
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
      const loggedUser = login(cedula);
      toast.success(`Autenticación exitosa: ${loggedUser.name}`, {
        description: `Sesión iniciada como: ${loggedUser.roleTitle || loggedUser.role}`,
      });

      let targetRoute = "/catalogo-interoperabilidad/";
      if (loggedUser?.role === "ADMIN") {
        targetRoute = "/cuentas-internas/";
      } else if (loggedUser?.cedula === "1720304050") {
        targetRoute = "/proveedor/fuentes/";
      } else if (loggedUser?.role === "DGR" || loggedUser?.role === "DPI") {
        targetRoute = "/gestion/fuentes/";
      } else if (loggedUser?.role === "DTD" || loggedUser?.role === "TI") {
        targetRoute = "/tecnologia/conectores/";
      } else if (loggedUser?.role === "DIR_GESTION" || loggedUser?.role === "DIR_NORMATIVA" || loggedUser?.role === "DIR_DPI") {
        targetRoute = "/asignacion-solicitudes/";
      } else if (loggedUser?.role === "EQ_GESTION") {
        targetRoute = "/solicitudes-pendientes/";
      } else if (loggedUser?.role === "EQ_NORMATIVA" || loggedUser?.role === "EQ_DPI") {
        targetRoute = "/revision-normativa/";
      } else if (loggedUser?.role === "REPRESENTANTE_INSTITUCIONAL") {
        targetRoute = "/cambio-coordinador/";
      } else if (loggedUser?.role === "COORDINADOR_SINARP") {
        targetRoute = "/proyectos/";
      }

      router.push(targetRoute);

      // Respaldo de navegación inmediata para evitar bloqueos por compilación Turbopack o trailingSlash
      setTimeout(() => {
        if (typeof window !== "undefined" && window.location.pathname.includes("/login")) {
          window.location.assign(targetRoute);
        }
      }, 400);
    }, 400);
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
          setPassword("123456");
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
          {(() => {
            const activeCedulaError =
              cedulaInputError || (cedula.length === 10 ? getCedulaErrorMessage(cedula) : null);
            return (
              <FormField
                label="Cédula de Identidad"
                htmlFor="login-cedula"
                error={activeCedulaError || undefined}
                className="space-y-2"
              >
                <InputGroup
                  state={activeCedulaError ? "error" : "default"}
                  leftIcon={
                    <Fingerprint
                      className={cn(
                        "size-4 transition-colors",
                        activeCedulaError ? "text-danger" : "text-muted-foreground"
                      )}
                    />
                  }
                >
                  <InputGroupInput
                    id="login-cedula"
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Ingresa tu cédula de 10 dígitos"
                    value={cedula}
                    onKeyDown={handleCedulaKeyDown}
                    onChange={handleCedulaChange}
                    onPaste={handleCedulaPaste}
                    className="text-xs font-mono"
                    aria-invalid={!!activeCedulaError}
                    required
                  />
                </InputGroup>
              </FormField>
            );
          })()}

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
              Trámites sin cuenta
            </span>
            <div className="flex-grow border-t border-border/70"></div>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-2.5">
              {/* INS-00: los tres trámites se inician sin cuenta, contraseña ni enlace por correo */}
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAnexoAModalOpen(true)}
                className="w-full h-11 justify-between text-xs px-3.5 shadow-xs"
              >
                <span className="flex items-center gap-2.5 font-semibold">
                  <Landmark className="size-4" />
                  Registrar institución (Anexo A)
                </span>
                <ArrowRight className="size-4 opacity-70" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAnexoBModalOpen(true)}
                className="w-full h-11 justify-between text-xs px-3.5 shadow-xs"
              >
                <span className="flex items-center gap-2.5 font-semibold">
                  <Users className="size-4" />
                  Fui designado coordinador (Anexo B)
                </span>
                <ArrowRight className="size-4 opacity-70" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsAnexoCModalOpen(true)}
                className="w-full h-11 justify-between text-xs px-3.5 shadow-xs"
              >
                <span className="flex items-center gap-2.5 font-semibold">
                  <RefreshCw className="size-4" />
                  Cambiar coordinador (Anexo C)
                </span>
                <ArrowRight className="size-4 opacity-70" />
              </Button>
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
            {(() => {
              const activeCedulaEnrolarError =
                cedulaEnrolarError || (cedulaEnrolar.length === 10 ? getCedulaErrorMessage(cedulaEnrolar) : null);
              return (
                <FormField
                  label="Cédula del Coordinador Designado"
                  htmlFor="enrolar-cedula"
                  error={activeCedulaEnrolarError || undefined}
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
                      onKeyDown={handleCedulaEnrolarKeyDown}
                      onChange={handleCedulaEnrolarChange}
                      onPaste={handleCedulaEnrolarPaste}
                      className={cn(
                        "text-xs font-mono h-11",
                        activeCedulaEnrolarError && "border-danger text-danger focus-visible:ring-danger/20"
                      )}
                      aria-invalid={!!activeCedulaEnrolarError}
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
              );
            })()}
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

      {/* ── MODALES DE VALIDACIÓN PREVIA (ANEXO A, B y C) ── */}
      <ValidacionInstitucionModal
        open={isAnexoAModalOpen}
        onOpenChange={setIsAnexoAModalOpen}
        anexoType="A"
        onValidated={(data) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("dinarp_anexo_a_validation", JSON.stringify(data));
          }
          router.push("/registro-institucion");
        }}
      />

      <ValidacionCoordinadorModal
        open={isAnexoBModalOpen}
        onOpenChange={setIsAnexoBModalOpen}
        onValidated={(data) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("dinarp_anexo_b_validation", JSON.stringify(data));
          }
          router.push(`/enrolamiento-coordinador?cedula=${data.cedula}`);
        }}
      />

      <ValidacionInstitucionModal
        open={isAnexoCModalOpen}
        onOpenChange={setIsAnexoCModalOpen}
        anexoType="C"
        onValidated={(data) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("dinarp_anexo_c_validation", JSON.stringify(data));
          }
          router.push("/cambio-coordinador");
        }}
      />
    </div>
  );
}








