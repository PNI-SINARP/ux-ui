"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 flex items-center gap-3 sm:gap-4 shadow-xs transition-all overflow-hidden",
  {
    variants: {
      variant: {
        default: "border-primary/20 bg-primary/5 dark:bg-primary/10 [&_.alert-line]:bg-primary [&_.alert-icon]:bg-primary [&_.alert-icon]:text-primary-foreground [&_.alert-title]:text-foreground",
        info: "border-info/30 bg-info/10 dark:bg-info/15 [&_.alert-line]:bg-info [&_.alert-icon]:bg-info [&_.alert-icon]:text-white [&_.alert-title]:text-info-700 dark:[&_.alert-title]:text-info-400",
        success: "border-success/30 bg-success/10 dark:bg-success/15 [&_.alert-line]:bg-success [&_.alert-icon]:bg-success [&_.alert-icon]:text-white [&_.alert-title]:text-success-700 dark:[&_.alert-title]:text-success-400",
        warning: "border-warning/30 bg-warning/10 dark:bg-warning/15 [&_.alert-line]:bg-warning [&_.alert-icon]:bg-warning [&_.alert-icon]:text-white [&_.alert-title]:text-warning-700 dark:[&_.alert-title]:text-warning-400",
        danger: "border-danger/30 bg-danger/10 dark:bg-danger/15 [&_.alert-line]:bg-danger [&_.alert-icon]:bg-danger [&_.alert-icon]:text-white [&_.alert-title]:text-danger-700 dark:[&_.alert-title]:text-danger-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
  VariantProps<typeof alertVariants> {
  icon?: React.ReactNode
  title?: React.ReactNode
  onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, icon, title, children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          alertVariants({ variant }),
          onClose ? "pr-10" : "",
          className
        )}
        {...props}
      >
        <div className="alert-line w-[3px] sm:w-[4px] self-stretch rounded-full shrink-0" />

        {icon && (
          <div className="alert-icon shrink-0 flex items-center justify-center size-7 sm:size-8 rounded-full [&_svg]:size-4 sm:[&_svg]:size-4 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1 flex flex-col gap-0.5 text-left justify-center py-1">
          {title && <h5 className="alert-title font-bold text-[14px] sm:text-[15px] leading-tight tracking-tight">{title}</h5>}
          <div className="text-[13px] sm:text-[14px] text-muted-foreground leading-snug">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 rounded-md text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert, alertVariants }
