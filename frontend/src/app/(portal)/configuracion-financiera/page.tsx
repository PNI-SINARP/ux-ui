"use client";

import React from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { ConfiguracionFinancieraInteroperabilidadView } from "@/modules/acceso-interoperabilidad/views/configuracion-financiera-interoperabilidad-view";

export default function ConfiguracionFinancieraPage() {
  return (
    <WireframeDashboardLayout activeMenu="configuracion-financiera">
      <ConfiguracionFinancieraInteroperabilidadView />
    </WireframeDashboardLayout>
  );
}
