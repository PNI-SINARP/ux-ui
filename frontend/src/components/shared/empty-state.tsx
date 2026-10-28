import * as React from "react";
import { LucideIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }> | React.ReactNode;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = FileText,
  title = "No hay datos disponibles",
  description = "Actualmente no existen registros para mostrar en esta sección.",
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    const IconComponent = Icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className="size-8 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        "w-full p-8 rounded-2xl border border-dashed border-border/80 bg-surface/40 flex flex-col items-center text-center gap-3",
        className
      )}
    >
      <div className="size-16 rounded-2xl bg-muted/50 flex items-center justify-center shadow-xs">
        {renderIcon()}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {(action || (actionLabel && onAction)) && (
        <div className="pt-2">
          {action || (
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
