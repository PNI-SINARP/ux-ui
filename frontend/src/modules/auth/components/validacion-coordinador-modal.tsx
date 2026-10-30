"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Search,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { DINARPSpinner } from "@/components/ui/dinarp-spinner";
import { cn } from "@/lib/utils";
import { useSolicitudesIngresoStore } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";

export interface CoordinadorValidadoData {
  encontrado: boolean;
  cedula: string;
  nombreCompleto: string;
  institucion: string;
  cargo: string;
  tipo: "TITULAR" | "SUPLENTE";
  representanteLegal: string;
  direccion: string;
  yaEnrolado?: boolean;
}

interface ValidacionCoordinadorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCedula?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onValidated: (data: CoordinadorValidadoData) => void;
}

type ValidationLoadingPhase = "idle" | "validating" | "preloading" | "transitioning";

export function ValidacionCoordinadorModal({
  open,
  onOpenChange,
  initialCedula = "",
  cancelLabel = "Volver al acceso principal",
  onCancel,
  onValidated,
}: ValidacionCoordinadorModalProps) {
  const { buscarPreregistroPorCedula } = useSolicitudesIngresoStore();
  const [cedulaInput, setCedulaInput] = useState(initialCedula);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<ValidationLoadingPhase>("idle");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (open) {
      clearTimers();
      setLoadingPhase("idle");
      setCedulaInput(initialCedula || "");
      setValidationError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startLoadingAndComplete = (resultData: CoordinadorValidadoData) => {
    clearTimers();
    setValidationError(null);
    setLoadingPhase("validating");

    const t1 = setTimeout(() => {
      setLoadingPhase("preloading");
    }, 950);

    const t2 = setTimeout(() => {
      setLoadingPhase("transitioning");
    }, 1900);

    const t3 = setTimeout(() => {
      toast.success("Invitación confirmada y datos precargados", {
        description: `Se cargó la designación de ${resultData.nombreCompleto} (${resultData.institucion}).`,
      });
      onValidated(resultData);
    }, 2300);

    timersRef.current = [t1, t2, t3];
  };

  const handleValidate = (customCed?: string) => {
    if (loadingPhase !== "idle") return;
    const cleanCed = (customCed ?? cedulaInput).trim();

    if (cleanCed.length !== 10) {
      setValidationError("El número de cédula debe contener exactamente 10 dígitos.");
      toast.error("Formato de cédula no válido", {
        description: "Ingresa un número de cédula válido de 10 dígitos.",
      });
      return;
    }

    setValidationError(null);
    const res = buscarPreregistroPorCedula(cleanCed);

    if (res.encontrado && res.nombreCompleto) {
      startLoadingAndComplete({
        encontrado: true,
        cedula: res.cedula || cleanCed,
        nombreCompleto: res.nombreCompleto,
        institucion: res.institucion || "Ministerio de Salud Pública - MSP",
        cargo: res.cargo || "Coordinador Institucional Designado",
        tipo: (res.tipo as "TITULAR" | "SUPLENTE") || "TITULAR",
        representanteLegal: res.representanteLegal || "Dr. Franklin Encalada Calero",
        direccion: res.direccion || "Av. República de El Salvador N36-64 y Suecia, Quito",
        yaEnrolado: res.yaEnrolado,
      });
    } else {
      setValidationError(
        "No encontramos una invitación de enrolamiento vigente asociada a este número de cédula."
      );
      toast.error("Invitación no encontrada", {
        description:
          "La cédula ingresada no registra una designación previa en el Anexo A.",
      });
    }
  };

  const isBusy = loadingPhase !== "idle";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isBusy) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        variant="standard"
        size="3xl"
        showCloseButton={!isBusy}
        className="w-[95vw] sm:w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto transition-all duration-300"
      >
        <DialogHeader className="space-y-1.5 text-left pr-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              tone="secondary"
              appearance="soft"
              size="sm"
              className="text-[10px] uppercase font-bold tracking-wider"
            >
              ANEXO B · FORMULARIO OFICIAL ARP-R02
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold font-heading flex items-center gap-2 text-foreground">
            <UserCheck className="size-5 text-secondary shrink-0" />
            <span>Confirmación de invitación de enrolamiento</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Ingresa tu número de cédula de identidad para confirmar tu invitación
            como Coordinador SINARP y continuar con el registro.
          </DialogDescription>
        </DialogHeader>

        {isBusy ? (
          /* Estado de carga con el spinner oficial del UI Kit (DINARPSpinner) */
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10 my-2 shadow-xs flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
            <DINARPSpinner
              size="lg"
              hideLabel
              label={
                loadingPhase === "validating"
                  ? "Confirmando invitación de enrolamiento"
                  : "Precargando datos del coordinador"
              }
            />

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold font-heading text-foreground animate-fade-in">
                {loadingPhase === "validating"
                  ? "Confirmando invitación de enrolamiento..."
                  : loadingPhase === "preloading"
                  ? "Precargando datos del coordinador en el Anexo B..."
                  : "¡Invitación confirmada! Abriendo formulario..."}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {loadingPhase === "validating"
                  ? `Verificando la habilitación de la cédula ${cedulaInput} en la solicitud institucional (Anexo A).`
                  : "Recuperando información de la institución, representante legal y cargo designado."}
              </p>
            </div>

            {/* Checklist de progreso */}
            <div className="w-full max-w-sm bg-muted/40 border border-border rounded-xl p-3.5 space-y-2.5 text-left">
              <div className="flex items-center gap-2.5 text-xs">
                {loadingPhase === "validating" ? (
                  <Loader2 className="size-4 text-secondary animate-spin shrink-0" />
                ) : (
                  <div className="size-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                    <Check className="size-3" />
                  </div>
                )}
                <span
                  className={cn(
                    "font-medium transition-colors",
                    loadingPhase === "validating"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  Confirmando invitación de enrolamiento (CI {cedulaInput})
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {loadingPhase === "validating" ? (
                  <div className="size-4 rounded-full border border-border shrink-0" />
                ) : loadingPhase === "preloading" ? (
                  <Loader2 className="size-4 text-secondary animate-spin shrink-0" />
                ) : (
                  <div className="size-4 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                    <Check className="size-3" />
                  </div>
                )}
                <span
                  className={cn(
                    "font-medium transition-colors",
                    loadingPhase === "preloading"
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  Precargando datos del coordinador e institución
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-fade-in">
              {/* Cabecera Sección al ras estilo registro */}
              <div className="bg-secondary-500/10 dark:bg-secondary-500/20 border-b border-secondary-500/20 p-4 sm:p-5 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold font-heading text-secondary dark:text-secondary-300 flex items-center gap-2">
                    <UserCheck className="size-4 sm:size-5 text-secondary shrink-0" />
                    <span>Activación de Coordinador SINARP</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirma tu invitación previa en la solicitud institucional (Anexo A).
                  </p>
                </div>
                <Badge
                  tone="secondary"
                  appearance="solid"
                  size="sm"
                  className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1"
                >
                  PRERREGISTRO
                </Badge>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <Label
                    htmlFor="modal-cedula-coordinador"
                    className="text-xs font-semibold text-foreground"
                  >
                    Número de cédula de identidad (10 dígitos){" "}
                    <span className="text-warning">*</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Ingresa tu cédula para consultar tu habilitación como Coordinador SINARP.
                  </p>
                </div>

                <div className="flex items-center min-h-[42px]">
                  <InputGroup
                    leftIcon={<FileText className="size-4 text-muted-foreground" />}
                    state={
                      validationError
                        ? "error"
                        : cedulaInput.length === 10
                        ? "success"
                        : "default"
                    }
                    rightIcon={
                      validationError ? (
                        <AlertCircle className="size-4 text-danger" />
                      ) : cedulaInput.length === 10 ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : undefined
                    }
                    className="w-full"
                  >
                    <InputGroupInput
                      id="modal-cedula-coordinador"
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      autoFocus
                      placeholder="Ej: 1715489621"
                      value={cedulaInput}
                      onChange={(e) => {
                        setCedulaInput(e.target.value.replace(/\D/g, ""));
                        setValidationError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleValidate();
                        }
                      }}
                      className="text-xs font-mono tracking-wider"
                      required
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Alerta si no se encontró invitación */}
              {validationError && (
                <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="size-4 text-danger shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-danger uppercase tracking-wider">
                        Invitación no encontrada
                      </h4>
                      <p className="text-xs text-foreground/90 font-medium">
                        {validationError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones rápidos de prueba */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCedulaInput("1715489621");
                  setValidationError(null);
                }}
                className="text-[11px] h-7 px-2.5 gap-1.5 text-secondary hover:bg-secondary/10"
              >
                <Sparkles className="size-3" />
                <span>Demo: Cédula con invitación (1715489621)</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCedulaInput("1712345602");
                  setValidationError(null);
                }}
                className="text-[11px] h-7 px-2.5 gap-1.5 text-secondary hover:bg-secondary/10"
              >
                <Sparkles className="size-3" />
                <span>Demo: Titular DINARP (1712345602)</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCedulaInput("1700000000");
                  setValidationError(
                    "No encontramos una invitación de enrolamiento vigente asociada a este número de cédula."
                  );
                }}
                className="text-[11px] h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="size-3" />
                <span>Demo: Sin invitación</span>
              </Button>
            </div>

            {/* Footer de acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60">
              <Button
                type="button"
                variant="neutral"
                size="default"
                onClick={() => {
                  if (onCancel) {
                    onCancel();
                  } else {
                    onOpenChange(false);
                  }
                }}
                className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                <span>{cancelLabel}</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="default"
                disabled={cedulaInput.length !== 10}
                onClick={() => handleValidate()}
                className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[220px]"
              >
                <Search className="size-4" />
                <span>Confirmar invitación</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
