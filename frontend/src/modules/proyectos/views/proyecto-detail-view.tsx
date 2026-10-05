"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  FileQuestion,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  ExternalLink,
} from "lucide-react";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useProyectosStore } from "@/modules/proyectos/data/proyectos-store";
import { ProyectoInfoCard } from "@/modules/proyectos/components/proyecto-info-card";
import { ProyectoSolicitudesCard } from "@/modules/proyectos/components/proyecto-solicitudes-card";

interface ProyectoDetailViewProps {
  id?: string;
  params?: Promise<{ id: string }> | { id: string };
}

export function ProyectoDetailView({ id: idProp, params }: ProyectoDetailViewProps) {
  const router = useRouter();
  const routeParams = useParams();
  
  // Resolver id de forma robusta
  const resolvedParams = params ? (params instanceof Promise ? React.use(params) : params) : null;
  const id = idProp || resolvedParams?.id || (routeParams?.id as string) || "";

  const { activeUser } = useAuthStore();
  const { getProyectoById, isLoaded } = useProyectosStore();

  const coordinadorUser = activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const coordinadorNombre = coordinadorUser?.name || "Mariana Almeida";

  const proyecto = useMemo(() => {
    return getProyectoById(id);
  }, [getProyectoById, id]);

  const breadcrumbs = useMemo(() => {
    return [
      { label: "Proyectos", href: "/proyectos" },
      { label: proyecto ? proyecto.id : id },
    ];
  }, [proyecto, id]);

  return (
    <WireframeDashboardLayout
      activeMenu="proyectos"
      currentUser={coordinadorUser}
      breadcrumbs={breadcrumbs}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Barra superior de navegación y retroceso */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="size-8 p-0 shrink-0"
              >
                <Link href="/proyectos" title="Volver a la bandeja de proyectos">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    {proyecto?.id || id}
                  </span>
                  <Badge tone="primary" appearance="soft" size="sm">
                    Versión {proyecto ? `v${proyecto.version}` : "v1"}
                  </Badge>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    {proyecto?.institucion || "Institución"}
                  </Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-foreground tracking-tight">
                  {proyecto ? proyecto.nombre : "Detalle del proyecto"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/catalogo-interoperabilidad">
                  <span>Consultar catálogo</span>
                  <ExternalLink className="size-3 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Estado de Carga o No Encontrado */}
          {!isLoaded ? (
            <div className="py-20 text-center text-xs text-muted-foreground">
              Cargando información del proyecto institucional...
            </div>
          ) : !proyecto ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border border-dashed border-border bg-muted/10 space-y-4">
              <FileQuestion className="size-12 text-muted-foreground" />
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-heading font-bold text-foreground">
                  Proyecto no encontrado
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No se encontró ningún proyecto institucional con el identificador{" "}
                  <code className="text-primary font-mono">{id}</code>.
                </p>
              </div>
              <Button asChild variant="primary" size="sm">
                <Link href="/proyectos">Volver a la bandeja de proyectos</Link>
              </Button>
            </div>
          ) : (
            /* Detalle Principal del Proyecto (PRJ-02) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Columna Principal (2 columnas en desktop): Info & Solicitudes */}
              <div className="lg:col-span-2 space-y-6">
                {/* Componente 1: Información General, Datos Inmutables y Edición de Nombre/Propósito */}
                <ProyectoInfoCard
                  proyecto={proyecto}
                  coordinadorNombre={coordinadorNombre}
                />

                {/* Componente 2: Solicitudes del Proyecto (Estado Vacío con CTA o Tabla) */}
                <ProyectoSolicitudesCard proyecto={proyecto} />
              </div>

              {/* Columna Lateral (1 columna en desktop): Resumen Institucional y Normativa */}
              <div className="space-y-5">
                {/* Tarjeta de Resumen Rápido */}
                <div className="p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4">
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-primary" />
                    Resumen Institucional
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Estado del proyecto</span>
                      <Badge tone="success" appearance="solid" size="sm">
                        Activo
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Versión vigente</span>
                      <span className="font-semibold text-foreground">
                        v{proyecto.version}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Solicitudes vinculadas</span>
                      <span className="font-semibold text-foreground">
                        {proyecto.solicitudes.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Fecha de radicación</span>
                      <span className="font-semibold text-foreground">
                        {proyecto.fechaCreacion.split(" ")[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-muted-foreground">Última actualización</span>
                      <span className="font-semibold text-foreground">
                        {proyecto.fechaActualizacion}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Marco de Integridad Normativa DINARP */}
                <div className="p-5 rounded-2xl border border-info/30 bg-info/5 space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-2 text-foreground font-heading font-bold text-xs uppercase tracking-wider">
                    <Info className="size-4 text-info" />
                    Reglas del Flujo BN-05
                  </div>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      <strong>Edición restringida:</strong> Solo se permite modificar el nombre y el propósito mediante nueva versión.
                    </li>
                    <li>
                      <strong>Inmutabilidad:</strong> El ID ({proyecto.id}) y la institución ({proyecto.institucion}) son inmutables.
                    </li>
                    <li>
                      <strong>Permanencia:</strong> El proyecto no admite eliminación ni cierre voluntario.
                    </li>
                    <li>
                      <strong>Agrupación:</strong> Cada proyecto puede agrupar múltiples solicitudes de interoperabilidad.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
