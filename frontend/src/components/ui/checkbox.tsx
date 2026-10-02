"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

const checkboxVariants = cva(
  "peer relative flex shrink-0 items-center justify-center rounded-[4px] border border-input bg-surface shadow-xs transition-all outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 dark:bg-input/30",
  {
    variants: {
      variant: {
        primary:
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary dark:data-[state=checked]:text-primary-foreground enabled:hover:border-primary enabled:hover:ring-4 enabled:hover:ring-primary/20",
        secondary:
          "data-[state=checked]:border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground dark:data-[state=checked]:bg-secondary dark:data-[state=checked]:text-secondary-foreground enabled:hover:border-secondary enabled:hover:ring-4 enabled:hover:ring-secondary/20",
        error:
          "data-[state=checked]:border-danger data-[state=checked]:bg-danger data-[state=checked]:text-danger-foreground dark:data-[state=checked]:bg-danger dark:data-[state=checked]:text-danger-foreground border-danger/50 enabled:hover:border-danger enabled:hover:ring-4 enabled:hover:ring-danger/20",
        success:
          "data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground dark:data-[state=checked]:bg-success dark:data-[state=checked]:text-success-foreground border-success/50 enabled:hover:border-success enabled:hover:ring-4 enabled:hover:ring-success/20",
        warning:
          "data-[state=checked]:border-warning data-[state=checked]:bg-warning data-[state=checked]:text-warning-foreground dark:data-[state=checked]:bg-warning dark:data-[state=checked]:text-warning-foreground border-warning/50 enabled:hover:border-warning enabled:hover:ring-4 enabled:hover:ring-warning/20",
        info:
          "data-[state=checked]:border-info data-[state=checked]:bg-info data-[state=checked]:text-info-foreground dark:data-[state=checked]:bg-info dark:data-[state=checked]:text-info-foreground border-info/50 enabled:hover:border-info enabled:hover:ring-4 enabled:hover:ring-info/20",
      },
      size: {
        sm: "size-3.5",
        md: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

function Checkbox({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(checkboxVariants({ variant, size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-white transition-none",
          size === "sm" && "[&>svg]:size-3",
          (size === "md" || !size) && "[&>svg]:size-3.5",
          size === "lg" && "[&>svg]:size-4"
        )}
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
