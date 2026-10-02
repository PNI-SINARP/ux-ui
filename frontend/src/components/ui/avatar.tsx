"use client"

import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

export type AvatarVariant = "00" | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15"
export type AvatarAppearance = "filled" | "soft" | "outline"

const avatarFallbackBase = "flex size-full items-center justify-center rounded-full text-xs font-bold uppercase transition-colors select-none"

function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
  size?: "default" | "sm" | "lg"
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-10 shrink-0 rounded-full select-none data-[size=lg]:size-14 data-[size=sm]:size-8",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  )
}

/**
 * Obtiene las iniciales a partir del nombre o apellidos.
 * Máximo 2 caracteres (primera letra del primer nombre y primera del último).
 */
export function getAvatarInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Genera un índice determinístico de 0 a 15 basado en un string (nombre o iniciales).
 */
export function getAvatarIndex(name: string): number {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 16;
}

interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  variant?: AvatarVariant
  appearance?: AvatarAppearance
  name?: string
}

function AvatarFallback({
  className,
  children,
  variant,
  appearance = "soft",
  name,
  style,
  ...props
}: AvatarFallbackProps) {
  const content = name ? getAvatarInitials(name) : children;
  let computedVariant = variant;

  if (!computedVariant && typeof content === "string" && content.length > 0) {
    const seed = name || content;
    const index = getAvatarIndex(seed);
    computedVariant = index.toString().padStart(2, "0") as AvatarVariant;
  }

  const selectedVariant = computedVariant || "00";
  const numVariant = parseInt(selectedVariant, 10);

  // Variables CSS base
  const bgVar = `var(--avatar-${numVariant}-bg)`;
  const textVar = `var(--avatar-${numVariant}-text)`;

  const hasCustomBg = className?.includes("bg-");
  const hasCustomText = className?.includes("text-");

  let appearanceClasses = "";
  const appearanceStyle: React.CSSProperties = { ...style };

  switch (appearance) {
    case "filled":
      if (!hasCustomBg) appearanceStyle.backgroundColor = textVar;
      if (!hasCustomText) appearanceStyle.color = bgVar;
      appearanceClasses = "border-transparent";
      break;
    case "outline":
      if (!hasCustomBg) appearanceStyle.backgroundColor = "transparent";
      if (!hasCustomText) {
        appearanceStyle.color = textVar;
        appearanceStyle.borderColor = textVar;
      }
      appearanceClasses = "border";
      break;
    case "soft":
    default:
      if (!hasCustomBg) appearanceStyle.backgroundColor = bgVar;
      if (!hasCustomText) appearanceStyle.color = textVar;
      appearanceClasses = "border-transparent";
      break;
  }

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        avatarFallbackBase,
        appearanceClasses,
        className
      )}
      style={appearanceStyle}
      {...props}
    >
      {content}
    </AvatarPrimitive.Fallback>
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
}
