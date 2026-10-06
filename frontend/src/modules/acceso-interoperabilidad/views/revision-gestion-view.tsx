"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSignature,
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
  ArrowRight,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { cn } from "@/lib/utils";

// Lista de revisores simulables
const REVISORES_GESTION = [
  { id: "U-EQGEST", nombre: "Ana Torres", cargo: "Revisora Técnica de Gestión" },
  { id: "U-EQGEST2", nombre: "Marcos Silva", cargo: "Revisor Funcional" },
  { id: "U-EQGEST3", nombre: "Elena Viteri", cargo: "Analista de Integración" },
];

export function RevisionGestionView() {
  const router = useRouter();
  const { solicitudes } = useSolicitudesStore();

  // Revisor activo (simulado para pair testing)
  const [activeRevisorId, setActiveRevisorId] = useState<string>("U-EQGEST");
  const activeRevisor = REVISORES_GESTION.find((r) => r.id === activeRevisorId) || REVISORES_GESTION[0];

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");

  const estadoOptions = [
    { value: "ALL", label: "Todas mis asignaciones" },
    { value: "Asignada a revisión de Gestión", label: "Asignadas (Nuevas)" },
    { value: "En revisión de Gestión", label: "En revisión funcional" },
    { value: "Observada", label: "Observadas por mí" },
    { value: "Aprobada por Gestión", label: "Aprobadas por mí" },
  ];

  // Helper confidencial
  const tieneConfidenciales = (s: SolicitudAcceso) => {
    return s.fuentes?.some((f) =>
      f.campos?.some((c) => c.clasificacion === "Confidencial")
    ) || false;
  };

  // Filtrar solicitudes asignadas exclusivamente al revisor actual
  const misSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      // Coincidencia por ID de revisor o nombre
      const asignadaAMi =
        s.revisorAsignadoId === activeRevisor.id ||
        s.revisorAsignado === activeRevisor.nombre ||
        // Si no tiene asignado específico pero está en revisión, permitir visualización para testing
        (!s.revisorAsignadoId && s.estado === "Asignada a revisión de Gestión");

      if (!asignadaAMi) return false;

      // Filtro libre
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "").toLowerCase().includes(term);
        const matchesProyecto = (s.proyectoNombre || "").toLowerCase().includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesProyecto) return false;
      }

      // Filtro de estado
      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) {
        return false;
      }

      return true;
    });
  }, [solicitudes, activeRevisor, searchTerm, estadoFilter]);

  // Métricas del revisor
  const metricas = useMemo(() => {
    const total = misSolicitudes.length;
    const pendientesRevision = misSolicitudes.filter(
      (s) => s.estado === "Asignada a revisión de Gestión" || s.estado === "En revisión de Gestión"
    ).length;
    const observadas = misSolicitudes.filter((s) => s.estado === "Observada").length;
    const aprobadas = misSolicitudes.filter(
      (s) => s.estado === "Aprobada por Gestión" || s.estado === "Pendiente de asignación en Normatividad"
    ).length;
    return { total, pendientesRevision, observadas, aprobadas };
  }, [misSolicitudes]);

  return (
    <WireframeDashboardLayout
      activeMenu="revision-gestion"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: "Revisión Funcional de Gestión" },
      ]}
      headerSlot={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Revisor activo:</span>
          <Combobox
            items={REVISORES_GESTION.map((r) => ({ value: r.id, label: `${r.nombre} (${r.cargo})` }))}
            value={{ value: activeRevisor.id, label: `${activeRevisor.nombre} (${activeRevisor.cargo})` }}
            onValueChange={(val: any) => {
              if (val) setActiveRevisorId(typeof val === "string" ? val : val.value);
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-xs min-w-[220px] bg-background border-border/80" />
            <ComboboxContent align="end" className="w-[300px]">
              <ComboboxList>
                {REVISORES_GESTION.map((r) => (
                  <ComboboxItem key={r.id} value={{ value: r.id, label: `${r.nombre} (${r.cargo})` }} className="text-xs">
                    <div>
                      <p className="font-semibold text-foreground">{r.nombre}</p>
                      <p className="text-[10px] text-muted-foreground">{r.cargo}</p>
                    </div>
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      }
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FileSignature className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                Revisión Funcional de Solicitudes (Equipo de Gestión)
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Bandeja personalizada de <strong>{activeRevisor.nombre}</strong>. Evalúe la viabilidad técnica y pertinencia funcional de la fuente, campos solicitados, finalidades, justificaciones jurídicas visibles, modalidad y cupo (BN-07).
            </p>
          </div>

          <Badge tone="info" appearance="soft" size="md" className="font-semibold px-3 py-1.5 text-xs self-start md:self-center">
            {metricas.pendientesRevision} expediente(s) pendientes de evaluación
          </Badge>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Database className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.total}</span>
              <p className="text-xs text-muted-foreground font-medium">Asignadas a mi cargo</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.pendientesRevision}</span>
              <p className="text-xs text-muted-foreground font-medium">Pendientes de evaluación</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.observadas}</span>
              <p className="text-xs text-muted-foreground font-medium">Observadas en subsanación</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.aprobadas}</span>
              <p className="text-xs text-muted-foreground font-medium">Aprobadas funcionalmente</p>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Búsqueda rápida</label>
              <Search
                placeholder="Buscar por ID, institución, fuente o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full h-10 bg-background rounded-xl border-border/80"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Estado</label>
              <Combobox
                items={estadoOptions}
                value={estadoOptions.find((o) => o.value === estadoFilter) || estadoOptions[0]}
                onValueChange={(val: any) => {
                  if (val) setEstadoFilter(typeof val === "string" ? val : val.value);
                }}
              >
                <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 shadow-none">
                  <span className="truncate">
                    {estadoOptions.find((o) => o.value === estadoFilter)?.label || "Todas mis asignaciones"}
                  </span>
                </ComboboxSelectTrigger>
                <ComboboxContent align="end" className="w-72">
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
          </div>
        </Card>

        {/* Tabla de mis asignaciones */}
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
                  <TableHead className="font-bold text-xs text-foreground">Modalidad & Cupo</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Estado</TableHead>
                  <TableHead className="font-bold text-xs text-foreground text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misSolicitudes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No tienes solicitudes asignadas que coincidan con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  misSolicitudes.map((solicitud) => {
                    const hasConfidencial = tieneConfidenciales(solicitud);
                    const isEvaluable =
                      solicitud.estado === "Asignada a revisión de Gestión" ||
                      solicitud.estado === "En revisión de Gestión";

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
                          <div className="font-medium text-foreground truncate max-w-[180px]" title={solicitud.institucion}>
                            {solicitud.institucion}
                          </div>
                          <span className="text-[11px] text-muted-foreground block">{solicitud.tipoInstitucion}</span>
                        </TableCell>

                        {/* Proyecto */}
                        <TableCell className="text-xs">
                          <div className="font-medium text-foreground truncate max-w-[170px]" title={solicitud.proyectoNombre}>
                            {solicitud.proyectoNombre || "Proyecto institucional"}
                          </div>
                          {solicitud.proyectoId && (
                            <span className="text-[10px] font-mono text-muted-foreground">{solicitud.proyectoId}</span>
                          )}
                        </TableCell>

                        {/* Fuente */}
                        <TableCell className="text-xs">
                          <div className="font-semibold text-foreground truncate max-w-[180px]" title={solicitud.fuentePrincipal}>
                            {solicitud.fuentePrincipal}
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate block max-w-[180px]" title={solicitud.servicioPrincipal}>
                            {solicitud.servicioPrincipal}
                          </span>
                        </TableCell>

                        {/* Campos y confidencial */}
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

                        {/* Modalidad y Cupo */}
                        <TableCell className="text-xs">
                          <span className="font-medium text-foreground block">{solicitud.modalidad || "API individual"}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            {(solicitud.cupo || 50000).toLocaleString()} registros
                          </span>
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-xs">
                          <Badge
                            tone={
                              isEvaluable
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

                        {/* Acción */}
                        <TableCell className="text-xs text-right pr-6">
                          <Link href={`/revision-gestion/${solicitud.id}`}>
                            <Button
                              variant={isEvaluable ? "primary" : "outline"}
                              size="sm"
                              className="h-8 px-3 text-xs gap-1.5 font-semibold"
                            >
                              <span>{isEvaluable ? "Evaluar expediente" : "Ver expediente"}</span>
                              <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </WireframeDashboardLayout>
  );
}
