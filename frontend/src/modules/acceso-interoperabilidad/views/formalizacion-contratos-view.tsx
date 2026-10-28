"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileSignature,
  FileText,
  Eye,
  CheckCircle2,
  Database,
  Lock,
  AlertTriangle,
  Send,
  Plus,
  Edit,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export function FormalizacionContratosView() {
  const {
    solicitudes,
    generarContrato,
    editarBorradorContrato,
    enviarContratoAFirmas,
    firmarContrato,
    simularPendientePlantillaContrato,
  } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);

  // Expediente inline dentro del único contenedor
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expedienteTab, setExpedienteTab] = useState<string>("contrato");

  // Modales operativos
  const [modalGenerar, setModalGenerar] = useState<SolicitudAcceso | null>(null);
  const [modalEditar, setModalEditar] = useState<SolicitudAcceso | null>(null);
  const [modalEnviarFirmas, setModalEnviarFirmas] = useState<SolicitudAcceso | null>(null);
  const [modalFirmar, setModalFirmar] = useState<{
    solicitud: SolicitudAcceso;
    rol: "COORDINADOR_SINARP" | "MAXIMA_AUTORIDAD";
  } | null>(null);

  // Form states
  const [cantidadContratada, setCantidadContratada] = useState<number>(50000);
  const [clausulas, setClausulas] = useState<string>(
    "Cláusula Primera: Objeto del Intercambio de Información. Cláusula Segunda: Tarifas y Recaudación según ordenanza institucional vigente. Cláusula Tercera: Confidencialidad y Seguridad de la Información conforme LOPDP."
  );
  const [cambiosEdicion, setCambiosEdicion] = useState<string>(
    "Ajuste de cláusula de vigencia y cupo transaccional."
  );

  // Solicitudes privadas en formalización contractual
  const privadasEnContratacion = useMemo(() => {
    return solicitudes.filter((s) => s.tipoInstitucion === "Privada");
  }, [solicitudes]);

  const selectedSolicitud = useMemo(
    () => privadasEnContratacion.find((s) => s.id === selectedId) || null,
    [privadasEnContratacion, selectedId]
  );

  const getEstadoContratoLabel = (s: SolicitudAcceso): string => {
    if (s.estado === "Pendiente de plantilla") return "Pendiente de plantilla";
    if (s.contratoDetalle?.estado) return s.contratoDetalle.estado;
    if (s.contrato) return "Firmado";
    return "Sin contrato";
  };

  const countBorradores = useMemo(
    () =>
      privadasEnContratacion.filter((s) => {
        const est = getEstadoContratoLabel(s);
        return est === "Borrador" || est === "Corrección pendiente";
      }).length,
    [privadasEnContratacion]
  );

  const countPendienteFirmas = useMemo(
    () =>
      privadasEnContratacion.filter(
        (s) => getEstadoContratoLabel(s) === "Pendiente de firmas"
      ).length,
    [privadasEnContratacion]
  );

  const countFirmados = useMemo(
    () =>
      privadasEnContratacion.filter(
        (s) => getEstadoContratoLabel(s) === "Firmado"
      ).length,
    [privadasEnContratacion]
  );

  const countSinContrato = useMemo(
    () =>
      privadasEnContratacion.filter((s) => {
        const est = getEstadoContratoLabel(s);
        return est === "Sin contrato" || est === "Pendiente de plantilla";
      }).length,
    [privadasEnContratacion]
  );

  const filtered = useMemo(() => {
    return privadasEnContratacion.filter((s) => {
      const contrato = s.contratoDetalle;
      const estadoContrato = getEstadoContratoLabel(s);

      if (estadoFilter === "BORRADOR") {
        if (
          estadoContrato !== "Borrador" &&
          estadoContrato !== "Corrección pendiente"
        )
          return false;
      } else if (estadoFilter === "PENDIENTE_FIRMAS") {
        if (estadoContrato !== "Pendiente de firmas") return false;
      } else if (estadoFilter === "FIRMADO") {
        if (estadoContrato !== "Firmado") return false;
      } else if (estadoFilter === "SIN_CONTRATO") {
        if (
          estadoContrato !== "Sin contrato" &&
          estadoContrato !== "Pendiente de plantilla"
        )
          return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        s.id.toLowerCase().includes(term) ||
        s.institucion.toLowerCase().includes(term) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(term)) ||
        (s.contrato && s.contrato.toLowerCase().includes(term)) ||
        (contrato?.numero && contrato.numero.toLowerCase().includes(term))
      );
    });
  }, [privadasEnContratacion, estadoFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const hasActiveFilters = estadoFilter !== "ALL" || searchTerm.trim() !== "";

  const clearAllFilters = () => {
    setEstadoFilter("ALL");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleOpenExpediente = (s: SolicitudAcceso) => {
    setSelectedId(s.id);
    setExpedienteTab("contrato");
  };

  const handleGenerarSubmit = () => {
    if (!modalGenerar) return;
    generarContrato(modalGenerar.id, {
      cantidadContratada,
      clausulas,
      autor: "Abg. Santiago Valdivieso (Especialista Jurídico DINARP)",
    });
    toast.success("Contrato creado; pendiente de firmas (DOC-01)", {
      description:
        "El borrador contractual con versión v1.0 fue persistido y vinculado al cupo aprobado.",
    });
    setModalGenerar(null);
  };

  const handleEditarSubmit = () => {
    if (!modalEditar) return;
    editarBorradorContrato(modalEditar.id, {
      cantidadContratada,
      clausulas,
      autor: "Abg. Santiago Valdivieso (Jurídica)",
      cambios: cambiosEdicion,
    });
    toast.success(
      "Nueva versión contractual guardada; firmas anteriores sin efecto (DOC-03)",
      {
        description:
          "Se incrementó la versión del contrato y se notificó por AUD-01 si había firmas en curso.",
      }
    );
    setModalEditar(null);
  };

  const handleEnviarFirmasSubmit = () => {
    if (!modalEnviarFirmas) return;
    enviarContratoAFirmas(
      modalEnviarFirmas.id,
      "Abg. Santiago Valdivieso (Jurídica)"
    );
    toast.success("Contrato remitido al circuito de firmas (DOC-02)", {
      description:
        "Notificado al Coordinador SINARP de la entidad y a la Máxima Autoridad de DINARP.",
    });
    setModalEnviarFirmas(null);
  };

  const handleFirmarSubmit = () => {
    if (!modalFirmar) return;
    const { solicitud, rol } = modalFirmar;
    firmarContrato(
      solicitud.id,
      rol,
      rol === "COORDINADOR_SINARP"
        ? `${solicitud.coordinador} (Coordinador SINARP)`
        : "Dra. Cristina Álvarez (Directora Ejecutiva DINARP)"
    );
    toast.success("Firma electrónica verificada y persistida (DOC-02)", {
      description:
        rol === "COORDINADOR_SINARP"
          ? "Firma del Coordinador SINARP asentada sobre la versión vigente."
          : "Firma de la Máxima Autoridad DINARP asentada.",
    });
    setModalFirmar(null);
  };

  const renderAccionesContrato = (s: SolicitudAcceso, isInline = false) => {
    const contrato = s.contratoDetalle;
    const estadoContrato = getEstadoContratoLabel(s);
    const firmadoCoordinador = !!contrato?.firmadoCoordinador;
    const firmadoMaximaAutoridad = !!contrato?.firmadoMaximaAutoridad;

    if (isInline) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          {(estadoContrato === "Sin contrato" ||
            estadoContrato === "Pendiente de plantilla") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  const sinPlantilla =
                    estadoContrato !== "Pendiente de plantilla";
                  simularPendientePlantillaContrato(
                    s.id,
                    sinPlantilla,
                    "Abg. Santiago Valdivieso (Jurídica)"
                  );
                  toast.info(
                    sinPlantilla
                      ? "DOC-01 Crit. 3: Marcado como Pendiente de plantilla vigente PAR-02"
                      : "DOC-01 Crit. 3: Plantilla PAR-02 publicada; listo para generar borrador"
                  );
                }}
              >
                <AlertTriangle className="size-3.5 text-warning" />
                {estadoContrato === "Pendiente de plantilla"
                  ? "Activar plantilla PAR-02"
                  : "Simular sin plantilla"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-xs"
                disabled={estadoContrato === "Pendiente de plantilla"}
                onClick={() => {
                  setCantidadContratada(s.cupoAprobado || s.cupo || 50000);
                  setModalGenerar(s);
                }}
              >
                <Plus className="size-3.5" />
                Generar borrador (DOC-01)
              </Button>
            </>
          )}

          {(estadoContrato === "Borrador" ||
            estadoContrato === "Corrección pendiente") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setCantidadContratada(
                    contrato?.cantidadContratada ||
                      s.cupoAprobado ||
                      s.cupo ||
                      50000
                  );
                  setClausulas(contrato?.clausulas || "");
                  setCambiosEdicion(
                    "Ajuste de cláusula de vigencia y cupo transaccional."
                  );
                  setModalEditar(s);
                }}
              >
                <Edit className="size-3.5" />
                Corregir borrador (DOC-03)
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setModalEnviarFirmas(s)}
              >
                <Send className="size-3.5" />
                Iniciar firmas (DOC-02)
              </Button>
            </>
          )}

          {estadoContrato === "Pendiente de firmas" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => {
                  setCantidadContratada(
                    contrato?.cantidadContratada ||
                      s.cupoAprobado ||
                      s.cupo ||
                      50000
                  );
                  setClausulas(contrato?.clausulas || "");
                  setCambiosEdicion(
                    "Corrección de alcance previa a firma bilateral (invalida ronda anterior)."
                  );
                  setModalEditar(s);
                }}
              >
                <Edit className="size-3.5" />
                Corregir (invalida firmas)
              </Button>
              {!firmadoCoordinador && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "COORDINADOR_SINARP" })
                  }
                >
                  <FileSignature className="size-3.5" />
                  Firmar Coordinador
                </Button>
              )}
              {!firmadoMaximaAutoridad && (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "MAXIMA_AUTORIDAD" })
                  }
                >
                  <FileSignature className="size-3.5" />
                  Firmar Máx. Autoridad
                </Button>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => handleOpenExpediente(s)}
              aria-label={`Ver expediente contractual ${s.id}`}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Ver expediente contractual</TooltipContent>
        </Tooltip>

        {(estadoContrato === "Sin contrato" ||
          estadoContrato === "Pendiente de plantilla") && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-warning hover:text-warning hover:bg-warning/10"
                  onClick={() => {
                    const sinPlantilla =
                      estadoContrato !== "Pendiente de plantilla";
                    simularPendientePlantillaContrato(
                      s.id,
                      sinPlantilla,
                      "Abg. Santiago Valdivieso (Jurídica)"
                    );
                    toast.info(
                      sinPlantilla
                        ? "DOC-01 Crit. 3: Marcado como Pendiente de plantilla vigente PAR-02"
                        : "DOC-01 Crit. 3: Plantilla PAR-02 publicada; listo para generar borrador"
                    );
                  }}
                  aria-label="Simular plantilla PAR-02"
                >
                  <AlertTriangle className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {estadoContrato === "Pendiente de plantilla"
                  ? "Activar plantilla PAR-02 (DOC-01)"
                  : "Simular pendiente de plantilla PAR-02"}
              </TooltipContent>
            </Tooltip>

            {estadoContrato !== "Pendiente de plantilla" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => {
                      setCantidadContratada(s.cupoAprobado || s.cupo || 50000);
                      setModalGenerar(s);
                    }}
                    aria-label="Generar borrador de contrato"
                  >
                    <Plus className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Generar borrador de contrato (DOC-01)
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        {(estadoContrato === "Borrador" ||
          estadoContrato === "Corrección pendiente") && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => {
                    setCantidadContratada(
                      contrato?.cantidadContratada ||
                        s.cupoAprobado ||
                        s.cupo ||
                        50000
                    );
                    setClausulas(contrato?.clausulas || "");
                    setCambiosEdicion(
                      "Ajuste de cláusula de vigencia y cupo transaccional."
                    );
                    setModalEditar(s);
                  }}
                  aria-label="Corregir borrador"
                >
                  <Edit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Corregir borrador de contrato (DOC-03)
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setModalEnviarFirmas(s)}
                  aria-label="Enviar a firmas"
                >
                  <Send className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Iniciar circuito de firmas (DOC-02)
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {estadoContrato === "Pendiente de firmas" && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-warning hover:text-warning hover:bg-warning/10"
                  onClick={() => {
                    setCantidadContratada(
                      contrato?.cantidadContratada ||
                        s.cupoAprobado ||
                        s.cupo ||
                        50000
                    );
                    setClausulas(contrato?.clausulas || "");
                    setCambiosEdicion(
                      "Corrección de alcance previa a firma bilateral (invalida ronda anterior)."
                    );
                    setModalEditar(s);
                  }}
                  aria-label="Corregir e invalidar ronda"
                >
                  <Edit className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Corregir borrador e invalidar firmas previas (DOC-03)
              </TooltipContent>
            </Tooltip>

            {!firmadoCoordinador && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-info hover:text-info hover:bg-info/10"
                    onClick={() =>
                      setModalFirmar({
                        solicitud: s,
                        rol: "COORDINADOR_SINARP",
                      })
                    }
                    aria-label="Firmar Coordinador SINARP"
                  >
                    <FileSignature className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Registrar firma Coordinador SINARP (DOC-02)
                </TooltipContent>
              </Tooltip>
            )}

            {!firmadoMaximaAutoridad && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-success hover:text-success hover:bg-success/10"
                    onClick={() =>
                      setModalFirmar({
                        solicitud: s,
                        rol: "MAXIMA_AUTORIDAD",
                      })
                    }
                    aria-label="Firmar Máxima Autoridad DINARP"
                  >
                    <FileSignature className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Registrar firma Máxima Autoridad DINARP (DOC-02)
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <WireframeDashboardLayout
      activeMenu="formalizacion-contratos"
      currentRole="JURIDICA"
    >
      <TooltipProvider delayDuration={200}>
        <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {selectedSolicitud ? (
              /* =========================================================
               * VISTA INLINE DEL EXPEDIENTE CONTRACTUAL (1 CONTENEDOR)
               * ========================================================= */
              <div className="flex flex-col gap-5 animate-fade-in">
                {/* Barra superior de retorno y acciones */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedId(null)}
                    className="gap-2 self-start text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ArrowLeft className="size-4" />
                    Volver a la bandeja de contratos
                  </Button>

                  {renderAccionesContrato(selectedSolicitud, true)}
                </div>

                {/* Encabezado destacado del trámite */}
                <Card
                  variant="featured"
                  className="bg-surface border-border border-l-4 border-l-primary shadow-xs my-0"
                  innerClassName="p-4 sm:p-5 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone="primary"
                        appearance="solid"
                        size="sm"
                        className="font-mono"
                      >
                        {selectedSolicitud.contratoDetalle?.numero ||
                          selectedSolicitud.contrato ||
                          "SIN-CONTRATO"}
                      </Badge>
                      <Badge tone="neutral" appearance="outline" size="sm">
                        Solicitud {selectedSolicitud.id}
                      </Badge>
                      <Badge tone="warning" appearance="soft" size="sm">
                        Entidad Privada · DOC-01 / DOC-02 / DOC-03
                      </Badge>
                      <Badge tone="info" appearance="outline" size="sm">
                        Versión v
                        {selectedSolicitud.contratoDetalle?.version || 1}.0
                      </Badge>
                    </div>

                    <Badge
                      tone={
                        getEstadoContratoLabel(selectedSolicitud) === "Firmado"
                          ? "success"
                          : getEstadoContratoLabel(selectedSolicitud) ===
                              "Pendiente de firmas"
                            ? "info"
                            : getEstadoContratoLabel(selectedSolicitud) ===
                                "Pendiente de plantilla"
                              ? "danger"
                              : "warning"
                      }
                      appearance="soft"
                      size="sm"
                    >
                      {getEstadoContratoLabel(selectedSolicitud)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Institución Privada Suscriptora
                      </p>
                      <p className="text-base font-bold text-foreground mt-0.5">
                        {selectedSolicitud.institucion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Coordinador: {selectedSolicitud.coordinador}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Proyecto y Fuente Autorizada
                      </p>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {selectedSolicitud.proyectoNombre ||
                          "Proyecto Institucional"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSolicitud.fuentePrincipal}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Cupo Aprobado (SOL-01 / SOL-04) y Plantilla
                      </p>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {(
                          selectedSolicitud.contratoDetalle
                            ?.cantidadContratada ||
                          selectedSolicitud.cupoAprobado ||
                          selectedSolicitud.cupo ||
                          50000
                        ).toLocaleString()}{" "}
                        consultas / año
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Plantilla:{" "}
                        {selectedSolicitud.contratoDetalle?.plantillaVersion ||
                          "PAR-02-VIGENTE-2026.1"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Banners de Criterios de Aceptación DOC-01 / DOC-02 / DOC-03 */}
                {selectedSolicitud.contratoDetalle?.estado === "Borrador" && (
                  <div className="p-3.5 rounded-xl border border-warning/40 bg-warning/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="size-4 text-warning shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        «Contrato creado; pendiente de firmas» — ID:{" "}
                        <span className="font-mono">
                          {selectedSolicitud.contratoDetalle.numero}
                        </span>{" "}
                        (v{selectedSolicitud.contratoDetalle.version}.0)
                      </span>
                    </div>
                    <Badge tone="warning" appearance="soft" size="sm">
                      DOC-01 Crit. 4
                    </Badge>
                  </div>
                )}

                {selectedSolicitud.estado === "Pendiente de plantilla" && (
                  <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="size-4 text-destructive shrink-0" />
                      <span className="text-xs font-bold text-destructive">
                        «Pendiente de plantilla» —{" "}
                        {selectedSolicitud.plantillaPendienteDetalle ||
                          "PAR-02 no tiene versión publicada vigente."}
                      </span>
                    </div>
                    <Badge tone="danger" appearance="soft" size="sm">
                      DOC-01 Crit. 3
                    </Badge>
                  </div>
                )}

                {selectedSolicitud.contratoDetalle?.estado === "Firmado" && (
                  <div className="p-3.5 rounded-xl border border-success/40 bg-success/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="size-4 text-success shrink-0" />
                      <span className="text-xs font-bold text-foreground">
                        «Contrato firmado; facturación pendiente» — ID:{" "}
                        <span className="font-mono">
                          {selectedSolicitud.contratoDetalle.numero}
                        </span>{" "}
                        · Habilita FAC-01 (
                        {selectedSolicitud.factura?.tipoEventoFacturable ||
                          "contrato_inicial"}
                        )
                      </span>
                    </div>
                    <Badge tone="success" appearance="soft" size="sm">
                      DOC-02 Crit. 3
                    </Badge>
                  </div>
                )}

                {/* Pestañas del Expediente Contractual */}
                <Tabs
                  value={expedienteTab}
                  onValueChange={setExpedienteTab}
                  className="w-full"
                >
                  <TabsList className="bg-muted/40 p-1 rounded-lg border border-border w-full sm:w-auto overflow-x-auto justify-start h-auto gap-1">
                    <TabsTrigger
                      value="contrato"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      1. Instrumento Contractual y Firmas (DOC-01..03)
                    </TabsTrigger>
                    <TabsTrigger
                      value="alcance"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      2. Alcance, Campos y Cupo (SOL-04)
                    </TabsTrigger>
                    <TabsTrigger
                      value="versiones"
                      className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                    >
                      3. Historial de Versiones (
                      {selectedSolicitud.contratoDetalle?.historialVersiones
                        ?.length || 0}
                      )
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB 1: INSTRUMENTO Y FIRMAS */}
                  <TabsContent value="contrato" className="mt-4 space-y-4">
                    {!selectedSolicitud.contratoDetalle ? (
                      <div className="p-6 rounded-xl border border-dashed border-border bg-muted/10 text-center space-y-3">
                        <FileSignature className="size-8 text-muted-foreground mx-auto stroke-1" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            Aún no se ha generado el borrador contractual (DOC-01)
                          </p>
                          <p className="text-xs text-muted-foreground max-w-md mx-auto">
                            Genera el instrumento contractual a partir de la plantilla vigente PAR-02 vinculando institución, proyecto, fuente, campos aprobados y cupo solicitado.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            setCantidadContratada(
                              selectedSolicitud.cupoAprobado ||
                                selectedSolicitud.cupo ||
                                50000
                            );
                            setModalGenerar(selectedSolicitud);
                          }}
                        >
                          <Plus className="size-4" />
                          Generar borrador de contrato (DOC-01)
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Cláusulas y Metadatos del Borrador
                            </span>
                            <Badge tone="neutral" appearance="outline" size="sm">
                              Evento:{" "}
                              {selectedSolicitud.factura
                                ?.tipoEventoFacturable || "contrato_inicial"}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground leading-relaxed bg-surface p-3 rounded-lg border border-border">
                            {selectedSolicitud.contratoDetalle.clausulas ||
                              "Cláusulas estándar según plantilla PAR-02."}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            Documento PDF:{" "}
                            {selectedSolicitud.contratoDetalle.archivoPdf ||
                              `${selectedSolicitud.contratoDetalle.numero}_v${selectedSolicitud.contratoDetalle.version}.pdf`}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Circuito Bilateral de Firmas Electrónicas (DOC-02)
                          </span>
                          <div className="space-y-2.5">
                            <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground">
                                  1. Coordinador SINARP (Entidad Privada)
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {
                                    selectedSolicitud.contratoDetalle
                                      .coordinadorNombre
                                  }
                                </p>
                                {selectedSolicitud.contratoDetalle
                                  .fechaFirmaCoordinador && (
                                  <p className="text-[11px] font-mono text-success">
                                    Firmado:{" "}
                                    {
                                      selectedSolicitud.contratoDetalle
                                        .fechaFirmaCoordinador
                                    }
                                  </p>
                                )}
                              </div>
                              <Badge
                                tone={
                                  selectedSolicitud.contratoDetalle
                                    .firmadoCoordinador
                                    ? "success"
                                    : "warning"
                                }
                                appearance="soft"
                                size="sm"
                              >
                                {selectedSolicitud.contratoDetalle
                                  .firmadoCoordinador
                                  ? "Firmado"
                                  : "Pendiente"}
                              </Badge>
                            </div>

                            <div className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-foreground">
                                  2. Máxima Autoridad DINARP
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {
                                    selectedSolicitud.contratoDetalle
                                      .maximaAutoridadNombre
                                  }
                                </p>
                                {selectedSolicitud.contratoDetalle
                                  .fechaFirmaMaximaAutoridad && (
                                  <p className="text-[11px] font-mono text-success">
                                    Firmado:{" "}
                                    {
                                      selectedSolicitud.contratoDetalle
                                        .fechaFirmaMaximaAutoridad
                                    }
                                  </p>
                                )}
                              </div>
                              <Badge
                                tone={
                                  selectedSolicitud.contratoDetalle
                                    .firmadoMaximaAutoridad
                                    ? "success"
                                    : "warning"
                                }
                                appearance="soft"
                                size="sm"
                              >
                                {selectedSolicitud.contratoDetalle
                                  .firmadoMaximaAutoridad
                                  ? "Firmado"
                                  : "Pendiente"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* TAB 2: ALCANCE, CAMPOS Y CUPO */}
                  <TabsContent value="alcance" className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Database className="size-3.5 text-primary" />
                          Servicio y Fuente Vinculada
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {selectedSolicitud.servicioPrincipal ||
                            "Servicio de Interoperabilidad"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fuente: {selectedSolicitud.fuentePrincipal}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Justificación legal:{" "}
                          {selectedSolicitud.justificacionGeneral ||
                            "Aprobada en SOL-04"}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Lock className="size-3.5 text-primary" />
                          Campos Aprobados ({selectedSolicitud.camposCount})
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedSolicitud.fuentes
                            .flatMap((f) => f.campos)
                            .map((c, idx) => (
                              <Badge
                                key={idx}
                                tone={
                                  c.clasificacion === "Confidencial"
                                    ? "warning"
                                    : "neutral"
                                }
                                appearance="outline"
                                size="sm"
                                className="font-mono text-[11px]"
                              >
                                {c.nombre} ({c.clasificacion})
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: HISTORIAL DE VERSIONES */}
                  <TabsContent value="versiones" className="mt-4">
                    <div className="space-y-2.5">
                      {(
                        selectedSolicitud.contratoDetalle?.historialVersiones ||
                        []
                      ).map((hv, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Badge
                                tone="primary"
                                appearance="soft"
                                size="sm"
                                className="font-mono"
                              >
                                v{hv.version}.0
                              </Badge>
                              <span className="text-xs font-bold text-foreground">
                                {hv.cambios}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Autor: {hv.autor}
                            </p>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            {hv.fecha}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* =========================================================
               * VISTA BANDEJA PRINCIPAL (1 CONTENEDOR)
               * ========================================================= */
              <>
                {/* Encabezado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        tone="primary"
                        appearance="soft"
                        size="sm"
                        className="font-semibold"
                      >
                        Asesoría Jurídica
                      </Badge>
                      <Badge tone="neutral" appearance="outline" size="sm">
                        DOC-01 · DOC-02 · DOC-03
                      </Badge>
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      Contratos de acceso
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-3xl">
                      Genera los instrumentos contractuales para entidades privadas a partir de la plantilla vigente PAR-02, controla sus versiones previas a la firma y verifica la suscripción bilateral.
                    </p>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 self-start"
                  >
                    <Link href="/formalizacion">
                      <FileText className="size-4 text-primary" />
                      Bandeja de Formalización
                    </Link>
                  </Button>
                </div>

                {/* Tarjetas KPI interactivas horizontales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card
                    variant="featured"
                    onClick={() => {
                      setEstadoFilter(
                        estadoFilter === "BORRADOR" ? "ALL" : "BORRADOR"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-warning shadow-xs transition-all cursor-pointer my-0",
                      estadoFilter === "BORRADOR" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                      <Edit className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Borrador / Corrección
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {countBorradores}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        DOC-01 y DOC-03 en ajuste
                      </span>
                    </div>
                  </Card>

                  <Card
                    variant="featured"
                    onClick={() => {
                      setEstadoFilter(
                        estadoFilter === "PENDIENTE_FIRMAS"
                          ? "ALL"
                          : "PENDIENTE_FIRMAS"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-info shadow-xs transition-all cursor-pointer my-0",
                      estadoFilter === "PENDIENTE_FIRMAS" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-info/10 flex items-center justify-center text-info shrink-0">
                      <FileSignature className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Pendientes de firmas
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {countPendienteFirmas}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        DOC-02 circuito bilateral
                      </span>
                    </div>
                  </Card>

                  <Card
                    variant="featured"
                    onClick={() => {
                      setEstadoFilter(
                        estadoFilter === "FIRMADO" ? "ALL" : "FIRMADO"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-success shadow-xs transition-all cursor-pointer my-0",
                      estadoFilter === "FIRMADO" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Contratos firmados
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {countFirmados}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        Habilitan facturación FAC-01
                      </span>
                    </div>
                  </Card>

                  <Card
                    variant="featured"
                    onClick={() => {
                      setEstadoFilter(
                        estadoFilter === "SIN_CONTRATO" ? "ALL" : "SIN_CONTRATO"
                      );
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "bg-surface border-border border-l-4 border-l-primary shadow-xs transition-all cursor-pointer my-0",
                      estadoFilter === "SIN_CONTRATO" &&
                        "ring-2 ring-primary/25 bg-primary/5"
                    )}
                    innerClassName="p-3 sm:p-3.5 flex items-center gap-3"
                  >
                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Plus className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                          Por generar / Plantilla
                        </span>
                        <span className="text-xl font-bold font-heading text-foreground leading-none">
                          {countSinContrato}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                        Aprobadas por SOL-04
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Barra de Tabs + Búsqueda + ViewModeToggle */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <Tabs
                      value={estadoFilter}
                      onValueChange={(v) => {
                        setEstadoFilter(v);
                        setCurrentPage(1);
                      }}
                      className="w-full lg:w-auto"
                    >
                      <TabsList className="bg-muted/40 p-1 rounded-lg border border-border w-full lg:w-auto overflow-x-auto justify-start h-auto gap-1">
                        <TabsTrigger
                          value="ALL"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Todos ({privadasEnContratacion.length})
                        </TabsTrigger>
                        <TabsTrigger
                          value="BORRADOR"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Borrador ({countBorradores})
                        </TabsTrigger>
                        <TabsTrigger
                          value="PENDIENTE_FIRMAS"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Pendientes de firmas ({countPendienteFirmas})
                        </TabsTrigger>
                        <TabsTrigger
                          value="FIRMADO"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Firmados ({countFirmados})
                        </TabsTrigger>
                        <TabsTrigger
                          value="SIN_CONTRATO"
                          className="rounded-md px-3 py-1.5 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-xs"
                        >
                          Por generar ({countSinContrato})
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <div className="w-full sm:w-72">
                        <Search
                          size="sm"
                          placeholder="Buscar contrato, institución o solicitud..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          onClear={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                          }}
                          className="w-full bg-background"
                        />
                      </div>
                      <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </div>
                  </div>

                  {/* Chips de filtros activos */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">
                        Mostrando resultados filtrados por:
                      </span>
                      {estadoFilter !== "ALL" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          size="sm"
                          className="gap-1.5 pl-2.5 pr-1.5"
                        >
                          Estado: {estadoFilter}
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-4 hover:bg-primary/20"
                            onClick={() => setEstadoFilter("ALL")}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      {searchTerm.trim() !== "" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          size="sm"
                          className="gap-1.5 pl-2.5 pr-1.5"
                        >
                          Búsqueda: &ldquo;{searchTerm}&rdquo;
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-4 hover:bg-primary/20"
                            onClick={() => setSearchTerm("")}
                          >
                            <X className="size-3" />
                          </Button>
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs h-auto px-2 py-0.5 text-primary"
                      >
                        Limpiar todo
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tabla de Contratos */}
                <div
                  className={cn(
                    "border border-border rounded-xl overflow-hidden bg-surface shadow-xs",
                    viewMode === "table" ? "hidden md:block" : "hidden"
                  )}
                >
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          N.º Contrato / Solicitud
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Institución Privada
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Fuente y Cupo (SOL-04)
                        </TableHead>
                        <TableHead className="text-center text-xs font-bold uppercase tracking-wider">
                          Versión
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">
                          Estado y Firmas (DOC-02)
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-40 text-center">
                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                              <FileSignature className="size-8 stroke-1 text-muted-foreground/60" />
                              <p className="text-sm font-medium">
                                No se encontraron contratos privados bajo este criterio.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedItems.map((s) => {
                          const contrato = s.contratoDetalle;
                          const numeroContrato =
                            contrato?.numero || s.contrato || "Sin generar";
                          const estadoContrato = getEstadoContratoLabel(s);
                          const firmaCoord = !!contrato?.firmadoCoordinador;
                          const firmaMax = !!contrato?.firmadoMaximaAutoridad;

                          return (
                            <TableRow
                              key={s.id}
                              onClick={() => handleOpenExpediente(s)}
                              className="cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-mono text-xs font-bold text-primary">
                                    {numeroContrato}
                                  </span>
                                  <span className="font-mono text-[11px] text-muted-foreground">
                                    Trámite: {s.id}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold text-foreground">
                                    {s.institucion}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {s.proyectoNombre || s.coordinador}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-medium text-foreground">
                                    {s.fuentePrincipal}
                                  </span>
                                  <span className="text-[11px] font-semibold text-primary">
                                    Cupo:{" "}
                                    {(
                                      contrato?.cantidadContratada ||
                                      s.cupoAprobado ||
                                      s.cupo ||
                                      50000
                                    ).toLocaleString()}{" "}
                                    consultas
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="text-center align-top py-3">
                                <Badge
                                  tone="neutral"
                                  appearance="outline"
                                  size="sm"
                                  className="font-mono"
                                >
                                  v{contrato?.version || 1}.0
                                </Badge>
                              </TableCell>

                              <TableCell className="align-top py-3">
                                <div className="flex flex-col items-start gap-1">
                                  <Badge
                                    tone={
                                      estadoContrato === "Firmado"
                                        ? "success"
                                        : estadoContrato ===
                                            "Pendiente de firmas"
                                          ? "info"
                                          : estadoContrato ===
                                              "Pendiente de plantilla"
                                            ? "danger"
                                            : "warning"
                                    }
                                    appearance="soft"
                                    size="sm"
                                  >
                                    {estadoContrato}
                                  </Badge>
                                  {contrato && (
                                    <span className="text-[11px] text-muted-foreground">
                                      Coord: {firmaCoord ? "✓" : "Pend."} ·
                                      DINARP: {firmaMax ? "✓" : "Pend."}
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="text-right align-top py-3">
                                {renderAccionesContrato(s, false)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Tarjetas (Móvil o modo Cards) */}
                <div
                  className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-4",
                    viewMode === "cards" ? "grid" : "grid md:hidden"
                  )}
                >
                  {paginatedItems.map((s) => {
                    const contrato = s.contratoDetalle;
                    const numeroContrato =
                      contrato?.numero || s.contrato || "Sin generar";
                    const estadoContrato = getEstadoContratoLabel(s);

                    return (
                      <InteractiveCard
                        key={s.id}
                        onClick={() => handleOpenExpediente(s)}
                        className="p-4 flex flex-col justify-between gap-3 bg-surface border-border"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-primary">
                              {numeroContrato}
                            </span>
                            <h3 className="text-sm font-bold text-foreground mt-0.5">
                              {s.institucion}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {s.fuentePrincipal}
                            </p>
                          </div>
                          <Badge
                            tone={
                              estadoContrato === "Firmado"
                                ? "success"
                                : estadoContrato === "Pendiente de firmas"
                                  ? "info"
                                  : "warning"
                            }
                            appearance="soft"
                            size="sm"
                          >
                            {estadoContrato}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground font-mono">
                            {s.id} · v{contrato?.version || 1}.0
                          </span>
                          {renderAccionesContrato(s, false)}
                        </div>
                      </InteractiveCard>
                    );
                  })}
                </div>

                {/* Paginación */}
                {filtered.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Mostrando {paginatedItems.length} de {filtered.length}{" "}
                      contratos privados
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Anterior
                      </Button>
                      <span className="text-xs font-semibold px-2 text-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </main>

        {/* =========================================================
         * MODAL DOC-01: GENERAR BORRADOR DE CONTRATO
         * ========================================================= */}
        <Dialog
          open={!!modalGenerar}
          onOpenChange={(open) => !open && setModalGenerar(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Generar borrador de contrato privado (DOC-01)
              </DialogTitle>
              <DialogDescription>
                Formaliza proyecto, fuente, campos aprobados y cupo solicitado de{" "}
                <span className="font-semibold text-foreground">
                  {modalGenerar?.institucion}
                </span>{" "}
                ({modalGenerar?.id}) usando la plantilla vigente PAR-02.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/30 border border-border text-xs space-y-1">
                <p>
                  <span className="font-semibold">Plantilla:</span>{" "}
                  PAR-02-VIGENTE-2026.1
                </p>
                <p>
                  <span className="font-semibold">Evento facturable:</span>{" "}
                  <code className="font-mono text-primary">
                    contrato_inicial
                  </code>{" "}
                  (habilita FAC-01 tras firmas)
                </p>
                <p>
                  <span className="font-semibold">
                    Cupo heredado de SOL-01 / SOL-04:
                  </span>{" "}
                  {(
                    modalGenerar?.cupoAprobado ||
                    modalGenerar?.cupo ||
                    50000
                  ).toLocaleString()}{" "}
                  consultas (no editable independientemente)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Cláusulas principales del borrador
                </label>
                <Textarea
                  rows={4}
                  value={clausulas}
                  onChange={(e) => setClausulas(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalGenerar(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleGenerarSubmit}>
                Crear borrador contractual (DOC-01)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =========================================================
         * MODAL DOC-03: CORREGIR BORRADOR DE CONTRATO
         * ========================================================= */}
        <Dialog
          open={!!modalEditar}
          onOpenChange={(open) => !open && setModalEditar(null)}
        >
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Corregir borrador de contrato antes de firma (DOC-03)
              </DialogTitle>
              <DialogDescription>
                Ajusta el contenido contractual de{" "}
                <span className="font-semibold text-foreground">
                  {modalEditar?.contratoDetalle?.numero}
                </span>
                . Si ya existían firmas parciales en curso, la ronda anterior quedará sin efecto y se notificará por AUD-01.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Motivo de la corrección y versión
                </label>
                <Input
                  value={cambiosEdicion}
                  onChange={(e) => setCambiosEdicion(e.target.value)}
                  placeholder="Describe los cambios realizados al borrador..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Cláusulas corregidas
                </label>
                <Textarea
                  rows={4}
                  value={clausulas}
                  onChange={(e) => setClausulas(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalEditar(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleEditarSubmit}>
                Guardar nueva versión (DOC-03)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =========================================================
         * MODAL DOC-02: ENVIAR A CIRCUITO DE FIRMAS
         * ========================================================= */}
        <Dialog
          open={!!modalEnviarFirmas}
          onOpenChange={(open) => !open && setModalEnviarFirmas(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Iniciar circuito de firmas electrónicas (DOC-02)
              </DialogTitle>
              <DialogDescription>
                Se habilitará la suscripción para el Coordinador SINARP y la Máxima Autoridad de DINARP sobre la versión v
                {modalEnviarFirmas?.contratoDetalle?.version || 1}.0.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setModalEnviarFirmas(null)}
              >
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleEnviarFirmasSubmit}>
                Confirmar envío a firmas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* =========================================================
         * MODAL DOC-02: REGISTRAR FIRMA ELECTRÓNICA
         * ========================================================= */}
        <Dialog
          open={!!modalFirmar}
          onOpenChange={(open) => !open && setModalFirmar(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Verificar y asentar firma electrónica (DOC-02)
              </DialogTitle>
              <DialogDescription>
                {modalFirmar?.rol === "COORDINADOR_SINARP"
                  ? `Suscripción del Coordinador SINARP (${modalFirmar.solicitud.coordinador})`
                  : "Suscripción de la Máxima Autoridad de DINARP (Dra. Cristina Álvarez)"}{" "}
                sobre el contrato{" "}
                <span className="font-mono font-semibold text-foreground">
                  {modalFirmar?.solicitud.contratoDetalle?.numero}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalFirmar(null)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleFirmarSubmit}>
                Estampar firma electrónica
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </WireframeDashboardLayout>
  );
}
