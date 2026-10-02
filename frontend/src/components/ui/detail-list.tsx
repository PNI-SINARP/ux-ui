import * as React from "react"
import { cn } from "@/lib/utils"

export interface DetailItem {
  label: string
  value: React.ReactNode
  colSpan?: 1 | 2
}

export interface DetailListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: DetailItem[]
  layout?: "vertical" | "horizontal" | "grid"
  columns?: 1 | 2 | 3 | 4
}

export function DetailList({
  items,
  layout = "grid",
  columns = 2,
  className,
  ...props
}: DetailListProps) {

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col gap-4 text-left items-start w-full", className)} {...props}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-1 text-left items-start w-full">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left">{item.label}</span>
            <div className="text-sm font-medium text-foreground text-left">{item.value || "-"}</div>
          </div>
        ))}
      </div>
    )
  }

  if (layout === "horizontal") {
    return (
      <div className={cn("flex flex-col gap-3 text-left w-full", className)} {...props}>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 text-left">
            <span className="text-sm font-medium text-muted-foreground text-left">{item.label}</span>
            <div className="text-sm font-semibold text-foreground text-right">{item.value || "-"}</div>
          </div>
        ))}
      </div>
    )
  }

  // Grid layout
  return (
    <div
      className={cn(
        "grid gap-x-8 gap-y-5 text-left w-full",
        columns === 1 ? "grid-cols-1" :
          columns === 2 ? "grid-cols-1 sm:grid-cols-2" :
            columns === 3 ? "grid-cols-1 sm:grid-cols-3" :
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    >
      {items.map((item, i) => (
        <div key={i} className={cn("flex flex-col gap-1.5 text-left items-start", item.colSpan === 2 && "sm:col-span-2")}>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left">{item.label}</span>
          <div className="text-sm font-medium text-foreground text-left">{item.value || "-"}</div>
        </div>
      ))}
    </div>
  )
}

