"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertCircle,
  User,
  CreditCard,
  Mail,
  Briefcase,
  FileText,
  Search,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { FormField } from "@/components/ui/form-field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  CoordinadorInstitucional,
  CaracterCoordinador
} from "../data/cambio-coordinador-store";

// Mock list of cedulas registered in the portal to visually validate existing accounts
const MOCK_EXISTING_CEDULAS: Record<
  string,
  { nombre: string; correo: string; anexoBAprobado: boolean }
> = {
  "1712345678": {
    nombre: "Juan Pérez",
    correo: "juan.perez@educacion.gob.ec",
    anexoBAprobado: true
  },
  "1714443322": {
    nombre: "Mariana Almeida",
    correo: "m.almeida@educacion.gob.ec",
    anexoBAprobado: true
  },
  "1724589632": {
    nombre: "Carlos Alberto Andrade Villacís",
    correo: "carlos.andrade@educacion.gob.ec",
    anexoBAprobado: false
  },
  "0912345678": {
    nombre: "Javier Bohórquez",
    correo: "jbohorquez@guayaquil.gob.ec",
    anexoBAprobado: true
  },
  "1715489621": {
    nombre: "Patricia Morales",
    correo: "patricia.morales@dinarp.gob.ec",
    anexoBAprobado: true
  }
};

export interface FormNuevoCoordinadorData {
  cedula: string;
  nombreCompleto: string;
  correo: string;
  cargo: string;
  motivo: string;
  poseeCuentaSistema: boolean;
  poseeAnexoBAprobado: boolean;
}

interface CoordinadorEntranteFormProps {
  coordinadorActual: CoordinadorInstitucional;
  caracter: CaracterCoordinador;
  initialData?: Partial<FormNuevoCoordinadorData>;
  onContinuar: (data: FormNuevoCoordinadorData) => void;
  onCancelar: () => void;
}

