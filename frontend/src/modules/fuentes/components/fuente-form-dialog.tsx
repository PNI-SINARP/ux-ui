"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
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
  FileEdit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

interface FuenteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fuenteAEditar?: FuenteDatos | null;
  initialStep?: number;
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    roleTitle?: string;
    institution?: string;
    cedula?: string;
  };
  onSuccess?: (fuenteId: string) => void;
}

const PASOS_MODAL = [
  { id: 0, label: "FUE-01: Metadatos", sub: "Identificación y SLA", icon: Building2 },
  { id: 1, label: "FUE-02: Conexión", sub: "Conector y prueba técnica", icon: Server },
  { id: 2, label: "FUE-03: Esquema", sub: "Atributos y normalización", icon: Layers },
  { id: 3, label: "FUE-04: Declaración", sub: "Revisión y envío", icon: CheckCircle2 },
];

const PASOS_MODAL_STEPS: StepperStep[] = [
  { id: "paso-1", title: "FUE-01: Metadatos", description: "Identificación y SLA", icon: Building2 },
  { id: "paso-2", title: "FUE-02: Conexión", description: "Conector y prueba técnica", icon: Server },
  { id: "paso-3", title: "FUE-03: Esquema", description: "Atributos y normalización", icon: Layers },
  { id: "paso-4", title: "FUE-04: Declaración", description: "Revisión y envío", icon: CheckCircle2 },
];

