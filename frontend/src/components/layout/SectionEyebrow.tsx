import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionEyebrowProps {
  label: string;
  className?: string;
}

export function SectionEyebrow({ label, className }: SectionEyebrowProps) {
  return (
    <div className={cn("flex items-center gap-4 mb-6", className)}>
      <div className="h-px w-8 bg-primary/50" aria-hidden="true" />
      <Badge tone="primary" appearance="outline" className="border-transparent text-primary-400 tracking-[0.2em] font-medium uppercase">
        {label}
      </Badge>
    </div>
  );
}
