"use client";

import React, { Suspense } from "react";
import { FormalizacionGestionView } from "@/modules/acceso-interoperabilidad/views/formalizacion-gestion-view";

export default function FormalizacionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando bandeja de formalización...</div>}>
      <FormalizacionGestionView />
    </Suspense>
  );
}
