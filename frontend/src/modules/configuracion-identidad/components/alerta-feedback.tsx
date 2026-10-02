"use client";

import React from "react";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { FeedbackMensaje } from "../data/types";
import { FEEDBACK_TEXTOS } from "../data/mock-data";

interface AlertaFeedbackProps {
  feedback: FeedbackMensaje | null;
  onCerrar?: () => void;
}

export function AlertaFeedback({ feedback, onCerrar }: AlertaFeedbackProps) {
  if (!feedback) return null;

  const renderIcono = () => {
    switch (feedback.tipo) {
      case "success":
        return <CheckCircle2 className="size-4" />;
      case "warning":
        return <Clock className="size-4" />;
      case "danger":
        return <AlertTriangle className="size-4" />;
      case "info":
      default:
        return <Info className="size-4" />;
    }
  };

  return (
    <div className="w-full animate-fade-in" role="region" aria-live="polite">
      <Alert
        variant={feedback.tipo}
        icon={renderIcono()}
        title={feedback.titulo}
        onClose={onCerrar}
        className="shadow-xs"
      >
        <div className="space-y-1">
          <p className="font-medium text-foreground">{feedback.mensaje}</p>
          {feedback.codigo === "GUARDADA_PENDIENTE" && (
            <p className="text-xs text-muted-foreground">
              Para aplicar cambios de manera efectiva en el servicio, debes ejecutar una prueba técnica satisfactoria.
            </p>
          )}
          {feedback.codigo === "ACTIVA_SATISFACTORIA" && (
            <p className="text-xs text-muted-foreground">
              Los parámetros han sido validados contra el cluster de identidad y se encuentran en operación productiva.
            </p>
          )}
          {feedback.codigo === "NO_ACTIVA_REVISA" && (
            <p className="text-xs text-muted-foreground">
              No es posible activar la configuración actual. Revisa los resultados de la prueba o el aislamiento de entorno.
            </p>
          )}
          {feedback.codigo === "ENTORNO_INCOMPATIBLE" && (
            <p className="text-xs text-muted-foreground">
              Directiva de aislamiento estricto: el entorno de Producción no tolera identificadores o pruebas sintéticas de Pruebas/Staging.
            </p>
          )}
        </div>
      </Alert>
    </div>
  );
}

export { FEEDBACK_TEXTOS };
