"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const radioGroupVariants = cva("grid", {
  variants: {
    orientation: {
      vertical: "grid-cols-1 gap-2",
      horizontal: "flex flex-wrap gap-4",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> &
    VariantProps<typeof radioGroupVariants>
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn(radioGroupVariants({ orientation }), className)}
      orientation={orientation === "vertical" ? "vertical" : "horizontal"}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const radioGroupItemVariants = cva(
  "peer relative aspect-square shrink-0 rounded-full border border-input shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40 dark:bg-input/30 group-has-disabled/field:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "data-[state=checked]:border-primary data-[state=checked]:text-primary dark:data-[state=checked]:border-primary enabled:hover:border-primary enabled:hover:ring-4 enabled:hover:ring-primary/20",
        error:
          "data-[state=checked]:border-danger data-[state=checked]:text-danger dark:data-[state=checked]:border-danger border-danger/50 enabled:hover:border-danger enabled:hover:ring-4 enabled:hover:ring-danger/20",
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

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof radioGroupItemVariants>
>(({ className, variant, size, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemVariants({ variant, size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div
          className={cn(
            "rounded-full bg-current",
            size === "sm" && "size-1.5",
            (size === "md" || !size) && "size-2",
            size === "lg" && "size-2.5"
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

// Form Helper wrappers

export interface RadioButtonFieldProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'onChange'> {
  label?: string
  helpText?: React.ReactNode
  error?: string
  options: { label: string; value: string; disabled?: boolean }[]
  size?: "sm" | "md" | "lg"
  orientation?: "vertical" | "horizontal"
  onChange?: (value: string) => void
}

export function RadioButtonField({
  label,
  helpText,
  error,
  options,
  size = "md",
  orientation = "vertical",
  disabled,
  className,
  onChange,
  onValueChange,
  ...props
}: RadioButtonFieldProps) {
  const stateVariant = error ? "error" : "primary"

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label && (
        <label
          className={cn(
            "text-sm font-semibold",
            error ? "text-danger" : "text-foreground",
            disabled && "opacity-50"
          )}
        >
          {label}
          {props.required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <RadioGroup
        orientation={orientation}
        disabled={disabled}
        aria-invalid={!!error}
        onValueChange={onChange || onValueChange}
        {...props}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-2 cursor-pointer text-sm font-medium",
              (disabled || option.disabled) && "cursor-not-allowed opacity-50"
            )}
          >
            <RadioGroupItem
              value={option.value}
              disabled={disabled || option.disabled}
              variant={stateVariant}
              size={size}
              aria-invalid={!!error}
            />
            {option.label}
          </label>
        ))}
      </RadioGroup>

      {(helpText || error) && (
        <p
          className={cn(
            "text-xs",
            error ? "text-danger" : "text-muted-foreground",
            disabled && "opacity-50"
          )}
        >
          {error || helpText}
        </p>
      )}
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
