"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Eye,
  Trash2,
  Search,
  Clock,
  Mail,
  RefreshCw,
  Sparkles,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Download,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FileUpload, type FileUploadItem } from "@/components/ui/file-upload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  InstitucionConfig,
  CaracterCoordinador,
  CoordinadorInstitucional,
  TipoFirmanteAnexoC,
  AutorizacionDelegado,
  ValidacionFirmaECAnexoC
} from "../data/cambio-coordinador-store";
import type { FormNuevoCoordinadorData } from "./coordinador-entrante-form";

interface AnexoCSignatureProps {
  institucion: InstitucionConfig;
  caracter: CaracterCoordinador;
  coordinadorSaliente: CoordinadorInstitucional;
  coordinadorEntrante: FormNuevoCoordinadorData;
  onVolver: () => void;
  onFirmaCompletadaYEnviada: (datos: {
    firmanteTipo: TipoFirmanteAnexoC;
    autorizacionDelegado?: AutorizacionDelegado;
    firmaEC: ValidacionFirmaECAnexoC;
  }) => void;
}

interface FirmaFalloState {
  tipo: "RECHAZADA" | "CADUCADA" | "INCIERTA";
  motivo: string;
  transaccionId: string;
}

interface SignatureInfoState {
  fechaHora: string;
  transaccionId: string;
  firmante: string;
  huellaSha256: string;
  entidadCertificadora: string;
}

