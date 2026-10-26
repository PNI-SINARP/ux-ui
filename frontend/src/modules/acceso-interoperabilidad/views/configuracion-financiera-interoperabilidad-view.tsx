"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Receipt,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  Play,
  Ban,
  Unlock,
  Check,
  History,
  Settings2,
  ServerCrash,
  FileCheck2,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSolicitudesStore } from "../data/solicitudes-store";

interface VersionTarifaria {
  id: string;
  codigoVersion: string;
  archivoNombre: string;
  estadoCarga: "CARGADA" | "VALIDADA" | "INVALIDA";
  estadoPublicacion: "BORRADOR" | "VIGENTE" | "HISTORICA" | "PROGRAMADA" | "ANULADA";
  vigenciaDesde: string;
  vigenciaHasta: string | null;
  modoRedondeo: "HALF_UP" | "HALF_EVEN" | "FLOOR";
  precisionDecimales: number;
  usuarioAuditoria: string;
  fechaAuditoria: string;
  erroresValidacion?: string[];
  conceptos: {
    codigo: string;
    nombre: string;
    tipoEvento: string;
    tipoCalculo: "FIJO" | "UNITARIO" | "POR_TRAMOS";
    tarifaBase: number;
    impuestoPorcentaje: number;
  }[];
}

interface ConfigIntegrationVersion {
  version: string;
  ambiente: "Producción" | "Pruebas";
  endpoint: string;
  estado: "ACTIVA" | "HISTORICA" | "BORRADOR" | "ERROR_PRUEBA";
  fecha: string;
  autor: string;
  detalle: string;
}

