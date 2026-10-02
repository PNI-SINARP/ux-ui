"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Building2,
  ShieldCheck,
  FolderArchive,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  EyeOff,
  ExternalLink,
  Info,
  Layers,
  ArrowRight,
  AlertTriangle,
  FileCheck2,
  FileBadge,
  UserCheck,
  History,
  FileCode,
  Check,
  X,
  BellRing
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardDecorativeIcon } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import {
  MOCK_USERS_BY_ROLE,
  type NovedadCatalogo,
  type TipoNovedad,
  type EstadoNovedad
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface NovedadDetailClientViewProps {
  initialNovedad: NovedadCatalogo;
}

export function CatalogoNovedadDetailView({ initialNovedad }: NovedadDetailClientViewProps) {
  const [novedad, setNovedad] = useState<NovedadCatalogo>(initialNovedad);

  // Estados de edición DGR
  const [conceptoLegal, setConceptoLegal] = useState(
    novedad.evaluacionDGR.conceptoLegal ||
    "Cumple con los requisitos establecidos en el Art. 18 de la Resolución N° 004-DN-2023. La entidad rectora fundamentó adecuadamente el requerimiento."
  );
  const [conceptoFuncional, setConceptoFuncional] = useState(
    novedad.evaluacionDGR.conceptoFuncional ||
    "No existen solicitudes de acceso en trámite dependientes de esta fuente. Se procede a coordinar la actualización del catálogo."
  );

  // Modales
  const [isNoProcedeModalOpen, setIsNoProcedeModalOpen] = useState(false);
  const [justificacionNoProcede, setJustificacionNoProcede] = useState("");
  const [isAplicarModalOpen, setIsAplicarModalOpen] = useState(false);

  // Notificación de fusión
  const [notificacionEnviada, setNotificacionEnviada] = useState(
    novedad.notificacionFusion?.notificadoCoordinador || false
  );

  const getBadgeEstado = (estado: EstadoNovedad) => {
    switch (estado) {
      case "En validación":
        return (
          <Badge tone="warning" appearance="soft" size="md" className="font-semibold gap-1.5 px-3 py-1">
            <Clock className="size-3.5" />
            EN VALIDACIÓN
          </Badge>
        );
      case "Finalizada":
        return (
          <Badge tone="success" appearance="soft" size="md" className="font-semibold gap-1.5 px-3 py-1">
            <CheckCircle2 className="size-3.5" />
            FINALIZADA
          </Badge>
        );
      case "No procede":
        return (
          <Badge tone="neutral" appearance="soft" size="md" className="font-semibold gap-1.5 px-3 py-1 text-muted-foreground">
            <XCircle className="size-3.5" />
            NO PROCEDE
          </Badge>
        );
    }
  };

  const getBadgeTipo = (tipo: TipoNovedad) => {
    switch (tipo) {
      case "Eliminación":
        return <Badge tone="danger" appearance="soft" size="md" className="font-semibold">{tipo}</Badge>;
      case "Supresión":
        return <Badge tone="warning" appearance="soft" size="md" className="font-semibold">{tipo}</Badge>;
      case "Fusión":
        return <Badge tone="info" appearance="soft" size="md" className="font-semibold">{tipo}</Badge>;
    }
  };

  // Handler: Dictamen Procede
  const handleDictamenProcede = () => {
    const today = new Date().toLocaleDateString("es-EC");
    setNovedad(prev => ({
      ...prev,
      ultimaActualizacion: today,
      evaluacionDGR: {
        ...prev.evaluacionDGR,
        procede: true,
        fechaDictamen: today,
        responsable: "María Torres (DGR)",
        conceptoLegal,
        conceptoFuncional
      },
      historialEventos: [
        {
          fecha: today,
          hora: "11:00",
          actor: "María Torres",
          rol: "DGR",
          accion: "Dictamen favorable registrado (HU-INT-17)",
          detalle: "DGR validó legal y funcionalmente la novedad emitiendo concepto favorable (Procede)."
        },
        ...prev.historialEventos
      ]
    }));
  };

  // Handler: Dictamen No Procede
  const handleDictamenNoProcedeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacionNoProcede.trim()) {
      alert("Debe registrar la justificación obligatoria para desestimar el trámite.");
      return;
    }

    const today = new Date().toLocaleDateString("es-EC");
    setNovedad(prev => ({
      ...prev,
      estado: "No procede",
      ultimaActualizacion: today,
      evaluacionDGR: {
        ...prev.evaluacionDGR,
        procede: false,
        fechaDictamen: today,
        responsable: "María Torres (DGR)",
        conceptoLegal,
        conceptoFuncional,
        justificacionNoProcede
      },
      historialEventos: [
        {
          fecha: today,
          hora: "11:15",
          actor: "María Torres",
          rol: "DGR",
          accion: "Novedad desestimada (No procede)",
          detalle: `Trámite finalizado como No Procede. Justificación: ${justificacionNoProcede}`
        },
        ...prev.historialEventos
      ]
    }));

    setIsNoProcedeModalOpen(false);
  };

  // Handler: Aplicar Desactivación / Actualización (HU-INT-18)
  const handleConfirmarAplicacion = () => {
    const today = new Date().toLocaleDateString("es-EC");
    const esDesactivacion = novedad.tipoNovedad === "Supresión" || novedad.tipoNovedad === "Eliminación";
    const nuevoEstadoFuente = esDesactivacion ? "DESACTIVADO" : "PUBLICADO";

    setNovedad(prev => ({
      ...prev,
      estado: "Finalizada",
      ultimaActualizacion: today,
      fuentesAfectadas: prev.fuentesAfectadas.map(fa => ({
        ...fa,
        estadoNuevo: nuevoEstadoFuente
      })),
      resultadoAplicado: {
        tipoResultado: esDesactivacion ? "Fuente desactivada" : "Fuente actualizada",
        fechaAplicacion: today,
        responsable: "María Torres (DGR)",
        observacion: esDesactivacion
          ? `Fuente marcada formalmente como DESACTIVADO en el catálogo. Se inhabilita para nuevas solicitudes manteniendo historial e inmutabilidad (HU-INT-18).`
          : `Fuente actualizada en catálogo conforme al trámite de fusión ${prev.nroTramite}.`
      },
      historialEventos: [
        {
          fecha: today,
          hora: "11:30",
          actor: "María Torres",
          rol: "DGR",
          accion: esDesactivacion ? "Fuente desactivada en catálogo (HU-INT-18)" : "Fuente actualizada en catálogo (HU-INT-18)",
          detalle: esDesactivacion
            ? `Estado de la fuente actualizado a DESACTIVADO en el Catálogo de Interoperabilidad. Expediente e historial preservados sin borrado físico.`
            : `Fusión de fuentes consolidada en catálogo.`
        },
        ...prev.historialEventos
      ]
    }));

    setIsAplicarModalOpen(false);
  };

  // Handler: Notificar Fusión (HU-INT-19)
  const handleEnviarNotificacionFusion = () => {
    const today = new Date().toLocaleDateString("es-EC");
    setNotificacionEnviada(true);
    setNovedad(prev => ({
      ...prev,
      notificacionFusion: {
        requiereNotificacion: true,
        notificadoCoordinador: true,
        fechaNotificacion: today,
        mensajeEnviado: "Notificación formal de fusión enviada automáticamente al Coordinador SINARP institucional."
      },
      historialEventos: [
        {
          fecha: today,
          hora: "11:45",
          actor: "Sistema DINARP",
          rol: "Automático",
          accion: "Notificación enviada al Coordinador SINARP (HU-INT-19)",
          detalle: "Comunicación formal enviada a los Coordinadores SINARP titular y suplente sobre la resolución de la novedad."
        },
        ...prev.historialEventos
      ]
    }));
  };

  const fuentePrincipal = novedad.fuentesAfectadas[0];

  return (
    <WireframeDashboardLayout
      activeMenu="novedades-catalogo"
      currentRole="DGR"
      currentUser={MOCK_USERS_BY_ROLE.DGR}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Breadcrumb */}
        <WireframeBreadcrumbs
          segments={[
            { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
            { label: "Novedades", href: "/catalogo-interoperabilidad/novedades" },
            { label: novedad.nroTramite }
          ]}
        />

        {/* Barra de Retorno y Accesos */}
        <div className="flex items-center justify-between gap-4 -mt-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/catalogo-interoperabilidad/novedades">
              <ArrowLeft className="size-4" />
              Volver a Novedades
            </Link>
          </Button>

          {fuentePrincipal?.fuenteId && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
              <Link href={`/catalogo-interoperabilidad/gestion/fuente/${fuentePrincipal.fuenteId}`}>
                <Layers className="size-3.5" />
                Ver fuente en Gestión
                <ExternalLink className="size-3 text-muted-foreground" />
              </Link>
            </Button>
          )}
        </div>

        {/* HEADER DEL EXPEDIENTE */}
        <div className="border border-border bg-card rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="size-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-sm shrink-0">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground font-mono">
                    {novedad.nroTramite}
                  </h1>
                  {getBadgeTipo(novedad.tipoNovedad)}
                  {getBadgeEstado(novedad.estado)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Organismo solicitante: <strong className="text-foreground">{novedad.organismoSolicitante}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 text-xs text-muted-foreground">
            <div>
              <span className="block font-medium text-foreground">Fecha radicación</span>
              <span>{novedad.fechaRadicacion}</span>
            </div>
            <div>
              <span className="block font-medium text-foreground">Responsable actual</span>
              <span>María Torres (DGR)</span>
            </div>
          </div>
        </div>

        {/* GRID DE SECCIONES PRINCIPALES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA Y CENTRAL (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* SECCIÓN 1 — REQUERIMIENTO */}
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <FileCheck2 className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        1. Requerimiento del Organismo
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Datos formales y soporte documental recibido
                      </CardDescription>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    HU-INT-16
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-medium">Tipo de novedad</span>
                    <p className="font-semibold text-foreground text-sm">{novedad.tipoNovedad}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-medium">Organismo solicitante</span>
                    <p className="font-semibold text-foreground text-sm">{novedad.organismoSolicitante}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-medium">Fecha de radicación</span>
                    <p className="font-medium text-foreground">{novedad.fechaRadicacion}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-medium">Responsable asignado</span>
                    <p className="font-medium text-foreground">{novedad.evaluacionDGR.responsable}</p>
                  </div>
                </div>

                {/* Documento Soporte */}
                <div className="bg-muted/30 border border-border rounded-lg p-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded bg-surface border border-border flex items-center justify-center shrink-0">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">
                        {novedad.documentoSoporteOficio.numeroOficio}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {novedad.documentoSoporteOficio.archivoPdf} â€¢ {novedad.documentoSoporteOficio.archivoTamano || "1.8 MB"}
                      </p>
                    </div>
                  </div>

                  <Badge tone="neutral" appearance="soft" size="sm" className="shrink-0 text-xs font-mono">
                    Emisión: {novedad.documentoSoporteOficio.fechaOficio}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* SECCIÓN 2 — FUENTES AFECTADAS */}
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <Layers className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        2. Fuentes Afectadas en el Catálogo
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Fuentes existentes sobre las que recae la modificación solicitada
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-3">
                {novedad.fuentesAfectadas.map((fa, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-sm">
                          {fa.fuenteNombre}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          ({fa.codigoServicio || fa.fuenteId})
                        </span>
                        <Badge tone="neutral" appearance="soft" size="sm">
                          {fa.cantidadCampos || 3} campos
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fa.institucionNombre}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-muted-foreground">Estado actual:</span>
                        <Badge
                          tone={fa.estadoNuevo === "DESACTIVADO" ? "danger" : "neutral"}
                          appearance="soft"
                          size="sm"
                          className="font-mono text-[11px]"
                        >
                          {fa.estadoNuevo || fa.estadoPrevio}
                        </Badge>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                        <Link href={`/catalogo-interoperabilidad/gestion/fuente/${fa.fuenteId}`}>
                          Ver fuente
                          <ArrowRight className="size-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                <p className="text-[11px] text-muted-foreground italic">
                  * La modificación de la fuente se resuelve formalmente en este expediente y se refleja de forma inmediata en Gestión del Catálogo.
                </p>
              </CardContent>
            </Card>

            {/* SECCIÓN 3 — VALIDACIÓN LEGAL Y FUNCIONAL */}
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <ShieldCheck className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        3. Validación Legal y Funcional
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Evaluación jurídica y técnica de pertinencia conforme a Resolución 004-DN-2023
                      </CardDescription>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    HU-INT-17
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-5">
                {/* Concepto Legal */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Concepto Legal <span className="text-destructive">*</span>
                  </Label>
                  {novedad.estado === "En validación" ? (
                    <Textarea
                      value={conceptoLegal}
                      onChange={e => setConceptoLegal(e.target.value)}
                      rows={3}
                      className="text-xs leading-relaxed"
                      placeholder="Indique la fundamentación jurídica según normativa aplicable..."
                    />
                  ) : (
                    <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs leading-relaxed text-foreground">
                      {novedad.evaluacionDGR.conceptoLegal || conceptoLegal}
                    </div>
                  )}
                </div>

                {/* Concepto Funcional */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold text-foreground">
                    Concepto Funcional e Impacto en Catálogo <span className="text-destructive">*</span>
                  </Label>
                  {novedad.estado === "En validación" ? (
                    <Textarea
                      value={conceptoFuncional}
                      onChange={e => setConceptoFuncional(e.target.value)}
                      rows={3}
                      className="text-xs leading-relaxed"
                      placeholder="Analice la viabilidad funcional, consumos activos y efectos sobre el catálogo..."
                    />
                  ) : (
                    <div className="p-3 bg-muted/20 border border-border rounded-lg text-xs leading-relaxed text-foreground">
                      {novedad.evaluacionDGR.conceptoFuncional || conceptoFuncional}
                    </div>
                  )}
                </div>

                {/* Dictamen y Decisiones */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Dictamen DGR:</span>
                    <div className="mt-1">
                      {novedad.evaluacionDGR.procede === true && (
                        <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-medium">
                          <CheckCircle2 className="size-3" />
                          Dictamen Favorable (Procede)
                        </Badge>
                      )}
                      {novedad.evaluacionDGR.procede === false && (
                        <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 font-medium text-muted-foreground">
                          <XCircle className="size-3" />
                          Dictamen Desfavorable (No procede)
                        </Badge>
                      )}
                      {novedad.evaluacionDGR.procede === undefined && (
                        <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-medium">
                          <Clock className="size-3" />
                          Pendiente de dictamen
                        </Badge>
                      )}
                    </div>
                  </div>

                  {novedad.estado === "En validación" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setIsNoProcedeModalOpen(true)}
                      >
                        <X className="size-3.5" />
                        No procede
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5 text-xs font-medium"
                        onClick={handleDictamenProcede}
                      >
                        <Check className="size-3.5" />
                        Procede
                      </Button>
                    </div>
                  )}
                </div>

                {/* Justificación de No Procede si aplica */}
                {novedad.evaluacionDGR.justificacionNoProcede && (
                  <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs flex flex-col gap-1">
                    <span className="font-semibold text-foreground">Justificación de no procedencia:</span>
                    <p className="text-muted-foreground leading-relaxed">
                      {novedad.evaluacionDGR.justificacionNoProcede}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SECCIÓN 4 — ACTUALIZACIÓN / DESACTIVACIÓN DE LA FUENTE */}
            {(novedad.evaluacionDGR.procede === true || novedad.estado === "Finalizada") && (
              <Card className="border-border">
                <CardHeader className="pb-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardDecorativeIcon>
                        <FolderArchive className="size-4 text-foreground" />
                      </CardDecorativeIcon>
                      <div>
                        <CardTitle className="text-base font-bold font-heading">
                          4. Actualización / Desactivación de la Fuente
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Aplicación del cambio formal sobre el Catálogo de Interoperabilidad
                        </CardDescription>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="outline" size="sm">
                      HU-INT-18
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 flex flex-col gap-4">
                  {/* Banner de regla inmutable */}
                  <div className="bg-muted/40 border border-border rounded-lg p-4 flex items-start gap-3">
                    <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <strong className="text-foreground">Regla del Catálogo (HU-INT-18 / Res. 004):</strong> NO existe borrado físico de registros.
                      Al confirmarse la supresión o eliminación, la fuente pasa automáticamente al estado <code className="text-foreground font-mono font-semibold">DESACTIVADO</code>, quedando inhabilitada para nuevas solicitudes de consumo pero <strong>conservando su expediente, metadatos y trazabilidad histórica inmutable</strong>.
                    </div>
                  </div>

                  {/* Comparador de estados Antes / Después */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-3.5 bg-surface flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Antes (Estado actual)
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-xs">
                          {fuentePrincipal?.estadoPrevio || "PUBLICADO"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Disponible en catálogo
                        </span>
                      </div>
                    </div>

                    <div className="border border-border rounded-lg p-3.5 bg-surface flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Después (Resultado aplicado)
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          tone={novedad.estado === "Finalizada" ? "danger" : "warning"}
                          appearance="soft"
                          size="sm"
                          className="font-mono text-xs font-semibold"
                        >
                          {novedad.estado === "Finalizada" ? "DESACTIVADO" : "POR APLICAR"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {novedad.estado === "Finalizada"
                            ? "Histórico inmutable sin nuevas solicitudes"
                            : "Pendiente de confirmación"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Aplicación o Resultado */}
                  {novedad.estado !== "Finalizada" ? (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="default"
                        className="gap-2 text-xs font-medium"
                        onClick={() => setIsAplicarModalOpen(true)}
                      >
                        <FolderArchive className="size-4" />
                        Aplicar desactivación en Catálogo
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>Fuente formalmente desactivada en el Catálogo de Interoperabilidad.</span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        Aplicado el {novedad.resultadoAplicado?.fechaAplicacion}
                      </span>
                    </div>
                  )}

                  {/* Anotación de diseño */}
                  <div className="text-[11px] text-muted-foreground border-t border-border pt-3">
                    <strong>Pendiente de validación con DINARP:</strong> Definir qué ocurre con paquetes y credenciales de consumo vigentes cuando una fuente se desactiva.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SECCIÓN 5 — NOTIFICACIONES */}
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <BellRing className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        5. Notificaciones
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Comunicaciones formales a actores involucrados en el trámite
                      </CardDescription>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="outline" size="sm">
                    HU-INT-19
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="border border-border rounded-lg p-4 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-xs">
                        Coordinador SINARP Institucional
                      </span>
                      {notificacionEnviada ? (
                        <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                          Notificado
                        </Badge>
                      ) : (
                        <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Andrea López — Dirección General de Registro Civil
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {notificacionEnviada
                        ? "Notificación formal remitida sobre la resolución del trámite."
                        : "Se notificará automáticamente al finalizar la novedad de fusión o modificación."}
                    </p>
                  </div>

                  {!notificacionEnviada && novedad.tipoNovedad === "Fusión" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs shrink-0"
                      onClick={handleEnviarNotificacionFusion}
                    >
                      <Send className="size-3.5" />
                      Enviar notificación
                    </Button>
                  )}
                </div>

                {/* Anotación de diseño de alcance a consumidores */}
                <div className="bg-muted/30 border border-border/80 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Pendiente de validación con DINARP:</strong> Confirmar el alcance de la notificación a instituciones consumidoras que cuenten con autorizaciones activas sobre fuentes en proceso de eliminación o fusión.
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* COLUMNA DERECHA (1 col) — SECCIÓN 6: HISTORIAL */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <History className="size-4 text-foreground" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        6. Historial y Trazabilidad
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Bitácora cronológica inmutable del trámite
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {novedad.historialEventos.map((evento, index) => (
                    <div key={index} className="relative">
                      {/* Nodo del timeline */}
                      <div className="absolute -left-[27px] top-1 size-3.5 rounded-full border-2 border-background bg-foreground" />

                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground text-xs">
                            {evento.accion}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {evento.detalle}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                          <span>{evento.actor} ({evento.rol || "DGR"})</span>
                          <span>â€¢</span>
                          <span>{evento.fecha} {evento.hora || ""}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tarjeta de Referencia Legal */}
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Marco Regulatorio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
                <p>
                  <strong>Resolución N° 004-DN-2023:</strong> Procedimiento de Administración y Gestión del Catálogo de Interoperabilidad.
                </p>
                <div className="pt-2 border-t border-border flex flex-col gap-1 text-[11px]">
                  <span>â€¢ <strong>HU-INT-16:</strong> Radicación de requerimiento DGR</span>
                  <span>â€¢ <strong>HU-INT-17:</strong> Validación legal y funcional</span>
                  <span>â€¢ <strong>HU-INT-18:</strong> Actualización o desactivación inmutable</span>
                  <span>â€¢ <strong>HU-INT-19:</strong> Notificación a actores</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* MODAL JUSTIFICACIÓN NO PROCEDE */}
        <Dialog open={isNoProcedeModalOpen} onOpenChange={setIsNoProcedeModalOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleDictamenNoProcedeSubmit}>
              <DialogHeader>
                <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                  <XCircle className="size-5 text-destructive" />
                  Emitir Dictamen: No Procede
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Conforme a la normativa, es obligatorio registrar la justificación jurídica o técnica por la cual se desestima el requerimiento.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4 flex flex-col gap-3">
                <Label className="text-xs font-semibold text-foreground">
                  Justificación obligatoria de desestimación <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={justificacionNoProcede}
                  onChange={e => setJustificacionNoProcede(e.target.value)}
                  placeholder="Explique las razones jurídicas, técnicas o de competencia por las que no procede la solicitud..."
                  rows={4}
                  className="text-xs"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setIsNoProcedeModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Confirmar y cerrar trámite
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL CONFIRMACIÓN APLICAR DESACTIVACIÓN */}
        <Dialog open={isAplicarModalOpen} onOpenChange={setIsAplicarModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <FolderArchive className="size-5 text-foreground" />
                Confirmar Aplicación en Catálogo
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Se actualizará formalmente el estado de las fuentes afectadas en el Catálogo de Interoperabilidad.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 flex flex-col gap-3 text-xs leading-relaxed">
              <div className="bg-muted/40 border border-border rounded-lg p-3">
                <p className="font-semibold text-foreground">
                  Fuente a desactivar: {fuentePrincipal?.fuenteNombre}
                </p>
                <p className="text-muted-foreground text-[11px] font-mono mt-0.5">
                  Código: {fuentePrincipal?.codigoServicio} â€¢ Institución: {fuentePrincipal?.institucionNombre}
                </p>
              </div>

              <p className="text-muted-foreground">
                Al confirmar, la fuente pasará al estado <strong className="text-foreground">DESACTIVADO</strong>. Dejará de estar visible para nuevas solicitudes pero se mantendrá disponible en el archivo histórico y de trazabilidad.
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => setIsAplicarModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmarAplicacion}
              >
                Confirmar y desactivar en Catálogo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WireframeDashboardLayout>
  );
}
