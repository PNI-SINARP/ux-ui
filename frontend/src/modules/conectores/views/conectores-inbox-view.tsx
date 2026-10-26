"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { WireframeDashboardLayout, MockUser } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ShieldCheck,
  Ban,
  Activity,
  Layers,
  Sparkles,
  X,
  Server,
  Network,
  Wrench,
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  // Filtro
  const ESTADOS_OPCIONES = [
    { value: "ALL", label: "Todos los estados" },
    { value: "HABILITADO", label: "Habilitado (Producción)" },
    { value: "EN_PRUEBAS", label: "En pruebas (Laboratorio)" },
    { value: "RETIRADO", label: "Retirado / En transición" },
  ];

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_OPCIONES;
    return ESTADOS_OPCIONES.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase().trim())
    );
  }, [estadoSearch]);

  const conectoresFiltrados = useMemo(() => {
    return conectores.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.tipo.toLowerCase().includes(q) ||
        c.protocolo.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q);

      const matchesEstado = estadoFilter === "ALL" || c.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [conectores, searchTerm, estadoFilter]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(conectoresFiltrados.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedConectores = useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return conectoresFiltrados.slice(start, start + itemsPerPage);
  }, [conectoresFiltrados, safeCurrentPage, itemsPerPage]);

  const hasActiveFilters = searchTerm.trim() !== "" || estadoFilter !== "ALL";

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
                  Registra, configura, prueba y habilita los tipos de conectores necesarios para integrar las fuentes de datos institucionales.
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

            {/* KPI Cards Interactivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* Total Conectores */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => setEstadoFilter("ALL")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEstadoFilter("ALL");
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
                          : "bg-primary/10 text-primary group-hover:scale-105"
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
                onClick={() => setEstadoFilter("HABILITADO")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEstadoFilter("HABILITADO");
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
                          : "bg-success/15 text-success group-hover:scale-105"
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
                onClick={() => setEstadoFilter("EN_PRUEBAS")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEstadoFilter("EN_PRUEBAS");
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
                          : "bg-warning/15 text-warning group-hover:scale-105"
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
                onClick={() => setEstadoFilter("RETIRADO")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEstadoFilter("RETIRADO");
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
                          : "bg-danger/15 text-danger group-hover:scale-105"
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

            {/* Filtros y Búsqueda */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between w-full">
                {/* Search */}
                <div className="w-full xl:max-w-md">
                  <Search
                    size="sm"
                    placeholder="Buscar por conector, protocolo, motor, ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                    className="w-full"
                  />
                </div>

                {/* Combobox Estado */}
                <div className="w-full xl:w-[260px]">
                  <Combobox
                    value={estadoFilter === "ALL" ? null : estadoFilter}
                    onValueChange={(val) => setEstadoFilter(val || "ALL")}
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
              </div>

              {/* Filtros Activos */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Filtros activos:
                  </span>
                  {searchTerm.trim() !== "" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border"
                    >
                      <span>Búsqueda: &ldquo;{searchTerm}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                  {estadoFilter !== "ALL" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25"
                    >
                      <span>Estado: {ESTADOS_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}</span>
                      <button
                        type="button"
                        onClick={() => setEstadoFilter("ALL")}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Tabla de Conectores Reutilizables */}
            <div className="rounded-xl border border-border overflow-hidden bg-surface">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold text-foreground">Conector / Motor</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Versión & Driver</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Protocolo & Seguridad</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Fuentes en Uso</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Estado</TableHead>
                    <TableHead className="text-xs font-bold text-foreground">Última Prueba (CNX-02)</TableHead>
                    <TableHead className="text-xs font-bold text-foreground text-right w-[150px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedConectores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                        No se encontraron tipos de conectores con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedConectores.map((conector) => {
                      const test = conector.ultimaPrueba;
                      return (
                        <TableRow key={conector.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="align-top py-3.5">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                <Cpu className="size-3.5 text-primary" />
                                {conector.nombre}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span className="font-mono">{conector.id}</span>
                                <span>·</span>
                                <span className="font-semibold">{conector.tipo}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <div className="space-y-0.5 text-xs">
                              <span className="font-mono font-bold text-foreground">{conector.version}</span>
                              {conector.driverJar && (
                                <p className="text-[11px] font-mono text-muted-foreground truncate max-w-[160px]">
                                  {conector.driverJar}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <div className="space-y-0.5 text-xs">
                              <p className="text-foreground font-medium">{conector.protocolo}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {conector.tipoAutenticacion}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <Badge
                              tone={conector.fuentesAsociadasCount > 0 ? "neutral" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="font-mono font-semibold"
                            >
                              {conector.fuentesAsociadasCount} fuentes
                            </Badge>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
                            <Badge
                              tone={
                                conector.estado === "HABILITADO"
                                  ? "success"
                                  : conector.estado === "EN_PRUEBAS"
                                  ? "warning"
                                  : "danger"
                              }
                              appearance="soft"
                              size="sm"
                              className="font-semibold text-[11px]"
                            >
                              {conector.estado === "HABILITADO"
                                ? "Habilitado"
                                : conector.estado === "EN_PRUEBAS"
                                ? "En pruebas"
                                : "Retirado"}
                            </Badge>
                          </TableCell>

                          <TableCell className="align-top py-3.5">
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
                          <TableCell className="align-top py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Acción Principal: Probar Conector (CNX-02) */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    onClick={() => {
                                      setConectorParaProbar(conector);
                                      setIsProbarOpen(true);
                                    }}
                                    className="text-info hover:text-info hover:bg-info/10"
                                    aria-label="Probar conector en sandbox"
                                  >
                                    <Zap className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Probar conector en sandbox (CNX-02)
                                </TooltipContent>
                              </Tooltip>

                              {/* Habilitar directo si está en pruebas */}
                              {conector.estado === "EN_PRUEBAS" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => cambiarEstadoConector(conector.id, "HABILITADO")}
                                      className="text-success hover:text-success hover:bg-success/10"
                                      aria-label="Habilitar conector"
                                    >
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Habilitar en Catálogo (CNX-02)
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Menú Tres Puntos Horizontales (···) */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Opciones del conector"
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52">
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  Mostrando {paginatedConectores.length} de {conectoresFiltrados.length} tipos de conectores
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={cn(safeCurrentPage <= 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === safeCurrentPage}
                          onClick={() => setCurrentPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className={cn(safeCurrentPage >= totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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
