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

const navItems: NavItem[] = [
  // ── SECCIÓN PRINCIPAL BN-07: ACCESO A FUENTES ──
  // Coordinador SINARP
  {
    id: "catalogo-interoperabilidad",
    label: "Catálogo de fuentes",
    icon: Database,
    href: "/catalogo-interoperabilidad",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"],
    section: "Acceso a fuentes",
  },
  {
    id: "mis-solicitudes",
    label: "Solicitudes de acceso",
    icon: Network,
    href: "/acceso-interoperabilidad/solicitudes",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"],
    section: "Acceso a fuentes",
  },
  // Director de Gestión
  {
    id: "acceso-interoperabilidad-asignacion",
    label: "Asignar revisiones de acceso",
    icon: UserCheck,
    href: "/acceso-interoperabilidad/asignacion",
    allowedRoles: ["DIR_GESTION", "ADMIN"],
    section: "Acceso a fuentes",
  },
  // Revisor de Gestión
  {
    id: "revision-gestion",
    label: "Revisar solicitudes de acceso",
    icon: CheckSquare,
    href: "/revision-gestion",
    allowedRoles: ["EQ_GESTION", "ADMIN"],
    section: "Acceso a fuentes",
  },
  // Director DPI (Separado de Normativa)
  {
    id: "asignacion-normativa-fuentes",
    label: "Asignar revisiones DPI",
    icon: UserCheck,
    href: "/revision-normativa/asignacion",
    allowedRoles: ["DIR_DPI", "DPI", "ADMIN"],
    section: "Acceso a fuentes",
  },
  {
    id: "informes-aprobacion-dpi",
    label: "Firmar informes DPI",
    icon: FileSignature,
    href: "/revision-normativa/asignacion?tab=informes",
    allowedRoles: ["DIR_DPI", "DPI", "ADMIN"],
    section: "Acceso a fuentes",
  },
  // Revisor DPI (Separado de Normativa)
  {
    id: "revision-normativa-fuentes",
    label: "Evaluar datos confidenciales",
    icon: Lock,
    href: "/revision-normativa/fuentes",
    allowedRoles: ["EQ_DPI", "ADMIN"],
    section: "Acceso a fuentes",
  },
  {
    id: "informes-elaborados-dpi",
    label: "Elaborar informes DPI",
    icon: FileCheck2,
    href: "/revision-normativa/fuentes?tab=informes",
    allowedRoles: ["EQ_DPI", "ADMIN"],
    section: "Acceso a fuentes",
  },

  // ── Coordinador SINARP — Proyecto Institucional ──
  {
    id: "proyectos",
    label: "Gestión de proyectos",
    icon: FolderKanban,
    href: "/proyectos",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"],
    section: "Proyecto institucional",
  },
  {
    id: "fuentes-proveedor",
    label: "Mis fuentes de datos",
    icon: Server,
    href: "/proveedor/fuentes",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"],
    providerOnly: true,
    section: "Gestión de Fuentes",
  },
  {
    id: "mi-suplencia",
    label: "Mi suplencia",
    icon: ArrowLeftRight,
    href: "/mi-suplencia",
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR", "REPRESENTANTE_INSTITUCIONAL"],
    section: "Gestión Institucional",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO A (Incorporación Institucional) ──
  {
    id: "registro-institucion",
    label: "Solicitar incorporación",
    icon: Building2,
    href: "/registro-institucion",
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL"],
    section: "Expedientes Anexo A",
  },
  {
    id: "expedientes-anexo-a",
    label: "Estado de incorporación",
    icon: FileText,
    href: "/expedientes-anexo-a",
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL", "ADMIN"],
    section: "Expedientes Anexo A",
  },
  {
    id: "asignacion-solicitudes",
    label: "Asignar incorporaciones",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_GESTION", "ADMIN"],
    section: "Expedientes Anexo A",
  },
  {
    id: "solicitudes-pendientes",
    label: "Revisar incorporaciones",
    icon: CheckSquare,
    href: "/solicitudes-pendientes",
    allowedRoles: ["EQ_GESTION", "ADMIN"],
    section: "Expedientes Anexo A",
  },
  {
    id: "asignacion-resoluciones",
    label: "Asignar resoluciones",
    icon: UserCheck,
    href: "/revision-normativa",
    allowedRoles: ["DIR_NORMATIVA", "ADMIN"],
    section: "Expedientes Anexo A",
  },
  {
    id: "revision-normativa",
    label: "Generar resoluciones",
    icon: Scale,
    href: "/revision-normativa",
    allowedRoles: ["EQ_NORMATIVA", "ADMIN"],
    section: "Expedientes Anexo A",
  },
  {
    id: "firma-resoluciones",
    label: "Firmar resoluciones",
    icon: FileSignature,
    href: "/firma-resoluciones",
    allowedRoles: ["APROBADOR", "ADMIN"],
    section: "Expedientes Anexo A",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO B (Registro de Coordinadores) ──
  {
    id: "expedientes-anexo-b",
    label: "Estado de enrolamientos",
    icon: UserCheck,
    href: "/expedientes-anexo-b",
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL", "ADMIN"],
    section: "Expedientes Anexo B",
  },
  {
    id: "asignacion-anexo-b",
    label: "Asignar enrolamientos",
    icon: UserCheck,
    href: "/asignacion-anexo-b",
    allowedRoles: ["DIR_GESTION", "ADMIN"],
    section: "Expedientes Anexo B",
  },
  {
    id: "revision-anexo-b",
    label: "Revisar enrolamientos",
    icon: CheckSquare,
    href: "/revision-anexo-b",
    allowedRoles: ["EQ_GESTION", "ADMIN"],
    section: "Expedientes Anexo B",
  },

  // ── SECCIÓN INDEPENDIENTE: EXPEDIENTES ANEXO C (Cambio de Coordinador) ──
  {
    id: "cambio-coordinador-rep",
    label: "Solicitar cambio",
    icon: UserCog,
    href: "/cambio-coordinador",
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL"],
    section: "Expedientes Anexo C",
  },
  {
    id: "expedientes-anexo-c-rep",
    label: "Estado de cambios",
    icon: FileText,
    href: "/expedientes-anexo-c",
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL"],
    section: "Expedientes Anexo C",
  },
  {
    id: "cambio-coordinador",
    label: "Solicitar cambio",
    icon: UserCog,
    href: "/cambio-coordinador",
    allowedRoles: ["COORDINADOR_SINARP"],
    section: "Expedientes Anexo C",
  },
  {
    id: "expedientes-anexo-c",
    label: "Expedientes de cambio",
    icon: FileText,
    href: "/expedientes-anexo-c",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"],
    section: "Expedientes Anexo C",
  },
  {
    id: "asignacion-anexo-c",
    label: "Asignar cambios",
    icon: UserCheck,
    href: "/asignacion-anexo-c",
    allowedRoles: ["DIR_GESTION", "ADMIN"],
    section: "Expedientes Anexo C",
  },
  {
    id: "revision-anexo-c",
    label: "Revisar cambios",
    icon: CheckSquare,
    href: "/revision-anexo-c",
    allowedRoles: ["EQ_GESTION", "ADMIN"],
    section: "Expedientes Anexo C",
  },

  // ── Formalización y Catálogo de Fuentes (Otros Flujos) ──
  {
    id: "formalizacion-gestion",
    label: "Formalizar accesos",
    icon: FileCheck2,
    href: "/formalizacion",
    allowedRoles: ["DIR_GESTION", "ADMIN"],
    section: "Formalización de Accesos",
  },
  {
    id: "revision-aprobacion-fuentes",
    label: "Revisar fuentes",
    icon: FolderCheck,
    href: "/gestion/fuentes",
    allowedRoles: ["DGR", "DPI", "DIR_GESTION", "EQ_GESTION", "ADMIN"],
    section: "Catálogo de Fuentes",
  },

  // ── Jurídica ──
  {
    id: "formalizacion-contratos",
    label: "Contratos de acceso",
    icon: FileText,
    href: "/formalizacion/contratos",
    allowedRoles: ["JURIDICA", "ADMIN"],
  },

  // ── Equipo TI ──
  {
    id: "tecnologia-conectores",
    label: "Gestión de conectores",
    icon: Plug,
    href: "/tecnologia/conectores",
    allowedRoles: ["TI", "DTD", "ADMIN"],
  },
  {
    id: "tecnologia-homologaciones",
    label: "Homologación de orígenes",
    icon: Cpu,
    href: "/tecnologia/homologaciones",
    allowedRoles: ["TI", "DTD", "ADMIN"],
  },
  {
    id: "acceso-consumo-ti",
    label: "Aprovisionar accesos",
    icon: Cpu,
    href: "/acceso-consumo",
    allowedRoles: ["TI", "ADMIN"],
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
    allowedRoles: ["ADMIN"],
  },

  // ── ENTREGA DIRECTA Y EXCEPCIONAL (Res. 003-NG-DINARP-2023) ──
  {
    id: "entrega-excepcional",
    label: "Entrega excepcional",
    icon: Receipt,
    href: "/entrega-excepcional",
    allowedRoles: ["COORDINADOR_SINARP", "DIR_GESTION", "EQ_GESTION", "TI", "DTD", "DIR_DPI", "EQ_DPI", "APROBADOR", "CONTROL_EVALUACION", "ADMIN"],
    section: "Entrega excepcional",
  },
  {
    id: "control-excepcional",
    label: "Control de autorizaciones",
    icon: Shield,
    href: "/control-excepcional",
    allowedRoles: ["CONTROL_EVALUACION", "ADMIN"],
    section: "Entrega excepcional",
  },
  {
    id: "parametros-excepcional",
    label: "Parámetros excepcional",
    icon: Sliders,
    href: "/parametros-excepcional",
    allowedRoles: ["DIR_NORMATIVA", "ADMIN"],
    section: "Entrega excepcional",
  },
];

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
    name: rawUser.name || fallbackUser.name,
    role: (rawUser.role as UserRole) || fallbackUser.role,
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
  };

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
              href="/"
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
                return true;
              });

              let visibleNavItems = baseNavItems;
              if (isProvider && activeUserRole === "COORDINADOR_SINARP") {
                const priorityOrder: Record<string, number> = {
                  "catalogo-interoperabilidad": 1,
                  "mis-solicitudes": 2,
                  "proyectos": 3,
                  "fuentes-proveedor": 4,
                  "cambio-coordinador": 5,
                  "expedientes-anexo-c": 6,
                  "mi-suplencia": 7,
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

