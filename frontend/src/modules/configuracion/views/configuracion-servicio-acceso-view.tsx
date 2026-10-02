"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Settings,
  Server,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  History,
  Info,
  Layers,
  Database,
  Radio,
  Eye,
  EyeOff,
  Cpu,
  Activity,
  Check,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";

interface EventoConfiguracion {
  id: string;
  fecha: string;
  parametro: string;
  valorAnterior: string;
  valorNuevo: string;
  actor: string;
  resultado: "APLICADO" | "EN_REVISION";
}

export function ConfiguracionServicioAccesoView() {
  // Selector de entorno: Producción vs Staging (aislamiento estricto)
  const [entorno, setEntorno] = useState<"PROD" | "STAGING">("PROD");
  const [proyecto, setProyecto] = useState("DINARP-INTEROP-IDENTITY-CORE");
  const [correoRemitente, setCorreoRemitente] = useState("seguridad.identidad@dinarp.gob.ec");
  const [correoVerificado, setCorreoVerificado] = useState(true);

  // Parámetros de autenticador
  const [algoritmoTotp, setAlgoritmoTotp] = useState("HMAC-SHA1");
  const [longitudDigitos, setLongitudDigitos] = useState("6");
  const [intervaloSegundos, setIntervaloSegundos] = useState("30");
  const [toleranciaVentana, setToleranciaVentana] = useState("1");
  const [exigirTotpTodos, setExigirTotpTodos] = useState(true);

  // Secretos enmascarados (no se exponen secretos)
  const [showSecretKey, setShowSecretKey] = useState(false);
  const secretKeyMasked = "â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢3F9A";

  // Estado del Health Check
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<"OK" | "WARNING" | null>("OK");
  const [lastCheckTime, setLastCheckTime] = useState<string>("30/09/2026 11:30:15");

  // Estado de sincronización (ID-13: si falla, mantiene cuenta pendiente, bloquea ingreso y permite reintentar)
  const [estadoSincronizacion, setEstadoSincronizacion] = useState<"SINCRONIZADO" | "FALLO" | "PENDIENTE">("SINCRONIZADO");
  const [isSyncing, setIsSyncing] = useState(false);
  const [cuentasPendientesSync, setCuentasPendientesSync] = useState(0);

  // Historial de cambios
  const [historialCambios, setHistorialCambios] = useState<EventoConfiguracion[]>([
    {
      id: "cfg-evt-001",
      fecha: "28/09/2026 14:10",
      parametro: "Política de TOTP",
      valorAnterior: "Opcional para consultas",
      valorNuevo: "Obligatorio en todos los roles institucionales",
      actor: "Administrador Técnico DINARP",
      resultado: "APLICADO"
    },
    {
      id: "cfg-evt-002",
      fecha: "20/09/2026 09:30",
      parametro: "Ventana de tolerancia temporal (drift)",
      valorAnterior: "2 pasos (±60s)",
      valorNuevo: "1 paso (±30s)",
      actor: "Administrador Técnico DINARP",
      resultado: "APLICADO"
    },
    {
      id: "cfg-evt-003",
      fecha: "10/09/2026 17:00",
      parametro: "Servidor NTP de sincronización",
      valorAnterior: "pool.ntp.org",
      valorNuevo: "ntp.dinarp.gob.ec (Servidor primario de tiempo)",
      actor: "Administrador Técnico DINARP",
      resultado: "APLICADO"
    }
  ]);

  const handleRunHealthCheck = () => {
    setIsCheckingHealth(true);
    setTimeout(() => {
      setIsCheckingHealth(false);
      setHealthStatus("OK");
      const now = new Date();
      setLastCheckTime(`${now.toLocaleDateString("es-EC")} ${now.toLocaleTimeString("es-EC")}`);
      toast.success("Comprobación técnica completada", {
        description: "Todos los servicios de autenticación y sincronización operan con normalidad.",
      });
    }, 700);
  };

  const handleSimularSincronizacion = (forzarFallo: boolean = false) => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (forzarFallo) {
        setEstadoSincronizacion("FALLO");
        setCuentasPendientesSync(3);
        toast.error("Fallo de sincronización detectado", {
          description: "Se han retenido 3 cuentas en estado pendiente. El ingreso permanece bloqueado preventivamente.",
        });
      } else {
        setEstadoSincronizacion("SINCRONIZADO");
        setCuentasPendientesSync(0);
        toast.success("Sincronización de acceso exitosa", {
          description: "Cuentas actualizadas con el proveedor de identidades.",
        });
      }
    }, 600);
  };

  const handleGuardarCambios = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const nuevoEvento: EventoConfiguracion = {
      id: `cfg-evt-${Date.now()}`,
      fecha: `${now.toLocaleDateString("es-EC")} ${now.toLocaleTimeString("es-EC")}`,
      parametro: `Parámetros de acceso [${entorno}]`,
      valorAnterior: "Configuración previa",
      valorNuevo: `TOTP: ${algoritmoTotp}, ${longitudDigitos} dígitos, ${intervaloSegundos}s. Correo: ${correoRemitente}`,
      actor: "Administrador Técnico DINARP",
      resultado: "APLICADO"
    };

    setHistorialCambios([nuevoEvento, ...historialCambios]);
    toast.success("Configuración actualizada y registrada en bitácora", {
      description: `Los parámetros fueron aplicados al entorno ${entorno}.`,
    });
  };

  return (
    <WireframeDashboardLayout
      activeMenu="configuracion-acceso"
      breadcrumbs={[
        { label: "Configuración" },
        { label: "Servicio de acceso" }
      ]}
    >
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Cabecera Principal */}
        <div className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                Configuración del servicio de acceso
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal">
                Ajuste de parámetros técnicos, entornos de despliegue, método de autenticación y comprobación de salud operativa.
              </p>
            </div>

            {/* Badge de rol técnico */}
            <Badge tone="primary" appearance="soft" size="sm" className="gap-1.5 self-start sm:self-auto">
              <ShieldCheck className="size-3.5" />
              <span>Administrador Técnico Autorizado</span>
            </Badge>
          </div>
        </div>

        {/* Encabezado descriptivo con tooltip de accesibilidad */}
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3.5 sm:p-4 text-xs text-primary flex items-start justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-2">
              <Settings className="size-4 shrink-0" />
              Directivas técnicas de identidad y autenticación
            </p>
            <p className="text-primary/90 leading-relaxed">
              Esta sección gestiona la infraestructura central de acceso para DINARP y las instituciones interconectadas. Los entornos de Producción y Pruebas se encuentran estrictamente aislados. Si ocurre un fallo de sincronización, las cuentas afectadas se conservan pendientes y su ingreso queda bloqueado hasta que el reintento sea exitoso.
            </p>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-6 items-center justify-center rounded-full text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none shrink-0"
                  aria-label="Directiva de configuración técnica"
                >
                  <Info className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs text-xs">
                Las llaves maestras y secretos criptográficos no se exhiben en texto plano. Cada modificación genera una entrada inmutable en la bitácora de auditoría.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€ SECCIÓN 1: PROYECTO Y ENTORNO (AISLAMIENTO ESTRICTO) â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                <Server className="size-4 text-primary" />
                Proyecto y entorno de ejecución
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="Información de entorno"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      No mezclar credenciales de producción con ambientes de prueba. Cada entorno opera con almacenes de claves independientes.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-xs text-muted-foreground">
                Selección de espacio de trabajo y aislamiento entre ambientes.
              </p>
            </div>

            {/* Selector estricto de entorno */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Entorno:</span>
              <div className="inline-flex p-1 rounded-xl bg-muted/40 border border-border">
                <button
                  type="button"
                  onClick={() => setEntorno("PROD")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    entorno === "PROD"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Producción (PROD)
                </button>
                <button
                  type="button"
                  onClick={() => setEntorno("STAGING")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    entorno === "STAGING"
                      ? "bg-warning text-warning-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Pruebas (STAGING)
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Proyecto */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Identificador de proyecto</Label>
              <Input
                type="text"
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                className="text-xs font-mono h-9"
              />
              <p className="text-[11px] text-muted-foreground">Cluster de autenticación DINARP.</p>
            </div>

            {/* Correo remitente verificado */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">Correo emisor del servicio</Label>
                <Badge tone="success" appearance="soft" size="sm" className="text-[10px]">
                  Verificado
                </Badge>
              </div>
              <Input
                type="email"
                value={correoRemitente}
                onChange={(e) => setCorreoRemitente(e.target.value)}
                className="text-xs h-9"
              />
              <p className="text-[11px] text-muted-foreground">
                Dirección SMTP institucional autorizada para el despacho de notificaciones y enlaces de seguridad.
              </p>
            </div>
          </div>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€ SECCIÓN 2: PARÁMETROS DEL SEGUNDO FACTOR (GOOGLE AUTHENTICATOR) â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                Parámetros del autenticador (TOTP RFC 6238)
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="Información de TOTP"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Define los parámetros criptográficos compatibles con la aplicación Google Authenticator.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-xs text-muted-foreground">
                Especificaciones del algoritmo de generación y validación de tokens temporales.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Algoritmo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Algoritmo de hash</Label>
              <select
                value={algoritmoTotp}
                onChange={(e) => setAlgoritmoTotp(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="HMAC-SHA1">HMAC-SHA1 (Estándar Google)</option>
                <option value="HMAC-SHA256">HMAC-SHA256 (Avanzado)</option>
              </select>
            </div>

            {/* Dígitos */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Longitud del código</Label>
              <select
                value={longitudDigitos}
                onChange={(e) => setLongitudDigitos(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="6">6 dígitos (Recomendado)</option>
                <option value="8">8 dígitos</option>
              </select>
            </div>

            {/* Intervalo temporal */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Intervalo de refresco</Label>
              <select
                value={intervaloSegundos}
                onChange={(e) => setIntervaloSegundos(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="30">30 segundos</option>
                <option value="60">60 segundos</option>
              </select>
            </div>

            {/* Tolerancia de desfase */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Tolerancia horaria</Label>
              <select
                value={toleranciaVentana}
                onChange={(e) => setToleranciaVentana(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-xs text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="1">± 1 ventana (±30s)</option>
                <option value="2">± 2 ventanas (±60s)</option>
              </select>
            </div>
          </div>

          {/* Secreto Criptográfico Enmascarado (No expone secretos) */}
          <div className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">Huella de llave criptográfica maestra</span>
              </div>
              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                Protegido en HSM / KMS
              </Badge>
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface border border-border font-mono text-xs text-foreground">
              <span className="tracking-widest">
                {showSecretKey ? "KMS-KEY-ID: arn:dinarp:kms:identity-key-2026-v2" : secretKeyMasked}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="size-7"
                title={showSecretKey ? "Ocultar" : "Mostrar huella"}
              >
                {showSecretKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Por norma de seguridad, la clave privada nunca se expone en texto claro en la interfaz administrativa.
            </p>
          </div>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€ SECCIÓN 3: COMPROBACIONES DE FUNCIONAMIENTO (HEALTH CHECK) â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Comprobaciones de funcionamiento y diagnóstico
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="Ayuda de diagnóstico"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Ejecuta pruebas en tiempo real sobre la latencia y disponibilidad de los microservicios de seguridad.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-xs text-muted-foreground">
                Última comprobación: <span className="font-mono text-foreground">{lastCheckTime}</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRunHealthCheck}
              disabled={isCheckingHealth}
              className="text-xs gap-1.5 self-start sm:self-auto text-primary hover:text-primary"
            >
              <RefreshCw className={`size-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
              <span>{isCheckingHealth ? "Comprobando..." : "Ejecutar comprobación"}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Servicio IDP */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Directorio de Identidad</span>
                <CheckCircle2 className="size-3.5 text-success" />
              </div>
              <p className="text-xs font-mono text-muted-foreground">Operativo (12ms)</p>
            </div>

            {/* Servicio NTP */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Reloj de Servidores (NTP)</span>
                <CheckCircle2 className="size-3.5 text-success" />
              </div>
              <p className="text-xs font-mono text-muted-foreground">Sincronizado (0.8ms)</p>
            </div>

            {/* Correo SMTP */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Despacho de Correo (SMTP)</span>
                <CheckCircle2 className="size-3.5 text-success" />
              </div>
              <p className="text-xs font-mono text-muted-foreground">Conectado (TLS 1.3)</p>
            </div>

            {/* Validador TOTP */}
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">Motor TOTP Criptográfico</span>
                <CheckCircle2 className="size-3.5 text-success" />
              </div>
              <p className="text-xs font-mono text-muted-foreground">Activo (RFC 6238)</p>
            </div>
          </div>
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€ SECCIÓN 4: CONTROL DE SINCRONIZACIÓN Y REINTENTO ANTE FALLAS â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
            <div className="space-y-0.5">
              <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                <Radio className="size-4 text-primary" />
                Sincronización de cuentas y control de fallas
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="Ayuda de sincronización"
                      >
                        <Info className="size-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs text-xs">
                      Si la sincronización falla, el sistema mantiene la cuenta en estado pendiente, bloquea el ingreso preventivamente y permite el reintento automático o asistido.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-xs text-muted-foreground">
                Estado del sincronizador en tiempo real con el proveedor de credenciales institucionales.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSimularSincronizacion(false)}
                disabled={isSyncing}
                className="text-xs gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sincronizar ahora</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleSimularSincronizacion(true)}
                disabled={isSyncing}
                className="text-xs text-danger hover:text-danger hover:bg-danger/10"
                title="Probar comportamiento de contingencia ante fallo"
              >
                Simular fallo
              </Button>
            </div>
          </div>

          {/* Banner de estado según sincronización */}
          {estadoSincronizacion === "SINCRONIZADO" ? (
            <div className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-xs text-success flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="font-semibold">Servicio de sincronización en línea y sin cuentas retenidas</span>
              </div>
              <Badge tone="success" appearance="soft" size="sm">Operativo</Badge>
            </div>
          ) : (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3.5 text-xs text-danger space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>Sincronización interrumpida ({cuentasPendientesSync} cuentas retenidas)</span>
                </div>
                <Badge tone="danger" appearance="soft" size="sm">Fallo de sincronización</Badge>
              </div>
              <p className="text-foreground/80 leading-relaxed text-[11px]">
                Por protocolo de seguridad, las cuentas no sincronizadas se mantienen en estado <strong>Pendiente de activación</strong> y tienen el <strong>ingreso bloqueado</strong> hasta restablecer la sincronización con el directorio institucional.
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleSimularSincronizacion(false)}
                  disabled={isSyncing}
                  className="text-xs gap-1.5"
                >
                  <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>Reintentar sincronización pendiente</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* â”€â”€â”€â”€â”€â”€â”€â”€ SECCIÓN 5: BITÁCORA / HISTORIAL DE CAMBIOS TÉCNICOS â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 space-y-4 shadow-xs">
          <div className="space-y-0.5 pb-2 border-b border-border/60">
            <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
              <History className="size-4 text-primary" />
              Historial de cambios de configuración
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label="Información de bitácora"
                    >
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Trazabilidad inmutable de cualquier alteración en parámetros de acceso, puertos, remitentes o factores.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h2>
            <p className="text-xs text-muted-foreground">
              Registro cronológico de modificaciones técnicas efectuadas por administradores autorizados.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
            <div className="overflow-x-auto [scrollbar-width:thin]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40 text-[11px] uppercase tracking-wider">
                    <TableHead className="w-[150px]">Fecha y hora</TableHead>
                    <TableHead className="w-[190px]">Parámetro modificado</TableHead>
                    <TableHead className="min-w-[170px]">Valor previo</TableHead>
                    <TableHead className="min-w-[180px]">Valor aplicado</TableHead>
                    <TableHead className="w-[180px]">Administrador</TableHead>
                    <TableHead className="w-[110px] text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historialCambios.map((evt) => (
                    <TableRow key={evt.id} className="hover:bg-muted/20 text-xs">
                      <TableCell className="font-mono text-[11px] text-muted-foreground">
                        {evt.fecha}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {evt.parametro}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px]">
                        {evt.valorAnterior}
                      </TableCell>
                      <TableCell className="font-medium text-foreground text-[11px]">
                        {evt.valorNuevo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {evt.actor}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge tone="success" appearance="soft" size="sm">
                          {evt.resultado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleGuardarCambios}
              className="text-xs gap-1.5"
            >
              <Save className="size-4" />
              <span>Guardar y registrar configuración</span>
            </Button>
          </div>
        </div>
      </div>
    </WireframeDashboardLayout>
  );
}
