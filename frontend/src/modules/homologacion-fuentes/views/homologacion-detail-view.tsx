"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Cpu,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Server,
  Layers,
  ShieldCheck,
  Clock,
  RotateCcw,
  FileCheck,
  Plus,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useHomologacionStore } from "../data/homologacion-store";
import { EstadoHomologacion } from "@/modules/fuentes/data/fuentes-data";

interface HomologacionDetailViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

export function HomologacionDetailView({ currentUser }: HomologacionDetailViewProps) {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const {
    casos,
    isLoaded,
    getCasoById,
    aprobarHomologacion,
    rechazarHomologacion,
    reintentarHomologacion,
  } = useHomologacionStore();

  const [isAprobarOpen, setIsAprobarOpen] = useState(false);
  const [isRechazarOpen, setIsRechazarOpen] = useState(false);
  const [nombreConectorGenerado, setNombreConectorGenerado] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [nuevaEvidencia, setNuevaEvidencia] = useState("");

  const caso = getCasoById(id);
  const responsableTi = currentUser?.name || "Ing. Gabriel Flores (Equipo TI DINARP)";

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground">
        Cargando caso de homologación técnica...
      </div>
    );
  }

  if (!caso) {
    return (
      <WireframeDashboardLayout activeMenu="homologacion-fuentes" currentUser={currentUser}>
        <div className="py-16 text-center space-y-3">
          <Cpu className="size-10 text-muted-foreground/40 mx-auto" />
          <h3 className="font-heading font-bold text-base text-foreground">
            Caso no encontrado
          </h3>
          <p className="text-xs text-muted-foreground">
            No se encontró el caso de homologación solicitado ({id}).
          </p>
          <Link href="/homologacion-fuentes">
            <Button variant="outline" size="sm">
              Volver a la bandeja
            </Button>
          </Link>
        </div>
      </WireframeDashboardLayout>
    );
  }

  const handleAprobar = () => {
    const conector =
      nombreConectorGenerado.trim() ||
      `${caso.tecnologia_solicitada.split(" ")[0]} Connector v1.0.0`;

    const res = aprobarHomologacion(caso.id_caso, conector, responsableTi);
    if (res.success) {
      toast.success("Homologación técnica aprobada (CNX-01/02)", {
        description: `Conector '${conector}' registrado en catálogo. La fuente vinculada pasó a 'Conexión pendiente' para continuar su configuración.`,
      });
      setIsAprobarOpen(false);
    }
  };

  const handleRechazar = () => {
    if (!motivoRechazo.trim()) {
      toast.error("Motivo obligatorio", {
        description: "Debe ingresar una justificación técnica para no homologar este origen.",
      });
      return;
    }

    const res = rechazarHomologacion(caso.id_caso, motivoRechazo.trim(), responsableTi);
    if (res.success) {
      toast.warning("Caso marcado como No Homologado", {
        description: "Se notificó a la institución el motivo técnico de incompatibilidad.",
      });
      setIsRechazarOpen(false);
    }
  };

  const handleReintentar = () => {
    const res = reintentarHomologacion(caso.id_caso);
    if (res.success) {
      toast.info("Caso reabierto para nuevas pruebas en laboratorio");
    }
  };

  const getEstadoBadge = (estado: EstadoHomologacion) => {
    switch (estado) {
      case "Registrado":
        return <Badge tone="info" appearance="soft" size="md">Registrado</Badge>;
      case "En homologación":
        return <Badge tone="warning" appearance="soft" size="md">En homologación</Badge>;
      case "Homologado":
        return <Badge tone="success" appearance="soft" size="md">Homologado (CNX-01/02)</Badge>;
      case "No homologado":
        return <Badge tone="danger" appearance="soft" size="md">No homologado</Badge>;
      case "Cerrado sin homologar":
        return <Badge tone="neutral" appearance="soft" size="md">Cerrado sin homologar</Badge>;
      default:
        return <Badge tone="neutral" appearance="soft" size="md">{estado}</Badge>;
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="homologacion-fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Homologación técnica", href: "/homologacion-fuentes" },
        { label: caso.id_caso },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header con navegación y acciones */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-start gap-3">
              <Link href="/homologacion-fuentes">
                <Button variant="ghost" size="icon-sm" className="mt-0.5 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground">
                    Caso {caso.id_caso} · {caso.tecnologia_solicitada}
                  </h1>
                  {getEstadoBadge(caso.estado)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Building2 className="size-3.5 text-primary" />
                  {caso.institucion_nombre} · Fuente: <strong className="text-foreground">{caso.fuente_nombre}</strong>
                </p>
              </div>
            </div>

            {/* Acciones de TI según estado */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              {caso.estado === "En homologación" || caso.estado === "Registrado" ? (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setIsRechazarOpen(true)}
                    className="text-xs h-9 cursor-pointer"
                  >
                    <XCircle className="size-3.5 mr-1.5" />
                    No homologar
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setNombreConectorGenerado(
                        `${caso.tecnologia_solicitada.split(" ")[0]} Connector v1.0.0`
                      );
                      setIsAprobarOpen(true);
                    }}
                    className="text-xs h-9 cursor-pointer"
                  >
                    <CheckCircle2 className="size-3.5 mr-1.5" />
                    Aprobar homologación
                  </Button>
                </>
              ) : caso.estado === "No homologado" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReintentar}
                  className="text-xs h-9 cursor-pointer"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Reintentar homologación
                </Button>
              ) : (
                <Badge tone="success" appearance="soft" size="md">
                  Conector Certificado en Catálogo
                </Badge>
              )}
            </div>
          </div>

          {/* Banner de Estado Homologado / No Homologado */}
          {caso.estado === "Homologado" && (
            <div className="p-4 bg-success/10 rounded-xl border border-success/30 flex items-start gap-3">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-xs text-foreground uppercase tracking-wider">
                  Tecnología Homologada y Conector Disponible (CNX-01 / CNX-02)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Se generó y certificó el conector <strong>{caso.tipo_conector_generado}</strong>. La institución proveedora ya puede completar el paso de conexión en la bandeja de fuentes.
                </p>
                {caso.id_fuente && (
                  <Link href={`/fuentes/${caso.id_fuente}`} className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline mt-1">
                    Ver fuente asociada ({caso.id_fuente}) <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {caso.estado === "No homologado" && (
            <div className="p-4 bg-danger/10 rounded-xl border border-danger/30 flex items-start gap-3">
              <XCircle className="size-5 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-xs text-danger uppercase tracking-wider">
                  Homologación Rechazada
                </h4>
                <p className="text-xs text-muted-foreground">
                  <strong>Motivo técnico:</strong> {caso.motivo_rechazo || "Incompatibilidad de protocolo o riesgos de seguridad no mitigables."}
                </p>
              </div>
            </div>
          )}

          {/* Grid de 2 Columnas: Datos Técnicos y Pruebas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna 1: Especificaciones Técnicas */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Server className="size-4 text-primary" />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                    Especificación Técnica del Origen
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Tecnología:</span>
                    <strong className="text-foreground">{caso.tecnologia_solicitada}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Protocolo de Transporte:</span>
                    <strong className="text-foreground font-mono">{caso.protocolo}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Responsable Técnico TI:</span>
                    <span className="text-foreground">{caso.responsable_ti || "Sin asignar"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Fecha de Solicitud:</span>
                    <span className="text-foreground font-mono">
                      {new Date(caso.fecha_solicitud).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block text-[11px] mb-1">Diagnóstico Preliminar:</span>
                  <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg leading-relaxed">
                    {caso.diagnostico}
                  </p>
                </div>
              </div>

              {/* Arquitectura de Conector Reutilizable (CNX-01/02) */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Layers className="size-4" />
                  <span>Estándar de Conectores DINARP (CNX-01 / CNX-02)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Toda homologación aprobada debe encapsularse en una imagen de conector estándar capaz de correr en el clúster de microservicios DINARP, reportar métricas OpenTelemetry y gestionar credenciales vía KMS sin persistir contraseñas en claro.
                </p>
              </div>
            </div>

            {/* Columna 2: Registro de Pruebas y Evidencias */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-surface space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Terminal className="size-4 text-primary" />
                    <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                      Bitácora de Laboratorio y Evidencias
                    </h3>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm">
                    {caso.evidencias_pruebas?.length || 0} registros
                  </Badge>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {caso.evidencias_pruebas && caso.evidencias_pruebas.length > 0 ? (
                    caso.evidencias_pruebas.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg border border-border bg-muted/20 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Entrada #{idx + 1}</span>
                          <span className="text-success flex items-center gap-1">
                            <ShieldCheck className="size-3" /> Verificado
                          </span>
                        </div>
                        <p className="text-foreground">{ev}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic py-4 text-center">
                      No hay evidencias técnicas registradas todavía.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      {/* Dialog Aprobar Homologación */}
      <Dialog open={isAprobarOpen} onOpenChange={setIsAprobarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-5 text-success" />
              Aprobar Homologación Técnica (CNX-01/02)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Al aprobar este origen, se generará una entrada en el catálogo de conectores habilitados y se notificará al Coordinador para que continúe con el alta de la fuente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="conectorName" className="text-xs font-semibold">
                Nombre del conector estandarizado generado:
              </Label>
              <Input
                id="conectorName"
                value={nombreConectorGenerado}
                onChange={(e) => setNombreConectorGenerado(e.target.value)}
                placeholder="ej. IBM DB2 Connector v1.0.0"
                className="text-xs font-mono"
              />
            </div>
            <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground space-y-1">
              <p>
                <strong>Efecto en la fuente vinculada:</strong>
              </p>
              <p>
                El estado cambiará automáticamente a <strong>Conexión pendiente</strong>, permitiendo al Coordinador ingresar las credenciales y probar conectividad.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsAprobarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="success" size="sm" onClick={handleAprobar}>
              Confirmar Aprobación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar Homologación */}
      <Dialog open={isRechazarOpen} onOpenChange={setIsRechazarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-danger">
              <XCircle className="size-5" />
              Rechazar Homologación Técnica
            </DialogTitle>
            <DialogDescription className="text-xs">
              Especifique las razones técnicas que impiden soportar este origen en la infraestructura de DINARP.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="motivo" className="text-xs font-semibold">
                Motivo del rechazo técnico <span className="text-danger">*</span>:
              </Label>
              <Textarea
                id="motivo"
                rows={4}
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Indique los hallazgos de red, incompatibilidades criptográficas o riesgos que motivan el rechazo..."
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsRechazarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleRechazar}>
              Registrar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
