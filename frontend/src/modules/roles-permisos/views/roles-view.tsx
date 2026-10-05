"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldPlus,
  ShieldCheck,
  Ban,
  Users,
  Clock,
  RotateCcw,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  X,
  Layers,
  Lock,
} from "lucide-react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
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
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  Rol,
  EstadoRol,
  useRolesStore,
} from "@/modules/roles-permisos/data/roles-store";
import { CrearRolModal } from "@/modules/roles-permisos/components/crear-rol-modal";
import { EditarRolModal } from "@/modules/roles-permisos/components/editar-rol-modal";
import { ImpactoRolDialog } from "@/modules/roles-permisos/components/impacto-rol-dialog";
import {
  AccionRolDialog,
  TipoAccionRol,
} from "@/modules/roles-permisos/components/accion-rol-dialog";
import { RolDetailView } from "./rol-detail-view";

interface RolesViewProps {
  initialSelectedId?: string | null;
}

export function RolesView({ initialSelectedId = null }: RolesViewProps) {
  const { roles } = useRolesStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Navegación a Detalle
  const [selectedRolId, setSelectedRolId] = useState<string | null>(initialSelectedId);

  // Escuchar parámetros de URL para navegación directa a detalle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id");
      if (urlId) {
        setSelectedRolId(urlId);
      }
    }
  }, []);

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");

  // Modales
  const [crearModalOpen, setCrearModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [impactoRol, setImpactoRol] = useState<Rol | null>(null);
  const [impactoModalOpen, setImpactoModalOpen] = useState(false);
  const [accionRol, setAccionRol] = useState<Rol | null>(null);
  const [accionTipo, setAccionTipo] = useState<TipoAccionRol | null>(null);
  const [accionModalOpen, setAccionModalOpen] = useState(false);

  // Estados filtrados para Combobox
  const ESTADOS_OPCIONES = useMemo(
    () => [
      { value: "TODOS", label: "Todos los estados" },
      { value: "Activo", label: "Activo" },
      { value: "Borrador", label: "Borrador" },
      { value: "Inactivo", label: "Inactivo (Baja lógica)" },
    ],
    []
  );

  const getEstadoLabel = (st: string) => {
    switch (st) {
      case "Activo":
        return "Activo";
      case "Borrador":
        return "Borrador";
      case "Inactivo":
        return "Inactivo (Baja lógica)";
      default:
        return "Todos los estados";
    }
  };

  const handleSetFilterEstado = (nuevoEstado: string) => {
    setFilterEstado(nuevoEstado);
    setEstadoSearch(nuevoEstado === "TODOS" ? "" : getEstadoLabel(nuevoEstado));
  };

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setFilterEstado("TODOS");
    setEstadoSearch("");
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== "" || filterEstado !== "TODOS"
  );

  // KPIs de Resumen
  const kpis = useMemo(() => {
    return {
      activos: roles.filter((r) => r.estado === "Activo").length,
      borradores: roles.filter((r) => r.estado === "Borrador").length,
      inactivos: roles.filter((r) => r.estado === "Inactivo").length,
      totalCuentasAsociadas: roles.reduce((acc, r) => acc + r.cuentasAsociadas, 0),
    };
  }, [roles]);

  // Filtrado de la tabla
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.codigo.toLowerCase().includes(q) ||
        r.nombre.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.version.toLowerCase().includes(q);

      const matchEstado =
        filterEstado === "TODOS" || r.estado === filterEstado;

      return matchSearch && matchEstado;
    });
  }, [roles, searchQuery, filterEstado]);

  const handleOpenAccion = (rol: Rol, tipo: TipoAccionRol) => {
    setAccionRol(rol);
    setAccionTipo(tipo);
    setAccionModalOpen(true);
  };

  const getEstadoBadge = (estado: EstadoRol) => {
    switch (estado) {
      case "Activo":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Activo
          </Badge>
        );
      case "Borrador":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Borrador
          </Badge>
        );
      case "Inactivo":
        return (
          <Badge
            tone="neutral"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Inactivo
          </Badge>
        );
    }
  };

  const selectedRol = useMemo(
    () => roles.find((r) => r.id === selectedRolId),
    [roles, selectedRolId]
  );

  return (
    <WireframeDashboardLayout
      activeMenu="roles"
      currentUser={currentUser}
      breadcrumbs={
        selectedRol
          ? [
              {
                label: "Roles y permisos",
                href: "/roles",
                onClick: (e) => {
                  e.preventDefault();
                  setSelectedRolId(null);
                  if (typeof window !== "undefined") {
                    window.history.pushState({}, "", "/roles");
                  }
                },
              },
              { label: selectedRol.nombre },
            ]
          : [{ label: "Roles y permisos" }]
      }
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {selectedRol ? (
          /* Vista de Detalle Requerida */
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            <RolDetailView
              rolId={selectedRol.id}
              onVolver={() => {
                setSelectedRolId(null);
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", "/roles");
                }
              }}
            />
          </Card>
        ) : (
          /* Vista Principal de Roles */
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* Encabezado Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="space-y-1 min-w-0 flex-1">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Roles y permisos
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Configura los roles de seguridad, versionado de capacidades, ámbitos operativos y trazabilidad de permisos para los usuarios de DINARP.
                </p>
              </div>

              {/* Botón de Creación */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCrearModalOpen(true)}
                  leftIcon={<ShieldPlus className="size-4" />}
                >
                  Nuevo rol
                </Button>
              </div>
            </div>

            {/* Cards de Resumen Compactas (Filtros rápidos interactivos) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
              {/* Card 1: Activos */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleSetFilterEstado(filterEstado === "Activo" ? "TODOS" : "Activo");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetFilterEstado(filterEstado === "Activo" ? "TODOS" : "Activo");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  filterEstado === "Activo"
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
                        filterEstado === "Activo"
                          ? "bg-success text-white shadow-xs"
                          : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                      )}
                    >
                      <ShieldCheck className="size-5" />
                    </div>
                    <Badge tone="success" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold">
                      Vigentes
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Roles Activos
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.activos}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card 2: Borradores */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleSetFilterEstado(filterEstado === "Borrador" ? "TODOS" : "Borrador");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetFilterEstado(filterEstado === "Borrador" ? "TODOS" : "Borrador");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  filterEstado === "Borrador"
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
                        filterEstado === "Borrador"
                          ? "bg-warning text-white shadow-xs"
                          : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                      )}
                    >
                      <Clock className="size-5" />
                    </div>
                    <Badge tone="warning" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold">
                      En preparación
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Borradores
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.borradores}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card 3: Inactivos (Baja lógica) */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleSetFilterEstado(filterEstado === "Inactivo" ? "TODOS" : "Inactivo");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSetFilterEstado(filterEstado === "Inactivo" ? "TODOS" : "Inactivo");
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  filterEstado === "Inactivo"
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
                        filterEstado === "Inactivo"
                          ? "bg-danger text-white shadow-xs"
                          : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                      )}
                    >
                      <Ban className="size-5" />
                    </div>
                    <Badge tone="danger" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold">
                      Baja lógica
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Roles Inactivos
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.inactivos}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card 4: Cuentas Asociadas */}
              <Card
                variant="featured"
                className="group relative overflow-hidden border rounded-xl outline-none select-none p-4 w-full bg-primary/5 border-primary/25 shadow-2xs"
                innerClassName="p-0 h-full"
              >
                <div className="flex flex-col justify-between h-full gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="size-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                      <Users className="size-5" />
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 text-[10px] font-bold">
                      Personal DINARP
                    </Badge>
                  </div>
                  <div className="text-left w-full space-y-0.5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Cuentas vinculadas
                    </p>
                    <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                      {kpis.totalCuentasAsociadas}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Búsqueda y Filtros con UI Kit Oficial */}
            <div className="space-y-3 w-full">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                {/* Buscador UI Kit */}
                <div className="flex-1 min-w-[260px] sm:min-w-[320px]">
                  <Search
                    size="sm"
                    placeholder="Buscar por código, nombre o descripción..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery("")}
                    className="w-full"
                  />
                </div>

                {/* Filtro por Estado (Combobox Oficial) */}
                <div className="w-full sm:w-[240px]">
                  <Combobox
                    value={filterEstado === "TODOS" ? null : filterEstado}
                    onValueChange={(val) => {
                      handleSetFilterEstado(val || "TODOS");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      setEstadoSearch(newSearch);
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
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold"
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
                        onClick={() => setSearchQuery("")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer"
                        aria-label="Limpiar búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {filterEstado !== "TODOS" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold"
                    >
                      <span>Estado: {getEstadoLabel(filterEstado)}</span>
                      <button
                        type="button"
                        onClick={() => handleSetFilterEstado("TODOS")}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer"
                        aria-label="Limpiar filtro de estado"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    Restablecer filtros
                  </Button>
                </div>
              )}
            </div>

            {/* Tabla de Roles Oficial con Columnas Requeridas */}
            <TooltipProvider delayDuration={150}>
              <div className="w-full">
                <Table
                  className="w-full min-w-[1450px]"
                  containerClassName="overflow-x-auto w-full"
                >
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left pl-6 font-bold">
                        CÓDIGO
                      </TableHead>
                      <TableHead className="w-[240px] min-w-[220px] whitespace-nowrap text-left font-bold">
                        NOMBRE
                      </TableHead>
                      <TableHead className="w-[320px] min-w-[280px] text-left font-bold">
                        DESCRIPCIÓN
                      </TableHead>
                      <TableHead className="w-[160px] min-w-[150px] whitespace-nowrap text-left font-bold">
                        CAPACIDADES
                      </TableHead>
                      <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap text-left font-bold">
                        VERSIÓN
                      </TableHead>
                      <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-left font-bold">
                        ESTADO
                      </TableHead>
                      <TableHead className="w-[170px] min-w-[160px] whitespace-nowrap text-left font-bold">
                        CUENTAS ASOCIADAS
                      </TableHead>
                      <TableHead className="w-[200px] min-w-[190px] whitespace-nowrap text-right pr-6 font-bold">
                        ACCIONES
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Shield className="size-8 stroke-[1.5] text-muted-foreground/60" />
                            <p className="text-sm font-semibold text-foreground">
                              No se encontraron roles coincidentes
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Ajusta los términos de búsqueda o crea un nuevo rol institucional.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((r) => (
                        <TableRow
                          key={r.id}
                          className="transition-colors hover:bg-muted/40 cursor-default"
                        >
                          {/* 1. Código */}
                          <TableCell className="w-[150px] min-w-[140px] text-left align-middle pl-6">
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-bold text-foreground block">
                                {r.codigo}
                              </span>
                              {r.esProtegido && (
                                <Badge
                                  tone="danger"
                                  appearance="soft"
                                  size="sm"
                                  className="text-[10px] font-bold px-2 py-0.5 inline-flex items-center gap-1"
                                >
                                  <Lock className="size-3" />
                                  Protegido
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          {/* 2. Nombre (Clic para ver detalle) */}
                          <TableCell className="w-[240px] min-w-[220px] text-left align-middle">
                            <div className="space-y-0.5 min-w-0 pr-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedRolId(r.id);
                                      if (typeof window !== "undefined") {
                                        window.history.pushState({}, "", `/roles?id=${r.id}`);
                                      }
                                    }}
                                    className="text-xs font-bold text-foreground hover:text-primary transition-colors text-left block truncate max-w-full cursor-pointer"
                                  >
                                    {r.nombre}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-xs">
                                  {r.nombre}
                                </TooltipContent>
                              </Tooltip>
                              <span className="text-[10px] text-muted-foreground font-mono block">
                                {r.id}
                              </span>
                            </div>
                          </TableCell>

                          {/* 3. Descripción */}
                          <TableCell className="w-[320px] min-w-[280px] text-left align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground truncate max-w-[300px] cursor-help">
                                  {r.descripcion}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                {r.descripcion}
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 4. Capacidades */}
                          <TableCell className="w-[160px] min-w-[150px] text-left align-middle">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground cursor-help">
                                  <Layers className="size-4 text-primary" />
                                  <span>{r.capacidades.length} permisos</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs text-xs">
                                <p className="font-bold text-xs mb-1">Capacidades asignadas:</p>
                                <ul className="text-[11px] space-y-0.5">
                                  {r.capacidades.map((c) => (
                                    <li key={c.codigo}>
                                      • <span className="font-mono font-bold">{c.codigo}</span> ({c.accion})
                                    </li>
                                  ))}
                                </ul>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>

                          {/* 5. Versión */}
                          <TableCell className="w-[110px] min-w-[100px] text-left align-middle">
                            <Badge
                              tone="primary"
                              appearance="soft"
                              size="sm"
                              className="font-mono text-[11px] font-bold px-2 py-0.5"
                            >
                              {r.version}
                            </Badge>
                          </TableCell>

                          {/* 6. Estado */}
                          <TableCell className="w-[140px] min-w-[130px] text-left align-middle">
                            <div className="inline-flex items-center justify-start">
                              {getEstadoBadge(r.estado)}
                            </div>
                          </TableCell>

                          {/* 7. Cuentas asociadas */}
                          <TableCell className="w-[170px] min-w-[160px] text-left align-middle">
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Users className="size-3.5" />
                              </div>
                              <span className="font-semibold">{r.cuentasAsociadas}</span>
                              <span className="text-[11px] text-muted-foreground font-normal">
                                {r.cuentasAsociadas === 1 ? "cuenta" : "cuentas"}
                              </span>
                            </div>
                          </TableCell>

                          {/* 8. Acciones Requeridas (Estandarizadas con /cuentas-internas) */}
                          <TableCell className="w-[170px] min-w-[160px] text-right align-middle pr-6">
                            <div className="inline-flex items-center gap-0.5 justify-end w-full">
                              {/* Editar */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setEditingRol(r);
                                      setEditarModalOpen(true);
                                    }}
                                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                    aria-label="Editar rol"
                                  >
                                    <Edit2 className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Editar</TooltipContent>
                              </Tooltip>

                              {/* Ver Impacto */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => {
                                      setImpactoRol(r);
                                      setImpactoModalOpen(true);
                                    }}
                                    className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                    aria-label="Ver impacto y dependencias"
                                  >
                                    <ShieldAlert className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver impacto</TooltipContent>
                              </Tooltip>

                              {/* Activar (Borrador -> Activo) */}
                              {r.estado === "Borrador" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleOpenAccion(r, "activar")}
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                      aria-label="Activar rol"
                                    >
                                      <UserCheck className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Activar</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Reactivar (Inactivo -> Activo) */}
                              {r.estado === "Inactivo" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleOpenAccion(r, "reactivar")}
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
                                      aria-label="Reactivar rol"
                                    >
                                      <RotateCcw className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Reactivar</TooltipContent>
                                </Tooltip>
                              )}

                              {/* Retirar (Activo -> Inactivo) */}
                              {r.estado === "Activo" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      disabled={r.esProtegido}
                                      onClick={() => handleOpenAccion(r, "retirar")}
                                      className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer disabled:opacity-40"
                                      aria-label="Retirar rol"
                                    >
                                      <UserX className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {r.esProtegido ? "Rol protegido (no retirable)" : "Retirar"}
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Eliminar borrador nunca usado */}
                              {r.estado === "Borrador" && r.nuncaUsado && r.cuentasAsociadas === 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => handleOpenAccion(r, "eliminar_borrador")}
                                      className="text-danger hover:text-danger hover:bg-danger/15 cursor-pointer"
                                      aria-label="Eliminar borrador permanentemente"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">Eliminar borrador</TooltipContent>
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
            </TooltipProvider>
          </Card>
        )}
      </main>

      {/* Modales y Diálogos Globales */}
      <CrearRolModal
        open={crearModalOpen}
        onOpenChange={setCrearModalOpen}
      />
      <EditarRolModal
        open={editarModalOpen}
        onOpenChange={setEditarModalOpen}
        rol={editingRol}
      />
      <ImpactoRolDialog
        open={impactoModalOpen}
        onOpenChange={setImpactoModalOpen}
        rol={impactoRol}
        onIniciarRetiro={(r) => {
          setAccionRol(r);
          setAccionTipo("retirar");
          setAccionModalOpen(true);
        }}
      />
      <AccionRolDialog
        open={accionModalOpen}
        onOpenChange={setAccionModalOpen}
        rol={accionRol}
        tipo={accionTipo}
        onSuccess={() => {
          if (accionTipo === "eliminar_borrador" && selectedRolId === accionRol?.id) {
            setSelectedRolId(null);
          }
        }}
      />
    </WireframeDashboardLayout>
  );
}
