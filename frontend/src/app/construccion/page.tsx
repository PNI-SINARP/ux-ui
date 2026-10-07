"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Layers } from "lucide-react";

export default function Construccion() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-center relative">
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        <div className="size-20 rounded-3xl bg-muted/50 border border-border flex items-center justify-center mb-6">
          <Layers className="size-10 text-foreground" strokeWidth={1.5} />
        </div>

        <Badge
          appearance="outline"
          tone="neutral"
          className="mb-3 border-border text-xs px-3 py-1 font-semibold"
        >
          Etapa de wireframes
        </Badge>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2">
          Función no disponible
        </h1>

        <p className="text-sm sm:text-base font-semibold text-foreground/80 mb-3">
          Función en evaluación de diseño UX/UI
        </p>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
          Esta funcionalidad se encuentra en proceso de validación conceptual, técnica y normativa para la sesión de trabajo con DINARP e instituciones participantes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            asChild
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link href="/catalogo-interoperabilidad">
              Ir al Dashboard
            </Link>
          </Button>
          <Button
            variant="neutral"
            leftIcon={<ArrowLeft className="size-4" />}
            onClick={() => window.history.back()}
          >
            Regresar
          </Button>
        </div>
      </div>
    </div>
  );
}
