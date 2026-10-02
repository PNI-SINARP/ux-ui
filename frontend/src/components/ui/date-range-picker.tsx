"use client"

/**
 * DateRangePicker
 * ───────────────
 * The STANDALONE CALENDAR POPOVER for selecting a date range.
 * This is NOT the trigger field. It receives an open/close state
 * and is controlled by the parent (e.g. DateRangeField).
 *
 * Can also be used independently in any context that needs
 * a calendar range selector (e.g., embedded in a modal or panel).
 */

import * as React from "react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

export interface DateRangePickerProps {
  /** Currently confirmed range value (used to reset on cancel) */
  value?: DateRange
  /** Called when user clicks "Aplicar" */
  onApply?: (range: DateRange | undefined) => void
  /** Called when user clicks "Cancelar" */
  onCancel?: () => void
  /** Called when user clicks "Limpiar" */
  onClear?: () => void
  className?: string
  numberOfMonths?: number
}

export function DateRangePicker({
  value,
  onApply,
  onCancel,
  onClear,
  className,
  numberOfMonths = 1,
}: DateRangePickerProps) {
  // tempRange: in-progress selection, reset on open
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value)

  // If the confirmed value changes from outside (e.g. cleared), sync
  React.useEffect(() => {
    setTempRange(value)
  }, [value])

  const isComplete = tempRange?.from && tempRange?.to

  const handleApply = () => {
    onApply?.(tempRange)
  }

  const handleCancel = () => {
    setTempRange(value) // revert
    onCancel?.()
  }

  const handleClear = () => {
    setTempRange(undefined)
    onClear?.()
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Calendar grid */}
      <Calendar
        autoFocus
        mode="range"
        defaultMonth={tempRange?.from ?? value?.from}
        selected={tempRange}
        onSelect={setTempRange}
        numberOfMonths={numberOfMonths}
      />

      {/* Summary row: Desde / Hasta */}
      <div className="flex items-stretch gap-2 px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Desde
          </span>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              tempRange?.from ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {tempRange?.from ? format(tempRange.from, "dd/MM/yyyy") : "—"}
          </span>
        </div>

        <div className="w-px bg-border" />

        <div className="flex-1 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Hasta
          </span>
          <span
            className={cn(
              "text-sm font-medium tabular-nums",
              tempRange?.to ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {tempRange?.to ? format(tempRange.to, "dd/MM/yyyy") : "—"}
          </span>
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="px-2.5 text-xs text-muted-foreground hover:text-foreground"
        >
          Limpiar
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="neutral" size="sm" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={!isComplete}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  )
}
