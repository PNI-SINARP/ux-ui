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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Cpu, Plus, Sparkles, ShieldCheck } from "lucide-react";
import { useConectoresStore, EstadoConector } from "../data/conectores-store";

interface RegistrarConectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser?: { name?: string; role?: string };
}

export function RegistrarConectorDialog({
  open,
  onOpenChange,
  currentUser,
}: RegistrarConectorDialogProps) {
  const { registrarConector } = useConectoresStore();

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("PostgreSQL");
  const [version, setVersion] = useState("v1.0.0");
  const [protocolo, setProtocolo] = useState("TCP/IP 5432 - TLS v1.3");
  const [puertoDefault, setPuertoDefault] = useState(5432);
  const [tipoAutenticacion, setTipoAutenticacion] = useState("mTLS / Certificado X.509");
  const [descripcion, setDescripcion] = useState("");
  const [driverJar, setDriverJar] = useState("");
  const [timeoutSegundos, setTimeoutSegundos] = useState(15);
  const [soportaSsl, setSoportaSsl] = useState(true);
  const [estadoInicial, setEstadoInicial] = useState<EstadoConector>("EN_PRUEBAS");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim()) return;

    registrarConector({
      codigo: "CNX-01",
      nombre: nombre.trim(),
      tipo,
      version: version.trim(),
      protocolo: protocolo.trim(),
      puertoDefault: Number(puertoDefault) || 5432,
      tipoAutenticacion,
      descripcion: descripcion.trim(),
      estado: estadoInicial,
      fuentesAsociadasCount: 0,
      driverJar: driverJar.trim() || undefined,
      timeoutSegundos: Number(timeoutSegundos) || 15,
      soportaSsl,
      registradoPor: currentUser?.name || "Carlos Mena (TI)",
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setNombre("");
    setTipo("PostgreSQL");
    setVersion("v1.0.0");
    setProtocolo("TCP/IP 5432 - TLS v1.3");
    setPuertoDefault(5432);
    setTipoAutenticacion("mTLS / Certificado X.509");
    setDescripcion("");
    setDriverJar("");
    setTimeoutSegundos(15);
    setSoportaSsl(true);
    setEstadoInicial("EN_PRUEBAS");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
              <Cpu className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-heading font-bold text-foreground">
                Registrar tipo de conector reutilizable
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Alta en la infraestructura DINARP para integración estandarizada de fuentes institucionales.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del conector */}
            <div className="space-y-1.5">
              <Label htmlFor="nombreConector" className="text-xs font-semibold text-foreground">
                Nombre comercial o técnico del conector *
              </Label>
              <Input
                id="nombreConector"
                placeholder="Ej: SAP NetWeaver RFC Connector"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            {/* Motor / Tipo */}
            <div className="space-y-1.5">
              <Label htmlFor="tipoMotor" className="text-xs font-semibold text-foreground">
                Familia o motor tecnológico *
              </Label>
              <Select value={tipo} onValueChange={(val) => {
                setTipo(val);
                if (val === "Oracle") {
                  setPuertoDefault(1521);
                  setProtocolo("Oracle Net 1521 - SSL TCPS");
                } else if (val === "REST") {
                  setPuertoDefault(443);
                  setProtocolo("HTTPS REST JSON / OpenAPI");
                } else if (val === "MySQL") {
                  setPuertoDefault(3306);
                  setProtocolo("TCP/IP 3306 - TLS v1.3");
                } else if (val === "SOAP") {
                  setPuertoDefault(443);
                  setProtocolo("HTTPS SOAP 1.1 / 1.2 XML WSDL");
                } else if (val === "SFTP") {
                  setPuertoDefault(22);
                  setProtocolo("SSH / SFTP Puerto 22");
                } else if (val === "PostgreSQL") {
                  setPuertoDefault(5432);
                  setProtocolo("TCP/IP 5432 - TLS v1.3");
                }
              }}>
                <SelectTrigger id="tipoMotor" className="text-xs">
                  <SelectValue placeholder="Seleccione motor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PostgreSQL" className="text-xs">PostgreSQL (Relacional)</SelectItem>
                  <SelectItem value="Oracle" className="text-xs">Oracle Database (Enterprise)</SelectItem>
                  <SelectItem value="REST" className="text-xs">REST API Gateway (OpenAPI)</SelectItem>
                  <SelectItem value="MySQL" className="text-xs">MySQL / MariaDB</SelectItem>
                  <SelectItem value="SOAP" className="text-xs">SOAP XML Web Services</SelectItem>
                  <SelectItem value="SFTP" className="text-xs">SFTP Secure Batch</SelectItem>
                  <SelectItem value="MongoDB" className="text-xs">MongoDB (Documental NoSQL)</SelectItem>
                  <SelectItem value="DB2" className="text-xs">IBM DB2 AS400</SelectItem>
                  <SelectItem value="KAFKA" className="text-xs">Apache Kafka Streaming</SelectItem>
                  <SelectItem value="OTRO" className="text-xs">Otro Protocolo Específico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Versión */}
            <div className="space-y-1.5">
              <Label htmlFor="versionConector" className="text-xs font-semibold text-foreground">
                Versión del driver *
              </Label>
              <Input
                id="versionConector"
                placeholder="v1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="text-xs font-mono"
                required
              />
            </div>

            {/* Puerto default */}
            <div className="space-y-1.5">
              <Label htmlFor="puertoDefault" className="text-xs font-semibold text-foreground">
                Puerto predeterminado *
              </Label>
              <Input
                id="puertoDefault"
                type="number"
                value={puertoDefault}
                onChange={(e) => setPuertoDefault(Number(e.target.value))}
                className="text-xs font-mono"
                required
              />
            </div>

            {/* Timeout */}
            <div className="space-y-1.5">
              <Label htmlFor="timeoutSegundos" className="text-xs font-semibold text-foreground">
                Timeout de conexión (seg)
              </Label>
              <Input
                id="timeoutSegundos"
                type="number"
                value={timeoutSegundos}
                onChange={(e) => setTimeoutSegundos(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Protocolo */}
            <div className="space-y-1.5">
              <Label htmlFor="protocolo" className="text-xs font-semibold text-foreground">
                Especificación del protocolo *
              </Label>
              <Input
                id="protocolo"
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            {/* Tipo Autenticación */}
            <div className="space-y-1.5">
              <Label htmlFor="tipoAutenticacion" className="text-xs font-semibold text-foreground">
                Mecanismo de autenticación *
              </Label>
              <Select value={tipoAutenticacion} onValueChange={setTipoAutenticacion}>
                <SelectTrigger id="tipoAutenticacion" className="text-xs">
                  <SelectValue placeholder="Seleccione autenticación..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mTLS / Certificado X.509" className="text-xs">mTLS / Certificado X.509</SelectItem>
                  <SelectItem value="OAuth2.0 / API Key HMAC" className="text-xs">OAuth2.0 / API Key HMAC</SelectItem>
                  <SelectItem value="Basic / Usuario con SSL Forzado" className="text-xs">Basic / Usuario con SSL Forzado</SelectItem>
                  <SelectItem value="Oracle TCPS Wallet / Kerberos" className="text-xs">Oracle TCPS Wallet / Kerberos</SelectItem>
                  <SelectItem value="Llave SSH RSA / ED25519" className="text-xs">Llave SSH RSA / ED25519</SelectItem>
                  <SelectItem value="WS-Security / Certificado Digital" className="text-xs">WS-Security / Certificado Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Driver JAR / Paquete */}
          <div className="space-y-1.5">
            <Label htmlFor="driverJar" className="text-xs font-semibold text-foreground">
              Nombre del paquete de driver / binario certificado (opcional)
            </Label>
            <Input
              id="driverJar"
              placeholder="Ej: postgresql-42.6.0.jar o dinarp-adapter.zip"
              value={driverJar}
              onChange={(e) => setDriverJar(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <Label htmlFor="descripcionConector" className="text-xs font-semibold text-foreground">
              Descripción técnica y casos de uso institucionales *
            </Label>
            <Textarea
              id="descripcionConector"
              rows={3}
              placeholder="Indique las características de compatibilidad, pooling de conexiones y requerimientos de red institucional..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-xs resize-none"
              required
            />
          </div>

          {/* Checkboxes de seguridad y estado inicial */}
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Checkbox
                checked={soportaSsl}
                onCheckedChange={(checked) => setSoportaSsl(!!checked)}
              />
              <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-success" />
                Exige canal cifrado TLS 1.3 / SSL para conexiones entre nodos
              </span>
            </label>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground font-medium">
                Estado inicial de despliegue:
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={estadoInicial === "EN_PRUEBAS" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setEstadoInicial("EN_PRUEBAS")}
                >
                  En Pruebas (Sandbox)
                </Button>
                <Button
                  type="button"
                  variant={estadoInicial === "HABILITADO" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setEstadoInicial("HABILITADO")}
                >
                  Habilitado (Producción)
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 pt-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="gap-1.5"
            >
              <Plus className="size-4" />
              Registrar Conector (CNX-01)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
