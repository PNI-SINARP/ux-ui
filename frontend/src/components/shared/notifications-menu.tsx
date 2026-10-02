"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Server,
  Database,
  Clock,
  ChevronRight,
  ChevronLeft,
  BellOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type NotificationTone = "warning" | "success" | "info" | "primary" | "secondary" | "neutral";

interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  icon: React.ElementType;
  tone: NotificationTone;
  unread: boolean;
  href: string;
}

const INSTITUTIONAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: "Proyecto observado por DINARP",
    desc: "PRJ-2026-001 requiere justificación adicional para campos solicitados al Registro Civil.",
    time: "hace 10 min",
    icon: AlertCircle,
    tone: "warning",
    unread: true,
    href: "/wireframes/solicitudes/detalle?id=PRJ-2026-001",
  },
  {
    id: 2,
    title: "Servicio SRI autorizado",
    desc: "Se emitió resolución favorable para consulta de RUC en línea.",
    time: "hace 1 h",
    icon: CheckCircle2,
    tone: "success",
    unread: true,
    href: "/wireframes/solicitudes/detalle",
  },
  {
    id: 3,
    title: "Actualización de catálogo de fuentes",
    desc: "ANT publicó nuevo servicio de consulta de citaciones e infracciones v2.",
    time: "hace 3 h",
    icon: Server,
    tone: "info",
    unread: true,
    href: "/wireframes/catalogo-fuentes",
  },
  {
    id: 4,
    title: "Lote de intercambio masivo procesado",
    desc: "BATCH-2026-001 completó la validación de 1,200 registros de identidad.",
    time: "ayer",
    icon: Database,
    tone: "primary",
    unread: false,
    href: "/wireframes/intercambios-masivos",
  },
  {
    id: 5,
    title: "Mantenimiento programado de plataforma",
    desc: "Ventana técnica institucional programada el sábado de 02:00 a 04:00.",
    time: "hace 2 días",
    icon: Clock,
    tone: "secondary",
    unread: false,
    href: "/wireframes/construccion",
  },
];

const getItemStyles = (tone: NotificationTone, unread: boolean) => {
  if (!unread) {
    return {
      iconBg: "bg-muted text-muted-foreground border border-border/60",
      unreadBorder: "border-l-4 border-l-transparent",
      rowBg: "hover:bg-muted/30",
      timeColor: "text-muted-foreground",
    };
  }

  switch (tone) {
    case "warning":
      return {
        iconBg: "bg-warning/15 text-warning border border-warning/30",
        unreadBorder: "border-l-4 border-l-warning",
        rowBg: "bg-warning/5 hover:bg-warning/10",
        timeColor: "text-warning font-semibold",
      };
    case "success":
      return {
        iconBg: "bg-success/15 text-success border border-success/30",
        unreadBorder: "border-l-4 border-l-success",
        rowBg: "bg-success/5 hover:bg-success/10",
        timeColor: "text-success font-semibold",
      };
    case "info":
      return {
        iconBg: "bg-info/15 text-info border border-info/30",
        unreadBorder: "border-l-4 border-l-info",
        rowBg: "bg-info/5 hover:bg-info/10",
        timeColor: "text-info font-semibold",
      };
    case "secondary":
      return {
        iconBg: "bg-secondary/15 text-secondary border border-secondary/30",
        unreadBorder: "border-l-4 border-l-secondary",
        rowBg: "bg-secondary/5 hover:bg-secondary/10",
        timeColor: "text-secondary font-semibold",
      };
    default:
      return {
        iconBg: "bg-primary/15 text-primary border border-primary/30",
        unreadBorder: "border-l-4 border-l-primary",
        rowBg: "bg-primary/5 hover:bg-primary/10",
        timeColor: "text-primary font-semibold",
      };
  }
};

