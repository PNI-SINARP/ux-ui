"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type RiskLevel = "low" | "medium" | "high" | "critical";

// Example matrix: 5x5
// Impact (X axis): 1 to 5
// Probability (Y axis): 1 to 5 (from bottom to top visually)

interface RiskMatrixProps {
  selectedProbability?: number; // 1 to 5
  selectedImpact?: number; // 1 to 5
  onSelect?: (prob: number, impact: number) => void;
  interactive?: boolean;
}

export function RiskMatrix({
  selectedProbability,
  selectedImpact,
  onSelect,
  interactive = false
}: RiskMatrixProps) {

  // Matrix rows (probability from 5 down to 1)
  const rows = [5, 4, 3, 2, 1];
  const cols = [1, 2, 3, 4, 5];

  const getRiskLevel = (p: number, i: number): RiskLevel => {
    const score = p * i;
    if (score >= 15) return "critical";
    if (score >= 10) return "high";
    if (score >= 5) return "medium";
    return "low";
  };

  const getLevelStyles = (level: RiskLevel) => {
    switch (level) {
      case "critical": return "bg-danger/80 hover:bg-danger text-white";
      case "high": return "bg-warning/80 hover:bg-warning text-white";
      case "medium": return "bg-info/60 hover:bg-info/80 text-foreground";
      case "low": return "bg-success/60 hover:bg-success/80 text-foreground";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex">
        {/* Y Axis Label */}
        <div className="flex flex-col items-center justify-center mr-4 w-6">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest -rotate-90 whitespace-nowrap">
            Probabilidad
          </span>
        </div>

        <div className="flex flex-col flex-1 gap-1">
          {rows.map((p) => (
            <div key={`row-${p}`} className="flex gap-1 h-12 md:h-16">
              {/* Y Axis values */}
              <div className="w-6 flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0">
                {p}
              </div>

              {/* Cells */}
              {cols.map((i) => {
                const level = getRiskLevel(p, i);
                const isSelected = p === selectedProbability && i === selectedImpact;

                return (
                  <button
                    key={`cell-${p}-${i}`}
                    type="button"
                    disabled={!interactive}
                    onClick={() => interactive && onSelect?.(p, i)}
                    className={cn(
                      "flex-1 rounded-md border transition-all duration-200 flex items-center justify-center relative",
                      getLevelStyles(level),
                      interactive ? "cursor-pointer" : "cursor-default",
                      isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background border-transparent scale-105 z-10 shadow-md" : "border-border/10",
                      !isSelected && selectedProbability && selectedImpact ? "opacity-30" : "opacity-100"
                    )}
                  >
                    <span className="text-xs font-bold opacity-0 hover:opacity-100 transition-opacity">
                      {p * i}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* X Axis values */}
          <div className="flex gap-1 mt-1 pl-7">
            {cols.map((i) => (
              <div key={`col-${i}`} className="flex-1 flex items-center justify-center text-xs font-mono text-muted-foreground">
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X Axis Label */}
      <div className="text-center pl-10">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Impacto
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        <Badge tone="danger" appearance="solid" size="sm">Crítico (15-25)</Badge>
        <Badge tone="warning" appearance="solid" size="sm">Alto (10-14)</Badge>
        <Badge tone="info" appearance="soft" size="sm">Medio (5-9)</Badge>
        <Badge tone="success" appearance="soft" size="sm">Bajo (1-4)</Badge>
      </div>
    </div>
  );
}

