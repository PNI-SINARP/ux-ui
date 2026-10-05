"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { FuenteDatos } from "../data/fuentes-data";
import { useFuentesStore } from "../data/fuentes-store";
import { toast } from "sonner";

interface PublicarFuenteDialogProps {
  fuente: FuenteDatos;
  coordinadorNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublicacionExitosa?: () => void;
}

export function PublicarFuenteDialog({
  fuente,
  coordinadorNombre,
  open,
  onOpenChange,
  onPublicacionExitosa,
}: PublicarFuenteDialogProps) {
  const { publicarFuente } = useFuentesStore();
  const [step, setStep] = useState<"confirm" | "deploying" | "success">("confirm");
  const [despliegueResult, setDespliegueResult] = useState<any>(null);

  const handlePublicar = () => {
    setStep("deploying");

    setTimeout(() => {
      const res = publicarFuente(fuente.id, coordinadorNombre);
      if (res.success) {
        setDespliegueResult(res.despliegue);
        setStep("success");
        toast.success("Fuente publicada en el catálogo oficial (FUE-05)", {
          description: `Versión API v1.0.0 desplegada en Apigee y disponible para solicitudes institucionales.`,
        });
        onPublicacionExitosa?.();
      } else {
        toast.error("Error al publicar la fuente", {
          description: res.error,
        });
        setStep("confirm");
      }
    }, 1200);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("confirm");
    }, 200);
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
                  Publicar fuente en el Catálogo
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                La fuente ha sido aprobada por el Área de Gestión y está lista para su despliegue y puesta a disposición en el Catálogo de Interoperabilidad (FUE-05).
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
                  <span className="text-muted-foreground font-medium">Modalidades soportadas:</span>
                  <span className="font-medium text-foreground">{fuente.modalidades_soportadas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Campos clasificados:</span>
                  <div className="flex items-center gap-1.5">
                    <Badge tone="success" appearance="soft" size="sm">{camposAccesibles} Accesibles</Badge>
                    {camposConfidenciales > 0 && (
                      <Badge tone="warning" appearance="soft" size="sm">{camposConfidenciales} Confidenciales</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-semibold text-xs">
                  <Server className="size-3.5" />
                  Efecto de la publicación (FUE-05)
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  El orquestador registrará el microservicio proxy en Apigee Gateway y publicará los metadatos en el Catálogo para que otras instituciones puedan solicitar acceso formal (CAT-01 y SOL-01).
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handlePublicar} className="gap-2">
                <Globe className="size-3.5" />
                Confirmar y publicar fuente
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "deploying" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative size-14 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Cpu className="size-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-heading font-bold text-sm text-foreground">
                Desplegando microservicio y proxy Apigee
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm">
                Generando identificador de despliegue opaco, registrando rutas seguras y vinculando al Catálogo Nacional...
              </p>
            </div>
          </div>
        )}

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
                La fuente ahora se encuentra activa en el catálogo y disponible para solicitudes institucionales de consumo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3.5 bg-surface rounded-xl border border-border space-y-2">
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">ID Despliegue:</span>
                  <span className="font-mono font-semibold text-primary">{despliegueResult?.id_despliegue}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">Versión API:</span>
                  <Badge tone="success" appearance="solid" size="sm">{despliegueResult?.version_api}</Badge>
                </div>
                <div className="flex flex-col gap-1 text-xs pb-1.5 border-b border-border">
                  <span className="text-muted-foreground">URL Pública Apigee:</span>
                  <code className="text-[11px] font-mono bg-muted/40 p-1.5 rounded border border-border text-foreground break-all">
                    {despliegueResult?.url_publica}
                  </code>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Ambiente:</span>
                  <Badge tone="primary" appearance="outline" size="sm">Producción</Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={handleClose} className="w-full">
                Entendido
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
