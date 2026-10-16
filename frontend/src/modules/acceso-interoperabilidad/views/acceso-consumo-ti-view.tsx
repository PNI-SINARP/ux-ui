"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Server,
  Terminal,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Database,
  ExternalLink,
  KeyRound,
  Eye,
  Search as SearchIcon,
  Filter,
  Check,
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { TrazabilidadTimeline } from "@/modules/acceso-interoperabilidad/components/trazabilidad-timeline";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AccesoConsumoTIView() {
  const { solicitudes, reintentarAprovisionamiento } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<"ALL" | "PENDIENTE" | "FALLO" | "HABILITADO">("ALL");
  const [solicitudDetalle, setSolicitudDetalle] = useState<SolicitudAcceso | null>(null);
  const [reintentandoId, setReintentandoId] = useState<string | null>(null);

  // Filtrar solicitudes con ciclo técnico de aprovisionamiento
  const solicitudesTecnicas = useMemo(() => {
    return solicitudes.filter((s) => {
      const est = s.estado;
      return (
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado" ||
        est === "Acceso generado" ||
        s.aprovisionamiento !== undefined
      );
    });
  }, [solicitudes]);

  const filtered = useMemo(() => {
    return solicitudesTecnicas.filter((s) => {
      const isFallo = s.aprovisionamiento?.estado === "ERROR";
      const isHabilitado = s.estado === "Acceso habilitado" || s.estado === "Acceso generado";
      const isPendiente = !isFallo && !isHabilitado;

      if (filterEstado === "PENDIENTE" && !isPendiente) return false;
      if (filterEstado === "FALLO" && !isFallo) return false;
      if (filterEstado === "HABILITADO" && !isHabilitado) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term))
      );
    });
  }, [solicitudesTecnicas, filterEstado, searchTerm]);

  // Contadores
  const totalFallos = solicitudesTecnicas.filter((s) => s.aprovisionamiento?.estado === "ERROR").length;
  const totalPendientes = solicitudesTecnicas.filter((s) => s.aprovisionamiento?.estado === "PENDIENTE" || s.estado === "Solicitud aprobada — habilitación técnica pendiente").length;
  const totalHabilitados = solicitudesTecnicas.filter((s) => s.estado === "Acceso habilitado" || s.estado === "Acceso generado").length;

  const handleReintentar = (id: string) => {
    setReintentandoId(id);
    setTimeout(() => {
      reintentarAprovisionamiento(id, { usuarioTI: "Ing. Jorge Alvear (Administrador TI DINARP)" });
      setReintentandoId(null);
      toast.success("Aprovisionamiento técnico completado", {
        description: "El gateway propagó las políticas de seguridad. Acceso habilitado exitosamente."
      });
      if (solicitudDetalle?.id === id) {
        setSolicitudDetalle(null);
      }
    }, 700);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-consumo-ti"
      currentRole="TI"
      breadcrumbs={[
        { label: "Infraestructura y Seguridad", href: "/acceso-consumo" },
        { label: "Aprovisionamiento Técnico de Acceso" },
      ]}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" className="font-semibold text-xs">
                Equipo TI & Seguridad
              </Badge>
              <span className="text-xs text-muted-foreground">ACC-01 + ACC-02 + ACC-03</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Monitoreo y Aprovisionamiento Técnico de Interoperabilidad
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Gestión de despliegue de credenciales, políticas de cuotas en API Gateway DINARP y resolución de incidencias en aprovisionamiento automático.
            </p>
          </div>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Fallos en habilitación técnica</span>
              <AlertTriangle className="size-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive mt-2">{totalFallos}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Requieren reintento manual asistido</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">En cola de aprovisionamiento</span>
              <Clock className="size-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPendientes}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Órdenes recibidas de Dirección de Gestión</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Accesos habilitados en producción</span>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalHabilitados}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Credenciales activas y seguras</p>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setFilterEstado("ALL")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "ALL" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todas ({solicitudesTecnicas.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("FALLO")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "FALLO" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Con fallo ({totalFallos})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("PENDIENTE")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "PENDIENTE" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                En proceso ({totalPendientes})
              </button>
              <button
                type="button"
                onClick={() => setFilterEstado("HABILITADO")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  filterEstado === "HABILITADO" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Habilitados ({totalHabilitados})
              </button>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Search
              placeholder="Buscar por código, institución o fuente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="w-full bg-background"
            />
          </div>
        </div>

        {/* Tabla de Aprovisionamiento */}
        <Card className="border border-border bg-surface overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Fuente / Servicio</TableHead>
                <TableHead className="text-center">Reintentos</TableHead>
                <TableHead>Estado técnico</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Server className="size-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium">No hay órdenes de aprovisionamiento con estos filtros.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => {
                  const prov = s.aprovisionamiento;
                  const isFallo = prov?.estado === "ERROR";
                  const isHabilitado = s.estado === "Acceso habilitado" || s.estado === "Acceso generado";

                  return (
                    <TableRow key={s.id} className={cn("hover:bg-muted/40 transition-colors", isFallo && "bg-destructive/5")}>
                      <TableCell className="font-semibold text-foreground">
                        {s.id}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={s.institucion}>
                        {s.institucion}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {s.fuentePrincipal || s.fuentes?.[0]?.nombre}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs">
                        {prov?.reintentosCount ?? 0}
                      </TableCell>
                      <TableCell>
                        {isFallo ? (
                          <div className="flex items-center gap-1.5">
                            <Badge tone="danger" appearance="soft" className="gap-1 text-xs font-semibold">
                              <AlertTriangle className="size-3" />
                              Fallo en la habilitación técnica
                            </Badge>
                          </div>
                        ) : isHabilitado ? (
                          <Badge tone="success" appearance="soft" className="gap-1 text-xs">
                            <CheckCircle2 className="size-3" />
                            Acceso habilitado
                          </Badge>
                        ) : (
                          <Badge tone="warning" appearance="soft" className="gap-1 text-xs">
                            <Clock className="size-3" />
                            En proceso de habilitación
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSolicitudDetalle(s)}
                            className="text-xs text-muted-foreground hover:text-foreground gap-1"
                          >
                            <Eye className="size-3.5" />
                            Diagnóstico
                          </Button>

                          {isFallo && (
                            <Button
                              size="sm"
                              onClick={() => handleReintentar(s.id)}
                              disabled={reintentandoId === s.id}
                              className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                            >
                              <RotateCcw className={cn("size-3.5", reintentandoId === s.id && "animate-spin")} />
                              Reintentar aprovisionamiento
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Modal Diagnóstico Técnico (ACC-01 + ACC-02) */}
      <Dialog open={!!solicitudDetalle} onOpenChange={(open) => !open && setSolicitudDetalle(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Server className="size-5 text-primary" />
              Detalle de Aprovisionamiento Técnico — {solicitudDetalle?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Registro del aprovisionamiento en la plataforma de integración y API Gateway DINARP.
            </DialogDescription>
          </DialogHeader>

          {solicitudDetalle && (
            <div className="space-y-4 py-2">
              {/* Alerta de Fallo si aplica */}
              {solicitudDetalle.aprovisionamiento?.estado === "ERROR" && (
                <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <AlertTriangle className="size-4" />
                    Fallo en la habilitación técnica
                  </div>
                  <p className="text-xs text-foreground font-medium">
                    {solicitudDetalle.aprovisionamiento.mensajeResultado || "Error al propagar políticas de cuota transaccional en el Gateway."}
                  </p>
                </div>
              )}

              {/* Bloque Secundario: Información Técnica */}
              <div className="border border-border rounded-xl p-4 bg-muted/30 space-y-2.5">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="size-3.5 text-primary" />
                  Información Técnica del Gateway
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Código de error / ref:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {solicitudDetalle.aprovisionamiento?.referenciaTecnica || "GATEWAY_TIMEOUT_504"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Reintentos registrados:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {solicitudDetalle.aprovisionamiento?.reintentosCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Último intento:</span>
                    <span className="text-foreground">
                      {solicitudDetalle.aprovisionamiento?.ultimoIntento || solicitudDetalle.ultimaActualizacion}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Ambiente:</span>
                    <span className="text-foreground">Producción Seguro DINARP</span>
                  </div>
                </div>
              </div>

              {/* Trazabilidad */}
              <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                <h4 className="text-xs font-bold text-foreground">Historial del trámite</h4>
                <TrazabilidadTimeline historial={solicitudDetalle.historial || []} />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setSolicitudDetalle(null)}>
              Cerrar
            </Button>
            {solicitudDetalle?.aprovisionamiento?.estado === "ERROR" && (
              <Button
                size="sm"
                onClick={() => handleReintentar(solicitudDetalle.id)}
                disabled={reintentandoId === solicitudDetalle.id}
                className="gap-1.5 bg-primary text-primary-foreground font-semibold"
              >
                <RotateCcw className={cn("size-3.5", reintentandoId === solicitudDetalle.id && "animate-spin")} />
                Reintentar aprovisionamiento
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
