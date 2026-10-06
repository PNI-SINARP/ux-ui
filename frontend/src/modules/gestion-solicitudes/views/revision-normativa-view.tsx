"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  User,
  ArrowUpDown,
  Search as SearchIcon,
  AlertTriangle,
  Info,
  ArrowLeft,
  FileText,
  SlidersHorizontal,
  Download,
  Check,
  Calendar,
  Mail,
  CreditCard,
  FileCheck2,
  X,
  FileSignature,
  FileSpreadsheet,
  AlertCircle,
  UserPlus,
  UserCheck,
  Activity,
  ChevronRight,
  History,
  RotateCcw,
  Lock,
  MapPin,
  Phone,
  Smartphone } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Card, CardTitle, CardDescription, CardBadge, CardDecorativeIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxItem,
  ComboboxEmpty } from
"@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator } from
"@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell } from
"@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent } from
"@/components/ui/tabs";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis } from
"@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
"@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  puedeReasignarSolicitud,
  type SolicitudIngreso,
  type EstadoSolicitudIngreso,
  type TipoTramiteIngreso } from
"@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { AprobarSolicitudDialog } from "@/components/shared/solicitudes/aprobar-solicitud-dialog";
import { RechazarSolicitudDialog } from "@/components/shared/solicitudes/rechazar-solicitud-dialog";
import { AsignarRevisorDialog } from "@/components/shared/solicitudes/asignar-revisor-dialog";
import { Enr03SimulacionPanel } from "@/components/shared/solicitudes/enr03-simulacion-panel";
import { buildTramiteTimelineItems } from "@/components/shared/solicitudes/tramite-timeline-helper";

interface FilterComboboxProps {
  label?: string;
  placeholder?: string;
  options: {value: string;label: string;}[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
  groupLabel?: string;
}

function FilterCombobox({
  label,
  placeholder = "Selecciona...",
  options,
  value,
  onChange,
  className,
  groupLabel
}: FilterComboboxProps) {
  const selectedOption = useMemo(() => {
    return options.find((o) => o.value === value) || null;
  }, [options, value]);

  const [search, setSearch] = useState(selectedOption ? selectedOption.label : "");

  React.useEffect(() => {
    const opt = options.find((o) => o.value === value);
    setSearch(opt ? opt.label : "");
  }, [value, options]);

  const filteredOptions = useMemo(() => {
    if (!search || selectedOption && search === selectedOption.label) {
      return options;
    }
    return options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search, selectedOption]);

  const handleValueChange = (val: string | null) => {
    if (val) {
      const opt = options.find((o) => o.value === val);
      onChange(val);
      if (opt) setSearch(opt.label);
    } else {
      const defaultOpt = options[0];
      onChange(defaultOpt ? defaultOpt.value : "");
      setSearch(defaultOpt ? defaultOpt.label : "");
    }
  };

  const handleInputValueChange = (newSearch: string) => {
    const opt = options.find((o) => o.value === newSearch);
    if (opt) {
      setSearch(opt.label);
    } else {
      setSearch(newSearch);
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-left ml-1 truncate">
          {label}
        </span>
      )}
      <Combobox
        value={value}
        onValueChange={handleValueChange}
        inputValue={search}
        onInputValueChange={handleInputValueChange}>
        
        <ComboboxInput
          placeholder={placeholder}
          showClear={value !== options[0]?.value}
          className="h-9 text-xs text-left bg-surface rounded-full border-border/80 px-2 shadow-2xs hover:bg-muted/40 transition-colors w-full" />
        
        <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto z-50 text-left rounded-xl">
          <ComboboxList>
            <ComboboxGroup>
              {groupLabel &&
              <ComboboxLabel className="text-left text-[11px] px-3 py-1 font-bold text-muted-foreground">
                  {groupLabel}
                </ComboboxLabel>
              }
              {filteredOptions.map((opt) =>
              <ComboboxItem key={opt.value} value={opt.value} className="text-xs text-left justify-start py-2 px-3">
                  <span className="truncate text-left w-full">{opt.label}</span>
                </ComboboxItem>
              )}
            </ComboboxGroup>
            {filteredOptions.length === 0 &&
            <ComboboxEmpty className="text-left text-xs py-2 px-3">No se encontraron opciones.</ComboboxEmpty>
            }
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>);

}

