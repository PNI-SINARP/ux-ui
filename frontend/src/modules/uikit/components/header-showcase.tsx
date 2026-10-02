"use client";

import React from "react";
import { SubSection } from './sub-section';
import { cn } from "@/lib/utils";
import { Monitor, Tablet, Smartphone, GripVertical, Layers, Menu, User, Settings2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeoportalHeader, defaultNavItems, NavItem, defaultHeaderConfig } from "@/components/layout/geoportal-header";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Slider } from "@/components/ui/slider";

const PRESETS = [
  { label: "Desktop", icon: Monitor, width: 1280 },
  { label: "Tablet", icon: Tablet, width: 768 },
  { label: "Móvil", icon: Smartphone, width: 375 },
] as const;

/**
 * Showcase del GeoportalHeader con viewport slider interactivo
 * para previsualizar el comportamiento responsive.
 */
export function HeaderShowcase() {
  const [theme, setTheme] = React.useState("light");

  React.useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          setTheme(document.documentElement.getAttribute("data-theme") || "light");
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = React.useState(1280);
  const [maxWidth, setMaxWidth] = React.useState(1280);
  const [isDragging, setIsDragging] = React.useState(false);
  const [headerVariant, setHeaderVariant] = React.useState<"full" | "navigation" | "user-actions">("user-actions");

  const [navItemsState, setNavItemsState] = React.useState<NavItem[]>(defaultNavItems);
  const [hiddenItems, setHiddenItems] = React.useState<number[]>([]);
  const [headerConfig, setHeaderConfig] = React.useState(defaultHeaderConfig);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [draftHeaderConfig, setDraftHeaderConfig] = React.useState(defaultHeaderConfig);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const handleSave = () => {
    setHeaderConfig(draftHeaderConfig);
    setIsModalOpen(false);
    toast.success("Configuración del header guardada correctamente");
  };

  const handleOpen = () => {
    setDraftHeaderConfig(headerConfig);
    setIsModalOpen(true);
  };

  const safePayload = React.useMemo(() => {
    return navItemsState
      .filter((_, i) => !hiddenItems.includes(i))
      .map(({ icon, children, ...rest }) => ({
        ...rest,
        children: children?.map(({ icon: childIcon, ...childRest }) => childRest)
      }));
  }, [navItemsState, hiddenItems]);

  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_NAV', payload: safePayload }, '*');
    }
  }, [safePayload]);

  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_HEADER_CONFIG', payload: headerConfig }, '*');
    }
  }, [headerConfig]);

  // Detectar ancho máximo disponible
  React.useEffect(() => {
    const updateMax = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setMaxWidth(w);
        setViewportWidth((prev) => Math.min(prev, w));
      }
    };
    updateMax();
    window.addEventListener("resize", updateMax);
    return () => window.removeEventListener("resize", updateMax);
  }, []);

  // Drag para resize manual
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startWidth = viewportWidth;

      const handleMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        const newWidth = Math.min(maxWidth, Math.max(320, startWidth + delta * 2));
        setViewportWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [viewportWidth, maxWidth]
  );

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="pt-2"></div>

      {/* ── Toolbar: presets + variant + slider ── */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-2xl border border-border bg-surface/50">
        <div className="flex flex-wrap items-center gap-6">
          {/* Device presets */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground">Vista Dispositivo</span>
            <Tabs
              value={
                Math.abs(viewportWidth - 1280) < 20 || (1280 > maxWidth && viewportWidth === maxWidth)
                  ? "Desktop"
                  : Math.abs(viewportWidth - 768) < 20 || (768 > maxWidth && viewportWidth === maxWidth)
                    ? "Tablet"
                    : "Móvil"
              }
              onValueChange={(val) => {
                const preset = PRESETS.find((p) => p.label === val);
                if (preset) {
                  setViewportWidth(Math.min(preset.width, maxWidth));
                }
              }}
              className="w-auto"
            >
              <TabsList className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border h-auto">
                {PRESETS.map((preset) => (
                  <TabsTrigger
                    key={preset.label}
                    value={preset.label}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200 border-0 shadow-none cursor-pointer text-muted-foreground hover:text-foreground hover:bg-transparent bg-transparent",
                      "after:hidden data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-0 data-[state=active]:hover:bg-surface"
                    )}
                  >
                    <preset.icon className="size-3.5 text-secondary shrink-0" />
                    <span>{preset.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Variant Selector */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground">Variante Header</span>
            <Tabs
              value={headerVariant}
              onValueChange={(val) => setHeaderVariant(val as "full" | "navigation" | "user-actions")}
              className="w-auto"
            >
              <TabsList className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border h-auto">
                {[
                  { value: "user-actions", label: "Usuario", icon: User },
                ].map((item) => (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-caption font-semibold transition-all duration-200 border-0 shadow-none cursor-pointer text-muted-foreground hover:text-foreground hover:bg-transparent bg-transparent",
                      "after:hidden data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-0 data-[state=active]:hover:bg-surface"
                    )}
                  >
                    <item.icon className="size-3.5 text-secondary shrink-0" />
                    <span>{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Range slider */}
        <div className="flex flex-col gap-1.5 min-w-[200px] text-left">
          <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground">Ancho Viewport</span>
          <div className="flex items-center gap-3">
            <Slider
              min={320}
              max={maxWidth}
              value={[viewportWidth]}
              onValueChange={(vals) => setViewportWidth(vals[0])}
              className="flex-1 w-[150px]"
            />
            <span className="text-caption font-mono font-bold text-muted-foreground tabular-nums min-w-[52px] text-right">
              {Math.round(viewportWidth)}px
            </span>
          </div>
        </div>
      </div>

      {/* ── Preview container con resize ── */}
      <div className="flex justify-center">
        <div
          className={cn(
            "relative border border-border rounded-xl overflow-hidden shadow-sm bg-background",
            "transition-[width] duration-150",
            isDragging && "transition-none"
          )}
          style={{ width: `${viewportWidth}px`, maxWidth: "100%" }}
        >
          {/* Header renderizado directamente como componente vivo en la sección de demostración */}
          <div className="w-full bg-muted/20 p-4 md:p-6 min-h-[360px] flex flex-col">
            <GeoportalHeader
              variant={headerVariant}
              isStatic={true}
              customNavItems={navItemsState.filter((_, i) => !hiddenItems.includes(i))}
              customConfig={headerConfig}
            />
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center text-muted-foreground bg-surface rounded-xl border border-dashed border-border mt-4">
              <span className="text-sm font-semibold text-foreground">Vista interactiva de navegación</span>
              <span className="text-xs text-muted-foreground mt-1 font-mono">
                Ancho viewport: {Math.round(viewportWidth)}px · Variante activa: {headerVariant}
              </span>
            </div>
          </div>

          {/* ── Drag handle derecho ── */}
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-10",
              "flex items-center justify-center",
              "bg-transparent hover:bg-primary/5",
              "transition-colors duration-150",
              "group"
            )}
            aria-label="Arrastrar para cambiar ancho"
          >
            <div
              className={cn(
                "w-1 h-10 rounded-full",
                "bg-border group-hover:bg-primary/40",
                "transition-colors duration-150",
                isDragging && "bg-primary/60"
              )}
            />
          </div>
        </div>
      </div>

      {/* Verification Table */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface text-left">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h4 className="text-body font-bold text-foreground">Tabla de Verificación de Variantes</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-foreground">
            <thead>
              <tr className="border-b border-border bg-muted/10 font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3.5">Variante</th>
                <th className="px-6 py-3.5 text-center">Logo</th>
                <th className="px-6 py-3.5 text-center">Navegación</th>
                <th className="px-6 py-3.5 text-center">Notificaciones</th>
                <th className="px-6 py-3.5 text-center">User Menu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4 font-semibold text-primary">User Actions (Usuario)</td>
                <td className="px-6 py-4 text-center text-muted-foreground font-bold">No</td>
                <td className="px-6 py-4 text-center text-muted-foreground font-bold">No</td>
                <td className="px-6 py-4 text-center text-success font-bold">Sí</td>
                <td className="px-6 py-4 text-center text-success font-bold">Sí</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
