"use client";

// components/layout/geoportal-header.tsx
// Header institucional de 2 barras para páginas internas del geoportal DINARP.
// Barra superior: azul primary con branding institucional.
// Barra inferior: blanca con logo, secciones, notificaciones y menú de usuario.

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Menu,
  X,
  FileText,
  Building2,
  Globe2,
  FolderOpen,
  Home,
  Layers,
  BarChart3,
  Users,
  Shield,
} from "lucide-react";

import { cn, getAssetPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search as SearchComponent } from "@/components/ui/search";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationsMenu } from "@/components/shared/notifications-menu";
import { UserMenu } from "@/components/shared/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

/* ─────────────────────────────────────────────
   Tipos y datos de navegación
   ───────────────────────────────────────────── */

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  iconBg?: string;
  iconColor?: string;
  children?: NavItem[];
}

export const defaultNavItems: NavItem[] = [
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
        description: "Solicita y gestiona concesiones de explotación minera",
        href: "/tramites/concesiones",
        icon: Shield,
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
      },
      {
        label: "Permisos Ambientales",
        description: "Trámites de licenciamiento y permisos ambientales",
        href: "/tramites/permisos",
        icon: FileText,
        iconBg: "bg-success/10",
        iconColor: "text-success",
      },
      {
        label: "Consulta de Estado",
        description: "Revisa el estado actual de tus trámites en curso",
        href: "/tramites/consulta",
        icon: BarChart3,
        iconBg: "bg-info/10",
        iconColor: "text-info",
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
        description: "Explora las capas de información geoespacial disponibles",
        href: "/recursos/capas",
        icon: Layers,
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary",
      },
      {
        label: "Datos Abiertos",
        description: "Descarga datasets de producción, catastro y más",
        href: "/recursos/datos",
        icon: BarChart3,
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
      },
      {
        label: "Directorio",
        description: "Encuentra instituciones y funcionarios del sector",
        href: "/recursos/directorio",
        icon: Users,
        iconBg: "bg-danger/10",
        iconColor: "text-danger",
      },
    ],
  },
];

export const defaultHeaderConfig = {
  showLogo: true,
  logoUrlLight: "/logo-horizontal.svg",
  logoUrlDark: "/logo-horizontal-blanco.svg",
  title: "",
  showSearch: true,
  showThemeToggle: true,
  showUserMenu: true,
  showNotifications: true,
};

export type HeaderConfig = typeof defaultHeaderConfig;

/* ─────────────────────────────────────────────
   Componente: DropdownNav (para barra blanca)
   ───────────────────────────────────────────── */

