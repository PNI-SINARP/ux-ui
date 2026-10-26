"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Info,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSolicitudesStore,
  type SolicitudAcceso,
} from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

interface CredencialTecnicaModalProps {
  solicitud: SolicitudAcceso | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CredencialTecnicaModal({
  solicitud,
  isOpen,
  onClose,
}: CredencialTecnicaModalProps) {
  const {
    getSolicitudById,
    sustituirSecretoTemporal,
    rotarCredencialInstitucional,
  } = useSolicitudesStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [motivoRotacion, setMotivoRotacion] = useState(
    "Rotación preventiva trimestral de secreto en bóveda institucional"
  );
  const [simularFalloRotacion, setSimularFalloRotacion] = useState(false);

  if (!solicitud) return null;

  const liveSolicitud = getSolicitudById(solicitud.id) || solicitud;

  const creds = liveSolicitud.credenciales || {
    usuario: `ws_${liveSolicitud.institucion
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10)}_${liveSolicitud.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    contrasena: `TMP_Dinarp$sec_2026`,
    endpoint: `https://api.sinarp.dinarp.gob.ec/v2/consumo/${liveSolicitud.id.toLowerCase()}`,
    tipoAutenticacion: "OAuth 2.0 (Client Credentials Apigee)",
    ambiente: "Producción (Apigee Gateway DINARP)",
    fechaGeneracion: "2026-09-24",
    camposAutorizados:
      liveSolicitud.fuentes?.flatMap((f) => f.campos.map((c) => c.nombre)) || [],
    esSecretoTemporal: true,
    rotacionCount: 0,
    estadoApigee: "ACTIVO" as const,
    cupoAutorizadoVigente: liveSolicitud.cupo || 100000,
    tipoPoliticaCupo:
      liveSolicitud.tipoInstitucion === "Privada"
        ? ("BLOQUEANTE_PRIVADA" as const)
        : ("REFERENCIA_ALERTA_PUBLICA" as const),
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    setIsAuthenticated(true);
    toast.success("Identidad confirmada (ACC-03 / ACC-04). Credencial desbloqueada.");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSustituirTemporal = () => {
    sustituirSecretoTemporal(
      liveSolicitud.id,
      `${liveSolicitud.coordinador} (Coordinador SINARP)`
    );
    setShowSecret(true);
    toast.success(
      "Secreto temporal sustituido por secreto definitivo generado por la plataforma (ACC-09)",
      {
        description:
          "El secreto inicial quedó invalidado en Apigee. Copie y resguarde el nuevo secreto definitivo.",
      }
    );
  };

  const handleRotarCredencial = () => {
    rotarCredencialInstitucional(liveSolicitud.id, {
      motivo: motivoRotacion || "Rotación solicitada por Coordinador SINARP",
      actor: `${liveSolicitud.coordinador} (Coordinador SINARP)`,
      simularFalloApigee: simularFalloRotacion,
    });
    if (simularFalloRotacion) {
      toast.error(
        "Fallo en sincronización de rotación con Apigee — Alerta de Seguridad (ACC-07)",
        {
          description:
            "No se dio por válida la rotación y se emitió alerta crítica al Equipo TI.",
        }
      );
    } else {
      setShowSecret(true);
      toast.success("Credencial institucional rotada en Apigee (ACC-05)", {
        description:
          "El secreto anterior fue invalidado y se generó un nuevo secreto aleatorio seguro.",
      });
    }
  };

  const handleCloseModal = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setPasswordError(false);
    setShowSecret(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge
              tone={
                creds.estadoApigee === "SUSPENDIDO" ||
                creds.estadoApigee === "REVOCADO"
                  ? "danger"
                  : "success"
              }
              appearance="soft"
              size="sm"
              className="gap-1"
            >
              <ShieldCheck className="size-3.5" />
              Apigee: {creds.estadoApigee || "ACTIVO"}
            </Badge>
            <Badge
              tone={creds.esSecretoTemporal ? "warning" : "primary"}
              appearance="soft"
              size="sm"
            >
              {creds.esSecretoTemporal
                ? "Secreto Temporal Primer Uso (ACC-09)"
                : "Secreto Definitivo Activo (ACC-09)"}
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">
              {liveSolicitud.id}
            </span>
          </div>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            Credencial Técnica Institucional en Apigee (ACC-03 · ACC-04 · ACC-05 · ACC-09)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Separación estricta entre acceso humano al portal y credencial máquina-a-máquina. La plataforma genera todos los secretos automáticamente sin permitir contraseñas definidas manualmente.
          </DialogDescription>
        </DialogHeader>

        {/* Distinción de seguridad */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-foreground flex items-start gap-2.5">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-primary">
              Política de Seguridad y Cuota Apigee ({creds.tipoPoliticaCupo}):
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {liveSolicitud.tipoInstitucion === "Privada"
                ? `Entidad Privada: Cuota bloqueante en Apigee de ${(
                    creds.cupoAutorizadoVigente ?? liveSolicitud.cupo ?? 100000
                  ).toLocaleString()} consultas según factura pagada.`
                : `Entidad Pública: Referencia operativa de ${(
                    creds.cupoAutorizadoVigente ?? liveSolicitud.cupo ?? 100000
                  ).toLocaleString()} consultas con monitoreo y alerta sin bloqueo duro.`}
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Paso 1: Reautenticación obligatoria (ACC-03 / ACC-04) */
          <form onSubmit={handleVerifyPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  Confirma tu contraseña humana del Portal para revelar la credencial (ACC-04)
                </span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  Evento auditado
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña de funcionario autorizado"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(false);
                  }}
                  className="pl-9 text-xs h-9"
                  autoFocus
                />
              </div>
              {passwordError && (
                <p className="text-[11px] text-destructive font-medium">
                  Ingresa tu contraseña institucional para validar tu identidad.
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                (Modo demostración: escribe cualquier valor para autenticar)
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" variant="primary" className="gap-1.5">
                <KeyRound className="size-3.5" />
                Reautenticar y Revelar Credencial
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Paso 2: Credencial desbloqueada + ACC-09 + ACC-05/07 */
          <div className="space-y-4 py-2">
            {/* Alerta ACC-09 si el secreto aún es temporal */}
            {creds.esSecretoTemporal && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">
                      Sustitución obligatoria de secreto temporal en el primer uso (ACC-09)
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      La credencial inicial fue emitida con un secreto temporal. Genere ahora el secreto definitivo aleatorio en Apigee para habilitar el consumo productivo.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  onClick={handleSustituirTemporal}
                  className="shrink-0 text-xs"
                >
                  <RefreshCw className="size-3.5 mr-1.5" />
                  Sustituir por Secreto Definitivo (ACC-09)
                </Button>
              </div>
            )}

            {/* Alerta ACC-07 si hubo incidente de seguridad en rotación */}
            {creds.alertaIncidenteSeguridad && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs flex items-start gap-2.5">
                <ShieldAlert className="size-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">
                    Incidente de Seguridad / Sincronización en Apigee (ACC-07)
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {creds.alertaIncidenteSeguridad}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 bg-muted/20 border border-border rounded-lg p-3.5 text-xs">
              {/* Endpoint */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Endpoint en Apigee Gateway
                </span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background border border-border px-2.5 py-1.5 rounded text-[11px] font-mono break-all text-foreground select-all">
                    {creds.endpoint}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => handleCopy(creds.endpoint, "Endpoint")}
                  >
                    {copiedKey === "Endpoint" ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Client ID */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Identificador de Cliente (Consumer Key / Client ID)
                </span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background border border-border px-2.5 py-1.5 rounded text-[11px] font-mono break-all text-foreground select-all">
                    {creds.usuario}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => handleCopy(creds.usuario, "Client ID")}
                  >
                    {copiedKey === "Client ID" ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Client Secret */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Secreto Técnico Generado por Plataforma (Consumer Secret)
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <code className="block w-full bg-background border border-border px-2.5 py-1.5 rounded text-[11px] font-mono break-all text-foreground select-all pr-8">
                      {showSecret
                        ? creds.contrasena
                        : "••••••••••••••••••••••••••••••••"}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      title={showSecret ? "Ocultar secreto" : "Revelar secreto"}
                    >
                      {showSecret ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => handleCopy(creds.contrasena, "Client Secret")}
                  >
                    {copiedKey === "Client Secret" ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Metadatos técnicos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/50 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Estado Secreto: </span>
                  <span className="font-semibold text-foreground">
                    {creds.esSecretoTemporal ? "Temporal (ACC-09)" : "Definitivo"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Rotaciones (ACC-05): </span>
                  <span className="font-semibold text-foreground">
                    {creds.rotacionCount ?? 0}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cupo Apigee: </span>
                  <span className="font-semibold text-foreground">
                    {(creds.cupoAutorizadoVigente ?? liveSolicitud.cupo ?? 100000).toLocaleString()}{" "}
                    cons.
                  </span>
                </div>
              </div>
            </div>

            {/* Bloque ACC-05 / ACC-07: Rotar Credencial Institucional */}
            <div className="p-3.5 rounded-lg border border-border bg-surface space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  Rotar Credencial Institucional bajo Demanda (ACC-05 / ACC-07)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={simularFalloRotacion ? "danger" : "outline"}
                  onClick={() => setSimularFalloRotacion(!simularFalloRotacion)}
                  className="text-[11px] h-7"
                >
                  {simularFalloRotacion
                    ? "Simulando Fallo Apigee (ACC-07)"
                    : "Sincronización Apigee OK"}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={motivoRotacion}
                  onChange={(e) => setMotivoRotacion(e.target.value)}
                  placeholder="Motivo de rotación de la credencial..."
                  className="text-xs h-8"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRotarCredencial}
                  className="shrink-0 gap-1.5 text-xs"
                >
                  <RefreshCw className="size-3.5" />
                  Rotar Secreto (ACC-05)
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" size="sm" onClick={handleCloseModal}>
                Cerrar bóveda de credencial
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
