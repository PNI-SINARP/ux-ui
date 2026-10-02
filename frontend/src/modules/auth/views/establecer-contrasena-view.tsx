"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAssetPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { DinarpActivationSimulatorDrawer } from "@/modules/auth/components/dinarp-activation-simulator-drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  RotateCcw,
  AlertTriangle,
  ServerCrash,
  RefreshCw,
  Smartphone,
} from "lucide-react";

type LinkStatus = "VALIDO" | "VENCIDO" | "USADO" | "REVOCADO";

function EstablecerContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parámetros de consulta para identificar estado del enlace o simulación
  const estadoParam = searchParams.get("estado") || "";
  const tokenParam = searchParams.get("token") || "";

  // Evaluación del estado del enlace de un solo uso
  const initialStatus: LinkStatus = useMemo(() => {
    if (
      estadoParam === "vencido" ||
      tokenParam === "vencido" ||
      tokenParam === "expired"
    ) {
      return "VENCIDO";
    }
    if (
      estadoParam === "usado" ||
      tokenParam === "usado" ||
      tokenParam === "used"
    ) {
      return "USADO";
    }
    if (
      estadoParam === "revocado" ||
      tokenParam === "revocado" ||
      tokenParam === "revoked"
    ) {
      return "REVOCADO";
    }
    return "VALIDO";
  }, [estadoParam, tokenParam]);

  const [linkStatus, setLinkStatus] = useState<LinkStatus>(initialStatus);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de proceso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);

  // Sincronizar linkStatus cuando cambian los searchParams
  React.useEffect(() => {
    setLinkStatus(initialStatus);
    setIdentityError(null);
    setSyncPending(false);
    setIsSuccess(false);
  }, [initialStatus]);

  // Requisitos de seguridad vigentes (ID-09)
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecial &&
    passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || linkStatus !== "VALIDO") return;

    setIdentityError(null);
    setSyncPending(false);
    setIsSubmitting(true);

    // Detección de casos de simulación para pruebas
    const isSimulatingIdentityError =
      estadoParam === "error-identity" || tokenParam === "error-identity";
    const isSimulatingSyncPending =
      estadoParam === "sync-pendiente" || tokenParam === "sync-pendiente";

    setTimeout(() => {
      setIsSubmitting(false);

      if (isSimulatingIdentityError) {
        // Fallo de Identity Platform: el enlace NO se consume y permanece pendiente
        setIdentityError(
          "El servicio centralizado de Identity Platform no pudo confirmar la contraseña en este momento. El enlace de activación no ha sido consumido. Por favor intente nuevamente."
        );
        return;
      }

      if (isSimulatingSyncPending) {
        // Sincronización pendiente: se avisa al usuario que la replicación continúa en curso
        setSyncPending(true);
        return;
      }

      // Éxito:
      // 1. Identity Platform confirmó la credencial
      // 2. Se consume el enlace de activación (pasa a Usado)
      // 3. No se almacena ni se expone la contraseña
      setLinkStatus("USADO");
      setPassword("");
      setConfirmPassword("");
      setIsSuccess(true);
    }, 900);
  };

  // Reintentar resolución de sincronización pendiente
  const handleResolveSync = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSyncPending(false);
      setLinkStatus("USADO");
      setPassword("");
      setConfirmPassword("");
      setIsSuccess(true);
    }, 700);
  };

  // ─────────────────────────────────────────────────────────────
  // CASO A: Enlace Vencido (sin exponer datos sensibles)
  // ─────────────────────────────────────────────────────────────
  if (linkStatus === "VENCIDO") {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 text-destructive shadow-xs">
            <Clock className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Enlace de activación vencido
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            El enlace de activación temporal ha caducado por límite de tiempo. Por motivos de seguridad institucional, la cuenta no fue activada ni se registraron credenciales.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => router.push("/login")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <RotateCcw className="size-4" />
            <span>Solicitar nuevo enlace al Administrador</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => router.push("/login")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Volver al acceso principal</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CASO B: Enlace Ya Usado (sin exponer datos técnicos)
  // ─────────────────────────────────────────────────────────────
  if (linkStatus === "USADO" && !isSuccess) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-warning/10 flex items-center justify-center mb-6 border border-warning/20 text-warning shadow-xs">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Enlace de activación ya utilizado
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            Este enlace de activación de un solo uso ya fue completado previamente. Si ya configuraste tu contraseña inicial, continúa con la vinculación del segundo factor de autenticación.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => router.push("/vincular-autenticador")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <Smartphone className="size-4" />
            <span>Continuar con Google Authenticator</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => router.push("/login")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Ir al acceso principal</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CASO C: Enlace Revocado (sin exponer información sensible)
  // ─────────────────────────────────────────────────────────────
  if (linkStatus === "REVOCADO") {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 text-destructive shadow-xs">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Enlace de activación revocado
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            Este enlace de activación ha sido invalidado administrativamente o sustituido por una emisión más reciente. Por favor contacta al Administrador de tu entidad para recibir un enlace vigente.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => router.push("/login")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Volver al acceso principal</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CASO D: Contraseña establecida exitosamente
  // (Paso 1 completado; acceso protegido aún no permitido por falta de ID-12)
  // ─────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mb-6 border border-success/20 text-success shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Contraseña establecida correctamente
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            Tu contraseña inicial fue validada y confirmada en Identity Platform. El enlace de activación de un solo uso ha sido consumido.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => router.push("/vincular-autenticador")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <span>Continuar con Google Authenticator</span>
            <ArrowRight className="size-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={() => router.push("/login")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Volver al acceso principal</span>
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // CASO E: Formulario para ingresar contraseña inicial
  // ─────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h1 className="text-xl font-bold font-heading text-primary">
          Establece tu contraseña inicial
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ingresa la clave de acceso para tu cuenta institucional cumpliendo con la política de seguridad vigente.
        </p>
      </div>

      {/* Alerta de fallo en Identity Platform */}
      {identityError && (
        <Alert
          variant="danger"
          icon={<ServerCrash />}
          title="Fallo de Identity Platform"
        >
          {identityError}
        </Alert>
      )}

      {/* Alerta de sincronización pendiente */}
      {syncPending && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3.5 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <RefreshCw className="size-4 text-warning shrink-0 mt-0.5 animate-spin" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-foreground">
                Sincronización pendiente con el directorio
              </p>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                La credencial fue confirmada por Identity Platform, pero la réplica institucional se encuentra en proceso de propagación.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleResolveSync}
            disabled={isSubmitting}
            className="w-full text-xs font-semibold gap-2 h-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Comprobando réplica...</span>
              </>
            ) : (
              <>
                <RefreshCw className="size-3.5" />
                <span>Comprobar sincronización y continuar</span>
              </>
            )}
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {/* Nueva Contraseña Inicial */}
        <div className="space-y-1.5">
          <Label htmlFor="initial-password" className="text-xs font-semibold text-foreground">
            Contraseña inicial
          </Label>
          <InputGroup className="bg-background border-border hover:border-primary/50 focus-within:border-primary h-11">
            <InputGroupInput
              id="initial-password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña inicial"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs px-3 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              required
              autoComplete="new-password"
            />
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </InputGroupButton>
          </InputGroup>
        </div>

        {/* Confirmar Contraseña Inicial */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
            Confirmar contraseña inicial
          </Label>
          <InputGroup className="bg-background border-border hover:border-primary/50 focus-within:border-primary h-11">
            <InputGroupInput
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu contraseña inicial"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-xs px-3 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              required
              autoComplete="new-password"
            />
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
              className="text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </InputGroupButton>
          </InputGroup>
        </div>
      </div>

      {/* Reglas de fortaleza vigentes (ID-09) */}
      <div className="bg-muted/30 border border-border/80 rounded-lg p-2.5 sm:p-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary shrink-0" />
          <span className="text-[11px] sm:text-xs font-semibold text-foreground">
            Requisitos de seguridad vigentes:
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-x-2.5 gap-y-1 text-[10.5px] sm:text-[11px]">
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                hasMinLength ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${hasMinLength ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Mínimo 8 caracteres
            </span>
          </li>
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                hasNumber ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${hasNumber ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Un número (0-9)
            </span>
          </li>
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                hasUppercase ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${hasUppercase ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Mayúscula (A-Z)
            </span>
          </li>
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                hasSpecial ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${hasSpecial ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Carácter especial
            </span>
          </li>
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                hasLowercase ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${hasLowercase ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Minúscula (a-z)
            </span>
          </li>
          <li className="flex items-center gap-1.5 min-w-0">
            <div
              className={`size-1.5 rounded-full shrink-0 transition-colors ${
                passwordsMatch ? "bg-success" : "bg-muted-foreground/30"
              }`}
            />
            <span
              className={`truncate ${passwordsMatch ? "text-success font-medium" : "text-muted-foreground"}`}
            >
              Ambas coinciden
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4 pt-1">
        <Button
          type="submit"
          variant="primary"
          size="default"
          disabled={isSubmitting || !isFormValid}
          className="w-full text-xs font-semibold gap-2 shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Confirmando con Identity Platform...</span>
            </>
          ) : (
            <>
              <span>Establecer contraseña</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="default"
          onClick={() => router.push("/login")}
          className="w-full text-xs font-semibold gap-2 shadow-xs"
        >
          <ArrowLeft className="size-3.5" />
          <span>Volver al acceso principal</span>
        </Button>
      </div>
    </form>
  );
}

export function EstablecerContrasenaView() {
  return (
    <WireframeAuthLayout imageSrc={getAssetPath("/fondo.png")} imageFit="contain">
      {/* ── Cabecera Superior: Logo DINARP + Modo Claro/Oscuro ── */}
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

      <div className="space-y-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12 text-muted-foreground text-xs gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Validando enlace de activación...</span>
            </div>
          }
        >
          <EstablecerContrasenaContent />
        </Suspense>
      </div>

      {/* Botón flotante simulador de estados de activación ID-09 */}
      <Suspense fallback={null}>
        <DinarpActivationSimulatorDrawer />
      </Suspense>
    </WireframeAuthLayout>
  );
}
