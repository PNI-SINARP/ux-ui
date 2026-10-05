"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  FolderKanban,
  FolderPlus,
  Search,
  Building2,
  Network,
  Calendar,
  Layers,
  FileQuestion,
  ChevronRight,
  X,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import {
  useProyectosStore,
  type ProyectoInstitucional,
} from "@/modules/proyectos/data/proyectos-store";
import { CrearProyectoDialog } from "@/modules/proyectos/components/crear-proyecto-dialog";

export function ProyectosView() {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const {
    proyectos,
    isLoaded,
    getProyectosPorInstitucion,
    restablecerDatosDemo,
  } = useProyectosStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCrearDialogOpen, setIsCrearDialogOpen] = useState(false);

  // Resolver usuario coordinador y su institución
  const coordinadorUser =
    activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const institucionCoordinador =
    coordinadorUser?.institution || "Ministerio de Educación";
  const coordinadorNombre = coordinadorUser?.name || "Mariana Almeida";

  // Proyectos pertenecientes a la institución del Coordinador
  const proyectosInstitucionales = useMemo(() => {
    return getProyectosPorInstitucion(institucionCoordinador);
  }, [getProyectosPorInstitucion, institucionCoordinador]);

  // Filtrado por búsqueda (ID, nombre, propósito)
  const proyectosFiltrados = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return proyectosInstitucionales;
    return proyectosInstitucionales.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.nombre.toLowerCase().includes(q) ||
        p.proposito.toLowerCase().includes(q)
    );
  }, [proyectosInstitucionales, searchQuery]);

  // Métricas rápidas
  const totalProyectos = proyectosInstitucionales.length;
  const proyectosConSolicitudes = proyectosInstitucionales.filter(
    (p) => p.solicitudes && p.solicitudes.length > 0
  ).length;
  const totalSolicitudesVinculadas = proyectosInstitucionales.reduce(
    (acc, p) => acc + (p.solicitudes ? p.solicitudes.length : 0),
    0
  );

  const handleProyectoCreado = (nuevo: ProyectoInstitucional) => {
    router.push(`/proyectos/${nuevo.id}`);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="proyectos"
      currentUser={coordinadorUser}
      breadcrumbs={[{ label: "Proyectos" }]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Encabezado Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full border-b border-border/60 pb-5">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Proyectos institucionales
                </h1>
                <Badge tone="primary" appearance="soft" size="sm">
                  Flujo BN-05
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                Bandeja de proyectos de interoperabilidad pertenecientes a{" "}
                <strong className="text-foreground font-semibold">
                  {institucionCoordinador}
                </strong>
                . Agrupa y gestiona los requerimientos de acceso a fuentes de datos autorizadas del SINARP.
              </p>
            </div>

            {/* Acción de Cabecera: Crear Proyecto (PRJ-01) */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsCrearDialogOpen(true)}
                leftIcon={<FolderPlus className="size-4" />}
                className="shadow-sm font-semibold"
              >
                Crear proyecto
              </Button>
            </div>
          </div>

          {/* Tarjetas KPI de Resumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 w-full">
            {/* Total de Proyectos */}
            <div className="p-4 rounded-xl border border-border/80 bg-surface shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Total de proyectos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-heading font-bold text-foreground">
                  {totalProyectos}
                </span>
                <FolderKanban className="size-4 text-primary" />
              </div>
              <span className="text-[11px] text-muted-foreground">
                Registrados en {institucionCoordinador}
              </span>
            </div>

            {/* Proyectos con Solicitudes */}
            <div className="p-4 rounded-xl border border-border/80 bg-surface shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Con solicitudes
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-heading font-bold text-foreground">
                  {proyectosConSolicitudes}
                </span>
                <Layers className="size-4 text-success" />
              </div>
              <span className="text-[11px] text-muted-foreground">
                Proyectos con trámites activos
              </span>
            </div>

            {/* Solicitudes de Interoperabilidad */}
            <div className="p-4 rounded-xl border border-border/80 bg-surface shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Solicitudes de datos
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-heading font-bold text-foreground">
                  {totalSolicitudesVinculadas}
                </span>
                <Network className="size-4 text-info" />
              </div>
              <span className="text-[11px] text-muted-foreground">
                Consumos formalizados
              </span>
            </div>

            {/* Entidad Responsable */}
            <div className="p-4 rounded-xl border border-border/80 bg-surface shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Institución responsable
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-heading font-bold text-foreground truncate pr-2">
                  {institucionCoordinador}
                </span>
                <Building2 className="size-4 text-secondary shrink-0" />
              </div>
              <span className="text-[11px] text-muted-foreground truncate block">
                Coordinador: {coordinadorNombre}
              </span>
            </div>
          </div>

          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="relative w-full sm:max-w-md">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar por código, nombre o propósito..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-muted-foreground">
              <span>
                Mostrando <strong>{proyectosFiltrados.length}</strong> de{" "}
                <strong>{totalProyectos}</strong> proyectos
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={restablecerDatosDemo}
                title="Restablecer datos dummy originales"
                className="text-xs h-8 px-2"
              >
                <RotateCcw className="size-3" />
              </Button>
            </div>
          </div>

          {/* Tabla de Proyectos o Estados Vacíos */}
          {!isLoaded ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              Cargando bandeja de proyectos institucionales...
            </div>
          ) : totalProyectos === 0 ? (
            /* Estado Vacío Absoluto (La institución no tiene ningún proyecto) */
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-muted/10 space-y-4 my-2">
              <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <FolderKanban className="size-8" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-heading font-bold text-foreground">
                  No hay proyectos registrados en tu institución
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Comienza creando el primer proyecto institucional para{" "}
                  <strong>{institucionCoordinador}</strong>. Esto te permitirá agrupar y canalizar solicitudes de interoperabilidad de fuentes de datos.
                </p>
              </div>
              <Button
                variant="primary"
                size="default"
                onClick={() => setIsCrearDialogOpen(true)}
                leftIcon={<FolderPlus className="size-4" />}
                className="font-semibold shadow-sm"
              >
                Crear primer proyecto
              </Button>
            </div>
          ) : proyectosFiltrados.length === 0 ? (
            /* Estado Vacío por Búsqueda */
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-3">
              <FileQuestion className="size-10 text-muted-foreground" />
              <div className="space-y-1">
                <h4 className="text-sm font-heading font-semibold text-foreground">
                  No se encontraron proyectos para &quot;{searchQuery}&quot;
                </h4>
                <p className="text-xs text-muted-foreground">
                  Intenta con otro término de búsqueda o limpia el filtro.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                leftIcon={<X className="size-3.5" />}
              >
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            /* Tabla Principal de Proyectos */
            <div className="space-y-2">
              <Table containerClassName="border border-border rounded-xl overflow-hidden bg-background shadow-2xs">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 w-[140px]">
                      ID Proyecto
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 min-w-[240px]">
                      Nombre del proyecto
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 min-w-[280px]">
                      Propósito institucional
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 whitespace-nowrap">
                      Fecha Creación
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 text-center whitespace-nowrap">
                      Solicitudes
                    </TableHead>
                    <TableHead className="font-semibold text-foreground text-xs py-3 px-4 text-right whitespace-nowrap">
                      Acción
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proyectosFiltrados.map((p) => {
                    const cantSolicitudes = p.solicitudes ? p.solicitudes.length : 0;
                    return (
                      <TableRow
                        key={p.id}
                        className="hover:bg-muted/20 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/proyectos/${p.id}`)}
                      >
                        {/* ID del Proyecto */}
                        <TableCell className="py-3 px-4 font-mono text-xs font-semibold text-primary">
                          <span className="px-2 py-0.5 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            {p.id}
                          </span>
                        </TableCell>

                        {/* Nombre del Proyecto + Badge Versión */}
                        <TableCell className="py-3 px-4 text-xs font-semibold text-foreground">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="group-hover:text-primary transition-colors">
                              {p.nombre}
                            </span>
                            <Badge
                              tone={p.version > 1 ? "secondary" : "neutral"}
                              appearance="soft"
                              size="sm"
                              className="text-[9px] py-0 px-1.5"
                            >
                              v{p.version}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Propósito */}
                        <TableCell className="py-3 px-4 text-xs text-muted-foreground">
                          <p className="line-clamp-2 leading-relaxed">
                            {p.proposito}
                          </p>
                        </TableCell>

                        {/* Fecha de Creación */}
                        <TableCell className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3 text-muted-foreground/70" />
                            <span>{p.fechaCreacion}</span>
                          </div>
                        </TableCell>

                        {/* Solicitudes Asociadas */}
                        <TableCell className="py-3 px-4 text-center whitespace-nowrap">
                          {cantSolicitudes > 0 ? (
                            <Badge tone="success" appearance="solid" size="sm">
                              {cantSolicitudes} {cantSolicitudes === 1 ? "solicitud" : "solicitudes"}
                            </Badge>
                          ) : (
                            <Badge tone="neutral" appearance="soft" size="sm">
                              0 solicitudes
                            </Badge>
                          )}
                        </TableCell>

                        {/* Botón Ver Detalle */}
                        <TableCell className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 px-3 group-hover:border-primary group-hover:text-primary"
                          >
                            <Link href={`/proyectos/${p.id}`}>
                              <span>Consultar</span>
                              <ChevronRight className="size-3 ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>

      {/* Modal de Creación PRJ-01 */}
      <CrearProyectoDialog
        open={isCrearDialogOpen}
        onOpenChange={setIsCrearDialogOpen}
        institucionPrecargada={institucionCoordinador}
        coordinadorNombre={coordinadorNombre}
        onProyectoCreado={handleProyectoCreado}
      />
    </WireframeDashboardLayout>
  );
}
