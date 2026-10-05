"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import {
  ConfiguracionConexion,
  ConectorTipo,
  CONECTORES_CATALOGO,
  EvidenciaPruebaConexion,
} from "../data/fuentes-data";
import {
  Server,
  Database,
  Lock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  AlertTriangle,
  Radio,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface FuenteStepperConexionProps {
  conexion: ConfiguracionConexion;
  onChange: (conexion: ConfiguracionConexion) => void;
  onPruebaSatisfactoria?: (evidencia: EvidenciaPruebaConexion) => void;
}

export function FuenteStepperConexion({
  conexion,
  onChange,
  onPruebaSatisfactoria,
}: FuenteStepperConexionProps) {
  const [testing, setTesting] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [simularFallo, setSimularFallo] = useState(false);

  const conectorSeleccionado =
    CONECTORES_CATALOGO.find((c) => c.tipo === conexion.tipo_conector) ||
    CONECTORES_CATALOGO[0];

  const handleSelectConector = (tipo: ConectorTipo) => {
    let defaultPort = 5432;
    if (tipo === "Oracle") defaultPort = 1521;
    if (tipo === "MySQL") defaultPort = 3306;
    if (tipo === "SFTP") defaultPort = 22;

    onChange({
      ...conexion,
      tipo_conector: tipo,
      puerto: defaultPort,
      ultima_prueba: undefined, // Reset previous test on connector change
    });
  };

  const handleEjecutarPrueba = () => {
    setTesting(true);

    setTimeout(() => {
      setTesting(false);
      const isSuccess = !simularFallo;

      if (isSuccess) {
        const evidencia: EvidenciaPruebaConexion = {
          id_prueba: `PRB-${Date.now().toString().slice(-6)}`,
          instante_prueba: new Date().toISOString(),
          latencia_ms: Math.floor(25 + Math.random() * 45),
          resultado: "Satisfactoria",
          huella_muestra: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          version_conector: conectorSeleccionado.version,
          etapas: [
            {
              etapa: "Enrutamiento y túnel VPN DINARP",
              estado: "ok",
              detalle: "Conectividad IP confirmada hacia el host objetivo.",
            },
            {
              etapa: "Autenticación segura KMS",
              estado: "ok",
              detalle: "Credencial validada contra el almacén de secretos sin exposición.",
            },
            {
              etapa: "Permisos de lectura (SELECT ONLY)",
              estado: "ok",
              detalle: "Permiso de lectura confirmado. Sin privilegios de escritura.",
            },
            {
              etapa: "Inspección de estructura y muestra",
              estado: "ok",
              detalle: "Estructura de tablas y atributos detectada con éxito.",
            },
          ],
        };

        const updatedConexion: ConfiguracionConexion = {
          ...conexion,
          secreto_referencia: `kms://arn:aws:kms:ec-dinarp:secrets/${conexion.tipo_conector.toLowerCase()}-${Date.now()}`,
          ultima_prueba: evidencia,
        };

        onChange(updatedConexion);
        onPruebaSatisfactoria?.(evidencia);
        toast.success("Conexión verificada desde la red DINARP", {
          description: `Prueba técnica satisfactoria. Latencia: ${evidencia.latencia_ms} ms.`,
        });
      } else {
        const evidencia: EvidenciaPruebaConexion = {
          id_prueba: `PRB-${Date.now().toString().slice(-6)}`,
          instante_prueba: new Date().toISOString(),
          latencia_ms: 0,
          resultado: "Fallida",
          huella_muestra: "",
          version_conector: conectorSeleccionado.version,
          etapas: [
            {
              etapa: "Enrutamiento y túnel VPN DINARP",
              estado: "ok",
              detalle: "Túnel VPN activo.",
            },
            {
              etapa: "Autenticación segura KMS",
              estado: "error",
              detalle: "Error de autenticación: Credenciales rechazadas por el motor de datos.",
            },
          ],
        };

        onChange({
          ...conexion,
          ultima_prueba: evidencia,
        });
        toast.error("Prueba de conexión técnica fallida", {
          description: "Revisa las credenciales o permisos en el origen y reintenta.",
        });
      }
    }, 1400);
  };

  const isDB = ["Oracle", "PostgreSQL", "MySQL", "MongoDB"].includes(conexion.tipo_conector);
  const isAPI = ["REST", "SOAP"].includes(conexion.tipo_conector);
  const isSFTP = conexion.tipo_conector === "SFTP";

  return (
    <div className="space-y-6">
      {/* Selector de Tipo de Conector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">
            Seleccione el tipo de conector habilitado (CNX-01 / CNX-02) <span className="text-danger">*</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Solo conectores certificados por TI
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CONECTORES_CATALOGO.map((con) => {
            const isSelected = conexion.tipo_conector === con.tipo;
            return (
              <button
                key={con.tipo}
                type="button"
                onClick={() => handleSelectConector(con.tipo)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                    : "bg-surface hover:bg-muted/40 border-border text-foreground"
                }`}
              >
                <Database className="size-4 shrink-0" />
                <span className="text-xs">{con.tipo}</span>
                <span className="text-[9px] text-muted-foreground font-mono">{con.version}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parámetros de Conexión según Conector */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Server className="size-4 text-primary" />
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Configuración técnica: {conectorSeleccionado.nombre}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Lock className="size-3 text-success" />
            Cifrado TLS v1.3 & KMS
          </div>
        </div>

        {/* Campos para Bases de Datos */}
        {isDB && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="host" className="text-xs font-medium text-muted-foreground">
                Host / IP privada (Red VPN) <span className="text-danger">*</span>
              </Label>
              <Input
                id="host"
                placeholder="ej. 10.160.4.12"
                value={conexion.host || ""}
                onChange={(e) => onChange({ ...conexion, host: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="puerto" className="text-xs font-medium text-muted-foreground">
                Puerto TCP <span className="text-danger">*</span>
              </Label>
              <Input
                id="puerto"
                type="number"
                value={conexion.puerto || 1521}
                onChange={(e) =>
                  onChange({ ...conexion, puerto: parseInt(e.target.value) || 0 })
                }
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="db" className="text-xs font-medium text-muted-foreground">
                Base de datos / Servicio <span className="text-danger">*</span>
              </Label>
              <Input
                id="db"
                placeholder="ej. DGRCPRD"
                value={conexion.base_datos || ""}
                onChange={(e) => onChange({ ...conexion, base_datos: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="esquema" className="text-xs font-medium text-muted-foreground">
                Esquema / Vista de lectura <span className="text-danger">*</span>
              </Label>
              <Input
                id="esquema"
                placeholder="ej. INTEROP_PUB"
                value={conexion.esquema || ""}
                onChange={(e) => onChange({ ...conexion, esquema: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usuario" className="text-xs font-medium text-muted-foreground">
                Usuario de lectura (Read-Only) <span className="text-danger">*</span>
              </Label>
              <Input
                id="usuario"
                placeholder="ej. usr_dinarp_read"
                value={conexion.usuario || ""}
                onChange={(e) => onChange({ ...conexion, usuario: e.target.value })}
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd" className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                <span>Contraseña transitoria <span className="text-danger">*</span></span>
                <span className="text-[10px] text-muted-foreground">Nunca se expone en claro</span>
              </Label>
              <Input
                id="pwd"
                type="password"
                placeholder="••••••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Campos para REST / SOAP */}
        {isAPI && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="endpoint" className="text-xs font-medium text-muted-foreground">
                URL Endpoint base (HTTPS) <span className="text-danger">*</span>
              </Label>
              <Input
                id="endpoint"
                placeholder="https://api-interop.institucion.gob.ec/v1/recurso"
                value={conexion.url_endpoint || ""}
                onChange={(e) => onChange({ ...conexion, url_endpoint: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-usr" className="text-xs font-medium text-muted-foreground">
                Client ID / Usuario de servicio
              </Label>
              <Input
                id="api-usr"
                placeholder="ej. cl_dinarp_gateway"
                value={conexion.usuario || ""}
                onChange={(e) => onChange({ ...conexion, usuario: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="api-sec" className="text-xs font-medium text-muted-foreground">
                API Key / Secret Token (Transitorio KMS) <span className="text-danger">*</span>
              </Label>
              <Input
                id="api-sec"
                type="password"
                placeholder="••••••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Campos para SFTP */}
        {isSFTP && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sftp-host" className="text-xs font-medium text-muted-foreground">
                Host SFTP <span className="text-danger">*</span>
              </Label>
              <Input
                id="sftp-host"
                placeholder="sftp.institucion.gob.ec"
                value={conexion.host || ""}
                onChange={(e) => onChange({ ...conexion, host: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sftp-path" className="text-xs font-medium text-muted-foreground">
                Ruta de carpeta remota <span className="text-danger">*</span>
              </Label>
              <Input
                id="sftp-path"
                placeholder="/dinarp/export/"
                value={conexion.esquema || ""}
                onChange={(e) => onChange({ ...conexion, esquema: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sftp-usr" className="text-xs font-medium text-muted-foreground">
                Usuario SFTP <span className="text-danger">*</span>
              </Label>
              <Input
                id="sftp-usr"
                placeholder="dinarp_sftp_user"
                value={conexion.usuario || ""}
                onChange={(e) => onChange({ ...conexion, usuario: e.target.value })}
                className="text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Aviso de seguridad KMS */}
        <div className="p-3 bg-muted/20 rounded-lg border border-border text-[11px] text-muted-foreground flex items-start gap-2.5">
          <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
          <span>
            <strong>Seguridad FUE-02 / TEC-00:</strong> Las contraseñas y llaves son transmitidas de forma efímera hacia el almacén KMS institucional. En ningún momento se persisten en texto claro en logs, vistas ni respuestas JSON.
          </span>
        </div>
      </div>

      {/* Sección Probar Conexión */}
      <div className="p-4 bg-surface rounded-xl border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
              Prueba Técnica de Conexión (FUE-02)
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Verifica el acceso de lectura por la VPN DINARP, autenticación KMS y esquema de origen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={simularFallo}
                onChange={(e) => setSimularFallo(e.target.checked)}
                className="rounded border-input text-danger focus:ring-danger size-3.5"
              />
              Simular error de conexión
            </label>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleEjecutarPrueba}
              disabled={testing}
              className="gap-2 shrink-0 shadow-xs"
            >
              {testing ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Probando conexión...
                </>
              ) : (
                <>
                  <Play className="size-3.5 fill-current" />
                  Probar conexión
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Resultado de la prueba */}
        {conexion.ultima_prueba && (
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              conexion.ultima_prueba.resultado === "Satisfactoria"
                ? "bg-success/5 border-success/30"
                : "bg-danger/5 border-danger/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {conexion.ultima_prueba.resultado === "Satisfactoria" ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <XCircle className="size-4 text-danger" />
                )}
                <span className="font-heading font-bold text-xs text-foreground">
                  Resultado: {conexion.ultima_prueba.resultado}
                </span>
                {conexion.ultima_prueba.latencia_ms > 0 && (
                  <Badge tone="success" appearance="soft" size="sm">
                    {conexion.ultima_prueba.latencia_ms} ms latencia
                  </Badge>
                )}
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">
                ID Prueba: {conexion.ultima_prueba.id_prueba}
              </span>
            </div>

            <div className="space-y-1.5">
              {conexion.ultima_prueba.etapas.map((et, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-background/60 border border-border/50"
                >
                  <span className="text-foreground font-medium">{et.etapa}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">{et.detalle}</span>
                    {et.estado === "ok" ? (
                      <CheckCircle2 className="size-3.5 text-success shrink-0" />
                    ) : (
                      <XCircle className="size-3.5 text-danger shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {conexion.ultima_prueba.resultado === "Satisfactoria" && (
              <p className="text-[11px] text-success font-medium flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5" />
                Conexión verificada desde la red DINARP. Puede continuar a la definición de esquema.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
