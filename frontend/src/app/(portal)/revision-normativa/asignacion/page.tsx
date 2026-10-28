import { Suspense } from "react";
import { AsignacionNormativaFuentesView } from "@/modules/acceso-interoperabilidad/views/asignacion-normativa-fuentes-view";

export default function AsignacionNormativaFuentesPage() {
  return (
    <Suspense fallback={null}>
      <AsignacionNormativaFuentesView />
    </Suspense>
  );
}
