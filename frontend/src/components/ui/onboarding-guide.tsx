"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "./button"
import { X } from "lucide-react"

export interface OnboardingStep {
  targetId: string
  title: string
  content: string
}

export function OnboardingGuide({ steps, guideKey }: { steps: OnboardingStep[], guideKey: string }) {
  const [mounted, setMounted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    setMounted(true)
    const seen = localStorage.getItem(guideKey)
    if (!seen) setIsVisible(true)
  }, [guideKey])

  useEffect(() => {
    if (!isVisible || !steps[currentStep]) return
    const target = document.getElementById(steps[currentStep].targetId)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      const updateRect = () => setTargetRect(target.getBoundingClientRect())
      const to = setTimeout(updateRect, 300)
      updateRect()
      window.addEventListener('resize', updateRect)
      window.addEventListener('scroll', updateRect)
      return () => {
        clearTimeout(to)
        window.removeEventListener('resize', updateRect)
        window.removeEventListener('scroll', updateRect)
      }
    } else {
      setTargetRect(null)
    }
  }, [currentStep, isVisible, steps])

  if (!mounted) return null

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed bottom-4 right-4 z-40 bg-background shadow-sm"
        onClick={() => {
           setCurrentStep(0)
           setIsVisible(true)
        }}
      >
        Ver guía nuevamente
      </Button>
    )
  }

  const step = steps[currentStep]
  if (!step) return null

  const finish = () => {
    setIsVisible(false)
    localStorage.setItem(guideKey, 'true')
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-auto" preserveAspectRatio="none">
        <defs>
          <mask id={`spotlight-mask-${guideKey}`}>
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.left - 8} 
                y={targetRect.top - 8} 
                width={targetRect.width + 16} 
                height={targetRect.height + 16} 
                fill="black" 
                rx="8" 
                style={{ transition: 'all 0.3s ease-in-out' }}
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask={`url(#spotlight-mask-${guideKey})`} />
      </svg>

      <AnimatePresence mode="wait">
        {targetRect && (
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute bg-popover text-popover-foreground border border-border shadow-lg p-4 rounded-md w-72 pointer-events-auto flex flex-col gap-2"
            style={{
              top: targetRect.bottom + 16 > window.innerHeight - 200 ? targetRect.top - 200 : targetRect.bottom + 16,
              left: Math.max(16, Math.min(targetRect.left, window.innerWidth - 300))
            }}
          >
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-sm leading-tight">{step.title}</h4>
              <button onClick={finish} className="text-muted-foreground hover:text-foreground shrink-0"><X size={16} /></button>
            </div>
            <p className="text-sm text-muted-foreground">{step.content}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium">Paso {currentStep + 1} de {steps.length}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={finish}>Omitir</Button>
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentStep(c => c - 1)}>Anterior</Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={() => setCurrentStep(c => c + 1)}>Siguiente</Button>
                ) : (
                  <Button size="sm" className="h-7 px-2 text-xs" onClick={finish}>Finalizar</Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
