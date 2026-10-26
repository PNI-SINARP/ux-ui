"use client";

import React, { useState, useMemo } from "react";
import {
  Eye,
  Clock,
  Lock,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Scale,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

const REVISORES_NORMATIVA = [
  {
    id: "U-EQNORM",
    nombre: "Carlos Mora",
    cargo: "Especialista Jurídico de Datos",
  },
  {
    id: "U-EQNORM2",
    nombre: "Lucía Morales",
    cargo: "Abogada Especialista",
  },
];

const estadoOptions = [
  { value: "ALL", label: "Todas mis asignaciones en Normatividad" },
  {
    value: "En revisión normativa",
    label: "En revisión (Pendientes de dictamen)",
  },
  {
    value: "Aprobada por Normatividad",
    label: "Aprobadas por Normatividad",
  },
];

export function RevisionNormativaInteroperabilidadView() {
  const { solicitudes, aprobarNormativa, observarNormativa } =
    useSolicitudesStore();

  const [activeRevisorId, setActiveRevisorId] = useState<string>("U-EQNORM");
  const activeRevisor =
    REVISORES_NORMATIVA.find((r) => r.id === activeRevisorId) ||
    REVISORES_NORMATIVA[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");

  const [solicitudReviewing, setSolicitudReviewing] =
    useState<SolicitudAcceso | null>(null);
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [isObservarModalOpen, setIsObservarModalOpen] = useState(false);
  const [textoObservacionJuridica, setTextoObservacionJuridica] = useState("");
  const [conclusionesInforme, setConclusionesInforme] = useState("");

  // Filtrar expedientes asignados al Equipo de Normatividad
  const misSolicitudesNormativas = useMemo(() => {
    return solicitudes.filter((s) => {
      const tieneConfidencial = s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      );
      if (!tieneConfidencial) return false;

      const enFlujoRevisor =
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        (s.estado.includes("Aprobada") && Boolean(s.informeNormativa));

      if (!enFlujoRevisor) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "")
          .toLowerCase()
          .includes(term);
        if (!matchesId && !matchesInst && !matchesFuente) return false;
      }

      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) return false;

      return true;
    });
  }, [solicitudes, searchTerm, estadoFilter]);

  const metricas = useMemo(() => {
    const total = misSolicitudesNormativas.length;
    const pendientesDictamen = misSolicitudesNormativas.filter(
      (s) => s.estado === "En revisión normativa" && !s.informeNormativa
    ).length;
    const pendientesFirmaDirector = misSolicitudesNormativas.filter(
      (s) =>
        Boolean(s.informeNormativa?.firmadoRevisor) &&
        !s.informeNormativa?.firmadoDirector
    ).length;
    const aprobadas = misSolicitudesNormativas.filter(
      (s) => s.estado === "Aprobada por Normatividad"
    ).length;
    return { total, pendientesDictamen, pendientesFirmaDirector, aprobadas };
  }, [misSolicitudesNormativas]);

  // Aprobar confidenciales + emitir y firmar informe como Revisor (Carril 5 BPMN BN-07)
  const handleConfirmarAprobacionJuridica = () => {
    if (!solicitudReviewing) return;
    const revisorNombre =
      solicitudReviewing.revisorNormativoAsignado || activeRevisor.nombre;

    aprobarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      director: "Director Área de Normatividad",
      fundamento:
        conclusionesInforme.trim() ||
        "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
    });

    toast.success("Informe de Normatividad emitido y firmado por el Revisor", {
      description: `1.ª firma registrada (${revisorNombre}). Enviado al Director de Normatividad para su segunda firma.`,
    });

    setIsAprobarModalOpen(false);
    setSolicitudReviewing(null);
    setConclusionesInforme("");
  };

  // Observar confidenciales (otorga 3 días hábiles y regresa al Coordinador → luego Director de Gestión)
  const handleConfirmarObservacionJuridica = () => {
    if (!solicitudReviewing || !textoObservacionJuridica.trim()) {
      toast.error(
        "Debe ingresar la fundamentación jurídica de la observación."
      );
      return;
    }

    const revisorNombre =
      solicitudReviewing.revisorNormativoAsignado || activeRevisor.nombre;

    observarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      diasPlazo: 3,
      observaciones: [
        {
          id: `obs-norm-${Date.now()}`,
          tipo: "justificacion",
          elementoNombre: "Campos confidenciales",
          descripcion: textoObservacionJuridica,
          fecha: new Date().toISOString().substring(0, 10),
          revisor: revisorNombre,
          etapa: "Normatividad",
        },
      ],
    });

    toast.warning("Observación jurídica notificada (Plazo: 3 días hábiles)", {
      description:
        "El Coordinador SINARP tiene 3 días hábiles para subsanar. Al corregir, el expediente volverá al Director de Gestión para nueva asignación.",
    });

    setIsObservarModalOpen(false);
    setSolicitudReviewing(null);
    setTextoObservacionJuridica("");
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-normativa-fuentes"
      headerSlot={
        <div className="flex items-center gap-2">
          <span className="text-caption text-muted-foreground hidden sm:inline">
            Revisor jurídico activo:
          </span>
          <Combobox
            items={REVISORES_NORMATIVA.map((r) => ({
              value: r.id,
              label: `${r.nombre} (${r.cargo})`,
            }))}
            value={{
              value: activeRevisor.id,
              label: `${activeRevisor.nombre} (${activeRevisor.cargo})`,
            }}
            onValueChange={(val: any) => {
              if (val)
                setActiveRevisorId(typeof val === "string" ? val : val.value);
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-caption min-w-56 bg-background border-border" />
            <ComboboxContent align="end" className="w-72">
              <ComboboxList>
                {REVISORES_NORMATIVA.map((r) => (
                  <ComboboxItem
                    key={r.id}
                    value={{ value: r.id, label: `${r.nombre} (${r.cargo})` }}
                    className="text-caption"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{r.nombre}</p>
                      <p className="text-caption text-muted-foreground">
                        {r.cargo}
                      </p>
                    </div>
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      }
    >
      <div className="layout-container py-6 sm:py-8 space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <Lock className="size-5" />
              </div>
              <h1 className="text-h2 font-bold font-heading text-foreground tracking-tight">
                Revisión de Campos Confidenciales (Equipo de Normatividad)
              </h1>
            </div>
            <p className="text-body-sm text-muted-foreground mt-1">
              Bandeja exclusiva del <strong>Equipo de Normatividad</strong> (Carril 5 BPMN BN-07). Evalúe la justificación y base legal de los campos confidenciales: apruebe firmando el informe técnico-jurídico u observe otorgando <strong>3 días hábiles</strong> de subsanación.
            </p>
          </div>

          <Badge
            tone="warning"
            appearance="soft"
            size="md"
            className="font-semibold px-3 py-1.5 text-caption self-start md:self-center"
          >
            Rol: Equipo de Normatividad
          </Badge>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Scale className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.total}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Asignados al equipo
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.pendientesDictamen}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Pendientes de dictamen
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.pendientesFirmaDirector}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                En firma del Director
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.aprobadas}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Aprobadas por Normatividad
              </p>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 bg-surface border-border shadow-xs rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">
                Búsqueda rápida
              </label>
              <Search
                placeholder="Buscar por ID, institución o fuente con campos confidenciales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full h-10 bg-background rounded-lg border-border"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">
                Estado del dictamen
              </label>
              <Combobox
                items={estadoOptions}
                value={
                  estadoOptions.find((o) => o.value === estadoFilter) ||
                  estadoOptions[0]
                }
                onValueChange={(val: any) => {
                  if (val)
                    setEstadoFilter(typeof val === "string" ? val : val.value);
                }}
              >
                <ComboboxSelectTrigger className="w-full h-10 justify-between text-body-sm font-normal bg-background rounded-lg border-border px-3.5 shadow-none">
                  <span className="truncate">
                    {estadoOptions.find((o) => o.value === estadoFilter)
                      ?.label || "Todas mis asignaciones"}
                  </span>
                </ComboboxSelectTrigger>
                <ComboboxContent align="end" className="w-80">
                  <ComboboxList>
                    {estadoOptions.map((opt) => (
                      <ComboboxItem
                        key={opt.value}
                        value={opt}
                        className="text-caption"
                      >
                        {opt.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          {(searchTerm || estadoFilter !== "ALL") && (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-caption text-muted-foreground">
                Mostrando <strong>{misSolicitudesNormativas.length}</strong>{" "}
                expediente(s)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setEstadoFilter("ALL");
                }}
                className="h-7 px-2.5 text-caption text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="size-3" />
                <span>Limpiar filtros</span>
              </Button>
            </div>
          )}
        </Card>

        {/* Tabla del Revisor de Normatividad */}
        <Card className="bg-surface border-border shadow-xs rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-bold text-caption text-foreground">
                    ID / Versión
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Institución Requirente
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Fuente y Proyecto
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Campos Confidenciales
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Revisor Asignado
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Estado Informe y Firmas
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Estado
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground text-right pr-6">
                    Acción del Revisor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misSolicitudesNormativas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground text-body-sm"
                    >
                      No tienes expedientes con campos confidenciales pendientes
                      de revisión.
                    </TableCell>
                  </TableRow>
                ) : (
                  misSolicitudesNormativas.map((solicitud) => {
                    const camposConf =
                      solicitud.fuentes?.[0]?.campos?.filter(
                        (c) => c.clasificacion === "Confidencial"
                      ) || [];
                    const tieneInforme = Boolean(solicitud.informeNormativa);
                    const firmaRevisorOk = Boolean(
                      solicitud.informeNormativa?.firmadoRevisor
                    );
                    const firmaDirectorOk = Boolean(
                      solicitud.informeNormativa?.firmadoDirector
                    );

                    return (
                      <TableRow
                        key={solicitud.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono text-caption font-bold text-foreground">
                          <div className="flex items-center gap-1.5">
                            <span>{solicitud.id}</span>
                            <Badge
                              tone="neutral"
                              appearance="outline"
                              size="sm"
                              className="text-caption px-1.5 py-0"
                            >
                              v{solicitud.versionExpediente || 1}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="text-caption">
                          <span className="font-semibold text-foreground block">
                            {solicitud.institucion}
                          </span>
                          <span className="text-caption text-muted-foreground">
                            Validado en Gestión por:{" "}
                            {solicitud.revisorAsignado || "Ana Torres"}
                          </span>
                        </TableCell>

                        <TableCell className="text-caption">
                          <span className="font-semibold text-foreground block truncate max-w-48">
                            {solicitud.fuentePrincipal}
                          </span>
                          <span className="text-caption text-muted-foreground font-mono">
                            {solicitud.proyectoId} · {solicitud.proyectoNombre}
                          </span>
                        </TableCell>

                        <TableCell className="text-caption">
                          <div className="flex items-center gap-1.5 font-bold text-warning">
                            <Lock className="size-3.5" />
                            <span>{camposConf.length} confidencial(es)</span>
                          </div>
                          <span className="text-caption text-muted-foreground truncate block max-w-40">
                            {camposConf.map((c) => c.nombre).join(", ")}
                          </span>
                        </TableCell>

                        <TableCell className="text-caption">
                          <span className="font-medium text-foreground">
                            {solicitud.revisorNormativoAsignado ||
                              activeRevisor.nombre}
                          </span>
                        </TableCell>

                        <TableCell className="text-caption">
                          {tieneInforme ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-caption">
                                <Check className="size-3 text-success font-bold" />
                                <span className="text-success font-medium">
                                  Revisor:{" "}
                                  {firmaRevisorOk ? "Firmado" : "Pendiente"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-caption">
                                {firmaDirectorOk ? (
                                  <Check className="size-3 text-success font-bold" />
                                ) : (
                                  <Clock className="size-3 text-warning" />
                                )}
                                <span
                                  className={
                                    firmaDirectorOk
                                      ? "text-success font-medium"
                                      : "text-warning font-medium"
                                  }
                                >
                                  Director:{" "}
                                  {firmaDirectorOk
                                    ? "Firmado"
                                    : "En espera firma Director"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-caption text-muted-foreground italic">
                              Pendiente emitir dictamen
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-caption">
                          <Badge
                            tone={
                              solicitud.estado === "Aprobada por Normatividad"
                                ? "success"
                                : "info"
                            }
                            appearance="soft"
                            size="sm"
                            className="font-semibold"
                          >
                            {solicitud.estado}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-caption text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {solicitud.estado === "En revisión normativa" &&
                              !tieneInforme && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    setSolicitudReviewing(solicitud)
                                  }
                                  className="h-8 px-3 text-caption gap-1 font-semibold"
                                >
                                  <Scale className="size-3.5" />
                                  <span>Revisar confidenciales</span>
                                </Button>
                              )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolicitudReviewing(solicitud)}
                              className="h-8 px-2 text-caption text-muted-foreground hover:text-foreground"
                              title="Ver detalle de confidenciales"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* SHEET: REVISIÓN DE CAMPOS CONFIDENCIALES Y DICTAMEN DEL REVISOR */}
        <Sheet
          open={Boolean(solicitudReviewing)}
          onOpenChange={(open) => !open && setSolicitudReviewing(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6"
          >
            {solicitudReviewing && (
              <>
                <SheetHeader className="pb-4 border-b border-border text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-body text-foreground">
                      {solicitudReviewing.id}
                    </span>
                    <Badge
                      tone="warning"
                      appearance="soft"
                      size="sm"
                      className="gap-1"
                    >
                      <Lock className="size-3" />
                      Revisar Confidenciales (Equipo de Normatividad)
                    </Badge>
                  </div>
                  <SheetTitle className="text-h3 font-bold text-foreground">
                    Evaluación Jurídica de Campos Confidenciales
                  </SheetTitle>
                  <SheetDescription className="text-caption text-muted-foreground">
                    Examine la finalidad y justificación legal de cada campo
                    confidencial para aprobar (emitiendo y firmando informe) u
                    observar (otorgando 3 días hábiles).
                  </SheetDescription>
                </SheetHeader>

                <div className="p-3.5 rounded-lg border border-success/30 bg-success/10 space-y-1 text-caption">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <CheckCircle2 className="size-4 text-success" />
                    <span>Aprobado previamente por Equipo de Gestión</span>
                  </div>
                  <p className="text-caption text-muted-foreground">
                    Gestión aprobó la pertinencia técnica, modalidad (
                    {solicitudReviewing.modalidadAprobada ||
                      solicitudReviewing.modalidad}
                    ) y cupo (
                    {solicitudReviewing.cupoAprobado ||
                      solicitudReviewing.cupo}{" "}
                    reg.).
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-body-sm font-bold text-foreground flex items-center gap-1.5">
                    <Scale className="size-4 text-warning" />
                    Campos Confidenciales Sujetos a Revisión
                  </h3>

                  <div className="space-y-3">
                    {(solicitudReviewing.fuentes?.[0]?.campos || [])
                      .filter((c) => c.clasificacion === "Confidencial")
                      .map((campo) => (
                        <div
                          key={campo.id}
                          className="p-3.5 rounded-lg border border-warning/30 bg-warning/5 space-y-2 text-caption"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-foreground">
                              {campo.nombre}
                            </span>
                            <Badge tone="warning" appearance="soft" size="sm">
                              Confidencial
                            </Badge>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                            <span className="text-caption font-bold text-muted-foreground uppercase">
                              Finalidad de uso declarada:
                            </span>
                            <p className="text-foreground text-caption leading-relaxed">
                              {campo.finalidad}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border space-y-1">
                            <span className="text-caption font-bold text-warning uppercase">
                              Justificación jurídica presentada (LOPDP):
                            </span>
                            <p className="text-foreground text-caption leading-relaxed">
                              {campo.fundamento ||
                                "Base legal conforme Ley Orgánica de Protección de Datos Personales (LOPDP)."}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {solicitudReviewing.informeNormativa && (
                  <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-2 text-caption">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-4 text-primary" />
                        {solicitudReviewing.informeNormativa.numero} -{" "}
                        {solicitudReviewing.informeNormativa.titulo}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {solicitudReviewing.informeNormativa.fechaEmision}
                      </span>
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;{solicitudReviewing.informeNormativa.fundamento}
                      &rdquo;
                    </p>
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-muted-foreground">
                        1.ª Firma (Revisor):
                      </span>
                      <Badge tone="success" appearance="soft" size="sm">
                        {solicitudReviewing.informeNormativa.revisorNombre}{" "}
                        (Firmado)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        2.ª Firma (Director):
                      </span>
                      {solicitudReviewing.informeNormativa.firmadoDirector ? (
                        <Badge tone="success" appearance="soft" size="sm">
                          {solicitudReviewing.informeNormativa.directorNombre}{" "}
                          (Firmado)
                        </Badge>
                      ) : (
                        <Badge tone="warning" appearance="soft" size="sm">
                          En bandeja del Director (/revision-normativa/asignacion)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Compuerta BPMN: ¿Normatividad aprueba? */}
                {solicitudReviewing.estado === "En revisión normativa" &&
                  !solicitudReviewing.informeNormativa && (
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsObservarModalOpen(true)}
                        className="font-semibold gap-1"
                      >
                        <AlertTriangle className="size-3.5 text-warning" />
                        <span>Observar (3 días hábiles)</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAprobarModalOpen(true)}
                        className="font-semibold gap-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Aprobar y firmar informe (Revisor)</span>
                      </Button>
                    </div>
                  )}
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* MODAL: OBSERVAR JURÍDICAMENTE (3 DÍAS HÁBILES) */}
        <Dialog
          open={isObservarModalOpen}
          onOpenChange={setIsObservarModalOpen}
        >
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-h3 font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                Notificar Observación Jurídica (3 días hábiles)
              </DialogTitle>
              <DialogDescription className="text-caption text-muted-foreground mt-1">
                Indique los fundamentos legales por los cuales debe subsanarse
                la justificación de los campos confidenciales.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-caption">
              <label className="font-semibold text-foreground block">
                Observación jurídica para subsanación{" "}
                <span className="text-danger">*</span>:
              </label>
              <Textarea
                rows={4}
                value={textoObservacionJuridica}
                onChange={(e) => setTextoObservacionJuridica(e.target.value)}
                placeholder="Indique qué competencia legal o justificación LOPDP debe subsanar el Coordinador SINARP..."
                className="text-caption bg-background"
              />
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-caption text-muted-foreground">
                <strong className="text-foreground">Regla BPMN BN-07:</strong>{" "}
                Se notifica plazo de <strong>3 días hábiles</strong> al
                Coordinador SINARP. Toda corrección vuelve al{" "}
                <strong>Director de Gestión</strong> para nueva asignación.
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsObservarModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarObservacionJuridica}
                className="font-semibold"
              >
                Notificar observación (3 días hábiles)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: APROBAR Y FIRMAR INFORME COMO REVISOR */}
        <Dialog open={isAprobarModalOpen} onOpenChange={setIsAprobarModalOpen}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-h3 font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5 text-success" />
                Aprobar Confidenciales y Firmar Informe (1.ª Firma)
              </DialogTitle>
              <DialogDescription className="text-caption text-muted-foreground mt-1">
                Emite el informe jurídico-normativo con la firma del Revisor y
                lo remite al Director de Normatividad para la segunda firma.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-caption">
              <label className="font-semibold text-foreground block">
                Conclusiones y Dictamen Jurídico (LOPDP):
              </label>
              <Textarea
                rows={3}
                value={conclusionesInforme}
                onChange={(e) => setConclusionesInforme(e.target.value)}
                placeholder="Se determina que el tratamiento de los datos confidenciales solicitados cuenta con base jurídica habilitante conforme a la LOPDP..."
                className="text-caption bg-background"
              />

              <div className="p-3 rounded-lg bg-success/10 border border-success/30 text-caption space-y-1">
                <p className="font-bold text-foreground">
                  Nodo BPMN: Firmar informe revisor y Director
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  1. Al confirmar, se estampa la{" "}
                  <strong>1.ª firma (Revisor de Normatividad)</strong>.<br />
                  2. El Director de Normatividad firmará en su bandeja (
                  <code>/revision-normativa/asignacion</code>) para dejar la
                  solicitud lista para formalización.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAprobarModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAprobacionJuridica}
                className="font-semibold gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>Firmar como Revisor y enviar a Director</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WireframeDashboardLayout>
  );
}
