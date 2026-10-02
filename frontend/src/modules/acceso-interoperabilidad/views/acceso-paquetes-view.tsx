"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const filteredPaquetes = mockPaquetes.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.solicitud.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <WireframeDashboardLayout
      activeMenu="paquetes-consumo"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad" },
        { label: "Paquetes de consumo" }
      ]}
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
            <span className="text-xs text-muted-foreground">
              Mostrando <strong className="text-foreground font-semibold">{filteredPaquetes.length}</strong> de{" "}
              <strong className="text-foreground font-semibold">{mockPaquetes.length}</strong> paquetes
            </span>
          </div>

          <div className="overflow-x-auto border-y border-border bg-card mt-2">
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
        </div>
      </div>
    </WireframeDashboardLayout>
  );
}
