"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const appCardVariants = cva(
  "relative overflow-hidden rounded-xl bg-surface border border-border/40 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80 flex flex-col group",
  {
    variants: {
      color: {
        primary: "[--card-color:var(--primary)] [--card-bg:color-mix(in_srgb,var(--primary)_15%,transparent)]",
        secondary: "[--card-color:var(--secondary)] [--card-bg:color-mix(in_srgb,var(--secondary)_15%,transparent)]",
        success: "[--card-color:var(--success)] [--card-bg:color-mix(in_srgb,var(--success)_15%,transparent)]",
        warning: "[--card-color:var(--warning)] [--card-bg:color-mix(in_srgb,var(--warning)_15%,transparent)]",
        danger: "[--card-color:var(--danger)] [--card-bg:color-mix(in_srgb,var(--danger)_15%,transparent)]",
        info: "[--card-color:var(--info)] [--card-bg:color-mix(in_srgb,var(--info)_15%,transparent)]",
      },
      interactive: {
        true: "cursor-pointer hover:-translate-y-1",
        false: "",
      }
    },
    defaultVariants: {
      color: "primary",
      interactive: true,
    },
  }
);

export interface AppCardProps extends VariantProps<typeof appCardVariants> {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: number | boolean;
  className?: string;
  onClick?: () => void;
}

export function AppCard({
  title,
  description,
  icon,
  badge,
  color,
  interactive,
  className,
  onClick,
}: AppCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(appCardVariants({ color, interactive }), className)}
    >
      {/* Top Colored Section */}
      <div 
        className="h-[76px] w-full relative transition-colors duration-300 p-4"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        {/* Icon Container */}
        <div 
          className="w-[42px] h-[42px] rounded-lg flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 relative"
          style={{ backgroundColor: "var(--card-color)" }}
        >
          <div className="[&>svg]:size-5">
            {icon}
          </div>

          {/* Notification Badge */}
          {badge && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-danger rounded-full border-[2.5px] border-white flex items-center justify-center text-[9px] text-white font-bold z-10 shadow-sm animate-in zoom-in">
              {typeof badge === "number" ? badge : ""}
            </span>
          )}
        </div>
      </div>

      {/* Text Content */}
      <div className="p-4 pt-3">
        <h3 className="font-bold text-foreground text-sm tracking-tight group-hover:text-[var(--card-color)] transition-colors duration-300 line-clamp-1">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
}
