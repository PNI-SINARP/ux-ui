"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowLeft,
  Eye,
  Edit,
  ChevronDown,
  X,
  Filter,
  Receipt,
  FileCheck2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  History,
  UploadCloud,
  FileSpreadsheet,
  Building2,
  ExternalLink,
  ShieldCheck,
  Check,
  Info,
  KeyRound,
  Copy,
  EyeOff,
  Lock,
  Server,
  Scale,
  FileSignature
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "@/components/ui/search";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
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
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";

import { MOCK_USERS_BY_ROLE, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { useSolicitudesStore, SolicitudAcceso } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { WireframeTour, TourStep } from "@/components/layout/wireframes/wireframe-tour";
import { CredencialTecnicaModal } from "@/modules/acceso-interoperabilidad/components/credencial-tecnica-modal";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

const roleOptions = [
  { value: "COORDINADOR_SINARP", label: "Coordinador SINARP" },
  { value: "APROBADOR", label: "Aprobador" },
  { value: "FACTURACION", label: "Facturación" },
];

export function AccesoSolicitudesView() {
  const role = "COORDINADOR_SINARP" as UserRole;
  const { solicitudes, validarPagoConCur, simularPagoRealizado } = useSolicitudesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState("ALL");
  const [estadoFilter, setEstadoFilter] = useState("ALL");
  const [proyectoFilter, setProyectoFilter] = useState("ALL");
  const [fuenteFilter, setFuenteFilter] = useState("ALL");
  const [responsableFilter, setResponsableFilter] = useState("ALL");
  const [fechaFilter, setFechaFilter] = useState("ALL");

  // Modales de interacción
  const [modalFactura, setModalFactura] = useState<SolicitudAcceso | null>(null);
  const [modalCur, setModalCur] = useState<SolicitudAcceso | null>(null);
  const [modalValidarPago, setModalValidarPago] = useState<SolicitudAcceso | null>(null);
  const [modalConfirmarValidacion, setModalConfirmarValidacion] = useState<SolicitudAcceso | null>(null);
  const [modalCredenciales, setModalCredenciales] = useState<SolicitudAcceso | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [curFile, setCurFile] = useState<File | null>(null);
  const [curFileError, setCurFileError] = useState(false);
  const [numeroCurInput, setNumeroCurInput] = useState("");

  // Limpiar filtros al cambiar rol
  useEffect(() => {
    setSearchTerm("");
    setInstitucionFilter("ALL");
    setEstadoFilter("ALL");
    setResponsableFilter("ALL");
    setFechaFilter("ALL");
  }, [role]);

  // Solicitudes visibles según rol
  const visibleSolicitudes = useMemo(() => {
    if (role === "APROBADOR") {
      // Muestra principalmente solicitudes que requieren intervención del Aprobador
      const priorizadas = solicitudes.filter((s) => {
        const est = String(s.estado);
        return (
          est === "Por revisar" ||
          est === "En revisión" ||
          est === "Pendiente de aprobación" ||
          est === "Reenviada" ||
          est === "Reenviada para aprobación" ||
          est === "Aprobada" ||
          est === "Rechazada" ||
          est === "Con observaciones" ||
          est === "Acceso generado"
        );
      });
      // Priorizar visualmente las pendientes de revisión
      return [...priorizadas].sort((a, b) => {
        const orderA = (a.estado.includes("revis") || a.estado.includes("Reenviada")) ? 0 : 1;
        const orderB = (b.estado.includes("revis") || b.estado.includes("Reenviada")) ? 0 : 1;
        return orderA - orderB;
      });
    }

    if (role === "FACTURACION") {
      // Únicamente solicitudes de instituciones privadas en etapa financiera
      return solicitudes.filter(
        (s) =>
          s.tipoInstitucion === "Privada" &&
          (s.estado === "Pago pendiente" ||
            s.estado === "Pendiente de validación de pago" ||
            s.estado === "Pago en validación" ||
            s.estado === "Pago validado" ||
            s.estado === "Pago verificado" ||
            s.estado === "Acceso generado")
      );
    }

    // COORDINADOR_SINARP: todas las solicitudes institucionales
    return solicitudes;
  }, [role, solicitudes]);

  // Listas para filtros dinámicos
  const institucionesList = useMemo(() => {
    return Array.from(new Set(visibleSolicitudes.map((s) => s.institucion))).filter(Boolean);
  }, [visibleSolicitudes]);

  const estadosList = useMemo(() => {
    if (role === "FACTURACION") {
      return ["Pago pendiente", "Pendiente de validación de pago", "Pago validado", "Acceso generado"];
    }
    if (role === "APROBADOR") {
      return ["Por revisar", "Reenviada", "Aprobada", "Rechazada", "Acceso generado"];
    }
    return Array.from(new Set(visibleSolicitudes.map((s) => s.estado))).filter(Boolean);
  }, [role, visibleSolicitudes]);

  const responsablesList = useMemo(() => {
    return Array.from(new Set(visibleSolicitudes.map((s) => s.responsable))).filter(Boolean);
  }, [visibleSolicitudes]);

  const proyectosList = useMemo(() => {
    return Array.from(new Set(visibleSolicitudes.map((s) => s.proyectoNombre).filter(Boolean))) as string[];
  }, [visibleSolicitudes]);

  const fuentesList = useMemo(() => {
    return Array.from(new Set(visibleSolicitudes.map((s) => s.fuentePrincipal || s.fuentes?.[0]?.nombre).filter(Boolean))) as string[];
  }, [visibleSolicitudes]);

  const institucionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las instituciones" },
    ...institucionesList.map((inst) => ({ value: inst, label: inst }))
  ], [institucionesList]);

  const proyectoOptions = useMemo(() => [
    { value: "ALL", label: "Todos los proyectos" },
    ...proyectosList.map((p) => ({ value: p, label: p }))
  ], [proyectosList]);

  const fuenteOptions = useMemo(() => [
    { value: "ALL", label: "Todas las fuentes" },
    ...fuentesList.map((f) => ({ value: f, label: f }))
  ], [fuentesList]);

  const estadoOptions = useMemo(() => [
    { value: "ALL", label: "Todos los estados" },
    ...estadosList.map((est) => ({ value: est, label: est }))
  ], [estadosList]);

  const responsableOptions = useMemo(() => [
    { value: "ALL", label: "Todos los responsables" },
    ...responsablesList.map((resp) => ({ value: resp, label: resp }))
  ], [responsablesList]);

  const fechaOptions = useMemo(() => [
    { value: "ALL", label: "Todas las fechas" },
    { value: "7d", label: "Últimos 7 días" },
    { value: "30d", label: "Últimos 30 días" },
  ], []);

  const filteredSolicitudes = useMemo(() => {
    return visibleSolicitudes.filter((s) => {
      const matchSearch =
        !searchTerm.trim() ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.institucion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.proyectoNombre && s.proyectoNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.servicioPrincipal && s.servicioPrincipal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.fuentePrincipal && s.fuentePrincipal.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchInstitucion =
        institucionFilter === "ALL" || s.institucion === institucionFilter;

      const matchProyecto =
        proyectoFilter === "ALL" || s.proyectoNombre === proyectoFilter;

      const fuenteNombre = s.fuentePrincipal || s.fuentes?.[0]?.nombre || "";
      const matchFuente =
        fuenteFilter === "ALL" || fuenteNombre === fuenteFilter;

      let matchEstado = true;
      if (estadoFilter !== "ALL") {
        const est = String(s.estado);
        if (estadoFilter === "Por revisar" || estadoFilter === "En revisión") {
          matchEstado = est === "Por revisar" || est === "En revisión" || est === "Pendiente de aprobación";
        } else if (estadoFilter === "Reenviada") {
          matchEstado = est === "Reenviada" || est === "Reenviada para aprobación";
        } else if (estadoFilter === "Rechazada") {
          matchEstado = est === "Rechazada" || est === "Con observaciones" || est === "Requiere corrección" || est === "Observada";
        } else if (estadoFilter === "Pendiente de validación de pago") {
          matchEstado = est === "Pendiente de validación de pago" || est === "Pago en validación";
        } else if (estadoFilter === "Pago validado") {
          matchEstado = est === "Pago validado" || est === "Pago verificado";
        } else if (estadoFilter === "Acceso generado" || estadoFilter === "Acceso habilitado") {
          matchEstado = est === "Acceso generado" || est === "Acceso habilitado";
        } else {
          matchEstado = est === estadoFilter;
        }
      }

      const matchResponsable =
        responsableFilter === "ALL" || s.responsable === responsableFilter;

      let matchFecha = true;
      if (fechaFilter === "7d") {
        const itemDate = new Date(s.fecha);
        const refDate = new Date("2026-09-23");
        const diffDays = Math.floor((refDate.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));
        matchFecha = diffDays <= 7 && diffDays >= 0;
      } else if (fechaFilter === "30d") {
        const itemDate = new Date(s.fecha);
        const refDate = new Date("2026-09-23");
        const diffDays = Math.floor((refDate.getTime() - itemDate.getTime()) / (1000 * 3600 * 24));
        matchFecha = diffDays <= 30 && diffDays >= 0;
      }

      return matchSearch && matchInstitucion && matchProyecto && matchFuente && matchEstado && matchResponsable && matchFecha;
    });
  }, [visibleSolicitudes, searchTerm, institucionFilter, proyectoFilter, fuenteFilter, estadoFilter, responsableFilter, fechaFilter]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    institucionFilter !== "ALL" ||
    proyectoFilter !== "ALL" ||
    fuenteFilter !== "ALL" ||
    estadoFilter !== "ALL" ||
    responsableFilter !== "ALL" ||
    fechaFilter !== "ALL";

  const clearAllFilters = () => {
    setSearchTerm("");
    setInstitucionFilter("ALL");
    setProyectoFilter("ALL");
    setFuenteFilter("ALL");
    setEstadoFilter("ALL");
    setResponsableFilter("ALL");
    setFechaFilter("ALL");
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Acceso habilitado":
      case "Acceso generado":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold">
            <ShieldCheck className="size-3" />
            <span>Acceso habilitado</span>
          </Badge>
        );
      case "Aprobada":
      case "Pago validado":
      case "Pago verificado":
        return (
          <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-semibold">
            <CheckCircle2 className="size-3" />
            <span>{estado}</span>
          </Badge>
        );
      case "Habilitación técnica":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="gap-1 font-semibold">
            <Clock className="size-3" />
            <span>Habilitación técnica</span>
          </Badge>
        );
      case "Aprobación final":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="gap-1 font-semibold">
            <CheckCircle2 className="size-3" />
            <span>Aprobación final</span>
          </Badge>
        );
      case "Pendiente de firma":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
            <Clock className="size-3" />
            <span>Pendiente de firma</span>
          </Badge>
        );
      case "En formalización":
        return (
          <Badge tone="primary" appearance="soft" size="sm" className="gap-1 font-semibold">
            <Clock className="size-3" />
            <span>En formalización</span>
          </Badge>
        );
      case "En revisión jurídica":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
            <Scale className="size-3" />
            <span>En revisión jurídica</span>
          </Badge>
        );
      case "Por revisar":
      case "En revisión":
      case "Pendiente de aprobación":
      case "Reenviada":
      case "Reenviada para aprobación":
        return (
          <Badge tone="info" appearance="soft" size="sm" className="gap-1 font-semibold">
            <Clock className="size-3" />
            <span>{estado}</span>
          </Badge>
        );
      case "Pendiente de pago":
      case "Pendiente de validación de pago":
      case "Pago en validación":
      case "Pago pendiente":
        return (
          <Badge tone="warning" appearance="soft" size="sm" className="gap-1 font-semibold">
            <AlertTriangle className="size-3" />
            <span>{estado}</span>
          </Badge>
        );
      case "Requiere corrección":
      case "Observada":
      case "Rechazada":
      case "Con observaciones":
        return (
          <Badge tone="danger" appearance="soft" size="sm" className="gap-1 font-semibold">
            <AlertTriangle className="size-3" />
            <span>Requiere corrección</span>
          </Badge>
        );
      case "Cerrada por vencimiento":
      case "Cerrada":
        return (
          <Badge tone="neutral" appearance="soft" size="sm">
            <span>Cerrada</span>
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

  // Títulos y descripciones dinámicos según rol
  const getHeaderInfo = () => {
    if (role === "FACTURACION") {
      return {
        title: "Gestión de solicitudes pendientes de pago",
        desc: "Consulta las solicitudes privadas aprobadas, valida los pagos registrados en SIGEF y anexa los comprobantes financieros al proceso.",
        breadcrumb: "Gestión de solicitudes pendientes de pago"
      };
    }
    if (role === "APROBADOR") {
      return {
        title: "Gestión de solicitudes pendientes",
        desc: "Revisa las solicitudes de interoperabilidad pendientes de aprobación y valida la justificación y finalidad de uso de los datos solicitados.",
        breadcrumb: "Gestión de solicitudes pendientes"
      };
    }
    return {
      title: "Gestión de solicitudes",
      desc: "Crea, consulta y realiza seguimiento a las solicitudes de acceso a servicios de interoperabilidad.",
      breadcrumb: "Gestión de solicitudes"
    };
  };

  const headerInfo = getHeaderInfo();

  // Handlers para validar pago y CUR
  const handleOpenValidar = (sol: SolicitudAcceso) => {
    setModalValidarPago(sol);
    setCurFile(null);
    setCurFileError(false);
    setNumeroCurInput(`CUR-${Math.floor(Math.random() * 80000 + 10000)}`);
  };

  const handleProcederConfirmacion = () => {
    if (!curFile) {
      setCurFileError(true);
      return;
    }
    setModalConfirmarValidacion(modalValidarPago);
  };

  const handleConfirmarValidacionFinal = () => {
    if (modalConfirmarValidacion && curFile) {
      validarPagoConCur(modalConfirmarValidacion.id, {
        numeroCur: numeroCurInput || "CUR-009412",
        nombreArchivo: curFile.name,
        tamano: `${(curFile.size / (1024 * 1024)).toFixed(1)} MB`,
        usuarioResponsable: "Lcda. Patricia Morales (Facturación)"
      });
      toast.success("Pago validado y CUR anexado correctamente");
      setModalConfirmarValidacion(null);
      setModalValidarPago(null);
      setCurFile(null);
    }
  };

  // Tour guiado
  const [tourOpen, setTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const getSteps = (): TourStep[] => {
    if (role === "FACTURACION") {
      return [
        {
          id: "step1",
          target: "#header-title",
          title: "Gestión de solicitudes pendientes de pago",
          description: "Visualiza solicitudes de instituciones privadas aprobadas que requieren verificación del pago en SIGEF y anexo de CUR."
        },
        {
          id: "step2",
          target: "#table-solicitudes",
          title: "Bandeja financiera",
          description: "Consulta valores pendientes, emite comprobantes de factura y registra la validación de pagos acreditados."
        }
      ];
    }
    if (role === "APROBADOR") {
      return [
        {
          id: "step1",
          target: "#header-title",
          title: "Gestión de solicitudes pendientes",
          description: "Revisa las solicitudes de interoperabilidad pendientes de aprobación y valida la justificación y finalidad de uso."
        },
        {
          id: "step2",
          target: "#table-solicitudes",
          title: "Bandeja de aprobación",
          description: "Accede al detalle técnico de campos y justificaciones para aprobar o solicitar ajustes."
        }
      ];
    }
    return [
      {
        id: "step1",
        target: "#header-title",
        title: "Gestión de solicitudes",
        description: "Crea, consulta y realiza seguimiento a las solicitudes de interoperabilidad durante todo su ciclo."
      },
      {
        id: "step2",
        target: "#btn-nueva-solicitud",
        title: "Nueva solicitud",
        description: "Inicia el requerimiento institucional para consumir datos oficiales del Estado."
      }
    ];
  };

  const steps = getSteps();

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad"
      currentUser={MOCK_USERS_BY_ROLE[role]}
      currentRole={role}
      
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: headerInfo.breadcrumb }
      ]}
      headerSlot={
        <div className="flex items-center gap-2" id="role-selector-tour">
          <Combobox
            items={roleOptions}
            value={roleOptions.find(opt => opt.value === role) || roleOptions[0]}
            onValueChange={(val) => {
              
            }}
          >
            <ComboboxSelectTrigger className="h-8 text-xs min-w-[185px]" />
            <ComboboxContent align="start" className="min-w-[200px]">
              <ComboboxList>
                {roleOptions.map((opt) => (
                  <ComboboxItem key={opt.value} value={opt}>
                    {opt.label}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      }
    >
      <WireframeTour
        isOpen={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border border-border rounded-2xl bg-card p-6 sm:p-8 flex flex-col gap-6 shadow-xs">
          {/* Header dinámico */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
            <div className="flex flex-col gap-1" id="header-title">
              <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {headerInfo.title}
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {headerInfo.desc}
              </p>
            </div>

            {/* Botón Nueva Solicitud SOLO para Coordinador SINARP */}
            {role === "COORDINADOR_SINARP" && (
              <Link href="/acceso-interoperabilidad/solicitudes/nueva">
                <Button className="gap-2 shrink-0 shadow-sm" id="btn-nueva-solicitud">
                  <Plus className="size-4" />
                  Nueva solicitud
                </Button>
              </Link>
            )}
          </div>

          {/* Banner de contexto informativo para Rol Facturación */}
          {role === "FACTURACION" && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-3">
              <Info className="size-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-foreground">
                  Gestión económica de convenios y contratos privados
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Las solicitudes privadas requieren validación de acreditación en <strong className="text-foreground">SIGEF (Sistema Integrado de Gestión Financiera)</strong>. Una vez corroborado el depósito bancario, adjunta el Comprobante Único de Registro (CUR) para que el equipo técnico habilite las credenciales de interoperabilidad.
                </p>
              </div>
            </div>
          )}

          {/* Toolbar de Filtros */}
          <div className="flex flex-col gap-3.5" id="toolbar-filtros">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search */}
                <div className="w-full sm:w-72 md:w-80">
                  <Search
                    placeholder={
                      role === "FACTURACION"
                        ? "Buscar por código, banco o factura..."
                        : role === "APROBADOR"
                        ? "Buscar por código, institución o fuente..."
                        : "Buscar solicitud..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClear={() => setSearchTerm("")}
                    className="w-full bg-background"
                  />
                </div>

                {/* Filtro: Estado */}
                <Combobox
                  items={estadoOptions}
                  value={estadoOptions.find((o) => o.value === estadoFilter) || estadoOptions[0]}
                  onValueChange={(val) => {
                    if (val) setEstadoFilter(val.value);
                  }}
                >
                  <ComboboxSelectTrigger
                    className={cn(
                      "h-11 rounded-full px-4 text-xs sm:text-sm font-medium bg-background border-border/80 hover:bg-muted/40 transition-colors gap-1.5 shadow-none",
                      estadoFilter !== "ALL" && "border-primary text-primary font-semibold bg-primary/5"
                    )}
                  >
                    <span className="truncate max-w-[160px]">
                      {estadoFilter === "ALL" ? "Estado: Todos" : `Estado: ${estadoFilter}`}
                    </span>
                  </ComboboxSelectTrigger>
                  <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto">
                    <ComboboxList>
                      {estadoOptions.map((opt) => (
                        <ComboboxItem key={opt.value} value={opt} className="text-xs">
                          {opt.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {/* Filtro: Institución */}
                <Combobox
                  items={institucionOptions}
                  value={institucionOptions.find((o) => o.value === institucionFilter) || institucionOptions[0]}
                  onValueChange={(val) => {
                    if (val) setInstitucionFilter(val.value);
                  }}
                >
                  <ComboboxSelectTrigger
                    className={cn(
                      "h-11 rounded-full px-4 text-xs sm:text-sm font-medium bg-background border-border/80 hover:bg-muted/40 transition-colors gap-1.5 shadow-none",
                      institucionFilter !== "ALL" && "border-primary text-primary font-semibold bg-primary/5"
                    )}
                  >
                    <span className="truncate max-w-[150px]">
                      {institucionFilter === "ALL" ? "Institución: Todas" : institucionFilter}
                    </span>
                  </ComboboxSelectTrigger>
                  <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto">
                    <ComboboxList>
                      {institucionOptions.map((opt) => (
                        <ComboboxItem key={opt.value} value={opt} className="text-xs">
                          {opt.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {/* Filtro: Proyecto (para Coordinador) */}
                {role === "COORDINADOR_SINARP" && (
                  <Combobox
                    items={proyectoOptions}
                    value={proyectoOptions.find((o) => o.value === proyectoFilter) || proyectoOptions[0]}
                    onValueChange={(val) => {
                      if (val) setProyectoFilter(val.value);
                    }}
                  >
                    <ComboboxSelectTrigger
                      className={cn(
                        "h-11 rounded-full px-4 text-xs sm:text-sm font-medium bg-background border-border/80 hover:bg-muted/40 transition-colors gap-1.5 shadow-none",
                        proyectoFilter !== "ALL" && "border-primary text-primary font-semibold bg-primary/5"
                      )}
                    >
                      <span className="truncate max-w-[150px]">
                        {proyectoFilter === "ALL" ? "Proyecto: Todos" : proyectoFilter}
                      </span>
                    </ComboboxSelectTrigger>
                    <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto">
                      <ComboboxList>
                        {proyectoOptions.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt} className="text-xs">
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}

                {/* Filtro: Fuente */}
                {role === "COORDINADOR_SINARP" && (
                  <Combobox
                    items={fuenteOptions}
                    value={fuenteOptions.find((o) => o.value === fuenteFilter) || fuenteOptions[0]}
                    onValueChange={(val) => {
                      if (val) setFuenteFilter(val.value);
                    }}
                  >
                    <ComboboxSelectTrigger
                      className={cn(
                        "h-11 rounded-full px-4 text-xs sm:text-sm font-medium bg-background border-border/80 hover:bg-muted/40 transition-colors gap-1.5 shadow-none",
                        fuenteFilter !== "ALL" && "border-primary text-primary font-semibold bg-primary/5"
                      )}
                    >
                      <span className="truncate max-w-[150px]">
                        {fuenteFilter === "ALL" ? "Fuente: Todas" : fuenteFilter}
                      </span>
                    </ComboboxSelectTrigger>
                    <ComboboxContent align="start" className="w-64 max-h-72 overflow-y-auto">
                      <ComboboxList>
                        {fuenteOptions.map((opt) => (
                          <ComboboxItem key={opt.value} value={opt} className="text-xs">
                            {opt.label}
                          </ComboboxItem>
                        ))}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                )}

                {/* Filtro: Fecha */}
                <Combobox
                  items={fechaOptions}
                  value={fechaOptions.find((o) => o.value === fechaFilter) || fechaOptions[0]}
                  onValueChange={(val) => {
                    if (val) setFechaFilter(val.value);
                  }}
                >
                  <ComboboxSelectTrigger
                    className={cn(
                      "h-11 rounded-full px-4 text-xs sm:text-sm font-medium bg-background border-border/80 hover:bg-muted/40 transition-colors gap-1.5 shadow-none",
                      fechaFilter !== "ALL" && "border-primary text-primary font-semibold bg-primary/5"
                    )}
                  >
                    <span className="truncate">
                      {fechaOptions.find((o) => o.value === fechaFilter)?.label || "Fecha: Todas"}
                    </span>
                  </ComboboxSelectTrigger>
                  <ComboboxContent align="start" className="w-48">
                    <ComboboxList>
                      {fechaOptions.map((opt) => (
                        <ComboboxItem key={opt.value} value={opt} className="text-xs">
                          {opt.label}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="h-11 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3.5"
                  >
                    <X className="size-3.5 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              <span className="text-xs text-muted-foreground shrink-0 self-center">
                Mostrando <strong className="text-foreground font-semibold">{filteredSolicitudes.length}</strong> de{" "}
                <strong className="text-foreground font-semibold">{visibleSolicitudes.length}</strong> solicitudes
              </span>
            </div>
          </div>

          {/* TABLA PRINCIPAL SEGÚN ROL */}
          <div className="overflow-x-auto border-y border-border bg-card mt-2">
            <Table id="table-solicitudes">
              <TableHeader>
                {role === "COORDINADOR_SINARP" && (
                  <TableRow>
                    <TableHead>Número de solicitud</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Institución / Fuente</TableHead>
                    <TableHead>Cantidad de campos</TableHead>
                    <TableHead>Tipo de datos</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-36 text-center">Próxima acción</TableHead>
                  </TableRow>
                )}

                {role === "APROBADOR" && (
                  <TableRow>
                    <TableHead>N.º de solicitud</TableHead>
                    <TableHead>Institución solicitante</TableHead>
                    <TableHead>Institución proveedora</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Fecha de envío</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                )}

                {role === "FACTURACION" && (
                  <TableRow>
                    <TableHead>N.º de solicitud</TableHead>
                    <TableHead>Institución</TableHead>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Fecha de aprobación</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                )}
              </TableHeader>

              <TableBody>
                {filteredSolicitudes.map((s) => {
                  const fuenteNombre = s.fuentePrincipal || s.fuentes?.[0]?.nombre || "Dirección General de Registro Civil, Identificación y Cedulación";
                  const servicioNombre = s.servicioPrincipal || "Consulta de Datos de Identidad";
                  const fechaAprobacion = s.fechaAprobacion || s.ultimaActualizacion.substring(0, 10);
                  const valorFactura = s.factura?.valor || "$ 150.00";

                  if (role === "COORDINADOR_SINARP") {
                    const fuenteNombre = s.fuentePrincipal || s.fuentes?.[0]?.nombre || "Dirección General de Registro Civil";
                    const proyectoNombre = s.proyectoNombre || "Proyecto General";
                    const totalCampos = s.camposCount ?? s.fuentes?.reduce((acc, f) => acc + (f.campos?.length || 0), 0) ?? 2;
                    const tieneConfidenciales = s.fuentes?.some((f) => f.campos?.some((c) => c.clasificacion === "Confidencial")) ?? false;
                    const isObservada = s.estado === "Requiere corrección" || s.estado === "Observada" || s.estado === "Rechazada" || s.estado === "Con observaciones";
                    const isFirma = s.estado === "Pendiente de firma";
                    const isPago = s.estado === "Pendiente de pago" || s.estado === "Pago pendiente";
                    const isHabilitada = s.estado === "Acceso habilitado" || s.estado === "Acceso generado";

                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold text-foreground">
                          <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`} className="hover:underline text-primary font-mono text-xs">
                            {s.id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-foreground max-w-[170px] truncate" title={proyectoNombre}>
                          <span className="text-xs font-medium">{proyectoNombre}</span>
                        </TableCell>
                        <TableCell className="max-w-[210px]">
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-foreground truncate" title={s.institucion}>{s.institucion}</span>
                            <span className="text-muted-foreground truncate text-[11px]" title={fuenteNombre}>{fuenteNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-semibold text-foreground">{totalCampos} campos</span>
                        </TableCell>
                        <TableCell>
                          {tieneConfidenciales ? (
                            <Badge tone="warning" appearance="soft" size="sm" className="text-[11px] font-semibold gap-1">
                              <AlertTriangle className="size-3" />
                              Confidencial
                            </Badge>
                          ) : (
                            <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px] font-semibold">
                              Accesible
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {s.fecha.substring(0, 10)}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(s.estado)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isObservada && (
                              <Button asChild size="sm" className="h-7 text-xs gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                                <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}?edit=true`}>
                                  <Edit className="size-3.5" />
                                  Corregir
                                </Link>
                              </Button>
                            )}
                            {isFirma && (
                              <Button asChild size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold">
                                <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                                  <FileSignature className="size-3.5" />
                                  Firmar
                                </Link>
                              </Button>
                            )}
                            {isPago && (
                              <Button asChild size="sm" className="h-7 text-xs gap-1 bg-primary text-primary-foreground font-semibold">
                                <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}/facturacion`}>
                                  <CreditCard className="size-3.5" />
                                  Pagar
                                </Link>
                              </Button>
                            )}
                            {isHabilitada && (
                              <Button
                                size="sm"
                                onClick={() => setModalCredenciales(s)}
                                className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                              >
                                <KeyRound className="size-3.5" />
                                Credencial
                              </Button>
                            )}
                            {!isObservada && !isFirma && !isPago && !isHabilitada && (
                              <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1 border-border">
                                <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                                  <Eye className="size-3.5" />
                                  Ver detalle
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (role === "APROBADOR") {
                    const st = String(s.estado);
                    const isPendiente = st === "Por revisar" || st === "En revisión" || st === "Pendiente de aprobación" || st === "Reenviada";
                    return (
                      <TableRow key={s.id} className={cn(isPendiente && "bg-primary/[0.02]")}>
                        <TableCell className="font-semibold text-foreground">
                          <div className="flex items-center gap-1.5">
                            {isPendiente && <span className="size-2 rounded-full bg-primary animate-pulse" />}
                            <span>{s.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{s.institucion}</TableCell>
                        <TableCell className="text-muted-foreground">{fuenteNombre}</TableCell>
                        <TableCell className="text-foreground">{servicioNombre}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{s.fecha.substring(0, 10)}</TableCell>
                        <TableCell>{getEstadoBadge(s.estado)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                    <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Ver detalle</p>
                                </TooltipContent>
                              </Tooltip>

                              {s.estado === "Acceso generado" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button onClick={() => setModalCredenciales(s)} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <KeyRound className="size-4" />
                                      
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Ver credenciales de acceso</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  if (role === "FACTURACION") {
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold text-foreground">{s.id}</TableCell>
                        <TableCell className="font-medium text-foreground">{s.institucion}</TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-foreground">{fuenteNombre}</span>
                            <span className="text-muted-foreground">{servicioNombre}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{fechaAprobacion}</TableCell>
                        <TableCell className="font-bold text-foreground">{valorFactura}</TableCell>
                        <TableCell>{getEstadoBadge(s.estado)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-3">
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button asChild variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                    <Link href={`/acceso-interoperabilidad/solicitudes/${s.id}`}>
                                      <Eye className="size-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p className="text-xs">Ver detalle</p>
                                </TooltipContent>
                              </Tooltip>

                              {s.estado === "Acceso generado" && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button onClick={() => setModalCredenciales(s)} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <KeyRound className="size-4" />
                                      
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Ver credenciales de acceso</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {/* Acciones según estado para Facturación: si el pago está pendiente no se muestra factura (se gestiona externamente) */}

                              {(s.estado === "Pendiente de validación de pago" || s.estado === "Pago en validación") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button onClick={() => handleOpenValidar(s)} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <CheckCircle2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Validar pago</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}

                              {(s.estado === "Pago validado" || s.estado === "Pago verificado") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button onClick={() => setModalCur(s)} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                      <FileCheck2 className="size-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-xs">Ver CUR</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return null;
                })}

                {filteredSolicitudes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No se encontraron solicitudes para los filtros aplicados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* â”€â”€â”€ MODAL: VER FACTURA (ROL FACTURACIÓN / COORDINADOR) â”€â”€â”€ */}
      <Dialog open={Boolean(modalFactura)} onOpenChange={(open) => !open && setModalFactura(null)}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Receipt className="size-5 text-primary" />
              Factura Electrónica {modalFactura?.factura?.numero || "FAC-0028"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Comprobante de cobro emitido por tarifa de acceso a fuentes de interoperabilidad.
            </DialogDescription>
          </DialogHeader>

          {modalFactura && (
            <div className="space-y-4 my-2 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/70">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Institución Privada:</span>
                  <span className="font-bold text-foreground text-sm">{modalFactura.institucion}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contrato Asociado:</span>
                  <span className="font-mono font-bold text-foreground text-sm">{modalFactura.contrato || "CONTR-2026-0019"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Fecha de Emisión:</span>
                  <span className="text-foreground">{modalFactura.factura?.fechaEmision || modalFactura.fecha.substring(0, 10)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Estado financiero:</span>
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border text-foreground">Pago pendiente</Badge>
                </div>
              </div>

              <div>
                <span className="font-semibold text-foreground text-xs block mb-2">Desglose de fuentes tasadas:</span>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/70 text-muted-foreground border-b border-border text-left">
                      <tr>
                        <th className="p-2.5">Concepto / Fuente</th>
                        <th className="p-2.5 text-right">Tarifa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {(modalFactura.factura?.detalleServicios || [
                        { servicio: modalFactura.servicioPrincipal || "Consulta de Interoperabilidad", valor: modalFactura.factura?.valor || "$ 150.00" }
                      ]).map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 text-foreground">{item.servicio}</td>
                          <td className="p-2.5 text-right font-mono font-semibold text-foreground">{item.valor}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30 font-bold">
                        <td className="p-2.5 text-foreground">Total a Liquidar</td>
                        <td className="p-2.5 text-right text-foreground font-mono text-sm">{modalFactura.factura?.valor || "$ 150.00"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-border bg-background text-[11px] text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Instrucciones de pago para la entidad privada:</p>
                <p>Transferencia a cuenta fiscal del Tesoro Nacional en Banco Central del Ecuador (Sublínea DINARP 130108). Notificar acreditación una vez efectuada.</p>
              </div>

              {/* Opción rápida de simular pago de entidad privada para pruebas */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">¿Simular que el banco ya pagó?</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    simularPagoRealizado(modalFactura.id);
                    toast.success("Pago registrado externamente. La solicitud pasó a Pendiente de validación de pago.");
                    setModalFactura(null);
                  }}
                  className="h-7 text-xs border-dashed"
                >
                  Simular pago realizado
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60 flex items-center justify-between sm:justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalFactura(null)}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              Volver a la bandeja de solicitudes
            </Button>
            <Button variant="neutral" size="sm" onClick={() => setModalFactura(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL: VER CUR (ROL FACTURACIÓN) â”€â”€â”€ */}
      <Dialog open={Boolean(modalCur)} onOpenChange={(open) => !open && setModalCur(null)}>
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-emerald-600" />
              Comprobante Único de Registro — CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Documento financiero oficial verificado en SIGEF y anexado al expediente de interoperabilidad.
            </DialogDescription>
          </DialogHeader>

          {modalCur && (
            <div className="space-y-4 my-2 text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">Pago Verificado y Validado</p>
                  <p className="text-muted-foreground text-[11px]">
                    El ingreso de fondos fue validado externamente en SIGEF y el CUR ha sido incorporado formalmente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">N.º de CUR:</span>
                  <span className="font-mono font-bold text-foreground text-sm">{modalCur.cur?.numeroCur || "CUR-008814"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Archivo anexo:</span>
                  <span className="font-medium text-primary flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {modalCur.cur?.nombreArchivo || "CUR_SIGEF_BancoGuayaquil.pdf"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Fecha y hora de registro:</span>
                  <span className="text-foreground font-mono">{modalCur.cur?.fechaRegistro || "2026-09-19 14:15"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Responsable de validación:</span>
                  <span className="text-foreground font-semibold">{modalCur.cur?.usuarioResponsable || "Lcda. Patricia Morales (Facturación)"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-surface">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">{modalCur.cur?.nombreArchivo || "CUR_SIGEF_BancoGuayaquil.pdf"}</p>
                    <p className="text-[10px] text-muted-foreground">{modalCur.cur?.tamano || "1.4 MB"} · PDF firmado digitalmente</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Descargando CUR oficial...")}
                  className="h-8 text-xs gap-1.5"
                >
                  Descargar PDF
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/60">
            <Button variant="neutral" size="sm" onClick={() => setModalCur(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL / DRAWER: VALIDAR PAGO Y ANEXAR CUR (ROL FACTURACIÓN) â”€â”€â”€ */}
      <Dialog open={Boolean(modalValidarPago)} onOpenChange={(open) => !open && setModalValidarPago(null)}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-primary" />
              Validar pago y anexar CUR
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingresa el Comprobante Único de Registro (CUR) descargado desde SIGEF tras confirmar la acreditación de fondos.
            </DialogDescription>
          </DialogHeader>

          {modalValidarPago && (
            <div className="space-y-4 my-2 text-xs">
              {/* Callout de validación externa SIGEF */}
              <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-amber-900 dark:text-amber-300">Validación externa requerida</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Verifica en <strong className="text-foreground">SIGEF</strong> que el pago de esta solicitud haya sido registrado antes de continuar. SIGEF es una plataforma externa de finanzas públicas.
                  </p>
                </div>
              </div>

              {/* Información de la solicitud */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-muted-foreground block text-[11px]">N.º de solicitud:</span>
                  <span className="font-bold text-foreground">{modalValidarPago.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Institución:</span>
                  <span className="font-semibold text-foreground truncate block">{modalValidarPago.institucion}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Factura asociada:</span>
                  <span className="font-mono font-semibold text-foreground">{modalValidarPago.factura?.numero || "FAC-0031"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Valor verificado:</span>
                  <span className="font-bold text-foreground text-sm">{modalValidarPago.factura?.valor || "$ 280.00"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Estado actual:</span>
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border text-foreground">Pendiente validación</Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Usuario responsable:</span>
                  <span className="text-foreground font-semibold">Lcda. Patricia Morales</span>
                </div>
              </div>

              {/* Campo N.º CUR */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Número de Comprobante Único de Registro (CUR) <span className="text-foreground">*</span>
                </label>
                <input
                  type="text"
                  value={numeroCurInput}
                  onChange={(e) => setNumeroCurInput(e.target.value)}
                  placeholder="Ej: CUR-009412"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                />
              </div>

              {/* Carga obligatoria del CUR */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Comprobante Único de Registro — CUR (PDF obligatorio) <span className="text-destructive">*</span></span>
                  <span className="text-[10px] text-muted-foreground">Formato PDF hasta 10 MB</span>
                </label>

                {!curFile ? (
                  <label
                    htmlFor="cur-file-input"
                    className={cn(
                      "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface hover:bg-muted/40",
                      curFileError ? "border-destructive bg-destructive/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <UploadCloud className="size-8 text-primary mb-2" />
                    <span className="text-xs font-semibold text-foreground">Haz clic para seleccionar el CUR emitido en SIGEF</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Archivo .pdf verificado con firma electrónica</span>
                    <input
                      id="cur-file-input"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCurFile(file);
                          setCurFileError(false);
                        }
                      }}
                    />
                  </label>
                ) : (
                  <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileCheck2 className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{curFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(curFile.size / 1024).toFixed(1)} KB · PDF Listo para anexar</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurFile(null)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                )}

                {curFileError && (
                  <p className="text-xs text-destructive font-medium">
                    Debes adjuntar el archivo PDF del CUR para poder validar el pago.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="neutral" size="sm" onClick={() => setModalValidarPago(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleProcederConfirmacion}
              className="bg-primary text-primary-foreground font-semibold gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="size-4" />
              Anexar CUR y validar pago
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€â”€ MODAL: CONFIRMAR VALIDACIÓN DE PAGO â”€â”€â”€ */}
      <Dialog open={Boolean(modalConfirmarValidacion)} onOpenChange={(open) => !open && setModalConfirmarValidacion(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Confirmar validación de pago
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Confirma que el pago fue verificado en SIGEF y que el CUR adjunto corresponde a esta solicitud.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 my-2 rounded-xl bg-muted/30 border border-border text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Solicitud:</span>
              <strong className="text-foreground">{modalConfirmarValidacion?.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Institución:</span>
              <strong className="text-foreground truncate max-w-[200px]">{modalConfirmarValidacion?.institucion}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CUR adjunto:</span>
              <strong className="text-foreground font-mono">{numeroCurInput || "CUR-009412"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monto:</span>
              <strong className="text-primary">{modalConfirmarValidacion?.factura?.valor || "$ 280.00"}</strong>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border/60 flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="neutral" size="sm" onClick={() => setModalConfirmarValidacion(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmarValidacionFinal}
              className="bg-primary text-primary-foreground font-semibold gap-1.5 shadow-sm"
            >
              <Check className="size-4" />
              Confirmar validación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL ACC-03: CREDENCIALES TÉCNICAS (CON RETO DE CONTRASEÑA Y SECRETO) ─── */}
      <CredencialTecnicaModal
        solicitud={modalCredenciales}
        isOpen={Boolean(modalCredenciales)}
        onClose={() => setModalCredenciales(null)}
      />
    </WireframeDashboardLayout>
  );
}
