"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const glowCardVariants = cva(
  "relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer group flex flex-col p-5 min-h-[140px]",
  {
    variants: {
      color: {
        primary: "[--glow-color:var(--primary)] [--glow-color-rgb:0,137,123]",
        secondary: "[--glow-color:var(--secondary)] [--glow-color-rgb:100,116,139]",
        success: "[--glow-color:var(--success)] [--glow-color-rgb:16,185,129]",
        warning: "[--glow-color:var(--warning)] [--glow-color-rgb:245,158,11]",
        danger: "[--glow-color:var(--danger)] [--glow-color-rgb:239,68,68]",
        info: "[--glow-color:var(--info)] [--glow-color-rgb:59,130,246]",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

export interface GlowCardProps extends VariantProps<typeof glowCardVariants> {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlowCard({
  title,
  description,
  icon,
  color,
  className,
  onClick,
}: GlowCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        glowCardVariants({ color }),
        "bg-[#111318] border border-white/5", // Dark base
        "hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
      style={{
        boxShadow: "0 10px 40px -10px color-mix(in srgb, var(--glow-color) 30%, transparent)",
      }}
    >
      {/* Glow Effect (Top Right) */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[50px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: "var(--glow-color)" }}
      />

      {/* Subtle bottom colored border effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: "var(--glow-color)" }}
      />

      {/* Sparkles (Decorative) */}
      <div className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-700">
        <svg className="absolute top-4 right-12 w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M2 12h20" strokeWidth="1" strokeLinecap="round" />
          <path d="M4.9 4.9l14.2 14.2M4.9 19.1L19.1 4.9" strokeWidth="0.5" strokeLinecap="round" />
        </svg>
        <svg className="absolute top-12 right-6 w-2 h-2 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M2 12h20" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <svg className="absolute top-1/2 right-1/4 w-1.5 h-1.5 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M2 12h20" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div 
          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110"
        >
          <div className="[&>svg]:size-5" style={{ color: "var(--glow-color)" }}>
            {icon}
          </div>
        </div>

        {/* Text */}
        <div className="mt-auto">
          <h3 className="font-bold text-white text-base tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-sm text-white/60 font-medium line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