export function NotificationsMenu({ isEmpty = false }: { isEmpty?: boolean }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(INSTITUTIONAL_NOTIFICATIONS);

  const unreadCount = isEmpty ? 0 : notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const TriggerButton = (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground data-[state=open]:bg-muted/50"
      aria-label={`Notificaciones (${unreadCount} sin leer)`}
    >
      <Bell className="size-4 sm:size-5" strokeWidth={1.75} />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-xs">
          {unreadCount}
        </span>
      )}
    </Button>
  );

  // ── Vista Móvil (Full Screen Sheet) ──
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{TriggerButton}</div>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="h-[100dvh] w-full p-0 border-none bg-background flex flex-col focus-visible:outline-none focus:outline-none rounded-none"
        >
          <SheetTitle className="sr-only">Notificaciones institucionales</SheetTitle>

          {/* Header Móvil */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0 bg-surface">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="-ml-2 rounded-full text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Volver"
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </Button>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <Badge appearance="solid" tone="primary" className="text-[10px] py-0 px-1.5 h-4 font-bold">
                  {unreadCount} NUEVAS
                </Badge>
              )}
            </div>
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-[11px] h-7 px-2 text-primary font-bold"
              >
                Leídas
              </Button>
            ) : (
              <div className="size-8" />
            )}
          </div>

          {/* Lista Móvil */}
          <div className="flex-1 overflow-y-auto">
            {unreadCount === 0 && isEmpty ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center h-full">
                <div className="size-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
                  <BellOff className="size-8 text-muted-foreground" />
                </div>
                <p className="text-base font-bold text-foreground mb-1">Bandeja al día</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  No hay notificaciones o avisos institucionales pendientes.
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border/40">
                {notifications.map((notif) => {
                  const Icon = notif.icon;
                  const styles = getItemStyles(notif.tone, notif.unread);
                  return (
                    <Link
                      key={notif.id}
                      href={notif.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-start gap-3.5 px-4 py-3.5 text-left transition-colors",
                        styles.rowBg,
                        styles.unreadBorder
                      )}
                    >
                      <div className={cn("size-8 rounded-full border flex items-center justify-center shrink-0 mt-0.5", styles.iconBg)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-xs text-foreground", notif.unread ? "font-bold" : "font-medium")}>
                            {notif.title}
                          </p>
                          <span className={cn("text-[10px] shrink-0", styles.timeColor)}>{notif.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Móvil */}
          <div className="shrink-0 p-3 border-t border-border/60 bg-muted/20">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="w-full text-xs font-semibold gap-1.5 border-border"
              asChild
            >
              <Link href="/wireframes/solicitudes">
                Ir a Proyectos de interoperabilidad
                <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ── Vista Desktop (UI Kit Tokens Semánticos) ──
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {TriggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={10}
        className={cn(
          "w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card p-0 shadow-lg overflow-hidden flex flex-col",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98]",
          "duration-150 ease-out"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge appearance="solid" tone="primary" className="text-[10px] font-bold py-0 px-1.5 h-4">
                {unreadCount} NUEVAS
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Marcar leídas
            </button>
          )}
        </div>

        {/* Body en lista con tokens semánticos del UI Kit */}
        <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-border/40">
          {unreadCount === 0 && isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="size-12 rounded-2xl bg-muted border border-border flex items-center justify-center mb-3">
                <BellOff className="size-6 text-muted-foreground" />
              </div>
              <p className="text-xs font-bold text-foreground mb-0.5">Bandeja al día</p>
              <p className="text-[11px] text-muted-foreground">No tienes notificaciones pendientes.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = notif.icon;
              const styles = getItemStyles(notif.tone, notif.unread);
              return (
                <DropdownMenuPrimitive.Item
                  key={notif.id}
                  asChild
                  className="outline-none"
                >
                  <Link
                    href={notif.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer",
                      styles.rowBg,
                      styles.unreadBorder
                    )}
                  >
                    <div className={cn("size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs", styles.iconBg)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <p className={cn("text-xs truncate", notif.unread ? "font-bold text-foreground" : "font-medium text-foreground/90")}>
                          {notif.title}
                        </p>
                        <span className={cn("text-[10px] shrink-0", styles.timeColor)}>{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.desc}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuPrimitive.Item>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 p-2 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="w-full text-xs font-semibold text-foreground hover:bg-muted/50 justify-between h-8 px-2"
            asChild
          >
            <Link href="/wireframes/solicitudes">
              <span>Ir a Proyectos de interoperabilidad</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
