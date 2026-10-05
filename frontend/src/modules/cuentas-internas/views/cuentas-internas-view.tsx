"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserX,
  Search as SearchIcon,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Mail,
  Fingerprint,
  Building,
  KeyRound,
  FileText,
  RotateCcw,
  Ban,
  Check,
  X,
  Eye,
  Edit2,
  ArrowUpDown,
  History,
  Shield,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Scale,
  FileSearch,
  FileCheck,
  Code2,
  Receipt,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useUsuariosStore,
  UsuarioInterno,
  EstadoUsuario,
  RolInterno,
  TipoEventoAuditoria,
  ROLES_INTERNOS_CATALOGO,
} from "@/modules/usuarios/data/usuarios-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { CrearCuentaInternaModal } from "@/modules/cuentas-internas/components/crear-cuenta-interna-modal";
import { EditarCuentaInternaModal } from "@/modules/cuentas-internas/components/editar-cuenta-interna-modal";
import { ExpedienteCuentaModal } from "@/modules/cuentas-internas/components/expediente-cuenta-modal";
import { RolBadge } from "@/modules/cuentas-internas/components/rol-badge";
import {
  AccionCuentaDialog,
  TipoAccionCuenta,
} from "@/modules/cuentas-internas/components/accion-cuenta-dialog";

