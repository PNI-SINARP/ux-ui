import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type CardSize = "default" | "sm"
type CardVariant = "default" | "featured"

/**
 * `featured` — Colorful horizontal card with a decorative icon in the corner.
 * Inspired by the course/category card pattern (pastel bg + badge + large icon).
 *
 * `default` — Standard glassmorphism card (existing behavior).
 */
export type CardGlow = "none" | "primary-info" | "success-warning" | "danger-secondary" | "info-success" | "primary-warning"

interface CardProps extends React.ComponentProps<"div"> {
  size?: CardSize
  variant?: CardVariant
  glow?: CardGlow
  innerClassName?: string
  disableHover?: boolean
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ className, innerClassName, size = "default", variant = "default", glow = "none", disableHover = false, children, ...props }: CardProps) {
  const isDefault = variant === "default"

  const glowColors: Record<CardGlow, string> = {
    "primary-info": "var(--color-primary-600), var(--color-info-500)",
    "success-warning": "var(--color-success), var(--color-warning)",
    "danger-secondary": "var(--color-danger), var(--color-secondary)",
    "info-success": "var(--color-info-500), var(--color-success)",
    "primary-warning": "var(--color-primary-600), var(--color-warning)",
    "none": "transparent, transparent"
  }

  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      data-glow={glow}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300",
        // --- Default variant (Neon border + Dark surface) ---
        isDefault && [
          "border border-border shadow-md transition-all duration-500",
          !disableHover && "hover:bg-surface/30",
          glow !== "none" && [
            "p-[1px] border-0",
            !disableHover && "hover:animate-[border-spin_4s_linear_infinite]"
          ]
        ],
        // --- Featured variant (colorful + decorative icon) ---
        variant === "featured" && [
          "shadow-lg",
          !disableHover && "hover:shadow-xl hover:-translate-y-0.5",
        ],
        className
      )}
      style={glow !== "none" ? {
        backgroundImage: `conic-gradient(from var(--border-angle), transparent 20%, ${glowColors[glow]}, transparent 80%)`,
      } as React.CSSProperties : undefined}
      {...props}
    >
      {/* ═══ INNER SURFACE (for gradient border effect) ═══ */}
      {isDefault && glow !== "none" && (
        <div className="absolute inset-[1px] rounded-[inherit] bg-background/95 backdrop-blur-xl z-0" />
      )}

      {/* Content above blobs */}
      <div className={cn(
        "relative z-10 flex flex-col w-full flex-1",
        // --- Default Layout ---
        isDefault && [
          "items-start text-left gap-4 p-6",
          "group-data-[size=sm]/card:gap-3 group-data-[size=sm]/card:p-4"
        ],
        // --- Featured Layout ---
        variant === "featured" && [
          "items-start text-left gap-3 p-8"
        ],
        innerClassName
      )}>
        {children}
      </div>
    </div>
  )
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col items-start text-left gap-1.5 w-full",
        // When inside featured card, align left
        "group-data-[variant=featured]/card:items-start group-data-[variant=featured]/card:gap-2",
        className
      )}
      {...props}
    />
  )
}

// ─── CardTitle ────────────────────────────────────────────────────────────────

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-lg font-bold tracking-tight text-foreground flex items-center text-left",
        "group-data-[size=sm]/card:text-base",
        // Featured: slightly smaller title, allow wrapping
        "group-data-[variant=featured]/card:text-base group-data-[variant=featured]/card:leading-snug",
        className
      )}
      {...props}
    />
  )
}

// ─── CardDescription ──────────────────────────────────────────────────────────

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm leading-relaxed text-muted-foreground font-medium text-left",
        className
      )}
      {...props}
    />
  )
}

// ─── CardIcon (centered icon for default variant) ─────────────────────────────

function CardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-icon"
      className={cn(
        "flex items-center justify-center size-16 rounded-full mb-2",
        "bg-foreground/5 border border-foreground/10 backdrop-blur-sm",
        "shadow-inner drop-shadow-sm",
        "[&_svg]:size-8 [&_svg]:text-foreground/90",
        className
      )}
      {...props}
    />
  )
}

// ─── CardDecorativeIcon (bottom-right decorative icon for featured variant) ───

/**
 * Renders a large decorative icon anchored to the bottom-right of a `featured` Card.
 * Pass any SVG or Lucide icon as children. Opacity and size are controlled via className.
 *
 * Usage:
 * ```tsx
 * <Card variant="featured" className="bg-primary/10">
 *   <CardBadge>Design</CardBadge>
 *   <CardTitle>Product Design</CardTitle>
 *   <CardDescription>320 lessons</CardDescription>
 *   <CardDecorativeIcon><PenTool className="w-16 h-16" /></CardDecorativeIcon>
 * </Card>
 * ```
 */
function CardDecorativeIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-decorative-icon"
      className={cn(
        // Positioned absolute at bottom-right, clipped by card overflow-hidden
        // Negative margins/offsets to make it look like it's "coming out"
        // Lower z-index to stay behind other content in the same container
        "absolute -bottom-10 -right-10 -z-10 pointer-events-none select-none transition-transform duration-500 group-hover/card:scale-110",
        "opacity-15",
        className
      )}
      {...props}
    />
  )
}

// ─── CardContent ──────────────────────────────────────────────────────────────

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

// ─── CardFooter ───────────────────────────────────────────────────────────────

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-start pt-2",
        "group-data-[variant=featured]/card:justify-start group-data-[variant=featured]/card:pt-1",
        className
      )}
      {...props}
    />
  )
}

// ─── CardBadge ────────────────────────────────────────────────────────────────

function CardBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-badge"
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        "bg-background/40 text-foreground backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardIcon,
  CardDecorativeIcon,
  CardBadge,
}
export type { CardGlow as GlowVariant }