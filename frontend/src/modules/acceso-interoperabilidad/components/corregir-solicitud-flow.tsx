"use client";

import React from "react";
import { SolicitudAcceso, FuenteDetalle } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { AccesoSolicitudNuevaView } from "@/modules/acceso-interoperabilidad/views/acceso-solicitud-nueva-view";

export interface CorregirSolicitudFlowProps {
  solicitud: SolicitudAcceso;
  initialStep?: number;
  onCancel: () => void;
  onReenviar: (comentario: string, nuevasFuentes: FuenteDetalle[]) => void;
}

export function CorregirSolicitudFlow({
  solicitud,
  initialStep,
  onCancel,
  onReenviar,
}: CorregirSolicitudFlowProps) {
  return (
    <AccesoSolicitudNuevaView
      solicitud={solicitud}
      isSubsanacion={true}
      initialStep={initialStep}
      onCancel={onCancel}
      onReenviar={onReenviar}
    />
  );
}
