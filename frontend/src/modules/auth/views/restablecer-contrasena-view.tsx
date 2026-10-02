"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAssetPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { DinarpRecoverySimulatorDrawer } from "@/modules/auth/components/dinarp-recovery-simulator-drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  Lock,
} from "lucide-react";

function RestablecerContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  // Evaluación de vigencia del enlace / código temporal de un solo uso
  const isExpiredOrInvalid = useMemo(() => {
    if (tokenParam === "expired" || tokenParam === "invalid" || tokenParam === "usado") {
      return true;
    }
    return false;
  }, [tokenParam]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Requisitos de seguridad vigentes
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
    if (!isFormValid || isExpiredOrInvalid) return;

    setIsSubmitting(true);

    // Simulación: Invalida sesiones anteriores y notifica al canal registrado
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 800);
  };

  // CASO 1: Enlace vencido o no válido
  if (isExpiredOrInvalid) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 border border-destructive/20 text-destructive shadow-xs">
            <Clock className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Enlace vencido o no válido
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            El enlace o código de recuperación es temporal, de un solo uso y ha caducado o no es válido. No se modificaron tus credenciales ni tus sesiones activas.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => router.push("/recuperar-contrasena")}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            <RotateCcw className="size-4" />
            <span>Solicitar otro</span>
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

  // CASO 2: Restablecimiento exitoso
  if (isSuccess) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center pt-8 pb-8">
          <div className="size-16 rounded-full bg-success/10 flex items-center justify-center mb-6 border border-success/20 text-success shadow-xs">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground mb-3">
            Contraseña restablecida
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
            Tu contraseña ha sido actualizada exitosamente. Por motivos de seguridad, las sesiones anteriores fueron invalidadas y se notificó la novedad a tu canal seguro registrado.
          </p>
        </div>

        <div>
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

  // CASO 3: Formulario para restablecer contraseña
  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h1 className="text-xl font-bold font-heading text-primary">
          Restablece tu contraseña
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ingresa tu nueva clave respetando los requisitos de seguridad establecidos.
        </p>
      </div>

      <div className="space-y-4">
        {/* Nueva Contraseña */}
        <div className="space-y-1.5">
          <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">
            Nueva contraseña
          </Label>
          <InputGroup className="bg-background border-border hover:border-primary/50 focus-within:border-primary h-11">
            <InputGroupInput
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs px-3 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              required
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

        {/* Confirmar Contraseña */}
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password" className="text-xs font-semibold text-foreground">
            Confirmar nueva contraseña
          </Label>
          <InputGroup className="bg-background border-border hover:border-primary/50 focus-within:border-primary h-11">
            <InputGroupInput
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-xs px-3 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              required
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

      {/* Requisitos de seguridad vigentes y validaciones */}
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
              <span>Restableciendo contraseña...</span>
            </>
          ) : (
            <>
              <span>Restablecer contraseña</span>
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

export function RestablecerContrasenaView() {
  return (
    <WireframeAuthLayout imageSrc={getAssetPath("/fondo.png")} imageFit="contain">
      {/* â”€â”€ Cabecera Superior: Logo DINARP + Modo Claro/Oscuro â”€â”€ */}
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
              <span>Verificando enlace...</span>
            </div>
          }
        >
          <RestablecerContrasenaContent />
        </Suspense>
      </div>

      {/* Botón flotante simulador de correo en la esquina inferior derecha */}
      <DinarpRecoverySimulatorDrawer />
    </WireframeAuthLayout>
  );
}
