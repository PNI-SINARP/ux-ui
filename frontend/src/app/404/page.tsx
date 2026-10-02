"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function Page404() {
  return (
    <div className="min-h-screen w-full bg-[#f8faff] dark:bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-info/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-[120px] sm:text-[180px] md:text-[220px] font-bold text-foreground leading-none tracking-tighter mb-4 font-heading">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-4">
          ¡Ups! Página no encontrada.
        </h2>

        <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md mx-auto mb-8 leading-relaxed">
          Lo sentimos, la página que buscas no existe, ha sido movida o no está disponible en este momento.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            asChild
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link href="/wireframes/dashboard">
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

