"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Building2,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { DINARPSpinner } from "@/components/ui/dinarp-spinner";
import { cn } from "@/lib/utils";

interface ValidacionInstitucionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEntidadTipo?: "Publica" | "Privada" | "";
  initialRuc?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onValidated: (data: {
    entidadTipo: "Publica" | "Privada";
    rucEntidad: string;
  }) => void;
}

type ValidationLoadingPhase = "idle" | "validating" | "preloading" | "transitioning";

export function ValidacionInstitucionModal({
  open,
  onOpenChange,
  initialEntidadTipo = "",
  initialRuc = "",
  cancelLabel = "Volver al acceso principal",
  onCancel,
  onValidated,
}: ValidacionInstitucionModalProps) {
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [entidadTipo, setEntidadTipo] = useState<"Publica" | "Privada" | "">(
    initialEntidadTipo
  );
  const [rucEntidad, setRucEntidad] = useState(initialRuc);
  const [rucError, setRucError] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState<ValidationLoadingPhase>("idle");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const modalStepsList: StepperStep[] = [
    {
      id: "paso-1",
      title: "Tipo de institución",
      description: "Naturaleza jurídica",
      icon: Building2,
    },
    {
      id: "paso-2",
      title: "Validación de RUC",
      description: "Verificación de entidad",
      icon: FileText,
    },
  ];

  useEffect(() => {
    if (open) {
      clearTimers();
      setModalStep(1);
      setLoadingPhase("idle");
      setEntidadTipo(initialEntidadTipo || "");
      setRucEntidad(initialRuc || "");
      setRucError(false);
    }
  }, [open, initialEntidadTipo, initialRuc]);

  const handleNextStep = () => {
    if (!entidadTipo) {
      toast.error("Selecciona primero la naturaleza de la institución.");
      return;
    }
    setModalStep(2);
  };

  const handleValidate = () => {
    if (loadingPhase !== "idle") return;
    setRucError(false);

    if (!entidadTipo) {
      toast.error("Selecciona primero la naturaleza de la institución.");
      setModalStep(1);
      return;
    }
    if (!rucEntidad || rucEntidad.length < 13) {
      setRucError(true);
      toast.error("Por favor ingresa un RUC válido de 13 dígitos.");
      return;
    }
    if (rucEntidad === "1111111111111") {
      setRucError(true);
      toast.error(
        "No encontramos una institución asociada a este RUC.\nVerifica el número e inténtalo nuevamente."
      );
      return;
    }
    if (rucEntidad === "2222222222222") {
      setRucError(true);
      toast.error(
        "No pudimos validar el RUC en este momento. Inténtalo nuevamente."
      );
      return;
    }

    // Secuencia animada con el spinner oficial del UI Kit
    clearTimers();
    setLoadingPhase("validating");

    const t1 = setTimeout(() => {
      setLoadingPhase("preloading");
    }, 950);

    const t2 = setTimeout(() => {
      setLoadingPhase("transitioning");
    }, 1900);

    const t3 = setTimeout(() => {
      toast.success("Institución validada y datos precargados correctamente.");
      onValidated({
        entidadTipo,
        rucEntidad,
      });
    }, 2300);

    timersRef.current = [t1, t2, t3];
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
        className={cn(
          "w-[95vw] sm:w-full p-5 sm:p-7 max-h-[92vh] overflow-y-auto transition-all duration-300",
          loadingPhase === "transitioning" && "scale-95 opacity-0"
        )}
      >
        <DialogHeader className="space-y-1.5 text-left pr-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              tone="primary"
              appearance="soft"
              size="sm"
              className="text-[10px] uppercase font-bold tracking-wider"
            >
              ANEXO A · FORMULARIO OFICIAL ARP-R01
            </Badge>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold font-heading flex items-center gap-2 text-foreground">
            <Building2 className="size-5 text-primary shrink-0" />
            <span>Validación de la institución</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Selecciona el tipo de institución e ingresa el RUC para validar la
            información y continuar con el registro.
          </DialogDescription>
        </DialogHeader>

        {isBusy ? (
          /* Estado de carga oficial del UI Kit (DINARPSpinner) con transición hacia el formulario */
          <div className="bg-surface border border-border rounded-2xl p-8 sm:p-10 my-2 shadow-xs flex flex-col items-center justify-center text-center gap-6 animate-fade-in">
            <DINARPSpinner
              size="lg"
              hideLabel
              label={
                loadingPhase === "validating"
                  ? "Validando información institucional"
                  : "Precargando datos de la entidad"
              }
            />

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base sm:text-lg font-bold font-heading text-foreground animate-fade-in">
                {loadingPhase === "validating"
                  ? "Validando información de la institución..."
                  : loadingPhase === "preloading"
                  ? "Precargando datos institucionales en el Anexo A..."
                  : "¡Validación completada! Abriendo formulario..."}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {loadingPhase === "validating"
                  ? `Verificando el RUC ${rucEntidad} (${entidadTipo === "Publica" ? "Institución pública" : "Institución privada"}) en los registros oficiales del SINARP.`
                  : "Obteniendo razón social, dirección y datos de la máxima autoridad para precargar la Sección I."}
              </p>
            </div>

            {/* Indicadores de progreso de validación y precarga */}
            <div className="w-full max-w-sm bg-muted/40 border border-border rounded-xl p-3.5 space-y-2.5 text-left">
              <div className="flex items-center gap-2.5 text-xs">
                {loadingPhase === "validating" ? (
                  <Loader2 className="size-4 text-primary animate-spin shrink-0" />
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
                  Validando RUC ({rucEntidad}) en registros oficiales
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                {loadingPhase === "validating" ? (
                  <div className="size-4 rounded-full border border-border shrink-0" />
                ) : loadingPhase === "preloading" ? (
                  <Loader2 className="size-4 text-primary animate-spin shrink-0" />
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
                  Precargando datos de la institución y máxima autoridad
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Stepper oficial UI kit con iconos (igual al registro principal) */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-xs overflow-x-auto">
              <div className="max-w-lg mx-auto">
                <Stepper
                  steps={modalStepsList}
                  activeStep={modalStep === 1 ? 0 : 1}
                  completedSteps={[
                    ...(modalStep === 2 ? [0] : []),
                    ...(modalStep === 2 && rucEntidad.length === 13 ? [1] : []),
                  ]}
                  onStepClick={(idx) => {
                    if (idx === 0) {
                      setModalStep(1);
                    } else if (idx === 1) {
                      handleNextStep();
                    }
                  }}
                  startIndex={1}
                  stepPrefix="PASO"
                  showBadge={true}
                  variant="default"
                />
              </div>
            </div>

            {/* PASO 1: TIPO DE INSTITUCIÓN */}
            {modalStep === 1 && (
              <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs animate-fade-in">
                {/* Cabecera Sección al ras */}
                <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                      <Building2 className="size-4 sm:size-5 text-primary dark:text-primary-300 shrink-0" />
                      <span>Sección I — Tipo de Institución</span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identificación de la naturaleza jurídica de la entidad solicitante.
                    </p>
                  </div>
                  <Badge
                    tone="primary"
                    appearance="solid"
                    size="sm"
                    className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1"
                  >
                    {entidadTipo === "Privada"
                      ? "ENTIDAD PRIVADA"
                      : entidadTipo === "Publica"
                      ? "ENTIDAD PÚBLICA"
                      : "PASO 1 DE 2"}
                  </Badge>
                </div>

                {/* Campo RadioGroup */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      Naturaleza de la institución{" "}
                      <span className="text-warning">*</span>
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Selecciona una opción para habilitar el siguiente paso.
                    </p>
                  </div>

                  <div className="flex items-center min-h-[38px]">
                    <RadioGroup
                      value={entidadTipo}
                      onValueChange={(val) => {
                        if (val) setEntidadTipo(val as "Publica" | "Privada");
                      }}
                      orientation="horizontal"
                      className="flex flex-wrap items-center gap-6"
                    >
                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                        <RadioGroupItem
                          value="Publica"
                          variant="primary"
                          size="md"
                        />
                        <span>Institución pública</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                        <RadioGroupItem
                          value="Privada"
                          variant="primary"
                          size="md"
                        />
                        <span>Institución privada</span>
                      </label>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: VALIDACIÓN DE RUC */}
            {modalStep === 2 && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
                  {/* Cabecera Sección al ras */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <FileText className="size-4 sm:size-5 text-primary dark:text-primary-300 shrink-0" />
                        <span>Sección II — Validación de RUC</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Verificación del Registro Único de Contribuyentes ante registros oficiales.
                      </p>
                    </div>
                    <Badge
                      tone="primary"
                      appearance="solid"
                      size="sm"
                      className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1"
                    >
                      {entidadTipo === "Privada"
                        ? "ENTIDAD PRIVADA"
                        : "ENTIDAD PÚBLICA"}
                    </Badge>
                  </div>

                  {/* Campo InputGroup RUC */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <Label
                        htmlFor="modal-rucEntidad-0"
                        className="text-xs font-semibold text-foreground"
                      >
                        Número de RUC de la Entidad (13 dígitos){" "}
                        <span className="text-warning">*</span>
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Ingresa el RUC de 13 dígitos.
                      </p>
                    </div>

                    <div className="flex items-center min-h-[42px]">
                      <InputGroup
                        leftIcon={<FileText className="size-4 text-muted-foreground" />}
                        state={
                          rucError
                            ? "error"
                            : rucEntidad.length === 13
                            ? "success"
                            : "default"
                        }
                        rightIcon={
                          rucError ? (
                            <AlertCircle className="size-4 text-danger" />
                          ) : rucEntidad.length === 13 ? (
                            <CheckCircle2 className="size-4 text-success" />
                          ) : undefined
                        }
                        className="w-full"
                      >
                        <InputGroupInput
                          id="modal-rucEntidad-0"
                          value={rucEntidad}
                          maxLength={13}
                          autoFocus
                          onChange={(e) => {
                            setRucError(false);
                            setRucEntidad(e.target.value.replace(/\D/g, ""));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleValidate();
                            }
                          }}
                          placeholder="1760001550001"
                          className="text-xs font-mono tracking-wider"
                          required
                        />
                      </InputGroup>
                    </div>
                  </div>
                </div>

                {/* Botones rápidos de prueba en Paso 2 */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRucEntidad("1760001550001");
                      setRucError(false);
                    }}
                    className="text-[11px] h-7 px-2.5 gap-1.5 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="size-3" />
                    <span>Demo: RUC Válido (1760001550001)</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRucEntidad("1111111111111");
                      setRucError(true);
                      toast.error(
                        "No encontramos una institución asociada a este RUC.\nVerifica el número e inténtalo nuevamente."
                      );
                    }}
                    className="text-[11px] h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles className="size-3" />
                    <span>Demo: RUC No Encontrado</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRucEntidad("2222222222222");
                      setRucError(true);
                      toast.error(
                        "No pudimos validar el RUC en este momento. Inténtalo nuevamente."
                      );
                    }}
                    className="text-[11px] h-7 px-2.5 gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Sparkles className="size-3" />
                    <span>Demo: Error Técnico</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Footer de acciones según paso actual */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60">
              {modalStep === 1 ? (
                <>
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
                    disabled={!entidadTipo}
                    onClick={handleNextStep}
                    className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="neutral"
                    size="default"
                    onClick={() => setModalStep(1)}
                    className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Anterior: Tipo de institución</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="default"
                    onClick={handleValidate}
                    className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[220px]"
                  >
                    <Search className="size-4" />
                    <span>Validar información</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
