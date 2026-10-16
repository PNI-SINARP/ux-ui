"use client";

import React from "react";
import { Check, Clock, AlertTriangle, XCircle, ShieldCheck, FileCheck, Layers } from "lucide-react";
import { SolicitudEstado } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { cn } from "@/lib/utils";

interface StepItem {
  id: string;
  label: string;
  sublabel: string;
}

interface SolicitudProcesoStepperProps {
  estado: SolicitudEstado;
  hasConfidencial: boolean;
  tipoInstitucion: "Pública" | "Privada";
}

export function SolicitudProcesoStepper({
  estado,
  hasConfidencial,
  tipoInstitucion
}: SolicitudProcesoStepperProps) {
  // Construir dinámicamente los pasos del proceso
  const steps: StepItem[] = [
    { id: "solicitud", label: "1. Solicitud", sublabel: "Envío inicial" },
    { id: "gestion", label: "2. Gestión", sublabel: "Revisión técnica" },
  ];

  if (hasConfidencial) {
    steps.push({ id: "normatividad", label: "3. Normatividad", sublabel: "Revisión jurídica" });
  }

  const formalizacionIndex = steps.length + 1;
  steps.push({
    id: "formalizacion",
    label: `${formalizacionIndex}. Formalización`,
    sublabel: tipoInstitucion === "Pública" ? "Expediente" : "Contrato y pago"
  });

  const aprobacionIndex = steps.length + 1;
  steps.push({
    id: "aprobacion",
    label: `${aprobacionIndex}. Aprobación final`,
    sublabel: "Resolución de Dirección"
  });

  const habilitacionIndex = steps.length + 1;
  steps.push({
    id: "habilitacion",
    label: `${habilitacionIndex}. Habilitación`,
    sublabel: "Acceso y credenciales"
  });

  // Determinar qué paso está activo o completado según el estado funcional
  const getStepStatus = (stepId: string): "completed" | "current" | "upcoming" | "error" | "observed" => {
    const est = String(estado);

    if (est === "Cerrada" || est === "Cerrada por vencimiento") {
      if (stepId === "gestion") return "error";
      return "upcoming";
    }

    if (est === "Requiere corrección" || est === "Observada" || est === "Con observaciones") {
      if (stepId === "gestion" || (stepId === "normatividad" && hasConfidencial)) return "observed";
    }

    // Paso 1: Solicitud
    if (stepId === "solicitud") {
      return est === "Borrador" ? "current" : "completed";
    }

    // Paso 2: Gestión
    if (stepId === "gestion") {
      if (est === "Borrador") return "upcoming";
      if (
        est === "Enviada" ||
        est === "Pendiente de asignación" ||
        est === "En revisión" ||
        est === "Por revisar" ||
        est === "Reenviada"
      ) {
        return "current";
      }
      return "completed";
    }

    // Paso 3: Normatividad (si aplica)
    if (stepId === "normatividad") {
      if (est === "Enviada" || est === "Pendiente de asignación" || est === "En revisión" || est === "Por revisar" || est === "Borrador") {
        return "upcoming";
      }
      if (
        est === "En revisión jurídica" ||
        est === "Pendiente de asignación jurídica" ||
        est === "Pendiente firma informe"
      ) {
        return "current";
      }
      return "completed";
    }

    // Paso 4: Formalización
    if (stepId === "formalizacion") {
      if (
        est === "En formalización" ||
        est === "Pendiente de firma" ||
        est === "Pendiente de firma de contrato" ||
        est === "Contrato firmado" ||
        est === "Pendiente de pago" ||
        est === "Pago pendiente" ||
        est === "Pago en validación" ||
        est === "Pago en verificación" ||
        est === "Pendiente de validación de pago"
      ) {
        return "current";
      }
      if (
        est === "Pago verificado" ||
        est === "Pago validado" ||
        est === "Aprobación final" ||
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado" ||
        est === "Acceso generado"
      ) {
        return "completed";
      }
      return "upcoming";
    }

    // Paso 5: Aprobación final
    if (stepId === "aprobacion") {
      if (est === "Aprobación final" || est === "Pago verificado" || est === "Pago validado") {
        return "current";
      }
      if (
        est === "Solicitud aprobada — habilitación técnica pendiente" ||
        est === "Habilitación técnica" ||
        est === "Acceso habilitado" ||
        est === "Acceso generado"
      ) {
        return "completed";
      }
      return "upcoming";
    }

    // Paso 6: Habilitación técnica
    if (stepId === "habilitacion") {
      if (est === "Solicitud aprobada — habilitación técnica pendiente" || est === "Habilitación técnica") {
        return "current";
      }
      if (est === "Acceso habilitado" || est === "Acceso generado") {
        return "completed";
      }
      return "upcoming";
    }

    return "upcoming";
  };

  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-5 shadow-xs overflow-x-auto">
      <div className="min-w-[620px] flex items-center justify-between relative">
        {/* Línea conectora de fondo */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-border -z-0" />

        {steps.map((step, idx) => {
          const status = getStepStatus(step.id);
          const isCompleted = status === "completed";
          const isCurrent = status === "current";
          const isObserved = status === "observed";
          const isError = status === "error";

          return (
            <div key={step.id} className="flex flex-col items-center text-center relative z-10 px-2 flex-1">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors border-2",
                  isCompleted && "bg-primary border-primary text-primary-foreground shadow-xs",
                  isCurrent && "bg-background border-primary text-primary ring-4 ring-primary/15 animate-pulse",
                  isObserved && "bg-background border-amber-500 text-amber-600 ring-4 ring-amber-500/15",
                  isError && "bg-destructive border-destructive text-destructive-foreground",
                  !isCompleted && !isCurrent && !isObserved && !isError && "bg-muted/70 border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-[2.5]" />
                ) : isObserved ? (
                  <AlertTriangle className="size-4 text-amber-600" />
                ) : isError ? (
                  <XCircle className="size-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <span
                className={cn(
                  "text-xs font-semibold mt-2 truncate max-w-[110px]",
                  (isCurrent || isCompleted) && "text-foreground",
                  isObserved && "text-amber-700 dark:text-amber-400",
                  isError && "text-destructive",
                  !isCurrent && !isCompleted && !isObserved && !isError && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                {step.sublabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
