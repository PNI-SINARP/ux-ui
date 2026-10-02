import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export type BadgeTone = "primary" | "secondary" | "success" | "warning" | "danger" | "error" | "info" | "neutral"
export type BadgeAppearance = "solid" | "filled" | "soft" | "outline" | "ghost"
export type BadgeSize = "sm" | "md" | "lg"
export type BadgeScale = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
export type BadgeOpacity = "8" | "10" | "12" | "16" | "20" | "24" | "30" | "40" | "50"

const badgeVariants = cva(
  "group/badge inline-flex shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full font-bold uppercase tracking-wider whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none",
  {
    variants: {
      tone: {
        primary: "",
        secondary: "",
        success: "",
        warning: "",
        danger: "",
        error: "", // alias for danger
        info: "",
        neutral: "",
      },
      appearance: {
        solid: "",
        filled: "", // alias for solid
        soft: "",
        outline: "border bg-transparent",
        ghost: "bg-transparent border-transparent",
      },
      size: {
        sm: "h-5 px-2 text-[9px] [&>svg]:size-2.5",
        md: "h-6 px-2.5 text-[10px] [&>svg]:size-3",
        lg: "h-7 px-3 text-[11px] [&>svg]:size-3.5",
      },
    },
    compoundVariants: [
      // Primary
      { tone: "primary", appearance: ["solid", "filled"], className: "bg-primary dark:bg-primary-600 !text-white border-transparent shadow-xs" },
      { tone: "primary", appearance: "soft", className: "bg-primary-50 dark:bg-primary-900/40 text-primary-900 dark:text-primary-200 border border-primary-200/40 dark:border-primary-700/50 font-extrabold" },
      { tone: "primary", appearance: "outline", className: "text-primary dark:text-primary-400 border-primary/40 dark:border-primary-400/50 font-extrabold" },
      { tone: "primary", appearance: "ghost", className: "text-primary dark:text-primary-400 hover:bg-primary/10 dark:hover:bg-primary-400/10 font-extrabold" },

      // Secondary
      { tone: "secondary", appearance: ["solid", "filled"], className: "bg-secondary dark:bg-secondary-600 !text-white border-transparent shadow-xs" },
      { tone: "secondary", appearance: "soft", className: "bg-secondary-50 dark:bg-secondary-900/40 text-secondary-900 dark:text-secondary-200 border border-secondary-200/40 dark:border-secondary-700/50 font-extrabold" },
      { tone: "secondary", appearance: "outline", className: "text-secondary dark:text-secondary-400 border-secondary/40 dark:border-secondary-400/50 font-extrabold" },
      { tone: "secondary", appearance: "ghost", className: "text-secondary dark:text-secondary-400 hover:bg-secondary/10 dark:hover:bg-secondary-400/10 font-extrabold" },

      // Success
      { tone: "success", appearance: ["solid", "filled"], className: "bg-success dark:bg-success-600 !text-white border-transparent shadow-xs" },
      { tone: "success", appearance: "soft", className: "bg-success-50 dark:bg-success-900/40 text-success-900 dark:text-success-200 border border-success-200/40 dark:border-success-700/50 font-extrabold" },
      { tone: "success", appearance: "outline", className: "text-success dark:text-success-400 border-success/40 dark:border-success-400/50 font-extrabold" },
      { tone: "success", appearance: "ghost", className: "text-success dark:text-success-400 hover:bg-success/10 dark:hover:bg-success-400/10 font-extrabold" },

      // Warning
      { tone: "warning", appearance: ["solid", "filled"], className: "bg-warning dark:bg-warning-600 !text-white border-transparent shadow-xs" },
      { tone: "warning", appearance: "soft", className: "bg-warning-50 dark:bg-warning-900/40 text-warning-900 dark:text-warning-200 border border-warning-200/40 dark:border-warning-700/50 font-extrabold" },
      { tone: "warning", appearance: "outline", className: "text-[#A05000] dark:text-warning-400 border-[#EFB98D] dark:border-warning-400/50 font-extrabold" },
      { tone: "warning", appearance: "ghost", className: "text-warning-700 dark:text-warning-400 hover:bg-warning/10 dark:hover:bg-warning-400/10 font-extrabold" },

      // Danger / Error
      { tone: ["danger", "error"], appearance: ["solid", "filled"], className: "bg-danger dark:bg-danger-600 !text-white border-transparent shadow-xs" },
      { tone: ["danger", "error"], appearance: "soft", className: "bg-danger-50 dark:bg-danger-900/40 text-danger-900 dark:text-danger-200 border border-danger-200/40 dark:border-danger-700/50 font-extrabold" },
      { tone: ["danger", "error"], appearance: "outline", className: "text-[#5E021C] dark:text-danger-400 border-[#E19DA8] dark:border-danger-400/50 font-extrabold" },
      { tone: ["danger", "error"], appearance: "ghost", className: "text-danger-700 dark:text-danger-400 hover:bg-danger/10 dark:hover:bg-danger-400/10 font-extrabold" },

      // Info
      { tone: "info", appearance: ["solid", "filled"], className: "bg-info dark:bg-info-600 !text-white border-transparent shadow-xs" },
      { tone: "info", appearance: "soft", className: "bg-info-50 dark:bg-info-900/40 text-info-900 dark:text-info-200 border border-info-200/40 dark:border-info-700/50 font-extrabold" },
      { tone: "info", appearance: "outline", className: "text-info dark:text-info-400 border-info/40 dark:border-info-400/50 font-extrabold" },
      { tone: "info", appearance: "ghost", className: "text-info dark:text-info-400 hover:bg-info/10 dark:hover:bg-info-400/10 font-extrabold" },

      // Neutral
      { tone: "neutral", appearance: ["solid", "filled"], className: "bg-neutral-800 dark:bg-neutral-700 !text-white border-transparent shadow-xs" },
      { tone: "neutral", appearance: "soft", className: "bg-muted dark:bg-neutral-800 text-foreground dark:text-neutral-100 border border-border dark:border-neutral-700 font-extrabold" },
      { tone: "neutral", appearance: "outline", className: "text-muted-foreground border-border font-extrabold" },
      { tone: "neutral", appearance: "ghost", className: "text-muted-foreground hover:bg-muted font-extrabold" },
    ],
    defaultVariants: {
      tone: "neutral",
      appearance: "soft",
      size: "md",
    },
  }
)

