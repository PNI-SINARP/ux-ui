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
  CreditCard,
  CheckCircle2,
  Clock,
  Receipt,
  Check,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Unlock,
  SlidersHorizontal,
  Ban,
} from "lucide-react";
import { useSolicitudesStore } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";
import { toast } from "sonner";

export function AccesoSolicitudFacturacionView({ id }: { id: string }) {
  const {
    getSolicitudById,
    pagarFacturaElectronica,
    simularDivergenciaFactura,
    conciliarEmisionFactura,
    registrarIntentoPagoFallido,
    simularPagoDivergenteConciliacion,
    conciliarPagoPasarela,
    autorizarNuevosIntentosPago,
  } = useSolicitudesStore();

  const solicitud = getSolicitudById(id);

  const [modalPagoEnLinea, setModalPagoEnLinea] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const montoNumerico =
    typeof solicitud?.factura?.valor === "number"
      ? solicitud.factura.valor
      : 4800.0;

  const factura = {
    numero:
      solicitud?.factura?.numero ||
      "FAC-001-002-000094821",
    institucion:
      solicitud?.institucion || "Banco Pichincha C.A.",
    solicitud: id,
    fechaEmision:
      solicitud?.factura?.fechaEmision || "2026-10-20 10:15:00",
    valorFormateado:
      solicitud?.factura?.valor ||
      `USD ${montoNumerico.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    cupoFacturado: solicitud?.factura?.cupoFacturado ?? 120000,
    tipoEventoFacturable:
      solicitud?.factura?.tipoEventoFacturable || "HABILITACION_INICIAL_CUPO",
    conceptoFacturable:
      solicitud?.factura?.conceptoFacturable ||
      "CON-PRIV-001 · Suscripción y Paquete de Consultas Interoperables",
    versionTarifaria:
      solicitud?.factura?.versionTarifaria || "TAR-2026-V2.1",
    baseTarifaria: solicitud?.factura?.baseTarifaria || "USD 4,800.00",
    descuentosAplicables: solicitud?.factura?.descuentosAplicables || "USD 0.00",
    impuestos: solicitud?.factura?.impuestos || "USD 0.00",
    modoRedondeo: solicitud?.factura?.modoRedondeo || "HALF_UP",
    precisionDecimales: solicitud?.factura?.precisionDecimales ?? 2,
    estadoEmisionApi: solicitud?.factura?.estadoEmision || "EMITIDA",
    errorEmisionDetalle: solicitud?.factura?.errorApiDetalle,
  };

  const pasarela = {
    ordenPagoId:
      solicitud?.pasarelaPago?.ordenId || `ORD-PAS-2026-${id.slice(-3)}`,
    intentosRealizados: solicitud?.pasarelaPago?.intentosRealizados ?? 0,
    maxIntentos: solicitud?.pasarelaPago?.maxIntentos ?? 3,
    vigenciaOrdenMinutos: solicitud?.pasarelaPago?.vigenciaOrdenMinutos ?? 1440,
    referenciaTransaccion: solicitud?.pasarelaPago?.referenciaTransaccion,
    ultimoErrorMotivo: solicitud?.pasarelaPago?.ultimoMotivoFallo,
    divergenciaDetalle: solicitud?.pasarelaPago?.divergenciaDetalle,
    desbloqueosAutorizados:
      solicitud?.pasarelaPago?.desbloqueosAutorizados ?? 0,
  };

  const estadoActual = solicitud?.estado || "Pendiente de pago";
  const isPagoVerificado =
    estadoActual === "Pago verificado" ||
    estadoActual === "Pago validado" ||
    estadoActual === "Aprobación final" ||
    estadoActual === "Habilitación técnica" ||
    estadoActual === "Solicitud aprobada — habilitación técnica pendiente" ||
    estadoActual === "Acceso habilitado" ||
    estadoActual === "Acceso generado";
  const isDivergenciaFactura = estadoActual === "Divergencia de facturación";
  const isBloqueadoIntentos = estadoActual === "Pago bloqueado por intentos";
  const isEnConciliacion = estadoActual === "En conciliación";
  const isCerradaReversion = estadoActual === "Cerrada por reversión";

  const handlePagarEnLineaExitoso = () => {
    setIsProcessing(true);
    setTimeout(() => {
      pagarFacturaElectronica(id);
      setIsProcessing(false);
      setModalPagoEnLinea(false);
      toast.success("Pago confirmado automáticamente por Pasarela (PAG-02)", {
        description:
          "Firma HMAC de webhook verificada y monto conciliado. La solicitud avanzó a la bandeja de Aprobación Final (SOL-10).",
      });
    }, 600);
  };

  const handleSimularFalloTarjeta = () => {
    registrarIntentoPagoFallido(
      id,
      "Rechazo del banco emisor (Código 51: Fondos / límite diario insuficiente en tarjeta corporativa)."
    );
    setModalPagoEnLinea(false);
    toast.error("Intento de pago rechazado en pasarela (PAG-03)", {
      description:
        "Se incrementó el contador de intentos sobre la orden de pago vigente.",
    });
  };

  return (
    <WireframeDashboardLayout
      activeMenu="mis-solicitudes"
      currentRole="COORDINADOR_SINARP"
      breadcrumbs={[
        {
          label: "Acceso a Interoperabilidad",
          href: "/acceso-interoperabilidad/solicitudes",
        },
        {
          label: "Mis solicitudes",
          href: "/acceso-interoperabilidad/solicitudes",
        },
        { label: id, href: `/acceso-interoperabilidad/solicitudes/${id}` },
        { label: `Factura ${factura.numero}` },
      ]}
    >
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Encabezado */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="pl-0 gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <ArrowLeft className="size-3.5" />
                Volver al detalle de la solicitud
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning" appearance="soft" className="text-xs">
              Entidad Privada · Facturación Automática antes del Pago
            </Badge>
            <Badge tone="info" appearance="outline" className="text-xs">
              BN-08 · FAC-01 · FAC-02 · PAG-01 · PAG-02 · PAG-03 · PAG-05
            </Badge>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">
            Liquidación Tarifaria, Factura Electrónica y Pasarela de Pagos
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Flujo 100% automatizado vía API de Facturación Electrónica y Pasarela de Pagos con confirmación por webhook firmado (sin intervención manual en SIGEF).
          </p>
        </div>

        {/* Barra de Simulación Interactiva BN-08 */}
        <Card className="p-4 border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Simulador Interactivo de Escenarios Financieros (BN-08)
              </p>
              <p className="text-xs text-muted-foreground">
                Pruebe las ramas de excepción de facturación (`FAC-02`), bloqueo por intentos fallidos (`PAG-03`), desbloqueo administrativo (`PAG-05`) y conciliación de webhook (`PAG-02`).
              </p>
            </div>
            <Badge tone="primary" appearance="soft">
              Estado actual: {estadoActual}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                simularDivergenciaFactura(id);
                toast.warning("Divergencia de facturación simulada (FAC-02)");
              }}
            >
              <AlertTriangle className="size-3.5 mr-1.5 text-warning" />
              1. Simular Divergencia API Factura (FAC-02)
            </Button>

            {isDivergenciaFactura && (
              <Button
                size="sm"
                variant="primary"
                className="text-xs"
                onClick={() => {
                  conciliarEmisionFactura(id, "Administrador Financiero SINARP");
                  toast.success("Factura conciliada sin duplicidad (FAC-02)");
                }}
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Conciliar Factura (FAC-02)
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              disabled={isBloqueadoIntentos || isPagoVerificado}
              onClick={() => {
                registrarIntentoPagoFallido(id);
                toast.error("Intento de pago fallido registrado (PAG-03)");
              }}
            >
              <Ban className="size-3.5 mr-1.5 text-destructive" />
              2. Simular Intento Fallido ({pasarela.intentosRealizados}/
              {pasarela.maxIntentos}) (PAG-03)
            </Button>

            {isBloqueadoIntentos && (
              <Button
                size="sm"
                variant="primary"
                className="text-xs"
                onClick={() => {
                  autorizarNuevosIntentosPago(
                    id,
                    "Autorización administrativa de nuevo ciclo de intentos sobre la misma factura (PAG-05).",
                    "Administrador Financiero SINARP"
                  );
                  toast.success("Intentos de pago desbloqueados (PAG-05)");
                }}
              >
                <Unlock className="size-3.5 mr-1.5" />
                Autorizar Nuevos Intentos (PAG-05)
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                simularPagoDivergenteConciliacion(id);
                toast.warning(
                  "Pago retenido en conciliación por divergencia en callback (PAG-02 Crit. 3)"
                );
              }}
            >
              <Clock className="size-3.5 mr-1.5 text-warning" />
              3. Simular Webhook Divergente (PAG-02 Crit. 3)
            </Button>

            {isEnConciliacion && (
              <Button
                size="sm"
                variant="primary"
                className="text-xs"
                onClick={() => {
                  conciliarPagoPasarela(
                    id,
                    "Monto y referencia conciliados contra liquidación de pasarela.",
                    "Administrador Financiero SINARP"
                  );
                  toast.success("Pago conciliado y remitido a SOL-10 (PAG-02)");
                }}
              >
                <CheckCircle2 className="size-3.5 mr-1.5" />
                Conciliar Pago y Avanzar a SOL-10
              </Button>
            )}
          </div>
        </Card>

        {/* Tarjeta Principal de Factura y Pasarela */}
        <Card className="p-0 overflow-hidden border border-border bg-surface shadow-xs">
          {/* Header Card */}
          <div className="bg-muted/30 border-b border-border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="size-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Comprobante Electrónico {factura.numero}
                </h2>
              </div>
              <div className="text-xs text-muted-foreground mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                <p>
                  Entidad Privada:{" "}
                  <strong className="text-foreground">{factura.institucion}</strong>
                </p>
                <p>
                  Fecha de emisión API:{" "}
                  <strong className="text-foreground">{factura.fechaEmision}</strong>
                </p>
                <p>
                  Solicitud asociada:{" "}
                  <strong className="text-foreground font-mono">
                    {factura.solicitud}
                  </strong>
                </p>
                <p>
                  Contrato firmado (DOC-03):{" "}
                  <strong className="text-foreground font-mono">
                    {solicitud?.contratoDetalle?.numero ||
                      solicitud?.contrato ||
                      "CON-PRIV-2026-005"}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-xs text-muted-foreground font-medium">
                Total Calculado ({factura.versionTarifaria})
              </span>
              <span className="text-3xl font-bold text-foreground">
                {factura.valorFormateado}
              </span>
              {isPagoVerificado ? (
                <Badge
                  tone="success"
                  appearance="soft"
                  className="gap-1 text-xs font-semibold"
                >
                  <CheckCircle2 className="size-3" />
                  Pago confirmado por Pasarela (PAG-02)
                </Badge>
              ) : isDivergenciaFactura ? (
                <Badge
                  tone="danger"
                  appearance="soft"
                  className="gap-1 text-xs font-semibold"
                >
                  <AlertTriangle className="size-3" />
                  Divergencia de facturación (FAC-02)
                </Badge>
              ) : isBloqueadoIntentos ? (
                <Badge
                  tone="danger"
                  appearance="soft"
                  className="gap-1 text-xs font-semibold"
                >
                  <Ban className="size-3" />
                  Pago bloqueado por intentos ({pasarela.intentosRealizados}/
                  {pasarela.maxIntentos})
                </Badge>
              ) : isEnConciliacion ? (
                <Badge
                  tone="warning"
                  appearance="soft"
                  className="gap-1 text-xs font-semibold"
                >
                  <Clock className="size-3" />
                  En conciliación técnica (PAG-02)
                </Badge>
              ) : isCerradaReversion ? (
                <Badge
                  tone="neutral"
                  appearance="soft"
                  className="gap-1 text-xs font-semibold"
                >
                  Cerrada por reversión (PAG-04)
                </Badge>
              ) : (
                <Badge
                  tone="warning"
                  appearance="soft"
                  className="text-xs font-semibold"
                >
                  Pendiente de pago en pasarela
                </Badge>
              )}
            </div>
          </div>

          {/* Banners de Estado según Rama BN-08 */}
          {isPagoVerificado && (
            <div className="bg-success/10 border-b border-success/30 p-4 flex gap-3 items-start">
              <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-bold text-foreground">
                  Pago electrónico verificado automáticamente mediante Webhook Firmado (PAG-02)
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  Referencia de transacción:{" "}
                  <strong className="text-foreground font-mono">
                    {pasarela.referenciaTransaccion || "PAS-TX-9948102"}
                  </strong>
                  . El expediente fue remitido automáticamente al{" "}
                  <strong className="text-foreground">Director de Gestión</strong>{" "}
                  para la Aprobación Final y disparo de aprovisionamiento Apigee (`SOL-10` → `ACC-01`).
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs bg-background"
                  >
                    <Link href={`/acceso-interoperabilidad/solicitudes/${id}`}>
                      Ver expediente de la solicitud
                      <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isDivergenciaFactura && (
            <div className="bg-destructive/10 border-b border-destructive/30 p-4 flex gap-3 items-start">
              <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <h3 className="font-bold text-foreground">
                  Excepción en Emisión Electrónica: Divergencia de Facturación (FAC-02)
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  {factura.errorEmisionDetalle ||
                    "El servicio externo de facturación devolvió un estado ambiguo/timeout. El sistema bloqueó la creación de órdenes de pago hasta conciliar la existencia de un único comprobante válido."}
                </p>
              </div>
            </div>
          )}

          {isBloqueadoIntentos && (
            <div className="bg-destructive/10 border-b border-destructive/30 p-4 flex gap-3 items-start">
              <Ban className="size-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <h3 className="font-bold text-foreground">
                  Orden de Pago Bloqueada por Límite de Intentos Fallidos (PAG-03 / PAG-05)
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  Se alcanzaron{" "}
                  <strong>
                    {pasarela.intentosRealizados} de {pasarela.maxIntentos}
                  </strong>{" "}
                  intentos fallidos permitidos en la configuración `PAG-00`. Último motivo:{" "}
                  <span className="text-foreground font-medium">
                    {pasarela.ultimoErrorMotivo}
                  </span>
                  . Solicite al Administrador la rehabilitación de intentos (`PAG-05`) manteniendo la misma factura.
                </p>
              </div>
            </div>
          )}

          {isEnConciliacion && (
            <div className="bg-warning/10 border-b border-warning/30 p-4 flex gap-3 items-start">
              <Clock className="size-5 text-warning shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <h3 className="font-bold text-foreground">
                  Notificación de Pasarela en Conciliación Técnica (PAG-02 Crit. 3)
                </h3>
                <p className="text-muted-foreground mt-0.5">
                  {pasarela.divergenciaDetalle ||
                    "La notificación del webhook presentó discrepancia y requiere conciliación antes de habilitar la aprobación final SOL-10."}
                </p>
              </div>
            </div>
          )}

          {/* Desglose del Cálculo Tarifario Automático (FAC-01) */}
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-foreground">
                  1. Desglose Inmutable del Cálculo Tarifario Automático (FAC-01)
                </h3>
                <Badge tone="neutral" appearance="outline" className="text-xs">
                  Versión Tarifaria: {factura.versionTarifaria}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-lg border border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">
                    Cupo Autorizado Facturado
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {factura.cupoFacturado.toLocaleString()} consultas
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">
                    Tipo de Evento Facturable
                  </p>
                  <p className="text-xs font-mono font-bold text-foreground mt-0.5">
                    {factura.tipoEventoFacturable}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">
                    Regla de Redondeo / Precisión
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {factura.modoRedondeo} ({factura.precisionDecimales} dec.)
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">
                    Estado Emisión API (FAC-01)
                  </p>
                  <p className="text-sm font-bold text-primary mt-0.5">
                    {factura.estadoEmisionApi}
                  </p>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-background">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 border-b border-border text-left">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground">
                        Concepto Tarifario (`concepto_facturable`)
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">
                        Base Tarifaria
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">
                        Descuentos
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">
                        Impuestos
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-muted-foreground text-right">
                        Total Facturado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {factura.conceptoFacturable}
                        <div className="text-[11px] text-muted-foreground">
                          Paquete asociado: {solicitud?.proyectoNombre || solicitud?.fuentePrincipal || "Paquete Financiero KYC"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {factura.baseTarifaria}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {factura.descuentosAplicables}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {factura.impuestos}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        {factura.valorFormateado}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Estado de la Orden en Pasarela de Pagos (PAG-01 / PAG-03) */}
            <div className="p-4 rounded-xl border border-border bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">
                    2. Estado de Orden en Pasarela de Pagos (PAG-01 / PAG-03)
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  Orden:{" "}
                  <strong className="text-foreground font-mono">
                    {pasarela.ordenPagoId}
                  </strong>{" "}
                  · Vigencia:{" "}
                  <strong className="text-foreground">
                    {pasarela.vigenciaOrdenMinutos} min
                  </strong>{" "}
                  · Intentos consumidos:{" "}
                  <strong className="text-foreground">
                    {pasarela.intentosRealizados} / {pasarela.maxIntentos}
                  </strong>
                  {pasarela.desbloqueosAutorizados > 0 && (
                    <span className="ml-2 text-success font-semibold">
                      (Rehabilitada {pasarela.desbloqueosAutorizados}x por Admin en PAG-05)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Acciones de Pago */}
          <div className="p-6 pt-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                <FileText className="size-3.5" />
                Descargar RIDE / XML de Factura Electrónica
              </Button>
            </div>

            {!isPagoVerificado &&
              !isDivergenciaFactura &&
              !isBloqueadoIntentos &&
              !isEnConciliacion &&
              !isCerradaReversion && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setModalPagoEnLinea(true)}
                    className="text-xs gap-1.5"
                    variant="primary"
                  >
                    <CreditCard className="size-3.5" />
                    Iniciar Pago en Pasarela (PAG-01)
                  </Button>
                </div>
              )}
          </div>
        </Card>
      </div>

      {/* Modal Pasarela de Pago (PAG-01 / PAG-02 / PAG-03) */}
      <Dialog open={modalPagoEnLinea} onOpenChange={setModalPagoEnLinea}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <CreditCard className="size-5 text-primary" />
              Checkout Pasarela de Pagos DINARP (PAG-01)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Orden vinculada a la factura electrónica{" "}
              <strong className="text-foreground">{factura.numero}</strong>. Al confirmar, la pasarela notificará vía Webhook firmado (`PAG-02`).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-1">
              <p>
                <span className="text-muted-foreground">Orden de Pasarela:</span>{" "}
                <strong className="text-foreground font-mono">
                  {pasarela.ordenPagoId}
                </strong>
              </p>
              <p>
                <span className="text-muted-foreground">Valor exacto:</span>{" "}
                <strong className="text-foreground">
                  {factura.valorFormateado}
                </strong>
              </p>
              <p>
                <span className="text-muted-foreground">Cupo asociado:</span>{" "}
                <strong className="text-foreground">
                  {factura.cupoFacturado.toLocaleString()} consultas API
                </strong>
              </p>
              <p>
                <span className="text-muted-foreground">Intento actual:</span>{" "}
                <strong className="text-foreground">
                  #{pasarela.intentosRealizados + 1} de {pasarela.maxIntentos}
                </strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">
                Medio de pago corporativo en pasarela:
              </label>
              <select className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background">
                <option>Débito Interbancario Corporativo (Tokenizado)</option>
                <option>Tarjeta Corporativa Institucional Visa / Mastercard</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimularFalloTarjeta}
              className="text-xs text-destructive"
            >
              Simular Rechazo (PAG-03)
            </Button>
            <Button
              size="sm"
              disabled={isProcessing}
              onClick={handlePagarEnLineaExitoso}
              variant="primary"
              className="gap-1.5 text-xs"
            >
              <Check className="size-4" />
              {isProcessing
                ? "Verificando firma de webhook..."
                : `Confirmar Pago ${factura.valorFormateado} (PAG-02)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WireframeDashboardLayout>
  );
}
