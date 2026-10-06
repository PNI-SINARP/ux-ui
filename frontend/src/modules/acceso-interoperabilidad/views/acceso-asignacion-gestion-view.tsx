"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserCheck,
  Search as SearchIcon,
  Filter,
  Eye,
  Clock,
  ShieldCheck,
  Building2,
  Briefcase,
  Database,
  Lock,
  Unlock,
  Calendar,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  History,
  Send,
  User,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
  SolicitudEstado,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Personas activas del Equipo de Gestión
const REVISORES_GESTION = [
  { id: "U-EQGEST", nombre: "Ana Torres", cargo: "Revisora Técnica de Gestión", especialidad: "Interoperabilidad y Catálogos" },
  { id: "U-EQGEST2", nombre: "Marcos Silva", cargo: "Revisor Funcional", especialidad: "Modelos de Datos y Servicios" },
  { id: "U-EQGEST3", nombre: "Elena Viteri", cargo: "Analista de Integración", especialidad: "Arquitectura e Interconexión" },
];

export function AccesoAsignacionGestionView() {
  const { solicitudes, asignarRevisorGestion } = useSolicitudesStore();

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [confidencialFilter, setConfidencialFilter] = useState<string>("ALL");

  // Solicitud seleccionada para contexto del expediente (Drawer)
  const [selectedSolicitudExpediente, setSelectedSolicitudExpediente] = useState<SolicitudAcceso | null>(null);

  // Solicitud para asignar revisor (Modal)
  const [solicitudToAssign, setSolicitudToAssign] = useState<SolicitudAcceso | null>(null);
  const [selectedRevisorId, setSelectedRevisorId] = useState<string>("U-EQGEST");
  const [observacionAsignacion, setObservacionAsignacion] = useState("");

  // Opciones de estado
  const estadoOptions = [
    { value: "ALL", label: "Todos los estados" },
    { value: "Pendiente de asignación en Gestión", label: "Pendiente de asignación" },
    { value: "Pendiente de nueva asignación", label: "Pendiente de nueva asignación (Subsanada)" },
    { value: "Asignada a revisión de Gestión", label: "Asignada a revisión" },
    { value: "En revisión de Gestión", label: "En revisión funcional" },
    { value: "Observada", label: "Observada" },
    { value: "Aprobada por Gestión", label: "Aprobada por Gestión" },
  ];

  const confidencialOptions = [
    { value: "ALL", label: "Cualquier clasificación" },
    { value: "CON_CONFIDENCIAL", label: "Contiene campos confidenciales" },
    { value: "SOLO_ACCESIBLE", label: "Solo campos accesibles" },
  ];

  // Helper para verificar campos confidenciales
  const tieneCamposConfidenciales = (s: SolicitudAcceso) => {
    return s.fuentes?.some((f) =>
      f.campos?.some((c) => c.clasificacion === "Confidencial")
    ) || false;
  };

  // Filtrado de solicitudes
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      // Búsqueda libre
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "").toLowerCase().includes(term);
        const matchesServicio = (s.servicioPrincipal || "").toLowerCase().includes(term);
        const matchesProyecto = (s.proyectoNombre || "").toLowerCase().includes(term);
        const matchesRevisor = (s.revisorAsignado || "").toLowerCase().includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesServicio && !matchesProyecto && !matchesRevisor) {
          return false;
        }
      }

      // Filtro de estado
      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) {
        return false;
      }

      // Filtro confidencial
      if (confidencialFilter === "CON_CONFIDENCIAL" && !tieneCamposConfidenciales(s)) {
        return false;
      }
      if (confidencialFilter === "SOLO_ACCESIBLE" && tieneCamposConfidenciales(s)) {
        return false;
      }

      return true;
    });
  }, [solicitudes, searchTerm, estadoFilter, confidencialFilter]);

  // Contadores métricos
  const metricas = useMemo(() => {
    const total = solicitudes.length;
    const pendientesPrimera = solicitudes.filter(
      (s) => s.estado === "Pendiente de asignación en Gestión"
    ).length;
    const pendientesNueva = solicitudes.filter(
      (s) => s.estado === "Pendiente de nueva asignación"
    ).length;
    const enRevision = solicitudes.filter(
      (s) => s.estado === "Asignada a revisión de Gestión" || s.estado === "En revisión de Gestión"
    ).length;
    return { total, pendientesPrimera, pendientesNueva, enRevision };
  }, [solicitudes]);

  // Ejecutar confirmación de asignación
  const handleConfirmarAsignacion = () => {
    if (!solicitudToAssign) return;

    const revisor = REVISORES_GESTION.find((r) => r.id === selectedRevisorId) || REVISORES_GESTION[0];
    const directorNombre = "Director Área de Gestión";

    asignarRevisorGestion(
      solicitudToAssign.id,
      revisor.id,
      revisor.nombre,
      directorNombre,
      observacionAsignacion.trim() || undefined
    );

    toast.success("Revisor de Gestión asignado exitosamente", {
      description: `La solicitud ${solicitudToAssign.id} (v${solicitudToAssign.versionExpediente || 1}) fue asignada a ${revisor.nombre}.`,
    });

    setSolicitudToAssign(null);
    setObservacionAsignacion("");
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad-asignacion"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: "Bandeja de Asignación de Gestión" },
      ]}
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UserCheck className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                Asignación de Solicitudes de Acceso a Fuentes
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Bandeja exclusiva para el <strong>Director de Gestión</strong> (BN-07). Verifique el expediente recibido y gestione manualmente la asignación de revisores técnicos de Gestión.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge tone="info" appearance="soft" size="md" className="font-semibold px-3 py-1.5 text-xs">
              Rol: Director de Gestión
            </Badge>
          </div>
        </div>

        {/* Banner de alerta: Solicitudes subsanadas pendientes de nueva asignación */}
        {metricas.pendientesNueva > 0 && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  Atención requerida: {metricas.pendientesNueva} solicitud(es) subsanada(s) esperan nueva asignación
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  El Coordinador corrigió las observaciones del expediente. Por regla del proceso BN-07, <strong>no se envían automáticamente al revisor anterior</strong> y deben ser reasignadas manualmente por el Director de Gestión.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEstadoFilter("Pendiente de nueva asignación")}
              className="shrink-0 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15"
            >
              Filtrar subsanadas
            </Button>
          </div>
        )}

        {/* Tarjetas Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Database className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.total}</span>
              <p className="text-xs text-muted-foreground font-medium">Total expedientes BN-07</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.pendientesPrimera}</span>
              <p className="text-xs text-muted-foreground font-medium">Pendientes de 1ra asignación</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.pendientesNueva}</span>
              <p className="text-xs text-muted-foreground font-medium">Subsanadas (Reasignación)</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.enRevision}</span>
              <p className="text-xs text-muted-foreground font-medium">En revisión de Gestión</p>
            </div>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-12 lg:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Búsqueda rápida</label>
              <Search
                placeholder="Buscar por ID, institución, fuente, proyecto o revisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full h-10 bg-background rounded-xl border-border/80"
              />
            </div>

            <div className="sm:col-span-6 lg:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Estado de la solicitud</label>
              <Combobox
                items={estadoOptions}
                value={estadoOptions.find((o) => o.value === estadoFilter) || estadoOptions[0]}
                onValueChange={(val: any) => {
                  if (val) setEstadoFilter(typeof val === "string" ? val : val.value);
                }}
              >
                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 shadow-none">
                  <span className="truncate">
                    {estadoOptions.find((o) => o.value === estadoFilter)?.label || "Todos los estados"}
                  </span>
                </ComboboxSelectTrigger>
                <ComboboxContent align="start" className="w-72">
                  <ComboboxList>
                    {estadoOptions.map((opt) => (
                      <ComboboxItem key={opt.value} value={opt} className="text-xs">
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="sm:col-span-6 lg:col-span-3 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Clasificación de campos</label>
              <Combobox
                items={confidencialOptions}
                value={confidencialOptions.find((o) => o.value === confidencialFilter) || confidencialOptions[0]}
                onValueChange={(val: any) => {
                  if (val) setConfidencialFilter(typeof val === "string" ? val : val.value);
                }}
              >
                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 shadow-none">
                  <span className="truncate">
                    {confidencialOptions.find((o) => o.value === confidencialFilter)?.label || "Cualquier clasificación"}
                  </span>
                </ComboboxSelectTrigger>
                <ComboboxContent align="end" className="w-64">
                  <ComboboxList>
                    {confidencialOptions.map((opt) => (
                      <ComboboxItem key={opt.value} value={opt} className="text-xs">
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>
        </Card>

        {/* Tabla de Solicitudes */}
        <Card className="bg-surface border-border shadow-xs rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-bold text-xs text-foreground">ID Solicitud</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Institución Solicitante</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Proyecto</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Fuente Solicitada</TableHead>
                  <TableHead className="font-bold text-xs text-foreground text-center">Campos / Tipo</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Fecha Recepción</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Estado</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Revisor Asignado</TableHead>
                  <TableHead className="font-bold text-xs text-foreground text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSolicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                      No se encontraron solicitudes con los criterios seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSolicitudes.map((solicitud) => {
                    const hasConfidencial = tieneCamposConfidenciales(solicitud);
                    const isPendienteAsignacion =
                      solicitud.estado === "Pendiente de asignación en Gestión" ||
                      solicitud.estado === "Pendiente de nueva asignación";
                    const isNuevaAsignacion = solicitud.estado === "Pendiente de nueva asignación";

                    return (
                      <TableRow key={solicitud.id} className="hover:bg-muted/20 transition-colors">
                        {/* ID Solicitud */}
                        <TableCell className="font-mono font-bold text-xs text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span>{solicitud.id}</span>
                            {solicitud.versionExpediente && solicitud.versionExpediente > 1 && (
                              <Badge tone="info" appearance="outline" size="sm" className="font-mono text-[10px] px-1 py-0">
                                v{solicitud.versionExpediente}
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Institución */}
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate max-w-[180px]" title={solicitud.institucion}>
                              {solicitud.institucion}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground block">{solicitud.tipoInstitucion}</span>
                        </TableCell>

                        {/* Proyecto */}
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Briefcase className="size-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[170px]" title={solicitud.proyectoNombre || "Proyecto institucional"}>
                              {solicitud.proyectoNombre || "Proyecto institucional"}
                            </span>
                          </div>
                          {solicitud.proyectoId && (
                            <span className="text-[10px] font-mono text-muted-foreground block">{solicitud.proyectoId}</span>
                          )}
                        </TableCell>

                        {/* Fuente solicitada */}
                        <TableCell className="text-xs">
                          <div className="font-semibold text-foreground truncate max-w-[180px]" title={solicitud.fuentePrincipal}>
                            {solicitud.fuentePrincipal}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate block max-w-[180px]" title={solicitud.servicioPrincipal}>
                            {solicitud.servicioPrincipal}
                          </span>
                        </TableCell>

                        {/* Cantidad de campos y confidencial */}
                        <TableCell className="text-xs text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-bold text-foreground font-mono">
                              {solicitud.camposCount || solicitud.fuentes?.[0]?.campos?.length || 0}
                            </span>
                            {hasConfidencial ? (
                              <Badge tone="warning" appearance="soft" size="sm" className="text-[10px] gap-1 px-1.5 py-0">
                                <Lock className="size-2.5" />
                                Confidencial
                              </Badge>
                            ) : (
                              <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px] gap-1 px-1.5 py-0">
                                <Unlock className="size-2.5" />
                                Accesible
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Fecha de recepción */}
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {solicitud.fecha.substring(0, 10)}
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-xs">
                          <Badge
                            tone={
                              isNuevaAsignacion
                                ? "warning"
                                : isPendienteAsignacion
                                ? "warning"
                                : solicitud.estado.includes("Aprobada")
                                ? "success"
                                : solicitud.estado === "Observada"
                                ? "danger"
                                : "info"
                            }
                            appearance="soft"
                            size="sm"
                            className="font-semibold"
                          >
                            {solicitud.estado}
                          </Badge>
                        </TableCell>

                        {/* Revisor Asignado */}
                        <TableCell className="text-xs">
                          {solicitud.revisorAsignado ? (
                            <div className="flex items-center gap-1.5">
                              <div className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                                {solicitud.revisorAsignado.charAt(0)}
                              </div>
                              <span className="font-medium text-foreground">{solicitud.revisorAsignado}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">Sin asignar</span>
                          )}
                        </TableCell>

                        {/* Acciones */}
                        <TableCell className="text-xs text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Ver Expediente como contexto */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSolicitudExpediente(solicitud)}
                              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                              title="Consultar expediente como contexto"
                            >
                              <Eye className="size-3.5" />
                              <span className="hidden sm:inline">Expediente</span>
                            </Button>

                            {/* Asignar Revisor (Acción principal) */}
                            <Button
                              variant={isPendienteAsignacion ? "primary" : "outline"}
                              size="sm"
                              onClick={() => {
                                setSolicitudToAssign(solicitud);
                                setSelectedRevisorId(solicitud.revisorAsignadoId || "U-EQGEST");
                                setObservacionAsignacion("");
                              }}
                              className={cn(
                                "h-8 px-3 text-xs gap-1.5 font-semibold",
                                isNuevaAsignacion && "bg-amber-600 hover:bg-amber-700 text-white"
                              )}
                            >
                              <UserCheck className="size-3.5" />
                              <span>{solicitud.revisorAsignado ? "Reasignar" : "Asignar"}</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* DIALOG: ASIGNAR REVISOR DE GESTIÓN */}
        <Dialog open={!!solicitudToAssign} onOpenChange={(open) => !open && setSolicitudToAssign(null)}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                {solicitudToAssign?.revisorAsignado ? "Reasignar revisor de Gestión" : "Asignar revisor de Gestión"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Seleccione manualmente un revisor activo del Equipo de Gestión para realizar la revisión funcional del expediente.
              </DialogDescription>
            </DialogHeader>

            {solicitudToAssign && (
              <div className="space-y-4 my-2 text-xs">
                {/* Resumen del expediente a asignar */}
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Solicitud:</span>
                    <strong className="text-foreground font-mono">
                      {solicitudToAssign.id} (v{solicitudToAssign.versionExpediente || 1})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Institución solicitante:</span>
                    <strong className="text-foreground">{solicitudToAssign.institucion}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proyecto:</span>
                    <strong className="text-foreground truncate max-w-[240px]">
                      {solicitudToAssign.proyectoNombre || "Proyecto institucional"}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fuente solicitada:</span>
                    <strong className="text-foreground truncate max-w-[240px]">
                      {solicitudToAssign.fuentePrincipal}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Director asignante:</span>
                    <strong className="text-foreground">Director Área de Gestión</strong>
                  </div>
                </div>

                {/* Aviso para solicitudes subsanadas */}
                {solicitudToAssign.estado === "Pendiente de nueva asignación" && (
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Esta solicitud fue <strong>subsanada por el Coordinador</strong> (versión v{solicitudToAssign.versionExpediente || 2}). Por estándar del proceso, requiere una nueva asignación formal que quedará debidamente registrada en la auditoría.
                    </p>
                  </div>
                )}

                {/* Selector de Revisor Activo */}
                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Seleccione persona activa del Equipo de Gestión <span className="text-destructive">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {REVISORES_GESTION.map((rev) => {
                      const isSel = selectedRevisorId === rev.id;
                      return (
                        <button
                          type="button"
                          key={rev.id}
                          onClick={() => setSelectedRevisorId(rev.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer",
                            isSel
                              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 shadow-xs"
                              : "border-border/80 bg-background hover:bg-muted/30 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "size-8 rounded-full flex items-center justify-center font-bold text-xs",
                              isSel ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                            )}>
                              {rev.nombre.charAt(0)}
                            </div>
                            <div>
                              <p className={cn("text-xs font-bold", isSel ? "text-primary" : "text-foreground")}>
                                {rev.nombre}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {rev.cargo} · {rev.especialidad}
                              </p>
                            </div>
                          </div>
                          {isSel && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Observaciones o instrucciones */}
                <div className="space-y-1.5 pt-1">
                  <label className="font-semibold text-foreground block">
                    Instrucciones u observaciones de asignación (Opcional):
                  </label>
                  <Textarea
                    rows={2}
                    value={observacionAsignacion}
                    onChange={(e) => setObservacionAsignacion(e.target.value)}
                    placeholder="Indique prioridades, plazos sugeridos o notas para el revisor..."
                    className="text-xs bg-background border-border"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setSolicitudToAssign(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAsignacion}
                className="gap-1.5 font-semibold shadow-xs"
              >
                <UserCheck className="size-4" />
                <span>Confirmar asignación</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SHEET (DRAWER): CONSULTA DE EXPEDIENTE COMO CONTEXTO */}
        <Sheet
          open={!!selectedSolicitudExpediente}
          onOpenChange={(open) => !open && setSelectedSolicitudExpediente(null)}
        >
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6">
            {selectedSolicitudExpediente && (
              <>
                <SheetHeader className="pb-4 border-b border-border/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-foreground">
                      {selectedSolicitudExpediente.id}
                    </span>
                    <Badge tone="info" appearance="soft" size="sm">
                      v{selectedSolicitudExpediente.versionExpediente || 1}
                    </Badge>
                  </div>
                  <SheetTitle className="text-xl font-bold text-foreground">
                    Expediente Técnico de Acceso
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Consulta informativa para el Director de Gestión. La revisión funcional la efectúa el revisor asignado.
                  </SheetDescription>
                </SheetHeader>

                {/* Ficha Resumen */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Institución solicitante:</span>
                    <strong className="text-foreground">{selectedSolicitudExpediente.institucion}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Proyecto:</span>
                    <strong className="text-foreground truncate block" title={selectedSolicitudExpediente.proyectoNombre}>
                      {selectedSolicitudExpediente.proyectoNombre || "Proyecto institucional"}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Modalidad solicitada:</span>
                    <strong className="text-primary block">{selectedSolicitudExpediente.modalidad || "API individual"}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30 border border-border">
                    <span className="text-muted-foreground block text-[11px]">Cupo solicitado:</span>
                    <strong className="text-foreground font-mono block">
                      {(selectedSolicitudExpediente.cupo || 50000).toLocaleString()} registros
                    </strong>
                  </div>
                </div>

                {/* Fuente y Campos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Database className="size-4 text-primary" />
                      Fuente y Campos Requeridos
                    </h3>
                    <Badge tone="neutral" appearance="outline" size="sm">
                      {selectedSolicitudExpediente.fuentes?.[0]?.campos?.length || 0} campos
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/80 bg-background text-xs space-y-1">
                    <span className="text-muted-foreground text-[11px] block">Fuente única solicitada:</span>
                    <strong className="text-foreground text-sm block">
                      {selectedSolicitudExpediente.fuentePrincipal}
                    </strong>
                    <span className="text-muted-foreground text-[11px] block">
                      Servicio: {selectedSolicitudExpediente.servicioPrincipal}
                    </span>
                  </div>

                  {/* Lista de Campos con Finalidad y Justificación */}
                  <div className="space-y-3 pt-2">
                    {selectedSolicitudExpediente.fuentes?.[0]?.campos?.map((campo) => (
                      <div
                        key={campo.id}
                        className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground">{campo.nombre}</span>
                          {campo.clasificacion === "Confidencial" ? (
                            <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                              <Lock className="size-2.5" />
                              Confidencial
                            </Badge>
                          ) : (
                            <Badge tone="neutral" appearance="soft" size="sm" className="gap-1">
                              <Unlock className="size-2.5" />
                              Accesible
                            </Badge>
                          )}
                        </div>

                        {campo.descripcion && (
                          <p className="text-[11px] text-muted-foreground">{campo.descripcion}</p>
                        )}

                        <div className="p-2.5 rounded-lg bg-background border border-border/60 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block">
                            Finalidad declarada:
                          </span>
                          <p className="text-[11px] text-foreground leading-relaxed">
                            {campo.finalidad || "Finalidad requerida para el trámite institucional."}
                          </p>
                        </div>

                        {campo.clasificacion === "Confidencial" && (
                          <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/30 space-y-1">
                            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide block">
                              Justificación jurídica presentada:
                            </span>
                            <p className="text-[11px] text-foreground leading-relaxed">
                              {campo.fundamento || "Base legal de interoperabilidad conforme normativa vigente."}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documentos de soporte */}
                <div className="space-y-2 pt-2 border-t border-border/70">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="size-4 text-primary" />
                    Documentos de Soporte
                  </h3>
                  <div className="space-y-2">
                    {(selectedSolicitudExpediente.documentos || [
                      { id: "d-1", nombre: "Oficio_Solicitud_Interoperabilidad.pdf", tipo: "Oficio", fecha: "2026-09-24", estado: "Recibido" }
                    ]).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-primary shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">{doc.nombre}</p>
                            <span className="text-[11px] text-muted-foreground">
                              {doc.tipo} · {doc.fechaCarga}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Visualizando documento: ${doc.nombre}`)}
                          className="h-7 text-xs text-primary gap-1"
                        >
                          <ExternalLink className="size-3" />
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historial de Asignaciones y Reasignaciones */}
                <div className="space-y-3 pt-2 border-t border-border/70">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <History className="size-4 text-primary" />
                    Historial de Asignaciones
                  </h3>

                  {selectedSolicitudExpediente.historialAsignaciones && selectedSolicitudExpediente.historialAsignaciones.length > 0 ? (
                    <div className="space-y-2.5">
                      {selectedSolicitudExpediente.historialAsignaciones.map((asig) => (
                        <div
                          key={asig.id}
                          className="p-3 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">
                              Asignado a: <strong className="text-primary">{asig.revisorNombre}</strong>
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">{asig.fecha}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            Asignó: {asig.director} · Versión de expediente: v{asig.versionExpediente}
                          </p>
                          {asig.observacion && (
                            <p className="text-[11px] text-foreground italic bg-background p-1.5 rounded-lg border border-border/60">
                              &ldquo;{asig.observacion}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Aún no registra asignaciones previas.
                    </p>
                  )}
                </div>

                {/* Botón de acción directo desde el drawer */}
                <div className="pt-4 border-t border-border/70 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSolicitudToAssign(selectedSolicitudExpediente);
                      setSelectedRevisorId(selectedSolicitudExpediente.revisorAsignadoId || "U-EQGEST");
                      setObservacionAsignacion("");
                      setSelectedSolicitudExpediente(null);
                    }}
                    className="gap-1.5 font-semibold shadow-xs"
                  >
                    <UserCheck className="size-4" />
                    <span>Asignar revisor ahora</span>
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </WireframeDashboardLayout>
  );
}
