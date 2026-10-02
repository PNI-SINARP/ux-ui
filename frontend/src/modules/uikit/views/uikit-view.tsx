"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { UIKIT_SECTIONS } from "../components/uikit-sidebar";
import { GeoportalHeader, NavItem } from "@/components/layout/geoportal-header";
import { RadialButtonShowcase } from "../components/radial-button-showcase";
import { InputGroupShowcase } from "../components/input-group-showcase";
import { BadgeShowcase } from "../components/badge-showcase";
import { TextareaShowcase } from "../components/textarea-showcase";
import { ComboboxShowcase } from "../components/combobox-showcase";
import { SearchShowcase } from "../components/search-showcase";
import { CommandShowcase } from "../components/command-showcase";
import { CheckboxShowcase } from "../components/checkbox-showcase";
import { SwitchShowcase } from "../components/switch-showcase";
import { DialogShowcase } from "../components/dialog-showcase";
import { ToastShowcase } from "../components/toast-showcase";
import { TooltipShowcase } from "../components/tooltip-showcase";
import { BreadcrumbShowcase } from "../components/breadcrumb-showcase";
import { TabsShowcase } from "../components/tabs-showcase";
import { TableShowcase } from "../components/table-showcase";
import { CalendarShowcase } from "../components/calendar-showcase";
import { PaginationShowcase } from "../components/pagination-showcase";
import { AvatarShowcase } from "../components/avatar-showcase";
import { FolderShowcase } from "../components/folder-showcase";
import { CardShowcase } from "../components/card-showcase";
import { ToggleShowcase } from "../components/toggle-showcase";
import { NumberFieldShowcase } from "../components/number-field-showcase";
import { MultiselectShowcase } from "../components/multiselect-showcase";
import { RadioButtonShowcase } from "../components/radio-button-showcase";
import { ChatAssistantShowcase } from "../components/chat-assistant-showcase";
import { ChatIntranetShowcase } from "../components/chat-intranet-showcase";
import { StyleGuide } from "../components/style-guide";
import { Card, CardTitle, CardDescription, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import { LayoutTemplate } from "lucide-react";

import { NavigationShowcase } from "../components/navigation-showcase";
import { ActionsShowcase } from "../components/actions-showcase";
import { FormsFiltersShowcase } from "../components/forms-filters-showcase";
import { DataShowcase } from "../components/data-showcase";
import { TablesCategoryShowcase } from "../components/tables-category-showcase";
import { FeedbackStatesShowcase } from "../components/feedback-states-showcase";
import { ModalsOverlaysShowcase } from "../components/modals-overlays-showcase";
import { DataManagementShowcase } from "../components/data-management-showcase";
import { RiskAnalyticsShowcase } from "../components/risk-analytics-showcase";
import { ReportsExportShowcase } from "../components/reports-export-showcase";

import { SystemPagesShowcase } from "../components/system-pages-showcase";
import { LoginGeoportalShowcase } from "../components/login-geoportal-showcase";

/**
 * Maps section IDs to their showcase components.
 * Order determines render order in the content aaarea.
 */
const SECTION_COMPONENTS: Record<string, React.ComponentType<{ registerSection?: (id: string, el: HTMLElement | null) => void }>> = {
  foundations: StyleGuide,
  navigation: NavigationShowcase,
  actions: ActionsShowcase,
  forms: FormsFiltersShowcase,
  data: DataShowcase,
  "tables-category": TablesCategoryShowcase,
  "feedback-states": FeedbackStatesShowcase,
  "modals-overlays": ModalsOverlaysShowcase,
  "data-management-category": DataManagementShowcase,
  "reports-export-category": ReportsExportShowcase,

  "system-pages-category": SystemPagesShowcase,
  "login-geoportal": LoginGeoportalShowcase,
  "404-page": SystemPagesShowcase,
  "under-construction-page": SystemPagesShowcase,
  combobox: ComboboxShowcase,
  "number-field": NumberFieldShowcase,
  multiselect: MultiselectShowcase,
  "radio-button": RadioButtonShowcase,
  search: SearchShowcase,
  command: CommandShowcase,
  checkbox: CheckboxShowcase,
  switch: SwitchShowcase,
  table: TableShowcase,
  toggle: ToggleShowcase,
  badge: BadgeShowcase,
  "data-table": TableShowcase,
};

export const UIKitContext = React.createContext({ showOnlyEditable: false });

function UIKitContent() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "foundations";
  const [showOnlyEditable, setShowOnlyEditable] = React.useState(false);

  React.useEffect(() => {
    if (searchParams.get("login") === "success") {
      toast.success("Sesión iniciada correctamente", {
        description: "Has ingresado al sistema de diseño exitosamente.",
      });

      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  const customNavItems: NavItem[] = React.useMemo(() => {
    const foundations = UIKIT_SECTIONS.filter(s => s.group === "brand");
    const dataAndModules = UIKIT_SECTIONS.filter(s => (s.group === "data" || s.id.includes("category-classes")));
    const basics = UIKIT_SECTIONS.filter(s => ["navigation", "actions", "forms", "feedback", "overlay"].includes(s.group) && !dataAndModules.some(d => d.id === s.id));
    const useCases = UIKIT_SECTIONS.filter(s => s.group === "use-cases");

    return [
      {
        label: "Fundamentos",
        href: "?category=foundations",
        icon: foundations[0]?.icon,
      },
      {
        label: "Componentes Básicos",
        href: "#basics",
        icon: basics[0]?.icon,
        children: basics.map(s => ({
          label: s.label,
          href: `?category=${s.id}`,
          icon: s.icon,
        })),
      },
      {
        label: "Componentes Avanzados",
        href: "#advanced",
        icon: dataAndModules[0]?.icon,
        children: dataAndModules.map(s => ({
          label: s.label,
          href: `?category=${s.id}`,
          icon: s.icon,
        })),
      },
      {
        label: "Casos de Uso",
        href: "#use-cases",
        icon: useCases[0]?.icon,
        children: useCases.map(s => ({
          label: s.label,
          href: `?category=${s.id}`,
          icon: s.icon,
        })),
      }
    ];
  }, []);

  let activeSection = UIKIT_SECTIONS.find(s => s.id === activeCategory);
  if (!activeSection) {
    for (const section of UIKIT_SECTIONS) {
      const sub = section.subItems?.find(sub => sub.id === activeCategory);
      if (sub) {
        activeSection = { ...section, id: sub.id, label: sub.label, description: "" };
        break;
      }
    }
  }
  activeSection = activeSection || UIKIT_SECTIONS[0];
  const ShowcaseComponent = SECTION_COMPONENTS[activeCategory] || SECTION_COMPONENTS[activeSection.id];

  return (
    <div className="flex flex-col min-h-screen bg-background relative selection:bg-primary/20">
      <div className="relative z-10 flex flex-col min-h-screen">
        <GeoportalHeader customNavItems={customNavItems} hideUserActions={true} />

        {/* Scrollable content */}
        <div className="flex-1">
          <div className="w-full px-4 md:px-8 lg:px-12 py-6 lg:py-8 space-y-8">
            {/* Hero section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative py-8 px-6 md:py-10 md:px-8 border border-border/50 bg-card shadow-sm rounded-2xl mb-8 overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <div className="absolute -right-10 -top-10 opacity-[0.03] dark:opacity-10 pointer-events-none">
                <LayoutTemplate className="w-64 h-64 text-primary" />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                    <LayoutTemplate className="w-4 h-4" />
                    Kit de Diseño · DINARP
                  </div>
                  <h1 className="text-3xl md:text-5xl font-heading font-bold text-primary tracking-tight">
                    {activeSection.label}
                  </h1>
                  <p className="text-base md:text-lg max-w-[800px] text-foreground/80 leading-relaxed font-medium">
                    {activeSection.description || "Visualizando componentes correspondientes a la categoría seleccionada."}
                  </p>
                </div>
              </div>
            </div>


            {/* Render only the active section */}
            <div className="animate-in fade-in duration-500">
              <UIKitContext.Provider value={{ showOnlyEditable }}>
                {ShowcaseComponent ? <ShowcaseComponent /> : null}
              </UIKitContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UIKitView() {
  return (
    <TooltipProvider delayDuration={0}>
      <React.Suspense fallback={<div className="p-10 text-center font-heading text-lg">Cargando UIKit...</div>}>
        <UIKitContent />
      </React.Suspense>
    </TooltipProvider>
  );
}

