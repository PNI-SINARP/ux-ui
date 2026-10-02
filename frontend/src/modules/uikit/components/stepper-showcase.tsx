"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  PenTool, 
  FileText, 
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";

interface Step {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { id: "intro", title: "Introducción", description: "Primer contacto", icon: BookOpen },
  { id: "concepts", title: "Conceptos", description: "Bases teóricas", icon: Lightbulb },
  { id: "practice", title: "Práctica", description: "Ejercicios interactivos", icon: PenTool },
  { id: "evaluation", title: "Evaluación", description: "Ponte a prueba", icon: FileText },
  { id: "cert", title: "Finalización", description: "Logro obtenido", icon: Award },
];

export function StepperShowcase() {
  const [activeNode, setActiveNode] = useState(0); // El nodo resaltado visualmente
  const [visibleContent, setVisibleContent] = useState(0); // El contenido que se muestra abajo
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [filledLines, setFilledLines] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = async () => {
    if (activeNode >= STEPS.length - 1 || isAnimating) return;
    const nextIndex = activeNode + 1;

    // Si el usuario simplemente está avanzando sobre pasos que ya completó, 
    // navegamos instantáneamente sión animación lenta.
    if (completedNodes.includes(activeNode) && filledLines.includes(activeNode)) {
      setActiveNode(nextIndex);
      setVisibleContent(nextIndex);
      return;
    }

    // Iniciar secuencia de animación controlada y continua
    setIsAnimating(true);

    // 1. Confirmar el paso actual (180mas animación + margen)
    setCompletedNodes(prev => [...new Set([...prev, activeNode])]);
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. Llenar suavemente la línea hacia el siguiente paso
    setFilledLines(prev => [...new Set([...prev, activeNode])]);
    await new Promise(resolve => setTimeout(resolve, 350)); // Tiempo alineado con la duración de la línea

    // 3 y 4. Activar el siguiente nodo (icono y texto cambian)
    setActiveNode(nextIndex);
    await new Promise(resolve => setTimeout(resolve, 150));

    // 5 y 6. Mostrar el contenido del nuevo paso con transición
    setVisibleContent(nextIndex);
    await new Promise(resolve => setTimeout(resolve, 250)); // Esperar a que el contenido aparezca

    setIsAnimating(false);
  };

  const handlePrev = async () => {
    if (activeNode > 0 && !isAnimating) {
      setIsAnimating(true);
      const prevIndex = activeNode - 1;
      
      // Retraer línea suavemente hacia atrás
      setFilledLines(prev => prev.filter(line => line !== prevIndex));
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Desmarcar el nodo actual como completado
      setCompletedNodes(prev => prev.filter(node => node !== activeNode));
      
      setActiveNode(prevIndex);
      setVisibleContent(prevIndex);
      await new Promise(resolve => setTimeout(resolve, 250));
      
      setIsAnimating(false);
    }
  };

  const handleStepClick = async (index: number) => {
    if (isAnimating || index === activeNode) return;
    
    if (index < activeNode) {
      setIsAnimating(true);
      
      // Retraer todas las líneas posteriores al nodo destino
      setFilledLines(prev => prev.filter(line => line < index));
      await new Promise(resolve => setTimeout(resolve, 350));
      
      // Desmarcar los nodos posteriores
      setCompletedNodes(prev => prev.filter(node => node <= index));
      
      setActiveNode(index);
      setVisibleContent(index);
      await new Promise(resolve => setTimeout(resolve, 250));
      
      setIsAnimating(false);
    }
  };

  return (
    <div className="p-8 rounded-xl border border-border bg-card shadow-sm">
        <div className="sr-only" aria-live="polite">
          Paso {STEPS[activeNode].title} en curso. Paso {activeNode + 1} de {STEPS.length}.
        </div>
        
        <div className="w-full flex flex-col gap-16 mt-4">
          <div>
            <h3 className="text-sm font-semibold mb-6">Versión Horizontal</h3>
            <Stepper 
              steps={STEPS}
              activeStep={activeNode}
              completedSteps={completedNodes}
              onStepClick={handleStepClick}
              orientation="horizontal"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-6">Versión Vertical</h3>
            <div className="max-w-xs">
              <Stepper 
                steps={STEPS}
                activeStep={activeNode}
                completedSteps={completedNodes}
                onStepClick={handleStepClick}
                orientation="vertical"
              />
            </div>
          </div>
        </div>

        {/* Contenido Dinámico del Paso */}
        <div className="mt-12 p-8 rounded-lg bg-surface border border-border/60 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={visibleContent}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className="text-center"
            >
              <h4 className="text-base font-bold text-foreground mb-2">
                Contenido de {STEPS[visibleContent].title}
              </h4>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Este es el paso interactivo correspondiente a la sección de {STEPS[visibleContent].title.toLowerCase()}. Completa las taaaaareas indicadas en esta sección antes de avanzar.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Botones de Navegación */}
        <div className="mt-8 flex justify-between items-center gap-4">
          <Button
            variant="neutral"
            onClick={handlePrev}
            disabled={visibleContent === 0 || isAnimating}
            leftIcon={<ArrowLeft className="size-4" />}
          >
            Anterior
          </Button>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isAnimating || visibleContent === STEPS.length - 1}
            rightIcon={visibleContent !== STEPS.length - 1 ? <ArrowRight className="size-4" /> : <Check className="size-4" />}
          >
            {visibleContent === STEPS.length - 1 ? "Finalizar" : "Siguiente"}
          </Button>
        </div>
      </div>
  );
}
