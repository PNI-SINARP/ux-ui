"use client";

import React, { useState, useMemo, useEffect } from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Inbox,
  ArrowUpDown,
  X,
  Eye,
  Lock,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

import {
  CasoRecuperacion,
  EstadoRecuperacion,
  TipoCuentaUsuario,
} from "../data/gestion-recuperaciones-types";
import { useGestionRecuperacionesStore } from "../data/gestion-recuperaciones-store";
import {
  RecuperacionStatusBadge,
  RecuperacionTipoCuentaBadge,
} from "../components/recuperacion-status-badge";
import { RecuperacionSimulatorToolbar } from "../components/recuperacion-simulator-toolbar";
import { AutorizarRecuperacionDialog } from "../components/autorizar-recuperacion-dialog";
import { DenegarRecuperacionDialog } from "../components/denegar-recuperacion-dialog";
import { GestionRecuperacionesDetailView } from "./gestion-recuperaciones-detail-view";

export function GestionRecuperacionesView() {
  const {
    casos,
    isLoaded,
    simulateIdpSyncFailure,
    setSimulateIdpSyncFailure,
    autorizarCaso,
    denegarCaso,
    adjuntarEvidencia,
    reintentarConciliacion,
    resetDemoData,
  } = useGestionRecuperacionesStore();

  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Estado del caso seleccionado para Ver Detalle
  const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);

  // Escuchar parámetro URL (?caso=REC-...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const casoParam = params.get("caso");
      if (casoParam) {
        setSelectedCasoId(casoParam);
      }
    }
  }, []);

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [filterTipoCuenta, setFilterTipoCuenta] = useState<string>("TODOS");
  const [tipoCuentaSearch, setTipoCuentaSearch] = useState("");
  const [filterKpi, setFilterKpi] = useState<"TODOS" | "PENDIENTES" | "AUTORIZADOS" | "DENEGADOS" | "CONCILIACION">("TODOS");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modales de acción rápida o desde simulador
  const [modalAutorizarOpen, setModalAutorizarOpen] = useState(false);
  const [modalDenegarOpen, setModalDenegarOpen] = useState(false);
  const [casoParaAccion, setCasoParaAccion] = useState<CasoRecuperacion | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Opciones de estados del caso (ID-08)
  const ESTADOS_OPCIONES = useMemo(
    () => [
      { value: "TODOS", label: "Todos los estados" },
      { value: "PENDIENTE", label: "Pendiente" },
      { value: "EN_VALIDACION", label: "En validación" },
      { value: "EN_CONCILIACION", label: "En conciliación" },
      { value: "COMPLETADO", label: "Completado" },
    ],
    []
  );

  // Opciones de tipos de cuenta (Exclusivos ID-08: Cuenta interna [ID-01] y Coordinador [ENR-04])
  const TIPOS_CUENTA_OPCIONES = useMemo(
    () => [
      { value: "TODOS", label: "Todos los tipos de cuenta" },
      { value: "CUENTA_INTERNA", label: "Cuenta interna" },
      { value: "COORDINADOR", label: "Coordinador" },
    ],
    []
  );

  const getEstadoLabel = (st: string) => {
    return ESTADOS_OPCIONES.find((e) => e.value === st)?.label || "Todos los estados";
  };

  const getTipoCuentaLabel = (tc: string) => {
    return TIPOS_CUENTA_OPCIONES.find((t) => t.value === tc)?.label || "Todos los tipos";
  };

  const handleSetFilterEstado = (st: string) => {
    setFilterEstado(st);
    setEstadoSearch(st === "TODOS" ? "" : getEstadoLabel(st));
    setFilterKpi("TODOS");
    setCurrentPage(1);
  };

  const handleSetFilterTipoCuenta = (tc: string) => {
    setFilterTipoCuenta(tc);
    setTipoCuentaSearch(tc === "TODOS" ? "" : getTipoCuentaLabel(tc));
    setCurrentPage(1);
  };

  const handleSetFilterKpi = (kpi: "PENDIENTES" | "AUTORIZADOS" | "DENEGADOS" | "CONCILIACION") => {
    if (filterKpi === kpi) {
      setFilterKpi("TODOS");
    } else {
      setFilterKpi(kpi);
      setFilterEstado("TODOS");
      setEstadoSearch("");
    }
    setCurrentPage(1);
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterEstado("TODOS");
    setEstadoSearch("");
    setFilterTipoCuenta("TODOS");
    setTipoCuentaSearch("");
    setFilterKpi("TODOS");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== "" ||
      filterEstado !== "TODOS" ||
      filterTipoCuenta !== "TODOS" ||
      filterKpi !== "TODOS"
  );

  // Cómputo de KPIs Superiores (ID-08)
  const kpis = useMemo(() => {
    return {
      total: casos.length,
      pendientes: casos.filter((c) => c.decision === "PENDIENTE" || c.estado === "PENDIENTE").length,
      autorizados: casos.filter((c) => c.decision === "AUTORIZADA").length,
      denegados: casos.filter((c) => c.decision === "DENEGADA").length,
      enConciliacion: casos.filter((c) => c.estado === "EN_CONCILIACION").length,
    };
  }, [casos]);

  // Filtrado de Casos
  const filteredCasos = useMemo(() => {
    return casos.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.cedula.toLowerCase().includes(q) ||
        c.usuarioNombre.toLowerCase().includes(q) ||
        c.usuarioCorreo.toLowerCase().includes(q) ||
        c.motivoLabel.toLowerCase().includes(q) ||
        c.operadorAsignado.toLowerCase().includes(q) ||
        c.cuentaRelacionada.toLowerCase().includes(q);

      const matchKpi =
        filterKpi === "TODOS"
          ? true
          : filterKpi === "PENDIENTES"
          ? c.decision === "PENDIENTE" || c.estado === "PENDIENTE"
          : filterKpi === "AUTORIZADOS"
          ? c.decision === "AUTORIZADA"
          : filterKpi === "DENEGADOS"
          ? c.decision === "DENEGADA"
          : filterKpi === "CONCILIACION"
          ? c.estado === "EN_CONCILIACION"
          : true;

      const matchEstado = filterEstado === "TODOS" || c.estado === filterEstado;
      const matchTipo = filterTipoCuenta === "TODOS" || c.tipoCuenta === filterTipoCuenta;

      return matchSearch && matchKpi && matchEstado && matchTipo;
    });
  }, [casos, searchQuery, filterKpi, filterEstado, filterTipoCuenta]);

  // Paginación
  const totalPages = Math.ceil(filteredCasos.length / pageSize) || 1;
  const paginatedCasos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCasos.slice(start, start + pageSize);
  }, [filteredCasos, currentPage, pageSize]);

  // Caso activo para vista detalle
  const activeDetailCaso = useMemo(() => {
    if (!selectedCasoId) return null;
    return casos.find((c) => c.id === selectedCasoId) || null;
  }, [casos, selectedCasoId]);

  // Acciones de Autorización y Denegación
  const handleAutorizarSubmit = (params: { observaciones: string; bloquearCanalAnterior: boolean }) => {
    const target = activeDetailCaso || casoParaAccion;
    if (!target) return;

    setIsProcessing(true);
    const res = autorizarCaso(target.id, {
      operador: currentUser.name,
      observaciones: params.observaciones,
      bloquearCanalAnterior: params.bloquearCanalAnterior,
    });
    setIsProcessing(false);
    setModalAutorizarOpen(false);

    if (res.ok) {
      toast.success("Recuperación autorizada", {
        description: `Referencia ${res.referencia}. Se invalidaron las sesiones activas y se inició el proceso seguro de recuperación.`,
      });
    } else {
      toast.error("Fallo de sincronización con Identity Platform", {
        description: res.error,
      });
    }
  };

  const handleDenegarSubmit = (params: { motivoDenegacion: string; mantenerBloqueoPreventivo: boolean }) => {
    const target = activeDetailCaso || casoParaAccion;
    if (!target) return;

    setIsProcessing(true);
    const res = denegarCaso(target.id, {
      operador: currentUser.name,
      motivoDenegacion: params.motivoDenegacion,
      mantenerBloqueoPreventivo: params.mantenerBloqueoPreventivo,
    });
    setIsProcessing(false);
    setModalDenegarOpen(false);

    if (res.ok) {
      toast.success("Denegación registrada", {
        description: `La resolución para el caso ${target.id} ha sido registrada en la auditoría. El acceso no será restablecido.`,
      });
    } else {
      toast.error("No se pudo registrar la denegación", { description: res.error });
    }
  };

  const handleSelectCaso = (id: string) => {
    setSelectedCasoId(id);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/gestion-recuperaciones?caso=${id}`);
    }
  };

  const handleBackFromDetail = () => {
    setSelectedCasoId(null);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/gestion-recuperaciones");
    }
  };

  // Breadcrumbs visuales según HU ID-08: Gestión de recuperaciones o Gestión de recuperaciones > Caso REC-XXXX
  const breadcrumbs = useMemo(() => {
    if (activeDetailCaso) {
      return [
        {
          label: "Gestión de recuperaciones",
          href: "/gestion-recuperaciones",
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            handleBackFromDetail();
          },
        },
        { label: `Caso ${activeDetailCaso.id}` },
      ];
    }
    return [
      { label: "Gestión de recuperaciones" },
    ];
  }, [activeDetailCaso]);

  return (
    <WireframeDashboardLayout
      activeMenu="gestion-recuperaciones"
      currentUser={currentUser}
      breadcrumbs={breadcrumbs}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Contenedor Principal con estilo visual idéntico a las vistas de Administración */}
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-3.5 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {activeDetailCaso ? (
            /* =========================================================================
               VISTA DE DETALLE DEL CASO SELECCIONADO
            ========================================================================= */
            <GestionRecuperacionesDetailView
              caso={activeDetailCaso}
              onBack={handleBackFromDetail}
              onAutorizar={(p) => handleAutorizarSubmit(p)}
              onDenegar={(p) => handleDenegarSubmit(p)}
              onUploadEvidencia={(archivo) => {
                adjuntarEvidencia(activeDetailCaso.id, {
                  ...archivo,
                  hashSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                });
              }}
              onReintentarConciliacion={() => {
                const res = reintentarConciliacion(activeDetailCaso.id, currentUser.name);
                if (res.ok) {
                  toast.success("Conciliación completada", {
                    description: "Sincronización IdP restablecida. Se emitió autorización formal.",
                  });
                } else {
                  toast.error("Reintento fallido", { description: res.error });
                }
              }}
              currentUser={currentUser.name}
            />
          ) : (
            /* =========================================================================
               BANDEJA DE CASOS DE GESTIÓN DE RECUPERACIONES (TABLA PRINCIPAL)
            ========================================================================= */
            <>
              {/* Encabezado Principal */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                      Gestión de recuperaciones
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                    Gestiona los casos de usuarios que perdieron acceso a su correo o segundo factor y requieren validación de identidad para recuperar su cuenta.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground font-medium">
                          <Lock className="size-3.5 text-primary" />
                          <span>Sin contraseñas temporales</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs text-xs">
                        Por protocolo de seguridad estricto, nunca se generan ni muestran contraseñas temporales. Se despacha enlace para re-vinculación de Google Authenticator.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Cards de Resumen Superiores (KPIs ID-08: 1 col mobile, 2 col tablet, 4 col desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
                {/* 1. Casos pendientes */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSetFilterKpi("PENDIENTES")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetFilterKpi("PENDIENTES");
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    filterKpi === "PENDIENTES"
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
                          filterKpi === "PENDIENTES"
                            ? "bg-warning text-white shadow-xs"
                            : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                        )}
                      >
                        <Clock className="size-5" />
                      </div>
                      <Badge tone="warning" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                        Pendientes
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">Casos pendientes</p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {kpis.pendientes}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 2. Autorizados */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSetFilterKpi("AUTORIZADOS")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetFilterKpi("AUTORIZADOS");
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    filterKpi === "AUTORIZADOS"
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
                          filterKpi === "AUTORIZADOS"
                            ? "bg-success text-white shadow-xs"
                            : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                        )}
                      >
                        <CheckCircle2 className="size-5" />
                      </div>
                      <Badge tone="success" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                        Autorizados
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">Autorizados</p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {kpis.autorizados}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 3. Denegados */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSetFilterKpi("DENEGADOS")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetFilterKpi("DENEGADOS");
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    filterKpi === "DENEGADOS"
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
                          filterKpi === "DENEGADOS"
                            ? "bg-danger text-white shadow-xs"
                            : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                        )}
                      >
                        <XCircle className="size-5" />
                      </div>
                      <Badge tone="danger" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                        Denegados
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">Denegados</p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {kpis.denegados}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 4. En conciliación */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSetFilterKpi("CONCILIACION")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetFilterKpi("CONCILIACION");
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    filterKpi === "CONCILIACION"
                      ? "bg-warning/20 border-warning ring-2 ring-warning/50 shadow-xs"
                      : "bg-warning/5 hover:bg-warning/10 border-warning/30 shadow-2xs"
                  )}
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                          filterKpi === "CONCILIACION"
                            ? "bg-warning text-white shadow-xs"
                            : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                        )}
                      >
                        <AlertTriangle className="size-5" />
                      </div>
                      <Badge tone="warning" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                        En conciliación
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">En conciliación</p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {kpis.enConciliacion}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Filtros de Búsqueda y Comboboxes */}
              <div className="space-y-3 w-full">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
                  {/* Buscador General */}
                  <div className="relative w-full lg:flex-1 min-w-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Buscar por ID, cédula, nombre, correo, motivo..."
                      className="pl-10 pr-9 h-9 text-xs rounded-xl bg-background border-border w-full"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtros Combobox (apilados debajo en mobile con w-full) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
                    {/* Combobox Filtro Estado */}
                    <div className="w-full sm:w-[220px]">
                      <Combobox
                        value={filterEstado === "TODOS" ? null : filterEstado}
                        onValueChange={(val) => handleSetFilterEstado(val || "TODOS")}
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
                        <ComboboxContent className="min-w-[240px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                              {ESTADOS_OPCIONES.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs py-1.5 cursor-pointer"
                                >
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    {/* Combobox Filtro Tipo Cuenta (Ancho generoso para mostrarse completo sin truncar) */}
                    <div className="w-full sm:w-[260px]">
                      <Combobox
                        value={filterTipoCuenta === "TODOS" ? null : filterTipoCuenta}
                        onValueChange={(val) => handleSetFilterTipoCuenta(val || "TODOS")}
                        inputValue={tipoCuentaSearch}
                        onInputValueChange={(newSearch) => {
                          const opt = TIPOS_CUENTA_OPCIONES.find((t) => t.value === newSearch);
                          if (opt) setTipoCuentaSearch(opt.label);
                          else if (newSearch === "TODOS") setTipoCuentaSearch("");
                          else setTipoCuentaSearch(newSearch);
                        }}
                      >
                        <ComboboxInput
                          size="sm"
                          placeholder="Todos los tipos de cuenta"
                          showClear={filterTipoCuenta !== "TODOS"}
                          showTrigger={true}
                          className="w-full"
                        />
                        <ComboboxContent className="min-w-[260px] z-[80]">
                          <ComboboxList>
                            <ComboboxGroup>
                              <ComboboxLabel>Filtrar por tipo de cuenta</ComboboxLabel>
                              {TIPOS_CUENTA_OPCIONES.map((opt) => (
                                <ComboboxItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-xs py-1.5 cursor-pointer"
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

                {/* Badges de Filtros Activos */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                    <span className="text-xs font-semibold text-muted-foreground mr-1">
                      Filtros activos:
                    </span>

                    {searchQuery.trim() !== "" && (
                      <Badge
                        tone="neutral"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border"
                      >
                        <span>Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setCurrentPage(1);
                          }}
                          className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer"
                          aria-label="Quitar filtro de búsqueda"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {filterKpi !== "TODOS" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25"
                      >
                        <span>
                          Filtro rápido:{" "}
                          {filterKpi === "PENDIENTES"
                            ? "Casos pendientes"
                            : filterKpi === "AUTORIZADOS"
                            ? "Autorizados"
                            : filterKpi === "DENEGADOS"
                            ? "Denegados"
                            : "En conciliación"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFilterKpi("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                          aria-label="Quitar filtro rápido"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {filterEstado !== "TODOS" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25"
                      >
                        <span>Estado: {getEstadoLabel(filterEstado)}</span>
                        <button
                          type="button"
                          onClick={() => handleSetFilterEstado("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                          aria-label="Quitar filtro de estado"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    )}

                    {filterTipoCuenta !== "TODOS" && (
                      <Badge
                        tone="primary"
                        appearance="soft"
                        className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25"
                      >
                        <span>Tipo: {getTipoCuentaLabel(filterTipoCuenta)}</span>
                        <button
                          type="button"
                          onClick={() => handleSetFilterTipoCuenta("TODOS")}
                          className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                          aria-label="Quitar filtro de tipo de cuenta"
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
                      <RotateCcw className="size-3 mr-1" />
                      <span>Limpiar filtros</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* TABLA PRINCIPAL DE CASOS (Desktop & Tablet) */}
              <TooltipProvider delayDuration={150}>
                <div className="hidden md:block w-full">
                  <Table
                    className="w-full min-w-[1380px]"
                    containerClassName="overflow-x-auto w-full [scrollbar-width:thin]"
                  >
                    <TableHeader>
                      <TableRow className="border-0">
                        <TableHead className="w-[130px] min-w-[125px] whitespace-nowrap text-left pl-6">
                          ID DEL CASO
                        </TableHead>
                        <TableHead className="w-[260px] min-w-[240px] whitespace-nowrap text-left">
                          USUARIO / CORREO
                        </TableHead>
                        <TableHead className="w-[125px] min-w-[120px] whitespace-nowrap text-left">
                          CÉDULA
                        </TableHead>
                        <TableHead className="w-[170px] min-w-[160px] whitespace-nowrap text-left">
                          TIPO DE CUENTA
                        </TableHead>
                        <TableHead className="w-[240px] min-w-[220px] whitespace-nowrap text-left">
                          MOTIVO
                        </TableHead>
                        <TableHead className="w-[160px] min-w-[150px] whitespace-nowrap text-left">
                          ESTADO
                        </TableHead>
                        <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-left">
                          FECHA
                        </TableHead>
                        <TableHead className="w-[170px] min-w-[160px] whitespace-nowrap text-left">
                          OPERADOR
                        </TableHead>
                        <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap text-right pr-6">
                          ACCIONES
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginatedCasos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Inbox className="size-8 stroke-[1.5] text-muted-foreground/60" />
                              <p className="text-sm font-semibold text-foreground">
                                No se encontraron casos de recuperación
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ajusta los filtros de búsqueda o restablece los casos de prueba.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedCasos.map((caso) => (
                          <TableRow key={caso.id} className="transition-colors hover:bg-muted/40">
                            {/* 1. ID del Caso */}
                            <TableCell className="w-[130px] min-w-[125px] text-left align-middle pl-6">
                              <div className="space-y-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleSelectCaso(caso.id)}
                                  className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer block text-left"
                                >
                                  {caso.id}
                                </button>
                                <span className="text-[10px] text-muted-foreground font-mono block">
                                  {caso.cuentaRelacionada}
                                </span>
                              </div>
                            </TableCell>

                            {/* 2. Usuario / Correo */}
                            <TableCell className="w-[260px] min-w-[240px] text-left align-middle">
                              <div className="space-y-0.5 min-w-0 pr-3">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => handleSelectCaso(caso.id)}
                                      className="text-xs font-bold text-foreground hover:text-primary transition-colors block text-left truncate cursor-pointer max-w-full"
                                    >
                                      {caso.usuarioNombre}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {caso.usuarioNombre} (clic para ver detalle)
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-[11px] text-muted-foreground font-mono block truncate">
                                      {caso.usuarioCorreo}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {caso.usuarioCorreo}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>

                            {/* 3. Cédula */}
                            <TableCell className="w-[125px] min-w-[120px] text-left align-middle">
                              <span className="font-mono text-xs font-bold text-foreground">
                                {caso.cedula}
                              </span>
                            </TableCell>

                            {/* 4. Tipo de cuenta */}
                            <TableCell className="w-[170px] min-w-[160px] text-left align-middle">
                              <RecuperacionTipoCuentaBadge tipo={caso.tipoCuenta} />
                            </TableCell>

                            {/* 5. Motivo */}
                            <TableCell className="w-[240px] min-w-[220px] text-left align-middle">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-foreground font-medium block truncate max-w-[230px] cursor-help">
                                    {caso.motivoLabel}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  {caso.motivoDescripcion}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* 6. Estado */}
                            <TableCell className="w-[160px] min-w-[150px] text-left align-middle">
                              <RecuperacionStatusBadge estado={caso.estado} decision={caso.decision} />
                            </TableCell>

                            {/* 7. Fecha */}
                            <TableCell className="w-[140px] min-w-[130px] text-left align-middle whitespace-nowrap">
                              <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start text-left">
                                <span className="text-foreground font-semibold">
                                  {caso.fechaSolicitud.split(" ")[0]}
                                </span>
                                <span className="text-[10px]">
                                  {caso.fechaSolicitud.split(" ")[1]}
                                </span>
                              </div>
                            </TableCell>

                            {/* 8. Operador */}
                            <TableCell className="w-[170px] min-w-[160px] text-left align-middle">
                              <span className="text-xs text-muted-foreground font-medium block truncate">
                                {caso.operadorAsignado}
                              </span>
                            </TableCell>

                            {/* 9. Columna Acciones con Ver detalle */}
                            <TableCell className="w-[110px] min-w-[100px] pr-6 text-right align-middle">
                              <div className="inline-flex items-center justify-end w-full">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleSelectCaso(caso.id)}
                                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      aria-label={`Ver detalle del caso ${caso.id}`}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Ver detalle del caso</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* VISTA MÓVIL EN CARDS (< md) */}
                <div className="md:hidden space-y-3 w-full">
                  {paginatedCasos.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-border rounded-xl">
                      <Inbox className="size-8 mx-auto text-muted-foreground/60 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-semibold text-foreground">
                        No se encontraron casos de recuperación
                      </p>
                    </div>
                  ) : (
                    paginatedCasos.map((caso) => (
                      <Card
                        key={caso.id}
                        size="sm"
                        className="rounded-xl border border-border bg-surface shadow-xs"
                        innerClassName="p-3.5 sm:p-4 gap-2.5"
                      >
                        {/* 1. ID del caso + Badge de estado */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2.5 w-full">
                          <span className="font-mono text-xs font-bold text-primary">
                            {caso.id}
                          </span>
                          <RecuperacionStatusBadge estado={caso.estado} decision={caso.decision} />
                        </div>

                        {/* 2. Nombre + correo (sin truncar agresivo, con wrap) */}
                        <div className="w-full space-y-0.5">
                          <p className="font-bold text-foreground text-sm leading-snug break-words">
                            {caso.usuarioNombre}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground break-all">
                            {caso.usuarioCorreo}
                          </p>
                        </div>

                        {/* 3. Cédula */}
                        <div className="flex flex-wrap items-center justify-between gap-1 w-full text-xs">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Cédula:
                          </span>
                          <span className="font-mono font-bold text-foreground text-xs">
                            {caso.cedula}
                          </span>
                        </div>

                        {/* 4. Tipo de cuenta */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5 w-full text-xs">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Tipo de cuenta:
                          </span>
                          <RecuperacionTipoCuentaBadge tipo={caso.tipoCuenta} />
                        </div>

                        {/* 5. Motivo (sin truncar agresivo, con wrap) */}
                        <div className="w-full space-y-1 text-xs pt-1 border-t border-border/50">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Motivo:
                          </span>
                          <p className="text-foreground text-xs font-medium leading-relaxed break-words">
                            {caso.motivoLabel}
                          </p>
                        </div>

                        {/* 6. Fecha */}
                        <div className="flex flex-wrap items-center justify-between gap-1 w-full text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          <span className="font-semibold text-muted-foreground">Fecha:</span>
                          <span className="font-mono text-foreground font-medium">
                            {caso.fechaSolicitud}
                          </span>
                        </div>

                        {/* 7. Ver detalle (ancho completo en mobile) */}
                        <div className="w-full pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectCaso(caso.id)}
                            className="w-full h-8 text-xs font-semibold rounded-xl justify-center shadow-2xs"
                          >
                            <Eye className="size-3.5 mr-1.5 text-primary" />
                            <span>Ver detalle</span>
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TooltipProvider>

              {/* Pie de Tabla: Paginación y Selector de Filas (idéntico a /cuentas-internas) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/80">
                <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
                  <p className="text-xs text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {filteredCasos.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * pageSize, filteredCasos.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">
                      {filteredCasos.length}
                    </span>{" "}
                    casos
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
            </>
          )}
        </Card>
      </main>

      {/* Simulador Flotante HU ID-08 */}
      <RecuperacionSimulatorToolbar
        onToggleSyncError={() => setSimulateIdpSyncFailure(!simulateIdpSyncFailure)}
        isSyncErrorActive={simulateIdpSyncFailure}
        onSimulateTriggerAutorizar={() => {
          const pendiente = casos.find((c) => c.decision === "PENDIENTE" || c.estado === "PENDIENTE") || casos[0];
          setCasoParaAccion(pendiente);
          setModalAutorizarOpen(true);
        }}
        onSimulateTriggerDenegar={() => {
          const pendiente = casos.find((c) => c.decision === "PENDIENTE" || c.estado === "PENDIENTE") || casos[0];
          setCasoParaAccion(pendiente);
          setModalDenegarOpen(true);
        }}
        onResetDemo={() => {
          resetDemoData();
          toast.info("Datos de simulación restablecidos", {
            description: "Los casos mock de recuperación HU ID-08 han retornado a su estado inicial.",
          });
        }}
        hasSelectedCaso={Boolean(activeDetailCaso)}
        currentCasoEstado={activeDetailCaso?.estado}
      />

      {/* Modales de Confirmación invocados desde el Simulador Flotante */}
      {casoParaAccion && (
        <>
          <AutorizarRecuperacionDialog
            open={modalAutorizarOpen}
            onOpenChange={setModalAutorizarOpen}
            caso={casoParaAccion}
            onConfirm={handleAutorizarSubmit}
            isLoading={isProcessing}
          />

          <DenegarRecuperacionDialog
            open={modalDenegarOpen}
            onOpenChange={setModalDenegarOpen}
            caso={casoParaAccion}
            onConfirm={handleDenegarSubmit}
            isLoading={isProcessing}
          />
        </>
      )}
    </WireframeDashboardLayout>
  );
}

export const RecuperacionAccesoView = GestionRecuperacionesView;

