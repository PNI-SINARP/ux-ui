"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InteractiveCard } from "@/components/ui/data-display";
import { ViewModeToggle, type ViewMode } from "@/components/shared/view-mode-toggle";
import { cn } from "@/lib/utils";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PublicarFuenteDialog } from "../components/publicar-fuente-dialog";
import { FuenteFormDialog } from "../components/fuente-form-dialog";
import { PrepararNuevaVersionDialog } from "../components/preparar-nueva-version-dialog";
import { SolicitarBajaDialog } from "../components/solicitar-baja-dialog";
import { ConfigurarConexionDialog } from "../components/configurar-conexion-dialog";
import { DefinirEsquemaDialog } from "../components/definir-esquema-dialog";
import { useFuentesStore } from "../data/fuentes-store";
import {
  EstadoFuente,
  FuenteDatos,
  EvidenciaPruebaConexion,
  TipoDatoCanonico,
  ReglaConversion,
} from "../data/fuentes-data";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  Server,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Globe,
  FileEdit,
  ArrowRight,
  RotateCcw,
  RotateCw,
  ExternalLink,
  Layers,
  Building2,
  Cpu,
  MoreHorizontal,
  Rocket,
  Wrench,
  XCircle,
  X,
  Plug,
  GitFork,
  AlertOctagon,
  Network,
  Eye,
} from "lucide-react";

interface FuentesInboxViewProps {
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    roleTitle?: string;
    institution?: string;
    cedula?: string;
  };
  openNuevaOnInit?: boolean;
}

