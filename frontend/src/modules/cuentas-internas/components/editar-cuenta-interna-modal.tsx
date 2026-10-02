"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Edit2,
  ShieldCheck,
  Mail,
  AlertCircle,
  Info,
  CheckCircle2,
  Lock,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  History,
  Fingerprint,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useUsuariosStore,
  UsuarioInterno,
  RolInterno,
  ROLES_INTERNOS_CATALOGO,
} from "@/modules/usuarios/data/usuarios-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RolBadge } from "./rol-badge";

interface EditarCuentaInternaModalProps {
  usuario: UsuarioInterno | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountUpdated?: (user: UsuarioInterno) => void;
}

type FeedbackScenario =
  | "EXITO"
  | "CAMBIO_CORREO_PENDIENTE"
  | "FALLO_ENVIAR_ENLACE"
  | "FALLO_INVALIDAR_SESIONES"
  | "CORREO_CONFIRMADO"
  | "PERDIDA_CORREO_ANTERIOR";

type LinkState = "Pendiente" | "Usado" | "Vencido" | "Revocado";

interface VerificationLinkInfo {
  id: string;
  correoDestino: string;
  estado: LinkState;
  creado: string;
  expira: string;
  tokenOculto: string;
}

export function EditarCuentaInternaModal({
  usuario,
  open,
  onOpenChange,
  onAccountUpdated,
}: EditarCuentaInternaModalProps) {
  const { editarUsuario } = useUsuariosStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Estados de los campos según HU ID-02
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolInterno>("EQ_GESTION");
  const [rolSearch, setRolSearch] = useState("");
  const [areaCodigo, setAreaCodigo] = useState("DGR");
  const [areaSearch, setAreaSearch] = useState("");
  const [motivo, setMotivo] = useState("");

  // Control de errores inline y campos tocados
  const [errors, setErrors] = useState<{
    correo?: string;
    rol?: string;
    areaCodigo?: string;
    motivo?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Estados del flujo de cambio de correo (HU ID-02)
  const [enlaceVerificacion, setEnlaceVerificacion] = useState<VerificationLinkInfo | null>(null);
  const [feedbackScenario, setFeedbackScenario] = useState<FeedbackScenario | null>(null);
  const [incidentRef, setIncidentRef] = useState<string | null>(null);

  // Cargar datos al abrir el modal con el usuario seleccionado
  useEffect(() => {
    if (usuario && open) {
      setCorreo(usuario.correo);
      setRol(usuario.rol);
      setAreaCodigo(usuario.ambitoCodigo);
      setMotivo("");
      setErrors({});
      setTouched({});
      setFeedbackScenario(null);
      setEnlaceVerificacion(null);
      setIncidentRef(null);

      const rolCfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === usuario.rol);
      setRolSearch(rolCfg ? rolCfg.nombre : "");

      const areaCfg = rolCfg?.ambitosPermitidos.find((a) => a.codigo === usuario.ambitoCodigo);
      setAreaSearch(areaCfg ? areaCfg.nombre : "");
    }
  }, [usuario, open]);

  // Roles activos exclusivamente
  const rolesActivos = useMemo(() => {
    return ROLES_INTERNOS_CATALOGO.filter((r) => r.id !== ("SINARP_COORD" as any));
  }, []);

  // Áreas DINARP activas para el rol seleccionado
  const rolConfig = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol);
  const areasActivas = useMemo(() => {
    if (!rolConfig) return [];
    return rolConfig.ambitosPermitidos.filter((a) => a.activa !== false);
  }, [rolConfig]);

  // Filtrado reactivo de roles y áreas para Combobox
  const filteredRoles = useMemo(() => {
    if (!rolSearch.trim()) return rolesActivos;
    const currentSelected = rolesActivos.find((r) => r.id === rol);
    if (currentSelected && currentSelected.nombre.toLowerCase() === rolSearch.trim().toLowerCase()) {
      return rolesActivos;
    }
    const q = rolSearch.toLowerCase();
    return rolesActivos.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [rolSearch, rolesActivos, rol]);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) return areasActivas;
    const currentSelected = areasActivas.find((a) => a.codigo === areaCodigo);
    if (currentSelected && currentSelected.nombre.toLowerCase() === areaSearch.trim().toLowerCase()) {
      return areasActivas;
    }
    const q = areaSearch.toLowerCase();
    return areasActivas.filter(
      (a) => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q)
    );
  }, [areaSearch, areasActivas, areaCodigo]);

  // Manejar cambio de rol asegurando consistencia con las áreas activas
  const handleRolChange = (nuevoRol: RolInterno) => {
    setRol(nuevoRol);
    const cfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === nuevoRol);
    if (cfg) {
      setRolSearch(cfg.nombre);
    }

    const areasParaNuevoRol = cfg?.ambitosPermitidos.filter((a) => a.activa !== false) || [];
    if (areasParaNuevoRol.length > 0) {
      setAreaCodigo(areasParaNuevoRol[0].codigo);
      setAreaSearch(areasParaNuevoRol[0].nombre);
      if (touched.areaCodigo) {
        setErrors((prev) => ({
          ...prev,
          areaCodigo: validateArea(areasParaNuevoRol[0].codigo, nuevoRol) || undefined,
        }));
      }
    } else {
      setAreaCodigo("");
      setAreaSearch("");
    }

    if (touched.rol) {
      setErrors((prev) => ({
        ...prev,
        rol: validateRol(nuevoRol) || undefined,
      }));
    }
  };

  // Validaciones inline oficiales conforme a HU ID-02
  const validateCorreo = (val: string) => {
    const clean = val.trim().toLowerCase();
    if (!clean) return "El correo institucional es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return "Formato de correo electrónico inválido.";
    }
    if (!clean.endsWith("@dinarp.gob.ec") && !clean.endsWith("@glocation.com.co")) {
      return "El correo debe pertenecer al dominio institucional (@dinarp.gob.ec).";
    }
    return null;
  };

  const validateRol = (val: string) => {
    if (!val) return "Rol no permitido; selecciona uno activo";
    const valido = rolesActivos.find((r) => r.id === val);
    if (!valido) {
      return "Rol no permitido; selecciona uno activo";
    }
    return null;
  };

  const validateArea = (codigo: string, rolActual: RolInterno) => {
    if (!codigo) return "Área inexistente o inactiva; selecciona un área activa";
    const cfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rolActual);
    if (!cfg) return "Rol no permitido; selecciona uno activo";
    const area = cfg.ambitosPermitidos.find((a) => a.codigo === codigo);
    if (!area || area.activa === false) {
      return "Área inexistente o inactiva; selecciona un área activa";
    }
    return null;
  };

  const validateMotivo = (val: string) => {
    const clean = val.trim();
    if (!clean) return "El motivo de la modificación es obligatorio.";
    if (clean.length < 10) return "El motivo debe contener al menos 10 caracteres explicativos.";
    return null;
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "correo") {
      setErrors((prev) => ({ ...prev, correo: validateCorreo(correo) || undefined }));
    } else if (field === "rol") {
      setErrors((prev) => ({ ...prev, rol: validateRol(rol) || undefined }));
    } else if (field === "areaCodigo") {
      setErrors((prev) => ({ ...prev, areaCodigo: validateArea(areaCodigo, rol) || undefined }));
    } else if (field === "motivo") {
      setErrors((prev) => ({ ...prev, motivo: validateMotivo(motivo) || undefined }));
    }
  };

  // Detección de cambios respecto al usuario original para trazabilidad
  const isCorreoCambiado = usuario ? correo.trim().toLowerCase() !== usuario.correo.toLowerCase() : false;
  const isRolCambiado = usuario ? rol !== usuario.rol : false;
  const isAreaCambiada = usuario ? areaCodigo !== usuario.ambitoCodigo : false;
  const hasChanges = isCorreoCambiado || isRolCambiado || isAreaCambiada;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    const errCorreo = validateCorreo(correo);
    const errRol = validateRol(rol);
    const errArea = validateArea(areaCodigo, rol);
    const errMotivo = validateMotivo(motivo);

    setTouched({
      correo: true,
      rol: true,
      areaCodigo: true,
      motivo: true,
    });

    setErrors({
      correo: errCorreo || undefined,
      rol: errRol || undefined,
      areaCodigo: errArea || undefined,
      motivo: errMotivo || undefined,
      general: undefined,
    });

    if (errCorreo || errRol || errArea || errMotivo) return;

    if (!hasChanges) {
      toast.info("Sin modificaciones detectadas", {
        description: "No se han detectado cambios respecto al estado actual de la cuenta.",
      });
      return;
    }

    setIsSaving(true);

    // Regla ID-02: Si cambia el correo institucional, NO reemplazar inmediatamente el correo actual.
    // El nuevo correo queda en estado Declarado / Pendiente de verificación y se emite enlace.
    if (isCorreoCambiado) {
      const nuevoEnlace: VerificationLinkInfo = {
        id: `LNK-VER-${Math.floor(1000 + Math.random() * 9000)}`,
        correoDestino: correo.trim().toLowerCase(),
        estado: "Pendiente",
        creado: "Hoy, ahora",
        expira: "En 24 horas",
        tokenOculto: "•••••••• (Token de verificación seguro)",
      };
      setEnlaceVerificacion(nuevoEnlace);
      setFeedbackScenario("CAMBIO_CORREO_PENDIENTE");
      setIsSaving(false);

      toast.warning("Verificación de correo requerida", {
        description: `Se emitió enlace a ${correo}. El correo actual se mantendrá hasta que se verifique la nueva dirección.`,
      });
      return;
    }

    // Si solo cambia rol o área, actualizar e invalidar sesiones afectadas
    const res = editarUsuario(usuario.id, {
      rol,
      ambitoCodigo: areaCodigo,
      motivoCambio: motivo.trim(),
      actor: currentUser.name,
    });

    setIsSaving(false);

    if (!res.ok) {
      setErrors((prev) => ({ ...prev, general: res.error || "Error al actualizar la cuenta." }));
      toast.error("No se pudo actualizar la cuenta", {
        description: res.error,
      });
      return;
    }

    toast.success("Cambios de cuenta guardados exitosamente", {
      description: "Permisos actualizados. Las sesiones activas han sido invalidadas.",
    });

    if (onAccountUpdated) {
      const rolNom = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol)?.nombre || usuario.rolLabel;
      const areaNom = areasActivas.find((a) => a.codigo === areaCodigo)?.nombre || usuario.ambito;
      onAccountUpdated({
        ...usuario,
        rol,
        rolLabel: rolNom,
        ambito: areaNom,
        ambitoCodigo: areaCodigo,
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setFeedbackScenario(null);
    setEnlaceVerificacion(null);
    onOpenChange(false);
  };

  // ── MÉTODOS DEL SIMULADOR HU ID-02 ──

  const simulateCambioExitoso = () => {
    if (!usuario) return;
    setRol("DIR_GESTION");
    setRolSearch("Director de Gestión y Registro");
    setAreaCodigo("DGR");
    setAreaSearch("Dirección de Gestión y Registro (DGR)");
    setMotivo("Reasignación directiva conforme a resolución administrativa DINARP-2026-042");
    setErrors({});
    setTouched({});
    setFeedbackScenario("EXITO");
    setIncidentRef(null);
    toast.success("Simulación ID-02: Cambio exitoso", {
      description: "Cambios de cuenta guardados. Sesiones activas invalidadas.",
    });
  };

  const simulateRolNoPermitido = () => {
    setRol("" as any);
    setRolSearch("");
    setTouched((prev) => ({ ...prev, rol: true }));
    setErrors((prev) => ({
      ...prev,
      rol: "Rol no permitido; selecciona uno activo",
    }));
    toast.error("Simulación ID-02: Rol no permitido", {
      description: "Error inline: Rol no permitido; selecciona uno activo",
    });
  };

  const simulateAreaInactiva = () => {
    setRol("ADMIN");
    setRolSearch("Administrador del Sistema");
    setAreaCodigo("DINARP_HIST_DIS");
    setAreaSearch("Coordinación Territorial Histórica (Inactiva)");
    setTouched((prev) => ({ ...prev, areaCodigo: true }));
    setErrors((prev) => ({
      ...prev,
      areaCodigo: "Área inexistente o inactiva; selecciona un área activa",
    }));
    toast.error("Simulación ID-02: Área inactiva", {
      description: "Error inline: Área inexistente o inactiva; selecciona un área activa",
    });
  };

  const simulateCambioCorreoPendiente = () => {
    if (!usuario) return;
    const nuevo = "nuevo.funcionario@dinarp.gob.ec";
    setCorreo(nuevo);
    setMotivo("Actualización de buzón por cambio de jefatura institucional");
    setEnlaceVerificacion({
      id: "LNK-VER-3921",
      correoDestino: nuevo,
      estado: "Pendiente",
      creado: "01/10/2026 15:10",
      expira: "02/10/2026 15:10 (24h)",
      tokenOculto: "•••••••• (Token de verificación seguro)",
    });
    setFeedbackScenario("CAMBIO_CORREO_PENDIENTE");
    setIncidentRef(null);
    toast.warning("Simulación ID-02: Cambio de correo pendiente", {
      description: "Verificación de correo pendiente. Correo actual vigente hasta verificar.",
    });
  };

  const simulateEnlaceVencido = () => {
    if (!enlaceVerificacion) {
      simulateCambioCorreoPendiente();
    }
    setEnlaceVerificacion((prev) =>
      prev ? { ...prev, estado: "Vencido" } : null
    );
    toast.warning("Simulación ID-02: Enlace vencido", {
      description: "El enlace de verificación caducó. Se requiere generar un nuevo enlace.",
    });
  };

  const simulateEnlaceRevocado = () => {
    if (!enlaceVerificacion) {
      simulateCambioCorreoPendiente();
    }
    setEnlaceVerificacion((prev) =>
      prev ? { ...prev, estado: "Revocado" } : null
    );
    toast.info("Simulación ID-02: Enlace revocado", {
      description: "El enlace previo quedó revocado por emisión de uno nuevo.",
    });
  };

  const simulateFalloEnviarEnlace = () => {
    if (!usuario) return;
    setCorreo("fallo.entrega@dinarp.gob.ec");
    setEnlaceVerificacion({
      id: "LNK-VER-9999",
      correoDestino: "fallo.entrega@dinarp.gob.ec",
      estado: "Pendiente",
      creado: "Ahora mismo",
      expira: "En 24 horas",
      tokenOculto: "••••••••",
    });
    setFeedbackScenario("FALLO_ENVIAR_ENLACE");
    toast.error("Simulación ID-02: Fallo al enviar enlace", {
      description: "No se pudo entregar el correo con el enlace de verificación institucional.",
    });
  };

  const simulateFalloInvalidarSesiones = () => {
    setFeedbackScenario("FALLO_INVALIDAR_SESIONES");
    setIncidentRef("INC-2026-0918");
    toast.error("Simulación ID-02: Fallo al invalidar sesiones", {
      description: "Sincronización de sesiones pendiente · Referencia: INC-2026-0918",
    });
  };

  const simulateCorreoConfirmado = () => {
    if (!usuario) return;
    const correoNuevoFinal = enlaceVerificacion?.correoDestino || correo || "confirmado@dinarp.gob.ec";
    setFeedbackScenario("CORREO_CONFIRMADO");
    setEnlaceVerificacion((prev) => (prev ? { ...prev, estado: "Usado" } : null));

    editarUsuario(usuario.id, {
      correo: correoNuevoFinal,
      rol,
      ambitoCodigo: areaCodigo,
      motivoCambio: motivo.trim() || "Confirmación de enlace de verificación de correo institucional",
      actor: currentUser.name,
    });

    if (onAccountUpdated) {
      onAccountUpdated({
        ...usuario,
        correo: correoNuevoFinal,
        rol,
        ambitoCodigo: areaCodigo,
      });
    }

    toast.success("Simulación ID-02: Correo verificado", {
      description: `Nuevo correo ${correoNuevoFinal} marcado como Verificado. Sesiones previas cerradas.`,
    });
  };

  const simulatePerdidaCorreoAnterior = () => {
    setFeedbackScenario("PERDIDA_CORREO_ANTERIOR");
    toast.info("Simulación ID-02: Pérdida del correo anterior", {
      description: "Se requiere tramitar previamente ID-08 Recuperación asistida.",
    });
  };

  const handleResetForm = () => {
    if (usuario) {
      setCorreo(usuario.correo);
      setRol(usuario.rol);
      setAreaCodigo(usuario.ambitoCodigo);
      setMotivo("");
      setErrors({});
      setTouched({});
      setFeedbackScenario(null);
      setEnlaceVerificacion(null);
      setIncidentRef(null);
      const rolCfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === usuario.rol);
      setRolSearch(rolCfg ? rolCfg.nombre : "");
      const areaCfg = rolCfg?.ambitosPermitidos.find((a) => a.codigo === usuario.ambitoCodigo);
      setAreaSearch(areaCfg ? areaCfg.nombre : "");
    }
  };

  if (!usuario) return null;

  return (
    <TooltipProvider delayDuration={150}>
      {/* ── MODAL PRINCIPAL: EDICIÓN DE CUENTA (HU ID-02) ── */}
      <Dialog open={open && !feedbackScenario} onOpenChange={onOpenChange}>
        <DialogContent
          variant="standard"
          size="3xl"
          className="p-6 sm:p-8 max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          showCloseButton={true}
        >
          <form onSubmit={handleSubmit} className="flex flex-col w-full flex-1 min-h-0 overflow-hidden">
            {/* Cabecera fija */}
            <DialogHeader className="gap-1.5 text-left items-start shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="text-xl sm:text-2xl font-heading font-extrabold text-foreground flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Edit2 className="size-5" />
                </div>
                <span>Editar cuenta de usuario interno</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                Actualiza los datos institucionales, correo y atribuciones del funcionario. Se auditarán todos los cambios con registro obligatorio de motivo.
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo si la pantalla es reducida (pantallas grandes no scrollean) */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-4 space-y-5 flex-1 min-h-0">
              {/* Error general / backend si aplica */}
              {errors.general && (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="Error de actualización (ID-02)">
                  {errors.general}
                </Alert>
              )}

              {/* Formulario */}
              <div className="space-y-4 sm:space-y-5">
                {/* Fila 1: Cédula (Inmutable) y Correo institucional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Campo 1: Cédula de identidad (Inmutable / Solo lectura) */}
                  <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-cedula" className="text-xs font-semibold text-foreground">
                      Cédula de identidad
                    </Label>
                    <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 font-normal text-[10px]">
                      <Lock className="size-2.5" /> Inmutable
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre inmutabilidad de la cédula"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Número de 10 dígitos inmutable tras el alta de la cuenta por directivas de auditoría institucional.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <InputGroup
                    state="default"
                    size="sm"
                    className="w-full opacity-70 bg-muted/30 cursor-not-allowed"
                    leftIcon={<Fingerprint className="size-4 text-muted-foreground" />}
                    rightIcon={<Lock className="size-3.5 text-muted-foreground" />}
                  >
                    <InputGroupInput
                      id="edit-cedula"
                      value={usuario.cedula}
                      disabled
                      readOnly
                      tabIndex={-1}
                      className="font-mono cursor-not-allowed text-muted-foreground"
                    />
                  </InputGroup>
                </div>

                {/* Campo 2: Correo institucional */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="edit-correo" className="text-xs font-semibold text-foreground">
                      Correo institucional
                      <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                    </Label>
                    <Badge
                      tone={isCorreoCambiado ? "warning" : "success"}
                      appearance="soft"
                      size="sm"
                      className="text-[10px]"
                    >
                      {isCorreoCambiado ? "Pendiente verif." : "Verificado"}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre cambio de correo"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Si se modifica la dirección, el nuevo correo queda en estado Declarado y se emite enlace de verificación sin sustituir el actual hasta confirmarse.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <InputGroup
                    state={
                      errors.correo && touched.correo
                        ? "error"
                        : correo && !errors.correo
                        ? "success"
                        : "default"
                    }
                    size="sm"
                    className="w-full"
                    leftIcon={<Mail className="size-4" />}
                    rightIcon={
                      errors.correo && touched.correo ? (
                        <AlertCircle className="size-4 text-danger" />
                      ) : correo && !errors.correo ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : undefined
                    }
                  >
                    <InputGroupInput
                      id="edit-correo"
                      type="email"
                      placeholder="usuario@dinarp.gob.ec"
                      value={correo}
                      onChange={(e) => {
                        setCorreo(e.target.value);
                        if (touched.correo) {
                          setErrors((prev) => ({
                            ...prev,
                            correo: validateCorreo(e.target.value) || undefined,
                          }));
                        }
                      }}
                      onBlur={() => handleFieldBlur("correo")}
                      aria-invalid={Boolean(errors.correo && touched.correo)}
                    />
                  </InputGroup>
                  {errors.correo && touched.correo && (
                    <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1 mt-1 pl-3">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <p>{errors.correo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila 2: Rol interno y Área DINARP (Comboboxes oficiales con opciones activas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Campo 3: Rol interno */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Rol interno
                      <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre rol interno"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Perfil institucional de atribuciones en la plataforma (exclusivo personal DINARP).
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Combobox
                    value={rol}
                    onValueChange={(val) => {
                      if (val) handleRolChange(val as RolInterno);
                    }}
                    inputValue={rolSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ROLES_INTERNOS_CATALOGO.find(
                        (r) => r.id.toLowerCase() === newSearch.toLowerCase() || r.nombre.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setRolSearch(opt.nombre);
                      else setRolSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      state={errors.rol && touched.rol ? "error" : "default"}
                      size="sm"
                      placeholder="Seleccionar rol interno..."
                      showClear={false}
                      className="w-full"
                      title={rolSearch || undefined}
                    />
                    <ComboboxContent
                      state={errors.rol && touched.rol ? "error" : "default"}
                      className="z-[80]"
                    >
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Roles institucionales activos</ComboboxLabel>
                          {filteredRoles.map((item) => (
                            <ComboboxItem
                              key={item.id}
                              value={item.id}
                              className="text-xs py-2 flex items-center justify-between cursor-pointer"
                              title={item.nombre}
                            >
                              <span className="font-medium text-foreground truncate">{item.nombre}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredRoles.length === 0 && (
                          <ComboboxEmpty>No se encontraron roles activos.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {errors.rol && touched.rol && (
                    <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1 mt-1 pl-3">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <p>{errors.rol}</p>
                    </div>
                  )}
                </div>

                {/* Campo 4: Área DINARP */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label className="text-xs font-semibold text-foreground">
                      Área DINARP
                      <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre área DINARP"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Dirección o unidad administrativa orgánica según la estructura vigente.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Combobox
                    value={areaCodigo}
                    onValueChange={(val) => {
                      if (val) {
                        setAreaCodigo(val);
                        const matched = areasActivas.find((a) => a.codigo === val);
                        if (matched) setAreaSearch(matched.nombre);
                        if (touched.areaCodigo) {
                          setErrors((prev) => ({
                            ...prev,
                            areaCodigo: validateArea(val, rol) || undefined,
                          }));
                        }
                      }
                    }}
                    inputValue={areaSearch}
                    onInputValueChange={(newSearch) => {
                      setAreaSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      state={errors.areaCodigo && touched.areaCodigo ? "error" : "default"}
                      size="sm"
                      placeholder="Seleccionar área DINARP..."
                      showClear={false}
                      className="w-full"
                    />
                    <ComboboxContent
                      state={errors.areaCodigo && touched.areaCodigo ? "error" : "default"}
                      className="z-[80]"
                    >
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Áreas activas para el rol</ComboboxLabel>
                          {filteredAreas.map((a) => (
                            <ComboboxItem
                              key={a.codigo}
                              value={a.codigo}
                              className="text-xs py-1.5 flex flex-col items-start gap-0.5"
                            >
                              <span className="font-semibold text-foreground">{a.nombre}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">Código: {a.codigo}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredAreas.length === 0 && (
                          <ComboboxEmpty>No se encontraron áreas activas.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  {errors.areaCodigo && touched.areaCodigo && (
                    <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1 mt-1 pl-3">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <p>{errors.areaCodigo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fila 3: Motivo del cambio (Obligatorio) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="edit-motivo" className="text-xs font-semibold text-foreground">
                    Motivo del cambio
                    <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label="Información sobre motivo del cambio"
                        className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                      Justificación administrativa o técnica obligatoria para la bitácora inmutable de auditoría.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Textarea
                  id="edit-motivo"
                  appearance="compact"
                  placeholder="Justifique la modificación de permisos o datos institucionales (mínimo 10 caracteres)..."
                  rows={2}
                  value={motivo}
                  onChange={(e) => {
                    setMotivo(e.target.value);
                    if (touched.motivo) {
                      setErrors((prev) => ({
                        ...prev,
                        motivo: validateMotivo(e.target.value) || undefined,
                      }));
                    }
                  }}
                  onBlur={() => handleFieldBlur("motivo")}
                  aria-invalid={Boolean(errors.motivo && touched.motivo)}
                  className={cn(
                    "text-xs resize-none rounded-xl",
                    errors.motivo && touched.motivo && "border-danger ring-2 ring-danger/20"
                  )}
                />
                {errors.motivo && touched.motivo && (
                  <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1 mt-1 pl-3">
                    <AlertCircle className="size-3.5 shrink-0" />
                    <p>{errors.motivo}</p>
                  </div>
                )}
              </div>

              {/* Trazabilidad visual de cambios (Valor anterior → Valor nuevo) */}
              {hasChanges && (
                <div className="p-3 rounded-xl bg-surface border border-primary/25 space-y-2 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
                      <History className="size-3.5 text-primary" />
                      <span>Trazabilidad de cambios detectados</span>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm">
                      Auditoría activa
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {isRolCambiado && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-muted-foreground">
                        <span className="shrink-0">Rol institucional:</span>
                        <div className="flex flex-wrap items-center gap-1.5 font-medium min-w-0">
                          <RolBadge
                            rol={usuario.rol}
                            label={usuario.rolLabel}
                            size="sm"
                            appearanceOverride="outline"
                            className="opacity-70 line-through h-5 text-[10px] px-2"
                          />
                          <ArrowRight className="size-3 text-primary shrink-0" />
                          <RolBadge
                            rol={rol}
                            size="sm"
                            className="h-5 text-[10px] px-2"
                          />
                        </div>
                      </div>
                    )}

                    {isAreaCambiada && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-muted-foreground">
                        <span className="shrink-0">Área DINARP:</span>
                        <div className="flex flex-wrap items-center gap-1.5 font-medium min-w-0">
                          <span className="line-through opacity-70 break-words">{usuario.ambito}</span>
                          <ArrowRight className="size-3 text-primary shrink-0" />
                          <span className="text-foreground font-semibold break-words">
                            {areasActivas.find((a) => a.codigo === areaCodigo)?.nombre || areaCodigo}
                          </span>
                        </div>
                      </div>
                    )}

                    {isCorreoCambiado && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-muted-foreground">
                        <span className="shrink-0">Correo institucional:</span>
                        <div className="flex flex-wrap items-center gap-1.5 font-medium min-w-0">
                          <span className="line-through opacity-70 break-all">{usuario.correo}</span>
                          <ArrowRight className="size-3 text-warning shrink-0" />
                          <span className="text-warning font-semibold break-all">{correo} (Declarado)</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                      <span>Autor: <strong className="text-foreground">{currentUser.name}</strong></span>
                      <span>Fecha: <strong className="text-foreground">Hoy (al guardar)</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloque inferior: Cambios de permisos y seguridad (Texto exacto HU ID-02) */}
              <Alert
                variant="default"
                icon={<ShieldCheck className="size-4" />}
                title="Cambios de permisos y seguridad"
                className="mt-2"
              >
                Los cambios de rol o área invalidarán las sesiones afectadas. Un cambio de correo será efectivo únicamente después de verificar la nueva dirección.
              </Alert>
            </div>
            </div>

            {/* Footer fijo con Botones oficiales del UI Kit */}
            <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border shrink-0 mt-3">
              <Button
                type="button"
                variant="neutral"
                size="default"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="default"
                disabled={isSaving}
                className="w-full sm:w-auto font-semibold shadow-xs"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL DE FEEDBACK Y GESTIÓN DE VERIFICACIÓN (HU ID-02) ── */}
      {feedbackScenario && (
        <Dialog open={Boolean(feedbackScenario)} onOpenChange={handleClose}>
          <DialogContent
            variant={
              feedbackScenario === "CAMBIO_CORREO_PENDIENTE" || feedbackScenario === "PERDIDA_CORREO_ANTERIOR"
                ? "warning"
                : feedbackScenario === "EXITO" || feedbackScenario === "CORREO_CONFIRMADO"
                ? "success"
                : feedbackScenario === "FALLO_ENVIAR_ENLACE" || feedbackScenario === "FALLO_INVALIDAR_SESIONES"
                ? "danger"
                : "standard"
            }
            size="3xl"
            className="sm:max-w-3xl max-h-[90vh] flex flex-col overflow-hidden p-6 sm:p-8"
            showCloseButton={true}
          >
            {/* Cabecera fija */}
            <DialogHeader className="text-center items-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <div className="inline-flex items-center gap-2 mb-1">
                <Badge
                  tone={
                    feedbackScenario === "EXITO" || feedbackScenario === "CORREO_CONFIRMADO"
                      ? "success"
                      : feedbackScenario === "FALLO_ENVIAR_ENLACE" || feedbackScenario === "FALLO_INVALIDAR_SESIONES"
                      ? "danger"
                      : "warning"
                  }
                  appearance="soft"
                  size="md"
                >
                  {feedbackScenario === "EXITO" && "Cambios guardados"}
                  {feedbackScenario === "CAMBIO_CORREO_PENDIENTE" && "Verificación pendiente"}
                  {feedbackScenario === "FALLO_ENVIAR_ENLACE" && "Error de entrega"}
                  {feedbackScenario === "FALLO_INVALIDAR_SESIONES" && "Desincronización"}
                  {feedbackScenario === "CORREO_CONFIRMADO" && "Correo verificado"}
                  {feedbackScenario === "PERDIDA_CORREO_ANTERIOR" && "Recuperación asistida requerida"}
                </Badge>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                {feedbackScenario === "EXITO" && "Cambios de cuenta guardados"}
                {feedbackScenario === "CAMBIO_CORREO_PENDIENTE" && "Verificación de correo pendiente"}
                {feedbackScenario === "FALLO_ENVIAR_ENLACE" && "Fallo al enviar enlace de verificación"}
                {feedbackScenario === "FALLO_INVALIDAR_SESIONES" && "Sincronización de sesiones pendiente"}
                {feedbackScenario === "CORREO_CONFIRMADO" && "Nuevo correo verificado exitosamente"}
                {feedbackScenario === "PERDIDA_CORREO_ANTERIOR" && "Pérdida de acceso al correo institucional"}
              </DialogTitle>

              <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-0.5 leading-relaxed text-center max-w-lg">
                {feedbackScenario === "EXITO" &&
                  "Se han actualizado las atribuciones y el área de la cuenta. Las sesiones previas fueron invalidadas preventivamente."}
                {feedbackScenario === "CAMBIO_CORREO_PENDIENTE" &&
                  "El correo actual permanece activo hasta que el nuevo correo sea verificado mediante el enlace de seguridad."}
                {feedbackScenario === "FALLO_ENVIAR_ENLACE" &&
                  "No se pudo entregar el correo con el enlace de verificación al nuevo buzón. Se requiere reintentar el envío."}
                {feedbackScenario === "FALLO_INVALIDAR_SESIONES" &&
                  "Los datos se guardaron pero el subsistema de sesiones no respondió. Se ha generado una referencia de incidencia."}
                {feedbackScenario === "CORREO_CONFIRMADO" &&
                  "El enlace fue utilizado. El correo vigente fue sustituido por el nuevo y las sesiones han sido revocadas."}
                {feedbackScenario === "PERDIDA_CORREO_ANTERIOR" &&
                  "Si el funcionario no puede acceder al buzón institucional actual, no se puede sustituir directamente por formulario ordinario."}
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo si es necesario */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-4 space-y-4 flex-1 min-h-0">
              {/* Alertas según escenario */}
              {feedbackScenario === "FALLO_INVALIDAR_SESIONES" && (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="Incidencia de sincronización">
                  Referencia de incidencia: <strong className="font-mono text-foreground">{incidentRef || "INC-2026-0918"}</strong>. Los cambios de permisos entraron en vigor pero algunas sesiones podrían persistir hasta su expiración de token.
                </Alert>
              )}

              {feedbackScenario === "PERDIDA_CORREO_ANTERIOR" && (
                <Alert variant="warning" icon={<AlertTriangle className="size-4" />} title="Protocolo de seguridad institucional">
                  Para garantizar la integridad y evitar secuestro de identidad institucional, la pérdida de acceso al correo previo debe canalizarse a través del canal oficial de <strong>Recuperación asistida</strong> con acreditación formal de identidad.
                </Alert>
              )}

              {/* Ficha de datos y trazabilidad en el feedback */}
              <div className="w-full p-4 rounded-xl bg-surface border border-border text-xs text-left space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">ID Cuenta:</span>
                    <span className="font-mono font-bold text-primary text-xs">{usuario.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">Cédula:</span>
                    <span className="font-mono font-medium text-foreground text-xs">{usuario.cedula}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px] font-medium">Estado cuenta:</span>
                    <span className="font-semibold text-foreground text-xs">{usuario.estado}</span>
                  </div>
                </div>

                {/* Comparativa de correo */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-muted-foreground shrink-0">Correo vigente en sistema:</span>
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="font-medium text-foreground text-xs break-all">
                        {feedbackScenario === "CORREO_CONFIRMADO" ? correo : usuario.correo}
                      </span>
                      <Badge tone="success" appearance="soft" size="sm" className="shrink-0">Verificado</Badge>
                    </div>
                  </div>

                  {feedbackScenario === "CAMBIO_CORREO_PENDIENTE" && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-2 border-t border-border/40">
                      <span className="text-warning font-medium shrink-0">Nuevo correo en trámite:</span>
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-semibold text-warning text-xs break-all">{correo}</span>
                        <Badge tone="warning" appearance="soft" size="sm" className="shrink-0">Declarado</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rol y Área distribuidos al 50% sin truncamiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[11px] font-medium mb-1">Rol interno:</span>
                    <RolBadge rol={rol} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[11px] font-medium">Área DINARP:</span>
                    <span className="font-medium text-foreground text-xs block leading-snug break-words">
                      {areasActivas.find((a) => a.codigo === areaCodigo)?.nombre || usuario.ambito}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ciclo del enlace si existe */}
              {enlaceVerificacion && (
                <div className="w-full p-4 rounded-xl bg-muted/30 border border-border/80 space-y-2.5 text-xs text-left">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <KeyRound className="size-4 text-primary shrink-0" />
                      <span>Enlace de Verificación de Correo</span>
                    </div>
                    <Badge
                      tone={
                        enlaceVerificacion.estado === "Usado"
                          ? "success"
                          : enlaceVerificacion.estado === "Pendiente"
                          ? "warning"
                          : enlaceVerificacion.estado === "Vencido"
                          ? "danger"
                          : "neutral"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {enlaceVerificacion.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-0.5">
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-medium">ID Enlace:</span>
                      <span className="font-mono font-semibold text-foreground text-xs">{enlaceVerificacion.id}</span>
                    </div>
                    <div className="sm:col-span-1">
                      <span className="text-muted-foreground block text-[11px] font-medium">Destino:</span>
                      <span className="font-mono font-medium text-foreground text-xs break-all">{enlaceVerificacion.correoDestino}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px] font-medium">Vigencia:</span>
                      <span className="font-medium text-foreground text-xs">{enlaceVerificacion.expira}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones del feedback */}
            <DialogFooter className="w-full flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border shrink-0 mt-auto">
              {(feedbackScenario === "EXITO" || feedbackScenario === "CORREO_CONFIRMADO") ? (
                <Button
                  type="button"
                  variant="success"
                  size="default"
                  onClick={handleClose}
                  className="w-full sm:w-auto font-semibold shadow-xs"
                >
                  <CheckCircle2 className="size-4 mr-1.5" />
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="neutral"
                    size="default"
                    onClick={handleClose}
                    className="w-full sm:w-auto font-medium"
                  >
                    Cerrar
                  </Button>

                  {feedbackScenario === "CAMBIO_CORREO_PENDIENTE" && (
                    <Button
                      type="button"
                      variant="warning"
                      size="default"
                      onClick={simulateCorreoConfirmado}
                      className="w-full sm:w-auto font-semibold shadow-xs"
                    >
                      <CheckCircle2 className="size-4 mr-1.5" />
                      Simular verificación de enlace
                    </Button>
                  )}

                  {feedbackScenario === "FALLO_ENVIAR_ENLACE" && (
                    <Button
                      type="button"
                      variant="danger"
                      size="default"
                      onClick={() => {
                        toast.success("Enlace reenviado con éxito al nuevo buzón.");
                        setFeedbackScenario("CAMBIO_CORREO_PENDIENTE");
                      }}
                      className="w-full sm:w-auto font-semibold shadow-xs"
                    >
                      <RotateCcw className="size-4 mr-1.5" />
                      Reintentar envío
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
