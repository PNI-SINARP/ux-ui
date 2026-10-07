
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-[#f8faff] dark:bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-info/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center">

        <h1 className="text-[140px] sm:text-[200px] md:text-[250px] font-bold text-foreground leading-none tracking-tighter mb-4">
          404
        </h1>

        <h2 className="text-3xl sm:text-4xl md:text-[42px] font-bold text-foreground tracking-tight mb-6">
          ¡Ups! Página no encontrada.
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground/80 max-w-md mx-auto mb-10 leading-relaxed">
          Lo sentimos, la página que buscas no existe, ha sido movida o no está disponible en este momento.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/catalogo-interoperabilidad">
            <Button variant="primary" size="lg" className="rounded-full px-8 py-6 text-base font-semibold shadow-md hover:-translate-y-0.5 transition-transform">
              Ir al Dashboard <ArrowRight className="ml-2 size-5" />
            </Button>
          </Link>
          <Button variant="neutral" size="lg" className="rounded-full px-8 py-6 text-base font-semibold transition-colors" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 size-5" /> Regresar
          </Button>
        </div>

      </div>
    </div>
  );
}
