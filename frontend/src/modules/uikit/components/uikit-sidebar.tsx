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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn, getAssetPath } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { applyTheme, getStoredTheme, type Theme } from "@/lib/theme";
import {
  MousePointerClick,
  TextCursorInput,
  AlignLeft,
  Tag,
  ListFilter,
  Search,
  Terminal,
  CheckSquare,
  ToggleLeft,
  Layers,
  Bell,
  LogOut,
  Layout,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Folder as FolderIcon,
  MoreHorizontal,
  Palette,
  Sun,
  Moon,
  ShieldAlert,
  Globe,
  Users,
  FileText
} from "lucide-react";

/** Section definition for UIKit navigation */
export interface UIKitSection {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  group: "brand" | "navigation" | "actions" | "forms" | "data" | "feedback" | "overlay" | "use-cases";
  subItems?: { id: string; label: string }[];
}

/** All UIKit sections organized by category */
export const UIKIT_SECTIONS: UIKitSection[] = [
  // Brand & Tokens
  {
    id: "foundations",
    label: "Fundamentos",
    description: "Bases visuales y funcionales del Design System UI reútilizable de DINARP. Aquí.",
    icon: Palette,
    group: "brand",
    subItems: [
      { id: "foundations-logos", label: "Logos y Marcas Oficiales" },
      { id: "foundations-colors", label: "Colores Semánticos" },
      { id: "foundations-scales", label: "Escalas Primitivas" },
      { id: "foundations-typography", label: "tipografía" },
      { id: "foundations-shadows", label: "Sombras" },
      { id: "foundations-radius", label: "Radios y Bordes" },
    ]
  },

  // Navigation
  {
    id: "navigation",
    label: "Navegación",
    description: "Componentes que ayudan al usuario a ubicarse, desplazarse entre módulos y acceder a las principales aaaaareas y funciones de la plataforma.",
    icon: Layout,
    group: "navigation",
    subItems: [
      { id: "header", label: "Header" },
      { id: "sidebar-nav", label: "Sidebar" },
      { id: "breadcrumb", label: "Breadcrumb" },
      { id: "tabs", label: "Tabs" },
      { id: "pagination", label: "Pagination" },
      { id: "stepper", label: "Stepper" },
      { id: "user-menu", label: "User Menu" },
      { id: "notifications-menu", label: "Notifications Menu" },
      { id: "avatar", label: "Avatar" },
    ]
  },

  // Actions
  {
    id: "actions",
    label: "Acciones",
    icon: MousePointerClick,
    group: "actions",
    subItems: [
      { id: "button", label: "Button" },
      { id: "link", label: "Link" },
    ]
  },

  // Formas and Filters
  {
    id: "forms",
    label: "Formularios y Filtros",
    description: "Componentes útilizados para ingresar, seleccionar, buscar y filtrar información dentro de formularios, consultas y procesos del sistema.",
    icon: TextCursorInput,
    group: "forms",
    subItems: [
      { id: "text-field", label: "Text Field" },
      { id: "textarea", label: "textarea" },
      { id: "search-field", label: "Search Field" },
      { id: "number-field", label: "Number Field" },
      { id: "combobox", label: "Combobox" },
      { id: "multiselect", label: "Multiselect" },
      { id: "checkbox", label: "Checkbox" },
      { id: "radio-button", label: "Radio Button" },
      { id: "switch", label: "Switch" },
      { id: "date-picker", label: "Date Picker" },
      { id: "date-range", label: "Date Range" },
      { id: "file-input", label: "File Input" },
      { id: "slider", label: "Slider" },
      { id: "range-slider", label: "Range Slider" },
      { id: "form-field-wrapper", label: "Form Field" },
      { id: "filter-bar", label: "Filter Bar & Applied Filters" },
    ]
  },

  // Data Display
  {
    id: "data",
    label: "Tarjetas y Visualización",
    icon: Layout,
    group: "data",
    subItems: [
      { id: "interactive-card", label: "Interactive Card" },
      { id: "capacity-card", label: "Capacity Card" },
      { id: "app-card", label: "App Card" },
      { id: "badge", label: "Badge" },
      { id: "chip", label: "Chip" },
      { id: "accordion", label: "Accordion" },
      { id: "divider", label: "Divider / Separator" },
      { id: "tree-view", label: "Tree View" },
      { id: "timeline", label: "Timeline" },
      { id: "status-indicator", label: "Status Indicator" },
      { id: "detail-list", label: "Detail List / Key Value" },
      { id: "record-header", label: "Record Header" },
    ]
  },

  // Secciones Principales de Módulos
  {
    id: "tables-category",
    label: "Tablas",
    icon: TableIcon,
    group: "data",
    subItems: [
      { id: "data-table", label: "Data Table & Selectable" },
      { id: "expandable-row", label: "Expandable Row & Actions" },
      { id: "column-selector", label: "Column Selector & Pagination" },
      { id: "mobile-card-row", label: "Mobile Card Row" },
    ]
  },
  {
    id: "feedback-states",
    label: "Retroalimentación y Estados",
    icon: Bell,
    group: "feedback",
    subItems: [
      { id: "loading-spinner-institucional", label: "Spinner de carga" },
      { id: "loading-states", label: "Skeleton & Progress Bar" },
      { id: "empty-states", label: "Empty & Error States" },
      { id: "alert", label: "Alert" },
      { id: "toast", label: "Toast" },
      { id: "tooltip", label: "Tooltip" },
    ]
  },
  {
    id: "modals-overlays",
    label: "Modales y Superposiciones",
    icon: Layers,
    group: "overlay",
    subItems: [
      { id: "modal-base", label: "Modal & Confirmation Dialog" },
      { id: "dialog", label: "Dialog" },
      { id: "drawer-sheet", label: "Drawer / Sheet" },
    ]
  },
  {
    id: "data-management-category",
    label: "Gestión de Datos y Carga (Data Management & Upload)",
    icon: Layout,
    group: "forms",
    subItems: [
      { id: "file-upload-widgets", label: "Dropzone & Upload Itemas" },
      { id: "folders", label: "Folders" },
    ]
  },
  {
    id: "system-pages-category",
    label: "Páginas del sistema",
    icon: Layout,
    group: "use-cases",
    subItems: [
      { id: "login-uikit", label: "Pantalla de Login UI Kit" },
      { id: "404-page", label: "Página 404 (Not Found)" },
      { id: "under-construction-page", label: "Página en construcción" }
    ]
  },

  // Módulos Especializados 11-15

  {
    id: "reports-export-category",
    label: "Reportes y Exportación (Reports and Export)",
    icon: FileText,
    group: "data",
    subItems: [
      { id: "export-button", label: "Export Button" },
      { id: "export-menu", label: "Export Menu" },
      { id: "report-preview", label: "Report Preview" },
      { id: "report-status", label: "Report Status" },
      { id: "download-list", label: "Download Item & List" },
    ]
  },
];

