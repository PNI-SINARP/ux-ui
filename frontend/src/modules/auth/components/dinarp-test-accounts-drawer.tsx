"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  X,
  Fingerprint,
  Search,
  User,
  ChevronRight,
  ArrowLeft,
  FileText,
  FileSignature,
  ArrowLeftRight,
  Users,
  ShieldCheck,
  Shield,
  KeyRound,
  RefreshCw,
  UserCheck,
  ExternalLink,
  Layers,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";

export type FlowType =
  | "id-admin"
  | "id-usuario"
  | "id-activacion"
  | "anexo-a"
  | "anexo-b"
  | "anexo-c"
  | "interoperabilidad"
  | "fuentes"
  | "todos";

export interface AccountRouteAction {
  label: string;
  route: string;
  huBadge?: string;
}

export interface TestAccountItem {
  roleName: string;
  userName: string;
  cedula: string;
  description: string;
  access: string;
  storiesBadge?: string;
  flows: FlowType[];
  actions: AccountRouteAction[];
}

export const TEST_ACCOUNTS_DATA: TestAccountItem[] = [
  // ── ACTOR ADMINISTRADOR (ID-00 A ID-05, ID-08, ID-10, ID-11, ID-14, ID-15) ──
  {
    roleName: "Administrador del Sistema",
    userName: "Admin Portal",
    cedula: "1799999999",
    description: "Control total de identidades: crea, edita, suspende y da de baja cuentas internas. Configura áreas DINARP, catálogo de roles, audita eventos, gestiona coordinadores y atiende recuperación asistida de 2FA.",
    access: "Cuentas Internas (/cuentas-internas), Auditoría (/auditoria-cuentas), Coordinadores (/coordinadores), Catálogo de Áreas (/areas), Catálogo de Roles (/roles) y Gestión de Recuperaciones (/gestion-recuperaciones).",
    storiesBadge: "ID-00 a 05, 08, 10, 11, 14, 15",
    flows: ["id-admin"],
    actions: [
      { label: "Cuentas Internas", route: "/cuentas-internas", huBadge: "ID-01..04" },
      { label: "Auditoría de Cuentas", route: "/auditoria-cuentas", huBadge: "ID-05" },
      { label: "Gestión Coordinadores", route: "/coordinadores", huBadge: "ID-10, 11" },
      { label: "Catálogo de Áreas", route: "/areas", huBadge: "ID-15" },
      { label: "Catálogo de Roles", route: "/roles", huBadge: "ID-14" },
      { label: "Recuperación Asistida", route: "/gestion-recuperaciones", huBadge: "ID-08" },
    ]
  },

  // ── ACTOR USUARIO HABILITADO (ID-06, ID-07) ──
  {
    roleName: "Usuario Habilitado",
    userName: "Funcionario Habilitado",
    cedula: "1715489621",
    description: "Funcionario interno con cuenta activa y doble factor. Autenticación con cédula, contraseña y OTP de Google Authenticator. Puede autogestionar restablecimiento de contraseña.",
    access: "Login 2FA (/login), Restablecer Contraseña (/recuperar-contrasena) y bandeja institucional según su área.",
    storiesBadge: "ID-06, ID-07",
    flows: ["id-usuario"],
    actions: [
      { label: "Ingreso con 2FA (OTP)", route: "/login", huBadge: "ID-06" },
      { label: "Restablecer Contraseña", route: "/recuperar-contrasena", huBadge: "ID-07" },
    ]
  },

  // ── ACTOR USUARIO EN ACTIVACIÓN Y GOOGLE AUTHENTICATOR (ID-09, ID-12) ──
  {
    roleName: "Usuario en Activación (Vinculación 2FA)",
    userName: "Usuario Pendiente Activación",
    cedula: "1718956234",
    description: "Usuario nuevo con cuenta pendiente de activación. Establece su contraseña inicial desde enlace de 1 solo uso y escanea código QR para vincular Google Authenticator en app móvil.",
    access: "Pantalla de Activación (/establecer-contrasena) y Enrolamiento TOTP (/vincular-autenticador).",
    storiesBadge: "ID-09, ID-12",
    flows: ["id-activacion"],
    actions: [
      { label: "Establecer Contraseña Inicial", route: "/establecer-contrasena", huBadge: "ID-09" },
      { label: "Vincular Google Authenticator", route: "/vincular-autenticador", huBadge: "ID-12" },
    ]
  },

  // ── FLUJO ANEXO A (REGISTRO INSTITUCIÓN Y RESOLUCIÓN - INS-01 A INS-07) ──
  {
    roleName: "Representante Legal / Solicitante",
    userName: "Marcelo Albuja",
    cedula: "1710001112",
    description: "Máxima autoridad de entidad requirente. Registra la institución en DINARP, firma la solicitud de interoperabilidad y designa a los coordinadores institucionales.",
    access: "Formulario de Registro Institucional (Anexo A) y seguimiento de resolución jurídica.",
    storiesBadge: "INS-01 a INS-03",
    flows: ["anexo-a"],
    actions: [
      { label: "Registro Institucional (Anexo A)", route: "/registro-institucion", huBadge: "INS-01..03" },
    ]
  },
  {
    roleName: "Director Área de Gestión",
    userName: "Director Gestión",
    cedula: "1711223344",
    description: "Recibe los trámites ingresados de instituciones, evalúa la pertinencia inicial y asigna expedientes a revisores técnicos de su equipo.",
    access: "Bandeja de Asignación de Trámites (/asignacion-solicitudes) y supervisión general.",
    storiesBadge: "INS-04, ENR-03, CAM-02",
    flows: ["anexo-a", "anexo-b", "anexo-c"],
    actions: [
      { label: "Asignación de Trámites", route: "/asignacion-solicitudes", huBadge: "INS-04" },
    ]
  },
  {
    roleName: "Revisor Área de Gestión",
    userName: "Ana Torres (Revisor)",
    cedula: "1111111111",
    description: "Analiza la viabilidad técnica, valida campos requeridos y emite el informe de viabilidad técnica institucional.",
    access: "Bandeja de Solicitudes Pendientes (/solicitudes-pendientes) y expediente de revisión técnica.",
    storiesBadge: "INS-05, ENR-03, CAM-02",
    flows: ["anexo-a", "anexo-b", "anexo-c"],
    actions: [
      { label: "Revisión de Solicitudes", route: "/solicitudes-pendientes", huBadge: "INS-05" },
    ]
  },
  {
    roleName: "Director Área de Normativa",
    userName: "Director Normativa",
    cedula: "2222222222",
    description: "Supervisa encuadre legal de los convenios de datos, valida dictámenes jurídicos y suscribe resoluciones institucionales de interoperabilidad.",
    access: "Bandeja de Revisión Normativa (/revision-normativa) y dictámenes jurídicos finales.",
    storiesBadge: "INS-06, INS-07",
    flows: ["anexo-a"],
    actions: [
      { label: "Revisión Normativa", route: "/revision-normativa", huBadge: "INS-06, 07" },
    ]
  },
  {
    roleName: "Revisor Área de Normativa",
    userName: "Revisor Normativa",
    cedula: "3333333333",
    description: "Efectúa el control de legalidad, examina competencias legales de la entidad requirente y redacta el borrador de dictamen jurídico.",
    access: "Bandeja de Expedientes Jurídicos (/revision-normativa) y análisis normativo.",
    storiesBadge: "INS-06",
    flows: ["anexo-a"],
    actions: [
      { label: "Expedientes Normativos", route: "/revision-normativa", huBadge: "INS-06" },
    ]
  },

  // ── FLUJO ANEXO B (ENROLAMIENTO COORDINADOR / ACUERDO - ENR-01 A ENR-04) ──
  {
    roleName: "Coordinador Titular (Prerregistrado)",
    userName: "Roberto Dávila",
    cedula: "1715489621",
    description: "Coordinador notificado tras resolución aprobada. Ingresa para formalizar su designación mediante firma electrónica del Acuerdo de Confidencialidad (Anexo B).",
    access: "Flujo de Enrolamiento y firma electrónica de Acuerdo (/enrolamiento-coordinador).",
    storiesBadge: "ENR-01, ENR-02",
    flows: ["anexo-b"],
    actions: [
      { label: "Enrolamiento de Coordinador", route: "/enrolamiento-coordinador", huBadge: "ENR-01..04" },
    ]
  },

  // ── FLUJO ANEXO C (CAMBIO DE COORDINADOR - CAM-01 A CAM-03) ──
  {
    roleName: "Representante Institucional",
    userName: "Carlos Andrade",
    cedula: "1716789019",
    description: "Autoridad que tramita el reemplazo motivado de un coordinador institucional (titular o suplente) por desvinculación o reestructuración (Anexo C).",
    access: "Formulario de Solicitud de Cambio de Coordinador (/cambio-coordinador).",
    storiesBadge: "CAM-01",
    flows: ["anexo-c"],
    actions: [
      { label: "Cambio de Coordinador", route: "/cambio-coordinador", huBadge: "CAM-01" },
    ]
  },

  // ── FLUJO INTEROPERABILIDAD Y CONSUMO DE DATOS ──
  {
    roleName: "Coordinador SINARP",
    userName: "Andrea López",
    cedula: "1712345678",
    description: "Representante técnico de la entidad requirente. Solicita paquetes de datos para interoperabilidad, administra proyectos de consumo y consulta el catálogo de servicios API.",
    access: "Solicitudes de Acceso (/acceso-interoperabilidad), Catálogo de Servicios (/catalogo-interoperabilidad) y Proyectos (/proyectos).",
    storiesBadge: "Consumo Interoperable",
    flows: ["interoperabilidad"],
    actions: [
      { label: "Solicitudes de Acceso", route: "/acceso-interoperabilidad" },
      { label: "Catálogo de Servicios", route: "/catalogo-interoperabilidad" },
      { label: "Proyectos de Consumo", route: "/proyectos" },
    ]
  },
  {
    roleName: "Aprobador Institucional",
    userName: "Dr. Roberto Méndez",
    cedula: "1719876543",
    description: "Evalúa la pertinencia jurídica y finalidad de uso de las solicitudes de interoperabilidad. Carga informes de justificación, firma y emite resolución de aprobación o solicita ajustes.",
    access: "Bandeja de Aprobación de Solicitudes (/acceso-interoperabilidad) y dictamen jurídico.",
    storiesBadge: "Aprobación Interop",
    flows: ["interoperabilidad"],
    actions: [
      { label: "Evaluar Solicitudes", route: "/acceso-interoperabilidad" },
    ]
  },
  {
    roleName: "Analista de Facturación",
    userName: "Lcda. Patricia Morales",
    cedula: "1718765432",
    description: "Verifica comprobantes de pago registrados en plataforma externa SIGEF para entidades con solicitudes de interoperabilidad aranceladas y emite validación formal financiera.",
    access: "Módulo Financiero y Facturación de Solicitudes (/acceso-interoperabilidad).",
    storiesBadge: "Facturación Interop",
    flows: ["interoperabilidad"],
    actions: [
      { label: "Validación de Pagos", route: "/acceso-interoperabilidad" },
    ]
  },

  // ── FLUJO GESTIÓN DE FUENTES DE DATOS ──
  {
    roleName: "Dirección de Gestión y Registro (DGR)",
    userName: "María Torres",
    cedula: "1717654321",
    description: "Responsable funcional de incorporación de fuentes. Revisa documentación y campos candidatos según Res. 004, registra observaciones y valida integración en ambiente de pruebas.",
    access: "Bandeja de Fuentes (/fuentes), Revisión Técnica (/revision-fuentes) y Revisión de Gestión (/revision-gestion).",
    storiesBadge: "DGR - Funcional",
    flows: ["fuentes"],
    actions: [
      { label: "Bandeja de Fuentes", route: "/fuentes" },
      { label: "Revisión Técnica", route: "/revision-fuentes" },
    ]
  },
  {
    roleName: "Dirección de Tecnología y Desarrollo (DTD)",
    userName: "Carlos Mena",
    cedula: "1716543210",
    description: "Responsable técnico de microservicios e infraestructura de fuentes. Valida factibilidad de conexión, desarrolla microservicios y ejecuta el paso a producción.",
    access: "Registro de Nuevas Fuentes (/fuentes/nueva) y Administración de Fuentes (/fuentes).",
    storiesBadge: "DTD - Técnica",
    flows: ["fuentes"],
    actions: [
      { label: "Administrar Fuentes", route: "/fuentes" },
      { label: "Registrar Nueva Fuente", route: "/fuentes/nueva" },
    ]
  },
  {
    roleName: "Dirección de Protección de Información (DPI)",
    userName: "Daniela Ruiz",
    cedula: "1715432109",
    description: "Clasifica la sensibilidad de cada campo de datos como Accesible o Confidencial según la LOPDP, emite y anexa el Informe Técnico de Clasificación previo a la publicación.",
    access: "Clasificación de Fuentes y Atributos de Seguridad (/fuentes).",
    storiesBadge: "DPI - Protección LOPDP",
    flows: ["fuentes"],
    actions: [
      { label: "Clasificación de Fuentes", route: "/fuentes" },
    ]
  }
];

