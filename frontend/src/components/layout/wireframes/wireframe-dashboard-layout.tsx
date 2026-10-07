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
  institution?: string;
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
}

const navItems: NavItem[] = [
  // ── Coordinador SINARP, Aprobador y Representante Institucional ──
  {
    id: "cambio-coordinador",
    label: "Cambio de coordinador",
    icon: UserCog,
    href: "/cambio-coordinador",
    allowedRoles: ["COORDINADOR_SINARP", "REPRESENTANTE_INSTITUCIONAL", "ADMIN"],
  },
  {
    id: "mi-suplencia",
    label: "Mi suplencia",
    icon: ArrowLeftRight,
    href: "/mi-suplencia",
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR", "REPRESENTANTE_INSTITUCIONAL"],
  },
  {
    id: "catalogo-interoperabilidad",
    label: "Catálogo de interoperabilidad",
    icon: Database,
    href: "/catalogo-interoperabilidad",
    allowedRoles: [
      "COORDINADOR_SINARP",
      "APROBADOR",
      "REPRESENTANTE_INSTITUCIONAL",
      "FACTURACION",
      "DGR",
      "DTD",
      "DPI",
    ],
  },
  {
    id: "acceso-interoperabilidad",
    label: "Solicitudes de acceso",
    icon: Network,
    href: "/acceso-interoperabilidad/solicitudes",
    allowedRoles: [
      "COORDINADOR_SINARP",
      "APROBADOR",
      "REPRESENTANTE_INSTITUCIONAL",
      "FACTURACION",
    ],
  },
  {
    id: "proyectos",
    label: "Proyectos",
    icon: FolderKanban,
    href: "/proyectos",
    allowedRoles: ["COORDINADOR_SINARP"],
  },
  {
    id: "fuentes",
    label: "Fuentes",
    icon: Server,
    href: "/fuentes",
    allowedRoles: ["COORDINADOR_SINARP"],
    providerOnly: true,
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
    label: "Coordinadores",
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

  // ── Dirección y Equipo de Gestión ──
  {
    id: "asignacion-solicitudes-gestion",
    label: "Asignación de solicitudes",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_GESTION"],
  },
  {
    id: "asignacion-acceso-gestion",
    label: "Asignación de acceso",
    icon: Database,
    href: "/acceso-interoperabilidad/asignacion",
    allowedRoles: ["DIR_GESTION"],
  },
  {
    id: "solicitudes-pendientes",
    label: "Solicitudes pendientes",
    icon: FileSignature,
    href: "/solicitudes-pendientes",
    allowedRoles: ["EQ_GESTION"],
  },
  {
    id: "revision-gestion",
    label: "Revisión de acceso",
    icon: Network,
    href: "/revision-gestion",
    allowedRoles: ["EQ_GESTION"],
  },
  {
    id: "revision-fuentes",
    label: "Revisión de fuentes",
    icon: FolderCheck,
    href: "/revision-fuentes",
    allowedRoles: ["DIR_GESTION", "EQ_GESTION"],
  },

  // ── Dirección y Equipo de Normatividad ──
  {
    id: "asignacion-normativa",
    label: "Asignación de solicitudes",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_NORMATIVA"],
  },
  {
    id: "revision-normativa",
    label: "Revisión normativa",
    icon: Scale,
    href: "/revision-normativa",
    allowedRoles: ["DIR_NORMATIVA", "EQ_NORMATIVA"],
  },
  {
    id: "revision-normativa-fuentes",
    label: "Fuentes confidenciales (BN-07)",
    icon: Lock,
    href: "/revision-normativa/fuentes",
    allowedRoles: ["DIR_NORMATIVA", "EQ_NORMATIVA"],
  },

  // ── Direcciones Técnicas / Registro / Protección (DGR, DTD, DPI) ──
  {
    id: "validacion-tecnica-registro",
    label: "Gestión de ingresos",
    icon: ShieldCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DGR", "DTD", "DPI"],
  },
  {
    id: "homologacion-fuentes",
    label: "Homologación técnica (FUE-12)",
    icon: Cpu,
    href: "/homologacion-fuentes",
    allowedRoles: ["ADMIN", "DTD"],
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

  const router = useRouter();
  const { activeUser, logout, setRole } = useAuthStore();
  const fallbackUser = activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const rawUser =
    currentRole && MOCK_USERS_BY_ROLE[currentRole] && (!currentUser || currentUser.role !== currentRole)
      ? MOCK_USERS_BY_ROLE[currentRole]
      : currentUser || fallbackUser;

  const resolvedUser: MockUser = {
    id: rawUser.id || fallbackUser.id,
    name: rawUser.name || fallbackUser.name,
    role: (rawUser.role as UserRole) || fallbackUser.role,
    institution: rawUser.institution || fallbackUser.institution,
    avatar: ("avatar" in rawUser && rawUser.avatar) ? rawUser.avatar : fallbackUser.avatar,
  };
  const activeUserRole = currentRole || resolvedUser?.role || "COORDINADOR_SINARP";
  const isAprobador = activeUserRole === "APROBADOR";
  const isInternalDinarpRole =
    activeUserRole === "DIR_GESTION" ||
    activeUserRole === "DIR_NORMATIVA" ||
    activeUserRole === "EQ_GESTION" ||
    activeUserRole === "EQ_NORMATIVA";

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
    if (activeMenu && (activeMenu === item.id || activeMenu === item.href.replace(/^\//, ""))) {
      return true;
    }
    if (item.href && pathname) {
      const cleanPath = pathname.replace(/\/$/, "");
      const cleanHref = item.href.replace(/\/$/, "");
      if (cleanHref === "" || cleanHref === "/") {
        return cleanPath === "" || cleanPath === "/";
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
          <div className="px-2 pb-1.5 group-data-[collapsible=icon]:hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 dark:text-white/50 px-2">
              {activeUserRole === "ADMIN" ? "Administración" : "Secciones"}
            </p>
          </div>
          <SidebarMenu>
            {(() => {
              const visibleNavItems = navItems.filter((item) => {
                if (item.allowedRoles && (!activeUserRole || !item.allowedRoles.includes(activeUserRole))) {
                  return false;
                }
                if (item.providerOnly && !isProviderInstitution(resolvedUser?.institution)) {
                  return false;
                }
                return true;
              });

              return visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isDirectActive = isItemActive(item);

                return (
                  <SidebarMenuItem key={item.id}>
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
                    isActive={pathname?.startsWith("/notificaciones")}
                  >
                    <SidebarNavigationItemLink href="/notificaciones" className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
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
                {breadcrumbs && breadcrumbs.length > 0 ? (
                  <div className="flex items-center min-w-0 flex-1 overflow-hidden">
                    <WireframeBreadcrumbs segments={breadcrumbs} />
                  </div>
                ) : (
                  <Link href="/" className="flex items-center shrink-0">
                    <img
                      src={getAssetPath("/logo-horizontal.svg")}
                      alt="Logo DINARP"
                      className="dark:hidden h-7 w-auto max-w-[140px] object-contain"
                    />
                    <img
                      src={getAssetPath("/logo-horizontal-blanco.svg")}
                      alt="Logo DINARP"
                      className="hidden dark:block h-7 w-auto max-w-[140px] object-contain"
                    />
                  </Link>
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

