"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "group/textarea relative isolate flex w-full border border-border bg-white dark:bg-surface transition-[color,box-shadow,border-color] duration-500 outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-hidden [contain:paint] shadow-2xs",
  {
    variants: {
      appearance: {
        default: "min-h-24 rounded-2xl",
        compact: "min-h-[64px] rounded-xl",
        chat: "min-h-[48px] rounded-2xl",
      },
      color: {
        primary: [
          "[--input-glow:var(--primary)]",
          "[--input-radial:color-mix(in_srgb,var(--color-primary)_15%,transparent)]",
          "hover:border-primary/50",
          "focus-within:border-primary",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          "focus-within:shadow-[0_0_10px_-10px_var(--primary)]",
        ].join(" "),
        secondary: [
          "[--input-glow:var(--secondary)]",
          "[--input-radial:color-mix(in_srgb,var(--color-secondary)_15%,transparent)]",
          "hover:border-secondary/50",
          "focus-within:border-secondary",
          "focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20",
          "focus-within:shadow-[0_0_10px_-10px_var(--secondary)]",
        ].join(" "),
      },
      state: {
        default: "border-border",
        error: [
          "border-danger !border-danger",
          "[--input-glow:var(--danger)]",
          "[--input-radial:color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
          "focus-within:shadow-[0_0_10px_-8px_var(--danger)]",
          "focus-within:ring-2 focus-within:ring-danger/20 focus-within:shadow-[0_0_10px_-8px_var(--danger)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      appearance: "default",
      color: "primary",
      state: "default",
    },
  }
)

import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

export interface TextareaProps
  extends Omit<React.ComponentProps<"textarea">, "color">,
  VariantProps<typeof textareaVariants> {
  showSendButton?: boolean
  onSend?: (value: string) => void
}

function Textarea({
  className,
  appearance,
  color,
  state,
  onFocus,
  onBlur,
  showSendButton,
  onSend,
  ...props
}: TextareaProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isFocused, setIsFocused] = React.useState(false)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleSend = () => {
    if (onSend && textareaRef.current) {
      onSend(textareaRef.current.value)
    }
  }

  return (
    <div
      data-slot="textarea-group"
      className={cn(textareaVariants({ appearance, color, state }), className)}
      onMouseMove={handleMouseMove}
    >
      {/* SOFT RADIAL EFFECT */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none",
          "absolute",
          "z-[1]",
          "h-24",
          "w-24",
          "-translate-x-1/2",
          "-translate-y-1/2",
          "rounded-full",
          "bg-[var(--input-radial)]",
          "blur-xl",
          "transition-opacity",
          "duration-500",
          "opacity-0"
        )}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isFocused ? 1 : 0,
        }}
      />

      {/* PERIMETRAL GLOW EFFECT */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none",
          "absolute",
          "inset-0",
          "z-[2]",
          "rounded-[inherit]",
          "opacity-0",
          "transition-opacity",
          "duration-500",
          "shadow-[0_0_20px_-15px_var(--input-glow)]"
        )}
        style={{
          opacity: isFocused ? 1 : 0,
        }}
      />

      <div className="relative z-[3] flex w-full flex-1 rounded-[inherit] overflow-hidden">
        <textarea
          ref={textareaRef}
          data-slot="textarea"
          className={cn(
            "flex w-full bg-transparent px-3.5 py-2.5 text-base outline-none placeholder:text-muted-foreground md:text-xs leading-relaxed resize-none",
            appearance === "compact" && "min-h-[64px]",
            appearance === "chat" && "min-h-[48px]",
            (!appearance || appearance === "default") && (props.rows ? "min-h-[64px]" : "min-h-24"),
            showSendButton && "pb-14"
          )}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          {...props}
        />
      </div>

      {showSendButton && (
        <div className="absolute right-3 bottom-3 z-[4]">
          <Button
            size="icon-sm"
            variant="primary"
            className="rounded-2xl shadow-lg shadow-primary/20"
            onClick={handleSend}
          >
            <SendHorizontal className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export { Textarea, textareaVariants }
