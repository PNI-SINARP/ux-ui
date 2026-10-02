"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ConfiguracionIdentidad,
  EntornoIdentidad,
  PoliticaCorreoVerificado,
  ProveedorPrimerFactor,
} from "../data/types";
import {
  OPCIONES_POLITICA_CORREO,
  OPCIONES_PROVEEDOR,
  OPCIONES_VIGENCIA_HORAS,
  detectarDatosPruebaEnProduccion,
} from "../data/mock-data";
import { EstadoConfiguracionBadge } from "./estado-configuracion-badge";
import {
  Server,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  Layers,
  Info,
  Clock,
  EyeOff,
  AlertTriangle,
  Fingerprint,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FormularioIdentidadProps {
  configuracion: ConfiguracionIdentidad;
  onChange: (nuevaConfig: ConfiguracionIdentidad) => void;
  configuracionActivaPrevia: ConfiguracionIdentidad;
}

export function FormularioIdentidad({
  configuracion,
  onChange,
  configuracionActivaPrevia,
}: FormularioIdentidadProps) {
  const hayIncompatibilidadEntorno = detectarDatosPruebaEnProduccion(
    configuracion.proyectoId,
    configuracion.entorno
  );

  const handleEntornoChange = (nuevoEntorno: EntornoIdentidad) => {
    // Al cambiar de entorno, si pasamos a Producción y el ID tiene datos de prueba, sugerimos o ajustamos
    let nuevoProyectoId = configuracion.proyectoId;
    if (nuevoEntorno === "Producción" && nuevoProyectoId.includes("staging")) {
      nuevoProyectoId = nuevoProyectoId.replace("staging", "prod");
    } else if (nuevoEntorno === "Pruebas" && nuevoProyectoId.includes("prod")) {
      nuevoProyectoId = nuevoProyectoId.replace("prod", "staging");
    }

    onChange({
      ...configuracion,
      entorno: nuevoEntorno,
      proyectoId: nuevoProyectoId,
      // Si cambia de entorno, la prueba previa ya no es válida para este nuevo entorno
      pruebaSuperada:
        configuracion.ultimoResultadoPrueba?.entornoProbado === nuevoEntorno
          ? configuracion.pruebaSuperada
          : false,
      estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── BANNER TÉCNICO DE CONTROL Y ESTADO ─── */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Parámetros Operativos
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs font-mono font-bold text-foreground">
                Versión {configuracion.version}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-foreground flex items-center gap-2">
              <Server className="size-4.5 text-primary" />
              Entorno y Proyecto Identity Platform
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] font-medium text-muted-foreground">
                Estado Actual
              </span>
              <EstadoConfiguracionBadge estado={configuracion.estado} size="md" />
            </div>
          </div>
        </div>

        {/* Selector de Entorno con aislamiento estricto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Entorno de Ejecución</span>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        aria-label="Directiva de aislamiento"
                      >
                        <Info className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Regla técnica: Los entornos de Producción y Pruebas son totalmente aislados. No se permiten datos ni pruebas cruzadas.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Badge
                tone={configuracion.entorno === "Producción" ? "primary" : "warning"}
                appearance="soft"
                size="sm"
              >
                {configuracion.entorno}
              </Badge>
            </div>

            {/* Selector tipo Switch/Segmented institucional */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-muted/40 border border-border">
              <button
                type="button"
                onClick={() => handleEntornoChange("Pruebas")}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                  configuracion.entorno === "Pruebas"
                    ? "bg-warning text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Layers className="size-3.5" />
                <span>Pruebas (Staging)</span>
              </button>
              <button
                type="button"
                onClick={() => handleEntornoChange("Producción")}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                  configuracion.entorno === "Producción"
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldCheck className="size-3.5" />
                <span>Producción (Prod)</span>
              </button>
            </div>
          </div>

          {/* Identificador del Proyecto Identity Platform */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="proyecto-id" className="text-xs font-semibold text-foreground">
                Identificador del proyecto Identity Platform
              </Label>
              {hayIncompatibilidadEntorno && (
                <span className="text-[11px] font-semibold text-danger flex items-center gap-1">
                  <AlertTriangle className="size-3" />
                  Incompatibilidad detectada
                </span>
              )}
            </div>
            <Input
              id="proyecto-id"
              type="text"
              value={configuracion.proyectoId}
              onChange={(e) => {
                const nuevoId = e.target.value;
                onChange({
                  ...configuracion,
                  proyectoId: nuevoId,
                  // Cambios en el ID invalidan la prueba previa
                  pruebaSuperada: false,
                  estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
                });
              }}
              className={cn(
                "h-10 text-xs font-mono",
                hayIncompatibilidadEntorno && "border-danger focus-visible:border-danger focus-visible:ring-danger/20"
              )}
              placeholder="ej: dinarp-identity-prod-core"
            />
            {hayIncompatibilidadEntorno ? (
              <p className="text-[11px] text-danger font-medium flex items-center gap-1">
                <AlertTriangle className="size-3 shrink-0" />
                No se permite un identificador con sufijos de prueba (test, staging, lab) en Producción.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Cluster registrado en la consola de Google Cloud / Identity Platform.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN 2: DIRECTIVAS DE AUTENTICACIÓN Y PRIMER FACTOR ─── */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs space-y-5">
        <div className="pb-3 border-b border-border/60">
          <h2 className="text-base font-bold font-heading text-foreground flex items-center gap-2">
            <Lock className="size-4.5 text-primary" />
            Políticas de Acceso y Factores de Autenticación
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configuración del proveedor primario de credenciales y política de validación de correo institucional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Proveedor del Primer Factor */}
          <div className="space-y-2">
            <Label htmlFor="proveedor-factor" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-primary" />
              <span>Proveedor del primer factor</span>
            </Label>
            <div className="relative">
              <select
                id="proveedor-factor"
                value={configuracion.proveedorPrimerFactor}
                onChange={(e) =>
                  onChange({
                    ...configuracion,
                    proveedorPrimerFactor: e.target.value as ProveedorPrimerFactor,
                    pruebaSuperada: false,
                    estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
                  })
                }
                className="w-full h-10 rounded-full border border-input bg-transparent px-4 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
              >
                {OPCIONES_PROVEEDOR.map((prov) => (
                  <option key={prov} value={prov} className="bg-surface text-foreground">
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mecanismo federado primario para resolución de identidad de usuarios y funcionarios.
            </p>
          </div>

          {/* Política de Correo Verificado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="politica-correo" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" />
                <span>Política de correo verificado</span>
              </Label>
              <Badge tone="info" appearance="soft" size="sm" className="text-[10px]">
                {configuracion.politicaCorreoVerificado}
              </Badge>
            </div>
            <div className="relative">
              <select
                id="politica-correo"
                value={configuracion.politicaCorreoVerificado}
                onChange={(e) =>
                  onChange({
                    ...configuracion,
                    politicaCorreoVerificado: e.target.value as PoliticaCorreoVerificado,
                    pruebaSuperada: false,
                    estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
                  })
                }
                className="w-full h-10 rounded-full border border-input bg-transparent px-4 py-1 text-xs text-foreground shadow-xs transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none"
              >
                {OPCIONES_POLITICA_CORREO.map((pol) => (
                  <option key={pol} value={pol} className="bg-surface text-foreground">
                    {pol}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Restringe el inicio de sesión a casillas de correo con titularidad verificada institucionalmente.
            </p>
          </div>

          {/* TOTP Activo / Inactivo */}
          <div className="rounded-xl border border-border p-4 bg-muted/20 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Fingerprint className="size-4 text-primary" />
                <Label htmlFor="totp-switch" className="text-xs font-bold text-foreground cursor-pointer">
                  Segundo factor TOTP (RFC 6238)
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Exigir código temporal de un solo uso de 6 dígitos mediante Google Authenticator u OTP compatible.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                tone={configuracion.totpActivo ? "success" : "neutral"}
                appearance="soft"
                size="sm"
              >
                {configuracion.totpActivo ? "Activo" : "Inactivo"}
              </Badge>
              <Switch
                id="totp-switch"
                checked={configuracion.totpActivo}
                onCheckedChange={(checked) =>
                  onChange({
                    ...configuracion,
                    totpActivo: checked,
                    pruebaSuperada: false,
                    estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
                  })
                }
                variant="primary"
              />
            </div>
          </div>

          {/* Horas de Vigencia de Recuperación */}
          <div className="rounded-xl border border-border p-4 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Clock className="size-4 text-primary" />
                <span>Horas de vigencia de recuperación</span>
              </Label>
              <span className="text-xs font-mono font-bold text-primary">
                {configuracion.horasVigenciaRecuperacion} {configuracion.horasVigenciaRecuperacion === 1 ? "hora" : "horas"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ventana máxima en la que el token criptográfico de restablecimiento de contraseña permanece operativo.
            </p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {OPCIONES_VIGENCIA_HORAS.map((horas) => (
                <button
                  key={horas}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...configuracion,
                      horasVigenciaRecuperacion: horas,
                      pruebaSuperada: false,
                      estado: configuracion.estado === "Activa" ? "Pendiente de prueba" : configuracion.estado,
                    })
                  }
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full border transition-all",
                    configuracion.horasVigenciaRecuperacion === horas
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface text-muted-foreground border-border hover:text-foreground"
                  )}
                >
                  {horas}h
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN 3: PROTECCIÓN DE SECRETOS (NO EXPONER SECRETOS) ─── */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
              <EyeOff className="size-4 text-primary" />
              Almacén Criptográfico y Protección de Secretos
            </h2>
            <p className="text-xs text-muted-foreground">
              Directiva de seguridad: las llaves maestras y secretos de cliente no son accesibles en texto plano en la interfaz.
            </p>
          </div>
          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 self-start sm:self-auto">
            <Lock className="size-3" />
            <span>Cifrado AES-256 GCM</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Client Secret (Identity Platform)
            </Label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30 font-mono text-xs text-foreground">
              <span>{configuracion.secretoEnmascarado}</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider bg-background px-2 py-0.5 rounded-md border border-border">
                Enmascarado
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Firma de Integridad (SHA-256)
            </Label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/30 font-mono text-[11px] text-muted-foreground truncate">
              <span className="truncate">{configuracion.hashIntegridad}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECCIÓN 4: RESULTADO DE LA ÚLTIMA PRUEBA TÉCNICA ─── */}
      {configuracion.ultimoResultadoPrueba && (
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                {configuracion.ultimoResultadoPrueba.exitosa ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <XCircle className="size-4 text-danger" />
                )}
                Última Prueba Técnica Realizada
              </h2>
              <p className="text-xs text-muted-foreground">
                Ejecutada el {configuracion.ultimoResultadoPrueba.fecha} contra entorno{" "}
                <span className="font-semibold text-foreground">
                  {configuracion.ultimoResultadoPrueba.entornoProbado}
                </span>{" "}
                (Latencia: {configuracion.ultimoResultadoPrueba.latenciaMs}ms)
              </p>
            </div>
            <Badge
              tone={configuracion.ultimoResultadoPrueba.exitosa ? "success" : "danger"}
              appearance="soft"
              size="sm"
            >
              {configuracion.ultimoResultadoPrueba.exitosa ? "Superada" : "Fallida"}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-foreground font-medium">
              {configuracion.ultimoResultadoPrueba.observacionTecnica}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {configuracion.ultimoResultadoPrueba.serviciosValidados.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="truncate text-foreground">{srv.nombre}</span>
                    <Badge
                      tone={srv.estado === "OK" ? "success" : "danger"}
                      appearance="soft"
                      size="sm"
                      className="text-[9px] px-1.5 h-4"
                    >
                      {srv.estado}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {srv.mensaje}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
