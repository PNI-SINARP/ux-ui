"use client"

/**
 * DateField
 * ─────────
 * Single-date picker field. Same visual family as Text Field,
 * Select, Combobox and DateRangeField.
 *
 * Opens the Calendar in single-date mode inside a Popover.
 * Completely separate from DateRangeField (two dates).
 */

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, ChevronDownIcon, XIcon } from "lucide-react"

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
import { Calendar } from "@/components/ui/calendar"

export interface DateFieldProps {
  /** The confirmed selected date */
  value?: Date
  /** Called when user selects a date from the picker */
  onChange?: (date: Date | undefined) => void
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
  align?: "start" | "center" | "end"
  /** Date format string (date-fns) */
  dateFormat?: string
}

export function DateField({
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  label,
  helpText,
  required,
  disabled,
  readOnly,
  clearable = true,
  state = "default",
  size = "default",
  className,
  align = "start",
  dateFormat = "dd/MM/yyyy",
}: DateFieldProps) {
  const [open, setOpen] = React.useState(false)

  const canInteract = !disabled && !readOnly

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date)
    if (date) setOpen(false) // close after selecting a day
  }

  const handleClearInline = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

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
            aria-label={value ? format(value, dateFormat) : placeholder}
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
              className="w-full"
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
                  value ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {value ? format(value, dateFormat) : placeholder}
              </div>

              {/* Clear button */}
              {clearable && value && canInteract && (
                <InputGroupAddon align="inline-end" className="pr-1">
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Limpiar fecha"
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
          <Calendar
            autoFocus
            mode="single"
            selected={value}
            onSelect={handleSelect}
            defaultMonth={value}
          />
        </PopoverContent>
      </Popover>

      {/* Help / error text */}
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