const scaleClasses: Record<string, Record<BadgeScale, string>> = {
  primary: {
    "50": "bg-primary-50 text-primary-800 dark:text-white border-primary-200",
    "100": "bg-primary-100 text-primary-800 dark:text-white border-primary-300",
    "200": "bg-primary-200 text-primary-900 dark:text-white border-primary-400",
    "300": "bg-primary-300 text-primary-950 dark:text-white border-primary-500",
    "400": "bg-primary-400 text-white border-transparent",
    "500": "bg-primary-500 text-white border-transparent",
    "600": "bg-primary-600 text-white border-transparent",
    "700": "bg-primary-700 text-white border-transparent",
    "800": "bg-primary-800 text-white border-transparent",
    "900": "bg-primary-900 text-white border-transparent",
  },
  secondary: {
    "50": "bg-secondary-50 text-secondary-800 dark:text-white border-secondary-200",
    "100": "bg-secondary-100 text-secondary-800 dark:text-white border-secondary-300",
    "200": "bg-secondary-200 text-secondary-900 dark:text-white border-secondary-400",
    "300": "bg-secondary-300 text-secondary-950 dark:text-white border-secondary-500",
    "400": "bg-secondary-400 text-white border-transparent",
    "500": "bg-secondary-500 text-white border-transparent",
    "600": "bg-secondary-600 text-white border-transparent",
    "700": "bg-secondary-700 text-white border-transparent",
    "800": "bg-secondary-800 text-white border-transparent",
    "900": "bg-secondary-900 text-white border-transparent",
  },
  success: {
    "50": "bg-success-50 text-success-800 dark:text-white border-success-200",
    "100": "bg-success-100 text-success-800 dark:text-white border-success-300",
    "200": "bg-success-200 text-success-900 dark:text-white border-success-400",
    "300": "bg-success-300 text-success-950 dark:text-white border-success-500",
    "400": "bg-success-400 text-white border-transparent",
    "500": "bg-success-500 text-white border-transparent",
    "600": "bg-success-600 text-white border-transparent",
    "700": "bg-success-700 text-white border-transparent",
    "800": "bg-success-800 text-white border-transparent",
    "900": "bg-success-900 text-white border-transparent",
  },
  warning: {
    "50": "bg-warning-50 text-warning-800 dark:text-white border-warning-200",
    "100": "bg-warning-100 text-warning-800 dark:text-white border-warning-300",
    "200": "bg-warning-200 text-warning-900 dark:text-white border-warning-400",
    "300": "bg-warning-300 text-warning-950 dark:text-white border-warning-500",
    "400": "bg-warning-400 text-white border-transparent",
    "500": "bg-warning-500 text-white border-transparent",
    "600": "bg-warning-600 text-white border-transparent",
    "700": "bg-warning-700 text-white border-transparent",
    "800": "bg-warning-800 text-white border-transparent",
    "900": "bg-warning-900 text-white border-transparent",
  },
  danger: {
    "50": "bg-danger-50 text-danger-800 dark:text-white border-danger-200",
    "100": "bg-danger-100 text-danger-800 dark:text-white border-danger-300",
    "200": "bg-danger-200 text-danger-900 dark:text-white border-danger-400",
    "300": "bg-danger-300 text-danger-950 dark:text-white border-danger-500",
    "400": "bg-danger-400 text-white border-transparent",
    "500": "bg-danger-500 text-white border-transparent",
    "600": "bg-danger-600 text-white border-transparent",
    "700": "bg-danger-700 text-white border-transparent",
    "800": "bg-danger-800 text-white border-transparent",
    "900": "bg-danger-900 text-white border-transparent",
  },
  info: {
    "50": "bg-info-50 text-info-800 dark:text-white border-info-200",
    "100": "bg-info-100 text-info-800 dark:text-white border-info-300",
    "200": "bg-info-200 text-info-900 dark:text-white border-info-400",
    "300": "bg-info-300 text-info-950 dark:text-white border-info-500",
    "400": "bg-info-400 text-white border-transparent",
    "500": "bg-info-500 text-white border-transparent",
    "600": "bg-info-600 text-white border-transparent",
    "700": "bg-info-700 text-white border-transparent",
    "800": "bg-info-800 text-white border-transparent",
    "900": "bg-info-900 text-white border-transparent",
  },
  neutral: {
    "50": "bg-neutral-50 text-neutral-800 dark:text-white border-neutral-200",
    "100": "bg-neutral-100 text-neutral-800 dark:text-white border-neutral-300",
    "200": "bg-neutral-200 text-neutral-900 dark:text-white border-neutral-400",
    "300": "bg-neutral-300 text-neutral-950 dark:text-white border-neutral-500",
    "400": "bg-neutral-400 text-white border-transparent",
    "500": "bg-neutral-500 text-white border-transparent",
    "600": "bg-neutral-600 text-white border-transparent",
    "700": "bg-neutral-700 text-white border-transparent",
    "800": "bg-neutral-800 text-white border-transparent",
    "900": "bg-neutral-900 text-white border-transparent",
  },
}

