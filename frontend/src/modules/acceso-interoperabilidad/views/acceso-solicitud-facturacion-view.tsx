"use client";

import React, { useState } from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  Building2,
  Receipt,
  Upload,
  Check,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { useSolicitudesStore } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";

export function AccesoSolicitudFacturacionView({ id }: { id: string }) {
  const { getSolicitudById, pagarFacturaElectronica, simularPagoRealizado } = useSolicitudesStore();
  const solicitud = getSolicitudById(id);

  const [modalPagoEnLinea, setModalPagoEnLinea] = useState(false);
  const [modalRegistrarPago, setModalRegistrarPago] = useState(false);
  const [comprobanteRef, setComprobanteRef] = useState("TRANSF-PRODUBANCO-99214");
  const [isProcessing, setIsProcessing] = useState(false);

  // Datos de liquidación/factura
  const factura = {
    numero: solicitud?.factura?.numero || "FAC-0028",
    institucion: solicitud?.institucion || "Banco Pichincha",
    solicitud: id,
    fechaEmision: solicitud?.factura?.fechaEmision || "2026-09-22",
    valor: solicitud?.factura?.valor || "$ 150.00",
    servicios: [
      {
        nombre: "Datos de Identidad y Estado Civil",
        fuente: solicitud?.fuentePrincipal || "Dirección General de Registro Civil, Identificación y Cedulación",
        valor: "$ 150.00"
      }
    ]
  };

  const estadoActual = solicitud?.estado || "Pendiente de pago";
  const isPagoVerificado = estadoActual === "Pago verificado" || estadoActual === "Pago validado" || estadoActual === "Aprobación final" || estadoActual === "Solicitud aprobada — habilitación técnica pendiente" || estadoActual === "Acceso habilitado";
  const isPagoEnValidacion = estadoActual === "Pago en validación" || estadoActual === "Pago en verificación" || estadoActual === "Pendiente de validación de pago";

  const handlePagarEnLinea = () => {
    setIsProcessing(true);
    setTimeout(() => {
      pagarFacturaElectronica(id);
      setIsProcessing(false);
      setModalPagoEnLinea(false);
      toast.success("Pago en línea procesado exitosamente", {
        description: "El pago fue verificado y acreditado. El expediente está listo para la Aprobación Final del Director de Gestión."
      });
    }, 900);
  };

  const handleRegistrarComprobante = () => {
    simularPagoRealizado(id);
    setModalRegistrarPago(false);
    toast.success("Comprobante de pago registrado", {
      description: "El área de Facturación de DINARP verificará la acreditación en SIGEF."
    });
  };

  return (
    <WireframeDashboardLayout
      activeMenu="acceso-interoperabilidad"
      currentRole="COORDINADOR_SINARP"
      breadcrumbs={[
        { label: "Acceso a Interoperabilidad", href: "/acceso-interoperabilidad/solicitudes" },
        { label: "Mis solicitudes", href: "/acceso-interoperabilidad/solicitudes" },
        { label: id, href: `/acceso-interoperabilidad/solicitudes/${id}` },
        { label: `Factura ${factura.numero}` }
      ]}
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
              <Button variant="ghost" size="sm" className="pl-0 gap-1.5 text-xs text-primary font-semibold hover:underline">
                <ArrowLeft className="size-3.5" />
                Volver al detalle de la solicitud
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="warning" appearance="soft" className="text-xs">
              Institución Privada
            </Badge>
            <span className="text-xs text-muted-foreground">FAC-01 + PAG-01</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">
            Liquidación y Factura de Interoperabilidad
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Módulo financiero para recaudación por consumo de fuentes de datos conforme a ordenanza y contrato bilateral.
          </p>
        </div>

        <Card className="p-0 overflow-hidden border border-border bg-surface shadow-xs">
          {/* Header Card */}
          <div className="bg-muted/30 border-b border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Factura {factura.numero}</h2>
              </div>
              <div className="text-xs text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <p>Institución: <strong className="text-foreground">{factura.institucion}</strong></p>
                <p>Fecha de emisión: <strong className="text-foreground">{factura.fechaEmision}</strong></p>
                <p>
                  Solicitud asociada: <strong className="text-foreground font-mono">{factura.solicitud}</strong>
                </p>
                <p>
                  Contrato asociado: <strong className="text-foreground font-mono">{solicitud?.contratoDetalle?.numero || solicitud?.contrato || "CONTR-2026-0019"}</strong>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">Valor total a pagar</span>
              <span className="text-3xl font-bold text-foreground">{factura.valor}</span>
              {isPagoVerificado ? (
                <Badge tone="success" appearance="soft" className="gap-1 text-xs font-semibold">
                  <CheckCircle2 className="size-3" />
                  Pago verificado
                </Badge>
              ) : isPagoEnValidacion ? (
                <Badge tone="warning" appearance="soft" className="gap-1 text-xs font-semibold">
                  <Clock className="size-3" />
                  Pago en verificación
                </Badge>
              ) : (
                <Badge tone="danger" appearance="soft" className="text-xs font-semibold">
                  Pendiente de pago
                </Badge>
              )}
            </div>
          </div>

          {/* Banner de Estado del Pago */}
          {isPagoVerificado && (
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 flex gap-3 items-start">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-300">
                  Pago acreditado y verificado en SIGEF
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  La transacción fue conciliada en las cuentas del Estado. El expediente avanzó a la bandeja del <strong className="text-foreground">Director de Gestión</strong> para la aprobación administrativa final y orden de habilitación técnica.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3 gap-1.5 text-xs bg-background">
                  <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
                    Ver estado del trámite en la solicitud
                    <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {isPagoEnValidacion && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 flex gap-3 items-start">
              <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-bold text-amber-900 dark:text-amber-300">
                  Comprobante en proceso de conciliación bancaria
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  El comprobante fue cargado y se encuentra bajo revisión del Departamento Financiero de DINARP. Tiempo estimado: 24 horas hábiles.
                </p>
              </div>
            </div>
          )}

          {/* Detalle de rubros */}
          <div className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-3">Detalle de rubros autorizados</h3>
            <div className="border border-border rounded-xl overflow-hidden bg-background">
              <table className="w-full text-xs">
                <thead className="bg-muted/50 border-b border-border text-left">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold text-muted-foreground">Rubro / Servicio Interoperable</th>
                    <th className="px-4 py-2.5 font-semibold text-muted-foreground">Entidad Custodia</th>
                    <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">Tarifa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {factura.servicios.map((s, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{s.nombre}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.fuente}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{s.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Acciones de Pago */}
          <div className="p-6 pt-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <FileText className="size-3.5" />
                Descargar factura electrónica (PDF)
              </Button>
            </div>

            {!isPagoVerificado && !isPagoEnValidacion && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setModalRegistrarPago(true)}
                  className="text-xs gap-1.5"
                >
                  <Upload className="size-3.5" />
                  Registrar transferencia bancaria
                </Button>
                <Button
                  size="sm"
                  onClick={() => setModalPagoEnLinea(true)}
                  className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
                >
                  <CreditCard className="size-3.5" />
                  Pagar en línea (Pasarela)
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modal Pago en Línea Simulado */}
      <Dialog open={modalPagoEnLinea} onOpenChange={setModalPagoEnLinea}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Pasarela de Pago Interbancaria DINARP
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Simulación de pago electrónico seguro mediante botón de débito bancario o tarjeta institucional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
              <p><span className="text-muted-foreground">Valor a cancelar:</span> <strong className="text-foreground">{factura.valor}</strong></p>
              <p><span className="text-muted-foreground">Beneficiario:</span> Dirección Nacional de Registros Públicos (DINARP)</p>
              <p><span className="text-muted-foreground">Concepto:</span> Tarifa de consumo interoperable {factura.solicitud}</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Seleccione banco emisor:</label>
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background">
                <option>Banco Pichincha (Cta. Corriente Institucional)</option>
                <option>Banco del Pacífico</option>
                <option>Banco de Guayaquil</option>
                <option>Produbanco</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalPagoEnLinea(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handlePagarEnLinea}
              className="gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Check className="size-4" />
              {isProcessing ? "Confirmando con banco..." : `Pagar ${factura.valor}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Transferencia */}
      <Dialog open={modalRegistrarPago} onOpenChange={setModalRegistrarPago}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Upload className="size-5 text-primary" />
              Registrar Comprobante de Depósito / Transferencia
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Ingrese la referencia del depósito en la cuenta rotativa única de DINARP en el Banco Central del Ecuador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Número de transacción / comprobante:</label>
              <input
                type="text"
                value={comprobanteRef}
                onChange={(e) => setComprobanteRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background font-mono"
              />
            </div>
            <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20 text-center py-6 text-muted-foreground">
              <Upload className="size-6 mx-auto mb-1 stroke-1 text-primary" />
              <p className="font-medium">Comprobante_Transferencia_Pichincha.pdf</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Archivo cargado simulado (1.2 MB)</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setModalRegistrarPago(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleRegistrarComprobante} className="gap-1.5 bg-primary text-primary-foreground font-semibold">
              <Check className="size-4" />
              Registrar comprobante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
