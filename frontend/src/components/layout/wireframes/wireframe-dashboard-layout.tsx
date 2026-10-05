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
  FileSignature,
  KeyRound,
  History,
  Building2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { cn, getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/shared/user-menu";
import { GeoportalHeader } from "@/components/layout/geoportal-header";
import { NotificationsMenu } from "@/components/shared/notifications-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { MOCK_USERS_BY_ROLE, type MockUser, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
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

interface WireframeDashboardLayoutProps {
  activeMenu?: string;
  currentUser?: MockUser;
  currentRole?: UserRole;
  allowedRoles?: string[];
  onRoleChange?: (role: UserRole) => void;
  breadcrumbs?: BreadcrumbSegment[];
  headerSlot?: React.ReactNode;
  children: React.ReactNode;
}

interface NavSubItem {
  id: string;
  label: string;
  href: string;
  exact?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  children?: NavSubItem[];
  pathPrefix?: string;
  allowedRoles?: UserRole[];
  providerOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    id: "institucion-group",
    label: "Institución",
    icon: Building2,
    pathPrefix: "/cambio-coordinador",
    children: [
      {
        id: "cambio-coordinador",
        label: "Cambio de coordinador",
        href: "/cambio-coordinador",
        exact: true
      }
    ],
    allowedRoles: ["REPRESENTANTE_INSTITUCIONAL", "ADMIN"]
  },
  {

    id: "inicio",
    label: "Inicio",
    icon: Home,
    href: "#",
    allowedRoles: ["EQ_GESTION", "DIR_NORMATIVA", "EQ_NORMATIVA", "REPRESENTANTE_INSTITUCIONAL"]
  },
  {
    id: "catalogo-interoperabilidad-group",
    label: "Catálogo de Interoperabilidad",
    icon: Database,
    pathPrefix: "/catalogo-interoperabilidad",
    children: [
      {
        id: "catalogo-interoperabilidad",
        label: "Consulta",
        href: "/catalogo-interoperabilidad",
        exact: true
      }
    ],
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR"]
  },
  {
    id: "proyectos",
    label: "Proyectos",
    icon: FolderKanban,
    href: "/proyectos",
    allowedRoles: ["COORDINADOR_SINARP"]
  },
  {
    id: "fuentes",
    label: "Fuentes",
    icon: Server,
    href: "/fuentes",
    allowedRoles: ["COORDINADOR_SINARP"],
    providerOnly: true
  },
  {
    id: "acceso-interoperabilidad-group",
    label: "Acceso a Interoperabilidad",
    icon: Network,
    pathPrefix: "/acceso-interoperabilidad",
    children: [
      {
        id: "acceso-interoperabilidad",
        label: "Gestión de solicitudes",
        href: "/acceso-interoperabilidad/solicitudes",
        exact: false
      }
    ],
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR"]
  },
  {
    id: "acceso-seguridad-group",
    label: "Acceso y seguridad",
    icon: ShieldCheck,
    pathPrefix: "/acceso-seguridad",
    children: [
      {
        id: "gestion-ingresos",
        label: "Gestión de ingresos",
        href: "/asignacion-solicitudes",
        exact: false
      }
    ],
    allowedRoles: ["COORDINADOR_SINARP", "APROBADOR", "DGR"]
  },
  {
    id: "asignacion-solicitudes",
    label: "Asignación de solicitudes",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_GESTION"]
  },
  {
    id: "solicitudes-pendientes",
    label: "Solicitudes pendientes",
    icon: FileSignature,
    href: "/solicitudes-pendientes",
    allowedRoles: ["EQ_GESTION"]
  },
  {
    id: "revision-fuentes",
    label: "Revisión de fuentes",
    icon: FolderCheck,
    href: "/revision-fuentes",
    allowedRoles: ["EQ_GESTION", "DIR_GESTION"]
  },
  {
    id: "asignacion-normativa",
    label: "Asignación normativa",
    icon: UserCheck,
    href: "/asignacion-solicitudes",
    allowedRoles: ["DIR_NORMATIVA"]
  },
  {
    id: "revision-normativa", label: "Solicitudes pendientes", icon: FileSignature, href: "/revision-normativa", allowedRoles: ["EQ_NORMATIVA"]
  },
  {
    id: "resoluciones",
    label: "Resoluciones",
    icon: FileText,
    href: "#",
    allowedRoles: ["EQ_NORMATIVA"]
  },
  {
    id: "cuentas-internas",
    label: "Cuentas internas",
    icon: Users,
    href: "/cuentas-internas",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "areas",
    label: "Áreas DINARP",
    icon: Building2,
    href: "/areas",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "roles",
    label: "Roles y permisos",
    icon: ShieldCheck,
    href: "/roles",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "coordinadores",
    label: "Coordinadores",
    icon: UserCheck,
    href: "/coordinadores",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "suplencias",
    label: "Gestión de suplencias",
    icon: ArrowLeftRight,
    href: "/suplencias",
    allowedRoles: ["COORDINADOR_SINARP", "ADMIN"]
  },
  {
    id: "auditoria-cuentas",
    label: "Auditoría de cuentas",
    icon: History,
    href: "/auditoria-cuentas",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "gestion-recuperaciones",
    label: "Gestión de recuperaciones",
    icon: KeyRound,
    href: "/gestion-recuperaciones",
    allowedRoles: ["ADMIN"]
  },
  {
    id: "configuracion-acceso",
    label: "Configuración",
    icon: Settings,
    href: "/configuracion/servicio-acceso",
    allowedRoles: []
  },
  {
    id: "configuracion-identidad",
    label: "Configuración de Identidad",
    icon: ShieldCheck,
    href: "/configuracion-identidad",
    allowedRoles: []
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "catalogo-interoperabilidad-group": true,
    "acceso-interoperabilidad-group": true,
    "acceso-seguridad-group": true,
    "administracion-group": true,
  });

  const router = useRouter();
  const { activeUser, logout } = useAuthStore();
  const resolvedUser: MockUser = currentUser || activeUser || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;
  const activeUserRole = currentRole || resolvedUser?.role;
  const isAprobador = activeUserRole === "APROBADOR";

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

  const isSubItemActive = (subItem: NavSubItem) => {
    if (activeMenu && activeMenu === subItem.id) return true;
    if (pathname) {
      if (subItem.exact) {
        return pathname === subItem.href;
      }
      return pathname.startsWith(subItem.href);
    }
    return false;
  };

  const isGroupActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some(child => isSubItemActive(child));
    }
    if (item.href && pathname) {
      return pathname.startsWith(item.href);
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
                className="h-10 sm:h-10.5 w-auto max-w-[170px] sm:max-w-[200px] object-contain dark:hidden group-data-[collapsible=icon]:hidden"
              />
              <img
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="Logo DINARP GEOportal"
                className="h-10 sm:h-10.5 w-auto max-w-[170px] sm:max-w-[200px] object-contain hidden dark:block group-data-[collapsible=icon]:hidden"
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
              {activeUserRole === "ADMIN" ? "Administración" : "Principal"}
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
                const hasChildren = item.children && item.children.length > 0;
                const groupActive = isGroupActive(item);

                if (hasChildren) {
                  const isGroupOpen = openGroups[item.id] !== false;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => setOpenGroups((prev) => ({ ...prev, [item.id]: !isGroupOpen }))}
                        isActive={groupActive}
                        tooltip={item.label}
                      >
                        <Icon className="size-4.5 shrink-0" />
                        <span className="flex-1 text-left font-medium leading-snug group-data-[collapsible=icon]:hidden">{item.label}</span>
                        {isGroupOpen ? (
                          <ChevronDown className="size-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                        ) : (
                          <ChevronRight className="size-3.5 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
                        )}
                      </SidebarMenuButton>

                      {isGroupOpen && (
                        <SidebarMenuSub>
                          {item.children?.map((sub) => {
                            const isSubActive = isSubItemActive(sub);
                            const subLabel = (sub.id === "acceso-interoperabilidad" && isAprobador)
                              ? "Gestión de solicitudes pendientes"
                              : sub.label;

                            return (
                              <SidebarMenuSubItem key={sub.id}>
                                <SidebarMenuSubButton asChild isActive={isSubActive}>
                                  <SidebarNavigationItemLink href={sub.href}>
                                    <span className="truncate">{subLabel}</span>
                                  </SidebarNavigationItemLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                const isDirectActive = (activeMenu && activeMenu === item.id) || (item.href && pathname ? (item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)) : false);

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={isDirectActive} tooltip={item.label}>
                      <SidebarNavigationItemLink href={item.href || "#"} className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
                        <Icon className="size-4.5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
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
                      className="dark:hidden h-7 w-auto max-w-[120px] object-contain"
                    />
                    <img
                      src={getAssetPath("/logo-horizontal-blanco.svg")}
                      alt="Logo DINARP"
                      className="hidden dark:block h-7 w-auto max-w-[120px] object-contain"
                    />
                  </Link>
                )}
              </div>
            }
            userProps={resolvedUser ? {
              name: resolvedUser.name,
              role: resolvedUser.role,
              roleTitle: resolvedUser.roleTitle || resolvedUser.role,
              email: resolvedUser.email,
              institution: resolvedUser.institution || "DINARP",
              avatar: resolvedUser.avatar,
            } : undefined}
            onRoleChange={onRoleChange}
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

