"use client";

import React from "react";
import { Badge, type BadgeAppearance, type BadgeTone } from "@/components/ui/badge";
import { EstadoConfiguracion } from "../data/types";
import { FileEdit, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstadoConfiguracionBadgeProps {
  estado: EstadoConfiguracion;
  className?: string;
  size?: "sm" | "md" | "lg";
}

interface EstadoConfig {
  tone: BadgeTone;
  appearance: BadgeAppearance;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const ESTADOS_MAP: Record<EstadoConfiguracion, EstadoConfig> = {
  Borrador: {
    tone: "neutral",
    appearance: "soft",
    icon: FileEdit,
    label: "Borrador",
  },
  "Pendiente de prueba": {
    tone: "warning",
    appearance: "soft",
    icon: Clock,
    label: "Pendiente de prueba",
  },
  Activa: {
    tone: "success",
    appearance: "solid",
    icon: CheckCircle2,
    label: "Activa",
  },
  Fallida: {
    tone: "danger",
    appearance: "soft",
    icon: AlertTriangle,
    label: "Fallida",
  },
};

export function EstadoConfiguracionBadge({
  estado,
  className,
  size = "md",
}: EstadoConfiguracionBadgeProps) {
  const config = ESTADOS_MAP[estado] || ESTADOS_MAP["Borrador"];
  const IconComponent = config.icon;

  return (
    <Badge
      tone={config.tone}
      appearance={config.appearance}
      size={size}
      className={cn("gap-1.5 font-semibold tracking-normal normal-case", className)}
    >
      <IconComponent className="size-3.5 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}
