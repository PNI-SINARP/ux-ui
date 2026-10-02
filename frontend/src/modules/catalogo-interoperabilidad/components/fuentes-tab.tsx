"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  Eye,
  EyeOff,
  FolderArchive,
  Info,
  ChevronDown,
  Building2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardDecorativeIcon } from "@/components/ui/card";
import { Search as SearchInput } from "@/components/ui/search";
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

import { INITIAL_INSTITUCIONES, type FuenteEstado } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export function FuentesTab({ activeRole }: { activeRole?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [institucionFilter, setInstitucionFilter] = useState<string>("ALL");

  const allFuentes = useMemo(() => {
    return INITIAL_INSTITUCIONES.flatMap(inst =>
      inst.fuentes.map(f => ({
        ...f,
        institucionSigla: inst.sigla,
        institucionNombreCompleto: inst.nombre,
        institucionSector: inst.sector
      }))
    );
  }, []);


  const fuentesRoleFiltradas = useMemo(() => {
    if (!activeRole || activeRole === "DGR") return allFuentes;
    if (activeRole === "DTD") return allFuentes.filter(f => f.estado === "PUBLICADO" || f.estado === "OCULTO" || f.estado === "DESACTIVADO");
    if (activeRole === "DPI") return allFuentes.filter(f => f.estado === "PUBLICADO" || f.estado === "OCULTO");
    return allFuentes;
  }, [allFuentes, activeRole]);

  const stats = useMemo(() => {
    const total = fuentesRoleFiltradas.length;
    const publicadas = fuentesRoleFiltradas.filter(f => f.estado === "PUBLICADO").length;
    const ocultas = fuentesRoleFiltradas.filter(f => f.estado === "OCULTO").length;
    const desactivadas = fuentesRoleFiltradas.filter(f => f.estado === "DESACTIVADO").length;
    return { total, publicadas, ocultas, desactivadas };
  }, [fuentesRoleFiltradas]);

  const fuentesFiltradas = useMemo(() => {
    return fuentesRoleFiltradas.filter(f => {
      const matchSearch =
        searchTerm === "" ||
        f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.codigoServicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.institucionNombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.institucionSigla.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado = estadoFilter === "ALL" || f.estado === estadoFilter;
      const matchInst = institucionFilter === "ALL" || f.institucionId === institucionFilter;

      return matchSearch && matchEstado && matchInst;
    });
  }, [fuentesRoleFiltradas, searchTerm, estadoFilter, institucionFilter]);

  const hasActiveFilters = searchTerm !== "" || estadoFilter !== "ALL" || institucionFilter !== "ALL";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-6">
        <div data-tour="tour-bandeja" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h2 className="font-heading text-xl font-bold tracking-tight text-foreground">
              Fuentes del catálogo
            </h2>
            <p className="text-sm text-muted-foreground">
              Consulta las fuentes incorporadas al Catálogo de Interoperabilidad y su estado actual.
            </p>
          </div>
        </div>

        {/* Featured Cards para las Métricas */}
        <div data-tour="tour-resumen" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
              {stats.total}
            </span>
            <span className="text-xs font-semibold text-foreground block">
              Total de fuentes
            </span>
            <CardDecorativeIcon>
              <Database className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-emerald-600 tracking-tight block">
              {stats.publicadas}
            </span>
            <span className="text-xs font-semibold text-emerald-600 block">
              Publicadas
            </span>
            <CardDecorativeIcon>
              <Eye className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
              {stats.ocultas}
            </span>
            <span className="text-xs font-semibold text-foreground block">
              Ocultas
            </span>
            <CardDecorativeIcon>
              <EyeOff className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>

          <Card
            variant="featured"
            className="bg-card hover:bg-muted/40 border border-border shadow-xs transition-all"
            innerClassName="p-5 items-start text-left gap-1"
          >
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground tracking-tight block">
              {stats.desactivadas}
            </span>
            <span className="text-xs font-semibold text-foreground block">
              Desactivadas
            </span>
            <CardDecorativeIcon>
              <FolderArchive className="size-24 text-muted-foreground" />
            </CardDecorativeIcon>
          </Card>
        </div>
      </div>

      {/* Filtros y Tabla */}
      <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
        <div data-tour="tour-filtros" className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-12 lg:col-span-6 flex flex-col gap-1.5">
              <label htmlFor="search-fuentes" className="text-xs font-medium text-muted-foreground">
                Búsqueda general
              </label>
              <SearchInput
                id="search-fuentes"
                placeholder="Buscar por fuente, código o institución..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full bg-background"
              />
            </div>

            <div className="sm:col-span-6 lg:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-between text-xs sm:text-sm font-medium bg-background text-foreground rounded-xl border-border/80 px-3.5 hover:bg-muted/40"
                  >
                    <span className="truncate flex items-center gap-1.5 text-foreground">
                      {estadoFilter === "ALL" && "Todos los estados"}
                      {estadoFilter === "PUBLICADO" && (
                        <><Eye className="size-3.5 text-muted-foreground" />PUBLICADO</>
                      )}
                      {estadoFilter === "OCULTO" && (
                        <><EyeOff className="size-3.5 text-muted-foreground" />OCULTO</>
                      )}
                      {estadoFilter === "DESACTIVADO" && (
                        <><FolderArchive className="size-3.5 text-muted-foreground" />DESACTIVADO</>
                      )}
                    </span>
                    <ChevronDown className="size-4 opacity-60 ml-2 shrink-0 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel className="text-xs">Estado en el catálogo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={estadoFilter} onValueChange={setEstadoFilter}>
                    <DropdownMenuRadioItem value="ALL" className="text-xs">Todos los estados</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="PUBLICADO" className="text-xs">
                      <Eye className="size-3.5 mr-1.5 text-muted-foreground" />PUBLICADO
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="OCULTO" className="text-xs">
                      <EyeOff className="size-3.5 mr-1.5 text-muted-foreground" />OCULTO
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="DESACTIVADO" className="text-xs">
                      <FolderArchive className="size-3.5 mr-1.5 text-muted-foreground" />DESACTIVADO
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="sm:col-span-6 lg:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Institución</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-between text-xs sm:text-sm font-medium bg-background text-foreground rounded-xl border-border/80 px-3.5 hover:bg-muted/40"
                  >
                    <span className="truncate flex items-center gap-1.5 text-foreground">
                      {institucionFilter === "ALL"
                        ? "Todas las instituciones"
                        : INITIAL_INSTITUCIONES.find(i => i.id === institucionFilter)?.sigla || institucionFilter}
                    </span>
                    <ChevronDown className="size-4 opacity-60 ml-2 shrink-0 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 max-h-72 overflow-y-auto">
                  <DropdownMenuLabel className="text-xs">Institución proveedora</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={institucionFilter} onValueChange={setInstitucionFilter}>
                    <DropdownMenuRadioItem value="ALL" className="text-xs">Todas las instituciones</DropdownMenuRadioItem>
                    {INITIAL_INSTITUCIONES.map(inst => (
                      <DropdownMenuRadioItem key={inst.id} value={inst.id} className="text-xs">
                        <span className="font-medium mr-1.5">{inst.sigla}</span>
                        <span className="text-muted-foreground truncate">{inst.nombre}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground font-medium mr-1">Filtros aplicados:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setEstadoFilter("ALL");
                  setInstitucionFilter("ALL");
                }}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                Limpiar todos
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <span className="text-xs text-muted-foreground">
            Mostrando <strong className="text-foreground font-semibold">{fuentesFiltradas.length}</strong> de{" "}
            <strong className="text-foreground font-semibold">{allFuentes.length}</strong> fuentes registradas
          </span>
        </div>

        <div className="overflow-x-auto border-y border-border bg-card mt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Fuente</TableHead>
                <TableHead className="min-w-[180px]">Institución</TableHead>
                <TableHead className="min-w-[140px]" data-tour="tour-estado">Estado</TableHead>
                <TableHead className="text-center min-w-[80px]">Campos</TableHead>
                <TableHead className="min-w-[140px]">Última actualización</TableHead>
                <TableHead className="w-24 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuentesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No se encontraron fuentes bajo los criterios de búsqueda o filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                fuentesFiltradas.map((fuente) => (
                  <TableRow key={fuente.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 whitespace-normal">
                        <span className="font-semibold text-foreground text-sm leading-snug">
                          {fuente.nombre}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                          {fuente.codigoServicio}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 whitespace-normal">
                        <span className="font-medium text-foreground text-xs line-clamp-1">
                          {fuente.institucionSigla}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {fuente.institucionNombreCompleto}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge estado={fuente.estado} size="sm" /></TableCell>
                    <TableCell className="text-center font-mono font-medium text-muted-foreground">
                      {fuente.campos?.length || 0}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {fuente.ultimaActualizacion}
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                              <Link href={`/catalogo-interoperabilidad/administracion/fuentes/${fuente.id}`}>
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs">Ver detalle</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


