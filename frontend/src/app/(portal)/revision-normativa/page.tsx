"use client";

import React, { Suspense } from "react";
import { RevisionNormativaInteroperabilidadView } from "@/modules/acceso-interoperabilidad/views/revision-normativa-interoperabilidad-view";

export default function RevisionNormativaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando módulo de Normatividad...</div>}>
      <RevisionNormativaInteroperabilidadView />
    </Suspense>
  );
}

