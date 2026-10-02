import * as React from "react"
import { cn } from "@/lib/utils"

export interface RecordHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: React.ReactNode
  status?: React.ReactNode
  metadata?: React.ReactNode
  actions?: React.ReactNode
  avatar?: React.ReactNode
}

export function RecordHeader({
  title,
  subtitle,
  status,
  metadata,
  actions,
  avatar,
  className,
  ...props
}: RecordHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4 justify-between items-start md:items-center pb-4 border-b border-border", className)} {...props}>
      <div className="flex gap-4 items-start">
        {avatar && (
          <div className="shrink-0 mt-1">
            {avatar}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold font-heading text-foreground">{title}</h1>
            {status && <div>{status}</div>}
          </div>
          {subtitle && (
            <div className="text-sm font-medium text-foreground/80">{subtitle}</div>
          )}
          {metadata && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
              {metadata}
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto pt-2 md:pt-0">
          {actions}
        </div>
      )}
    </div>
  )
}

