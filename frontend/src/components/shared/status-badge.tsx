import React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { getStatusBadgeConfig } from "@/lib/status-badge-config";
import { cn } from "@/lib/utils";

interface StatusBadgeProps extends Omit<BadgeProps, "children" | "tone" | "appearance" | "scale" | "dot"> {
  estado: string;
}

export function StatusBadge({ estado, className, ...props }: StatusBadgeProps) {
  const config = getStatusBadgeConfig(estado);

  return (
    <Badge
      tone={config.tone}
      appearance={config.appearance}
      scale={config.scale}
      dot={config.dot}
      className={cn("font-medium", className)}
      {...props}
    >
      {config.label}
    </Badge>
  );
}
