"use client"

import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
} from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  locale,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <div className={cn(
      "relative bg-surface p-4 sm:p-5 rounded-3xl transition-all duration-300 w-fit",
      className
    )}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "group/calendar [--cell-radius:9999px] [--cell-size:2.5rem]",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`
        )}
        captionLayout={captionLayout}
        locale={locale}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString(locale?.code, { month: "short" }),
          formatCaption: (date) => {
            const month = date.toLocaleString(locale?.code || 'en-US', { month: 'long' });
            const year = date.getFullYear();
            return `${month} ${year}`;
          },
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit mx-auto", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-6 md:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-0 flex w-full items-center justify-between px-2 z-20",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 rounded-full bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-border/30 p-0 select-none aria-disabled:opacity-20 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 rounded-full bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-border/30 p-0 select-none aria-disabled:opacity-20 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-8 w-full items-center justify-center mb-3",
            defaultClassNames.month_caption
          ),
          caption_label: cn(
            "text-[14px] font-medium text-foreground tracking-tight select-none capitalize",
            defaultClassNames.caption_label
          ),
          month_grid: "w-full border-collapse",
          weekdays: cn("flex mb-2", defaultClassNames.weekdays),
          weekday: cn(
            "flex-1 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest select-none text-center h-8 flex items-center justify-center",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-1", defaultClassNames.week),
          day: cn(
            "group/day relative h-10 w-10 p-0 text-center select-none flex items-center justify-center",
            defaultClassNames.day
          ),
          today: cn(
            "text-primary font-bold",
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground/30 aria-selected:text-muted-foreground/50",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground/20 opacity-50",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            }
            if (orientation === "right") {
              return <ChevronRightIcon className={cn("size-4", className)} {...props} />
            }
            return <ChevronDownIcon className={cn("size-4", className)} {...props} />
          },
          DayButton: ({ ...props }) => (
            <CalendarDayButton locale={locale} {...props} />
          ),
          ...components,
        }}
        {...props}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  const isSelected = modifiers.selected &&
    !modifiers.range_start &&
    !modifiers.range_end &&
    !modifiers.range_middle;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={isSelected}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex size-9 items-center justify-center rounded-full border-0 text-[13px] font-medium transition-all duration-200",
        (!isSelected && !modifiers.selected) && "text-foreground hover:bg-muted/70",
        (isSelected || modifiers.range_start || modifiers.range_end) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm font-semibold",
        modifiers.range_middle && "bg-transparent text-primary hover:bg-primary/20",
        
        /* Connecting background for ranges */
        modifiers.range_start && !modifiers.range_end && [
          "before:absolute before:inset-y-0 before:left-1/2 before:right-[-6px] before:bg-primary/10 before:-z-10 before:rounded-l-none"
        ],
        modifiers.range_end && !modifiers.range_start && [
          "before:absolute before:inset-y-0 before:left-[-6px] before:right-1/2 before:bg-primary/10 before:-z-10 before:rounded-r-none"
        ],
        modifiers.range_middle && [
          "before:absolute before:inset-y-0 before:-inset-x-[6px] before:bg-primary/10 before:-z-10 before:rounded-none"
        ],
        
        modifiers.outside && "text-muted-foreground/30",
        modifiers.disabled && "text-muted-foreground/20 opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
