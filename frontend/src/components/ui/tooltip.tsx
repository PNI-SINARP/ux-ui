"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/* ─── CVA Variants ─── */

const tooltipContentVariants = cva(
  [
    "z-50",
    "inline-flex",
    "w-fit",
    "max-w-xs",
    "origin-(--radix-tooltip-content-transform-origin)",
    "items-center",
    "gap-1.5",
    "rounded-lg",
    "px-3",
    "py-1.5",
    "text-xs",
    "font-medium",
    "shadow-lg",

    // Kbd slot styles
    "has-data-[slot=kbd]:pr-1.5",
    "**:data-[slot=kbd]:relative",
    "**:data-[slot=kbd]:isolate",
    "**:data-[slot=kbd]:z-50",
    "**:data-[slot=kbd]:rounded-sm",

    // Side animations
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",

    // Open/close animations
    "data-[state=delayed-open]:animate-in",
    "data-[state=delayed-open]:fade-in-0",
    "data-[state=delayed-open]:zoom-in-95",
    "data-open:animate-in",
    "data-open:fade-in-0",
    "data-open:zoom-in-95",
    "data-closed:animate-out",
    "data-closed:fade-out-0",
    "data-closed:zoom-out-95",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground text-white",
        secondary: "bg-secondary text-secondary-foreground text-white",
        success: "bg-success text-success-foreground text-white",
        warning: "bg-warning text-warning-foreground text-white",
        danger: "bg-danger text-danger-foreground text-white",
        info: "bg-info text-info-foreground text-white",
        surface: "bg-surface text-foreground border border-border shadow-md",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

const tooltipArrowVariants = cva(
  "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
  {
    variants: {
      variant: {
        primary: "bg-primary fill-primary text-white",
        secondary: "bg-secondary fill-secondary",
        success: "bg-success fill-success",
        warning: "bg-warning fill-warning",
        danger: "bg-danger fill-danger",
        info: "bg-info fill-info",
        surface: "bg-surface fill-surface border-border",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export type TooltipContentVariantProps = VariantProps<typeof tooltipContentVariants>

function TooltipTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tooltip-title"
      className={cn("font-bold text-xs leading-tight text-foreground", className)}
      {...props}
    />
  )
}

function TooltipDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tooltip-description"
      className={cn("text-[11px] text-muted-foreground leading-relaxed mt-0.5", className)}
      {...props}
    />
  )
}

interface TooltipContentProps
  extends Omit<React.ComponentProps<typeof TooltipPrimitive.Content>, "title">,
  TooltipContentVariantProps {
  title?: React.ReactNode
  description?: React.ReactNode
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  variant,
  title,
  description,
  ...props
}: TooltipContentProps) {
  const hasStructured = Boolean(title || description)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          tooltipContentVariants({ variant }),
          hasStructured && "flex flex-col items-start text-left p-3 gap-1",
          className
        )}
        {...props}
      >
        {title && <TooltipTitle>{title}</TooltipTitle>}
        {description && <TooltipDescription>{description}</TooltipDescription>}
        {children}
        <TooltipPrimitive.Arrow
          className={cn(tooltipArrowVariants({ variant }))}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipTitle,
  TooltipDescription,
  tooltipContentVariants,
  tooltipArrowVariants,
}
