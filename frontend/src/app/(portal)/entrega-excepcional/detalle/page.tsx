import { Suspense } from "react";
import { ExcepcionalDetalleView } from "@/modules/entrega-excepcional/views/excepcional-detalle-view";

export default function EntregaExcepcionalDetallePage() {
  return (
    <Suspense fallback={null}>
      <ExcepcionalDetalleView />
    </Suspense>
  );
}
