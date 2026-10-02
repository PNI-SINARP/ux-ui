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
  Eye,
  ChevronDown,
  X,
  Database,
  HelpCircle,
  FolderArchive
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDecorativeIcon } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  INITIAL_EXPEDIENTES,
  ETAPAS_EXPEDIENTE_CONFIG,
  ROLES_CONFIG,
  type UserRole
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface ProcesosTabProps {
  activeRole: UserRole;
  onStartTour: () => void;
}

export function ProcesosTab({ activeRole, onStartTour }: ProcesosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState<string>("ALL");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [responsableFilter, setResponsableFilter] = useState<string>("ALL");

  const institucionesList = useMemo(() => {
    const map = new Map<string, string>();
    INITIAL_EXPEDIENTES.forEach(exp => {
      map.set(exp.institucionSigla, exp.institucionNombre);
    });
    return Array.from(map.entries()).map(([sigla, nombre]) => ({ sigla, nombre }));
  }, []);

  const myInstitutionSigla = "DIGERCIC"; // MOCK for Coordinador

  const expedientesFiltrados = useMemo(() => {
    let filtered = INITIAL_EXPEDIENTES.filter(exp => {
      // 1. HARD FILTERING by role
      if (activeRole === "COORDINADOR_SINARP") {
        if (exp.institucionSigla !== myInstitutionSigla) return false;
      }
      
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

    // 2. SORTING priorities based on role
    filtered.sort((a, b) => {
      if (activeRole === "DGR") {
        const priorityStates = ["En revisin DGR", "En validacin preproduccin", "En aprobacin", "Aprobada"];
        const aPrio = priorityStates.includes(a.estadoGeneral) || a.responsableActualRol === "DGR" ? 1 : 0;
        const bPrio = priorityStates.includes(b.estadoGeneral) || b.responsableActualRol === "DGR" ? 1 : 0;
        return bPrio - aPrio;
      }
      if (activeRole === "DTD") {
        const priorityStates = ["En validacin tcnica DTD", "En integracin y clasificacin", "En correccin tcnica"];
        const aPrio = priorityStates.includes(a.estadoGeneral) || a.responsableActualRol === "DTD" ? 1 : 0;
        const bPrio = priorityStates.includes(b.estadoGeneral) || b.responsableActualRol === "DTD" ? 1 : 0;
        return bPrio - aPrio;
      }
      if (activeRole === "DPI") {
        const priorityStates = ["En integracin y clasificacin"];
        const aPrio = priorityStates.includes(a.estadoGeneral) || a.responsableActualRol === "DPI" ? 1 : 0;
        const bPrio = priorityStates.includes(b.estadoGeneral) || b.responsableActualRol === "DPI" ? 1 : 0;
        return bPrio - aPrio;
      }
      return 0; // Default sort
    });

    return filtered;
  }, [searchTerm, institucionFilter, estadoFilter, responsableFilter, activeRole]);

  const stats = useMemo(() => {
    const enProceso = INITIAL_EXPEDIENTES.filter(e => 
      !["En producción", "Aprobada", "Integrada"].includes(e.estadoGeneral) && e.responsableActualRol !== activeRole
    ).length;

    const enRevision = INITIAL_EXPEDIENTES.filter(e => e.estadoGeneral === "En revisión DGR").length;
    
    const requierenAccion = INITIAL_EXPEDIENTES.filter(e => e.responsableActualRol === activeRole).length;
    
    const finalizadas = INITIAL_EXPEDIENTES.filter(e => ["En producción", "Aprobada", "Integrada"].includes(e.estadoGeneral)).length;

    return {
      enProceso,
      enRevision,
      requierenAccion,
      finalizadas
    };
  }, [activeRole]);

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

  const isCoordinador = activeRole === "COORDINADOR_SINARP";
  const myInstitutionId = "INS-001"; // MOCK: Institución del coordinador (Dirección General de Registro Civil)

  const getBadgeEstadoCatalogo = (estado: string) => {
    switch (estado) {
      case "PUBLICADO":
        return <Badge tone="success" appearance="soft" size="sm">PUBLICADO</Badge>;
      case "OCULTO":
        return <Badge tone="neutral" appearance="outline" size="sm" className="border-dashed">OCULTO</Badge>;
      case "DESACTIVADO":
        return <Badge tone="neutral" appearance="soft" size="sm" className="bg-muted/40">DESACTIVADO</Badge>;
      case "Sin incorporar":
      default:
        return <Badge tone="neutral" appearance="soft" size="sm" className="opacity-70">Sin incorporar</Badge>;
    }
  };

  const getEtapaNombreCorto = (etapaKey: string) => {
    const config = ETAPAS_EXPEDIENTE_CONFIG[etapaKey as keyof typeof ETAPAS_EXPEDIENTE_CONFIG];
    return config ? config.nombre : etapaKey;
  };



  let title = "Procesos de incorporación";
  let description = "Gestiona las solicitudes de incorporación de nuevas fuentes al Catálogo de Interoperabilidad.";

  if (activeRole === "COORDINADOR_SINARP") {
    title = "Mis incorporaciones";
    description = "Gestiona las solicitudes de incorporación de fuentes de tu institución.";
  } else if (activeRole === "DGR") {
    title = "Bandeja de gestión";
    description = "Gestiona la aprobación funcional y revisión de documentación de nuevas fuentes.";
  } else if (activeRole === "DTD") {
    title = "Bandeja técnica";
    description = "Gestiona los despliegues técnicos y validación de infraestructura de las nuevas fuentes.";
  } else if (activeRole === "DPI") {
    title = "Clasificación de campos";
    description = "Clasifica la sensibilidad de los campos de las fuentes en proceso de incorporación.";
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Contenedor Principal de Encabezado y Métricas */}
      <div className="flex flex-col gap-6">
        <div data-tour="tour-bandeja" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 border-border shadow-2xs hover:bg-muted text-foreground"
              onClick={onStartTour}
            >
              <HelpCircle className="size-3.5" />
              <span>Ver recorrido</span>
            </Button>

            {activeRole === "COORDINADOR_SINARP" && (
              <Button
                variant="primary"
                size="sm"
                asChild
                className="gap-2 font-medium !text-white shadow-xs"
              >
                <Link href="/catalogo-interoperabilidad/administracion/incorporaciones/nueva" className="!text-white flex items-center gap-2">
                  <Plus className="size-4 text-white" />
                  <span className="!text-white font-medium">Incorporar nueva fuente</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Cards de Resumen consolidados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
              {stats.enProceso}
            </span>
            <span className="text-xs font-semibold text-foreground block">
              En proceso
            </span>
            <CardDecorativeIcon>
              <Layers className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-blue-600 tracking-tight block">
              {stats.enRevision}
            </span>
            <span className="text-xs font-semibold text-blue-600 block">
              En revisión
            </span>
            <CardDecorativeIcon>
              <Search className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-amber-600 tracking-tight block">
              {stats.requierenAccion}
            </span>
            <span className="text-xs font-semibold text-amber-600 block">
              Requieren acción
            </span>
            <CardDecorativeIcon>
              <Clock className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-600 tracking-tight block">
              {stats.finalizadas}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              Finalizadas
            </span>
            <CardDecorativeIcon>
              <Database className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>
        </div>
      </div>

      {/* Bloque de Inventario: Filtros y Tabla */}
      <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
        {/* Barra de Filtros */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 items-end">
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Estado de integración</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-medium bg-background text-foreground rounded-xl border-border/80 px-3.5 hover:bg-muted/40">
                    <span className="text-foreground">{estadoFilter === "ALL" ? "Todos los estados" : estadoFilter}</span>
                    <ChevronDown className="size-4 opacity-60 ml-2 shrink-0 text-foreground" />
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Institución emisora</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-medium bg-background text-foreground rounded-xl border-border/80 px-3.5 hover:bg-muted/40 truncate">
                    <span className="truncate text-foreground">{institucionFilter === "ALL" ? "Todas las instituciones" : institucionFilter}</span>
                    <ChevronDown className="size-4 opacity-60 ml-2 shrink-0 text-foreground" />
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Responsable actual</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full h-10 justify-between text-xs sm:text-sm font-medium bg-background text-foreground rounded-xl border-border/80 px-3.5 hover:bg-muted/40">
                    <span className="text-foreground">{responsableFilter === "ALL" ? "Todos los responsables" : ROLES_CONFIG[responsableFilter as UserRole]?.shortName || responsableFilter}</span>
                    <ChevronDown className="size-4 opacity-60 ml-2 shrink-0 text-foreground" />
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

          {(searchTerm || institucionFilter !== "ALL" || estadoFilter !== "ALL" || responsableFilter !== "ALL") && (
            <div className="flex items-center gap-2 pt-3 flex-wrap text-xs">
              <span className="text-muted-foreground font-medium">Filtros activos:</span>
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

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">
            Mostrando <strong className="text-foreground font-semibold">{expedientesFiltrados.length}</strong> de{" "}
            <strong className="text-foreground font-semibold">{INITIAL_EXPEDIENTES.length}</strong> incorporaciones
          </span>
        </div>

        <div data-tour="tour-etapas" className="overflow-x-auto border-y border-border bg-card mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º incorporación</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Etapa actual</TableHead>
                <TableHead>Responsable actual</TableHead>
                <TableHead>Estado del catálogo</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead className="w-24 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expedientesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    <p className="font-medium text-foreground">No se encontraron incorporaciones</p>
                    <p className="text-xs mt-1">Ajusta los filtros o criterios de búsqueda.</p>
                  </TableCell>
                </TableRow>
              ) : (
                expedientesFiltrados.map(exp => {
                  const isMyTask = exp.responsableActualRol === activeRole;
                  const estadoCatalogo = exp.validacionTecnicaDTD?.estadoCatalogoAsignado || "Sin incorporar";

                  return (
                    <TableRow
                      key={exp.id}
                      className={isMyTask ? "bg-muted/30 dark:bg-muted/10 font-medium" : ""}
                    >
                      <TableCell className="font-mono font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <Layers className="size-4 text-muted-foreground" />
                          {exp.codigoExpediente}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-normal">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs line-clamp-1">
                            {exp.nombreFuente}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[180px] whitespace-normal">
                        <span className="line-clamp-1 font-medium text-foreground">{exp.institucionSigla}</span>
                        <span className="text-[11px] text-muted-foreground/80 line-clamp-1 mt-0.5">
                          {exp.institucionNombre}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] whitespace-normal">
                        <span className="text-foreground line-clamp-1 font-medium">
                          {getEtapaNombreCorto(exp.etapaActual)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
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
                            <span className="size-2 rounded-full bg-amber-500 shrink-0 shadow-sm" title="Tarea activa asignada a tu perfil" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBadgeEstadoCatalogo(estadoCatalogo)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {exp.ultimaActualizacion}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3" data-tour="tour-expediente">
                          <TooltipProvider delayDuration={0}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                  <Link href={`/catalogo-interoperabilidad/administracion/incorporaciones/${exp.id}`}>
                                    {isMyTask ? <ArrowRight className="size-4" /> : <Eye className="size-4" />}
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{isMyTask ? "Continuar trámite" : "Ver detalle"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
