"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  History,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Filter,
  Search as SearchIcon,
  RotateCcw,
  Eye,
  User,
  UserPlus,
  UserCheck,
  UserX,
  Building,
  KeyRound,
  Lock,
  Clock,
  Server,
  Info,
  CreditCard,
  Hash,
  Smartphone,
  LogOut,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { DateField } from "@/components/ui/date-field";

import { cn } from "@/lib/utils";
import {
  useUsuariosStore,
  EventoAuditoria,
} from "@/modules/usuarios/data/usuarios-store";
import { useCoordinadoresStore } from "@/modules/coordinadores/data/coordinadores-store";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

// Helper para parsear fecha "DD/MM/YYYY HH:mm" a Date
function parseFechaAuditoria(fechaStr: string): Date | null {
  try {
    const [dPart, tPart] = fechaStr.split(" ");
    const [day, month, year] = dPart.split("/").map(Number);
    const [hours, minutes] = (tPart || "00:00").split(":").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  } catch {
    return null;
  }
}

// Fecha actual simulada del sistema: 30 de Septiembre de 2026
const HOY_SISTEMA_STR = "2026-09-30";
const HOY_SISTEMA = new Date(2026, 8, 30, 23, 59, 59);

// Opciones de tipo de evento según catálogo exacto HU ID-05
const TIPOS_EVENTOS_FILTRO = [
  { value: "TODOS", label: "Todos los eventos" },
  { value: "ALTA", label: "Alta" },
  { value: "CAMBIO_ROL", label: "Cambio de rol" },
  { value: "CAMBIO_AREA", label: "Cambio de área" },
  { value: "ACTIVACION", label: "Activación" },
  { value: "SUSPENSION", label: "Suspensión" },
  { value: "REACTIVACION", label: "Reactivación" },
  { value: "BAJA_LOGICA", label: "Baja lógica" },
  { value: "INGRESO", label: "Ingreso" },
  { value: "RECUPERACION", label: "Recuperación" },
  { value: "CAMBIO_FACTOR", label: "Cambio de factor" },
  { value: "INVALIDACION_SESION", label: "Invalidación de sesión" },
];

// Opciones de período de auditoría (HU ID-05)
const PERIODOS_FILTRO = [
  { value: "TODOS", label: "Todo" },
  { value: "7D", label: "7 días" },
  { value: "30D", label: "30 días" },
  { value: "2026", label: "Año 2026" },
];

function AuditoriaCuentasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Soporte para contextualización desde cuenta específica (?cuenta=<id> o ?persona=<cedula>)
  const paramCuenta = searchParams.get("cuenta") || searchParams.get("persona") || "";

  const { usuarios, auditoria } = useUsuariosStore();
  const { coordinadores } = useCoordinadoresStore();
  const currentUser = MOCK_USERS_BY_ROLE.ADMIN;

  // Catálogo transversal unificado de personas (Cuentas internas DINARP + Coordinadores institucionales externos)
  const allPersonas = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        cedula: string;
        nombreCompleto: string;
        tipoCuenta: "INTERNA" | "COORDINADOR";
        dependencia: string;
      }
    >();

    // 1. Cuentas internas DINARP
    usuarios.forEach((u) => {
      map.set(u.cedula, {
        id: u.id,
        cedula: u.cedula,
        nombreCompleto: u.nombreCompleto,
        tipoCuenta: "INTERNA",
        dependencia: `DINARP · ${u.rolLabel}`,
      });
    });

    // 2. Coordinadores institucionales
    coordinadores.forEach((c) => {
      if (!map.has(c.cedula)) {
        map.set(c.cedula, {
          id: c.id,
          cedula: c.cedula,
          nombreCompleto: c.nombreCompleto,
          tipoCuenta: "COORDINADOR",
          dependencia: `${c.institucion} (${c.tipoDesignacion})`,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.nombreCompleto.localeCompare(b.nombreCompleto)
    );
  }, [usuarios, coordinadores]);

  // Estados de filtros requeridos por HU ID-05:
  // Persona (Combobox), Tipo de evento (Combobox), Período (Combobox), Fecha desde (Date Picker), Fecha hasta (Date Picker)
  const [filterPersona, setFilterPersona] = useState<string>("TODAS");
  const [personaSearch, setPersonaSearch] = useState<string>("");

  const [filterTipoEvento, setFilterTipoEvento] = useState<string>("TODOS");
  const [tipoEventoSearch, setTipoEventoSearch] = useState<string>("");

  const [filterPeriodo, setFilterPeriodo] = useState<string>("TODOS");
  const [periodoSearch, setPeriodoSearch] = useState<string>("");

  const [fechaDesde, setFechaDesde] = useState<Date | undefined>(undefined);
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Paginación
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal / Drawer de detalle forense
  const [selectedAuditLog, setSelectedAuditLog] = useState<EventoAuditoria | null>(null);

  // Sincronizar parámetro URL contextual ?cuenta=<id_cuenta> o ?persona=<cedula>
  useEffect(() => {
    if (paramCuenta) {
      const matched = allPersonas.find(
        (p) =>
          p.id.toLowerCase() === paramCuenta.toLowerCase() ||
          p.cedula.toLowerCase() === paramCuenta.toLowerCase()
      );
      if (matched) {
        setFilterPersona(matched.cedula);
        setPersonaSearch(matched.nombreCompleto);
      } else {
        setFilterPersona(paramCuenta);
      }
    }
  }, [paramCuenta, allPersonas]);

  // Validaciones de fechas
  const fechaValidation = useMemo(() => {
    if (fechaDesde && fechaHasta) {
      if (fechaHasta < fechaDesde) {
        return { isValid: false, error: "La Fecha hasta no puede ser anterior a la Fecha desde." };
      }
    }
    return { isValid: true, error: "" };
  }, [fechaDesde, fechaHasta]);

  // Opciones filtradas para el Combobox de Persona
  const filteredPersonasOptions = useMemo(() => {
    const list = [
      { value: "TODAS", label: `Todas las personas (${allPersonas.length} registradas)` },
      ...allPersonas.map((p) => ({
        value: p.cedula,
        label: `${p.nombreCompleto} · ${p.cedula} (${p.tipoCuenta === "COORDINADOR" ? "Coordinador" : "Cuenta interna"})`,
      })),
    ];
    if (!personaSearch.trim()) return list;
    const q = personaSearch.toLowerCase().trim();
    return list.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [allPersonas, personaSearch]);

  // Opciones filtradas para el Combobox de Tipo de Evento
  const filteredTiposEventosOptions = useMemo(() => {
    if (!tipoEventoSearch.trim()) return TIPOS_EVENTOS_FILTRO;
    const q = tipoEventoSearch.toLowerCase().trim();
    return TIPOS_EVENTOS_FILTRO.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [tipoEventoSearch]);

  // Opciones filtradas para el Combobox de Período (HU ID-05)
  const filteredPeriodosOptions = useMemo(() => {
    if (!periodoSearch.trim()) return PERIODOS_FILTRO;
    const q = periodoSearch.toLowerCase().trim();
    return PERIODOS_FILTRO.filter(
      (opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [periodoSearch]);

  // Preajustes rápidos de fecha
  const handleApplyPreset = (preset: "7D" | "30D" | "2026" | "TODOS") => {
    setFilterPeriodo(preset);
    if (preset === "TODOS") {
      setFechaDesde(undefined);
      setFechaHasta(undefined);
      setPeriodoSearch("");
    } else if (preset === "7D") {
      const d = new Date(HOY_SISTEMA);
      d.setDate(d.getDate() - 7);
      setFechaDesde(d);
      setFechaHasta(new Date(HOY_SISTEMA));
      setPeriodoSearch("7 días");
    } else if (preset === "30D") {
      const d = new Date(HOY_SISTEMA);
      d.setDate(d.getDate() - 30);
      setFechaDesde(d);
      setFechaHasta(new Date(HOY_SISTEMA));
      setPeriodoSearch("30 días");
    } else if (preset === "2026") {
      setFechaDesde(new Date(2026, 0, 1));
      setFechaHasta(new Date(HOY_SISTEMA));
      setPeriodoSearch("Año 2026");
    }
    setCurrentPage(1);
  };

  // Filtrado reactivo de la bitácora según los filtros requeridos + búsqueda complementaria
  const filteredAuditoria = useMemo(() => {
    if (!fechaValidation.isValid) {
      return [];
    }

    return auditoria.filter((log) => {
      // 1. Filtro por Persona (Combobox)
      if (filterPersona !== "TODAS") {
        const matchesPersona =
          log.usuarioAfectadoCedula === filterPersona ||
          log.usuarioAfectadoId === filterPersona;
        if (!matchesPersona) return false;
      }

      // 2. Filtro por Tipo de evento (Catálogo exacto HU ID-05)
      if (filterTipoEvento !== "TODOS") {
        if (filterTipoEvento === "ALTA") {
          const isAlta =
            log.evento === "CUENTA_CREADA" ||
            log.evento === "ACTIVACION" ||
            (log.eventoLabel || "").toLowerCase().includes("alta") ||
            (log.eventoLabel || "").toLowerCase().includes("crea");
          if (!isAlta) return false;
        } else if (filterTipoEvento === "CAMBIO_ROL") {
          if (log.evento !== "CAMBIO_ROL") return false;
        } else if (filterTipoEvento === "CAMBIO_AREA") {
          if (log.evento !== "CAMBIO_AREA" && log.evento !== "CAMBIO_AMBITO") return false;
        } else if (filterTipoEvento === "ACTIVACION") {
          if (log.evento !== "ACTIVACION") return false;
        } else if (filterTipoEvento === "SUSPENSION") {
          if (log.evento !== "SUSPENSION") return false;
        } else if (filterTipoEvento === "REACTIVACION") {
          if (log.evento !== "REACTIVACION") return false;
        } else if (filterTipoEvento === "BAJA_LOGICA") {
          if (log.evento !== "BAJA_LOGICA") return false;
        } else if (filterTipoEvento === "INGRESO") {
          if (log.evento !== "INGRESO") return false;
        } else if (filterTipoEvento === "RECUPERACION") {
          if (log.evento !== "RECUPERACION") return false;
        } else if (filterTipoEvento === "CAMBIO_FACTOR") {
          if (log.evento !== "CAMBIO_FACTOR") return false;
        } else if (filterTipoEvento === "INVALIDACION_SESION") {
          if (log.evento !== "INVALIDACION_SESION") return false;
        } else if (log.evento !== filterTipoEvento) {
          return false;
        }
      }

      // 4. Filtro por Fecha desde (Date Picker)
      if (fechaDesde) {
        const logDate = parseFechaAuditoria(log.fecha);
        if (!logDate) return false;
        const dStart = new Date(fechaDesde);
        dStart.setHours(0, 0, 0, 0);
        if (logDate < dStart) return false;
      }

      // 5. Filtro por Fecha hasta (Date Picker)
      if (fechaHasta) {
        const logDate = parseFechaAuditoria(log.fecha);
        if (!logDate) return false;
        const dEnd = new Date(fechaHasta);
        dEnd.setHours(23, 59, 59, 999);
        if (logDate > dEnd) return false;
      }

      // 6. Búsqueda de texto libre complementaria
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const personaNombre = (log.usuarioAfectadoNombre || "").toLowerCase();
        const personaCedula = log.usuarioAfectadoCedula.toLowerCase();
        const personaId = log.usuarioAfectadoId.toLowerCase();
        const eventoLabel = log.eventoLabel.toLowerCase();
        const actor = log.actor.toLowerCase();
        const logId = log.id.toLowerCase();
        const motivo = (log.motivo || "").toLowerCase();
        const detalles = (log.detalles || "").toLowerCase();
        const institucion = (log.institucion || "").toLowerCase();

        const matchesQuery =
          personaNombre.includes(q) ||
          personaCedula.includes(q) ||
          personaId.includes(q) ||
          eventoLabel.includes(q) ||
          actor.includes(q) ||
          logId.includes(q) ||
          motivo.includes(q) ||
          detalles.includes(q) ||
          institucion.includes(q);

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    auditoria,
    filterPersona,
    filterTipoEvento,
    fechaDesde,
    fechaHasta,
    fechaValidation,
    searchQuery,
  ]);

  // Paginación calculada
  const totalItems = filteredAuditoria.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageClamped = Math.min(currentPage, totalPages);
  const startIndex = (currentPageClamped - 1) * pageSize;
  const paginatedLogs = filteredAuditoria.slice(startIndex, startIndex + pageSize);

  // Reset de filtros
  const handleResetFilters = () => {
    setFilterPersona("TODAS");
    setPersonaSearch("");
    setFilterTipoEvento("TODOS");
    setTipoEventoSearch("");
    setFilterPeriodo("TODOS");
    setPeriodoSearch("");
    setFechaDesde(undefined);
    setFechaHasta(undefined);
    setSearchQuery("");
    setCurrentPage(1);
    if (paramCuenta) {
      router.replace("/auditoria-cuentas");
    }
  };

  const hasActiveFilters =
    filterPersona !== "TODAS" ||
    filterTipoEvento !== "TODOS" ||
    fechaDesde !== undefined ||
    fechaHasta !== undefined ||
    searchQuery.trim() !== "";

  // Helper para nombre de persona seleccionada
  const personaSeleccionadaObj = useMemo(() => {
    if (filterPersona === "TODAS") return null;
    return (
      allPersonas.find(
        (p) => p.cedula === filterPersona || p.id === filterPersona
      ) || null
    );
  }, [allPersonas, filterPersona]);

  // Helper para Tipo de cuenta según HU ID-05 (Valores: Cuenta interna | Coordinador)
  const getTipoCuenta = (log: EventoAuditoria): "Cuenta interna" | "Coordinador" => {
    if (log.tipoCuenta === "COORDINADOR") return "Coordinador";
    if (log.tipoCuenta === "INTERNA") return "Cuenta interna";
    const matched = allPersonas.find(
      (p) => p.cedula === log.usuarioAfectadoCedula || p.id === log.usuarioAfectadoId
    );
    if (matched?.tipoCuenta === "COORDINADOR") return "Coordinador";
    return "Cuenta interna";
  };

  // Helper para verificar preajuste activo
  const isPresetActive = (preset: "TODOS" | "7D" | "30D" | "2026") => {
    if (preset === "TODOS") {
      return !fechaDesde && !fechaHasta;
    }
    if (preset === "2026") {
      return (
        fechaDesde?.getFullYear() === 2026 &&
        fechaDesde?.getMonth() === 0 &&
        fechaDesde?.getDate() === 1 &&
        fechaHasta?.getFullYear() === 2026
      );
    }
    if (preset === "7D" && fechaDesde && fechaHasta) {
      const diffTime = Math.abs(fechaHasta.getTime() - fechaDesde.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays === 7;
    }
    if (preset === "30D" && fechaDesde && fechaHasta) {
      const diffTime = Math.abs(fechaHasta.getTime() - fechaDesde.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 28 && diffDays <= 31;
    }
    return false;
  };

  // Período activo (sincronizado con fechaDesde y fechaHasta)
  const activePeriodoValue = useMemo(() => {
    if (isPresetActive("7D")) return "7D";
    if (isPresetActive("30D")) return "30D";
    if (isPresetActive("2026")) return "2026";
    if (!fechaDesde && !fechaHasta) return "TODOS";
    return "CUSTOM";
  }, [fechaDesde, fechaHasta]);

  // Estados vacíos según HU ID-05:
  // "Sin resultados para esta persona" si se filtró por persona
  // "Sin resultados para estos filtros" en los demás casos
  const isFiltroPersonaActivo = filterPersona !== "TODAS";

  const emptyStateTitle = isFiltroPersonaActivo
    ? "Sin resultados para esta persona"
    : "Sin resultados para estos filtros";

  const emptyStateDesc = isFiltroPersonaActivo
    ? "La persona o cédula seleccionada no registra eventos de auditoría en el sistema o no corresponde a una cuenta visible dentro del ámbito autorizado."
    : "No se encontraron eventos de auditoría que coincidan con los criterios y filtros especificados.";

  // Badges oficiales para tipos de evento según HU ID-05
  const renderEventoBadge = (log: EventoAuditoria) => {
    switch (log.evento) {
      case "CUENTA_CREADA":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <UserPlus className="size-3 shrink-0" />
            <span>Alta</span>
          </Badge>
        );

      case "ACTIVACION":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <CheckCircle2 className="size-3 shrink-0" />
            <span>Activación</span>
          </Badge>
        );

      case "CAMBIO_ROL":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <ShieldCheck className="size-3 shrink-0" />
            <span>Cambio de rol</span>
          </Badge>
        );

      case "CAMBIO_AREA":
      case "CAMBIO_AMBITO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <Building className="size-3 shrink-0" />
            <span>Cambio de área</span>
          </Badge>
        );

      case "SUSPENSION":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <Lock className="size-3 shrink-0" />
            <span>Suspensión</span>
          </Badge>
        );

      case "REACTIVACION":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <CheckCircle2 className="size-3 shrink-0" />
            <span>Reactivación</span>
          </Badge>
        );

      case "BAJA_LOGICA":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <UserX className="size-3 shrink-0" />
            <span>Baja lógica</span>
          </Badge>
        );

      case "INGRESO":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-medium gap-1 whitespace-nowrap">
            <KeyRound className="size-3 shrink-0" />
            <span>Ingreso</span>
          </Badge>
        );

      case "RECUPERACION":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <RotateCcw className="size-3 shrink-0" />
            <span>Recuperación</span>
          </Badge>
        );

      case "CAMBIO_FACTOR":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <Smartphone className="size-3 shrink-0" />
            <span>Cambio de factor</span>
          </Badge>
        );

      case "INVALIDACION_SESION":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <LogOut className="size-3 shrink-0" />
            <span>Invalidación de sesión</span>
          </Badge>
        );

      case "BLOQUEO":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <AlertCircle className="size-3 shrink-0" />
            <span>Bloqueo preventivo</span>
          </Badge>
        );

      case "CAMBIO_COORDINADOR":
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <UserCheck className="size-3 shrink-0" />
            <span>Cambio Coordinador (Anexo C)</span>
          </Badge>
        );

      case "CREDENCIALES_API_REVOCADAS":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-semibold gap-1 whitespace-nowrap">
            <Server className="size-3 shrink-0" />
            <span>Revocación credenciales API</span>
          </Badge>
        );

      default:
        return <Badge size="sm" className="whitespace-nowrap">{log.eventoLabel}</Badge>;
    }
  };

  // Badges oficiales para resultados (sin icono conforme requerimiento de UI kit)
  const renderResultadoBadge = (resultado: EventoAuditoria["resultado"]) => {
    switch (resultado) {
      case "Éxito":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="font-medium whitespace-nowrap">
            Éxito
          </Badge>
        );
      case "Fallido":
      case "Fallo":
      case "Denegado":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="font-medium whitespace-nowrap">
            {resultado === "Denegado" ? "Denegado" : "Fallido"}
          </Badge>
        );
      case "Pendiente":
      case "En conciliación":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="font-medium whitespace-nowrap">
            {resultado}
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral" appearance="soft" size="sm" className="whitespace-nowrap">
            {resultado}
          </Badge>
        );
    }
  };

  return (
    <WireframeDashboardLayout
      activeMenu="auditoria-cuentas"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Auditoría de cuentas" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 flex-1 min-h-0 w-full"
        >
          <TooltipProvider delayDuration={200}>
            {/* Header de la pantalla */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full pb-4 border-b border-border/80">
              <div className="space-y-1 min-w-0 flex-1">
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-primary">
                  Auditoría de cuentas
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground w-full max-w-none leading-relaxed font-normal">
                  Consulta la trazabilidad transversal del ciclo de vida de cuentas, cambios de roles, accesos y eventos de seguridad del sistema.
                </p>
              </div>

              {/* Badges de métricas rápidas alineado a la derecha sin icono */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0 sm:self-center">
                <div className="flex items-center gap-2 bg-muted/60 border border-border/70 rounded-xl px-3.5 py-2 text-xs shadow-2xs">
                  <span className="text-muted-foreground font-medium">Eventos auditados:</span>
                  <span className="font-bold text-foreground font-mono">{auditoria.length}</span>
                </div>
              </div>
            </div>

            {/* Filtros y Búsqueda con UI Kit Oficial (sin contenedor tipo card, idéntico a /cuentas-internas) */}
            <div className="space-y-3 w-full">
              {/* Barra de filtros continua con gap uniforme */}
              <div className="flex flex-wrap items-center gap-2.5 w-full">
              {/* Buscador UI Kit (ancho controlado para dar más espacio a los selectores de fecha) */}
              <div className="w-full sm:w-[210px] xl:w-[220px] min-w-0 shrink-0">
                <Search
                  size="sm"
                  placeholder="Buscar cédula, persona..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  onClear={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Filtro Persona (Combobox UI Kit) */}
              <div className="w-full sm:w-[190px] xl:w-[200px] min-w-0 shrink-0">
                <Combobox
                  value={filterPersona === "TODAS" ? null : filterPersona}
                  onValueChange={(val) => {
                    const selected = val || "TODAS";
                    setFilterPersona(selected);
                    if (selected === "TODAS") {
                      setPersonaSearch("");
                    } else {
                      const p = allPersonas.find((item) => item.cedula === selected);
                      if (p) setPersonaSearch(p.nombreCompleto);
                    }
                    setCurrentPage(1);
                  }}
                  inputValue={personaSearch}
                  onInputValueChange={(newSearch) => {
                    setPersonaSearch(newSearch);
                  }}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Todas las personas"
                    showClear={filterPersona !== "TODAS"}
                    showTrigger={true}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[280px] max-h-[300px] overflow-y-auto z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Filtrar por persona</ComboboxLabel>
                        {filteredPersonasOptions.map((opt) => (
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
                      {filteredPersonasOptions.length === 0 && (
                        <ComboboxEmpty>No se encontraron personas.</ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* Filtro Tipo de evento (Combobox UI Kit) */}
              <div className="w-full sm:w-[180px] xl:w-[190px] min-w-0 shrink-0">
                <Combobox
                  value={filterTipoEvento === "TODOS" ? null : filterTipoEvento}
                  onValueChange={(val) => {
                    const selected = val || "TODOS";
                    setFilterTipoEvento(selected);
                    if (selected === "TODOS") {
                      setTipoEventoSearch("");
                    } else {
                      const ev = TIPOS_EVENTOS_FILTRO.find((item) => item.value === selected);
                      if (ev) setTipoEventoSearch(ev.label);
                    }
                    setCurrentPage(1);
                  }}
                  inputValue={tipoEventoSearch}
                  onInputValueChange={(newSearch) => {
                    setTipoEventoSearch(newSearch);
                  }}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Todos los eventos"
                    showClear={filterTipoEvento !== "TODOS"}
                    showTrigger={true}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[280px] max-h-[300px] overflow-y-auto z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Filtrar por tipo de evento</ComboboxLabel>
                        {filteredTiposEventosOptions.map((opt) => (
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
                      {filteredTiposEventosOptions.length === 0 && (
                        <ComboboxEmpty>No se encontraron eventos.</ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* Filtro Período (Combobox UI Kit: Todo, 7 días, 30 días, Año 2026) */}
              <div className="w-full sm:w-[130px] xl:w-[135px] min-w-0 shrink-0">
                <Combobox
                  value={activePeriodoValue === "TODOS" ? null : activePeriodoValue === "CUSTOM" ? null : activePeriodoValue}
                  onValueChange={(val) => {
                    const selected = (val as "TODOS" | "7D" | "30D" | "2026") || "TODOS";
                    handleApplyPreset(selected);
                  }}
                  inputValue={periodoSearch}
                  onInputValueChange={(newSearch) => {
                    setPeriodoSearch(newSearch);
                  }}
                >
                  <ComboboxInput
                    size="sm"
                    placeholder="Período: Todo"
                    showClear={Boolean(fechaDesde || fechaHasta)}
                    showTrigger={true}
                    className="w-full"
                  />
                  <ComboboxContent className="min-w-[170px] z-[80]">
                    <ComboboxList>
                      <ComboboxGroup>
                        <ComboboxLabel>Período</ComboboxLabel>
                        {filteredPeriodosOptions.map((opt) => (
                          <ComboboxItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs py-1.5 cursor-pointer"
                          >
                            <span className="truncate">{opt.label}</span>
                          </ComboboxItem>
                        ))}
                      </ComboboxGroup>
                      {filteredPeriodosOptions.length === 0 && (
                        <ComboboxEmpty>No se encontraron períodos.</ComboboxEmpty>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              {/* Fecha desde (Date Picker oficial UI Kit con Popover Calendar) */}
              <div className="w-full sm:w-[190px] xl:w-[200px] min-w-0 shrink-0">
                <DateField
                  value={fechaDesde}
                  onChange={(date) => {
                    setFechaDesde(date);
                    setPeriodoSearch("");
                    setCurrentPage(1);
                  }}
                  size="sm"
                  placeholder="Fecha desde"
                  clearable
                  className="w-full [&_*]:whitespace-nowrap"
                  state={!fechaValidation.isValid ? "error" : "default"}
                />
              </div>

              {/* Fecha hasta (Date Picker oficial UI Kit con Popover Calendar) */}
              <div className="w-full sm:w-[190px] xl:w-[200px] min-w-0 shrink-0">
                <DateField
                  value={fechaHasta}
                  onChange={(date) => {
                    setFechaHasta(date);
                    setPeriodoSearch("");
                    setCurrentPage(1);
                  }}
                  size="sm"
                  placeholder="Fecha hasta"
                  clearable
                  className="w-full [&_*]:whitespace-nowrap"
                  state={!fechaValidation.isValid ? "error" : "default"}
                />
              </div>

              {/* Botón rápido para limpiar todos los filtros si alguno está activo */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer shrink-0"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Limpiar filtros</span>
                </Button>
              )}
            </div>

              {/* Mensaje de error de validación de fechas */}
              {!fechaValidation.isValid && (
                <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="font-medium">{fechaValidation.error}</span>
                </div>
              )}

              {/* Badges / Píldoras de Filtros Activos (UI Kit) como en cuentas-internas */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">
                    Filtros activos:
                  </span>

                  {searchQuery.trim() !== "" && (
                    <Badge
                      tone="neutral"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-muted text-foreground border border-border max-w-full"
                    >
                      <span className="max-w-[180px] sm:max-w-[260px] truncate">Búsqueda: &ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de búsqueda"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {filterPersona !== "TODAS" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25 max-w-full"
                    >
                      <span className="max-w-[180px] sm:max-w-[260px] truncate">
                        Persona: {allPersonas.find((p) => p.cedula === filterPersona)?.nombreCompleto || filterPersona}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterPersona("TODAS");
                          setPersonaSearch("");
                          setCurrentPage(1);
                          if (paramCuenta) {
                            router.replace("/auditoria-cuentas");
                          }
                        }}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de persona"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {filterTipoEvento !== "TODOS" && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25 max-w-full"
                    >
                      <span className="max-w-[180px] sm:max-w-[260px] truncate">
                        Evento: {TIPOS_EVENTOS_FILTRO.find((ev) => ev.value === filterTipoEvento)?.label || filterTipoEvento}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterTipoEvento("TODOS");
                          setTipoEventoSearch("");
                          setCurrentPage(1);
                        }}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de evento"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  {(fechaDesde || fechaHasta) && (
                    <Badge
                      tone="primary"
                      appearance="soft"
                      className="pl-3 pr-1 py-1 rounded-full text-xs h-7 gap-1 font-semibold bg-primary/10 text-primary border border-primary/25 max-w-full"
                    >
                      <span className="max-w-[180px] sm:max-w-[260px] truncate">
                        Período: {fechaDesde ? format(fechaDesde, "dd/MM/yyyy") : "..."} - {fechaHasta ? format(fechaHasta, "dd/MM/yyyy") : "..."}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setFechaDesde(undefined);
                          setFechaHasta(undefined);
                          setFilterPeriodo("TODOS");
                          setPeriodoSearch("");
                          setCurrentPage(1);
                        }}
                        className="p-0.5 rounded-full hover:bg-primary/20 text-primary transition-colors cursor-pointer shrink-0"
                        aria-label="Eliminar filtro de período"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground cursor-pointer ml-auto"
                  >
                    Limpiar todos
                  </Button>
                </div>
              )}
            </div>

            {/* Contenedor Principal: Tabla Desktop (hidden lg:block) + Cards Mobile/Tablet (block lg:hidden) */}
            <div className="w-full space-y-4">
              {/* 1. Vista Desktop: Tabla con las 8 Columnas Oficiales (HU ID-05) */}
              <div className="hidden lg:block w-full">
                <Table containerClassName="overflow-x-auto w-full" className="w-full min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="border-0">
                      <TableHead className="w-[150px] min-w-[140px] whitespace-nowrap text-left pl-6">
                        FECHA Y HORA
                      </TableHead>
                      <TableHead className="min-w-[200px] max-w-[260px] whitespace-nowrap text-left">
                        PERSONA
                      </TableHead>
                      <TableHead className="w-[140px] min-w-[130px] whitespace-nowrap text-left">
                        TIPO DE CUENTA
                      </TableHead>
                      <TableHead className="min-w-[180px] max-w-[220px] whitespace-nowrap text-left">
                        TIPO DE EVENTO
                      </TableHead>
                      <TableHead className="min-w-[160px] max-w-[200px] whitespace-nowrap text-left">
                        ACTOR
                      </TableHead>
                      <TableHead className="w-[120px] min-w-[110px] whitespace-nowrap text-left">
                        RESULTADO
                      </TableHead>
                      <TableHead className="min-w-[170px] max-w-[220px] whitespace-nowrap text-left">
                        REFERENCIA
                      </TableHead>
                      <TableHead className="w-[90px] min-w-[80px] whitespace-nowrap text-center pr-6">
                        VER DETALLE
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.length > 0 ? (
                      paginatedLogs.map((log) => {
                        const tipoCuenta = getTipoCuenta(log);
                        return (
                          <TableRow
                            key={log.id}
                            className="transition-colors hover:bg-muted/30"
                          >
                            {/* 1. Fecha y hora */}
                            <TableCell className="w-[150px] min-w-[140px] text-left align-middle pl-6 whitespace-nowrap font-mono text-xs text-muted-foreground">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 cursor-help">
                                    <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
                                    <span className="text-foreground font-medium">{log.fecha}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-mono text-xs">Fecha y hora: {log.fecha}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* 2. Persona */}
                            <TableCell className="min-w-[200px] max-w-[260px] text-left align-middle">
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="font-semibold text-xs text-foreground block truncate cursor-help max-w-[240px]">
                                      {log.usuarioAfectadoNombre || "Persona registrada"}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="font-semibold text-xs">{log.usuarioAfectadoNombre || "Persona registrada"}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono">ID cuenta: {log.usuarioAfectadoId}</p>
                                  </TooltipContent>
                                </Tooltip>
                                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="cursor-help">C.I. {log.usuarioAfectadoCedula}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <span className="font-mono text-xs">Cédula: {log.usuarioAfectadoCedula}</span>
                                    </TooltipContent>
                                  </Tooltip>
                                  <span>•</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="truncate max-w-[100px] cursor-help">ID: {log.usuarioAfectadoId}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <span className="font-mono text-xs">ID de cuenta: {log.usuarioAfectadoId}</span>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                {log.institucion && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="text-[10px] text-muted-foreground block truncate max-w-[240px] cursor-help">
                                        {log.institucion}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="text-xs">{log.institucion}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>

                            {/* 3. Tipo de cuenta (Columna independiente requerida por HU ID-05) */}
                            <TableCell className="w-[140px] min-w-[130px] text-left align-middle">
                              <Badge
                                tone={tipoCuenta === "Cuenta interna" ? "neutral" : "info"}
                                appearance="soft"
                                size="sm"
                                className="font-medium whitespace-nowrap"
                              >
                                {tipoCuenta}
                              </Badge>
                            </TableCell>

                            {/* 4. Tipo de evento */}
                            <TableCell className="min-w-[180px] max-w-[220px] text-left align-middle">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="inline-flex max-w-[200px] truncate cursor-help">
                                    {renderEventoBadge(log)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-semibold text-xs">{log.eventoLabel}</p>
                                  <p className="text-[10px] text-muted-foreground font-mono">Código evento: {log.evento}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* 5. Actor */}
                            <TableCell className="min-w-[160px] max-w-[200px] text-left align-middle">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs font-medium text-foreground block truncate max-w-[180px] cursor-help">
                                    {log.actor}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="font-semibold text-xs">{log.actor}</p>
                                  <p className="text-[10px] text-muted-foreground">Responsable de la acción</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>

                            {/* 6. Resultado */}
                            <TableCell className="w-[120px] min-w-[110px] text-left align-middle">
                              <div className="inline-flex items-center justify-start">
                                {renderResultadoBadge(log.resultado)}
                              </div>
                            </TableCell>

                            {/* 7. Referencia */}
                            <TableCell className="min-w-[170px] max-w-[220px] text-left align-middle">
                              <div className="space-y-1 min-w-0 pr-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="inline-flex items-center gap-1 cursor-help">
                                      <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[11px] gap-1 font-semibold max-w-[190px] truncate">
                                        <Hash className="size-3 shrink-0 opacity-70" />
                                        <span className="truncate">{log.id}</span>
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="font-mono text-xs">Identificador: {log.id}</p>
                                  </TooltipContent>
                                </Tooltip>
                                {log.motivo && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <p className="text-[10px] text-muted-foreground truncate max-w-[190px] cursor-help">
                                        {log.motivo}
                                      </p>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                      <p className="max-w-xs text-xs">{log.motivo}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>

                            {/* 8. Ver detalle */}
                            <TableCell className="w-[90px] min-w-[80px] pr-6 text-center align-middle">
                              <div className="inline-flex items-center justify-center w-full">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setSelectedAuditLog(log)}
                                      className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                      aria-label={`Ver detalle del evento ${log.id}`}
                                    >
                                      <Eye className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <span>Ver detalle</span>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      /* Empty State Requerido HU ID-05: “Sin resultados para esta persona” | “Sin resultados para estos filtros” */
                      <TableRow>
                        <TableCell colSpan={8} className="h-64 text-center py-10">
                          <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                            <div className="size-12 rounded-full bg-muted/70 flex items-center justify-center text-muted-foreground">
                              <SearchIcon className="size-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-heading font-bold text-base text-foreground">
                                {emptyStateTitle}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {emptyStateDesc}
                              </p>
                            </div>
                            <Button
                              variant="neutral"
                              size="sm"
                              onClick={handleResetFilters}
                              className="mt-2 text-xs gap-1.5 cursor-pointer"
                            >
                              <RotateCcw className="size-3.5" />
                              Restablecer filtros
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 2. Vista Mobile y Tablet: Cards Responsive según Jerarquía HU ID-05 */}
              <div className="block lg:hidden w-full space-y-3">
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => {
                    const tipoCuenta = getTipoCuenta(log);
                    return (
                      <div
                        key={log.id}
                        className="p-4 rounded-xl border border-border/80 bg-surface shadow-2xs space-y-3 transition-colors hover:border-primary/40"
                      >
                        {/* 1. Persona y 2. Tipo de cuenta */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border/70">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                              Persona
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <h4 className="font-semibold text-foreground text-sm truncate block cursor-help max-w-[220px]">
                                  {log.usuarioAfectadoNombre || "Persona registrada"}
                                </h4>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-semibold text-xs">{log.usuarioAfectadoNombre || "Persona registrada"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">ID cuenta: {log.usuarioAfectadoId}</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-help">C.I. {log.usuarioAfectadoCedula}</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <span className="font-mono text-xs">Cédula: {log.usuarioAfectadoCedula}</span>
                                </TooltipContent>
                              </Tooltip>
                              <span>•</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[100px] cursor-help">ID: {log.usuarioAfectadoId}</span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <span className="font-mono text-xs">ID de cuenta: {log.usuarioAfectadoId}</span>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {log.institucion && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[10px] text-muted-foreground block truncate max-w-[220px] cursor-help">
                                    {log.institucion}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="text-xs">{log.institucion}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          {/* 2. Tipo de cuenta */}
                          <div className="text-right shrink-0">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-0.5">
                              Tipo de cuenta
                            </span>
                            <Badge
                              tone={tipoCuenta === "Cuenta interna" ? "neutral" : "info"}
                              appearance="soft"
                              size="sm"
                              className="font-medium whitespace-nowrap"
                            >
                              {tipoCuenta}
                            </Badge>
                          </div>
                        </div>

                        {/* 3. Tipo de evento */}
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                            Tipo de evento
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex max-w-full truncate cursor-help">
                                {renderEventoBadge(log)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="font-semibold text-xs">{log.eventoLabel}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">Código: {log.evento}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* 4. Fecha y hora | 5. Actor */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                              Fecha y hora
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-mono text-foreground text-xs cursor-help">
                                  {log.fecha}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-mono text-xs">Fecha y hora: {log.fecha}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                              Actor
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-foreground font-medium truncate block cursor-help max-w-[180px]">
                                  {log.actor}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-semibold text-xs">{log.actor}</p>
                                <p className="text-[10px] text-muted-foreground">Responsable de la acción</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>

                        {/* 6. Resultado */}
                        <div className="space-y-0.5 pt-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                            Resultado
                          </span>
                          <div className="inline-flex">
                            {renderResultadoBadge(log.resultado)}
                          </div>
                        </div>

                        {/* 7. Referencia y 8. Ver detalle */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                              Referencia
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="inline-flex items-center gap-1 cursor-help">
                                  <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[11px] gap-1 font-semibold max-w-[190px] truncate">
                                    <Hash className="size-3 shrink-0 opacity-70" />
                                    <span className="truncate">{log.id}</span>
                                  </Badge>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="font-mono text-xs">Identificador: {log.id}</p>
                              </TooltipContent>
                            </Tooltip>
                            {log.motivo && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5 cursor-help">
                                    {log.motivo}
                                  </p>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                  <p className="max-w-xs text-xs">{log.motivo}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>

                          {/* 8. Ver detalle */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAuditLog(log)}
                            className="gap-1.5 text-xs text-primary hover:text-primary cursor-pointer shrink-0"
                          >
                            <Eye className="size-3.5" />
                            <span>Ver detalle</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-surface border border-border/80 rounded-xl text-center space-y-2.5">
                    <div className="size-10 rounded-full bg-muted/70 flex items-center justify-center text-muted-foreground">
                      <SearchIcon className="size-5" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <p className="text-sm font-heading font-bold text-foreground">
                        {emptyStateTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {emptyStateDesc}
                      </p>
                    </div>
                    <Button
                      variant="neutral"
                      size="sm"
                      onClick={handleResetFilters}
                      className="mt-1 text-xs gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      Restablecer filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>

              {/* Paginación */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80 w-full">
                <div className="flex flex-wrap items-center gap-4 order-2 sm:order-1">
                  <p className="text-xs text-muted-foreground">
                    Mostrando{" "}
                    <span className="font-semibold text-foreground">
                      {filteredAuditoria.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(currentPage * pageSize, filteredAuditoria.length)}
                    </span>{" "}
                    de <span className="font-semibold text-foreground">{filteredAuditoria.length}</span> eventos auditados
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
          </TooltipProvider>
        </Card>

        {/* Modal / Dialog Forense de Detalle oficial del UI Kit */}
        {selectedAuditLog && (
          <Dialog open={!!selectedAuditLog} onOpenChange={(open) => !open && setSelectedAuditLog(null)}>
            <DialogContent size="2xl">
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge tone="primary" appearance="soft" size="sm" className="font-mono">
                    {selectedAuditLog.id}
                  </Badge>
                  {renderEventoBadge(selectedAuditLog)}
                  {renderResultadoBadge(selectedAuditLog.resultado)}
                </div>
                <DialogTitle>{selectedAuditLog.eventoLabel}</DialogTitle>
                <DialogDescription>
                  Detalle forense del evento auditado ({selectedAuditLog.fecha}).
                </DialogDescription>
              </DialogHeader>

              {/* Contenedor scrollable estándar del UI Kit con altura controlada */}
              <div className="max-h-[55vh] overflow-y-auto space-y-3.5 pr-1 text-xs">
                {/* 1. Persona / Cuenta afectada */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="size-3.5 text-primary shrink-0" />
                      Persona / Cuenta afectada
                    </span>
                    <Badge tone="neutral" appearance="soft" size="sm" className="font-medium text-[10px]">
                      {getTipoCuenta(selectedAuditLog)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-muted-foreground pt-1 border-t border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Nombre</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-semibold text-foreground text-xs block truncate cursor-help">
                            {selectedAuditLog.usuarioAfectadoNombre || "Persona registrada"}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs">
                          {selectedAuditLog.usuarioAfectadoNombre || "Persona registrada"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Cédula</span>
                      <span className="font-mono font-semibold text-foreground text-xs block">{selectedAuditLog.usuarioAfectadoCedula}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Identificador de cuenta</span>
                      <span className="font-mono text-foreground text-xs block">{selectedAuditLog.usuarioAfectadoId}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Institución / Ámbito</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-foreground text-xs block truncate cursor-help">
                            {selectedAuditLog.institucion || (selectedAuditLog.tipoCuenta === "COORDINADOR" ? "Institución externa" : "DINARP Central")}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs">
                          {selectedAuditLog.institucion || (selectedAuditLog.tipoCuenta === "COORDINADOR" ? "Institución externa" : "DINARP Central")}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* 2. Trazabilidad de la Operación */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <ShieldCheck className="size-3.5 text-primary shrink-0" />
                    <span>Trazabilidad de la operación</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-muted-foreground pt-1 border-t border-border/40">
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Actor responsable</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-semibold text-foreground text-xs block truncate cursor-help">
                            {selectedAuditLog.actor}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-xs">
                          {selectedAuditLog.actor}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Fecha y hora</span>
                      <span className="font-mono text-foreground text-xs flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground shrink-0" />
                        {selectedAuditLog.fecha}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-muted-foreground/80 uppercase font-medium block">Motivo</span>
                      <p className="text-foreground text-xs leading-relaxed">
                        {selectedAuditLog.motivo || "Sin motivo registrado en la solicitud."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Transición de Estado (si aplica) */}
                {selectedAuditLog.valorAnterior && selectedAuditLog.valorNuevo && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-surface space-y-2">
                    <span className="font-semibold text-foreground block text-xs">
                      Transición (Valor anterior → Valor nuevo):
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                      <div className="px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                        {selectedAuditLog.valorAnterior}
                      </div>
                      <span className="text-muted-foreground font-bold font-sans">→</span>
                      <div className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/30 font-semibold">
                        {selectedAuditLog.valorNuevo}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Incidencias y Detalles Técnicos (si aplica) */}
                {(selectedAuditLog.incidenciaTecnica || selectedAuditLog.detalles) && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-surface space-y-2">
                    {selectedAuditLog.incidenciaTecnica && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-danger uppercase font-bold block">Incidencia técnica reportada</span>
                        <div className="flex items-start gap-2 text-danger">
                          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                          <span className="font-medium text-xs">{selectedAuditLog.incidenciaTecnica}</span>
                        </div>
                      </div>
                    )}
                    {selectedAuditLog.detalles && (
                      <div className={cn("space-y-1", selectedAuditLog.incidenciaTecnica && "pt-2 border-t border-border/40")}>
                        <span className="text-[10px] text-muted-foreground uppercase font-medium block">Detalles adicionales</span>
                        <p className="text-muted-foreground text-xs leading-relaxed">{selectedAuditLog.detalles}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer estándar UI Kit con botón Cerrar canónico */}
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </WireframeDashboardLayout>
  );
}

export function AuditoriaCuentasView() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Cargando auditoría de cuentas...</div>}>
      <AuditoriaCuentasContent />
    </Suspense>
  );
}