export function FuenteFormDialog({
  open,
  onOpenChange,
  fuenteAEditar,
  initialStep = 0,
  currentUser,
  onSuccess,
}: FuenteFormDialogProps) {
  const isEditing = !!fuenteAEditar;
  const { crearFuente, actualizarFuente } = useFuentesStore();
  const { activeUser } = useAuthStore();
  const effectiveUser = currentUser || activeUser;
  const roleTitle = (effectiveUser?.roleTitle || "").toLowerCase();
  const roleName = (effectiveUser?.role || "").toLowerCase();
  const isCoordinadorConsumidor =
    roleTitle.includes("consumidor") ||
    roleTitle.includes("requirente") ||
    roleName.includes("consumidor") ||
    effectiveUser?.cedula === "1712345678";

  const institucionPrecargada =
    effectiveUser?.institution ||
    fuenteAEditar?.institucion_proveedora_nombre ||
    (isCoordinadorConsumidor ? "Ministerio de Educación" : "Dirección General de Registro Civil");
  const coordinadorNombre =
    effectiveUser?.name ||
    fuenteAEditar?.coordinador_nombre ||
    (isCoordinadorConsumidor ? "Andrea López (MinEduc)" : "Carlos Mendoza");
  const coordinadorId =
    fuenteAEditar?.id_coordinador_registrador ||
    effectiveUser?.id ||
    effectiveUser?.cedula ||
    (isCoordinadorConsumidor ? "1712345678" : "USR-COORD-001");

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [borradorEstado, setBorradorEstado] = useState<"borrador" | "actualizado">("borrador");
  const [horaActualizacion, setHoraActualizacion] = useState<string | null>(null);

  const marcarModificado = () => {
    setBorradorEstado("actualizado");
    setHoraActualizacion(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );
  };

  const handleLlenarRapido = () => {
    setInfoData({
      nombre: "Registro Nacional de Identificación Ciudadana (DGRC)",
      descripcion_fuente:
        "Servicio interoperable para consulta, validación y certificación de datos de identificación civil, filiación y estado civil según lineamientos técnicos DINARP TEC-00/PAR-07.",
      version_propuesta: "v1.2.0",
      disponibilidad_objetivo: 99.8,
      tiempo_maximo_respuesta_ms: 250,
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
        {
          id_parametro: "PAR-02",
          nombre: "codigo_dactilar",
          tipo: "Texto",
          obligatorio: false,
          es_identificador_persona: false,
          operadores_permitidos: ["Igual"],
          restriccion: { patron: "^[A-Z0-9]{10}$" },
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
      ultima_prueba: {
        id_prueba: `PRV-${Date.now().toString().slice(-6)}`,
        instante_prueba: new Date().toISOString(),
        latencia_ms: 185,
        resultado: "Satisfactoria",
        huella_muestra: "sha256:4a8c903bf2e1b98a47",
        version_conector: "v19c Enterprise",
        etapas: [
          {
            etapa: "Resolución de red y puerto 1521",
            estado: "ok",
            detalle: "Host 10.160.4.12 alcanzable vía VPN DINARP",
          },
          {
            etapa: "Autenticación de credenciales",
            estado: "ok",
            detalle: "Usuario usr_dinarp_read autenticado correctamente",
          },
          {
            etapa: "Permisos sobre esquema INTEROP_PUB",
            estado: "ok",
            detalle: "Acceso de lectura confirmado en esquema de publicación",
          },
        ],
      },
    });

    setCamposData(
      ESQUEMA_MOCK_REGISTRO_CIVIL.map((c) => ({
        ...c,
        incluido: true,
      }))
    );

    marcarModificado();

    toast.info("Datos de prueba cargados", {
      description: "Formulario completado con información técnica válida.",
    });
  };

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
        setSavedId(fuenteAEditar.id);
        setBorradorEstado("borrador");
        setHoraActualizacion(null);
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
        setActiveStep(initialStep ?? 0);
      } else {
        setSavedId(null);
        setBorradorEstado("borrador");
        setHoraActualizacion(null);
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
        setActiveStep(isCoordinadorConsumidor ? 0 : (initialStep ?? 0));
      }
      setCasoHomologacion(null);
      setHasIncompatibilities(false);
    }
  }, [open, fuenteAEditar, initialStep, isCoordinadorConsumidor]);

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
        toast.error("Complete los campos obligatorios", {
          description:
            "Debe ingresar nombre descriptivo, descripción funcional y al menos un parámetro de consulta.",
        });
        return;
      }
    } else if (activeStep === 1) {
      if (isStep2BlockedByHomologation) {
        toast.warning("Paso bloqueado por homologación técnica", {
          description: `El caso ${casoHomologacion.id_caso} está en revisión por TI.`,
        });
        return;
      }
      if (!canProceedFromStep2) {
        toast.error("Prueba técnica requerida", {
          description:
            "Debe ejecutar la prueba de conexión y obtener resultado satisfactorio antes de continuar.",
        });
        return;
      }
    } else if (activeStep === 2) {
      if (hasIncompatibilities) {
        toast.error("Conversiones incompatibles en el esquema", {
          description: "Corrija las reglas marcadas en rojo antes de pasar al resumen.",
        });
        return;
      }
      if (!canProceedFromStep3) {
        toast.error("Seleccione al menos un campo a exponer", {
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
    // Validaciones estrictas FUE-01
    if (!infoData.nombre.trim() || infoData.nombre.trim().length < 4) {
      toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
        description: "Código de referencia: ERR-FUE01-NOMBRE. El nombre de la fuente debe tener al menos 4 caracteres.",
      });
      setActiveStep(0);
      return;
    }

    if (!infoData.descripcion_fuente.trim() || infoData.descripcion_fuente.trim().length < 10) {
      toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
        description: "Código de referencia: ERR-FUE01-DESCRIPCION. Ingrese una descripción funcional según TEC-00/PAR-07.",
      });
      setActiveStep(0);
      return;
    }

    if (infoData.disponibilidad_objetivo <= 0 || infoData.disponibilidad_objetivo > 100) {
      toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
        description: "Código de referencia: ERR-FUE01-SLA-DISP. La disponibilidad objetivo debe ser un decimal entre 0 y 100%.",
      });
      setActiveStep(0);
      return;
    }

    if (infoData.tiempo_maximo_respuesta_ms <= 0) {
      toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
        description: "Código de referencia: ERR-FUE01-SLA-TIEMPO. El tiempo máximo de respuesta debe ser un entero positivo.",
      });
      setActiveStep(0);
      return;
    }

    if (infoData.parametros_consulta.length === 0) {
      toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
        description: "Código de referencia: ERR-FUE01-PARAMETROS. Debe registrar al menos un parámetro de consulta con operador compatible.",
      });
      setActiveStep(0);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const targetId = savedId || (isEditing && fuenteAEditar ? fuenteAEditar.id : null);

      if (targetId) {
        // Actualizar borrador existente
        const ok = actualizarFuente(
          targetId,
          {
            nombre: infoData.nombre.trim(),
            descripcion_fuente: infoData.descripcion_fuente.trim(),
            version_propuesta: infoData.version_propuesta.trim() || (fuenteAEditar?.version_propuesta ?? "v1.0.0"),
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
              ? "Actualización y envío a revisión"
              : "Edición de borrador técnico",
            observaciones: enviarInmediato
              ? "Configuración técnica actualizada y enviada a revisión de Gestión."
              : "Borrador de fuente y parámetros actualizado.",
          }
        );

        setSubmitting(false);

        if (ok) {
          marcarModificado();
          if (isCoordinadorConsumidor) {
            toast.success("Borrador actualizado", {
              description: `ID: ${targetId} — Siguiente paso: FUE-02.`,
            });
            onOpenChange(false);
            if (onSuccess) onSuccess(targetId);
            return;
          }

          if (enviarInmediato) {
            toast.success("Fuente incorporada y enviada a revisión", {
              description: `Expediente ${targetId} remitido al equipo de Gestión.`,
            });
            onOpenChange(false);
            if (onSuccess) onSuccess(targetId);
          } else {
            toast.success("Borrador actualizado", {
              description: `ID: ${targetId} — Cambios guardados satisfactoriamente.`,
            });
          }
        } else {
          toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
            description: "Código de referencia: ERR-FUE01-PERSISTENCIA",
          });
        }
      } else {
        // Crear nuevo borrador (FUE-01)
        try {
          let estadoInicial: any = undefined;
          if (!isCoordinadorConsumidor) {
            if (casoHomologacion && casoHomologacion.estado !== "Homologado") {
              estadoInicial = "PENDIENTE_HOMOLOGACION";
            } else if (hasIncompatibilities) {
              estadoInicial = "ESQUEMA_PENDIENTE_CORRECCION";
            }
          }

          const nueva = crearFuente({
            nombre: infoData.nombre.trim(),
            descripcion_fuente: infoData.descripcion_fuente.trim(),
            version_propuesta: infoData.version_propuesta.trim() || "v1.0.0",
            id_institucion_proveedora: isCoordinadorConsumidor ? "INST-MINEDUC-002" : "INST-DGRC-001",
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
            enviarInmediato: !isCoordinadorConsumidor && enviarInmediato && !hasIncompatibilities,
          });

          setSavedId(nueva.id);
          marcarModificado();
          setSubmitting(false);

          if (isCoordinadorConsumidor) {
            // Criterio exacto FUE-01:
            // "Tras guardar muestra «Borrador creado» con ID y siguiente paso FUE-02."
            toast.success("Borrador creado", {
              description: `ID: ${nueva.id} — Siguiente paso: FUE-02.`,
            });
            onOpenChange(false);
            if (onSuccess) onSuccess(nueva.id);
            return;
          }

          if (enviarInmediato && !hasIncompatibilities) {
            toast.success("Fuente incorporada y enviada a revisión", {
              description: `Expediente ${nueva.id} remitido al equipo de Gestión.`,
            });
            onOpenChange(false);
            if (onSuccess) onSuccess(nueva.id);
          } else {
            toast.success("Borrador creado", {
              description: `ID: ${nueva.id} — Siguiente paso: Configurar y probar conexión.`,
            });
            if (activeStep === 0) {
              setActiveStep(1);
            }
            if (onSuccess) onSuccess(nueva.id);
          }
        } catch (e) {
          setSubmitting(false);
          toast.error("No se creó la fuente; revisa el error e inténtalo de nuevo", {
            description: "Código de referencia: ERR-FUE01-PERSISTENCIA",
          });
        }
      }
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="7xl"
        variant="standard"
        className="p-0 gap-0 max-h-[88vh] sm:max-h-[90vh] flex flex-col w-[96vw] max-w-7xl 2xl:max-w-[1440px] overflow-hidden"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest?.('[data-quick-fill-btn="true"]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target?.closest?.('[data-quick-fill-btn="true"]')) {
            e.preventDefault();
          }
        }}
      >
        {/* Cabecera Institucional con Badges de Rol y Borrador Dinámico (FUE-01) */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border bg-surface-subtle/30 flex items-start justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              {isEditing || savedId ? <Edit className="size-5" /> : <Plus className="size-5" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="font-heading font-extrabold text-base sm:text-lg text-foreground">
                  {isCoordinadorConsumidor
                    ? isEditing
                      ? `Editar borrador de fuente: ${fuenteAEditar.nombre}`
                      : "Crear borrador de fuente"
                    : isEditing
                    ? `Editar fuente: ${fuenteAEditar.nombre}`
                    : savedId
                    ? `Borrador en curso: ${infoData.nombre || "Nueva fuente"}`
                    : "Incorporar y registrar fuente"}
                </DialogTitle>

                {/* Badge Dinámico de Borrador (FUE-01) */}
                {borradorEstado === "borrador" ? (
                  <Badge tone="warning" appearance="soft" size="sm" className="font-semibold normal-case tracking-normal gap-1 shadow-2xs">
                    <FileEdit className="size-3" /> Borrador
                  </Badge>
                ) : (
                  <Badge tone="success" appearance="soft" size="sm" className="font-semibold normal-case tracking-normal gap-1 animate-in fade-in duration-200 shadow-2xs">
                    <CheckCircle2 className="size-3 text-success" /> Borrador actualizado
                    {horaActualizacion && (
                      <span className="text-[10px] font-mono opacity-80 ml-0.5">({horaActualizacion})</span>
                    )}
                  </Badge>
                )}

                {/* ID de la Fuente (si ya está persistida o en edición) */}
                {(savedId || (isEditing && fuenteAEditar?.id)) && (
                  <Badge tone="neutral" appearance="outline" size="sm" className="font-mono text-xs font-bold text-foreground">
                    {savedId || fuenteAEditar?.id}
                  </Badge>
                )}

                {/* Botón rápido demo en cabecera */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleLlenarRapido}
                  className="h-6 px-2.5 text-[11px] font-semibold text-primary hover:bg-primary/10 gap-1 rounded-full cursor-pointer"
                  title="Precargar datos de prueba válidos"
                >
                  <Sparkles className="size-3 text-primary" />
                  <span>Demo</span>
                </Button>
              </div>

              <DialogDescription className="text-xs text-muted-foreground">
                {isCoordinadorConsumidor
                  ? `Institución requirente: ${institucionPrecargada} · Registro de responsable, descripción, SLA, versión y campos propuestos.`
                  : savedId || isEditing
                  ? `Expediente: ${savedId || fuenteAEditar?.id} · Coordinador: ${coordinadorNombre} · Versión: ${infoData.version_propuesta} · Borrador técnico de interoperabilidad`
                  : `Institución proveedora: ${institucionPrecargada} · Registro de responsable, descripción, SLA, versión y campos propuestos.`}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Stepper Oficial UI Kit / Banner FUE-01 */}
        <div className="px-4 sm:px-6 pt-4 pb-1 shrink-0">
          {isCoordinadorConsumidor ? (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                  <Server className="size-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-foreground">
                    Registro y preparación de borrador de fuente
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro de responsable, descripción técnica, SLA versionado y parámetros de consulta para la Entidad Requirente.
                  </p>
                </div>
              </div>
              <Badge tone="info" appearance="soft" size="sm" className="font-semibold">
                Entidad Requirente
              </Badge>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                    <Server className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">
                      {isEditing ? `Edición técnica: ${fuenteAEditar?.nombre}` : "Incorporación técnica de fuente de datos"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {PASOS_MODAL_STEPS[activeStep]?.description || "Flujo técnico de interoperabilidad institucional."}
                    </p>
                  </div>
                </div>
                <Badge tone="primary" appearance="soft" size="sm" className="font-semibold">
                  Entidad Emisora (Proveedor)
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <Stepper
                  steps={PASOS_MODAL_STEPS}
                  activeStep={activeStep}
                  variant="default"
                  stepPrefix="PASO"
                  showBadge={true}
                  className="min-w-[500px] sm:min-w-0"
                  onStepClick={(index) => {
                    setActiveStep(index);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Cuerpo del Formulario con Scroll Suave */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {(isCoordinadorConsumidor || activeStep === 0) && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperInfo
                formData={infoData}
                onChange={(updates) => {
                  setInfoData((prev) => ({ ...prev, ...updates }));
                  marcarModificado();
                }}
                institucionPrecargada={institucionPrecargada}
                coordinadorNombre={coordinadorNombre}
                coordinadorId={coordinadorId}
                isCoordinadorConsumidor={isCoordinadorConsumidor}
              />
            </div>
          )}

          {!isCoordinadorConsumidor && activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperConexion
                conexion={conexionData}
                onChange={(c) => {
                  setConexionData(c);
                  marcarModificado();
                }}
                onPruebaSatisfactoria={(evidencia) => {
                  setConexionData((prev) => ({
                    ...prev,
                    ultima_prueba: evidencia,
                  }));
                  marcarModificado();
                }}
                onOrigenNoSoportado={(caso) => {
                  setCasoHomologacion(caso);
                  marcarModificado();
                }}
                nombreFuente={infoData.nombre || "Fuente Institucional"}
                institucionNombre={institucionPrecargada}
              />
            </div>
          )}

          {!isCoordinadorConsumidor && activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <FuenteStepperEsquema
                campos={camposData}
                onChange={(c) => {
                  setCamposData(c);
                  marcarModificado();
                }}
                onHasIncompatibilitiesChange={(errs) => {
                  setHasIncompatibilities(errs);
                  marcarModificado();
                }}
              />
            </div>
          )}

          {!isCoordinadorConsumidor && activeStep === 3 && (
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
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-surface-subtle/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          {isCoordinadorConsumidor ? (
            <div className="flex items-center gap-2 w-full justify-between sm:justify-end">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={submitting}
                onClick={() => handleGuardar(false)}
                className="text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                {submitting ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>{isEditing ? "Guardar cambios en borrador" : "Guardar borrador"}</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <Button
                  type="button"
                  variant="neutral"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancelar
                </Button>

                {activeStep > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
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
                  variant="secondary"
                  size="sm"
                  disabled={submitting}
                  onClick={() => handleGuardar(false)}
                  className="text-xs gap-1.5 cursor-pointer shadow-xs"
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
            </>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Botón flotante exterior en la esquina inferior derecha de la pantalla (FUE-01) */}
      <DialogPortal>
        <div className="fixed bottom-6 right-6 z-[60] pointer-events-auto">
          <Button
            type="button"
            data-quick-fill-btn="true"
            variant="primary"
            size="sm"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleLlenarRapido();
            }}
            className="rounded-full shadow-2xl gap-2 text-xs font-semibold px-4 py-2.5 hover:scale-105 active:scale-95 transition-all bg-primary text-primary-foreground border-2 border-background/80 hover:bg-primary cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
            title="Llenar rápidamente todos los campos con datos válidos de prueba"
          >
            <Sparkles className="size-3.5 text-amber-300 animate-pulse shrink-0" />
            <span>Llenar rápido</span>
          </Button>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
