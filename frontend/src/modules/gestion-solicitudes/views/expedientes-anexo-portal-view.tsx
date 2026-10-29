"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
  FileSignature,
  Stamp,
  Plus,
  ArrowUpRight,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { ViewModeToggle } from "@/components/shared/view-mode-toggle";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  type SolicitudIngreso,
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { useCambioCoordinadorStore } from "@/modules/cambio-coordinador/data/cambio-coordinador-store";
import { ValidacionInstitucionModal } from "@/modules/auth/components/validacion-institucion-modal";
import { ValidacionCoordinadorModal } from "@/modules/auth/components/validacion-coordinador-modal";

export type ExpedientesPortalMode =
  | "FIRMA_RESOLUCIONES"
  | "MIS_EXPEDIENTES_A"
  | "MIS_EXPEDIENTES_B"
  | "MIS_EXPEDIENTES_C";

interface ExpedientesAnexoPortalViewProps {
  mode: ExpedientesPortalMode;
  basePath: string;
  activeMenu: string;
}

const ITEMS_PER_PAGE = 6;

export function ExpedientesAnexoPortalView({
  mode,
  basePath,
  activeMenu,
}: ExpedientesAnexoPortalViewProps) {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const { solicitudes } = useSolicitudesIngresoStore();
  const { tramites: tramitesCambio } = useCambioCoordinadorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAnexoAModal, setShowAnexoAModal] = useState(false);
  const [showAnexoBModal, setShowAnexoBModal] = useState(false);

  const config = useMemo(() => {
    const isCoord = activeUser?.role === "COORDINADOR_SINARP";
    const isRep = activeUser?.role === "REPRESENTANTE_INSTITUCIONAL";

    switch (mode) {
      case "FIRMA_RESOLUCIONES":
        return {
          badgeCode: "ARP-R01 · INS-07",
          badgeLabel: "Anexo A · Incorporación institucional",
          title: "Firmar resoluciones",
          subtitle:
            "Revisa los proyectos de resolución de incorporación institucional (Anexo A) remitidos por Normativa y suscribe electrónicamente su aprobación.",
          ctaLabel: null as string | null,
          ctaHref: null as string | null,
          detailActionLabel: "Firmar / Ver resolución",
        };
      case "MIS_EXPEDIENTES_A":
        return {
          badgeCode: "ARP-R01",
          badgeLabel: "Anexo A · Incorporación institucional",
          title: "Estado de incorporación",
          subtitle:
            "Consulta el avance de tu expediente de incorporación institucional (Anexo A), subsana observaciones y descarga la resolución firmada.",
          ctaLabel: "Solicitar incorporación",
          ctaHref: "/registro-institucion",
          detailActionLabel: "Ver seguimiento",
        };
      case "MIS_EXPEDIENTES_B":
        return {
          badgeCode: "ARP-R02",
          badgeLabel: "Anexo B · Registro de coordinadores",
          title: isCoord ? "Mi enrolamiento" : "Estado de enrolamientos",
          subtitle: isCoord
            ? "Consulta el estado de tu expediente de enrolamiento (Anexo B), subsana observaciones y descarga tu acuerdo firmado."
            : "Supervisa el estado de enrolamiento y firma del acuerdo de confidencialidad (Anexo B) de los coordinadores designados de tu institución.",
          ctaLabel:
            isCoord || activeUser?.role === "ADMIN"
              ? "Registrar enrolamiento"
              : null,
          ctaHref:
            isCoord || activeUser?.role === "ADMIN"
              ? "/enrolamiento-coordinador"
              : null,
          detailActionLabel: "Ver expediente",
        };
      case "MIS_EXPEDIENTES_C":
        return {
          badgeCode: "ARP-R03",
          badgeLabel: "Anexo C · Cambio de coordinador",
          title: isRep ? "Estado de cambios" : "Expedientes de cambio",
          subtitle: isRep
            ? "Consulta el estado de las solicitudes de cambio de coordinador institucional (Anexo C) y subsana observaciones documentales."
            : "Consulta el estado de los expedientes de cambio de coordinador institucional (Anexo C) vinculados a tu designación.",
          ctaLabel: "Solicitar cambio",
          ctaHref: "/cambio-coordinador",
          detailActionLabel: "Ver seguimiento",
        };
    }
  }, [mode, activeUser?.role]);

  const baseList: SolicitudIngreso[] = useMemo(() => {
    if (mode === "FIRMA_RESOLUCIONES") {
      return solicitudes.filter(
        (s) =>
          s.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION" &&
          (s.estado === "PENDIENTE_DE_FIRMA" ||
            s.estado === "RESOLUCION_GENERADA" ||
            s.estado === "INSTITUCION_ACTIVA")
      );
    }

    if (mode === "MIS_EXPEDIENTES_A") {
      return solicitudes.filter(
        (s) => s.tipoTramite === "PROCESO_A_REGISTRO_INSTITUCION"
      );
    }

    if (mode === "MIS_EXPEDIENTES_B") {
      return solicitudes.filter(
        (s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR"
      );
    }

    const fromGeneral = solicitudes.filter(
      (s) => s.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR"
    );
    const existingIds = new Set(fromGeneral.map((s) => s.id.toLowerCase()));
    const mappedFromCambio: SolicitudIngreso[] = tramitesCambio
      .filter((t) => !existingIds.has(t.id.toLowerCase()))
      .map((t) => ({
        id: t.id,
        tipoTramite: "PROCESO_C_CAMBIO_COORDINADOR",
        codigoDocumental: "ARP-R03",
        tituloTramite: `Cambio de coordinador (${t.caracter})`,
        cedula: t.coordinadorEntrante.cedula,
        nombres: t.coordinadorEntrante.nombreCompleto.split(" ")[0] || "Coordinador",
        apellidos:
          t.coordinadorEntrante.nombreCompleto.split(" ").slice(1).join(" ") || "",
        nombreCompleto: t.coordinadorEntrante.nombreCompleto,
        iniciales: "CC",
        correo: t.coordinadorEntrante.correo,
        institucion: t.institucion,
        fechaSolicitud: t.fechaSolicitud,
        estado:
          t.estadoTramite === "En revisión"
            ? "EN_REVISION_GESTION"
            : t.estadoTramite === "Aprobado" || t.estadoTramite === "Aplicado"
              ? "Aprobada"
              : t.estadoTramite === "Rechazado"
                ? "Rechazada"
                : "PENDIENTE_ASIGNACION_GESTION",
        revisorGestion: t.revisorAsignado?.nombre,
        revisor: t.revisorAsignado?.nombre,
        documentos: ["ARP-R03_Cambio_Coordinador.pdf"],
        historial: [],
        anexoC: t.datosAnexoC,
      }));

    return [...fromGeneral, ...mappedFromCambio];
  }, [mode, solicitudes, tramitesCambio]);

  const kpiStats = useMemo(() => {
    const total = baseList.length;
    if (mode === "FIRMA_RESOLUCIONES") {
      const porFirmar = baseList.filter(
        (s) => s.estado === "PENDIENTE_DE_FIRMA" || s.estado === "RESOLUCION_GENERADA"
      ).length;
      const firmadas = baseList.filter(
        (s) => s.estado === "INSTITUCION_ACTIVA"
      ).length;
      const conIncidencia = baseList.filter(
        (s) => s.datosFirmaResolucion?.verificada === false
      ).length;
      return [
        {
          label: "Total Resoluciones A",
          value: total,
          sub: "En flujo de suscripción",
          icon: FileText,
          tone: "primary" as const,
        },
        {
          label: "Pendientes de Firma",
          value: porFirmar,
          sub: "Listas para FirmaEC",
          icon: FileSignature,
          tone: "warning" as const,
        },
        {
          label: "Suscritas y Activas",
          value: firmadas,
          sub: "Institución habilitada",
          icon: Stamp,
          tone: "success" as const,
        },
        {
          label: "Reintentos / Alertas",
          value: conIncidencia,
          sub: "Incidencias FirmaEC",
          icon: Clock,
          tone: "info" as const,
        },
      ];
    }

    const enTramite = baseList.filter(
      (s) =>
        s.estado === "PENDIENTE_ASIGNACION_GESTION" ||
        s.estado === "EN_REVISION_GESTION" ||
        s.estado === "APROBADO_GESTION" ||
        s.estado === "EN_REVISION_NORMATIVIDAD" ||
        s.estado === "PENDIENTE_DE_FIRMA" ||
        s.estado === "RESOLUCION_GENERADA" ||
        s.estado === "Pendiente"
    ).length;
    const aprobadas = baseList.filter(
      (s) =>
        s.estado === "INSTITUCION_ACTIVA" ||
        s.estado === "APROBADO_FINAL" ||
        s.estado === "Aprobada"
    ).length;
    const observadas = baseList.filter(
      (s) => s.estado === "Rechazada" || s.estado === "Cancelada"
    ).length;

    return [
      {
        label: "Total Expedientes",
        value: total,
        sub: config.badgeCode,
        icon: FileText,
        tone: "primary" as const,
      },
      {
        label: "En Trámite / Revisión",
        value: enTramite,
        sub: "Gestión / Normativa",
        icon: Clock,
        tone: "warning" as const,
      },
      {
        label: "Aprobados / Activos",
        value: aprobadas,
        sub: "Proceso completado",
        icon: CheckCircle2,
        tone: "success" as const,
      },
      {
        label: "Observados / Cerrados",
        value: observadas,
        sub: "Con notificación",
        icon: XCircle,
        tone: "info" as const,
      },
    ];
  }, [baseList, mode, config.badgeCode]);

  const filteredList = useMemo(() => {
    return baseList.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.institucion.toLowerCase().includes(q) ||
        item.nombreCompleto.toLowerCase().includes(q) ||
        item.cedula.toLowerCase().includes(q) ||
        (item.resolucion || "").toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterEstado === "TODOS") return true;
      if (filterEstado === "EN_TRAMITE") {
        return (
          item.estado === "PENDIENTE_ASIGNACION_GESTION" ||
          item.estado === "EN_REVISION_GESTION" ||
          item.estado === "APROBADO_GESTION" ||
          item.estado === "EN_REVISION_NORMATIVIDAD" ||
          item.estado === "PENDIENTE_DE_FIRMA" ||
          item.estado === "RESOLUCION_GENERADA" ||
          item.estado === "Pendiente"
        );
      }
      if (filterEstado === "APROBADOS") {
        return (
          item.estado === "INSTITUCION_ACTIVA" ||
          item.estado === "APROBADO_FINAL" ||
          item.estado === "Aprobada"
        );
      }
      if (filterEstado === "RECHAZADOS") {
        return item.estado === "Rechazada" || item.estado === "Cancelada";
      }
      return item.estado === filterEstado;
    });
  }, [baseList, searchQuery, filterEstado]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / ITEMS_PER_PAGE));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const renderEstadoBadge = (sol: SolicitudIngreso) => {
    const { tone, label } = getEstadoBadgeProps(sol.estado, sol.revisionIniciada);
    return (
      <Badge
        tone={tone}
        appearance="soft"
        size="sm"
        dot
        className="font-semibold text-[11px] normal-case tracking-normal px-2.5 py-0.5 inline-flex items-center shrink-0"
      >
        {label}
      </Badge>
    );
  };

  return (
    <WireframeDashboardLayout activeMenu={activeMenu}>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        {/* Encabezado al estilo Gestión de Usuarios del Administrador */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="primary" appearance="soft" size="sm" className="font-mono font-bold">
                {config.badgeCode}
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm">
                {config.badgeLabel}
              </Badge>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {config.title}
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {config.subtitle}
            </p>
          </div>

          {config.ctaLabel && config.ctaHref && (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={() => {
                if (mode === "MIS_EXPEDIENTES_A") {
                  setShowAnexoAModal(true);
                } else if (mode === "MIS_EXPEDIENTES_B") {
                  setShowAnexoBModal(true);
                } else {
                  router.push(config.ctaHref!);
                }
              }}
              className="gap-2 font-semibold shrink-0 shadow-xs"
            >
              <Plus className="size-4" />
              <span>{config.ctaLabel}</span>
            </Button>
          )}
        </div>

        {/* Tarjetas KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-surface border border-border rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold font-heading text-foreground">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {kpi.sub}
                  </p>
                </div>
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="size-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Contenedor Unificado estilo CuentasInternasView */}
        <div className="bg-surface border border-border rounded-2xl shadow-2xs overflow-hidden">
          {/* Barra de Herramientas */}
          <div className="p-4 border-b border-border/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
              <div className="w-full sm:max-w-xs">
                <InputGroup>
                  <InputGroupAddon>
                    <Search className="size-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    placeholder="Buscar por código, institución, cédula..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </div>

              <div className="w-full sm:w-56">
                <Select
                  value={filterEstado}
                  onValueChange={(val) => {
                    setFilterEstado(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === "FIRMA_RESOLUCIONES" ? (
                      <>
                        <SelectItem value="TODOS">Todos los estados de firma</SelectItem>
                        <SelectItem value="PENDIENTE_DE_FIRMA">Pendientes de firma</SelectItem>
                        <SelectItem value="INSTITUCION_ACTIVA">Firmadas / Institución Activa</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="TODOS">Todos los estados</SelectItem>
                        <SelectItem value="EN_TRAMITE">En trámite / revisión</SelectItem>
                        <SelectItem value="APROBADOS">Aprobados / Activos</SelectItem>
                        <SelectItem value="RECHAZADOS">Observados / Rechazados</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {(searchQuery || filterEstado !== "TODOS") && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterEstado("TODOS");
                    setCurrentPage(1);
                  }}
                  className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Limpiar</span>
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 ml-auto">
              <span className="text-xs text-muted-foreground font-medium">
                {filteredList.length}{" "}
                {filteredList.length === 1 ? "expediente" : "expedientes"}
              </span>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          {/* Vista Tabla o Tarjetas */}
          {filteredList.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <FileText className="size-8 text-muted-foreground mx-auto" />
              <h3 className="font-heading font-bold text-sm text-foreground">
                No se encontraron expedientes en esta bandeja
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Ajusta los filtros de búsqueda o inicia una nueva solicitud si corresponde a tu rol.
              </p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-bold">Expediente</TableHead>
                    <TableHead className="text-xs font-bold">Institución</TableHead>
                    <TableHead className="text-xs font-bold">
                      {mode === "MIS_EXPEDIENTES_B"
                        ? "Coordinador Designado"
                        : mode === "MIS_EXPEDIENTES_C"
                          ? "Coordinador Entrante"
                          : "Representante / Solicitante"}
                    </TableHead>
                    <TableHead className="text-xs font-bold">
                      {mode === "FIRMA_RESOLUCIONES"
                        ? "Resolución / Documento"
                        : mode === "MIS_EXPEDIENTES_B"
                          ? "Designación"
                          : mode === "MIS_EXPEDIENTES_C"
                            ? "Tipo de Cambio"
                            : "Resolución / Fase"}
                    </TableHead>
                    <TableHead className="text-xs font-bold">Fecha</TableHead>
                    <TableHead className="text-xs font-bold">Estado</TableHead>
                    <TableHead className="text-xs font-bold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedList.map((sol) => (
                    <TableRow key={sol.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-foreground whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span>{sol.id}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {sol.codigoDocumental}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5 max-w-[240px]">
                          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Building2 className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {sol.institucion}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {sol.anexoA?.entidadSiglas || "Institución SINARP"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {sol.nombreCompleto}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            CI: {sol.cedula}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mode === "FIRMA_RESOLUCIONES" || mode === "MIS_EXPEDIENTES_A" ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs font-semibold text-primary">
                              {sol.resolucion || "RES-DINARP-2026-PEND"}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {sol.revisorNormatividad
                                ? `Normativa: ${sol.revisorNormatividad}`
                                : sol.revisorGestion
                                  ? `Gestión: ${sol.revisorGestion}`
                                  : "Flujo Anexo A"}
                            </span>
                          </div>
                        ) : mode === "MIS_EXPEDIENTES_B" ? (
                          <div className="flex flex-col gap-0.5">
                            <Badge tone="primary" appearance="soft" size="sm" className="w-fit text-[10px]">
                              {sol.anexoB?.rolAsignado || "COORDINADOR"}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              Acuerdo FirmaEC verificado
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <Badge tone="info" appearance="soft" size="sm" className="w-fit text-[10px]">
                              {sol.anexoC?.aplicaCambioTitular && sol.anexoC?.aplicaCambioSuplente
                                ? "TITULAR Y SUPLENTE"
                                : sol.anexoC?.aplicaCambioSuplente
                                  ? "SUPLENTE"
                                  : "TITULAR"}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              Sustitución Anexo C
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {sol.fechaSolicitud}
                      </TableCell>
                      <TableCell>{renderEstadoBadge(sol)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {mode === "MIS_EXPEDIENTES_B" &&
                            activeUser?.role === "COORDINADOR_SINARP" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/enrolamiento-coordinador")}
                                className="text-xs font-semibold gap-1"
                              >
                                <ArrowUpRight className="size-3.5" />
                                <span>Acuerdo B</span>
                              </Button>
                            )}
                          <Button
                            type="button"
                            variant={
                              mode === "FIRMA_RESOLUCIONES" &&
                              (sol.estado === "PENDIENTE_DE_FIRMA" ||
                                sol.estado === "RESOLUCION_GENERADA")
                                ? "primary"
                                : "outline"
                            }
                            size="sm"
                            asChild
                            className="text-xs font-semibold gap-1.5"
                          >
                            <Link href={`${basePath}/${sol.id}`}>
                              {mode === "FIRMA_RESOLUCIONES" &&
                              (sol.estado === "PENDIENTE_DE_FIRMA" ||
                                sol.estado === "RESOLUCION_GENERADA") ? (
                                <FileSignature className="size-3.5" />
                              ) : (
                                <Eye className="size-3.5" />
                              )}
                              <span>{config.detailActionLabel}</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedList.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-surface border border-border rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                        {sol.id}
                      </Badge>
                      {renderEstadoBadge(sol)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-foreground line-clamp-1">
                        {sol.institucion}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {sol.nombreCompleto} · CI {sol.cedula}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Formulario:</span>
                        <span className="font-mono font-semibold text-foreground">
                          {sol.codigoDocumental}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha:</span>
                        <span className="text-foreground">{sol.fechaSolicitud}</span>
                      </div>
                      {sol.resolucion && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Resolución:</span>
                          <span className="font-mono font-semibold text-primary">
                            {sol.resolucion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    asChild
                    className="w-full text-xs font-semibold gap-1.5"
                  >
                    <Link href={`${basePath}/${sol.id}`}>
                      <Eye className="size-3.5" />
                      <span>{config.detailActionLabel}</span>
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {filteredList.length > 0 && totalPages > 1 && (
            <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Validación de la Institución (Anexo A) */}
      <ValidacionInstitucionModal
        open={showAnexoAModal}
        onOpenChange={setShowAnexoAModal}
        cancelLabel="Cancelar"
        onValidated={(data) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "dinarp_anexo_a_validation",
              JSON.stringify(data)
            );
          }
          setShowAnexoAModal(false);
          router.push("/registro-institucion");
        }}
      />

      {/* Modal de Confirmación de Invitación de Coordinador (Anexo B) */}
      <ValidacionCoordinadorModal
        open={showAnexoBModal}
        onOpenChange={setShowAnexoBModal}
        cancelLabel="Cancelar"
        onValidated={(data) => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "dinarp_anexo_b_validation",
              JSON.stringify(data)
            );
          }
          setShowAnexoBModal(false);
          router.push(`/enrolamiento-coordinador?cedula=${data.cedula}`);
        }}
      />
    </WireframeDashboardLayout>
  );
}
