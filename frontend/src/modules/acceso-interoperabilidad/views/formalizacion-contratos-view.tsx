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
  Edit2,
  ArrowLeft,
  X,
  Building2,
  UserCheck,
  ShieldCheck,
  Clock,
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
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
} from "@/components/ui/combobox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
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
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  useSolicitudesStore,
  SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ESTADOS_CONTRATO_OPCIONES = [
  { value: "TODOS", label: "Todos los estados" },
  { value: "FIRMADO", label: "Firmado" },
  { value: "PENDIENTE_FIRMAS", label: "Pendiente de firmas" },
  { value: "BORRADOR", label: "Borrador / Corrección" },
  { value: "SIN_CONTRATO", label: "Por generar / Plantilla" },
];

export function FormalizacionContratosView() {
  const { activeUser } = useAuthStore();
  const activeRole = activeUser?.role || "JURIDICA";
  const isJuridica = activeRole === "JURIDICA";
  const isCoordinador = activeRole === "COORDINADOR_SINARP";
  const isMaximaAutoridad = activeRole === "APROBADOR";

  const {
    solicitudes,
    generarContrato,
    editarBorradorContrato,
    enviarContratoAFirmas,
    firmarContrato,
    simularPendientePlantillaContrato,
  } = useSolicitudesStore();

  // Filtros y búsqueda (mismo patrón visual y de interacción que Cuentas Internas)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstitucion, setFilterInstitucion] = useState<string>("TODOS");
  const [institucionSearch, setInstitucionSearch] = useState("");
  const [filterFuente, setFilterFuente] = useState<string>("TODOS");
  const [fuenteSearch, setFuenteSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("TODOS");
  const [estadoSearch, setEstadoSearch] = useState("");

  // Paginación y vista
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const getEstadoContratoLabel = (s: SolicitudAcceso): string => {
    if (s.estado === "Pendiente de plantilla") return "Pendiente de plantilla";
    if (s.contratoDetalle?.estado) return s.contratoDetalle.estado;
    if (s.contrato) return "Firmado";
    return "Sin contrato";
  };

  // Solicitudes privadas en formalización contractual filtradas por rol según HUs v19
  const privadasEnContratacion = useMemo(() => {
    return solicitudes.filter((s) => {
      if (s.tipoInstitucion !== "Privada") return false;
      if (isJuridica) return true;
      // Coordinador SINARP y Máxima Autoridad solo visualizan contratos remitidos a firma o firmados (DOC-02)
      const est = getEstadoContratoLabel(s);
      return est === "Pendiente de firmas" || est === "Firmado";
    });
  }, [solicitudes, isJuridica]);

  const selectedSolicitud = useMemo(
    () => privadasEnContratacion.find((s) => s.id === selectedId) || null,
    [privadasEnContratacion, selectedId]
  );

  const estadosContratoOpcionesRol = useMemo(() => {
    if (isJuridica) return ESTADOS_CONTRATO_OPCIONES;
    return ESTADOS_CONTRATO_OPCIONES.filter(
      (o) => o.value === "TODOS" || o.value === "FIRMADO" || o.value === "PENDIENTE_FIRMAS"
    );
  }, [isJuridica]);

  const getEstadoFilterLabel = (st: string) => {
    return ESTADOS_CONTRATO_OPCIONES.find((o) => o.value === st)?.label || "Todos los estados";
  };

  const handleSetFilterInstitucion = (nuevaInst: string) => {
    setFilterInstitucion(nuevaInst);
    setInstitucionSearch(nuevaInst === "TODOS" ? "" : nuevaInst);
    setCurrentPage(1);
  };

  const handleSetFilterFuente = (nuevaFuente: string) => {
    setFilterFuente(nuevaFuente);
    setFuenteSearch(nuevaFuente === "TODOS" ? "" : nuevaFuente);
    setCurrentPage(1);
  };

  const handleSetEstadoFilter = (nuevoEstado: string) => {
    setEstadoFilter(nuevoEstado);
    setEstadoSearch(nuevoEstado === "TODOS" ? "" : getEstadoFilterLabel(nuevoEstado));
    setCurrentPage(1);
  };

  // KPIs
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

  // Listas de opciones para Combobox
  const institucionesDisponibles = useMemo(() => {
    const set = new Set<string>();
    privadasEnContratacion.forEach((s) => set.add(s.institucion));
    return Array.from(set);
  }, [privadasEnContratacion]);

  const fuentesDisponibles = useMemo(() => {
    const set = new Set<string>();
    privadasEnContratacion.forEach((s) => {
      if (s.fuentePrincipal) set.add(s.fuentePrincipal);
    });
    return Array.from(set);
  }, [privadasEnContratacion]);

  const filteredInstitucionesForFilter = useMemo(() => {
    const options = [
      { value: "TODOS", label: "Todas las instituciones" },
      ...institucionesDisponibles.map((inst) => ({ value: inst, label: inst })),
    ];
    if (!institucionSearch.trim()) return options;
    if (filterInstitucion.toLowerCase() === institucionSearch.trim().toLowerCase()) {
      return options;
    }
    const q = institucionSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [institucionSearch, filterInstitucion, institucionesDisponibles]);

  const filteredFuentesForFilter = useMemo(() => {
    const options = [
      { value: "TODOS", label: "Todas las fuentes" },
      ...fuentesDisponibles.map((f) => ({ value: f, label: f })),
    ];
    if (!fuenteSearch.trim()) return options;
    if (filterFuente.toLowerCase() === fuenteSearch.trim().toLowerCase()) {
      return options;
    }
    const q = fuenteSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [fuenteSearch, filterFuente, fuentesDisponibles]);

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return estadosContratoOpcionesRol;
    const currentLabel = getEstadoFilterLabel(estadoFilter);
    if (currentLabel.toLowerCase() === estadoSearch.trim().toLowerCase()) {
      return estadosContratoOpcionesRol;
    }
    const q = estadoSearch.toLowerCase();
    return estadosContratoOpcionesRol.filter((o) => o.label.toLowerCase().includes(q));
  }, [estadoSearch, estadoFilter, estadosContratoOpcionesRol]);

  const filtered = useMemo(() => {
    return privadasEnContratacion.filter((s) => {
      const contrato = s.contratoDetalle;
      const estadoContrato = getEstadoContratoLabel(s);

      if (filterInstitucion !== "TODOS" && s.institucion !== filterInstitucion) {
        return false;
      }
      if (filterFuente !== "TODOS" && s.fuentePrincipal !== filterFuente) {
        return false;
      }

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
        s.coordinador.toLowerCase().includes(term) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(term)) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(term)) ||
        (s.contrato && s.contrato.toLowerCase().includes(term)) ||
        (contrato?.numero && contrato.numero.toLowerCase().includes(term))
      );
    });
  }, [privadasEnContratacion, filterInstitucion, filterFuente, estadoFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() !== "" ||
      filterInstitucion !== "TODOS" ||
      filterFuente !== "TODOS" ||
      estadoFilter !== "TODOS"
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterInstitucion("TODOS");
    setInstitucionSearch("");
    setFilterFuente("TODOS");
    setFuenteSearch("");
    setEstadoFilter("TODOS");
    setEstadoSearch("");
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

  const getEstadoBadge = (estadoContrato: string) => {
    switch (estadoContrato) {
      case "Firmado":
        return (
          <Badge
            tone="success"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Firmado
          </Badge>
        );
      case "Pendiente de firmas":
        return (
          <Badge
            tone="info"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Pendiente de firmas
          </Badge>
        );
      case "Pendiente de plantilla":
        return (
          <Badge
            tone="danger"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            Pendiente de plantilla
          </Badge>
        );
      case "Borrador":
      case "Corrección pendiente":
        return (
          <Badge
            tone="warning"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            {estadoContrato}
          </Badge>
        );
      default:
        return (
          <Badge
            tone="neutral"
            appearance="soft"
            size="sm"
            className="font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center"
          >
            {estadoContrato}
          </Badge>
        );
    }
  };

  const getEstadoCardColor = (
    estadoContrato: string
  ): "default" | "primary" | "info" | "warning" | "success" | "danger" => {
    switch (estadoContrato) {
      case "Borrador":
      case "Corrección pendiente":
        return "warning";
      case "Pendiente de plantilla":
        return "danger";
      default:
        return "default";
    }
  };

  const renderAccionesContrato = (s: SolicitudAcceso, isInline = false) => {
    const contrato = s.contratoDetalle;
    const estadoContrato = getEstadoContratoLabel(s);
    const firmadoCoordinador = !!contrato?.firmadoCoordinador;
    const firmadoMaximaAutoridad = !!contrato?.firmadoMaximaAutoridad;

    if (isInline) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          {isJuridica &&
            (estadoContrato === "Sin contrato" ||
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

          {isJuridica &&
            (estadoContrato === "Borrador" ||
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
                  <Edit2 className="size-3.5" />
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
              {isJuridica && (
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
                  <Edit2 className="size-3.5" />
                  Corregir (invalida firmas)
                </Button>
              )}
              {isCoordinador && !firmadoCoordinador && (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "COORDINADOR_SINARP" })
                  }
                >
                  <FileSignature className="size-3.5" />
                  Firmar como Coordinador SINARP
                </Button>
              )}
              {isMaximaAutoridad && !firmadoMaximaAutoridad && (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "MAXIMA_AUTORIDAD" })
                  }
                >
                  <FileSignature className="size-3.5" />
                  Firmar como Máxima Autoridad
                </Button>
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-0.5 justify-end w-full">
        {/* Ver detalle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
              onClick={() => handleOpenExpediente(s)}
              aria-label={`Ver detalle contractual de ${s.id}`}
            >
              <Eye className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Ver detalle</TooltipContent>
        </Tooltip>

        {isJuridica &&
          (estadoContrato === "Sin contrato" ||
            estadoContrato === "Pendiente de plantilla") && (
            <>
              {estadoContrato !== "Pendiente de plantilla" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                      onClick={() => {
                        setCantidadContratada(s.cupoAprobado || s.cupo || 50000);
                        setModalGenerar(s);
                      }}
                      aria-label="Generar borrador de contrato"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Generar borrador</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
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
                    ? "Activar plantilla PAR-02"
                    : "Simular sin plantilla"}
                </TooltipContent>
              </Tooltip>
            </>
          )}

        {isJuridica &&
          (estadoContrato === "Borrador" ||
            estadoContrato === "Corrección pendiente") && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
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
                    <Edit2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Editar borrador</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                    onClick={() => setModalEnviarFirmas(s)}
                    aria-label="Enviar a firmas"
                  >
                    <Send className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Iniciar firmas</TooltipContent>
              </Tooltip>
            </>
          )}

        {estadoContrato === "Pendiente de firmas" && (
          <>
            {isJuridica && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
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
                    <Edit2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Editar borrador</TooltipContent>
              </Tooltip>
            )}

            {isCoordinador && !firmadoCoordinador && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-warning hover:text-warning hover:bg-warning/15 cursor-pointer"
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
                  Firmar Coordinador SINARP
                </TooltipContent>
              </Tooltip>
            )}

            {isMaximaAutoridad && !firmadoMaximaAutoridad && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-success hover:text-success hover:bg-success/15 cursor-pointer"
                    onClick={() =>
                      setModalFirmar({
                        solicitud: s,
                        rol: "MAXIMA_AUTORIDAD",
                      })
                    }
                    aria-label="Firmar Máxima Autoridad DINARP"
                  >
                    <ShieldCheck className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Firmar Máxima Autoridad DINARP
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    );
  };

  // Renderizado uniforme de Tarjeta Interactiva (idéntico al patrón de Cuentas Internas)
  const renderContratoCard = (s: SolicitudAcceso) => {
    const contrato = s.contratoDetalle;
    const numeroContrato = contrato?.numero || s.contrato || "Sin generar";
    const estadoContrato = getEstadoContratoLabel(s);
    const firmaCoord = !!contrato?.firmadoCoordinador;
    const firmaMax = !!contrato?.firmadoMaximaAutoridad;
    const cupo =
      contrato?.cantidadContratada || s.cupoAprobado || s.cupo || 50000;

    return (
      <InteractiveCard
        key={s.id}
        color={getEstadoCardColor(estadoContrato)}
        decorativeIcon={<FileSignature className="size-full stroke-[0.8]" />}
        decorativeIconClassName="size-20 -bottom-2 -right-2 opacity-40 dark:opacity-25 group-hover:opacity-60"
        className="p-4 sm:p-5 border-border shadow-xs hover:border-primary/40 space-y-3.5 w-full"
      >
        {/* Cabecera: Institución y Estado */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border/70 w-full">
          <div className="min-w-0 flex-1 space-y-1">
            <button
              type="button"
              onClick={() => handleOpenExpediente(s)}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors text-left line-clamp-2 leading-snug cursor-pointer block"
            >
              {s.institucion}
            </button>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
              <span>{numeroContrato}</span>
              <span className="text-muted-foreground/40 font-bold">•</span>
              <span>{s.id}</span>
            </div>
          </div>
          <div className="shrink-0 pt-0.5">{getEstadoBadge(estadoContrato)}</div>
        </div>

        {/* Bloque 1: Fuente y Proyecto */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface/80 backdrop-blur-xs px-3 py-2 rounded-lg border border-border/50 w-full">
          <Database className="size-3.5 text-primary shrink-0" />
          <span className="text-foreground font-medium text-xs truncate flex-1 min-w-0">
            {s.fuentePrincipal}
          </span>
        </div>

        {/* Bloque 2: Cupo contratado y Plantilla */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs w-full">
          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Cupo contratado
            </span>
            <span className="text-xs font-bold text-primary block">
              {cupo.toLocaleString()} consultas/año
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-surface/80 backdrop-blur-xs border border-border/40 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Plantilla / Versión
            </span>
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground block truncate">
                {contrato?.plantillaVersion || "PAR-02-VIGENTE-2026.1"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono block">
                Versión v{contrato?.version || 1}.0
              </span>
            </div>
          </div>
        </div>

        {/* Bloque 3: Firmas electrónicas y Coordinador */}
        <div className="space-y-2 pt-2 border-t border-border/50 text-xs w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground font-medium">
              Firmas electrónicas:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                  firmaCoord
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-warning/15 text-warning border-warning/30"
                )}
              >
                <UserCheck className="size-3" />
                <span>{firmaCoord ? "Coord. OK" : "Coord. pendiente"}</span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                  firmaMax
                    ? "bg-success/15 text-success border-success/30"
                    : "bg-warning/15 text-warning border-warning/30"
                )}
              >
                <ShieldCheck className="size-3" />
                <span>{firmaMax ? "DINARP OK" : "DINARP pendiente"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
            <span className="text-[11px] text-muted-foreground font-medium">
              Coordinador:
            </span>
            <span className="text-[11px] text-foreground font-medium truncate">
              {s.coordinador}
            </span>
          </div>
        </div>

        {/* Bloque 4: Acciones en grilla del UI Kit */}
        <div className="pt-2 border-t border-border/60 w-full">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenExpediente(s)}
              className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
            >
              <Eye className="size-3.5 text-muted-foreground" />
              <span>Ver detalle</span>
            </Button>

            {isJuridica &&
              (estadoContrato === "Sin contrato" ||
                estadoContrato === "Pendiente de plantilla") && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={estadoContrato === "Pendiente de plantilla"}
                  onClick={() => {
                    setCantidadContratada(s.cupoAprobado || s.cupo || 50000);
                    setModalGenerar(s);
                  }}
                  className="w-full text-xs font-semibold gap-1.5 cursor-pointer h-9 justify-center hover:text-primary hover:border-primary/50"
                >
                  <Plus className="size-3.5 text-muted-foreground" />
                  <span>Generar</span>
                </Button>
              )}

            {isJuridica &&
              (estadoContrato === "Borrador" ||
                estadoContrato === "Corrección pendiente") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalEnviarFirmas(s)}
                  className="w-full text-xs font-semibold gap-1.5 text-primary border-primary/40 hover:bg-primary/10 cursor-pointer h-9 justify-center"
                >
                  <Send className="size-3.5" />
                  <span>Iniciar firmas</span>
                </Button>
              )}

            {isCoordinador &&
              estadoContrato === "Pendiente de firmas" &&
              !firmaCoord && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "COORDINADOR_SINARP" })
                  }
                  className="w-full text-xs font-semibold gap-1.5 text-warning border-warning/40 hover:bg-warning/10 hover:text-warning cursor-pointer h-9 justify-center"
                >
                  <FileSignature className="size-3.5" />
                  <span>Firmar Coord.</span>
                </Button>
              )}

            {isMaximaAutoridad &&
              estadoContrato === "Pendiente de firmas" &&
              !firmaMax && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setModalFirmar({ solicitud: s, rol: "MAXIMA_AUTORIDAD" })
                  }
                  className="w-full text-xs font-semibold gap-1.5 text-success border-success/40 hover:bg-success/10 hover:text-success cursor-pointer h-9 justify-center"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Firmar DINARP</span>
                </Button>
              )}
          </div>
        </div>
      </InteractiveCard>
    );
  };

  return (
    <WireframeDashboardLayout activeMenu="formalizacion-contratos">
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

                  {getEstadoBadge(getEstadoContratoLabel(selectedSolicitud))}
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
                        selectedSolicitud.contratoDetalle?.cantidadContratada ||
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
                      {isJuridica && (
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
                      )}
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
                            {selectedSolicitud.factura?.tipoEventoFacturable ||
                              "contrato_inicial"}
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
             * VISTA BANDEJA PRINCIPAL (IDÉNTICA A CUENTAS INTERNAS)
             * ========================================================= */
            <>
              {/* Encabezado Principal */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
                <div className="space-y-1 min-w-0 flex-1">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    {isJuridica ? "Contratos de acceso" : "Firma electrónica de contratos"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                    {isJuridica
                      ? "Genera los instrumentos contractuales para entidades privadas a partir de la plantilla vigente PAR-02, controla sus versiones previas a la firma y verifica la suscripción bilateral."
                      : isCoordinador
                        ? "Revisa y suscribe con primera firma electrónica los contratos de acceso a fuentes remitidos por la Dirección Jurídica (DOC-02)."
                        : "Revisa y suscribe con segunda firma electrónica los contratos de acceso previamente firmados por las entidades privadas (DOC-02)."}
                  </p>
                </div>
              </div>

              {/* Cards de Resumen Compactas según perfil */}
              <div
                className={cn(
                  "grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 w-full",
                  isJuridica ? "lg:grid-cols-4" : "lg:grid-cols-2"
                )}
              >
                {/* 1. Contratos firmados */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    handleSetEstadoFilter(
                      estadoFilter === "FIRMADO" ? "TODOS" : "FIRMADO"
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetEstadoFilter(
                        estadoFilter === "FIRMADO" ? "TODOS" : "FIRMADO"
                      );
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    estadoFilter === "FIRMADO"
                      ? "bg-success/15 border-success ring-2 ring-success/40 shadow-xs"
                      : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs"
                  )}
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                          estadoFilter === "FIRMADO"
                            ? "bg-success text-white shadow-xs"
                            : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white"
                        )}
                      >
                        <CheckCircle2 className="size-5" />
                      </div>
                      <Badge
                        tone="success"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Perfeccionados
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Contratos firmados
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {countFirmados}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 2. Pendientes de firmas */}
                <Card
                  variant="featured"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    handleSetEstadoFilter(
                      estadoFilter === "PENDIENTE_FIRMAS"
                        ? "TODOS"
                        : "PENDIENTE_FIRMAS"
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSetEstadoFilter(
                        estadoFilter === "PENDIENTE_FIRMAS"
                          ? "TODOS"
                          : "PENDIENTE_FIRMAS"
                      );
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                    "hover:-translate-y-0.5 hover:shadow-md",
                    estadoFilter === "PENDIENTE_FIRMAS"
                      ? "bg-info/15 border-info ring-2 ring-info/40 shadow-xs"
                      : "bg-info/5 hover:bg-info/10 border-info/25 shadow-2xs"
                  )}
                  innerClassName="p-0 h-full"
                >
                  <div className="flex flex-col justify-between h-full gap-3 w-full">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                          estadoFilter === "PENDIENTE_FIRMAS"
                            ? "bg-info text-white shadow-xs"
                            : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                        )}
                      >
                        <FileSignature className="size-5" />
                      </div>
                      <Badge
                        tone="info"
                        appearance="soft"
                        size="sm"
                        className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                      >
                        Circuito bilateral
                      </Badge>
                    </div>
                    <div className="text-left w-full space-y-0.5">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Pendientes de firmas
                      </p>
                      <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                        {countPendienteFirmas}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* 3. Borrador / Corrección (exclusivo Jurídica) */}
                {isJuridica && (
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSetEstadoFilter(
                        estadoFilter === "BORRADOR" ? "TODOS" : "BORRADOR"
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSetEstadoFilter(
                          estadoFilter === "BORRADOR" ? "TODOS" : "BORRADOR"
                        );
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      estadoFilter === "BORRADOR"
                        ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs"
                        : "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            estadoFilter === "BORRADOR"
                              ? "bg-warning text-white shadow-xs"
                              : "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                          )}
                        >
                          <Clock className="size-5" />
                        </div>
                        <Badge
                          tone="warning"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          En revisión
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Borrador / Corrección
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {countBorradores}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* 4. Por generar / Plantilla (exclusivo Jurídica) */}
                {isJuridica && (
                  <Card
                    variant="featured"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      handleSetEstadoFilter(
                        estadoFilter === "SIN_CONTRATO" ? "TODOS" : "SIN_CONTRATO"
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSetEstadoFilter(
                          estadoFilter === "SIN_CONTRATO"
                            ? "TODOS"
                            : "SIN_CONTRATO"
                        );
                      }
                    }}
                    className={cn(
                      "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                      "hover:-translate-y-0.5 hover:shadow-md",
                      estadoFilter === "SIN_CONTRATO"
                        ? "bg-muted border-border ring-2 ring-primary/30 shadow-xs"
                        : "bg-muted/40 hover:bg-muted/60 border-border/70 shadow-2xs"
                    )}
                    innerClassName="p-0 h-full"
                  >
                    <div className="flex flex-col justify-between h-full gap-3 w-full">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                            estadoFilter === "SIN_CONTRATO"
                              ? "bg-foreground text-background shadow-xs"
                              : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-foreground group-hover:text-background"
                          )}
                        >
                          <FileText className="size-5" />
                        </div>
                        <Badge
                          tone="neutral"
                          appearance="soft"
                          size="sm"
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                        >
                          Por formalizar
                        </Badge>
                      </div>
                      <div className="text-left w-full space-y-0.5">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Por generar / Plantilla
                        </p>
                        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                          {countSinContrato}
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Filtros y Búsqueda con UI Kit Oficial */}
              <TooltipProvider delayDuration={150}>
                <div className="space-y-3 w-full">
                  <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
                    {/* Buscador UI Kit */}
                    <div className="flex-1 min-w-0">
                      <Search
                        size="sm"
                        placeholder="Buscar por N.º de contrato, solicitud, institución, coordinador o fuente..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                        onClear={() => {
                          setSearchTerm("");
                          setCurrentPage(1);
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Filtros Combobox UI Kit */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full xl:w-auto shrink-0">
                      {/* Filtro Institución */}
                      <div className="w-full xl:w-[210px] min-w-0">
                        <Combobox
                          value={
                            filterInstitucion === "TODOS"
                              ? null
                              : filterInstitucion
                          }
                          onValueChange={(val) => {
                            handleSetFilterInstitucion(val || "TODOS");
                          }}
                          inputValue={institucionSearch}
                          onInputValueChange={(newSearch) => {
                            if (newSearch === "TODOS") setInstitucionSearch("");
                            else setInstitucionSearch(newSearch);
                          }}
                        >
                          <ComboboxInput
                            size="sm"
                            placeholder="Todas las instituciones"
                            showClear={filterInstitucion !== "TODOS"}
                            showTrigger={true}
                            className="w-full"
                          />
                          <ComboboxContent className="min-w-[260px] z-[80]">
                            <ComboboxList>
                              <ComboboxGroup>
                                <ComboboxLabel>
                                  Filtrar por institución privada
                                </ComboboxLabel>
                                {filteredInstitucionesForFilter.map((opt) => (
                                  <ComboboxItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs py-1.5 cursor-pointer"
                                    title={opt.label}
                                  >
                                    <span className="truncate">{opt.label}</span>
                                  </ComboboxItem>
                                ))}
                              </ComboboxGroup>
                              {filteredInstitucionesForFilter.length === 0 && (
                                <ComboboxEmpty>
                                  No se encontraron instituciones.
                                </ComboboxEmpty>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      {/* Filtro Fuente */}
                      <div className="w-full xl:w-[210px] min-w-0">
                        <Combobox
                          value={filterFuente === "TODOS" ? null : filterFuente}
                          onValueChange={(val) => {
                            handleSetFilterFuente(val || "TODOS");
                          }}
                          inputValue={fuenteSearch}
                          onInputValueChange={(newSearch) => {
                            if (newSearch === "TODOS") setFuenteSearch("");
                            else setFuenteSearch(newSearch);
                          }}
                        >
                          <ComboboxInput
                            size="sm"
                            placeholder="Todas las fuentes"
                            showClear={filterFuente !== "TODOS"}
                            showTrigger={true}
                            className="w-full"
                          />
                          <ComboboxContent className="min-w-[260px] z-[80]">
                            <ComboboxList>
                              <ComboboxGroup>
                                <ComboboxLabel>
                                  Filtrar por fuente de datos
                                </ComboboxLabel>
                                {filteredFuentesForFilter.map((opt) => (
                                  <ComboboxItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs py-1.5 cursor-pointer"
                                    title={opt.label}
                                  >
                                    <span className="truncate">{opt.label}</span>
                                  </ComboboxItem>
                                ))}
                              </ComboboxGroup>
                              {filteredFuentesForFilter.length === 0 && (
                                <ComboboxEmpty>
                                  No se encontraron fuentes.
                                </ComboboxEmpty>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      {/* Filtro Estado */}
                      <div className="w-full xl:w-[195px] min-w-0">
                        <Combobox
                          value={estadoFilter === "TODOS" ? null : estadoFilter}
                          onValueChange={(val) => {
                            handleSetEstadoFilter(val || "TODOS");
                          }}
                          inputValue={estadoSearch}
                          onInputValueChange={(newSearch) => {
                            const opt = ESTADOS_CONTRATO_OPCIONES.find(
                              (e) => e.value === newSearch
                            );
                            if (opt) setEstadoSearch(opt.label);
                            else if (newSearch === "TODOS") setEstadoSearch("");
                            else setEstadoSearch(newSearch);
                          }}
                        >
                          <ComboboxInput
                            size="sm"
                            placeholder="Todos los estados"
                            showClear={estadoFilter !== "TODOS"}
                            showTrigger={true}
                            className="w-full"
                          />
                          <ComboboxContent className="min-w-[230px] z-[80]">
                            <ComboboxList>
                              <ComboboxGroup>
                                <ComboboxLabel>Filtrar por estado</ComboboxLabel>
                                {filteredEstadosForFilter.map((opt) => (
                                  <ComboboxItem
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-xs py-1.5 cursor-pointer"
                                  >
                                    {opt.label}
                                  </ComboboxItem>
                                ))}
                              </ComboboxGroup>
                              {filteredEstadosForFilter.length === 0 && (
                                <ComboboxEmpty>
                                  No se encontraron estados.
                                </ComboboxEmpty>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </div>

                    <div className="flex items-center justify-end shrink-0">
                      <ViewModeToggle value={viewMode} onChange={setViewMode} />
                    </div>
                  </div>

                  {/* Badges / Píldoras de Filtros Activos (UI Kit) */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                      <span className="text-xs font-semibold text-muted-foreground mr-1">
                        Filtros activos:
                      </span>

                      {searchTerm.trim() !== "" && (
                        <Badge
                          tone="neutral"
                          appearance="soft"
                          className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                                Búsqueda: &ldquo;{searchTerm}&rdquo;
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-xs max-w-xs z-[100]"
                            >
                              Búsqueda: &ldquo;{searchTerm}&rdquo;
                            </TooltipContent>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm("");
                              setCurrentPage(1);
                            }}
                            className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                            aria-label="Eliminar filtro de búsqueda"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      )}

                      {filterInstitucion !== "TODOS" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                                Institución: {filterInstitucion}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-xs max-w-xs z-[100]"
                            >
                              Institución: {filterInstitucion}
                            </TooltipContent>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => handleSetFilterInstitucion("TODOS")}
                            className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                            aria-label="Eliminar filtro de institución"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      )}

                      {filterFuente !== "TODOS" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                                Fuente: {filterFuente}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-xs max-w-xs z-[100]"
                            >
                              Fuente: {filterFuente}
                            </TooltipContent>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => handleSetFilterFuente("TODOS")}
                            className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                            aria-label="Eliminar filtro de fuente"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      )}

                      {estadoFilter !== "TODOS" && (
                        <Badge
                          tone="primary"
                          appearance="soft"
                          className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                                Estado: {getEstadoFilterLabel(estadoFilter)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="text-xs max-w-xs z-[100]"
                            >
                              Estado: {getEstadoFilterLabel(estadoFilter)}
                            </TooltipContent>
                          </Tooltip>
                          <button
                            type="button"
                            onClick={() => handleSetEstadoFilter("TODOS")}
                            className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                            aria-label="Eliminar filtro de estado"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tabla de Contratos (Desktop md+) */}
                <div
                  className={cn(
                    "w-full",
                    viewMode === "table" ? "hidden md:block" : "hidden"
                  )}
                >
                  <Table
                    className="w-full min-w-[1320px]"
                    containerClassName="overflow-x-auto w-full"
                  >
                    <TableHeader>
                      <TableRow className="border-0">
                        <TableHead className="w-[165px] min-w-[155px] whitespace-nowrap text-left pl-6">
                          CONTRATO / SOLICITUD
                        </TableHead>
                        <TableHead className="w-[260px] min-w-[240px] whitespace-nowrap text-left">
                          INSTITUCIÓN / COORDINADOR
                        </TableHead>
                        <TableHead className="w-[240px] min-w-[220px] whitespace-nowrap text-left">
                          FUENTE / PROYECTO
                        </TableHead>
                        <TableHead className="w-[155px] min-w-[145px] whitespace-nowrap text-left">
                          CUPO CONTRATADO
                        </TableHead>
                        <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left">
                          ESTADO
                        </TableHead>
                        <TableHead className="w-[110px] min-w-[100px] whitespace-nowrap text-left">
                          FIRMAS
                        </TableHead>
                        <TableHead className="w-[130px] min-w-[120px] whitespace-nowrap text-left">
                          VERSIÓN / FECHA
                        </TableHead>
                        <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-right pr-6">
                          ACCIONES
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileSignature className="size-8 stroke-[1.5] text-muted-foreground/60" />
                              <p className="text-sm font-semibold text-foreground">
                                No se encontraron contratos privados
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Ajusta los filtros de búsqueda o limpia los criterios activos.
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
                          const cupo =
                            contrato?.cantidadContratada ||
                            s.cupoAprobado ||
                            s.cupo ||
                            50000;

                          return (
                            <TableRow
                              key={s.id}
                              className="transition-colors hover:bg-muted/40"
                            >
                              {/* 1. Contrato / Solicitud */}
                              <TableCell className="w-[165px] min-w-[155px] text-left align-middle pl-6">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-xs font-bold text-foreground block">
                                    {numeroContrato}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-mono block">
                                    {s.id}
                                  </span>
                                </div>
                              </TableCell>

                              {/* 2. Institución / Coordinador */}
                              <TableCell className="w-[260px] min-w-[240px] text-left align-middle">
                                <div className="space-y-1 min-w-0 pr-3">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenExpediente(s)}
                                        className="text-xs font-bold text-foreground hover:text-primary transition-colors block text-left truncate cursor-pointer max-w-full"
                                      >
                                        {s.institucion}
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {s.institucion} (clic para ver expediente contractual)
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-[11px] text-muted-foreground block truncate">
                                        {s.coordinador}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      Coordinador SINARP: {s.coordinador}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>

                              {/* 3. Fuente / Proyecto */}
                              <TableCell className="w-[240px] min-w-[220px] text-left align-middle">
                                <div className="space-y-0.5 min-w-0 pr-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-xs text-foreground font-medium block truncate cursor-help">
                                        {s.fuentePrincipal}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {s.fuentePrincipal}
                                    </TooltipContent>
                                  </Tooltip>
                                  <span className="text-[10px] text-muted-foreground block truncate">
                                    {s.proyectoNombre || "Proyecto Institucional"}
                                  </span>
                                </div>
                              </TableCell>

                              {/* 4. Cupo Contratado */}
                              <TableCell className="w-[155px] min-w-[145px] text-left align-middle">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-xs font-bold text-primary block">
                                    {cupo.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground block">
                                    consultas / año
                                  </span>
                                </div>
                              </TableCell>

                              {/* 5. Estado */}
                              <TableCell className="w-[150px] min-w-[140px] text-left align-middle">
                                <div className="inline-flex items-center justify-start">
                                  {getEstadoBadge(estadoContrato)}
                                </div>
                              </TableCell>

                              {/* 6. Firmas (Indicadores circulares con Tooltip igual que Seguridad en Cuentas Internas) */}
                              <TableCell className="w-[110px] min-w-[100px] text-left align-middle">
                                <div className="inline-flex items-center gap-1.5 justify-start">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "size-6 rounded-full flex items-center justify-center text-[10px] shrink-0 border transition-colors",
                                          firmaCoord
                                            ? "bg-success/15 text-success border-success/30"
                                            : "bg-warning/15 text-warning border-warning/30"
                                        )}
                                      >
                                        <UserCheck className="size-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {firmaCoord
                                        ? `1.ª Firma Coordinador SINARP: Firmado (${contrato?.fechaFirmaCoordinador || ""})`
                                        : "1.ª Firma Coordinador SINARP: Pendiente"}
                                    </TooltipContent>
                                  </Tooltip>

                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          "size-6 rounded-full flex items-center justify-center text-[10px] shrink-0 border transition-colors",
                                          firmaMax
                                            ? "bg-success/15 text-success border-success/30"
                                            : "bg-warning/15 text-warning border-warning/30"
                                        )}
                                      >
                                        <ShieldCheck className="size-3.5" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      {firmaMax
                                        ? `2.ª Firma Máxima Autoridad DINARP: Firmado (${contrato?.fechaFirmaMaximaAutoridad || ""})`
                                        : "2.ª Firma Máxima Autoridad DINARP: Pendiente"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>

                              {/* 7. Versión / Fecha */}
                              <TableCell className="w-[130px] min-w-[120px] text-left align-middle whitespace-nowrap">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="text-[11px] font-mono text-muted-foreground inline-flex flex-col items-start text-left cursor-help">
                                      <span className="text-foreground font-semibold">
                                        v{contrato?.version || 1}.0
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {s.fecha}
                                      </span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    Plantilla:{" "}
                                    {contrato?.plantillaVersion ||
                                      "PAR-02-VIGENTE-2026.1"}
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>

                              {/* 8. Acciones */}
                              <TableCell className="w-[140px] min-w-[130px] pr-6 text-right align-middle">
                                {renderAccionesContrato(s, false)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Cards con Tarjeta Interactiva del UI Kit */}
                <div
                  className={cn(
                    "w-full",
                    viewMode === "cards"
                      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                      : "block md:hidden space-y-3.5"
                  )}
                >
                  {paginatedItems.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                      <FileSignature className="size-8 stroke-[1.5] text-muted-foreground/60" />
                      <p className="text-sm font-semibold text-foreground">
                        No se encontraron contratos privados
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ajusta los filtros de búsqueda o limpia los criterios activos.
                      </p>
                    </div>
                  ) : (
                    paginatedItems.map((s) => renderContratoCard(s))
                  )}
                </div>
              </TooltipProvider>

              {/* Paginación Oficial del UI Kit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
                <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
                  <p className="text-xs text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {filtered.length === 0
                        ? 0
                        : (currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * pageSize, filtered.length)}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold text-foreground">
                      {filtered.length}
                    </span>{" "}
                    contratos privados
                  </p>

                  {/* Selector de filas por página: 5, 10, 15 */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Filas:</span>
                    <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                      {[5, 10, 15].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            setPageSize(size);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all cursor-pointer",
                            pageSize === size
                              ? "bg-surface text-primary shadow-2xs font-bold border border-border/80"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="order-1 sm:order-2">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationFirst
                          onClick={() => setCurrentPage(1)}
                          className={cn(
                            currentPage === 1 &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          className={cn(
                            currentPage === 1 &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }).map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                isActive={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className={cn(
                            currentPage === totalPages &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLast
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn(
                            currentPage === totalPages &&
                              "pointer-events-none opacity-50 cursor-not-allowed"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
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
                <code className="font-mono text-primary">contrato_inicial</code>{" "}
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

          <DialogFooter stacked>
            <Button
              variant="neutral"
              className="w-full"
              onClick={() => setModalGenerar(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleGenerarSubmit}
            >
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

          <DialogFooter stacked>
            <Button
              variant="neutral"
              className="w-full"
              onClick={() => setModalEditar(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleEditarSubmit}
            >
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

          <DialogFooter stacked>
            <Button
              variant="neutral"
              className="w-full"
              onClick={() => setModalEnviarFirmas(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleEnviarFirmasSubmit}
            >
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

          <DialogFooter stacked>
            <Button
              variant="neutral"
              className="w-full"
              onClick={() => setModalFirmar(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleFirmarSubmit}
            >
              Estampar firma electrónica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