const opacityClasses: Record<string, Record<BadgeOpacity, string>> = {
  primary: {
    "8": "bg-primary/8 text-primary border-transparent",
    "10": "bg-primary/10 text-primary border-transparent",
    "12": "bg-primary/12 text-primary border-transparent",
    "16": "bg-primary/16 text-primary border-transparent",
    "20": "bg-primary/20 text-primary border-transparent",
    "24": "bg-primary/24 text-primary border-transparent",
    "30": "bg-primary/30 text-primary border-transparent",
    "40": "bg-primary/40 text-primary border-transparent",
    "50": "bg-primary/50 text-primary border-transparent",
  },
  secondary: {
    "8": "bg-secondary/8 text-secondary border-transparent",
    "10": "bg-secondary/10 text-secondary border-transparent",
    "12": "bg-secondary/12 text-secondary border-transparent",
    "16": "bg-secondary/16 text-secondary border-transparent",
    "20": "bg-secondary/20 text-secondary border-transparent",
    "24": "bg-secondary/24 text-secondary border-transparent",
    "30": "bg-secondary/30 text-secondary border-transparent",
    "40": "bg-secondary/40 text-secondary border-transparent",
    "50": "bg-secondary/50 text-secondary border-transparent",
  },
  success: {
    "8": "bg-success/8 text-success border-transparent",
    "10": "bg-success/10 text-success border-transparent",
    "12": "bg-success/12 text-success border-transparent",
    "16": "bg-success/16 text-success border-transparent",
    "20": "bg-success/20 text-success border-transparent",
    "24": "bg-success/24 text-success border-transparent",
    "30": "bg-success/30 text-success border-transparent",
    "40": "bg-success/40 text-success border-transparent",
    "50": "bg-success/50 text-success border-transparent",
  },
  warning: {
    "8": "bg-warning/8 text-warning-700 dark:text-warning-400 border-transparent",
    "10": "bg-warning/10 text-warning-700 dark:text-warning-400 border-transparent",
    "12": "bg-warning/12 text-warning-700 dark:text-warning-400 border-transparent",
    "16": "bg-warning/16 text-warning-700 dark:text-warning-400 border-transparent",
    "20": "bg-warning/20 text-warning-700 dark:text-warning-400 border-transparent",
    "24": "bg-warning/24 text-warning-700 dark:text-warning-400 border-transparent",
    "30": "bg-warning/30 text-warning-700 dark:text-warning-400 border-transparent",
    "40": "bg-warning/40 text-warning-700 dark:text-warning-400 border-transparent",
    "50": "bg-warning/50 text-warning-700 dark:text-warning-400 border-transparent",
  },
  danger: {
    "8": "bg-danger/8 text-danger border-transparent",
    "10": "bg-danger/10 text-danger border-transparent",
    "12": "bg-danger/12 text-danger border-transparent",
    "16": "bg-danger/16 text-danger border-transparent",
    "20": "bg-danger/20 text-danger border-transparent",
    "24": "bg-danger/24 text-danger border-transparent",
    "30": "bg-danger/30 text-danger border-transparent",
    "40": "bg-danger/40 text-danger border-transparent",
    "50": "bg-danger/50 text-danger border-transparent",
  },
  info: {
    "8": "bg-info/8 text-info border-transparent",
    "10": "bg-info/10 text-info border-transparent",
    "12": "bg-info/12 text-info border-transparent",
    "16": "bg-info/16 text-info border-transparent",
    "20": "bg-info/20 text-info border-transparent",
    "24": "bg-info/24 text-info border-transparent",
    "30": "bg-info/30 text-info border-transparent",
    "40": "bg-info/40 text-info border-transparent",
    "50": "bg-info/50 text-info border-transparent",
  },
  neutral: {
    "8": "bg-muted/30 text-muted-foreground border-transparent",
    "10": "bg-muted/30 text-muted-foreground border-transparent",
    "12": "bg-muted/50 text-muted-foreground border-transparent",
    "16": "bg-muted/70 text-muted-foreground border-transparent",
    "20": "bg-muted/70 text-muted-foreground border-transparent",
    "24": "bg-muted text-muted-foreground border-transparent",
    "30": "bg-muted text-muted-foreground border-transparent",
    "40": "bg-muted text-muted-foreground border-transparent",
    "50": "bg-muted text-muted-foreground border-transparent",
  },
}

