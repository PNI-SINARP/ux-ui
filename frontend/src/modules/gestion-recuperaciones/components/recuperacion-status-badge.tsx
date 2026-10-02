import React from "react";
import { Badge, type BadgeAppearance, type BadgeTone } from "@/components/ui/badge";
import {
  EstadoRecuperacion,
  DecisionAdministrativa,
  TipoCuentaUsuario,
} from "../data/gestion-recuperaciones-types";
import {
  Shield,
  Landmark,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================================================================
   1. BADGE DE ESTADO DEL CASO (Sin icono por defecto según estándar UX)
========================================================================= */
interface StatusBadgeProps {
  estado: EstadoRecuperacion;
  decision?: DecisionAdministrativa;
  className?: string;
  showIcon?: boolean;
}

export function RecuperacionStatusBadge({ estado, decision, className, showIcon = false }: StatusBadgeProps) {
  // Si la resolución final ya fue dictada (AUTORIZADA o DENEGADA), reflejarla en el badge de estado
  if (decision === "AUTORIZADA") {
    return (
      <Badge
        tone="success"
        appearance="soft"
        size="sm"
        className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
      >
        <span>Autorizada</span>
      </Badge>
    );
  }

  if (decision === "DENEGADA") {
    return (
      <Badge
        tone="danger"
        appearance="soft"
        size="sm"
        className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
      >
        <span>Denegada</span>
      </Badge>
    );
  }

  switch (estado) {
    case "PENDIENTE":
      return (
        <Badge
          tone="warning"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>Pendiente</span>
        </Badge>
      );
    case "EN_VALIDACION":
      return (
        <Badge
          tone="info"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>En validación</span>
        </Badge>
      );
    case "EN_CONCILIACION":
      return (
        <Badge
          tone="warning"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case border border-warning/40", className)}
        >
          <span>En conciliación</span>
        </Badge>
      );
    case "COMPLETADO":
      return (
        <Badge
          tone="neutral"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>Completado</span>
        </Badge>
      );
    default:
      return (
        <Badge tone="neutral" appearance="soft" size="sm" className={cn("font-semibold text-xs h-6 shrink-0 tracking-normal normal-case", className)}>
          {estado}
        </Badge>
      );
  }
}

/* =========================================================================
   2. BADGE DE RESOLUCIÓN ADMINISTRATIVA (Sin icono por defecto)
========================================================================= */
interface DecisionBadgeProps {
  decision: DecisionAdministrativa;
  className?: string;
  showIcon?: boolean;
}

export function RecuperacionDecisionBadge({ decision, className, showIcon = false }: DecisionBadgeProps) {
  switch (decision) {
    case "PENDIENTE":
      return (
        <Badge
          tone="neutral"
          appearance="outline"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>Pendiente</span>
        </Badge>
      );
    case "AUTORIZADA":
      return (
        <Badge
          tone="success"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>Autorizada</span>
        </Badge>
      );
    case "DENEGADA":
      return (
        <Badge
          tone="danger"
          appearance="soft"
          size="sm"
          className={cn("font-semibold whitespace-nowrap px-2.5 py-0.5 text-xs h-6 inline-flex items-center shrink-0 tracking-normal normal-case", className)}
        >
          <span>Denegada</span>
        </Badge>
      );
    default:
      return (
        <Badge tone="neutral" appearance="soft" size="sm" className={className}>
          {decision}
        </Badge>
      );
  }
}

/* =========================================================================
   3. BADGE DE TIPO DE CUENTA (Con icono y variables diferenciadas estilo RolBadge)
========================================================================= */
export interface TipoCuentaBadgeConfig {
  tone: BadgeTone;
  appearance: BadgeAppearance;
  icon: React.ComponentType<{ className?: string }>;
  defaultLabel: string;
  className?: string;
}

export const TIPO_CUENTA_BADGE_CONFIG: Record<TipoCuentaUsuario, TipoCuentaBadgeConfig> = {
  // Cuenta interna: Máxima jerarquía institucional interna (azul profundo institucional sólido con icono Shield)
  CUENTA_INTERNA: {
    tone: "primary",
    appearance: "solid",
    icon: Shield,
    defaultLabel: "Cuenta interna",
    className: "bg-primary text-white border-transparent shadow-xs font-semibold",
  },
  // Coordinador: Entidad institucional externa (morado/lavanda con borde y fondo suave de alto contraste con icono Landmark)
  COORDINADOR: {
    tone: "secondary",
    appearance: "outline",
    icon: Landmark,
    defaultLabel: "Coordinador",
    className: "bg-secondary/15 text-secondary dark:text-secondary-300 border-secondary/50 font-semibold",
  },
};

export interface TipoCuentaBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tipo: TipoCuentaUsuario | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  appearanceOverride?: BadgeAppearance;
  toneOverride?: BadgeTone;
  showIcon?: boolean;
  className?: string;
}

/**
 * Componente oficial de Badge para Tipos de Cuenta de Recuperación.
 * Estructurado bajo el mismo patrón de `RolBadge` de Cuentas Internas,
 * variando colores y apariencias (primary solid vs secondary outline con fondo)
 * para una diferenciación visual inmediata y accesible.
 */
export function RecuperacionTipoCuentaBadge({
  tipo,
  label,
  size = "sm",
  appearanceOverride,
  toneOverride,
  showIcon = true,
  className,
  ...props
}: TipoCuentaBadgeProps) {
  const config = (TIPO_CUENTA_BADGE_CONFIG as Record<string, TipoCuentaBadgeConfig>)[tipo] || {
    tone: "neutral" as BadgeTone,
    appearance: "soft" as BadgeAppearance,
    icon: UserCheck,
    defaultLabel: tipo,
    className: "",
  };

  const tone = toneOverride || config.tone;
  const appearance = appearanceOverride || config.appearance;
  const IconComponent = config.icon;
  const displayText = label || config.defaultLabel;

  return (
    <Badge
      tone={tone}
      appearance={appearance}
      size={size}
      className={cn(
        "font-semibold text-xs h-6 px-2.5 inline-flex items-center max-w-full tracking-normal normal-case gap-1.5 shrink-0",
        config.className,
        className
      )}
      {...props}
    >
      {showIcon && <IconComponent className="size-3.5 shrink-0 opacity-90" />}
      <span className="truncate min-w-0">{displayText}</span>
    </Badge>
  );
}


