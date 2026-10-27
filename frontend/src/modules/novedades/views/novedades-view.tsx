"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Filter,
  Plus,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { cn } from "@/lib/utils";

const NOVEDADES = [
  {
    id: "NOV-2026-001",
    tipo: "SUPRESIÓN",
    entidad: "Dirección General de Registro Civil",
    fecha: "2026-09-15",
    fuente: "Registro de Defunciones",
    estado: "FINALIZADA"
  },
  {
    id: "NOV-2026-002",
    tipo: "CREACIÓN",
    entidad: "Servicio de Rentas Internas",
    fecha: "2026-09-18",
    fuente: "Consulta de RUC",
    estado: "EN PROCESO"
  },
  {
    id: "NOV-2026-003",
    tipo: "MODIFICACIÓN",
    entidad: "Ministerio de Salud Pública",
    fecha: "2026-09-20",
    fuente: "Certificado de Vacunación",
    estado: "RADICADA"
  },
];

export function NovedadesView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const filteredNovedades = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return NOVEDADES;
    return NOVEDADES.filter(
      (n) =>
        n.id.toLowerCase().includes(q) ||
        n.tipo.toLowerCase().includes(q) ||
        n.entidad.toLowerCase().includes(q) ||
        n.fuente.toLowerCase().includes(q) ||
        n.estado.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const getEstadoTone = (estado: string): "success" | "info" | "warning" | "neutral" => {
    switch (estado) {
      case "FINALIZADA":
        return "success";
      case "EN PROCESO":
        return "info";
      case "RADICADA":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getTipoTone = (tipo: string): "danger" | "success" | "primary" | "neutral" => {
    switch (tipo) {
      case "SUPRESIÓN":
        return "danger";
      case "CREACIÓN":
        return "success";
      case "MODIFICACIÓN":
        return "primary";
      default:
        return "neutral";
    }
  };

  return (
    <WireframeDashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight text-foreground">
              Novedades del Catálogo
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las solicitudes de creación, modificación o supresión de fuentes en el catálogo.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Novedad
          </Button>
        </div>

        <Card className="border-border bg-surface">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <CardTitle className="text-lg font-semibold text-foreground">
                Listado de Novedades
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-64">
                  <Search
                    size="sm"
                    placeholder="Buscar novedad..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClear={() => setSearchQuery("")}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0" aria-label="Filtrar">
                  <Filter className="h-4 w-4" />
                </Button>
                <ViewModeToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>
          </CardHeader>
          <CardContent className={cn("p-0", viewMode === "cards" && "p-4")}>
            <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">ID Novedad</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Entidad Solicitante</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Fuente Afectada</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNovedades.map((novedad) => (
                    <TableRow key={novedad.id} className="hover:bg-muted/40">
                      <TableCell className="font-medium text-foreground">{novedad.id}</TableCell>
                      <TableCell>
                        <Badge tone={getTipoTone(novedad.tipo)} appearance="soft" size="sm">
                          {novedad.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-foreground">{novedad.entidad}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{novedad.fuente}</TableCell>
                      <TableCell className="text-muted-foreground">{novedad.fecha}</TableCell>
                      <TableCell>
                        <Badge tone={getEstadoTone(novedad.estado)} appearance="soft" size="sm">
                          {novedad.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href="/novedades/detalle">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            aria-label={`Ver detalle de ${novedad.id}`}
                          >
                            <Eye className="size-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Vista de Tarjetas (Móvil o modo Tarjetas) */}
            <div
              className={cn(
                "w-full",
                viewMode === "cards"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                  : "block md:hidden space-y-3.5 p-4"
              )}
            >
              {filteredNovedades.map((novedad) => (
                <InteractiveCard
                  key={novedad.id}
                  as="div"
                  hideChevron
                  color="primary"
                  icon={<FileText className="size-5" />}
                  title={novedad.fuente}
                  subtitle={novedad.id}
                  description={novedad.entidad}
                  meta={
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={getTipoTone(novedad.tipo)} appearance="soft" size="sm">
                        {novedad.tipo}
                      </Badge>
                      <Badge tone={getEstadoTone(novedad.estado)} appearance="soft" size="sm">
                        {novedad.estado}
                      </Badge>
                    </div>
                  }
                >
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2.5 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/60">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Entidad
                        </span>
                        <span className="font-semibold text-foreground mt-0.5 block truncate">
                          {novedad.entidad}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                          Fecha
                        </span>
                        <span className="font-mono text-foreground mt-0.5 block">
                          {novedad.fecha}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                      <Link href="/novedades/detalle">
                        <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                          <Eye className="size-3.5" />
                          <span>Ver detalle</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </WireframeDashboardLayout>
  );
}
