"use client";

import React, { useState } from "react";
import { ChevronDown, Info, Scale, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AyudaPermanenteCampoBN07Props {
  tipoCampoFormulario: "finalidad" | "justificacion";
  clasificacion?: "Accesible" | "Confidencial";
  esSensible?: boolean;
  codigoParametro?: string;
  titulo?: string;
  criterioOrientacion?: string;
  instruccion?: string;
  ejemploReferencial?: string;
  mostrarEjemplo?: boolean;
  esProvisional?: boolean;
  etiquetaProvisional?: string;
  tieneOverrideCampo?: boolean;
  campoNombre?: string;
  className?: string;
  defaultExpanded?: boolean;
}

function limpiarTextoGuia(texto: string): string {
  if (!texto) return "";
  return texto
    .replace(/^\[Texto provisional[^\]]*\]\s*/i, "")
    .replace(/^Ejemplo referencial\s*\(no normativo\)\s*:\s*/i, "")
    .replace(/^[«"]|[»"]$/g, "")
    .trim();
}

export function AyudaPermanenteCampoBN07({
  tipoCampoFormulario,
  clasificacion = "Accesible",
  esSensible = false,
  instruccion,
  criterioOrientacion,
  ejemploReferencial,
  mostrarEjemplo = true,
  campoNombre,
  className,
  defaultExpanded = false,
}: AyudaPermanenteCampoBN07Props) {
  const [desplegado, setDesplegado] = useState(defaultExpanded);

  const esJustificacion = tipoCampoFormulario === "justificacion";
  const esConfidencialSensible = clasificacion === "Confidencial" && esSensible;

  // Frase corta y directa de orientación
  let textoOrientacion = limpiarTextoGuia(instruccion || criterioOrientacion || "");

  // Si no hay texto provisto, usar default limpio adaptado al campo
  if (!textoOrientacion) {
    if (!esJustificacion) {
      textoOrientacion = campoNombre
        ? `Indica en qué trámite utilizarás el campo “${campoNombre}” y por qué es necesario.`
        : "Indica en qué trámite utilizarás este campo y por qué es necesario.";
    } else if (esConfidencialSensible) {
      textoOrientacion = campoNombre
        ? `Indica la norma habilitante y el supuesto del Art. 26 de la LOPDP para el campo “${campoNombre}”.`
        : "Indica la norma habilitante y el supuesto del Art. 26 de la LOPDP.";
    } else {
      textoOrientacion = campoNombre
        ? `Indica la norma legal y artículo que facultan a tu entidad a consultar el campo “${campoNombre}”.`
        : "Indica la norma legal y artículo que facultan a tu entidad a consultar este campo.";
    }
  } else if (campoNombre && textoOrientacion.includes("{campo}")) {
    textoOrientacion = textoOrientacion.replace(/\{campo\}/g, campoNombre);
  }

  // Ejemplo contextual limpio
  let ejemploLimpio = ejemploReferencial ? limpiarTextoGuia(ejemploReferencial) : "";
  if (campoNombre && ejemploLimpio.includes("{campo}")) {
    ejemploLimpio = ejemploLimpio.replace(/\{campo\}/g, campoNombre);
  }

  // Icono contextual sutil
  const Icono = esJustificacion
    ? esConfidencialSensible
      ? ShieldAlert
      : Scale
    : Info;

  const iconToneClass = esJustificacion
    ? esConfidencialSensible
      ? "text-danger"
      : "text-warning"
    : "text-primary";

  return (
    <div className={cn("mt-1.5 space-y-1 text-xs select-text", className)}>
      {/* 1. Ícono pequeño y frase corta de orientación */}
      <div className="flex items-start gap-1.5 leading-relaxed">
        <Icono className={cn("size-3.5 shrink-0 mt-0.5", iconToneClass)} />
        <span className="text-foreground/80 font-normal leading-normal">
          {textoOrientacion}
        </span>
      </div>

      {/* 2. Enlace discreto «Ver ejemplo» / «Ocultar ejemplo» */}
      {mostrarEjemplo && Boolean(ejemploLimpio) && (
        <div className="pl-5 space-y-1">
          <button
            type="button"
            onClick={() => setDesplegado((prev) => !prev)}
            aria-expanded={desplegado}
            className="group inline-flex items-center gap-1 text-[11px] font-medium text-secondary hover:text-secondary-600 dark:text-secondary-400 dark:hover:text-secondary-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
          >
            <span>{desplegado ? "Ocultar ejemplo" : "Ver ejemplo"}</span>
            <ChevronDown
              className={cn(
                "size-3 transition-transform duration-200 text-muted-foreground group-hover:text-secondary",
                desplegado && "rotate-180"
              )}
            />
          </button>

          {/* 3. Ejemplo contextual desplegado sin recuadros ni tarjetas */}
          {desplegado && (
            <p className="text-[11px] leading-relaxed text-muted-foreground italic animate-fade-in pl-2 border-l border-border/80">
              «{ejemploLimpio}»
            </p>
          )}
        </div>
      )}
    </div>
  );
}
