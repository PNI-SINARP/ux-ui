"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  CheckCircle2,
  Server,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Info,
} from "lucide-react";
import { FuenteDatos, DespliegueFuente } from "../data/fuentes-data";
import { useFuentesStore } from "../data/fuentes-store";
import { toast } from "sonner";

interface PublicarFuenteDialogProps {
  fuente: FuenteDatos | null;
  coordinadorNombre?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublicada?: () => void;
}

const ETAPAS_DESPLIEGUE = [
  { id: 1, label: "Preparación de versión API y contratos de datos" },
  { id: 2, label: "Despliegue de microservicio y proxy en Apigee Gateway" },
  { id: 3, label: "Confirmación de conectividad y validación de endpoints" },
  { id: 4, label: "Publicación de metadatos en Catálogo Nacional de Interoperabilidad" },
];

export function PublicarFuenteDialog({
  fuente,
  coordinadorNombre = "Carlos Mendoza (Coordinador SINARP)",
  open,
  onOpenChange,
  onPublicada,
}: PublicarFuenteDialogProps) {
  const { publicarFuente, fallarPublicacion } = useFuentesStore();

  const [step, setStep] = useState<"confirm" | "progress" | "success" | "error">("confirm");
  const [currentEtapa, setCurrentEtapa] = useState<number>(1);
  const [simularFallo, setSimularFallo] = useState<boolean>(false);
  const [despliegueResult, setDespliegueResult] = useState<DespliegueFuente | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    etapa: string;
    codigo: string;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setStep("confirm");
      setCurrentEtapa(1);
      setErrorDetails(null);
    }
  }, [open]);

  if (!fuente) return null;

  const handleIniciarPublicacion = () => {
    setStep("progress");
    setCurrentEtapa(1);

    // Simular secuencia de 4 etapas
    setTimeout(() => {
      setCurrentEtapa(2);

      setTimeout(() => {
        if (simularFallo) {
          // Simular fallo en etapa 2
          const codigo = "ERR_GW_DEPLOY_TIMEOUT_504";
          const mensaje =
            "Tiempo de espera agotado al aplicar políticas de cuota en el clúster Apigee. Se requiere reintentar el despliegue.";
          const etapa = ETAPAS_DESPLIEGUE[1].label;

          fallarPublicacion(fuente.id, coordinadorNombre, etapa, codigo, mensaje);
          setErrorDetails({ etapa, codigo, mensaje });
          setStep("error");
          toast.error("Fallo durante el despliegue técnico", {
            description: "La fuente quedó en estado 'Publicación pendiente'. Reintento habilitado.",
          });
          onPublicada?.();
        } else {
          setCurrentEtapa(3);

          setTimeout(() => {
            setCurrentEtapa(4);

            setTimeout(() => {
              const res = publicarFuente(fuente.id, coordinadorNombre);
              if (res.success && res.despliegue) {
                setDespliegueResult(res.despliegue);
                setStep("success");
                toast.success("Fuente publicada exitosamente en el catálogo (FUE-05)", {
                  description: `Versión ${res.despliegue.version_api} activa en API Gateway.`,
                });
                onPublicada?.();
              } else {
                setStep("confirm");
                toast.error("Error al publicar la fuente");
              }
            }, 700);
          }, 700);
        }
      }, 800);
    }, 700);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const camposAccesibles = fuente.campos.filter((c) => c.clasificacion === "Accesible").length;
  const camposConfidenciales = fuente.campos.filter((c) => c.clasificacion === "Confidencial").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {step === "confirm" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Globe className="size-4" />
                </div>
                <DialogTitle className="font-heading text-lg">
                  Publicar fuente en el Catálogo (FUE-05)
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                La fuente ha sido aprobada por Gestión y está lista para su despliegue y puesta a disposición en el Catálogo Nacional.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground font-medium">Fuente:</span>
                  <span className="font-semibold text-foreground text-right">{fuente.nombre}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground font-medium">Institución proveedora:</span>
                  <span className="font-semibold text-foreground">{fuente.institucion_proveedora_nombre}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground font-medium">Versión API a asignar:</span>
                  <Badge tone="primary" appearance="soft" size="sm">v1.0.0</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground font-medium">Campos clasificados:</span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="success" appearance="soft" size="sm">{camposAccesibles} Accesibles</Badge>
                    {camposConfidenciales > 0 && (
                      <Badge tone="warning" appearance="soft" size="sm">{camposConfidenciales} Confidenciales</Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Entorno destino:</span>
                  <Badge tone="neutral" appearance="soft" size="sm">Producción</Badge>
                </div>
              </div>

              {/* Advertencia obligatoria: Publicar no otorga acceso automático */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                  <Info className="size-3.5" />
                  Efecto de la publicación (FUE-05)
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  La publicación habilita la fuente en el Catálogo de Interoperabilidad. <strong>Importante:</strong> Publicar no concede automáticamente acceso técnico a instituciones consumidoras; estas deberán cursar una solicitud formal de interoperabilidad (SOL-01) posterior.
                </p>
              </div>

              {/* Control de prueba: simular fallo */}
              <div className="p-2.5 bg-muted/30 rounded-lg border border-border flex items-center justify-between">
                <label htmlFor="simFallo" className="text-[11px] text-muted-foreground cursor-pointer flex items-center gap-2">
                  <input
                    id="simFallo"
                    type="checkbox"
                    checked={simularFallo}
                    onChange={(e) => setSimularFallo(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary size-3.5"
                  />
                  <span>Simular fallo técnico de despliegue para pruebas (FUE-05)</span>
                </label>
                {simularFallo && (
                  <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                    Modo fallo activo
                  </Badge>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleIniciarPublicacion} className="gap-2 shadow-xs">
                <Globe className="size-3.5" />
                <span>Confirmar y desplegar</span>
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Paso 2: Progreso en 4 etapas simuladas */}
        {step === "progress" && (
          <div className="py-6 space-y-5">
            <div className="text-center space-y-1">
              <div className="size-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
              <h3 className="font-heading font-bold text-base text-foreground mt-2">
                Desplegando versión API en Apigee Gateway
              </h3>
              <p className="text-xs text-muted-foreground">
                Ejecutando la secuencia de 4 etapas de publicación institucional...
              </p>
            </div>

            <div className="space-y-2.5 p-3.5 bg-muted/20 rounded-xl border border-border">
              {ETAPAS_DESPLIEGUE.map((etapa) => {
                const isPassed = currentEtapa > etapa.id;
                const isCurrent = currentEtapa === etapa.id;

                return (
                  <div key={etapa.id} className="flex items-center gap-3 text-xs">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                        isPassed
                          ? "bg-success text-success-foreground"
                          : isCurrent
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="size-3.5" /> : etapa.id}
                    </div>
                    <span
                      className={`leading-tight ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isPassed
                          ? "text-muted-foreground line-through"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {etapa.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Paso 3: Éxito con datos de despliegue */}
        {step === "success" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <CheckCircle2 className="size-5" />
                </div>
                <DialogTitle className="font-heading text-lg">
                  Fuente publicada exitosamente
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                La fuente ahora se encuentra activa en el catálogo nacional y visible para solicitudes de interoperabilidad.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
                <div className="flex justify-between items-center pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">Versión API:</span>
                  <Badge tone="success" appearance="solid" size="sm">
                    {despliegueResult?.version_api || "v1.0.0"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">Entorno:</span>
                  <Badge tone="primary" appearance="soft" size="sm">
                    {despliegueResult?.ambiente || "Producción"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">ID Despliegue Apigee:</span>
                  <span className="font-mono font-bold text-primary">
                    {despliegueResult?.id_despliegue}
                  </span>
                </div>
                <div className="flex flex-col gap-1 pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">URL pública confirmada:</span>
                  <code className="text-[11px] font-mono bg-muted/40 p-1.5 rounded border border-border text-foreground break-all">
                    {despliegueResult?.url_publica}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fecha de publicación:</span>
                  <span className="font-mono text-muted-foreground">
                    {despliegueResult?.fecha_publicacion
                      ? new Date(despliegueResult.fecha_publicacion).toLocaleString()
                      : new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={handleClose} className="w-full">
                Cerrar y ver detalle
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Paso 4: Error simulado con Publicación Pendiente */}
        {step === "error" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <div className="size-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
                  <AlertTriangle className="size-5" />
                </div>
                <DialogTitle className="font-heading text-lg text-danger">
                  Publicación pendiente por fallo técnico
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Ocurrió un error en el Gateway durante la etapa de despliegue. La fuente no fue publicada en el catálogo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 bg-danger/5 rounded-xl border border-danger/20 space-y-2">
                <div>
                  <span className="text-[11px] text-danger font-semibold block uppercase">
                    Etapa fallida:
                  </span>
                  <span className="font-medium text-foreground">{errorDetails?.etapa}</span>
                </div>
                <div>
                  <span className="text-[11px] text-danger font-semibold block uppercase">
                    Código de referencia:
                  </span>
                  <code className="font-mono text-xs text-danger font-bold">
                    {errorDetails?.codigo}
                  </code>
                </div>
                <div>
                  <span className="text-[11px] text-danger font-semibold block uppercase">
                    Mensaje de error:
                  </span>
                  <p className="text-muted-foreground leading-relaxed">{errorDetails?.mensaje}</p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground">
                <p>
                  El estado de la fuente se actualizó a <strong>Publicación pendiente</strong>. El catálogo no mostrará esta fuente hasta que el despliegue concluya exitosamente.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cerrar
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={() => {
                  setSimularFallo(false);
                  handleIniciarPublicacion();
                }}
                className="gap-2"
              >
                <RotateCcw className="size-3.5" />
                <span>Reintentar publicación</span>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
