"use client";

import React, { Suspense } from "react";
import { RevisionNormativaView } from "@/modules/gestion-solicitudes/views/revision-normativa-view";

export default function RevisionNormativaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando módulo de Normatividad...</div>}>
      <RevisionNormativaView />
    </Suspense>
  );
}
