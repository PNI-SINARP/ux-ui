"use client";

import React, { useState, useMemo } from "react";
import {
  UserCheck,
  Eye,
  Clock,
  Lock,
  FileText,
  CheckCircle2,
  FileSignature,
  Scale,
  Check,
  RotateCcw,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const REVISORES_NORMATIVA = [
  {
    id: "U-EQNORM",
    nombre: "Carlos Mora",
    cargo: "Especialista Jurídico de Datos",
    especialidad: "LOPDP y Protección de Datos",
  },
  {
    id: "U-EQNORM2",
    nombre: "Lucía Morales",
    cargo: "Abogada Especialista",
    especialidad: "Derecho Administrativo e Interoperabilidad",
  },
];

const estadoOptions = [
  { value: "ALL", label: "Todos los estados en Normatividad" },
  {
    value: "Pendiente de asignación en Normatividad",
    label: "Pendiente de asignar revisor",
  },
  {
    value: "En revisión normativa",
    label: "En revisión / Pendiente firma Director",
  },
  {
    value: "Aprobada por Normatividad",
    label: "Aprobada (Lista para formalización)",
  },
];

export function AsignacionNormativaFuentesView() {
  const { solicitudes, asignarRevisorNormativa, firmarInformeNormativa } =
    useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");

  const [solicitudToAssign, setSolicitudToAssign] =
    useState<SolicitudAcceso | null>(null);
  const [selectedRevisorNormId, setSelectedRevisorNormId] =
    useState<string>("U-EQNORM");
  const [solicitudInspecting, setSolicitudInspecting] =
    useState<SolicitudAcceso | null>(null);

  // Filtrar expedientes que llegan al carril de Normatividad (con campos confidenciales y aprobados por Gestión)
  const solicitudesNormativas = useMemo(() => {
    return solicitudes.filter((s) => {
      const tieneConfidencial = s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      );
      if (!tieneConfidencial) return false;

      const enFlujoNormativo =
        s.estado === "Pendiente de asignación en Normatividad" ||
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        (s.estado.includes("Aprobada") && Boolean(s.informeNormativa));

      if (!enFlujoNormativo) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "")
          .toLowerCase()
          .includes(term);
        const matchesRevisor = (s.revisorNormativoAsignado || "")
          .toLowerCase()
          .includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesRevisor)
          return false;
      }

      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) return false;

      return true;
    });
  }, [solicitudes, searchTerm, estadoFilter]);

  const metricas = useMemo(() => {
    const total = solicitudesNormativas.length;
    const pendientesAsig = solicitudesNormativas.filter(
      (s) => s.estado === "Pendiente de asignación en Normatividad"
    ).length;
    const pendientesFirmaDirector = solicitudesNormativas.filter(
      (s) =>
        Boolean(s.informeNormativa?.firmadoRevisor) &&
        !s.informeNormativa?.firmadoDirector
    ).length;
    const aprobadas = solicitudesNormativas.filter(
      (s) => s.estado === "Aprobada por Normatividad"
    ).length;
    return { total, pendientesAsig, pendientesFirmaDirector, aprobadas };
  }, [solicitudesNormativas]);

  const handleConfirmarAsignacionNormativa = () => {
    if (!solicitudToAssign) return;
    const revisor =
      REVISORES_NORMATIVA.find((r) => r.id === selectedRevisorNormId) ||
      REVISORES_NORMATIVA[0];
    const director = "Director Área de Normatividad";

    asignarRevisorNormativa(
      solicitudToAssign.id,
      revisor.id,
      revisor.nombre,
      director
    );
    toast.success("Revisor de Normatividad asignado", {
      description: `Expediente ${solicitudToAssign.id} asignado a ${revisor.nombre} para evaluar campos confidenciales.`,
    });
    setSolicitudToAssign(null);
  };

  const handleFirmarDirector = (solicitudId: string) => {
    firmarInformeNormativa(
      solicitudId,
      "DIRECTOR",
      "Director Área de Normatividad"
    );
    toast.success("Informe firmado por el Director de Normatividad", {
      description:
        "Doble firma completada (Revisor + Director). La solicitud quedó marcada como Lista para Formalización.",
    });
    if (solicitudInspecting?.id === solicitudId) {
      setSolicitudInspecting(null);
    }
  };

  return (
    <WireframeDashboardLayout activeMenu="asignacion-normativa-fuentes">
      <div className="layout-container py-6 sm:py-8 space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Scale className="size-5" />
              </div>
              <h1 className="text-h2 font-bold font-heading text-foreground tracking-tight">
                Asignación y Firma de Confidenciales (Director de Normatividad)
              </h1>
            </div>
            <p className="text-body-sm text-muted-foreground mt-1">
              Bandeja exclusiva del <strong>Director de Normatividad</strong> (Carril 4 BPMN BN-07). Asigne revisor jurídico para campos confidenciales y suscriba la segunda firma del informe normativo para habilitar la formalización.
            </p>
          </div>

          <Badge
            tone="primary"
            appearance="soft"
            size="md"
            className="font-semibold px-3 py-1.5 text-caption self-start md:self-center"
          >
            Rol: Director de Normatividad
          </Badge>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Lock className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.total}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Expedientes con confidenciales
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.pendientesAsig}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Por asignar revisor
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <FileSignature className="size-5" />
            </div>
            <div>
              <span className="text-h2 font-bold text-foreground font-heading">
                {metricas.pendientesFirmaDirector}
              </span>
              <p className="text-caption text-muted-foreground font-medium">
                Pendientes firma Director
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
                Listas para formalización
              </p>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-4 bg-surface border-border shadow-xs rounded-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">
                Búsqueda de expediente
              </label>
              <Search
                placeholder="Buscar por ID, institución, fuente o revisor normativo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="w-full h-10 bg-background rounded-lg border-border"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">
                Estado en Normatividad
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
                      ?.label || "Todos los estados"}
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
                Mostrando <strong>{solicitudesNormativas.length}</strong>{" "}
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

        {/* Tabla del Director de Normatividad */}
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
                    Revisor Normativo
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Firmas Informe (Revisor + Director)
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground">
                    Estado
                  </TableHead>
                  <TableHead className="font-bold text-caption text-foreground text-right pr-6">
                    Acciones del Director
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudesNormativas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground text-body-sm"
                    >
                      No existen expedientes con campos confidenciales en este
                      estado.
                    </TableCell>
                  </TableRow>
                ) : (
                  solicitudesNormativas.map((solicitud) => {
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
                            Aprobado en Gestión por:{" "}
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
                          {solicitud.revisorNormativoAsignado ? (
                            <span className="font-medium text-foreground">
                              {solicitud.revisorNormativoAsignado}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-caption">
                              Sin asignar
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-caption">
                          {tieneInforme ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-caption">
                                {firmaRevisorOk ? (
                                  <Check className="size-3 text-success font-bold" />
                                ) : (
                                  <Clock className="size-3 text-muted-foreground" />
                                )}
                                <span
                                  className={
                                    firmaRevisorOk
                                      ? "text-success font-medium"
                                      : "text-muted-foreground"
                                  }
                                >
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
                                  {firmaDirectorOk ? "Firmado" : "Pendiente"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-caption text-muted-foreground italic">
                              En espera de dictamen del revisor
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-caption">
                          <Badge
                            tone={
                              solicitud.estado === "Aprobada por Normatividad"
                                ? "success"
                                : solicitud.estado ===
                                  "Pendiente de asignación en Normatividad"
                                ? "warning"
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
                            {/* Acción 1 BPMN: Asignar revisor Normatividad */}
                            {solicitud.estado ===
                              "Pendiente de asignación en Normatividad" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSolicitudToAssign(solicitud)}
                                className="h-8 px-3 text-caption gap-1 font-semibold"
                              >
                                <UserCheck className="size-3.5" />
                                <span>Asignar revisor</span>
                              </Button>
                            )}

                            {/* Reasignar si está en revisión sin informe */}
                            {solicitud.estado === "En revisión normativa" &&
                              !tieneInforme && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSolicitudToAssign(solicitud)
                                  }
                                  className="h-8 px-2.5 text-caption gap-1"
                                >
                                  <UserCheck className="size-3.5" />
                                  <span>Reasignar</span>
                                </Button>
                              )}

                            {/* Acción 2 BPMN: Firmar informe revisor y Director */}
                            {tieneInforme &&
                              firmaRevisorOk &&
                              !firmaDirectorOk && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() =>
                                    handleFirmarDirector(solicitud.id)
                                  }
                                  className="h-8 px-3 text-caption gap-1 font-semibold"
                                >
                                  <FileSignature className="size-3.5" />
                                  <span>Firmar informe (Director)</span>
                                </Button>
                              )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolicitudInspecting(solicitud)}
                              className="h-8 px-2 text-caption text-muted-foreground hover:text-foreground"
                              title="Ver expediente e informe"
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

        {/* MODAL: ASIGNAR REVISOR DE NORMATIVIDAD */}
        <Dialog
          open={Boolean(solicitudToAssign)}
          onOpenChange={(open) => !open && setSolicitudToAssign(null)}
        >
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-h3 font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-5 text-primary" />
                Asignar Revisor de Normatividad
              </DialogTitle>
              <DialogDescription className="text-caption text-muted-foreground mt-1">
                Seleccione al especialista del Equipo de Normatividad que
                evaluará la base legal de los campos confidenciales (Carril 4
                BPMN BN-07).
              </DialogDescription>
            </DialogHeader>

            {solicitudToAssign && (
              <div className="space-y-4 my-2 text-caption">
                <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solicitud:</span>
                    <strong className="text-foreground font-mono">
                      {solicitudToAssign.id}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institución:</span>
                    <strong className="text-foreground">
                      {solicitudToAssign.institucion}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuente:</span>
                    <strong className="text-foreground truncate max-w-56">
                      {solicitudToAssign.fuentePrincipal}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Seleccione Especialista del Equipo de Normatividad:
                  </label>
                  <RadioGroup
                    value={selectedRevisorNormId}
                    onValueChange={setSelectedRevisorNormId}
                    className="space-y-2"
                  >
                    {REVISORES_NORMATIVA.map((rev) => {
                      const isSel = selectedRevisorNormId === rev.id;
                      return (
                        <label
                          key={rev.id}
                          htmlFor={`rev-norm-${rev.id}`}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all",
                            isSel
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={rev.id}
                              id={`rev-norm-${rev.id}`}
                            />
                            <div>
                              <p className="font-bold text-foreground text-caption">
                                {rev.nombre}
                              </p>
                              <p className="text-caption text-muted-foreground">
                                {rev.cargo} · {rev.especialidad}
                              </p>
                            </div>
                          </div>
                          {isSel && (
                            <CheckCircle2 className="size-4 text-primary" />
                          )}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSolicitudToAssign(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAsignacionNormativa}
                className="font-semibold gap-1.5"
              >
                <UserCheck className="size-4" />
                <span>Confirmar asignación</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SHEET: DETALLE DEL EXPEDIENTE E INFORME PARA FIRMA DEL DIRECTOR */}
        <Sheet
          open={Boolean(solicitudInspecting)}
          onOpenChange={(open) => !open && setSolicitudInspecting(null)}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6"
          >
            {solicitudInspecting && (
              <>
                <SheetHeader className="pb-4 border-b border-border text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-body text-foreground">
                      {solicitudInspecting.id}
                    </span>
                    <Badge tone="primary" appearance="soft" size="sm">
                      Vista Director de Normatividad
                    </Badge>
                  </div>
                  <SheetTitle className="text-h3 font-bold text-foreground">
                    Supervisión y Firma de Informe Normativo
                  </SheetTitle>
                  <SheetDescription className="text-caption text-muted-foreground">
                    Verifique los campos confidenciales evaluados por el revisor
                    y suscriba la firma institucional del Director.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-3">
                  <h3 className="text-body-sm font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="size-4 text-warning" />
                    Campos Confidenciales Solicitados
                  </h3>
                  {(solicitudInspecting.fuentes?.[0]?.campos || [])
                    .filter((c) => c.clasificacion === "Confidencial")
                    .map((campo) => (
                      <div
                        key={campo.id}
                        className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2 text-caption"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-foreground">
                            {campo.nombre}
                          </span>
                          <Badge tone="warning" appearance="soft" size="sm">
                            Confidencial
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">Finalidad:</strong>{" "}
                          {campo.finalidad}
                        </p>
                        <p className="text-muted-foreground">
                          <strong className="text-foreground">
                            Justificación legal:
                          </strong>{" "}
                          {campo.fundamento}
                        </p>
                      </div>
                    ))}
                </div>

                {solicitudInspecting.informeNormativa ? (
                  <div className="p-4 rounded-lg border border-border bg-surface space-y-3 text-caption">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-4 text-primary" />
                        {solicitudInspecting.informeNormativa.numero} ·{" "}
                        {solicitudInspecting.informeNormativa.titulo}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        {solicitudInspecting.informeNormativa.fechaEmision}
                      </span>
                    </div>
                    <p className="text-muted-foreground italic">
                      &ldquo;{solicitudInspecting.informeNormativa.fundamento}
                      &rdquo;
                    </p>
                    <div className="pt-2 border-t border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          1.ª Firma (Revisor de Normatividad):
                        </span>
                        <Badge tone="success" appearance="soft" size="sm">
                          {solicitudInspecting.informeNormativa.revisorNombre}{" "}
                          (Firmado)
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          2.ª Firma (Director de Normatividad):
                        </span>
                        {solicitudInspecting.informeNormativa
                          .firmadoDirector ? (
                          <Badge tone="success" appearance="soft" size="sm">
                            {
                              solicitudInspecting.informeNormativa
                                .directorNombre
                            }{" "}
                            (Firmado)
                          </Badge>
                        ) : (
                          <Badge tone="warning" appearance="soft" size="sm">
                            Pendiente de su firma
                          </Badge>
                        )}
                      </div>
                    </div>

                    {solicitudInspecting.informeNormativa.firmadoRevisor &&
                      !solicitudInspecting.informeNormativa.firmadoDirector && (
                        <div className="pt-3 border-t border-border flex justify-end">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleFirmarDirector(solicitudInspecting.id)
                            }
                            className="font-semibold gap-1.5"
                          >
                            <FileSignature className="size-4" />
                            <span>
                              Firmar informe como Director y habilitar
                              formalización
                            </span>
                          </Button>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-border bg-muted/20 text-caption text-muted-foreground">
                    El Revisor de Normatividad aún no ha emitido el informe
                    técnico-jurídico.
                  </div>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </WireframeDashboardLayout>
  );
}