export function CoordinadorEntranteForm({
  coordinadorActual,
  caracter,
  initialData,
  onContinuar,
  onCancelar
}: CoordinadorEntranteFormProps) {
  const [cedula, setCedula] = useState(initialData?.cedula || "");
  const [nombreCompleto, setNombreCompleto] = useState(initialData?.nombreCompleto || "");
  const [correo, setCorreo] = useState(initialData?.correo || "");
  const [cargo, setCargo] = useState(
    initialData?.cargo || (caracter === "TITULAR" ? "Director de Tecnología / Coordinador" : "Especialista TI")
  );
  const [motivo, setMotivo] = useState(
    initialData?.motivo || "Designación y reorganización de funciones institucionales de la entidad."
  );

  const [usuarioDetectado, setUsuarioDetectado] = useState<{
    registrado: boolean;
    anexoB: boolean;
    nombre?: string;
  } | null>(null);

  const [errores, setErrores] = useState<{
    cedula?: string;
    nombreCompleto?: string;
    correo?: string;
    cargo?: string;
    motivo?: string;
  }>({});

  // Verificación visual de cuenta en el sistema al ingresar la cédula
  useEffect(() => {
    const clean = cedula.trim();
    if (clean.length === 10) {
      if (clean === coordinadorActual.cedula) {
        setErrores((prev) => ({
          ...prev,
          cedula: "El nuevo coordinador no puede ser la misma persona actualmente en funciones."
        }));
        setUsuarioDetectado(null);
        return;
      }

      setErrores((prev) => ({ ...prev, cedula: undefined }));
      const found = MOCK_EXISTING_CEDULAS[clean];
      if (found) {
        setUsuarioDetectado({
          registrado: true,
          anexoB: found.anexoBAprobado,
          nombre: found.nombre
        });
        if (!nombreCompleto) setNombreCompleto(found.nombre);
        if (!correo) setCorreo(found.correo);
      } else {
        setUsuarioDetectado({
          registrado: false,
          anexoB: false
        });
      }
    } else {
      setUsuarioDetectado(null);
    }
  }, [cedula, coordinadorActual.cedula]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errores = {};

    if (!cedula.trim() || cedula.trim().length !== 10) {
      newErrors.cedula = "Ingresa una cédula válida de 10 dígitos.";
    }
    if (cedula.trim() === coordinadorActual.cedula) {
      newErrors.cedula = "El nuevo coordinador no puede ser la misma persona saliente.";
    }
    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre y apellido son obligatorios.";
    }
    if (!correo.trim() || !correo.includes("@")) {
      newErrors.correo = "Ingresa un correo electrónico institucional válido.";
    }
    if (!cargo.trim()) {
      newErrors.cargo = "Especifica el cargo dentro de la institución.";
    }
    if (!motivo.trim()) {
      newErrors.motivo = "Indica el motivo de la sustitución para el Anexo C.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrores(newErrors);
      return;
    }

    onContinuar({
      cedula: cedula.trim(),
      nombreCompleto: nombreCompleto.trim(),
      correo: correo.trim(),
      cargo: cargo.trim(),
      motivo: motivo.trim(),
      poseeCuentaSistema: Boolean(usuarioDetectado?.registrado),
      poseeAnexoBAprobado: Boolean(usuarioDetectado?.anexoB)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta Informativa Obligatoria */}
      <Alert
        variant="default"
        icon={<ShieldCheck className="size-5 text-primary shrink-0" />}
        className="border border-primary/20"
      >
        <div className="text-body-sm text-foreground">
          <strong className="font-semibold">Continuidad institucional garantizada: </strong>
          Los proyectos, solicitudes, contratos, cupos y credenciales de la institución no se eliminan
          por el cambio de Coordinador. El historial operativo se preserva íntegramente.
        </div>
      </Alert>

      {/* Grid: Coordinador Actual (Izquierda) vs Nuevo Coordinador (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Coordinador Actual - Precargado (Subcontenedor rounded-2xl) */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <User className="size-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Coordinador actual (Saliente)
                </span>
              </div>
              <Badge
                tone="neutral"
                appearance="soft"
                size="sm"
                className="font-semibold text-[10px]"
              >
                {caracter === "TITULAR" ? "Titular" : "Suplente"}
              </Badge>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold font-heading text-foreground">
                {coordinadorActual.nombreCompleto}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {coordinadorActual.cargo}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs bg-muted/30 p-3.5 rounded-xl border border-border/60">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Cédula:</span>
                <span className="font-mono font-medium text-foreground">
                  {coordinadorActual.cedula}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Correo:</span>
                <span className="text-foreground truncate max-w-[200px]" title={coordinadorActual.correo}>
                  {coordinadorActual.correo}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Carácter:</span>
                <span className="font-medium text-foreground">
                  {caracter === "TITULAR" ? "Coordinador Titular" : "Coordinador Suplente"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Estado actual:</span>
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Activo
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-muted/20 border border-border/60 rounded-xl text-caption text-muted-foreground">
            Al formalizarse el Anexo C, este funcionario dejará de poseer acceso en representación de la entidad.
          </div>
        </div>

        {/* Nuevo Coordinador - Formulario (Subcontenedor rounded-2xl) */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="size-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Datos del Nuevo Coordinador (Entrante)
              </h3>
            </div>
            <Badge
              tone="primary"
              appearance="soft"
              size="sm"
              className="font-semibold text-[10px]"
            >
              Reemplazo {caracter === "TITULAR" ? "Titular" : "Suplente"}
            </Badge>
          </div>

          <div className="space-y-4">
            {/* Cédula con visual validator */}
            <FormField
              label="Cédula de Identidad"
              htmlFor="cedula-entrante"
              required
              error={errores.cedula}
            >
              <InputGroup
                state={errores.cedula ? "error" : "default"}
                leftIcon={<CreditCard className="size-4 text-muted-foreground" />}
              >
                <InputGroupInput
                  id="cedula-entrante"
                  type="text"
                  maxLength={10}
                  placeholder="Ej: 1721345987"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  className="text-sm font-mono tracking-wider"
                />
              </InputGroup>
            </FormField>

            {/* Banner de validación visual del usuario */}
            {usuarioDetectado && (
              <div
                className={cn(
                  "p-3 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200",
                  usuarioDetectado.registrado
                    ? "bg-primary/5 border-primary/20 text-foreground"
                    : "bg-muted/40 border-border text-muted-foreground"
                )}
              >
                {usuarioDetectado.registrado ? (
                  <>
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="text-primary font-bold">Persona registrada en el sistema: </strong>
                      <span>Cuenta existente encontrada ({usuarioDetectado.nombre}).</span>
                      {usuarioDetectado.anexoB ? (
                        <span className="text-success font-medium block">
                          &bull; Cuenta con Anexo B vigente aprobado para vinculación inmediata (Caso A).
                        </span>
                      ) : (
                        <span className="text-muted-foreground block">
                          &bull; Requiere suscribir Anexo B tras la aprobación para habilitar accesos (Caso B).
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <strong className="text-foreground font-bold">Persona no registrada previamente: </strong>
                      <span>Al aprobarse el cambio, se enviará invitación formal para completar el enrolamiento inicial (Anexo B).</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Nombres y Apellidos */}
            <FormField
              label="Nombres y Apellidos Completos"
              htmlFor="nombre-entrante"
              required
              error={errores.nombreCompleto}
            >
              <InputGroup
                state={errores.nombreCompleto ? "error" : "default"}
                leftIcon={<User className="size-4 text-muted-foreground" />}
              >
                <InputGroupInput
                  id="nombre-entrante"
                  type="text"
                  placeholder="Ej: Ing. Roberto Carlos Dávila Silva"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="text-sm font-normal text-foreground placeholder:font-normal"
                />
              </InputGroup>
            </FormField>

            {/* Correo Electrónico Institucional */}
            <FormField
              label="Correo Electrónico Institucional"
              htmlFor="correo-entrante"
              required
              error={errores.correo}
            >
              <InputGroup
                state={errores.correo ? "error" : "default"}
                leftIcon={<Mail className="size-4 text-muted-foreground" />}
              >
                <InputGroupInput
                  id="correo-entrante"
                  type="email"
                  placeholder="Ej: roberto.davila@educacion.gob.ec"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="text-sm"
                />
              </InputGroup>
            </FormField>

            {/* Cargo en la entidad */}
            <FormField
              label="Cargo en la Institución"
              htmlFor="cargo-entrante"
              required
              error={errores.cargo}
            >
              <InputGroup
                state={errores.cargo ? "error" : "default"}
                leftIcon={<Briefcase className="size-4 text-muted-foreground" />}
              >
                <InputGroupInput
                  id="cargo-entrante"
                  type="text"
                  placeholder="Ej: Director Nacional de Tecnologías y Conectividad"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  className="text-sm"
                />
              </InputGroup>
            </FormField>

            {/* Motivo del cambio (ARP-R03) */}
            <FormField
              label="Motivo de la Sustitución (Constancia Anexo C)"
              htmlFor="motivo-cambio"
              required
              error={errores.motivo}
            >
              <Textarea
                id="motivo-cambio"
                rows={3}
                placeholder="Ej. Reestructuración administrativa o finalización de periodo institucional."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className={cn("text-xs resize-none", errores.motivo && "border-danger focus-visible:ring-danger")}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Acciones de Navegación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="neutral"
          size="default"
          onClick={onCancelar}
          className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
        >
          <ArrowLeft className="size-4" />
          <span>Volver al inicio</span>
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="default"
          className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
        >
          <span>Siguiente: Revisar Anexo C</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </form>
  );
}
