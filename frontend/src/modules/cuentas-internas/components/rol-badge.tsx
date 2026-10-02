"use client";

import * as React from "react";
import { Badge, type BadgeAppearance, type BadgeTone } from "@/components/ui/badge";
import type { RolInterno } from "@/modules/usuarios/data/usuarios-store";
import { cn } from "@/lib/utils";
import {
  Shield,
  Briefcase,
  FileSearch,
  Scale,
  FileCheck,
  CheckCircle2,
  Lock,
  Code2,
  Receipt,
  UserCheck,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface RolBadgeConfig {
  tone: BadgeTone;
  appearance: BadgeAppearance;
  icon: React.ComponentType<{ className?: string }>;
  defaultLabel: string;
}

export const ROLES_BADGE_CONFIG: Record<RolInterno, RolBadgeConfig> = {
  // 1. Administrador: Máxima jerarquía, relleno sólido institucional
  ADMIN: {
    tone: "primary",
    appearance: "solid",
    icon: Shield,
    defaultLabel: "Administrador del Sistema",
  },
  // 2. Directores: Relleno suave ("soft") temático por área
  DIR_GESTION: {
    tone: "info",
    appearance: "soft",
    icon: Briefcase,
    defaultLabel: "Director de Gestión y Registro",
  },
  DGR: {
    tone: "info",
    appearance: "soft",
    icon: Briefcase,
    defaultLabel: "Director General de Registro",
  },
  DIR_NORMATIVA: {
    tone: "secondary",
    appearance: "soft",
    icon: Scale,
    defaultLabel: "Director de Normatividad",
  },
  // 3. Revisores/Equipos técnicos: Contorno coloreado ("outline") coordinado con su dirección
  EQ_GESTION: {
    tone: "info",
    appearance: "outline",
    icon: FileSearch,
    defaultLabel: "Revisor del Área de Gestión",
  },
  EQ_NORMATIVA: {
    tone: "secondary",
    appearance: "outline",
    icon: FileCheck,
    defaultLabel: "Revisor del Equipo de Normatividad",
  },
  // 4. Aprobador Institucional: Relleno suave ("soft") semántica de éxito / visto bueno
  APROBADOR: {
    tone: "success",
    appearance: "soft",
    icon: CheckCircle2,
    defaultLabel: "Aprobador Institucional",
  },
  // 5. Protección de la Información: Relleno suave ("soft") semántica de cautela y seguridad
  DPI: {
    tone: "warning",
    appearance: "soft",
    icon: Lock,
    defaultLabel: "Dirección de Protección de la Información",
  },
  // 6. Tecnologías y Desarrollo: Contorno ("outline") primario tecnológico
  DTD: {
    tone: "primary",
    appearance: "outline",
    icon: Code2,
    defaultLabel: "Dirección de Tecnologías y Desarrollo",
  },
  // 7. Facturación: Contorno ("outline") neutro sobrio
  FACTURACION: {
    tone: "neutral",
    appearance: "outline",
    icon: Receipt,
    defaultLabel: "Analista de Facturación y Cobranzas",
  },
};

export interface RolBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  rol: RolInterno | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  appearanceOverride?: BadgeAppearance;
  toneOverride?: BadgeTone;
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
}

/**
 * Componente oficial de Badge para Roles Institucionales DINARP.
 * Utiliza estrictamente el componente Badge del UI Kit, variando tonos semánticos
 * (primary, secondary, info, success, warning, neutral) y estilos de relleno
 * (solid, soft, outline) según la jerarquía y dominio de cada rol.
 * Si el nombre no cabe o queda truncado (...), el Tooltip integrado revela el nombre completo.
 */
export function RolBadge({
  rol,
  label,
  size = "sm",
  appearanceOverride,
  toneOverride,
  showIcon = true,
  showTooltip = true,
  className,
  ...props
}: RolBadgeProps) {
  const config = (ROLES_BADGE_CONFIG as Record<string, RolBadgeConfig>)[rol] || {
    tone: "neutral" as BadgeTone,
    appearance: "soft" as BadgeAppearance,
    icon: UserCheck,
    defaultLabel: rol,
  };

  const tone = toneOverride || config.tone;
  const appearance = appearanceOverride || config.appearance;
  const IconComponent = config.icon;
  const displayText = label || config.defaultLabel;

  const badgeElement = (
    <Badge
      tone={tone}
      appearance={appearance}
      size={size}
      className={cn(
        "font-semibold text-xs h-6 px-2.5 inline-flex items-center max-w-full tracking-normal normal-case gap-1.5",
        showTooltip && "cursor-help",
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className="size-3.5 shrink-0 opacity-90" />}
      <span className="truncate min-w-0">{displayText}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex max-w-full min-w-0" tabIndex={0}>
          {badgeElement}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-xs font-medium z-[100]">
        {displayText}
      </TooltipContent>
    </Tooltip>
  );
}
