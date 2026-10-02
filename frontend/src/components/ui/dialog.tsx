"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  XIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
  HelpCircle,
  Check,
  Trash2,
  UserX,
  AlertCircle,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const dialogVariants = cva(
  "fixed top-1/2 left-1/2 z-50 flex flex-col w-[calc(100%-2rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl sm:rounded-3xl border border-border/40 bg-background duration-300 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 shadow-2xl overflow-hidden",
  {
    variants: {
      variant: {
        standard: "p-6 sm:p-7 shadow-xl", // Normal layout
        default: "p-6 sm:p-7 shadow-primary/5", // Alert layout
        success: "p-6 sm:p-7 shadow-success/5",
        danger: "p-6 sm:p-7 shadow-danger/5",
        warning: "p-6 sm:p-7 shadow-warning/5",
        info: "p-6 sm:p-7 shadow-info/5",
        neutral: "p-6 sm:p-7 shadow-neutral/5",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
      },
    },
    defaultVariants: {
      variant: "standard",
      size: "default",
    },
  },
);

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/40 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function DialogIcon({
  variant,
  icon,
}: {
  variant?:
  | "standard"
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | null;
  icon?: React.ReactNode;
}) {
  if (!variant || variant === "default" || variant === "standard") return null;

  const defaultIcons = {
    success: <CheckCircle2 className="size-10 text-success stroke-[2px]" />,
    danger: <AlertCircle className="size-10 text-danger stroke-[2px]" />,
    warning: <AlertTriangle className="size-10 text-warning stroke-[2px]" />,
    info: <Info className="size-10 text-info stroke-[2px]" />,
    neutral: <HelpCircle className="size-10 text-muted-foreground stroke-[2px]" />,
  };

  const bgColors = {
    success: "bg-success/15",
    danger: "bg-danger/15",
    warning: "bg-warning/15",
    info: "bg-info/15",
    neutral: "bg-muted",
  };

  const bgColor = bgColors[variant as keyof typeof bgColors];

  return (
    <div className="flex justify-center w-full mt-1 mb-2.5 sm:mt-1.5 sm:mb-3 relative shrink-0">
      <div className={cn("flex items-center justify-center size-16 sm:size-18 rounded-full transition-transform duration-500 hover:scale-105 shrink-0", bgColor)}>
        {icon ?? defaultIcons[variant as keyof typeof defaultIcons]}
      </div>
    </div>
  );
}

function DialogContent({
  className,
  children,
  variant,
  size,
  icon,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogVariants> & {
    showCloseButton?: boolean;
    icon?: React.ReactNode;
  }) {
  const isAlert = variant && variant !== "standard";

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          dialogVariants({ variant, size }),
          "overflow-hidden",
          className,
        )}
        {...props}
      >
        {isAlert && (
          <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden pointer-events-none rounded-t-[2rem]">
            <div
              className={cn(
                "absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-[100%] blur-[60px] opacity-25 transition-all duration-1000",
                variant === "success" &&
                "bg-gradient-to-b from-success via-success/40 to-transparent",
                variant === "danger" &&
                "bg-gradient-to-b from-danger via-danger/40 to-transparent",
                variant === "warning" &&
                "bg-gradient-to-b from-warning via-warning/40 to-transparent",
                variant === "info" &&
                "bg-gradient-to-b from-info via-info/40 to-transparent",
                (variant === "default" || !variant) &&
                "bg-gradient-to-b from-primary via-primary/30 to-transparent",
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "relative z-10 flex flex-col w-full flex-1 min-h-0",
            isAlert ? "items-center text-center gap-2" : "gap-4",
          )}
        >
          {isAlert && variant !== "default" && <DialogIcon variant={variant} icon={icon} />}
          {children}
        </div>

        {showCloseButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogPrimitive.Close
                  data-slot="dialog-close"
                  asChild
                  className="absolute top-4 right-4 z-20"
                >
                  <Button
                    variant="ghost"
                    className="rounded-full size-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                    size="icon"
                  >
                    <XIcon className="size-4" />
                    <span className="sr-only">Cerrar</span>
                  </Button>
                </DialogPrimitive.Close>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-[60]">
                Cerrar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 w-full", className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  stacked = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
  stacked?: boolean;
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 w-full pt-4",
        !stacked &&
        "sm:flex-row sm:flex-wrap-reverse sm:justify-center sm:gap-3 [&>*]:w-full sm:[&>*]:flex-1 sm:[&>*]:min-w-[140px]",
        stacked && "[&>*]:w-full",
        className,
      )}
      {...props}
    >
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="neutral">Cerrar</Button>
        </DialogPrimitive.Close>
      )}
      {children}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-xl sm:text-2xl font-heading font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
