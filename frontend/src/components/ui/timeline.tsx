import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  status?: "neutral" | "success" | "warning" | "danger" | "info" | "primary" | "error";
  statusLabel?: string; // Etiqueta semántica para mostrar en lugar del nombre del estado técnico
  icon?: React.ReactNode;
  user?: string;
  isCurrent?: boolean; // Para dar mayor énfasis visual al evento actual/activo
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = Boolean(item.isCurrent);
        const statusColor = getStatusColor(item.status, isCurrent);

        return (
          <div key={item.id} className={cn("relative flex gap-4 sm:gap-6", !isLast && "pb-8")}>
            {/* Left column: Icon & Connecting Line */}
            <div className="relative flex flex-col items-center shrink-0">
              <div
                className={cn(
                  "relative z-10 flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full border bg-surface transition-all",
                  statusColor.border,
                  statusColor.bg,
                  statusColor.text,
                  isCurrent && statusColor.currentRing
                )}
              >
                {/* Live pulse indicator dot for current event */}
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 flex size-3">
                    <span
                      className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        statusColor.currentDot
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex rounded-full size-3",
                        statusColor.currentDot
                      )}
                    />
                  </span>
                )}

                <div
                  className={cn(
                    "flex items-center justify-center size-[34px] sm:size-[38px] rounded-full transition-colors",
                    statusColor.innerBg
                  )}
                >
                  {item.icon ? (
                    <div className={cn("flex items-center justify-center [&>svg]:size-[18px]", statusColor.text)}>{item.icon}</div>
                  ) : (
                    <div className={cn("size-2 rounded-full", statusColor.iconFill)} />
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="absolute top-12 bottom-[-8px] left-1/2 w-[1.5px] -translate-x-1/2 bg-border/60 dark:bg-neutral-700" />
              )}
            </div>

            {/* Right column: Content */}
            <div
              className={cn(
                "flex flex-col gap-1.5 flex-1 transition-all rounded-xl",
                isCurrent ? statusColor.currentCard : "pt-1"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                <div className="flex flex-col gap-1 flex-1 max-w-2xl">
                  {item.title && (
                    <div className="flex items-center flex-wrap gap-2">
                      <h4
                        className={cn(
                          "font-heading font-bold text-foreground leading-snug",
                          isCurrent ? "text-sm sm:text-base text-foreground" : "text-sm text-foreground/90 font-semibold"
                        )}
                      >
                        {item.title}
                      </h4>
                      {isCurrent && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md border shadow-2xs",
                            statusColor.currentBadge
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full animate-pulse",
                              statusColor.currentBadgeDot
                            )}
                          />
                          Actual
                        </span>
                      )}
                    </div>
                  )}
                  {item.description && (
                    <p
                      className={cn(
                        "leading-relaxed",
                        isCurrent
                          ? "text-xs sm:text-sm text-foreground/90 dark:text-neutral-200 font-medium"
                          : "text-xs text-muted-foreground dark:text-neutral-300"
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0 mt-1 sm:mt-0 flex-wrap">
                  {item.status && (
                    <Badge
                      tone={item.status === "neutral" ? "primary" : item.status}
                      size="sm"
                      appearance="solid"
                      className={cn(
                        "px-2.5 py-0.5 text-[10px] h-auto uppercase tracking-wider font-bold !text-white shadow-2xs shrink-0",
                        !isCurrent && "opacity-95"
                      )}
                    >
                      {item.statusLabel || item.status}
                    </Badge>
                  )}
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap font-medium",
                      isCurrent ? "text-foreground font-semibold" : "text-muted-foreground dark:text-neutral-400"
                    )}
                  >
                    {item.date}
                  </span>
                </div>
              </div>

              {item.user && (
                <div className={cn("flex items-center gap-2", isCurrent ? "mt-3" : "mt-2.5")}>
                  <Avatar className="size-6 border border-border/60 dark:border-neutral-700">
                    <AvatarFallback className="bg-muted dark:bg-neutral-800 text-muted-foreground dark:text-neutral-300 text-[10px] font-bold uppercase tracking-wider">
                      {item.user.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isCurrent ? "text-foreground font-semibold" : "text-muted-foreground dark:text-neutral-300"
                    )}
                  >
                    {item.user}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getStatusColor(status?: TimelineItem["status"], isCurrent?: boolean) {
  if (isCurrent) {
    switch (status) {
      case "success":
        return {
          bg: "bg-success-500/15 border-success dark:border-success-400",
          innerBg: "bg-success/20 dark:bg-success-900/60",
          text: "text-success-800 dark:text-success-300",
          border: "border-success",
          iconFill: "bg-success",
          currentRing: "ring-4 ring-success/30 shadow-xs scale-105",
          currentDot: "bg-success",
          currentCard: "bg-success-50/50 dark:bg-neutral-900/90 border border-success/30 dark:border-success-500/40 p-4 sm:p-5 shadow-xs ring-1 ring-success/20 dark:ring-success-400/20",
          currentBadge: "bg-success-100 dark:bg-success-900/70 text-success-900 dark:text-success-200 border-success-300 dark:border-success-500/50",
          currentBadgeDot: "bg-success-600 dark:bg-success-400",
        };
      case "warning":
        return {
          bg: "bg-warning-500/15 border-warning dark:border-warning-400",
          innerBg: "bg-warning/20 dark:bg-warning-900/60",
          text: "text-warning-800 dark:text-warning-300",
          border: "border-warning",
          iconFill: "bg-warning",
          currentRing: "ring-4 ring-warning/30 shadow-xs scale-105",
          currentDot: "bg-warning",
          currentCard: "bg-warning-50/50 dark:bg-neutral-900/90 border border-warning/30 dark:border-warning-500/40 p-4 sm:p-5 shadow-xs ring-1 ring-warning/20 dark:ring-warning-400/20",
          currentBadge: "bg-warning-100 dark:bg-warning-900/70 text-warning-900 dark:text-warning-200 border-warning-300 dark:border-warning-500/50",
          currentBadgeDot: "bg-warning-600 dark:bg-warning-400",
        };
      case "danger":
      case "error":
        return {
          bg: "bg-danger-500/15 border-danger dark:border-danger-400",
          innerBg: "bg-danger/20 dark:bg-danger-900/60",
          text: "text-danger-800 dark:text-danger-300",
          border: "border-danger",
          iconFill: "bg-danger",
          currentRing: "ring-4 ring-danger/30 shadow-xs scale-105",
          currentDot: "bg-danger",
          currentCard: "bg-danger-50/50 dark:bg-neutral-900/90 border border-danger/30 dark:border-danger-500/40 p-4 sm:p-5 shadow-xs ring-1 ring-danger/20 dark:ring-danger-400/20",
          currentBadge: "bg-danger-100 dark:bg-danger-900/70 text-danger-900 dark:text-danger-200 border-danger-300 dark:border-danger-500/50",
          currentBadgeDot: "bg-danger-600 dark:bg-danger-400",
        };
      case "info":
        return {
          bg: "bg-info-500/15 border-info dark:border-info-400",
          innerBg: "bg-info/20 dark:bg-info-900/60",
          text: "text-info-800 dark:text-info-300",
          border: "border-info",
          iconFill: "bg-info",
          currentRing: "ring-4 ring-info/30 shadow-xs scale-105",
          currentDot: "bg-info",
          currentCard: "bg-info-50/50 dark:bg-neutral-900/90 border border-info/30 dark:border-info-500/40 p-4 sm:p-5 shadow-xs ring-1 ring-info/20 dark:ring-info-400/20",
          currentBadge: "bg-info-100 dark:bg-info-900/70 text-info-900 dark:text-info-200 border-info-300 dark:border-info-500/50",
          currentBadgeDot: "bg-info-600 dark:bg-info-400",
        };
      case "primary":
      default:
        return {
          bg: "bg-primary-500/15 border-primary dark:border-primary-400",
          innerBg: "bg-primary/20 dark:bg-primary-900/60",
          text: "text-primary dark:text-primary-300",
          border: "border-primary",
          iconFill: "bg-primary",
          currentRing: "ring-4 ring-primary/30 shadow-xs scale-105",
          currentDot: "bg-primary",
          currentCard: "bg-primary-50/60 dark:bg-neutral-900/90 border border-primary/30 dark:border-primary-500/40 p-4 sm:p-5 shadow-xs ring-1 ring-primary/20 dark:ring-primary-400/20",
          currentBadge: "bg-primary-100 dark:bg-primary-900/70 text-primary-800 dark:text-primary-200 border border-primary-300 dark:border-primary-500/50",
          currentBadgeDot: "bg-primary-600 dark:bg-primary-400",
        };
    }
  }

  // Eventos históricos: iconos nítidos y legibles en modo claro y oscuro
  switch (status) {
    case "success":
      return {
        bg: "bg-success-50/60 dark:bg-neutral-900 border-success/30 dark:border-success-500/40",
        innerBg: "bg-success-100/60 dark:bg-success-900/50",
        text: "text-success-700 dark:text-success-300",
        border: "border-success/30 dark:border-success-500/40",
        iconFill: "bg-success-600 dark:bg-success-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
    case "warning":
      return {
        bg: "bg-warning-50/60 dark:bg-neutral-900 border-warning/30 dark:border-warning-500/40",
        innerBg: "bg-warning-100/60 dark:bg-warning-900/50",
        text: "text-warning-700 dark:text-warning-300",
        border: "border-warning/30 dark:border-warning-500/40",
        iconFill: "bg-warning-600 dark:bg-warning-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
    case "danger":
    case "error":
      return {
        bg: "bg-danger-50/60 dark:bg-neutral-900 border-danger/30 dark:border-danger-500/40",
        innerBg: "bg-danger-100/60 dark:bg-danger-900/50",
        text: "text-danger-700 dark:text-danger-300",
        border: "border-danger/30 dark:border-danger-500/40",
        iconFill: "bg-danger-600 dark:bg-danger-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
    case "info":
      return {
        bg: "bg-info-50/60 dark:bg-neutral-900 border-info/30 dark:border-info-500/40",
        innerBg: "bg-info-100/60 dark:bg-info-900/50",
        text: "text-info-700 dark:text-info-300",
        border: "border-info/30 dark:border-info-500/40",
        iconFill: "bg-info-600 dark:bg-info-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
    case "primary":
      return {
        bg: "bg-primary-50/60 dark:bg-neutral-900 border-primary/30 dark:border-primary-500/40",
        innerBg: "bg-primary-100/60 dark:bg-primary-900/50",
        text: "text-primary-700 dark:text-primary-300",
        border: "border-primary/30 dark:border-primary-500/40",
        iconFill: "bg-primary-600 dark:bg-primary-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
    default:
      return {
        bg: "bg-muted/30 dark:bg-neutral-900 border-border/60 dark:border-neutral-700",
        innerBg: "bg-muted/50 dark:bg-neutral-800",
        text: "text-muted-foreground dark:text-neutral-300",
        border: "border-border/60 dark:border-neutral-700",
        iconFill: "bg-muted-foreground/60 dark:bg-neutral-400",
        currentRing: "",
        currentDot: "",
        currentCard: "",
        currentBadge: "",
        currentBadgeDot: "",
      };
  }
}
