"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Fingerprint,
  User,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  Calendar,
  Clock,
  Briefcase,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Building,
  UserX,
  History,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  UsuarioInterno,
  useUsuariosStore,
  EventoAuditoria,
} from "@/modules/usuarios/data/usuarios-store";
import { RolBadge } from "./rol-badge";

interface ExpedienteCuentaModalProps {
  usuario: UsuarioInterno | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "general" | "seguridad" | "auditoria";
}

export function ExpedienteCuentaModal({
  usuario,
  open,
  onOpenChange,
  initialTab = "general",
}: ExpedienteCuentaModalProps) {
  const [tabActiva, setTabActiva] = useState<"general" | "seguridad" | "auditoria">(initialTab);
  const { auditoria } = useUsuariosStore();

  if (!usuario) return null;

  // Filtrar eventos de auditoría para este usuario
  const eventosUsuario: EventoAuditoria[] = auditoria.filter(
    (a) =>
      a.usuarioAfectadoId === usuario.id ||
      a.usuarioAfectadoCedula === usuario.cedula
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant="standard"
        size="3xl"
        className="p-6 sm:p-7 rounded-3xl border border-border bg-background shadow-2xl max-h-[90vh] flex flex-col gap-4 overflow-hidden"
        showCloseButton={true}
      >
        {/* Cabecera del Expediente (Igual a la imagen) */}
        <DialogHeader className="gap-2 text-left items-start pb-2 border-b border-border/50 shrink-0">
          <div className="flex items-start justify-between w-full gap-4 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                <Fingerprint className="size-6 text-primary stroke-[2.2px]" />
              </div>
              <div>
                <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
                  Expediente de Usuario y Seguridad
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Consulta de credenciales, roles, asignaciones institucionales y trazabilidad de eventos.
                </DialogDescription>
              </div>
            </div>

            {/* Estado Badge (Pill en la esquina superior derecha) */}
            <div className="shrink-0 pt-0.5">
              {usuario.estado === "ACTIVO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30">
                  <span className="size-1.5 rounded-full bg-success"></span>
                  ACTIVO
                </span>
              )}
              {usuario.estado === "PENDIENTE_ACTIVACION" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning border border-warning/30">
                  <span className="size-1.5 rounded-full bg-warning"></span>
                  PENDIENTE
                </span>
              )}
              {usuario.estado === "SUSPENDIDO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/30">
                  <span className="size-1.5 rounded-full bg-danger"></span>
                  SUSPENDIDO
                </span>
              )}
              {usuario.estado === "RETIRADO" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border">
                  <span className="size-1.5 rounded-full bg-muted-foreground"></span>
                  RETIRADO
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Barra de pestañas segmentadas (Pills redondeadas como en la foto) */}
        <div className="p-1 rounded-xl sm:rounded-full bg-muted/40 border border-border/60 flex items-center gap-1 shrink-0 overflow-x-auto modal-scroll-area max-w-full">
          <button
            type="button"
            onClick={() => setTabActiva("general")}
            className={cn(
              "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
              tabActiva === "general"
                ? "bg-primary text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            Información general
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("seguridad")}
            className={cn(
              "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
              tabActiva === "seguridad"
                ? "bg-primary text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            Acceso y seguridad
          </button>
          <button
            type="button"
            onClick={() => setTabActiva("auditoria")}
            className={cn(
              "flex-1 text-center py-2 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap shrink-0 sm:shrink",
              tabActiva === "auditoria"
                ? "bg-primary text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            Auditoría e historial
          </button>
        </div>

        {/* Contenido scrolleable de las pestañas (scroll solo si excede la pantalla) */}
        <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-1 flex-1 min-h-0">
          {/* TAB 1: INFORMACIÓN GENERAL */}
          {tabActiva === "general" && (
            <div className="space-y-4 text-left">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-foreground">
                  Datos Institucionales y Contacto Oficial
                </h3>
                <p className="text-xs text-muted-foreground">
                  Información de identidad y atribuciones asignadas para el funcionario.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1 min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Funcionario / Nombres completos:</span>
                  <p className="font-bold text-sm text-foreground break-words">{usuario.nombreCompleto}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] text-muted-foreground">Cédula de identidad:</span>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px] gap-1 shrink-0">
                      <Lock className="size-2.5" /> Inmutable
                    </Badge>
                  </div>
                  <p className="font-mono font-bold text-sm text-foreground">{usuario.cedula}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1 min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Correo electrónico institucional:</span>
                  <p className="font-medium text-xs text-foreground break-all">{usuario.correo}</p>
                  <div className="pt-1">
                    {usuario.correoVerificado ? (
                      <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                        Correo verificado
                      </Badge>
                    ) : (
                      <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                        Verificación pendiente
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Rol institucional:</span>
                  <div className="pt-0.5">
                    <RolBadge rol={usuario.rol} label={usuario.rolLabel} size="sm" />
                  </div>
                  <p className="text-[10px] text-muted-foreground block">Código de perfil: {usuario.rol}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1 sm:col-span-2 min-w-0">
                  <span className="text-[11px] text-muted-foreground block">Ámbito institucional / Dirección:</span>
                  <p className="font-semibold text-xs text-foreground break-words">{usuario.ambito}</p>
                </div>
              </div>

              {/* Tareas o Trámites activos */}
              <div className="p-3 rounded-2xl bg-surface border border-border/70 space-y-2">
                <span className="text-xs font-bold text-foreground block">
                  Responsabilidades y trámites en curso:
                </span>
                {usuario.tareasActivas > 0 ? (
                  <div className="p-3 rounded-xl bg-warning/10 border border-warning/20 text-xs space-y-1.5 text-warning-foreground">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="size-4 text-warning" />
                      <span>{usuario.tareasActivas} trámite(s) o expediente(s) activo(s)</span>
                    </div>
                    {usuario.detalleTareas && usuario.detalleTareas.length > 0 && (
                      <ul className="list-disc list-inside text-[11px] space-y-0.5 pt-1">
                        {usuario.detalleTareas.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-4 text-success shrink-0" />
                    <span>Sin trámites activos ni responsabilidades pendientes.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACCESO Y SEGURIDAD */}
          {tabActiva === "seguridad" && (
            <div className="space-y-4 text-left">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs sm:text-sm text-foreground">
                  Mecanismos de Autenticación y Factores de Seguridad
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verificación de contraseña institucional, segundo factor (2FA) y políticas de acceso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="size-4 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-foreground">Contraseña institucional</p>
                      <p className="text-[10px] text-muted-foreground">Establecida por enlace temporal</p>
                    </div>
                  </div>
                  {usuario.credencialesConfiguradas ? (
                    <Badge tone="success" appearance="soft" size="sm">Configurada</Badge>
                  ) : (
                    <Badge tone="warning" appearance="soft" size="sm">Pendiente</Badge>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="size-4 text-primary" />
                    <div>
                      <p className="font-semibold text-xs text-foreground">Google Authenticator (TOTP)</p>
                      <p className="text-[10px] text-muted-foreground">Segundo factor obligatorio</p>
                    </div>
                  </div>
                  {usuario.totpConfigurado ? (
                    <Badge tone="success" appearance="soft" size="sm">Vinculado</Badge>
                  ) : (
                    <Badge tone="warning" appearance="soft" size="sm">Pendiente</Badge>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-muted-foreground block">Último acceso al sistema:</span>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <span>{usuario.ultimoAcceso || "Sin registros de inicio de sesión previos"}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2 text-foreground font-bold">
                  <ShieldCheck className="size-4 text-primary" />
                  <span>Política de Acceso Institucional DINARP</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Por directriz de seguridad de la Dirección Nacional de Registros Públicos, el inicio de sesión exige autenticación de doble factor ineludible. Las credenciales nunca se exponen en texto plano.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: AUDITORÍA E HISTORIAL (Idéntica a la foto) */}
          {tabActiva === "auditoria" && (
            <div className="space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-1 border-b border-border/60">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-foreground">
                    Trazabilidad Inalterable de Seguridad (Eventos Registrados)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Historial cronológico de creaciones, cambios de rol, ámbito, suspensiones y reactivaciones.
                  </p>
                </div>
                <Button
                  variant="neutral"
                  size="sm"
                  asChild
                  leftIcon={<History className="size-3.5" />}
                  className="shrink-0 text-xs gap-1.5"
                >
                  <Link href={`/auditoria-cuentas?cuenta=${encodeURIComponent(usuario.id)}`}>
                    Ver auditoría completa
                  </Link>
                </Button>
              </div>

              {eventosUsuario.length === 0 ? (
                <div className="py-12 sm:py-16 text-center text-xs text-muted-foreground font-medium">
                  No hay eventos registrados para este usuario.
                </div>
              ) : (
                <div className="space-y-2.5 pt-1">
                  {eventosUsuario.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-2xl bg-muted/30 border border-border/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{ev.eventoLabel}</span>
                          <Badge
                            tone={
                              ev.resultado === "Éxito"
                                ? "success"
                                : ev.resultado === "Denegado"
                                ? "warning"
                                : "danger"
                            }
                            appearance="soft"
                            size="sm"
                            className="text-[10px]"
                          >
                            {ev.resultado}
                          </Badge>
                        </div>
                        {ev.detalles && (
                          <p className="text-[11px] text-muted-foreground">{ev.detalles}</p>
                        )}
                        {ev.motivo && (
                          <p className="text-[10px] text-muted-foreground italic">
                            Motivo registrado: {ev.motivo}
                          </p>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-muted-foreground shrink-0 sm:self-start">
                        <p className="font-mono">{ev.fecha}</p>
                        <p className="text-[10px]">Actor: {ev.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón inferior único */}
        <DialogFooter className="pt-2.5 w-full flex items-center justify-center sm:justify-center border-t border-border/50 shrink-0 mt-1 sm:[&>*]:flex-none sm:[&>*]:w-auto">
          <Button
            type="button"
            variant="neutral"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto min-w-[160px] max-w-[220px] h-9 px-6 text-xs !rounded-full font-semibold cursor-pointer transition-all hover:bg-muted/70"
          >
            Cerrar expediente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
