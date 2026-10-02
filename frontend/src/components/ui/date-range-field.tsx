"use client"

/**
 * DateRangeField
 * ──────────────
 * The TRIGGER / FORM FIELD for selecting a date range.
 * It looks like an input (same family as Text Field, Select, Combobox).
 * When clicked it opens a Popover containing the DateRangePicker.
 *
 * Separate from DateRangePicker by design:
 *   DateRangeField  = the input/trigger
 *   DateRangePicker = the calendar dropdown
 */

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export interface DateRangeFieldProps {
  /** The confirmed selected range */
  value?: DateRange
  /** Called when the user applies a new range */
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  label?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  clearable?: boolean
  state?: "default" | "success" | "error"
  size?: "sm" | "default" | "lg"
  className?: string
  numberOfMonths?: number
  /** Align the popover relative to the trigger */
  align?: "start" | "center" | "end"
}

export function DateRangeField({
  value,
  onChange,
  placeholder = "Selecciona un rango de fechas",
  label,
  helpText,
  required,
  disabled,
  readOnly,
  clearable = true,
  state = "default",
  size = "default",
  className,
  numberOfMonths = 1,
  align = "start",
}: DateRangeFieldProps) {
  const [open, setOpen] = React.useState(false)

  const handleApply = (range: DateRange | undefined) => {
    onChange?.(range)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const handleClear = () => {
    onChange?.(undefined)
    setOpen(false)
  }

  const handleClearInline = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const hasValue = value?.from

  const canInteract = !disabled && !readOnly

  return (
    <div className={cn("flex flex-col gap-1.5 text-left", className)}>
      {/* Label */}
      {label && (
        <label
          className={cn(
            "text-sm font-semibold",
            state === "error" ? "text-danger" : "text-foreground",
            disabled && "opacity-50"
          )}
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      <Popover open={open && canInteract} onOpenChange={canInteract ? setOpen : undefined}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={canInteract ? 0 : -1}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={hasValue
              ? `Rango: ${format(value!.from!, "dd/MM/yyyy")}${value?.to ? ` al ${format(value.to, "dd/MM/yyyy")}` : ""}`
              : placeholder
            }
            onKeyDown={(e) => {
              if (canInteract && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault()
                setOpen((v) => !v)
              }
            }}
            className={cn(
              "outline-none",
              !canInteract && "cursor-not-allowed opacity-50",
              canInteract && "cursor-pointer"
            )}
          >
            <InputGroup
              state={state}
              size={size}
              className={cn(
                "w-full group transition-colors",
                canInteract && "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1"
              )}
            >
              {/* Calendar icon */}
              <InputGroupAddon align="inline-start" className="pl-3 pr-1">
                <CalendarIcon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    open ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </InputGroupAddon>

              {/* Value or placeholder */}
              <div
                className={cn(
                  "flex-1 flex items-center py-2 px-2 text-sm font-medium select-none",
                  hasValue ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {hasValue ? (
                  value?.to
                    ? `${format(value.from!, "dd/MM/yyyy")} — ${format(value.to, "dd/MM/yyyy")}`
                    : format(value.from!, "dd/MM/yyyy")
                ) : (
                  placeholder
                )}
              </div>

              {/* Clear button (inline, only when has value) */}
              {clearable && hasValue && canInteract && (
                <InputGroupAddon align="inline-end" className="pr-1">
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Limpiar rango"
                    onClick={handleClearInline}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="h-3.5 w-3.5" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}

              {/* Chevron */}
              <InputGroupAddon align="inline-end" className="pr-2">
                <ChevronDownIcon
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    open && "rotate-180"
                  )}
                />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 rounded-2xl border-none shadow-2xl"
          align={align}
          sideOffset={6}
        >
          <DateRangePicker
            value={value}
            onApply={handleApply}
            onCancel={handleCancel}
            onClear={handleClear}
            numberOfMonths={numberOfMonths}
          />
        </PopoverContent>
      </Popover>

      {/* Help text / error */}
      {helpText && (
        <p
          className={cn(
            "text-xs",
            state === "error" ? "text-danger" : "text-muted-foreground",
            disabled && "opacity-50"
          )}
        >
          {helpText}
        </p>
      )}
    </div>
  )
}
