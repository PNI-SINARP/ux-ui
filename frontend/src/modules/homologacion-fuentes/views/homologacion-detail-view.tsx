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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  Calendar,
  Activity,
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
    agregarEvidencia,
  } = useHomologacionStore();

  const [activeTab, setActiveTab] = useState("especificacion");
  const [isAprobarOpen, setIsAprobarOpen] = useState(false);
  const [isRechazarOpen, setIsRechazarOpen] = useState(false);
  const [isEvidenciaOpen, setIsEvidenciaOpen] = useState(false);
  const [nombreConectorGenerado, setNombreConectorGenerado] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [textoNuevaEvidencia, setTextoNuevaEvidencia] = useState("");

  const caso = getCasoById(id);
  const responsableTi = currentUser?.name || "Ing. Gabriel Flores (Equipo TI DINARP)";

  if (!isLoaded) {
    return (
      <WireframeDashboardLayout
        activeMenu="tecnologia-homologaciones"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Homologación de orígenes", href: "/tecnologia/homologaciones" },
          { label: "Cargando..." },
        ]}
      >
        <div className="py-20 text-center text-xs text-muted-foreground">
          Cargando caso de homologación técnica...
        </div>
      </WireframeDashboardLayout>
    );
  }

  if (!caso) {
    return (
      <WireframeDashboardLayout
        activeMenu="tecnologia-homologaciones"
        currentUser={currentUser}
        breadcrumbs={[
          { label: "Homologación de orígenes", href: "/tecnologia/homologaciones" },
          { label: "No encontrado" },
        ]}
      >
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 items-center justify-center p-8 text-center space-y-4"
          >
            <Cpu className="size-12 text-muted-foreground/40 mx-auto" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Caso no encontrado
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No se encontró el caso de homologación solicitado ({id}).
            </p>
            <Link href="/tecnologia/homologaciones">
              <Button variant="neutral" size="sm">
                <ArrowLeft className="size-4 mr-2" />
                Volver a la bandeja
              </Button>
            </Link>
          </Card>
        </main>
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
        description: `Conector '${conector}' registrado en catálogo. La fuente vinculada pasó a 'Conexión pendiente'.`,
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

  const handleAgregarEvidencia = () => {
    if (!textoNuevaEvidencia.trim()) {
      toast.error("El texto de la prueba es requerido");
      return;
    }

    const res = agregarEvidencia(caso.id_caso, textoNuevaEvidencia.trim(), responsableTi);
    if (res.success) {
      toast.success("Evidencia técnica registrada en laboratorio");
      setTextoNuevaEvidencia("");
      setIsEvidenciaOpen(false);
    }
  };

  const getEstadoBadge = (estado: EstadoHomologacion) => {
    switch (estado) {
      case "Registrado":
        return <Badge tone="neutral" appearance="soft" size="md">Registrado</Badge>;
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
      activeMenu="tecnologia-homologaciones"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Homologación de orígenes", href: "/tecnologia/homologaciones" },
        { label: `Caso ${caso.id_caso}` },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Cabecera del expediente */}
          <div className="flex flex-col gap-4 pb-4 border-b border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <Button
                  variant="neutral"
                  size="sm"
                  asChild
                  leftIcon={<ArrowLeft className="size-4" />}
                >
                  <Link href="/tecnologia/homologaciones">
                    Volver a homologación de orígenes
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {caso.id_fuente && (
                  <Button
                    variant="neutral"
                    size="sm"
                    asChild
                    leftIcon={<ExternalLink className="size-3.5" />}
                  >
                    <Link href={`/proveedor/fuentes/${caso.id_fuente}`}>
                      Ver fuente vinculada
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-foreground break-words">
                    Caso {caso.id_caso}
                  </h1>
                  {getEstadoBadge(caso.estado)}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal">
                  Expediente de homologación técnica para conectores no estandarizados (CNX-01 / CNX-02).
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="font-mono bg-muted/60 px-2 py-0.5 rounded text-[11px] text-foreground font-semibold">
                    ID: {caso.id_caso}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    {caso.institucion_nombre}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Cpu className="size-3.5 text-primary" />
                    {caso.tecnologia_solicitada}
                  </span>
                  <span>•</span>
                  <span className="font-mono flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    {new Date(caso.fecha_solicitud).toLocaleDateString("es-EC")}
                  </span>
                </div>
              </div>

              {/* Acciones principales de TI según estado */}
              <div className="flex flex-wrap items-center gap-2">
                {caso.estado === "En homologación" || caso.estado === "Registrado" ? (
                  <>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsRechazarOpen(true)}
                      leftIcon={<XCircle className="size-3.5" />}
                      className="text-xs h-9 cursor-pointer"
                    >
                      No homologar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setNombreConectorGenerado(
                          `${caso.tecnologia_solicitada.split(" ")[0]} Connector v1.0.0`
                        );
                        setIsAprobarOpen(true);
                      }}
                      leftIcon={<CheckCircle2 className="size-3.5" />}
                      className="text-xs h-9 cursor-pointer"
                    >
                      Aprobar homologación
                    </Button>
                  </>
                ) : caso.estado === "No homologado" ? (
                  <Button
                    variant="neutral"
                    size="sm"
                    onClick={handleReintentar}
                    leftIcon={<RotateCcw className="size-3.5" />}
                    className="text-xs h-9 cursor-pointer"
                  >
                    Reintentar homologación
                  </Button>
                ) : (
                  <Badge tone="success" appearance="soft" size="md">
                    Conector Certificado en Catálogo
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Banner de Estado Homologado / No Homologado / En Curso */}
          {caso.estado === "Homologado" && (
            <div className="p-4 bg-success/10 rounded-2xl border border-success/30 flex items-start gap-3.5">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  Tecnología Homologada y Conector Disponible (CNX-01 / CNX-02)
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Se generó y certificó el conector <strong className="text-foreground">{caso.tipo_conector_generado}</strong>. La institución proveedora ya dispone de este conector en su bandeja para ingresar credenciales y probar conectividad por VPN.
                </p>
                {caso.id_fuente && (
                  <Link
                    href={`/proveedor/fuentes/${caso.id_fuente}`}
                    className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline pt-1"
                  >
                    Ver fuente vinculada ({caso.id_fuente}) <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {caso.estado === "No homologado" && (
            <div className="p-4 bg-danger/10 rounded-2xl border border-danger/30 flex items-start gap-3.5">
              <XCircle className="size-5 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-danger">
                  Homologación Técnica Rechazada
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Motivo técnico:</strong> {caso.motivo_rechazo || "Incompatibilidad de protocolo o riesgos de seguridad no mitigables."}
                </p>
              </div>
            </div>
          )}

          {caso.estado === "En homologación" && (
            <div className="p-4 bg-warning/10 rounded-2xl border border-warning/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
              <div className="flex items-start gap-3.5">
                <Clock className="size-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                    Evaluación Técnica Activa en Laboratorio DINARP
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    El caso se encuentra en pruebas de compatibilidad, transcodificación y aislamiento de red en la VPC de Pruebas.
                  </p>
                </div>
              </div>
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setIsEvidenciaOpen(true)}
                leftIcon={<Plus className="size-3.5" />}
                className="text-xs shrink-0 self-start sm:self-auto"
              >
                Añadir prueba
              </Button>
            </div>
          )}

          {/* Navegación por pestañas organizada como en Admin */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
            <TabsList className="bg-muted/40 p-1 rounded-xl w-full sm:w-auto flex flex-wrap">
              <TabsTrigger value="especificacion" className="text-xs font-semibold px-4 py-2">
                Especificación técnica
              </TabsTrigger>
              <TabsTrigger value="bitacora" className="text-xs font-semibold px-4 py-2">
                Bitácora de laboratorio ({caso.evidencias_pruebas?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="estandar" className="text-xs font-semibold px-4 py-2">
                Estándar CNX-01/02
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Especificación Técnica */}
            <TabsContent value="especificacion" className="space-y-4 pt-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna A: Especificaciones Técnicas del Origen */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <div className="flex items-center gap-2.5">
                      <Server className="size-4.5 shrink-0" />
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Especificación Técnica del Origen
                      </h3>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm">
                      {caso.protocolo}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Tecnología requerida:</span>
                      <span className="text-xs font-semibold text-foreground block">{caso.tecnologia_solicitada}</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Protocolo de transporte:</span>
                      <span className="text-xs font-mono font-semibold text-foreground block">{caso.protocolo}</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Institución solicitante:</span>
                      <span className="text-xs font-semibold text-foreground block">{caso.institucion_nombre}</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Fuente vinculada:</span>
                      <span className="text-xs font-semibold text-foreground block">{caso.fuente_nombre}</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Responsable técnico TI:</span>
                      <span className="text-xs font-semibold text-foreground block">{caso.responsable_ti || "Sin asignar"}</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Fecha de solicitud:</span>
                      <span className="text-xs font-mono font-semibold text-foreground block">
                        {new Date(caso.fecha_solicitud).toLocaleString("es-EC")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <FileCheck className="size-3.5 text-primary" />
                      <span>Diagnóstico preliminar de laboratorio:</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {caso.diagnostico}
                    </p>
                  </div>
                </div>

                {/* Columna B: Estado de Certificación y Seguridad */}
                <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="size-4.5 shrink-0" />
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Certificación y Estado del Conector
                      </h3>
                    </div>
                    {getEstadoBadge(caso.estado)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Conector resultante:</span>
                      <span className="text-xs font-mono font-semibold text-foreground block">
                        {caso.tipo_conector_generado || "Pendiente de aprobación"}
                      </span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Entorno de prueba:</span>
                      <span className="text-xs font-semibold text-foreground block">VPC DINARP - Subred Laboratorio</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Cifrado en tránsito:</span>
                      <span className="text-xs font-semibold text-success block">TLS 1.3 Forzado</span>
                    </div>
                    <div className="p-3.5 bg-muted/20 rounded-xl border border-border/60 space-y-0.5">
                      <span className="text-[11px] text-muted-foreground font-medium block">Gestión de secretos:</span>
                      <span className="text-xs font-semibold text-foreground block">KMS DINARP (Sin texto claro)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border/80 bg-surface space-y-2.5">
                    <h4 className="text-xs font-bold font-heading text-foreground uppercase tracking-wider">
                      Acciones resolutivas del equipo TI
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Al aprobar el caso, el conector se incorpora de inmediato al catálogo reutilizable y la fuente vinculada pasa al estado <strong>Conexión pendiente</strong>. Si se rechaza, se notifica el dictamen negativo con la justificación registrada.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {caso.estado === "En homologación" || caso.estado === "Registrado" ? (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setIsRechazarOpen(true)}
                            leftIcon={<XCircle className="size-3.5" />}
                            className="text-xs"
                          >
                            Rechazar con dictamen
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setNombreConectorGenerado(
                                `${caso.tecnologia_solicitada.split(" ")[0]} Connector v1.0.0`
                              );
                              setIsAprobarOpen(true);
                            }}
                            leftIcon={<CheckCircle2 className="size-3.5" />}
                            className="text-xs"
                          >
                            Aprobar y certificar
                          </Button>
                        </>
                      ) : caso.estado === "No homologado" ? (
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={handleReintentar}
                          leftIcon={<RotateCcw className="size-3.5" />}
                          className="text-xs"
                        >
                          Reabrir pruebas técnicas
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-success font-medium">
                          <CheckCircle2 className="size-4" />
                          <span>Conector en estado productivo. No requiere acciones adicionales.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Bitácora de Laboratorio */}
            <TabsContent value="bitacora" className="space-y-4 pt-1">
              <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="size-4.5 text-primary shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Registro Cronológico de Pruebas en Laboratorio
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Ensayos de conectividad por VPN, handshake criptográfico y compatibilidad de esquema.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral" appearance="soft" size="sm">
                      {caso.evidencias_pruebas?.length || 0} registros
                    </Badge>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={() => setIsEvidenciaOpen(true)}
                      leftIcon={<Plus className="size-3.5" />}
                      className="text-xs"
                    >
                      Registrar prueba
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {caso.evidencias_pruebas && caso.evidencias_pruebas.length > 0 ? (
                    caso.evidencias_pruebas.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-border/60 bg-muted/20 text-xs font-mono space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-sans">
                          <span className="font-semibold text-foreground">Entrada #{idx + 1}</span>
                          <span className="text-success flex items-center gap-1 font-medium">
                            <ShieldCheck className="size-3.5" /> Verificado en laboratorio
                          </span>
                        </div>
                        <p className="text-foreground text-xs leading-relaxed break-words">{ev}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                      <Terminal className="size-8 text-muted-foreground/40 mx-auto" />
                      <p>No se registran evidencias técnicas aún.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Estándar CNX-01 / CNX-02 */}
            <TabsContent value="estandar" className="space-y-4 pt-1">
              <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-surface shadow-2xs space-y-4 overflow-hidden">
                <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <div className="flex items-center gap-2.5">
                    <Layers className="size-4.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold font-heading text-foreground">
                        Estándar de Conectores DINARP (CNX-01 / CNX-02)
                      </h3>
                      <p className="text-xs text-muted-foreground font-normal">
                        Requerimientos normativos y de seguridad para la habilitación de orígenes en la plataforma.
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" appearance="soft" size="sm">
                    Normativa Técnica DINARP
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Cpu className="size-4 text-primary" />
                      <span>1. Encapsulamiento en Microservicio</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      El conector corre de forma aislada en contenedores OCI administrados por DINARP, abstrayendo protocolos legados y exponiendo APIs gRPC/REST normalizadas.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <ShieldCheck className="size-4 text-primary" />
                      <span>2. Gestión Segura de Credenciales</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Ninguna credencial o secreto se persiste en texto plano ni viaja en logs. Se utiliza rotación y custodia mediante Google Cloud KMS y Secret Manager.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <Activity className="size-4 text-primary" />
                      <span>3. Observabilidad y SLA</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Medición continua de latencia de red en milisegundos, tasa de error y disponibilidad conforme a los umbrales exigidos en FUE-01.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
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
                El estado cambiará automáticamente a <strong>Conexión pendiente</strong>, permitiendo al Coordinador ingresar las credenciales y probar conectividad por VPN.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="neutral" size="sm" onClick={() => setIsAprobarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleAprobar}>
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
            <Button variant="neutral" size="sm" onClick={() => setIsRechazarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleRechazar}>
              Registrar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Registrar Evidencia de Laboratorio */}
      <Dialog open={isEvidenciaOpen} onOpenChange={setIsEvidenciaOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Terminal className="size-5 text-primary" />
              Registrar Evidencia de Laboratorio
            </DialogTitle>
            <DialogDescription className="text-xs">
              Añada un registro técnico de prueba de conectividad, latencia o transcodificación al expediente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="textoEvidencia" className="text-xs font-semibold">
                Descripción de la prueba técnica <span className="text-danger">*</span>:
              </Label>
              <Textarea
                id="textoEvidencia"
                rows={4}
                value={textoNuevaEvidencia}
                onChange={(e) => setTextoNuevaEvidencia(e.target.value)}
                placeholder="ej. Handshake TLS 1.3 verificado sobre puerto 50000. Latencia de respuesta: 42ms."
                className="text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="neutral" size="sm" onClick={() => setIsEvidenciaOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleAgregarEvidencia}>
              Guardar Evidencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
