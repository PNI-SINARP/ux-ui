import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { CheckCircle2, AlertCircle } from "lucide-react"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  required?: boolean
  description?: React.ReactNode
  hint?: React.ReactNode
  error?: string
  success?: string
  htmlFor?: string
  children: React.ReactNode
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, required, description, hint, error, success, htmlFor, children, ...props }, ref) => {
    const helperText = description ?? hint;
    return (
      <div ref={ref} className={cn("space-y-3", className)} {...props}>
        {label && (
          <div className="flex justify-between items-center">
            <Label htmlFor={htmlFor} className={cn(error && "text-danger")}>
              {label}
              {required && <span className="text-danger ml-1">*</span>}
            </Label>
          </div>
        )}

        {children}

        {helperText && !error && !success && (
          <p className="text-[13px] text-muted-foreground">{helperText}</p>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-danger text-[13px] font-medium animate-in slide-in-from-top-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <p>{error}</p>
          </div>
        )}

        {success && !error && (
          <div className="flex items-center gap-1.5 text-success text-[13px] font-medium animate-in slide-in-from-top-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <p>{success}</p>
          </div>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