export function FuentesInboxView({ currentUser, openNuevaOnInit = false }: FuentesInboxViewProps) {
  const router = useRouter();
  const { fuentes, isLoaded, restablecerDatosDemo, crearFuente, actualizarFuente } = useFuentesStore();
  const { activeUser } = useAuthStore();
  const effectiveUser = currentUser || activeUser;
  const roleTitle = (effectiveUser?.roleTitle || "").toLowerCase();
  const roleName = (effectiveUser?.role || "").toLowerCase();
  const isCoordinadorConsumidor =
    roleTitle.includes("consumidor") ||
    roleTitle.includes("requirente") ||
    roleName.includes("consumidor") ||
    effectiveUser?.cedula === "1712345678";

  const userRole = (effectiveUser?.role || "").toUpperCase();
  const esRolProveedorOAdmin =
    !effectiveUser ||
    !effectiveUser.role ||
    isCoordinadorConsumidor ||
    userRole === "COORDINADOR_SINARP" ||
    userRole === "ADMIN" ||
    userRole.includes("COORDINADOR") ||
    userRole.includes("PROVEEDOR");

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("ALL");
  const [estadoSearch, setEstadoSearch] = useState("");
  const [modalidadFilter, setModalidadFilter] = useState<string>("TODOS");
  const [modalidadSearch, setModalidadSearch] = useState("");
  const [fuenteAPublicar, setFuenteAPublicar] = useState<FuenteDatos | null>(null);
  const [fuenteAConectar, setFuenteAConectar] = useState<FuenteDatos | null>(null);
  const [fuenteAEsquema, setFuenteAEsquema] = useState<FuenteDatos | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(openNuevaOnInit);
  const [fuenteAEditar, setFuenteAEditar] = useState<FuenteDatos | null>(null);
  const [initialStepForModal, setInitialStepForModal] = useState<number>(0);
  const [fuenteParaNuevaVersion, setFuenteParaNuevaVersion] = useState<FuenteDatos | null>(null);
  const [isNuevaVersionModalOpen, setIsNuevaVersionModalOpen] = useState(false);
  const [fuenteParaBaja, setFuenteParaBaja] = useState<FuenteDatos | null>(null);
  const [isBajaModalOpen, setIsBajaModalOpen] = useState(false);

  const ESTADOS_FUENTES_OPCIONES = [
    { value: "ALL", label: "Todos los estados" },
    { value: "PREPARACION", label: "En preparación (Borrador / Conexión)" },
    { value: "BORRADOR", label: "Borrador" },
    { value: "CONEXION_PENDIENTE", label: "Conexión pendiente" },
    { value: "PENDIENTE_HOMOLOGACION", label: "Pendiente de homologación" },
    { value: "ESQUEMA_PENDIENTE_CORRECCION", label: "Esquema pendiente de corrección" },
    { value: "EN_REVISION", label: "En revisión (Gestión)" },
    { value: "DEVUELTA", label: "Devuelta con observaciones" },
    { value: "APROBADA", label: "Aprobada para publicación" },
    { value: "PUBLICADA", label: "Publicada en catálogo" },
  ];

  const MODALIDADES_OPCIONES = [
    { value: "TODOS", label: "Todas las modalidades" },
    { value: "API Individual", label: "API Individual" },
    { value: "Lote Masivo", label: "Lote Masivo" },
    { value: "Individual / Masivo", label: "Ambas (Individual / Masivo)" },
  ];

  const institucionActual =
    currentUser?.institution || "Dirección General de Registro Civil";

  // Filtro de fuentes
  const fuentesFiltradas = useMemo(() => {
    return fuentes.filter((f) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.nombre.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.institucion_proveedora_nombre.toLowerCase().includes(q) ||
        f.conexion.tipo_conector.toLowerCase().includes(q);

      const matchesEstado =
        estadoFilter === "ALL"
          ? true
          : estadoFilter === "PREPARACION"
          ? [
              "BORRADOR",
              "CONEXION_PENDIENTE",
              "PENDIENTE_HOMOLOGACION",
              "ESQUEMA_PENDIENTE_CORRECCION",
              "CONFIGURACION",
            ].includes(f.estado)
          : f.estado === estadoFilter;

      const matchesModalidad =
        modalidadFilter === "TODOS"
          ? true
          : f.modalidades_soportadas.toLowerCase().includes(modalidadFilter.toLowerCase());

      return matchesSearch && matchesEstado && matchesModalidad;
    });
  }, [fuentes, searchTerm, estadoFilter, modalidadFilter]);

  const filteredEstadosForFilter = useMemo(() => {
    if (!estadoSearch.trim()) return ESTADOS_FUENTES_OPCIONES;
    return ESTADOS_FUENTES_OPCIONES.filter((e) =>
      e.label.toLowerCase().includes(estadoSearch.toLowerCase())
    );
  }, [estadoSearch]);

  const filteredModalidadesForFilter = useMemo(() => {
    if (!modalidadSearch.trim()) return MODALIDADES_OPCIONES;
    return MODALIDADES_OPCIONES.filter((m) =>
      m.label.toLowerCase().includes(modalidadSearch.toLowerCase())
    );
  }, [modalidadSearch]);

  const hasActiveFilters =
    searchTerm.trim() !== "" || estadoFilter !== "ALL" || modalidadFilter !== "TODOS";

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setEstadoFilter("ALL");
    setEstadoSearch("");
    setModalidadFilter("TODOS");
    setModalidadSearch("");
    setCurrentPage(1);
  };

  // Paginación UI Kit
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, estadoFilter, modalidadFilter]);

  const totalPages = Math.ceil(fuentesFiltradas.length / pageSize) || 1;
  const paginatedFuentes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return fuentesFiltradas.slice(start, start + pageSize);
  }, [fuentesFiltradas, currentPage, pageSize]);

  // Métricas de estado
  const stats = useMemo(() => {
    return {
      total: fuentes.length,
      pendientesPrep: fuentes.filter((f) =>
        [
          "BORRADOR",
          "CONEXION_PENDIENTE",
          "PENDIENTE_HOMOLOGACION",
          "ESQUEMA_PENDIENTE_CORRECCION",
          "CONFIGURACION",
        ].includes(f.estado)
      ).length,
      enRevision: fuentes.filter((f) => f.estado === "EN_REVISION").length,
      devueltas: fuentes.filter((f) => f.estado === "DEVUELTA").length,
      aprobadas: fuentes.filter((f) =>
        ["APROBADA", "PUBLICACION_PENDIENTE"].includes(f.estado)
      ).length,
      publicadas: fuentes.filter((f) => f.estado === "PUBLICADA").length,
    };
  }, [fuentes]);

  const getEstadoBadge = (estado: EstadoFuente) => {
    switch (estado) {
      case "BORRADOR":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <FileEdit className="size-3 mr-1" />
            Borrador
          </Badge>
        );
      case "CONEXION_PENDIENTE":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Wrench className="size-3 mr-1" />
            Conexión pendiente
          </Badge>
        );
      case "PENDIENTE_HOMOLOGACION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Cpu className="size-3 mr-1" />
            Pendiente de homologación
          </Badge>
        );
      case "ESQUEMA_PENDIENTE_CORRECCION":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <AlertTriangle className="size-3 mr-1" />
            Esquema a corregir
          </Badge>
        );
      case "CONFIGURACION":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="whitespace-nowrap font-medium">
            <Clock className="size-3 mr-1" />
            Configuración
          </Badge>
        );
      case "EN_REVISION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <Clock className="size-3 mr-1 animate-pulse" />
            En revisión
          </Badge>
        );
      case "DEVUELTA":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <AlertTriangle className="size-3 mr-1" />
            Devuelta con observaciones
          </Badge>
        );
      case "APROBADA":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="whitespace-nowrap font-semibold">
            <CheckCircle2 className="size-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "PUBLICACION_PENDIENTE":
        return (
          <Badge tone="warning" appearance="solid" size="sm" className="whitespace-nowrap font-semibold">
            <AlertTriangle className="size-3 mr-1" />
            Publicación pendiente
          </Badge>
        );
      case "PUBLICADA":
        return (
          <Badge tone="success" appearance="solid" size="sm" className="whitespace-nowrap font-semibold">
            <Globe className="size-3 mr-1" />
            Publicada
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            {estado}
          </Badge>
        );
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleDateString("es-EC", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  };

  const isResponsableAutorizado = (fuente: FuenteDatos) => {
    if (!currentUser) return true;
    const userRole = (currentUser.role || "").toLowerCase();
    const userName = (currentUser.name || "").toLowerCase();
    const esCoordinador = userRole.includes("coordinador") || userRole.includes("proveedor");
    const esMismaInstitucion =
      !currentUser.institution ||
      currentUser.institution.toLowerCase() === fuente.institucion_proveedora_nombre.toLowerCase() ||
      currentUser.institution.toLowerCase().includes("dinarp");
    const esCreador =
      fuente.id_coordinador_registrador === currentUser.name ||
      fuente.coordinador_nombre.toLowerCase() === userName;

    return esCoordinador && (esMismaInstitucion || esCreador);
  };

  const handleReintentarPruebaConexion = (fuente: FuenteDatos) => {
    toast.loading(`Reintentando prueba técnica de conexión...`, { id: `retry-${fuente.id}` });
    setTimeout(() => {
      const updatedPrueba: EvidenciaPruebaConexion = {
        id_prueba: `PRB-${Date.now().toString().slice(-4)}`,
        instante_prueba: new Date().toISOString(),
        latencia_ms: Math.floor(Math.random() * 35) + 20,
        resultado: "Satisfactoria",
        huella_muestra: "sha256:" + Math.random().toString(16).slice(2, 10),
        version_conector: fuente.conexion.tipo_conector,
        etapas: [
          { etapa: "Túnel VPN DINARP", estado: "ok", detalle: "Host y puerto verificados." },
          { etapa: "Autenticación de credenciales", estado: "ok", detalle: "Credenciales válidas." },
          { etapa: "Permisos sobre esquema", estado: "ok", detalle: "Acceso de lectura verificado." },
        ],
      };

      actualizarFuente(
        fuente.id,
        {
          conexion: { ...fuente.conexion, ultima_prueba: updatedPrueba },
          estado: "BORRADOR",
        },
        {
          actor: currentUser?.name || fuente.coordinador_nombre,
          rol: "Coordinador SINARP",
          accion: "Reintento de prueba de conectividad",
          observaciones: "Prueba de conectividad técnica superada satisfactoriamente.",
        }
      );
      toast.success("Prueba de conectividad superada con éxito. Conexión verificada.", { id: `retry-${fuente.id}` });
    }, 900);
  };

  const handleVolverAProbarEsquema = (fuente: FuenteDatos) => {
    toast.loading(`Validando esquema y compatibilidad de tipos...`, { id: `schema-${fuente.id}` });
    setTimeout(() => {
      const camposCorregidos = fuente.campos.map((c) => {
        if (c.tipo_normalizado === "Entero" && c.tipo_origen_canonico === "Fecha") {
          return {
            ...c,
            tipo_normalizado: "Fecha" as TipoDatoCanonico,
            regla_conversion: "TextoAFechaISO" as ReglaConversion,
          };
        }
        return c;
      });

      actualizarFuente(
        fuente.id,
        {
          campos: camposCorregidos,
          estado: "BORRADOR",
        },
        {
          actor: currentUser?.name || fuente.coordinador_nombre,
          rol: "Coordinador SINARP",
          accion: "Validación de esquema y reglas",
          observaciones: "Esquema y reglas de conversión normalizadas sin conflictos técnicos.",
        }
      );
      toast.success("Esquema de datos validado sin errores técnicos.", { id: `schema-${fuente.id}` });
    }, 900);
  };

  const handleContinuarNuevaVersion = (
    fuenteClonada: FuenteDatos,
    nuevaVersion: string,
    tipoCambio: "MAJOR" | "MINOR" | "PATCH",
    justificacion: string
  ) => {
    const nueva = crearFuente({
      nombre: fuenteClonada.nombre,
      descripcion_fuente: fuenteClonada.descripcion_fuente,
      version_propuesta: nuevaVersion,
      id_institucion_proveedora: fuenteClonada.id_institucion_proveedora,
      institucion_proveedora_nombre: fuenteClonada.institucion_proveedora_nombre,
      id_coordinador_registrador: currentUser?.name || fuenteClonada.id_coordinador_registrador,
      coordinador_nombre: currentUser?.name || fuenteClonada.coordinador_nombre,
      disponibilidad_objetivo: fuenteClonada.sla_fuente.disponibilidad_objetivo,
      tiempo_maximo_respuesta_ms: fuenteClonada.sla_fuente.tiempo_maximo_respuesta_ms,
      modalidades_soportadas: fuenteClonada.modalidades_soportadas,
      formato_respuesta: fuenteClonada.formato_respuesta,
      tipo_dato_pruebas: fuenteClonada.tipo_dato_pruebas,
      parametros_consulta: fuenteClonada.parametros_consulta,
      conexion: fuenteClonada.conexion,
      campos: fuenteClonada.campos,
      enviarInmediato: false,
    });

    setFuenteAEditar(nueva);
    setInitialStepForModal(0);
    setIsFormModalOpen(true);
    toast.info(`Borrador de nueva versión ${nuevaVersion} (${tipoCambio}) generado.`);
  };

  const handleBajaSolicitada = (fuenteId: string, motivo: string) => {
    actualizarFuente(
      fuenteId,
      {},
      {
        actor: currentUser?.name || "Coordinador Autorizado",
        rol: "Coordinador SINARP",
        accion: "Solicitud formal de baja de fuente",
        observaciones: `Solicitud de baja registrada por motivo: ${motivo}. Período de notificación de 30 días activado.`,
      }
    );
    toast.success("Solicitud de baja tramitada ante Gestión.");
    setIsBajaModalOpen(false);
    setFuenteParaBaja(null);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="fuentes-proveedor"
      currentUser={effectiveUser || undefined}
      breadcrumbs={[
        {
          label: isCoordinadorConsumidor ? "Entidad Requirente" : "Entidad Emisora",
          href: "/proveedor/fuentes",
        },
        {
          label: isCoordinadorConsumidor ? "Borradores de Fuentes" : "Mis fuentes de datos",
          href: "/proveedor/fuentes",
        },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {!esRolProveedorOAdmin ? (
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0 items-center justify-center p-8 text-center space-y-4"
          >
            <Server className="size-12 text-warning mx-auto" />
            <h3 className="font-heading font-bold text-lg text-foreground">
              Acceso exclusivo para Coordinadores Proveedores
            </h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Esta pantalla está reservada para que las instituciones proveedoras registren y configuren sus fuentes de datos. Las acciones de revisión corresponden al Área de Gestión y la administración técnica al Equipo de TI.
            </p>
            <div className="flex items-center gap-2">
              <Link href="/gestion/fuentes">
                <Button variant="outline" size="sm">
                  Ir a Revisión de fuentes
                </Button>
              </Link>
              <Link href="/tecnologia/conectores">
                <Button variant="primary" size="sm">
                  Ir a Gestión de conectores
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card
            className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
            innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
          >
            {/* Header del Módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Server className="size-6 text-primary shrink-0" />
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                    Mis fuentes de datos
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Registra, configura técnicamente, ejecuta pruebas de conectividad y publica las fuentes de datos de tu institución para interoperabilidad nacional.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isCoordinadorConsumidor && (
                  <Button
                    asChild
                    variant="neutral"
                    size="sm"
                    className="text-xs gap-1.5 h-9 cursor-pointer"
                  >
                    <Link href="/acceso-interoperabilidad/solicitudes">
                      <Network className="size-4" />
                      <span>Solicitudes de acceso</span>
                    </Link>
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setFuenteAEditar(null);
                    setInitialStepForModal(0);
                    setIsFormModalOpen(true);
                  }}
                  className="text-xs gap-2 shadow-xs h-9 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>{isCoordinadorConsumidor ? "Crear borrador de fuente" : "Nueva fuente"}</span>
                </Button>
              </div>
            </div>

          {/* Cards de Resumen Interactivas (Estilo Cuentas Internas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 w-full">
            {/* En Preparación */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "PREPARACION" ? "ALL" : "PREPARACION");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "PREPARACION" ? "ALL" : "PREPARACION");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PREPARACION"
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
                      estadoFilter === "PREPARACION"
                        ? "bg-info text-white shadow-xs"
                        : "bg-info/15 text-info group-hover:scale-105 group-hover:bg-info group-hover:text-white"
                    )}
                  >
                    <Layers className="size-5" />
                  </div>
                  <Badge
                    tone="info"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Configuración
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Preparación
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.pendientesPrep}
                  </p>
                </div>
              </div>
            </Card>

            {/* En Revisión */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "EN_REVISION" ? "ALL" : "EN_REVISION");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "EN_REVISION" ? "ALL" : "EN_REVISION");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "EN_REVISION"
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
                      estadoFilter === "EN_REVISION"
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
                    Gestión
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Revisión
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.enRevision}
                  </p>
                </div>
              </div>
            </Card>

            {/* Devueltas con Observaciones */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "DEVUELTA" ? "ALL" : "DEVUELTA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "DEVUELTA" ? "ALL" : "DEVUELTA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "DEVUELTA"
                  ? "bg-danger/15 border-danger ring-2 ring-danger/40 shadow-xs"
                  : "bg-danger/5 hover:bg-danger/10 border-danger/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "DEVUELTA"
                        ? "bg-danger text-white shadow-xs"
                        : "bg-danger/15 text-danger group-hover:scale-105 group-hover:bg-danger group-hover:text-white"
                    )}
                  >
                    <AlertTriangle className="size-5" />
                  </div>
                  <Badge
                    tone="danger"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    Observadas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Devueltas
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.devueltas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Aprobadas / Listas p/ Publicar */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "APROBADA" ? "ALL" : "APROBADA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "APROBADA" ? "ALL" : "APROBADA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "APROBADA"
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
                      estadoFilter === "APROBADA"
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
                    Listas
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Listas p/ Publicar
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.aprobadas}
                  </p>
                </div>
              </div>
            </Card>

            {/* Publicadas en Catálogo */}
            <Card
              variant="featured"
              role="button"
              tabIndex={0}
              onClick={() => {
                setEstadoFilter(estadoFilter === "PUBLICADA" ? "ALL" : "PUBLICADA");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEstadoFilter(estadoFilter === "PUBLICADA" ? "ALL" : "PUBLICADA");
                }
              }}
              className={cn(
                "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 w-full",
                "hover:-translate-y-0.5 hover:shadow-md",
                estadoFilter === "PUBLICADA"
                  ? "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs"
                  : "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
              )}
              innerClassName="p-0 h-full"
            >
              <div className="flex flex-col justify-between h-full gap-3 w-full">
                <div className="flex items-center justify-between gap-2 w-full">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                      estadoFilter === "PUBLICADA"
                        ? "bg-primary text-white shadow-xs"
                        : "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                    )}
                  >
                    <Globe className="size-5" />
                  </div>
                  <Badge
                    tone="primary"
                    appearance="soft"
                    size="sm"
                    className="shrink-0 text-[10px] font-bold px-2 py-0.5"
                  >
                    En Catálogo
                  </Badge>
                </div>
                <div className="text-left w-full space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    En Catálogo
                  </p>
                  <p className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground leading-none tracking-tight">
                    {stats.publicadas}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros y Búsqueda con UI Kit Oficial (Estilo Cuentas Internas) */}
          <div className="space-y-3 w-full">
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 w-full">
              {/* Buscador UI Kit */}
              <div className="flex-1 min-w-0">
                <Search
                  size="sm"
                  placeholder="Buscar por ID, nombre de fuente, conector o institución..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  className="w-full"
                />
              </div>

              {/* Filtros Combobox UI Kit + Selector de Vista */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full xl:w-auto shrink-0">
                {/* Filtro Estado */}
                <div className="w-full sm:flex-1 xl:w-[250px] min-w-0">
                  <Combobox
                    value={estadoFilter === "ALL" ? null : estadoFilter}
                    onValueChange={(val) => {
                      setEstadoFilter(val || "ALL");
                    }}
                    inputValue={estadoSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = ESTADOS_FUENTES_OPCIONES.find(
                        (e) =>
                          e.value.toLowerCase() === newSearch.toLowerCase() ||
                          e.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setEstadoSearch(opt.label);
                      else if (newSearch === "ALL") setEstadoSearch("");
                      else setEstadoSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todos los estados"
                      showClear={estadoFilter !== "ALL"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[270px] z-[80]">
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
                          <ComboboxEmpty>No se encontraron estados.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

                {/* Filtro Modalidad */}
                <div className="flex-1 xl:w-[210px] min-w-0">
                  <Combobox
                    value={modalidadFilter === "TODOS" ? null : modalidadFilter}
                    onValueChange={(val) => {
                      setModalidadFilter(val || "TODOS");
                    }}
                    inputValue={modalidadSearch}
                    onInputValueChange={(newSearch) => {
                      const opt = MODALIDADES_OPCIONES.find(
                        (m) =>
                          m.value.toLowerCase() === newSearch.toLowerCase() ||
                          m.label.toLowerCase() === newSearch.toLowerCase()
                      );
                      if (opt) setModalidadSearch(opt.label);
                      else if (newSearch === "TODOS") setModalidadSearch("");
                      else setModalidadSearch(newSearch);
                    }}
                  >
                    <ComboboxInput
                      size="sm"
                      placeholder="Todas las modalidades"
                      showClear={modalidadFilter !== "TODOS"}
                      showTrigger={true}
                      className="w-full"
                    />
                    <ComboboxContent className="min-w-[230px] z-[80]">
                      <ComboboxList>
                        <ComboboxGroup>
                          <ComboboxLabel>Filtrar por modalidad</ComboboxLabel>
                          {filteredModalidadesForFilter.map((opt) => (
                            <ComboboxItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs py-1.5 cursor-pointer"
                            >
                              {opt.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxGroup>
                        {filteredModalidadesForFilter.length === 0 && (
                          <ComboboxEmpty>No se encontraron modalidades.</ComboboxEmpty>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>

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
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Búsqueda: &ldquo;{searchTerm}&rdquo;
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de búsqueda"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {estadoFilter !== "ALL" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Estado: {ESTADOS_FUENTES_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Estado: {ESTADOS_FUENTES_OPCIONES.find((e) => e.value === estadoFilter)?.label || estadoFilter}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setEstadoFilter("ALL")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de estado"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                {modalidadFilter !== "TODOS" && (
                  <Badge
                    tone="primary"
                    appearance="soft"
                    className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300 border border-primary/25 max-w-full"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="max-w-[180px] sm:max-w-[260px] truncate cursor-help">
                          Modalidad: {modalidadFilter}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs max-w-xs z-[100]">
                        Modalidad: {modalidadFilter}
                      </TooltipContent>
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setModalidadFilter("TODOS")}
                      className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                      aria-label="Eliminar filtro de modalidad"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFilters}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2.5 rounded-full"
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Tabla UI Kit con encabezados blancos, sin contenedor envolvente y solo iconos en acciones */}
          <div className={cn("w-full", viewMode === "table" ? "hidden md:block" : "hidden")}>
            <Table className="w-full" containerClassName="overflow-x-auto w-full">
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="w-[110px] text-xs font-bold text-white pl-6">ID</TableHead>
                  <TableHead className="text-xs font-bold text-white">Fuente</TableHead>
                  <TableHead className="text-xs font-bold text-white">Institución Proveedora</TableHead>
                  <TableHead className="w-[85px] text-xs font-bold text-white text-center">Versión</TableHead>
                  <TableHead className="text-xs font-bold text-white">Modalidad</TableHead>
                  <TableHead className="text-xs font-bold text-white">Estado</TableHead>
                  <TableHead className="w-[110px] text-xs font-bold text-white">Actualización</TableHead>
                  <TableHead className="w-[120px] text-right text-xs font-bold text-white pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isLoaded ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-xs text-muted-foreground">
                      Cargando fuentes de información...
                    </TableCell>
                  </TableRow>
                ) : fuentesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center space-y-2">
                      <Server className="size-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-xs font-medium text-foreground">
                        No se encontraron fuentes de información
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Ajusta los filtros de búsqueda o registra una nueva fuente institucional.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedFuentes.map((fuente) => {
                    const isConexionFallida =
                      fuente.conexion?.ultima_prueba?.resultado === "Fallida";
                    const isConexionVerificada =
                      !isConexionFallida &&
                      fuente.conexion?.ultima_prueba?.resultado === "Satisfactoria" &&
                      (fuente.estado === "BORRADOR" || fuente.estado === "CONFIGURACION");
                    const isBorrador =
                      (fuente.estado === "BORRADOR" || fuente.estado === "CONEXION_PENDIENTE") &&
                      !isConexionFallida &&
                      !isConexionVerificada;
                    const isEsquemaPendiente = fuente.estado === "ESQUEMA_PENDIENTE_CORRECCION";
                    const isEnRevision = fuente.estado === "EN_REVISION";
                    const isDevuelta = fuente.estado === "DEVUELTA";
                    const isAprobada = fuente.estado === "APROBADA";
                    const isFallidaGateway = fuente.estado === "PUBLICACION_PENDIENTE";
                    const isHomologacion = fuente.estado === "PENDIENTE_HOMOLOGACION";
                    const isPublicada = fuente.estado === "PUBLICADA";
                    const responsableAutorizado = isResponsableAutorizado(fuente);

                    return (
                      <TableRow key={fuente.id} className="transition-colors hover:bg-muted/40">
                        <TableCell className="font-mono text-xs font-semibold text-primary pl-6">
                          <Link href={`/proveedor/fuentes/${fuente.id}`} className="hover:underline">
                            {fuente.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <Link href={`/proveedor/fuentes/${fuente.id}`} className="hover:underline">
                              <span className="text-xs font-bold text-foreground block hover:text-primary transition-colors">
                                {fuente.nombre}
                              </span>
                            </Link>
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              {fuente.descripcion_fuente}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {fuente.institucion_proveedora_nombre}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {fuente.version_propuesta}
                        </TableCell>
                        <TableCell>
                          <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                            {fuente.modalidades_soportadas}
                          </Badge>
                        </TableCell>
                        <TableCell>{getEstadoBadge(fuente.estado)}</TableCell>
                        <TableCell className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                          {formatDate(fuente.fecha_actualizacion || fuente.fecha_creacion)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="inline-flex items-center gap-1 justify-end">
                            {isCoordinadorConsumidor ? (
                              ["BORRADOR", "DEVUELTA", "CONFIGURACION"].includes(fuente.estado) ? (
                                <TooltipProvider delayDuration={100}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setFuenteAEditar(fuente);
                                          setInitialStepForModal(0);
                                          setIsFormModalOpen(true);
                                        }}
                                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label={`Editar borrador de ${fuente.nombre}`}
                                      >
                                        <FileEdit className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-01: Editar borrador de fuente</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-[11px] text-muted-foreground italic px-2">Solo lectura</span>
                              )
                            ) : (
                              <TooltipProvider delayDuration={100}>
                                {/* 1. Borrador (FUE-01/FUE-02): Configurar conexión */}
                                {isBorrador && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setFuenteAConectar(fuente);
                                        }}
                                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label={`Configurar conexión de ${fuente.nombre}`}
                                      >
                                        <Plug className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-02: Configurar y probar conexión</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 2. Conexión fallida (FUE-02): Corregir configuración y Reintentar prueba */}
                                {isConexionFallida && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => {
                                            setFuenteAConectar(fuente);
                                          }}
                                          className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                          aria-label={`Corregir configuración de ${fuente.nombre}`}
                                        >
                                          <Wrench className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">FUE-02: Corregir configuración de conexión</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => handleReintentarPruebaConexion(fuente)}
                                          className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                          aria-label={`Reintentar prueba de conexión de ${fuente.nombre}`}
                                        >
                                          <RotateCw className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">FUE-02: Reintentar prueba de conexión</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}

                                {/* 3. Conexión verificada (FUE-03): Definir esquema y campos */}
                                {isConexionVerificada && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setFuenteAEsquema(fuente);
                                        }}
                                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label={`Definir esquema y campos de ${fuente.nombre}`}
                                      >
                                        <Layers className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-03: Definir esquema y normalización</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 4. Esquema pendiente de corrección (FUE-03): Corregir esquema y Volver a probar */}
                                {isEsquemaPendiente && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => {
                                            setFuenteAEsquema(fuente);
                                          }}
                                          className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                          aria-label={`Corregir esquema de ${fuente.nombre}`}
                                        >
                                          <Layers className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">FUE-03: Corregir esquema y normalización</TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon-sm"
                                          onClick={() => handleVolverAProbarEsquema(fuente)}
                                          className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                          aria-label={`Volver a probar esquema de ${fuente.nombre}`}
                                        >
                                          <RotateCw className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">FUE-03: Volver a probar esquema</TooltipContent>
                                    </Tooltip>
                                  </>
                                )}

                                {/* 5. En revisión (FUE-04): Sin acciones interactivas para coordinador (revisión de Gestión) */}
                                {isEnRevision && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        disabled
                                        className="text-muted-foreground/60 cursor-not-allowed opacity-75"
                                        aria-label="En revisión por Gestión"
                                      >
                                        <Clock className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-04: En revisión por Dirección de Gestión</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 6. Devuelta con observaciones (FUE-04): Continuar corrección de borrador */}
                                {isDevuelta && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => {
                                          setFuenteAEditar(fuente);
                                          setInitialStepForModal(0);
                                          setIsFormModalOpen(true);
                                        }}
                                        className="text-danger hover:text-danger hover:bg-danger/10 cursor-pointer"
                                        aria-label={`Continuar corrección de ${fuente.nombre}`}
                                      >
                                        <FileEdit className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-04: Continuar corrección de borrador devuelto</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 7. Aprobada por Gestión (FUE-05): Publicar versión */}
                                {isAprobada && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setFuenteAPublicar(fuente)}
                                        className="text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                                        aria-label={`Publicar versión de ${fuente.nombre}`}
                                      >
                                        <Rocket className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-05: Publicar versión en API Gateway</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 8. Fallo de despliegue en Gateway Apigee: Reintentar despliegue */}
                                {isFallidaGateway && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setFuenteAPublicar(fuente)}
                                        className="text-warning hover:text-warning hover:bg-warning/10 cursor-pointer"
                                        aria-label={`Reintentar despliegue de ${fuente.nombre}`}
                                      >
                                        <RotateCcw className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-05: Reintentar despliegue en API Gateway</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 9. Pendiente de homologación técnica (FUE-12) */}
                                {isHomologacion && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        disabled
                                        className="text-warning/80 cursor-default opacity-85"
                                        aria-label={`En proceso de homologación técnica por TI: ${fuente.nombre}`}
                                      >
                                        <Cpu className="size-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">FUE-12: En proceso de homologación por TI</TooltipContent>
                                  </Tooltip>
                                )}

                                {/* 10. Publicada (FUE-06/FUE-08): Menú de tres puntos (···) */}
                                {isPublicada && (
                                  <DropdownMenu>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                                            aria-label={`Más opciones para ${fuente.nombre}`}
                                          >
                                            <MoreHorizontal className="size-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">Más opciones</TooltipContent>
                                    </Tooltip>
                                    <DropdownMenuContent align="end" className="w-56">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setFuenteParaNuevaVersion(fuente);
                                          setIsNuevaVersionModalOpen(true);
                                        }}
                                        className="cursor-pointer gap-2 text-xs"
                                      >
                                        <GitFork className="size-4 text-primary" />
                                        <span>FUE-06: Preparar nueva versión</span>
                                      </DropdownMenuItem>
                                      {responsableAutorizado && (
                                        <>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setFuenteParaBaja(fuente);
                                              setIsBajaModalOpen(true);
                                            }}
                                            className="cursor-pointer gap-2 text-xs text-danger focus:text-danger focus:bg-danger/10"
                                          >
                                            <AlertOctagon className="size-4 text-danger" />
                                            <span>FUE-08: Solicitar baja de fuente</span>
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TooltipProvider>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Vista de Tarjetas (Móvil o modo Tarjetas) */}
          <div
            className={cn(
              "w-full",
              viewMode === "cards"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "block md:hidden space-y-3.5"
            )}
          >
            {!isLoaded ? (
              <Card className="p-8 text-center col-span-full border border-border bg-surface text-xs text-muted-foreground">
                Cargando fuentes de información...
              </Card>
            ) : fuentesFiltradas.length === 0 ? (
              <Card className="p-8 text-center col-span-full border border-border bg-surface space-y-2">
                <Server className="size-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-medium text-foreground">
                  No se encontraron fuentes de información
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Ajusta los filtros de búsqueda o registra una nueva fuente institucional.
                </p>
              </Card>
            ) : (
              paginatedFuentes.map((fuente) => {
                const isConexionFallida =
                  fuente.conexion?.ultima_prueba?.resultado === "Fallida";
                const isConexionVerificada =
                  !isConexionFallida &&
                  fuente.conexion?.ultima_prueba?.resultado === "Satisfactoria" &&
                  (fuente.estado === "BORRADOR" || fuente.estado === "CONFIGURACION");
                const isBorrador =
                  (fuente.estado === "BORRADOR" || fuente.estado === "CONEXION_PENDIENTE") &&
                  !isConexionFallida &&
                  !isConexionVerificada;
                const isEsquemaPendiente = fuente.estado === "ESQUEMA_PENDIENTE_CORRECCION";
                const isEnRevision = fuente.estado === "EN_REVISION";
                const isDevuelta = fuente.estado === "DEVUELTA";
                const isAprobada = fuente.estado === "APROBADA";
                const isFallidaGateway = fuente.estado === "PUBLICACION_PENDIENTE";
                const isHomologacion = fuente.estado === "PENDIENTE_HOMOLOGACION";
                const isPublicada = fuente.estado === "PUBLICADA";
                const responsableAutorizado = isResponsableAutorizado(fuente);

                return (
                  <InteractiveCard
                    key={fuente.id}
                    as="div"
                    hideChevron
                    color="primary"
                    icon={<Server className="size-5" />}
                    title={fuente.nombre}
                    subtitle={`${fuente.id} · v${fuente.version_propuesta}`}
                    description={fuente.descripcion_fuente}
                    meta={
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getEstadoBadge(fuente.estado)}
                        <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                          {fuente.modalidades_soportadas}
                        </Badge>
                      </div>
                    }
                  >
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-2 gap-2.5 text-xs bg-muted/30 p-2.5 rounded-lg border border-border/60">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                            Institución Proveedora
                          </span>
                          <span className="font-semibold text-foreground mt-0.5 block truncate">
                            {fuente.institucion_proveedora_nombre}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                            Actualización
                          </span>
                          <span className="font-mono text-foreground mt-0.5 block">
                            {formatDate(fuente.fecha_actualizacion || fuente.fecha_creacion)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60 w-full flex flex-wrap items-center gap-2">
                        <Button
                          asChild
                          variant="neutral"
                          size="sm"
                          className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                        >
                          <Link href={`/proveedor/fuentes/${fuente.id}`}>
                            <Eye className="size-3.5" />
                            <span>Ver detalle</span>
                          </Link>
                        </Button>

                        {isCoordinadorConsumidor ? (
                          ["BORRADOR", "DEVUELTA", "CONFIGURACION"].includes(fuente.estado) ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setFuenteAEditar(fuente);
                                setInitialStepForModal(0);
                                setIsFormModalOpen(true);
                              }}
                              className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                              aria-label={`Editar borrador de ${fuente.nombre}`}
                            >
                              <FileEdit className="size-3.5" />
                              <span>Editar</span>
                            </Button>
                          ) : null
                        ) : (
                          <>
                            {isBorrador && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setFuenteAConectar(fuente)}
                                className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                aria-label={`Configurar conexión de ${fuente.nombre}`}
                              >
                                <Plug className="size-3.5" />
                                <span>Configurar conexión</span>
                              </Button>
                            )}

                            {isConexionFallida && (
                              <>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => setFuenteAConectar(fuente)}
                                  className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                  aria-label={`Corregir configuración de ${fuente.nombre}`}
                                >
                                  <Wrench className="size-3.5" />
                                  <span>Corregir</span>
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleReintentarPruebaConexion(fuente)}
                                  className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                  aria-label={`Reintentar prueba de conexión de ${fuente.nombre}`}
                                >
                                  <RotateCw className="size-3.5" />
                                  <span>Reintentar</span>
                                </Button>
                              </>
                            )}

                            {isConexionVerificada && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setFuenteAEsquema(fuente)}
                                className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                aria-label={`Definir esquema y campos de ${fuente.nombre}`}
                              >
                                <Layers className="size-3.5" />
                                <span>Definir esquema</span>
                              </Button>
                            )}

                            {isEsquemaPendiente && (
                              <>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={() => setFuenteAEsquema(fuente)}
                                  className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                  aria-label={`Corregir esquema de ${fuente.nombre}`}
                                >
                                  <Layers className="size-3.5" />
                                  <span>Corregir esquema</span>
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleVolverAProbarEsquema(fuente)}
                                  className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                  aria-label={`Volver a probar esquema de ${fuente.nombre}`}
                                >
                                  <RotateCw className="size-3.5" />
                                  <span>Probar esquema</span>
                                </Button>
                              </>
                            )}

                            {isDevuelta && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setFuenteAEditar(fuente);
                                  setInitialStepForModal(0);
                                  setIsFormModalOpen(true);
                                }}
                                className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                aria-label={`Continuar corrección de ${fuente.nombre}`}
                              >
                                <FileEdit className="size-3.5" />
                                <span>Corregir</span>
                              </Button>
                            )}

                            {isAprobada && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setFuenteAPublicar(fuente)}
                                className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                aria-label={`Publicar versión de ${fuente.nombre}`}
                              >
                                <Rocket className="size-3.5" />
                                <span>Publicar</span>
                              </Button>
                            )}

                            {isFallidaGateway && (
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => setFuenteAPublicar(fuente)}
                                className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                aria-label={`Reintentar despliegue de ${fuente.nombre}`}
                              >
                                <RotateCcw className="size-3.5" />
                                <span>Reintentar despliegue</span>
                              </Button>
                            )}

                            {isPublicada && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 text-xs font-semibold gap-1.5 h-9 justify-center cursor-pointer"
                                    aria-label={`Más opciones para ${fuente.nombre}`}
                                  >
                                    <MoreHorizontal className="size-3.5" />
                                    <span>Opciones</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setFuenteParaNuevaVersion(fuente);
                                      setIsNuevaVersionModalOpen(true);
                                    }}
                                    className="cursor-pointer gap-2 text-xs"
                                  >
                                    <GitFork className="size-4 text-primary" />
                                    <span>FUE-06: Preparar nueva versión</span>
                                  </DropdownMenuItem>
                                  {responsableAutorizado && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setFuenteParaBaja(fuente);
                                          setIsBajaModalOpen(true);
                                        }}
                                        className="cursor-pointer gap-2 text-xs text-danger focus:text-danger focus:bg-danger/10"
                                      >
                                        <AlertOctagon className="size-4 text-danger" />
                                        <span>FUE-08: Solicitar baja de fuente</span>
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </InteractiveCard>
                );
              })
            )}
          </div>

          {/* Paginación UI Kit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 w-full mt-4">
            <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
              <p className="text-xs text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {fuentesFiltradas.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, fuentesFiltradas.length)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{fuentesFiltradas.length}</span> fuentes
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
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed")}
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
                    if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast
                      onClick={() => setCurrentPage(totalPages)}
                      className={cn(currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed")}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </Card>
        )}
      </main>

      {/* Dialog de Publicación (FUE-05) */}
      <PublicarFuenteDialog
        fuente={fuenteAPublicar}
        open={!!fuenteAPublicar}
        onOpenChange={(open) => {
          if (!open) setFuenteAPublicar(null);
        }}
        onPublicada={() => {
          setFuenteAPublicar(null);
        }}
      />

      {/* Dialog de Configurar y Probar Conexión (FUE-02) */}
      <ConfigurarConexionDialog
        fuente={fuenteAConectar}
        open={!!fuenteAConectar}
        onOpenChange={(open) => {
          if (!open) setFuenteAConectar(null);
        }}
        onGuardado={() => {
          setFuenteAConectar(null);
        }}
        onProcederAEsquema={(fuenteActualizada) => {
          setFuenteAConectar(null);
          setFuenteAEsquema(fuenteActualizada);
        }}
      />

      {/* Dialog de Definir Esquema y Normalización (FUE-03) */}
      <DefinirEsquemaDialog
        fuente={fuenteAEsquema}
        open={!!fuenteAEsquema}
        onOpenChange={(open) => {
          if (!open) setFuenteAEsquema(null);
        }}
        onGuardado={() => {
          setFuenteAEsquema(null);
        }}
        onEnviarARevision={() => {
          setFuenteAEsquema(null);
        }}
      />

      {/* Dialog de Creación y Edición de Fuente (Modal FUE-01/02/03) */}
      <FuenteFormDialog
        open={isFormModalOpen}
        onOpenChange={(open) => {
          setIsFormModalOpen(open);
          if (!open) {
            setFuenteAEditar(null);
            setInitialStepForModal(0);
          }
        }}
        fuenteAEditar={fuenteAEditar}
        initialStep={initialStepForModal}
        currentUser={
          effectiveUser
            ? {
                name: effectiveUser.name,
                role: effectiveUser.roleTitle || effectiveUser.role,
                institution: effectiveUser.institution,
              }
            : currentUser
        }
        onSuccess={() => {
          setIsFormModalOpen(false);
          setFuenteAEditar(null);
          setInitialStepForModal(0);
        }}
      />

      {/* Dialog Preparar Nueva Versión (FUE-06/FUE-07) */}
      <PrepararNuevaVersionDialog
        open={isNuevaVersionModalOpen}
        onOpenChange={(open) => {
          setIsNuevaVersionModalOpen(open);
          if (!open) setFuenteParaNuevaVersion(null);
        }}
        fuente={fuenteParaNuevaVersion}
        onContinuarConfiguracion={handleContinuarNuevaVersion}
      />

      {/* Dialog Solicitar Baja de Fuente (FUE-08) */}
      <SolicitarBajaDialog
        open={isBajaModalOpen}
        onOpenChange={(open) => {
          setIsBajaModalOpen(open);
          if (!open) setFuenteParaBaja(null);
        }}
        fuente={fuenteParaBaja}
        onBajaSolicitada={handleBajaSolicitada}
      />
    </WireframeDashboardLayout>
  );
}
