"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FileText,
  CheckSquare,
  Folder,
  FolderKanban,
  ArrowLeftRight,
  Server,
  Database,
  Network,
  Receipt,
  BarChart3,
  LifeBuoy,
  Activity,
  Shield,
  Sliders,
  CreditCard,
  BarChart2,
  Users,
  ShieldCheck,
  Clock,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
  HelpCircle,
  Bell,
  FolderCheck,
  UserCheck,
  UserCog,
  FileSignature,
  KeyRound,
  History,
  Building2,
  Scale,
  Lock,
  Cpu,
  FileCheck2,
  Plug,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn, getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import { GeoportalHeader } from "@/components/layout/geoportal-header";
import { NotificationsMenu } from "@/components/shared/notifications-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { MOCK_USERS_BY_ROLE, ROLES_CONFIG, type MockUser, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { WireframeBreadcrumbs, type BreadcrumbSegment } from "./wireframe-breadcrumbs";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import { WireframeRoleSelector } from "./wireframe-role-selector";
import { isProviderInstitution } from "@/modules/fuentes/data/fuentes-data";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

export type { MockUser, UserRole };

export interface WireframeDashboardUser {
  id?: string;
  name?: string;
  role?: string;
  roleTitle?: string;
  email?: string;
  cedula?: string;
  initials?: string;
  institution?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface WireframeDashboardLayoutProps {
  activeMenu?: string;
  currentUser?: MockUser | WireframeDashboardUser;
  currentRole?: UserRole;
  allowedRoles?: string[];
  onRoleChange?: (role: UserRole) => void;
  breadcrumbs?: BreadcrumbSegment[];
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  allowedRoles?: UserRole[];
  providerOnly?: boolean;
  section?: string;
}

export const DEFAULT_ROUTE_BY_ROLE: Record<UserRole, string> = {
  REPRESENTANTE_INSTITUCIONAL: "/registro-institucion",
  COORDINADOR_SINARP: "/catalogo-interoperabilidad",
  DIR_GESTION: "/acceso-interoperabilidad/asignacion",
  EQ_GESTION: "/revision-gestion",
  DIR_NORMATIVA: "/revision-normativa",
  EQ_NORMATIVA: "/revision-normativa",
  DIR_DPI: "/revision-normativa/asignacion",
  EQ_DPI: "/revision-normativa/fuentes",
  DPI: "/revision-normativa/asignacion",
  APROBADOR: "/firma-resoluciones",
  DGR: "/consumo-api",
  JURIDICA: "/formalizacion/contratos",
  TI: "/tecnologia/conectores",
  DTD: "/tecnologia/conectores",
  FACTURACION: "/configuracion-financiera",
  CONTROL_EVALUACION: "/control-excepcional",
  ADMIN: "/cuentas-internas",
};

const navItems: NavItem[] = [
  // ── SECCIÓN PRINCIPAL BN-07: ACCESO A FUENTES ──
  // Coordinador SINARP
  {
    id: "catalogo-interoperabilidad",
    label: "Catálogo de fuentes",
    icon: Database,
    href: "/catalogo-interoperabilidad",
    allowedRoles: ["COORDINADOR_SINARP"],
    section: "Acceso a fuentes",
  },
  {
    id: "mis-solicitudes",
    label: "Solicitudes de acceso",
    icon: Network,
    href: "/acceso-interoperabilidad/solicitudes",
    allowedRoles: ["COORDINADOR_SINARP"],
    section: "Acceso a fuentes",
  },
  // Director de Gestión
  {
    id: "acceso-interoperabilidad-asignacion",
    label: "Asignar revisiones de acceso",
    icon: UserCheck,
    href: "/acceso-interoperabilidad/asignacion",
    allowedRoles: ["DIR_GESTION"],
    section: "Acceso a fuentes",
  },
  // Revisor de Gestión
  {
    id: "revision-gestion",
    label: "Revisar solicitudes de acceso",
    icon: CheckSquare,
    href: "/revision-gestion",
    allowedRoles: ["EQ_GESTION"],
    section: "Acceso a fuentes",
  },
  // Director DPI (Separado de Normativa)
  {
    id: "asignacion-normativa-fuentes",
    label: "Asignar revisiones DPI",
    icon: UserCheck,
    href: "/revision-normativa/asignacion",
    allowedRoles: ["DIR_DPI", "DPI"],
    section: "Acceso a fuentes",
  },
  {
    id: "informes-aprobacion-dpi",
    label: "Firmar informes DPI",
    icon: FileSignature,
    href: "/revision-normativa/asignacion?tab=informes",
    allowedRoles: ["DIR_DPI", "DPI"],
    section: "Acceso a fuentes",
  },
  // Revisor DPI (Separado de Normativa)
  {
    id: "revision-normativa-fuentes",
    label: "Evaluar datos confidenciales",
    icon: Lock,
    href: "/revision-normativa/fuentes",
    allowedRoles: ["EQ_DPI"],
    section: "Acceso a fuentes",
  },
  {
    id: "informes-elaborados-dpi",
    label: "Elaborar informes DPI",
    icon: FileCheck2,
    href: "/revision-normativa/fuentes?tab=informes",
    allowedRoles: ["EQ_DPI"],
    section: "Acceso a fuentes",
  },

  // ── Coordinador SINARP — Proyecto Institucional ──
  {
    id: "proyectos",
    label: "Gestión de proyectos",
    icon: FolderKanban,
    href: "/proyectos",
    allowedRoles: ["COORDINADOR_SINARP"],
    section: "Proyecto institucional",
  },
  {
    id: "fuentes-proveedor",
    label: "Mis fuentes de datos",
    icon: Server,
    href: "/proveedor/fuentes",
    allowedRoles: ["COORDINADOR_SINARP"],
    providerOnly: true,
    section: "Gestión de Fuentes",
  },
  {
    id: "mi-suplencia",
    label: "Mi suplencia",
    icon: ArrowLeftRight,
    href: "/mi-suplencia",
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR"],
    section: "Gestión Institucional",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO A (Incorporación Institucional) ──
  {
    id: "asignacion-solicitudes",
    label: "Asignar incorporaciones",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_GESTION"],
    section: "Expedientes Anexo A",
  },
  {
    id: "solicitudes-pendientes",
    label: "Revisar incorporaciones",
    icon: CheckSquare,
    href: "/solicitudes-pendientes",
    allowedRoles: ["EQ_GESTION"],
    section: "Expedientes Anexo A",
  },
  {
    id: "asignacion-resoluciones",
    label: "Asignar resoluciones",
    icon: UserCheck,
    href: "/revision-normativa",
    allowedRoles: ["DIR_NORMATIVA"],
    section: "Expedientes Anexo A",
  },
  {
    id: "revision-normativa",
    label: "Generar resoluciones",
    icon: Scale,
    href: "/revision-normativa",
    allowedRoles: ["EQ_NORMATIVA"],
    section: "Expedientes Anexo A",
  },
  {
    id: "firma-resoluciones",
    label: "Firmar resoluciones",
    icon: FileSignature,
    href: "/firma-resoluciones",
    allowedRoles: ["APROBADOR"],
    section: "Expedientes Anexo A",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO B (Registro de Coordinadores) ──
  {
    id: "asignacion-anexo-b",
    label: "Asignar enrolamientos",
    icon: UserCheck,
    href: "/asignacion-anexo-b",
    allowedRoles: ["DIR_GESTION"],
    section: "Expedientes Anexo B",
  },
  {
    id: "revision-anexo-b",
    label: "Revisar enrolamientos",
    icon: CheckSquare,
    href: "/revision-anexo-b",
    allowedRoles: ["EQ_GESTION"],
    section: "Expedientes Anexo B",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO C (Cambio de Coordinador) ──
  {
    id: "asignacion-anexo-c",
    label: "Asignar cambios",
    icon: UserCheck,
    href: "/asignacion-anexo-c",
    allowedRoles: ["DIR_GESTION"],
    section: "Expedientes Anexo C",
  },
  {
    id: "revision-anexo-c",
    label: "Revisar cambios",
    icon: CheckSquare,
    href: "/revision-anexo-c",
    allowedRoles: ["EQ_GESTION"],
    section: "Expedientes Anexo C",
  },

  // ── Formalización y Catálogo de Fuentes (Otros Flujos) ──
  {
    id: "formalizacion-gestion",
    label: "Formalizar accesos",
    icon: FileCheck2,
    href: "/formalizacion",
    allowedRoles: ["DIR_GESTION"],
    section: "Acceso a fuentes",
  },
  {
    id: "revision-aprobacion-fuentes",
    label: "Revisar fuentes",
    icon: FolderCheck,
    href: "/gestion/fuentes",
    allowedRoles: ["DIR_GESTION", "EQ_GESTION"],
    section: "Catálogo de Fuentes",
  },

  // ── Jurídica y Firmantes ──
  {
    id: "formalizacion-contratos",
    label: "Contratos de acceso",
    icon: FileText,
    href: "/formalizacion/contratos",
    allowedRoles: ["JURIDICA", "COORDINADOR_SINARP", "APROBADOR"],
    section: "Gestión Contractual",
  },

  // ── Equipo TI / DTD ──
  {
    id: "tecnologia-conectores",
    label: "Gestión de conectores",
    icon: Plug,
    href: "/tecnologia/conectores",
    allowedRoles: ["TI", "DTD"],
  },
  {
    id: "tecnologia-homologaciones",
    label: "Homologación de orígenes",
    icon: Cpu,
    href: "/tecnologia/homologaciones",
    allowedRoles: ["TI", "DTD"],
  },
  {
    id: "acceso-consumo-ti",
    label: "Aprovisionar accesos",
    icon: Cpu,
    href: "/acceso-consumo",
    allowedRoles: ["TI", "DTD"],
  },

  // ── Administrador DINARP ──
  {
    id: "cuentas-internas",
    label: "Cuentas internas",
    icon: Users,
    href: "/cuentas-internas",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "gestion-suplencias",
    label: "Gestión de suplencias",
    icon: ArrowLeftRight,
    href: "/gestion-suplencias",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "coordinadores",
    label: "Coordinadores SINARP",
    icon: UserCheck,
    href: "/coordinadores",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "areas",
    label: "Áreas DINARP",
    icon: Building2,
    href: "/areas",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "roles",
    label: "Roles y permisos",
    icon: ShieldCheck,
    href: "/roles",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "auditoria-cuentas",
    label: "Auditoría de cuentas",
    icon: History,
    href: "/auditoria-cuentas",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "gestion-recuperaciones",
    label: "Gestión de recuperaciones",
    icon: KeyRound,
    href: "/gestion-recuperaciones",
    allowedRoles: ["ADMIN"],
  },
  {
    id: "configuracion-financiera",
    label: "Tarifario y pasarela",
    icon: Receipt,
    href: "/configuracion-financiera",
    allowedRoles: ["FACTURACION", "ADMIN"],
    section: "Gestión Financiera",
  },

  // ── ADMINISTRACIÓN DEL PORTAL (PAR-08 a 16, FUE-08 a 11, ECO-01, INS-08 a 10, ID-00) ──
  {
    id: "ciclo-fuentes",
    label: "Ciclo de las fuentes",
    icon: Database,
    href: "/ciclo-fuentes",
    allowedRoles: ["COORDINADOR_SINARP", "DIR_GESTION", "EQ_GESTION"],
    providerOnly: false,
    section: "Administración",
  },
  {
    id: "instituciones-admin",
    label: "Instituciones y arranque",
    icon: Building2,
    href: "/instituciones-admin",
    allowedRoles: ["ADMIN", "DIR_GESTION"],
    section: "Administración",
  },
  {
    id: "parametros-portal",
    label: "Parámetros del Portal",
    icon: Sliders,
    href: "/parametros-portal",
    allowedRoles: ["ADMIN", "DIR_NORMATIVA", "DIR_DPI", "DIR_GESTION"],
    section: "Administración",
  },

  // ── OPERACIÓN Y SOPORTE (OPS-01 a 05, REP-01 a 05, INC-01 a 04) ──
  {
    id: "operacion",
    label: "Operación y monitoreo",
    icon: Activity,
    href: "/operacion",
    allowedRoles: ["DIR_GESTION", "EQ_GESTION", "TI", "DTD"],
    section: "Operación y soporte",
  },
  {
    id: "soporte",
    label: "Soporte e incidentes",
    icon: LifeBuoy,
    href: "/soporte",
    allowedRoles: ["COORDINADOR_SINARP", "TI", "DTD", "DGR"],
    section: "Operación y soporte",
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: BarChart3,
    href: "/reportes",
    allowedRoles: ["DIR_GESTION", "EQ_GESTION", "DIR_NORMATIVA", "EQ_NORMATIVA", "APROBADOR", "ADMIN"],
    section: "Operación y soporte",
  },
  {
    id: "parametros-operacion",
    label: "Parámetros de soporte",
    icon: Sliders,
    href: "/parametros-operacion",
    allowedRoles: ["ADMIN"],
    section: "Operación y soporte",
  },

  // ── CONSUMO POR API Y AMPLIACIONES (API-01 a API-06, ADD-01 a ADD-07) ──
  {
    id: "consumo-api",
    label: "Consumo por API",
    icon: Network,
    href: "/consumo-api",
    allowedRoles: ["COORDINADOR_SINARP", "DGR", "DTD", "TI", "DIR_GESTION", "EQ_GESTION", "DIR_DPI", "EQ_DPI", "JURIDICA", "FACTURACION"],
    section: "Consumo por API",
  },
  {
    id: "parametros-consumo",
    label: "Límites del masivo",
    icon: Sliders,
    href: "/parametros-consumo",
    allowedRoles: ["DTD", "ADMIN"],
    section: "Consumo por API",
  },

  // ── ENTREGA DIRECTA Y EXCEPCIONAL (Res. 003-NG-DINARP-2023) ──
  {
    id: "entrega-excepcional",
    label: "Entrega excepcional",
    icon: Receipt,
    href: "/entrega-excepcional",
    allowedRoles: ["COORDINADOR_SINARP", "DIR_GESTION", "EQ_GESTION", "TI", "DTD", "DIR_DPI", "EQ_DPI", "APROBADOR"],
    section: "Entrega excepcional",
  },
  {
    id: "control-excepcional",
    label: "Control de autorizaciones",
    icon: Shield,
    href: "/control-excepcional",
    allowedRoles: ["CONTROL_EVALUACION"],
    section: "Entrega excepcional",
  },
  {
    id: "parametros-excepcional",
    label: "Parámetros excepcional",
    icon: Sliders,
    href: "/parametros-excepcional",
    allowedRoles: ["DIR_NORMATIVA"],
    section: "Entrega excepcional",
  },
];

function isRouteAllowedForRole(pathname: string | null, role: UserRole, isProvider: boolean): boolean {
  if (!pathname) return true;
  const cleanPath = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Common utility pages accessible to authenticated roles
  if (cleanPath === "/novedades" || cleanPath === "/construccion") {
    return true;
  }

  // Unauthenticated external flows (Annex A, B, C) are accessed directly via /login
  const externalAnexoPaths = [
    "/registro-institucion",
    "/expedientes-anexo-a",
    "/expedientes-anexo-b",
    "/cambio-coordinador",
    "/expedientes-anexo-c",
  ];
  if (externalAnexoPaths.some((p) => cleanPath === p || cleanPath.startsWith(p + "/"))) {
    return role === "REPRESENTANTE_INSTITUCIONAL";
  }

  // Sub-routes of homologacion-fuentes belong to TI / DTD
  if (cleanPath === "/homologacion-fuentes" || cleanPath.startsWith("/homologacion-fuentes/")) {
    return role === "TI" || role === "DTD";
  }

  // Facturacion detail route accessible to COORDINADOR_SINARP, FACTURACION, and ADMIN
  if (cleanPath.startsWith("/acceso-interoperabilidad/solicitudes/") && cleanPath.endsWith("/facturacion")) {
    return role === "COORDINADOR_SINARP" || role === "FACTURACION" || role === "ADMIN";
  }

  // Entrega excepcional detail accessible to CONTROL_EVALUACION as well
  if (cleanPath.startsWith("/entrega-excepcional/detalle") && role === "CONTROL_EVALUACION") {
    return true;
  }

  // Ciclo de fuentes for COORDINADOR_SINARP is restricted to providers (FUE-08)
  if (cleanPath.startsWith("/ciclo-fuentes") && role === "COORDINADOR_SINARP" && !isProvider) {
    return false;
  }

  // Check if any navItem for this role matches cleanPath (exact or sub-route)
  const roleNavItems = navItems.filter((item) => {
    if (item.allowedRoles && !item.allowedRoles.includes(role)) return false;
    if (item.providerOnly && !isProvider) return false;
    return true;
  });

  return roleNavItems.some((item) => {
    const cleanHref = item.href.split("?")[0].replace(/\/$/, "");
    if (!cleanHref) return false;
    // Prevent /formalizacion from matching /formalizacion/contratos when checking DIR_GESTION vs JURIDICA
    if (cleanHref === "/formalizacion" && cleanPath.startsWith("/formalizacion/contratos")) {
      return false;
    }
    if (cleanHref === "/revision-normativa" && (cleanPath.startsWith("/revision-normativa/asignacion") || cleanPath.startsWith("/revision-normativa/fuentes"))) {
      return false;
    }
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/");
  });
}

function SidebarCollapseItem() {
  const { toggleSidebar, state } = useSidebar();
  const isExpanded = state === "expanded";

  return (
    <SidebarMenuButton
      tooltip={isExpanded ? "Contraer sidebar" : "Expandir sidebar"}
      onClick={toggleSidebar}
    >
      <PanelLeft className="size-4.5 shrink-0 text-primary dark:text-primary" />
      <span className="truncate group-data-[collapsible=icon]:hidden text-primary dark:text-primary font-medium">
        Contraer sidebar
      </span>
    </SidebarMenuButton>
  );
}

function MobileSidebarCloseButton() {
  const { setOpenMobile, isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={() => setOpenMobile(false)}
      className="md:hidden flex size-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
      aria-label="Cerrar menú lateral"
    >
      <X className="size-4.5" />
    </Button>
  );
}

function SidebarNavigationItemLink({
  href,
  children,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Link>) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        onClick?.(e);
        if (isMobile) {
          setOpenMobile(false);
        }
      }}
      {...props}
    >
      {children}
    </Link>
  );
}

export function WireframeDashboardLayout({
  activeMenu,
  currentUser,
  currentRole,
  onRoleChange,
  breadcrumbs,
  headerSlot,
  children
}: WireframeDashboardLayoutProps) {
  const pathname = usePathname();
  const [themeMode, setThemeMode] = useState<"claro" | "oscuro">("claro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Breadcrumbs solo se muestran en la cabecera cuando se ingresa a un detalle o subpágina (>1 segmento real)
  const displayBreadcrumbs = React.useMemo(() => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;
    const meaningfulSegments = breadcrumbs.filter(
      (s) =>
        s &&
        s.label &&
        s.label.trim().toLowerCase() !== "inicio" &&
        s.label.trim().toLowerCase() !== "home"
    );
    return meaningfulSegments.length > 1 ? breadcrumbs : null;
  }, [breadcrumbs]);

  const router = useRouter();
  const { activeUser, logout, setRole } = useAuthStore();
  const fallbackUser = activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  let rawUser: MockUser | WireframeDashboardUser;
  if (activeUser) {
    rawUser = activeUser;
  } else if (currentUser) {
    rawUser = currentUser;
  } else if (currentRole && MOCK_USERS_BY_ROLE[currentRole]) {
    rawUser = MOCK_USERS_BY_ROLE[currentRole];
  } else {
    rawUser = fallbackUser;
  }

  const resolvedUser: MockUser = {
    id: rawUser.id || fallbackUser.id,
    role: (rawUser.role as UserRole) || fallbackUser.role,
    name: rawUser.name || fallbackUser.name,
    roleTitle: rawUser.roleTitle || fallbackUser.roleTitle,
    email: rawUser.email || fallbackUser.email,
    cedula: rawUser.cedula || fallbackUser.cedula,
    initials: rawUser.initials || fallbackUser.initials,
    institution: rawUser.institution || fallbackUser.institution,
    avatar: ("avatar" in rawUser && rawUser.avatar) ? rawUser.avatar : fallbackUser.avatar,
  };
  const activeUserRole = activeUser?.role || currentRole || resolvedUser?.role || "COORDINADOR_SINARP";
  const isAprobador = activeUserRole === "APROBADOR";
  const isInternalDinarpRole =
    activeUserRole === "DIR_GESTION" ||
    activeUserRole === "DIR_NORMATIVA" ||
    activeUserRole === "EQ_GESTION" ||
    activeUserRole === "EQ_NORMATIVA" ||
    activeUserRole === "DIR_DPI" ||
    activeUserRole === "EQ_DPI";

  const isProvider =
    isProviderInstitution(resolvedUser?.institution) ||
    (resolvedUser?.roleTitle?.toLowerCase().includes("proveedor") ?? false) ||
    (resolvedUser?.roleTitle?.toLowerCase().includes("emisor") ?? false);

  const isCoordinadorConsumidor =
    !isProvider &&
    (activeUserRole === "COORDINADOR_SINARP" ||
      (resolvedUser?.roleTitle?.toLowerCase().includes("consumidor") ?? false) ||
      (resolvedUser?.roleTitle?.toLowerCase().includes("requirente") ?? false));

  const handleRoleChange = (role: UserRole) => {
    setRole(role);
    if (onRoleChange) {
      onRoleChange(role);
    }
    const targetRoute = DEFAULT_ROUTE_BY_ROLE[role] || "/catalogo-interoperabilidad";
    router.push(targetRoute);
  };

  useEffect(() => {
    if (!activeUser?.role) return;
    if (!isRouteAllowedForRole(pathname, activeUser.role, isProvider)) {
      const targetRoute = DEFAULT_ROUTE_BY_ROLE[activeUser.role] || "/catalogo-interoperabilidad";
      router.replace(targetRoute);
    }
  }, [activeUser?.role, pathname, isProvider, router]);

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setThemeMode(stored === "dark" ? "oscuro" : "claro");
      applyTheme(stored);
    } else {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setThemeMode(isDark ? "oscuro" : "claro");
    }

