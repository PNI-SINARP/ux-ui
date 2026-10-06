"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileSignature,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Briefcase,
  Database,
  Lock,
  Unlock,
  Calendar,
  FileText,
  ExternalLink,
  History,
  Info,
  Check,
  X,
  Plus,
  Trash2,
  UserCheck,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
  TipoElementoObservado,
  ObservacionItem,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RevisionGestionDetailViewProps {
  id: string;
}

export function RevisionGestionDetailView({ id }: RevisionGestionDetailViewProps) {
  const router = useRouter();
  const { solicitudes, aprobarGestion, observarGestion } = useSolicitudesStore();

  const solicitud = useMemo(() => {
    return solicitudes.find((s) => s.id === id);
  }, [solicitudes, id]);

  // Si no se encuentra la solicitud
  if (!solicitud) {
    return (
      <WireframeDashboardLayout
        activeMenu="revision-gestion"
        breadcrumbs={[
          { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
          { label: "Revisión Funcional", href: "/revision-gestion" },
          { label: id },
        ]}
      >
        <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertTriangle className="size-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Solicitud no encontrada</h2>
          <p className="text-sm text-muted-foreground">
            No se encontró el expediente con identificador <strong>{id}</strong>.
          </p>
          <Link href="/revision-gestion">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4 mr-1.5" />
              Volver a la bandeja de revisión
            </Button>
          </Link>
        </div>
      </WireframeDashboardLayout>
    );
  }

  // Lista de campos planos
  const campos = useMemo(() => {
    return solicitud.fuentes?.[0]?.campos || [];
  }, [solicitud]);

  // Indicador de confidenciales
  const tieneConfidenciales = useMemo(() => {
    return campos.some((c) => c.clasificacion === "Confidencial");
  }, [campos]);

  // Modalidad autorizada en revisión (por defecto la solicitada)
  const [modalidadAutorizada, setModalidadAutorizada] = useState<"API individual" | "API masiva" | "Ambas">(
    solicitud.modalidad || "API individual"
  );

  // Estados de modales de decisión
  const [isModalAprobarOpen, setIsModalAprobarOpen] = useState(false);
  const [isModalObservarOpen, setIsModalObservarOpen] = useState(false);
  const [isDocPreviewOpen, setIsDocPreviewOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<{ nombre: string; tipo: string; fechaCarga: string } | null>(null);

  // Estado para modal de observaciones estructuradas
  const [listaObservaciones, setListaObservaciones] = useState<ObservacionItem[]>([
    {
      id: "obs-temp-1",
      tipo: "finalidad",
      elementoNombre: campos[0]?.nombre || "Campo general",
      descripcion: "",
      fecha: new Date().toISOString().substring(0, 10),
      revisor: solicitud?.revisorAsignado || "Ana Torres",
      etapa: "Gestión",
    },
  ]);
  const [plazoSubsanacionDias, setPlazoSubsanacionDias] = useState<number>(10);

  // Helper para agregar una nueva observación en el modal
  const handleAddObservacionItem = () => {
    setListaObservaciones((prev) => [
      ...prev,
      {
        id: `obs-temp-${Date.now()}`,
        tipo: "campo",
        elementoNombre: campos[0]?.nombre || "General",
        descripcion: "",
        fecha: new Date().toISOString().substring(0, 10),
        revisor: solicitud?.revisorAsignado || "Ana Torres",
        etapa: "Gestión",
      },
    ]);
  };

  const handleRemoveObservacionItem = (obsId: string) => {
    setListaObservaciones((prev) => prev.filter((o) => o.id !== obsId));
  };

  const handleUpdateObservacionItem = (obsId: string, patch: Partial<ObservacionItem>) => {
    setListaObservaciones((prev) =>
      prev.map((o) => (o.id === obsId ? { ...o, ...patch } : o))
    );
  };

  // Observar campo puntual directamente desde la tabla de campos
  const handleObservarCampoDirecto = (campoNombre: string, tipo: TipoElementoObservado = "campo") => {
    setListaObservaciones([
      {
        id: `obs-direct-${Date.now()}`,
        tipo,
        elementoNombre: campoNombre,
        descripcion: "",
        fecha: new Date().toISOString().substring(0, 10),
        revisor: solicitud?.revisorAsignado || "Ana Torres",
        etapa: "Gestión",
      },
    ]);
    setIsModalObservarOpen(true);
  };

  // Ejecución de Aprobación Funcional
  const handleConfirmarAprobacion = () => {
    aprobarGestion(solicitud.id, {
      camposAprobados: campos.map((c) => c.nombre),
      modalidadesAutorizadas: modalidadAutorizada,
      cupoAprobado: solicitud.cupo || 50000,
      revisor: solicitud.revisorAsignado || "Ana Torres",
    });

    setIsModalAprobarOpen(false);

    if (tieneConfidenciales) {
      toast.success("Solicitud aprobada funcionalmente", {
        description: "Contiene campos confidenciales. Ha sido remitida a la Dirección de Normatividad para dictamen jurídico y doble firma digital.",
      });
    } else {
      toast.success("Solicitud aprobada funcionalmente", {
        description: "Contiene exclusivamente campos accesibles. Continuará hacia la etapa de formalización.",
      });
    }

    router.push("/revision-gestion");
  };

  // Ejecución de Observación Funcional
  const handleConfirmarObservacion = () => {
    const validas = listaObservaciones.filter((o) => o.descripcion.trim().length > 0);
    if (validas.length === 0) {
      toast.error("Debe ingresar al menos una observación detallada");
      return;
    }

    observarGestion(solicitud.id, {
      revisor: solicitud.revisorAsignado || "Ana Torres",
      observaciones: validas,
      diasPlazo: plazoSubsanacionDias,
    });

    setIsModalObservarOpen(false);
    toast.warning("Solicitud observada formalmente", {
      description: `El Coordinador tiene ${plazoSubsanacionDias} días para subsanar los ${validas.length} hallazgo(s).`,
    });

    router.push("/revision-gestion");
  };

  const isEvaluable =
    solicitud.estado === "Asignada a revisión de Gestión" ||
    solicitud.estado === "En revisión de Gestión";

  return (
    <WireframeDashboardLayout
      activeMenu="revision-gestion"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: "Revisión Funcional de Gestión", href: "/revision-gestion" },
        { label: `${solicitud.id} (v${solicitud.versionExpediente || 1})` },
      ]}
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Navegación y Cabecera */}
        <div className="flex items-center justify-between">
          <Link
            href="/revision-gestion"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="size-4" />
            Volver a bandeja de revisión funcional
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Estado del trámite:</span>
            <Badge
              tone={
                isEvaluable
                  ? "warning"
                  : solicitud.estado.includes("Aprobada")
                  ? "success"
                  : solicitud.estado === "Observada"
                  ? "danger"
                  : "info"
              }
              appearance="soft"
              size="md"
              className="font-semibold text-xs"
            >
              {solicitud.estado}
            </Badge>
          </div>
        </div>

        {/* Banner de Identificación del Expediente */}
        <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/70">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                  {solicitud.id}
                </span>
                <Badge tone="info" appearance="outline" size="sm" className="font-mono text-xs">
                  Versión v{solicitud.versionExpediente || 1}
                </Badge>
                {tieneConfidenciales ? (
                  <Badge tone="warning" appearance="soft" size="sm" className="gap-1 text-xs">
                    <Lock className="size-3" />
                    Requiere dictamen normativo posterior
                  </Badge>
                ) : (
                  <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-xs">
                    <Unlock className="size-3" />
                    Solo campos accesibles
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expediente BN-07 asignado a: <strong>{solicitud.revisorAsignado || "Ana Torres"}</strong> · Fecha asignación: {solicitud.fechaAsignacion || solicitud.fecha.substring(0, 10)}
              </p>
            </div>

            {/* Acciones principales de decisión fijas */}
            {isEvaluable && (
              <div className="flex items-center gap-2.5 self-start lg:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalObservarOpen(true)}
                  className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-semibold gap-1.5"
                >
                  <AlertTriangle className="size-4 text-amber-600" />
                  <span>Observar solicitud</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsModalAprobarOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Aprobar funcionalmente</span>
                </Button>
              </div>
            )}
          </div>

          {/* Ficha Resumen de Requerimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-0.5">Institución Solicitante:</span>
              <strong className="text-foreground text-sm block truncate" title={solicitud.institucion}>
                {solicitud.institucion}
              </strong>
              <span className="text-[10px] text-muted-foreground">{solicitud.tipoInstitucion}</span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-0.5">Proyecto Institucional:</span>
              <strong className="text-foreground text-sm block truncate" title={solicitud.proyectoNombre}>
                {solicitud.proyectoNombre || "Proyecto institucional"}
              </strong>
              <span className="text-[10px] font-mono text-muted-foreground">{solicitud.proyectoId || "PRJ-2026-001"}</span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-0.5">Modalidad Solicitada:</span>
              <strong className="text-primary text-sm block">
                {solicitud.modalidad || "API individual"}
              </strong>
              <span className="text-[10px] text-muted-foreground">Tipo de canal interoperable</span>
            </div>

            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <span className="text-muted-foreground block text-[11px] mb-0.5">Cupo Solicitado:</span>
              <strong className="text-foreground text-sm block font-mono">
                {(solicitud.cupo || 50000).toLocaleString()} registros
              </strong>
              <span className="text-[10px] text-muted-foreground">Volumen anual estimado</span>
            </div>
          </div>
        </Card>

        {/* 8 PUNTOS DE REVISIÓN FUNCIONAL */}
        <div className="space-y-6">
          {/* PUNTO 1: FUENTE */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Validación de Fuente de Datos
                </h2>
              </div>
              <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold text-xs">
                <Check className="size-3" />
                Fuente Única Vigente
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                <span className="text-muted-foreground text-[11px] block">Fuente solicitada:</span>
                <strong className="text-foreground text-sm block">{solicitud.fuentePrincipal}</strong>
                <span className="text-[11px] text-muted-foreground block">
                  Servicio: {solicitud.servicioPrincipal}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                <span className="text-muted-foreground text-[11px] block">Estado en Catálogo Nacional:</span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="size-4" />
                  <span>Publicada, vigente y homologada</span>
                </div>
                <span className="text-[11px] text-muted-foreground block">
                  Cumple con el estándar de interoperabilidad
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-background space-y-1">
                <span className="text-muted-foreground text-[11px] block">Regla de unicidad de fuente:</span>
                <strong className="text-foreground text-sm block">1 sola fuente utilizada</strong>
                <span className="text-[11px] text-muted-foreground block">
                  La solicitud no mezcla múltiples fuentes proveedoras
                </span>
              </div>
            </div>
          </Card>

          {/* PUNTO 2, 3 y 4: CAMPOS, FINALIDAD Y JUSTIFICACIÓN JURÍDICA */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  2-4
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Evaluación de Campos, Finalidad de Uso y Justificación Jurídica
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Revise que cada campo solicitado corresponda a la necesidad planteada y que la finalidad no sea insuficiente. En campos confidenciales se exhibe la justificación jurídica para verificar completitud.
                  </p>
                </div>
              </div>
              <Badge tone="neutral" appearance="outline" size="sm" className="font-semibold text-xs">
                {campos.length} campos en evaluación
              </Badge>
            </div>

            <div className="space-y-3">
              {campos.map((campo, idx) => (
                <div
                  key={campo.id}
                  className="p-4 rounded-xl border border-border bg-muted/15 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-foreground text-sm">{campo.nombre}</span>
                      <span className="text-muted-foreground text-[11px]">({campo.tipo})</span>
                      {campo.clasificacion === "Confidencial" ? (
                        <Badge tone="warning" appearance="soft" size="sm" className="gap-1 text-[10px]">
                          <Lock className="size-2.5" />
                          Confidencial
                        </Badge>
                      ) : (
                        <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-[10px]">
                          <Unlock className="size-2.5" />
                          Accesible
                        </Badge>
                      )}
                    </div>

                    {isEvaluable && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleObservarCampoDirecto(campo.nombre, "finalidad")}
                          className="h-7 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 gap-1"
                        >
                          <AlertTriangle className="size-3 text-amber-600" />
                          <span>Observar finalidad</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {campo.descripcion && (
                    <p className="text-[11px] text-muted-foreground">{campo.descripcion}</p>
                  )}

                  {/* Bloque 3: Finalidad de Uso */}
                  <div className="p-3 rounded-lg bg-background border border-border/70 space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      3. Finalidad de uso declarada para este campo:
                    </span>
                    <p className="text-xs text-foreground leading-relaxed">
                      {campo.finalidad || "Finalidad obligatoria requerida para la verificación de identidad del ciudadano."}
                    </p>
                  </div>

                  {/* Bloque 4: Justificación Jurídica (Solo confidenciales) */}
                  {campo.clasificacion === "Confidencial" ? (
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                          4. Justificación jurídica presentada (Confidencial):
                        </span>
                        <Badge tone="info" appearance="soft" size="sm" className="text-[9px] px-1 py-0">
                          Dictamen definitivo en Normatividad
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">
                        {campo.fundamento || "Base legal conforme Ley Orgánica de Protección de Datos Personales (LOPDP) y atribuciones institucionales."}
                      </p>
                      <p className="text-[10px] text-muted-foreground italic">
                        * Gestión constata que la justificación esté debidamente diligenciada y sea congruente con el objetivo institucional.
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          {/* PUNTO 5 y 6: MODALIDAD Y CUPO */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  5-6
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Validación de Modalidad y Cupo de Registros
                </h2>
              </div>
              <Badge tone="info" appearance="soft" size="sm" className="font-semibold text-xs">
                Parámetros Técnicos
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Modalidad */}
              <div className="space-y-3">
                <label className="font-semibold text-foreground block">
                  5. Modalidad solicitada vs. Modalidad autorizada:
                </label>
                <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
                  <span className="text-muted-foreground text-[11px]">Modalidad pedida por Coordinador:</span>
                  <strong className="text-foreground block text-sm">{solicitud.modalidad || "API individual"}</strong>
                </div>

                {isEvaluable ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground block">
                      Seleccione modalidad técnica autorizada para esta fuente:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["API individual", "API masiva", "Ambas"] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => setModalidadAutorizada(m)}
                          className={cn(
                            "py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center",
                            modalidadAutorizada === m
                              ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/40 shadow-xs"
                              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                    <span className="text-muted-foreground text-[11px]">Modalidad aprobada:</span>
                    <strong className="text-primary block text-sm">{solicitud.modalidadAprobada || solicitud.modalidad}</strong>
                  </div>
                )}
              </div>

              {/* Cupo */}
              <div className="space-y-3">
                <label className="font-semibold text-foreground block">
                  6. Cupo anual solicitado en registros:
                </label>
                <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
                  <span className="text-muted-foreground text-[11px]">Cupo en expediente:</span>
                  <strong className="text-foreground block font-mono text-base">
                    {(solicitud.cupo || 50000).toLocaleString()} registros
                  </strong>
                  <span className="text-[10px] text-muted-foreground">
                    Volumen de consultas solicitado para el proyecto.
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground mb-0.5">Regla de modificación de cupo:</p>
                  El Revisor no debe editar el cupo unilateralmente. Si el volumen solicitado excede la capacidad técnica de la fuente proveedora, <strong>debe observar la solicitud</strong> para que el Coordinador lo ajuste formalmente.
                </div>
              </div>
            </div>
          </Card>

          {/* PUNTO 7: DOCUMENTOS */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  7
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Documentos de Soporte Obligatorios
                </h2>
              </div>
              <Badge tone="neutral" appearance="outline" size="sm" className="font-semibold text-xs">
                {(solicitud.documentos || []).length || 1} documento(s)
              </Badge>
            </div>

            <div className="space-y-2">
              {(solicitud.documentos || [
                { id: "doc-1", tipo: "Oficio técnico de requerimiento", nombre: "Oficio_Solicitud_Interoperabilidad_Firmado.pdf", fecha: "2026-09-24", estado: "Recibido" }
              ]).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-background text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{doc.nombre}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Tipo: {doc.tipo} · Fecha carga: {doc.fechaCarga} · Categoría: <span className="text-emerald-600 font-medium">{doc.categoria}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDocPreview({ nombre: doc.nombre, tipo: doc.tipo, fechaCarga: doc.fechaCarga });
                        setIsDocPreviewOpen(true);
                      }}
                      className="h-8 text-xs gap-1.5"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Ver documento</span>
                    </Button>

                    {isEvaluable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleObservarCampoDirecto(doc.nombre, "documento")}
                        className="h-8 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                      >
                        Observar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* PUNTO 8: TRAZABILIDAD */}
          <Card className="p-6 bg-surface border-border shadow-xs rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  8
                </div>
                <h2 className="text-base font-bold text-foreground">
                  Trazabilidad e Historial del Expediente
                </h2>
              </div>
              <Badge tone="info" appearance="soft" size="sm" className="font-semibold text-xs">
                Auditoría Integral BN-07
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {/* Eventos ordenados cronológicamente */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Radicación y envío inicial</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{solicitud.fecha}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  El Coordinador SINARP radicó la solicitud con {campos.length} campos y estado inicial &ldquo;Pendiente de asignación en Gestión&rdquo;.
                </p>
              </div>

              {solicitud.historialAsignaciones?.map((asig, i) => (
                <div key={asig.id || i} className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">
                      Asignación de Revisor (v{asig.versionExpediente})
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{asig.fecha}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    El <strong>{asig.director}</strong> asignó el expediente a <strong>{asig.revisorNombre}</strong>.
                  </p>
                  {asig.observacion && (
                    <p className="text-[11px] text-foreground italic bg-background p-1.5 rounded-lg border border-border/60">
                      &ldquo;{asig.observacion}&rdquo;
                    </p>
                  )}
                </div>
              ))}

              {solicitud.detalleSubsanacion && (
                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Subsanación y reenvío por Coordinador</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{solicitud.fecha}</span>
                  </div>
                  <p className="text-[11px] text-foreground italic">
                    Detalle aportado: &ldquo;{solicitud.detalleSubsanacion}&rdquo;
                  </p>
                </div>
              )}

              {solicitud.observacionesEstructuradas && solicitud.observacionesEstructuradas.length > 0 && (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                  <span className="font-semibold text-foreground block">
                    Observaciones registradas en este expediente:
                  </span>
                  <div className="space-y-1.5">
                    {solicitud.observacionesEstructuradas.map((obs) => (
                      <div key={obs.id} className="p-2 rounded-lg bg-background border border-border text-[11px] space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Badge tone="warning" appearance="outline" size="sm" className="text-[9px] px-1 py-0">
                            {obs.tipo}
                          </Badge>
                          <span>{obs.elementoNombre}</span>
                        </div>
                        <p className="text-muted-foreground">{obs.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* MODAL: OBSERVAR SOLICITUD */}
        <Dialog open={isModalObservarOpen} onOpenChange={setIsModalObservarOpen}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600" />
                Observar Solicitud de Acceso
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Detalle claramente qué elementos debe subsanar el Coordinador (campos, finalidades, justificaciones, modalidad, cupo o documentos).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/70">
                <span className="font-semibold text-foreground">
                  Lista de observaciones estructuradas ({listaObservaciones.length})
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddObservacionItem}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="size-3.5" />
                  Agregar observación
                </Button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {listaObservaciones.map((obs, idx) => (
                  <div
                    key={obs.id}
                    className="p-3 rounded-xl border border-border bg-background space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground text-xs">
                        Observación #{idx + 1}
                      </span>
                      {listaObservaciones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveObservacionItem(obs.id)}
                          className="size-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Elemento afectado:
                        </label>
                        <select
                          value={obs.tipo}
                          onChange={(e) => handleUpdateObservacionItem(obs.id, { tipo: e.target.value as any })}
                          className="w-full h-8 text-xs bg-muted/30 border border-border rounded-lg px-2"
                        >
                          <option value="campo">Campo específico</option>
                          <option value="finalidad">Finalidad de uso</option>
                          <option value="justificacion">Justificación jurídica</option>
                          <option value="modalidad">Modalidad</option>
                          <option value="cupo">Cupo de registros</option>
                          <option value="documento">Documento de soporte</option>
                          <option value="general">Observación general</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                          Nombre o detalle del elemento:
                        </label>
                        <Input
                          value={obs.elementoNombre}
                          onChange={(e) => handleUpdateObservacionItem(obs.id, { elementoNombre: e.target.value })}
                          placeholder="Ej. Estado civil, Finalidad campo fecha..."
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">
                        Descripción de la observación y corrección requerida <span className="text-destructive">*</span>:
                      </label>
                      <Textarea
                        rows={2}
                        value={obs.descripcion}
                        onChange={(e) => handleUpdateObservacionItem(obs.id, { descripcion: e.target.value })}
                        placeholder="Explique por qué es insuficiente o cómo debe corregirse..."
                        className="text-xs bg-background"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Plazo de subsanación */}
              <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">Plazo límite de subsanación:</span>
                  <span className="text-[11px] text-muted-foreground">
                    Tiempo otorgado al Coordinador para reenviar el expediente corregido.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={plazoSubsanacionDias}
                    onChange={(e) => setPlazoSubsanacionDias(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-8 text-xs text-center font-mono font-bold"
                  />
                  <span className="text-xs text-muted-foreground">días hábiles</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setIsModalObservarOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarObservacion}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
              >
                <AlertTriangle className="size-4" />
                <span>Confirmar y notificar observación</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: APROBAR SOLICITUD */}
        <Dialog open={isModalAprobarOpen} onOpenChange={setIsModalAprobarOpen}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Aprobar Solicitud Funcionalmente
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Confirme los parámetros funcionales autorizados para el expediente. En Gestión no se exige informe técnico PDF ni firma digital.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 my-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expediente:</span>
                  <strong className="text-foreground font-mono">{solicitud.id} (v{solicitud.versionExpediente || 1})</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Campos aprobados:</span>
                  <strong className="text-foreground">{campos.length} campos</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Modalidad autorizada:</span>
                  <strong className="text-primary">{modalidadAutorizada}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cupo aprobado:</span>
                  <strong className="text-foreground font-mono">{(solicitud.cupo || 50000).toLocaleString()} registros</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revisor de Gestión:</span>
                  <strong className="text-foreground">{solicitud.revisorAsignado || "Ana Torres"}</strong>
                </div>
              </div>

              {/* Bifurcación explicada */}
              {tieneConfidenciales ? (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Lock className="size-4 text-amber-600" />
                    <span>Contiene campos confidenciales</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Al confirmar, el expediente pasará al estado <strong>&ldquo;Pendiente de asignación en Normatividad&rdquo;</strong> para la evaluación jurídica especializada del Director y Revisor de Normatividad.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Solo contiene campos accesibles</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Al confirmar, la solicitud pasará directamente al estado <strong>&ldquo;Aprobada por Gestión&rdquo;</strong> y continuará al flujo de formalización institucional (convenio / habilitación técnica).
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setIsModalAprobarOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAprobacion}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="size-4" />
                <span>Confirmar aprobación funcional</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: VISOR DE DOCUMENTO SOPORTE */}
        <Dialog open={isDocPreviewOpen} onOpenChange={setIsDocPreviewOpen}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Visor de Documento de Soporte
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedDocPreview?.nombre}
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 my-2 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-3 text-xs">
              <FileText className="size-12 text-primary mx-auto" />
              <p className="font-semibold text-foreground text-sm">{selectedDocPreview?.nombre}</p>
              <p className="text-muted-foreground">
                Documento verificado digitalmente · Fecha: {selectedDocPreview?.fechaCarga} · Tamaño: 1.8 MB
              </p>
              <Badge tone="success" appearance="soft" size="sm" className="gap-1">
                <Check className="size-3" />
                Firma electrónica institucional válida
              </Badge>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsDocPreviewOpen(false)}>
                Cerrar visor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WireframeDashboardLayout>
  );
}
