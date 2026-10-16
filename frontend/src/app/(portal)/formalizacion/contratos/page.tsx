"use client";

import React, { Suspense } from "react";
import { FormalizacionContratosView } from "@/modules/acceso-interoperabilidad/views/formalizacion-contratos-view";

export default function FormalizacionContratosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando módulo de contratos...</div>}>
      <FormalizacionContratosView />
    </Suspense>
  );
}
