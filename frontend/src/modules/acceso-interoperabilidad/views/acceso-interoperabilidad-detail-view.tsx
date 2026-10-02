"use client";

import React, { useState } from "react";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AccesoInteroperabilidadDetailView({ id }: { id: string }) {
  const [role] = useSimulatedRole("COORDINADOR_SINARP");
  const [activeTab, setActiveTab] = useState("resumen");

  // Mock expediente data
  const expediente = {
    id: id,
    institucion: "Ministerio de Inclusión Económica y Social (MIES)",
    coordinador: "Andrea López",
    estado: "En validación",
    fechaCreacion: "2026-09-20",
    ultimaActualizacion: "2026-09-21",
    campos: [
      {
        fuente: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        nombre: "estadoContribuyente",
        clasificacion: "Accesible",
        finalidad: "Validar estado de proveedor para ayudas sociales",
        estado: "Validado DGR"
      },
      {
        fuente: "Registro Único de Contribuyentes (RUC)",
        institucion: "SRI",
        nombre: "historialExoneraciones",
        clasificacion: "Confidencial",
        finalidad: "Verificar beneficios fiscales vigentes",
        fundamento: "Art. 12 Ley de Inclusión",
        estado: "En revisión DPI"
      }
    ],
    seguimiento: [
      { fecha: "2026-09-20 10:00", evento: "Solicitud enviada", actor: "Coordinador MIES" },
      { fecha: "2026-09-21 09:30", evento: "Validación funcional completada", actor: "DGR" },
      { fecha: "2026-09-22 10:00", evento: "Creación de paquete de consumo", actor: "Pendiente de validación" }
    ]
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad" },
        { label: expediente.id }
      ]}
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Solicitud {expediente.id}</h1>
            <div className="text-sm text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
              <p>Institución: <strong className="text-foreground">{expediente.institucion}</strong></p>
              <p>Coordinador: <strong className="text-foreground">{expediente.coordinador}</strong></p>
              <p>Fecha creación: {expediente.fechaCreacion}</p>
              <p>Última act.: {expediente.ultimaActualizacion}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{expediente.estado}</Badge>

            {/* Actions based on role */}
            {role === "DGR" && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-destructive border-destructive">Observar</Button>
                <Button size="sm">Validar</Button>
              </div>
            )}
            {role === "DPI" && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-destructive border-destructive">Observar</Button>
                <Button size="sm">Cargar informe</Button>
              </div>
            )}
            {role === "COORDINADOR_SINARP" && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Prueba de consumo</Button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {["resumen", "campos", "justificaciones", "documentos", "seguimiento"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "resumen" && (
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Resumen General</h2>
              <p className="text-sm text-muted-foreground">La solicitud contempla {expediente.campos.length} campos en total, de los cuales {expediente.campos.filter(c => c.clasificacion === "Confidencial").length} requieren revisión de DPI.</p>
            </Card>
          )}

          {activeTab === "campos" && (
            <div className="flex flex-col gap-4">
              {expediente.campos.map((c, i) => (
                <Card key={i} className="p-4">
                  <p className="text-xs text-muted-foreground">{c.institucion} &gt; {c.fuente}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-bold">{c.nombre}</h3>
                    <Badge appearance="outline" tone="neutral" className="text-[10px]">{c.clasificacion}</Badge>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">Estado de revisión: <strong>{c.estado}</strong></p>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "justificaciones" && (
            <div className="flex flex-col gap-4">
              {expediente.campos.map((c, i) => (
                <Card key={i} className="p-4">
                  <h3 className="font-bold text-sm mb-2">{c.nombre}</h3>
                  <div className="bg-muted/30 p-3 rounded-md text-sm mb-2">
                    <strong>Finalidad:</strong> {c.finalidad}
                  </div>
                  {c.fundamento && (
                    <div className="bg-muted/30 p-3 rounded-md text-sm border-l-2 border-destructive">
                      <strong>Fundamento Legal:</strong> {c.fundamento}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {activeTab === "documentos" && (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Documentos e informes generados durante el proceso (ej. Informe de Justificación de DPI).</p>
            </Card>
          )}

          {activeTab === "seguimiento" && (
            <Card className="p-6">
              <div className="flex flex-col gap-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-border">
                {expediente.seguimiento.map((s, i) => (
                  <div key={i} className="flex gap-4 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 border-4 border-card" />
                    <div>
                      <p className="text-sm font-bold">{s.evento}</p>
                      <p className="text-xs text-muted-foreground">{s.fecha} - Responsable: {s.actor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </WireframeDashboardLayout>
  );
}