export interface BadgeProps
  extends React.ComponentProps<"span">,
  Omit<VariantProps<typeof badgeVariants>, "tone" | "appearance" | "size"> {
  tone?: BadgeTone
  variant?: BadgeTone // Backward compatibility alias
  appearance?: BadgeAppearance
  size?: BadgeSize
  scale?: BadgeScale
  intensity?: BadgeScale // Backward compatibility alias
  opacity?: BadgeOpacity
  icon?: React.ReactNode
  dot?: boolean
  asChild?: boolean
}

function Badge({
  className,
  tone,
  variant = "primary",
  appearance = "solid",
  size = "md",
  scale,
  intensity,
  opacity,
  icon,
  dot = false,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  // Resolución backward-compatible para tone y scale
  const effectiveTone = (tone || variant || "primary") as BadgeTone
  const normalizeTone = effectiveTone === "error" ? "danger" : effectiveTone
  const effectiveScale = scale || intensity
  const scaleKey = normalizeTone in scaleClasses ? normalizeTone : "primary"

  const customScaleClass = effectiveScale ? scaleClasses[scaleKey]?.[effectiveScale] : null
  const customOpacityClass = opacity ? opacityClasses[scaleKey]?.[opacity] : null

  return (
    <Comp
      data-slot="badge"
      data-tone={normalizeTone}
      data-appearance={appearance}
      data-size={size}
      data-scale={effectiveScale}
      data-opacity={opacity}
      className={cn(
        badgeVariants({ tone: normalizeTone, appearance, size }),
        customScaleClass,
        customOpacityClass,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full shrink-0",
            normalizeTone === "primary" && "bg-primary",
            normalizeTone === "secondary" && "bg-secondary",
            normalizeTone === "success" && "bg-success",
            normalizeTone === "warning" && "bg-warning",
            normalizeTone === "danger" && "bg-danger",
            normalizeTone === "info" && "bg-info",
            normalizeTone === "neutral" && "bg-muted-foreground"
          )}
        />
      )}
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
