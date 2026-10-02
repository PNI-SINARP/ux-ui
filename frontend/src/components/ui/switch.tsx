"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center cursor-pointer  rounded-full border border-transparent shadow-xs transition-all after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-disabled:cursor-not-allowed data-disabled:opacity-50 ",
  {
    variants: {
      variant: {
        primary: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-background border-2 border-primary enabled:hover:border-primary enabled:hover:ring-4 enabled:hover:ring-primary/20",
        secondary: "data-[state=checked]:bg-secondary data-[state=unchecked]:bg-background border-2 border-secondary enabled:hover:border-secondary enabled:hover:ring-4 enabled:hover:ring-secondary/20",
        success: "data-[state=checked]:bg-success data-[state=unchecked]:bg-background border-2 border-success enabled:hover:border-success enabled:hover:ring-4 enabled:hover:ring-success/20",
        error: "data-[state=checked]:bg-danger data-[state=unchecked]:bg-background border-2 border-danger enabled:hover:border-danger enabled:hover:ring-4 enabled:hover:ring-danger/20",
        warning: "data-[state=checked]:bg-warning data-[state=unchecked]:bg-background border-2 border-warning enabled:hover:border-warning enabled:hover:ring-4 enabled:hover:ring-warning/20",
        info: "data-[state=checked]:bg-info data-[state=unchecked]:bg-background border-2 border-info enabled:hover:border-info enabled:hover:ring-4 enabled:hover:ring-info/20",
      },
      size: {
        sm: "h-4 w-7",
        default: "h-5 w-9",
        lg: "h-6 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full ring-0 transition-all duration-300",
  {
    variants: {
      variant: {
        primary: "data-[state=unchecked]:bg-primary data-[state=checked]:bg-white",
        secondary: "data-[state=unchecked]:bg-secondary data-[state=checked]:bg-white",
        success: "data-[state=unchecked]:bg-success data-[state=checked]:bg-white",
        error: "data-[state=unchecked]:bg-danger data-[state=checked]:bg-white",
        warning: "data-[state=unchecked]:bg-warning data-[state=checked]:bg-white",
        info: "data-[state=unchecked]:bg-info data-[state=checked]:bg-white",
      },
      size: {
        sm: "size-2 data-[state=checked]:translate-x-[14px] data-[state=unchecked]:translate-x-[2px]",
        default: "size-3 data-[state=checked]:translate-x-[18px] data-[state=unchecked]:translate-x-[2px]",
        lg: "size-4 data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
  VariantProps<typeof switchVariants> { }

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, variant = "primary", size = "default", ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-slot="switch"
    className={cn(switchVariants({ variant, size }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(switchThumbVariants({ variant, size }))}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
