"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Network,
  Plus,
  ArrowUpRight,
  FileQuestion,
  ExternalLink,
  Layers,
  Database,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { ProyectoInstitucional, SolicitudVinculada } from "@/modules/proyectos/data/proyectos-store";

interface ProyectoSolicitudesCardProps {
  proyecto: ProyectoInstitucional;
}

export function ProyectoSolicitudesCard({ proyecto }: ProyectoSolicitudesCardProps) {
  const router = useRouter();
  const solicitudes = proyecto.solicitudes || [];
  const tieneSolicitudes = solicitudes.length > 0;

  // Ruta hacia el flujo existente de acceso a interoperabilidad
  const rutaNuevaSolicitud = `/acceso-interoperabilidad/solicitudes/nueva?proyectoId=${encodeURIComponent(
    proyecto.id
  )}&proyectoNombre=${encodeURIComponent(proyecto.nombre)}`;

  const handleSolicitarAcceso = () => {
    router.push(rutaNuevaSolicitud);
  };

  const getBadgePorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "acceso generado":
      case "aprobada":
        return (
          <Badge tone="success" appearance="solid" size="sm">
            <CheckCircle2 className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "en revisión":
      case "en proceso":
        return (
          <Badge tone="info" appearance="solid" size="sm">
            <Clock className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      case "por revisar":
      case "pendiente":
        return (
          <Badge tone="warning" appearance="solid" size="sm">
            <AlertCircle className="size-3 mr-1" />
            {estado}
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            {estado}
          </Badge>
        );
    }
  };

  return (
    <Card
      className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden"
      innerClassName="p-4 sm:p-6 lg:p-7 flex flex-col gap-5"
    >
      {/* Encabezado de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
              <Network className="size-5 text-primary" />
              Solicitudes del proyecto
            </h2>
            <Badge tone="primary" appearance="soft" size="sm">
              {solicitudes.length} {solicitudes.length === 1 ? "solicitud" : "solicitudes"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Cada proyecto agrupa solicitudes de acceso a la fuente por requerimiento institucional.
          </p>
        </div>

        {tieneSolicitudes && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSolicitarAcceso}
            leftIcon={<Plus className="size-4" />}
            rightIcon={<ArrowUpRight className="size-3.5" />}
          >
            Solicitar acceso a datos
          </Button>
        )}
      </div>

      {/* Contenido: Estado Vacío o Tabla de Solicitudes */}
      {!tieneSolicitudes ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-xl border border-dashed border-border/80 bg-muted/10 space-y-4">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <FileQuestion className="size-7" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-heading font-bold text-foreground">
              No existen solicitudes asociadas a este proyecto
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Este proyecto institucional todavía no registra solicitudes de acceso a datos formalizadas. Inicia una nueva solicitud para seleccionar la institución fuente, el catálogo y los datos que requiere tu entidad.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleSolicitarAcceso}
              leftIcon={<Plus className="size-4" />}
              rightIcon={<ArrowUpRight className="size-4" />}
              className="shadow-sm font-semibold"
            >
              Solicitar acceso a datos
            </Button>
          </div>

          <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1.5">
            <Layers className="size-3.5 text-muted-foreground/70" />
            Conecta directamente con el flujo oficial de /acceso-interoperabilidad
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Table containerClassName="border border-border/70 rounded-xl overflow-hidden bg-background">
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4">
                  Código Solicitud
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4">
                  Fuente de Interoperabilidad
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4">
                  Servicio / Finalidad
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4">
                  Fecha Radicación
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4">
                  Estado
                </TableHead>
                <TableHead className="font-semibold text-foreground text-xs py-3 px-4 text-right">
                  Acción
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((sol) => (
                <TableRow key={sol.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary py-3 px-4">
                    <Link
                      href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {sol.id}
                      <ExternalLink className="size-3 opacity-60" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs text-foreground py-3 px-4 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Database className="size-3.5 text-primary/70 shrink-0" />
                      <span>{sol.fuentePrincipal}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3 px-4">
                    {sol.servicioPrincipal}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
                      <span>{sol.fecha}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4 whitespace-nowrap">
                    {getBadgePorEstado(sol.estado)}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2.5"
                    >
                      <Link href={`/acceso-interoperabilidad/solicitudes/${sol.id}`}>
                        Ver solicitud
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
            <span>
              Mostrando {solicitudes.length} de {solicitudes.length} solicitudes vinculadas.
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSolicitarAcceso}
              leftIcon={<Plus className="size-3.5" />}
              className="text-xs text-primary"
            >
              Agregar otra solicitud a este proyecto
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
