"use client";

import * as React from "react";
import Image from "next/image";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import { getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  UserCog,
  FileCheck,
  Building2,
  Lightbulb,
  Palette,
  MapPinned,
  Inbox,
  IdCard,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, Link } from "@/routing";

// ── Nav item definition ────────────────────────────────────────────────────
export interface IntranetNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  group: "principal" | "cuenta";
  disabled?: boolean;
  badge?: number;
}

/** Intranet navigation items */
export const INTRANET_NAV_ITEMS: IntranetNavItem[] = [
  // Principal
  { id: "home", label: "Home", icon: LayoutDashboard, href: "/intranet/home", group: "principal" },
  { id: "gestion-usuarios", label: "Gestión de Usuarios", icon: UserCog, href: "/intranet/usuarios", group: "principal" },
  { id: "sgc", label: "Gestión de Calidad", icon: FileCheck, href: "/intranet/sgc", group: "principal" },
  { id: "glocation", label: "GLocation", icon: Building2, href: "/intranet/glocation", group: "principal" },
  { id: "innovacion", label: "Innovación", icon: Lightbulb, href: "/intranet/innovacion", group: "principal" },
  { id: "diseno", label: "Diseño", icon: Palette, href: "/intranet/diseno", group: "principal" },
  { id: "rutas", label: "Rutas", icon: MapPinned, href: "/intranet/rutas", group: "principal" },
  { id: "contacto", label: "Contacto", icon: Inbox, href: "/intranet/contacto", group: "principal", badge: 4 },
  { id: "talento-humano", label: "Talento Humano", icon: Users, href: "/intranet/talento-humano", group: "principal" },

  // Cuenta
  { id: "mi-cuenta", label: "Mi Cuenta", icon: IdCard, href: "/intranet/mi-cuenta", group: "cuenta" },
];

const GROUP_LABELS: Record<IntranetNavItem["group"], string> = {
  principal: "Principal",
  cuenta: "Cuenta",
};

// ── Props ──────────────────────────────────────────────────────────────────
interface IntranetSidebarProps {
  activeItem?: string;
}

// ── Component ──────────────────────────────────────────────────────────────
export function IntranetSidebar({ activeItem = "home" }: IntranetSidebarProps) {
  const { setOpenMobile } = useSidebar();
  const { user, logout } = useAuth();
  const router = useRouter();

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

  // Local theme state (same pattern as uikit-sidebar)
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

  // Group sections by category
  const groupedItems = React.useMemo(() => {
    const groups = new Map<IntranetNavItem["group"], IntranetNavItem[]>();
    for (const item of INTRANET_NAV_ITEMS) {
      if (!groups.has(item.group)) {
        groups.set(item.group, []);
      }
      groups.get(item.group)!.push(item);
    }
    return groups;
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      {/* ── Header: Logo ── */}
      <SidebarHeader className="relative px-3 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          <div className="flex items-center shrink-0">
            <>
              <Image
                src={getAssetPath("/logo-horizontal.svg")}
                alt="Logo DINARP"
                width={167}
                height={35}
                className="dark:hidden h-[35px] w-auto group-data-[state=collapsed]:hidden animate-in fade-in duration-300 object-contain"
              />
              <Image
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="Logo DINARP"
                width={167}
                height={35}
                className="hidden dark:block h-[35px] w-auto group-data-[state=collapsed]:hidden animate-in fade-in duration-300 object-contain"
              />
            </>
            <>
              <Image
                src={getAssetPath("/escudo-light.svg")}
                alt="Escudo DINARP"
                width={27}
                height={27}
                className="dark:hidden h-[27px] w-auto group-data-[state=expanded]:hidden animate-in zoom-in-75 duration-300 object-contain"
              />
              <Image
                src={getAssetPath("/escudo-dark.svg")}
                alt="Escudo DINARP"
                width={27}
                height={27}
                className="hidden dark:block h-[27px] w-auto group-data-[state=expanded]:hidden animate-in zoom-in-75 duration-300 object-contain"
              />
            </>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* ── Navigation ── */}
      <SidebarContent>
        {Array.from(groupedItems.entries()).map(([group, items]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-caption uppercase tracking-widest font-bold text-sidebar-foreground/90">
              {GROUP_LABELS[group]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;

                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild={!item.disabled}
                        isActive={isActive}
                        disabled={item.disabled}
                        tooltip={item.disabled ? `${item.label} — Próximamente` : item.label}
                        onClick={handleClick}
                        className={item.disabled ? "opacity-40 cursor-not-allowed" : ""}
                      >
                        {item.disabled ? (
                          <span className="flex items-center gap-2.5 w-full">
                            <Icon className="shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <span className="text-[10px] font-bold bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                                {item.badge}
                              </span>
                            )}
                            <span className="text-[9px] font-bold tracking-wider text-sidebar-foreground/40 uppercase bg-sidebar-accent/50 px-1.5 py-0.5 rounded leading-none">
                              Pronto
                            </span>
                          </span>
                        ) : (
                          <Link href={item.href} className="flex items-center gap-2.5 w-full">
                            <Icon className="shrink-0" />
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="bg-danger text-white min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold ml-auto shadow-sm shadow-danger/20">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ── Footer: Theme toggle + User info ── */}
      <SidebarFooter className="px-3 py-3">
        <SidebarSeparator className="mb-3" />

        {/* Theme toggle */}
        <div className="flex flex-col gap-1 px-1 mb-3">
          {mounted && (
            <>
              {/* Expanded: full pill Light / Dark */}
              <div className="group-data-[collapsible=icon]:hidden">
                <div className="flex items-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-0.5 gap-0.5">
                  <Button
                    variant="ghost"
                    onClick={() => handleTheme("light")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium transition-all duration-200 h-auto ${theme === "light"
                      ? "bg-sidebar text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                      }`}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Claro</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleTheme("dark")}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium transition-all duration-200 h-auto ${theme === "dark"
                      ? "bg-sidebar text-sidebar-foreground shadow-sm"
                      : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                      }`}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Oscuro</span>
                  </Button>
                </div>
              </div>

              {/* Collapsed: single icon button */}
              <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleTheme(theme === "light" ? "dark" : "light")}
                  aria-label="Toggle Theme"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors duration-200"
                >
                  {theme === "dark" ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Sun className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* User section */}
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-caption group-data-[collapsible=icon]:size-8 transition-all duration-200">
              {initials}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-background group-data-[collapsible=icon]:size-2" />
          </div>

          {/* Name + Email + Logout (hidden when collapsed) */}
          <div className="flex flex-1 items-center justify-between gap-2 min-w-0 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-heading font-semibold text-sidebar-foreground truncate">
                {displayName}
              </span>
              <span className="text-caption text-sidebar-foreground/60 truncate">
                {displayEmail}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
