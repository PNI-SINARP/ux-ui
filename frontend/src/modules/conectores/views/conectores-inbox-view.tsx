"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { WireframeDashboardLayout, MockUser } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Cpu,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  MoreHorizontal,
  Ban,
  Activity,
  Layers,
  X,
  Server,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { useConectoresStore, ConectorDefinicion, EstadoConector } from "../data/conectores-store";
import { RegistrarConectorDialog } from "../components/registrar-conector-dialog";
import { ProbarConectorDialog } from "../components/probar-conector-dialog";
import { RetirarConectorDialog } from "../components/retirar-conector-dialog";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

interface ConectoresInboxViewProps {
  currentUser?: MockUser;
}

export function ConectoresInboxView({ currentUser: propUser }: ConectoresInboxViewProps) {
  const { activeUser } = useAuthStore();
  const currentUser = propUser || (activeUser ? {
    id: activeUser.id,
    name: activeUser.name,
    role: activeUser.role,
    roleTitle: activeUser.roleTitle,
    institution: activeUser.institution,
  } : {
    id: "USR-008",
    name: "Carlos Mena",
    role: "TI" as const,
    roleTitle: "Ingeniero de Infraestructura y Conectores",
    institution: "DINARP - Dirección de TI",
  });

  const { conectores, isLoaded, cambiarEstadoConector } = useConectoresStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("ALL");
  const [tipoSearch, setTipoSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Modales
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [conectorParaProbar, setConectorParaProbar] = useState<ConectorDefinicion | null>(null);
  const [isProbarOpen, setIsProbarOpen] = useState(false);
  const [conectorParaRetirar, setConectorParaRetirar] = useState<ConectorDefinicion | null>(null);
  const [isRetirarOpen, setIsRetirarOpen] = useState(false);

  // Verificación de rol autorizado (TI, DTD, ADMIN)
  const isAuthorizedRole =
    currentUser?.role === "TI" ||
    currentUser?.role === "DTD" ||
    currentUser?.role === "ADMIN";

  // KPIs
  const stats = useMemo(() => {
    const total = conectores.length;
    const habilitados = conectores.filter((c) => c.estado === "HABILITADO").length;
    const enPruebas = conectores.filter((c) => c.estado === "EN_PRUEBAS").length;
    const retirados = conectores.filter((c) => c.estado === "RETIRADO").length;
    return { total, habilitados, enPruebas, retirados };
  }, [conectores]);

  // Filtro de Estados
  const ESTADOS_OPCIONES = useMemo(
    () => [
      { value: "ALL", label: "Todos los estados" },
      { value: "HABILITADO", label: "Habilitado (Producción)" },
      { value: "EN_PRUEBAS", label: "En pruebas (Laboratorio)" },
      { value: "RETIRADO", label: "Retirado / En transición" },
    ],
    []
  );

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_OPCIONES;
    return ESTADOS_OPCIONES.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase().trim())
    );
  }, [estadoSearch, ESTADOS_OPCIONES]);

  // Lista única de Tipos / Motores
  const tiposDisponibles = useMemo(() => {
    const set = new Set<string>();
    conectores.forEach((c) => {
      if (c.tipo) set.add(c.tipo);
    });
    return Array.from(set).sort();
  }, [conectores]);

  const TIPOS_OPCIONES = useMemo(() => {
    return [
      { value: "ALL", label: "Todos los tipos / motores" },
      ...tiposDisponibles.map((t) => ({ value: t, label: t })),
    ];
  }, [tiposDisponibles]);

  const filteredTiposForFilter = useMemo(() => {
    if (!tipoSearch.trim()) return TIPOS_OPCIONES;
    return TIPOS_OPCIONES.filter((t) =>
      t.label.toLowerCase().includes(tipoSearch.toLowerCase().trim())
    );
  }, [tipoSearch, TIPOS_OPCIONES]);

  // Filtrado
  const conectoresFiltrados = useMemo(() => {
    return conectores.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.tipo.toLowerCase().includes(q) ||
        c.protocolo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q) ||
        (c.driverJar && c.driverJar.toLowerCase().includes(q));

      const matchesEstado = estadoFilter === "ALL" || c.estado === estadoFilter;
      const matchesTipo = tipoFilter === "ALL" || c.tipo === tipoFilter;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [conectores, searchTerm, estadoFilter, tipoFilter]);

  // Paginación segura
  const totalPages = Math.max(1, Math.ceil(conectoresFiltrados.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedConectores = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return conectoresFiltrados.slice(start, start + pageSize);
  }, [conectoresFiltrados, safeCurrentPage, pageSize]);

  const hasActiveFilters =
    searchTerm.trim() !== "" || estadoFilter !== "ALL" || tipoFilter !== "ALL";

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setEstadoFilter("ALL");
    setEstadoSearch("");
    setTipoFilter("ALL");
    setTipoSearch("");
    setCurrentPage(1);
  };

  const handleSetEstadoFilter = (nuevo: string) => {
    setEstadoFilter(nuevo);
    setCurrentPage(1);
  };

  const handleSetTipoFilter = (nuevo: string) => {
    setTipoFilter(nuevo);
    setCurrentPage(1);
  };

  const getEstadoBadge = (estado: EstadoConector) => {
    switch (estado) {
      case "HABILITADO":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Habilitado
          </Badge>
        );
      case "EN_PRUEBAS":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            En pruebas
          </Badge>
        );
      case "RETIRADO":
        return (
          <Badge
            tone="danger"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Retirado
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            {estado}
          </Badge>
        );
    }
  };

  if (!isAuthorizedRole) {
    return (
      <WireframeDashboardLayout
        activeMenu="tecnologia-conectores"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Gestión de conectores", href: "/tecnologia/conectores" },
          { label: "Acceso no autorizado" },
        ]}
      >
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 items-center justify-center p-8 text-center space-y-4"
          >
            <div className="p-4 bg-danger/10 text-danger rounded-2xl">
              <Ban className="size-12 mx-auto" />
            </div>
            <h2 className="font-heading font-bold text-xl text-foreground">
              Acceso restringido a Tecnología (TI)
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
              Esta pantalla corresponde a la gestión de tipos de conectores reutilizables (CNX-01 / CNX-02).
              Tu rol actual ({currentUser?.roleTitle || currentUser?.role}) no tiene facultades de administración de infraestructura.
            </p>
            <Button asChild variant="primary" size="sm">
              <Link href={currentUser?.role === "COORDINADOR_SINARP" ? "/proveedor/fuentes" : "/gestion/fuentes"}>
                Ir a mi módulo asignado
              </Link>
            </Button>
          </Card>
        </main>
      </WireframeDashboardLayout>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <WireframeDashboardLayout
        activeMenu="tecnologia-conectores"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Gestión de conectores", href: "/tecnologia/conectores" },
        ]}
      >
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* Header del Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Cpu className="size-6 text-primary shrink-0" />
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    Gestión de conectores
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Registra, configura, prueba y habilita los tipos de conectores necesarios para integrar las fuentes de datos institucionales (CNX-01 / CNX-02).
                </p>
              </div>

              {/* Botón Registrar Nuevo Conector (CNX-01) */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsRegistrarOpen(true)}
                  className="gap-1.5 shadow-xs"
                >
                  <Plus className="size-4" />
                  Registrar tipo de conector
                </Button>
              </div>
            </div>

            {/* KPI Cards Interactivas (Estilo Cuentas Internas / Fuentes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* Total Conectores */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => handleSetEstadoFilter("ALL")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetEstadoFilter("ALL");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  estadoFilter === "ALL"
                    ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                    : "bg-surface border-border hover:bg-muted/40 shadow-2xs"
                )}
                innerClassName="p-0 h-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        estadoFilter === "ALL"
                          ? "bg-primary text-white shadow-xs"
                          : "bg-primary/10 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                      )}
                    >
                      <Layers className="size-5" />
                    </div>
                    <Badge tone="neutral" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                      Catálogo CNX-01
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">Total Conectores</p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Habilitados */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => handleSetEstadoFilter(estadoFilter === "HABILITADO" ? "ALL" : "HABILITADO")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetEstadoFilter(estadoFilter === "HABILITADO" ? "ALL" : "HABILITADO");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  estadoFilter === "HABILITADO"
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
                        estadoFilter === "HABILITADO"
                          ? "bg-success text-white shadow-xs"
                          : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                      )}
                    >
                      <CheckCircle2 className="size-5" />
                    </div>
                    <Badge tone="success" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                      En Producción
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">Habilitados</p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {stats.habilitados}
                    </p>
                  </div>
                </div>
              </Card>

              {/* En Pruebas */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => handleSetEstadoFilter(estadoFilter === "EN_PRUEBAS" ? "ALL" : "EN_PRUEBAS")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetEstadoFilter(estadoFilter === "EN_PRUEBAS" ? "ALL" : "EN_PRUEBAS");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  estadoFilter === "EN_PRUEBAS"
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
                        estadoFilter === "EN_PRUEBAS"
                          ? "bg-warning text-white shadow-xs"
                          : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                      )}
                    >
                      <Clock className="size-5" />
                    </div>
                    <Badge tone="warning" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                      Sandbox Lab
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">En Pruebas</p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {stats.enPruebas}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Retirados */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => handleSetEstadoFilter(estadoFilter === "RETIRADO" ? "ALL" : "RETIRADO")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetEstadoFilter(estadoFilter === "RETIRADO" ? "ALL" : "RETIRADO");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  estadoFilter === "RETIRADO"
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
                        estadoFilter === "RETIRADO"
                          ? "bg-danger text-white shadow-xs"
                          : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                      )}
                    >
                      <AlertTriangle className="size-5" />
                    </div>
                    <Badge tone="danger" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold px-2 py-0.5">
                      Inhabilitados
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">Retirados</p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {stats.retirados}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filtros y Búsqueda con UI Kit Oficial (Estilo Cuentas Internas) */}
            <div className="space-y-3 w-full">
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
                {/* Buscador UI Kit */}
                <div className="flex-1 min-w-0">
                  <Search
                    size="sm"
                    placeholder="Buscar por conector, protocolo, motor, ID o driver..."
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

                {/* Filtros Combobox UI Kit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full xl:w-auto shrink-0">
                  {/* Filtro Estado */}
                  <div className="w-full xl:w-[240px] min-w-0">
                    <Combobox
                      value={estadoFilter === "ALL" ? null : estadoFilter}
                      onValueChange={(val) => {
                        handleSetEstadoFilter(val || "ALL");
                      }}
                      inputValue={estadoSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = ESTADOS_OPCIONES.find(
                          (e) =>
                            e.value.toLowerCase() === newSearch.toLowerCase() ||
                            e.label.toLowerCase() === newSearch.toLowerCase()
                        );
                        if (opt) setEstadoSearch(opt.label);
                        else if (newSearch === "ALL") setEstadoSearch("");
                        else setEstadoSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todos los estados"
                        showClear={estadoFilter !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[260px] z-[80]">
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

                  {/* Filtro Tipo / Motor */}
                  <div className="w-full xl:w-[220px] min-w-0">
                    <Combobox
                      value={tipoFilter === "ALL" ? null : tipoFilter}
                      onValueChange={(val) => {
                        handleSetTipoFilter(val || "ALL");
                      }}
                      inputValue={tipoSearch}
                      onInputValueChange={(newSearch) => {
                        const opt = TIPOS_OPCIONES.find(
                          (t) =>
                            t.value.toLowerCase() === newSearch.toLowerCase() ||
                            t.label.toLowerCase() === newSearch.toLowerCase()
                        );
                        if (opt) setTipoSearch(opt.label);
                        else if (newSearch === "ALL") setTipoSearch("");
                        else setTipoSearch(newSearch);
                      }}
                    >
                      <ComboboxInput
                        size="sm"
                        placeholder="Todos los motores"
                        showClear={tipoFilter !== "ALL"}
                        showTrigger={true}
                        className="w-full"
                      />
                      <ComboboxContent className="min-w-[240px] z-[80]">
                        <ComboboxList>
                          <ComboboxGroup>
                            <ComboboxLabel>Filtrar por motor / tipo</ComboboxLabel>
                            {filteredTiposForFilter.map((opt) => (
                              <ComboboxItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs py-1.5 cursor-pointer"
                              >
                                {opt.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                          {filteredTiposForFilter.length === 0 && (
                            <ComboboxEmpty>No se encontraron tipos.</ComboboxEmpty>
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

                  {estadoFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                            Estado: {ESTADOS_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                          Estado: {ESTADOS_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                        </TooltipContent>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => handleSetEstadoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de estado"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {tipoFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                            Motor: {tipoFilter}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                          Motor: {tipoFilter}
                        </TooltipContent>
                      </Tooltip>
                      <button
                        type="button"
                        onClick={() => handleSetTipoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de motor"
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

            {/* Tabla de Conectores Reutilizables (Desktop) */}
            <div className="hidden md:block w-full">
              <Table className="w-full" containerClassName="overflow-x-auto w-full">
                <TableHeader>
                  <TableRow className="border-0">
                    <TableHead className="w-[125px] min-w-[120px] text-xs font-bold text-white pl-6">
                      ID / CÓDIGO
                    </TableHead>
                    <TableHead className="min-w-[240px] text-xs font-bold text-white">
                      CONECTOR / MOTOR
                    </TableHead>
                    <TableHead className="w-[170px] min-w-[160px] text-xs font-bold text-white">
                      VERSIÓN & DRIVER
                    </TableHead>
                    <TableHead className="w-[210px] min-w-[200px] text-xs font-bold text-white">
                      PROTOCOLO & SEGURIDAD
                    </TableHead>
                    <TableHead className="w-[120px] min-w-[110px] text-xs font-bold text-white text-center">
                      FUENTES EN USO
                    </TableHead>
                    <TableHead className="w-[130px] min-w-[120px] text-xs font-bold text-white">
                      ESTADO
                    </TableHead>
                    <TableHead className="w-[170px] min-w-[160px] text-xs font-bold text-white">
                      ÚLTIMA PRUEBA (CNX-02)
                    </TableHead>
                    <TableHead className="w-[130px] min-w-[120px] text-right text-xs font-bold text-white pr-6">
                      ACCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoaded ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                        Cargando conectores de interoperabilidad...
                      </TableCell>
                    </TableRow>
                  ) : paginatedConectores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center space-y-2">
                        <Cpu className="size-8 text-muted-foreground/40 mx-auto" />
                        <p className="text-xs font-medium text-foreground">
                          No se encontraron tipos de conectores
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Ajusta los filtros de búsqueda o registra un nuevo tipo de conector institucional.
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedConectores.map((conector) => {
                      const test = conector.ultimaPrueba;
                      return (
                        <TableRow key={conector.id} className="transition-colors hover:bg-muted/40">
                          {/* ID / Código */}
                          <TableCell className="w-[125px] min-w-[120px] text-left align-middle pl-6">
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-bold text-primary block">
                                {conector.id}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono block">
                                {conector.codigo}
                              </span>
                            </div>
                          </TableCell>

                          {/* Conector / Motor */}
                          <TableCell className="min-w-[240px] text-left align-middle">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Cpu className="size-3.5 text-primary shrink-0" />
                                <span className="truncate">{conector.nombre}</span>
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span className="font-semibold text-foreground/80">{conector.tipo}</span>
                                <span>·</span>
                                <span className="line-clamp-1 max-w-[220px]" title={conector.descripcion}>
                                  {conector.descripcion}
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* Versión & Driver */}
                          <TableCell className="w-[170px] min-w-[160px] text-left align-middle">
                            <div className="space-y-0.5 text-xs">
                              <span className="font-mono font-bold text-foreground">
                                {conector.version}
                              </span>
                              {conector.driverJar ? (
                                <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[150px]" title={conector.driverJar}>
                                  {conector.driverJar}
                                </p>
                              ) : (
                                <p className="text-[11px] text-muted-foreground italic">Driver nativo</p>
                              )}
                            </div>
                          </TableCell>

                          {/* Protocolo & Seguridad */}
                          <TableCell className="w-[210px] min-w-[200px] text-left align-middle">
                            <div className="space-y-0.5 text-xs">
                              <p className="text-foreground font-medium truncate" title={conector.protocolo}>
                                {conector.protocolo}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate" title={conector.tipoAutenticacion}>
                                {conector.tipoAutenticacion}
                              </p>
                            </div>
                          </TableCell>

                          {/* Fuentes en uso */}
                          <TableCell className="w-[120px] min-w-[110px] text-center align-middle">
                            <Badge
                              tone={conector.fuentesAsociadasCount > 0 ? "neutral" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="font-mono font-semibold"
                            >
                              {conector.fuentesAsociadasCount} {conector.fuentesAsociadasCount === 1 ? "fuente" : "fuentes"}
                            </Badge>
                          </TableCell>

                          {/* Estado */}
                          <TableCell className="w-[130px] min-w-[120px] text-left align-middle">
                            {getEstadoBadge(conector.estado)}
                          </TableCell>

                          {/* Última Prueba (CNX-02) */}
                          <TableCell className="w-[170px] min-w-[160px] text-left align-middle">
                            {test ? (
                              <div className="space-y-0.5 text-xs">
                                <div className="flex items-center gap-1.5 font-medium">
                                  {test.resultado === "EXITOSO" ? (
                                    <span className="text-success flex items-center gap-1">
                                      <CheckCircle2 className="size-3.5" />
                                      {test.latenciaMs}ms
                                    </span>
                                  ) : (
                                    <span className="text-danger flex items-center gap-1">
                                      <AlertTriangle className="size-3.5" />
                                      Fallido
                                    </span>
                                  )}
                                  <span className="text-[11px] text-muted-foreground font-mono">
                                    {test.fecha.split(" ")[0]}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground italic">
                                Sin pruebas registradas
                              </span>
                            )}
                          </TableCell>

                          {/* Acciones */}
                          <TableCell className="w-[130px] min-w-[120px] pr-6 text-right align-middle">
                            <div className="inline-flex items-center gap-1 justify-end w-full">
                              {/* 1. Probar Conector (CNX-02) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setConectorParaProbar(conector);
                                      setIsProbarOpen(true);
                                    }}
                                    className="text-info hover:text-info hover:bg-info/10 cursor-pointer"
                                    aria-label={`Probar ${conector.nombre} en sandbox`}
                                  >
                                    <Zap className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Probar conector (CNX-02)</TooltipContent>
                              </Tooltip>

                              {/* 2. Habilitar directo si está en pruebas */}
                              {conector.estado === "EN_PRUEBAS" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => cambiarEstadoConector(conector.id, "HABILITADO")}
                                      className="text-success hover:text-success hover:bg-success/10 cursor-pointer"
                                      aria-label={`Habilitar ${conector.nombre}`}
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Habilitar en Catálogo</TooltipContent>
                                </Tooltip>
                              )}

                              {/* 3. Menú contextual Tres Puntos (···) */}
                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                                        aria-label={`Más opciones para ${conector.nombre}`}
                                      >
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Más opciones</TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setConectorParaProbar(conector);
                                      setIsProbarOpen(true);
                                    }}
                                    className="gap-2 text-xs cursor-pointer"
                                  >
                                    <Activity className="size-3.5 text-info" />
                                    <span>Ejecutar diagnóstico técnico</span>
                                  </DropdownMenuItem>

                                  {conector.estado !== "HABILITADO" && (
                                    <DropdownMenuItem
                                      onClick={() => cambiarEstadoConector(conector.id, "HABILITADO")}
                                      className="gap-2 text-xs cursor-pointer text-success"
                                    >
                                      <CheckCircle2 className="size-3.5" />
                                      <span>Habilitar para fuentes</span>
                                    </DropdownMenuItem>
                                  )}

                                  {conector.estado !== "EN_PRUEBAS" && (
                                    <DropdownMenuItem
                                      onClick={() => cambiarEstadoConector(conector.id, "EN_PRUEBAS")}
                                      className="gap-2 text-xs cursor-pointer text-warning"
                                    >
                                      <Clock className="size-3.5" />
                                      <span>Poner en pruebas sandbox</span>
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    onClick={() => {
                                      setConectorParaRetirar(conector);
                                      setIsRetirarOpen(true);
                                    }}
                                    className="gap-2 text-xs cursor-pointer text-danger focus:text-danger"
                                  >
                                    <Ban className="size-3.5" />
                                    <span>Retirar o suspender (CNX-02)</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards Layout (<md) */}
            <div className="block md:hidden w-full space-y-3.5">
              {!isLoaded ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Cargando conectores...</p>
                </div>
              ) : paginatedConectores.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                  <Cpu className="size-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-semibold text-foreground">No se encontraron conectores</p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta los filtros o registra un nuevo tipo de conector.
                  </p>
                </div>
              ) : (
                paginatedConectores.map((conector) => {
                  const test = conector.ultimaPrueba;
                  return (
                    <Card
                      key={conector.id}
                      className="p-4 bg-surface border border-border rounded-xl space-y-3 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-primary block">
                            {conector.id} · {conector.codigo}
                          </span>
                          <h3 className="text-sm font-bold text-foreground">
                            {conector.nombre}
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium">
                            Motor: {conector.tipo} · Versión: {conector.version}
                          </p>
                        </div>
                        <div>{getEstadoBadge(conector.estado)}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Protocolo:</span>
                          <span className="font-mono text-[11px] text-foreground truncate block">
                            {conector.protocolo}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-medium">Fuentes en uso:</span>
                          <span className="font-mono text-[11px] text-foreground block">
                            {conector.fuentesAsociadasCount} fuentes
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                        <div className="text-[11px] text-muted-foreground">
                          {test ? (
                            <span className={test.resultado === "EXITOSO" ? "text-success font-medium" : "text-danger font-medium"}>
                              Test: {test.latenciaMs}ms ({test.fecha.split(" ")[0]})
                            </span>
                          ) : (
                            <span className="italic">Sin pruebas</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setConectorParaProbar(conector);
                              setIsProbarOpen(true);
                            }}
                            className="text-info hover:text-info hover:bg-info/10 cursor-pointer"
                            aria-label={`Probar conector ${conector.nombre}`}
                          >
                            <Zap className="size-4" />
                          </Button>

                          {conector.estado === "EN_PRUEBAS" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => cambiarEstadoConector(conector.id, "HABILITADO")}
                              className="text-success hover:text-success hover:bg-success/10 cursor-pointer"
                              aria-label={`Habilitar conector ${conector.nombre}`}
                            >
                              <CheckCircle2 className="size-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setConectorParaRetirar(conector);
                              setIsRetirarOpen(true);
                            }}
                            className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
                            aria-label={`Retirar conector ${conector.nombre}`}
                          >
                            <Ban className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Paginación Estandarizada (Estilo Cuentas Internas / Fuentes) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
              <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
                <p className="text-xs text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">
                    {conectoresFiltrados.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
                  </span>{" "}
                  a{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(safeCurrentPage * pageSize, conectoresFiltrados.length)}
                  </span>{" "}
                  de <span className="font-semibold text-foreground">{conectoresFiltrados.length}</span> tipos de conectores
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
                        className={cn(safeCurrentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={cn(safeCurrentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={page === safeCurrentPage}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (
                        (page === safeCurrentPage - 2 && page > 1) ||
                        (page === safeCurrentPage + 2 && page < totalPages)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={cn(safeCurrentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLast
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(safeCurrentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </Card>
        </main>

        {/* Modales CNX-01 / CNX-02 */}
        <RegistrarConectorDialog
          open={isRegistrarOpen}
          onOpenChange={setIsRegistrarOpen}
          currentUser={currentUser}
        />

        <ProbarConectorDialog
          open={isProbarOpen}
          onOpenChange={setIsProbarOpen}
          conector={conectorParaProbar}
        />

        <RetirarConectorDialog
          open={isRetirarOpen}
          onOpenChange={setIsRetirarOpen}
          conector={conectorParaRetirar}
        />
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
