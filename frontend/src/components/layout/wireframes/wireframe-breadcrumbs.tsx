"use client";

import React from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface WireframeBreadcrumbsProps {
  segments: BreadcrumbSegment[];
  className?: string;
}

export function WireframeBreadcrumbs({ segments, className }: WireframeBreadcrumbsProps) {
  const filteredSegments = (segments || []).filter(
    s => s && s.label && s.label.trim().toLowerCase() !== "inicio" && s.label.trim().toLowerCase() !== "home"
  );

  if (filteredSegments.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Breadcrumb className={cn("max-w-full overflow-hidden", className)}>
        <BreadcrumbList className="flex items-center gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 text-xs text-muted-foreground max-w-full">
          {filteredSegments.map((segment, index) => {
            const isLast = index === filteredSegments.length - 1;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem className="shrink-0 min-w-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {isLast || (!segment.href && !segment.onClick) ? (
                        <BreadcrumbPage
                          className="truncate max-w-[130px] xs:max-w-[200px] sm:max-w-none text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 cursor-default"
                        >
                          {segment.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          {segment.href ? (
                            <Link
                              href={segment.href}
                              onClick={segment.onClick}
                              className="truncate max-w-[100px] xs:max-w-[160px] sm:max-w-none text-[11px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 cursor-pointer"
                            >
                              {segment.label}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={segment.onClick}
                              className="truncate max-w-[100px] xs:max-w-[160px] sm:max-w-none text-[11px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-left cursor-pointer"
                            >
                              {segment.label}
                            </button>
                          )}
                        </BreadcrumbLink>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-xs">
                      {segment.label}
                    </TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="shrink-0 mx-0.5 text-muted-foreground/60" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  );
}

