"use client";

import React, { useState } from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, FileText, Download, CreditCard, CheckCircle2, Clock } from "lucide-react";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";

const estadoPagoOptions = [
  { value: "Pendiente de pago", label: "Simular: Pendiente de pago" },
  { value: "Pago en validación", label: "Simular: Pago en validación" },
  { value: "Pago verificado", label: "Simular: Pago verificado" },
];

export function AccesoSolicitudFacturacionView({ id }: { id: string }) {
  const [estadoPago, setEstadoPago] = useState("Pendiente de pago");

  // Mock data
  const factura = {
    numero: "FAC-0028",
    institucion: "Banco Pichincha",
    solicitud: id,
    fechaEmision: "2026-09-22",
    valor: "$ 150.00",
    servicios: [
      { nombre: "estadoContribuyente", fuente: "Registro Único de Contribuyentes (RUC)", valor: "$ 50.00" },
      { nombre: "historialCrediticio", fuente: "Buró de Crédito", valor: "$ 100.00" }
    ]
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: "Bandeja de solicitudes", href: "/acceso-interoperabilidad/solicitudes" },
        { label: id, href: `/acceso-interoperabilidad/solicitudes/${id}` },
        { label: `Factura ${factura.numero}` }
      ]}
      headerSlot={
        <Combobox
          items={estadoPagoOptions}
          value={estadoPagoOptions.find(opt => opt.value === estadoPago) || estadoPagoOptions[0]}
          onValueChange={(val) => {
            if (val) setEstadoPago(val.value);
          }}
        >
          <ComboboxSelectTrigger className="h-8 text-xs min-w-[190px]" />
          <ComboboxContent align="start" className="min-w-[200px]">
            <ComboboxList>
              {estadoPagoOptions.map((opt) => (
                <ComboboxItem key={opt.value} value={opt}>
                  {opt.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      }
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link href="/acceso-interoperabilidad/solicitudes">
              <Button variant="ghost" size="sm" className="pl-0 gap-1.5 text-xs text-primary font-semibold hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                Volver a la bandeja de solicitudes
              </Button>
            </Link>
            <span className="text-muted-foreground/40">â€¢</span>
            <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                Ver detalle de solicitud ({id})
              </Button>
            </Link>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">Facturación</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de pago para habilitación de fuentes de interoperabilidad.</p>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Header Card */}
          <div className="bg-muted/30 border-b border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Factura {factura.numero}</h2>
              <div className="text-sm text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <p>Institución: <strong className="text-foreground">{factura.institucion}</strong></p>
                <p>Fecha de emisión: <strong className="text-foreground">{factura.fechaEmision}</strong></p>
                <p>
                  Solicitud asociada: <strong className="text-foreground">{factura.solicitud}</strong>{" "}
                  <Link href={`/acceso-interoperabilidad/solicitudes/${id}`} className="text-primary hover:underline ml-1">[Ver solicitud]</Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-sm text-muted-foreground">Valor total</span>
              <span className="text-3xl font-bold text-foreground">{factura.valor}</span>
              {estadoPago === "Pendiente de pago" && <Badge tone="danger" appearance="soft">Pendiente</Badge>}
              {estadoPago === "Pago en validación" && <Badge tone="warning" appearance="soft">Pago en validación</Badge>}
              {estadoPago === "Pago verificado" && <Badge tone="success" appearance="soft">Pago verificado</Badge>}
            </div>
          </div>

          {/* Estado de Pago Mensaje */}
          {estadoPago === "Pago en validación" && (
            <div className="bg-warning/10 border-b border-warning/20 p-4 flex gap-3 items-start">
              <Clock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-warning-foreground text-sm">Validación en proceso</h3>
                <p className="text-sm text-warning-foreground/80 mt-1">El pago ha sido reportado y se encuentra en validación por el área correspondiente. Este proceso puede tomar hasta 48 horas laborables.</p>
              </div>
            </div>
          )}

          {estadoPago === "Pago verificado" && (
            <div className="bg-success/10 border-b border-success/20 p-4 flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-success-foreground text-sm">El pago fue verificado correctamente</h3>
                <p className="text-sm text-success-foreground/80 mt-1">La solicitud continuará con la creación y habilitación de los paquetes de consumo.</p>
                <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
                  <Button size="sm" variant="outline" className="mt-3 bg-background">Volver a la solicitud</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">Detalle de fuentes aprobadas</h3>
            
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Fuente / Campo</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Institución proveedora</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {factura.servicios.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.nombre}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fuente}</td>
                      <td className="px-4 py-3 text-right">{s.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 pt-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Ver factura
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
            
            {estadoPago === "Pendiente de pago" && (
              <div className="flex flex-col items-end">
                <Button onClick={() => setEstadoPago("Pago en validación")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continuar con pago
                </Button>
                <span className="text-[10px] text-muted-foreground mt-2">* Integración de pago pendiente de validación</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </WireframeDashboardLayout>
  );
}
