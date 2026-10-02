"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    // Base
    "group",
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",

    "overflow-hidden",
    "[contain:paint]",
    "[clip-path:inset(0_round_9999px)]",
    "!rounded-full",
    "border-2",

    "font-semibold",
    "outline-none",
    "select-none",
    "isolate",

    // Motion
    "transition-[border-color,color,background-color,transform,box-shadow]",
    "duration-500",

    // States
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "active:scale-[0.96]",

    // Icons
    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "border-primary",
          "!text-white",
          "bg-primary",
          "[--radial-bg:color-mix(in_srgb,var(--primary)_60%,black)]",
          "[--glow:color-mix(in_srgb,var(--primary)_65%,white)]",
          "hover:border-transparent",
          "active:bg-[color-mix(in_srgb,var(--primary)_50%,black)]",
          "data-[state=active]:bg-[color-mix(in_srgb,var(--primary)_50%,black)]",
          "data-[state=active]:!text-white",
        ].join(" "),

        secondary: [
          "border-secondary",
          "text-secondary",
          "bg-white dark:bg-surface",
          "[--radial-bg:var(--secondary)]",
          "[--glow:color-mix(in_srgb,var(--secondary)_65%,white)]",
          "hover:border-secondary",
          "hover:bg-secondary",
          "hover:!text-white",
          "active:bg-[color-mix(in_srgb,var(--secondary)_50%,black)]",
          "active:!text-white",
          "data-[state=active]:bg-secondary",
          "data-[state=active]:!text-white",
        ].join(" "),

        success: [
          "border-success",
          "text-white",
          "bg-success",
          "[--radial-bg:color-mix(in_srgb,var(--success)_60%,black)]",
          "[--glow:color-mix(in_srgb,var(--success)_65%,white)]",
          "hover:border-transparent",
          "active:bg-[color-mix(in_srgb,var(--success)_50%,black)]",
          "data-[state=active]:bg-[color-mix(in_srgb,var(--success)_50%,black)]",
          "data-[state=active]:text-white",
        ].join(" "),

        warning: [
          "border-warning",
          "text-white",
          "bg-warning",
          "[--radial-bg:color-mix(in_srgb,var(--warning)_60%,black)]",
          "[--glow:color-mix(in_srgb,var(--warning)_65%,white)]",
          "hover:border-transparent",
          "active:bg-[color-mix(in_srgb,var(--warning)_50%,black)]",
          "data-[state=active]:bg-[color-mix(in_srgb,var(--warning)_50%,black)]",
          "data-[state=active]:text-white",
        ].join(" "),

        danger: [
          "border-danger",
          "text-white",
          "bg-danger",
          "[--radial-bg:color-mix(in_srgb,var(--danger)_60%,black)]",
          "[--glow:color-mix(in_srgb,var(--danger)_65%,white)]",
          "hover:border-transparent",
          "active:bg-[color-mix(in_srgb,var(--danger)_50%,black)]",
          "data-[state=active]:bg-[color-mix(in_srgb,var(--danger)_50%,black)]",
          "data-[state=active]:text-white",
        ].join(" "),

        info: [
          "border-info",
          "text-white",
          "bg-info",
          "[--radial-bg:color-mix(in_srgb,var(--info)_60%,black)]",
          "[--glow:color-mix(in_srgb,var(--info)_65%,white)]",
          "hover:border-transparent",
          "active:bg-[color-mix(in_srgb,var(--info)_50%,black)]",
          "data-[state=active]:bg-[color-mix(in_srgb,var(--info)_50%,black)]",
          "data-[state=active]:text-white",
        ].join(" "),

        ghost: [
          "border-transparent",
          "text-foreground",
          "bg-transparent",
          "[--radial-bg:var(--muted)]",
          "[--glow:var(--muted)]",
          "hover:text-foreground",
          "hover:bg-muted/30",
        ].join(" "),

        neutral: [
          "border-0",
          "bg-neutral-500 dark:bg-neutral-500",
          "text-white",
          "[--radial-bg:var(--primitive-neutral-600)] dark:[--radial-bg:var(--primitive-neutral-600)]",
          "[--glow:color-mix(in_srgb,var(--primitive-neutral-600)_50%,white)]",
          "hover:border-0",
          "hover:bg-neutral-700 dark:hover:bg-neutral-700",
          "hover:text-white",
          "active:bg-neutral-800 dark:active:bg-neutral-800",
          "active:text-white",
          "data-[state=active]:bg-neutral-700 dark:data-[state=active]:bg-neutral-700",
          "data-[state=active]:text-white",
          "data-[active=true]:bg-neutral-700 dark:data-[active=true]:bg-neutral-700",
          "data-[active=true]:text-white",
        ].join(" "),

        outline: [
          "border-border",
          "bg-muted/40",
          "text-foreground",
          "[--radial-bg:var(--muted)]",
          "[--glow:var(--muted)]",
          "hover:border-transparent",
          "hover:bg-muted/60",
          "hover:text-foreground",
        ].join(" "),
      },

      size: {
        default: "h-11 px-8 text-base",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "w-11 h-11 shrink-0",
        "icon-sm": "w-10 h-10 shrink-0",
        "icon-xs": "w-10 h-10 shrink-0 [&_svg]:scale-75",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      children,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    const [position, setPosition] = React.useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = React.useState(false)

    const handleMouseMove = (
      e: React.MouseEvent<HTMLButtonElement>
    ) => {
      const rect = e.currentTarget.getBoundingClientRect()

      setPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    const innerContent = (
      <>
        {/* RADIAL FILL */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none",
            "absolute",
            "z-[1]",
            "h-40",
            "w-40",
            "!rounded-full",
            "bg-[var(--radial-bg)]",
            "transform-gpu"
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 0})`,
            opacity: isHovered ? 0.85 : 0,
            transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease-in-out",
          }}
        />

        {/* LIQUID GLOW */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none",
            "absolute",
            "z-[2]",
            "h-32",
            "w-32",
            "-translate-x-1/2",
            "-translate-y-1/2",
            "!rounded-full",
            "bg-[var(--glow)]",
            "blur-[18px]"
          )}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            opacity: isHovered ? 0.5 : 0,
            transition: "opacity 500ms ease-in-out",
          }}
        />

        {/* SOFT LIGHT */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none",
            "absolute",
            "inset-0",
            "z-[3]",
            "bg-gradient-to-br",
            "from-white/5",
            "to-transparent",
            "transition-opacity",
            "duration-700",
            "ease-in-out",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      </>
    )

    const childNode = asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
      ? children.props.children
      : children

    const content = (
      <>
        {innerContent}
        {/* CONTENT */}
        <span
          className={cn(
            "pointer-events-none relative z-[4] flex w-full items-center gap-2",
            className?.includes("justify-between")
              ? "justify-between"
              : className?.includes("justify-start")
                ? "justify-start"
                : className?.includes("justify-end")
                  ? "justify-end"
                  : "justify-center"
          )}
        >
          {leftIcon}
          {childNode}
          {rightIcon}
        </span>
      </>
    )

    return (
      <Comp
        ref={ref}
        {...props}
        className={cn(
          buttonVariants({ variant, size }),
          className
        )}
        onMouseEnter={(e) => {
          handleMouseMove(e)
          setIsHovered(true)
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e) => {
          setIsHovered(false)
          props.onMouseLeave?.(e)
        }}
        onMouseMove={(e) => {
          handleMouseMove(e)
          props.onMouseMove?.(e)
        }}
      >
        {asChild && React.isValidElement<{ children?: React.ReactNode }>(children)
          ? React.cloneElement(children, {
            children: content,
          })
          : content}
      </Comp>
    )
  }
)

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

export { Button, buttonVariants }
