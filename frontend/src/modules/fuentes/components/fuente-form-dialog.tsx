"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FuenteStepperInfo, InfoFormData } from "./fuente-stepper-info";
import { FuenteStepperConexion } from "./fuente-stepper-conexion";
import { FuenteStepperEsquema } from "./fuente-stepper-esquema";
import { FuenteStepperResumen } from "./fuente-stepper-resumen";
import { useFuentesStore } from "../data/fuentes-store";
import {
  FuenteDatos,
  ConfiguracionConexion,
  CampoFuente,
  ESQUEMA_MOCK_REGISTRO_CIVIL,
  HomologacionCaso,
} from "../data/fuentes-data";
import {
  Server,
  Building2,
  Sliders,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  Loader2,
  Edit,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface FuenteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuenteAEditar?: FuenteDatos | null;
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
  onSuccess?: (fuenteId: string) => void;
}

const PASOS_MODAL = [
  { id: 0, label: "Información y SLA", sub: "FUE-01", icon: Building2 },
  { id: 1, label: "Conexión Técnica", sub: "FUE-02", icon: Server },
  { id: 2, label: "Esquema y Campos", sub: "FUE-03", icon: Layers },
  { id: 3, label: "Resumen y Envío", sub: "FUE-04", icon: CheckCircle2 },
];

