import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Database,
  Building2,
  ShieldCheck,
  Server,
  Lock,
  Check,
  Eye,
  EyeOff,
  FolderArchive,
  Clock,
  FileText,
  ExternalLink,
  Info,
  AlertCircle,
  FileSearch,
  Layers,
  History
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import { INITIAL_INSTITUCIONES, MOCK_USERS_BY_ROLE, type FuenteEstado, type FuenteServicio } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

export async function CatalogoFuenteDetailView({ id }: { id: string }) {

  // Buscar fuente en mock
  const allFuentes = INITIAL_INSTITUCIONES.flatMap(inst =>
    inst.fuentes.map(f => ({
      ...f,
      institucionObj: inst
    }))
  );

  const fuente = allFuentes.find(f => f.id === id);

  if (!fuente) {
    notFound();
  }

  const getEstadoBadge = (estado: FuenteEstado) => {
    switch (estado) {
      case "PUBLICADO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1.5 font-semibold">
            <Eye className="size-3.5 text-muted-foreground" />
            PUBLICADO
          </Badge>
        );
      case "OCULTO":
        return (
          <Badge tone="neutral" appearance="outline" size="sm" className="gap-1.5 font-semibold border-dashed text-muted-foreground">
            <EyeOff className="size-3.5 text-muted-foreground" />
            OCULTO
          </Badge>
        );
      case "DESACTIVADO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="gap-1.5 font-semibold bg-muted/50 text-muted-foreground">
            <FolderArchive className="size-3.5 text-muted-foreground" />
            DESACTIVADO
          </Badge>
        );
    }
  };

  const expedienteId = fuente.trazabilidadExpedienteId || "EXP-2026-001";
  const camposAccesibles = fuente.campos.filter(c => c.clasificacion === "Accesible").length;
  const camposConfidenciales = fuente.campos.filter(c => c.clasificacion === "Confidencial").length;
  const camposPendientes = fuente.campos.filter(c => !c.clasificacion || c.clasificacion === "Pendiente").length;

  return (
    <TooltipProvider delayDuration={100}>
      <WireframeDashboardLayout
        activeMenu="gestion-catalogo"
        currentRole="DGR"
        currentUser={MOCK_USERS_BY_ROLE.DGR}
        breadcrumbs={[
          { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
          { label: "Administración y Gestión del Catálogo", href: "/catalogo-interoperabilidad/administracion" },
          { label: fuente.nombre }
        ]}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
          {/* Barra Superior de Navegación */}
          <div className="flex items-center justify-between -mt-2">
            <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/catalogo-interoperabilidad/administracion">
                <ArrowLeft className="size-4" />
                Volver a Administración
              </Link>
            </Button>
          </div>

          {/* Header del Detalle */}
          <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/60">
                    {fuente.codigoServicio}
                  </span>
                  <span>â€¢</span>
                  <span className="font-medium text-foreground">
                    {fuente.institucionNombre}
                  </span>
                </div>

                <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                  {fuente.nombre}
                </h1>

                <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
                  {fuente.descripcion}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  {getEstadoBadge(fuente.estado)}
                </div>

                <div className="text-xs text-muted-foreground">
                  Actualizado: <strong className="font-mono text-foreground font-medium">{fuente.ultimaActualizacion}</strong>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shadow-2xs">
                    <Link href={`/catalogo-interoperabilidad/administracion/incorporaciones/${expedienteId}`}>
                      <ExternalLink className="size-3.5" />
                      <span>Ver integración</span>
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shadow-2xs">
                    <Link href={`/catalogo-interoperabilidad/novedades?fuenteId=${fuente.id}`}>
                      <FileText className="size-3.5" />
                      <span>Gestionar novedad</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Banner contextual si está desactivada */}
            {fuente.estado === "DESACTIVADO" && (
              <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                  <strong className="text-foreground font-semibold">Fuente Desactivada:</strong>
                  <p>
                    Esta fuente no está disponible para nuevas solicitudes de interoperabilidad. Su información, expediente e historial de transacciones se conservan para auditoría y fines legales.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Secciones por Tabs */}
          <Tabs defaultValue="resumen" className="w-full flex flex-col gap-6">
            <TabsList className="bg-surface border border-border p-1 rounded-xl justify-start w-full overflow-x-auto">
              <TabsTrigger value="resumen" className="text-xs gap-1.5">
                <Building2 className="size-3.5" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="campos" className="text-xs gap-1.5">
                <Database className="size-3.5" />
                Campos ({fuente.campos.length})
              </TabsTrigger>
              <TabsTrigger value="clasificacion" className="text-xs gap-1.5">
                <ShieldCheck className="size-3.5" />
                Clasificación
              </TabsTrigger>
              <TabsTrigger value="integracion" className="text-xs gap-1.5">
                <Server className="size-3.5" />
                Integración
              </TabsTrigger>
              <TabsTrigger value="novedades" className="text-xs gap-1.5">
                <FileText className="size-3.5" />
                Novedades ({fuente.novedadesAsociadas?.length || fuente.historialNovedades?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="historial" className="text-xs gap-1.5">
                <History className="size-3.5" />
                Historial y trazabilidad
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: RESUMEN */}
            <TabsContent value="resumen" className="m-0 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Identificación de la Fuente */}
                <Card size="sm" className="bg-surface border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      Institución y Fuente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Institución:</span>
                      <span className="font-medium text-foreground">{fuente.institucionNombre} ({fuente.institucionObj.sigla})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Nombre de la fuente:</span>
                      <span className="font-medium text-foreground">{fuente.nombre}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Código de la fuente:</span>
                      <span className="font-mono font-medium text-foreground">{fuente.codigoServicio}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Descripción:</span>
                      <span className="text-muted-foreground leading-relaxed">{fuente.descripcion}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Estado y Dimensiones */}
                <Card size="sm" className="bg-surface border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Layers className="size-4 text-muted-foreground" />
                      Estado del Catálogo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Estado:</span>
                      <div>{getEstadoBadge(fuente.estado)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Cantidad de campos:</span>
                      <span className="font-medium text-foreground">{fuente.campos.length} campos registrados</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Responsable Funcional DGR:</span>
                      <span className="font-medium text-foreground">{fuente.responsableDGR}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Fechas de Registro y Actualización */}
                <Card size="sm" className="bg-surface border-border">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      Fechas y Registro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Fecha de registro:</span>
                      <span className="font-mono text-foreground">{fuente.fechaIntegracion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Última actualización:</span>
                      <span className="font-mono text-foreground">{fuente.ultimaActualizacion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Expediente de Integración:</span>
                      <Link
                        href={`/catalogo-interoperabilidad/administracion/incorporaciones/${expedienteId}`}
                        className="font-mono font-medium text-foreground hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        {expedienteId}
                        <ExternalLink className="size-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB 2: CAMPOS */}
            <TabsContent value="campos" className="m-0 flex flex-col gap-4">
              <div className="border border-border rounded-xl bg-surface p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Campos de la Fuente ({fuente.campos.length} campos)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Diccionario de campos y su clasificación de seguridad (solo lectura).
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                    <tr>
                      <th className="py-3 px-4 min-w-[180px]">Campo</th>
                      <th className="py-3 px-4 min-w-[280px]">Descripción</th>
                      <th className="py-3 px-4 min-w-[120px]">Tipo de dato</th>
                      <th className="py-3 px-4 min-w-[140px] text-center">Clasificación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {fuente.campos.map(campo => (
                      <tr key={campo.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-foreground">{campo.nombre}</td>
                        <td className="py-3 px-4 text-muted-foreground leading-relaxed">{campo.descripcion}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">
                          <span className="px-2 py-0.5 rounded bg-muted text-foreground text-[11px]">
                            {campo.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {campo.clasificacion === "Accesible" && (
                            <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 inline-flex font-medium">
                              <Check className="size-3 text-muted-foreground" />
                              Accesible
                            </Badge>
                          )}
                          {campo.clasificacion === "Confidencial" && (
                            <Badge tone="neutral" appearance="outline" size="sm" className="gap-1 inline-flex font-semibold border-border">
                              <Lock className="size-3 text-muted-foreground" />
                              Confidencial
                            </Badge>
                          )}
                          {!campo.clasificacion && (
                            <Badge tone="neutral" appearance="outline" size="sm" className="text-muted-foreground border-dashed">
                              Pendiente de clasificación
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* TAB 3: CLASIFICACION */}
            <TabsContent value="clasificacion" className="m-0 flex flex-col gap-6">
              <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Resumen de Clasificación
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Resumen del dictamen emitido por la Dirección de Protección de la Información (información en solo lectura).
                    </p>
                  </div>

                  <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shrink-0">
                    <Link href={`/catalogo-interoperabilidad/administracion/incorporaciones/${expedienteId}`}>
                      <ExternalLink className="size-3.5" />
                      <span>Ver integración</span>
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Total de campos</span>
                    <span className="font-heading font-bold text-xl text-foreground">
                      {fuente.campos.length}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Accesibles</span>
                    <span className="font-heading font-bold text-xl text-foreground flex items-center gap-1.5">
                      <Check className="size-4 text-muted-foreground" />
                      {camposAccesibles}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Confidenciales</span>
                    <span className="font-heading font-bold text-xl text-foreground flex items-center gap-1.5">
                      <Lock className="size-4 text-muted-foreground" />
                      {camposConfidenciales}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Pendientes</span>
                    <span className="font-heading font-bold text-xl text-foreground">
                      {camposPendientes}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Fecha de última clasificación:</span>
                    <span className="font-mono text-foreground font-medium">
                      {fuente.clasificacionDPI.fechaInforme || "12/01/2026"}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Informe técnico asociado:</span>
                    <span className="font-mono text-foreground font-medium">
                      {fuente.clasificacionDPI.nroInforme || "INF-DPI-2026-0012"} — {fuente.clasificacionDPI.archivoInforme || "Informe_Clasificacion.pdf"}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: INTEGRACION */}
            <TabsContent value="integracion" className="m-0 flex flex-col gap-6">
              <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Resumen de Integración Asociada
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Información técnica consolidada del microservicio y despliegue (solo lectura).
                    </p>
                  </div>

                  <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shrink-0">
                    <Link href={`/catalogo-interoperabilidad/administracion/incorporaciones/${expedienteId}`}>
                      <ExternalLink className="size-3.5" />
                      <span>Ver expediente de integración</span>
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Estado de integración:</span>
                    <span className="font-medium text-foreground">
                      {fuente.estado === "PUBLICADO" ? "Producción Habilitada" : fuente.estado === "OCULTO" ? "En Validación Técnica / Preproducción" : "Desactivado"}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Versión:</span>
                    <span className="font-mono text-foreground">{fuente.version}</span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Ambiente actual:</span>
                    <span className="font-medium text-foreground">
                      {fuente.estado === "PUBLICADO" ? "Producción" : "Preproducción / Pruebas"}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Fecha de última integración:</span>
                    <span className="font-mono text-foreground">{fuente.fechaIntegracion}</span>
                  </div>

                  <div className="p-4 rounded-lg border border-border bg-card flex flex-col gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground">Fecha de producción:</span>
                    <span className="font-mono text-foreground">
                      {fuente.microservicio.fechaDespliegueProd || (fuente.estado === "PUBLICADO" ? fuente.fechaIntegracion : "Pendiente de pase a producción")}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: NOVEDADES */}
            <TabsContent value="novedades" className="m-0 flex flex-col gap-6">
              <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      Novedades de la Fuente
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Requerimientos formales de cambio, supresión o actualización tramitados.
                    </p>
                  </div>

                  <Button variant="outline" size="sm" asChild className="text-xs gap-1.5 shrink-0">
                    <Link href={`/catalogo-interoperabilidad/novedades?fuenteId=${fuente.id}`}>
                      <FileText className="size-3.5" />
                      <span>Gestionar novedad</span>
                    </Link>
                  </Button>
                </div>

                {fuente.novedadesAsociadas && fuente.novedadesAsociadas.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">Tipo</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {fuente.novedadesAsociadas.map(nov => (
                          <tr key={nov.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-foreground">{nov.tipo}</td>
                            <td className="py-3 px-4">
                              <Badge tone="neutral" appearance="soft" size="sm">{nov.estado}</Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">{nov.fecha}</td>
                            <td className="py-3 px-4 text-muted-foreground">{nov.resultado}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : fuente.historialNovedades && fuente.historialNovedades.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                        <tr>
                          <th className="py-3 px-4">Tipo</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {fuente.historialNovedades.map((item, idx) => (
                          <tr key={idx} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 px-4 font-medium text-foreground">{item.tipo}</td>
                            <td className="py-3 px-4">
                              <Badge tone="neutral" appearance="soft" size="sm">Finalizada</Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-muted-foreground">{item.fecha}</td>
                            <td className="py-3 px-4 text-muted-foreground">{item.detalle}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">
                    Esta fuente no registra novedades.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 6: HISTORIAL Y TRAZABILIDAD */}
            <TabsContent value="historial" className="m-0 flex flex-col gap-6">
              <div className="border border-border rounded-xl bg-surface p-6 flex flex-col gap-6 shadow-xs">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    <History className="size-4 text-muted-foreground" />
                    Historial y Trazabilidad
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Timeline cronológico con los eventos y cambios registrados en la fuente.
                  </p>
                </div>

                <div className="space-y-4">
                  {fuente.trazabilidadEventos && fuente.trazabilidadEventos.length > 0 ? (
                    fuente.trazabilidadEventos.map((evt, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-border bg-card flex flex-col gap-2 transition-all hover:bg-muted/20"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-foreground">{evt.evento}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {evt.fecha} — {evt.hora}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>Usuario: <strong className="text-foreground">{evt.usuario}</strong></span>
                          <span>â€¢</span>
                          <span>Rol: <strong className="text-foreground">{evt.rol}</strong></span>
                          {evt.estadoAnterior && evt.estadoNuevo && (
                            <>
                              <span>â€¢</span>
                              <span>Estado: <strong className="text-foreground">{evt.estadoAnterior}</strong> â†’ <strong className="text-foreground">{evt.estadoNuevo}</strong></span>
                            </>
                          )}
                        </div>

                        {evt.observacion && (
                          <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                            {evt.observacion}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      No se registran eventos adicionales de trazabilidad para esta fuente.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

        </div>
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