export function AnexoCSignature({
  institucion,
  caracter,
  coordinadorSaliente,
  coordinadorEntrante,
  onVolver,
  onFirmaCompletadaYEnviada
}: AnexoCSignatureProps) {
  // 1. Sub-etapa del flujo de firma (1: Elección de firmante, 2: Suscripción con FirmaEC)
  const [subEtapaFirma, setSubEtapaFirma] = useState<"SELECCION_FIRMANTE" | "SUSCRIPCION_FIRMAEC">(
    "SELECCION_FIRMANTE"
  );

  // 2. Selector de firmante y soporte de delegación
  const [firmanteTipo, setFirmanteTipo] = useState<TipoFirmanteAnexoC>("MAXIMA_AUTORIDAD");
  const [autorizacionArchivo, setAutorizacionArchivo] = useState<AutorizacionDelegado | null>(null);
  const [errorDelegacion, setErrorDelegacion] = useState<string | null>(null);

  // 3. Estados de FirmaEC
  const [isSigned, setIsSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [firmaFallo, setFirmaFallo] = useState<FirmaFalloState | null>(null);
  const [signatureInfo, setSignatureInfo] = useState<SignatureInfoState | null>(null);
  const [isCheckingTransaction, setIsCheckingTransaction] = useState(false);
  const [envioPendienteVerificacion, setEnvioPendienteVerificacion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 4. Modales
  const [modalVerDoc, setModalVerDoc] = useState(false);
  const [modalVerDelegacion, setModalVerDelegacion] = useState(false);

  const firmanteNombreVisible =
    firmanteTipo === "MAXIMA_AUTORIDAD"
      ? institucion.representanteLegal
      : "Ing. Carlos Andrade (Delegado Autorizado)";

  const emailFirmante =
    firmanteTipo === "MAXIMA_AUTORIDAD"
      ? "maxima.autoridad@educacion.gob.ec"
      : "carlos.andrade@educacion.gob.ec";

  // Manejo de carga de documento de delegación con FileUpload (Basic)
  const [delegacionFiles, setDelegacionFiles] = useState<FileUploadItem[]>([]);
  const uploadTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    };
  }, []);

  const handleDelegacionFileSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);

    const newItem: FileUploadItem = {
      id: `delegacion-${Date.now()}`,
      file,
      status: "uploading",
      errorType: null,
      progress: 20,
    };

    setDelegacionFiles([newItem]);
    setErrorDelegacion(null);

    let currentProgress = 20;
    uploadTimerRef.current = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 20;
      if (currentProgress >= 100) {
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        setDelegacionFiles([
          {
            ...newItem,
            status: "success",
            progress: 100,
          },
        ]);
        const tamanoKB = Math.round(file.size / 1024);
        const tamanoStr = tamanoKB > 1024 ? `${(tamanoKB / 1024).toFixed(1)} MB` : `${tamanoKB} KB`;
        setAutorizacionArchivo({
          archivoNombre: file.name,
          archivoTamano: tamanoStr,
          fechaSubida: new Date().toLocaleDateString("es-EC")
        });
        toast.success("Documento cargado con éxito", {
          description: `El archivo "${file.name}" fue verificado y cargado correctamente.`,
        });
      } else {
        setDelegacionFiles([
          {
            ...newItem,
            status: "uploading",
            progress: currentProgress,
          },
        ]);
      }
    }, 150);
  };

  const handleDelegacionRemove = () => {
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    setDelegacionFiles([]);
    setAutorizacionArchivo(null);
    setErrorDelegacion("Debe adjuntar la autorización o acuerdo de delegación para continuar.");
    toast.info("Documento de delegación eliminado");
  };

  const handleDelegacionCancel = () => {
    if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
    setDelegacionFiles([]);
    setAutorizacionArchivo(null);
    toast.info("Carga cancelada");
  };

  const handleDelegacionRetry = () => {
    if (delegacionFiles.length > 0) {
      handleDelegacionFileSelect([delegacionFiles[0].file]);
    }
  };

  const displayedDelegacionItems: FileUploadItem[] =
    delegacionFiles.length > 0
      ? delegacionFiles
      : autorizacionArchivo
        ? [
            {
              id: "autorizacion-previa",
              file: new File([""], autorizacionArchivo.archivoNombre, { type: "application/pdf" }),
              status: "success",
              errorType: null,
              progress: 100,
            }
          ]
        : [];

  // Continuar desde la selección de firmante hacia la suscripción digital
  const handleContinuarAFirma = () => {
    if (firmanteTipo === "DELEGADO_AUTORIZADO" && !autorizacionArchivo) {
      setErrorDelegacion("Debe adjuntar la autorización o acuerdo de delegación para continuar.");
      toast.error("Falta documento de delegación", {
        description: "Adjunta la resolución o acuerdo formal en formato PDF."
      });
      return;
    }

    setErrorDelegacion(null);
    setFirmaFallo(null);
    setIsSigned(false);
    setSubEtapaFirma("SUSCRIPCION_FIRMAEC");
    toast.info("Notificación de firma enviada al correo institucional", {
      description: `Se ha remitido la notificación de suscripción digital al correo ${emailFirmante}.`
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Regresar de la suscripción a la selección de firmante
  const handleVolverASeleccion = () => {
    setSubEtapaFirma("SELECCION_FIRMANTE");
    setIsSigned(false);
    setIsSigning(false);
    setSignatureInfo(null);
    setFirmaFallo(null);
  };

  // Monitoreo en vivo / simulación automática cuando ingresa a SUSCRIPCION_FIRMAEC
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (subEtapaFirma === "SUSCRIPCION_FIRMAEC" && !isSigned && !firmaFallo) {
      setIsSigning(true);
      timer = setTimeout(() => {
        setIsSigning(false);
        const transId = `FEC-2026-${Math.floor(10000 + Math.random() * 90000)}-C`;
        const sha256 = "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1";
        const now = new Date();
        const fechaHora = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        setSignatureInfo({
          fechaHora,
          transaccionId: transId,
          firmante: firmanteNombreVisible,
          huellaSha256: sha256,
          entidadCertificadora: "Banco Central del Ecuador (BCE)"
        });
        setIsSigned(true);
        toast.success("Firma electrónica confirmada", {
          description: "El Anexo C ha sido suscrito digitalmente en FirmaEC."
        });
      }, 2800);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [subEtapaFirma, isSigned, firmaFallo, firmanteNombreVisible]);

  // Forzar firma válida manual desde demo
  const handleForzarFirmaValida = () => {
    setIsSigning(false);
    const transId = `FEC-2026-${Math.floor(10000 + Math.random() * 90000)}-C`;
    const sha256 = "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1";
    const now = new Date();
    const fechaHora = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setSignatureInfo({
      fechaHora,
      transaccionId: transId,
      firmante: firmanteNombreVisible,
      huellaSha256: sha256,
      entidadCertificadora: "Banco Central del Ecuador (BCE)"
    });
    setFirmaFallo(null);
    setIsSigned(true);
    toast.success("Firma electrónica confirmada", {
      description: "El Anexo C ha sido suscrito digitalmente con validez legal."
    });
  };

  // Simular escenarios de contingencia
  const handleSimularFalloFirma = (tipo: "RECHAZADA" | "CADUCADA" | "INCIERTA") => {
    setIsSigned(false);
    setIsSigning(false);
    setSignatureInfo(null);
    const transId = `FEC-OP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    if (tipo === "RECHAZADA") {
      setFirmaFallo({
        tipo: "RECHAZADA",
        motivo:
          "El certificado digital del firmante se encuentra revocado, vencido o no corresponde a la cédula de la autoridad registrada. La firma fue denegada por FirmaEC.",
        transaccionId: transId
      });
      toast.error("Firma rechazada por FirmaEC", {
        description: "No se confirmó la firma del Anexo C. Revisa la información o intenta nuevamente."
      });
    } else if (tipo === "CADUCADA") {
      setFirmaFallo({
        tipo: "CADUCADA",
        motivo:
          "El tiempo de espera para estampar la firma electrónica en FirmaEC expiró sin confirmación del firmante. El trámite permanece en borrador.",
        transaccionId: transId
      });
      toast.warning("Sesión de firma expirada", {
        description: "El plazo límite de espera ha vencido. El trámite permanece en Borrador."
      });
    } else {
      setFirmaFallo({
        tipo: "INCIERTA",
        motivo:
          "Se produjo un timeout o respuesta incierta en la conexión con los servidores de validación de FirmaEC. Consulta el estado de la transacción original.",
        transaccionId: transId
      });
      toast.info("Respuesta incierta de FirmaEC", {
        description: "No se pudo verificar la firma. Puedes consultar la transacción original sin emitir un nuevo requerimiento."
      });
    }
  };

  const handleReintentarFirma = () => {
    setFirmaFallo(null);
    setIsSigning(true);
    setIsSigned(false);
  };

  const handleConsultarTransaccionOriginal = () => {
    if (!firmaFallo) return;
    setIsCheckingTransaction(true);
    toast.info("Consultando estado de transacción en FirmaEC...", {
      description: `Verificando operación ${firmaFallo.transaccionId}`
    });

    setTimeout(() => {
      setIsCheckingTransaction(false);
      const now = new Date();
      const fechaHora = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      setSignatureInfo({
        fechaHora,
        transaccionId: firmaFallo.transaccionId,
        firmante: firmanteNombreVisible,
        huellaSha256: "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1",
        entidadCertificadora: "Banco Central del Ecuador (BCE)"
      });
      setFirmaFallo(null);
      setIsSigned(true);
      toast.success("Transacción confirmada en FirmaEC", {
        description: "Se verificó la validez de la firma digital original previamente estampada."
      });
    }, 1500);
  };

  const handleDeshacerFirma = () => {
    setIsSigned(false);
    setIsSigning(false);
    setSignatureInfo(null);
    setFirmaFallo(null);
    setEnvioPendienteVerificacion(false);
    toast.info("Estado de firma restablecido a pendiente");
  };

  // Envío final formal al Área de Gestión
  const handleConfirmarEnvio = () => {
    if (!isSigned || !signatureInfo) return;

    if (envioPendienteVerificacion) {
      toast.warning("Envío pendiente de verificación", {
        description: "La firma está confirmada pero se requiere confirmación del canal de transmisión."
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onFirmaCompletadaYEnviada({
        firmanteTipo,
        autorizacionDelegado: autorizacionArchivo || undefined,
        firmaEC: {
          estado: "VALIDA",
          transaccionId: signatureInfo.transaccionId,
          firmante: signatureInfo.firmante,
          fechaFirma: signatureInfo.fechaHora,
          huellaSha256: signatureInfo.huellaSha256,
          entidadCertificadora: signatureInfo.entidadCertificadora
        }
      });
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── ETAPA 1: SELECCIÓN DE FIRMANTE (MÁXIMA AUTORIDAD O DELEGADO) ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {subEtapaFirma === "SELECCION_FIRMANTE" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subcontenido 3.1: Autoridad Firmante (Estilo Registro Institución) */}
          <div className="bg-primary/5 dark:bg-primary-950/20 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
            <div className="flex items-start gap-2.5 min-w-0">
              <ShieldCheck className="size-4 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 leading-snug">
                  3.1 Autoridad Firmante del Instrumento
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Selecciona la autoridad que suscribirá digitalmente el instrumento oficial según las facultades de tu institución.
                </p>
              </div>
            </div>
            <Badge
              tone="primary"
              appearance="soft"
              size="sm"
              className="shrink-0 self-start sm:self-auto font-bold uppercase tracking-wider"
            >
              FIRMANTE
            </Badge>
          </div>

          <RadioGroup
            value={firmanteTipo}
            onValueChange={(val) => {
              const nuevoTipo = val as TipoFirmanteAnexoC;
              setFirmanteTipo(nuevoTipo);
              if (nuevoTipo === "MAXIMA_AUTORIDAD") setErrorDelegacion(null);
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Opción A: Máxima Autoridad */}
            <label
              htmlFor="radio-maxima"
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                firmanteTipo === "MAXIMA_AUTORIDAD"
                  ? "bg-primary/5 border-primary shadow-xs"
                  : "bg-surface border-border hover:bg-muted/40"
              )}
            >
              <RadioGroupItem value="MAXIMA_AUTORIDAD" id="radio-maxima" className="mt-1" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground block">
                  Máxima autoridad
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ministro, Viceministro, Director Ejecutivo o representante legal titular de la entidad.
                </p>
                <div className="text-[11px] text-foreground font-medium pt-1">
                  Firmante: <strong>{institucion.representanteLegal}</strong>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  maxima.autoridad@educacion.gob.ec
                </div>
              </div>
            </label>

            {/* Opción B: Delegado Autorizado */}
            <label
              htmlFor="radio-delegado"
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3",
                firmanteTipo === "DELEGADO_AUTORIZADO"
                  ? "bg-primary/5 border-primary shadow-xs"
                  : "bg-surface border-border hover:bg-muted/40"
              )}
            >
              <RadioGroupItem value="DELEGADO_AUTORIZADO" id="radio-delegado" className="mt-1" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-foreground block">
                  Delegado autorizado
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Funcionario con poder o acto administrativo formal de delegación emitido por la máxima autoridad.
                </p>
                <div className="text-[11px] text-warning font-semibold pt-1">
                  &bull; Requiere adjuntar resolución o acuerdo de delegación (PDF)
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  carlos.andrade@educacion.gob.ec
                </div>
              </div>
            </label>
          </RadioGroup>

          {/* Carga obligatoria de delegación si aplica */}
          {firmanteTipo === "DELEGADO_AUTORIZADO" && (
            <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UploadCloud className="size-4 text-warning" />
                  <span>Adjuntar autorización de delegación formal <span className="text-danger">*</span></span>
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  PDF habilitante · Máx. 10MB
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Acuerdo ministerial, resolución institucional o poder notariado en formato PDF (máx. 10MB).
              </p>

              <div className="w-full">
                <FileUpload
                  accept=".pdf"
                  allowedFormats="PDF"
                  maxSizeMB={10}
                  className="w-full"
                  items={displayedDelegacionItems}
                  onFileSelect={handleDelegacionFileSelect}
                  onRemove={handleDelegacionRemove}
                  onCancel={handleDelegacionCancel}
                  onRetry={handleDelegacionRetry}
                />
              </div>

              {autorizacionArchivo && (
                <div className="flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-primary gap-1.5 hover:text-primary-700 hover:bg-primary/10"
                    onClick={() => setModalVerDelegacion(true)}
                  >
                    <Eye className="size-3.5" />
                    <span>Ver documento de autorización</span>
                  </Button>
                </div>
              )}

              {errorDelegacion && (
                <p className="text-[11px] text-danger flex items-center gap-1 font-medium">
                  <AlertTriangle className="size-3.5" /> {errorDelegacion}
                </p>
              )}
            </div>
          )}


          {/* Botones de acción inferiores - Paso 3.1 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="neutral"
              size="default"
              onClick={onVolver}
              className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
            >
              <ArrowLeft className="size-4" />
              <span>Anterior: Revisar Anexo C</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleContinuarAFirma}
              className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
            >
              <span>Continuar a firma</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── ETAPA 2: SUSCRIPCIÓN DIGITAL Y VALIDACIÓN EN VIVO CON FIRMAEC ── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {subEtapaFirma === "SUSCRIPCION_FIRMAEC" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subcontenido 3.2: Suscripción Digital con FirmaEC */}
          <div className="bg-primary/5 dark:bg-primary-950/20 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
            <div className="flex items-start gap-2.5 min-w-0">
              <FileText className="size-4 text-primary dark:text-primary-300 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold font-heading text-primary dark:text-primary-300 leading-snug">
                  3.2 Suscripción Digital con FirmaEC
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Notificación remitida y monitoreo en tiempo real de la firma electrónica del Anexo C.
                </p>
              </div>
            </div>
            <Badge
              tone="primary"
              appearance="soft"
              size="sm"
              className="shrink-0 self-start sm:self-auto font-bold uppercase tracking-wider"
            >
              FIRMAEC
            </Badge>
          </div>

          {/* CARD DE DOCUMENTO Y ESTADO FIRMAEC */}
          <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
            {/* Cabecera del documento con badge de estado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    ARP-R03_Cambio_Coordinador_MinEduc.pdf
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Documento oficial Anexo C generado · 280 KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalVerDoc(true)}
                  className="text-xs font-semibold gap-1.5"
                >
                  <Eye className="size-3.5" />
                  <span>Ver documento</span>
                </Button>
                <Badge
                  tone={
                    isSigned
                      ? "success"
                      : firmaFallo
                      ? firmaFallo.tipo === "INCIERTA"
                        ? "warning"
                        : "danger"
                      : "warning"
                  }
                  appearance="soft"
                  size="sm"
                  className="font-bold text-[10px] uppercase tracking-wider"
                >
                  {isSigned
                    ? "FIRMADO DIGITALMENTE"
                    : firmaFallo
                    ? "FIRMA NO CONFIRMADA"
                    : "PENDIENTE DE FIRMA"}
                </Badge>
              </div>
            </div>

            {/* ── ESCENARIO A: CONTINGENCIA / FALLO EN FIRMAEC ── */}
            {firmaFallo && (
              <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                <Alert
                  variant="warning"
                  icon={
                    firmaFallo.tipo === "CADUCADA" ? (
                      <Clock className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )
                  }
                  title="No se confirmó la firma del Anexo C."
                >
                  <p className="text-xs leading-relaxed text-foreground">
                    {firmaFallo.motivo}
                  </p>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-3.5 rounded-xl bg-surface/80 dark:bg-surface/50 border border-border text-xs">
                  <div className="flex justify-between py-1 border-b sm:border-b-0 border-border/60">
                    <span className="text-muted-foreground">Código de Operación:</span>
                    <span className="font-mono font-medium text-foreground">{firmaFallo.transaccionId}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Estado del trámite:</span>
                    <span className="font-medium text-warning flex items-center gap-1">
                      <Clock className="size-3.5" /> Permanece activo sin cambios
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
                  {firmaFallo.tipo === "INCIERTA" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isCheckingTransaction}
                      onClick={handleConsultarTransaccionOriginal}
                      className="font-semibold text-xs gap-1.5 shadow-xs w-full sm:w-auto"
                    >
                      {isCheckingTransaction ? (
                        <>
                          <RefreshCw className="size-3.5 animate-spin" />
                          <span>Consultando transacción original...</span>
                        </>
                      ) : (
                        <>
                          <Search className="size-3.5" />
                          <span>Consultar transacción original</span>
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="warning"
                    size="sm"
                    onClick={handleReintentarFirma}
                    className="font-semibold text-xs gap-1.5 shadow-xs w-full sm:w-auto text-white"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Reintentar firma con FirmaEC</span>
                  </Button>
                </div>
              </div>
            )}

            {/* ── ESCENARIO B: PENDIENTE DE FIRMA / MONITOREO EN VIVO ── */}
            {!isSigned && !firmaFallo && (
              <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                {/* Alerta de notificación por correo institucional */}
                <div className="p-4 rounded-xl border border-primary/25 bg-primary/5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Mail className="size-4 shrink-0" />
                    <span>Notificación de firma enviada al correo institucional</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Se ha remitido la notificación de suscripción digital al correo{" "}
                    <strong className="text-foreground font-semibold">{emailFirmante}</strong>.
                  </p>
                  <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5 pt-1">
                    <RefreshCw className="size-3.5 animate-spin shrink-0" />
                    <span>Revisa tu correo o abre FirmaEC. Cuando firmes con certificado o token, el estado de esta pantalla se actualizará automáticamente.</span>
                  </p>
                </div>

                {/* Bloque de validación en vivo (sin botón al lado conforme al requerimiento) */}
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-surface border border-border text-xs text-muted-foreground">
                  <LoadingSpinner size="sm" className="size-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium">Validando firma con FirmaEC en vivo...</span>
                </div>
              </div>
            )}

            {/* ── ESCENARIO C: FIRMA ELECTRÓNICA CONFIRMADA EXITOSA ── */}
            {isSigned && (
              <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-300">
                <Alert
                  variant="success"
                  className="flex flex-col items-center justify-center text-center p-6 sm:p-8 gap-3.5 rounded-2xl [&_.alert-line]:hidden [&_.alert-icon]:size-14 sm:[&_.alert-icon]:size-16 [&_.alert-icon]:rounded-2xl [&_.alert-icon_svg]:size-7 sm:[&_.alert-icon_svg]:size-8 [&_.alert-icon]:shadow-sm [&_.alert-icon]:mb-1 [&_.alert-title]:text-center [&_.alert-title]:text-base sm:[&_.alert-title]:text-lg [&_.alert-title]:font-bold [&_.alert-title]:font-heading [&>div:last-of-type]:text-center [&>div:last-of-type]:items-center [&>div:last-of-type]:w-full animate-in fade-in duration-300"
                  icon={<CheckCircle2 className="size-7 sm:size-8" />}
                  title="Firma Electrónica Confirmada por FirmaEC"
                >
                  <div className="flex flex-col items-center justify-center text-center space-y-4 mt-1 w-full">
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      El Formulario ARP-R03 (Anexo C) ha sido suscrito digitalmente de forma válida con certificado reconocido por la Ley de Comercio Electrónico del Ecuador.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs w-full">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-xs text-foreground font-mono text-[11px] sm:text-xs">
                        <span className="font-sans font-medium text-muted-foreground">Fecha y Hora:</span>
                        <strong className="text-foreground font-bold">{signatureInfo?.fechaHora || "07/10/2026 09:15"}</strong>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-xs text-foreground font-mono text-[11px] sm:text-xs">
                        <span className="font-sans font-medium text-muted-foreground">Transacción / ID:</span>
                        <strong className="text-foreground font-bold">{signatureInfo?.transaccionId || "FEC-2026-84920-C"}</strong>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-xs text-foreground font-mono text-[11px] sm:text-xs">
                        <span className="font-sans font-medium text-muted-foreground">Firmante:</span>
                        <strong className="text-foreground font-bold">{firmanteNombreVisible}</strong>
                      </div>
                    </div>

                    {envioPendienteVerificacion && (
                      <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning text-xs font-medium flex items-center gap-2 max-w-md mx-auto">
                        <AlertTriangle className="size-4 shrink-0" />
                        <span>Firma confirmada; envío pendiente de verificación.</span>
                      </div>
                    )}
                  </div>
                </Alert>
              </div>
            )}

            {/* Datos del firmante autorizado designado */}
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Firmante Autorizado Designado
                </span>
                <div className="flex items-center gap-2">
                  <Badge tone="primary" appearance="soft" size="sm" className="w-fit text-[10px] font-semibold">
                    {firmanteTipo === "DELEGADO_AUTORIZADO" ? "Delegado Autorizado" : "Máxima Autoridad Institucional"}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleVolverASeleccion}
                    className="h-6 text-[10px] text-muted-foreground hover:text-primary px-2"
                  >
                    Modificar autoridad
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Nombre:</span>
                  <p className="font-semibold text-foreground text-xs">{firmanteNombreVisible}</p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                  <p className="font-semibold text-foreground text-xs">
                    {firmanteTipo === "MAXIMA_AUTORIDAD" ? "Máxima Autoridad" : "Delegado Institucional"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Correo de Notificación:</span>
                  <p className="font-semibold text-foreground text-xs">{emailFirmante}</p>
                </div>
              </div>

              {firmanteTipo === "DELEGADO_AUTORIZADO" && (
                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <FileText className="size-3.5 text-primary shrink-0" />
                  <span>Acto administrativo de delegación:</span>
                  <strong className="font-mono text-foreground font-medium">
                    {autorizacionArchivo?.archivoNombre || "Resolución / Acuerdo de delegación adjunto"}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTONES DE ACCIÓN INFERIORES EN ETAPA 2 ── */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
            <Button
              type="button"
              variant="neutral"
              size="default"
              onClick={handleVolverASeleccion}
              disabled={isSubmitting}
              className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
            >
              <ArrowLeft className="size-4" />
              <span>Anterior: Modificar firmante</span>
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {isSigned ? (
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  disabled={isSubmitting || envioPendienteVerificacion}
                  className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                  onClick={handleConfirmarEnvio}
                >
                  {isSubmitting ? (
                    <span>Enviando Anexo C a Gestión...</span>
                  ) : (
                    <>
                      <span className="whitespace-nowrap">Enviar Anexo C a Gestión</span>
                      <Check className="size-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  disabled={true}
                  className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px] opacity-60 cursor-not-allowed"
                >
                  <span className="whitespace-nowrap">Esperando suscripción digital...</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTONES FLOTANTES PARA DEMO (HERRAMIENTAS DE PRUEBA) ── */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
            <Sparkles className="size-3 text-primary shrink-0" />
            <span>Demo FirmaEC</span>
          </div>

          {!isSigned && subEtapaFirma === "SUSCRIPCION_FIRMAEC" && (
            <>
              <Button
                type="button"
                variant="success"
                size="default"
                onClick={handleForzarFirmaValida}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
              >
                <ShieldCheck className="size-3.5" /> Forzar Firma Válida
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                  >
                    <span>Simular Fallo</span>
                    <ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-xl shadow-lg border-border">
                  <DropdownMenuItem
                    onClick={() => handleSimularFalloFirma("RECHAZADA")}
                    className="flex items-start gap-2.5 p-2 rounded-lg text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                  >
                    <XCircle className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold leading-none">Firma Rechazada</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Certificado revocado o inválido</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSimularFalloFirma("CADUCADA")}
                    className="flex items-start gap-2.5 p-2 rounded-lg text-warning focus:text-warning focus:bg-warning/10 cursor-pointer"
                  >
                    <Clock className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold leading-none">Firma Caducada</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Tiempo de espera expirado</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleSimularFalloFirma("INCIERTA")}
                    className="flex items-start gap-2.5 p-2 rounded-lg text-warning focus:text-warning focus:bg-warning/10 cursor-pointer"
                  >
                    <RefreshCw className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold leading-none">Respuesta Incierta</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Consultar transacción original</div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {isSigned && (
            <>
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={() => setEnvioPendienteVerificacion(!envioPendienteVerificacion)}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
              >
                <AlertTriangle className="size-3.5" />
                <span>{envioPendienteVerificacion ? "Quitar bloqueo envío" : "Simular Envío Incierto"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={handleDeshacerFirma}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
              >
                <RefreshCw className="size-3.5" /> Deshacer Firma
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── MODAL DE VISUALIZACIÓN DEL DOCUMENTO ANEXO C ── */}
      <Dialog open={modalVerDoc} onOpenChange={setModalVerDoc}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge tone="secondary" appearance="soft" size="sm" className="font-mono text-[10px]">
                ARP-R03 OFICIAL
              </Badge>
              {isSigned && (
                <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-mono text-[10px]">
                  <CheckCircle2 className="size-3 text-success" />
                  <span>SUSCRITO DIGITALMENTE</span>
                </Badge>
              )}
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground pt-1">
              Formulario ARP-R03 — Solicitud de Cambio de Coordinador SINARP
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Documento formal generado según las disposiciones del Sistema Nacional de Registro de Datos Públicos.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 sm:p-6 bg-surface border border-border rounded-xl space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Entidad Requirente</span>
                <p className="font-semibold text-foreground text-sm">{institucion.nombre}</p>
                <p className="text-[11px] text-muted-foreground font-mono">RUC: {institucion.ruc}</p>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Tipo de Sustitución</span>
                <p className="font-semibold text-primary">Coordinador {caracter === "TITULAR" ? "Titular" : "Suplente"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Coordinador Saliente</span>
                <p className="font-semibold text-foreground">{coordinadorSaliente.nombreCompleto}</p>
                <p className="text-[11px] text-muted-foreground font-mono">CI: {coordinadorSaliente.cedula}</p>
                <p className="text-[11px] text-muted-foreground">{coordinadorSaliente.cargo}</p>
              </div>

              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1">
                <span className="text-[10px] font-bold text-primary uppercase">Nuevo Coordinador Designado</span>
                <p className="font-semibold text-foreground">{coordinadorEntrante.nombreCompleto}</p>
                <p className="text-[11px] text-muted-foreground font-mono">CI: {coordinadorEntrante.cedula}</p>
                <p className="text-[11px] text-muted-foreground">{coordinadorEntrante.cargo}</p>
              </div>
            </div>

            <div className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Motivo Formal de la Sustitución</span>
              <p className="text-foreground leading-relaxed">{coordinadorEntrante.motivo || "Reestructuración y designación de funciones institucionales."}</p>
            </div>

            <div className="p-3 bg-muted/20 rounded-lg border border-border space-y-1 text-[11px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground block">Cláusula de Continuidad y Custodia:</strong>
              Los proyectos, solicitudes, contratos, cupos y credenciales de la institución no se eliminan por el cambio de Coordinador. El nuevo funcionario asume la custodia institucional conforme a la normativa vigente.
            </div>

            {/* Sello de firma */}
            <div className="p-4 rounded-xl border border-dashed border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Suscripción de la Solicitud
                </span>
                <p className="font-semibold text-foreground">{firmanteNombreVisible}</p>
                <p className="text-[11px] text-muted-foreground">
                  {firmanteTipo === "MAXIMA_AUTORIDAD" ? "Máxima Autoridad Institucional" : "Delegado Autorizado"}
                </p>
              </div>

              {isSigned && signatureInfo ? (
                <div className="text-right sm:text-right space-y-0.5">
                  <Badge tone="success" appearance="soft" size="sm" className="font-bold text-[10px]">
                    FIRMADO CON FIRMAEC
                  </Badge>
                  <p className="text-[10px] font-mono text-muted-foreground">ID: {signatureInfo.transaccionId}</p>
                  <p className="text-[10px] text-muted-foreground">{signatureInfo.fechaHora}</p>
                </div>
              ) : (
                <Badge tone="warning" appearance="soft" size="sm" className="font-bold text-[10px]">
                  PENDIENTE DE FIRMA
                </Badge>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setModalVerDoc(false)} className="text-xs w-full sm:w-auto">
              Cerrar visor
            </Button>
            {isSigned && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Descargando PDF firmado", {
                    description: "ARP-R03_Cambio_Coordinador_MinEduc.pdf"
                  });
                }}
                className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
              >
                <Download className="size-3.5" />
                <span>Descargar PDF firmado</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL DE VISUALIZACIÓN DE AUTORIZACIÓN DE DELEGACIÓN ── */}
      <Dialog open={modalVerDelegacion} onOpenChange={setModalVerDelegacion}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>Documento de Autorización / Delegación</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {autorizacionArchivo?.archivoNombre} ({autorizacionArchivo?.archivoTamano})
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 rounded-xl bg-muted/30 border border-border text-center space-y-3 my-2">
            <FileText className="size-12 text-primary mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                {autorizacionArchivo?.archivoNombre}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                Documento suscrito por la máxima autoridad que faculta al delegado institucional a gestionar el cambio de
                coordinador ante la DINARP.
              </p>
            </div>
            <Badge tone="success" appearance="soft" size="sm" className="gap-1 text-[10px]">
              <CheckCircle2 className="size-3 text-success" /> Documento adjunto verificado
            </Badge>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setModalVerDelegacion(false)} className="text-xs">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
