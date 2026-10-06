"use client";

import React, { Suspense } from "react";
import { RevisionNormativaInteroperabilidadView } from "@/modules/acceso-interoperabilidad/views/revision-normativa-interoperabilidad-view";

export default function RevisionNormativaFuentesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando revisión de fuentes confidenciales...</div>}>
      <RevisionNormativaInteroperabilidadView />
    </Suspense>
  );
}
