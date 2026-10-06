"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  RefreshCw,
  UserCheck,
  Mail,
  KeyRound,
  Clock,
  X,
  UserMinus,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InteractiveCard } from "@/components/ui/data-display";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useCoordinadoresStore,
  type CoordinadorCuenta,
} from "@/modules/coordinadores/data/coordinadores-store";
import { ActualizarContactoAccesoDialog } from "@/modules/coordinadores/components/actualizar-contacto-acceso-dialog";
import { SuspenderReactivarCoordinadorDialog } from "@/modules/coordinadores/components/suspender-reactivar-coordinador-dialog";

export function CoordinadoresView() {
  const {
    coordinadores,
    sincronizarIdentityPlatform
  } = useCoordinadoresStore();

  // Estados de búsqueda y filtros requeridos
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstitucion, setFilterInstitucion] = useState<string>("TODAS");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [filterTipo, setFilterTipo] = useState<string>("TODOS");
  const [filterSeguridad, setFilterSeguridad] = useState<string>("TODOS");

  // Strings de búsqueda para los comboboxes
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [tipoSearch, setTipoSearch] = useState("");
  const [seguridadSearch, setSeguridadSearch] = useState("");

  // Paginación (idéntica a Cuentas Internas)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modales
  const [dialogContactoOpen, setDialogContactoOpen] = useState(false);
  const [dialogSuspenderOpen, setDialogSuspenderOpen] = useState(false);
  const [dialogReactivarOpen, setDialogReactivarOpen] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState<CoordinadorCuenta | null>(null);

  // KPIs de resumen
  const kpis = useMemo(() => {
    const total = coordinadores.length;
    const activos = coordinadores.filter((c) => c.estado === "ACTIVO").length;
    const titulares = coordinadores.filter((c) => c.tipoDesignacion === "TITULAR").length;
    const suplentes = coordinadores.filter((c) => c.tipoDesignacion === "SUPLENTE").length;
    const suspendidos = coordinadores.filter((c) => c.estado === "SUSPENDIDO").length;
    const pendientesSync = coordinadores.filter((c) => c.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION").length;
    return { total, activos, titulares, suplentes, suspendidos, pendientesSync };
  }, [coordinadores]);

  // Lista dinámica de instituciones únicas
  const institucionesDisponibles = useMemo(() => {
    const list = Array.from(new Set(coordinadores.map((c) => c.institucion))).filter(Boolean);
    return list.sort((a, b) => a.localeCompare(b));
  }, [coordinadores]);

  // Cuentas con sincronización pendiente
  const cuentasPendientesSync = useMemo(() => {
    return coordinadores.filter((c) => c.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION");
  }, [coordinadores]);

  // Opciones de filtros
  const estadoOptions = [
    { value: "TODOS", label: "Todos los estados" },
    { value: "ACTIVO", label: "Activo" },
    { value: "SUSPENDIDO", label: "Suspendido" },
  ];

  const tipoOptions = [
    { value: "TODOS", label: "Todos los tipos" },
    { value: "TITULAR", label: "Titular" },
    { value: "SUPLENTE", label: "Suplente" },
  ];

  const seguridadOptions = [
    { value: "TODOS", label: "Toda seguridad" },
    { value: "TOTP_CONFIGURADO", label: "Con TOTP configurado" },
    { value: "SIN_TOTP", label: "Sin TOTP (Pendiente)" },
    { value: "CORREO_PENDIENTE", label: "Con correo pendiente" },
    { value: "ID08_AUTORIZADA", label: "Con recuperación autorizada" },
    { value: "SYNC_PENDIENTE", label: "Pendiente sincronización" },
  ];

  // Filtrado compuesto
  const filteredCoordinadores = useMemo(() => {
    return coordinadores.filter((c) => {
      // 1. Búsqueda de texto libre
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        c.nombreCompleto.toLowerCase().includes(term) ||
        c.cedula.includes(term) ||
        c.institucion.toLowerCase().includes(term) ||
        c.correo.toLowerCase().includes(term) ||
        (c.nuevoCorreoPendiente && c.nuevoCorreoPendiente.toLowerCase().includes(term));

      // 2. Filtro Institución
      const matchInstitucion =
        filterInstitucion === "TODAS" || c.institucion === filterInstitucion;

      // 3. Filtro Estado de cuenta
      const matchEstado =
        filterEstado === "TODOS" || c.estado === filterEstado;

      // 4. Filtro Tipo (Titular / Suplente)
      const matchTipo =
        filterTipo === "TODOS" || c.tipoDesignacion === filterTipo;

      // 5. Filtro Seguridad
      let matchSeguridad = true;
      if (filterSeguridad === "TOTP_CONFIGURADO") {
        matchSeguridad = c.totpConfigurado;
      } else if (filterSeguridad === "SIN_TOTP") {
        matchSeguridad = !c.totpConfigurado;
      } else if (filterSeguridad === "CORREO_PENDIENTE") {
        matchSeguridad = !!c.nuevoCorreoPendiente;
      } else if (filterSeguridad === "ID08_AUTORIZADA") {
        matchSeguridad = c.recuperacionId08Autorizada;
      } else if (filterSeguridad === "SYNC_PENDIENTE") {
        matchSeguridad = c.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION";
      }

      return matchSearch && matchInstitucion && matchEstado && matchTipo && matchSeguridad;
    });
  }, [coordinadores, searchTerm, filterInstitucion, filterEstado, filterTipo, filterSeguridad]);

  // Paginación de resultados
  const totalPages = Math.max(1, Math.ceil(filteredCoordinadores.length / pageSize));
  const paginatedCoordinadores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoordinadores.slice(start, start + pageSize);
  }, [filteredCoordinadores, currentPage, pageSize]);

  // Indicador de filtros activos
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    filterInstitucion !== "TODAS" ||
    filterEstado !== "TODOS" ||
    filterTipo !== "TODOS" ||
    filterSeguridad !== "TODOS";

  const handleOpenContacto = (coord: CoordinadorCuenta) => {
    setSelectedCoord(coord);
    setDialogContactoOpen(true);
  };

  const handleOpenSuspender = (coord: CoordinadorCuenta) => {
    setSelectedCoord(coord);
    setDialogSuspenderOpen(true);
  };

  const handleOpenReactivar = (coord: CoordinadorCuenta) => {
    setSelectedCoord(coord);
    setDialogReactivarOpen(true);
  };

  const handleReintentarSync = (coord: CoordinadorCuenta) => {
    const res = sincronizarIdentityPlatform(coord.id);
    if (res.success) {
      toast.success("Sincronización confirmada", {
        description: `La cuenta de ${coord.nombreCompleto} ha sido sincronizada exitosamente con Identity Platform.`,
      });
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterInstitucion("TODAS");
    setFilterEstado("TODOS");
    setFilterTipo("TODOS");
    setFilterSeguridad("TODOS");
    setInstitucionSearch("");
    setEstadoSearch("");
    setTipoSearch("");
    setSeguridadSearch("");
    setCurrentPage(1);
  };

  // Renderizador de tarjeta mobile (<md)
  const renderCoordinadorCard = (coord: CoordinadorCuenta) => {
    const hasSyncPending = coord.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION";
    return (
      <InteractiveCard
        key={coord.id}
        color={coord.estado === "ACTIVO" ? "primary" : "danger"}
        decorativeIcon={coord.tipoDesignacion === "TITULAR" ? <ShieldCheck /> : <Users />}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
        className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
      >
        {/* Cabecera: Nombre y Estado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <Link
              href={`/coordinadores/${coord.id}`}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug cursor-pointer block"
            >
              {coord.nombreCompleto}
            </Link>
            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
              <span>C.I. {coord.cedula}</span>
              <span>·</span>
              <span className="font-semibold text-primary">{coord.cargo}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="flex flex-col items-end gap-1">
              <Badge
                tone={coord.estado === "ACTIVO" ? "success" : "danger"}
                appearance="soft"
                size="sm"
                className="font-bold text-[11px]"
              >
                {coord.estado === "ACTIVO" ? "Activo" : "Suspendido"}
              </Badge>
              {hasSyncPending && (
                <Badge
                  tone="warning"
                  appearance="solid"
                  size="sm"
                  className="font-bold text-[10px] gap-1 bg-warning text-white shadow-2xs"
                >
                  <RefreshCw className="size-2.5 text-white shrink-0 animate-spin [animation-duration:3s]" />
                  Sync pendiente
                </Badge>
              )}
            </div>
            {coord.tipoDesignacion === "TITULAR" ? (
              <Badge
                tone="primary"
                appearance="solid"
                size="sm"
                className="font-bold text-[10px] gap-1 text-white shadow-2xs"
              >
                <ShieldCheck className="size-2.5 text-white shrink-0" />
                Titular
              </Badge>
            ) : (
              <Badge
                tone="secondary"
                appearance="solid"
                size="sm"
                className="font-bold text-[10px] gap-1 text-white shadow-2xs"
              >
                <Users className="size-2.5 text-white shrink-0" />
                Suplente
              </Badge>
            )}
          </div>
        </div>

        {/* Institución */}
        <div className="space-y-1 text-xs">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Institución autorizada
          </span>
          <p className="text-foreground font-medium flex items-center gap-1.5">
            <Building2 className="size-3.5 text-primary shrink-0" />
            <span className="truncate">{coord.institucion}</span>
          </p>
        </div>

        {/* Canales y Seguridad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
              Correo institucional
            </span>
            <p className="text-foreground font-mono text-[11px] truncate">{coord.correo}</p>
            <Badge
              tone={coord.correoVerificado ? "success" : "warning"}
              appearance="soft"
              size="sm"
              className="text-[10px] mt-1"
            >
              {coord.correoVerificado ? "Verificado" : "Pendiente"}
            </Badge>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
              Seguridad (TOTP)
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <Badge
                tone={coord.totpConfigurado ? "success" : "warning"}
                appearance="soft"
                size="sm"
                className="text-[10px]"
              >
                {coord.totpConfigurado ? "Configurado" : "Sin TOTP"}
              </Badge>
              {coord.recuperacionId08Autorizada && (
                <Badge tone="primary" appearance="soft" size="sm" className="text-[9px]">
                  Recuperación autorizada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-end gap-1 pt-2 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs gap-1.5 text-muted-foreground hover:text-primary"
          >
            <Link href={`/coordinadores/${coord.id}`}>
              <Eye className="size-3.5" />
              <span>Ver detalle</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenContacto(coord)}
            className="text-xs gap-1.5 text-muted-foreground hover:text-primary"
          >
            <ShieldAlert className="size-3.5" />
            <span>Corregir contacto / factor</span>
          </Button>
          {coord.estado === "ACTIVO" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenSuspender(coord)}
              className="text-xs gap-1.5 text-danger hover:bg-danger/10"
            >
              <AlertTriangle className="size-3.5" />
              <span>Suspender</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenReactivar(coord)}
              className="text-xs gap-1.5 text-warning hover:bg-warning/10"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Reactivar</span>
            </Button>
          )}
          {hasSyncPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleReintentarSync(coord)}
              className="text-xs gap-1.5 border-warning/50 text-warning bg-warning/10 hover:bg-warning/20 font-semibold"
            >
              <RefreshCw className="size-3.5 animate-spin [animation-duration:4s]" />
              <span>Sincronizar Identity</span>
            </Button>
          )}
        </div>
      </InteractiveCard>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="coordinadores"
      breadcrumbs={[{ label: "Coordinadores" }]}
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
                Coordinadores institucionales
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Gestiona las cuentas personales de Coordinadores SINARP, su contacto, segundo factor y estado de acceso.
              </p>
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
                setFilterEstado(filterEstado === "ACTIVO" ? "TODOS" : "ACTIVO");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterEstado(filterEstado === "ACTIVO" ? "TODOS" : "ACTIVO");
                  setCurrentPage(1);
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
                    Cuentas activas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.activos}
                  </p>
                </div>
              </div>
            </Card>

            {/* Titulares */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterTipo(filterTipo === "TITULAR" ? "TODOS" : "TITULAR");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterTipo(filterTipo === "TITULAR" ? "TODOS" : "TITULAR");
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterTipo === "TITULAR"
                  ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                  : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterTipo === "TITULAR"
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                    )}
                  >
                    <ShieldCheck className="size-5" />
                  </div>
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Designación
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Coordinadores Titulares
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.titulares}
                  </p>
                </div>
              </div>
            </Card>

            {/* Suplentes */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setFilterTipo(filterTipo === "SUPLENTE" ? "TODOS" : "SUPLENTE");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterTipo(filterTipo === "SUPLENTE" ? "TODOS" : "SUPLENTE");
                  setCurrentPage(1);
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                filterTipo === "SUPLENTE"
                  ? "bg-secondary/15 border-secondary ring-2 ring-secondary/40 shadow-xs"
                  : "bg-secondary/5 hover:bg-secondary/10 border-secondary/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      filterTipo === "SUPLENTE"
                        ? "bg-secondary text-white shadow-xs"
                        : "bg-secondary/15 text-secondary group-hover:scale-105 group-hover:bg-secondary group-hover:text-white"
                    )}
                  >
                    <Users className="size-5" />
                  </div>
                  <Badge
                    tone="secondary"
                    appearance="solid"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5 text-white"
                  >
                    Respaldo
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Coordinadores Suplentes
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {kpis.suplentes}
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
                setFilterEstado(filterEstado === "SUSPENDIDO" ? "TODOS" : "SUSPENDIDO");
                setCurrentPage(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFilterEstado(filterEstado === "SUSPENDIDO" ? "TODOS" : "SUSPENDIDO");
                  setCurrentPage(1);
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
                    <AlertTriangle className="size-5" />
                  </div>
                  <Badge
                    tone="danger"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Bloqueadas
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
          </div>

          {/* ALERTA: CAMBIO DE CUENTA PENDIENTE DE SINCRONIZACIÓN */}
          {cuentasPendientesSync.length > 0 && (
            <Alert
              variant="warning"
              icon={<AlertTriangle className="size-4.5 text-white" />}
              title={`Cambio de cuenta pendiente de sincronización (${cuentasPendientesSync.length})`}
              className="animate-fade-in shadow-xs shrink-0 py-4 sm:py-5 px-4 sm:px-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1.5">
                <p className="text-muted-foreground text-xs sm:text-[13px] leading-relaxed">
                  Existen coordinadores con modificaciones aplicadas localmente pendientes de confirmación en <strong>Identity Platform</strong>:{" "}
                  <span className="font-semibold text-foreground">
                    {cuentasPendientesSync.map((c) => `${c.nombreCompleto} (${c.institucion})`).join("; ")}
                  </span>.
                </p>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    cuentasPendientesSync.forEach((c) => sincronizarIdentityPlatform(c.id));
                    toast.success("Sincronización masiva procesada", {
                      description: "Se confirmaron los cambios en Identity Platform.",
                    });
                  }}
                  className="text-xs h-8 px-3 gap-1.5 shrink-0 shadow-xs font-semibold"
                >
                  <RefreshCw className="size-3.5" />
                  Sincronizar todas
                </Button>
              </div>
            </Alert>
          )}


          {/* Filtros y Búsqueda con UI Kit Oficial */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit (ancho reducido y compacto) */}
              <div className="w-full sm:w-64 lg:w-60 xl:w-72 shrink-0">
                <Search
                  size="sm"
                  placeholder="Buscar cédula, nombre, correo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Filtros Combobox UI Kit (flex horizontal uniforme 'uno al ladito del otro', sin cortes de texto) */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
                {/* 1. Filtro Institución */}
                <div className="w-full sm:w-[240px] xl:w-[260px] shrink-0">
                  <Combobox
                    value={filterInstitucion === "TODAS" ? null : filterInstitucion}
                    onValueChange={(val) => {
                      setFilterInstitucion(val || "TODAS");
                      setCurrentPage(1);
                    }}
                    inputValue={institucionSearch}
                    onInputValueChange={(newSearch) => {
                      if (newSearch === "TODAS") setInstitucionSearch("");
                      else setInstitucionSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las instituciones"
                      showClear={filterInstitucion !== "TODAS"}
                      showTrigger={true}
                      className="w-full text-xs px-2.5 sm:px-3"
                      title={filterInstitucion !== "TODAS" ? filterInstitucion : "Todas las instituciones"}
                    />
                    <ComboboxContent className="w-auto min-w-[max(100%,380px)] sm:min-w-[480px] max-w-[90vw] sm:max-w-[560px] z-[80]">
                      <ComboboxList className="max-h-[300px]">
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por institución</ComboboxLabel>
                          {institucionesDisponibles
                            .filter((inst) =>
                              !institucionSearch ||
                              inst.toLowerCase().includes(institucionSearch.toLowerCase())
                            )
                            .map((inst) => (
                              <ComboboxItem
                                key={inst}
                                value={inst}
                                className="text-xs py-2 px-3 cursor-pointer whitespace-normal leading-snug break-words text-left"
                              >
                                {inst}
                              </ComboboxItem>
                            ))}
                        </ComboboxGroup>
                        {institucionesDisponibles.filter((inst) =>
                          !institucionSearch ||
                          inst.toLowerCase().includes(institucionSearch.toLowerCase())
                        ).length === 0 && (
                          <ComboboxEmpty>No se encontraron instituciones.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* 2. Filtro Estado */}
                <div className="w-full sm:w-[180px] xl:w-[190px] shrink-0">
                  <Combobox
                    value={filterEstado === "TODOS" ? null : filterEstado}
                    onValueChange={(val) => {
                      setFilterEstado(val || "TODOS");
                      setCurrentPage(1);
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = estadoOptions.find((e) => e.value === newSearch);
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
                      className="w-full text-xs px-2.5 sm:px-3"
                    />
                    <ComboboxContent className="min-w-[210px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                          {estadoOptions.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap text-left"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* 3. Filtro Tipo */}
                <div className="w-full sm:w-[170px] xl:w-[180px] shrink-0">
                  <Combobox
                    value={filterTipo === "TODOS" ? null : filterTipo}
                    onValueChange={(val) => {
                      setFilterTipo(val || "TODOS");
                      setCurrentPage(1);
                    }}
                    inputValue={tipoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = tipoOptions.find((e) => e.value === newSearch);
                      if (opt) setTipoSearch(opt.label);
                      else if (newSearch === "TODOS") setTipoSearch("");
                      else setTipoSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todos los tipos"
                      showClear={filterTipo !== "TODOS"}
                      showTrigger={true}
                      className="w-full text-xs px-2.5 sm:px-3"
                    />
                    <ComboboxContent className="min-w-[210px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por tipo</ComboboxLabel>
                          {tipoOptions.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap text-left"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* 4. Filtro Seguridad */}
                <div className="w-full sm:w-[215px] xl:w-[225px] shrink-0">
                  <Combobox
                    value={filterSeguridad === "TODOS" ? null : filterSeguridad}
                    onValueChange={(val) => {
                      setFilterSeguridad(val || "TODOS");
                      setCurrentPage(1);
                    }}
                    inputValue={seguridadSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = seguridadOptions.find((e) => e.value === newSearch);
                      if (opt) setSeguridadSearch(opt.label);
                      else if (newSearch === "TODOS") setSeguridadSearch("");
                      else setSeguridadSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Seguridad (TOTP/Email)"
                      showClear={filterSeguridad !== "TODOS"}
                      showTrigger={true}
                      className="w-full text-xs px-2.5 sm:px-3"
                    />
                    <ComboboxContent className="min-w-[240px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por seguridad</ComboboxLabel>
                          {seguridadOptions.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 px-3 cursor-pointer whitespace-nowrap text-left"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
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

                {searchTerm.trim() !== "" && (
                  <Badge
                    tone="neutral"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Búsqueda: &ldquo;{searchTerm}&rdquo;
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Búsqueda: &ldquo;{searchTerm}&rdquo;
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterInstitucion !== "TODAS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Institución: {filterInstitucion}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Institución: {filterInstitucion}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterInstitucion("TODAS");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de institución"
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
                          Estado: {filterEstado === "ACTIVO" ? "Activo" : "Suspendido"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {filterEstado === "ACTIVO" ? "Activo" : "Suspendido"}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterEstado("TODOS");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {filterTipo !== "TODOS" && (
                  <Badge
                    tone={filterTipo === "TITULAR" ? "primary" : "secondary"}
                    appearance="solid"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold max-w-full text-white shadow-2xs"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate text-white cursor-help">
                          Tipo: {filterTipo === "TITULAR" ? "Titular" : "Suplente"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Tipo: {filterTipo === "TITULAR" ? "Titular" : "Suplente"}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterTipo("TODOS");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de tipo"
                    >
                      <X className="size-3 text-white" />
                    </button>
                  </Badge>
                )}

                {filterSeguridad !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Seguridad: {seguridadOptions.find((s) => s.value === filterSeguridad)?.label || filterSeguridad}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Seguridad: {seguridadOptions.find((s) => s.value === filterSeguridad)?.label || filterSeguridad}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterSeguridad("TODOS");
                        setCurrentPage(1);
                      }}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de seguridad"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          <TooltipProvider delayDuration={150}>
            {/* Tabla de Coordinadores (Desktop md+) */}
            <div className="hidden md:block w-full">
              <Table
                className="w-full min-w-[1380px]"
                containerClassName="overflow-x-auto w-full"
              >
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[240px] whitespace-nowrap text-left pl-6">
                      COORDINADOR
                    </TableHead>
                    <TableHead className="w-[120px] whitespace-nowrap text-left">
                      CÉDULA
                    </TableHead>
                    <TableHead className="w-[240px] whitespace-nowrap text-left">
                      INSTITUCIÓN
                    </TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap text-left">
                      TIPO
                    </TableHead>
                    <TableHead className="w-[220px] whitespace-nowrap text-left">
                      CORREO / ESTADO
                    </TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap text-left">
                      TOTP (MFA)
                    </TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap text-left">
                      ESTADO CUENTA
                    </TableHead>
                    <TableHead className="w-[130px] whitespace-nowrap text-left">
                      ÚLTIMA ACTUALIZACIÓN
                    </TableHead>
                    <TableHead className="w-[140px] whitespace-nowrap text-right pr-6">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCoordinadores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-44 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 py-6">
                          <Users className="size-8 text-muted-foreground/50" />
                          <p className="text-sm font-semibold text-foreground">
                            No se encontraron coordinadores
                          </p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            No hay resultados que coincidan con los criterios de búsqueda o filtros seleccionados.
                          </p>
                          {hasActiveFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearFilters}
                              className="mt-2 text-xs"
                            >
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCoordinadores.map((coord) => {
                      const hasSyncPending = coord.sincronizacionIdentityPlatform === "PENDIENTE_SINCRONIZACION";
                      return (
                        <TableRow
                          key={coord.id}
                          className={cn(
                            "h-[70px] align-middle transition-colors",
                            hasSyncPending && "bg-warning/[0.04] hover:bg-warning/[0.08]"
                          )}
                        >
                          {/* 1. Coordinador */}
                          <TableCell className="w-[240px] pl-6 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                                {coord.nombreCompleto
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="min-w-0 space-y-0.5">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      href={`/coordinadores/${coord.id}`}
                                      className="font-bold text-foreground text-xs hover:text-primary transition-colors truncate block leading-snug cursor-pointer"
                                    >
                                      {coord.nombreCompleto}
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-xs">
                                    <p className="font-semibold">{coord.nombreCompleto}</p>
                                    <p className="text-[11px] text-muted-foreground">{coord.cargo}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  {coord.cargo}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* 2. Cédula */}
                          <TableCell className="w-[120px] align-middle whitespace-nowrap">
                            <span className="font-mono text-xs text-foreground font-semibold">
                              {coord.cedula}
                            </span>
                          </TableCell>

                          {/* 3. Institución */}
                          <TableCell className="w-[240px] align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="space-y-0.5 max-w-[230px] cursor-help">
                                  <p className="font-medium text-xs text-foreground truncate">
                                    {coord.institucion}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    RUC: {coord.rucInstitucion}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                <p className="font-semibold">{coord.institucion}</p>
                                <p className="text-[11px] text-muted-foreground">RUC: {coord.rucInstitucion}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 4. Tipo */}
                          <TableCell className="w-[140px] align-middle whitespace-nowrap">
                            {coord.tipoDesignacion === "TITULAR" ? (
                              <Badge
                                tone="primary"
                                appearance="solid"
                                size="sm"
                                className="font-bold gap-1 text-[10px] text-white shadow-2xs"
                              >
                                <ShieldCheck className="size-3 text-white shrink-0" />
                                Titular
                              </Badge>
                            ) : (
                              <Badge
                                tone="secondary"
                                appearance="solid"
                                size="sm"
                                className="font-bold gap-1 text-[10px] text-white shadow-2xs"
                              >
                                <Users className="size-3 text-white shrink-0" />
                                Suplente
                              </Badge>
                            )}
                          </TableCell>

                          {/* 5. Correo / Estado */}
                          <TableCell className="w-[220px] align-middle">
                            <div className="space-y-1 max-w-[210px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="size-3 text-muted-foreground shrink-0" />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-mono text-[11px] text-foreground truncate cursor-help">
                                      {coord.correo}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs max-w-xs">
                                    {coord.correo}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  tone={coord.correoVerificado ? "success" : "warning"}
                                  appearance="soft"
                                  size="sm"
                                  className="text-[10px] h-5"
                                >
                                  {coord.correoVerificado ? "Verificado" : "Pendiente"}
                                </Badge>
                                {coord.nuevoCorreoPendiente && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge tone="warning" appearance="outline" size="sm" className="text-[9px] h-5 cursor-help">
                                        Nuevo pendiente
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      Nuevo correo por confirmar: {coord.nuevoCorreoPendiente}
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          {/* 6. TOTP */}
                          <TableCell className="w-[130px] align-middle whitespace-nowrap">
                            <div className="space-y-1">
                              <Badge
                                tone={coord.totpConfigurado ? "success" : "warning"}
                                appearance="soft"
                                size="sm"
                                className="font-semibold gap-1"
                              >
                                {coord.totpConfigurado ? (
                                  <>
                                    <KeyRound className="size-3" /> Configurado
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="size-3" /> Sin TOTP
                                  </>
                                )}
                              </Badge>
                              {coord.recuperacionId08Autorizada && (
                                <div>
                                  <Badge tone="primary" appearance="outline" size="sm" className="text-[9px] h-4">
                                    Recuperación autorizada
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* 7. Estado Cuenta */}
                          <TableCell className="w-[130px] align-middle whitespace-nowrap">
                            <div className="flex flex-col items-start gap-1">
                              <Badge
                                tone={coord.estado === "ACTIVO" ? "success" : "danger"}
                                appearance="soft"
                                size="sm"
                                className="font-bold"
                              >
                                {coord.estado === "ACTIVO" ? "Activo" : "Suspendido"}
                              </Badge>
                              {hasSyncPending && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      tone="warning"
                                      appearance="solid"
                                      size="sm"
                                      className="font-bold gap-1 text-[9px] bg-warning text-white shadow-2xs cursor-help whitespace-nowrap"
                                    >
                                      <RefreshCw className="size-2.5 text-white shrink-0 animate-spin [animation-duration:3s]" />
                                      Sync pendiente
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    Cambio de cuenta pendiente de sincronización con Identity Platform
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>

                          {/* 8. Última actualización */}
                          <TableCell className="w-[130px] align-middle whitespace-nowrap">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start cursor-help">
                                  <span className="text-foreground font-semibold">
                                    {coord.ultimaActualizacion.split(" ")[0]}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {coord.ultimaActualizacion.split(" ")[1] || ""}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Última modificación: {coord.ultimaActualizacion}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 9. Acciones (Tooltips estandarizados e iconos del UI Kit) */}
                          <TableCell className="w-[140px] pr-6 text-right align-middle">
                            <div className="inline-flex items-center gap-0.5 justify-end w-full">
                              {/* Ver detalle */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    asChild
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Ver detalle de ${coord.nombreCompleto}`}
                                  >
                                    <Link href={`/coordinadores/${coord.id}`}>
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
                              </Tooltip>

                              {/* Corregir contacto y factor (ID-10) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleOpenContacto(coord)}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label={`Corregir contacto de ${coord.nombreCompleto}`}
                                  >
                                    <ShieldAlert className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Corregir contacto / factor</TooltipContent>
                              </Tooltip>

                              {/* Suspender o Reactivar (ID-11) */}
                              {coord.estado === "ACTIVO" ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      onClick={() => handleOpenSuspender(coord)}
                                      aria-label={`Suspender cuenta de ${coord.nombreCompleto}`}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                    >
                                      <AlertTriangle className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Suspender cuenta</TooltipContent>
                                </Tooltip>
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      onClick={() => handleOpenReactivar(coord)}
                                      aria-label={`Reactivar cuenta de ${coord.nombreCompleto}`}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Reactivar cuenta</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Reintentar sincronización si está pendiente */}
                              {hasSyncPending && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      onClick={() => handleReintentarSync(coord)}
                                      aria-label="Reintentar sincronización con Identity Platform"
                                      variant="warning"
                                      size="icon-sm"
                                      className="cursor-pointer shadow-2xs text-white bg-warning hover:bg-warning-600 animate-pulse"
                                    >
                                      <RefreshCw className="size-3.5 animate-spin [animation-duration:3s]" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Reintentar sincronización</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista Mobile Cards (<md) con Tarjeta Interactiva del UI Kit */}
            <div className="block md:hidden w-full space-y-3.5">
              {paginatedCoordinadores.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <Users className="size-8 stroke-[1.5] text-muted-foreground/60" />
                  <p className="text-sm font-semibold text-foreground">No se encontraron coordinadores</p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros de búsqueda o registra un nuevo coordinador.
                  </p>
                </div>
              ) : (
                paginatedCoordinadores.map((coord) => renderCoordinadorCard(coord))
              )}
            </div>
          </TooltipProvider>

          {/* Paginación idéntica a cuentas internas */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {filteredCoordinadores.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, filteredCoordinadores.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{filteredCoordinadores.length}</span> coordinadores
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

      {/* MODALES INTERACTIVOS */}
      <ActualizarContactoAccesoDialog
        open={dialogContactoOpen}
        onOpenChange={setDialogContactoOpen}
        coordinador={selectedCoord}
      />

      <SuspenderReactivarCoordinadorDialog
        open={dialogSuspenderOpen}
        onOpenChange={setDialogSuspenderOpen}
        coordinador={selectedCoord}
        mode="suspender"
      />

      <SuspenderReactivarCoordinadorDialog
        open={dialogReactivarOpen}
        onOpenChange={setDialogReactivarOpen}
        coordinador={selectedCoord}
        mode="reactivar"
      />
    </WireframeDashboardLayout>
  );
}
