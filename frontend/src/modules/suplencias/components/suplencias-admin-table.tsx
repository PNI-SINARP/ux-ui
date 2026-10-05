"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SuplenciasTrazabilidad } from "./suplencias-trazabilidad";
import type { SuplenciaInstitucional, EstadoSuplencia, ModalidadSuplencia } from "../data/suplencias-store";

interface SuplenciasAdminTableProps {
  suplencias: SuplenciaInstitucional[];
  onActivarSuplencia: (item: SuplenciaInstitucional) => void;
  onDesactivarSuplencia: (item: SuplenciaInstitucional) => void;
}

export function SuplenciasAdminTable({
  suplencias,
  onActivarSuplencia,
  onDesactivarSuplencia,
}: SuplenciasAdminTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [modalidadFilter, setModalidadFilter] = useState<string>("TODAS");
  const [trazabilidadSeleccionada, setTrazabilidadSeleccionada] = useState<SuplenciaInstitucional | null>(null);

  // Filtrado reactivo de datos
  const suplenciasFiltradas = useMemo(() => {
    return suplencias.filter((item) => {
      // Búsqueda por institución o coordinador (titular o suplente)
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.institucion.toLowerCase().includes(q) ||
        item.rucInstitucion.includes(q) ||
        item.titular.nombre.toLowerCase().includes(q) ||
        item.titular.cedula.includes(q) ||
        item.suplente.nombre.toLowerCase().includes(q) ||
        item.suplente.cedula.includes(q);

      // Filtro de estado
      const matchEstado =
        estadoFilter === "TODOS" || item.estado === estadoFilter;

      // Filtro de modalidad
      const matchModalidad =
        modalidadFilter === "TODAS" || item.modalidad === modalidadFilter;

      return matchSearch && matchEstado && matchModalidad;
    });
  }, [suplencias, searchTerm, estadoFilter, modalidadFilter]);

  // Formato del período para la tabla
  const getPeriodoDisplay = (item: SuplenciaInstitucional) => {
    if (item.modalidad === "ADMINISTRATIVA") {
      return item.estado === "ACTIVA"
        ? "Vigente (indefinido)"
        : item.instanteInicioReal
        ? `Desde ${new Date(item.instanteInicioReal).toLocaleDateString()}`
        : "Sin fecha definida";
    }
    if (item.fechaInicial && item.fechaFinal) {
      return `${item.fechaInicial} al ${item.fechaFinal}`;
    }
    return "No programado";
  };

  // Badge semántico de estado
  const getBadgeEstado = (estado: EstadoSuplencia) => {
    switch (estado) {
      case "SIN_SUPLENCIA":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-[10px]">
            Sin suplencia
          </Badge>
        );
      case "PROGRAMADA":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="font-bold text-[10px] gap-1">
            <Calendar className="size-2.5" />
            Programada
          </Badge>
        );
      case "ACTIVA":
        return (
          <Badge tone="warning" appearance="solid" size="sm" className="font-bold text-[10px] gap-1 shadow-2xs">
            <span className="size-1.5 rounded-full bg-white animate-pulse" />
            Activa
          </Badge>
        );
      case "ACTIVACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold text-[10px]">
            Activación pendiente
          </Badge>
        );
      case "FINALIZADA":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold text-[10px] gap-1">
            <CheckCircle2 className="size-2.5" />
            Finalizada
          </Badge>
        );
      case "DESACTIVADA_ADMINISTRATIVAMENTE":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold text-[10px]">
            Desactivada admin.
          </Badge>
        );
      case "DESPLAZADA_POR_SUPLENCIA_MANUAL":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold text-[10px]">
            Desplazada por manual
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-border shadow-2xs">
        {/* Buscador */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por institución, RUC o coordinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs font-sans h-9"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
            <SlidersHorizontal className="size-3.5 text-primary" />
            <span className="hidden sm:inline font-medium">Estado:</span>
          </div>

          <select
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
            className="h-9 px-3 rounded-full border border-input bg-surface text-xs font-sans text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="SIN_SUPLENCIA">Sin suplencia</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="ACTIVA">Activa</option>
            <option value="ACTIVACION_PENDIENTE">Activación pendiente</option>
            <option value="FINALIZADA">Finalizada</option>
            <option value="DESACTIVADA_ADMINISTRATIVAMENTE">Desactivada administrativamente</option>
          </select>

          <select
            value={modalidadFilter}
            onChange={(e) => setModalidadFilter(e.target.value)}
            className="h-9 px-3 rounded-full border border-input bg-surface text-xs font-sans text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer"
          >
            <option value="TODAS">Todas las modalidades</option>
            <option value="PROGRAMADA">Programada</option>
            <option value="ADMINISTRATIVA">Administrativa</option>
          </select>

          {(searchTerm || estadoFilter !== "TODOS" || modalidadFilter !== "TODAS") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setEstadoFilter("TODOS");
                setModalidadFilter("TODAS");
              }}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3 pl-5">
                Institución
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Titular
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Suplente
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Modalidad
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Periodo
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Estado
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3">
                Última actualización
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3 pr-5 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {suplenciasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-xs sm:text-sm">
                  No se encontraron suplencias institucionales con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              suplenciasFiltradas.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors border-b border-border/60",
                    item.idInstitucion === "INST-MINEDUC" && "bg-primary/5 font-medium"
                  )}
                >
                  {/* Institución */}
                  <TableCell className="pl-5 py-3.5">
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        <Building2 className="size-3 text-primary shrink-0" />
                        <span>{item.institucion}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        RUC: {item.rucInstitucion}
                      </p>
                    </div>
                  </TableCell>

                  {/* Titular */}
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block">
                        {item.titular.nombre}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-mono">{item.titular.cedula}</span>
                        <span>·</span>
                        <span
                          className={cn(
                            "font-bold text-[10px]",
                            item.titular.estado === "ACTIVO" ? "text-success" : "text-warning"
                          )}
                        >
                          {item.titular.estado === "ACTIVO" ? "Activo" : "Inactivo temp."}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Suplente */}
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-foreground block">
                        {item.suplente.nombre}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="font-mono">{item.suplente.cedula}</span>
                        <span>·</span>
                        <span
                          className={cn(
                            "font-bold text-[10px]",
                            item.suplente.estado === "ACTIVO" ? "text-success" : "text-muted-foreground"
                          )}
                        >
                          {item.suplente.estado === "ACTIVO" ? "Activo" : "Sin acceso"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Modalidad */}
                  <TableCell className="py-3.5 text-xs text-foreground">
                    {item.modalidad === "NINGUNA" ? (
                      <span className="text-muted-foreground italic text-[11px]">Ninguna</span>
                    ) : (
                      <Badge
                        tone={item.modalidad === "PROGRAMADA" ? "primary" : "warning"}
                        appearance="outline"
                        size="sm"
                        className="text-[9px] font-bold"
                      >
                        {item.modalidad}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Periodo */}
                  <TableCell className="py-3.5 text-xs text-muted-foreground">
                    <span className="font-mono text-[11px]">{getPeriodoDisplay(item)}</span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="py-3.5">{getBadgeEstado(item.estado)}</TableCell>

                  {/* Última actualización */}
                  <TableCell className="py-3.5 text-xs text-muted-foreground font-mono text-[11px]">
                    {item.ultimaActualizacion}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Botón ver trazabilidad */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTrazabilidadSeleccionada(item)}
                        className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 gap-1"
                        title="Ver historial de trazabilidad"
                      >
                        <History className="size-3.5" />
                        <span className="hidden xl:inline">Trazabilidad</span>
                      </Button>

                      {/* Acción según el estado actual */}
                      {item.estado === "ACTIVA" && item.modalidad === "ADMINISTRATIVA" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDesactivarSuplencia(item)}
                          className="text-xs h-7 px-2.5 font-bold gap-1 border-danger/40 text-danger hover:bg-danger/10"
                        >
                          <RotateCcw className="size-3" />
                          <span>Desactivar suplencia</span>
                        </Button>
                      ) : item.estado === "ACTIVA" && item.modalidad === "PROGRAMADA" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="text-xs h-7 px-2.5 text-muted-foreground"
                          title="Finaliza automáticamente al vencer la fecha"
                        >
                          <span>En curso (programada)</span>
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onActivarSuplencia(item)}
                          className="text-xs h-7 px-2.5 font-bold gap-1 shadow-2xs"
                        >
                          <ShieldAlert className="size-3" />
                          <span>Activar suplencia</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet Lateral para Trazabilidad */}
      <Sheet
        open={Boolean(trazabilidadSeleccionada)}
        onOpenChange={(open) => !open && setTrazabilidadSeleccionada(null)}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <SheetTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
              <History className="size-5 text-primary" />
              <span>Trazabilidad de suplencia</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {trazabilidadSeleccionada?.institucion} (RUC: {trazabilidadSeleccionada?.rucInstitucion})
            </SheetDescription>
          </SheetHeader>

          {trazabilidadSeleccionada && (
            <div className="py-4 space-y-4">
              <SuplenciasTrazabilidad
                eventos={trazabilidadSeleccionada.trazabilidad}
                showHeader={false}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
