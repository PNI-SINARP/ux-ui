"use client";


import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
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
  ChevronDown,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  Settings,
  PanelLeft,
  Bell,
} from "lucide-react";
import { cn, getAssetPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Ã¢â€â‚¬Ã¢â€â‚¬ Mini Sidebar Preview Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

interface NavItemDef {
  label: string;
  icon: React.ElementType;
  active?: boolean;
  children?: { label: string; icon: React.ElementType; active?: boolean }[];
}

const NAV_ITEMS: NavItemDef[] = [
  { label: "Inicio", icon: Home, active: true },
  {
    label: "Trámites", icon: FileText,
    children: [
      { label: "Concesiones Mineras", icon: Shield },
      { label: "Permisos Ambientales", icon: FileText },
      { label: "Consulta de Estado", icon: BarChart3 },
    ],
  },
  { label: "Instituciones", icon: Building2 },
  { label: "Geoportal", icon: Globe2 },
];

function SidebarNavItem({
  item,
  collapsed,
}: {
  item: NavItemDef;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(item.active ?? false);
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  if (collapsed && hasChildren) {
    return (
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                "group relative flex items-center transition-all duration-200 outline-none w-11 h-11 mx-auto justify-center rounded-xl",
                item.active
                  ? "bg-primary/10 dark:bg-primary text-primary dark:text-white font-semibold shadow-none before:content-[''] before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-primary dark:before:bg-primary before:rounded-r-full"
                  : "text-sidebar-foreground/75 dark:text-white/85 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white"
              )}
            >
              <Icon className={cn("size-5 shrink-0 transition-colors", item.active ? "text-primary dark:text-white" : "text-sidebar-foreground/70 dark:text-white/85 group-hover:text-primary dark:group-hover:text-white")} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={16} className="w-56 border-border shadow-md rounded-xl bg-popover p-2">
            <DropdownMenuLabel className="font-heading text-foreground font-semibold px-2">{item.label}</DropdownMenuLabel>
            <div className="mt-1 space-y-1">
              {item.children!.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <DropdownMenuItem key={child.label} asChild className={cn("flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg text-sm font-medium", child.active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}>
                    <button type="button" className="w-full justify-start text-left outline-none border-none ring-0">
                      <ChildIcon className="size-4 shrink-0" />
                      <span>{child.label}</span>
                    </button>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    );
  }

  return (
    <li>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => hasChildren && setOpen(!open)}
              className={cn(
                "group relative flex items-center transition-all duration-200 outline-none",
                collapsed ? "w-11 h-11 mx-auto justify-center rounded-xl" : "w-full gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-left",
                item.active
                  ? "bg-primary/10 dark:bg-primary text-primary dark:text-white font-semibold shadow-none before:content-[''] before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-primary dark:before:bg-primary before:rounded-r-full"
                  : "text-sidebar-foreground/75 dark:text-white/85 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn("size-5 shrink-0 transition-colors", item.active ? "text-primary dark:text-white" : "text-sidebar-foreground/70 dark:text-white/85 group-hover:text-primary dark:group-hover:text-white")} />
              </div>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {hasChildren && (
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 transition-all duration-200",
                        item.active ? "text-primary dark:text-white" : "text-muted-foreground dark:text-white/70 group-hover:text-primary dark:group-hover:text-white",
                        open && "rotate-90"
                      )}
                    />
                  )}
                </>
              )}
            </button>
          </TooltipTrigger>
          {collapsed && (
            <TooltipContent side="right" align="center" className="z-[100]">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {/* Sub-items */}
      {hasChildren && open && !collapsed && (
        <ul
          className={cn(
            "mt-1 space-y-0.5",
            "ml-6 border-l border-border pl-3"
          )}
        >
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            return (
              <li key={child.label} className="w-full">
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "group relative flex items-center rounded-xl transition-all duration-200 outline-none w-full gap-2.5 px-3.5 py-2 text-sm font-medium text-left",
                          child.active ? "bg-primary/10 dark:bg-primary text-primary dark:text-white font-medium shadow-none before:content-[''] before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-primary dark:before:bg-primary before:rounded-r-full" : "text-sidebar-foreground/75 dark:text-white/85 hover:text-primary dark:hover:text-white hover:bg-primary/5 dark:hover:bg-white/10"
                        )}
                      >
                        <ChildIcon className={cn("shrink-0 transition-colors size-4", child.active ? "text-primary dark:text-white" : "text-sidebar-foreground/70 dark:text-white/70 group-hover:text-primary dark:group-hover:text-white")} />
                        <span className="truncate">{child.label}</span>
                      </button>
                    </TooltipTrigger>
                  </Tooltip>
                </TooltipProvider>
              </li>
            );
          })}
        </ul>
      )}
    </li >
  );
}

