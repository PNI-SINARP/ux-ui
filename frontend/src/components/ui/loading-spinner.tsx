"use client";

import * as React from "react";
import { cn, getAssetPath } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", label, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 w-10",
      md: "h-16 w-16",
      lg: "h-[104px] w-[104px]",
    };


    const shieldClasses = {
      sm: "h-[18px] w-[18px]",
      md: "h-[34px] w-[34px]",
      lg: "h-[48px] w-[48px]",
    };

    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div
          ref={ref}
          role="status"
          aria-label={label || "Cargando información"}
          className={cn("relative inline-flex items-center justify-center", sizeClasses[size])}
          {...props}
        >
          <svg
            className="dinarp-spinner-svg absolute inset-0 w-full h-full"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle
              className="dinarp-spinner-path"
              fill="none"
              strokeWidth={size === "sm" ? "5" : size === "md" ? "6" : "6"}
              strokeLinecap="round"
              cx="33"
              cy="33"
              r="30"
            />
          </svg>

          <>
            <img
              src={getAssetPath("/escudo-light.svg")}
              alt=""
              aria-hidden="true"
              className={cn("absolute inset-0 m-auto object-contain pointer-events-none dark:hidden", shieldClasses[size])}
            />
            <img
              src={getAssetPath("/escudo-dark.svg")}
              alt=""
              aria-hidden="true"
              className={cn("absolute inset-0 m-auto object-contain pointer-events-none hidden dark:block", shieldClasses[size])}
            />
          </>
        </div>

        {/* Mensaje opcional */}
        {label && (
          <span className="text-sm font-medium text-muted-foreground animate-pulse">
            {label}
          </span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
export default LoadingSpinner;
