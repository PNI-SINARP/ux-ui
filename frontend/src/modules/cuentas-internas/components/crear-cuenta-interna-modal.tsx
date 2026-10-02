"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
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
  Layers,
  Fingerprint,
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

interface CrearCuentaInternaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccountCreated?: (user: UsuarioInterno) => void;
  onVerExpediente?: (user: UsuarioInterno) => void;
}

type FeedbackScenario = "EXITO" | "CORREO_NO_ENTREGADO" | "FALLO_GENERAR_ENLACE";
type LinkState = "Pendiente" | "Usado" | "Vencido" | "Revocado";
type CorreoState = "Declarado" | "Verificado";

interface EnlaceInfo {
  id: string;
  estado: LinkState;
  version: number;
  creado: string;
  expira: string;
}

export function CrearCuentaInternaModal({
  open,
  onOpenChange,
  onAccountCreated,
  onVerExpediente,
}: CrearCuentaInternaModalProps) {
  const { crearUsuarioInterno, usuarios } = useUsuariosStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Estados del formulario (HU ID-01: 4 campos obligatorios)
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState<RolInterno>("EQ_GESTION");
  const [rolSearch, setRolSearch] = useState("Revisor del Área de Gestión");
  const [areaCodigo, setAreaCodigo] = useState("DGR");
  const [areaSearch, setAreaSearch] = useState("Dirección de Gestión y Registro");

  // Validación y errores inline
  const [errors, setErrors] = useState<{
    cedula?: string;
    correo?: string;
    rol?: string;
    areaCodigo?: string;
    general?: string;
  }>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados post-creación y ciclo de vida de activación
  const [createdUser, setCreatedUser] = useState<UsuarioInterno | null>(null);
  const [feedbackScenario, setFeedbackScenario] = useState<FeedbackScenario | null>(null);
  const [correoEstado, setCorreoEstado] = useState<CorreoState>("Declarado");
  const [enlaceInfo, setEnlaceInfo] = useState<EnlaceInfo | null>(null);
  const [enlaceHistorico, setEnlaceHistorico] = useState<EnlaceInfo[]>([]);
  const [enlaceContador, setEnlaceContador] = useState(8921);
  const [activationCompleted, setActivationCompleted] = useState(false);

  // Áreas DINARP según el rol seleccionado - Regla: Solo un área Activa puede aparecer en los Combobox de ID-01 e ID-02
  const rolConfig = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol);
  const areasDisponibles = useMemo(() => {
    if (!rolConfig) return [];
    return rolConfig.ambitosPermitidos.filter((a) => a.activa !== false);
  }, [rolConfig]);

  // Filtrado de comboboxes reactivo al input del usuario
  const filteredRoles = useMemo(() => {
    if (!rolSearch.trim()) return ROLES_INTERNOS_CATALOGO;
    const currentSelected = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rol);
    if (currentSelected && currentSelected.nombre.toLowerCase() === rolSearch.trim().toLowerCase()) {
      return ROLES_INTERNOS_CATALOGO;
    }
    const q = rolSearch.toLowerCase();
    return ROLES_INTERNOS_CATALOGO.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [rolSearch, rol]);

  const filteredAreas = useMemo(() => {
    if (!areaSearch.trim()) return areasDisponibles;
    const currentSelected = areasDisponibles.find((a) => a.codigo === areaCodigo);
    if (currentSelected && currentSelected.nombre.toLowerCase() === areaSearch.trim().toLowerCase()) {
      return areasDisponibles;
    }
    const q = areaSearch.toLowerCase();
    return areasDisponibles.filter(
      (a) => a.nombre.toLowerCase().includes(q) || a.codigo.toLowerCase().includes(q)
    );
  }, [areaSearch, areasDisponibles, areaCodigo]);

  const handleRolChange = (nuevoRol: RolInterno) => {
    setRol(nuevoRol);
    const cfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === nuevoRol);
    if (cfg) {
      setRolSearch(cfg.nombre);
    }

    if (cfg && cfg.ambitosPermitidos.length > 0) {
      const primeraActiva = cfg.ambitosPermitidos.find((a) => a.activa !== false);
      const codigoAsignar = primeraActiva ? primeraActiva.codigo : cfg.ambitosPermitidos[0].codigo;
      const nombreAsignar = primeraActiva ? primeraActiva.nombre : cfg.ambitosPermitidos[0].nombre;
      setAreaCodigo(codigoAsignar);
      setAreaSearch(nombreAsignar);
      if (touched.areaCodigo) {
        setErrors((prev) => ({
          ...prev,
          areaCodigo: validateArea(codigoAsignar, nuevoRol) || undefined,
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

  // Validaciones inline conforme a HU ID-01
  const validateCedula = (val: string) => {
    const clean = val.trim();
    if (!clean) return "La cédula de identidad es obligatoria.";
    if (!/^\d{10}$/.test(clean)) return "La cédula debe contener exactamente 10 dígitos numéricos.";
    if (usuarios.some((u) => u.cedula === clean)) {
      return "Cédula ya registrada; consulta la cuenta existente";
    }
    return null;
  };

  const validateCorreo = (val: string) => {
    const clean = val.trim().toLowerCase();
    if (!clean) return "El correo institucional es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      return "Formato de correo electrónico inválido.";
    }
    if (!clean.endsWith("@dinarp.gob.ec") && !clean.endsWith("@glocation.com.co")) {
      return "El correo debe pertenecer al dominio institucional (@dinarp.gob.ec).";
    }
    if (usuarios.some((u) => u.correo.toLowerCase() === clean)) {
      return "El correo electrónico ya se encuentra registrado por otro usuario.";
    }
    return null;
  };

  const validateRol = (val: string) => {
    if (!val) return "Rol no permitido; selecciona uno activo";
    const rolValido = ROLES_INTERNOS_CATALOGO.find((r) => r.id === val);
    if (!rolValido) {
      return "Rol no permitido; selecciona uno activo";
    }
    return null;
  };

  const validateArea = (codigo: string, rolActual: RolInterno) => {
    if (!codigo) return "Área inexistente o inactiva; selecciona un área activa";
    const cfg = ROLES_INTERNOS_CATALOGO.find((r) => r.id === rolActual);
    if (!cfg) return "Rol no permitido; selecciona uno activo";
    const area = cfg.ambitosPermitidos.find((a) => a.codigo === codigo);
    if (!area) {
      return "Área inexistente o inactiva; selecciona un área activa";
    }
    if (area.activa === false) {
      return "Área inexistente o inactiva; selecciona un área activa";
    }
    return null;
  };

  const handleFieldBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "cedula") {
      setErrors((prev) => ({ ...prev, cedula: validateCedula(cedula) || undefined }));
    } else if (field === "correo") {
      setErrors((prev) => ({ ...prev, correo: validateCorreo(correo) || undefined }));
    } else if (field === "rol") {
      setErrors((prev) => ({ ...prev, rol: validateRol(rol) || undefined }));
    } else if (field === "areaCodigo") {
      setErrors((prev) => ({ ...prev, areaCodigo: validateArea(areaCodigo, rol) || undefined }));
    }
  };

  const resetForm = () => {
    setCedula("");
    setCorreo("");
    setRol("EQ_GESTION");
    setRolSearch("Revisor del Área de Gestión");
    setAreaCodigo("DGR");
    setAreaSearch("Dirección de Gestión y Registro");
    setErrors({});
    setTouched({});
    setCreatedUser(null);
    setFeedbackScenario(null);
    setCorreoEstado("Declarado");
    setEnlaceInfo(null);
    setEnlaceHistorico([]);
    setActivationCompleted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errCedula = validateCedula(cedula);
    const errCorreo = validateCorreo(correo);
    const errRol = validateRol(rol);
    const errArea = validateArea(areaCodigo, rol);

    setTouched({
      cedula: true,
      correo: true,
      rol: true,
      areaCodigo: true,
    });

    setErrors({
      cedula: errCedula || undefined,
      correo: errCorreo || undefined,
      rol: errRol || undefined,
      areaCodigo: errArea || undefined,
      general: undefined,
    });

    if (errCedula || errCorreo || errRol || errArea) {
      return;
    }

    setIsSubmitting(true);

    const res = crearUsuarioInterno({
      cedula: cedula.trim(),
      correo: correo.trim(),
      rol,
      ambitoCodigo: areaCodigo,
      actor: currentUser.name,
    });

    setIsSubmitting(false);

    if (!res.ok) {
      const errorMsg = res.error || "Error al registrar la cuenta interna.";
      setErrors((prev) => ({ ...prev, general: errorMsg }));
      toast.error("No se pudo crear la cuenta", {
        description: errorMsg,
      });
      return;
    }

    if (res.usuario) {
      toast.success("Cuenta interna registrada con éxito", {
        description: `Se emitió el enlace de activación para ${res.usuario.nombreCompleto}.`,
      });
      if (onAccountCreated) {
        onAccountCreated(res.usuario);
      }
      handleClose();
    }
  };

  // ── MÉTODOS DEL SIMULADOR HU ID-01 ──

  const simulateAltaExitosa = () => {
    const mockUser: UsuarioInterno = {
      id: "USR-INT-024",
      cedula: "1723456789",
      nombreCompleto: "Funcionario DINARP (1723456789)",
      correo: "carlos.mendoza@dinarp.gob.ec",
      correoVerificado: false,
      rol: "EQ_GESTION",
      rolLabel: "Revisor del Área de Gestión",
      ambito: "Dirección de Gestión y Registro (DGR)",
      ambitoCodigo: "DGR",
      estado: "PENDIENTE_ACTIVACION",
      totpConfigurado: false,
      credencialesConfiguradas: false,
      fechaCreacion: "01/10/2026 14:30",
      tareasActivas: 0,
      responsabilidades: [],
      institucionesRelacionadas: [],
    };

    setCedula("1723456789");
    setCorreo("carlos.mendoza@dinarp.gob.ec");
    setRol("EQ_GESTION");
    setRolSearch("Revisor del Área de Gestión");
    setAreaCodigo("DGR");
    setAreaSearch("Dirección de Gestión y Registro");
    setErrors({});
    setTouched({});
    setCreatedUser(mockUser);
    setFeedbackScenario("EXITO");
    setCorreoEstado("Declarado");
    setActivationCompleted(false);
    setEnlaceInfo({
      id: `LNK-${enlaceContador}`,
      estado: "Pendiente",
      version: 1,
      creado: "01/10/2026 14:30",
      expira: "02/10/2026 14:30 (24h)",
    });
    setEnlaceHistorico([]);
    toast.success("Simulación ID-01: Alta exitosa", {
      description: "Cuenta creada; activación pendiente por correo (id_cuenta: USR-INT-024)",
    });
  };

  const simulateCedulaDuplicada = () => {
    setCreatedUser(null);
    setFeedbackScenario(null);
    setCedula("1799999999");
    setTouched((prev) => ({ ...prev, cedula: true }));
    setErrors((prev) => ({
      ...prev,
      cedula: "Cédula ya registrada; consulta la cuenta existente",
    }));
    toast.error("Simulación ID-01: Cédula duplicada", {
      description: "Error inline: Cédula ya registrada; consulta la cuenta existente",
    });
  };

  const simulateRolNoPermitido = () => {
    setCreatedUser(null);
    setFeedbackScenario(null);
    setRol("" as any);
    setRolSearch("");
    setTouched((prev) => ({ ...prev, rol: true }));
    setErrors((prev) => ({
      ...prev,
      rol: "Rol no permitido; selecciona uno activo",
    }));
    toast.error("Simulación ID-01: Rol no permitido", {
      description: "Error inline: Rol no permitido; selecciona uno activo",
    });
  };

  const simulateAreaInactiva = () => {
    setCreatedUser(null);
    setFeedbackScenario(null);
    setRol("ADMIN");
    setRolSearch("Administrador del Sistema");
    setAreaCodigo("DINARP_HIST_DIS");
    setAreaSearch("Área Histórica Disuelta (Inactiva)");
    setTouched((prev) => ({ ...prev, areaCodigo: true }));
    setErrors((prev) => ({
      ...prev,
      areaCodigo: "Área inexistente o inactiva; selecciona un área activa",
    }));
    toast.error("Simulación ID-01: Área inactiva", {
      description: "Error inline: Área inexistente o inactiva; selecciona un área activa",
    });
  };

  const simulateCorreoNoEntregado = () => {
    const mockUser: UsuarioInterno = {
      id: "USR-INT-025",
      cedula: "1724567890",
      nombreCompleto: "Funcionario DINARP (1724567890)",
      correo: "patricia.vallejo@dinarp.gob.ec",
      correoVerificado: false,
      rol: "DIR_NORMATIVA",
      rolLabel: "Director de Normatividad",
      ambito: "Dirección de Normatividad Jurídica",
      ambitoCodigo: "DN",
      estado: "PENDIENTE_ACTIVACION",
      totpConfigurado: false,
      credencialesConfiguradas: false,
      fechaCreacion: "01/10/2026 14:32",
      tareasActivas: 0,
      responsabilidades: [],
      institucionesRelacionadas: [],
    };

    setCreatedUser(mockUser);
    setFeedbackScenario("CORREO_NO_ENTREGADO");
    setCorreoEstado("Declarado");
    setActivationCompleted(false);
    setEnlaceInfo({
      id: `LNK-${enlaceContador}`,
      estado: "Pendiente",
      version: 1,
      creado: "01/10/2026 14:32",
      expira: "02/10/2026 14:32 (24h)",
    });
    toast.warning("Simulación ID-01: Correo no entregado", {
      description: "Cuenta pendiente; no se entregó el enlace (Acción: Reenviar)",
    });
  };

  const simulateFalloGenerarEnlace = () => {
    const mockUser: UsuarioInterno = {
      id: "USR-INT-026",
      cedula: "1725678901",
      nombreCompleto: "Funcionario DINARP (1725678901)",
      correo: "rodrigo.albuja@dinarp.gob.ec",
      correoVerificado: false,
      rol: "DTD",
      rolLabel: "Dirección de Tecnologías y Desarrollo",
      ambito: "Dirección de Tecnología y Desarrollo (DTD)",
      ambitoCodigo: "DTD",
      estado: "PENDIENTE_ACTIVACION",
      totpConfigurado: false,
      credencialesConfiguradas: false,
      fechaCreacion: "01/10/2026 14:35",
      tareasActivas: 0,
      responsabilidades: [],
      institucionesRelacionadas: [],
    };

    setCreatedUser(mockUser);
    setFeedbackScenario("FALLO_GENERAR_ENLACE");
    setCorreoEstado("Declarado");
    setEnlaceInfo(null);
    setActivationCompleted(false);
    toast.error("Simulación ID-01: Fallo al generar enlace", {
      description: "Cuenta creada; no se pudo generar el enlace de activación (Acción: Reintentar emisión)",
    });
  };

  // Reenviar el mismo enlace vigente
  const handleReenviarEnlace = () => {
    if (!enlaceInfo) return;
    setFeedbackScenario("EXITO");
    toast.success("Enlace vigente reenviado", {
      description: `Mismo enlace [${enlaceInfo.id}] reenviado al buzón institucional. Estado: ${enlaceInfo.estado}.`,
    });
  };

  // Generar nuevo enlace (marcar anterior como Revocado)
  const handleGenerarNuevoEnlace = () => {
    const nextId = enlaceContador + 1;
    setEnlaceContador(nextId);

    if (enlaceInfo) {
      setEnlaceHistorico((prev) => [
        ...prev,
        { ...enlaceInfo, estado: "Revocado" },
      ]);
    }

    const nuevo: EnlaceInfo = {
      id: `LNK-${nextId}`,
      estado: "Pendiente",
      version: (enlaceInfo?.version || 0) + 1,
      creado: "Ahora mismo",
      expira: "En 24 horas",
    };

    setEnlaceInfo(nuevo);
    setFeedbackScenario("EXITO");
    toast.success("Nuevo enlace emitido", {
      description: `Enlace anterior revocado. Nuevo enlace [LNK-${nextId}] generado en estado Pendiente.`,
    });
  };

  // Marcar enlace como Vencido
  const handleMarcarEnlaceVencido = () => {
    if (!enlaceInfo) return;
    setEnlaceInfo({ ...enlaceInfo, estado: "Vencido" });
    toast.warning("Enlace marcado como Vencido", {
      description: `El enlace [${enlaceInfo.id}] caducó. Se requiere generar un nuevo enlace.`,
    });
  };

  // Simular que el usuario abre el enlace, establece contraseña y vincula TOTP
  const handleSimularUsoEnlace = () => {
    if (!enlaceInfo || enlaceInfo.estado === "Revocado" || enlaceInfo.estado === "Vencido") {
      toast.error("No se puede usar el enlace", {
        description: "El enlace actual no se encuentra vigente ni en estado Pendiente.",
      });
      return;
    }

    setEnlaceInfo({ ...enlaceInfo, estado: "Usado" });
    setCorreoEstado("Verificado");
    setActivationCompleted(true);
    if (createdUser) {
      setCreatedUser({
        ...createdUser,
        estado: "ACTIVO",
        correoVerificado: true,
        credencialesConfiguradas: true,
        totpConfigurado: true,
      });
    }

    toast.success("Activación completada con éxito", {
      description: "Enlace: Usado · Correo: Verificado · Contraseña configurada · Google Authenticator vinculado.",
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      {/* ── MODAL 1: FORMULARIO DE CREACIÓN (HU ID-01) ── */}
      <Dialog
        open={open && !createdUser && !feedbackScenario}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleClose();
        }}
      >
        <DialogContent
          variant="standard"
          size="lg"
          className="p-6 sm:p-7 max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          showCloseButton={true}
        >
          <form onSubmit={handleSubmit} className="flex flex-col w-full">
            {/* Cabecera fija */}
            <DialogHeader className="gap-1.5 text-left items-start shrink-0 pb-3 border-b border-border/50">
              <DialogTitle className="text-xl sm:text-2xl font-heading font-extrabold text-foreground flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <UserPlus className="size-5" />
                </div>
                <span>Crear cuenta de usuario interno</span>
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                Registra la identidad institucional del funcionario. La cuenta se creará en estado Pendiente de activación.
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo cuando exceda la pantalla (pantallas grandes no scrollean) */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-4 space-y-4 flex-1 min-h-0">
              {/* Error general / backend */}
              {errors.general && (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="Error de validación (ID-01)">
                  {errors.general}
                </Alert>
              )}

              {/* Campos del Formulario (4 obligatorios con UI Kit InputGroup y Combobox oficiales) */}
              <div className="space-y-4">
                {/* Fila 1: Cédula y Correo institucional */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo 1: Cédula de Identidad */}
                  <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="modal-cedula" className="text-xs font-semibold text-foreground">
                      Cédula de identidad
                      <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre cédula"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Número de 10 dígitos. Inmutable tras la creación de la cuenta.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <InputGroup
                    state={
                      errors.cedula && touched.cedula
                        ? "error"
                        : cedula.length === 10 && !errors.cedula
                        ? "success"
                        : "default"
                    }
                    size="sm"
                    className="w-full"
                    leftIcon={<Fingerprint className="size-4" />}
                    rightIcon={
                      errors.cedula && touched.cedula ? (
                        <AlertCircle className="size-4 text-danger" />
                      ) : cedula.length === 10 && !errors.cedula ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : undefined
                    }
                  >
                    <InputGroupInput
                      id="modal-cedula"
                      placeholder="10 dígitos numéricos"
                      maxLength={10}
                      value={cedula}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setCedula(val);
                        if (touched.cedula) {
                          setErrors((prev) => ({
                            ...prev,
                            cedula: validateCedula(val) || undefined,
                          }));
                        }
                      }}
                      onBlur={() => handleFieldBlur("cedula")}
                      aria-invalid={Boolean(errors.cedula && touched.cedula)}
                    />
                  </InputGroup>
                  {errors.cedula && touched.cedula && (
                    <div className="flex items-center gap-1.5 text-danger text-xs font-medium animate-in slide-in-from-top-1 mt-1 pl-3">
                      <AlertCircle className="size-3.5 shrink-0" />
                      <p>{errors.cedula}</p>
                    </div>
                  )}
                </div>

                {/* Campo 2: Correo institucional */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="modal-correo" className="text-xs font-semibold text-foreground">
                      Correo institucional
                      <span className="text-danger ml-1 font-bold" aria-hidden="true">*</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Información sobre correo institucional"
                          className="inline-flex items-center justify-center text-muted-foreground/70 hover:text-foreground transition-colors rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent variant="surface" side="top" className="max-w-xs text-xs">
                        Buzón institucional donde se remitirá el enlace para activar y configurar Google Authenticator.
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
                      id="modal-correo"
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

              {/* Fila 2: Rol interno y Área DINARP con UI Kit Combobox (ComboboxInput oficial) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <ComboboxLabel>Roles institucionales DINARP</ComboboxLabel>
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
                        const matchedArea = areasDisponibles.find((a) => a.codigo === val);
                        if (matchedArea) setAreaSearch(matchedArea.nombre);
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
                          <ComboboxLabel>Áreas orgánicas DINARP (Activas)</ComboboxLabel>
                          {filteredAreas.map((a) => (
                            <ComboboxItem
                              key={a.codigo}
                              value={a.codigo}
                              className="text-xs py-1.5 flex items-center justify-between"
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">{a.nombre}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">Código: {a.codigo}</span>
                              </div>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredAreas.length === 0 && (
                          <ComboboxEmpty>No se encontraron áreas disponibles.</ComboboxEmpty>
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

              {/* Bloque breve de Activación y segundo factor */}
              <Alert
                variant="default"
                icon={<ShieldCheck className="size-4" />}
                title="Activación y segundo factor obligatorio"
                className="mt-2"
              >
                La cuenta queda en estado <strong className="text-foreground font-semibold">Pendiente de activación</strong> hasta verificar el correo, establecer contraseña y vincular Google Authenticator.
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
                disabled={isSubmitting}
                className="w-full sm:w-auto font-semibold shadow-xs"
              >
                Crear cuenta interna
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: RESULTADOS Y GESTIÓN DE ENLACE (HU ID-01) ── */}
      {createdUser && feedbackScenario && (
        <Dialog
          open={Boolean(createdUser)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) handleClose();
          }}
        >
          <DialogContent
            variant={feedbackScenario === "FALLO_GENERAR_ENLACE" ? "danger" : "standard"}
            size="lg"
            className="sm:max-w-xl max-h-[90vh] flex flex-col overflow-hidden p-6 sm:p-7"
            showCloseButton={true}
          >
            {/* Cabecera fija */}
            <DialogHeader className="text-center items-center gap-1.5 shrink-0 pb-3 border-b border-border/50">
              <div className="inline-flex items-center gap-2 mb-1">
                <Badge
                  tone={
                    activationCompleted
                      ? "success"
                      : feedbackScenario === "FALLO_GENERAR_ENLACE"
                      ? "danger"
                      : "warning"
                  }
                  appearance="soft"
                  size="md"
                >
                  {activationCompleted
                    ? "Cuenta activa"
                    : feedbackScenario === "FALLO_GENERAR_ENLACE"
                    ? "Fallo de emisión"
                    : "Pendiente de activación"}
                </Badge>
              </div>

              <DialogTitle className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                {feedbackScenario === "EXITO" && (
                  activationCompleted
                    ? "Cuenta activada con segundo factor"
                    : "Cuenta creada; activación pendiente por correo"
                )}
                {feedbackScenario === "CORREO_NO_ENTREGADO" && "Cuenta pendiente; no se entregó el enlace"}
                {feedbackScenario === "FALLO_GENERAR_ENLACE" && "Cuenta creada; no se pudo generar el enlace de activación"}
              </DialogTitle>

              <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-0.5 leading-relaxed text-center max-w-md">
                {feedbackScenario === "EXITO" &&
                  (activationCompleted
                    ? "Se han completado los pasos de seguridad: credenciales fijadas y Google Authenticator asociado."
                    : "La cuenta interna fue registrada en el sistema y se emitió el enlace seguro al correo institucional.")}
                {feedbackScenario === "CORREO_NO_ENTREGADO" &&
                  "La cuenta permanece en Pendiente de activación. El servidor de correo no pudo entregar el mensaje al funcionario."}
                {feedbackScenario === "FALLO_GENERAR_ENLACE" &&
                  "La cuenta se guardó en el sistema, pero ocurrió un problema al persistir el token de activación."}
              </DialogDescription>
            </DialogHeader>

            {/* Cuerpo con scroll solo cuando exceda la pantalla */}
            <div className="modal-scroll-area overflow-y-auto pr-3 sm:pr-3.5 py-4 space-y-4 flex-1 min-h-0">
              {/* Alertas contextuales de error si aplica */}
              {feedbackScenario === "CORREO_NO_ENTREGADO" && (
                <Alert variant="warning" icon={<AlertTriangle className="size-4" />} title="Entrega de correo pendiente">
                  Fallo temporal de entrega SMTP institucional. El enlace de activación existe y está vigente. Usa la acción Reenviar.
                </Alert>
              )}

              {feedbackScenario === "FALLO_GENERAR_ENLACE" && (
                <Alert variant="danger" icon={<AlertCircle className="size-4" />} title="Enlace no disponible">
                  No se pudo generar el token criptográfico de activación. Usa la acción Reintentar emisión para generar un enlace válido.
                </Alert>
              )}

            {/* Ficha de Datos Principales (id_cuenta, estado, correo, cédula, rol, área) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface border border-border text-xs text-left">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">ID Cuenta:</span>
                <span className="font-mono font-bold text-primary">{createdUser.id}</span>
                <span className="font-mono text-muted-foreground block text-[11px] mt-0.5">C.I. {createdUser.cedula}</span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">Estado cuenta:</span>
                <span className="font-semibold text-foreground">
                  {activationCompleted ? "ACTIVO" : "PENDIENTE_ACTIVACION"}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">Correo institucional:</span>
                <span className="font-medium text-foreground break-all block">{createdUser.correo}</span>
                <div className="mt-1">
                  <Badge
                    tone={correoEstado === "Verificado" ? "success" : "neutral"}
                    appearance="soft"
                    size="sm"
                  >
                    {correoEstado}
                  </Badge>
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium mb-1">Rol interno:</span>
                <RolBadge rol={createdUser.rol} label={createdUser.rolLabel} size="sm" className="max-w-full" />
              </div>
              <div className="sm:col-span-2 min-w-0 pt-2 border-t border-border/40">
                <span className="text-muted-foreground block text-[11px] font-medium">Área DINARP:</span>
                <span className="font-medium text-foreground break-words block">{createdUser.ambito}</span>
              </div>
            </div>

            {/* Ciclo de vida del Enlace de Activación (ID-01) */}
            {enlaceInfo && (
              <div className="w-full p-3.5 rounded-xl bg-muted/30 border border-border/80 space-y-2.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <KeyRound className="size-3.5 text-primary" />
                    <span>Control de Enlace de Activación</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Estado del enlace:</span>
                    <Badge
                      tone={
                        enlaceInfo.estado === "Usado"
                          ? "success"
                          : enlaceInfo.estado === "Pendiente"
                          ? "warning"
                          : enlaceInfo.estado === "Vencido"
                          ? "danger"
                          : "neutral"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {enlaceInfo.estado}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">ID Enlace:</span>
                    <span className="font-mono font-semibold text-foreground">{enlaceInfo.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Emisión:</span>
                    <span className="font-medium text-foreground">{enlaceInfo.creado}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Vigencia:</span>
                    <span className="font-medium text-foreground">{enlaceInfo.expira}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Token criptográfico:</span>
                    <span className="font-mono text-muted-foreground">•••••••• (Oculto)</span>
                  </div>
                </div>

                {/* Histórico si hubo revocaciones */}
                {enlaceHistorico.length > 0 && (
                  <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center gap-2">
                    <span>Enlaces revocados previamente:</span>
                    {enlaceHistorico.map((h) => (
                      <Badge key={h.id} tone="neutral" appearance="soft" size="sm">
                        {h.id} (Revocado)
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Visualización del flujo de activación post-contraseña y TOTP */}
            <div className="p-3 rounded-xl bg-surface border border-border/70 space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Flujo de activación de credenciales y segundo factor
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className={cn(
                  "p-2.5 rounded-lg border flex items-center gap-2",
                  activationCompleted
                    ? "bg-success/5 border-success/30 text-success"
                    : "bg-muted/40 border-border/60 text-muted-foreground"
                )}>
                  <CheckCircle2 className="size-4 shrink-0" />
                  <div>
                    <span className="font-semibold block">1. Contraseña institucional</span>
                    <span className="text-[10px]">
                      {activationCompleted ? "Establecida y validada" : "Pendiente de fijar por el usuario"}
                    </span>
                  </div>
                </div>

                <div className={cn(
                  "p-2.5 rounded-lg border flex items-center gap-2",
                  activationCompleted
                    ? "bg-success/5 border-success/30 text-success"
                    : "bg-muted/40 border-border/60 text-muted-foreground"
                )}>
                  <CheckCircle2 className="size-4 shrink-0" />
                  <div>
                    <span className="font-semibold block">2. Google Authenticator (TOTP)</span>
                    <span className="text-[10px]">
                      {activationCompleted ? "Token vinculado y activo" : "Se exige tras fijar contraseña"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarjetas de Alcance y Seguridad (Representación ID-01) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1">
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="font-semibold text-foreground block mb-0.5 flex items-center gap-1">
                  <ShieldAlert className="size-3 text-primary" />
                  Sin rol Coordinador SINARP
                </span>
                La cuenta interna no faculta para coordinación externa ni administración SINARP.
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="font-semibold text-foreground block mb-0.5 flex items-center gap-1">
                  <Layers className="size-3 text-primary" />
                  Sin acceso técnico consumidora
                </span>
                No concede accesos a endpoints de consumo, credenciales API ni certificados mTLS.
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="font-semibold text-foreground block mb-0.5 flex items-center gap-1">
                  <Lock className="size-3 text-primary" />
                  Credenciales nunca en claro
                </span>
                Contraseñas, tokens de activación y secretos TOTP nunca se transmiten ni almacenan en claro.
              </div>
              <div className="p-2 rounded-lg bg-muted/30 border border-border/50">
                <span className="font-semibold text-foreground block mb-0.5 flex items-center gap-1">
                  <KeyRound className="size-3 text-primary" />
                  Enlace de un solo uso
                </span>
                El enlace expira en 24 horas y se invalida automáticamente tras el primer uso.
              </div>
            </div>
          </div>

            {/* Footer con Acciones según estado */}
            <DialogFooter className="w-full flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-border shrink-0 mt-auto" showCloseButton={false}>
              <Button
                variant="neutral"
                size="default"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Volver a cuentas internas
              </Button>

              {/* Botón Reenviar si correo no fue entregado */}
              {feedbackScenario === "CORREO_NO_ENTREGADO" && (
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleReenviarEnlace}
                  className="w-full sm:w-auto font-semibold"
                >
                  <RotateCcw className="size-3.5" /> Reenviar enlace
                </Button>
              )}

              {/* Botón Reintentar emisión si falló la persistencia */}
              {feedbackScenario === "FALLO_GENERAR_ENLACE" && (
                <Button
                  variant="primary"
                  size="default"
                  onClick={handleGenerarNuevoEnlace}
                  className="w-full sm:w-auto font-semibold"
                >
                  <RefreshCw className="size-3.5" /> Reintentar emisión
                </Button>
              )}

              {/* Botón ver expediente */}
              {feedbackScenario === "EXITO" && (
                onVerExpediente ? (
                  <Button
                    variant="primary"
                    size="default"
                    onClick={() => {
                      const u = createdUser;
                      handleClose();
                      onVerExpediente(u);
                    }}
                    className="w-full sm:w-auto font-semibold cursor-pointer"
                  >
                    Ver expediente de la cuenta
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="default"
                    asChild
                    className="w-full sm:w-auto font-semibold cursor-pointer"
                  >
                    <Link href={`/cuentas-internas?expediente=${createdUser.id}`}>
                      Ver expediente de la cuenta
                    </Link>
                  </Button>
                )
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
}