function DropdownNav({ item, isActive, isChildActive }: { item: NavItem; isActive: boolean; isChildActive: (href: string) => boolean }) {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={cn(
          "relative flex items-center gap-1.5 px-3.5 py-1.5 text-body-sm font-semibold whitespace-nowrap",
          "transition-all duration-200 outline-none rounded-full cursor-pointer",
          "focus-visible:ring-2 focus-visible:ring-ring",
          isActive || open
            ? "text-primary-500 dark:text-primary-400 font-bold bg-primary-500/10 shadow-xs border border-primary-500/20"
            : "text-foreground hover:text-primary-300 dark:hover:text-primary-300 hover:bg-primary-300/10"
        )}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span>{item.label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-all duration-200",
            isActive || open ? "text-primary-500 dark:text-primary-400" : "text-muted-foreground group-hover:text-primary-300",
            open && "rotate-180"
          )}
        />
        {isActive && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary-500 rounded-full shadow-[0_0_6px_rgba(var(--primary-rgb),0.6)]" />
        )}
      </button>

      {/* Dropdown panel */}
      <div
        className={cn(
          "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80",
          "bg-surface border border-border rounded-2xl shadow-xl",
          "transition-all duration-200 origin-top z-50 overflow-hidden",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Flecha indicadora */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 bg-surface border-l border-t border-border rounded-xs" />

        <div className="relative py-2 px-2 flex flex-col gap-1 max-h-[75vh] overflow-y-auto">
          {item.children?.map((child) => {
            const isChildCurrent = isChildActive(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "group flex gap-3 px-3 py-2.5 rounded-xl",
                  child.description ? "items-start" : "items-center",
                  "transition-all duration-150",
                  isChildCurrent
                    ? "bg-primary-500/10 text-primary-500 font-bold border-l-2 border-primary-500"
                    : "text-foreground hover:text-primary-300 hover:bg-primary-300/10"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-lg shrink-0",
                    child.description && "mt-0.5",
                    "transition-colors duration-150",
                    isChildCurrent
                      ? "bg-primary-500/20 text-primary-500"
                      : "bg-muted text-muted-foreground group-hover:bg-primary-300/20 group-hover:text-primary-300"
                  )}
                >
                  <child.icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={cn(
                    "text-body-sm transition-colors",
                    isChildCurrent ? "text-primary-500 font-bold" : "text-foreground group-hover:text-primary-300 font-semibold"
                  )}>
                    {child.label}
                  </span>
                  {child.description && (
                    <span className="text-caption text-muted-foreground line-clamp-2 group-hover:text-primary-300/80 transition-colors">
                      {child.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente: SearchOverlay
   ───────────────────────────────────────────── */

function SearchOverlay({
  open,
  onClose,
  navItems = [],
}: {
  open: boolean;
  onClose: () => void;
  navItems?: NavItem[];
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const searchableItems = React.useMemo(() => {
    const items: NavItem[] = [];
    navItems.forEach(item => {
      if (item.href && item.href !== "#") items.push(item);
      if (item.children) {
        items.push(...item.children.filter(c => c.href && c.href !== "#"));
      }
    });
    return items;
  }, [navItems]);

  const results = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return searchableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    ).slice(0, 5); // max 5 results
  }, [query, searchableItems]);

  const handleSelect = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  React.useEffect(() => {
    if (open) {
      setQuery("");
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [open]);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-start justify-center pt-24",
        "bg-primary-900/60 backdrop-blur-sm",
        "transition-opacity duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-2xl mx-4",
          "bg-surface rounded-xl shadow-lg border border-border p-2",
          "transition-all duration-300",
          open ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-2">
          <SearchComponent
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
            placeholder="Buscar componentes, páginas, trámites..."
            size="default"
            className="border-none shadow-none bg-transparent focus-within:ring-0 px-2"
          />
        </div>

        {/* Resultados */}
        {query.trim().length > 0 ? (
          <div className="border-t border-border px-2 py-2">
            {results.length > 0 ? (
              <div className="flex flex-col gap-1">
                {results.map((item) => (
                  <Badge
                    key={item.href}
                    appearance="soft"
                    tone="primary"
                    onClick={() => handleSelect(item.href)}
                    className="flex items-center !justify-start gap-3 px-4 py-3 h-auto text-left w-full cursor-pointer hover:bg-primary/20 transition-colors"
                  >
                    <item.icon className="size-4 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-body-sm font-semibold truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-[10px] opacity-80 truncate font-normal normal-case tracking-normal">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-muted-foreground text-body-sm">
                No se encontraron resultados para &quot;{query}&quot;
              </div>
            )}
          </div>
        ) : (
          <div className="border-t border-border px-4 py-3">
            <p className="text-caption text-muted-foreground font-medium mb-2">
              Búsquedas sugeridas
            </p>
            <div className="flex flex-wrap gap-2">
              {searchableItems.slice(0, 4).map((item) => (
                <Badge
                  key={item.label}
                  appearance="outline"
                  tone="secondary"
                  onClick={() => setQuery(item.label)}
                  className="px-3 cursor-pointer hover:bg-secondary/10 transition-colors"
                >
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Componente principal: GeoportalHeader
   ───────────────────────────────────────────── */

export function GeoportalHeader({
  customNavItems,
  customConfig,
  hideUserActions,
  variant = "full",
  extraActions,
  isStatic = false,
  className,
  innerClassName,
  leftSlot,
  userProps,
  onRoleChange,
  showAccentBar = false,
}: {
  customNavItems?: NavItem[];
  customConfig?: Partial<HeaderConfig>;
  hideUserActions?: boolean;
  variant?: "full" | "navigation" | "user-actions";
  extraActions?: React.ReactNode;
  isStatic?: boolean;
  className?: string;
  innerClassName?: string;
  leftSlot?: React.ReactNode;
  userProps?: any;
  onRoleChange?: (role: any) => void;
  showAccentBar?: boolean;
}) {
  const pathname = usePathname();
  const [displayNavItems, setDisplayNavItems] = React.useState(customNavItems || defaultNavItems);
  const [headerConfig, setHeaderConfig] = React.useState<HeaderConfig>(
    customConfig ? { ...defaultHeaderConfig, ...customConfig } : defaultHeaderConfig
  );
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    if (customNavItems) {
      setDisplayNavItems(customNavItems);
    }
  }, [customNavItems]);

  React.useEffect(() => {
    if (customConfig) {
      setHeaderConfig((prev) => ({ ...prev, ...customConfig }));
    }
  }, [customConfig]);

  const showNav = variant === "full" || variant === "navigation";
  const showUser = (variant === "full" || variant === "user-actions") && !hideUserActions;

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Escuchar mensajes para actualización en vivo desde el showcase
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'UPDATE_NAV' && e.data.payload) {
        const restoreIcons = (incoming: any[], defaults: any[]): any[] => {
          return incoming.map((item, index) => {
            const defaultItem = defaults.find(d => d.href === item.href) || defaults[index];
            return {
              ...item,
              icon: defaultItem?.icon,
              children: item.children ? restoreIcons(item.children, defaultItem?.children || []) : undefined
            };
          });
        };
        setDisplayNavItems(restoreIcons(e.data.payload, defaultNavItems));
      }
      if (e.data?.type === 'UPDATE_HEADER_CONFIG' && e.data.payload) {
        setHeaderConfig(e.data.payload);
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("?")) return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      {!isStatic && (
        <div className="h-[98px] lg:h-[106px] w-full shrink-0" aria-hidden="true" />
      )}
      <header
        id={isStatic ? undefined : "geoportal-header"}
        className={cn(
          isStatic
            ? "relative w-full flex flex-col"
            : "fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-7xl flex flex-col transition-all duration-300",
          !isStatic && (scrolled ? "top-2" : "top-3 sm:top-4"),
          className
        )}
      >
        <div className={cn("w-full bg-surface/90 backdrop-blur-md rounded-xl shadow-lg border border-border", innerClassName)}>
          {showAccentBar && (
            <div className="bg-primary w-full h-1.5 shrink-0 rounded-t-xl" />
          )}
          <div className="w-full px-3 sm:px-6">
            <div className={cn("relative flex items-center justify-between", variant === "user-actions" ? "h-16" : "h-14 sm:h-16")}>
              {/* ── Logo oficial de la marca ── */}
              {leftSlot ? (
                <div className="flex items-center min-w-0 flex-1">
                  {leftSlot}
                </div>
              ) : (
                <Link
                  href="/"
                  className={cn(
                    "flex items-center shrink-0 group",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-md"
                  )}
                >
                  {headerConfig.showLogo && (
                  <>
                    <img
                      src={getAssetPath(headerConfig.logoUrlLight || "/logo-horizontal.svg")}
                      alt="Logo DINARP"
                      className="h-8 sm:h-10 w-auto object-contain dark:hidden"
                    />
                    <img
                      src={getAssetPath(headerConfig.logoUrlDark || "/logo-horizontal-blanco.svg")}
                      alt="Logo DINARP"
                      className="h-8 sm:h-10 w-auto object-contain hidden dark:block"
                    />
                  </>
                )}
                </Link>
              )}

              {/* ── Navegación desktop ── */}
              {showNav && (
                <nav
                  className="hidden lg:flex flex-1 justify-center items-center gap-0.5 mx-4"
                  aria-label="Navegación principal"
                >
                  {displayNavItems.map((item) =>
                    item.children ? (
                      <DropdownNav
                        key={item.href}
                        item={item}
                        isActive={isActive(item.href) || item.children.some(c => isActive(c.href))}
                        isChildActive={isActive}
                      />
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-1.5 px-3.5 py-1.5 text-body-sm font-semibold whitespace-nowrap",
                          "transition-all duration-200 outline-none rounded-full cursor-pointer",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          isActive(item.href)
                            ? "text-primary-500 dark:text-primary-400 font-bold bg-primary-500/10 shadow-xs border border-primary-500/20"
                            : "text-foreground hover:text-primary-300 dark:hover:text-primary-300 hover:bg-primary-300/10"
                        )}
                      >
                        <span>{item.label}</span>
                        {isActive(item.href) && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary-500 rounded-full shadow-[0_0_6px_rgba(var(--primary-rgb),0.6)]" />
                        )}
                      </Link>
                    )
                  )}
                </nav>
              )}

              {/* ── Acciones desktop (buscar + notificaciones + perfil + theme) ── */}
              <div className="hidden lg:flex items-center gap-1">
                {extraActions && <div className="mr-1 flex items-center">{extraActions}</div>}
                {variant !== "user-actions" && headerConfig.showThemeToggle && <ThemeToggle />}

                {/* Buscar */}
                {showNav && headerConfig.showSearch && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Buscar"
                  >
                    <Search className="size-5" />
                  </Button>
                )}

                {/* Separador */}
                {showUser && (headerConfig.showNotifications || headerConfig.showUserMenu) && <div className="w-px h-6 bg-border mx-2" aria-hidden="true" />}

                {/* Notificaciones */}
                {showUser && headerConfig.showNotifications && <NotificationsMenu isEmpty={false} />}

                {/* Separador */}
                {showUser && headerConfig.showNotifications && headerConfig.showUserMenu && <div className="w-px h-6 bg-border mx-2" aria-hidden="true" />}

                {/* User menu */}
                {showUser && headerConfig.showUserMenu && <UserMenu user={userProps} onRoleChange={onRoleChange} />}
              </div>

              {/* ── Mobile: toggle + burger ── */}
              <div className="flex lg:hidden items-center gap-1">
                {extraActions && <div className="mr-1 flex items-center">{extraActions}</div>}
                {variant !== "user-actions" && headerConfig.showThemeToggle && <ThemeToggle />}

                {variant === "user-actions" ? (
                  <>
                    {showUser && headerConfig.showNotifications && <NotificationsMenu isEmpty={false} />}
                    {showUser && headerConfig.showUserMenu && <UserMenu user={userProps} onRoleChange={onRoleChange} />}
                  </>
                ) : (
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Menú"
                      >
                        <Menu className="size-6" strokeWidth={1.75} />
                      </Button>
                    </SheetTrigger>

                    <SheetContent
                      side="top"
                      showCloseButton={false}
                      className="h-[100dvh] max-h-[100dvh] w-full border-none bg-background p-0 flex flex-col"
                    >
                      {/* ── Barra superior del Sheet (replica el header) ── */}
                      <SheetHeader className="p-0 shrink-0">
                        {/* Barra blanca con logo + close */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                          <div className="flex items-center gap-3">
                            {headerConfig.showLogo && (
                              <>
                                <img
                                  src={getAssetPath(headerConfig.logoUrlLight || "/logo-horizontal.svg")}
                                  alt="Logo DINARP GEOportal"
                                  className="h-9 w-auto object-contain dark:hidden"
                                />
                                <img
                                  src={getAssetPath(headerConfig.logoUrlDark || "/logo-horizontal-blanco.svg")}
                                  alt="Logo DINARP GEOportal"
                                  className="h-9 w-auto object-contain hidden dark:block"
                                />
                              </>
                            )}
                            {headerConfig.title && (
                              <span className="font-bold text-lg text-foreground ml-2">
                                {headerConfig.title}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSheetOpen(false)}
                            aria-label="Cerrar menú"
                          >
                            <X className="size-6" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </SheetHeader>

                      {/* ── Links de navegación (estilo referencia) ── */}
                      <div className="flex-1 overflow-y-auto">
                        <nav className="flex flex-col py-2">
                          {displayNavItems.map((item) => (
                            <MobileNavItem
                              key={item.href}
                              item={item}
                              isActive={isActive(item.href)}
                              onNavigate={() => setSheetOpen(false)}
                            />
                          ))}
                        </nav>
                      </div>

                      {/* ── Barra inferior: Buscar | Notificaciones | UserMenu ── */}
                      <div className="shrink-0 border-t border-border px-4 py-3 bg-surface">
                        <div className="flex items-center justify-between">
                          {/* Buscar */}
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSheetOpen(false);
                              setTimeout(() => setSearchOpen(true), 200);
                            }}
                            className="flex items-center !justify-start gap-2 text-primary font-semibold text-body-sm"
                          >
                            <Search className="size-5" />
                            <span>Buscar</span>
                          </Button>

                          {/* Separador */}
                          {showUser && (headerConfig.showNotifications || headerConfig.showUserMenu) && <div className="w-px h-8 bg-border" aria-hidden="true" />}

                          {/* Notificaciones */}
                          {showUser && headerConfig.showNotifications && <NotificationsMenu isEmpty={false} />}

                          {/* Separador */}
                          {showUser && headerConfig.showNotifications && headerConfig.showUserMenu && <div className="w-px h-8 bg-border" aria-hidden="true" />}

                          {/* User menu */}
                          {showUser && headerConfig.showUserMenu && <UserMenu />}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
              </div>
            </div>
          </div>
        </div>
      </header >

      {/* ── Search overlay ── */}
      < SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)
      } navItems={displayNavItems} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Componente: MobileNavItem
   ───────────────────────────────────────────── */

function MobileNavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center justify-between w-full px-5 py-4 h-auto outline-none cursor-pointer",
            "transition-colors duration-150",
            isActive ? "bg-primary-500/10 border-l-4 border-primary-500 text-primary-500" : "hover:bg-primary-300/10 text-foreground"
          )}
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-3.5">
            <item.icon
              className={cn(
                "size-5 shrink-0 transition-colors",
                isActive ? "text-primary-500" : "text-muted-foreground group-hover:text-primary-300"
              )}
              strokeWidth={1.75}
            />
            <span
              className={cn(
                "text-body font-semibold transition-colors",
                isActive ? "text-primary-500 font-bold" : "text-foreground hover:text-primary-300"
              )}
            >
              {item.label}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "size-4.5 transition-transform duration-200",
              isActive ? "text-primary-500" : "text-muted-foreground",
              expanded && "rotate-180"
            )}
            strokeWidth={2}
          />
        </button>

        {/* Sub-items */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            expanded ? "max-h-[500px]" : "max-h-0"
          )}
        >
          <div className="pb-3 px-3 flex flex-col gap-1">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={() => onNavigate()}
                className={cn(
                  "group flex items-start gap-3 px-3 py-2.5 rounded-xl",
                  "transition-colors duration-150",
                  "hover:bg-primary-300/10"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-lg shrink-0 mt-0.5",
                    "bg-muted text-muted-foreground group-hover:bg-primary-300/20 group-hover:text-primary-300 transition-colors"
                  )}
                >
                  <child.icon className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-body-sm font-semibold text-foreground group-hover:text-primary-300 transition-colors">
                    {child.label}
                  </span>
                  {child.description && (
                    <span className="text-caption text-muted-foreground leading-snug group-hover:text-primary-300/80 transition-colors">
                      {child.description}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={() => onNavigate()}
      className={cn(
        "flex items-center justify-between px-5 py-4",
        "transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring focus-visible:outline-none",
        isActive ? "bg-primary-500/10 border-l-4 border-primary-500 text-primary-500" : "hover:bg-primary-300/10 text-foreground hover:text-primary-300"
      )}
    >
      <div className="flex items-center gap-3.5">
        <item.icon
          className={cn(
            "size-5 shrink-0 transition-colors",
            isActive ? "text-primary-500" : "text-muted-foreground"
          )}
          strokeWidth={1.75}
        />
        <span
          className={cn(
            "text-body font-semibold transition-colors",
            isActive ? "text-primary-500 font-bold" : "text-foreground hover:text-primary-300"
          )}
        >
          {item.label}
        </span>
      </div>
      <ChevronRight
        className={cn(
          "size-4.5 transition-colors",
          isActive ? "text-primary-500" : "text-muted-foreground"
        )}
        strokeWidth={2}
      />
    </Link>
  );
}