export function ConfiguracionFinancieraInteroperabilidadView() {
  const {
    solicitudes,
    conciliarEmisionFactura,
    conciliarPagoPasarela,
    autorizarNuevosIntentosPago,
    simularDivergenciaFactura,
    simularPagoDivergenteConciliacion,
  } = useSolicitudesStore();

  const [activeTab, setActiveTab] = useState("tarifario");
  const [feedbackBanner, setFeedbackBanner] = useState<{
    tone: "success" | "warning" | "danger" | "info";
    title: string;
    detail: string;
  } | null>(null);

  // =========================================================================
  // TAB 1: TAR-01 & TAR-02 — Tarifario y Versiones
  // =========================================================================
  const [versionesTarifarias, setVersionesTarifarias] = useState<VersionTarifaria[]>([
    {
      id: "TAR-V2026-02",
      codigoVersion: "TAR-2026-V2.1",
      archivoNombre: "tarifario_dinarp_2026_v2_1.xlsx",
      estadoCarga: "VALIDADA",
      estadoPublicacion: "VIGENTE",
      vigenciaDesde: "2026-01-01",
      vigenciaHasta: null,
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      usuarioAuditoria: "admin.finanzas@dinarp.gob.ec",
      fechaAuditoria: "2026-01-01 08:00:00",
      conceptos: [
        {
          codigo: "CON-PRIV-001",
          nombre: "Suscripción Anual + Paquete Consultas Demográficas/Societarias",
          tipoEvento: "HABILITACION_INICIAL_CUPO",
          tipoCalculo: "POR_TRAMOS",
          tarifaBase: 0.04,
          impuestoPorcentaje: 0,
        },
        {
          codigo: "CON-PRIV-002",
          nombre: "Renovación / Ampliación de Cupo Mensual API Privada",
          tipoEvento: "AMPLIACION_CUPO",
          tipoCalculo: "UNITARIO",
          tarifaBase: 0.035,
          impuestoPorcentaje: 0,
        },
        {
          codigo: "CON-PRIV-003",
          nombre: "Derecho Fijo de Conexión Segura WS-SINARP",
          tipoEvento: "DERECHO_CONEXION",
          tipoCalculo: "FIJO",
          tarifaBase: 250.0,
          impuestoPorcentaje: 0,
        },
      ],
    },
    {
      id: "TAR-V2026-03",
      codigoVersion: "TAR-2026-V3.0-PROY",
      archivoNombre: "tarifario_dinarp_2026_q4.csv",
      estadoCarga: "VALIDADA",
      estadoPublicacion: "PROGRAMADA",
      vigenciaDesde: "2026-11-01",
      vigenciaHasta: null,
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      usuarioAuditoria: "admin.finanzas@dinarp.gob.ec",
      fechaAuditoria: "2026-04-01 11:20:00",
      conceptos: [
        {
          codigo: "CON-PRIV-001",
          nombre: "Suscripción Anual + Paquete Consultas Demográficas/Societarias (Q4)",
          tipoEvento: "HABILITACION_INICIAL_CUPO",
          tipoCalculo: "POR_TRAMOS",
          tarifaBase: 0.038,
          impuestoPorcentaje: 0,
        },
      ],
    },
    {
      id: "TAR-V2025-01",
      codigoVersion: "TAR-2025-V1.0",
      archivoNombre: "tarifario_dinarp_2025_anual.xlsx",
      estadoCarga: "VALIDADA",
      estadoPublicacion: "HISTORICA",
      vigenciaDesde: "2025-01-01",
      vigenciaHasta: "2025-12-31",
      modoRedondeo: "HALF_UP",
      precisionDecimales: 2,
      usuarioAuditoria: "admin.sistema@dinarp.gob.ec",
      fechaAuditoria: "2025-01-01 00:00:00",
      conceptos: [],
    },
  ]);

  const [modalNuevaVersionOpen, setModalNuevaVersionOpen] = useState(false);
  const [nuevoCodigoVersion, setNuevoCodigoVersion] = useState("TAR-2026-V3.1");
  const [nuevoArchivoNombre, setNuevoArchivoNombre] = useState("tarifario_sinarp_2026_v3_1.xlsx");
  const [nuevaVigenciaDesde, setNuevaVigenciaDesde] = useState("2026-12-01");
  const [nuevoModoRedondeo, setNuevoModoRedondeo] = useState<"HALF_UP" | "HALF_EVEN" | "FLOOR">("HALF_UP");
  const [nuevaPrecision, setNuevaPrecision] = useState("2");
  const [simularArchivoCorrupto, setSimularArchivoCorrupto] = useState(false);

  const handleCargarTarifario = () => {
    if (simularArchivoCorrupto) {
      const nuevaInvalida: VersionTarifaria = {
        id: `TAR-${Date.now()}`,
        codigoVersion: nuevoCodigoVersion,
        archivoNombre: nuevoArchivoNombre,
        estadoCarga: "INVALIDA",
        estadoPublicacion: "BORRADOR",
        vigenciaDesde: nuevaVigenciaDesde,
        vigenciaHasta: null,
        modoRedondeo: nuevoModoRedondeo,
        precisionDecimales: Number(nuevaPrecision) || 2,
        usuarioAuditoria: "admin.finanzas@dinarp.gob.ec",
        fechaAuditoria: new Date().toISOString().replace("T", " ").substring(0, 19),
        erroresValidacion: [
          "Fila 14: columna 'tarifa_base' contiene valor negativo (-0.02).",
          "Fila 22: 'tipo_calculo' desconocido ('PROMEDIO_MOVIL'). Valores permitidos: FIJO, UNITARIO, POR_TRAMOS.",
        ],
        conceptos: [],
      };
      setVersionesTarifarias((prev) => [nuevaInvalida, ...prev]);
      setModalNuevaVersionOpen(false);
      setFeedbackBanner({
        tone: "danger",
        title: "Archivo tarifario rechazado en validación estructural (TAR-01 Crit. 2)",
        detail: `La carga '${nuevoCodigoVersion}' quedó en estado INVALIDA. No puede ser publicada hasta corregir las filas reportadas.`,
      });
      return;
    }

    const nuevaValida: VersionTarifaria = {
      id: `TAR-${Date.now()}`,
      codigoVersion: nuevoCodigoVersion,
      archivoNombre: nuevoArchivoNombre,
      estadoCarga: "VALIDADA",
      estadoPublicacion: "BORRADOR",
      vigenciaDesde: nuevaVigenciaDesde,
      vigenciaHasta: null,
      modoRedondeo: nuevoModoRedondeo,
      precisionDecimales: Number(nuevaPrecision) || 2,
      usuarioAuditoria: "admin.finanzas@dinarp.gob.ec",
      fechaAuditoria: new Date().toISOString().replace("T", " ").substring(0, 19),
      conceptos: [
        {
          codigo: "CON-PRIV-001",
          nombre: "Suscripción Anual + Paquete Consultas Demográficas",
          tipoEvento: "HABILITACION_INICIAL_CUPO",
          tipoCalculo: "POR_TRAMOS",
          tarifaBase: 0.04,
          impuestoPorcentaje: 0,
        },
        {
          codigo: "CON-PRIV-004",
          nombre: "Consulta Biométrica / Mercantil Especializada",
          tipoEvento: "CONSUMO_ESPECIALIZADO",
          tipoCalculo: "UNITARIO",
          tarifaBase: 0.06,
          impuestoPorcentaje: 0,
        },
      ],
    };

    setVersionesTarifarias((prev) => [nuevaValida, ...prev]);
    setModalNuevaVersionOpen(false);
    setFeedbackBanner({
      tone: "success",
      title: "Versión tarifaria cargada y validada (TAR-01)",
      detail: `La versión ${nuevoCodigoVersion} superó las validaciones de formato, precisión decimal (${nuevaPrecision}) y reglas de cálculo. Lista para publicar en TAR-02.`,
    });
  };

  const handlePublicarVersion = (id: string) => {
    const target = versionesTarifarias.find((v) => v.id === id);
    if (!target) return;

    if (target.estadoCarga !== "VALIDADA") {
      setFeedbackBanner({
        tone: "danger",
        title: "Publicación bloqueada (TAR-02)",
        detail: "Solo versiones en estado VALIDADA pueden ser publicadas como vigentes.",
      });
      return;
    }

    // Check overlap
    const solapa = versionesTarifarias.find(
      (v) =>
        v.id !== id &&
        (v.estadoPublicacion === "VIGENTE" || v.estadoPublicacion === "PROGRAMADA") &&
        v.vigenciaDesde === target.vigenciaDesde
    );

    if (solapa) {
      setFeedbackBanner({
        tone: "danger",
        title: "Conflicto de solapamiento de vigencia detectado (TAR-02 Crit. 2)",
        detail: `La fecha ${target.vigenciaDesde} colisiona con la versión ${solapa.codigoVersion}. Modifique la fecha o anule la versión programada antes de publicar.`,
      });
      return;
    }

    setVersionesTarifarias((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return { ...v, estadoPublicacion: "VIGENTE" };
        }
        if (v.estadoPublicacion === "VIGENTE") {
          return {
            ...v,
            estadoPublicacion: "HISTORICA",
            vigenciaHasta: target.vigenciaDesde,
          };
        }
        return v;
      })
    );

    setFeedbackBanner({
      tone: "success",
      title: "Nueva versión tarifaria publicada como VIGENTE (TAR-02)",
      detail: `La versión ${target.codigoVersion} aplica para nuevos cálculos de FAC-01. Las facturas ya emitidas conservan inmutablemente su versión original.`,
    });
  };

  const handleAnularProgramada = (id: string) => {
    setVersionesTarifarias((prev) =>
      prev.map((v) => (v.id === id ? { ...v, estadoPublicacion: "ANULADA" } : v))
    );
    setFeedbackBanner({
      tone: "info",
      title: "Versión futura no vigente anulada (TAR-02 Crit. 3)",
      detail: "La versión programada fue anulada con trazabilidad en bitácora sin afectar la versión vigente.",
    });
  };

  // =========================================================================
  // TAB 2: FAC-00 — API de Facturación Electrónica
  // =========================================================================
  const [facAmbiente, setFacAmbiente] = useState<"Producción" | "Pruebas">("Producción");
  const [facEndpoint, setFacEndpoint] = useState("https://api.sri-facturacion.dinarp.gob.ec/v2/comprobantes/emision");
  const [facApiKey, setFacApiKey] = useState("sk_live_fac_dinarp_9948102938a7f9e2");
  const [facShowSecret, setFacShowSecret] = useState(false);
  const [facTimeoutMs, setFacTimeoutMs] = useState("8000");
  const [facTestStatus, setFacTestStatus] = useState<"IDLE" | "VALIDATED" | "FAILED">("VALIDATED");
  const [facActiveVersion, setFacActiveVersion] = useState("FAC-CFG-V4.2");
  const [facHistory, setFacHistory] = useState<ConfigIntegrationVersion[]>([
    {
      version: "FAC-CFG-V4.2",
      ambiente: "Producción",
      endpoint: "https://api.sri-facturacion.dinarp.gob.ec/v2/comprobantes/emision",
      estado: "ACTIVA",
      fecha: "2026-02-10 09:30:00",
      autor: "admin.infra@dinarp.gob.ec",
      detalle: "Conexión firmada XAdES-BES automática para entidades privadas (FAC-01).",
    },
    {
      version: "FAC-CFG-V4.1",
      ambiente: "Pruebas",
      endpoint: "https://sandbox.sri-facturacion.dinarp.gob.ec/v2/comprobantes/emision",
      estado: "HISTORICA",
      fecha: "2026-01-12 15:10:00",
      autor: "admin.infra@dinarp.gob.ec",
      detalle: "Entorno de homologación inicial.",
    },
  ]);

  const handleProbarFacApi = (simularFallo: boolean) => {
    if (simularFallo) {
      setFacTestStatus("FAILED");
      setFeedbackBanner({
        tone: "danger",
        title: "Fallo en prueba de conexión con API de Facturación (FAC-00 Crit. 2)",
        detail: "HTTP 503 / Certificado de firma electrónica rechazado. La configuración permanece en BORRADOR y no puede activarse.",
      });
    } else {
      setFacTestStatus("VALIDATED");
      setFeedbackBanner({
        tone: "success",
        title: "Prueba de conectividad e idoneidad criptográfica exitosa (FAC-00)",
        detail: `Endpoint ${facEndpoint} respondió HTTP 200 OK en 142ms. Configuración lista para activar.`,
      });
    }
  };

  const handleActivarFacConfig = () => {
    if (facTestStatus !== "VALIDATED") return;
    const newVer = `FAC-CFG-V4.${facHistory.length + 1}`;
    setFacActiveVersion(newVer);
    setFacHistory((prev) => [
      {
        version: newVer,
        ambiente: facAmbiente,
        endpoint: facEndpoint,
        estado: "ACTIVA",
        fecha: new Date().toISOString().replace("T", " ").substring(0, 19),
        autor: "admin.infra@dinarp.gob.ec",
        detalle: `Activación verificada (${facTimeoutMs}ms timeout). Credenciales enmascaradas.`,
      },
      ...prev.map((h) => ({ ...h, estado: "HISTORICA" as const })),
    ]);
    setFeedbackBanner({
      tone: "success",
      title: `Configuración ${newVer} activada en producción (FAC-00)`,
      detail: "Todas las nuevas emisiones automáticas (FAC-01) utilizarán esta versión.",
    });
  };

  // =========================================================================
  // TAB 3: PAG-00 — Pasarela de Pagos y Webhook
  // =========================================================================
  const [pagAmbiente, setPagAmbiente] = useState<"Producción" | "Pruebas">("Producción");
  const [pagComercioId, setPagComercioId] = useState("MID-DINARP-EC-009281");
  const [pagEndpointCheckout, setPagEndpointCheckout] = useState("https://checkout.pasarela-interbancaria.ec/v3/orders");
  const [pagWebhookUrl, setPagWebhookUrl] = useState("https://api.sinarp.dinarp.gob.ec/webhooks/v1/pagos-confirmacion");
  const [pagWebhookSecret, setPagWebhookSecret] = useState("whsec_dinarp_hmac_sha256_88219a0c7b4e");
  const [pagShowSecret, setPagShowSecret] = useState(false);
  const [pagVigenciaOrdenMinutos, setPagVigenciaOrdenMinutos] = useState("1440");
  const [pagMaxIntentos, setPagMaxIntentos] = useState("3");
  const [pagTestStatus, setPagTestStatus] = useState<"IDLE" | "VALIDATED" | "FAILED">("VALIDATED");
  const [pagActiveVersion, setPagActiveVersion] = useState("PAG-CFG-V2.0");

  const handleProbarPasarela = (simularFallo: boolean) => {
    const maxInt = Number(pagMaxIntentos);
    const vigMin = Number(pagVigenciaOrdenMinutos);
    if (!Number.isInteger(maxInt) || maxInt <= 0 || !Number.isInteger(vigMin) || vigMin <= 0) {
      setPagTestStatus("FAILED");
      setFeedbackBanner({
        tone: "danger",
        title: "Parámetros operativos inválidos (PAG-00 Crit. 1)",
        detail: "Tanto 'max_intentos_pago' como 'vigencia_orden' deben ser números enteros positivos mayores a cero.",
      });
      return;
    }

    if (simularFallo) {
      setPagTestStatus("FAILED");
      setFeedbackBanner({
        tone: "danger",
        title: "Fallo en validación de firma HMAC de Webhook (PAG-00 Crit. 2)",
        detail: "La pasarela reportó discrepancia en llave de firma de callback. No se permite activar en Producción.",
      });
    } else {
      setPagTestStatus("VALIDATED");
      setFeedbackBanner({
        tone: "success",
        title: "Pasarela y firma HMAC de Webhook verificadas (PAG-00)",
        detail: `Comercio ${pagComercioId} validado. Límite operativo: ${maxInt} intentos máx. por factura (PAG-03).`,
      });
    }
  };

  const handleActivarPagConfig = () => {
    if (pagTestStatus !== "VALIDATED") return;
    const nextVer = `PAG-CFG-V2.${Math.floor(Math.random() * 9) + 1}`;
    setPagActiveVersion(nextVer);
    setFeedbackBanner({
      tone: "success",
      title: `Configuración de Pasarela ${nextVer} activada (PAG-00)`,
      detail: `Órdenes de pago operan con vigencia de ${pagVigenciaOrdenMinutos} min y bloqueo automático tras ${pagMaxIntentos} intentos fallidos.`,
    });
  };

  // =========================================================================
  // TAB 4: FAC-02 / PAG-02 / PAG-05 — Conciliación y Desbloqueo
  // =========================================================================
  const [modalDesbloqueo, setModalDesbloqueo] = useState<string | null>(null);
  const [motivoDesbloqueo, setMotivoDesbloqueo] = useState("");
  const [modalConciliacionPago, setModalConciliacionPago] = useState<string | null>(null);
  const [notaConciliacionPago, setNotaConciliacionPago] = useState("");

  const casosExcepcionFinanciera = solicitudes.filter(
    (s) =>
      s.tipoInstitucion === "Privada" &&
      (s.estado === "Divergencia de facturación" ||
        s.estado === "En conciliación" ||
        s.estado === "Pago bloqueado por intentos" ||
        s.estado === "Pendiente de pago")
  );

  const handleConfirmarDesbloqueo = () => {
    if (!modalDesbloqueo || !motivoDesbloqueo.trim()) return;
    autorizarNuevosIntentosPago(
      modalDesbloqueo,
      motivoDesbloqueo.trim(),
      "Administrador Financiero SINARP"
    );
    setModalDesbloqueo(null);
    setMotivoDesbloqueo("");
    setFeedbackBanner({
      tone: "success",
      title: "Nuevos intentos de pago autorizados (PAG-05)",
      detail: `Se reinició el contador de intentos a 0/3 manteniendo la misma factura vigente para la solicitud ${modalDesbloqueo}.`,
    });
  };

  const handleConfirmarConciliacionPago = () => {
    if (!modalConciliacionPago || !notaConciliacionPago.trim()) return;
    conciliarPagoPasarela(
      modalConciliacionPago,
      notaConciliacionPago.trim(),
      "Administrador Financiero SINARP"
    );
    setModalConciliacionPago(null);
    setNotaConciliacionPago("");
    setFeedbackBanner({
      tone: "success",
      title: "Pago en pasarela conciliado y confirmado (PAG-02 Crit. 3)",
      detail: `La solicitud ${modalConciliacionPago} pasó a estado 'Pago verificado' y fue remitida a Dirección de Gestión (SOL-10).`,
    });
  };

  return (
    <div className="layout-container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="primary" appearance="soft">
              BN-08 · Administración Financiera y Recaudación Automática
            </Badge>
            <Badge tone="info" appearance="outline">
              TAR-01 · TAR-02 · FAC-00 · PAG-00 · FAC-02 · PAG-05
            </Badge>
          </div>
          <h1 className="text-h2 font-heading font-bold text-foreground">
            Configuración de Tarifario, Facturación API y Pasarela de Pagos
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Parametrización centralizada para entidades privadas (sin SIGEF ni rol Financiero manual). Incluye mesa de conciliación de divergencias y desbloqueo de intentos.
          </p>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackBanner && (
        <div
          className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
            feedbackBanner.tone === "success"
              ? "bg-success/10 border-success/30 text-foreground"
              : feedbackBanner.tone === "danger"
              ? "bg-destructive/10 border-destructive/30 text-foreground"
              : feedbackBanner.tone === "warning"
              ? "bg-warning/10 border-warning/30 text-foreground"
              : "bg-primary/10 border-primary/30 text-foreground"
          }`}
        >
          <div className="flex items-start gap-3">
            {feedbackBanner.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
            ) : feedbackBanner.tone === "danger" ? (
              <ServerCrash className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-body-sm font-semibold">{feedbackBanner.title}</p>
              <p className="text-caption text-muted-foreground mt-0.5">{feedbackBanner.detail}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedbackBanner(null)}>
            Cerrar
          </Button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-caption text-muted-foreground font-medium">Versión Tarifaria Vigente</p>
              <p className="text-h3 font-heading font-bold text-foreground mt-1">
                {versionesTarifarias.find((v) => v.estadoPublicacion === "VIGENTE")?.codigoVersion || "N/A"}
              </p>
              <p className="text-caption text-success mt-0.5">TAR-01 / TAR-02 · Inmutable por factura</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-caption text-muted-foreground font-medium">API Facturación Electrónica</p>
              <p className="text-h3 font-heading font-bold text-foreground mt-1">{facActiveVersion}</p>
              <p className="text-caption text-muted-foreground mt-0.5">FAC-00 · {facAmbiente}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <Receipt className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-caption text-muted-foreground font-medium">Pasarela de Pagos Activa</p>
              <p className="text-h3 font-heading font-bold text-foreground mt-1">{pagActiveVersion}</p>
              <p className="text-caption text-muted-foreground mt-0.5">
                PAG-00 · Máx {pagMaxIntentos} intentos / {pagVigenciaOrdenMinutos}m
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-caption text-muted-foreground font-medium">Excepciones por Resolver</p>
              <p className="text-h3 font-heading font-bold text-warning mt-1">
                {
                  casosExcepcionFinanciera.filter(
                    (c) => c.estado !== "Pendiente de pago"
                  ).length
                }
              </p>
              <p className="text-caption text-muted-foreground mt-0.5">FAC-02 · PAG-02 · PAG-05</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="tarifario" className="py-2 text-body-sm">
            1. Tarifario y Versiones (TAR-01/02)
          </TabsTrigger>
          <TabsTrigger value="facturacion-api" className="py-2 text-body-sm">
            2. API Facturación (FAC-00)
          </TabsTrigger>
          <TabsTrigger value="pasarela-api" className="py-2 text-body-sm">
            3. Pasarela de Pagos (PAG-00)
          </TabsTrigger>
          <TabsTrigger value="conciliacion" className="py-2 text-body-sm">
            4. Conciliación y Desbloqueo (FAC-02/PAG-05)
          </TabsTrigger>
        </TabsList>

        {/* =============================================================== */}
        {/* TAB 1: TAR-01 & TAR-02 */}
        {/* =============================================================== */}
        <TabsContent value="tarifario" className="space-y-6">
          <Card className="border-border bg-surface">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-h3 font-heading">
                  Catálogo de Versiones Tarifarias y Reglas de Cálculo (TAR-01 / TAR-02)
                </CardTitle>
                <CardDescription>
                  Cargue archivos tarifarios estructurados (`fijo`, `unitario`, `por tramos`), valide su integridad sin solapamiento de fechas y publique la versión vigente.
                </CardDescription>
              </div>
              <Button variant="primary" onClick={() => setModalNuevaVersionOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Cargar Nueva Versión Tarifaria (TAR-01)
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Versión</TableHead>
                      <TableHead>Archivo Fuente</TableHead>
                      <TableHead>Estado Carga (TAR-01)</TableHead>
                      <TableHead>Estado Vigencia (TAR-02)</TableHead>
                      <TableHead>Vigencia Desde / Hasta</TableHead>
                      <TableHead>Redondeo / Decimales</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versionesTarifarias.map((ver) => (
                      <TableRow key={ver.id}>
                        <TableCell className="font-semibold text-foreground">
                          {ver.codigoVersion}
                          <div className="text-caption text-muted-foreground">
                            {ver.usuarioAuditoria}
                          </div>
                        </TableCell>
                        <TableCell className="text-body-sm">{ver.archivoNombre}</TableCell>
                        <TableCell>
                          <Badge
                            tone={
                              ver.estadoCarga === "VALIDADA"
                                ? "success"
                                : ver.estadoCarga === "INVALIDA"
                                ? "danger"
                                : "warning"
                            }
                            appearance="soft"
                          >
                            {ver.estadoCarga}
                          </Badge>
                          {ver.erroresValidacion && ver.erroresValidacion.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {ver.erroresValidacion.map((err, i) => (
                                <p key={i} className="text-caption text-destructive">
                                  • {err}
                                </p>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            tone={
                              ver.estadoPublicacion === "VIGENTE"
                                ? "primary"
                                : ver.estadoPublicacion === "PROGRAMADA"
                                ? "info"
                                : ver.estadoPublicacion === "ANULADA"
                                ? "danger"
                                : "neutral"
                            }
                            appearance={ver.estadoPublicacion === "VIGENTE" ? "solid" : "soft"}
                          >
                            {ver.estadoPublicacion}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-body-sm">
                          <span className="font-medium">{ver.vigenciaDesde}</span>
                          {" → "}
                          <span className="text-muted-foreground">
                            {ver.vigenciaHasta || "Indefinido"}
                          </span>
                        </TableCell>
                        <TableCell className="text-body-sm">
                          {ver.modoRedondeo} ({ver.precisionDecimales} dec.)
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(ver.estadoPublicacion === "BORRADOR" ||
                              ver.estadoPublicacion === "PROGRAMADA") &&
                              ver.estadoCarga === "VALIDADA" && (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handlePublicarVersion(ver.id)}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />
                                  Publicar Vigente
                                </Button>
                              )}
                            {ver.estadoPublicacion === "PROGRAMADA" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAnularProgramada(ver.id)}
                              >
                                <Ban className="h-3.5 w-3.5 mr-1" />
                                Anular Futura
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Detalle de conceptos de la versión vigente */}
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-body font-semibold text-foreground">
                    Conceptos Tarifarios y Reglas de Cálculo en Versión Vigente (TAR-01)
                  </h3>
                  <Badge tone="success" appearance="soft">
                    Aplicado automáticamente en FAC-01
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {versionesTarifarias
                    .find((v) => v.estadoPublicacion === "VIGENTE")
                    ?.conceptos.map((c) => (
                      <div
                        key={c.codigo}
                        className="p-3 rounded-md border border-border bg-surface space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-caption font-bold text-primary">{c.codigo}</span>
                          <Badge tone="neutral" appearance="outline">
                            {c.tipoCalculo}
                          </Badge>
                        </div>
                        <p className="text-body-sm font-medium text-foreground">{c.nombre}</p>
                        <p className="text-caption text-muted-foreground">
                          Evento: <code className="text-foreground">{c.tipoEvento}</code> · Base:{" "}
                          <strong className="text-foreground">USD {c.tarifaBase.toFixed(3)}</strong>
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 2: FAC-00 — API de Facturación Electrónica */}
        {/* =============================================================== */}
        <TabsContent value="facturacion-api" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border bg-surface">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-h3 font-heading">
                    Parámetros de Integración API de Facturación (FAC-00)
                  </CardTitle>
                  <Badge
                    tone={facTestStatus === "VALIDATED" ? "success" : "danger"}
                    appearance="soft"
                  >
                    {facTestStatus === "VALIDATED"
                      ? "Conexión Verificada"
                      : "Error en Prueba de Conexión"}
                  </Badge>
                </div>
                <CardDescription>
                  Configure el servicio de emisión automática de facturas para entidades privadas tras la firma del contrato (DOC-03 → FAC-01).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-body-sm font-medium text-foreground">
                      Ambiente Operativo
                    </label>
                    <div className="flex gap-2">
                      {(["Producción", "Pruebas"] as const).map((amb) => (
                        <Button
                          key={amb}
                          type="button"
                          variant={facAmbiente === amb ? "primary" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFacAmbiente(amb);
                            setFacTestStatus("IDLE");
                          }}
                        >
                          {amb}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-body-sm font-medium text-foreground">
                      Timeout de Emisión Síncrona (ms)
                    </label>
                    <Input
                      value={facTimeoutMs}
                      onChange={(e) => setFacTimeoutMs(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Endpoint REST de Emisión Electrónica
                  </label>
                  <Input
                    value={facEndpoint}
                    onChange={(e) => {
                      setFacEndpoint(e.target.value);
                      setFacTestStatus("IDLE");
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Credencial / Token de Firma API (Enmascarado tras guardar)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type={facShowSecret ? "text" : "password"}
                      value={facApiKey}
                      onChange={(e) => {
                        setFacApiKey(e.target.value);
                        setFacTestStatus("IDLE");
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFacShowSecret(!facShowSecret)}
                    >
                      {facShowSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleProbarFacApi(false)}
                    >
                      <Play className="h-4 w-4 mr-1.5" />
                      Probar Conexión API (OK)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleProbarFacApi(true)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1.5 text-warning" />
                      Simular Fallo de Conexión (Crit. 2)
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={facTestStatus !== "VALIDATED"}
                    onClick={handleActivarFacConfig}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Activar Versión en {facAmbiente}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-h3 font-heading flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Historial de Versiones (FAC-00)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {facHistory.map((item) => (
                  <div
                    key={item.version}
                    className="p-3 rounded-lg border border-border bg-muted/20 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm font-bold text-foreground">{item.version}</span>
                      <Badge
                        tone={item.estado === "ACTIVA" ? "success" : "neutral"}
                        appearance="soft"
                      >
                        {item.estado}
                      </Badge>
                    </div>
                    <p className="text-caption text-muted-foreground truncate">{item.endpoint}</p>
                    <p className="text-caption text-foreground">{item.detalle}</p>
                    <p className="text-caption text-muted-foreground">
                      {item.fecha} · {item.autor}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 3: PAG-00 — Pasarela de Pagos */}
        {/* =============================================================== */}
        <TabsContent value="pasarela-api" className="space-y-6">
          <Card className="border-border bg-surface">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-h3 font-heading">
                    Configuración de Pasarela de Pagos y Webhook Firmado (PAG-00)
                  </CardTitle>
                  <CardDescription>
                    Define comercio, endpoints, validación criptográfica de callback, `vigencia_orden` y `max_intentos_pago` (bloqueo automático en PAG-03).
                  </CardDescription>
                </div>
                <Badge
                  tone={pagTestStatus === "VALIDATED" ? "success" : "danger"}
                  appearance="soft"
                >
                  {pagTestStatus === "VALIDATED" ? "Pasarela Validada" : "Bloqueada para Activación"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Identificador de Comercio (MID)
                  </label>
                  <Input
                    value={pagComercioId}
                    onChange={(e) => setPagComercioId(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Vigencia de Orden (`vigencia_orden` en min)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={pagVigenciaOrdenMinutos}
                    onChange={(e) => {
                      setPagVigenciaOrdenMinutos(e.target.value);
                      setPagTestStatus("IDLE");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Máximo Intentos Fallidos (`max_intentos_pago`)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={pagMaxIntentos}
                    onChange={(e) => {
                      setPagMaxIntentos(e.target.value);
                      setPagTestStatus("IDLE");
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    Endpoint de Creación de Orden / Checkout (PAG-01)
                  </label>
                  <Input
                    value={pagEndpointCheckout}
                    onChange={(e) => setPagEndpointCheckout(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-body-sm font-medium text-foreground">
                    URL de Callback / Webhook de Confirmación (PAG-02)
                  </label>
                  <Input
                    value={pagWebhookUrl}
                    onChange={(e) => setPagWebhookUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-foreground">
                  Secreto de Firma HMAC-SHA256 para Validación de Webhook (Enmascarado)
                </label>
                <div className="flex gap-2">
                  <Input
                    type={pagShowSecret ? "text" : "password"}
                    value={pagWebhookSecret}
                    onChange={(e) => setPagWebhookSecret(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPagShowSecret(!pagShowSecret)}
                  >
                    {pagShowSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleProbarPasarela(false)}
                  >
                    <Play className="h-4 w-4 mr-1.5" />
                    Probar Pasarela y Firma Webhook (OK)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleProbarPasarela(true)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5 text-warning" />
                    Simular Fallo de Firma Webhook (Crit. 2)
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  disabled={pagTestStatus !== "VALIDATED"}
                  onClick={handleActivarPagConfig}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Activar Configuración de Pasarela ({pagAmbiente})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* =============================================================== */}
        {/* TAB 4: FAC-02 / PAG-02 / PAG-05 — Conciliación y Desbloqueo */}
        {/* =============================================================== */}
        <TabsContent value="conciliacion" className="space-y-6">
          <Card className="border-border bg-surface">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-h3 font-heading">
                    Mesa Técnica de Conciliación y Desbloqueo de Intentos (FAC-02 · PAG-02 · PAG-05)
                  </CardTitle>
                  <CardDescription>
                    Gestione solicitudes privadas con divergencia en API de facturación, pagos pendientes de conciliación por webhook inconsistente o bloqueo tras agotar `max_intentos_pago`.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Trámite / Entidad Privada</TableHead>
                      <TableHead>Estado Actual</TableHead>
                      <TableHead>Factura / Cupo / Valor</TableHead>
                      <TableHead>Intentos Pasarela</TableHead>
                      <TableHead>Detalle de Excepción / Auditoría</TableHead>
                      <TableHead className="text-right">Acciones de Resolución</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {casosExcepcionFinanciera.map((sol) => (
                      <TableRow key={sol.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{sol.id}</div>
                          <div className="text-body-sm text-muted-foreground">
                            {sol.institucion}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            tone={
                              sol.estado === "Divergencia de facturación" ||
                              sol.estado === "Pago bloqueado por intentos"
                                ? "danger"
                                : sol.estado === "En conciliación"
                                ? "warning"
                                : "info"
                            }
                            appearance="soft"
                          >
                            {sol.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-body-sm">
                          <div className="font-medium text-foreground">
                            {sol.factura?.numero || "Sin comprobante"}
                          </div>
                          <div className="text-caption text-muted-foreground">
                            {sol.factura?.valor || "$ 0.00"} · Cupo:{" "}
                            {(sol.factura?.cupoFacturado ?? 0).toLocaleString()} cons.
                          </div>
                        </TableCell>
                        <TableCell className="text-body-sm">
                          <Badge
                            tone={
                              (sol.pasarelaPago?.intentosRealizados ?? 0) >=
                              (sol.pasarelaPago?.maxIntentos ?? 3)
                                ? "danger"
                                : "neutral"
                            }
                            appearance="outline"
                          >
                            {sol.pasarelaPago?.intentosRealizados ?? 0} /{" "}
                            {sol.pasarelaPago?.maxIntentos ?? 3} intentos
                          </Badge>
                          {(sol.pasarelaPago?.desbloqueosAutorizados ?? 0) > 0 && (
                            <div className="text-caption text-success mt-1">
                              Rehabilitado ({sol.pasarelaPago?.desbloqueosAutorizados}x)
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs text-caption text-muted-foreground">
                          {sol.factura?.errorApiDetalle ||
                            sol.pasarelaPago?.divergenciaDetalle ||
                            sol.pasarelaPago?.ultimoMotivoFallo ||
                            "Orden activa esperando pago o simulación."}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {sol.estado === "Divergencia de facturación" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  conciliarEmisionFactura(
                                    sol.id,
                                    "Administrador Financiero SINARP"
                                  );
                                  setFeedbackBanner({
                                    tone: "success",
                                    title: "Factura electrónica conciliada sin duplicidad (FAC-02)",
                                    detail: `El trámite ${sol.id} recuperó su comprobante único y avanzó a 'Pendiente de pago'.`,
                                  });
                                }}
                              >
                                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                Conciliar / Reintentar FAC-02
                              </Button>
                            )}

                            {sol.estado === "En conciliación" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setModalConciliacionPago(sol.id);
                                  setNotaConciliacionPago(
                                    "Verificado en extracto de pasarela interbancaria: monto exacto " +
                                      (sol.factura?.valor || "$ 150.00") +
                                      " y firma válida."
                                  );
                                }}
                              >
                                <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
                                Conciliar Pago (PAG-02)
                              </Button>
                            )}

                            {sol.estado === "Pago bloqueado por intentos" && (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => {
                                  setModalDesbloqueo(sol.id);
                                  setMotivoDesbloqueo("");
                                }}
                              >
                                <Unlock className="h-3.5 w-3.5 mr-1.5" />
                                Autorizar Nuevos Intentos (PAG-05)
                              </Button>
                            )}

                            {sol.estado === "Pendiente de pago" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => simularDivergenciaFactura(sol.id)}
                                >
                                  Simular FAC-02
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => simularPagoDivergenteConciliacion(sol.id)}
                                >
                                  Simular Conciliación PAG-02
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Cargar Nueva Versión Tarifaria (TAR-01) */}
      <Dialog open={modalNuevaVersionOpen} onOpenChange={setModalNuevaVersionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cargar y Validar Versión Tarifaria (TAR-01)</DialogTitle>
            <DialogDescription>
              Suba el archivo de conceptos tarifarios y configure la precisión decimal y el modo de redondeo para el motor FAC-01.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-foreground">
                  Código de Versión
                </label>
                <Input
                  value={nuevoCodigoVersion}
                  onChange={(e) => setNuevoCodigoVersion(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-foreground">
                  Inicio de Vigencia (`vigencia_desde`)
                </label>
                <Input
                  type="date"
                  value={nuevaVigenciaDesde}
                  onChange={(e) => setNuevaVigenciaDesde(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-foreground">
                Archivo Estructurado (.xlsx / .csv)
              </label>
              <Input
                value={nuevoArchivoNombre}
                onChange={(e) => setNuevoArchivoNombre(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-foreground">
                  Modo de Redondeo (`modo_redondeo`)
                </label>
                <div className="flex gap-1.5">
                  {(["HALF_UP", "HALF_EVEN", "FLOOR"] as const).map((modo) => (
                    <Button
                      key={modo}
                      type="button"
                      size="sm"
                      variant={nuevoModoRedondeo === modo ? "primary" : "outline"}
                      onClick={() => setNuevoModoRedondeo(modo)}
                    >
                      {modo}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium text-foreground">
                  Precisión Decimales
                </label>
                <Input
                  type="number"
                  min={2}
                  max={6}
                  value={nuevaPrecision}
                  onChange={(e) => setNuevaPrecision(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">
                  Simular archivo con errores de estructura (TAR-01 Crit. 2)
                </p>
                <p className="text-caption text-muted-foreground">
                  Si se activa, el archivo pasará a estado INVALIDA e impedirá su publicación.
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant={simularArchivoCorrupto ? "danger" : "outline"}
                onClick={() => setSimularArchivoCorrupto(!simularArchivoCorrupto)}
              >
                {simularArchivoCorrupto ? "Simulando Inválido" : "Archivo Válido"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNuevaVersionOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCargarTarifario}>
              Ejecutar Validación y Registrar (TAR-01)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Autorizar Nuevos Intentos de Pago (PAG-05) */}
      <Dialog open={!!modalDesbloqueo} onOpenChange={() => setModalDesbloqueo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autorizar Nuevos Intentos de Pago (PAG-05)</DialogTitle>
            <DialogDescription>
              La solicitud <strong>{modalDesbloqueo}</strong> agotó el número máximo de intentos en pasarela (`max_intentos_pago`). Al autorizar, se mantiene la misma factura vigente y se genera una nueva orden de pago con contador reiniciado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-body-sm font-medium text-foreground">
              Motivo Justificado de Rehabilitación (Obligatorio para Auditoría)
            </label>
            <Textarea
              rows={3}
              placeholder="Ej: La entidad privada reportó bloqueo temporal de tarjeta corporativa del banco emisor; se autoriza nuevo ciclo de 3 intentos sobre la factura original..."
              value={motivoDesbloqueo}
              onChange={(e) => setMotivoDesbloqueo(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDesbloqueo(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!motivoDesbloqueo.trim()}
              onClick={handleConfirmarDesbloqueo}
            >
              Confirmar Desbloqueo y Reiniciar Intentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Conciliar Pago en Pasarela (PAG-02 Crit. 3) */}
      <Dialog
        open={!!modalConciliacionPago}
        onOpenChange={() => setModalConciliacionPago(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conciliar Pago con Divergencia de Callback (PAG-02)</DialogTitle>
            <DialogDescription>
              Confirme manualmente la conciliación del pago de la solicitud{" "}
              <strong>{modalConciliacionPago}</strong> tras verificar el comprobante de liquidación de la pasarela.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="text-body-sm font-medium text-foreground">
              Dictamen Técnico de Conciliación
            </label>
            <Textarea
              rows={3}
              value={notaConciliacionPago}
              onChange={(e) => setNotaConciliacionPago(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalConciliacionPago(null)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              disabled={!notaConciliacionPago.trim()}
              onClick={handleConfirmarConciliacionPago}
            >
              Confirmar Pago Verificado y Enviar a SOL-10
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
