"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TableProperties, Columns, Layers, Smartphone, Sparkles, Filter, ChevronDown, ChevronRight, MoreHorizontal, FileText, CheckCircle2, Rows, Table as TableIcon, Trash2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious
} from "@/components/ui/pagination";
import {
  Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";




const SAMPLE_DATA = [
  { id: "ORD-1045", client: "Unidad Educativa Manuela Cañizares", status: "Completado", total: "$1,250.00", date: "15 May 2026", items: 3 },
  { id: "ORD-1044", client: "Colegio Técnico Don Bosco", status: "En Proceso", total: "$890.00", date: "14 May 2026", items: 2 },
  { id: "ORD-1043", client: "Instituto Tecnológico Sucre", status: "Pendiente", total: "$2,450.00", date: "13 May 2026", items: 5 },
];

export function TablesCategoryShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [expandedId, setExpandedId] = React.useState<string | null>("ORD-1045");
  const [visibleColumns, setVisibleColumns] = React.useState({
    id: true,
    client: true,
    status: true,
    total: true,
    date: true,
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === SAMPLE_DATA.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(SAMPLE_DATA.map(d => d.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* 1. DATA TABLE & SELECTABLE TABLE */}
      <SubSection icon={TableIcon} id="data-table" title="Data Table & Selectable Table" description="Tabla con selección múltiple por filas, estado de encabezado y badges de estado." registerSection={registerSection}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-semibold">
              {selectedIds.length} fila(s) seleccionadas
            </span>
            {selectedIds.length > 0 && (
              <Button variant="danger" size="sm">Eliminar seleccionados ({selectedIds.length})</Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === SAMPLE_DATA.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                {visibleColumns.id && <TableHead>ID</TableHead>}
                {visibleColumns.client && <TableHead>Cliente / Institución</TableHead>}
                {visibleColumns.status && <TableHead>Estado</TableHead>}
                {visibleColumns.total && <TableHead>Total</TableHead>}
                {visibleColumns.date && <TableHead>Fecha</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_DATA.map((row) => (
                <TableRow key={row.id} data-state={selectedIds.includes(row.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={() => toggleSelectOne(row.id)}
                    />
                  </TableCell>
                  {visibleColumns.id && <TableCell className="font-bold">{row.id}</TableCell>}
                  {visibleColumns.client && <TableCell className="font-semibold">{row.client}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge tone={row.status === "Completado" ? "success" : row.status === "En Proceso" ? "info" : "warning"} appearance="soft">
                        {row.status}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.total && <TableCell className="font-bold tabular-nums">{row.total}</TableCell>}
                  {visibleColumns.date && <TableCell className="text-muted-foreground">{row.date}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SubSection>

      {/* 2. EXPANDABLE ROW & ROW ACTIONS */}
      <SubSection icon={Rows} id="expandable-row" title="Expandable Row & Row Actions" description="Filas desplegables accesibles con animación suave de apertura y menú contextual de acciones." registerSection={registerSection}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Institución</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-16 text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SAMPLE_DATA.map((row) => {
              const isExpanded = expandedId === row.id;
              const rowContentId = `expandable-content-${row.id}`;

              return (
                <React.Fragment key={row.id}>
                  <TableRow className={cn("transition-colors duration-200", isExpanded && "bg-primary/10 font-medium")}>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        aria-expanded={isExpanded}
                        aria-controls={rowContentId}
                        aria-label={isExpanded ? `Contraer fila de ${row.client}` : `Expandir fila de ${row.client}`}
                        className="size-8 rounded-lg hover:bg-primary/20 text-primary transition-transform duration-300"
                      >
                        <ChevronRight className={cn("size-4 transition-transform duration-300", isExpanded && "rotate-90 text-primary")} />
                      </Button>
                    </TableCell>
                    <TableCell className="font-heading font-bold tracking-wider text-foreground">{row.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{row.client}</TableCell>
                    <TableCell className="font-bold tabular-nums text-foreground">{row.total}</TableCell>
                    <TableCell>
                      <Badge tone={row.status === "Completado" ? "success" : "info"} appearance="soft">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10" aria-label="Ver ficha">
                                <FileText className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Ver ficha completa</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-success hover:bg-success/10" aria-label="Aprobar">
                                <CheckCircle2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Aprobar solicitud</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-danger hover:bg-danger/10" aria-label="Eliminar">
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" variant="danger">Eliminar registro</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Fila con animación CSS fluida y accesibilidad WAI-ARIA */}
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="p-0 border-0">
                      <div
                        id={rowContentId}
                        role="region"
                        aria-labelledby={`row-${row.id}`}
                        className={cn(
                          "grid transition-all duration-300 ease-in-out overflow-hidden",
                          isExpanded ? "grid-rows-[1fr] opacity-100 py-3" : "grid-rows-[0fr] opacity-0 py-0"
                        )}
                      >
                        <div className="min-h-0 px-4 pb-2">
                          <div className="p-5 rounded-2xl border border-border/40 bg-surface shadow-sm space-y-3 text-xs text-left animate-in fade-in duration-300">
                            <div className="flex items-center justify-between border-b border-border/30 pb-2">
                              <span className="font-bold text-foreground text-sm flex items-center gap-2">
                                <FileText className="size-4 text-primary" />
                                Detalle de Servicios Contratados ({row.items} ítemas)
                              </span>
                              <span className="text-[11px] text-muted-foreground font-mono">Actualizado: {row.date}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                              <div className="p-3 rounded-xl bg-muted border border-border/40">
                                <p className="font-bold text-foreground">Mantenimiento de Aulas</p>
                                <p className="text-muted-foreground">$500.00 • Reparación estructural</p>
                              </div>
                              <div className="p-3 rounded-xl bg-muted border border-border/40">
                                <p className="font-bold text-foreground">Equipamiento Tecnológico</p>
                                <p className="text-muted-foreground">$390.00 • Laboratorio informático</p>
                              </div>
                              <div className="p-3 rounded-xl bg-muted border border-border/40">
                                <p className="font-bold text-foreground">Inspección de Seguridad</p>
                                <p className="text-muted-foreground">$360.00 • Evaluación técnica</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </SubSection>

      {/* 3. COLUMN SELECTOR & TABLE PAGINATION */}
      <SubSection icon={Columns} id="column-selector" title="Column Selector & Table Pagination" description="Filtro emergente de columnas visibles con tabla paginada e integración completa del componente Pagination." registerSection={registerSection}>
        <div className="space-y-4">
          {/* Header de controles: Selector de columnas e informacion de registros */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="primary" size="sm" className="shadow-xs font-bold">
                  <Columns className="size-4 mr-2" /> Visibilidad de Columnas
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-3 space-y-2 bg-surface/95 backdrop-blur-md border border-border shadow-xl rounded-xl">
                <p className="text-xs font-bold text-foreground pb-1 border-b border-border/50">Selecciona Columnas</p>
                {Object.keys(visibleColumns).map((colKey) => (
                  <label key={colKey} className="flex items-center gap-2.5 text-xs font-medium text-foreground cursor-pointer hover:bg-muted/40 p-1.5 rounded-lg transition-colors">
                    <Checkbox
                      checked={visibleColumns[colKey as keyof typeof visibleColumns]}
                      onCheckedChange={(checked) =>
                        setVisibleColumns(prev => ({ ...prev, [colKey]: Boolean(checked) }))
                      }
                    />
                    <span className="capitalize">{colKey}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>

            <p className="text-xs text-muted-foreground font-medium">
              Mostrando <span className="font-bold text-foreground">1-3</span> de <span className="font-bold text-foreground">12</span> registros
            </p>
          </div>

          {/* Tabla Dinámica Paginada */}
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.id && <TableHead>ID</TableHead>}
                {visibleColumns.client && <TableHead>Cliente / Institución</TableHead>}
                {visibleColumns.status && <TableHead>Estado</TableHead>}
                {visibleColumns.total && <TableHead>Total</TableHead>}
                {visibleColumns.date && <TableHead>Fecha</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_DATA.map((row) => (
                <TableRow key={row.id}>
                  {visibleColumns.id && <TableCell className="font-bold text-foreground">{row.id}</TableCell>}
                  {visibleColumns.client && <TableCell className="font-semibold text-foreground">{row.client}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge tone={row.status === "Completado" ? "success" : row.status === "En Proceso" ? "info" : "warning"} appearance="soft">
                        {row.status}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.total && <TableCell className="font-bold tabular-nums text-foreground">{row.total}</TableCell>}
                  {visibleColumns.date && <TableCell className="text-muted-foreground">{row.date}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Componente Pagination Oficial del Sistema al pie de la tabla */}
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <span className="text-xs text-muted-foreground hidden sm:block">Página 1 de 4</span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#column-selector" aria-label="Página anterior" /></PaginationItem>
                <PaginationItem><PaginationLink href="#column-selector" isActive>1</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#column-selector">2</PaginationLink></PaginationItem>
                <PaginationItem><PaginationLink href="#column-selector">3</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#column-selector" aria-label="Página siguiente" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </SubSection>

      {/* 4. MOBILE CARD ROW */}
      <SubSection icon={Smartphone} id="mobile-card-row" title="Mobile Card Row (Responsive)" description="Representación de fila en tarjeta adaptable para pantallas estrechas." registerSection={registerSection}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_DATA.map((row) => (
            <div key={row.id} className="p-4 rounded-xl border border-border bg-surface space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-primary">{row.id}</span>
                <Badge tone={row.status === "Completado" ? "success" : "info"} appearance="soft">{row.status}</Badge>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{row.client}</p>
                <p className="text-xs text-muted-foreground">{row.date}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-xs text-muted-foreground">Monto:</span>
                <span className="font-bold text-sm text-foreground">{row.total}</span>
              </div>
            </div>
          ))}
        </div>
      </SubSection>
    </div>
  );
}
