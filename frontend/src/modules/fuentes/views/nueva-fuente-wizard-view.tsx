"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { Card } from "@/components/ui/card";
import { Stepper, Step } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FuenteStepperInfo, InfoFormData } from "../components/fuente-stepper-info";
import { FuenteStepperConexion } from "../components/fuente-stepper-conexion";
import { FuenteStepperEsquema } from "../components/fuente-stepper-esquema";
import { FuenteStepperResumen } from "../components/fuente-stepper-resumen";
import { useFuentesStore } from "../data/fuentes-store";
import {
  ConfiguracionConexion,
  CampoFuente,
  ESQUEMA_MOCK_REGISTRO_CIVIL,
  HomologacionCaso,
} from "../data/fuentes-data";
import {
  Server,
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

interface NuevaFuenteWizardViewProps {
  currentUser?: {
    name?: string;
    role?: string;
    institution?: string;
  };
}

const WIZARD_STEPS: Step[] = [
  { id: "1", title: "Información", description: "Datos y SLA (FUE-01)" },
  { id: "2", title: "Conexión", description: "Prueba técnica (FUE-02)" },
  { id: "3", title: "Esquema", description: "Campos expuestos (FUE-03)" },
  { id: "4", title: "Resumen", description: "Envío a Gestión" },
];

export function NuevaFuenteWizardView({ currentUser }: NuevaFuenteWizardViewProps) {
  const router = useRouter();
  const { crearFuente } = useFuentesStore();

  const institucionPrecargada =
    currentUser?.institution || "Dirección General de Registro Civil";
  const coordinadorNombre = currentUser?.name || "Carlos Mendoza";
  const coordinadorId = "USR-COORD-001";

  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Caso especial: Origen no soportado (FUE-12)
  const [casoHomologacion, setCasoHomologacion] = useState<HomologacionCaso | null>(null);

  // Caso especial: Incompatibilidades en conversiones (FUE-03)
  const [hasIncompatibilities, setHasIncompatibilities] = useState(false);

  // Estado del Paso 1: Info
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

  // Estado del Paso 2: Conexión
  const [conexionData, setConexionData] = useState<ConfiguracionConexion>({
    tipo_conector: "Oracle",
    host: "10.160.4.12",
    puerto: 1521,
    base_datos: "DGRCPRD",
    esquema: "INTEROP_PUB",
    usuario: "usr_dinarp_read",
  });

  // Estado del Paso 3: Campos detectados
  const [camposData, setCamposData] = useState<CampoFuente[]>(
    ESQUEMA_MOCK_REGISTRO_CIVIL
  );

  // Validaciones por paso
  const canProceedFromStep1 =
    infoData.nombre.trim().length > 3 &&
    infoData.descripcion_fuente.trim().length > 10 &&
    infoData.parametros_consulta.length > 0;

  const isStep2BlockedByHomologation = !!casoHomologacion && casoHomologacion.estado !== "Homologado";

  const canProceedFromStep2 =
    !isStep2BlockedByHomologation &&
    conexionData.ultima_prueba?.resultado === "Satisfactoria";

  const canProceedFromStep3 =
    camposData.some((c) => c.incluido) && !hasIncompatibilities;

  const handleNext = () => {
    if (activeStep === 0) {
      if (!canProceedFromStep1) {
        toast.error("Complete los campos obligatorios (FUE-01)", {
          description: "Debe ingresar nombre descriptivo, descripción funcional y al menos un parámetro de consulta.",
        });
        return;
      }
    } else if (activeStep === 1) {
      if (isStep2BlockedByHomologation) {
        toast.warning("Paso bloqueado por homologación técnica (FUE-12)", {
          description: `El caso ${casoHomologacion.id_caso} está en revisión por el Equipo de TI. El asistente se mantendrá bloqueado hasta su certificación.`,
        });
        return;
      }
      if (!canProceedFromStep2) {
        toast.error("Prueba técnica requerida (FUE-02)", {
          description: "Debe ejecutar la prueba de conexión y obtener resultado satisfactorio antes de continuar.",
        });
        return;
      }
    } else if (activeStep === 2) {
      if (hasIncompatibilities) {
        toast.error("Conversiones incompatibles en el esquema (FUE-03)", {
          description: "Debe corregir las reglas de normalización marcadas en rojo antes de pasar al resumen.",
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

    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps([...completedSteps, activeStep]);
    }
    setActiveStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalizar = (enviarInmediato: boolean) => {
    setIsSubmitting(true);

    setTimeout(() => {
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

      setIsSubmitting(false);

      if (enviarInmediato && !hasIncompatibilities) {
        toast.success("Fuente enviada a revisión de Gestión (FUE-03)", {
          description: `La fuente ${nueva.id} se encuentra en estado 'En revisión'. El equipo de Gestión procederá con la clasificación de campos (FUE-04).`,
        });
      } else {
        toast.success("Borrador de fuente guardado", {
          description: `La fuente ${nueva.id} quedó registrada. Puede continuar su configuración en cualquier momento.`,
        });
      }

      router.push(`/fuentes/${nueva.id}`);
    }, 700);
  };

  return (
    <WireframeDashboardLayout
      activeMenu="fuentes"
      currentUser={currentUser}
      breadcrumbs={[
        { label: "Fuentes de información", href: "/fuentes" },
        { label: "Nueva fuente" },
      ]}
    >
      <main className="w-full pr-3 pl-2 pb-3 pt-1.5 flex-1 min-h-0 flex flex-col overflow-hidden">
        <Card
          className="bg-surface rounded-2xl border border-border shadow-xs flex-1 min-h-0 overflow-hidden flex flex-col my-0"
          innerClassName="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 w-full"
        >
          {/* Header del Asistente */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/fuentes">
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading font-extrabold text-2xl tracking-tight text-primary">
                  Incorporar y configurar nueva fuente
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="size-3.5 text-primary" />
                  {institucionPrecargada} · Flujo BN-06 (FUE-01 → FUE-03)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isStep2BlockedByHomologation && (
                <Badge tone="warning" appearance="soft" size="sm" className="gap-1">
                  <Cpu className="size-3" /> FUE-12 Pendiente
                </Badge>
              )}
              <Badge tone="primary" appearance="soft" size="sm">
                Paso {activeStep + 1} de {WIZARD_STEPS.length}
              </Badge>
            </div>
          </div>

          {/* Stepper Visual con estados de paso */}
          <div className="bg-surface p-4 rounded-xl border border-border shadow-xs">
            <Stepper
              steps={WIZARD_STEPS}
              activeStep={activeStep}
              completedSteps={completedSteps}
              onStepClick={(stepIdx) => {
                if (completedSteps.includes(stepIdx) || stepIdx <= activeStep) {
                  setActiveStep(stepIdx);
                }
              }}
            />
          </div>

          {/* Contenido Dinámico del Paso */}
          <div className="min-h-[400px]">
            {activeStep === 0 && (
              <FuenteStepperInfo
                formData={infoData}
                onChange={(updates) => setInfoData((prev) => ({ ...prev, ...updates }))}
                institucionPrecargada={institucionPrecargada}
              />
            )}

            {activeStep === 1 && (
              <FuenteStepperConexion
                conexion={conexionData}
                onChange={setConexionData}
                nombreFuente={infoData.nombre || "Nueva Fuente"}
                institucionNombre={institucionPrecargada}
                onOrigenNoSoportado={(caso) => {
                  setCasoHomologacion(caso);
                }}
              />
            )}

            {activeStep === 2 && (
              <FuenteStepperEsquema
                campos={camposData}
                onChange={setCamposData}
                onHasIncompatibilitiesChange={setHasIncompatibilities}
              />
            )}

            {activeStep === 3 && (
              <FuenteStepperResumen
                info={infoData}
                conexion={conexionData}
                campos={camposData}
                institucionPrecargada={institucionPrecargada}
              />
            )}
          </div>

          {/* Barra de Acciones de Navegación del Wizard */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-auto">
            <div>
              {activeStep > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="gap-2 cursor-pointer h-9"
                >
                  <ArrowLeft className="size-4" />
                  <span>Anterior</span>
                </Button>
              ) : (
                <Link href="/fuentes">
                  <Button variant="ghost" size="sm" className="text-muted-foreground h-9 cursor-pointer">
                    <span>Cancelar</span>
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {activeStep === 3 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFinalizar(false)}
                    disabled={isSubmitting}
                    className="gap-2 h-9 cursor-pointer"
                  >
                    <Save className="size-4" />
                    <span>Guardar borrador</span>
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleFinalizar(true)}
                    disabled={isSubmitting || hasIncompatibilities}
                    className="gap-2 shadow-xs h-9 cursor-pointer"
                  >
                    <Send className="size-4" />
                    <span>Enviar a revisión de Gestión</span>
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 1 && isStep2BlockedByHomologation) ||
                    (activeStep === 2 && hasIncompatibilities)
                  }
                  className="gap-2 shadow-xs h-9 cursor-pointer"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </WireframeDashboardLayout>
  );
}
