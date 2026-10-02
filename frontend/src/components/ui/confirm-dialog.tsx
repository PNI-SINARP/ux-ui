"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, type ButtonVariant } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  variant?: "warning" | "danger" | "success" | "info" | "standard" | "default" | "neutral";
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  isConfirmDisabled?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  size?: "sm" | "default" | "lg" | "xl" | "2xl";
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Confirmar acción",
  description = "¿Estás seguro de que deseas guardar los cambios realizados? Esta acción modificará la configuración del componente.",
  onConfirm,
  variant = "warning",
  icon,
  confirmText,
  cancelText = "Cancelar",
  confirmVariant,
  isConfirmDisabled = false,
  isLoading = false,
  children,
  size = "default",
  className,
}: ConfirmDialogProps) {
  const resolvedConfirmVariant: ButtonVariant =
    confirmVariant ||
    (variant === "danger"
      ? "danger"
      : variant === "warning"
      ? "warning"
      : variant === "success"
      ? "primary"
      : variant === "neutral"
      ? "neutral"
      : "primary");

  const resolvedConfirmText =
    confirmText ||
    (variant === "danger"
      ? "Confirmar acción"
      : variant === "warning"
      ? "Confirmar acción"
      : variant === "success"
      ? "Aceptar"
      : "Sí, continuar");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        variant={variant}
        size={size}
        icon={icon}
        className={cn("sm:max-w-[520px] max-h-[90vh] flex flex-col", className)}
      >
        <DialogHeader className="items-center text-center shrink-0">
          <DialogTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl font-bold font-heading">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="pt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="modal-scroll-area w-full text-left my-2 overflow-y-auto pr-2.5 sm:pr-3 flex-1 min-h-0">
            {children}
          </div>
        )}

        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2.5 w-full shrink-0">
          {cancelText ? (
            <Button
              type="button"
              variant="neutral"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-1/2"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          ) : null}
          <Button
            type="button"
            variant={resolvedConfirmVariant}
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              }
            }}
            disabled={isConfirmDisabled || isLoading}
            className={cn("w-full font-semibold shadow-xs whitespace-nowrap", cancelText ? "sm:w-1/2" : "")}
          >
            {isLoading ? "Procesando..." : resolvedConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
