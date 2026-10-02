"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeTour, type TourStep } from "@/components/layout/wireframes/wireframe-tour";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { ProcesosTab } from "@/modules/catalogo-interoperabilidad/components/procesos-tab";
import { FuentesTab } from "@/modules/catalogo-interoperabilidad/components/fuentes-tab";

import { WireframeRoleSelector } from "@/components/layout/wireframes/wireframe-role-selector";

export function CatalogoAdministracionView() {
  const [activeRole, setActiveRole] = useSimulatedRole("COORDINADOR_SINARP");
  const currentUser = (activeRole && MOCK_USERS_BY_ROLE[activeRole]) || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const tourSteps: TourStep[] = [
    {
      id: "step-tabs",
      target: "[data-tour='tour-tabs']",
      title: "1. Vistas del módulo",
      description: "Navega entre los procesos de incorporación y el inventario de fuentes del catálogo.",
      placement: "bottom"
    },
    {
      id: "step-bandeja",
      target: "[data-tour='tour-bandeja']",
      title: "2. Procesos de incorporación",
      description: "Gestiona las solicitudes en curso para integrar nuevas fuentes.",
      placement: "bottom"
    }
  ];

  const handleStartTour = () => {
    setTourStep(0);
    setIsTourOpen(true);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="administracion"
      currentRole={activeRole}
      currentUser={currentUser}
      headerSlot={
        <WireframeRoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
      }
      breadcrumbs={[
        { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
        { label: "Administración y Gestión del Catálogo" }
      ]}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <Tabs defaultValue="procesos" className="w-full">
          <div data-tour="tour-tabs" className="mb-6 border-b border-border/60">
            <TabsList className="bg-transparent border-none p-0 gap-6 h-auto">
              <TabsTrigger 
                value="procesos"
                className="data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:!text-primary rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground transition-all text-sm"
              >
                Procesos de incorporación
              </TabsTrigger>
              {activeRole !== "COORDINADOR_SINARP" && (
                <TabsTrigger 
                  value="fuentes"
                  className="data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:!text-primary rounded-none border-b-2 border-transparent px-1 pb-3 pt-2 font-semibold text-muted-foreground hover:text-foreground transition-all text-sm"
                >
                  Fuentes del catálogo
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="procesos" className="m-0 focus-visible:outline-none">
            <ProcesosTab activeRole={activeRole} onStartTour={handleStartTour} />
          </TabsContent>

          {activeRole !== "COORDINADOR_SINARP" && (
            <TabsContent value="fuentes" className="m-0 focus-visible:outline-none">
              <FuentesTab activeRole={activeRole} />
            </TabsContent>
          )}
        </Tabs>

        <WireframeTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          steps={tourSteps}
          currentStep={tourStep}
          onStepChange={setTourStep}
        />
      </div>
    </WireframeDashboardLayout>
  );
}
