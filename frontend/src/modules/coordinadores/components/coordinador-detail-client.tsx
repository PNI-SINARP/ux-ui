"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Lock,
  User,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  FileSignature,
  FileCheck,
  Radio,
  ExternalLink,
  RefreshCw,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useCoordinadoresStore,
  type CoordinadorCuenta
} from "@/modules/coordinadores/data/coordinadores-store";
import { ActualizarContactoAccesoDialog } from "./actualizar-contacto-acceso-dialog";
import { SuspenderReactivarCoordinadorDialog } from "./suspender-reactivar-coordinador-dialog";

interface CoordinadorDetailClientProps {
  id: string;
}

export function CoordinadorDetailClient({ id }: CoordinadorDetailClientProps) {
  const router = useRouter();
  const {
    getCoordinadorById,
    isLoaded,
    sincronizarIdentityPlatform
  } = useCoordinadoresStore();

  const coordinador = getCoordinadorById(id);

  const [activeTab, setActiveTab] = useState("contacto-acceso");
  const [dialogContactoOpen, setDialogContactoOpen] = useState(false);
  const [dialogSuspenderOpen, setDialogSuspenderOpen] = useState(false);
  const [dialogReactivarOpen, setDialogReactivarOpen] = useState(false);

  if (!isLoaded) {
    return (
      <WireframeDashboardLayout
        activeMenu="coordinadores"
        breadcrumbs={[{ label: "Coordinadores", href: "/coordinadores" }, { label: "Cargando..." }]}
      >
        <div className="p-8 text-center text-muted-foreground text-xs">Cargando expediente del coordinador...</div>
      </WireframeDashboardLayout>
    );
  }

  if (!coordinador) {
    return (
      <WireframeDashboardLayout
        activeMenu="coordinadores"
        breadcrumbs={[{ label: "Coordinadores", href: "/coordinadores" }, { label: "No encontrado" }]}
      >
        <div className="p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-foreground">Coordinador no encontrado</p>
          <p className="text-xs text-muted-foreground">El identificador especificado no corresponde a ningún coordinador institucional registrado.</p>
          <Link href="/coordinadores">
            <Button variant="outline" size="sm" className="text-xs">
              Volver al listado
            </Button>
          </Link>
        </div>
      </WireframeDashboardLayout>
    );
  }

  const isSuspendido = coordinador.estado === "SUSPENDIDO";
  const hasSyncPending = coordinador.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION";

  const handleSincronizar = () => {
    const res = sincronizarIdentityPlatform(coordinador.id);
    if (res.success) {
      toast.success("Sincronización confirmada", {
        description: "Los datos de la cuenta se sincronizaron satisfactoriamente con Identity Platform.",
      });
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="coordinadores"
      breadcrumbs={[
        { label: "Coordinadores", href: "/coordinadores" },
        { label: coordinador.nombreCompleto }
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 w-full"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
        {/* Barra Superior con botón volver (solo icono) y Título de Vista */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  asChild
                  aria-label="Volver a Coordinadores"
                  className="shrink-0"
                >
                  <Link href="/coordinadores">
                    <ArrowLeft className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Volver a Coordinadores</TooltipContent>
            </Tooltip>

            <div className="space-y-0.5 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                Detalle del coordinador institucional
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Expediente de cuenta personal, seguridad de factor TOTP y trazabilidad normativa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 sm:ml-auto">
            <span className="text-[11px] text-muted-foreground font-mono bg-muted/40 dark:bg-muted/20 px-3 py-1.5 rounded-lg border border-border/60 shadow-2xs whitespace-nowrap">
              Última actualización: <strong className="text-foreground font-semibold">{coordinador.ultimaActualizacion || coordinador.fechaDesignacion}</strong>
            </span>
          </div>
        </div>

        {/* TARJETA DE ENCABEZADO PRINCIPAL */}
        <div className="w-full rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-xs space-y-5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 w-full">
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              <div className="size-16 rounded-2xl bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0 border border-primary/20 shadow-2xs">
                {coordinador.nombreCompleto
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                    {coordinador.nombreCompleto}
                  </h2>
                  <Badge
                    tone={coordinador.estado === "ACTIVO" ? "success" : "danger"}
                    appearance="soft"
                    size="sm"
                  >
                    {coordinador.estado === "ACTIVO" ? "Activo" : "Suspendido"}
                  </Badge>
                  {coordinador.tipoDesignacion === "TITULAR" ? (
                    <Badge
                      tone="primary"
                      appearance="solid"
                      size="sm"
                      className="font-bold gap-1 text-[10px] text-white shadow-2xs"
                    >
                      <ShieldCheck className="size-3 text-white shrink-0" />
                      Coordinador Titular
                    </Badge>
                  ) : (
                    <Badge
                      tone="secondary"
                      appearance="solid"
                      size="sm"
                      className="font-bold gap-1 text-[10px] text-white shadow-2xs"
                    >
                      <Users className="size-3 text-white shrink-0" />
                      Coordinador Suplente
                    </Badge>
                  )}
                  {hasSyncPending && (
                    <Badge
                      tone="warning"
                      appearance="solid"
                      size="sm"
                      className="font-bold gap-1 text-[10px] bg-warning text-white shadow-2xs"
                    >
                      <RefreshCw className="size-2.5 text-white shrink-0 animate-spin [animation-duration:3s]" />
                      Sync pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                  <Building2 className="size-4 shrink-0 text-primary" />
                  <span className="font-semibold text-foreground">{coordinador.institucion}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>{coordinador.cargo}</span>
                </p>
              </div>
            </div>

            {/* Botones de acción principales: ID-10 y ID-11 */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogContactoOpen(true)}
                className="text-xs gap-1.5 text-primary hover:text-primary"
              >
                <ShieldAlert className="size-4" />
                <span>Corregir contacto / factor</span>
              </Button>

              {coordinador.estado === "ACTIVO" ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDialogSuspenderOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <AlertTriangle className="size-4" />
                  <span>Suspender cuenta</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setDialogReactivarOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Reactivar cuenta</span>
                </Button>
              )}

              {hasSyncPending && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleSincronizar}
                  className="text-xs gap-1.5 shadow-2xs font-semibold"
                >
                  <RefreshCw className="size-4 shrink-0 animate-spin [animation-duration:4s]" />
                  <span>Sincronizar Identity</span>
                </Button>
              )}
            </div>
          </div>

          {/* Banner de sincronización pendiente */}
          {hasSyncPending && (
            <Alert
              variant="warning"
              icon={<AlertTriangle className="size-4 text-warning" />}
              title="Cambio de cuenta pendiente de sincronización con Identity Platform"
              className="animate-fade-in shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta cuenta tiene modificaciones aplicadas localmente que no han sido confirmadas en <strong>Identity Platform</strong>.
                </p>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={handleSincronizar}
                  className="text-xs h-8 px-3 gap-1.5 shrink-0 shadow-xs font-semibold"
                >
                  <RefreshCw className="size-3.5" />
                  Sincronizar ahora
                </Button>
              </div>
            </Alert>
          )}

          {/* Banner específico si la cuenta está suspendida (ID-11) */}
          {isSuspendido && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger space-y-1.5 animate-fade-in">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-4 shrink-0" />
                Cuenta actualmente Suspendida (Sesiones invalidadas)
              </p>
              <p className="text-foreground/90 leading-relaxed text-[11px]">
                <strong>Causa obligatoria registrada:</strong> {coordinador.motivoSuspension || "Suspensión administrativa."}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-danger/20">
                <span>Registrado el: {coordinador.fechaSuspension} por {coordinador.responsableSuspension}</span>
                <span className="font-semibold text-danger">Aviso: El suplente no ha sido habilitado automáticamente.</span>
              </div>
            </div>
          )}

          {/* Resumen de Requisitos Normativos para Reactivación (ID-11) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/60 w-full">
            {/* Requisito 1: Anexo B */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium">1. Acuerdo Anexo B</p>
                <p className="text-xs font-semibold text-foreground">
                  {coordinador.anexoBAprobado ? "Aprobado y suscrito" : "Pendiente de suscripción"}
                </p>
              </div>
              <Badge tone={coordinador.anexoBAprobado ? "success" : "danger"} appearance="soft" size="sm" className="gap-1">
                {coordinador.anexoBAprobado ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {coordinador.anexoBAprobado ? "Válido" : "Faltante"}
              </Badge>
            </div>

            {/* Requisito 2: Designación */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium">2. Designación vigente</p>
                <p className="text-xs font-semibold text-foreground">
                  {coordinador.designacionVigente ? "Ratificada institucionalmente" : "Revocada o vencida"}
                </p>
              </div>
              <Badge tone={coordinador.designacionVigente ? "success" : "danger"} appearance="soft" size="sm" className="gap-1">
                {coordinador.designacionVigente ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {coordinador.designacionVigente ? "Vigente" : "Revocada"}
              </Badge>
            </div>

            {/* Requisito 3: Google Authenticator */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground font-medium">3. TOTP Google Authenticator</p>
                <p className="text-xs font-semibold text-foreground">
                  {coordinador.totpConfigurado ? "Vinculado y activo" : "Pendiente de vincular"}
                </p>
              </div>
              <Badge tone={coordinador.totpConfigurado ? "success" : "danger"} appearance="soft" size="sm" className="gap-1">
                {coordinador.totpConfigurado ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {coordinador.totpConfigurado ? "Configurado" : "Faltante"}
              </Badge>
            </div>
          </div>
        </div>

        {/* PESTAÑAS DE DETALLE (UI KIT CANÓNICO) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="bg-muted/40 dark:bg-muted/20 p-1.5 rounded-2xl border border-border/80 w-full sm:w-auto flex flex-wrap gap-1">
            <TabsTrigger value="contacto-acceso" className="text-xs font-semibold px-4 py-2 gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              <span>Contacto y factor de acceso</span>
            </TabsTrigger>
            <TabsTrigger value="institucional" className="text-xs font-semibold px-4 py-2 gap-2">
              <Building2 className="size-4 shrink-0" />
              <span>Datos institucionales</span>
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs font-semibold px-4 py-2 gap-2">
              <History className="size-4 shrink-0" />
              <span>Trazabilidad y auditoría</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CONTACTO Y FACTOR DE ACCESO */}
          <TabsContent value="contacto-acceso" className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-5 overflow-hidden">
              <Alert
                variant="info"
                icon={<ShieldAlert className="size-4 shrink-0" />}
                title="Reglas de autenticación y verificación"
                className="shadow-2xs"
              >
                <p className="text-muted-foreground text-xs leading-relaxed pt-0.5">
                  El correo vigente se muestra verificado. Cualquier nuevo correo declarado se conserva separado en estado Pendiente de verificación y solo sustituye al vigente cuando queda debidamente verificado. El reinicio de factor TOTP únicamente procede si existe una solicitud de recuperación autorizada.
                </p>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Canales de correo electrónico: Vigente vs Nuevo Declarado */}
                <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="size-3.5 text-primary" />
                      Canales de correo electrónico
                    </h3>
                    <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      Vigente Verificado
                    </Badge>
                  </div>

                  {/* 1. Correo Vigente Actual */}
                  <div className="p-3 rounded-lg border border-border bg-surface space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Correo vigente oficial:</span>
                      <span className="font-mono font-semibold text-foreground">{coordinador.correo}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Canal activo para notificaciones oficiales, enrolamiento y recuperación de clave.
                    </p>
                  </div>

                  {/* 2. Nuevo Correo Declarado (Mantenido separado) */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground">Nuevo correo institucional declarado:</span>
                    {coordinador.nuevoCorreoPendiente ? (
                      <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-foreground">
                            {coordinador.nuevoCorreoPendiente}
                          </span>
                          <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                            <Clock className="size-3" />
                            Pendiente de verificación
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Declarado el {coordinador.fechaDeclaracionNuevoCorreo}. Este correo <strong>no sustituye al correo vigente</strong> hasta confirmar su verificación formal.
                        </p>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => setDialogContactoOpen(true)}
                          className="text-xs h-8 gap-1.5 px-3 mt-1 shadow-2xs"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Gestionar verificación o sustitución
                        </Button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg border border-border bg-surface text-xs text-muted-foreground space-y-1">
                        <p>No existe ningún nuevo correo declarado en trámite.</p>
                        <p className="text-[11px]">
                          Para declarar un nuevo correo, utilice la acción <strong>Corregir contacto y factor</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Segundo Factor TOTP y Recuperación ID-08 */}
                <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Lock className="size-3.5 text-primary" />
                      Segundo factor de autenticación (TOTP)
                    </h3>
                    <Badge
                      tone={coordinador.totpConfigurado ? "success" : "neutral"}
                      appearance="soft"
                      size="sm"
                    >
                      {coordinador.totpConfigurado ? "Google Authenticator Activo" : "No configurado"}
                    </Badge>
                  </div>

                  {/* Condición de recuperación previa */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-foreground">
                      Condición para reinicio de TOTP:
                    </span>
                    {coordinador.recuperacionId08Autorizada ? (
                      <div className="p-3 rounded-xl border border-success/30 bg-success/10 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-success flex items-center gap-1.5">
                            <CheckCircle2 className="size-4" />
                            Recuperación previa autorizada
                          </span>
                          <Badge tone="success" appearance="outline" size="sm" className="font-mono text-[10px]">
                            {coordinador.codigoRecuperacionId08 || "REC-AUT"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-foreground/80 leading-relaxed">
                          El coordinador cuenta con autorización formal debidamente aprobada. El Administrador está facultado para reiniciar el factor de acceso.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-warning/30 bg-warning/10 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-warning flex items-center gap-1.5">
                            <AlertTriangle className="size-4 shrink-0" />
                            Sin recuperación previa autorizada
                          </span>
                          <Badge tone="warning" appearance="outline" size="sm" className="text-[10px]">
                            Reinicio bloqueado
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          El reinicio de factor TOTP está estrictamente condicionado a la existencia previa de una solicitud de recuperación con resolución autorizada.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-surface space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sesiones activas:</span>
                      <span className="font-semibold text-foreground">{coordinador.sesionesActivas} sesión(es)</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Cualquier reinicio de factor TOTP invalidará de inmediato todas las sesiones abiertas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: DATOS INSTITUCIONALES */}
          <TabsContent value="institucional" className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-surface shadow-xs space-y-5 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <div className="flex items-center gap-2.5">
                  <Building2 className="size-4.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      Expediente y Ámbito Institucional del Coordinador
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Datos de designación formal conforme al Anexo B e institución autorizada.
                    </p>
                  </div>
                </div>
                {coordinador.tipoDesignacion === "TITULAR" ? (
                  <Badge tone="primary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs self-start sm:self-auto">
                    <ShieldCheck className="size-3 text-white shrink-0" />
                    Coordinador Titular
                  </Badge>
                ) : (
                  <Badge tone="secondary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs self-start sm:self-auto">
                    <Users className="size-3 text-white shrink-0" />
                    Coordinador Suplente
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    Identidad y designación
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Cédula de identidad (inmutable):</span>
                      <span className="font-mono font-semibold text-foreground">{coordinador.cedula}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Nombre completo:</span>
                      <span className="font-medium text-foreground">{coordinador.nombreCompleto}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Tipo de designación:</span>
                      {coordinador.tipoDesignacion === "TITULAR" ? (
                        <Badge tone="primary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                          <ShieldCheck className="size-3 text-white shrink-0" />
                          Coordinador Titular
                        </Badge>
                      ) : (
                        <Badge tone="secondary" appearance="solid" size="sm" className="font-bold gap-1 text-[10px] text-white shadow-2xs">
                          <Users className="size-3 text-white shrink-0" />
                          Coordinador Suplente
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Fecha de designación inicial:</span>
                      <span className="text-foreground">{coordinador.fechaDesignacion}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Documento Anexo B:</span>
                      <span className="text-foreground text-[11px] truncate max-w-[200px]" title={coordinador.anexoBDocumento}>
                        {coordinador.anexoBDocumento || "No adjunto"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/15 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary" />
                    Entidad y canales de contacto
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Institución autorizada:</span>
                      <span className="font-medium text-foreground text-right max-w-[240px] truncate" title={coordinador.institucion}>
                        {coordinador.institucion}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">RUC Institucional:</span>
                      <span className="font-mono text-foreground">{coordinador.rucInstitucion}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Cargo administrativo:</span>
                      <span className="text-foreground text-right max-w-[240px] truncate" title={coordinador.cargo}>
                        {coordinador.cargo}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Teléfono institucional:</span>
                      <span className="text-foreground">{coordinador.telefono || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Sincronización Identity:</span>
                      <Badge
                        tone={coordinador.sincronizacionIdentityPlatform === "SINCRONIZADO" ? "success" : "warning"}
                        appearance="soft"
                        size="sm"
                      >
                        {coordinador.sincronizacionIdentityPlatform === "SINCRONIZADO" ? "Sincronizado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: HISTORIAL DE AUDITORÍA Y TRAZABILIDAD (ID-10, ID-11) */}
          <TabsContent value="auditoria" className="space-y-4 animate-in fade-in duration-200">
            <Alert
              variant="info"
              icon={<History className="size-4 shrink-0" />}
              title="Registro inalterable de seguridad"
              className="shadow-2xs"
            >
              <p className="text-muted-foreground text-xs leading-relaxed pt-0.5">
                Trazabilidad oficial de cambios de contacto, reinicio de factores, suspensiones y reactivaciones. Cada registro preserva actor responsable, caso administrativo, autorización y justificación motivada.
              </p>
            </Alert>

            <Table className="w-full min-w-[950px]" containerClassName="w-full overflow-x-auto">
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="w-[140px] pl-6 text-left whitespace-nowrap">FECHA Y HORA</TableHead>
                  <TableHead className="min-w-[180px] text-left whitespace-nowrap">ACCIÓN</TableHead>
                  <TableHead className="w-[140px] text-left whitespace-nowrap">ACTOR</TableHead>
                  <TableHead className="w-[140px] text-left whitespace-nowrap">CASO / TRÁMITE</TableHead>
                  <TableHead className="min-w-[200px] text-left whitespace-nowrap">CAUSA / JUSTIFICACIÓN</TableHead>
                  <TableHead className="w-[110px] text-left whitespace-nowrap">SESIONES</TableHead>
                  <TableHead className="w-[110px] pr-6 text-left whitespace-nowrap">NOTIFICACIÓN</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!coordinador.historial || coordinador.historial.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                      No se registran eventos de auditoría para esta cuenta.
                    </TableCell>
                  </TableRow>
                ) : (
                  coordinador.historial.map((evt) => (
                    <TableRow key={evt.id}>
                      <TableCell className="pl-6 font-mono text-[11px] text-muted-foreground whitespace-nowrap align-middle">
                        {evt.fecha}
                      </TableCell>
                      <TableCell className="align-middle">
                        <p className="font-semibold text-foreground">{evt.accion}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug">{evt.detalles}</p>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap align-middle">
                        {evt.actor}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-foreground align-middle">
                        {evt.caso || "—"}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="space-y-0.5">
                          <p className="text-foreground">{evt.causa}</p>
                          {evt.autorizacion && (
                            <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-mono">
                              {evt.autorizacion}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        {evt.sesionesInvalidadas ? (
                          <Badge tone="danger" appearance="soft" size="sm">Invalidadas</Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Sin cambio</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 align-middle">
                        {evt.notificacionEnviada ? (
                          <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                            <CheckCircle2 className="size-3" /> Enviada
                          </Badge>
                        ) : (
                          <Badge tone="neutral" appearance="soft" size="sm">No enviada</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        </Card>
      </main>

      {/* DIÁLOGOS DE GESTIÓN ID-10 y ID-11 */}
      <ActualizarContactoAccesoDialog
        open={dialogContactoOpen}
        onOpenChange={setDialogContactoOpen}
        coordinador={coordinador}
      />

      <SuspenderReactivarCoordinadorDialog
        open={dialogSuspenderOpen}
        onOpenChange={setDialogSuspenderOpen}
        coordinador={coordinador}
        mode="suspender"
      />

      <SuspenderReactivarCoordinadorDialog
        open={dialogReactivarOpen}
        onOpenChange={setDialogReactivarOpen}
        coordinador={coordinador}
        mode="reactivar"
      />
    </WireframeDashboardLayout>
  );
}
