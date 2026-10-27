"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

const roleOptions = [
  { value: "COORDINADOR_SINARP", label: "Coordinador SINARP" },
  { value: "APROBADOR", label: "Aprobador" },
];

const mockPaquetes = [
  {
    id: "PKG-2026-001",
    solicitud: "SOL-2026-004",
    institucion: "MIES",
    fuente: "Registro Civil",
    campos: 5,
    estado: "Disponible para consumo",
    responsable: "Coordinador SINARP",
    ultimaActualizacion: "2026-09-06"
  },
  {
    id: "PKG-2026-002",
    solicitud: "SOL-2026-005",
    institucion: "Banco Pichincha",
    fuente: "SRI",
    campos: 2,
    estado: "Disponible para consumo",
    responsable: "Coordinador SINARP",
    ultimaActualizacion: "2026-09-22"
  },
  {
    id: "PKG-2026-003",
    solicitud: "SOL-2026-001",
    institucion: "MIES",
    fuente: "Registro Civil",
    campos: 15,
    estado: "Disponible para consumo",
    responsable: "Coordinador SINARP",
    ultimaActualizacion: "2026-09-21"
  }
];

export function AccesoPaquetesView() {
  const [role, setRole] = useSimulatedRole("COORDINADOR_SINARP");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const filteredPaquetes = mockPaquetes.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitud.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <WireframeDashboardLayout
      activeMenu="paquetes-consumo"
      headerSlot={
        <Combobox
          items={roleOptions}
          value={roleOptions.find(opt => opt.value === role) || roleOptions[0]}
          onValueChange={(val) => {
            if (val) setRole(val.value as any);
          }}
        >
          <ComboboxSelectTrigger className="h-8 text-xs min-w-[170px]" />
          <ComboboxContent align="start" className="min-w-[190px]">
            <ComboboxList>
              {roleOptions.map((opt) => (
                <ComboboxItem key={opt.value} value={opt}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      }
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenedor completo con el título */}
        <div className="border border-border rounded-2xl bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Paquetes de consumo
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulta y gestiona los paquetes habilitados para el consumo de información.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar paquete, solicitud o institución..."
                className="w-full pl-9 pr-4 h-10 bg-background border border-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-muted-foreground">
                Mostrando <strong className="text-foreground font-semibold">{filteredPaquetes.length}</strong> de{" "}
                <strong className="text-foreground font-semibold">{mockPaquetes.length}</strong> paquetes
              </span>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          <div
            className={cn(
              "overflow-x-auto border-y border-border bg-card mt-2",
              viewMode === "table" ? "hidden md:block" : "hidden"
            )}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código de paquete</TableHead>
                  <TableHead>Solicitud relacionada</TableHead>
                  <TableHead>Institución</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Campos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Responsable actual</TableHead>
                  <TableHead>Última actualización</TableHead>
                  <TableHead className="w-24 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaquetes.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">{p.id}</TableCell>
                    <TableCell>{p.solicitud}</TableCell>
                    <TableCell>{p.institucion}</TableCell>
                    <TableCell>{p.fuente}</TableCell>
                    <TableCell>{p.campos}</TableCell>
                    <TableCell>
                      <Badge tone="success" appearance="soft" size="sm">
                        {p.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.responsable}</TableCell>
                    <TableCell className="text-muted-foreground">{p.ultimaActualizacion}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                <Link href={`/acceso-interoperabilidad/paquetes/${p.id}`}>
                                  <Eye className="size-4" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">Ver detalle</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPaquetes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      No se encontraron paquetes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista de Tarjetas (Móvil + Modo Cards) */}
          <div
            className={cn(
              "w-full",
              viewMode === "cards"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "block md:hidden space-y-3.5"
            )}
          >
            {filteredPaquetes.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No se encontraron paquetes.
              </div>
            ) : (
              filteredPaquetes.map((p) => (
                <InteractiveCard
                  key={p.id}
                  as="div"
                  className="p-4 flex flex-col gap-3 bg-surface border-border"
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div>
                      <span className="font-semibold text-foreground text-sm block">{p.id}</span>
                      <span className="text-xs text-muted-foreground">Solicitud: {p.solicitud}</span>
                    </div>
                    <Badge tone="success" appearance="soft" size="sm">
                      {p.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs w-full pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground block">Institución</span>
                      <span className="font-medium text-foreground">{p.institucion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Fuente</span>
                      <span className="font-medium text-foreground">{p.fuente}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Campos</span>
                      <span className="font-medium text-foreground">{p.campos}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Responsable actual</span>
                      <span className="font-medium text-foreground">{p.responsable}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border w-full text-xs">
                    <span className="text-muted-foreground">
                      Actualizado: {p.ultimaActualizacion}
                    </span>
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href={`/acceso-interoperabilidad/paquetes/${p.id}`}>
                        <Eye className="size-3.5" />
                        <span>Ver detalle</span>
                      </Link>
                    </Button>
                  </div>
                </InteractiveCard>
              ))
            )}
          </div>
        </div>
      </div>
    </WireframeDashboardLayout>
  );
}
