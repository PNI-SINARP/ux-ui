"use client";

import React, { Suspense } from "react";
import { AccesoConsumoTIView } from "@/modules/acceso-interoperabilidad/views/acceso-consumo-ti-view";

export default function AccesoConsumoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Cargando infraestructura técnica...</div>}>
      <AccesoConsumoTIView />
    </Suspense>
  );
}
