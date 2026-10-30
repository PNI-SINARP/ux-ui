"use client";

import React, { useState } from "react";
import { ArrowRight, Fingerprint, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CaracterCoordinador, InstitucionConfig } from "../data/cambio-coordinador-store";

// PAR-09: intentos fallidos permitidos antes de bloquear la sesión del trámite
function maxIntentosPrerregistro(): number {
  try {
    const raw = localStorage.getItem("dinarp_par09_v1");
    return raw ? Number(JSON.parse(raw).intentos) || 5 : 5;
  } catch {
    return 5;
  }
}

interface IdentificarSalienteProps {
  institucion: InstitucionConfig;
  onIdentificado: (caracter: CaracterCoordinador) => void;
}

/**
 * CAM-01 CA1: el coordinador saliente se identifica por cédula; el Portal no lista coordinadores
 * y el mensaje de error no revela si la cédula pertenece a una institución.
 */
export function IdentificarSaliente({ institucion, onIdentificado }: IdentificarSalienteProps) {
  const [cedula, setCedula] = useState("");
  const [intentos, setIntentos] = useState(0);
  const [MAX_INTENTOS_PRERREGISTRO] = useState(maxIntentosPrerregistro);
  const [error, setError] = useState<string | null>(null);

  const bloqueado = intentos >= MAX_INTENTOS_PRERREGISTRO;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado) return;
    if (!/^\d{10}$/.test(cedula)) {
      setError("Ingresa los 10 dígitos de la cédula.");
      return;
    }
    if (cedula === institucion.titular.cedula) {
      onIdentificado("TITULAR");
      return;
    }
    if (cedula === institucion.suplente.cedula) {
      onIdentificado("SUPLENTE");
      return;
    }
    const nuevosIntentos = intentos + 1;
    setIntentos(nuevosIntentos);
    setError("No fue posible validar la cédula ingresada. Verifica el dato e inténtalo de nuevo.");
  };

  return (
    <div className="max-w-xl mx-auto space-y-5 py-4">
      <div className="space-y-1.5 text-center">
        <div className="mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Fingerprint className="size-6" />
        </div>
        <h2 className="text-base font-bold font-heading text-primary">Identifica al coordinador saliente</h2>
        <p className="text-xs text-muted-foreground">
          Ingresa la cédula del coordinador titular o suplente que será reemplazado. Este trámite no requiere cuenta ni
          contraseña.
        </p>
      </div>

      {bloqueado ? (
        <Alert variant="danger" icon={<ShieldAlert className="size-4" />} title="Sesión bloqueada" className="p-3 text-xs">
          Superaste los {MAX_INTENTOS_PRERREGISTRO} intentos permitidos. Inicia otro trámite desde la pantalla de ingreso.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="cedula-saliente" className="text-xs font-medium text-muted-foreground">
              Cédula del coordinador saliente <span className="text-danger">*</span>
            </Label>
            <Input
              id="cedula-saliente"
              inputMode="numeric"
              maxLength={10}
              autoComplete="off"
              value={cedula}
              onChange={(e) => {
                setCedula(e.target.value.replace(/\D/g, ""));
                setError(null);
              }}
              placeholder="10 dígitos"
              className="font-mono"
              aria-invalid={Boolean(error)}
            />
            {error && (
              <p className="text-xs text-danger" role="alert">
                {error}
              </p>
            )}
            {intentos > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Intento {intentos} de {MAX_INTENTOS_PRERREGISTRO}.
              </p>
            )}
          </div>
          <Button type="submit" variant="primary" className="w-full text-xs font-semibold gap-2" disabled={cedula.length !== 10}>
            <span>Continuar</span>
            <ArrowRight className="size-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