export interface FlowOption {
  id: FlowType;
  title: string;
  subtitle: string;
  description: string;
  section: "identidad" | "tramites" | "interoperabilidad" | "fuentes" | "general";
  sectionTitle?: string;
  tag?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FLOW_OPTIONS: FlowOption[] = [
  // ── FLUJOS DE IDENTIDAD (ID-00 A ID-15) ──
  {
    id: "id-admin",
    title: "Flujo Administrador",
    subtitle: "Cuentas internas, auditoría, coordinadores, áreas y roles",
    description: "Administrador del Sistema para ID-00 a ID-05, ID-08, ID-10, ID-11, ID-14 e ID-15",
    section: "identidad",
    sectionTitle: "Flujos de Identidad (ID-00 a ID-15)",
    tag: "ID-00 a 05, 08, 10, 11, 14, 15",
    icon: Shield,
  },
  {
    id: "id-usuario",
    title: "Usuario Habilitado",
    subtitle: "Ingreso con cédula/OTP y restablecimiento",
    description: "Autenticación 2FA Google Authenticator (ID-06) y restablecer contraseña (ID-07)",
    section: "identidad",
    tag: "ID-06 & ID-07",
    icon: KeyRound,
  },
  {
    id: "id-activacion",
    title: "Activación y Google Authenticator",
    subtitle: "Contraseña inicial y vinculación app 2FA",
    description: "Establecer contraseña inicial (ID-09) y vincular Google Authenticator (ID-12)",
    section: "identidad",
    tag: "ID-09 & ID-12",
    icon: RefreshCw,
  },

  // ── FLUJOS DE TRÁMITES INSTITUCIONALES (ANEXOS) ──
  {
    id: "anexo-a",
    title: "Flujo Anexo A",
    subtitle: "Registro de Institución y Resolución Jurídica",
    description: "Solicitante, Gestión y Normativa",
    section: "tramites",
    sectionTitle: "Flujos de Trámites Institucionales",
    tag: "INS-01 a INS-07",
    icon: FileText,
  },
  {
    id: "anexo-b",
    title: "Flujo Anexo B",
    subtitle: "Enrolamiento de Coordinador (Acuerdo)",
    description: "Coordinador Titular Prerregistrado y Gestión",
    section: "tramites",
    tag: "ENR-01 a ENR-04",
    icon: FileSignature,
  },
  {
    id: "anexo-c",
    title: "Flujo Anexo C",
    subtitle: "Cambio de Coordinador (CAM-01)",
    description: "Representante Institucional y Gestión",
    section: "tramites",
    tag: "CAM-01 a CAM-03",
    icon: ArrowLeftRight,
  },

  // ── FLUJO INTEROPERABILIDAD Y CONSUMO DE DATOS ──
  {
    id: "interoperabilidad",
    title: "Interoperabilidad y Consumo",
    subtitle: "Solicitudes de acceso, catálogo API y proyectos",
    description: "Coordinador requirente, Aprobador institucional y Facturación SIGEF",
    section: "interoperabilidad",
    sectionTitle: "Interoperabilidad y Consumo de Datos",
    tag: "APIs & Consumo",
    icon: Layers,
  },

  // ── FLUJO GESTIÓN DE FUENTES DE DATOS ──
  {
    id: "fuentes",
    title: "Gestión de Fuentes de Datos",
    subtitle: "Incorporación, validación técnica y clasificación LOPDP",
    description: "DGR (Funcional), DTD (Técnica) y DPI (Protección de Datos)",
    section: "fuentes",
    sectionTitle: "Gestión de Fuentes de Datos",
    tag: "Fuentes & Registro",
    icon: Database,
  },

  // ── GENERAL ──
  {
    id: "todos",
    title: "Ver todas las cuentas",
    subtitle: "Listado completo de roles y cédulas de prueba",
    description: "Todos los roles de DINARP, instituciones, interoperabilidad y fuentes",
    section: "general",
    sectionTitle: "Catálogo Completo",
    tag: "Todas",
    icon: Users,
  },
];

interface DinarpTestAccountsDrawerProps {
  onSelectCedula?: (cedula: string) => void;
}

export function DinarpTestAccountsDrawer({ onSelectCedula }: DinarpTestAccountsDrawerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<FlowType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCedula, setCopiedCedula] = useState<string | null>(null);

