"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Search as SearchIcon,
  Filter,
  Eye,
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
  CheckCircle2,
  FileSignature,
  UserCheck,
  Send,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

// Revisores jurídicos de Normatividad
const REVISORES_NORMATIVA = [
  { id: "U-EQNORM", nombre: "Carlos Mora", cargo: "Especialista Jurídico de Datos", especialidad: "LOPDP y Protección de Datos" },
  { id: "U-EQNORM2", nombre: "Lucía Morales", cargo: "Abogada Especialista", especialidad: "Derecho Administrativo e Interoperabilidad" },
];

export function RevisionNormativaInteroperabilidadView() {
  const {
    solicitudes,
    asignarRevisorNormativa,
    aprobarNormativa,
    firmarInformeNormativa,
    observarNormativa,
  } = useSolicitudesStore();

  // Rol activo dentro de la vista jurídica (Director o Revisor)
  const [activeRole, setActiveRole] = useState<"DIR_NORMATIVA" | "EQ_NORMATIVA">("DIR_NORMATIVA");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("ALL");

  // Modales
  const [solicitudToAssign, setSolicitudToAssign] = useState<SolicitudAcceso | null>(null);
  const [selectedRevisorNormId, setSelectedRevisorNormId] = useState<string>("U-EQNORM");
  const [observacionAsigNorm, setObservacionAsigNorm] = useState("");

  const [solicitudReviewing, setSolicitudReviewing] = useState<SolicitudAcceso | null>(null);
  const [isAprobarModalOpen, setIsAprobarModalOpen] = useState(false);
  const [isObservarModalOpen, setIsObservarModalOpen] = useState(false);
  const [textoObservacionJuridica, setTextoObservacionJuridica] = useState("");
  const [conclusionesInforme, setConclusionesInforme] = useState("");

  // Filtrar exclusivamente expedientes que llegan a Normatividad:
  // - Solicitudes aprobadas previamente por Gestión
  // - Que contengan al menos un campo confidencial
  const solicitudesNormativas = useMemo(() => {
    return solicitudes.filter((s) => {
      // Debe contener al menos un campo confidencial
      const tieneConfidencial = s.fuentes?.some((f) =>
        f.campos?.some((c) => c.clasificacion === "Confidencial")
      );
      if (!tieneConfidencial) return false;

      // Debe estar en flujo normativo o ya haber pasado por Gestión
      const enFlujoNormativo =
        s.estado === "Pendiente de asignación en Normatividad" ||
        s.estado === "En revisión normativa" ||
        s.estado === "Aprobada por Normatividad" ||
        (s.estado.includes("Aprobada") && s.informeNormativa);

      if (!enFlujoNormativo) return false;

      // Búsqueda libre
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(term);
        const matchesInst = s.institucion.toLowerCase().includes(term);
        const matchesFuente = (s.fuentePrincipal || "").toLowerCase().includes(term);
        const matchesRevisor = (s.revisorNormativoAsignado || "").toLowerCase().includes(term);
        if (!matchesId && !matchesInst && !matchesFuente && !matchesRevisor) return false;
      }

      // Filtro de estado
      if (estadoFilter !== "ALL" && s.estado !== estadoFilter) return false;

      return true;
    });
  }, [solicitudes, searchTerm, estadoFilter]);

  // Contadores
  const metricas = useMemo(() => {
    const total = solicitudesNormativas.length;
    const pendientesAsig = solicitudesNormativas.filter(
      (s) => s.estado === "Pendiente de asignación en Normatividad"
    ).length;
    const enRevision = solicitudesNormativas.filter(
      (s) => s.estado === "En revisión normativa"
    ).length;
    const aprobadas = solicitudesNormativas.filter(
      (s) => s.estado === "Aprobada por Normatividad"
    ).length;
    return { total, pendientesAsig, enRevision, aprobadas };
  }, [solicitudesNormativas]);

  // Asignar revisor normativo (Director de Normatividad)
  const handleConfirmarAsignacionNormativa = () => {
    if (!solicitudToAssign) return;
    const revisor = REVISORES_NORMATIVA.find((r) => r.id === selectedRevisorNormId) || REVISORES_NORMATIVA[0];
    const director = "Director Área de Normatividad";

    asignarRevisorNormativa(solicitudToAssign.id, revisor.id, revisor.nombre, director);
    toast.success("Revisor de Normatividad asignado", {
      description: `Expediente ${solicitudToAssign.id} asignado a ${revisor.nombre}.`,
    });
    setSolicitudToAssign(null);
  };

  // Aprobar jurídicamente y emitir informe (Revisor de Normatividad)
  const handleConfirmarAprobacionJuridica = () => {
    if (!solicitudReviewing) return;
    const revisorNombre = solicitudReviewing.revisorNormativoAsignado || "Carlos Mora";

    aprobarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      director: "Director Área de Normatividad",
      fundamento: conclusionesInforme.trim() || "Se determina que el tratamiento de los datos confidenciales solicitados se encuentra plenamente justificado en base a las competencias constitucionales y legales de la entidad requirente, cumpliendo las garantías de la LOPDP.",
    });

    toast.success("Informe de Aprobación de Normatividad emitido", {
      description: `Firmado digitalmente por el revisor ${revisorNombre}. Pendiente firma del Director de Normatividad.`,
    });

    setIsAprobarModalOpen(false);
    setSolicitudReviewing(null);
    setConclusionesInforme("");
  };

  // Firmar como Director de Normatividad
  const handleFirmarDirector = (solicitudId: string) => {
    firmarInformeNormativa(solicitudId, "DIRECTOR", "Director Área de Normatividad");
    toast.success("Firma del Director de Normatividad registrada con éxito", {
      description: "Ambas firmas han sido validadas. La solicitud ha sido 'Aprobada por Normatividad' y continúa a formalización.",
    });
  };

  // Observar jurídicamente (Revisor de Normatividad)
  const handleConfirmarObservacionJuridica = () => {
    if (!solicitudReviewing || !textoObservacionJuridica.trim()) {
      toast.error("Debe ingresar la fundamentación jurídica de la observación");
      return;
    }

    const revisorNombre = solicitudReviewing.revisorNormativoAsignado || "Carlos Mora";

    observarNormativa(solicitudReviewing.id, {
      revisor: revisorNombre,
      observaciones: [
        {
          id: `obs-norm-${Date.now()}`,
          tipo: "justificacion",
          elementoNombre: "Campos confidenciales",
          descripcion: textoObservacionJuridica,
          fecha: new Date().toISOString().substring(0, 10),
          revisor: revisorNombre,
          etapa: "Normatividad"
        }
      ],
    });

    toast.warning("Solicitud observada jurídicamente", {
      description: "El Coordinador subsanará el expediente, el cual pasará previamente por Gestión antes de regresar a Normatividad.",
    });

    setIsObservarModalOpen(false);
    setSolicitudReviewing(null);
    setTextoObservacionJuridica("");
  };

  return (
    <WireframeDashboardLayout
      activeMenu="revision-normativa"
      breadcrumbs={[
        { label: "Área de Normatividad", href: "/revision-normativa" },
        { label: "Evaluación Jurídica de Datos Confidenciales (BN-07)" },
      ]}
      headerSlot={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Perfil Normatividad:</span>
          <div className="flex items-center rounded-xl bg-background border border-border p-0.5">
            <button
              type="button"
              onClick={() => setActiveRole("DIR_NORMATIVA")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeRole === "DIR_NORMATIVA"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Director
            </button>
            <button
              type="button"
              onClick={() => setActiveRole("EQ_NORMATIVA")}
              className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                activeRole === "EQ_NORMATIVA"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Revisor Jurídico
            </button>
          </div>
        </div>
      }
    >
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Scale className="size-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
                Revisión Jurídica de Datos Confidenciales (Normatividad)
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Flujo BN-07 especializado: Únicamente llegan solicitudes <strong>aprobadas previamente por Gestión</strong> que contienen campos confidenciales. Emisión de informe técnico-jurídico con doble firma digital.
            </p>
          </div>

          <Badge tone="warning" appearance="soft" size="md" className="font-semibold px-3 py-1.5 text-xs self-start md:self-center gap-1.5">
            <Lock className="size-3.5" />
            <span>Perfil: {activeRole === "DIR_NORMATIVA" ? "Director de Normatividad" : "Revisor Jurídico"}</span>
          </Badge>
        </div>

        {/* Tarjetas Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Scale className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.total}</span>
              <p className="text-xs text-muted-foreground font-medium">Expedientes confidenciales</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.pendientesAsig}</span>
              <p className="text-xs text-muted-foreground font-medium">Pendientes de asignación</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileSignature className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.enRevision}</span>
              <p className="text-xs text-muted-foreground font-medium">En evaluación jurídica</p>
            </div>
          </Card>

          <Card className="p-4 bg-surface border-border shadow-xs rounded-2xl flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground font-heading">{metricas.aprobadas}</span>
              <p className="text-xs text-muted-foreground font-medium">Aprobadas con doble firma</p>
            </div>
          </Card>
        </div>

        {/* Tabla de Expedientes en Normatividad */}
        <Card className="bg-surface border-border shadow-xs rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between gap-4">
            <div className="w-full max-w-sm">
              <Search
                placeholder="Buscar expediente en Normatividad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm("")}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              {solicitudesNormativas.length} expediente(s) con datos confidenciales
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-bold text-xs text-foreground">ID Solicitud</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Institución Solicitante</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Proyecto</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Campos Confidenciales</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Revisor Jurídico</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Firmas de Informe</TableHead>
                  <TableHead className="font-bold text-xs text-foreground">Estado</TableHead>
                  <TableHead className="font-bold text-xs text-foreground text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudesNormativas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No hay expedientes confidenciales en la bandeja de Normatividad actualmente.
                    </TableCell>
                  </TableRow>
                ) : (
                  solicitudesNormativas.map((solicitud) => {
                    const camposConf = (solicitud.fuentes?.[0]?.campos || []).filter(
                      (c) => c.clasificacion === "Confidencial"
                    );

                    const tieneInforme = !!solicitud.informeNormativa;
                    const firmaRevisorOk = solicitud.informeNormativa?.firmadoRevisor === true;
                    const firmaDirectorOk = solicitud.informeNormativa?.firmadoDirector === true;

                    return (
                      <TableRow key={solicitud.id} className="hover:bg-muted/20 transition-colors">
                        {/* ID Solicitud */}
                        <TableCell className="font-mono font-bold text-xs text-foreground">
                          {solicitud.id}
                        </TableCell>

                        {/* Institución */}
                        <TableCell className="text-xs">
                          <strong className="text-foreground block truncate max-w-[180px]">
                            {solicitud.institucion}
                          </strong>
                          <span className="text-[11px] text-muted-foreground">{solicitud.tipoInstitucion}</span>
                        </TableCell>

                        {/* Proyecto */}
                        <TableCell className="text-xs">
                          <span className="text-foreground truncate block max-w-[170px]" title={solicitud.proyectoNombre}>
                            {solicitud.proyectoNombre || "Proyecto institucional"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{solicitud.proyectoId}</span>
                        </TableCell>

                        {/* Campos confidenciales */}
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                            <Lock className="size-3.5" />
                            <span>{camposConf.length} confidencial(es)</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate block max-w-[150px]">
                            {camposConf.map((c) => c.nombre).join(", ")}
                          </span>
                        </TableCell>

                        {/* Revisor asignado */}
                        <TableCell className="text-xs">
                          {solicitud.revisorNormativoAsignado ? (
                            <div className="flex items-center gap-1.5">
                              <div className="size-5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center">
                                {solicitud.revisorNormativoAsignado.charAt(0)}
                              </div>
                              <span className="font-medium text-foreground">
                                {solicitud.revisorNormativoAsignado}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">Sin asignar</span>
                          )}
                        </TableCell>

                        {/* Doble Firma */}
                        <TableCell className="text-xs">
                          {tieneInforme ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[11px]">
                                {firmaRevisorOk ? (
                                  <Check className="size-3 text-emerald-600 font-bold" />
                                ) : (
                                  <Clock className="size-3 text-muted-foreground" />
                                )}
                                <span className={firmaRevisorOk ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-muted-foreground"}>
                                  Revisor: {firmaRevisorOk ? "Firmado" : "Pendiente"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px]">
                                {firmaDirectorOk ? (
                                  <Check className="size-3 text-emerald-600 font-bold" />
                                ) : (
                                  <Clock className="size-3 text-amber-600" />
                                )}
                                <span className={firmaDirectorOk ? "text-emerald-700 dark:text-emerald-300 font-medium" : "text-amber-700 dark:text-amber-400 font-medium"}>
                                  Director: {firmaDirectorOk ? "Firmado" : "Pendiente"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">Informe no emitido</span>
                          )}
                        </TableCell>

                        {/* Estado */}
                        <TableCell className="text-xs">
                          <Badge
                            tone={
                              solicitud.estado === "Aprobada por Normatividad"
                                ? "success"
                                : solicitud.estado === "Pendiente de asignación en Normatividad"
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

                        {/* Acciones */}
                        <TableCell className="text-xs text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Acción Director: Asignar revisor */}
                            {activeRole === "DIR_NORMATIVA" && solicitud.estado === "Pendiente de asignación en Normatividad" && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSolicitudToAssign(solicitud)}
                                className="h-8 px-3 text-xs gap-1 font-semibold"
                              >
                                <UserCheck className="size-3.5" />
                                <span>Asignar revisor</span>
                              </Button>
                            )}

                            {/* Acción Director: Firmar informe si ya firmó el revisor */}
                            {activeRole === "DIR_NORMATIVA" && tieneInforme && firmaRevisorOk && !firmaDirectorOk && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleFirmarDirector(solicitud.id)}
                                className="h-8 px-3 text-xs gap-1 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                <FileSignature className="size-3.5" />
                                <span>Firmar como Director</span>
                              </Button>
                            )}

                            {/* Acción Revisor: Evaluar confidenciales */}
                            {activeRole === "EQ_NORMATIVA" && solicitud.estado === "En revisión normativa" && !tieneInforme && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setSolicitudReviewing(solicitud)}
                                className="h-8 px-3 text-xs gap-1 font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                <Scale className="size-3.5" />
                                <span>Dictaminar</span>
                              </Button>
                            )}

                            {/* Ver expediente en Drawer */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSolicitudReviewing(solicitud)}
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
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

        {/* DIALOG: ASIGNAR REVISOR DE NORMATIVIDAD (DIRECTOR) */}
        <Dialog open={!!solicitudToAssign} onOpenChange={(open) => !open && setSolicitudToAssign(null)}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <UserCheck className="size-5 text-amber-600" />
                Asignar Revisor Jurídico de Normatividad
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                El Director de Normatividad asigna manualmente un revisor jurídico para dictaminar los campos confidenciales aprobados funcionalmente por Gestión.
              </DialogDescription>
            </DialogHeader>

            {solicitudToAssign && (
              <div className="space-y-4 my-2 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solicitud:</span>
                    <strong className="text-foreground font-mono">{solicitudToAssign.id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institución:</span>
                    <strong className="text-foreground">{solicitudToAssign.institucion}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fuente:</span>
                    <strong className="text-foreground truncate max-w-[220px]">{solicitudToAssign.fuentePrincipal}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-foreground block">
                    Seleccione Especialista Jurídico de Normatividad:
                  </label>
                  <div className="space-y-2">
                    {REVISORES_NORMATIVA.map((rev) => {
                      const isSel = selectedRevisorNormId === rev.id;
                      return (
                        <button
                          type="button"
                          key={rev.id}
                          onClick={() => setSelectedRevisorNormId(rev.id)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all",
                            isSel
                              ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500/40"
                              : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <div>
                            <p className="font-bold text-foreground text-xs">{rev.nombre}</p>
                            <p className="text-[11px] text-muted-foreground">{rev.cargo} · {rev.especialidad}</p>
                          </div>
                          {isSel && <CheckCircle2 className="size-4 text-amber-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setSolicitudToAssign(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAsignacionNormativa}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-1.5"
              >
                <UserCheck className="size-4" />
                <span>Confirmar asignación jurídica</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SHEET / DRAWER: DICTAMEN JURÍDICO DE CAMPOS CONFIDENCIALES */}
        <Sheet open={!!solicitudReviewing} onOpenChange={(open) => !open && setSolicitudReviewing(null)}>
          <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6 space-y-6">
            {solicitudReviewing && (
              <>
                <SheetHeader className="pb-4 border-b border-border/70 text-left">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-foreground">
                      {solicitudReviewing.id}
                    </span>
                    <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                      <Lock className="size-3" />
                      Evaluación Jurídica Especializada
                    </Badge>
                  </div>
                  <SheetTitle className="text-xl font-bold text-foreground">
                    Expediente en Normatividad
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    Examen exclusivo de los campos confidenciales, finalidades, justificaciones jurídicas y documentos normativos.
                  </SheetDescription>
                </SheetHeader>

                {/* Resumen de aprobación por Gestión */}
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    <span>Aprobado funcionalmente por Gestión</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Gestión validó la pertinencia técnica, modalidad ({solicitudReviewing.modalidadAprobada || solicitudReviewing.modalidad}) y cupo ({solicitudReviewing.cupoAprobado || solicitudReviewing.cupo} reg.).
                  </p>
                </div>

                {/* Lista detallada de campos confidenciales */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Scale className="size-4 text-amber-600" />
                    Campos Confidenciales Sujetos a Dictamen
                  </h3>

                  <div className="space-y-3">
                    {(solicitudReviewing.fuentes?.[0]?.campos || [])
                      .filter((c) => c.clasificacion === "Confidencial")
                      .map((campo) => (
                        <div
                          key={campo.id}
                          className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-foreground">{campo.nombre}</span>
                            <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                              Confidencial
                            </Badge>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/70 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">
                              Finalidad de uso declarada:
                            </span>
                            <p className="text-foreground text-[11px] leading-relaxed">
                              {campo.finalidad}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-background border border-border/70 space-y-1">
                            <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">
                              Justificación jurídica presentada:
                            </span>
                            <p className="text-foreground text-[11px] leading-relaxed">
                              {campo.fundamento || "Base legal conforme Ley Orgánica de Protección de Datos Personales (LOPDP)."}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Informe y Firmas si ya existen */}
                {solicitudReviewing.informeNormativa && (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-4 text-primary" />
                        {solicitudReviewing.informeNormativa.numero} - {solicitudReviewing.informeNormativa.titulo}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {solicitudReviewing.informeNormativa.fechaEmision}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      &ldquo;{solicitudReviewing.informeNormativa.fundamento}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                      <span className="text-muted-foreground">Firma Revisor:</span>
                      <Badge tone="success" appearance="soft" size="sm">
                        {solicitudReviewing.informeNormativa.revisorNombre} (Firmado)
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Firma Director:</span>
                      {solicitudReviewing.informeNormativa.firmadoDirector ? (
                        <Badge tone="success" appearance="soft" size="sm">
                          {solicitudReviewing.informeNormativa.directorNombre} (Firmado)
                        </Badge>
                      ) : (
                        <Badge tone="warning" appearance="soft" size="sm">
                          Pendiente de firma
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Acciones de decisión jurídica del Revisor */}
                {activeRole === "EQ_NORMATIVA" &&
                  solicitudReviewing.estado === "En revisión normativa" &&
                  !solicitudReviewing.informeNormativa && (
                    <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsObservarModalOpen(true)}
                        className="border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 font-semibold"
                      >
                        <AlertTriangle className="size-3.5 mr-1" />
                        Observar jurídicamente
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsAprobarModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Aprobar y emitir informe
                      </Button>
                    </div>
                  )}
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* MODAL: OBSERVAR JURÍDICAMENTE (NORMATIVIDAD) */}
        <Dialog open={isObservarModalOpen} onOpenChange={setIsObservarModalOpen}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-600" />
                Observar Expediente por Criterio Jurídico
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Indique los fundamentos legales por los cuales no procede el acceso a los campos confidenciales o se requiere mayor sustento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <label className="font-semibold text-foreground block">
                Observación y requerimiento jurídico de subsanación <span className="text-destructive">*</span>:
              </label>
              <Textarea
                rows={4}
                value={textoObservacionJuridica}
                onChange={(e) => setTextoObservacionJuridica(e.target.value)}
                placeholder="Indique con claridad qué disposición de la LOPDP no se cumple o qué justificación complementaria debe aportar el Coordinador..."
                className="text-xs bg-background"
              />
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-muted-foreground">
                <strong>Regla de retorno:</strong> Cuando el Coordinador subsana esta observación jurídica, el expediente <strong>vuelve primero por la Dirección de Gestión</strong> antes de reingresar a Normatividad.
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setIsObservarModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarObservacionJuridica}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                Confirmar observación jurídica
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL: APROBAR Y EMITIR INFORME DE NORMATIVIDAD */}
        <Dialog open={isAprobarModalOpen} onOpenChange={setIsAprobarModalOpen}>
          <DialogContent size="default">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                Emitir Informe de Aprobación de Normatividad
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Genera el informe jurídico oficial del Área de Normatividad y estampa la firma digital del Revisor.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-2 text-xs">
              <label className="font-semibold text-foreground block">
                Conclusiones y Dictamen Jurídico Vinculante:
              </label>
              <Textarea
                rows={3}
                value={conclusionesInforme}
                onChange={(e) => setConclusionesInforme(e.target.value)}
                placeholder="Se determina que el tratamiento de los datos confidenciales solicitados cuenta con base jurídica habilitante conforme a la LOPDP..."
                className="text-xs bg-background"
              />

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] space-y-1">
                <p className="font-bold text-foreground">Protocolo de doble firma digital:</p>
                <p className="text-muted-foreground leading-relaxed">
                  1. Al presionar Confirmar, se registra la <strong>firma digital del Revisor de Normatividad</strong>.<br />
                  2. Posteriormente, el <strong>Director de Normatividad</strong> deberá validar y firmar digitalmente el documento para que el expediente continúe hacia la formalización.
                </p>
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setIsAprobarModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmarAprobacionJuridica}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
              >
                <FileSignature className="size-4" />
                <span>Firmar digitalmente como Revisor</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WireframeDashboardLayout>
  );
}
