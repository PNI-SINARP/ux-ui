"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  FileCheck2,
  ChevronDown,
  Info,
  Building2,
  ArrowLeftRight,
  AlertCircle,
  UserCheck,
  HelpCircle,
  X,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDecorativeIcon } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import { WireframeTour as CatalogoTour, type TourStep } from "@/components/layout/wireframes/wireframe-tour";
import {
  INITIAL_EXPEDIENTES,
  ETAPAS_EXPEDIENTE_CONFIG,
  ROLES_CONFIG,
  MOCK_USERS_BY_ROLE,
  type ExpedienteIntegracion,
  type UserRole,
  type MockUser
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function CatalogoIntegracionesView() {
  const [activeRole, setActiveRole] = useState<UserRole>("COORDINADOR_SINARP");
  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState<string>("ALL");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [responsableFilter, setResponsableFilter] = useState<string>("ALL");

  // Estado del Product Tour
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const currentUser = MOCK_USERS_BY_ROLE[activeRole];

  // Lista única de instituciones presentes en expedientes
  const institucionesList = useMemo(() => {
    const map = new Map<string, string>();
    INITIAL_EXPEDIENTES.forEach(exp => {
      map.set(exp.institucionSigla, exp.institucionNombre);
    });
    return Array.from(map.entries()).map(([sigla, nombre]) => ({ sigla, nombre }));
  }, []);

  // Filtrado de expedientes
  const expedientesFiltrados = useMemo(() => {
    return INITIAL_EXPEDIENTES.filter(exp => {
      const matchSearch =
        searchTerm === "" ||
        exp.codigoExpediente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.nombreFuente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.institucionNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.institucionSigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.codigoFuente && exp.codigoFuente.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchInst = institucionFilter === "ALL" || exp.institucionSigla === institucionFilter;
      const matchEstado = estadoFilter === "ALL" || exp.estadoGeneral === estadoFilter;
      const matchResponsable = responsableFilter === "ALL" || exp.responsableActualRol === responsableFilter;

      return matchSearch && matchInst && matchEstado && matchResponsable;
    });
  }, [searchTerm, institucionFilter, estadoFilter, responsableFilter]);

  // Contadores para las cards
  const stats = useMemo(() => {
    return {
      total: INITIAL_EXPEDIENTES.length,
      enRevision: INITIAL_EXPEDIENTES.filter(e => e.estadoGeneral === "En revisión DGR").length,
      enProceso: INITIAL_EXPEDIENTES.filter(e =>
        e.estadoGeneral === "En validación técnica DTD" ||
        e.estadoGeneral === "En integración y clasificación" ||
        e.estadoGeneral === "En validación preproducción" ||
        e.estadoGeneral === "En corrección técnica"
      ).length,
      conObservaciones: INITIAL_EXPEDIENTES.filter(e => e.estadoGeneral === "Con observaciones").length,
      finalizadas: INITIAL_EXPEDIENTES.filter(e =>
        e.estadoGeneral === "Aprobada" ||
        e.estadoGeneral === "En producción" ||
        e.estadoGeneral === "Integrada"
      ).length
    };
  }, []);

  // Definición de pasos para el Product Tour
  const tourSteps: TourStep[] = [
    {
      id: "step-bandeja",
      target: "[data-tour='tour-bandeja']",
      title: "1. Bandeja de Integraciones",
      description: "Consulta las fuentes que están siendo incorporadas al catálogo por parte de los organismos emisores.",
      placement: "bottom"
    },
    {
      id: "step-etapas",
      target: "[data-tour='tour-etapas']",
      title: "2. Etapa y Responsable",
      description: "Identifica en qué parte del proceso está cada integración y qué dirección o actor tiene la tarea actual.",
      placement: "top"
    },
    {
      id: "step-roles",
      target: "[data-tour='tour-roles']",
      title: "3. Demostración por Rol",
      description: "Cambia de rol para comprobar cómo las acciones disponibles se ajustan dinámicamente según el perfil (Coordinador, DGR, DTD o DPI).",
      placement: "bottom"
    },
    {
      id: "step-expediente",
      target: "[data-tour='tour-expediente']",
      title: "4. Expediente de Integración",
      description: "Accede al expediente consolidado para revisar metadatos, campos, documentos y dictámenes de validación.",
      placement: "top"
    },
    {
      id: "step-historial",
      target: "[data-tour='tour-historial']",
      title: "5. Historial y Trazabilidad",
      description: "Consulta devoluciones, correcciones, validaciones y cambios registrados durante todo el ciclo de incorporación.",
      placement: "top"
    }
  ];

  const handleStartTour = () => {
    setTourStep(0);
    setIsTourOpen(true);
  };

  const getBadgeEstadoGeneral = (estado: string) => {
    switch (estado) {
      case "En revisión DGR":
      case "En validación preproducción":
        return <Badge tone="info" appearance="soft" size="sm">{estado}</Badge>;
      case "Con observaciones":
      case "En corrección técnica":
        return <Badge tone="warning" appearance="soft" size="sm">{estado}</Badge>;
      case "En validación técnica DTD":
      case "En integración y clasificación":
        return <Badge tone="neutral" appearance="soft" size="sm">{estado}</Badge>;
      case "Aprobada":
      case "En producción":
      case "Integrada":
        return <Badge tone="success" appearance="soft" size="sm">{estado}</Badge>;
      default:
        return <Badge tone="neutral" appearance="soft" size="sm">{estado}</Badge>;
    }
  };

  const getEtapaNombreCorto = (etapaKey: string) => {
    const config = ETAPAS_EXPEDIENTE_CONFIG[etapaKey as keyof typeof ETAPAS_EXPEDIENTE_CONFIG];
    return config ? config.nombre : etapaKey;
  };

  return (
    <WireframeDashboardLayout
      activeMenu="integracion-fuentes"
      currentRole={activeRole}
      currentUser={currentUser}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Breadcrumb */}
        <WireframeBreadcrumbs
          segments={[
            { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
            { label: "Integración de Fuentes" }
          ]}
        />

        {/* Contenedor Principal de Encabezado y Métricas */}
        <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
          <div data-tour="tour-bandeja" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  Integración de Fuentes
                </h1>
                <Badge tone="neutral" appearance="outline" size="sm" className="text-xs">
                  HU-INT-03 a 15
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestiona la incorporación de nuevas fuentes y campos al Catálogo de Interoperabilidad.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 border-border shadow-2xs hover:bg-muted"
                onClick={handleStartTour}
              >
                <HelpCircle className="size-3.5" />
                <span>Ver recorrido</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                asChild
                className="gap-2 font-medium"
              >
                <Link href="/catalogo-interoperabilidad/integraciones/nueva">
                  <Plus className="size-4" />
                  Nueva integración
                </Link>
              </Button>
            </div>
          </div>

          {/* DEMO ROLE SWITCHER BANNER */}
          <div data-tour="tour-roles" className="bg-muted/40 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-background flex items-center justify-center shrink-0 border border-border shadow-xs">
                <UserCheck className="size-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Simulación de Perfil Activo:
                  </span>
                  <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold">
                    {ROLES_CONFIG[activeRole].shortName}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ROLES_CONFIG[activeRole].description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {(["COORDINADOR_SINARP", "DGR", "DTD", "DPI"] as UserRole[]).map(roleKey => {
                const r = ROLES_CONFIG[roleKey];
                const isSelected = activeRole === roleKey;
                return (
                  <Button
                    key={roleKey}
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setActiveRole(roleKey)}
                    className={`text-xs h-8 ${isSelected ? "shadow-xs" : "bg-background"}`}
                  >
                    {r.shortName}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Cards de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <Card
              variant="featured"
              className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
              innerClassName="p-4 items-start text-left gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
                <CardDecorativeIcon>
                  <ArrowLeftRight className="size-4 text-muted-foreground" />
                </CardDecorativeIcon>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-foreground mt-1">
                {stats.total}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fuentes en trámite
              </p>
            </Card>
            <Card
              variant="featured"
              className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
              innerClassName="p-4 items-start text-left gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  En revisión
                </span>
                <CardDecorativeIcon>
                  <FileText className="size-4 text-blue-600" />
                </CardDecorativeIcon>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-blue-600 mt-1">
                {stats.enRevision}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Revisión formal DGR
              </p>
            </Card>
            <Card
              variant="featured"
              className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
              innerClassName="p-4 items-start text-left gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  En proceso
                </span>
                <CardDecorativeIcon>
                  <Layers className="size-4 text-purple-600" />
                </CardDecorativeIcon>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-purple-600 mt-1">
                {stats.enProceso}
              </div>
              <p className="text-[11px] text-muted-foreground">
                DTD & DPI en paralelo
              </p>
            </Card>
            <Card
              variant="featured"
              className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
              innerClassName="p-4 items-start text-left gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Observaciones
                </span>
                <CardDecorativeIcon>
                  <AlertCircle className="size-4 text-amber-600" />
                </CardDecorativeIcon>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-amber-600 mt-1">
                {stats.conObservaciones}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Subsanación requerida
              </p>
            </Card>
            <Card
              variant="featured"
              className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
              innerClassName="p-4 items-start text-left gap-1"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Finalizadas
                </span>
                <CardDecorativeIcon>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                </CardDecorativeIcon>
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-heading text-emerald-600 mt-1">
                {stats.finalizadas}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Aprobadas y desplegadas
              </p>
            </Card>
          </div>
        </div>

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            CONTENEDOR UNIFICADO: BÚSQUEDA/FILTROS + LÍNEA + RESULTADOS
           â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
          {/* Bloque Superior: Barra de Filtros y Búsqueda */}
          <div className="p-4 sm:p-5 bg-card flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-end">
              {/* Búsqueda general */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Búsqueda general</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por integración..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 w-full h-10 bg-background rounded-xl border-border/80 text-sm"
                  />
                </div>
              </div>

              {/* Filtro Estado */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Estado de integración</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40">
                      <span>{estadoFilter === "ALL" ? "Todos los estados" : estadoFilter}</span>
                      <ChevronDown className="size-4 opacity-60 ml-2 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs">Estado de integración</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={estadoFilter} onValueChange={setEstadoFilter}>
                      <DropdownMenuRadioItem value="ALL">Todos los estados</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="En revisión DGR">En revisión DGR</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Con observaciones">Con observaciones</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="En validación técnica DTD">En validación técnica DTD</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="En integración y clasificación">En integración y clasificación</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="En validación preproducción">En validación preproducción</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Aprobada">Aprobada</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="En producción">En producción</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtro Institución */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Institución emisora</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 truncate">
                      <span className="truncate">{institucionFilter === "ALL" ? "Todas las instituciones" : institucionFilter}</span>
                      <ChevronDown className="size-4 opacity-60 ml-2 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    <DropdownMenuLabel className="text-xs">Institución emisora</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={institucionFilter} onValueChange={setInstitucionFilter}>
                      <DropdownMenuRadioItem value="ALL">Todas las instituciones</DropdownMenuRadioItem>
                      {institucionesList.map(inst => (
                        <DropdownMenuRadioItem key={inst.sigla} value={inst.sigla} className="text-xs">
                          {inst.nombre} ({inst.sigla})
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Filtro Responsable */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Responsable actual</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40">
                      <span>{responsableFilter === "ALL" ? "Todos los responsables" : ROLES_CONFIG[responsableFilter as UserRole]?.shortName || responsableFilter}</span>
                      <ChevronDown className="size-4 opacity-60 ml-2 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel className="text-xs">Responsable actual</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={responsableFilter} onValueChange={setResponsableFilter}>
                      <DropdownMenuRadioItem value="ALL">Todos los responsables</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="COORDINADOR_SINARP">Coordinador SINARP</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="DGR">DGR (Gestión y Registro)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="DTD">DTD (Tecnología)</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="DPI">DPI (Protección)</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Badges de filtros activos */}
            {(searchTerm || institucionFilter !== "ALL" || estadoFilter !== "ALL" || responsableFilter !== "ALL") && (
              <div className="flex items-center gap-2 pt-3 flex-wrap text-xs">
                <span className="text-muted-foreground font-medium">Filtros activos:</span>
                {searchTerm && (
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Búsqueda: {searchTerm}
                  </Badge>
                )}
                {estadoFilter !== "ALL" && (
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Estado: {estadoFilter}
                  </Badge>
                )}
                {institucionFilter !== "ALL" && (
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Institución: {institucionFilter}
                  </Badge>
                )}
                {responsableFilter !== "ALL" && (
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Responsable: {ROLES_CONFIG[responsableFilter as UserRole]?.shortName || responsableFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm("");
                    setInstitucionFilter("ALL");
                    setEstadoFilter("ALL");
                    setResponsableFilter("ALL");
                  }}
                >
                  <X className="size-3.5 mr-1" /> Limpiar todos
                </Button>
              </div>
            )}
          </div>

          {/* Tabla de Integraciones */}
          <div data-tour="tour-etapas" className="overflow-x-auto border-t border-border bg-surface">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="py-3.5 px-4">N.º integración</th>
                  <th className="py-3.5 px-4">Fuente</th>
                  <th className="py-3.5 px-4">Institución</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Etapa actual</th>
                  <th className="py-3.5 px-4">Responsable actual</th>
                  <th className="py-3.5 px-4">Última actualización</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expedientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <ArrowLeftRight className="size-8 mx-auto mb-2 opacity-40" />
                      <p className="font-medium text-foreground">No se encontraron integraciones</p>
                      <p className="text-xs mt-1">Ajusta los filtros o criterios de búsqueda.</p>
                    </td>
                  </tr>
                ) : (
                  expedientesFiltrados.map(exp => {
                    const isMyTask = exp.responsableActualRol === activeRole;

                    return (
                      <tr
                        key={exp.id}
                        className={`hover:bg-muted/30 transition-colors ${isMyTask ? "bg-muted/10 font-medium" : ""
                          }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Layers className="size-4 text-muted-foreground" />
                            {exp.codigoExpediente}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground text-xs line-clamp-1">
                              {exp.nombreFuente}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {exp.codigoFuente} â€¢ {exp.camposCandidatos.length} campos
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-[180px]">
                          <span className="line-clamp-1">{exp.institucionSigla}</span>
                          <span className="text-[11px] text-muted-foreground/80 line-clamp-1">
                            {exp.institucionNombre}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getBadgeEstadoGeneral(exp.estadoGeneral)}
                        </td>
                        <td className="py-3.5 px-4 text-xs max-w-[200px]">
                          <div className="flex flex-col">
                            <span className="text-foreground line-clamp-1">
                              {getEtapaNombreCorto(exp.etapaActual)}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {ETAPAS_EXPEDIENTE_CONFIG[exp.etapaActual]?.huRef}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              tone={isMyTask ? "warning" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="text-[11px]"
                            >
                              {ROLES_CONFIG[exp.responsableActualRol]?.shortName || exp.responsableActualRol}
                            </Badge>
                            {isMyTask && (
                              <span className="size-2 rounded-full bg-amber-500 shrink-0" title="Tarea activa asignada a tu perfil" />
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {exp.ultimaActualizacion}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" data-tour="tour-expediente">
                            {isMyTask ? (
                              <Button
                                variant="primary"
                                size="sm"
                                asChild
                                className="h-8 gap-1 text-xs font-semibold"
                              >
                                <Link href={`/catalogo-interoperabilidad/integraciones/${exp.id}`}>
                                  Continuar tarea
                                  <ArrowRight className="size-3" />
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 gap-1 text-xs"
                              >
                                <Link href={`/catalogo-interoperabilidad/integraciones/${exp.id}`}>
                                  Ver expediente
                                  <ChevronRight className="size-3" />
                                </Link>
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                  <Link href={`/catalogo-interoperabilidad/integraciones/${exp.id}`}>
                                    <Eye className="size-4 mr-2" />
                                    Ver expediente
                                  </Link>
                                </DropdownMenuItem>
                                {exp.validacionTecnicaDTD?.estadoCatalogoAsignado === "OCULTO" && (
                                  <DropdownMenuItem asChild>
                                    <Link href="/catalogo-interoperabilidad/gestion">
                                      <Layers className="size-4 mr-2" />
                                      Ver fuente en Gestión
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Tour Modal Component */}
        <CatalogoTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          steps={tourSteps}
          currentStep={tourStep}
          onStepChange={setTourStep}
        />
      </div>
    </WireframeDashboardLayout>
  );
}
