import Link from "next/link";
import {
  Database,
  Layers,
  ArrowLeftRight,
  FileText,
  Building2,
  ShieldCheck,
  Server,
  UserCheck,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Network,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";

export function SuriHubView() {
  const subseccionesCatalogo = [
    {
      titulo: "Consulta",
      ruta: "/catalogo-interoperabilidad",
      descripcion: "Explora las instituciones, fuentes y campos publicados disponibles en el Catálogo de Interoperabilidad.",
      icon: Search,
      tag: "Solo Publicados"
    },
    {
      titulo: "Integración de Fuentes",
      ruta: "/catalogo-interoperabilidad/integraciones",
      descripcion: "Expediente de incorporación con stepper de 10 etapas y simulador de 4 roles (Coordinador, DGR, DTD, DPI).",
      badge: "HU-INT-01 a 14",
      icon: ArrowLeftRight,
      tag: "Ciclo de Vida"
    }
  ];

  return (
    <WireframeDashboardLayout activeMenu="overview">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

        {/* Banner Superior */}
        <div className="border border-border rounded-xl bg-surface p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                SURI Interoperabilidad v2.0
              </span>
              <Badge tone="neutral" appearance="soft" size="sm">
                Resolución 004-DN-2023
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm">
                Arquitectura Unificada
              </Badge>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Módulos del Sistema SURI
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Catálogo unificado y procesos de gobernanza de datos públicos del Sistema Nacional de Registro de Datos Públicos (DINARP).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="sm" asChild>
              <Link href="/catalogo-interoperabilidad/integraciones/nueva">
                + Nueva Integración
              </Link>
            </Button>
          </div>
        </div>

        {/* ÚNICA TARJETA PRINCIPAL: Catálogo de Interoperabilidad */}
        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
          {/* Header de la Tarjeta Principal */}
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-12 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <Database className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Catálogo de Interoperabilidad
                  </h2>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Módulo Principal
                  </Badge>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    HU-INT-01 a 19
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                  Módulo integral para la gobernanza, consulta, gestión técnica y ciclo de vida de las fuentes de datos de interoperabilidad del Estado ecuatoriano.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" asChild className="text-xs font-semibold">
                <Link href="/catalogo-interoperabilidad">
                  Ingresar a Consulta
                  <ChevronRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Subsecciones Internas: Consulta, Integración de Fuentes */}
          <div className="p-6">
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Secciones Internas del Módulo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subseccionesCatalogo.map((sub, idx) => {
                const Icon = sub.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-surface hover:border-foreground/40 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-foreground font-semibold">
                          <Icon className="size-4" />
                        </div>
                        <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                          {sub.tag}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-sm font-bold text-foreground">
                            {sub.titulo}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {sub.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {sub.badge}
                      </span>
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 gap-1 font-semibold text-foreground hover:bg-muted">
                        <Link href={sub.ruta}>
                          Ver sección
                          <ChevronRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SEGUNDA TARJETA: Acceso y Seguridad */}
        <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
          <div className="p-6 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-12 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-heading text-xl font-bold text-foreground">
                    Acceso y seguridad
                  </h2>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    Rol: DGR
                  </Badge>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    Prerregistro e Ingresos
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-3xl leading-relaxed">
                  Módulo encargado de la revisión, evaluación y aprobación o rechazo de solicitudes de acceso generadas desde el portal de prerregistro institucional.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" asChild className="text-xs font-semibold">
                <Link href="/asignacion-solicitudes">
                  Asignación de solicitudes
                  <ChevronRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Matriz de Roles Normativos */}
        <div className="border border-border rounded-xl bg-card p-6 flex flex-col gap-4">
          <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
            <UserCheck className="size-4 text-muted-foreground" />
            Matriz de Actores en el Catálogo de Interoperabilidad
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-1">
              <span className="font-semibold text-foreground block">1. Coordinador SINARP</span>
              <p className="text-muted-foreground text-[11px]">
                Radica la fuente candidata (HU-INT-03), aporta documentos soporte y subsana observaciones puntuales (HU-INT-05).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-1">
              <span className="font-semibold text-foreground block">2. DGR (Gestión y Registro)</span>
              <p className="text-muted-foreground text-[11px]">
                Revisa documentos (HU-INT-04), valida funcionalidad en preproducción (HU-INT-10), aprueba integración (HU-INT-12) y dictamina novedades (HU-INT-17).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-1">
              <span className="font-semibold text-foreground block">3. DTD (Tecnología)</span>
              <p className="text-muted-foreground text-[11px]">
                Valida técnica a estado OCULTO (HU-INT-07), despliega microservicio preproducción (HU-INT-09), atiende errores (HU-INT-11) y pasa a producción (HU-INT-13).
              </p>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-1">
              <span className="font-semibold text-foreground block">4. DPI (Protección de Información)</span>
              <p className="text-muted-foreground text-[11px]">
                Clasifica campos como Accesibles o Confidenciales y emite informe técnico oficial en PDF (HU-INT-08).
              </p>
            </div>
          </div>
        </div>

      </div>
    </WireframeDashboardLayout>
  );
}
