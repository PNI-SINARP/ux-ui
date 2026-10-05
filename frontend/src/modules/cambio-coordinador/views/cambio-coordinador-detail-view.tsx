"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { CambioCoordinadorReview } from "../components/cambio-coordinador-review";
import { useCambioCoordinadorStore } from "../data/cambio-coordinador-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CambioCoordinadorDetailViewProps {
  tramiteId: string;
  onVolver?: () => void;
}

export function CambioCoordinadorDetailView({
  tramiteId,
  onVolver
}: CambioCoordinadorDetailViewProps) {
  const router = useRouter();
  const { getTramiteById, institucion } = useCambioCoordinadorStore();
  const tramite = getTramiteById(tramiteId);

  const handleBack = () => {
    if (onVolver) {
      onVolver();
    } else {
      router.push("/cambio-coordinador");
    }
  };

  return (
    <div className="layout-container py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-caption text-muted-foreground flex items-center gap-1.5">
        <a href="#" className="hover:text-foreground">Inicio</a>
        <span>/</span>
        <a href="/cambio-coordinador" className="hover:text-foreground">Institución</a>
        <span>/</span>
        <span className="text-foreground font-medium">Detalle {tramiteId}</span>
      </nav>

      {!tramite ? (
        <div className="text-center py-12 space-y-4">
          <p className="text-body text-muted-foreground">
            No se encontró el trámite con código {tramiteId}.
          </p>
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver a Cambio de Coordinador</span>
          </Button>
        </div>
      ) : (
        <CambioCoordinadorReview
          tramite={tramite}
          onVolver={handleBack}
          institucionConfig={institucion}
        />
      )}
    </div>
  );
}
