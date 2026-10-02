"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Check } from "lucide-react";

export interface TourStep {
  id: string;
  target: string; // CSS Selector
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  onBeforeStep?: () => void;
}

interface WireframeTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function WireframeTour({
  isOpen,
  onClose,
  steps,
  currentStep,
  onStepChange
}: WireframeTourProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; placement: "top" | "bottom" }>({
    top: 0,
    left: 0,
    placement: "bottom"
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeStep = steps[currentStep];

  const calculatePosition = useCallback((element: Element) => {
    const rect = element.getBoundingClientRect();
    setTargetRect(rect);

    const popoverWidth = Math.min(380, typeof window !== "undefined" ? window.innerWidth - 32 : 360);
    const popoverHeight = 220;
    const margin = 14;

    let top = rect.bottom + margin;
    let left = Math.max(16, rect.left + (rect.width / 2) - (popoverWidth / 2));
    let placement: "top" | "bottom" = "bottom";

    const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const winWidth = typeof window !== "undefined" ? window.innerWidth : 1200;

    // Si desborda por abajo y hay espacio arriba, posicionar encima del elemento
    if (top + popoverHeight > winHeight - 16 && rect.top - popoverHeight - margin > 16) {
      top = rect.top - popoverHeight - margin;
      placement = "top";
    }

    // Clamping dentro del viewport visible
    if (left + popoverWidth > winWidth - 16) {
      left = winWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    if (top + popoverHeight > winHeight - 16) {
      top = winHeight - popoverHeight - 16;
    }
    if (top < 16) top = 16;

    setPopoverPos({ top, left, placement });
  }, []);

  const updatePosition = useCallback(() => {
    if (!isOpen || !activeStep) return;

    if (activeStep.onBeforeStep) {
      activeStep.onBeforeStep();
    }

    // Dar tiempo para que React aplique aperturas de acordeón y el DOM se estabilice
    const timer = setTimeout(() => {
      const element = document.querySelector(activeStep.target);
      if (!element) {
        setTargetRect(null);
        return;
      }

      // Llevar al elemento visible en el centro del scroll
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });

      calculatePosition(element);

      const t1 = setTimeout(() => calculatePosition(element), 120);
      const t2 = setTimeout(() => calculatePosition(element), 300);
      const t3 = setTimeout(() => calculatePosition(element), 550);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, activeStep, calculatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const cleanup = updatePosition();

    // Listener de scroll y resize para recalcular posición dinámicamente y permitir scroll continuo
    const handleScrollOrResize = () => {
      if (!activeStep) return;
      const element = document.querySelector(activeStep.target);
      if (element) {
        calculatePosition(element);
      }
    };

    window.addEventListener("resize", handleScrollOrResize, { passive: true });
    window.addEventListener("scroll", handleScrollOrResize, { capture: true, passive: true });

    // Cierre con Escape y navegación con teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < steps.length - 1) {
          onStepChange(currentStep + 1);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) {
          onStepChange(currentStep - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cleanup?.();
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeStep, currentStep, steps.length, onClose, onStepChange, updatePosition, calculatePosition]);

  if (!isOpen || !activeStep) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Fondo oscurecido sin bloquear scroll del usuario */}
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-[0.5px] transition-opacity duration-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* Target Highlight Ring & Spotlight Cutout */}
      {targetRect && (
        <div
          className="fixed rounded-lg pointer-events-none transition-all duration-150 ease-out ring-4 ring-foreground/50 ring-offset-2 ring-offset-background shadow-2xl"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.40)"
          }}
        />
      )}

      {/* Floating Coachmark Popover Card - Interactivo con pointer-events-auto */}
      <div
        ref={popoverRef}
        role="dialog"
        aria-label={`Paso ${currentStep + 1}: ${activeStep.title}`}
        className="fixed z-50 w-full max-w-sm bg-card border border-border shadow-2xl rounded-xl p-5 flex flex-col gap-4 pointer-events-auto transition-all duration-150 text-foreground"
        style={{
          top: Math.max(16, popoverPos.top),
          left: Math.max(16, popoverPos.left)
        }}
      >
        {/* Header: Badge Paso X de N, Icono y Botón Cerrar */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="size-6 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-xs shrink-0">
              {currentStep + 1}
            </span>
            <Badge tone="neutral" appearance="soft" size="sm" className="font-mono text-[11px]">
              Paso {currentStep + 1} de {steps.length}
            </Badge>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
            aria-label="Cerrar recorrido"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Contenido: Título y Descripción */}
        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-base font-bold text-foreground">
            {activeStep.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {activeStep.description}
          </p>
        </div>

        {/* Indicadores de progreso (Dots) */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onStepChange(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? "w-6 bg-foreground"
                  : idx < currentStep
                    ? "w-2 bg-foreground/40 hover:bg-foreground/60"
                    : "w-2 bg-muted hover:bg-muted-foreground/40"
              }`}
              aria-label={`Ir al paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Footer: Omitir / Anterior / Siguiente o Finalizar */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground px-2 h-8"
          >
            Omitir recorrido
          </Button>

          <div className="flex items-center gap-1.5">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStepChange(currentStep - 1)}
                className="text-xs gap-1 h-8 px-2.5"
              >
                <ChevronLeft className="size-3.5" />
                <span>Anterior</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (isLastStep) {
                  onClose();
                } else {
                  onStepChange(currentStep + 1);
                }
              }}
              className="text-xs gap-1.5 h-8 px-3 font-semibold"
            >
              <span>{isLastStep ? "Finalizar" : "Siguiente"}</span>
              {isLastStep ? <Check className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
