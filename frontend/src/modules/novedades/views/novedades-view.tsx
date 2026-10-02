"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

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
  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case "FINALIZADA": return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "EN PROCESO": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "RADICADA": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      default: return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "SUPRESIÓN": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300";
      case "CREACIÓN": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300";
      case "MODIFICACIÓN": return "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <WireframeDashboardLayout>
      <div className="space-y-6">
                <WireframeBreadcrumbs 
          segments={[
            { label: "Inicio", href: "/" },
            { label: "Novedades del Catálogo", href: "/novedades" }
          ]}
        />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Novedades del Catálogo</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona las solicitudes de creación, modificación o supresión de fuentes en el catálogo.
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Novedad
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <CardTitle className="text-lg font-semibold">Listado de Novedades</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar novedad..."
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 pl-9 dark:border-slate-800 dark:focus-visible:ring-slate-300"
                  />
                </div>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
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
                {NOVEDADES.map((novedad) => (
                  <TableRow key={novedad.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <TableCell className="font-medium">{novedad.id}</TableCell>
                    <TableCell>
                      <Badge appearance="outline" className={getTipoColor(novedad.tipo)}>
                        {novedad.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{novedad.entidad}</TableCell>
                    <TableCell className="hidden lg:table-cell">{novedad.fuente}</TableCell>
                    <TableCell>{novedad.fecha}</TableCell>
                    <TableCell>
                      <Badge appearance="outline" className={getBadgeColor(novedad.estado)}>
                        {novedad.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link href="/novedades/detalle">
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                          <Eye className="size-4" />
                          
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </WireframeDashboardLayout>
  );
}
