"use client";

import React from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { AreaDetailClient } from "../components/area-detail-client";

interface AreaDetailViewProps {
  id: string;
}

export function AreaDetailView({ id }: AreaDetailViewProps) {
  return (
    <WireframeDashboardLayout
      activeMenu="areas"
      allowedRoles={["ADMIN"]}
      breadcrumbs={[
        { label: "Áreas DINARP", href: "/areas" },
        { label: "Detalle de Área", href: `/areas/${id}` },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          <AreaDetailClient id={id} />
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
