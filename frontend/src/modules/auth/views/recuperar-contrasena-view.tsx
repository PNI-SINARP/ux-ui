"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAssetPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { WireframeAuthLayout } from "@/components/layout/wireframes/wireframe-auth-layout";
import { DinarpRecoverySimulatorDrawer } from "@/modules/auth/components/dinarp-recovery-simulator-drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Fingerprint,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  MailCheck,
} from "lucide-react";

export function RecuperarContrasenaView() {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const inputVal = cedula.trim();
    if (!/^\d{10}$/.test(inputVal)) {
      setError("Ingresa un número de cédula válido de 10 dígitos numéricos.");
      return;
    }

    setIsSubmitting(true);

    // Simulación de envío seguro: no revela si la cédula existe
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

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
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <h1 className="text-xl font-bold font-heading text-primary">
                Recupera tu contraseña
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ingresa tu número de cédula institucional para solicitar la recuperación de acceso.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="recuperar-cedula" className="text-xs font-semibold text-foreground">
                Cédula de identidad
              </Label>
              <InputGroup className="bg-background border-border hover:border-primary/50 focus-within:border-primary h-11">
                <InputGroupAddon className="pl-3 text-muted-foreground">
                  <Fingerprint className="size-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="recuperar-cedula"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ingresa tu cédula de 10 dígitos"
                  value={cedula}
                  onChange={(e) => {
                    setCedula(e.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  maxLength={10}
                  className="text-xs font-mono px-2"
                  required
                />
              </InputGroup>
            </div>

            <div className="flex flex-col gap-4 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="default"
                disabled={isSubmitting || cedula.length !== 10}
                className="w-full text-xs font-semibold gap-2 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Procesando solicitud...</span>
                  </>
                ) : (
                  <>
                    <span>Solicitar recuperación</span>
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
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center pt-8 pb-8">
              <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 text-primary shadow-xs">
                <MailCheck className="size-8" />
              </div>
              <h1 className="text-xl font-bold font-heading text-foreground mb-3">
                Recupera tu contraseña
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-[420px] leading-relaxed text-pretty">
                Si la información corresponde a una cuenta habilitada, recibirás instrucciones por tu canal registrado.
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
                <ArrowLeft className="size-3.5" />
                <span>Volver al acceso principal</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Botón flotante simulador de correo en la esquina inferior derecha */}
      <DinarpRecoverySimulatorDrawer cedula={cedula} />
    </WireframeAuthLayout>
  );
}
