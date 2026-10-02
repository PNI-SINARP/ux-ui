"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit2,
  Check,
  Ban,
  RotateCcw,
  UserX,
  UserMinus,
  History,
  Shield,
  ShieldCheck,
  Building,
  Mail,
  Fingerprint,
  KeyRound,
  Lock,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  FileText,
  User,
  ExternalLink,
  Info,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxValue,
} from "@/components/ui/combobox";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useUsuariosStore,
  UsuarioInterno,
  EstadoUsuario,
  EventoAuditoria,
} from "@/modules/usuarios/data/usuarios-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { EditarCuentaInternaModal } from "./editar-cuenta-interna-modal";
import { RolBadge } from "./rol-badge";
import {
  AccionCuentaDialog,
  TipoAccionCuenta,
} from "./accion-cuenta-dialog";

interface CuentaInternaDetailClientProps {
  id: string;
}

export function CuentaInternaDetailClient({ id }: CuentaInternaDetailClientProps) {
  const router = useRouter();
  const {
    usuarios,
    auditoria,
    activarUsuario,
    simularActivacionDemo,
    suspenderUsuario,
    reactivarUsuario,
    darDeBajaUsuario,
  } = useUsuariosStore();

  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Buscar usuario
  const usuario = useMemo(() => {
    return (
      usuarios.find((u) => u.id === id || u.cedula === id) ||
      usuarios.find((u) => u.id === "USR-INT-001") ||
      null
    );
  }, [usuarios, id]);

  // Tab activo
  const [activeTab, setActiveTab] = useState("general");

  // Filtros de Auditoría (ID-02)
  const [filtroAuditTipo, setFiltroAuditTipo] = useState<string>("TODOS");
  const [filtroAuditPeriodo, setFiltroAuditPeriodo] = useState<string>("TODOS");

  // Modales de acciones de ciclo de vida (ID-03 e ID-04)
  const [accionTipo, setAccionTipo] = useState<TipoAccionCuenta | null>(null);
  const [accionOpen, setAccionOpen] = useState(false);
  const [modalBajaOpen, setModalBajaOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Estados de formularios en modales
  const [motivoAccion, setMotivoAccion] = useState("");
  const [errorAccion, setErrorAccion] = useState("");



  // Manejo de Dar de baja (ID-04)
  const handleBajaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    setErrorAccion("");

    const res = darDeBajaUsuario(usuario.id, motivoAccion, currentUser.name);
    if (!res.ok) {
      setErrorAccion(res.error || "No es posible dar de baja.");
      return;
    }

    toast.error("Baja lógica confirmada", {
      description: `La cuenta de ${usuario.nombreCompleto} pasó a estado RETIRADO. Historial conservado inalterable.`,
    });
    setModalBajaOpen(false);
  };

  // Helper de badges de estado
  const getEstadoBadge = (estado: EstadoUsuario) => {
    switch (estado) {
      case "ACTIVO":
        return (
          <Badge tone="success" appearance="soft" size="md" className="font-semibold">
            Activo
          </Badge>
        );
      case "PENDIENTE_ACTIVACION":
        return (
          <Badge tone="warning" appearance="soft" size="md" className="font-semibold">
            Pendiente de activación
          </Badge>
        );
      case "SUSPENDIDO":
        return (
          <Badge tone="danger" appearance="soft" size="md" className="font-semibold">
            Suspendido
          </Badge>
        );
      case "RETIRADO":
        return (
          <Badge tone="neutral" appearance="soft" size="md" className="font-semibold">
            Baja lógica
          </Badge>
        );
      default:
        return <Badge size="md">{estado}</Badge>;
    }
  };

  // Mapeador de auditoría para Timeline (ID-02)
  const mapEventoToTimelineItem = (log: EventoAuditoria): TimelineItem => {
    let status: TimelineItem["status"] = "neutral";
    let icon = <CheckCircle2 className="size-4" />;

    if (log.evento === "CUENTA_CREADA") {
      status = "primary";
      icon = <User className="size-4" />;
    } else if (log.evento === "ACTIVACION") {
      status = "success";
      icon = <CheckCircle2 className="size-4" />;
    } else if (log.evento === "SUSPENSION" || log.evento === "BLOQUEO") {
      status = "danger";
      icon = <AlertTriangle className="size-4" />;
    } else if (log.evento === "REACTIVACION") {
      status = "success";
      icon = <RotateCcw className="size-4" />;
    } else if (log.evento === "BAJA_LOGICA") {
      status = "danger";
      icon = <UserX className="size-4" />;
    } else if (log.evento === "CAMBIO_ROL" || log.evento === "CAMBIO_AMBITO") {
      status = "primary";
      icon = <Briefcase className="size-4" />;
    } else {
      status = "neutral";
      icon = <ShieldCheck className="size-4" />;
    }

    const descParts: string[] = [];
    if (log.detalles) descParts.push(log.detalles);
    if (log.motivo) descParts.push(`Causa/Motivo: ${log.motivo}`);
    if (log.valorAnterior && log.valorNuevo) {
      descParts.push(`Transición: "${log.valorAnterior}" â†’ "${log.valorNuevo}"`);
    }

    return {
      id: log.id,
      title: log.eventoLabel,
      description: descParts.join(" â€¢ "),
      date: log.fecha,
      user: log.actor,
      status,
      statusLabel: log.resultado,
      icon,
    };
  };

  // Timeline filtrado por usuario (ID-02)
  const timelineItems: TimelineItem[] = useMemo(() => {
    if (!usuario) return [];
    let logs = auditoria.filter(
      (a) =>
        a.usuarioAfectadoId === usuario.id ||
        a.usuarioAfectadoCedula === usuario.cedula
    );

    if (filtroAuditTipo !== "TODOS") {
      logs = logs.filter((a) => a.evento === filtroAuditTipo);
    }

    if (filtroAuditPeriodo === "7D") {
      logs = logs.filter((a) => a.fecha.includes("09/2026") || a.fecha.includes("2026"));
    } else if (filtroAuditPeriodo === "30D") {
      logs = logs.filter((a) => a.fecha.includes("09/2026") || a.fecha.includes("08/2026"));
    } else if (filtroAuditPeriodo === "2026") {
      logs = logs.filter((a) => a.fecha.includes("2026"));
    }

    return logs.map(mapEventoToTimelineItem);
  }, [usuario, auditoria, filtroAuditTipo, filtroAuditPeriodo]);

  if (!usuario) {
    return (
      <WireframeDashboardLayout
        activeMenu="cuentas-internas"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Cuentas internas", href: "/cuentas-internas" },
          { label: "Detalle de cuenta" },
        ]}
      >
        <div className="p-8 text-center space-y-4">
          <p className="text-base font-semibold text-foreground">Cuenta interna no encontrada</p>
          <Link href="/cuentas-internas">
            <Button variant="neutral" size="sm">
              <ArrowLeft className="size-4 mr-2" />
              Volver a cuentas internas
            </Button>
          </Link>
        </div>
      </WireframeDashboardLayout>
    );
  }

  return (
    <WireframeDashboardLayout
      activeMenu="cuentas-internas"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Cuentas internas", href: "/cuentas-internas" },
        { label: usuario.nombreCompleto },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Cabecera del expediente */}
          <div className="flex flex-col gap-4 pb-4 border-b border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <Button
                  variant="neutral"
                  size="sm"
                  asChild
                  leftIcon={<ArrowLeft className="size-4" />}
                >
                  <Link href="/cuentas-internas">
                    Volver a cuentas internas
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="neutral"
                  size="sm"
                  asChild
                  leftIcon={<History className="size-3.5" />}
                >
                  <Link href={`/auditoria-cuentas?cuenta=${encodeURIComponent(usuario.id)}`}>
                    Ver auditoría completa
                  </Link>
                </Button>

                {usuario.estado !== "RETIRADO" && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    leftIcon={<Edit2 className="size-3.5" />}
                  >
                    Editar cuenta interna
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-foreground break-words">
                    {usuario.nombreCompleto}
                  </h1>
                  {getEstadoBadge(usuario.estado)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal">
                  Expediente de cuenta interna, atribuciones asignadas y trazabilidad histórica del funcionario.
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px] text-foreground font-semibold">
                    ID: {usuario.id}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1">
                    <Lock className="size-3 text-muted-foreground" />
                    C.I. {usuario.cedula}
                  </span>
                  <span>•</span>
                  <span className="break-all">{usuario.correo}</span>
                </div>
              </div>

              {/* Acciones de ciclo de vida */}
              <div className="flex flex-wrap items-center gap-2">
                {usuario.estado === "PENDIENTE_ACTIVACION" && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      setAccionTipo("ACTIVAR");
                      setAccionOpen(true);
                    }}
                    className="text-xs gap-1.5 text-warning hover:bg-warning/10 font-medium"
                  >
                    <Check className="size-3.5" />
                    <span>Activar</span>
                  </Button>
                )}

                {usuario.estado === "ACTIVO" && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      setAccionTipo("SUSPENDER");
                      setAccionOpen(true);
                    }}
                    className="text-xs gap-1.5 text-danger hover:bg-danger/10 font-medium"
                  >
                    <UserMinus className="size-3.5" />
                    <span>Suspender</span>
                  </Button>
                )}

                {usuario.estado === "SUSPENDIDO" && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      setAccionTipo("REACTIVAR");
                      setAccionOpen(true);
                    }}
                    className="text-xs gap-1.5 text-warning hover:bg-warning/10 font-medium"
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Reactivar</span>
                  </Button>
                )}

                {usuario.estado !== "RETIRADO" && (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={() => {
                      setMotivoAccion("");
                      setErrorAccion("");
                      setModalBajaOpen(true);
                    }}
                    className="text-xs gap-1.5 text-danger hover:bg-danger/10 font-medium"
                  >
                    <UserX className="size-3.5" />
                    <span>Dar de baja</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas del expediente */}
          <TooltipProvider delayDuration={200}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
              <TabsList className="bg-muted/40 p-1 rounded-xl w-full sm:w-auto flex flex-wrap">
                <TabsTrigger value="general" className="text-xs font-semibold px-4 py-2">
                  Datos generales
                </TabsTrigger>
                <TabsTrigger value="roles" className="text-xs font-semibold px-4 py-2">
                  Roles y ámbito
                </TabsTrigger>
                <TabsTrigger value="tareas" className="text-xs font-semibold px-4 py-2">
                  Tareas y responsabilidades {usuario.tareasActivas > 0 && `(${usuario.tareasActivas})`}
                </TabsTrigger>
                <TabsTrigger value="auditoria" className="text-xs font-semibold px-4 py-2">
                  Historial de auditoría
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Datos Generales */}
              <TabsContent value="general" className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identidad */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <div className="flex items-center gap-2.5">
                        <User className="size-4.5 shrink-0" />
                        <h3 className="text-sm font-bold font-heading text-foreground">
                          Identidad y Contacto Institucional
                        </h3>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                            aria-label="Información sobre Identidad y Contacto Institucional"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          variant="surface"
                          title="Trazabilidad inalterable"
                          description="La cédula no puede modificarse tras su creación para asegurar la integridad de los registros institucionales."
                        />
                      </Tooltip>
                    </div>

                    <div className="space-y-3 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Nombres completos:</span>
                        <span className="font-semibold text-foreground text-sm">{usuario.nombreCompleto}</span>
                      </div>

                      {/* Cédula inmutable */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-[11px]">Cédula de identidad:</span>
                          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 font-mono text-[10px]">
                            <Lock className="size-2.5" /> Inmutable
                          </Badge>
                        </div>
                        <p className="font-mono font-bold text-foreground text-sm">{usuario.cedula}</p>
                      </div>

                      <div>
                        <span className="text-muted-foreground block text-[11px]">Correo electrónico institucional:</span>
                        <span className="font-medium text-foreground">{usuario.correo}</span>
                        <div className="pt-1.5">
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
                    </div>
                  </div>

                  {/* Factores de Seguridad */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                    <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="size-4.5 shrink-0" />
                        <h3 className="text-sm font-bold font-heading text-foreground">
                          Factores de Seguridad y Acceso
                        </h3>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                            aria-label="Información sobre Factores de Seguridad y Acceso"
                          >
                            <Info className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          variant="surface"
                          title="Políticas de seguridad"
                          description="El acceso requiere contraseña institucional y segundo factor TOTP vinculado mediante Google Authenticator. No se exponen credenciales en la interfaz."
                        />
                      </Tooltip>
                    </div>

                    <div className="space-y-3 text-xs pt-1">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="size-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Contraseña institucional</p>
                            <p className="text-[10px] text-muted-foreground">Establecida mediante enlace temporal</p>
                          </div>
                        </div>
                        {usuario.credencialesConfiguradas ? (
                          <Badge tone="success" appearance="soft" size="sm">Configurada</Badge>
                        ) : (
                          <Badge tone="warning" appearance="soft" size="sm">No configurada</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                        <div className="flex items-center gap-2.5">
                          <Fingerprint className="size-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">Google Authenticator (TOTP)</p>
                            <p className="text-[10px] text-muted-foreground">Segundo factor obligatorio de acceso</p>
                          </div>
                        </div>
                        {usuario.totpConfigurado ? (
                          <Badge tone="success" appearance="soft" size="sm">Vinculado</Badge>
                        ) : (
                          <Badge tone="warning" appearance="soft" size="sm">No vinculado</Badge>
                        )}
                      </div>

                      {/* Nota de confidencialidad */}
                      <div className="p-2.5 rounded-lg bg-info/10 border border-info/20 text-[11px] text-muted-foreground flex items-center gap-2">
                        <Shield className="size-4 text-info shrink-0" />
                        <span>Por directiva de seguridad, ningún código o token se expone en la interfaz.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas de Registro y Acceso */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <div className="flex items-center gap-2.5">
                      <Clock className="size-4.5 shrink-0" />
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Fechas de Registro y Acceso
                      </h3>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                          aria-label="Información sobre Fechas de Auditoría"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        variant="surface"
                        title="Trazabilidad temporal"
                        description="Marcas de tiempo de creación, última modificación y sesión reciente en el portal."
                      />
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                      <span className="text-muted-foreground block text-[11px]">Fecha de registro:</span>
                      <span className="font-medium text-foreground">{usuario.fechaCreacion}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                      <span className="text-muted-foreground block text-[11px]">Última actualización:</span>
                      <span className="font-medium text-foreground">{usuario.ultimaActualizacion || "N/A"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
                      <span className="text-muted-foreground block text-[11px]">Último ingreso al portal:</span>
                      <span className="font-medium text-foreground">{usuario.ultimoAcceso || "Sin ingresos registrados"}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

            {/* Tab 2: Roles y Ámbito */}
            <TabsContent value="roles" className="space-y-4 pt-1">
              <div className="p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <div className="flex items-center gap-2.5">
                    <Building className="size-4.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Rol y Ámbito Institucional Asignado
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                          aria-label="Información sobre Rol y Ámbito Asignado"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        variant="surface"
                        title="Control de facultades"
                        description="Define las atribuciones operativas en el portal. Todo cambio de rol o ámbito invalida las sesiones activas concurrentes."
                      />
                    </Tooltip>
                    {usuario.estado !== "RETIRADO" && (
                      <Button
                        variant="neutral"
                        size="sm"
                        asChild
                        className="text-xs gap-1.5 h-8"
                      >
                        <Link href={`/cuentas-internas/${usuario.id}/editar`}>
                          <Edit2 className="size-3.5" />
                          <span>Modificar</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                    <span className="text-muted-foreground text-[11px] block">Rol institucional:</span>
                    <div className="pt-0.5">
                      <RolBadge rol={usuario.rol} label={usuario.rolLabel} size="md" className="h-7 px-3 text-xs" />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground block">Código de rol: {usuario.rol}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1 min-w-0">
                    <span className="text-muted-foreground text-[11px]">Ámbito institucional:</span>
                    <p className="font-bold text-sm text-foreground break-words">{usuario.ambito}</p>
                    <span className="font-mono text-[10px] text-muted-foreground">Código de ámbito: {usuario.ambitoCodigo}</span>
                  </div>
                </div>

                {/* Advertencia de invalidación de sesiones */}
                <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/20 text-xs space-y-1 text-warning-foreground">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="size-4 text-warning" />
                    <span>Control de sesiones concurrentes:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Si se modifica el rol o el ámbito del funcionario, cualquier sesión activa se invalidará de manera forzada e inmediata. Todo cambio exige un motivo obligatorio y queda asentado en la bitácora con los valores anteriores y nuevos.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Tareas y Responsabilidades */}
            <TabsContent value="tareas" className="space-y-4 pt-1">
              <div className="p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="size-4.5 shrink-0" />
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      Responsabilidades y Trámites Asignados
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      tone={usuario.tareasActivas > 0 ? "danger" : "success"}
                      appearance="soft"
                      size="sm"
                      className="font-semibold"
                    >
                      {usuario.tareasActivas > 0
                        ? `${usuario.tareasActivas} trámite(s) activo(s)`
                        : "Sin tareas pendientes"}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                          aria-label="Información sobre Responsabilidades y Trámites"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        variant="surface"
                        title="Control de pendientes"
                        description="Para autorizar la baja lógica institucional, el funcionario no debe tener expedientes o trámites pendientes bajo su responsabilidad."
                      />
                    </Tooltip>
                  </div>
                </div>

                {usuario.tareasActivas > 0 ? (
                  <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-1.5 text-destructive">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="size-4" />
                        <span>Bloqueo preventivo de baja lógica</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Esta cuenta tiene trámites asignados en curso. Conforme a las reglas de negocio institucionales, no se permite dar de baja a un usuario con responsabilidades pendientes hasta que el Director de área reasigne o resuelva los expedientes:
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-foreground">Detalle de trámites asignados:</span>
                      <div className="divide-y divide-border/60 border border-border/80 rounded-xl overflow-hidden bg-surface">
                        {usuario.detalleTareas?.map((tarea, idx) => (
                          <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-muted/20">
                            <span className="font-medium text-foreground">{tarea}</span>
                            <Badge tone="neutral" appearance="outline" size="sm">En curso</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-xs space-y-1 text-success">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="size-4" />
                      <span>Condiciones de baja cumplidas</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      La persona no registra trámites ni responsabilidades pendientes. En caso de requerirse, puede procesarse la baja lógica con la debida justificación.
                    </p>
                  </div>
                )}

                {/* Responsabilidades descritas */}
                {usuario.responsabilidades && usuario.responsabilidades.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-foreground">Atribuciones registradas:</span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-1">
                      {usuario.responsabilidades.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab 4: Historial de Auditoría */}
            <TabsContent value="auditoria" className="space-y-4 pt-1">
              <div className="p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <div className="flex items-center gap-2.5">
                    <History className="size-4.5 shrink-0" />
                    <h3 className="text-sm font-bold font-heading text-foreground">
                      Trazabilidad y Bitácora de Seguridad
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="success" appearance="soft" size="sm" className="gap-1 text-[10px]">
                      <ShieldCheck className="size-3" />
                      Sin exposición de credenciales
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center size-7 rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-colors"
                          aria-label="Información sobre Bitácora de Seguridad"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        variant="surface"
                        title="Trazabilidad oficial"
                        description="Historial inalterable de creación, cambios de rol/ámbito, suspensiones y accesos institucionales."
                      />
                    </Tooltip>
                  </div>
                </div>

                {/* Filtros de la bitácora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-foreground">
                      Tipo de evento
                    </Label>
                    <Combobox
                      value={{
                        value: filtroAuditTipo,
                        label: filtroAuditTipo === "TODOS" ? "Todos los eventos" : filtroAuditTipo,
                      }}
                      onValueChange={(item) => setFiltroAuditTipo(item?.value || "TODOS")}
                    >
                      <ComboboxSelectTrigger className="w-full text-xs h-8 bg-surface" />
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxItem value={{ value: "TODOS", label: "Todos los eventos" }}>
                            Todos los eventos
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "CUENTA_CREADA", label: "Alta / Creación" }}>
                            Alta / Creación
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "ACTIVACION", label: "Activación" }}>
                            Activación
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "CAMBIO_ROL", label: "Cambio de rol" }}>
                            Cambio de rol
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "CAMBIO_AMBITO", label: "Cambio de ámbito" }}>
                            Cambio de ámbito
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "SUSPENSION", label: "Suspensión" }}>
                            Suspensión
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "REACTIVACION", label: "Reactivación" }}>
                            Reactivación
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "BAJA_LOGICA", label: "Baja lógica" }}>
                            Baja lógica
                          </ComboboxItem>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-foreground">
                      Período
                    </Label>
                    <Combobox
                      value={{
                        value: filtroAuditPeriodo,
                        label: filtroAuditPeriodo === "TODOS" ? "Todo el historial" : filtroAuditPeriodo,
                      }}
                      onValueChange={(item) => setFiltroAuditPeriodo(item?.value || "TODOS")}
                    >
                      <ComboboxSelectTrigger className="w-full text-xs h-8 bg-surface" />
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxItem value={{ value: "TODOS", label: "Todo el período" }}>
                            Todo el período
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "7D", label: "Últimos 7 días" }}>
                            Últimos 7 días
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "30D", label: "Últimos 30 días" }}>
                            Últimos 30 días
                          </ComboboxItem>
                          <ComboboxItem value={{ value: "2026", label: "Año 2026" }}>
                            Año 2026
                          </ComboboxItem>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {/* Timeline */}
                {timelineItems.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                    No existen eventos registrados que coincidan con los filtros seleccionados.
                  </div>
                ) : (
                  <div className="pt-2">
                    <Timeline items={timelineItems} />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TooltipProvider>
        </Card>
      </main>

      {/* Modales de ciclo de vida (reutilizados para activar, suspender, reactivar y dar de baja) */}
      <AccionCuentaDialog
        tipo={accionTipo}
        usuario={usuario}
        open={accionOpen}
        onOpenChange={setAccionOpen}
      />

      {/* Modal Dar de baja */}
      <Dialog open={modalBajaOpen} onOpenChange={setModalBajaOpen}>
        <DialogContent
          variant="danger"
          size="2xl"
          className="p-5 sm:p-6 text-left"
          showCloseButton={true}
        >
          <DialogHeader className="gap-1 text-left items-start">
            <DialogTitle className="font-heading font-extrabold text-lg sm:text-xl text-foreground">
              Dar de baja a cuenta interna
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-left">
              Retira la cuenta conservando todo el historial de auditoría inalterable. No se realiza borrado físico ni baja parcial.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBajaSubmit} className="space-y-3.5 pt-1 w-full text-left">
            {errorAccion && (
              <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorAccion}</span>
              </div>
            )}

            {/* Resumen Funcionario en 3 columnas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40 border border-border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Funcionario:</span>
                <span className="font-semibold text-foreground">{usuario.nombreCompleto}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Cédula:</span>
                <span className="font-mono text-foreground">{usuario.cedula}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] mb-1">Rol actual:</span>
                <RolBadge rol={usuario.rol} label={usuario.rolLabel} size="sm" />
              </div>
            </div>

            {/* Verificación de responsabilidades pendientes */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground block">
                Verificación previa de responsabilidades y trámites:
              </span>

              {usuario.tareasActivas > 0 ? (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-1.5 text-destructive">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="size-4" />
                    <span>Imposible dar de baja: {usuario.tareasActivas} trámite(s) activo(s)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    La persona tiene trámites asignados en curso. Conforme a las reglas de negocio, se exige resolverlos o reasignarlos antes de poder dar de baja a la cuenta.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-xs space-y-1 text-success">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="size-4" />
                    <span>Sin trámites activos ni responsabilidades pendientes</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    El usuario cumple las condiciones requeridas para la baja institucional.
                  </p>
                </div>
              )}
            </div>

            {/* Justificación obligatoria (ID-04) */}
            <div className="space-y-1.5">
              <Label htmlFor="baja-justificacion-det" className="text-xs font-semibold text-foreground">
                Justificación obligatoria <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="baja-justificacion-det"
                appearance="compact"
                placeholder="Detalla el memorando, acción de personal o resolución administrativa..."
                rows={2}
                value={motivoAccion}
                onChange={(e) => setMotivoAccion(e.target.value)}
                className="text-xs min-h-[56px] resize-none bg-background"
                required
              />
              <span className="text-[10px] text-muted-foreground">
                Mínimo 10 caracteres. Todo el historial de auditoría se conservará inalterable sin borrado físico.
              </span>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex flex-row items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="neutral"
                size="default"
                onClick={() => setModalBajaOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="default"
                disabled={usuario.tareasActivas > 0}
              >
                Confirmar baja definitiva
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Cuenta Interna (Diseño exacto en Dialog) */}
      <EditarCuentaInternaModal
        usuario={usuario}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </WireframeDashboardLayout>
  );
}
