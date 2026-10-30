import { Suspense } from "react";
import { ExcepcionalNuevaView } from "@/modules/entrega-excepcional/views/excepcional-nueva-view";

export default function EntregaExcepcionalNuevaPage() {
  return (
    <Suspense fallback={null}>
      <ExcepcionalNuevaView />
    </Suspense>
  );
}