export function RevisionNormativaView() {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const currentUser =
    activeUser?.role === "EQ_NORMATIVA" || activeUser?.role === "DIR_NORMATIVA"
      ? activeUser
      : MOCK_USERS_BY_ROLE.EQ_NORMATIVA;

  const store = useSolicitudesIngresoStore();
  const {
    solicitudes,
    isLoaded,
    aprobarSolicitud,
    rechazarSolicitud,
    actualizarEstado,
    resetStore
  } = store;

  // Filtro de proceso (Todos / Proceso A / Proceso B / Proceso C)
  const [filterTramite, setFilterTramite] = useState<string>("TODOS");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [filterInstitucion, setFilterInstitucion] = useState<string>("Todas");
  const [filterFecha, setFilterFecha] = useState<string>("Todas");
  const [sortOrder, setSortOrder] = useState<
    "fecha-desc" |
    "fecha-asc" |
    "nombre-asc" |
    "nombre-desc" |
    "institucion-asc" |
    "institucion-desc" |
    "cedula-asc" |
    "cedula-desc" |
    "estado-prioridad">(
    "fecha-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  // Selected item for full Detail View
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudIngreso | null>(null);
  const [detailTab, setDetailTab] = useState<number>(0);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [solicitudesMasivas, setSolicitudesMasivas] = useState<SolicitudIngreso[]>([]);
  const [isAssignMasivoOpen, setIsAssignMasivoOpen] = useState(false);

  // Dialogs for Approve, Reject & Assign
  const [solicitudToApprove, setSolicitudToApprove] = useState<SolicitudIngreso | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [solicitudToReject, setSolicitudToReject] = useState<SolicitudIngreso | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [solicitudToAssign, setSolicitudToAssign] = useState<SolicitudIngreso | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const handleSelectSolicitud = (solicitud: SolicitudIngreso) => {
    router.push(`/revision-normativa/${solicitud.id}`);
  };

  const handleGestionarResolucion = (solicitud: SolicitudIngreso) => {
    router.push(`/revision-normativa/${solicitud.id}`);
  };

  const handleOpenAssign = (solicitud: SolicitudIngreso) => {
    setSolicitudToAssign(solicitud);
    setIsAssignOpen(true);
  };

  const handleConfirmAsignacion = (
  solicitudId: string,
  revisorNombre: string,
  asignadoPor?: string,
  observaciones?: string) =>
  {
    const dir = asignadoPor || currentUser.name;
    if (currentUser.role === "DIR_GESTION") {
      store.asignarRevisorGestion(solicitudId, revisorNombre, dir, observaciones);
    } else if (currentUser.role === "DIR_NORMATIVA") {
      store.asignarRevisorNormatividad(solicitudId, revisorNombre, dir, observaciones);
    }
    toast.success("Revisor asignado exitosamente");
    setSelectedSolicitud(null);
  };

  const handleConfirmAsignacionMasiva = (
  solicitudIds: string[],
  revisorNombre: string,
  asignadoPor?: string,
  observaciones?: string) =>
  {
    const area = currentUser.role === "DIR_NORMATIVA" ? "NORMATIVIDAD" : "GESTION";
    const dir = asignadoPor || (currentUser.role === "DIR_NORMATIVA" ? "Director Área de Normatividad" : "Director Área de Gestión");
    store.asignarRevisorMasivo(solicitudIds, revisorNombre, area, dir, observaciones);
    toast.success(`${solicitudIds.length} solicitudes asignadas exitosamente a ${revisorNombre}`);
    setSelectedIds([]);
    setSolicitudesMasivas([]);
  };

  // Document preview modal
  const [previewDoc, setPreviewDoc] = useState<{
    titulo: string;
    archivo: string;
    tamano: string;
    autoridad: string;
  } | null>(null);

  // Helper date parser (DD/MM/YYYY HH:mm)
  const parseFechaSolicitud = (fechaStr: string) => {
    const [datePart, timePart] = fechaStr.split(" ");
    if (!datePart) return 0;
    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes] = (timePart || "00:00").split(":").map(Number);
    return new Date(year, (month || 1) - 1, day || 1, hours || 0, minutes || 0).getTime();
  };

  // Institution options from data
  const institucionesList = useMemo(() => {
    const set = new Set<string>();
    solicitudes.forEach((s) => set.add(s.institucion));
    return Array.from(set);
  }, [solicitudes]);

  // Construction of timelineItems for selectedSolicitud using Timeline component
  const timelineItems: TimelineItem[] = useMemo(() => {
    return buildTramiteTimelineItems(selectedSolicitud);
  }, [selectedSolicitud]);

  const procesoOptions = useMemo(() => [
  { value: "TODOS", label: "Todos" },
  { value: "PROCESO_A_REGISTRO_INSTITUCION", label: "Institución" },
  { value: "PROCESO_B_ENROLAMIENTO_COORDINADOR", label: "Coordinador" },
  { value: "PROCESO_C_CAMBIO_COORDINADOR", label: "Cambio de coordinador" }],
  []);

  const estadoOptions = useMemo(() => {
    if (currentUser.role === "EQ_GESTION") {
      return [
      { value: "Todos", label: "Estado: Todos" },
      { value: "PENDIENTES", label: "Pendiente de revisión" },
      { value: "Aprobada", label: "Aprobada" },
      { value: "Rechazada", label: "Rechazada" }];

    }
    if (currentUser.role === "EQ_NORMATIVA") {
      return [
        { value: "Todos", label: "Estado: Todos" },
        { value: "PENDIENTES", label: "Pendiente por generar resolución" },
        { value: "EN_GENERACION_RESOLUCION", label: "En generación de resolución" },
        { value: "GENERACION_PENDIENTE", label: "Generación pausada / pendiente" },
      ];
    }
    if (currentUser.role === "DIR_NORMATIVA") {
      return [
        { value: "Todos", label: "Todos" },
        { value: "SIN_ASIGNAR", label: "Sin Asignar" },
        { value: "ASIGNADOS", label: "Asignados" },
        { value: "PENDIENTE_ASIGNACION_NORMATIVIDAD", label: "Pendiente de Asignación · Normatividad" },
        { value: "PENDIENTE_GENERAR_RESOLUCION", label: "Pendiente de Generar Resolución" },
        { value: "EN_GENERACION_RESOLUCION", label: "En Generación de Resolución" },
        { value: "GENERACION_PENDIENTE", label: "Generación Pendiente" },
        { value: "RESOLUCION_GENERADA", label: "Resolución Generada" },
        { value: "Rechazada", label: "Rechazada" },
        { value: "Cancelada", label: "Cancelada" },
      ];
    }
    return [
    { value: "Todos", label: "Todos" },
    { value: "PENDIENTE_ENVIO", label: "Pendiente de Envío" },
    { value: "SIN_ASIGNAR", label: "Sin Asignar" },
    { value: "ASIGNADOS", label: "Asignados" },
    { value: "EN_REVISION", label: "En Revisión" },
    { value: "PENDIENTE_ASIGNACION_GESTION", label: "Pendiente Asignación" },
    { value: "EN_REVISION_GESTION", label: "En Revisión" },
    { value: "PENDIENTE_ASIGNACION_NORMATIVIDAD", label: "Pendiente Normatividad" },
    { value: "EN_REVISION_NORMATIVIDAD", label: "En Revisión Normatividad" },
    { value: "APROBADO_FINAL", label: "Aprobado Final" },
    { value: "Aprobada", label: "Aprobada" },
    { value: "Rechazada", label: "Rechazada" },
    { value: "Cancelada", label: "Cancelada" }];

  }, [currentUser.role]);

  const institucionOptions = useMemo(() => [
  { value: "Todas", label: "Todas" },
  ...institucionesList.map((inst) => ({ value: inst, label: inst }))],
  [institucionesList]);

  const sortOptions = useMemo(() => [
  { value: "fecha-desc", label: "Más recientes" },
  { value: "fecha-asc", label: "Más antiguas" },
  { value: "nombre-asc", label: "Nombre (A - Z)" },
  { value: "estado-prioridad", label: "Pendientes primero" }],
  []);

  const activeSectionTitle = "Solicitudes pendientes";

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== "" ||
      filterTramite !== "TODOS" ||
      filterEstado !== "Todos" ||
      filterInstitucion !== "Todas");

  }, [searchQuery, filterTramite, filterEstado, filterInstitucion]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterTramite("TODOS");
    setFilterEstado("Todos");
    setFilterInstitucion("Todas");
    setCurrentPage(1);
  };

  // KPIs globales por rol
  const dynamicKpis = useMemo(() => {
    if (currentUser.role === "EQ_GESTION") {
      const misSolicitudes = solicitudes.filter(
        (s) => s.revisorGestion === currentUser.name || s.revisor === currentUser.name
      );
      return {
        pendientes: misSolicitudes.filter(
          (s) =>
          s.estado === "EN_REVISION_GESTION" ||
          s.estado === "PENDIENTE_ASIGNACION_GESTION" ||
          s.estado === "Pendiente"
        ).length,
        aprobadas: misSolicitudes.filter(
          (s) =>
          Boolean(s.fechaAprobacionGestion) ||
          s.estado === "Aprobada" ||
          s.estado === "APROBADO_FINAL" ||
          s.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
          s.estado === "EN_REVISION_NORMATIVIDAD" ||
          s.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
          s.estado === "EN_GENERACION_RESOLUCION" ||
          s.estado === "GENERACION_PENDIENTE" ||
          s.estado === "RESOLUCION_GENERADA" ||
          s.estado === "INSTITUCION_ACTIVA"
        ).length,
        rechazadas: misSolicitudes.filter(
          (s) => s.estado === "Rechazada" || s.estado === "Cancelada"
        ).length,
        sinAsignar: 0,
        enRevision: 0,
        resueltas: 0
      };
    }
    if (currentUser.role === "EQ_NORMATIVA") {
      const misSolicitudes = solicitudes.filter(
        (s) =>
          s.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" &&
          (s.revisorNormatividad === currentUser.name ||
            s.revisor === currentUser.name ||
            s.revisorNormatividad === "Personal facultado de Normatividad" ||
            s.revisor === "Personal facultado de Normatividad" ||
            (!s.revisorNormatividad && currentUser.role === "EQ_NORMATIVA")) &&
          s.estado !== "Rechazada" &&
          s.estado !== "Cancelada" &&
          s.estado !== "Aprobada" &&
          s.estado !== "APROBADO_FINAL" &&
          s.estado !== "RESOLUCION_GENERADA" &&
          s.estado !== "INSTITUCION_ACTIVA" &&
          s.estado !== "PENDIENTE_DE_FIRMA" &&
          s.rechazadoPor !== "GESTION"
      );
      return {
        pendientes: misSolicitudes.filter(
          (s) =>
            s.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
            s.estado === "EN_REVISION_NORMATIVIDAD"
        ).length,
        enRevision: misSolicitudes.filter(
          (s) => s.estado === "EN_GENERACION_RESOLUCION"
        ).length,
        pausadas: misSolicitudes.filter(
          (s) => s.estado === "GENERACION_PENDIENTE"
        ).length,
        resueltas: misSolicitudes.filter(
          (s) => s.estado === "GENERACION_PENDIENTE"
        ).length,
        rechazadas: 0,
        sinAsignar: 0,
        aprobadas: 0,
      };
    }
    if (currentUser.role === "DIR_NORMATIVA") {
      return {
        sinAsignar: solicitudes.filter(
          (s) => s.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" || (!s.revisorNormatividad && (s.estado as string).includes("NORMATIVIDAD"))
        ).length,
        enRevision: solicitudes.filter(
          (s) =>
            s.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
            s.estado === "EN_GENERACION_RESOLUCION" ||
            s.estado === "EN_REVISION_NORMATIVIDAD" ||
            s.estado === "GENERACION_PENDIENTE"
        ).length,
        resueltas: solicitudes.filter(
          (s) =>
            s.estado === "RESOLUCION_GENERADA" ||
            s.estado === "APROBADO_FINAL" ||
            s.estado === "Rechazada" ||
            s.estado === "Cancelada"
        ).length,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
      };
    }
    return {
      sinAsignar: solicitudes.filter(
        (s) =>
        s.estado === "PENDIENTE_ASIGNACION_GESTION" ||
        s.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
        s.estado === "Pendiente"
      ).length,
      enRevision: solicitudes.filter(
        (s) =>
        s.estado === "EN_REVISION_GESTION" ||
        s.estado === "EN_REVISION_NORMATIVIDAD"
      ).length,
      resueltas: solicitudes.filter(
        (s) =>
        s.estado === "Aprobada" ||
        s.estado === "APROBADO_FINAL" ||
        s.estado === "RESOLUCION_GENERADA" ||
        s.estado === "Rechazada" ||
        s.estado === "Cancelada"
      ).length
    };
  }, [solicitudes, currentUser.role]);

  // Filter & Sort
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = solicitudes.filter((item) => {
      // Filtro de pestaña de trámite
      if (filterTramite !== "TODOS" && item.tipoTramite !== filterTramite) {
        return false;
      }

      const matchesSearch =
      q === "" ||
      item.cedula.toLowerCase().includes(q) ||
      item.nombreCompleto.toLowerCase().includes(q) ||
      item.correo.toLowerCase().includes(q) ||
      item.institucion.toLowerCase().includes(q) ||
      item.codigoDocumental.toLowerCase().includes(q);

      // BPM Logic: Filtrar por rol con trazabilidad completa
      if (
      currentUser.role === "DIR_GESTION" &&
      ![
      "PENDIENTE_ASIGNACION_GESTION",
      "EN_REVISION_GESTION",
      "PENDIENTE_ASIGNACION_NORMATIVIDAD",
      "EN_REVISION_NORMATIVIDAD",
      "PENDIENTE_GENERAR_RESOLUCION",
      "EN_GENERACION_RESOLUCION",
      "GENERACION_PENDIENTE",
      "RESOLUCION_GENERADA",
      "APROBADO_FINAL",
      "Aprobada",
      "Rechazada",
      "Cancelada"].
      includes(item.estado))

      return false;

      if (currentUser.role === "EQ_GESTION") {
        if (![
        "EN_REVISION_GESTION",
        "PENDIENTE_ASIGNACION_GESTION",
        "PENDIENTE_ASIGNACION_NORMATIVIDAD",
        "EN_REVISION_NORMATIVIDAD",
        "PENDIENTE_GENERAR_RESOLUCION",
        "EN_GENERACION_RESOLUCION",
        "GENERACION_PENDIENTE",
        "RESOLUCION_GENERADA",
        "APROBADO_FINAL",
        "Aprobada",
        "Rechazada",
        "Cancelada"].
        includes(item.estado)) {
          return false;
        }

        // El revisor de gestión SOLO ve las solicitudes que le han sido asignadas
        const revisorDelTramite = item.revisorGestion || item.revisor;
        if (revisorDelTramite !== currentUser.name) {
          return false;
        }
      }

      if (
      currentUser.role === "DIR_NORMATIVA" &&
      ![
      "PENDIENTE_ASIGNACION_NORMATIVIDAD",
      "PENDIENTE_GENERAR_RESOLUCION",
      "EN_GENERACION_RESOLUCION",
      "GENERACION_PENDIENTE",
      "RESOLUCION_GENERADA",
      "EN_REVISION_NORMATIVIDAD",
      "APROBADO_FINAL",
      "Aprobada",
      "Rechazada",
      "Cancelada"].
      includes(item.estado))

      return false;
      if (currentUser.role === "DIR_NORMATIVA" && item.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR") return false;

      if (currentUser.role === "EQ_NORMATIVA") {
        // Solo solicitudes del proceso de Registro de Institución (Anexo A)
        if (item.tipoTramite !== "PROCESO_A_REGISTRO_INSTITUCION") {
          return false;
        }

        // NO ver las que se rechazaron o aprobaron en gestión, ni canceladas o ya concluidas
        if (
          item.estado === "Rechazada" ||
          item.estado === "Cancelada" ||
          item.estado === "Aprobada" ||
          item.estado === "APROBADO_FINAL" ||
          item.rechazadoPor === "GESTION" ||
          item.estado === "RESOLUCION_GENERADA" ||
          item.estado === "INSTITUCION_ACTIVA" ||
          item.estado === "PENDIENTE_DE_FIRMA"
        ) {
          return false;
        }

        // SOLO ver las que están pendientes para Normatividad
        if (
          ![
            "PENDIENTE_GENERAR_RESOLUCION",
            "EN_GENERACION_RESOLUCION",
            "GENERACION_PENDIENTE",
            "EN_REVISION_NORMATIVIDAD",
          ].includes(item.estado)
        ) {
          return false;
        }

        // El revisor de normatividad SOLO ve las solicitudes asignadas a él
        const revisorDelTramite = item.revisorNormatividad || item.revisor;
        const isMyAssign =
          revisorDelTramite === currentUser.name ||
          revisorDelTramite === "Personal facultado de Normatividad" ||
          (!revisorDelTramite && currentUser.role === "EQ_NORMATIVA");
        if (!isMyAssign) {
          return false;
        }
      }

      const matchesEstado = (() => {
        if (filterEstado === "Todos") return true;
        if (currentUser.role === "EQ_NORMATIVA") {
          if (
            filterEstado === "PENDIENTES" ||
            filterEstado === "Pendiente por generar resolución" ||
            filterEstado === "Pendiente de resolución" ||
            filterEstado === "Pendiente de revisión"
          ) {
            return (
              item.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
              item.estado === "EN_REVISION_NORMATIVIDAD"
            );
          }
          if (
            filterEstado === "EN_GENERACION_RESOLUCION" ||
            filterEstado === "EN_GENERACION" ||
            filterEstado === "En generación de resolución"
          ) {
            return item.estado === "EN_GENERACION_RESOLUCION";
          }
          if (
            filterEstado === "GENERACION_PENDIENTE" ||
            filterEstado === "Generación pendiente" ||
            filterEstado === "Generación pausada / pendiente" ||
            filterEstado === "Generación pausada"
          ) {
            return item.estado === "GENERACION_PENDIENTE";
          }
          return item.estado === filterEstado;
        }
        if (currentUser.role === "EQ_GESTION") {
          if (filterEstado === "PENDIENTES" || filterEstado === "Pendiente de revisión") {
            return (
              item.estado === "EN_REVISION_GESTION" ||
              item.estado === "PENDIENTE_ASIGNACION_GESTION" ||
              item.estado === "Pendiente");

          }
          if (filterEstado === "Aprobada" || filterEstado === "APROBADAS") {
            return (
              Boolean(item.fechaAprobacionGestion) ||
              [
              "Aprobada",
              "APROBADO_FINAL",
              "PENDIENTE_ASIGNACION_NORMATIVIDAD",
              "EN_REVISION_NORMATIVIDAD",
              "PENDIENTE_GENERAR_RESOLUCION",
              "EN_GENERACION_RESOLUCION",
              "GENERACION_PENDIENTE",
              "RESOLUCION_GENERADA",
              "INSTITUCION_ACTIVA"].
              includes(item.estado));

          }
          if (filterEstado === "Rechazada" || filterEstado === "RECHAZADAS") {
            return item.estado === "Rechazada" || item.estado === "Cancelada";
          }
        }
        if (filterEstado === "SIN_ASIGNAR") {
          if (currentUser.role === "DIR_NORMATIVA") {
            return item.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" || !item.revisorNormatividad;
          }
          return (
            item.estado === "PENDIENTE_ASIGNACION_GESTION" ||
            item.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
            item.estado === "Pendiente" ||
            !item.revisorGestion &&
            !item.revisorNormatividad &&
            item.estado !== "Cancelada" &&
            item.estado !== "Rechazada");

        }
        if (filterEstado === "ASIGNADOS") {
          if (currentUser.role === "DIR_NORMATIVA") {
            return Boolean(item.revisorNormatividad && item.estado !== "Cancelada" && item.estado !== "Rechazada");
          }
          return Boolean(
            (item.revisorGestion || item.revisorNormatividad || item.revisor) &&
            item.estado !== "Cancelada" &&
            item.estado !== "Rechazada"
          );
        }
        if (filterEstado === "EN_REVISION") {
          return (
            item.estado === "EN_REVISION_GESTION" ||
            item.estado === "EN_REVISION_NORMATIVIDAD" ||
            item.estado === "PENDIENTE_GENERAR_RESOLUCION" ||
            item.estado === "EN_GENERACION_RESOLUCION");

        }
        if (filterEstado === "RESOLUCION_GENERADA" || filterEstado === "APROBADO_FINAL" || filterEstado === "Aprobada") {
          return item.estado === "RESOLUCION_GENERADA" || item.estado === "APROBADO_FINAL" || item.estado === "Aprobada";
        }
        return item.estado === filterEstado;
      })();

      const matchesInstitucion =
      filterInstitucion === "Todas" || item.institucion === filterInstitucion;

      const matchesFecha = (() => {
        if (filterFecha === "Todas") return true;
        const itemTime = parseFechaSolicitud(item.fechaSolicitud);
        const now = Date.now();
        if (filterFecha === "7dias") {
          return now - itemTime <= 7 * 24 * 60 * 60 * 1000;
        }
        if (filterFecha === "30dias") {
          return now - itemTime <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      })();

      return matchesSearch && matchesEstado && matchesInstitucion && matchesFecha;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case "fecha-desc":
          return parseFechaSolicitud(b.fechaSolicitud) - parseFechaSolicitud(a.fechaSolicitud);
        case "fecha-asc":
          return parseFechaSolicitud(a.fechaSolicitud) - parseFechaSolicitud(b.fechaSolicitud);
        case "nombre-asc":
          return a.nombreCompleto.localeCompare(b.nombreCompleto);
        case "nombre-desc":
          return b.nombreCompleto.localeCompare(a.nombreCompleto);
        case "institucion-asc":
          return a.institucion.localeCompare(b.institucion);
        case "institucion-desc":
          return b.institucion.localeCompare(a.institucion);
        case "cedula-asc":
          return a.cedula.localeCompare(b.cedula);
        case "cedula-desc":
          return b.cedula.localeCompare(a.cedula);
        case "estado-prioridad":{
            const priority: Record<string, number> = {
              Pendiente: 1,
              Aprobada: 2,
              Rechazada: 3,
              Cancelada: 4
            };
            return (priority[a.estado] || 99) - (priority[b.estado] || 99);
          }
        default:
          return 0;
      }
    });

    return result;
  }, [solicitudes, filterTramite, searchQuery, filterEstado, filterInstitucion, filterFecha, sortOrder, currentUser.role]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleOpenApprove = (sol: SolicitudIngreso) => {
    setSolicitudToApprove(sol);
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = (sol: SolicitudIngreso) => {
    store.aprobarGestion(sol.id, currentUser.name);
    toast.success("Solicitud aprobada correctamente.");
    if (selectedSolicitud && selectedSolicitud.id === sol.id) {
      setSelectedSolicitud((prev) =>
      prev ?
      {
        ...prev,
        estado: "PENDIENTE_ASIGNACION_NORMATIVIDAD",
        fechaRevision: "Reciente",
        fechaAprobacionGestion: "Reciente"
      } :
      null
      );
    }
  };

  const handleOpenReject = (sol: SolicitudIngreso) => {
    setSolicitudToReject(sol);
    setIsRejectOpen(true);
  };

  const handleConfirmReject = (sol: SolicitudIngreso, motivo: string) => {
    store.rechazarSolicitud(sol.id, motivo, currentUser.name);
    toast.success("Solicitud rechazada. La institución será notificada por correo.");
    if (selectedSolicitud && selectedSolicitud.id === sol.id) {
      setSelectedSolicitud((prev) =>
      prev ?
      {
        ...prev,
        estado: "Cancelada",
        fechaRevision: "Reciente",
        revisor: currentUser.name,
        motivoRechazo: motivo
      } :
      null
      );
    }
  };

  const renderEstadoBadge = (estado: EstadoSolicitudIngreso, revisionIniciada?: boolean) => {
    const { tone, label } = getEstadoBadgeProps(estado, revisionIniciada);
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            tone={tone}
            appearance="soft"
            size="sm"
            dot
            className="font-semibold text-[11px] normal-case tracking-normal px-2 py-0.5 inline-flex items-center shadow-2xs cursor-pointer hover:opacity-90 transition-opacity max-w-full">
            
            <span className="truncate max-w-[160px] sm:max-w-[200px]">{label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
          <p className="font-bold text-xs text-foreground">Estado del trámite</p>
          <p className="text-[11px] text-muted-foreground">{label}</p>
        </TooltipContent>
      </Tooltip>);

  };

  const renderTramiteBadge = (tipo: TipoTramiteIngreso, codigo: string) => {
    return (
      <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[10px] border border-border">
        {codigo}
      </Badge>);

  };

  return (
    <WireframeDashboardLayout
      currentUser={currentUser}
      currentRole={currentUser.role}
      activeMenu="revision-normativa"
      breadcrumbs={
      selectedSolicitud ?
      [
      {
        label: activeSectionTitle,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setSelectedSolicitud(null);
        }
      },
      {
        label: selectedSolicitud.tituloTramite || "Solicitud de Registro de Institución",
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setSelectedSolicitud(null);
        }
      },
      { label: selectedSolicitud.id }] :

      [
      { label: activeSectionTitle }]

      }>
      
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* ----------------------------------------------------------
             VISTA 1: DETALLE DE SOLICITUD (BREADCRUMB + APROBAR / RECHAZAR)
            ---------------------------------------------------------- */}
        {selectedSolicitud ?
        <Card className="flex-1 min-h-0 flex flex-col w-full overflow-hidden border-border shadow-xs animate-in fade-in duration-200" innerClassName="p-6 sm:p-8 flex flex-col h-full bg-surface space-y-6 overflow-y-auto">
            {/* Cabecera de Retorno y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <Button
              type="button"
              variant="primary"
              onClick={() => setSelectedSolicitud(null)}
              className="h-10 px-4 gap-2 text-xs font-semibold rounded-xl shadow-xs self-start">
              
                <ArrowLeft className="size-4" />
                <span>Volver a la bandeja</span>
              </Button>

              {/* Botones de acción en la cabecera */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {currentUser.role === "EQ_GESTION" && selectedSolicitud.estado === "EN_REVISION_GESTION" ?
              <>
                    <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenReject(selectedSolicitud)}
                  className="h-10 px-4 text-xs font-semibold gap-2 border-border text-foreground hover:bg-muted rounded-xl">
                  
                      <XCircle className="size-4" />
                      <span>Registrar observaciones / Devolver</span>
                    </Button>
                    <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    store.aprobarGestion(selectedSolicitud.id, currentUser.name);
                    toast.success("Trámite aprobado por Gestión y enviado a Normatividad");
                    setSelectedSolicitud(null);
                  }}
                  className="h-10 px-4 text-xs font-semibold gap-2 shadow-xs">
                  
                      <CheckCircle2 className="size-4" />
                      <span>Aprobar revisión</span>
                    </Button>
                  </> :
              currentUser.role === "EQ_NORMATIVA" && selectedSolicitud.estado === "EN_REVISION_NORMATIVIDAD" ?
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  store.aprobarNormatividad(selectedSolicitud.id, currentUser.name, "RES-DINARP-2026-001");
                  toast.success("Resolución generada. Trámite finalizado exitosamente.");
                  setSelectedSolicitud(null);
                }}
                className="h-10 px-4 text-xs font-semibold gap-2 shadow-xs">
                
                    <FileSignature className="size-4" />
                    <span>Generar resolución y finalizar</span>
                  </Button> :
              selectedSolicitud.estado === "Cancelada" ?
              <Badge tone="danger" appearance="soft" size="md" className="font-semibold py-1.5 px-3">
                    <AlertCircle className="size-3.5 mr-1 text-danger" />
                    Expediente Cerrado
                  </Badge> :

              <Badge tone="neutral" appearance="soft" size="lg" className="gap-1.5 text-xs font-semibold py-1 px-3 border border-border text-foreground">
                    <CheckCircle2 className="size-3.5 text-foreground" />
                    {selectedSolicitud.estado.replace(/_/g, " ")}
                  </Badge>
              }
              </div>
            </div>

            {/* Encabezado del Trámite en Card Featured estilo UI Kit con Badge Primary e Icono (como registro-institucion) */}
            <Card
            variant="featured"
            disableHover={true}
            className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden p-6">
            
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 border-0">
                    FORMULARIO OFICIAL {selectedSolicitud.codigoDocumental} · {selectedSolicitud.id}
                  </CardBadge>
                </div>
                {renderEstadoBadge(selectedSolicitud.estado, selectedSolicitud.revisionIniciada)}
              </div>

              <CardTitle className="text-xl sm:text-2xl font-bold font-heading text-primary">
                {selectedSolicitud.tituloTramite}
              </CardTitle>

              <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium mt-1">
                Registrado el {selectedSolicitud.fechaSolicitud} · {selectedSolicitud.institucion} · Solicitante: {selectedSolicitud.nombreCompleto} (C.I. {selectedSolicitud.cedula})
              </CardDescription>

              <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 pointer-events-none">
                <Building2 className="size-36 text-primary" />
              </CardDecorativeIcon>
            </Card>

            {/* Banners contextuales según estado */}
            {(selectedSolicitud.estado === "EN_REVISION_GESTION" || selectedSolicitud.estado === "EN_REVISION_NORMATIVIDAD") &&
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-foreground space-y-2 animate-in fade-in duration-150 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-foreground">
                        Solicitud en revisión
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        La revisión técnica y documental se encuentra en curso bajo la responsabilidad del revisor asignado.
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" appearance="soft" size="md" className="font-bold text-xs shrink-0 self-start sm:self-auto">
                    EN REVISIÓN
                  </Badge>
                </div>

                <div className="pt-2 border-t border-primary/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Tipo de solicitud:</span>
                    <strong className="text-foreground font-semibold">
                      {selectedSolicitud.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ?
      "Anexo A — Solicitud de Registro de Institución" :
                  selectedSolicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ?
      "Anexo B — Solicitud de Registro de Coordinador" :
                  selectedSolicitud.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ?
      "Anexo C — Solicitud de Cambio de Coordinador" :
                  "Solicitud de Ingreso"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Revisor responsable: </span>
                    <strong className="text-foreground">
                      {selectedSolicitud.revisorGestion || selectedSolicitud.revisor || "Revisor asignado"}
                    </strong>
                  </div>
                </div>
              </div>
          }

            {selectedSolicitud.estado === "Cancelada" &&
          <div className="p-5 rounded-2xl bg-danger-100/30 dark:bg-danger-900/20 border border-danger/40 text-foreground space-y-3 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-danger/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center shrink-0">
                      <AlertCircle className="size-4 text-danger" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold font-heading text-danger">
                        Trámite Cancelado y Solicitud Cerrada Definitivamente
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Esta solicitud no superó la revisión técnica obligatoria del Área de Gestión.
                      </p>
                    </div>
                  </div>
                  <Badge tone="danger" appearance="soft" size="md" className="font-semibold border-danger/40">
                    Cierre Definitivo
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-danger">
                      <XCircle className="size-3.5 text-danger shrink-0" />
                      Motivo de la Cancelación (Revisión No Conforme):
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {selectedSolicitud.motivoRechazo || "Se identificaron observaciones insubsanables en la documentación y firmas digitales registradas."}
                    </p>
                  </div>

                  <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
                    <span className="font-bold text-foreground flex items-center gap-1.5 text-primary">
                      <RotateCcw className="size-3.5 text-primary shrink-0" />
                      Acción Requerida para la Institución:
                    </span>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      El trámite se encuentra cerrado. La institución requirente debe <strong>volver a realizar y enviar una nueva solicitud de registro de institución (Anexo A)</strong> desde cero a través del portal, adjuntando la documentación vigente y la firma electrónica debidamente validada.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-danger/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Fecha de cancelación y cierre: <strong className="text-foreground">{selectedSolicitud.fechaRevision || "20/09/2026 16:45"}</strong></span>
                    <span>Revisor responsable: <strong className="text-foreground">{selectedSolicitud.revisor || "Ana Torres (Área de Gestión)"}</strong></span>
                  </div>
                  <span className="font-semibold text-danger">Estado BPM: Cancelada (Cierre de ciclo)</span>
                </div>
              </div>
          }
            {selectedSolicitud.estado === "Aprobada" &&
          <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-foreground" />
                  <span>
                    {selectedSolicitud.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" && "Institución aprobada: Coordinadores prerregistrados e invitados al Proceso B"}
                    {selectedSolicitud.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && "Acuerdo de Confidencialidad aprobado: Coordinador institucional ACTIVO"}
                    {selectedSolicitud.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" && "Cambio aprobado: Nuevo coordinador prerregistrado e invitado al Proceso B"}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Fecha de resolución: </span>
                    <strong className="text-foreground">{selectedSolicitud.fechaRevision || "Reciente"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" || selectedSolicitud.estado.includes("NORMATIVIDAD") || selectedSolicitud.estado.includes("RESOLUCION") ? "Responsable de Normatividad: " : "Revisado por: "}</span>
                    <strong className="text-foreground">
          {currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" || selectedSolicitud.estado.includes("NORMATIVIDAD") || selectedSolicitud.estado.includes("RESOLUCION") ? selectedSolicitud.revisorNormatividad || "Sin asignar" : selectedSolicitud.revisorGestion || selectedSolicitud.revisor || "Dirección de Gestión y Registro"}
                    </strong>
                  </div>
                </div>
              </div>
          }

            {selectedSolicitud.estado === "Rechazada" &&
          <div className="p-4 rounded-2xl bg-muted/40 border border-border text-foreground space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <XCircle className="size-4 shrink-0 text-muted-foreground" />
                  <span>Trámite Denegado / Observado</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-border text-xs">
                  <span className="font-semibold text-foreground block mb-1">
                    Motivo registrado para notificación:
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {selectedSolicitud.motivoRechazo || "No se especificó motivo de rechazo."}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground">Fecha de resolución: </span>
                    <strong className="text-foreground">{selectedSolicitud.fechaRevision || "Reciente"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" || selectedSolicitud.estado.includes("NORMATIVIDAD") || selectedSolicitud.estado.includes("RESOLUCION") ? "Responsable de Normatividad: " : "Revisado por: "}</span>
                    <strong className="text-foreground">
          {currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" || selectedSolicitud.estado.includes("NORMATIVIDAD") || selectedSolicitud.estado.includes("RESOLUCION") ? selectedSolicitud.revisorNormatividad || "Sin asignar" : selectedSolicitud.revisorGestion || selectedSolicitud.revisor || "Dirección de Gestión y Registro"}
                    </strong>
                  </div>
                </div>
              </div>
          }

            {/* Encabezado del Trámite en Card Featured estilo UI Kit con Badge Primary e Icono */}
            <Card
            variant="featured"
            disableHover={true}
            className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-4 relative overflow-hidden">
            
              <div className="flex items-center gap-2">
                <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                  FORMULARIO OFICIAL ARP-R01
                </CardBadge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                      type="button"
                      className="inline-flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Información del Formulario Oficial">
                      
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" variant="primary" className="max-w-xs text-xs leading-relaxed">
                      Anexo A: Formulario diligenciado por la institución solicitante para iniciar su proceso de registro en el SINARP.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                Anexo A — Solicitud de Registro de Institución
              </CardTitle>

              <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                Proceso A · Enrolamiento institucional al SINARP
              </CardDescription>

              <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                <FileText className="size-32 text-primary" />
              </CardDecorativeIcon>
            </Card>

      {/* -- NAVEGACIÓN PESTAÑAS PÍLDORA CÁPSULA (UI KIT CON ICONOS) -- */}
            <div className="overflow-x-auto py-1">
              <Tabs
              defaultValue="tab-0"
              value={`tab-${detailTab}`}
              onValueChange={(val) => setDetailTab(Number(val.replace("tab-", "")))}
              className="w-full">
              
                <TabsList className="h-auto p-1.5 rounded-full bg-background border border-border/40 inline-flex gap-1.5 flex-nowrap w-full sm:w-auto justify-start overflow-x-auto">
                  {currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" ?
                <>
                      <TabsTrigger
                    value="tab-5"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <FileText className="size-4 shrink-0" />
                        <span>Información del trámite</span>
                      </TabsTrigger>
                      <TabsTrigger
                    value="tab-6"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <FileSignature className="size-4 shrink-0" />
                        <span>Resolución</span>
                      </TabsTrigger>
                      <TabsTrigger
                    value="tab-4"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <History className="size-4 shrink-0" />
                        <span>Trazabilidad</span>
                      </TabsTrigger>
                    </> :

                <>
                      <TabsTrigger
                    value="tab-0"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <Building2 className="size-4 shrink-0" />
                        <span>1. Entidad y Autoridad</span>
                      </TabsTrigger>

                      <TabsTrigger
                    value="tab-1"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <User className="size-4 shrink-0" />
                        <span>2. Coordinadores</span>
                      </TabsTrigger>

                      <TabsTrigger
                    value="tab-2"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <FileText className="size-4 shrink-0" />
                        <span>3. Servicios y Procesos</span>
                      </TabsTrigger>

                      <TabsTrigger
                    value="tab-3"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <ShieldCheck className="size-4 shrink-0" />
                        <span>4. Declaraciones y firma</span>
                      </TabsTrigger>

                      <TabsTrigger
                    value="tab-4"
                    className="px-5 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary-300 data-[state=active]:text-white data-[state=active]:[&_svg]:text-white dark:data-[state=active]:bg-primary-300 dark:data-[state=active]:text-white dark:data-[state=active]:[&_svg]:text-white whitespace-nowrap">
                    
                        <History className="size-4 shrink-0" />
                        <span>5. Trazabilidad</span>
                      </TabsTrigger>
                    </>
                }
                </TabsList>
              </Tabs>
            </div>

            {/* -- PASO 0: ENTIDAD Y AUTORIDAD COMPARECIENTE -- */}
            {detailTab === 0 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>
                    <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                      <Building2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                      <span>Sección I — Datos de la Institución y Máxima Autoridad</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Información de identificación de la institución solicitante y de su máxima autoridad o delegado.
                    </p>
                  
                </div>

                <div className="p-6 sm:p-8 space-y-6">
<Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                    {selectedSolicitud.anexoA?.entidadTipo === "Privada" ? "ENTIDAD PRIVADA" : "ENTIDAD PÚBLICA"}
                  </Badge>
                </div>

                <div className="bg-muted/50 p-3.5 flex items-start sm:items-center justify-between gap-3 rounded-xl border border-border/40">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Building2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                        1.1 Naturaleza de la Entidad
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Información general de la institución requirente y personería jurídica.
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border shrink-0 self-start sm:self-auto">
                    ENTIDAD
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground block">Naturaleza de la Entidad</Label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                        <input
                        type="radio"
                        name="entidadTipoDirector"
                        checked={selectedSolicitud.anexoA?.entidadTipo !== "Privada"}
                        disabled
                        className="size-4 text-primary accent-primary cursor-not-allowed" />
                      
                        <span>Institución pública</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                        <input
                        type="radio"
                        name="entidadTipoDirector"
                        checked={selectedSolicitud.anexoA?.entidadTipo === "Privada"}
                        disabled
                        className="size-4 text-primary accent-primary cursor-not-allowed" />
                      
                        <span>Institución privada</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Nombre de la Entidad *</Label>
                    <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.nombreEntidad || selectedSolicitud.institucion}
                      disabled
                      className="bg-muted/30 cursor-not-allowed font-bold text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">RUC de la Entidad (13 dígitos) *</Label>
                    <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.rucEntidad || "1768000000001"}
                      disabled
                      className="bg-muted/30 cursor-not-allowed font-mono text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Dirección de la Entidad *</Label>
                    <InputGroup leftIcon={<MapPin className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.direccionEntidad || "Av. 6 de Diciembre N25-75 y Av. Colón, Quito"}
                      disabled
                      className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Objeto Social y/o Actividad de la Entidad *</Label>
                    <Textarea
                    value={selectedSolicitud.anexoA?.objetoSocial || "Rectoría y formulación de políticas públicas de telecomunicaciones y gobierno digital."}
                    disabled
                    rows={2}
                    className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3 border-border/80" />
                  
                  </div>

                  <div className="sm:col-span-2 bg-muted/50 p-3.5 flex items-start sm:items-center justify-between gap-3 rounded-xl border border-border/40">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <User className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold font-heading text-foreground leading-snug">
                          Datos del firmante del Anexo A
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Información de la máxima autoridad o delegado institucional que suscribirá mediante FirmaEC.
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="soft" size="sm" className="border border-border shrink-0 self-start sm:self-auto">
                      FIRMANTE
                    </Badge>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground block">¿Quién firmará el Anexo A? *</Label>
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                        <input
                        type="radio"
                        name="esDelegadoRadio"
                        checked={!selectedSolicitud.anexoA?.esDelegado}
                        disabled
                        className="size-4 text-primary accent-primary cursor-not-allowed" />
                      
                        <span>Máxima autoridad institucional</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-not-allowed">
                        <input
                        type="radio"
                        name="esDelegadoRadio"
                        checked={Boolean(selectedSolicitud.anexoA?.esDelegado)}
                        disabled
                        className="size-4 text-primary accent-primary cursor-not-allowed" />
                      
                        <span>Delegado de la máxima autoridad</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Nombre completo *</Label>
                    <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.representanteLegalNombre || selectedSolicitud.nombreCompleto}
                      disabled
                      className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Denominación del cargo *</Label>
                    <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.representanteLegalCargo || "Ministro de Telecomunicaciones (Representante Legal)"}
                      disabled
                      className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Correo electrónico *</Label>
                    <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                      <InputGroupInput
                      value={selectedSolicitud.anexoA?.representanteLegalEmail || selectedSolicitud.correo || "ministro@mintel.gob.ec"}
                      disabled
                      className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                    
                    </InputGroup>
                  </div>

                  {selectedSolicitud.anexoA?.esDelegado &&
                <div className="sm:col-span-2 p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground block">
                          Autorización de delegación adjunta
                        </Label>
                        <p className="text-[11px] text-muted-foreground">
                          Documento habilitante de delegación de firma oficial cargado en el expediente.
                        </p>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-xs shrink-0 self-start sm:self-auto">
                        {selectedSolicitud.anexoA?.archivoSoporteDelegacion || "Resolucion_Delegacion_Firma.pdf"}
                      </Badge>
                    </div>
                }

                  <div className="pt-4 border-t border-border flex justify-end sm:col-span-2">
                    <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setDetailTab(1)}
                    className="text-xs font-semibold gap-1.5">
                    
                      Siguiente: 2. Coordinadores ?
                    </Button>
                  </div>
                </div>
                </div>
              </div>
          }

            {/* -- PASO 1: COORDINADORES INSTITUCIONALES -- */}
            {detailTab === 1 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>
                    <h2 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                      <User className="size-5 text-primary shrink-0" />
                      <span>Coordinadores Institucionales del SINARP</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Designación de coordinadores titular y suplente para la gestión operativa institucional.
                    </p>
                  
                </div>

                <div className="p-6 sm:p-8 space-y-6">
<Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                    COORDINACIÓN
                  </Badge>
                </div>
                <div className="space-y-6">
                  {/* Coordinador Titular */}
                  <div className="space-y-4 border border-border/80 rounded-2xl p-5 bg-surface shadow-2xs">
                    <div className="bg-muted/50 p-3.5 rounded-xl flex items-center justify-between gap-3 border border-border/40">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                          <User className="size-4 text-muted-foreground shrink-0" />
                          <span>1.2 Coordinador Institucional Principal (Titular)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ingresa los datos del coordinador institucional titular designado por la entidad.
                        </p>
                      </div>
                      <Badge tone="neutral" appearance="soft" size="sm" className="font-bold uppercase tracking-wider px-2.5 py-0.5">
                        TITULAR
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Nombre Completo *</Label>
                        <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularNombreCompleto || "Ing. Esteban Javier Morales Salazar"} disabled className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía *</Label>
                        <InputGroup leftIcon={<CreditCard className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularCedula || "1718956234"} disabled className="bg-muted/30 cursor-not-allowed font-mono text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución *</Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularCargo || "Director de Gobierno Digital"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece *</Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularAreaUnidad || "Viceministerio de Tecnologías de la Información"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional *</Label>
                        <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularEmail || "esteban.morales@mintel.gob.ec"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional *</Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularTelefonoFijo || "023814400 ext 123"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Móvil Institucional *</Label>
                        <InputGroup leftIcon={<Smartphone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularMovilInstitucional || "0991234567"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Móvil Personal *</Label>
                        <InputGroup leftIcon={<Smartphone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.titularMovilPersonal || "0987654321"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>
                    </div>
                  </div>

                  {/* Coordinador Suplente */}
                  <div className="space-y-4 border border-border/80 rounded-2xl p-5 bg-surface shadow-2xs">
                    <div className="bg-muted/50 p-3.5 rounded-xl flex items-center justify-between gap-3 border border-border/40">
                      <div>
                        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                          <User className="size-4 text-muted-foreground shrink-0" />
                          <span>1.3 Coordinador Institucional Suplente</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ingresa los datos del coordinador institucional suplente designado por la entidad.
                        </p>
                      </div>
                      <Badge tone="neutral" appearance="soft" size="sm" className="font-bold uppercase tracking-wider px-2.5 py-0.5">
                        SUPLENTE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Nombre Completo *</Label>
                        <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteNombreCompleto || "Lic. Carmen Elena Vinueza Proaño"} disabled className="bg-muted/30 cursor-not-allowed font-semibold text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía *</Label>
                        <InputGroup leftIcon={<CreditCard className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteCedula || "1714523698"} disabled className="bg-muted/30 cursor-not-allowed font-mono text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución *</Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteCargo || "Especialista de Infraestructura"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece *</Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteAreaUnidad || "Dirección de Tecnologías de Información"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional *</Label>
                        <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteEmail || "suplente@institucion.gob.ec"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional *</Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteTelefonoFijo || "023814400 ext 124"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Móvil Institucional *</Label>
                        <InputGroup leftIcon={<Smartphone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteMovilInstitucional || "0998877665"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-foreground">Móvil Personal *</Label>
                        <InputGroup leftIcon={<Smartphone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput value={selectedSolicitud.anexoA?.suplenteMovilPersonal || "0981122334"} disabled className="bg-muted/30 cursor-not-allowed text-xs text-foreground" />
                        </InputGroup>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setDetailTab(0)}
                  className="text-xs font-semibold gap-1.5">
                  
                    ? Volver a Entidad
                  </Button>
                  <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setDetailTab(2)}
                  className="text-xs font-semibold gap-1.5">
                  
                    Siguiente: Servicios y Procesos ?
                  </Button>
                </div>
                </div>
              </div>
          }

            {/* -- PASO 2: SERVICIOS Y PROCESOS DE USO -- */}
            {detailTab === 2 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>
                    <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                      <FileCheck2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                      <span>Sección II — Servicios y Herramientas Informáticas</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Procesos y áreas en las que se van a utilizar los servicios y/o herramientas provistos por la DINARP.
                    </p>
                  
                </div>

                <div className="p-6 sm:p-8 space-y-6">
<Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                    SERVICIOS DINARP
                  </Badge>
                </div>

                <div className="space-y-6">
                  {/* 2.1 Servicios */}
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                        <FileCheck2 className="size-4 text-muted-foreground shrink-0" />
                        <span>2.1 Servicios y/o herramientas requeridas *</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Selecciona al menos uno de los servicios provistos por la DINARP.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {["Interoperabilidad", "Infodigital", "Ficha de Registro Único del Ciudadano"].map((s) => {
                      const isChecked = selectedSolicitud.anexoA?.serviciosHerramientas ?
                      selectedSolicitud.anexoA.serviciosHerramientas.includes(s) :
                      true;
                      return (
                        <div key={s} className="p-3.5 rounded-2xl border border-border bg-surface flex items-center gap-2.5 shadow-2xs">
                            <Checkbox checked={isChecked} disabled />
                            <span className="text-xs font-bold text-foreground">{s}</span>
                          </div>);

                    })}
                    </div>
                  </div>

                  {/* 2.2 Áreas */}
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                        <Building2 className="size-4 text-muted-foreground shrink-0" />
                        <span>2.2 Áreas de uso institucional *</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Indica las áreas administrativas o técnicas de la institución que utilizarán el servicio.
                      </p>
                    </div>

                    <Textarea
                    value={selectedSolicitud.anexoA?.areasUso || "Dirección de Tecnologías de la Información, Dirección de Atención Ciudadana"}
                    disabled
                    rows={2}
                    className="bg-muted/30 cursor-not-allowed text-xs font-medium text-foreground rounded-2xl p-3.5 border-border/80" />
                  
                  </div>

                  {/* 2.3 Procesos */}
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                        <FileText className="size-4 text-muted-foreground shrink-0" />
                        <span>2.3 Procesos para los cuales utilizará los servicios *</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Describe los procesos internos, trámites o plataformas para los cuales se consumirán los datos.
                      </p>
                    </div>

                    <Textarea
                    value={selectedSolicitud.anexoA?.procesosUso || "Validación de identidad ciudadana, verificación de registros y simplificación de trámites institucionales."}
                    disabled
                    rows={2}
                    className="bg-muted/30 cursor-not-allowed text-xs font-medium text-foreground rounded-2xl p-3.5 border-border/80" />
                  
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setDetailTab(1)}
                  className="text-xs font-semibold gap-1.5">
                  
                    ? Volver a Coordinadores
                  </Button>
                  <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setDetailTab(3)}
                  className="text-xs font-semibold gap-1.5">
                  
                    Siguiente: Declaraciones y firma ?
                  </Button>
                </div>
                </div>
              </div>
          }

            {/* -- PASO 3: DECLARACIONES Y FIRMA -- */}
            {detailTab === 3 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                  <div>
                    <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                      <ShieldCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                      <span>Sección III — Declaraciones y Firma</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Declaraciones correspondientes a la solicitud y formalización mediante la firma de la máxima autoridad o delegado.
                    </p>
                  
                </div>

                <div className="p-6 sm:p-8 space-y-6">
<Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                    FORMALIZACIÓN
                  </Badge>
                </div>

                <div className="space-y-5">
                  {/* 2.2 Cláusula Segunda */}
                  <div className="bg-muted/50 p-4 rounded-xl border border-border/40 space-y-3">
                    <h3 className="text-xs font-bold text-foreground">2.2 Cláusula Segunda: Declaraciones del Solicitante</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los arts. 66 numerales 11 y 19 de la Constitución, art. 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos, Ley de Optimización de Trámites, Ley Orgánica de Protección de Datos Personales, y arts. 178, 180 y 229 del COIP. La institución queda obligada a dar a la información el uso exclusivo para el que le sea concedido y custodiarla con prudencia.
                    </p>

                    <div className="flex items-center gap-2.5 pt-1">
                      <Checkbox checked={selectedSolicitud.anexoA?.declaracionesAceptadas ?? true} disabled />
                      <span className="text-xs font-bold text-foreground">
                        Acepto expresamente las declaraciones legales, términos y responsabilidades del Anexo A.
                      </span>
                    </div>
                  </div>

                  {/* Resumen de Firmante */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden">
                    
                      <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                        <User className="size-3.5 text-secondary" />
                        <span>Firmante Autorizado</span>
                      </CardBadge>

                      <div className="space-y-0.5 mt-2">
                        <CardTitle className="text-base font-bold font-heading text-secondary">
                          {selectedSolicitud.anexoA?.representanteLegalNombre || "Ing. César Antonio Martín Moreno"}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium">
                          {selectedSolicitud.anexoA?.representanteLegalCargo || "Ministro de Telecomunicaciones (Representante Legal)"}
                        </CardDescription>
                      </div>

                      <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100">
                        <User className="size-28 text-secondary" />
                      </CardDecorativeIcon>
                    </Card>

                    <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden">
                    
                      <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                        <MapPin className="size-3.5 text-secondary" />
                        <span>Lugar y Fecha</span>
                      </CardBadge>

                      <div className="space-y-0.5 mt-2">
                        <CardTitle className="text-base font-bold font-heading text-secondary">
                          {selectedSolicitud.anexoA?.ciudadFirma || "Quito D.M."}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3.5 text-secondary/80" />
                          <span>{selectedSolicitud.anexoA?.fechaFirma || selectedSolicitud.fechaSolicitud || "24/09/2026"}</span>
                        </CardDescription>
                      </div>

                      <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100">
                        <Calendar className="size-28 text-secondary" />
                      </CardDecorativeIcon>
                    </Card>
                  </div>

                  {/* Certificación de datos */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
                    <Checkbox checked={selectedSolicitud.anexoA?.firmadoDigitalmente ?? true} disabled />
                    <span className="text-xs font-bold text-foreground">
                      Confirmo que la información del Anexo A está completa y es correcta.
                    </span>
                  </div>

                  {/* Certificación y Documento Firmado FirmaEC */}
                  <div className="p-5 rounded-2xl border border-success/30 bg-success/5 space-y-4 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="p-2.5 rounded-xl bg-success/10 text-success shrink-0 mt-0.5">
                          <CheckCircle2 className="size-5" />
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground">
                              {selectedSolicitud.anexoA?.archivoDocumentoFirmado || `ARP-R01_Solicitud_Acceso_SINARP_${(selectedSolicitud.anexoA?.entidadSiglas || "ENTIDAD").toUpperCase()}.pdf`}
                            </h4>
                            <Badge tone="success" appearance="soft" size="sm" className="font-bold text-[10px] px-2 py-0.5 shrink-0">
                              Firma verificada en FirmaEC
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Documento firmado electrónicamente por el Representante Legal. La firma fue confirmada y validada mediante FirmaEC, incluyendo su estampado cronológico. El documento se encuentra disponible para revisión.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                  <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => setDetailTab(2)}
                  className="text-xs font-semibold gap-1.5">
                  
                    ? Volver a Servicios
                  </Button>

                  <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    alert(`Descargando documento firmado ARP-R01_Solicitud_Acceso_SINARP_${(selectedSolicitud.anexoA?.entidadSiglas || "ENTIDAD").toUpperCase()}.pdf con validación FirmaEC...`);
                  }}
                  className="h-9 px-4 text-xs font-semibold gap-2 shadow-xs">
                  
                    <Download className="size-4" />
                    <span>Descargar Anexo A</span>
                  </Button>
                </div>
                </div>
              </div>
          }

            
            {/* -- PASO 5: INFORMACIÓN DEL TRÁMITE (NORMATIVIDAD) -- */}
            {detailTab === 5 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                      <FileText className="size-5 shrink-0" />
                      <span>Antecedentes del Trámite</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expediente validado por Gestión y Registro. Incluye el Anexo A formalizado.
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-sm font-bold text-foreground mb-4">Documentos del Expediente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSolicitud.documentos?.map((doc, i) =>
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate" title={doc}>{doc}</span>
                            <span className="text-[11px] text-muted-foreground">Documento PDF (Solo lectura)</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" title="Ver documento">
                          <Eye className="size-4" />
                        </Button>
                      </div>
                )}
                    {!selectedSolicitud.documentos?.length &&
                <div className="col-span-full py-8 text-center text-xs text-muted-foreground bg-muted/20 border border-border border-dashed rounded-xl">
                        No hay documentos adjuntos.
                      </div>
                }
                  </div>
                </div>
              </div>
          }

            {/* -- PASO 6: RESOLUCIÓN INSTITUCIONAL (NORMATIVIDAD) -- */}
            {detailTab === 6 &&
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200">
                <div className="bg-primary/10 dark:bg-primary/20 border-b border-primary p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                      <FileSignature className="size-5 shrink-0" />
                      <span>Formulación de Resolución Institucional</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedSolicitud.resolucion ? "Resolución generada y vinculada." : "El expediente requiere la generación del documento habilitante."}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4">
                  {selectedSolicitud.resolucion ?
              <>
                      <div className="size-16 rounded-full bg-success/15 text-success flex items-center justify-center mb-2">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground">Resolución {selectedSolicitud.resolucion}</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        La resolución ha sido generada correctamente por el equipo de Normatividad y se encuentra en etapa de suscripción por la máxima autoridad de la DINARP.
                      </p>
                    </> :

              <>
                      <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                        <FileSignature className="size-8" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-foreground">Generación Pendiente</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        El funcionario responsable deberá redactar y adjuntar la resolución institucional fundamentada en la aprobación del Anexo A para concluir el trámite normativo.
                      </p>
                    </>
              }
                </div>
              </div>
          }

            {/* -- PASO 4: HISTORIAL COMPLETO Y REGLAS BPM DEL TRÁMITE -- */}
            {detailTab === 4 &&
          <div className="space-y-4 animate-in fade-in duration-200">
                {/* Encabezado Trazabilidad en Card Featured variante Info (Arriba del contenedor) */}
                <Card
              variant="featured"
              disableHover={true}
              className="bg-info-100/30 dark:bg-info-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden">
              
                  <div className="flex items-center gap-2">
                    <CardBadge className="bg-info/20 text-info text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 flex items-center gap-1.5">
                      <History className="size-3.5 text-info" />
                      <span>{timelineItems.length} {timelineItems.length === 1 ? "EVENTO REGISTRADO" : "EVENTOS REGISTRADOS"}</span>
                    </CardBadge>
                  </div>

                  <CardTitle className="text-lg sm:text-xl font-bold font-heading text-info mt-1">
                    Trazabilidad y Línea de Tiempo del Trámite
                  </CardTitle>

                  <CardDescription className="text-xs text-info-800/80 dark:text-info-200/80 font-medium">
                    Historial cronológico completo de envíos, asignaciones, revisiones técnicas y resoluciones emitidas.
                  </CardDescription>

                  <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                    <History className="size-32 text-info" />
                  </CardDecorativeIcon>
                </Card>

                {/* Contenedor principal de la sección */}
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cronología Completa (2 cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <History className="size-4 text-foreground" />
                      Cronología Registrada
                    </h3>

                    <div className="pt-2">
                      <Timeline items={timelineItems} />
                    </div>
                  </div>

                  {/* Reglas BPM y Trazabilidad (1 col) */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Activity className="size-4 text-foreground" />
                      Trazabilidad del Trámite
                    </h3>

                    <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">N.º de Trámite Unificado:</span>
                        <strong className="font-mono text-foreground text-sm">{selectedSolicitud.id}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Estado Actual:</span>
                        <strong className="text-foreground">{getEstadoBadgeProps(selectedSolicitud.estado).label}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Revisor de Gestión:</span>
                        <strong className="text-foreground">{selectedSolicitud.revisorGestion || selectedSolicitud.revisor || "Sin asignar"}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Revisor de Normatividad:</span>
                        <strong className="text-foreground">{selectedSolicitud.revisorNormatividad || "Pendiente"}</strong>
                      </div>

                      <div className="pt-2 border-t border-border/60">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          El historial se conserva durante todo el ciclo de vida del trámite con persistencia automática en el almacén de la simulación.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          </Card> : (

        /* ----------------------------------------------------------
            VISTA 2: LISTADO DE TRÁMITES (FILTROS POR PROCESO + TABLA)
           ---------------------------------------------------------- */
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 pr-6 sm:pr-8 lg:pr-10 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full">
          
            {/* -- 1. Encabezado Principal -- */}
            {(() => {
            const isDirGestion = currentUser.role === "DIR_GESTION";
            const isEqGestion = currentUser.role === "EQ_GESTION";
            const isDirNormativa = currentUser.role === "DIR_NORMATIVA";
            const isEqNormativa = currentUser.role === "EQ_NORMATIVA";

            let badgeText = "Equipo de Normatividad · DINARP";
            let titleText = "Solicitudes pendientes por generar resolución";
            let subtitleText = "Análisis normativo y resolución jurídica de solicitudes asignadas a tu usuario.";

            if (isEqGestion) {
              badgeText = "Equipo de Gestión y Registro · DINARP";
              titleText = "Solicitudes pendientes de revisión";
              subtitleText = "Consulta y revisa las solicitudes asignadas para su aprobación o rechazo.";
            } else if (isDirNormativa) {
              badgeText = "Dirección de Normatividad · DINARP";
              titleText = "Asignación de solicitudes para generar resoluciones";
              subtitleText = "Asignación de solicitudes para generar resoluciones a instituciones aprobadas.";
            } else if (isEqNormativa) {
              badgeText = "Equipo de Normatividad · DINARP";
              titleText = "Solicitudes pendientes por generar resolución";
              subtitleText = "Análisis normativo y resolución jurídica de solicitudes asignadas a tu usuario.";
            } else if (isDirGestion) {
              badgeText = "Dirección de Gestión y Registro · DINARP";
              titleText = "Asignación de solicitudes";
              subtitleText = "Gestiona y asigna las solicitudes pendientes a los revisores del área de gestión.";
            }
            return (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 w-full">

                    <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                      {titleText}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                      {subtitleText}
                    </p>
                  </div>
                </div>);

          })()}

            {/* -- 2. Resumen Superior (Tarjetas Interactivas con Layout Horizontal Optimizado) -- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 w-full">
              {/* Card 1: Pendientes por generar resolución (EQ_NORMATIVA) / Pendientes de asignación (DIR_NORMATIVA) */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "PENDIENTES" : "SIN_ASIGNAR";
                  setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "PENDIENTES" : "SIN_ASIGNAR";
                    setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  (currentUser.role === "EQ_NORMATIVA" ? filterEstado === "PENDIENTES" : filterEstado === "SIN_ASIGNAR") ?
                  "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs" :
                  "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        (currentUser.role === "EQ_NORMATIVA" ? filterEstado === "PENDIENTES" : filterEstado === "SIN_ASIGNAR") ?
                        "bg-warning text-white shadow-xs" :
                        "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white"
                      )}
                    >
                      <Clock className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-warning transition-colors truncate">
                          {currentUser.role === "EQ_NORMATIVA" ? "Pendientes por generar resolución" : "Pendientes de asignación"}
                        </h3>
                        {(currentUser.role === "EQ_NORMATIVA" ? filterEstado === "PENDIENTES" : filterEstado === "SIN_ASIGNAR") && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-warning/20 text-warning border border-warning/30 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        {currentUser.role === "EQ_NORMATIVA" ? "Asignadas para generar resolución" : "Requieren asignar un revisor"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl text-warning tracking-tight block leading-none">
                      {currentUser.role === "EQ_NORMATIVA" ? dynamicKpis.pendientes : dynamicKpis.sinAsignar}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>

              {/* Card 2: En Generación (EQ_NORMATIVA) / Asignadas (DIR_NORMATIVA) */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "EN_GENERACION_RESOLUCION" : "EN_REVISION";
                  setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "EN_GENERACION_RESOLUCION" : "EN_REVISION";
                    setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  (currentUser.role === "EQ_NORMATIVA" ? (filterEstado === "EN_GENERACION_RESOLUCION" || filterEstado === "EN_GENERACION") : filterEstado === "EN_REVISION") ?
                  "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-xs" :
                  "bg-primary/5 hover:bg-primary/10 border-primary/25 shadow-2xs"
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        (currentUser.role === "EQ_NORMATIVA" ? (filterEstado === "EN_GENERACION_RESOLUCION" || filterEstado === "EN_GENERACION") : filterEstado === "EN_REVISION") ?
                        "bg-primary text-white shadow-xs" :
                        "bg-primary/15 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                      )}
                    >
                      <Activity className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground transition-colors truncate group-hover:text-primary">
                          {currentUser.role === "EQ_NORMATIVA" ? "En generación" : "Asignadas"}
                        </h3>
                        {(currentUser.role === "EQ_NORMATIVA" ? (filterEstado === "EN_GENERACION_RESOLUCION" || filterEstado === "EN_GENERACION") : filterEstado === "EN_REVISION") && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full border shrink-0 bg-primary/20 text-primary border-primary/30">
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        {currentUser.role === "EQ_NORMATIVA" ? "En redacción o análisis jurídico" : "En gestión de resolución"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight block leading-none text-primary">
                      {dynamicKpis.enRevision}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>

              {/* Card 3: Generación pausada / con consultas (EQ_NORMATIVA) / Resoluciones generadas (DIR_NORMATIVA) */}
              <Card
                variant="featured"
                role="button"
                tabIndex={0}
                onClick={() => {
                  const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "GENERACION_PENDIENTE" : "RESOLUCION_GENERADA";
                  setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const targetFilter = currentUser.role === "EQ_NORMATIVA" ? "GENERACION_PENDIENTE" : "RESOLUCION_GENERADA";
                    setFilterEstado(filterEstado === targetFilter ? "Todos" : targetFilter);
                    setCurrentPage(1);
                  }
                }}
                className={cn(
                  "group relative overflow-hidden cursor-pointer transition-all duration-200 border rounded-xl outline-none select-none p-4 sm:p-4.5 w-full",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  (currentUser.role === "EQ_NORMATIVA" ? filterEstado === "GENERACION_PENDIENTE" : (filterEstado === "RESOLUCION_GENERADA" || filterEstado === "APROBADO_FINAL")) ?
                  (currentUser.role === "EQ_NORMATIVA" ? "bg-warning/15 border-warning ring-2 ring-warning/40 shadow-xs" : "bg-success/15 border-success ring-2 ring-success/40 shadow-xs") :
                  (currentUser.role === "EQ_NORMATIVA" ? "bg-warning/5 hover:bg-warning/10 border-warning/25 shadow-2xs" : "bg-success/5 hover:bg-success/10 border-success/25 shadow-2xs")
                )}
                innerClassName="p-0 h-full justify-center"
              >
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200",
                        (currentUser.role === "EQ_NORMATIVA" ? filterEstado === "GENERACION_PENDIENTE" : (filterEstado === "RESOLUCION_GENERADA" || filterEstado === "APROBADO_FINAL")) ?
                        (currentUser.role === "EQ_NORMATIVA" ? "bg-warning text-white shadow-xs" : "bg-success text-white shadow-xs") :
                        (currentUser.role === "EQ_NORMATIVA" ? "bg-warning/15 text-warning group-hover:scale-105 group-hover:bg-warning group-hover:text-white" : "bg-success/15 text-success group-hover:scale-105 group-hover:bg-success group-hover:text-white")
                      )}
                    >
                      {currentUser.role === "EQ_NORMATIVA" ? <Clock className="size-5" /> : <CheckCircle2 className="size-5" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className={cn(
                          "text-sm font-bold text-foreground transition-colors truncate",
                          currentUser.role === "EQ_NORMATIVA" ? "group-hover:text-warning" : "group-hover:text-success"
                        )}>
                          {currentUser.role === "EQ_NORMATIVA" ? "Generación pausada" : "Resoluciones generadas"}
                        </h3>
                        {(currentUser.role === "EQ_NORMATIVA" ? filterEstado === "GENERACION_PENDIENTE" : (filterEstado === "RESOLUCION_GENERADA" || filterEstado === "APROBADO_FINAL")) && (
                          <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.2 rounded-full border shrink-0",
                            currentUser.role === "EQ_NORMATIVA" ? "bg-warning/20 text-warning border-warning/30" : "bg-success/20 text-success border-success/30"
                          )}>
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-normal truncate">
                        {currentUser.role === "EQ_NORMATIVA" ? "Con requerimiento o consulta jurídica" : "Resoluciones emitidas formalmente"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className={cn(
                      "font-heading font-extrabold text-3xl sm:text-4xl tracking-tight block leading-none",
                      currentUser.role === "EQ_NORMATIVA" ? "text-warning" : "text-success"
                    )}>
                      {currentUser.role === "EQ_NORMATIVA" ? dynamicKpis.pausadas : dynamicKpis.resueltas}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium block mt-1">
                      solicitudes
                    </span>
                  </div>
                </div>
              </Card>
            </div>

      {/* -- Línea separadora entre KPI Cards y Filtros -- */}
            <div className="w-full h-[1.5px] bg-border my-4 shrink-0" />

            {/* -- 4. Buscador y Filtros por Combobox en Una Fila Sin Caja -- */}
            <div className="space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-3 w-full">
                {/* Buscador amplio y flexible */}
                <div className="flex-1 min-w-[240px] sm:min-w-[280px]">
                  <Search
                  placeholder="Buscar por cédula, nombre, código, correo o entidad..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => setSearchQuery("")}
                  className="bg-surface border-border/80 shadow-2xs h-9 text-xs w-full rounded-full" />
                
                </div>

                {/* Filtros Combobox del UI Kit con ancho holgado y responsivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap items-end gap-2.5">
                  <FilterCombobox
                  label="Proceso"
                  placeholder="Proceso..."
                  groupLabel="Tipo de Proceso"
                  options={procesoOptions}
                  value={filterTramite}
                  onChange={(val) => {
                    setFilterTramite(val);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-[195px]" />
                

                  <FilterCombobox
                  label="Estado"
                  placeholder="Estado..."
                  groupLabel="Estado de Solicitud"
                  options={estadoOptions}
                  value={filterEstado}
                  onChange={(val) => {
                    setFilterEstado(val);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-[205px]" />
                

                  <FilterCombobox
                  label="Institución"
                  placeholder="Institución..."
                  groupLabel="Institución Solicitante"
                  options={institucionOptions}
                  value={filterInstitucion}
                  onChange={(val) => {
                    setFilterInstitucion(val);
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-[215px]" />
                

                  <FilterCombobox
                  label="Orden"
                  placeholder="Ordenar..."
                  groupLabel="Criterio de Orden"
                  options={sortOptions}
                  value={sortOrder}
                  onChange={(val) => setSortOrder(val as any)}
                  className="w-full lg:w-[195px]" />
                
                </div>
              </div>

              {/* Badges / Chips de filtros activos */}
              {hasActiveFilters &&
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Mostrando resultados filtrados por:
                  </span>

                  {searchQuery.trim() !== "" &&
              <Badge
                tone="neutral"
                appearance="soft"
                className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full border border-border">
                
                      <span>Búsqueda: &quot;{searchQuery}&quot;</span>
                      <X
                  className="size-3.5 cursor-pointer hover:text-foreground/80 transition-colors"
                  onClick={() => setSearchQuery("")} />
                
                    </Badge>
              }

                  {filterTramite !== "TODOS" &&
              <Badge
                tone="neutral"
                appearance="soft"
                className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full border border-border">
                
                      <span>
                        {procesoOptions.find((o) => o.value === filterTramite)?.label}
                      </span>
                      <X
                  className="size-3.5 cursor-pointer hover:text-foreground/80 transition-colors"
                  onClick={() => setFilterTramite("TODOS")} />
                
                    </Badge>
              }

                  {filterEstado !== "Todos" &&
              <Badge
                tone={getEstadoBadgeProps(filterEstado as EstadoSolicitudIngreso).tone}
                appearance="soft"
                dot
                className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full">
                
                      <span>Estado: {getEstadoBadgeProps(filterEstado as EstadoSolicitudIngreso).label}</span>
                      <X
                  className="size-3.5 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setFilterEstado("Todos")} />
                
                    </Badge>
              }

                  {filterInstitucion !== "Todas" &&
              <Badge
                tone="neutral"
                appearance="soft"
                className="gap-1.5 px-3 py-1 font-semibold text-xs rounded-full border border-border">
                
                      <span>Institución: {filterInstitucion}</span>
                      <X
                  className="size-3.5 cursor-pointer hover:text-foreground/80 transition-colors"
                  onClick={() => setFilterInstitucion("Todas")} />
                
                    </Badge>
              }

                  <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 rounded-full">
                
                    Restablecer todos
                  </Button>
                </div>
            }
            </div>

      {/* -- 5. Tabla de Solicitudes y Trámites -- */}
            {(() => {
            const assignableRows = paginatedData.filter((r) => {
              const { puedeReasignar } = puedeReasignarSolicitud(r, currentUser.role);
              return puedeReasignar;
            });

            const isAllAssignableSelected = assignableRows.length > 0 && assignableRows.every((r) => selectedIds.includes(r.id));

            const toggleSelectAll = () => {
              if (isAllAssignableSelected) {
                setSelectedIds([]);
              } else {
                setSelectedIds(assignableRows.map((r) => r.id));
              }
            };

            const toggleSelectRow = (id: string) => {
              setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
              );
            };

            return (
              <>
                  {/* Vista de Tabla para Escritorio */}
                  <div className="hidden md:block">
                    <Table
                    className="w-full table-fixed min-w-[1080px]"
                    containerClassName="overflow-x-auto rounded-xl">
                    
                    <TableHeader>
                      <TableRow className="border-0 h-11">
                        {currentUser.role !== "EQ_NORMATIVA" && (
                          <TableHead className="w-9 px-2 py-2.5 text-center shrink-0">
                            <Checkbox
                              disabled={assignableRows.length === 0}
                              checked={isAllAssignableSelected}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Seleccionar todos los trámites asignables"
                            />
                          </TableHead>
                        )}
                        <TableHead className="w-[130px] px-2 py-2.5 whitespace-nowrap">
                          TRÁMITE
                        </TableHead>
                        <TableHead className="w-[160px] px-2 py-2.5 whitespace-nowrap">
                            PROCESO
                          </TableHead>
                        <TableHead className="w-[190px] px-2 py-2.5 whitespace-nowrap">
                            SOLICITANTE
                          </TableHead>
                        <TableHead className="w-[210px] px-2 py-2.5 whitespace-nowrap">
                          INSTITUCIÓN
                        </TableHead>
                        <TableHead className="w-[110px] px-2 py-2.5 whitespace-nowrap">
                          FECHA
                        </TableHead>
                        <TableHead className="w-[170px] px-2 py-2.5 whitespace-nowrap">
                          ESTADO
                        </TableHead>
                        {currentUser.role !== "EQ_NORMATIVA" && (
                          <TableHead className="w-[150px] px-2 py-2.5 whitespace-nowrap">
                            ASIGNADO
                          </TableHead>
                        )}
                        <TableHead className={cn("text-right pr-4", currentUser.role === "EQ_NORMATIVA" ? "w-32" : "w-24")}>
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ?
                      <TableRow>
                          <TableCell colSpan={currentUser.role === "EQ_NORMATIVA" ? 7 : 9} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-2">
                              <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                                <SearchIcon className="size-4 size-6" />
                              </div>
                              <h3 className="font-heading font-bold text-base text-foreground">
                                No hay trámites registrados
                              </h3>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                No se encontraron trámites que coincidan con los filtros seleccionados.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow> :

                      paginatedData.map((row) => {
                        const { puedeReasignar, esReasignacion, motivoBloqueo } = puedeReasignarSolicitud(row, currentUser.role);
                        const isAssignable = puedeReasignar;
                        const isSelected = selectedIds.includes(row.id);

                        const revisorAsignado =
                        currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" ?
                        row.revisorNormatividad :
                        row.revisorGestion || row.revisor;

                        return (
                          <TableRow
                            key={row.id}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-muted/40",
                              isSelected && "bg-primary/5"
                            )}
                            onClick={() => handleSelectSolicitud(row)}>
                            
                              {/* Checkbox */}
                              {currentUser.role !== "EQ_NORMATIVA" && (
                                <TableCell className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                  disabled={!isAssignable}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleSelectRow(row.id)}
                                  aria-label={`Seleccionar trámite ${row.id}`} />
                                </TableCell>
                              )}

                              {/* N.º Trámite */}
                              <TableCell className="px-2 font-mono text-xs overflow-hidden">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col truncate cursor-pointer">
                                      <span className="font-bold text-foreground truncate">{row.id}</span>
                                      <span className="text-[10px] text-muted-foreground truncate">{row.codigoDocumental}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                    <p className="font-bold text-xs text-foreground font-sans">Identificador de trámite</p>
                                    <p className="font-mono text-xs text-primary font-bold">{row.id}</p>
                                    {row.codigoDocumental &&
                                  <p className="font-mono text-[10px] text-muted-foreground">Documento: {row.codigoDocumental}</p>
                                  }
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>

                              {/* Proceso */}
                              <TableCell className="px-2 overflow-hidden">
                                {(() => {
                                const procesoLabel =
                                row.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ?
                            "Anexo A — Registro Institución" :
                                row.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ?
                            "Anexo B — Enrolamiento Coordinador" :
                                row.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ?
                            "Anexo C — Cambio de Coordinador" :
                            row.tituloTramite || "Otro trámite";

                                const procesoShort =
                                row.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ?
                                "Anexo A" :
                                row.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ?
                                "Anexo B" :
                                row.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ?
                                "Anexo C" :
                            "Trámite";

                                const subtitulo =
                                row.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ?
                            "Registro Institución" :
                                row.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ?
                                "Enrolamiento Coordinador" :
                                row.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ?
                                "Cambio de Coordinador" :
                                row.tituloTramite || "General";

                                return (
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex flex-col min-w-0 group/proc cursor-pointer">
                                          <span className="font-semibold text-foreground text-xs leading-snug truncate" title={procesoLabel}>
                                            {procesoLabel}
                                          </span>
                                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <span className="truncate">{procesoShort}</span>
                                            <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/proc:bg-primary/10 group-hover/proc:text-primary transition-colors shrink-0">
                                              +
                                            </span>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex-col items-start gap-0.5">
                                        <p className="font-bold text-xs text-foreground">{procesoLabel}</p>
                                        <p className="text-[11px] text-muted-foreground">{subtitulo}</p>
                                        {row.codigoDocumental &&
                                      <p className="font-mono text-[10px] text-primary mt-1 border-t border-border/60 pt-1">
                                            Código: {row.codigoDocumental}
                                          </p>
                                      }
                                      </TooltipContent>
                                    </Tooltip>);

                              })()}
                              </TableCell>

                              {/* Solicitante */}
                              <TableCell className="px-2 overflow-hidden">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex flex-col min-w-0 group/sol cursor-pointer">
                                        <span className="font-bold text-foreground text-xs leading-snug truncate" title={row.nombreCompleto}>
                                          {row.nombreCompleto}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                          <span className="truncate">{row.cedula}</span>
                                          <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/sol:bg-primary/10 group-hover/sol:text-primary transition-colors shrink-0">
                                            +
                                          </span>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" variant="surface" className="p-3 max-w-xs flex-col items-start gap-1">
                                      <p className="font-bold text-xs text-foreground">{row.nombreCompleto}</p>
                                      <p className="font-mono text-[11px] text-muted-foreground">C.I. {row.cedula}</p>
                                      <p className="text-[11px] text-primary font-medium">{row.correo}</p>
                                      <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-1 mt-1">{row.institucion}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>

                              {/* Institución */}
                              <TableCell className="px-2 overflow-hidden">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex flex-col min-w-0 group/inst cursor-pointer">
                                      <span className="truncate block text-foreground text-xs font-semibold leading-snug">
                                        {row.institucion}
                                      </span>
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <span className="truncate font-mono">{row.anexoA?.rucEntidad || "1768000000001"}</span>
                                        <span className="text-[9px] px-1 rounded bg-muted/60 text-muted-foreground font-sans font-semibold group-hover/inst:bg-primary/10 group-hover/inst:text-primary transition-colors shrink-0">
                                          +
                                        </span>
                                      </div>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex-col items-start gap-1">
                                    <p className="font-bold text-xs text-foreground leading-snug">{row.institucion}</p>
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                      RUC: {row.anexoA?.rucEntidad || "1768000000001"}
                                    </p>
                                    {row.anexoA?.direccionEntidad &&
                                  <p className="text-[10px] text-muted-foreground border-t border-border/60 pt-1 mt-0.5">
                                        {row.anexoA.direccionEntidad}
                                      </p>
                                  }
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>

                              {/* Fecha */}
                              <TableCell className="px-2 text-muted-foreground font-mono text-xs overflow-hidden">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="block truncate cursor-pointer hover:text-foreground transition-colors">
                                      {row.fechaSolicitud}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                    <p className="font-bold text-xs text-foreground font-sans">Fecha y hora de registro</p>
                                    <p className="font-mono text-xs text-muted-foreground">{row.fechaSolicitud}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TableCell>

                              {/* Estado */}
                              <TableCell className="px-2 overflow-hidden">
                                <div className="flex items-center min-w-0">
                                  {renderEstadoBadge(row.estado, row.revisionIniciada)}
                                </div>
                              </TableCell>

                              {/* Asignado */}
                              {currentUser.role !== "EQ_NORMATIVA" && (
                                <TableCell className="px-2 text-xs overflow-hidden">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center min-w-0 cursor-pointer">
                                        {revisorAsignado ? (
                                          <span className="text-[11px] font-medium text-foreground truncate block">
                                            {revisorAsignado}
                                          </span>
                                        ) : (
                                          <span className="text-[11px] text-muted-foreground italic font-mono truncate block hover:text-foreground transition-colors">
                                            Sin asignar
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" variant="surface" className="p-2.5 max-w-xs flex flex-col items-start gap-0.5">
                                      <p className="font-bold text-xs text-foreground font-sans">
                                        {revisorAsignado ? ((currentUser.role as string) === "DIR_NORMATIVA" || (currentUser.role as string) === "EQ_NORMATIVA" ? "Revisor de Normatividad" : "Revisor de Gestión") : "Estado de asignación"}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {revisorAsignado ? revisorAsignado : "Trámite pendiente de asignar"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              )}

                              {/* Acciones */}
                              <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Si es Personal de Normatividad (EQ_NORMATIVA), acción principal directa: 'Gestionar resolución' */}
                                  {currentUser.role === "EQ_NORMATIVA" ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGestionarResolucion(row);
                                          }}
                                          aria-label={`Gestionar resolución para trámite ${row.id}`}
                                          variant="ghost"
                                          size="icon-sm"
                                          className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                          <FileSignature className="size-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top">
                                        Gestionar resolución institucional
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (

                                <>
                                      {isAssignable ?
                                  <Tooltip>
                                          <TooltipTrigger asChild>
                        <Button type="button" onClick={(e) => {e.stopPropagation();handleOpenAssign(row);}} aria-label={esReasignacion ? `Reasignar revisor a trámite ${row.id}` : `Asignar revisor a trámite ${row.id}`} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                              {esReasignacion ? <RotateCcw className="size-4" /> : <UserPlus className="size-4" />}
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent side="top">
                                            {esReasignacion ? `Reasignar revisor (trámite aún no iniciado por ${revisorAsignado})` : "Asignar"}
                                          </TooltipContent>
                                        </Tooltip> :
                                  motivoBloqueo && revisorAsignado && !["Aprobada", "APROBADO_FINAL", "Finalizado", "Rechazada", "Cancelada", "Cerrada"].includes(row.estado) ?
                                  <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="size-7 rounded-lg flex items-center justify-center text-muted-foreground/40 cursor-not-allowed border border-dashed border-border/50 gap-3">
                                              <Lock className="size-4" />
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent side="top" className="size-4 max-w-xs text-xs">
                                            {motivoBloqueo}
                                          </TooltipContent>
                                        </Tooltip> :
                                  null}

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                        <Button type="button" onClick={(e) => {e.stopPropagation();handleSelectSolicitud(row);}} aria-label={`Ver detalle de trámite ${row.id}`} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                            <Eye className="size-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">Ver detalle</TooltipContent>
                                      </Tooltip>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>);

                      })
                      }
                    </TableBody>
                  </Table>
                </div>

                {/* Vista Mobile Card Row (Responsive) para Pantallas Estrechas */}
                <div className="block md:hidden">
                  {paginatedData.length === 0 ?
                  <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border rounded-xl text-center space-y-2">
                      <div className="size-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-1">
                        <SearchIcon className="size-6" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground">
                        No hay trámites registrados
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        No se encontraron trámites que coincidan con los filtros seleccionados.
                      </p>
                    </div> :

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {paginatedData.map((row) => {
                      const { puedeReasignar, esReasignacion } = puedeReasignarSolicitud(row, currentUser.role);
                      const isAssignable = puedeReasignar;
                      const isSelected = selectedIds.includes(row.id);
                      const revisorAsignado =
                      currentUser.role === "DIR_NORMATIVA" || currentUser.role === "EQ_NORMATIVA" ?
                      row.revisorNormatividad :
                      row.revisorGestion || row.revisor;

                      const procesoLabel =
                      row.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" ?
                          "Anexo A — Registro Institución" :
                      row.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" ?
                          "Anexo B — Enrolamiento Coordinador" :
                      row.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" ?
                          "Anexo C — Cambio de Coordinador" :
                          row.tituloTramite || "Otro trámite";

                      return (
                        <div
                          key={row.id}
                          onClick={() => handleSelectSolicitud(row)}
                          className={cn(
                            "p-4 rounded-xl border border-border bg-surface space-y-3 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-xs cursor-pointer",
                            isSelected && "ring-2 ring-primary/40 bg-primary/5 border-primary/30"
                          )}>
                          
                            {/* Cabecera: Checkbox + ID + Código + Badge de Estado */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50 min-w-0">
                              <div className="flex items-center gap-2.5 min-w-0 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {currentUser.role !== "EQ_NORMATIVA" && (
                                  <Checkbox
                                    disabled={!isAssignable}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleSelectRow(row.id)}
                                    aria-label={`Seleccionar trámite ${row.id}`}
                                  />
                                )}
                              
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-xs font-mono text-primary whitespace-nowrap">{row.id}</span>
                                  {row.codigoDocumental && (
                                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">{row.codigoDocumental}</span>
                                  )}
                                </div>
                              </div>
                              <div className="min-w-0 flex justify-end shrink">
                                {renderEstadoBadge(row.estado, row.revisionIniciada)}
                              </div>
                            </div>

                            {/* Cuerpo: Proceso + Institución con RUC + Solicitante con Cédula y Correo */}
                            <div className="space-y-2 py-0.5">
                              <div>
                                <p className="font-bold text-sm text-foreground leading-snug">{procesoLabel}</p>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                {/* Institución */}
                                <div className="flex items-start gap-2 text-foreground font-medium">
                                  <Building2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="break-words leading-tight">{row.institucion}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      RUC: {row.anexoA?.rucEntidad || "1768000000001"}
                                    </span>
                                  </div>
                                </div>

                                {/* Solicitante */}
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <User className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-foreground font-medium break-words leading-tight">{row.nombreCompleto}</span>
                                    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground font-mono mt-0.5">
                                      <span>C.I. {row.cedula}</span>
                                      <span>•</span>
                                      <span className="font-sans text-primary break-all">{row.correo}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Pie: Fecha + Asignación + Acciones */}
                            <div className="flex items-center justify-between pt-2.5 border-t border-border/60 gap-2 flex-wrap sm:flex-nowrap">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[10px] text-muted-foreground">Fecha ingreso:</span>
                                <span className="font-mono text-xs text-foreground font-medium whitespace-nowrap">{row.fechaSolicitud}</span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
                                {currentUser.role !== "EQ_NORMATIVA" && (
                                  revisorAsignado ? (
                                    <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px] border border-border px-2 py-0.5">
                                      <User className="size-2.5 mr-1 text-primary shrink-0" />
                                      <span className="whitespace-nowrap">{revisorAsignado}</span>
                                    </Badge>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground italic font-sans whitespace-nowrap">Sin asignar</span>
                                  )
                                )}

                                {currentUser.role === "EQ_NORMATIVA" ? (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleGestionarResolucion(row);
                                    }}
                                    className="size-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    aria-label={`Gestionar resolución para trámite ${row.id}`}
                                  >
                                    <FileSignature className="size-3.5" />
                                  </Button>
                                ) : (
                                  <>
                                    {isAssignable && (
                                      <Button
                                        type="button"
                                        variant={esReasignacion ? "neutral" : "primary"}
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenAssign(row);
                                        }}
                                        className={cn(
                                          "h-7 px-2 text-xs font-semibold rounded-lg shadow-2xs gap-1",
                                          esReasignacion && "border border-border text-foreground hover:bg-muted"
                                        )}
                                        aria-label={esReasignacion ? "Reasignar revisor" : "Asignar revisor"}
                                      >
                                        {esReasignacion ? <RotateCcw className="size-3" /> : <UserPlus className="size-3" />}
                                        <span>{esReasignacion ? "Reasignar" : "Asignar"}</span>
                                      </Button>
                                    )}

                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectSolicitud(row);
                                      }}
                                      className="h-7 px-2 text-xs font-semibold rounded-lg border-border/80 text-foreground hover:bg-muted shadow-2xs gap-1"
                                      aria-label={`Ver detalle de trámite ${row.id}`}
                                    >
                                      <Eye className="size-3" />
                                      <span>Detalle</span>
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>);

                    })}
                    </div>
                  }
                </div>

                {/* Barra Flotante Contextual para Asignación Masiva */}
                {currentUser.role !== "EQ_NORMATIVA" && selectedIds.length > 0 &&
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-foreground text-background dark:bg-card dark:text-card-foreground px-4 sm:px-6 py-3 sm:py-3.5 rounded-2xl shadow-xl border border-border flex items-center justify-between gap-3 sm:gap-5 w-[calc(100%-2rem)] max-w-md sm:w-auto animate-slide-up">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <CheckCircle2 className="size-4 text-primary shrink-0" />
                      <span>{selectedIds.length} {selectedIds.length === 1 ? "solicitud seleccionada" : "solicitudes seleccionadas"}</span>
                    </div>
                      <div className="flex items-center gap-2">
                        <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSolicitudesMasivas(solicitudes.filter((s) => selectedIds.includes(s.id)));
                        setIsAssignMasivoOpen(true);
                      }}
                      className="h-8 text-xs font-bold px-4 rounded-xl gap-1.5 shadow-xs">
                      
                          <UserPlus className="size-3.5" />
                          <span>Asignar revisor</span>
                        </Button>

                        <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedIds([])}
                      className="h-8 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-muted/50 px-3 rounded-xl transition-colors">
                      
                          Cancelar
                        </Button>
                      </div>
                    </div>
                }
                </>);

          })()}

      {/* -- 6. Paginación y Contador de filas -- */}
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 sm:gap-4 pt-4 pb-2 w-full border-t border-border/50">
              {/* Información y Selector de filas */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2.5 sm:gap-4 w-full md:w-auto text-center md:text-left">
                <p className="text-xs text-muted-foreground font-medium text-center md:text-left">
                  Mostrando{" "}
                  <span className="font-bold text-foreground">
                    {filteredData.length === 0 ?
                  0 :
                  (currentPage - 1) * itemsPerPage + 1}{" "}
                    - {Math.min(currentPage * itemsPerPage, filteredData.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-foreground">
                    {filteredData.length}
                  </span>{" "}
                  trámites
                </p>

                {/* Selector de filas por página */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>Filas:</span>
                  <div className="inline-flex rounded-full border border-border/80 p-0.5 bg-surface shadow-2xs">
                    {[5, 10, 20, 50].map((size) =>
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "px-2.5 py-0.5 text-xs font-semibold rounded-full transition-all",
                      itemsPerPage === size ?
                      "bg-surface text-primary shadow-2xs font-bold border border-border/80" :
                      "text-muted-foreground hover:text-foreground"
                    )}>
                    
                        {size}
                      </button>
                  )}
                  </div>
                </div>
              </div>

              {/* Controles de paginación */}
              <div className="w-full md:w-auto flex items-center justify-center md:justify-end overflow-x-auto py-1">
                <Pagination className="mx-auto md:mx-0 w-auto justify-center">
                  <PaginationContent className="gap-1 sm:gap-1.5 flex-nowrap justify-center">
                    <PaginationItem className="hidden sm:inline-flex">
                      <PaginationFirst
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(1);
                      }}
                      className={cn(
                        "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                        currentPage <= 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                      )} />
                    
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={cn(
                        "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                        currentPage <= 1 ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                      )} />
                    
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) =>
                  <PaginationItem key={page}>
                        <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                      className={cn(
                        "size-8 rounded-full font-semibold text-xs transition-all",
                        page === currentPage ?
                        "bg-primary text-white font-bold shadow-2xs" :
                        "border border-border/70 hover:bg-muted/30 text-foreground"
                      )}>
                      
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                  )}

                    <PaginationItem>
                      <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={cn(
                        "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                        currentPage >= totalPages ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                      )} />
                    
                    </PaginationItem>

                    <PaginationItem className="hidden sm:inline-flex">
                      <PaginationLast
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(totalPages);
                      }}
                      className={cn(
                        "size-8 rounded-full border border-border/70 hover:bg-muted/30 transition-colors",
                        currentPage >= totalPages ? "pointer-events-none opacity-40 cursor-not-allowed" : ""
                      )} />
                    
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </Card>)
        }

        {/* -- Modal de Vista Previa de Documento -- */}
        <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
          <DialogContent className="max-w-md p-6">
            {previewDoc &&
            <>
                <DialogHeader className="space-y-2">
                  <div className="size-10 rounded-full bg-muted text-foreground flex items-center justify-center mb-1 border border-border">
                    <FileText className="size-5" />
                  </div>
                  <DialogTitle className="text-base font-bold text-foreground">
                    {previewDoc.titulo}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Documento habilitante suscrito remitido en formato PDF.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Archivo:</span>
                      <span className="font-mono font-bold text-foreground">{previewDoc.archivo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tamaño:</span>
                      <span className="font-semibold text-foreground">{previewDoc.tamano}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Firma digital:</span>
                      <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-[10px] border border-border text-foreground">
                        <Check className="size-2.5" />
                        Válida y Vigente
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entidad certificadora:</span>
                      <span className="font-semibold text-foreground">{previewDoc.autoridad}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setPreviewDoc(null)}
                  className="text-xs font-semibold">
                  
                    Cerrar
                  </Button>
                  <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    toast.success(`Descarga iniciada: ${previewDoc.archivo}`);
                  }}
                  className="text-xs font-semibold gap-1.5">
                  
                    <Download className="size-3.5" />
                    <span>Descargar PDF</span>
                  </Button>
                </DialogFooter>
              </>
            }
          </DialogContent>
        </Dialog>

      {/* -- Modales de Acción (Aprobar y Rechazar) -- */}
        <AprobarSolicitudDialog
          solicitud={solicitudToApprove}
          open={isApproveOpen}
          onOpenChange={setIsApproveOpen}
          onConfirm={handleConfirmApprove} />
        

        <RechazarSolicitudDialog
          solicitud={solicitudToReject}
          open={isRejectOpen}
          onOpenChange={setIsRejectOpen}
          onConfirm={handleConfirmReject} />
        

        <AsignarRevisorDialog
          solicitud={solicitudToAssign}
          solicitudesMasivas={solicitudesMasivas}
          open={isAssignOpen || isAssignMasivoOpen}
          onOpenChange={(open) => {
            setIsAssignOpen(open);
            setIsAssignMasivoOpen(open);
            if (!open) {
              setSolicitudToAssign(null);
              setSolicitudesMasivas([]);
            }
          }}
          tipoArea={
          currentUser.role === "DIR_NORMATIVA" ||
          solicitudToAssign?.estado === "PENDIENTE_ASIGNACION_NORMATIVIDAD" ||
          solicitudToAssign?.estado === "EN_REVISION_NORMATIVIDAD" ?
          "NORMATIVIDAD" :
          "GESTION"
          }
          directorNombre={currentUser.name}
          allSolicitudes={solicitudes}
          onConfirmAsignacion={handleConfirmAsignacion}
          onConfirmAsignacionMasiva={handleConfirmAsignacionMasiva} />
        
        <Enr03SimulacionPanel />
      </main>
    </WireframeDashboardLayout>);

}


