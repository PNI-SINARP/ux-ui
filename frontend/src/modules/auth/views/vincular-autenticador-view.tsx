"use client";

import React, { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ShieldCheck,
  QrCode,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Info,
  Smartphone,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Stepper, type Step } from "@/components/ui/stepper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { cn, getAssetPath } from "@/lib/utils";

type FactorStatus = "no_vinculado" | "pendiente_confirmacion" | "vinculado" | "revocado";

function VincularAutenticadorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const estadoParam = searchParams.get("estado");
  const initialRevocado = estadoParam === "revocado";

  // Identidad institucional del propio usuario en enrolamiento
  const userEmail = searchParams.get("email") || "funcionario.institucional@entidad.gob.ec";

  // Estado del factor: No vinculado | Pendiente de confirmación | Vinculado | Revocado
  const [factorStatus, setFactorStatus] = useState<FactorStatus>(
    initialRevocado ? "revocado" : "pendiente_confirmacion"
  );

  // Pasos: 0 = Configura Google Authenticator, 1 = Confirma el código, 2 = Resultado
  const [activeStep, setActiveStep] = useState<number>(0);

  // id_factor persistente (se mantiene idéntico y no se regenera ante reintentos)
  const [factorId] = useState<string>("fct_totp_92a8f041b3");

  // Clave secreta efímera para configuración manual (mostrada ÚNICAMENTE durante el paso 0 de vínculo)
  const ephemeralSecret = "JBSW Y3DP EHPK 3PXP JBSW Y3DP";
  const [showManualKey, setShowManualKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Input de código TOTP (6 dígitos)
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados de contingencia de la HU ID-12
  const [isAbandoned, setIsAbandoned] = useState(false);
  const [isSyncPending, setIsSyncPending] = useState(false);
  const [showDemoToolbar, setShowDemoToolbar] = useState(false);
  const technicalRef = "SYNC-SEC-84920";

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const stepperSteps: Step[] = [
    { id: "setup", title: "Configura Google Authenticator" },
    { id: "verify", title: "Confirma el código" },
    { id: "result", title: "Resultado" },
  ];

  const handleCopySecret = () => {
    navigator.clipboard.writeText(ephemeralSecret.replace(/\s+/g, ""));
    setCopiedKey(true);
    toast.success("Clave copiada al portapapeles");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanDigits = value.replace(/\D/g, "");
    setOtpError(null);

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

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    // Validación de formato: exactamente 6 dígitos numéricos
    if (!/^\d{6}$/.test(fullOtp)) {
      setOtpError("No se vinculó el autenticador; verifica el código e inténtalo de nuevo");
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    setTimeout(() => {
      setIsVerifying(false);

      // Simulación de código inválido o vencido ("000000")
      if (fullOtp === "000000") {
        setOtpError("No se vinculó el autenticador; verifica el código e inténtalo de nuevo");
        return;
      }

      // Simulación de fallo de sincronización con el Portal ("888888")
      // Identity Platform confirma el factor pero falla sincronización con el Portal
      if (fullOtp === "888888") {
        setIsSyncPending(true);
        setActiveStep(2);
        return;
      }

      // Éxito: Se persiste correctamente el mismo id_factor y estado Vinculado
      setFactorStatus("vinculado");
      setIsSyncPending(false);
      setIsAbandoned(false);
      setActiveStep(2);
      toast.success("Google Authenticator vinculado correctamente");
    }, 600);
  };

  // Reintento de sincronización con el Portal conservando el MISMO id_factor
  const handleRetrySync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSyncPending(false);
      setFactorStatus("vinculado");
      toast.success("Google Authenticator vinculado correctamente");
    }, 700);
  };

  // Abandono del usuario -> estado "Vinculación pendiente"
  const handleAbandon = () => {
    setIsAbandoned(true);
    setOtpError(null);
  };

  // Reanudar flujo tras abandono
  const handleResume = () => {
    setIsAbandoned(false);
    setOtpError(null);
  };

  // Redirección final al Portal
  const handleContinueToPortal = () => {
    router.push("/login");
  };

  // Helper para renderizar badge de estado de factor
  const renderFactorBadge = () => {
    if (factorStatus === "vinculado") {
      return (
        <Badge tone="success" appearance="solid" size="sm" className="gap-1">
          <CheckCircle2 className="size-3" /> Vinculado
        </Badge>
      );
    }
    if (factorStatus === "revocado") {
      return (
        <Badge tone="danger" appearance="soft" size="sm" className="gap-1">
          <ShieldAlert className="size-3" /> Revocado
        </Badge>
      );
    }
    if (isAbandoned) {
      return (
        <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
          <AlertTriangle className="size-3" /> Pendiente de confirmación
        </Badge>
      );
    }
    return (
      <Badge tone="neutral" appearance="soft" size="sm" className="gap-1">
        <Smartphone className="size-3" /> Pendiente de confirmación
      </Badge>
    );
  };

  return (
    <WireframeAuthLayout imageSrc={getAssetPath("/fondo.png")} imageFit="contain">
      {/* Cabecera Superior: Logo DINARP + Selector de Tema */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
        <div>
          <img
            src={getAssetPath("/logo-horizontal.svg")}
            alt="Logo DINARP"
            className="dark:hidden h-11 sm:h-12 w-auto max-w-[220px] sm:max-w-[240px] object-contain"
          />
          <img
            src={getAssetPath("/logo-horizontal-outline-blanco.svg")}
            alt="Logo DINARP"
            className="hidden dark:block h-11 sm:h-12 w-auto max-w-[220px] sm:max-w-[240px] object-contain opacity-90"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
        </div>
      </div>

      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Título de la vista y Badge de Estado del Factor */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold font-heading text-primary">
              Vincular Google Authenticator
            </h1>
            {renderFactorBadge()}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Segundo factor de autenticación (TOTP) para tu acceso institucional como usuario.
          </p>
        </div>

        {/* Notificación si el factor previo fue revocado */}
        {factorStatus === "revocado" && !isAbandoned && activeStep === 0 && (
          <Alert
            variant="danger"
            icon={<ShieldAlert className="size-4" />}
            title="Factor anterior revocado"
          >
            Tu segundo factor anterior ha sido revocado. Es obligatorio vincular un nuevo Google Authenticator para restablecer tu ingreso al Portal.
          </Alert>
        )}

        {/* Contenedor de pasos (Stepper) */}
        {!isAbandoned && (
          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs flex items-center justify-center">
            <div className="w-full max-w-full">
              <Stepper
                steps={stepperSteps}
                activeStep={activeStep}
                completedSteps={activeStep > 0 ? Array.from({ length: activeStep }, (_, i) => i) : []}
                className="overflow-visible"
                onStepClick={(index) => {
                  // Solo permite regresar a pasos previos
                  if (index < activeStep && factorStatus !== "vinculado" && !isSyncPending) {
                    setActiveStep(index);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            CONDICIÓN: USUARIO ABANDONA EL PROCESO -> "Vinculación pendiente"
           ═════════════════════════════════════════════════════════════════ */}
        {isAbandoned && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <Alert
              variant="warning"
              icon={<AlertTriangle className="size-4" />}
              title="Vinculación pendiente"
            >
              Has detenido el proceso de vinculación. Para acceder a las funciones y servicios del Portal de Interoperabilidad, es indispensable completar el registro de Google Authenticator como segundo factor.
            </Alert>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado del factor:</span>
                <span className="font-semibold text-warning">Pendiente de confirmación</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cuenta:</span>
                <span className="font-mono text-[11px] text-foreground">{userEmail}</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                No se registraron claves parciales ni secretos en el sistema. Puedes reanudar en cualquier momento.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={handleResume}
                className="w-full text-xs font-semibold gap-2 shadow-xs"
              >
                <RefreshCw className="size-3.5" />
                <span>Reanudar vinculación</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => router.push("/login")}
                className="w-full text-xs font-semibold gap-2 shadow-xs"
              >
                <LogOut className="size-3.5" />
                <span>Volver al inicio de sesión</span>
              </Button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PASO 0: CONFIGURA GOOGLE AUTHENTICATOR
           ═════════════════════════════════════════════════════════════════ */}
        {!isAbandoned && activeStep === 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 text-xs text-foreground flex items-start justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <QrCode className="size-4 shrink-0" />
                  Paso 1: Escanea el código con Google Authenticator
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Abre la aplicación Google Authenticator en tu dispositivo móvil y selecciona <strong>Escanear código QR</strong>.
                </p>
              </div>

              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-help shrink-0">
                      <Info className="size-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    El código QR es emitido de forma segura por Identity Platform. Si la cámara de tu móvil no funciona, usa la opción de ingreso manual.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Tarjeta del Código QR generado por Identity Platform */}
            <div className="rounded-2xl border border-border bg-surface p-4 flex flex-col items-center text-center space-y-3.5 shadow-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-border shadow-inner flex flex-col items-center">
                <svg
                  className="size-44 sm:size-48"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="Código QR generado por Identity Platform"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Posicionador Superior Izquierdo */}
                  <rect x="10" y="10" width="24" height="24" fill="#000" />
                  <rect x="14" y="14" width="16" height="16" fill="#fff" />
                  <rect x="18" y="18" width="8" height="8" fill="#000" />

                  {/* Posicionador Superior Derecho */}
                  <rect x="66" y="10" width="24" height="24" fill="#000" />
                  <rect x="70" y="14" width="16" height="16" fill="#fff" />
                  <rect x="74" y="18" width="8" height="8" fill="#000" />

                  {/* Posicionador Inferior Izquierdo */}
                  <rect x="10" y="66" width="24" height="24" fill="#000" />
                  <rect x="14" y="70" width="16" height="16" fill="#fff" />
                  <rect x="18" y="74" width="8" height="8" fill="#000" />

                  {/* Módulos de datos sincronizados Identity Platform */}
                  <rect x="42" y="12" width="6" height="6" fill="#000" />
                  <rect x="52" y="12" width="6" height="6" fill="#000" />
                  <rect x="42" y="24" width="6" height="6" fill="#000" />
                  <rect x="48" y="32" width="6" height="6" fill="#000" />
                  <rect x="12" y="42" width="6" height="6" fill="#000" />
                  <rect x="24" y="42" width="6" height="6" fill="#000" />
                  <rect x="34" y="42" width="6" height="6" fill="#000" />
                  <rect x="44" y="42" width="12" height="12" fill="#000" />
                  <rect x="62" y="42" width="6" height="6" fill="#000" />
                  <rect x="72" y="42" width="6" height="6" fill="#000" />
                  <rect x="82" y="42" width="6" height="6" fill="#000" />
                  <rect x="42" y="62" width="6" height="6" fill="#000" />
                  <rect x="52" y="62" width="6" height="6" fill="#000" />
                  <rect x="62" y="62" width="14" height="6" fill="#000" />
                  <rect x="42" y="76" width="6" height="14" fill="#000" />
                  <rect x="54" y="76" width="8" height="8" fill="#000" />
                  <rect x="72" y="76" width="14" height="14" fill="#000" />
                  <rect x="82" y="62" width="6" height="8" fill="#000" />
                </svg>
                <span className="text-[10px] text-muted-foreground pt-1.5 font-mono">
                  Identity Platform · TOTP DINARP
                </span>
              </div>

              {/* Clave de configuración manual: Mostrada ÚNICAMENTE durante el vínculo */}
              <div className="w-full space-y-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualKey(!showManualKey)}
                  className="text-xs text-primary hover:text-primary gap-1.5 h-8 mx-auto"
                >
                  <KeyRound className="size-3.5" />
                  <span>{showManualKey ? "Ocultar clave de configuración" : "Ingresar clave manualmente"}</span>
                </Button>

                {showManualKey && (
                  <div className="rounded-xl border border-border p-3 bg-muted/20 text-left space-y-2 animate-in fade-in duration-200">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Si no puedes escanear el QR, introduce esta clave en la aplicación seleccionando <strong>Introducir clave de configuración</strong>:
                    </p>

                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border font-mono text-xs font-bold text-foreground">
                      <span className="tracking-widest">{ephemeralSecret}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopySecret}
                        className="size-7"
                        aria-label="Copiar clave"
                      >
                        {copiedKey ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                      </Button>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      Por seguridad, este secreto se muestra únicamente durante este paso y no será almacenado ni registrado.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones de Navegación del Paso 0 */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="neutral"
                size="default"
                onClick={handleAbandon}
                className="text-xs gap-1.5"
              >
                <LogOut className="size-3.5" />
                <span>Cancelar</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={() => {
                  setFactorStatus("pendiente_confirmacion");
                  setActiveStep(1);
                }}
                className="text-xs font-semibold gap-1.5 shadow-xs"
              >
                <span>Siguiente: Confirmar código</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PASO 1: CONFIRMA EL CÓDIGO
           ═════════════════════════════════════════════════════════════════ */}
        {!isAbandoned && activeStep === 1 && (
          <form onSubmit={handleVerifyCode} className="space-y-4 animate-in fade-in duration-200">
            <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 text-xs text-foreground flex items-start justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <p className="font-semibold text-primary flex items-center gap-1.5">
                  <Smartphone className="size-4 shrink-0" />
                  Paso 2: Confirma el código
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Ingresa el código TOTP de 6 dígitos que muestra Google Authenticator para tu cuenta.
                </p>
              </div>

              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-help shrink-0">
                      <Info className="size-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    El código temporal se renueva cada 30 segundos. Comprueba que la hora de tu teléfono esté sincronizada con la red.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-4 text-center shadow-xs">
              <Label className="text-xs font-semibold text-foreground">
                Código de verificación TOTP (6 dígitos)
              </Label>

              {/* Input OTP de 6 dígitos con componente Input del UI Kit */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="size-11 sm:size-12 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary shadow-inner p-0"
                    autoFocus={index === 0}
                    aria-label={`Dígito ${index + 1} del código de autenticación`}
                  />
                ))}
              </div>

              {/* Mensaje de error estricto de HU ID-12 */}
              {otpError && (
                <div className="animate-in fade-in duration-200">
                  <Alert
                    variant="danger"
                    icon={<XCircle className="size-4" />}
                    title="Error de verificación"
                  >
                    {otpError}
                  </Alert>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Ingresa los 6 dígitos numéricos mostrados en tu dispositivo móvil.
              </p>
            </div>

            {/* Acciones del Paso 1 */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => {
                  setOtpError(null);
                  setActiveStep(0);
                }}
                disabled={isVerifying}
                className="text-xs gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Volver al QR</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="default"
                disabled={otp.join("").length !== 6 || isVerifying}
                className="text-xs font-semibold gap-1.5 shadow-xs"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Confirmar autenticador</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            PASO 2: RESULTADO
           ═════════════════════════════════════════════════════════════════ */}
        {!isAbandoned && activeStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* ─────────────────────────────────────────────────────────────
                CASO: Identity Platform confirmó pero falló sincronización con Portal
               ───────────────────────────────────────────────────────────── */}
            {isSyncPending ? (
              <div className="space-y-4">
                <Alert
                  variant="warning"
                  icon={<AlertTriangle className="size-4" />}
                  title="Factor confirmado; sincronización pendiente"
                >
                  Identity Platform validó tu autenticador, pero la sincronización con el Portal institucional no se completó. Tu factor no se ha descartado y no requieres generar un segundo secreto.
                </Alert>

                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="space-y-1 pb-2 border-b border-border/60">
                    <span className="text-[11px] font-semibold text-foreground">
                      Referencia técnica de sincronización:
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      El identificador del factor se encuentra reservado. Solo al confirmar la persistencia en el Portal se dará por finalizado el enrolamiento.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/80">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                        Referencia técnica
                      </span>
                      <span className="font-mono font-semibold text-foreground text-[11px]">
                        {technicalRef}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/20 border border-border/80">
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                        ID Factor
                      </span>
                      <span className="font-mono font-semibold text-foreground text-[11px]">
                        {factorId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Estado del factor:</span>
                    <Badge tone="warning" appearance="soft" size="sm">
                      Pendiente de confirmación
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={handleRetrySync}
                    disabled={isSyncing}
                    className="w-full text-xs font-semibold gap-2 shadow-xs"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        <span>Sincronizando con el Portal...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="size-3.5" />
                        <span>Reintentar sincronización</span>
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="default"
                    onClick={() => {
                      setIsSyncPending(false);
                      setActiveStep(1);
                      setOtp(Array(6).fill(""));
                    }}
                    disabled={isSyncing}
                    className="w-full text-xs font-semibold gap-2 shadow-xs"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Volver a ingresar código</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* ─────────────────────────────────────────────────────────────
                  CASO: Enrolamiento completado con éxito (Vinculado)
                 ───────────────────────────────────────────────────────────── */
              <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 flex flex-col items-center text-center space-y-4 shadow-xs">
                <div className="size-16 rounded-full bg-success/10 text-success flex items-center justify-center border border-success/20 shadow-xs">
                  <CheckCircle2 className="size-8" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-heading text-foreground">
                    Google Authenticator vinculado correctamente
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    Tu segundo factor de autenticación fue verificado y persistido satisfactoriamente. Tu cuenta institucional ahora cuenta con protección de doble factor.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 p-3.5 text-xs text-foreground text-left w-full space-y-2">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <ShieldCheck className="size-4 shrink-0" />
                    Segundo factor activo
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    En tus próximos inicios de sesión en el Portal de Interoperabilidad, deberás ingresar tu cédula, contraseña y el código de 6 dígitos provisto por Google Authenticator.
                  </p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                    <span className="text-muted-foreground">Estado registrado:</span>
                    <Badge tone="success" appearance="solid" size="sm">
                      Vinculado
                    </Badge>
                  </div>
                </div>

                <div className="w-full pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={handleContinueToPortal}
                    className="w-full text-xs font-semibold gap-2 shadow-xs"
                  >
                    <span>Continuar al Portal</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botón flotante para Casos de Prueba (igual a /registro-institucion) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        {showDemoToolbar ? (
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
              <Sparkles className="size-3 text-primary shrink-0" />
              <span>Casos HU ID-12</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => {
                setIsAbandoned(false);
                setIsSyncPending(false);
                setActiveStep(1);
                setOtp(["0", "0", "0", "0", "0", "0"]);
                setOtpError("No se vinculó el autenticador; verifica el código e inténtalo de nuevo");
              }}
              className="rounded-full px-3 text-xs h-8 text-destructive hover:bg-destructive/10"
            >
              TOTP inválido
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => {
                setIsAbandoned(true);
              }}
              className="rounded-full px-3 text-xs h-8 text-warning hover:bg-warning/10"
            >
              Abandonar
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => {
                setIsAbandoned(false);
                setIsSyncPending(true);
                setFactorStatus("pendiente_confirmacion");
                setActiveStep(2);
              }}
              className="rounded-full px-3 text-xs h-8 text-primary hover:bg-primary/10"
            >
              Falla sincronización
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => {
                setIsAbandoned(false);
                setIsSyncPending(false);
                setFactorStatus("vinculado");
                setActiveStep(2);
              }}
              className="rounded-full px-3 text-xs h-8 text-success hover:bg-success/10"
            >
              Vinculado
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDemoToolbar(false)}
              className="rounded-full size-8 shrink-0 hover:bg-muted text-muted-foreground hover:text-foreground ml-0.5"
              title="Ocultar opciones de prueba"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDemoToolbar(true)}
            className="rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs bg-surface/95 backdrop-blur-md border border-border hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            title="Desplegar opciones de prueba"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Casos de prueba</span>
            <ChevronUp className="size-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </WireframeAuthLayout>
  );
}

export function VincularAutenticadorView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 text-xs text-muted-foreground">
          Cargando asistente de vinculación...
        </div>
      }
    >
      <VincularAutenticadorContent />
    </Suspense>
  );
}