export function CuentasInternasView() {
  const {
    usuarios,
    auditoria,
    isLoaded,
    activarUsuario,
    simularActivacionDemo,
    simularEnrolamiento2FA,
    suspenderUsuario,
    reactivarUsuario,
    darDeBajaUsuario,
  } = useUsuariosStore();

  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Estados de filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRol, setFilterRol] = useState<string>("TODOS");
  const [rolSearch, setRolSearch] = useState("");
  const [filterAmbito, setFilterAmbito] = useState<string>("TODOS");
  const [ambitoSearch, setAmbitoSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");

  const getRolLabel = (id: string) => {
    if (id === "TODOS") return "Todos los roles";
    return ROLES_INTERNOS_CATALOGO.find((r) => r.id === id)?.nombre || id;
  };

  const getEstadoLabel = (st: string) => {
    switch (st) {
      case "ACTIVO":
        return "Activo";
      case "PENDIENTE_ACTIVACION":
        return "Pendiente de activación";
      case "SUSPENDIDO":
        return "Suspendido";
      case "RETIRADO":
        return "Baja lógica";
      default:
        return "Todos los estados";
    }
  };

  const handleSetFilterRol = (nuevoRol: string) => {
    setFilterRol(nuevoRol);
    setRolSearch(nuevoRol === "TODOS" ? "" : getRolLabel(nuevoRol));
    setCurrentPage(1);
  };

  const handleSetFilterAmbito = (nuevoAmbito: string) => {
    setFilterAmbito(nuevoAmbito);
    setAmbitoSearch(nuevoAmbito === "TODOS" ? "" : nuevoAmbito);
    setCurrentPage(1);
  };

  const handleSetFilterEstado = (nuevoEstado: string) => {
    setFilterEstado(nuevoEstado);
    setEstadoSearch(nuevoEstado === "TODOS" ? "" : getEstadoLabel(nuevoEstado));
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterRol("TODOS");
    setRolSearch("");
    setFilterAmbito("TODOS");
    setAmbitoSearch("");
    setFilterEstado("TODOS");
    setEstadoSearch("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== "" ||
    filterRol !== "TODOS" ||
    filterAmbito !== "TODOS" ||
    filterEstado !== "TODOS"
  );

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modales de acciones de ciclo de vida (ID-03 e ID-04)
  const [accionCuentaTipo, setAccionCuentaTipo] = useState<TipoAccionCuenta | null>(null);
  const [accionCuentaOpen, setAccionCuentaOpen] = useState(false);
  const [simulateSyncError, setSimulateSyncError] = useState(false);
  const [modalBajaOpen, setModalBajaOpen] = useState(false);
  const [bajaSuccessFeedback, setBajaSuccessFeedback] = useState<UsuarioInterno | null>(null);

  // Usuario seleccionado para acciones
  const [selectedUser, setSelectedUser] = useState<UsuarioInterno | null>(null);

  // Formularios de cambio de estado (ID-03 e ID-04)
  const [motivoAccion, setMotivoAccion] = useState("");
  const [errorAccion, setErrorAccion] = useState("");

  // Modales de creación y edición (sin miga de pan)
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UsuarioInterno | null>(null);

  // Modal de expediente de usuario y seguridad (como en la foto de referencia)
  const [expedienteUser, setExpedienteUser] = useState<UsuarioInterno | null>(null);
  const [expedienteModalOpen, setExpedienteModalOpen] = useState(false);

  // Escucha si viene parámetro ?expediente=USR-INT-XXX en URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const expId = params.get("expediente");
      if (expId) {
        const u = usuarios.find((x) => x.id === expId || x.cedula === expId);
        if (u) {
          setExpedienteUser(u);
          setExpedienteModalOpen(true);
        }
      }
    }
  }, [usuarios]);

  // Cómputo de KPIs
  const kpis = useMemo(() => {
    return {
      activos: usuarios.filter((u) => u.estado === "ACTIVO").length,
      pendientes: usuarios.filter((u) => u.estado === "PENDIENTE_ACTIVACION").length,
      suspendidos: usuarios.filter((u) => u.estado === "SUSPENDIDO").length,
      retirados: usuarios.filter((u) => u.estado === "RETIRADO").length,
    };
  }, [usuarios]);

  // Lista única de ámbitos presentes
  const ambitosDisponibles = useMemo(() => {
    const set = new Set<string>();
    usuarios.forEach((u) => set.add(u.ambito));
    return Array.from(set);
  }, [usuarios]);

  // Opciones filtradas para Comboboxes oficiales
  const filteredRolesForFilter = useMemo(() => {
    const options = [
      { value: "TODOS", label: "Todos los roles" },
      ...ROLES_INTERNOS_CATALOGO.map((r) => ({ value: r.id, label: r.nombre })),
    ];
    if (!rolSearch.trim()) return options;
    const currentLabel = getRolLabel(filterRol);
    if (currentLabel.toLowerCase() === rolSearch.trim().toLowerCase()) {
      return options;
    }
    const q = rolSearch.toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [rolSearch, filterRol]);

  const filteredAmbitosForFilter = useMemo(() => {
    const options = [
      { value: "TODOS", label: "Todas las áreas DINARP" },
      ...ambitosDisponibles.map((a) => ({ value: a, label: a })),
    ];
    if (!ambitoSearch.trim()) return options;
    if (filterAmbito.toLowerCase() === ambitoSearch.trim().toLowerCase()) {
      return options;
    }
    const q = ambitoSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [ambitoSearch, filterAmbito, ambitosDisponibles]);

  const ESTADOS_OPCIONES = useMemo(
    () => [
      { value: "TODOS", label: "Todos los estados" },
      { value: "ACTIVO", label: "Activo" },
      { value: "PENDIENTE_ACTIVACION", label: "Pendiente de activación" },
      { value: "SUSPENDIDO", label: "Suspendido" },
      { value: "RETIRADO", label: "Baja lógica" },
    ],
    []
  );

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_OPCIONES;
    const currentLabel = getEstadoLabel(filterEstado);
    if (currentLabel.toLowerCase() === estadoSearch.trim().toLowerCase()) {
      return ESTADOS_OPCIONES;
    }
    const q = estadoSearch.toLowerCase();
    return ESTADOS_OPCIONES.filter((o) => o.label.toLowerCase().includes(q));
  }, [estadoSearch, filterEstado, ESTADOS_OPCIONES]);

  // Filtrado de usuarios
  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.cedula.toLowerCase().includes(q) ||
        u.nombreCompleto.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.rolLabel.toLowerCase().includes(q);

      const matchRol = filterRol === "TODOS" || u.rol === filterRol;
      const matchAmbito = filterAmbito === "TODOS" || u.ambito === filterAmbito;
      const matchEstado = filterEstado === "TODOS" || u.estado === filterEstado;

      return matchSearch && matchRol && matchAmbito && matchEstado;
    });
  }, [usuarios, searchQuery, filterRol, filterAmbito, filterEstado]);

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / pageSize) || 1;
  const paginatedUsuarios = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsuarios.slice(start, start + pageSize);
  }, [filteredUsuarios, currentPage, pageSize]);

  // Manejadores de modales de acción (ID-03 e ID-04)
  const handleOpenActivar = (u: UsuarioInterno) => {
    setSelectedUser(u);
    setAccionCuentaTipo("ACTIVAR");
    setAccionCuentaOpen(true);
  };

  const handleOpenSuspender = (u: UsuarioInterno) => {
    setSelectedUser(u);
    setAccionCuentaTipo("SUSPENDER");
    setAccionCuentaOpen(true);
  };

  const handleOpenReactivar = (u: UsuarioInterno) => {
    setSelectedUser(u);
    setAccionCuentaTipo("REACTIVAR");
    setAccionCuentaOpen(true);
  };

  const handleOpenBaja = (u: UsuarioInterno) => {
    setSelectedUser(u);
    setMotivoAccion("");
    setErrorAccion("");
    setModalBajaOpen(true);
  };

  // Simulación HU ID-03 (Patrón registro-institucion flotante)
  const handleSimularEnrolamientoCompleto = () => {
    const target =
      selectedUser && selectedUser.estado === "PENDIENTE_ACTIVACION"
        ? selectedUser
        : usuarios.find((u) => u.estado === "PENDIENTE_ACTIVACION") || selectedUser || usuarios[0];

    if (!target) {
      toast.error("No se encontró cuenta para configurar requisitos.");
      return;
    }

    simularEnrolamiento2FA(target.id, true);
    const updated = { ...target, credencialesConfiguradas: true, totpConfigurado: true };
    setSelectedUser(updated);
    toast.success("2FA y credenciales completados", {
      description: `La cuenta de ${target.nombreCompleto} (${target.cedula}) tiene contraseña y TOTP listos. El botón de activación se habilitará.`,
    });
  };

  const handleSimular2FAPendiente = () => {
    const target =
      selectedUser && selectedUser.estado === "PENDIENTE_ACTIVACION"
        ? selectedUser
        : usuarios.find((u) => u.estado === "PENDIENTE_ACTIVACION") || selectedUser || usuarios[0];

    if (!target) {
      toast.error("No se encontró cuenta para marcar requisitos pendientes.");
      return;
    }

    simularEnrolamiento2FA(target.id, false);
    const updated = { ...target, credencialesConfiguradas: false, totpConfigurado: false };
    setSelectedUser(updated);
    toast.warning("Requisitos 2FA pendientes", {
      description: `La cuenta de ${target.nombreCompleto} (${target.cedula}) tiene contraseña o TOTP pendientes. El botón de activación estará deshabilitado.`,
    });
  };

  const handleSimulateTriggerActivar = () => {
    const target =
      usuarios.find((u) => u.estado === "PENDIENTE_ACTIVACION") || selectedUser || usuarios[0];
    if (target) {
      setSelectedUser(target);
      setAccionCuentaTipo("ACTIVAR");
      setAccionCuentaOpen(true);
    }
  };

  const handleSimulateTriggerSuspender = () => {
    const target =
      usuarios.find((u) => u.estado === "ACTIVO") || selectedUser || usuarios[0];
    if (target) {
      setSelectedUser(target);
      setAccionCuentaTipo("SUSPENDER");
      setAccionCuentaOpen(true);
    }
  };

  const handleSimulateTriggerReactivar = () => {
    const target =
      usuarios.find((u) => u.estado === "SUSPENDIDO") || selectedUser || usuarios[0];
    if (target) {
      setSelectedUser(target);
      setAccionCuentaTipo("REACTIVAR");
      setAccionCuentaOpen(true);
    } else {
      toast.info("No hay cuentas suspendidas. Suspende una cuenta primero para probar la reactivación.");
    }
  };

  // Submit Dar de baja (ID-04)
  const handleBajaSubmit = () => {
    if (!selectedUser) return;
    setErrorAccion("");

    if (selectedUser.tareasActivas > 0) {
      setErrorAccion("No es posible dar de baja mientras existan trámites o tareas activas asignadas.");
      return;
    }

    if (motivoAccion.trim().length < 10) {
      setErrorAccion("El motivo de la baja es obligatorio y debe contener al menos 10 caracteres.");
      return;
    }

    const res = darDeBajaUsuario(selectedUser.id, motivoAccion.trim(), currentUser.name);
    if (!res.ok) {
      setErrorAccion(res.error || "No es posible dar de baja.");
      toast.error("Error al dar de baja", { description: res.error });
      return;
    }

    const doneUser = { ...selectedUser, estado: "RETIRADO" as EstadoUsuario };
    setModalBajaOpen(false);
    setMotivoAccion("");
    setErrorAccion("");
    setBajaSuccessFeedback(null);
    toast.success("Baja lógica confirmada exitosamente", {
      description: `La cuenta de ${doneUser.nombreCompleto} pasó a estado RETIRADO conservando toda su trazabilidad.`,
    });
  };

  // Helper de badges de estado (UI Kit: Activo->Success, Pendiente->Warning, Suspendido->Danger, Baja lógica->Neutral)
  const getEstadoBadge = (estado: EstadoUsuario) => {
    switch (estado) {
      case "ACTIVO":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
            Activo
          </Badge>
        );
      case "PENDIENTE_ACTIVACION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
            Pendiente de activación
          </Badge>
        );
      case "SUSPENDIDO":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
            Suspendido
          </Badge>
        );
      case "RETIRADO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
            Baja lógica
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center">
            {estado}
          </Badge>
        );
    }
  };

  // Helper de badges de rol (UI Kit: altura, padding, tipografía y radio consistentes; semántica rica y variantes de relleno/outline)
  const getRolBadge = (rol: RolInterno, rolLabel: string) => {
    return <RolBadge rol={rol} label={rolLabel} />;
  };

  // Icono decorativo de fondo para Tarjeta Interactiva según el rol DINARP
  const getRolDecorativeIcon = (rol: RolInterno) => {
    switch (rol) {
      case "ADMIN":
        return <Shield className="size-full stroke-[0.8]" />;
      case "DIR_GESTION":
        return <Briefcase className="size-full stroke-[0.8]" />;
      case "DIR_NORMATIVA":
        return <Scale className="size-full stroke-[0.8]" />;
      case "EQ_GESTION":
        return <FileSearch className="size-full stroke-[0.8]" />;
      case "EQ_NORMATIVA":
        return <FileCheck className="size-full stroke-[0.8]" />;
      case "APROBADOR":
        return <CheckCircle2 className="size-full stroke-[0.8]" />;
      case "DPI":
        return <Lock className="size-full stroke-[0.8]" />;
      case "DTD":
        return <Code2 className="size-full stroke-[0.8]" />;
      case "FACTURACION":
        return <Receipt className="size-full stroke-[0.8]" />;
      default:
        return <Users className="size-full stroke-[0.8]" />;
    }
  };

  // Color de acento de Tarjeta Interactiva según el estado
  const getEstadoCardColor = (
    estado: EstadoUsuario
  ): "default" | "primary" | "info" | "warning" | "success" | "danger" => {
    switch (estado) {
      case "PENDIENTE_ACTIVACION":
        return "warning";
      case "SUSPENDIDO":
        return "danger";
      case "ACTIVO":
      case "RETIRADO":
      default:
        return "default";
    }
  };

  // Renderizado uniforme de Tarjeta Interactiva (UI Kit) para cada funcionario
  const renderUsuarioCard = (u: UsuarioInterno) => {
    return (
      <InteractiveCard
        key={u.id}
        color={getEstadoCardColor(u.estado)}
        decorativeIcon={getRolDecorativeIcon(u.rol)}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
        className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
      >
        {/* Cabecera: Nombre y Estado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <button
              type="button"
              onClick={() => {
                setExpedienteUser(u);
                setExpedienteModalOpen(true);
              }}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug cursor-pointer block"
            >
              {u.nombreCompleto}
            </button>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span>ID: {u.id}</span>
              <span className="text-muted-foreground/40 font-bold">•</span>
              <span>C.I. {u.cedula}</span>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            {getEstadoBadge(u.estado)}
          </div>
        </div>

        {/* Bloque 1: Correo institucional */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/80 backdrop-blur-xs px-3 py-2 rounded-lg border border-border/50 w-full">
          <Mail className="size-3.5 text-primary shrink-0" />
          <span className="text-foreground font-mono text-[11px] break-all select-all flex-1 min-w-0">
            {u.correo}
          </span>
        </div>

        {/* Bloque 2: Rol institucional y Área DINARP con wrap garantizado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Rol institucional
            </span>
            <div className="flex flex-wrap items-center">
              <RolBadge rol={u.rol} label={u.rolLabel} />
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Área DINARP
            </span>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block break-words leading-tight">
                {u.ambito}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                Código: {u.ambitoCodigo}
              </span>
            </div>
          </div>
        </div>

        {/* Bloque 3: Seguridad y Última actualización */}
        <div className="space-y-2 pt-2 border-t border-border/50 text-xs w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">Seguridad:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                  u.credencialesConfiguradas
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-warning/15 text-warning border-warning/30"
                )}
              >
                <KeyRound className="size-3" />
                <span>{u.credencialesConfiguradas ? "Contraseña OK" : "Contraseña pendiente"}</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                  u.totpConfigurado
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-warning/15 text-warning border-warning/30"
                )}
              >
                <Fingerprint className="size-3" />
                <span>{u.totpConfigurado ? "2FA TOTP OK" : "2FA pendiente"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
            <span className="text-[11px] text-muted-foreground font-medium">Última actualización:</span>
            <span className="text-[11px] font-mono text-muted-foreground">
              {u.ultimaActualizacion || u.fechaCreacion}
            </span>
          </div>
        </div>

        {/* Bloque 4: Acciones organizadas en grilla del UI Kit */}
        <div className="pt-2 border-t border-border/60 w-full">
          {u.estado === "RETIRADO" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExpedienteUser(u);
                setExpedienteModalOpen(true);
              }}
              className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
            >
              <Eye className="size-3.5 text-muted-foreground" />
              <span>Ver detalle</span>
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {/* Fila 1: Acciones primarias de consulta y edición */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExpedienteUser(u);
                  setExpedienteModalOpen(true);
                }}
                className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
              >
                <Eye className="size-3.5 text-muted-foreground" />
                <span>Ver detalle</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(u)}
                className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
              >
                <Edit2 className="size-3.5 text-muted-foreground" />
                <span>Editar</span>
              </Button>

              {/* Fila 2: Acción contextual de ciclo de vida + Baja lógica */}
              {u.estado === "PENDIENTE_ACTIVACION" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenActivar(u)}
                  className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
                >
                  <Check className="size-3.5" />
                  <span>Activar</span>
                </Button>
              )}

              {u.estado === "ACTIVO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenSuspender(u)}
                  className="w-full text-xs font-semibold gap-1.5 text-danger border-danger/40 hover:bg-danger/10 hover:text-danger cursor-pointer h-9 justify-center"
                >
                  <UserMinus className="size-3.5" />
                  <span>Suspender</span>
                </Button>
              )}

              {u.estado === "SUSPENDIDO" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenReactivar(u)}
                  className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Reactivar</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenBaja(u)}
                className="w-full text-xs font-semibold gap-1.5 text-danger border-danger/40 hover:bg-danger/10 hover:text-danger cursor-pointer h-9 justify-center"
              >
                <UserX className="size-3.5" />
                <span>Dar de baja</span>
              </Button>
            </div>
          )}
        </div>
      </InteractiveCard>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="cuentas-internas"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Cuentas internas" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal (Tarjetas, Encabezado y Tabla) */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                Cuentas internas
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Administra las cuentas internas, roles, ámbitos institucionales y trazabilidad de acceso del personal de DINARP.
              </p>
            </div>

            {/* Acción de Cabecera: Creación ID-01 */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCrearModalOpen(true)}
                leftIcon={<UserPlus className="size-4" />}
              >
                Nueva cuenta interna
              </Button>
            </div>
          </div>

          {/* Cards de Resumen Compactas (4 Estados del Ciclo de Vida) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* Activos */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "ACTIVO" ? "TODOS" : "ACTIVO");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "ACTIVO" ? "TODOS" : "ACTIVO");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "ACTIVO"
                  ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                  : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterEstado === "ACTIVO"
                        ? "bg-success text-white shadow-xs"
                        : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                    )}
                  >
                    <UserCheck className="size-5" />
                  </div>
                  <Badge
                    tone="success"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Operativas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Cuentas Activas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.activos}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pendientes de Activación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "PENDIENTE_ACTIVACION" ? "TODOS" : "PENDIENTE_ACTIVACION");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "PENDIENTE_ACTIVACION" ? "TODOS" : "PENDIENTE_ACTIVACION");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "PENDIENTE_ACTIVACION"
                  ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                  : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterEstado === "PENDIENTE_ACTIVACION"
                        ? "bg-warning text-white shadow-xs"
                        : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                    )}
                  >
                    <Clock className="size-5" />
                  </div>
                  <Badge
                    tone="warning"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Enrolamiento
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Pendientes de activación
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.pendientes}
                  </p>
                </div>
              </div>
            </Card>

            {/* Suspendidos */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "SUSPENDIDO" ? "TODOS" : "SUSPENDIDO");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "SUSPENDIDO" ? "TODOS" : "SUSPENDIDO");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "SUSPENDIDO"
                  ? "bg-danger/15 border-danger ring-2 ring-danger/40 shadow-xs"
                  : "bg-danger/5 hover:bg-danger/10 border-danger/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterEstado === "SUSPENDIDO"
                        ? "bg-danger text-white shadow-xs"
                        : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                    )}
                  >
                    <Ban className="size-5" />
                  </div>
                  <Badge
                    tone="danger"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Acceso cerrado
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Cuentas suspendidas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.suspendidos}
                  </p>
                </div>
              </div>
            </Card>

            {/* Baja Lógica */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                handleSetFilterEstado(filterEstado === "RETIRADO" ? "TODOS" : "RETIRADO");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSetFilterEstado(filterEstado === "RETIRADO" ? "TODOS" : "RETIRADO");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterEstado === "RETIRADO"
                  ? "bg-muted border-border ring-2 ring-primary/30 shadow-xs"
                  : "bg-muted/40 hover:bg-muted/60 border-border/70 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterEstado === "RETIRADO"
                        ? "bg-foreground text-background shadow-xs"
                        : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-foreground group-hover:text-background"
                    )}
                  >
                    <UserX className="size-5" />
                  </div>
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Baja lógica
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Baja lógica
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.retirados}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Búsqueda con UI Kit Oficial */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por cédula, nombre, correo o rol..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Filtros Combobox UI Kit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full xl:w-auto shrink-0">
                {/* Filtro Rol */}
                <div className="w-full xl:w-[200px] min-w-0">
                  <Combobox
                    value={filterRol === "TODOS" ? null : filterRol}
                    onValueChange={(val) => {
                      handleSetFilterRol(val || "TODOS");
                    }}
                    inputValue={rolSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ROLES_INTERNOS_CATALOGO.find(
                        (r) => r.id.toLowerCase() === newSearch.toLowerCase() || r.nombre.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setRolSearch(opt.nombre);
                      else if (newSearch === "TODOS") setRolSearch("");
                      else setRolSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todos los roles"
                      showClear={filterRol !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[280px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por rol interno</ComboboxLabel>
                          {filteredRolesForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                              title={opt.label}
                            >
                              <span className="truncate">{opt.label}</span>
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredRolesForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron roles.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro Área DINARP */}
                <div className="w-full xl:w-[220px] min-w-0">
                  <Combobox
                    value={filterAmbito === "TODOS" ? null : filterAmbito}
                    onValueChange={(val) => {
                      handleSetFilterAmbito(val || "TODOS");
                    }}
                    inputValue={ambitoSearch}
                    onInputValueChange={(newSearch) => {
                      setAmbitoSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las áreas DINARP"
                      showClear={filterAmbito !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[280px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por Área DINARP</ComboboxLabel>
                          {filteredAmbitosForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredAmbitosForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron áreas.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro Estado */}
                <div className="w-full xl:w-[190px] min-w-0">
                  <Combobox
                    value={filterEstado === "TODOS" ? null : filterEstado}
                    onValueChange={(val) => {
                      handleSetFilterEstado(val || "TODOS");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ESTADOS_OPCIONES.find((e) => e.value === newSearch);
                      if (opt) setEstadoSearch(opt.label);
                      else if (newSearch === "TODOS") setEstadoSearch("");
                      else setEstadoSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todos los estados"
                      showClear={filterEstado !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[230px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {filteredEstadosForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredEstadosForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>
            </div>

            {/* Badges / Píldoras de Filtros Activos (UI Kit) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                <span className="text-xs font-semibold text-muted-foreground mr-1">
                  Filtros activos:
                </span>

                {searchQuery.trim() !== "" && (
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Búsqueda: &ldquo;{searchQuery}&rdquo;
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterRol !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Rol: {ROLES_INTERNOS_CATALOGO.find((r) => r.id === filterRol)?.nombre || filterRol}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Rol: {ROLES_INTERNOS_CATALOGO.find((r) => r.id === filterRol)?.nombre || filterRol}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetFilterRol("TODOS");
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de rol"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterAmbito !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">Área: {filterAmbito}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Área: {filterAmbito}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetFilterAmbito("TODOS");
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de área"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterEstado !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Estado: {
                            filterEstado === "ACTIVO"
                              ? "Activo"
                              : filterEstado === "PENDIENTE_ACTIVACION"
                              ? "Pendiente de activación"
                              : filterEstado === "SUSPENDIDO"
                              ? "Suspendido"
                              : "Baja lógica"
                          }
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {
                          filterEstado === "ACTIVO"
                            ? "Activo"
                            : filterEstado === "PENDIENTE_ACTIVACION"
                            ? "Pendiente de activación"
                            : filterEstado === "SUSPENDIDO"
                            ? "Suspendido"
                            : "Baja lógica"
                        }
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        handleSetFilterEstado("TODOS");
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                      aria-label="Eliminar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

        <TooltipProvider delayDuration={150}>
          {/* Tabla de Cuentas Internas (Desktop md+) */}
          <div className="hidden md:block w-full">
              <Table
                className="w-full min-w-[1380px]"
                containerClassName="overflow-x-auto w-full"
              >
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="w-[125px] min-w-[120px] whitespace-nowrap text-left pl-6">
                    CÉDULA / ID
                  </TableHead>
                  <TableHead className="w-[280px] min-w-[260px] whitespace-nowrap text-left">
                    FUNCIONARIO / CORREO
                  </TableHead>
                  <TableHead className="w-[230px] min-w-[210px] whitespace-nowrap text-left">
                    ROL INSTITUCIONAL
                  </TableHead>
                  <TableHead className="w-[220px] min-w-[200px] whitespace-nowrap text-left">
                    ÁREA DINARP
                  </TableHead>
                  <TableHead className="w-[160px] min-w-[150px] whitespace-nowrap text-left">
                    ESTADO
                  </TableHead>
                  <TableHead className="w-[95px] min-w-[90px] whitespace-nowrap text-left">
                    SEGURIDAD
                  </TableHead>
                  <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap text-left">
                    ÚLTIMA ACTUALIZACIÓN
                  </TableHead>
                  <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-right pr-6">
                    ACCIONES
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Users className="size-8 stroke-[1.5] text-muted-foreground/60" />
                        <p className="text-sm font-semibold text-foreground">
                          No se encontraron cuentas internas
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ajusta los filtros de búsqueda o crea una nueva cuenta interna.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsuarios.map((u) => (
                    <TableRow key={u.id} className="transition-colors hover:bg-muted/40">
                      {/* 1. Cédula y ID */}
                      <TableCell className="w-[125px] min-w-[120px] text-left align-middle pl-6">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-foreground block">
                            {u.cedula}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {u.id}
                          </span>
                        </div>
                      </TableCell>

                      {/* 2. Funcionario y Correo (Columna principal, ancho generoso, sin cortes) */}
                      <TableCell className="w-[280px] min-w-[260px] text-left align-middle">
                        <div className="space-y-1 min-w-0 pr-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  setExpedienteUser(u);
                                  setExpedienteModalOpen(true);
                                }}
                                className="text-xs font-bold text-foreground hover:text-primary transition-colors block text-left truncate cursor-pointer max-w-full"
                              >
                                {u.nombreCompleto}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {u.nombreCompleto} (clic para ver expediente)
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-[11px] text-muted-foreground font-mono block truncate">
                                {u.correo}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {u.correo}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>

                      {/* 3. Rol institucional (Badge consistente, sin truncar) */}
                      <TableCell className="w-[230px] min-w-[210px] text-left align-middle">
                        <div className="inline-flex items-center">
                          {getRolBadge(u.rol, u.rolLabel)}
                        </div>
                      </TableCell>

                      {/* 4. Área DINARP */}
                      <TableCell className="w-[220px] min-w-[200px] text-left align-middle">
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-foreground font-medium block truncate cursor-help">
                                {u.ambito}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {u.ambito}
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {u.ambitoCodigo}
                          </span>
                        </div>
                      </TableCell>

                      {/* 5. Estado */}
                      <TableCell className="w-[160px] min-w-[150px] text-left align-middle">
                        <div className="inline-flex items-center justify-start">
                          {getEstadoBadge(u.estado)}
                        </div>
                      </TableCell>

                      {/* 6. Seguridad (Contraseña y Google Authenticator / TOTP con tooltips claros) */}
                      <TableCell className="w-[95px] min-w-[90px] text-left align-middle">
                        <div className="inline-flex items-center gap-1.5 justify-start">
                          {/* Contraseña */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "size-6 rounded-full flex items-center justify-center text-[10px] shrink-0 border transition-colors",
                                  u.credencialesConfiguradas
                                    ? "bg-success/15 text-success border-success/30"
                                    : "bg-warning/15 text-warning border-warning/30"
                                )}
                              >
                                <KeyRound className="size-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {u.credencialesConfiguradas
                                ? "Contraseña configurada"
                                : "Contraseña: Pendiente de configuración"}
                            </TooltipContent>
                          </Tooltip>

                          {/* Google Authenticator / TOTP */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "size-6 rounded-full flex items-center justify-center text-[10px] shrink-0 border transition-colors",
                                  u.totpConfigurado
                                    ? "bg-success/15 text-success border-success/30"
                                    : "bg-warning/15 text-warning border-warning/30"
                                )}
                              >
                                <Fingerprint className="size-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              {u.totpConfigurado
                                ? "Google Authenticator / TOTP vinculado"
                                : "Google Authenticator: Pendiente de configuración"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>

                      {/* 7. Última actualización */}
                      <TableCell className="w-[130px] min-w-[120px] text-left align-middle whitespace-nowrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start text-left cursor-help">
                              <span className="text-foreground font-semibold">
                                {(u.ultimaActualizacion || u.fechaCreacion).split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {(u.ultimaActualizacion || u.fechaCreacion).split(" ")[1] || ""}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            Última modificación: {u.ultimaActualizacion || u.fechaCreacion}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      {/* 8. Acciones (Tooltips estandarizados y solo acciones válidas por estado) */}
                      <TableCell className="w-[140px] min-w-[130px] pr-6 text-right align-middle">
                        <div className="inline-flex items-center gap-0.5 justify-end w-full">
                          {/* Ver detalle (Siempre válido) */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setExpedienteUser(u);
                                  setExpedienteModalOpen(true);
                                }}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                aria-label={`Ver detalle de ${u.nombreCompleto}`}
                              >
                                <Eye className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Ver detalle</TooltipContent>
                          </Tooltip>

                          {/* Editar (Solo si no está retirado) */}
                          {u.estado !== "RETIRADO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => setEditingUser(u)}
                                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                  aria-label={`Editar cuenta de ${u.nombreCompleto}`}
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Editar</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Activar (Solo si está pendiente de activación) */}
                          {u.estado === "PENDIENTE_ACTIVACION" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={() => handleOpenActivar(u)}
                                  aria-label={`Activar cuenta de ${u.nombreCompleto}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                >
                                  <UserCheck className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Activar</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Suspender (Solo si está activo) */}
                          {u.estado === "ACTIVO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={() => handleOpenSuspender(u)}
                                  aria-label={`Suspender cuenta de ${u.nombreCompleto}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                >
                                  <UserMinus className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Suspender</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Reactivar (Solo si está suspendido) */}
                          {u.estado === "SUSPENDIDO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={() => handleOpenReactivar(u)}
                                  aria-label={`Reactivar cuenta de ${u.nombreCompleto}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                >
                                  <RotateCcw className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Reactivar</TooltipContent>
                            </Tooltip>
                          )}

                          {/* Baja lógica (Válido mientras no sea RETIRADO) */}
                          {u.estado !== "RETIRADO" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  onClick={() => handleOpenBaja(u)}
                                  aria-label={`Baja lógica para cuenta de ${u.nombreCompleto}`}
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                >
                                  <UserX className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Baja lógica</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista Mobile Cards (<md) con Tarjeta Interactiva del UI Kit */}
          <div className="block md:hidden w-full space-y-3.5">
            {paginatedUsuarios.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                <Users className="size-8 stroke-[1.5] text-muted-foreground/60" />
                <p className="text-sm font-semibold text-foreground">No se encontraron cuentas internas</p>
                <p className="text-xs text-muted-foreground">
                  Ajusta los filtros de búsqueda o crea una nueva cuenta interna.
                </p>
              </div>
            ) : (
              paginatedUsuarios.map((u) => renderUsuarioCard(u))
            )}
          </div>
        </TooltipProvider>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {filteredUsuarios.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, filteredUsuarios.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{filteredUsuarios.length}</span> cuentas internas
              </p>

              {/* Selector de filas por página: 5, 10, 15 */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Filas:</span>
                <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                  {[5, 10, 15].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                        pageSize === size
                          ? "bg-surface text-primary shadow-2xs font-bold border border-border/80"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 sm:order-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst
                      onClick={() => setCurrentPage(1)}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={() => setCurrentPage(totalPages)}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
      </main>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODAL 1: ACTIVAR CUENTA (ID-03)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <AccionCuentaDialog
        tipo={accionCuentaTipo}
        usuario={selectedUser}
        open={accionCuentaOpen}
        onOpenChange={setAccionCuentaOpen}
        simulateSyncError={simulateSyncError}
        onSuccess={(updatedUser) => {
          setSelectedUser(updatedUser);
        }}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODAL 2: SUSPENDER CUENTA (ID-03)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODAL 3: REACTIVAR CUENTA (ID-03)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MODAL 4: DAR DE BAJA (ID-04)
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {selectedUser && (
        <ConfirmDialog
          open={modalBajaOpen}
          onOpenChange={(open) => {
            setModalBajaOpen(open);
            if (!open) {
              setErrorAccion("");
              setMotivoAccion("");
            }
          }}
          variant="danger"
          icon={<UserX className="size-10 text-danger stroke-[2px]" />}
          title="Dar de baja la cuenta"
          description="La cuenta dejará de estar disponible para ingreso y operación. Se conservará su historial y trazabilidad."
          confirmText="Dar de baja"
          cancelText="Cancelar"
          confirmVariant="danger"
          isConfirmDisabled={
            selectedUser.tareasActivas > 0 || motivoAccion.trim().length < 10
          }
          onConfirm={handleBajaSubmit}
          size="lg"
          className="sm:max-w-[560px]"
        >
          <div className="space-y-4 pt-1 text-left w-full">
            {errorAccion && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorAccion}</span>
              </div>
            )}

            {/* Resumen Funcionario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">Funcionario:</span>
                <span className="font-semibold text-foreground break-words block text-xs sm:text-sm">
                  {selectedUser.nombreCompleto}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground block mt-0.5">
                  C.I. {selectedUser.cedula}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px] font-medium">Área DINARP:</span>
                <span className="font-semibold text-foreground break-words block">
                  {selectedUser.ambito}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground block mt-0.5">
                  Código: {selectedUser.ambitoCodigo}
                </span>
              </div>
            </div>

            {/* Verificación de responsabilidades y trámites pendientes */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground block">
                Verificación de responsabilidades y trámites pendientes:
              </span>

              {selectedUser.tareasActivas > 0 ? (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs space-y-1.5 text-destructive">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>Imposible dar de baja: {selectedUser.tareasActivas} trámite(s) activo(s)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    La persona tiene responsabilidades activas en curso. La regla de negocio exige resolver o reasignar las tareas antes de poder dar de baja a la cuenta.
                  </p>
                  {selectedUser.detalleTareas && selectedUser.detalleTareas.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] font-medium pt-1">
                      {selectedUser.detalleTareas.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground pt-1">
                    El Director de área debe reasignar estos trámites antes de ejecutar la baja lógica.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-xs space-y-1 text-success">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Sin trámites activos ni responsabilidades pendientes</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    El funcionario no registra expedientes en curso. Cumple las condiciones requeridas para la baja.
                  </p>
                </div>
              )}
            </div>

            {/* Campo obligatorio: Motivo de la baja */}
            <div className="space-y-1.5">
              <Label htmlFor="baja-motivo" className="text-xs font-semibold text-foreground">
                Motivo de la baja <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="baja-motivo"
                appearance="compact"
                placeholder="Detalla el memorando, acción de personal o resolución administrativa de desvinculación..."
                rows={2}
                value={motivoAccion}
                onChange={(e) => {
                  setMotivoAccion(e.target.value);
                  if (errorAccion) setErrorAccion("");
                }}
                className="text-xs min-h-[64px] resize-none bg-background"
                required
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Mínimo 10 caracteres. Se registrará en la auditoría inmutable de la institución.</span>
                <span className={cn(motivoAccion.trim().length >= 10 ? "text-success font-semibold" : "text-muted-foreground")}>
                  {motivoAccion.trim().length}/10
                </span>
              </div>
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* FEEDBACK SUCCESS TRAS CONFIRMAR BAJA (Confirmation Dialog Success UI Kit) */}
      {bajaSuccessFeedback && (
        <ConfirmDialog
          open={Boolean(bajaSuccessFeedback)}
          onOpenChange={(open) => {
            if (!open) setBajaSuccessFeedback(null);
          }}
          variant="success"
          title="Baja lógica confirmada"
          description="La cuenta ha sido retirada del servicio activo. Conserva intacto su historial, firmas electrónicas y trazabilidad para auditoría."
          confirmText="Entendido"
          cancelText=""
          confirmVariant="primary"
          onConfirm={() => setBajaSuccessFeedback(null)}
          size="default"
          className="sm:max-w-[480px]"
        >
          <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-2 text-left my-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Funcionario:</span>
                <span className="font-semibold text-foreground break-words block">
                  {bajaSuccessFeedback.nombreCompleto}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Nuevo estado:</span>
                <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
                  Baja lógica
                </Badge>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Cédula:</span>
                <span className="font-mono text-foreground">{bajaSuccessFeedback.cedula}</span>
              </div>
              <div className="min-w-0">
                <span className="text-muted-foreground block text-[11px]">Área DINARP:</span>
                <span className="font-semibold text-foreground break-words block">
                  {bajaSuccessFeedback.ambito}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Registrado por: <strong className="text-foreground">{currentUser.name}</strong></span>
              <span className="text-success font-semibold">Trazabilidad inalterable</span>
            </div>
          </div>
        </ConfirmDialog>
      )}

      {/* Modal Crear Cuenta Interna (Diseño exacto en Dialog) */}
      <CrearCuentaInternaModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
        onVerExpediente={(u) => {
          setExpedienteUser(u);
          setExpedienteModalOpen(true);
        }}
      />

      {/* Modal Editar Cuenta Interna (Diseño exacto en Dialog) */}
      <EditarCuentaInternaModal
        usuario={editingUser}
        open={Boolean(editingUser)}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null);
        }}
      />

      {/* Modal Expediente de Usuario y Seguridad (Diseño idéntico a foto de referencia) */}
      <ExpedienteCuentaModal
        usuario={expedienteUser}
        open={expedienteModalOpen}
        onOpenChange={setExpedienteModalOpen}
      />
    </WireframeDashboardLayout>
  );
}
