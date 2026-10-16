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
  Server,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import type { SolicitudAcceso } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!solicitud) return null;

  const creds = solicitud.credenciales || {
    usuario: `ws_${solicitud.institucion.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10)}_${solicitud.id.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    contrasena: `Dinarp$sec_${Math.random().toString(36).slice(-6)}*2026`,
    endpoint: `https://interoperabilidad.dinarp.gob.ec/api/v2/servicios/${solicitud.id.toLowerCase()}`,
    tipoAutenticacion: "OAuth 2.0 (Bearer Token)",
    ambiente: "Producción (Ambiente Seguro DINARP)",
    fechaGeneracion: "2026-09-24",
    camposAutorizados: solicitud.fuentes?.flatMap(f => f.campos.map(c => c.nombre)) || [],
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError(true);
      return;
    }
    // Simulation acceptance
    setPasswordError(false);
    setIsAuthenticated(true);
    toast.success("Identidad confirmada. Credencial técnica desbloqueada.");
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedKey(null), 2500);
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge tone="success" appearance="soft" size="sm" className="gap-1">
              <ShieldCheck className="size-3.5" />
              Acceso institucional habilitado
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">{solicitud.id}</span>
          </div>
          <DialogTitle className="font-heading text-lg font-bold text-foreground">
            Credencial Técnica de Interoperabilidad
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Esta credencial pertenece a la institución y permite a sus sistemas informáticos conectarse al servicio aprobado.
          </DialogDescription>
        </DialogHeader>

        {/* Informative distinction box */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-foreground flex items-start gap-2.5">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-primary">Importante para el funcionario:</p>
            <p className="text-muted-foreground leading-relaxed">
              Tu <span className="font-medium text-foreground">contraseña personal del Portal</span> te identifica a ti como usuario. La <span className="font-medium text-foreground">credencial técnica</span> es exclusiva para la máquina o servidor de tu entidad que consumirá los datos.
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Step 1: Re-authentication challenge */
          <form onSubmit={handleVerifyPassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Confirma tu contraseña del Portal para continuar</span>
                <span className="text-[11px] text-muted-foreground font-normal">Reautenticación de seguridad</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Ingresa tu contraseña de funcionario"
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
                  Por favor ingresa tu contraseña institucional para validar tu identidad.
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                (Modo demostración: escribe cualquier contraseña para validar)
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="gap-1.5">
                <KeyRound className="size-3.5" />
                Desbloquear credencial
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Step 2: Unlocked Credentials with Copy */
          <div className="space-y-4 py-2">
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-xs text-warning-foreground flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-foreground">Protección de secreto institucional:</strong> El secreto técnico se muestra una sola vez en pantalla. Cópialo de inmediato y almacénalo en los cofres seguros de tu área de TI.
              </div>
            </div>

            <div className="space-y-3 bg-muted/20 border border-border rounded-lg p-3.5 text-xs">
              {/* Endpoint */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Endpoint de consumo base</span>
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
                    {copiedKey === "Endpoint" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Client ID / Usuario */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Identificador de cliente (Client ID / Usuario API)</span>
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
                    {copiedKey === "Client ID" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Client Secret */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground">Secreto de cliente (Client Secret / Token temporal)</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <code className="block w-full bg-background border border-border px-2.5 py-1.5 rounded text-[11px] font-mono break-all text-foreground select-all pr-8">
                      {showSecret ? creds.contrasena : "••••••••••••••••••••••••••••••••"}
                    </code>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                      title={showSecret ? "Ocultar secreto" : "Mostrar secreto"}
                    >
                      {showSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => handleCopy(creds.contrasena, "Client Secret")}
                  >
                    {copiedKey === "Client Secret" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  </Button>
                </div>
              </div>

              {/* Especificaciones adicionales */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Autenticación: </span>
                  <span className="font-medium text-foreground">{creds.tipoAutenticacion || "OAuth 2.0"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ambiente: </span>
                  <span className="font-medium text-foreground">Producción Seguro</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Modalidad: </span>
                  <span className="font-medium text-foreground">{solicitud.modalidadAprobada || solicitud.modalidad || "API individual"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cupo asignado: </span>
                  <span className="font-medium text-foreground">{solicitud.cupoAprobado ? `${solicitud.cupoAprobado.toLocaleString()} consultas` : "Sin límite"}</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" size="sm" onClick={handleCloseModal}>
                Entendido y guardado
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
