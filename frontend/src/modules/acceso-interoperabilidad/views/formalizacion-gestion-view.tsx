"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Search as SearchIcon,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Briefcase,
  Database,
  Lock,
  Unlock,
  Calendar,
  FileText,
  AlertTriangle,
  RotateCcw,
  History,
  Send,
  UserCheck,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
  ShieldCheck,
  Receipt,
  FileSignature,
  CreditCard,
  Layers,
  ArrowRight
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { TrazabilidadTimeline } from "@/modules/acceso-interoperabilidad/components/trazabilidad-timeline";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FormalizacionGestionView() {
  const { solicitudes, aprobarFinalGestion } = useSolicitudesStore();

  const [activeTab, setActiveTab] = useState<"TODAS" | "PUBLICA" | "PRIVADA">("TODAS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAcceso | null>(null);
  const [modalAprobacion, setModalAprobacion] = useState<SolicitudAcceso | null>(null);
  const [resolucionAdmin, setResolucionAdmin] = useState("RESOLUCION-DINARP-DIR-2026-");

  // Casos listos para formalización / aprobación final
  const solicitudesFormalizacion = useMemo(() => {
    return solicitudes.filter((s) => {
      const est = s.estado;
      return (
        est === "Aprobada por Gestión" ||
        est === "Aprobada por Normatividad" ||
        est === "En formalización" ||
        est === "Pendiente de firma" ||
        est === "Contrato firmado" ||
        est === "Pendiente de pago" ||
        est === "Pago verificado" ||
        est === "Aprobación final" ||
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado"
      );
    });
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudesFormalizacion.filter((s) => {
      if (activeTab === "PUBLICA" && s.tipoInstitucion !== "Pública") return false;
      if (activeTab === "PRIVADA" && s.tipoInstitucion !== "Privada") return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(term)) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term))
      );
    });
  }, [solicitudesFormalizacion, activeTab, searchTerm]);

  // Contadores funcionales
  const totalPublicasListas = solicitudesFormalizacion.filter(
    (s) => s.tipoInstitucion === "Pública" && (s.estado === "Aprobada por Gestión" || s.estado === "Aprobada por Normatividad" || s.estado === "En formalización" || s.estado === "Aprobación final")
  ).length;

  const totalPrivadasPendientes = solicitudesFormalizacion.filter(
    (s) => s.tipoInstitucion === "Privada" && (s.estado === "En formalización" || s.estado === "Pendiente de firma" || s.estado === "Pendiente de pago")
  ).length;

  const totalPrivadasListas = solicitudesFormalizacion.filter(
    (s) => s.tipoInstitucion === "Privada" && s.estado === "Pago verificado"
  ).length;

  const handleConfirmarAprobacion = () => {
    if (!modalAprobacion) return;
    aprobarFinalGestion(modalAprobacion.id, {
      resolucionNumero: resolucionAdmin,
      directorNombre: "Dr. Roberto Andrade (Director de Gestión de la Información)"
    });
    toast.success("Solicitud aprobada formalmente", {
      description: "El expediente fue remitido al Equipo TI para habilitación técnica del acceso."
    });
    setModalAprobacion(null);
    if (selectedSolicitud?.id === modalAprobacion.id) {
      setSelectedSolicitud(null);
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="formalizacion-gestion"
      currentRole="DIR_GESTION"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" className="font-semibold text-xs">
                Director de Gestión
              </Badge>
              <span className="text-xs text-muted-foreground">SOL-09 + SOL-10</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              Bandeja de Formalización y Aprobación Final
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Emisión de resoluciones administrativas para expedientes de instituciones públicas y verificación de suscripción contractual y pago acreditado para instituciones privadas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/formalizacion/contratos">
                <FileSignature className="size-4 text-primary" />
                Módulo de Contratos (Jurídica)
              </Link>
            </Button>
          </div>
        </div>

        {/* Tarjetas de Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Públicas listas para aprobación</span>
              <Building2 className="size-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPublicasListas}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Expediente administrativo completo</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Privadas en proceso de firma / pago</span>
              <Clock className="size-4 text-warning" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPrivadasPendientes}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Requieren contrato bilateral o pago verificado</p>
          </Card>

          <Card className="p-4 border border-border bg-surface shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Privadas listas para aprobación final</span>
              <CheckCircle2 className="size-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{totalPrivadasListas}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Contrato firmado y pago acreditado</p>
          </Card>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex p-1 bg-muted/60 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("TODAS")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "TODAS" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todas ({solicitudesFormalizacion.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PUBLICA")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "PUBLICA" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Públicas (Expediente de autorización)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("PRIVADA")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                  activeTab === "PRIVADA" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Privadas (Contrato + Pago)
              </button>
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Search
              placeholder="Buscar por código, institución o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="w-full bg-background"
            />
          </div>
        </div>

        {/* Tabla Principal */}
        <Card className="border border-border bg-surface overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solicitud</TableHead>
                <TableHead>Institución</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Fuente solicitada</TableHead>
                <TableHead>Tipo entidad</TableHead>
                <TableHead>Estado formalización</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSolicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <FileCheck2 className="size-8 stroke-1 text-muted-foreground/60" />
                      <p className="text-sm font-medium">No hay solicitudes en esta bandeja con los filtros seleccionados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSolicitudes.map((s) => {
                  const isPublic = s.tipoInstitucion === "Pública";
                  const isReadyForApprovalPublic = isPublic && (s.estado === "Aprobada por Gestión" || s.estado === "Aprobada por Normatividad" || s.estado === "En formalización" || s.estado === "Aprobación final");
                  const isReadyForApprovalPrivate = !isPublic && s.estado === "Pago verificado";
                  const isAlreadyApproved = s.estado === "Solicitud aprobada — habilitación técnica pendiente" || s.estado === "Habilitación técnica" || s.estado === "Acceso habilitado";

                  return (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-semibold text-foreground">
                        {s.id}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={s.institucion}>
                        {s.institucion}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground" title={s.proyectoNombre || "Sin proyecto"}>
                        {s.proyectoNombre || "Sistema de Gestión Institucional"}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-muted-foreground">
                        {s.fuentePrincipal || s.fuentes?.[0]?.nombre || "Registro Civil"}
                      </TableCell>
                      <TableCell>
                        <Badge tone={isPublic ? "info" : "warning"} appearance="soft" className="text-xs">
                          {s.tipoInstitucion}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            isAlreadyApproved
                              ? "success"
                              : isReadyForApprovalPublic || isReadyForApprovalPrivate
                              ? "primary"
                              : "warning"
                          }
                          appearance="soft"
                          className="text-xs"
                        >
                          {s.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSolicitud(s)}
                            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                            {isPublic ? "Ver expediente" : "Ver requisitos"}
                          </Button>

                          {(isReadyForApprovalPublic || isReadyForApprovalPrivate) && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setResolucionAdmin(`RESOLUCION-DINARP-DIR-2026-${s.id.replace("SOL-2026-", "")}`);
                                setModalAprobacion(s);
                              }}
                              className="gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
                            >
                              <FileCheck2 className="size-3.5" />
                              Aprobar y habilitar acceso
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

      {/* Drawer Amplio: Expediente de Autorización (Pública) o Checklist (Privada) */}
      <Sheet open={!!selectedSolicitud} onOpenChange={(open) => !open && setSelectedSolicitud(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl lg:max-w-3xl overflow-y-auto p-6 sm:p-8">
          {selectedSolicitud && (
            <div className="flex flex-col gap-6">
              <SheetHeader className="p-0 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <Badge tone={selectedSolicitud.tipoInstitucion === "Pública" ? "info" : "warning"} appearance="soft">
                    {selectedSolicitud.tipoInstitucion === "Pública" ? "Institución Pública" : "Institución Privada"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedSolicitud.id}</span>
                </div>
                <SheetTitle className="font-heading text-xl font-bold text-foreground mt-2">
                  {selectedSolicitud.tipoInstitucion === "Pública"
                    ? "Expediente de Autorización de Acceso"
                    : "Verificación de Requisitos de Formalización Privada"}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {selectedSolicitud.tipoInstitucion === "Pública"
                    ? "Revisión integral del expediente administrativo previo a la emisión de la orden técnica de habilitación."
                    : "Comprobación de contrato bilateral debidamente suscrito y acreditación bancaria en el sistema financiero estatal."}
                </SheetDescription>
              </SheetHeader>

              {/* Bloque: Información del Trámite */}
              <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Institución:</span>
                  <span className="font-semibold text-foreground">{selectedSolicitud.institucion}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Proyecto:</span>
                  <span className="font-semibold text-foreground">{selectedSolicitud.proyectoNombre || "Trámites Ciudadanos"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fuente solicitada:</span>
                  <span className="font-semibold text-foreground">{selectedSolicitud.fuentePrincipal || selectedSolicitud.fuentes?.[0]?.nombre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Estado actual:</span>
                  <Badge tone="primary" appearance="soft" className="text-[11px] mt-0.5">
                    {selectedSolicitud.estado}
                  </Badge>
                </div>
              </div>

              {/* SI ES PÚBLICA: EXPEDIENTE DE AUTORIZACIÓN (Sin contrato, factura, ni pago) */}
              {selectedSolicitud.tipoInstitucion === "Pública" ? (
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Database className="size-4 text-primary" />
                      Campos Aprobados y Finalidades de Uso
                    </h3>
                    <div className="divide-y divide-border">
                      {selectedSolicitud.fuentes?.flatMap((f) => f.campos || []).map((c) => (
                        <div key={c.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold text-foreground">{c.nombre}</span>
                            <Badge tone={c.clasificacion === "Confidencial" ? "warning" : "info"} appearance="soft" className="text-[10px]">
                              {c.clasificacion}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            <strong className="text-foreground">Finalidad:</strong> {c.finalidad}
                          </p>
                          {c.fundamento && (
                            <p className="text-muted-foreground mt-0.5">
                              <strong className="text-foreground">Justificación jurídica:</strong> {c.fundamento}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dictamen Técnico de Gestión */}
                  <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="size-4 text-success" />
                      Revisión Técnica de Gestión
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      El Equipo Técnico de Gestión emitió dictamen favorable respecto a la viabilidad funcional, consistencia de campos requeridos y estimación de registros.
                    </p>
                  </div>

                  {/* Informe de Normatividad si aplica */}
                  {selectedSolicitud.informeNormativa ? (
                    <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Scale className="size-4 text-primary" />
                          Informe Jurídico de Normatividad (Campos Confidenciales)
                        </h3>
                        <Badge tone="success" appearance="soft" className="text-[10px]">
                          Favorable y Firmado
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedSolicitud.informeNormativa.observaciones}
                      </p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-1">
                        <span>Revisor: <strong className="text-foreground">{selectedSolicitud.informeNormativa.firmadoPorRevisorNombre || "Carlos Mora"}</strong></span>
                        <span>Directora: <strong className="text-foreground">{selectedSolicitud.informeNormativa.firmadoPorDirectorNombre || "Dra. Valentina Paz"}</strong></span>
                      </div>
                    </div>
                  ) : null}

                  {/* Documentos del Expediente */}
                  <div className="border border-border rounded-xl p-4 bg-background space-y-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      Documentos Habilitantes Anexos
                    </h3>
                    <div className="space-y-1.5">
                      {selectedSolicitud.documentos?.map((d) => (
                        <div key={d.id} className="flex items-center justify-between text-xs py-1 border-b border-border last:border-none">
                          <span className="text-foreground font-medium">{d.nombre}</span>
                          <span className="text-muted-foreground text-[11px]">{d.categoria || d.tipo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* SI ES PRIVADA: CHECKLIST CONTRATO + PAGO */
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileSignature className="size-4 text-primary" />
                      1. Estado del Contrato Interinstitucional Privado
                    </h3>
                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Contrato formal:</span>
                        <span className="font-semibold text-foreground">{selectedSolicitud.contratoDetalle?.numero || selectedSolicitud.contrato || "CONTR-2026-0019"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Firma Coordinador SINARP:</span>
                        <Badge tone={selectedSolicitud.contratoDetalle?.firmadoCoordinador ? "success" : "warning"} appearance="soft">
                          {selectedSolicitud.contratoDetalle?.firmadoCoordinador ? "Firmado electrónicamente" : "Pendiente"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Firma Máxima Autoridad DINARP:</span>
                        <Badge tone={selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad ? "success" : "warning"} appearance="soft">
                          {selectedSolicitud.contratoDetalle?.firmadoMaximaAutoridad ? "Firmado electrónicamente" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Receipt className="size-4 text-primary" />
                      2. Liquidación y Acreditación Financiera (SIGEF)
                    </h3>
                    <div className="text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Factura N.º:</span>
                        <span className="font-semibold text-foreground">{selectedSolicitud.factura?.numero || "FAC-0028"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Valor a recaudar:</span>
                        <span className="font-bold text-foreground">{selectedSolicitud.factura?.valor || "$ 150.00"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Estado de verificación del pago:</span>
                        <Badge
                          tone={
                            selectedSolicitud.estado === "Pago verificado" || selectedSolicitud.estado === "Pago validado" || selectedSolicitud.estado === "Acceso habilitado"
                              ? "success"
                              : "warning"
                          }
                          appearance="soft"
                        >
                          {selectedSolicitud.estado === "Pago verificado" || selectedSolicitud.estado === "Pago validado" || selectedSolicitud.estado === "Acceso habilitado"
                            ? "Pago Verificado y Acreditado"
                            : "Pendiente de acreditación"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Historial del trámite */}
              <div className="border border-border rounded-xl p-4 bg-background space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  Historial y Trazabilidad del Trámite
                </h3>
                <TrazabilidadTimeline historial={selectedSolicitud.historial || []} />
              </div>

              {/* Botón de Acción Principal en Drawer */}
              {(selectedSolicitud.estado === "Aprobada por Gestión" ||
                selectedSolicitud.estado === "Aprobada por Normatividad" ||
                selectedSolicitud.estado === "En formalización" ||
                selectedSolicitud.estado === "Aprobación final" ||
                (selectedSolicitud.tipoInstitucion === "Privada" && selectedSolicitud.estado === "Pago verificado")) && (
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setResolucionAdmin(`RESOLUCION-DINARP-DIR-2026-${selectedSolicitud.id.replace("SOL-2026-", "")}`);
                      setModalAprobacion(selectedSolicitud);
                    }}
                    className="w-full gap-2 font-semibold bg-primary text-primary-foreground py-2.5"
                  >
                    <FileCheck2 className="size-4" />
                    Aprobar expediente y solicitar habilitación técnica
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal XL de Aprobación Final (SOL-10) */}
      <Dialog open={!!modalAprobacion} onOpenChange={(open) => !open && setModalAprobacion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-primary" />
              Aprobación Administrativa de Acceso
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Al confirmar esta acción, la solicitud pasa a estado <strong className="text-foreground">"Solicitud aprobada — habilitación técnica pendiente"</strong> y se despacha la orden técnica para aprovisionamiento de credenciales.
            </DialogDescription>
          </DialogHeader>

          {modalAprobacion && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-xl border border-border bg-muted/40 text-xs space-y-1.5">
                <p><span className="text-muted-foreground">Solicitud:</span> <strong className="text-foreground">{modalAprobacion.id}</strong></p>
                <p><span className="text-muted-foreground">Institución:</span> <strong className="text-foreground">{modalAprobacion.institucion}</strong></p>
                <p><span className="text-muted-foreground">Fuente:</span> <strong className="text-foreground">{modalAprobacion.fuentePrincipal || modalAprobacion.fuentes?.[0]?.nombre}</strong></p>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-semibold text-foreground">
                  Número de Resolución Administrativa DINARP:
                </label>
                <input
                  type="text"
                  value={resolucionAdmin}
                  onChange={(e) => setResolucionAdmin(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  placeholder="Ej: RESOLUCION-DINARP-DIR-2026-001"
                />
              </div>

              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Qué ocurrirá después:</p>
                <p>1. Se asienta la resolución formal en el historial de trazabilidad del portal.</p>
                <p>2. El Equipo TI recibirá la orden de habilitación en el módulo de infraestructura de consumo.</p>
                <p>3. El acceso se considerará habilitado una vez que TI confirme el aprovisionamiento de seguridad.</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalAprobacion(null)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleConfirmarAprobacion} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Check className="size-4" />
              Confirmar aprobación y ordenar habilitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