    const observer = new MutationObserver(() => {
      const isDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setThemeMode(isDark ? "oscuro" : "claro");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const handleThemeChange = (mode: "claro" | "oscuro") => {
    setThemeMode(mode);
    applyTheme(mode === "oscuro" ? "dark" : "light");
  };

  const isItemActive = (item: NavItem) => {
    if (activeMenu) {
      if (item.id === "mis-solicitudes" && activeMenu === "nueva-solicitud-acceso") {
        return true;
      }
      return activeMenu === item.id || activeMenu === item.href.replace(/^\//, "");
    }
    if (item.href && pathname) {
      const cleanPath = pathname.replace(/\/$/, "");
      const cleanHref = item.href.replace(/\/$/, "");
      if (cleanHref === "" || cleanHref === "/") {
        return cleanPath === "" || cleanPath === "/";
      }
      if (cleanHref === "/formalizacion" && cleanPath.startsWith("/formalizacion/contratos")) {
        return false;
      }
      if (cleanHref === "/revision-normativa") {
        if (cleanPath.startsWith("/revision-normativa/asignacion") || cleanPath.startsWith("/revision-normativa/fuentes")) {
          return false;
        }
      }
      return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/");
    }
    return false;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={true} className="h-svh max-h-svh overflow-hidden flex">
      <Sidebar variant="floating" collapsible="icon">
        {/* Top institutional header */}
        <SidebarHeader className="p-0 shrink-0">
          {/* Institutional accent bar */}
          <div className="bg-primary w-full h-1.5 shrink-0" />

          {/* Logo oficial */}
          <div className="flex h-16 items-center justify-between px-3.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center border-b border-sidebar-border shrink-0">
            <SidebarNavigationItemLink
              href={DEFAULT_ROUTE_BY_ROLE[activeUserRole] || "/"}
              className="flex items-center -translate-y-1 gap-2.5 shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md min-w-0 justify-start group-data-[collapsible=icon]:translate-y-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
            >
              {/* Expanded Logo */}
              <img
                src={getAssetPath("/logo-horizontal.svg")}
                alt="Logo DINARP GEOportal"
                className="h-10 sm:h-10.5 w-auto max-w-[195px] sm:max-w-[210px] object-contain dark:hidden group-data-[collapsible=icon]:hidden"
              />
              <img
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="Logo DINARP GEOportal"
                className="h-10 sm:h-10.5 w-auto max-w-[195px] sm:max-w-[210px] object-contain hidden dark:block group-data-[collapsible=icon]:hidden"
              />
              {/* Collapsed Compact Escudo */}
              <img
                src={getAssetPath("/escudo-light.svg")}
                alt="Escudo DINARP"
                className="h-8.5 w-auto object-contain hidden group-data-[collapsible=icon]:block mx-auto"
              />
            </SidebarNavigationItemLink>
            <MobileSidebarCloseButton />
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="flex-1 overflow-y-auto py-3 px-2 group-data-[collapsible=icon]:px-2 space-y-1">
          <SidebarMenu>
            {(() => {
              const baseNavItems = navItems.filter((item) => {
                if (item.allowedRoles && (!activeUserRole || !item.allowedRoles.includes(activeUserRole))) {
                  return false;
                }
                if (item.providerOnly && !isProvider) {
                  return false;
                }
                if (item.id === "ciclo-fuentes" && activeUserRole === "COORDINADOR_SINARP" && !isProvider) {
                  return false;
                }
                return true;
              });

              let visibleNavItems = baseNavItems;
              if (isProvider && activeUserRole === "COORDINADOR_SINARP") {
                const priorityOrder: Record<string, number> = {
                  "catalogo-interoperabilidad": 1,
                  "mis-solicitudes": 2,
                  "proyectos": 3,
                  "fuentes-proveedor": 4,
                  "formalizacion-contratos": 5,
                  "mi-suplencia": 6,
                };
                visibleNavItems = [...baseNavItems]
                  .sort((a, b) => (priorityOrder[a.id] || 99) - (priorityOrder[b.id] || 99))
                  .map((item) => {
                    if (item.id === "fuentes-proveedor") {
                      return { ...item, label: "Mis fuentes de datos" };
                    }
                    return item;
                  });
              }

              const defaultSection = activeUserRole === "ADMIN" ? "Administración" : "Secciones";
              let lastSection: string | null = null;

              return visibleNavItems.map((item, idx) => {
                const Icon = item.icon;
                const isDirectActive = isItemActive(item);
                const itemSection = item.section || defaultSection;
                const showSectionHeader = itemSection !== lastSection;
                lastSection = itemSection;

                return (
                  <React.Fragment key={item.id}>
                    {showSectionHeader && (
                      <div className={cn("px-2 pb-1.5 group-data-[collapsible=icon]:hidden", idx > 0 && "pt-3")}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 dark:text-white/50 px-2">
                          {itemSection}
                        </p>
                      </div>
                    )}
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isDirectActive} tooltip={item.label}>
                        <SidebarNavigationItemLink
                          href={item.href}
                          className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center"
                        >
                          <Icon className="size-4.5 shrink-0" />
                          <span className="truncate group-data-[collapsible=icon]:hidden font-medium">
                            {item.label}
                          </span>
                        </SidebarNavigationItemLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </React.Fragment>
                );
              });
            })()}
          </SidebarMenu>
        </SidebarContent>

        {/* General & Theme Footer */}
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:px-2 border-t border-sidebar-border shrink-0 space-y-1 group-data-[collapsible=icon]:space-y-1.5">
          {!isInternalDinarpRole && (
            <>
              <div className="px-2 pt-1 pb-0.5 group-data-[collapsible=icon]:hidden">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 dark:text-white/50 px-2">
                  General
                </p>
              </div>
              <ul className="space-y-0.5 mb-1 group-data-[collapsible=icon]:space-y-1.5 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
                <li className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                  <SidebarMenuButton
                    tooltip="Notificaciones"
                    asChild
                    isActive={pathname?.startsWith("/novedades")}
                  >
                    <SidebarNavigationItemLink href="/novedades" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
                      <Bell className="size-4 shrink-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">Notificaciones</span>
                    </SidebarNavigationItemLink>
                  </SidebarMenuButton>
                </li>
                {activeUserRole !== "ADMIN" && (
                  <li className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                    <SidebarMenuButton
                      tooltip="Configuración"
                      asChild
                      isActive={pathname?.startsWith("/construccion")}
                    >
                      <SidebarNavigationItemLink href="/construccion" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
                        <Settings className="size-4 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">Configuración</span>
                      </SidebarNavigationItemLink>
                    </SidebarMenuButton>
                  </li>
                )}
              </ul>
            </>
          )}

          <ul className="space-y-0.5 mb-1 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
            <li className="w-full group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center pt-0.5">
              <SidebarCollapseItem />
            </li>
          </ul>

          <div className="border-t border-border/40 my-1 group-data-[collapsible=icon]:hidden" />

          {/* Theme switcher */}
          <div className="px-1 py-1 group-data-[collapsible=icon]:hidden">
            <div className="relative flex w-full items-center p-1 rounded-xl border bg-muted/60 dark:bg-white/10 border-border/60 dark:border-white/15">
              <div
                className={cn(
                  "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg shadow-xs transition-transform duration-300 bg-surface dark:bg-white/20",
                  themeMode === "oscuro" && "translate-x-full"
                )}
              />
              <button
                type="button"
                onClick={() => handleThemeChange("claro")}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer",
                  themeMode === "claro" ? "text-primary dark:text-white font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sun className="size-3.5" />
                <span>Claro</span>
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange("oscuro")}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-colors duration-200 cursor-pointer",
                  themeMode === "oscuro" ? "text-primary dark:text-white font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Moon className="size-3.5" />
                <span>Oscuro</span>
              </button>
            </div>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex justify-center py-1">
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col min-w-0 h-svh max-h-svh overflow-hidden">
        {/* Top Header */}
        <div className="shrink-0 pt-3 pr-3 pl-2 pb-1.5 z-30">
          <GeoportalHeader
            variant="user-actions"
            isStatic={true}
            showAccentBar={true}
            className="w-full"
            innerClassName="shadow-none rounded-lg border border-border bg-surface overflow-hidden"
            leftSlot={
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                <SidebarTrigger
                  className="md:hidden flex size-8.5 sm:size-9 items-center justify-center -ml-1 rounded-lg text-foreground hover:bg-muted/70 transition-colors shrink-0"
                  aria-label="Abrir menú lateral"
                >
                  <Menu className="size-5 shrink-0" strokeWidth={2} />
                </SidebarTrigger>
                  {headerSlot && (
                  <div className="flex shrink-0">
                    {headerSlot}
                  </div>
                )}
                {displayBreadcrumbs && (
                  <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                    <WireframeBreadcrumbs segments={displayBreadcrumbs} />
                  </div>
                )}
              </div>
            }
            userProps={resolvedUser ? {
              name: resolvedUser.name,
              role: resolvedUser.role,
              roleTitle: resolvedUser.roleTitle || ROLES_CONFIG[resolvedUser.role]?.name || resolvedUser.role,
              email: resolvedUser.email,
              institution: resolvedUser.institution || "DINARP",
              avatar: resolvedUser.avatar,
              initials: resolvedUser.initials,
              cedula: resolvedUser.cedula,
            } : undefined}
            onRoleChange={handleRoleChange}
            customConfig={{
              showLogo: false,
              showSearch: false,
              showThemeToggle: false,
              showNotifications: true,
              showUserMenu: true,
            }}
          />
        </div>

        {/* Dynamic Page Content Slot */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
