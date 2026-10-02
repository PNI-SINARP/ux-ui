"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAssetPath, cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

export function VerificarRecuperacionView() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCountdown, setResendCountdown] = useState(45);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    setTimeout(() => {
      setIsSubmitting(false);

      if (fullOtp === "000000" || fullOtp === "999999") {
        setError("Enlace vencido o no válido");
        return;
      }

      // Success
      toast.success("Código verificado", {
        description: "Puedes proceder a establecer tu nueva contraseña.",
      });
      router.push("/restablecer-contrasena");
    }, 800);
  };

  const handleResend = () => {
    setResendCountdown(45);
    toast.success("Código reenviado", {
      description: "Se ha enviado un nuevo código a tu canal registrado.",
    });
  };

  return (
    <WireframeAuthLayout imageSrc={getAssetPath("/fondo.png")} imageFit="contain">
      {/* â”€â”€ Cabecera Superior â”€â”€ */}
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
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-heading font-bold text-primary tracking-tight">
              Verifica tu solicitud
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed text-balance">
              Ingresa el código de 6 dígitos que hemos enviado a tu canal registrado para confirmar tu identidad.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between gap-2 my-6 py-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="size-11 sm:size-12 text-center text-lg font-bold font-mono p-0"
              />
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            disabled={isSubmitting || otp.join("").length !== 6}
            onClick={handleVerify}
            className="w-full text-xs font-semibold gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verificando código...</span>
              </>
            ) : (
              <>
                <span>Verificar código</span>
                <Check className="size-4" />
              </>
            )}
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={resendCountdown > 0}
              onClick={handleResend}
              className="w-full sm:w-1/2 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={cn("size-3.5", resendCountdown > 0 && "opacity-50")} />
              <span>
                {resendCountdown > 0
                  ? `Reenviar en ${resendCountdown}s`
                  : "Solicitar nuevo código"}
              </span>
            </Button>

            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => router.push("/login")}
              className="w-full sm:w-1/2 text-xs font-semibold gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Volver al acceso principal</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Botón flotante inferior derecho para pruebas */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
            <span>Casos de prueba (ID-07)</span>
          </div>

          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={() => {
              setOtp(["1", "2", "3", "4", "5", "6"]);
              setError("");
              toast.success("Código válido simulado (123456)");
            }}
            className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 shadow-xs"
          >
            <Check className="size-3.5" /> Código válido
          </Button>

          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => {
              setOtp(["0", "0", "0", "0", "0", "0"]);
              setError("Enlace vencido o no válido");
              toast.error("Simulando código vencido/inválido");
            }}
            className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <AlertCircle className="size-3.5 text-destructive" /> Código inválido (000000)
          </Button>
        </div>
      </div>
    </WireframeAuthLayout>
  );
}
