"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const inputGroupVariants = cva(
  [
    "group/input-group",
    "relative",
    "flex",
    "h-11",
    "w-full",
    "min-w-0",
    "items-center",
    "px-4",

    "overflow-hidden",
    "rounded-full",
    "border",


    "transition-all",
    "duration-500",

    "isolate",
  ].join(" "),
  {
    variants: {
      state: {
        default: [
          "border-primary/30 text-muted-foreground",

          "[--input-glow:var(--primary)]",
          "[--input-radial:color-mix(in_srgb,var(--color-primary)_15%,transparent)]",
          "[--input-state-color:var(--primary)]",

          "hover:border-primary/50",
          "focus-within:border-primary/40",
          "focus-within:shadow-[0_0_20px_-12px_var(--primary)]",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          "focus-within:shadow-[0_0_20px_-10px_var(--primary)]",
        ].join(" "),

        success: [
          "border-success text-success",

          "[--input-glow:var(--success)]",
          "[--input-radial:color-mix(in_srgb,var(--color-success)_12%,transparent)]",
          "[--input-state-color:var(--success)]",

          "focus-within:border-success focus-within:ring-2 focus-within:ring-success/20",
          "focus-within:shadow-[0_0_20px_-10px_var(--success)]",
        ].join(" "),

        error: [
          "border-danger text-danger",

          "[--input-glow:var(--danger)]",
          "[--input-radial:color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
          "[--input-state-color:var(--danger)]",

          "focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/20",
          "focus-within:shadow-[0_0_20px_-10px_var(--danger)]",
        ].join(" "),
      },

      variant: {
        default: "bg-background",

        command: [
          "bg-background/30 border-white/10 backdrop-blur-xl",
          "shadow-lg",
          "[--border-angle:0deg]",
        ].join(" "),

        animated: [
          "bg-background/30 border-border/50 backdrop-blur-xl",
          "[--border-angle:0deg]",
        ].join(" "),
      },

      size: {
        default: "h-11 text-base",
        sm: "h-9 text-sm",
        lg: "h-14 text-lg",
      },

      multiline: {
        true: "h-auto min-h-32 rounded-2xl items-start py-1",
        false: "",
      },

      disabled: {
        true: "opacity-60 cursor-not-allowed bg-muted/10 select-none pointer-events-none",
        false: "",
      },
    },

    defaultVariants: {
      state: "default",
      variant: "default",
      size: "default",
      multiline: false,
    },
  }
)

function InputGroup({
  className,
  state,
  variant,
  size,
  multiline,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupVariants> & {
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
  }) {
  const [position, setPosition] = React.useState({
    x: 0,
    y: 0,
  })

  const [isFocused, setIsFocused] = React.useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()

    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      data-slot="input-group"
      data-state={state}
      data-variant={variant}
      data-multiline={multiline}
      data-disabled={disabled}
      role="group"
      className={cn(
        inputGroupVariants({
          state,
          variant,
          size,
          multiline,
          disabled,
        }),
        className
      )}
      onMouseMove={handleMouseMove}
      onFocus={() => !disabled && setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsFocused(false)
        }
      }}
      {...props}
    >

      {/* ANIMATED BORDER */}
      {(variant === "command" || variant === "animated") && (
        <>
          {/* OUTER AURA */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none",
              "absolute -inset-[2px]",
              "z-[0]",
              "rounded-full",

              variant === "animated"
                ? "opacity-0 group-hover/input-group:opacity-70 group-focus-within/input-group:opacity-100 transition-opacity duration-500"
                : "opacity-70",

              "blur-md",

              "[background:conic-gradient(from_var(--border-angle),transparent_20deg,var(--primary),var(--primitive-info-400),transparent_340deg)]",

              "[animation:border-spin_6s_linear_infinite]"
            )}
          />

          {/* MAIN BORDER */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none",
              "absolute inset-0",
              "z-[1]",
              "rounded-full",
              "p-[1.2px]",

              variant === "animated"
                ? "opacity-0 group-hover/input-group:opacity-100 group-focus-within/input-group:opacity-100 transition-opacity duration-500"
                : "",

              "[background:conic-gradient(from_var(--border-angle),transparent_0deg,transparent_120deg,var(--primary)_180deg,var(--primitive-info-300)_240deg,transparent_300deg)]",

              "[animation:border-spin_6s_linear_infinite]"
            )}
          >
            <div className="h-full w-full rounded-full bg-background/80 backdrop-blur-2xl" />
          </div>
        </>
      )}

      {/* SOFT RADIAL */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none",
          "absolute",
          "z-[2]",

          "h-16",
          "w-32",

          "-translate-x-1/2",
          "-translate-y-1/2",

          "rounded-full",

          "bg-[var(--input-radial)]",

          "blur-xl",

          "transition-opacity",
          "duration-500"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* SOFT GLOW */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none",
          "absolute",
          "inset-0",
          "z-[3]",
          "rounded-[inherit]",

          "opacity-0",

          "transition-opacity",
          "duration-500"
        )}
        style={{
          boxShadow: isFocused
            ? `0 0 30px -15px var(--input-glow)`
            : "none",

          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* CONTENT */}
      <div
        className={cn(
          "relative z-10 flex h-full w-full items-center",
          multiline && "items-start"
        )}
      >
        {leftIcon && (
          <InputGroupAddon align="inline-start">
            {leftIcon}
          </InputGroupAddon>
        )}

        {children}

        {rightIcon && (
          <InputGroupAddon
            align="inline-end"
            className="rounded-full"
          >
            {rightIcon}
          </InputGroupAddon>
        )}
      </div>
    </div>
  )
}

const inputGroupAddonVariants = cva(
  "flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-[var(--input-state-color)]/70 select-none group-data-[disabled=true]/input-group:opacity-50 group-data-[multiline=true]/input-group:items-start group-data-[multiline=true]/input-group:pt-3 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-2 has-[>button]:-ml-1 has-[>kbd]:ml-[-0.15rem]",

        "inline-end":
          "order-last pr-2 has-[>button]:-mr-1 has-[>kbd]:mr-[-0.15rem]",

        "block-start":
          "order-first w-full justify-start px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2",

        "block-end":
          "order-last w-full justify-start px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2",
      },
    },

    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }

        e.currentTarget.parentElement
          ?.querySelector("input")
          ?.focus()
      }}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  "flex items-center gap-2 text-sm shadow-none",
  {
    variants: {
      size: {
        xs: "h-6 w-auto gap-1 rounded-full px-1.5 [&>svg:not([class*='size-'])]:size-3.5",

        sm: "h-8 w-auto gap-1.5 rounded-full px-2.5",

        "icon-xs":
          "justify-center size-6 aspect-square rounded-full p-0 has-[>svg]:p-0",

        "icon-sm":
          "justify-center size-8 aspect-square rounded-full p-0 has-[>svg]:p-0",
      },
    },

    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(
        inputGroupButtonVariants({ size }),

        variant === "ghost" &&
        "text-[var(--input-state-color)] hover:bg-[var(--input-state-color)]/10 hover:text-[var(--input-state-color)]",

        className
      )}
      {...props}
    />
  )
}

function InputGroupText({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2.5 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 pl-0.5",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 h-full rounded-none border-0 bg-transparent shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: Omit<React.ComponentProps<"textarea">, "color">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 h-full resize-none rounded-none border-0 bg-transparent py-2 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}