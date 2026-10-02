"use client";
import { SubSection } from "./sub-section";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Bell, AlertTriangle, Info, CheckCircle2, XCircle, ShieldAlert, Clock, Search, HelpCircle, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Banner, ProgressBar, EmptyState } from "@/components/ui/data-display";
import { Skeleton } from "@/components/ui/skeleton";
import { DINARPSpinner } from "@/components/ui/dinarp-spinner";
import { ToastShowcase } from "./toast-showcase";
import { TooltipShowcase } from "./tooltip-showcase";
import { Alert } from "@/components/ui/alert";




export function FeedbackStatesShowcase({ registerSection }: { registerSection?: (id: string, el: HTMLElement | null) => void }) {
  const [progressVal, setProgressVal] = React.useState(35);
  const [isProcessing, setIsProcessing] = React.useState(true);

  React.useEffect(() => {
    if (!isProcessing) return;
    const timer = setInterval(() => {
      setProgressVal((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 400);
    return () => clearInterval(timer);
  }, [isProcessing]);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-12">
      {/* SPINNER DE CARGA (NUEVO COMPONENTE INSTITUCIONAL) */}
      <SubSection icon={Loader2} id="loading-spinner-institucional" title="Spinner de carga" description="Indicador visual útilizado para comunicar que el sistema está procesando información o esperando una respuesta." registerSection={registerSection}>
        <div className="space-y-12">
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-foreground">Tamaños</h4>
            <div className="flex items-center gap-12 flex-wrap">
              <div className="flex flex-col items-center gap-4">
                <DINARPSpinner size="sm" hideLabel={true} />
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">sm</span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <DINARPSpinner size="md" hideLabel={true} />
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">md</span>
              </div>
              <div className="flex flex-col items-center gap-4">
                <DINARPSpinner size="lg" hideLabel={true} />
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">lg</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-border/50 pt-8">
            <h4 className="text-sm font-bold text-foreground">Con mensaje de carga</h4>
            <div className="flex items-center justify-center p-8 bg-surface/50 border border-border/50 rounded-xl">
              <DINARPSpinner size="md" label="Cargando información..." />
            </div>
          </div>
        </div>
      </SubSection>

      {/* 3. SKELETON & PROGRESS BAR ANIMADO */}
      <SubSection icon={Loader2} id="loading-states" title="Skeleton & Progress Bar" description="Indicadores visuales que informan al usuario que el sistema está cargando, procesando o preparando información. Ayudan a reducir la incertidumbre durante acciones que requieren tiempo de espera." registerSection={registerSection}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-foreground">Skeleton</h4>
            <p className="text-xs text-muted-foreground mb-4">Representa temporalmente la estructura del contenido mientras la información aareal termina de cargar, evitando que la interfaz se perciba vacía o inestable.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 p-4 border border-border rounded-xl">
                <div className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="space-y-3 p-4 border border-border rounded-xl">
                <Skeleton className="h-[80px] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Progress Bar Dinámica con Simulador */}
          <div className="space-y-3 p-4 rounded-xl border border-border/60 bg-surface/60">
            <div className="flex flex-col gap-1 mb-2">
              <h4 className="text-sm font-bold text-foreground">Barra de progreso</h4>
              <p className="text-xs text-muted-foreground">Indica cuánto ha avanzado una taaarea y cuánto falta para completarla. Es adecuada para procesos donde el sistema puede calcular el porcentaje de progreso.</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setProgressVal(0)}>
                Reiniciar
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsProcessing(!isProcessing)}>
                {isProcessing ? "Pausar" : "Simular Avance"}
              </Button>
            </div>
            <ProgressBar value={progressVal} showValue label="Procesando archivo GeoJSON de escuelas..." />
          </div>
        </div>
      </SubSection>

      {/* 3. SPECIALIZED EMPTY STATES */}
      <SubSection color="info" icon={Inbox} id="empty-states" title="Estados vacíos y especiales" description="Mensajes que explican qué está ocurriendo cuando una sección no puede mostrar su contenido habitual y orientan al usuario sobre qué puede hacer a continuación." registerSection={registerSection}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground min-h-8">Se muestra cuando todavía no existe información registrada en una sección. Debe orientar al usuario hacia la acción necesaria para comenzar.</p>
            <EmptyState
              title="Aún no hay datos"
              description="Comienza agregando información al sistema."
              
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground min-h-8">Se útiliza cuando una búsqueda o combinación de filtros no devuelve coincidencias.</p>
            <EmptyState
              type="search"
              title="No se encontraron resultados"
              description="No encontramos información que coincida con los filtros seleccionados."
              
            />
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground min-h-8">Informa que ocurrió un problema inesperado y que el contenido solicitado no pudo cargarse o procesarse correctamente.</p>
            <EmptyState
              type="error"
              title="Algo salió mal"
              description="No pudimos cargar la información solicitada. Intenta nuevamente."
              
            />
          </div>
        </div>
      </SubSection>

      {/* 4. ALERT */}
      <SubSection icon={Bell} id="alert" title="Alert" description="Mensajes persistentes dentro del contenido." registerSection={registerSection}>
        <div className="flex flex-col gap-4 max-w-3xl">
          <Alert variant="info" icon={<Info className="h-4 w-4" />} title="Información">
            Las capas satelitales fueron actualizadas hoy a las 08:00 AM.
          </Alert>
          <Alert variant="success" icon={<CheckCircle2 className="h-4 w-4" />} title="Guardado exitoso">
            El reporte de incidente se ha registrado correctamente en el sistema.
          </Alert>
          <Alert variant="warning" icon={<AlertTriangle className="h-4 w-4" />} title="Advertencia"  onClose={() => { }}>
            Existen 3 zonas con alertas preventivas que requieren atención.
          </Alert>
          <Alert variant="danger" icon={<XCircle className="h-4 w-4" />} title="Error de conexión">
            No se pudo conectar con el servidor geográfico. Intenta de nuevo más tarde.
          </Alert>
          <Alert icon={<Bell className="h-4 w-4" />}>
            Mensaje neutral por defecto.
          </Alert>
        </div>
      </SubSection>

      <ToastShowcase registerSection={registerSection} />
      <TooltipShowcase registerSection={registerSection} />
      <Toaster />
    </div>
  );
}