const defaultSidebarConfig = {
  showBranding: true,
  showUser: false,
  showThemeToggle: true,
};

function SidebarPreview({ collapsed, variant = "full", navItems = NAV_ITEMS, config = defaultSidebarConfig }: { collapsed: boolean, variant?: "full" | "navigation", navItems?: NavItemDef[], config?: typeof defaultSidebarConfig }) {
  const showNav = true;
  const showUser = variant === "full" && config.showUser;
  const showBranding = variant === "full" && config.showBranding;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-sidebar-border text-sidebar-foreground shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 rounded-2xl overflow-hidden backdrop-blur-xl",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {showBranding ? (
        <>
          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Institutional header Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="bg-primary px-3 py-2 flex items-center justify-end shrink-0 min-h-[38px]">
            <button type="button" className="p-1 rounded-md text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors shrink-0">
              <PanelLeft className="size-4" />
            </button>
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Logo row Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className={cn("flex items-center gap-2.5 px-3 py-3 border-b border-sidebar-border dark:border-white/10 shrink-0", collapsed ? "justify-center" : "justify-start")}>
            {collapsed ? (
              <img
                src={getAssetPath("/escudo-light.svg")}
                alt="Escudo DINARP"
                className="h-8 w-auto object-contain mx-auto"
              />
            ) : (
              <>
                <img
                  src={getAssetPath("/logo-horizontal.svg")}
                  alt="Logo DINARP"
                  className="h-9 w-auto object-contain dark:hidden"
                />
                <img
                  src={getAssetPath("/logo-horizontal-blanco.svg")}
                  alt="Logo DINARP"
                  className="h-9 w-auto object-contain hidden dark:block"
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className={cn("flex items-center p-3 border-b border-border min-h-[48px] shrink-0", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <span className="text-body-sm font-bold text-sidebar-foreground ml-1">
              Menú de navegación
            </span>
          )}
          <button type="button" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0">
            <PanelLeft className="size-4" />
          </button>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Nav Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {showNav && (
          <>
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 dark:text-white/50 px-2 mb-2">
                Principal
              </p>
            )}
            <ul className="space-y-0.5">
              {navItems.map((item) => (
                <SidebarNavItem key={item.label} item={item} collapsed={collapsed} />
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Footer Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="shrink-0 border-t border-sidebar-border dark:border-white/10 px-2 py-2 space-y-1">
        {/* Secondary Actions */}
        <ul className="space-y-0.5 mb-2">
          <li>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className={cn("group relative flex items-center transition-all duration-150 outline-none", collapsed ? "w-10 h-10 mx-auto justify-center rounded-md text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white" : "w-full gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-left text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white")}>
                    <Settings className="size-4 shrink-0 transition-colors" />
                    {!collapsed && <span className="flex-1 truncate">Configuración</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Configuración</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </li>
          <li>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className={cn("group relative flex items-center transition-all duration-150 outline-none", collapsed ? "w-10 h-10 mx-auto justify-center rounded-md text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white" : "w-full gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-left text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white")}>
                    <HelpCircle className="size-4 shrink-0 transition-colors" />
                    {!collapsed && <span className="flex-1 truncate">Ayuda / Soporte</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">Ayuda / Soporte</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </li>
          <li>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className={cn("group relative flex items-center transition-all duration-150 outline-none", collapsed ? "w-10 h-10 mx-auto justify-center rounded-md text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white" : "w-full gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-left text-sidebar-foreground/75 dark:text-white/75 hover:bg-primary/5 dark:hover:bg-white/10 hover:text-primary dark:hover:text-white")}>
                    <PanelLeft className="size-4 shrink-0 transition-colors" />
                    {!collapsed && <span className="flex-1 truncate">{collapsed ? "Expandir" : "Contraer"} sidebar</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{collapsed ? "Expandir" : "Contraer"} sidebar</TooltipContent>}
              </Tooltip>
            </TooltipProvider>
          </li>
        </ul>
        
        <div className="border-t border-border/50 my-2" />

        {/* Theme toggle */}
        {config.showThemeToggle && (
          collapsed ? (
            <div className="flex justify-center mb-2 w-full">
              <ThemeToggle />
            </div>
          ) : (
            <div className="px-3 py-2 mb-2">
              <button
                type="button"
                className={cn(
                  "relative flex w-full items-center p-1 rounded-full border border-transparent",
                  "bg-muted/70 dark:bg-white/10 border-sidebar-border/50 dark:border-white/15 transition-colors duration-300"
                )}
                aria-label="Alternar tema"
              >
                <div
                  className={cn(
                    "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                    "bg-white translate-x-0 dark:translate-x-full"
                  )}
                />
                <div
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-2 py-1.5 text-xs font-bold transition-colors duration-300",
                    "text-primary dark:text-white/85 dark:hover:text-white"
                  )}
                >
                  <Sun className="size-4" />
                  Claro
                </div>
                <div
                  className={cn(
                    "relative z-10 flex flex-1 items-center justify-center gap-2 py-1.5 text-xs font-bold transition-colors duration-300",
                    "text-muted-foreground hover:text-foreground dark:text-black font-bold"
                  )}
                >
                  <Moon className="size-4" />
                  Oscuro
                </div>
              </button>
            </div>
          )
        )}
              </div>
    </div>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Showcase Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function SidebarShowcase() {
  const [collapsed, setCollapsed] = useState(false);
  const [variant, setVariant] = useState<"full" | "navigation">("full");
  const [navItemsState, setNavItemsState] = useState<NavItemDef[]>(NAV_ITEMS);
  const [hiddenItems, setHiddenItems] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState("foundations");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [draftSidebarConfig, setDraftSidebarConfig] = useState(defaultSidebarConfig);
  const [sidebarConfig, setSidebarConfig] = useState(defaultSidebarConfig);

  const handleSave = () => {
    setSidebarConfig(draftSidebarConfig);
    setIsModalOpen(false);
    toast.success("Configuración del sidebar guardada correctamente");
  };

  const handleOpen = () => {
    setDraftSidebarConfig(sidebarConfig);
    setIsModalOpen(true);
  };

  const currentNavItems = navItemsState.filter((_, i) => !hiddenItems.includes(i));

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Expanded Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Expandido
            </h3>
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-primary hover:underline font-medium"
            >
              {collapsed ? "Expandir" : "Colapsar"} Ã¢â€ â€™
            </button>
          </div>
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-muted/20 p-4" style={{ height: 560 }}>
            <SidebarPreview collapsed={collapsed} variant={variant} navItems={currentNavItems} config={sidebarConfig} />
          </div>
        </div>

        {/* Ã¢â€â‚¬Ã¢â€â‚¬ Collapsed Ã¢â€â‚¬Ã¢â€â‚¬ */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Colapsado (solo iconos)
          </h3>
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-muted/20 p-4" style={{ height: 560 }}>
            <SidebarPreview collapsed={true} variant={variant} navItems={currentNavItems} config={sidebarConfig} />
          </div>
        </div>
      </div>
    </div>
  );
}




























