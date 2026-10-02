"use client";

/**
 * @component GeoportalSidebar
 * @description Menú de navegación lateral (Sidebar) del Design System DINARP.
 * 
 * Variantes y Comportamiento:
 * - **Desktop Expanded**: Muestra íconos y textos. Las subsecciones (ej. Trámites, Recursos) mantienen jerarquía y se separan con un Divider al finalizar el grupo.
 * - **Desktop Collapsed**: Muestra únicamente íconos. Se apoya en el componente Tooltip oficial del UI Kit para mostrar el nombre de la opción (incluyendo menú flotante para subsecciones).
 * - **Mobile (Drawer)**: Se transforma en un panel lateral (Sheet) superpuesto (overlay). Su cabecera replica la barra institucional (azul) y la barra blanca del Header, con botón de cierre (X).
 */

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Sun,
  Moon,
  Globe2,
  Home,
  FileText,
  Building2,
  FolderOpen,
  LogIn,
  Shield,
  BarChart3,
  Layers,
  Users,
  ChevronRight,
  X,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, Link } from "@/routing";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PanelLeftClose, PanelLeftOpen, Settings, LifeBuoy } from "lucide-react";

// ── Nav item definition ────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: "Inicio",
    href: "/",
    icon: Home,
  },
  {
    label: "Trámites",
    href: "/tramites",
    icon: FileText,
    children: [
      {
        label: "Concesiones Mineras",
        href: "/tramites/concesiones",
        icon: Shield,
      },
      {
        label: "Permisos Ambientales",
        href: "/tramites/permisos",
        icon: FileText,
      },
      {
        label: "Consulta de Estado",
        href: "/tramites/consulta",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Instituciones",
    href: "/instituciones",
    icon: Building2,
  },
  {
    label: "Geoportal",
    href: "/geoportal",
    icon: Globe2,
  },
  {
    label: "Recursos",
    href: "/recursos",
    icon: FolderOpen,
    children: [
      {
        label: "Capas Geográficas",
        href: "/recursos/capas",
        icon: Layers,
      },
      {
        label: "Datos Abiertos",
        href: "/recursos/datos",
        icon: BarChart3,
      },
      {
        label: "Directorio",
        href: "/recursos/directorio",
        icon: Users,
      },
    ],
  },
  {
    label: "Notificaciones",
    href: "/notificaciones",
    icon: Bell,
  },
  {
    label: "Acceso",
    href: "/acceso",
    icon: LogIn,
  },
];


// ── Component ──────────────────────────────────────────────────────────────
export function GeoportalSidebar({
  variant = "full",
}: {
  variant?: "full" | "navigation";
}) {
  const { state, setOpenMobile, isMobile, toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const showNav = true; // Always true for both full and navigation
  const showUser = variant === "full";
  const showBranding = variant === "full";

  // Derived user display values
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    const isWireframe = typeof window !== "undefined" && window.location.pathname.startsWith("/wireframes");
    router.push(isWireframe ? "/wireframes/login" : "/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Local theme state (same pattern as intranet-sidebar)
  const [theme, setTheme] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    const stored = getStoredTheme();
    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark";
    const initialTheme: Theme = stored ?? (isDark ? "dark" : "light");
    setTheme(initialTheme);

    const observer = new MutationObserver(() => {
      const isNowDark =
        document.documentElement.classList.contains("dark") ||
        document.documentElement.getAttribute("data-theme") === "dark";
      setTheme(isNowDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const handleTheme = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  const handleClick = () => {
    setOpenMobile(false);
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      {/* ── Header: Branding ── */}
      <SidebarHeader className="p-0">
        {showBranding ? (
          <>
            {/* Top bar azul (institucional) */}
            <div className="bg-primary w-full px-3 py-2 flex items-center justify-end min-h-10 lg:min-h-12 overflow-hidden">
              <SidebarTrigger className="hidden lg:flex text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" />
            </div>

            {/* Logo del GEOportal */}
            <div className="flex items-center justify-between px-4 py-3 lg:px-4 lg:py-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-4 group-data-[collapsible=icon]:justify-center border-b-2 border-primary-300 lg:border-b-0 lg:border-none">
              <Link href="/" className="flex items-center gap-3 shrink-0 group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:w-full">
                {/* Expanded logo */}
                <>
                  <img
                    src={getAssetPath("/logo-horizontal-blanco.svg")}
                    alt="Logo DINARP GEOportal"
                    className="h-9 lg:h-10 w-auto object-contain transition-transform group-hover:scale-105 group-data-[collapsible=icon]:hidden"
                  />
                </>
                {/* Collapsed logo */}
                <img
                  src={getAssetPath("/escudo-light.svg")}
                  alt="Escudo DINARP"
                  className="h-8 w-auto object-contain transition-transform group-hover:scale-105 hidden group-data-[collapsible=icon]:block mx-auto"
                />
              </Link>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpenMobile(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="size-6" strokeWidth={1.75} />
                </Button>
              )}
            </div>
            <SidebarSeparator className="hidden lg:block" />
          </>
        ) : (
          <div className="flex items-center justify-between p-3 border-b border-border min-h-12">
            <span className="text-body-sm font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden ml-1">
              Menú de navegación
            </span>
            <SidebarTrigger className="hidden lg:flex shrink-0" />
          </div>
        )}
      </SidebarHeader>

      {/* ── Navigation ── */}
      <SidebarContent className="px-2">
        {showNav && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-caption uppercase tracking-widest font-bold text-sidebar-foreground/90">
              Navegación
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  if (item.children) {
                    return (
                      <React.Fragment key={item.label}>
                        <NavCollapsible item={item} isActive={active} onClick={handleClick} />
                        {index < navItems.length - 1 && (
                          <SidebarSeparator className="my-1 border-border/50 w-auto mx-2" />
                        )}
                      </React.Fragment>
                    );
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label} onClick={handleClick}>
                        <Link href={item.href} className="flex items-center gap-2.5 w-full">
                          <Icon className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ── Footer: Secondary Actions, Theme toggle + User info ── */}
      <SidebarFooter className="px-3 py-3 gap-2">
        <SidebarSeparator className="mb-2" />
        
        {/* Acciones Secundarias */}
        <SidebarMenu className="px-1">
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configuración" onClick={(e) => e.preventDefault()}>
              <Settings className="shrink-0" />
              <span className="truncate">Configuración</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ayuda / Soporte" onClick={(e) => e.preventDefault()}>
              <LifeBuoy className="shrink-0" />
              <span className="truncate">Ayuda / Soporte</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          {/* Botón Contraer / Expandir */}
          <SidebarMenuItem className="hidden lg:block mt-2">
            <SidebarMenuButton 
              tooltip={state === "expanded" ? "Contraer sidebar" : "Expandir sidebar"} 
              onClick={toggleSidebar}
            >
              {state === "expanded" ? <PanelLeftClose className="shrink-0" /> : <PanelLeftOpen className="shrink-0" />}
              <span className="truncate">{state === "expanded" ? "Contraer sidebar" : "Expandir sidebar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        {/* Theme toggle */}
        <div className="flex flex-col gap-1 px-1 mb-3">
          {mounted && (
            <>
              {/* Expanded */}
              <div className="group-data-[collapsible=icon]:hidden px-3 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleTheme(theme === "dark" ? "light" : "dark")}
                  className={cn(
                    "relative flex w-full h-auto items-center p-1 rounded-full border border-transparent",
                    "bg-sidebar-accent/50 dark:bg-white/10 hover:bg-sidebar-accent dark:hover:bg-white/20 border-sidebar-border/50 dark:border-white/10 transition-colors duration-300"
                  )}
                  aria-label="Alternar tema"
                >
                  <div
                    className={cn(
                      "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                      theme === "dark" ? "bg-white translate-x-full" : "bg-white translate-x-0"
                    )}
                  />
                  <div
                    className={cn(
                      "relative z-10 flex flex-1 items-center justify-center gap-2 py-1.5 text-xs font-bold transition-colors duration-300",
                      theme !== "dark" ? "text-primary" : "text-white/85 hover:text-white"
                    )}
                  >
                    <Sun className="size-4" />
                    Claro
                  </div>
                  <div
                    className={cn(
                      "relative z-10 flex flex-1 items-center justify-center gap-2 py-1.5 text-xs font-bold transition-colors duration-300",
                      theme === "dark" ? "text-black font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Moon className="size-4" />
                    Oscuro
                  </div>
                </Button>
              </div>

              {/* Collapsed */}
              <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
                <ThemeToggle />
              </div>
            </>
          )}
        </div>

      </SidebarFooter>
    </Sidebar>
  );
}

function NavCollapsible({ item, isActive, onClick }: { item: NavItem, isActive: boolean, onClick: () => void }) {
  const [open, setOpen] = React.useState(isActive);
  const { state } = useSidebar();
  const Icon = item.icon;
  const pathname = usePathname();

  const isChildActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (state === "collapsed") {
    return (
      <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton isActive={isActive}>
                  <Icon className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={16} className="w-56 border-border shadow-lg rounded-xl bg-popover p-2">
          <DropdownMenuLabel className="font-heading text-foreground font-semibold px-2">{item.label}</DropdownMenuLabel>
          
          {item.children?.map((child) => {
            const childActive = isChildActive(child.href);
            const ChildIcon = child.icon;
            return (
              <DropdownMenuItem key={child.label} asChild>
                <Link href={child.href} className={cn("flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg text-sm font-medium transition-colors", childActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}>
                  <ChildIcon className="size-4 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.label} isActive={isActive && !open} onClick={() => setOpen(!open)}>
        <Icon className="shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronRight className={cn("ml-auto transition-transform duration-200 size-4 shrink-0", open && "rotate-90")} />
      </SidebarMenuButton>
      {open && (
        <div className="overflow-hidden">
          <SidebarMenuSub>
            {item.children?.map((child) => {
              const childActive = isChildActive(child.href);
              const ChildIcon = child.icon;
              return (
                <SidebarMenuSubItem key={child.label}>
                  <SidebarMenuSubButton asChild isActive={childActive} onClick={onClick}>
                    <Link href={child.href} className="flex items-center gap-2">
                      <ChildIcon className="size-3.5 shrink-0" />
                      <span className="truncate">{child.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </div>
      )}
    </SidebarMenuItem>
  );
}