  const getFlowCount = (flowId: FlowType) => {
    if (flowId === "todos") return TEST_ACCOUNTS_DATA.length;
    return TEST_ACCOUNTS_DATA.filter((acc) => acc.flows.includes(flowId)).length;
  };

  const handleCopy = (cedula: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(cedula);
    setCopiedCedula(cedula);
    if (onSelectCedula) {
      onSelectCedula(cedula);
    }
    toast.success("Cédula copiada al portapapeles", {
      description: cedula,
    });
    setTimeout(() => {
      setCopiedCedula(null);
    }, 2000);
  };

  const filteredAccounts = useMemo(() => {
    if (!selectedFlow) return [];

    return TEST_ACCOUNTS_DATA.filter((acc) => {
      const matchesFlow =
        selectedFlow === "todos" ? true : acc.flows.includes(selectedFlow);

      if (!matchesFlow) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        acc.roleName.toLowerCase().includes(q) ||
        acc.userName.toLowerCase().includes(q) ||
        acc.cedula.includes(q) ||
        acc.description.toLowerCase().includes(q) ||
        acc.access.toLowerCase().includes(q) ||
        (acc.storiesBadge && acc.storiesBadge.toLowerCase().includes(q))
      );
    });
  }, [selectedFlow, searchQuery]);

  const currentFlowConfig = FLOW_OPTIONS.find((f) => f.id === selectedFlow);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Botón flotante para alternar apertura / cierre */}
      {!isOpen && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedFlow(null);
                  setSearchQuery("");
                  setIsOpen(true);
                }}
                className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-3.5 py-2 h-auto flex items-center gap-2 border border-primary/20 backdrop-blur-md animate-fade-in group"
              >
                <Fingerprint className="size-4 shrink-0 text-white" />
                <span className="text-xs font-semibold text-white">Cuentas de prueba</span>
                <Badge
                  tone="neutral"
                  appearance="soft"
                  size="sm"
                  className="px-1.5 py-0.5 font-bold ml-1 text-[9px] h-4 bg-white/20 text-white border-0"
                >
                  {TEST_ACCOUNTS_DATA.length}
                </Badge>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs">
              Ver roles y cédulas de prueba (ID-01 a ID-15, Anexos y Todos)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Panel flotante desplegable */}
      {isOpen && (
        <div className="w-88 sm:w-120 bg-surface/98 backdrop-blur-md border border-border/80 rounded-2xl shadow-2xl p-4 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-foreground">
                  Roles y Cédulas de Prueba
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {selectedFlow
                    ? "Haz clic para copiar la cédula al portapapeles"
                    : "¿Deseas ver un flujo en específico o todos?"}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* VISTA 1: CARDS DE SELECCIÓN DE FLUJO */}
          {selectedFlow === null && (
            <div className="py-2.5 space-y-3 overflow-y-auto flex-1 pr-1 -mr-1 [scrollbar-width:thin]">
              <div className="text-[11px] font-semibold text-muted-foreground px-0.5 pt-0.5">
                Selecciona un flujo para consultar sus cuentas:
              </div>

              {(["identidad", "tramites", "interoperabilidad", "fuentes", "general"] as const).map((sectionKey) => {
                const sectionFlows = FLOW_OPTIONS.filter((f) => f.section === sectionKey);
                if (sectionFlows.length === 0) return null;
                const sectionTitle = sectionFlows[0].sectionTitle;

                return (
                  <div key={sectionKey} className="space-y-1.5">
                    {sectionTitle && (
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 pt-1 flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-primary/80 inline-block"></span>
                        <span>{sectionTitle}</span>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {sectionFlows.map((flow) => {
                        const IconComponent = flow.icon;
                        const count = getFlowCount(flow.id);

                        return (
                          <button
                            key={flow.id}
                            type="button"
                            onClick={() => {
                              setSelectedFlow(flow.id);
                              setSearchQuery("");
                            }}
                            className="w-full text-left p-2.5 rounded-xl border border-border/60 hover:border-border hover:bg-muted/40 transition-all group flex items-center justify-between"
                          >
                            <div className="flex items-start gap-2.5 min-w-0 pr-2">
                              <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                                <IconComponent className="size-4" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                                    {flow.title}
                                  </span>
                                  <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] px-1.5 py-0">
                                    {count} {count === 1 ? "rol" : "roles"}
                                  </Badge>
                                  {flow.tag && (
                                    <Badge tone="primary" appearance="soft" size="sm" className="text-[9px] px-1.5 py-0 font-mono">
                                      {flow.tag}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[11px] text-foreground/80 truncate">
                                  {flow.subtitle}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {flow.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VISTA 2: LISTA DE CUENTAS DEL FLUJO SELECCIONADO */}
          {selectedFlow !== null && (
            <div className="flex flex-col flex-1 min-h-0 pt-2 space-y-2">
              {/* Barra superior con volver y título */}
              <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFlow(null);
                    setSearchQuery("");
                  }}
                  className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary/80 gap-1 -ml-1"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Volver a flujos</span>
                </Button>
                <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                  {currentFlowConfig?.title}
                </Badge>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por rol, nombre o cédula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-muted/30"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Listado de Cédulas y Roles */}
              <div className="overflow-y-auto py-1 divide-y divide-border/40 space-y-1.5 pr-1 -mr-1 flex-1 [scrollbar-width:thin]">
                {filteredAccounts.map((acc) => {
                  const isCopied = copiedCedula === acc.cedula;
                  return (
                    <div
                      key={`${selectedFlow}-${acc.cedula}-${acc.roleName}`}
                      onClick={() => handleCopy(acc.cedula)}
                      className="p-3 rounded-xl cursor-pointer transition-colors flex flex-col gap-2 group border border-border/40 hover:border-border hover:bg-muted/30"
                    >
                      {/* Cabecera: Rol, insigne discreta, usuario, cédula y botón Copiar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-foreground">
                              {acc.roleName}
                            </p>
                            {acc.storiesBadge && (
                              <Badge
                                tone="neutral"
                                appearance="soft"
                                size="sm"
                                className="text-[9px] px-1.5 py-0 font-mono text-muted-foreground/80"
                              >
                                {acc.storiesBadge}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <User className="size-3 text-muted-foreground/70 shrink-0" />
                              <span className="font-medium text-foreground/80">{acc.userName}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">Cédula:</span>
                              <span className="text-foreground bg-muted/60 px-1.5 py-0.5 rounded font-mono font-medium text-[11px]">
                                {acc.cedula}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleCopy(acc.cedula, e)}
                          className="text-xs h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground shrink-0 border border-border/50 group-hover:bg-surface group-hover:border-border"
                        >
                          {isCopied ? (
                            <>
                              <Check className="size-3.5 text-success" />
                              <span className="text-[10px] text-success font-medium">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" />
                              <span className="text-[10px]">Copiar</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Bloque descriptivo: Qué hace y A qué tiene acceso */}
                      <div className="bg-muted/30 border border-border/40 rounded-lg p-2.5 space-y-1.5 text-[11px]">
                        <div className="flex items-start gap-1.5">
                          <span className="font-semibold text-foreground/90 shrink-0 text-[10px] uppercase tracking-wider pt-0.5">
                            Qué hace:
                          </span>
                          <span className="text-muted-foreground text-[11px] leading-snug">
                            {acc.description}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 pt-1 border-t border-border/30">
                          <span className="font-semibold text-primary shrink-0 text-[10px] uppercase tracking-wider pt-0.5">
                            Acceso:
                          </span>
                          <span className="text-foreground/90 font-medium text-[11px] leading-snug">
                            {acc.access}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción directa según las HUs */}
                      {acc.actions && acc.actions.length > 0 && (
                        <div className="pt-1 border-t border-border/40 space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="size-2.5 text-primary" />
                            Probar flujo / pantalla de HU:
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {acc.actions.map((act) => (
                              <Button
                                key={act.route + act.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(acc.cedula);
                                  if (act.route === "/login") {
                                    if (onSelectCedula) onSelectCedula(acc.cedula);
                                    toast.success("Cédula aplicada al login 2FA", {
                                      description: `Cédula: ${acc.cedula} (${act.huBadge || "ID-06"})`,
                                    });
                                  } else {
                                    toast.success("Abriendo pantalla del flujo", {
                                      description: `${act.label} (${act.route})`,
                                    });
                                    router.push(act.route);
                                  }
                                }}
                                className="text-[11px] h-6 px-2 py-0 gap-1 bg-surface hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all font-medium"
                              >
                                <span>{act.label}</span>
                                {act.huBadge && (
                                  <span className="text-[9px] font-mono opacity-70 bg-muted px-1 rounded">
                                    {act.huBadge}
                                  </span>
                                )}
                                <ExternalLink className="size-2.5 opacity-60" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredAccounts.length === 0 && (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No se encontraron cuentas que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2.5 mt-auto border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-primary inline-block"></span>
              <span>
                {selectedFlow
                  ? `${filteredAccounts.length} cuentas en este flujo`
                  : "Selecciona un flujo para ver sus cuentas"}
              </span>
            </span>
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[11px] h-6 px-2"
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