export function FuenteFormDialog({
  open,
  onOpenChange,
  fuenteAEditar,
  currentUser,
  onSuccess,
}: FuenteFormDialogProps) {
  const isEditing = !!fuenteAEditar;
  const { crearFuente, actualizarFuente } = useFuentesStore();

  const institucionPrecargada =
    currentUser?.institution ||
    fuenteAEditar?.institucion_proveedora_nombre ||
    "Dirección General de Registro Civil";
  const coordinadorNombre =
    currentUser?.name || fuenteAEditar?.coordinador_nombre || "Carlos Mendoza";
  const coordinadorId =
    fuenteAEditar?.id_coordinador_registrador || "USR-COORD-001";

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Casos especiales
  const [casoHomologacion, setCasoHomologacion] = useState<HomologacionCaso | null>(null);
  const [hasIncompatibilities, setHasIncompatibilities] = useState(false);

  // Estados del formulario
  const [infoData, setInfoData] = useState<InfoFormData>({
    nombre: "",
    descripcion_fuente: "",
    version_propuesta: "v1.0.0",
    disponibilidad_objetivo: 99.5,
    tiempo_maximo_respuesta_ms: 300,
    modalidades_soportadas: "Ambas modalidades",
    formato_respuesta: "application/json",
    tipo_dato_pruebas: "Sintético",
    parametros_consulta: [
      {
        id_parametro: "PAR-01",
        nombre: "numero_identificacion",
        tipo: "Texto",
        obligatorio: true,
        es_identificador_persona: true,
        operadores_permitidos: ["Igual"],
        restriccion: { patron: "^[0-9]{10}$" },
      },
    ],
  });

  const [conexionData, setConexionData] = useState<ConfiguracionConexion>({
    tipo_conector: "Oracle",
    host: "10.160.4.12",
    puerto: 1521,
    base_datos: "DGRCPRD",
    esquema: "INTEROP_PUB",
    usuario: "usr_dinarp_read",
  });

  const [camposData, setCamposData] = useState<CampoFuente[]>(
    ESQUEMA_MOCK_REGISTRO_CIVIL
  );

  // Inicializar al abrir o cambiar de modo (crear o editar)
  useEffect(() => {
    if (open) {
      if (fuenteAEditar) {
        setInfoData({
          nombre: fuenteAEditar.nombre,
          descripcion_fuente: fuenteAEditar.descripcion_fuente,
          version_propuesta: fuenteAEditar.version_propuesta,
          disponibilidad_objetivo: fuenteAEditar.sla_fuente.disponibilidad_objetivo,
          tiempo_maximo_respuesta_ms: fuenteAEditar.sla_fuente.tiempo_maximo_respuesta_ms,
          modalidades_soportadas: fuenteAEditar.modalidades_soportadas,
          formato_respuesta: fuenteAEditar.formato_respuesta as "application/json" | "application/xml",
          tipo_dato_pruebas: fuenteAEditar.tipo_dato_pruebas,
          parametros_consulta: [...fuenteAEditar.parametros_consulta],
        });
        setConexionData({ ...fuenteAEditar.conexion });
        setCamposData([...fuenteAEditar.campos]);
        setActiveStep(0);
      } else {
        // Reset a nuevo
        setInfoData({
          nombre: "",
          descripcion_fuente: "",
          version_propuesta: "v1.0.0",
          disponibilidad_objetivo: 99.5,
          tiempo_maximo_respuesta_ms: 300,
          modalidades_soportadas: "Ambas modalidades",
          formato_respuesta: "application/json",
          tipo_dato_pruebas: "Sintético",
          parametros_consulta: [
            {
              id_parametro: "PAR-01",
              nombre: "numero_identificacion",
              tipo: "Texto",
              obligatorio: true,
              es_identificador_persona: true,
              operadores_permitidos: ["Igual"],
              restriccion: { patron: "^[0-9]{10}$" },
            },
          ],
        });
        setConexionData({
          tipo_conector: "Oracle",
          host: "10.160.4.12",
          puerto: 1521,
          base_datos: "DGRCPRD",
          esquema: "INTEROP_PUB",
          usuario: "usr_dinarp_read",
        });
        setCamposData(ESQUEMA_MOCK_REGISTRO_CIVIL);
        setActiveStep(0);
      }
      setCasoHomologacion(null);
      setHasIncompatibilities(false);
    }
  }, [open, fuenteAEditar]);

  // Validaciones
  const canProceedFromStep1 =
    infoData.nombre.trim().length > 3 &&
    infoData.descripcion_fuente.trim().length > 10 &&
    infoData.parametros_consulta.length > 0;

  const isStep2BlockedByHomologation =
    !!casoHomologacion && casoHomologacion.estado !== "Homologado";

  const canProceedFromStep2 =
    isEditing ||
    (!isStep2BlockedByHomologation &&
      conexionData.ultima_prueba?.resultado === "Satisfactoria");

  const canProceedFromStep3 =
    camposData.some((c) => c.incluido) && !hasIncompatibilities;

  const handleNext = () => {
    if (activeStep === 0) {
      if (!canProceedFromStep1) {
        toast.error("Complete los campos obligatorios (FUE-01)", {
          description:
            "Debe ingresar nombre descriptivo, descripción funcional y al menos un parámetro de consulta.",
        });
        return;
      }
    } else if (activeStep === 1) {
      if (isStep2BlockedByHomologation) {
        toast.warning("Paso bloqueado por homologación técnica (FUE-12)", {
          description: `El caso ${casoHomologacion.id_caso} está en revisión por TI.`,
        });
        return;
      }
      if (!canProceedFromStep2) {
        toast.error("Prueba técnica requerida (FUE-02)", {
          description:
            "Debe ejecutar la prueba de conexión y obtener resultado satisfactorio antes de continuar.",
        });
        return;
      }
    } else if (activeStep === 2) {
      if (hasIncompatibilities) {
        toast.error("Conversiones incompatibles en el esquema (FUE-03)", {
          description: "Corrija las reglas marcadas en rojo antes de pasar al resumen.",
        });
        return;
      }
      if (!canProceedFromStep3) {
        toast.error("Seleccione al menos un campo a exponer (FUE-03)", {
          description: "Debe incluir al menos un atributo del esquema detectado.",
        });
        return;
      }
    }

    setActiveStep((prev) => Math.min(prev + 1, PASOS_MODAL.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Guardar (Borrador o Edición)
  const handleGuardar = (enviarInmediato: boolean = false) => {
    if (!infoData.nombre.trim()) {
      toast.error("Nombre de la fuente obligatorio", {
        description: "Ingrese un nombre descriptivo para identificar la fuente.",
      });
      setActiveStep(0);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      if (isEditing && fuenteAEditar) {
        // Actualizar fuente existente
        const ok = actualizarFuente(
          fuenteAEditar.id,
          {
            nombre: infoData.nombre.trim(),
            descripcion_fuente: infoData.descripcion_fuente.trim(),
            version_propuesta: infoData.version_propuesta.trim() || fuenteAEditar.version_propuesta,
            sla_fuente: {
              disponibilidad_objetivo: Number(infoData.disponibilidad_objetivo) || 99.5,
              tiempo_maximo_respuesta_ms: Number(infoData.tiempo_maximo_respuesta_ms) || 300,
            },
            modalidades_soportadas: infoData.modalidades_soportadas,
            formato_respuesta: infoData.formato_respuesta,
            tipo_dato_pruebas: infoData.tipo_dato_pruebas,
            parametros_consulta: infoData.parametros_consulta,
            conexion: conexionData,
            campos: camposData,
            ...(enviarInmediato ? { estado: "EN_REVISION" } : {}),
          },
          {
            actor: coordinadorNombre,
            rol: "Coordinador SINARP",
            accion: enviarInmediato
              ? "Actualización y envío a revisión (FUE-03)"
              : "Edición de configuración técnica",
            observaciones: enviarInmediato
              ? "Configuración técnica actualizada y enviada a revisión de Gestión."
              : "Cambios en parámetros y esquema guardados satisfactoriamente.",
          }
        );

        setSubmitting(false);

        if (ok) {
          toast.success(
            enviarInmediato
              ? "Fuente remitida a revisión de Gestión (FUE-03)"
              : "Cambios de la fuente guardados correctamente"
          );
          onOpenChange(false);
          if (onSuccess) onSuccess(fuenteAEditar.id);
        } else {
          toast.error("Error al actualizar la fuente");
        }
      } else {
        // Crear nueva fuente
        let estadoInicial: any = undefined;
        if (casoHomologacion && casoHomologacion.estado !== "Homologado") {
          estadoInicial = "PENDIENTE_HOMOLOGACION";
        } else if (hasIncompatibilities) {
          estadoInicial = "ESQUEMA_PENDIENTE_CORRECCION";
        }

        const nueva = crearFuente({
          nombre: infoData.nombre,
          descripcion_fuente: infoData.descripcion_fuente,
          version_propuesta: infoData.version_propuesta,
          id_institucion_proveedora: "INST-DGRC-001",
          institucion_proveedora_nombre: institucionPrecargada,
          id_coordinador_registrador: coordinadorId,
          coordinador_nombre: coordinadorNombre,
          disponibilidad_objetivo: infoData.disponibilidad_objetivo,
          tiempo_maximo_respuesta_ms: infoData.tiempo_maximo_respuesta_ms,
          modalidades_soportadas: infoData.modalidades_soportadas,
          formato_respuesta: infoData.formato_respuesta,
          tipo_dato_pruebas: infoData.tipo_dato_pruebas,
          parametros_consulta: infoData.parametros_consulta,
          conexion: conexionData,
          campos: camposData,
          enviarInmediato: enviarInmediato && !hasIncompatibilities,
        });

        setSubmitting(false);

        if (enviarInmediato && !hasIncompatibilities) {
          toast.success("Fuente incorporada y enviada a revisión (FUE-03)", {
            description: `Expediente ${nueva.id} remitido al equipo de Gestión.`,
          });
        } else {
          toast.success("Borrador de fuente registrado exitosamente", {
            description: `Expediente ${nueva.id} creado en configuración.`,
          });
        }

        onOpenChange(false);
        if (onSuccess) onSuccess(nueva.id);
      }
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="4xl" variant="standard" className="p-0 gap-0 max-h-[92vh] flex flex-col">
        {/* Cabecera Institucional */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border bg-surface-subtle/30 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              {isEditing ? <Edit className="size-5" /> : <Plus className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground">
                  {isEditing
                    ? `Editar fuente: ${fuenteAEditar.nombre}`
                    : "Incorporar nueva fuente de información"}
                </DialogTitle>
                {isEditing && (
                  <Badge tone="primary" appearance="soft" size="sm">
                    {fuenteAEditar.id}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Versión: ${fuenteAEditar.version_propuesta} · Estado: ${fuenteAEditar.estado} · Modificación de parámetros y esquema.`
                  : "Flujo BN-06 (FUE-01 / FUE-02 / FUE-03) · Registro técnico, conexión privada y catálogo expuesto."}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Barra de Navegación por Pasos / Secciones */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-border bg-surface flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 sm:gap-2 w-full justify-between sm:justify-start">
            {PASOS_MODAL.map((paso) => {
              const Icon = paso.icon;
              const isActive = activeStep === paso.id;
              const isPast = activeStep > paso.id;
              return (
                <button
                  key={paso.id}
                  type="button"
                  onClick={() => setActiveStep(paso.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : isPast
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      isActive
                        ? "bg-primary-foreground text-primary"
                        : isPast
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="size-3.5" /> : paso.id + 1}
                  </span>
                  <span>{paso.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuerpo del Formulario con Scroll Suave */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {activeStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperInfo
                formData={infoData}
                onChange={(updates) => setInfoData((prev) => ({ ...prev, ...updates }))}
                institucionPrecargada={institucionPrecargada}
              />
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperConexion
                conexion={conexionData}
                onChange={(c) => setConexionData(c)}
                onPruebaSatisfactoria={(evidencia) => {
                  setConexionData((prev) => ({
                    ...prev,
                    ultima_prueba: evidencia,
                  }));
                }}
                onOrigenNoSoportado={(caso) => {
                  setCasoHomologacion(caso);
                }}
                nombreFuente={infoData.nombre || "Fuente Institucional"}
                institucionNombre={institucionPrecargada}
              />
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperEsquema
                campos={camposData}
                onChange={(c) => setCamposData(c)}
                onHasIncompatibilitiesChange={(errs) => setHasIncompatibilities(errs)}
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperResumen
                info={infoData}
                conexion={conexionData}
                campos={camposData}
                institucionPrecargada={institucionPrecargada}
              />
            </div>
          )}
        </div>

        {/* Pie de Acciones / CTAs */}
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-surface-subtle/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Button>

            {activeStep > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Anterior</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            {/* Guardar borrador / cambios intermedios */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleGuardar(false)}
              className="text-xs gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span>{isEditing ? "Guardar cambios" : "Guardar borrador"}</span>
            </Button>

            {/* Siguiente o Enviar a revisión */}
            {activeStep < PASOS_MODAL.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                className="text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Siguiente</span>
                <ArrowRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={submitting || hasIncompatibilities || isStep2BlockedByHomologation}
                onClick={() => handleGuardar(true)}
                className="text-xs gap-2 cursor-pointer shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                <span>Enviar a revisión de Gestión</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
