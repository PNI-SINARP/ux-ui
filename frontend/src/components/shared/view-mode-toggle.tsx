"use client";

import * as React from "react";
import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ViewMode = "table" | "cards";

export interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({
  value,
  onChange,
  className,
}: ViewModeToggleProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next === "table" || next === "cards") {
            onChange(next);
          }
        }}
        spacing={1}
        aria-label="Selector de modo de visualización"
        className={cn(
          "inline-flex h-9 items-center rounded-full border border-primary/30 bg-background p-1 shadow-2xs shrink-0 ml-auto justify-self-end",
          className
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="table"
              size="sm"
              aria-label="Ver como tabla"
              className={cn(
                "h-7 rounded-full px-3 text-xs font-semibold gap-1.5 transition-all cursor-pointer",
                value === "table"
                  ? "bg-primary text-primary-foreground dark:text-white shadow-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:data-[state=on]:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 bg-transparent"
              )}
            >
              <Table2 className="size-3.5 shrink-0" />
              <span>Tabla</span>
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs z-[100]">
            Vista en tabla
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value="cards"
              size="sm"
              aria-label="Ver como tarjetas"
              className={cn(
                "h-7 rounded-full px-3 text-xs font-semibold gap-1.5 transition-all cursor-pointer",
                value === "cards"
                  ? "bg-primary text-primary-foreground dark:text-white shadow-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:data-[state=on]:text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 bg-transparent"
              )}
            >
              <LayoutGrid className="size-3.5 shrink-0" />
              <span>Tarjetas</span>
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs z-[100]">
            Vista en tarjetas
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
