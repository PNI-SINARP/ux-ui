import React from "react";
import { cn, getAssetPath } from "@/lib/utils";

export type DINARPSpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  hideLabel?: boolean;
};

export function DINARPSpinner({
  size = "md",
  label = "Cargando información",
  className = "",
  hideLabel = false,
}: DINARPSpinnerProps) {
  const sizeMap = {
    sm: 64,
    md: 96,
    lg: 140,
  };

  const logoMap = {
    sm: 32,
    md: 52,
    lg: 80,
  };

  const spinnerSize = sizeMap[size];
  const logoSize = logoMap[size];

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div
        className="DINARP-spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
        role="status"
        aria-label={label}
      >
        <div className="DINARP-spinner__ring" aria-hidden="true" />

        <>
<img
          className="dark:hidden DINARP-spinner__shield object-contain"
          src={getAssetPath("/escudo-light.svg")}
          alt="Cargando"
          aria-hidden="true"
          style={{
            width: logoSize,
            height: logoSize,
          }}
        />
<img
          className="hidden dark:block DINARP-spinner__shield object-contain"
          src={getAssetPath("/escudo-dark.svg")}
          alt="Cargando"
          aria-hidden="true"
          style={{
            width: logoSize,
            height: logoSize,
          }}
        />
</>
      </div>

      {!hideLabel && label && (
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