const GROUP_LABELS: Record<UIKitSection["group"], string> = {
  brand: "Fundamentos",
  navigation: "Navegación",
  actions: "Acciones",
  forms: "Formularios y Carga",
  data: "Datos y cartografía",
  feedback: "Retroalimentación",
  overlay: "Modales y Superposiciones",
  "use-cases": "Casos de Uso",
};

interface UIKitSidebarProps {
  activeSection: string | null;
  onNavigate: (sectionId: string) => void;
}

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function UIKitSidebar({ activeSection, onNavigate }: UIKitSidebarProps) {
  const { state, setOpenMobile } = useSidebar();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    const isWireframe = typeof window !== "undefined" && window.location.pathname.startsWith("/wireframes");
    router.push(isWireframe ? "/wireframes/login" : "/login");
  };

  // Local theme state
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
    applyTheme(initialTheme);

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

  const handleClick = (sectionId: string) => {
    onNavigate(sectionId);
    setOpenMobile(false);
  };

  // Group sections by category
  const groupedSections = React.useMemo(() => {
    const groups = new Map<UIKitSection["group"], UIKitSection[]>();
    for (const section of UIKIT_SECTIONS) {
      if (!groups.has(section.group)) {
        groups.set(section.group, []);
      }
      groups.get(section.group)!.push(section);
    }
    return groups;
  }, []);

  return (
    <Sidebar variant="floating" collapsible="icon">
      {/* â”€â”€ Header: Logo + Trigger toggle â”€â”€ */}
      <SidebarHeader className="relative px-3 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            {/* Expanded Logo - Light Mode */}
            <Image
              src={getAssetPath("/logo-horizontal.svg")}
              alt="Logo DINARP"
              width={167}
              height={35}
              className="h-[35px] w-auto group-data-[state=collapsed]:hidden animate-in fade-in duration-300 object-contain dark:hidden"
            />
            {/* Expanded Logo - Dark Mode */}
            <Image
              src={getAssetPath("/logo-horizontal-blanco.svg")}
              alt="Logo DINARP"
              width={167}
              height={35}
              className="h-[35px] w-auto group-data-[state=collapsed]:hidden animate-in fade-in duration-300 object-contain hidden dark:block"
            />

            {/* Collapsed Icon - Escudo Color */}
            <Image
              src={getAssetPath("/escudo-light.svg")}
              alt="Escudo DINARP"
              width={30}
              height={30}
              className="h-7 w-auto group-data-[state=expanded]:hidden animate-in zoom-in-75 duration-300 object-contain"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      {/* â”€â”€ Navigation â”€â”€ */}
      <SidebarContent>
        {Array.from(groupedSections.entries()).map(([group, sections]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel className="text-caption uppercase tracking-widest font-bold text-sidebar-foreground/90">
              {GROUP_LABELS[group]}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  if (state === "collapsed" && section.subItems) {
                    return (
                      <SidebarMenuItem key={section.id}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton isActive={isActive}>
                              <Icon className="shrink-0" />
                              <span className="font-bold">{section.label}</span>
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start" sideOffset={16} className="w-56 border-border shadow-lg rounded-xl bg-popover p-2">
                            <DropdownMenuLabel className="font-heading text-foreground font-semibold px-2">{section.label}</DropdownMenuLabel>
                            <div className="mt-1 space-y-1">
                              {section.subItems.map((sub) => {
                                const childActive = activeSection === sub.id;
                                return (
                                  <DropdownMenuItem key={sub.id} asChild className={cn("flex items-center gap-2 cursor-pointer py-2 px-3 rounded-lg text-sm font-medium transition-colors", childActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5")}>
                                    <button type="button" onClick={() => handleClick(sub.id)} className="w-full justify-start text-left outline-none border-none ring-0">
                                      <span>{sub.label}</span>
                                    </button>
                                  </DropdownMenuItem>
                                );
                              })}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    );
                  }

                  return (
                    <SidebarMenuItem key={section.id}>
                      <SidebarMenuButton
                        isActive={isActive && !section.subItems}
                        tooltip={{
                          children: (
                            <div className="flex flex-col gap-0.5 max-w-[200px]">
                              <span className="font-semibold">{section.label}</span>
                              {section.subItems && (
                                <span className="text-[10px] text-muted-foreground leading-tight">
                                  {section.subItems.map(sub => sub.label).join(" - ")}
                                </span>
                              )}
                            </div>
                          )
                        }}
                        onClick={() => handleClick(section.id)}
                      >
                        <Icon className="shrink-0" />
                        <span className="font-bold">{section.label}</span>
                      </SidebarMenuButton>

                      {section.subItems && (
                        <SidebarMenuSub>
                          {section.subItems.map((sub) => (
                            <SidebarMenuSubItem key={sub.id}>
                              <SidebarMenuSubButton
                                isActive={activeSection === sub.id}
                                onClick={() => handleClick(sub.id)}
                              >
                                <span>{sub.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* â”€â”€ Footer: User info + Theme toggle + Logout â”€â”€ */}
      <SidebarFooter className="px-3 py-3">
        <SidebarSeparator className="mb-3" />

        {/* Bottom controls: Theme toggle first */}
        <div className="flex flex-col gap-1 px-1 mb-3">
          {/* Expanded: full pill Light / Dark */}
          {mounted && (
            <>
              {/* Expanded pill */}
              <div className="group-data-[collapsible=icon]:hidden">
                <div className="flex items-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-0.5 gap-0.5">
                  <Button
                    onClick={() => handleTheme("light")}
                    variant="ghost"
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium transition-all duration-200 border-0 shadow-none h-auto",
                      theme === "light"
                        ? "bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar hover:text-sidebar-foreground"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                    )}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Claro</span>
                  </Button>
                  <Button
                    onClick={() => handleTheme("dark")}
                    variant="ghost"
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-caption font-medium transition-all duration-200 border-0 shadow-none h-auto",
                      theme === "dark"
                        ? "bg-sidebar text-sidebar-foreground shadow-sm hover:bg-sidebar hover:text-sidebar-foreground"
                        : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
                    )}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Oscuro</span>
                  </Button>
                </div>
              </div>

              {/* Collapsed: single icon button */}
              <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                <Button
                  onClick={() => handleTheme(theme === "light" ? "dark" : "light")}
                  aria-label="Toggle Theme"
                  variant="ghost"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-colors duration-200 p-0 shrink-0"
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

        {/* User section below */}
        <div className="flex items-center gap-3 px-1 group-data-[collapsible=icon]:justify-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-heading font-bold text-caption group-data-[collapsible=icon]:size-8 transition-all duration-200">
              PR
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-background group-data-[collapsible=icon]:size-2" />
          </div>

          {/* Name + Email + Logout (hidden when collapsed) */}
          <div className="flex flex-1 items-center justify-between gap-2 min-w-0 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex flex-col min-w-0">
              <span className="text-body-sm font-heading font-semibold text-sidebar-foreground truncate">
                Paula Rozo
              </span>
              <span className="text-caption text-sidebar-foreground/60 truncate">
                Paula.rozo@glocation.com.co
              </span>
            </div>
            <Button
              aria-label="Cerrar sesión"
              variant="ghost"
              onClick={handleLogout}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 hover:border-transparent transition-colors duration-200 border-0 p-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}




