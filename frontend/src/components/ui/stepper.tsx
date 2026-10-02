"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface StepperProps {
  steps: Step[];
  activeStep: number;
  completedSteps?: number[];
  onStepClick?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "tabs-pill";
  stepPrefix?: string;
  startIndex?: number;
  showTitle?: boolean;
  size?: "default" | "sm";
  showBadge?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  activeStep,
  completedSteps = [],
  onStepClick,
  orientation = "horizontal",
  variant = "default",
  stepPrefix = "Paso",
  startIndex = 1,
  showTitle = true,
  size = "default",
  showBadge = true,
  className,
}: StepperProps) {
  const isVertical = orientation === "vertical";
  const isSmall = size === "sm";

  if (variant === "tabs-pill") {
    return (
      <div className={cn("w-auto", className)}>
        <nav aria-label="Pasos" className="flex items-center gap-4 sm:gap-6 shrink-0">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index) || index < activeStep;
            const isActive = index === activeStep;
            const isClickable = Boolean(onStepClick && (isCompleted || isActive));

            return (
              <button
                key={step.id || index}
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "text-left transition-all select-none outline-none",
                  isActive
                    ? "bg-foreground text-background px-4 py-2 rounded-xl shadow-xs cursor-default"
                    : isCompleted
                      ? "text-muted-foreground hover:text-foreground cursor-pointer px-1 py-1"
                      : "text-muted-foreground/60 cursor-not-allowed px-1 py-1",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-xl"
                )}
              >
                <span
                  className={cn(
                    "block text-xs font-bold leading-tight",
                    isActive ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {index + startIndex}.
                </span>
                <span
                  className={cn(
                    "block text-sm font-bold tracking-tight leading-tight",
                    isActive ? "text-background" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-none", className)}>
      <ol className={cn(
        "flex w-full relative",
        isVertical ? "flex-col items-start gap-6" : "flex-row items-start justify-between w-full"
      )}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < activeStep;
          const isActive = index === activeStep;
          const isPending = index > activeStep && !isCompleted;

          // Determine Icon to show
          const Icon = isCompleted ? Check : step.icon;

          return (
            <li
              key={step.id}
              className={cn(
                "relative group flex px-1",
                isVertical ? "flex-row items-start w-full" : "flex-col items-center flex-1 min-w-0 max-w-full"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {/* Conector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "absolute bg-border z-0",
                  isVertical
                    ? isSmall
                      ? "left-[14px] top-[28px] bottom-[-24px] w-[2px]"
                      : "left-[19px] top-[40px] bottom-[-32px] w-[2px]"
                    : isSmall
                      ? "top-[14px] left-[50%] right-[-50%] h-[2px]"
                      : "top-[19px] left-[50%] right-[-50%] h-[2px]"
                )}>
                  <motion.div
                    className={cn(
                      "origin-top-left",
                      (completedSteps.includes(index) || activeStep > index) ? "bg-success" : "bg-primary",
                      isVertical ? "w-full h-full" : "h-full w-full"
                    )}
                    initial={isVertical ? { scaleY: 0 } : { scaleX: 0 }}
                    animate={
                      isVertical
                        ? { scaleY: completedSteps.includes(index) || activeStep > index ? 1 : 0 }
                        : { scaleX: completedSteps.includes(index) || activeStep > index ? 1 : 0 }
                    }
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                  />
                </div>
              )}

              {/* Icon Node */}
              <div className={cn("relative z-10", isVertical ? "mr-3" : isSmall ? "mb-1.5" : "mb-3")}>
                <motion.button
                  type="button"
                  onClick={() => onStepClick?.(index)}
                  disabled={isPending || !onStepClick}
                  aria-disabled={isPending || !onStepClick}
                  animate={
                    isCompleted && !isActive ? { scale: [1, 0.95, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                  className={cn(
                    "rounded-full flex items-center justify-center transition-all duration-300 outline-none",
                    isSmall ? "size-7" : "size-10",
                    isActive ? "ring-4 ring-primary/20 dark:ring-primary/40 ring-offset-0" : "focus-visible:ring-2 focus-visible:ring-ring",
                    isCompleted
                      ? "bg-success text-white border-2 border-success shadow-xs"
                      : isActive
                        ? "bg-primary text-primary-foreground border-2 border-primary shadow-xs"
                        : "bg-surface border-2 border-dashed border-border text-muted-foreground",
                    isPending || !onStepClick ? (isPending ? "cursor-not-allowed" : "cursor-default") : "cursor-pointer hover:opacity-80"
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={isCompleted ? "completed" : isActive ? "active" : "pending"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-center"
                    >
                      {Icon ? (
                        <Icon className={cn(isSmall ? "size-3.5" : "size-4", isCompleted ? "stroke-[3px]" : "stroke-[2px]")} />
                      ) : (
                        <span className={cn(isSmall ? "text-xs" : "text-sm", "font-bold select-none leading-none")}>
                          {index + startIndex}
                        </span>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Textos */}
              <div className={cn(
                "flex flex-col z-10",
                isVertical ? "items-start text-left mt-[-2px]" : "items-center text-center w-full min-w-0 px-1"
              )}>
                <span className={cn(
                  "font-bold text-muted-foreground uppercase tracking-widest",
                  isSmall ? "text-[9px] mb-0.5" : "text-[10px] mb-0.5"
                )}>
                  {stepPrefix} {index + startIndex}
                </span>
                {showTitle && step.title && (
                  <span className={cn(
                    "font-semibold transition-colors duration-300 text-center leading-tight whitespace-normal break-words text-balance max-w-full",
                    isSmall ? "text-xs mb-0.5" : "text-xs sm:text-sm mb-1.5",
                    isActive ? "text-foreground font-bold" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                )}

                {/* Status Badge */}
                {showBadge && (
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors",
                    isCompleted
                      ? "bg-muted text-foreground font-semibold"
                      : isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-danger/10 text-danger border border-danger/20"
                  )}>
                    {isCompleted ? "Completado" : isActive ? "En curso" : "Pendiente"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
