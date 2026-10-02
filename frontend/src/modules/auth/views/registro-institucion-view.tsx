"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  FileText,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Home,
  Check,
  Search,
  MapPin,
  Calendar,
  Info,
  Download,
  RefreshCw,
  XCircle,
  Eye,
  Send,
  ExternalLink,
  AlertTriangle,
  Lock,
  ArrowRightCircle,
  ChevronUp,
  ChevronDown,
  FileSignature
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardDescription, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { FileUpload } from "@/components/ui/file-upload";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, getAssetPath } from "@/lib/utils";
import { useSolicitudesIngresoStore, type DatosAnexoA } from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";




export function RegistroInstitucionView() {
  const router = useRouter();
  const { agregarRegistroInstitucion } = useSolicitudesIngresoStore();

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showConfirmInvalidateModal, setShowConfirmInvalidateModal] = useState(false);
  const [pendingTargetStep, setPendingTargetStep] = useState<number | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState({
    fechaHora: "01/10/2026 08:35",
    identificador: "FEC-BCE-2026-092942-A"
  });
  const [firmaFallo, setFirmaFallo] = useState<{
    tipo: "RECHAZADA" | "CADUCADA" | "INCIERTA";
    motivo: string;
    transaccionId: string;
  } | null>(null);

  const [bpmState, setBpmState] = useState<"DRAFT" | "PENDIENTE_FIRMA" | "EN_PROCESO" | "FIRMADO" | "EN_REVISION" | "FIRMA_RECHAZADA" | "FIRMA_CADUCADA" | "FIRMA_DESCONOCIDA">("DRAFT");
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [isCheckingFirma, setIsCheckingFirma] = useState(false);
  const [readOnlyTab, setReadOnlyTab] = useState<number>(0);
  const [rucError, setRucError] = useState(false);
  const [showDemoToolbar, setShowDemoToolbar] = useState(true);

  const stepsList: StepperStep[] = [
    { id: "1", title: "Entidad", description: "Datos y autoridad", icon: Building2 },
    { id: "2", title: "Coordinadores", description: "Titular y suplente", icon: User },
    { id: "3", title: "Servicios", description: "Áreas y herramientas", icon: FileText },
    { id: "4", title: "Declaraciones", description: "Aceptación de términos", icon: ShieldCheck },
    { id: "5", title: "Revisar borrador", description: "Documento oficial Anexo A", icon: FileCheck2 },
    { id: "6", title: "Firma y envío", description: "Suscripción digital y entrega", icon: ShieldCheck },
  ];

  // Form State Anexo A
  const [formData, setFormData] = useState<DatosAnexoA>({
    entidadTipo: "" as "Publica" | "Privada",
    nombreEntidad: "",
    rucEntidad: "",
    direccionEntidad: "",
    objetoSocial: "",
    representanteLegalNombre: "",
    representanteLegalCargo: "",
    representanteLegalEmail: "",
    esDelegado: false,
    archivoSoporteDelegacion: "",

    // Coordinador Principal
    titularNombreCompleto: "",
    titularCedula: "",
    titularCargo: "",
    titularAreaUnidad: "",
    titularEmail: "",
    titularTelefonoFijo: "",
    titularMovilInstitucional: "",
    titularMovilPersonal: "",

    // Coordinador Suplente
    suplenteNombreCompleto: "",
    suplenteCedula: "",
    suplenteCargo: "",
    suplenteAreaUnidad: "",
    suplenteEmail: "",
    suplenteTelefonoFijo: "",
    suplenteMovilInstitucional: "",
    suplenteMovilPersonal: "",

    // Servicios
    serviciosHerramientas: [],
    areasUso: "",
    procesosUso: "",

    // Declaraciones
    declaracionesAceptadas: false,
    ciudadFirma: "Quito D.M.",
    fechaFirma: "24/09/2026",
    firmadoDigitalmente: false,
    archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_SINARP_Firmada.pdf"
  });

  // Remove auto-advance timer for FIRMADO

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => {
      const exists = prev.serviciosHerramientas.includes(service);
      return {
        ...prev,
        serviciosHerramientas: exists
          ? prev.serviciosHerramientas.filter((s) => s !== service)
          : [...prev.serviciosHerramientas, service]
      };
    });
  };

  // Simular guardado automático
  useEffect(() => {
    if (step > 0) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        setIsSaving(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, step]);

  // Cargar borrador persistido si el usuario regresa a la pantalla
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dinarp_anexo_a_draft");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.formData && parsed.formData.nombreEntidad) {
            setFormData(parsed.formData);
          }
          if (parsed.bpmState && parsed.bpmState !== "DRAFT") {
            setBpmState(parsed.bpmState);
          }
        }
      } catch (e) {
        console.error("Error al cargar borrador de Anexo A", e);
      }
    }
  }, []);

  const persistAnexoA = (nextBpm: "DRAFT" | "PENDIENTE_FIRMA" | "EN_PROCESO" | "FIRMADO" | "EN_REVISION" | "FIRMA_RECHAZADA" | "FIRMA_CADUCADA" | "FIRMA_DESCONOCIDA", currentForm = formData) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "dinarp_anexo_a_draft",
          JSON.stringify({ formData: currentForm, bpmState: nextBpm })
        );
      } catch (e) {
        console.error("Error al guardar borrador de Anexo A", e);
      }
    }
  };

  const handleStepNavigation = (targetStep: number) => {
    if (targetStep === step) return;
    if (isSigned && targetStep < 6) {
      setPendingTargetStep(targetStep);
      setShowConfirmInvalidateModal(true);
      return;
    }
    if (targetStep < step) {
      setStep(targetStep as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleVolverYCorregir = (targetStep = 4) => {
    if (isSigned) {
      setPendingTargetStep(targetStep);
      setShowConfirmInvalidateModal(true);
    } else {
      setStep(targetStep as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const confirmInvalidateAndNavigate = () => {
    setIsSigned(false);
    setBpmState("DRAFT");
    setFirmaFallo(null);
    persistAnexoA("DRAFT");
    setShowConfirmInvalidateModal(false);
    if (pendingTargetStep) {
      setStep(pendingTargetStep as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      setPendingTargetStep(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast.info("Firma anterior anulada", {
      description: "Has retornado a la edición de datos. El borrador del Anexo A se actualizará y deberás firmarlo nuevamente.",
    });
  };

  const handleContinuarARevision = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.declaracionesAceptadas) {
      toast.error("Debe aceptar las declaraciones y responsabilidades legales del Anexo A.");
      return;
    }
    if (!formData.firmadoDigitalmente) {
      toast.error("Debe certificar que la información del Anexo A está completa y es verídica.");
      return;
    }
    setStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleIniciarFirmaEC = () => {
    setIsCheckingFirma(true);
    setBpmState("EN_PROCESO");
    setFirmaFallo(null);
    toast.info("Operación enviada a FirmaEC", {
      description: `Se notificó a ${formData.representanteLegalEmail || "el correo institucional"} para la suscripción digital.`,
    });
    setTimeout(() => {
      setIsCheckingFirma(false);
    }, 1200);
  };

  const handleSimulateFill = () => {
    setFormData({
      entidadTipo: "Publica",
      nombreEntidad: "Ministerio de Telecomunicaciones y de la Sociedad de la Información",
      rucEntidad: "1760001550001",
      direccionEntidad: "Av. 6 de Diciembre N25-75 y Av. Colón, Quito",
      objetoSocial: "Rectoría y formulación de políticas públicas de telecomunicaciones y gobierno digital.",
      representanteLegalNombre: "Ing. César Antonio Martín Moreno",
      representanteLegalCargo: "Ministro de Telecomunicaciones (Representante Legal)",
      representanteLegalEmail: "ministro@mintel.gob.ec",
      esDelegado: false,
      archivoSoporteDelegacion: "",

      titularNombreCompleto: "Ing. Esteban Javier Morales Salazar",
      titularCedula: "1718956234",
      titularCargo: "Director de Gobierno Digital",
      titularAreaUnidad: "Viceministerio de Tecnologías de la Información",
      titularEmail: "esteban.morales@mintel.gob.ec",
      titularTelefonoFijo: "022200200 ext 120",
      titularMovilInstitucional: "0995544332",
      titularMovilPersonal: "0984433221",

      suplenteNombreCompleto: "Lic. Carmen Elena Vinueza Proaño",
      suplenteCedula: "1714523698",
      suplenteCargo: "Especialista de Interoperabilidad Gubernamental",
      suplenteAreaUnidad: "Dirección de Gobierno Digital",
      suplenteEmail: "carmen.vinueza@mintel.gob.ec",
      suplenteTelefonoFijo: "022200200 ext 125",
      suplenteMovilInstitucional: "0991122334",
      suplenteMovilPersonal: "0982233445",

      serviciosHerramientas: ["Interoperabilidad", "Infodigital", "Ficha de Registro Único del Ciudadano"],
      areasUso: "Dirección de Gobierno Electrónico y Dirección de Datos Públicos",
      procesosUso: "Verificación de interoperabilidad nacional de trámites ciudadanos en línea del Portal Único gob.ec.",

      declaracionesAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "24/09/2026",
      firmadoDigitalmente: true,
      archivoDocumentoFirmado: "ARP-R01_Solicitud_Acceso_SINARP_Mintel.pdf"
    });
    toast.success("Formulario precargado con datos del Anexo A");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.declaracionesAceptadas) {
      toast.error("Debe aceptar las declaraciones y responsabilidades legales del Anexo A.");
      return;
    }
    if (!formData.firmadoDigitalmente) {
      toast.error("Debe certificar la firma electrónica del formulario Anexo A.");
      return;
    }
    setShowConfirmModal(true);
  };

  const executeSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setBpmState("PENDIENTE_FIRMA");
      persistAnexoA("PENDIENTE_FIRMA");
      toast.success("Solicitud de firma enviada a FirmaEC", {
        description: "El Anexo A fue enviado a firma electrónica. El firmante recibirá la solicitud mediante FirmaEC.",
      });
    }, 600);
  };

  const handleSimulateFirmaSuccess = () => {
    setIsSigned(true);
    setBpmState("FIRMADO");
    setFirmaFallo(null);
    persistAnexoA("FIRMADO");
    agregarRegistroInstitucion(formData, "PENDIENTE_ENVIO");
    toast.success("Firma electrónica verificada", {
      description: "FirmaEC confirmó la validez del certificado digital de la máxima autoridad o delegado.",
    });
  };

  const handleSimulateFirmaRechazada = (motivo = "Certificado revocado o no reconocido por la entidad de certificación en FirmaEC.") => {
    setIsSigned(false);
    setBpmState("FIRMA_RECHAZADA");
    setFirmaFallo({
      tipo: "RECHAZADA",
      motivo,
      transaccionId: "FEC-ERR-2026-7842"
    });
    persistAnexoA("FIRMA_RECHAZADA");
    toast.error("No se pudo completar la firma", {
      description: motivo,
    });
  };

  const handleSimulateFirmaCaducada = () => {
    setIsSigned(false);
    setBpmState("FIRMA_CADUCADA");
    setFirmaFallo({
      tipo: "CADUCADA",
      motivo: "El plazo límite de 48 horas en FirmaEC ha expirado sin registrarse la suscripción.",
      transaccionId: "FEC-CAD-2026-1029"
    });
    persistAnexoA("FIRMA_CADUCADA");
    toast.warning("Firma caducada", {
      description: "El plazo límite de firma en FirmaEC ha expirado. El Anexo A se conserva como borrador intacto.",
    });
  };

  const handleSimulateFirmaDesconocida = () => {
    setIsSigned(false);
    setBpmState("FIRMA_DESCONOCIDA");
    setFirmaFallo({
      tipo: "INCIERTA",
      motivo: "No se pudo sincronizar el estado de la operación con los servidores de FirmaEC.",
      transaccionId: "FEC-UNC-2026-9901"
    });
    persistAnexoA("FIRMA_DESCONOCIDA");
    toast.info("No se pudo confirmar la firma", {
      description: "No se pudo sincronizar el estado con FirmaEC. Consulta el estado antes de un nuevo intento.",
    });
  };

  const handleConsultarEstadoFirma = () => {
    setIsCheckingFirma(true);
    toast.info("Consultando estado en FirmaEC...", {
      description: "Verificando certificado y firma digital de la operación en curso.",
    });
    setTimeout(() => {
      setIsCheckingFirma(false);
      setBpmState("FIRMADO");
      persistAnexoA("FIRMADO");
      agregarRegistroInstitucion(formData, "PENDIENTE_ENVIO");
      toast.success("Firma verificada correctamente", {
        description: "FirmaEC confirmó la validez de la firma digital del Anexo A.",
      });
    }, 1000);
  };

  const handleVolverAEditar = () => {
    if (bpmState === "EN_REVISION") return;
    setBpmState("DRAFT");
    persistAnexoA("DRAFT");
    setStep(4);
    toast.info("Modo borrador activado", {
      description: "Puedes revisar y editar la información del Anexo A antes de volver a solicitar la firma.",
    });
  };

  const handleSolicitarNuevaFirma = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setBpmState("PENDIENTE_FIRMA");
      persistAnexoA("PENDIENTE_FIRMA");
      toast.success("Nueva solicitud de firma enviada", {
        description: "Se generó una nueva operación en FirmaEC. El firmante recibirá la notificación para firmar.",
      });
    }, 600);
  };

  const handleDescargarDocumentoFirmado = () => {
    toast.success("Descarga iniciada", {
      description: "Descargando documento ARP-R01 firmado electrónicamente por FirmaEC.",
    });
  };

  const handleEnviarSolicitudFinal = () => {
    setIsSubmitting(true);
    agregarRegistroInstitucion(formData, "EN_REVISION_GESTION");
    setTimeout(() => {
      setIsSubmitting(false);
      setBpmState("EN_REVISION");
      persistAnexoA("EN_REVISION");
      toast.success("Solicitud enviada a Gestión", {
        description: "El Anexo A firmado fue enviado a revisión formal del equipo de Gestión de la DINARP. La edición ha sido bloqueada definitivamente.",
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full overflow-x-hidden">
      {/* Barra superior */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <>
                <img
                  src={getAssetPath("/logo-horizontal.svg")}
                  alt="Logo DINARP"
                  className="dark:hidden h-11 sm:h-12 w-auto object-contain dark:brightness-0 dark:invert"
                />
                <img
                  src={getAssetPath("/logo-horizontal-blanco.svg")}
                  alt="Logo DINARP"
                  className="hidden dark:block h-11 sm:h-12 w-auto object-contain dark:brightness-0 dark:invert"
                />
              </>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-5 py-4 sm:py-6">
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-300">
            {/* Migas de pan, retorno e indicador de borrador */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/login" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
                  <Home className="size-3.5" />
                  <span>Portal de Acceso</span>
                </Link>
                <span>/</span>
                <span className="text-muted-foreground">Solicitud de enrolamiento</span>
                <span>/</span>
                <span className="text-foreground font-semibold truncate">Anexo A Solicitud de Registro de Institución</span>
                {step > 0 && (
                  <>
                    <span className="hidden md:inline">/</span>
                    <span className="text-primary font-bold hidden md:inline">
                      Paso {step}: {stepsList[step - 1]?.title}
                    </span>
                  </>
                )}
              </nav>

              {/* Indicador de Guardado */}
              <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/50 transition-colors self-start sm:self-auto">
                {isSaving ? (
                  <>
                    <div className="size-1.5 bg-warning rounded-full animate-pulse" />
                    <span className="text-muted-foreground">Guardando como borrador...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5 text-success" />
                    <span className="text-muted-foreground">Borrador guardado</span>
                  </>
                )}
              </div>
            </div>

            {/* Encabezado del Trámite en Card Featured estilo UI Kit con Badge Primary e Icono */}
            <Card
              variant="featured"
              disableHover={true}
              className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                  FORMULARIO OFICIAL ARP-R01
                </CardBadge>
              </div>

              <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
                Anexo A — Solicitud de Acceso al Sistema Nacional de Registros Públicos
              </CardTitle>

              <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
                Proceso A · Enrolamiento institucional al SINARP
              </CardDescription>

              <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100 hidden sm:block">
                <Building2 className="size-32 text-primary" />
              </CardDecorativeIcon>
            </Card>

            <Separator className="my-6" />

            {/* Stepper oficial UI kit (línea conectora, círculos y badges) */}
            {step > 0 && (
              <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 my-6 shadow-xs overflow-x-auto">
                <Stepper
                  steps={stepsList}
                  activeStep={step - 1}
                  variant="default"
                  stepPrefix="PASO"
                  showBadge={true}
                  onStepClick={(index) => {
                    if (index + 1 < step) {
                      setStep((index + 1) as 1 | 2 | 3 | 4);
                    }
                  }}
                />
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {/* â”€â”€ PASO 0: VALIDACIÓN DE LA INSTITUCIÓN â”€â”€ */}
              {step === 0 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="pt-3 pb-2 my-2 space-y-1">
                    <h2 className="text-lg font-bold font-heading flex items-center gap-2 text-foreground">
                      <Building2 className="size-5 text-primary" />
                      Validación de la institución
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Selecciona el tipo de institución e ingresa el RUC para validar la información y continuar con el registro.
                    </p>
                  </div>

                  {/* Stepper oficial horizontal UI Kit para Paso 1 y 2 */}
                  <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 my-6 shadow-xs overflow-x-auto">
                    <Stepper
                      steps={[
                        { id: "paso-1", title: "Tipo de institución" },
                        { id: "paso-2", title: "Validación de RUC" },
                      ]}
                      activeStep={
                        formData.rucEntidad.length === 13
                          ? 1
                          : formData.entidadTipo
                          ? 1
                          : 0
                      }
                      completedSteps={
                        formData.rucEntidad.length === 13
                          ? [0, 1]
                          : formData.entidadTipo
                          ? [0]
                          : []
                      }
                      startIndex={1}
                      stepPrefix="PASO"
                      showBadge={true}
                      variant="default"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Card 1: Naturaleza */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[148px]">
                      <div>
                        <Label className="text-xs font-semibold text-foreground">
                          Naturaleza de la institución <span className="text-warning">*</span>
                        </Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Selecciona una opción.
                        </p>
                      </div>

                      <div className="flex items-center min-h-[42px] pt-1">
                        <RadioGroup
                          value={formData.entidadTipo}
                          onValueChange={(val) => {
                            if (val) setFormData({ ...formData, entidadTipo: val as "Publica" | "Privada" });
                          }}
                          orientation="horizontal"
                          className="flex flex-wrap items-center gap-4 sm:gap-6"
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

                    {/* Card 2: RUC */}
                    <div
                      className={cn(
                        "bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[148px] transition-opacity",
                        !formData.entidadTipo && "opacity-60"
                      )}
                    >
                      <div>
                        <Label htmlFor="rucEntidad-0" className="text-xs font-semibold text-foreground">
                          Número de RUC de la Entidad <span className="text-warning">*</span>
                        </Label>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {!formData.entidadTipo
                            ? "Selecciona primero la naturaleza de la institución en el Paso 1."
                            : "Ingresa el RUC de 13 dígitos."}
                        </p>
                      </div>

                      <div className="flex items-center min-h-[42px] pt-1">
                        <InputGroup
                          state={rucError ? "error" : formData.rucEntidad.length === 13 ? "success" : "default"}
                          rightIcon={
                            rucError ? (
                              <AlertCircle className="size-4 text-danger" />
                            ) : formData.rucEntidad.length === 13 ? (
                              <CheckCircle2 className="size-4 text-success" />
                            ) : undefined
                          }
                          className="w-full"
                        >
                          <InputGroupInput
                            id="rucEntidad-0"
                            value={formData.rucEntidad}
                            maxLength={13}
                            disabled={!formData.entidadTipo}
                            onChange={(e) => {
                              setRucError(false);
                              setFormData({ ...formData, rucEntidad: e.target.value.replace(/\D/g, "") });
                            }}
                            placeholder={!formData.entidadTipo ? "Primero selecciona tipo..." : "1111111111111"}
                            className="text-xs font-mono tracking-wider disabled:cursor-not-allowed"
                            required
                          />
                        </InputGroup>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60">
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={() => {
                        setRucError(false);
                        if (!formData.rucEntidad || formData.rucEntidad.length < 13) {
                          setRucError(true);
                          toast.error("Por favor ingresa un RUC válido de 13 dígitos.");
                          return;
                        }
                        if (formData.rucEntidad === "1111111111111") {
                          setRucError(true);
                          toast.error("No encontramos una institución asociada a este RUC.\nVerifica el número e inténtalo nuevamente.");
                          return;
                        }
                        if (formData.rucEntidad === "2222222222222") {
                          setRucError(true);
                          toast.error("No pudimos validar el RUC en este momento. Inténtalo nuevamente.");
                          return;
                        }
                        setStep(1);
                        toast.success("Institución validada correctamente.");
                      }}
                      className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[220px]"
                    >
                      <Search className="size-4" />
                      <span>Validar información</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* â”€â”€ PASO 1: DATOS DE LA ENTIDAD Y MÁXIMA AUTORIDAD â”€â”€ */}
              {step === 1 && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  {/* Cabecera Sección I al ras */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <Building2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                        <span>Sección I — Datos de la Institución y Máxima Autoridad</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Información de identificación de la institución solicitante y de su máxima autoridad o delegado.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      {formData.entidadTipo === "Privada" ? "ENTIDAD PRIVADA" : "ENTIDAD PÚBLICA"}
                    </Badge>
                  </div>

                    <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Building2 className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                            1.1 Naturaleza de la Entidad
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Información general de la institución requirente y personería jurídica.
                          </p>
                        </div>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                        ENTIDAD
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label className="text-xs font-semibold text-foreground">
                          Naturaleza de la Entidad
                        </Label>
                        <RadioGroup
                          orientation="horizontal"
                          value={formData.entidadTipo}
                          onValueChange={(val) => setFormData({ ...formData, entidadTipo: val as "Publica" | "Privada" })}
                          className="flex flex-wrap gap-4 sm:gap-6 pt-1"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Publica" id="entidad-publica" />
                            <Label htmlFor="entidad-publica" className="text-xs font-medium cursor-pointer">
                              Entidad Pública
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="Privada" id="entidad-privada" />
                            <Label htmlFor="entidad-privada" className="text-xs font-medium cursor-pointer">
                              Entidad Privada
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="nombreEntidad" className="text-xs font-semibold text-foreground">
                          Nombre de la Entidad <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="nombreEntidad"
                            value={formData.nombreEntidad}
                            onChange={(e) => setFormData({ ...formData, nombreEntidad: e.target.value })}
                            placeholder="Ej. Ministerio de Salud Pública"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rucEntidad" className="text-xs font-semibold text-foreground">
                          RUC de la Entidad (13 dígitos) <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="rucEntidad"
                            value={formData.rucEntidad}
                            maxLength={13}
                            onChange={(e) => setFormData({ ...formData, rucEntidad: e.target.value.replace(/\D/g, "") })}
                            placeholder="1760000000001"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="direccionEntidad" className="text-xs font-semibold text-foreground">
                          Dirección de la Entidad <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<Home className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="direccionEntidad"
                            value={formData.direccionEntidad}
                            onChange={(e) => setFormData({ ...formData, direccionEntidad: e.target.value })}
                            placeholder="Calle principal, número y calle secundaria, ciudad"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="objetoSocial" className="text-xs font-semibold text-foreground">
                          Objeto Social y/o Actividad de la Entidad <span className="text-warning">*</span>
                        </Label>
                        <Textarea
                          id="objetoSocial"
                          value={formData.objetoSocial}
                          onChange={(e) => setFormData({ ...formData, objetoSocial: e.target.value })}
                          placeholder="Detalle la misión, competencias legales u objeto social institucional..."
                          className="text-xs min-h-[70px]"
                          required
                        />
                      </div>
                    </div>

                    {/* Datos del firmante del Anexo A */}
                    <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <User className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                            Datos del firmante del Anexo A
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Información de la máxima autoridad o delegado institucional que suscribirá mediante FirmaEC.
                          </p>
                        </div>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                        FIRMANTE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="flex flex-col gap-3 sm:col-span-2 pb-2">
                        <Label className="text-xs font-semibold text-foreground">
                          ¿Quién firmará el Anexo A? <span className="text-warning">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.esDelegado ? "delegado" : "autoridad"}
                          onValueChange={(val) => setFormData({ ...formData, esDelegado: val === "delegado" })}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="autoridad" id="autoridad" />
                            <Label htmlFor="autoridad" className="text-xs font-medium cursor-pointer">
                              Máxima autoridad institucional
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="delegado" id="delegado" />
                            <Label htmlFor="delegado" className="text-xs font-medium cursor-pointer">
                              Delegado de la máxima autoridad
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="repNombre" className="text-xs font-semibold text-foreground">
                          Nombre completo <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="repNombre"
                            value={formData.representanteLegalNombre}
                            onChange={(e) => setFormData({ ...formData, representanteLegalNombre: e.target.value })}
                            placeholder="Nombres y apellidos completos"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="repCargo" className="text-xs font-semibold text-foreground">
                          Denominación del cargo <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="repCargo"
                            value={formData.representanteLegalCargo}
                            onChange={(e) => setFormData({ ...formData, representanteLegalCargo: e.target.value })}
                            placeholder="Ej. Ministro / Director Ejecutivo"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="repEmail" className="text-xs font-semibold text-foreground">
                          Correo electrónico <span className="text-warning">*</span>
                        </Label>
                        <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            id="repEmail"
                            type="email"
                            value={formData.representanteLegalEmail}
                            onChange={(e) => setFormData({ ...formData, representanteLegalEmail: e.target.value })}
                            placeholder="autoridad@institucion.gob.ec"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      {formData.esDelegado && (
                        <div className="flex flex-col gap-2 sm:col-span-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <Label className="text-xs font-semibold text-foreground">
                            Autorización de delegación <span className="text-warning">*</span>
                          </Label>
                          <p className="text-[11px] text-muted-foreground mb-2">
                            La autorización es obligatoria cuando el Anexo A será firmado por un delegado de la máxima autoridad.
                          </p>
                          
                          <div className="w-full">
                            <FileUpload
                              accept=".pdf"
                              allowedFormats="PDF"
                              maxSizeMB={2}
                              onFileSelect={(files: File[]) => {
                                const file = files[0];
                                if (file) {
                                  setFormData({ ...formData, archivoSoporteDelegacion: file.name });
                                  toast.success("Archivo adjunto", {
                                    description: `El documento "${file.name}" ha sido cargado.`,
                                  });
                                } else {
                                  setFormData({ ...formData, archivoSoporteDelegacion: "" });
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60">
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        onClick={() => setStep(0)}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">Anterior: Validación</span>
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        onClick={() => {
                          if (!formData.nombreEntidad || !formData.rucEntidad || !formData.representanteLegalNombre) {
                            toast.error("Por favor completa los campos obligatorios de la entidad.");
                            return;
                          }
                          setStep(2);
                        }}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[220px]"
                      >
                        <span className="whitespace-nowrap">Siguiente: Coordinadores</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€ PASO 2: COORDINADOR TITULAR Y SUPLENTE â”€â”€ */}
              {step === 2 && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  {/* Coordinadores Header al ras */}
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                        <User className="size-5 text-primary shrink-0" />
                        <span>Coordinadores Institucionales del SINARP</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Designación de coordinadores titular y suplente para la gestión operativa institucional.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      COORDINACIÓN
                    </Badge>
                  </div>
                    <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <User className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                            1.2 Coordinador Institucional Principal (Titular)
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ingresa los datos del coordinador institucional titular designado por la entidad.
                          </p>
                        </div>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                        TITULAR
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Nombre Completo <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularNombreCompleto}
                            onChange={(e) => setFormData({ ...formData, titularNombreCompleto: e.target.value })}
                            placeholder="Nombres y apellidos completos"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularCedula}
                            maxLength={10}
                            onChange={(e) => setFormData({ ...formData, titularCedula: e.target.value.replace(/\D/g, "") })}
                            placeholder="10 dígitos numéricos"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularCargo}
                            onChange={(e) => setFormData({ ...formData, titularCargo: e.target.value })}
                            placeholder="Ej. Director de Tecnologías"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularAreaUnidad}
                            onChange={(e) => setFormData({ ...formData, titularAreaUnidad: e.target.value })}
                            placeholder="Ej. Dirección de Tecnologías de Información"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            type="email"
                            value={formData.titularEmail}
                            onChange={(e) => setFormData({ ...formData, titularEmail: e.target.value })}
                            placeholder="titular@institucion.gob.ec"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularTelefonoFijo}
                            onChange={(e) => setFormData({ ...formData, titularTelefonoFijo: e.target.value })}
                            placeholder="023814400 ext 123"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Móvil Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularMovilInstitucional}
                            onChange={(e) => setFormData({ ...formData, titularMovilInstitucional: e.target.value })}
                            placeholder="0991234567"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Móvil Personal <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.titularMovilPersonal}
                            onChange={(e) => setFormData({ ...formData, titularMovilPersonal: e.target.value })}
                            placeholder="0987654321"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>
                    </div>

                    {/* Coordinador Suplente */}
                    <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <User className="size-4 text-primary shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                            1.3 Coordinador Institucional Suplente
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Ingresa los datos del coordinador institucional suplente designado por la entidad.
                          </p>
                        </div>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                        SUPLENTE
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Nombre Completo <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteNombreCompleto}
                            onChange={(e) => setFormData({ ...formData, suplenteNombreCompleto: e.target.value })}
                            placeholder="Nombres y apellidos completos"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteCedula}
                            maxLength={10}
                            onChange={(e) => setFormData({ ...formData, suplenteCedula: e.target.value.replace(/\D/g, "") })}
                            placeholder="10 dígitos numéricos"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteCargo}
                            onChange={(e) => setFormData({ ...formData, suplenteCargo: e.target.value })}
                            placeholder="Ej. Especialista de Infraestructura"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteAreaUnidad}
                            onChange={(e) => setFormData({ ...formData, suplenteAreaUnidad: e.target.value })}
                            placeholder="Ej. Dirección de Tecnologías de Información"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            type="email"
                            value={formData.suplenteEmail}
                            onChange={(e) => setFormData({ ...formData, suplenteEmail: e.target.value })}
                            placeholder="suplente@institucion.gob.ec"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteTelefonoFijo}
                            onChange={(e) => setFormData({ ...formData, suplenteTelefonoFijo: e.target.value })}
                            placeholder="023814400 ext 124"
                            className="text-xs"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Móvil Institucional <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteMovilInstitucional}
                            onChange={(e) => setFormData({ ...formData, suplenteMovilInstitucional: e.target.value })}
                            placeholder="0998877665"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs font-semibold text-foreground">Móvil Personal <span className="text-warning">*</span></Label>
                        <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                          <InputGroupInput
                            value={formData.suplenteMovilPersonal}
                            onChange={(e) => setFormData({ ...formData, suplenteMovilPersonal: e.target.value })}
                            placeholder="0981122334"
                            className="text-xs font-mono"
                            required
                          />
                        </InputGroup>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border/60">
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">Volver a Entidad</span>
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        onClick={() => {
                          if (!formData.titularNombreCompleto || !formData.titularCedula || !formData.suplenteNombreCompleto || !formData.suplenteCedula) {
                            toast.error("Por favor completa los datos de ambos coordinadores.");
                            return;
                          }
                          setStep(3);
                        }}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[220px]"
                      >
                        <span className="whitespace-nowrap">Siguiente: Servicios y Procesos</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€ PASO 3: SERVICIOS Y HERRAMIENTAS â”€â”€ */}
              {step === 3 && (
                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <FileCheck2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                        <span>Sección II — Servicios y Herramientas Informáticas</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Procesos y áreas en las que se van a utilizar los servicios y/o herramientas provistos por la DINARP.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      SERVICIOS DINARP
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-6 sm:gap-8">
                    {/* 2.1 Servicios */}
                    <div className="space-y-4">
                      <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 flex items-center justify-between rounded-xl">
                        <div>
                          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                            <FileCheck2 className="size-4 text-primary" />
                            2.1 Servicios y/o herramientas requeridas <span className="text-warning">*</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Selecciona al menos uno de los servicios provistos por la DINARP.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
                        {["Interoperabilidad", "Infodigital", "Ficha de Registro Único del Ciudadano"].map((s) => (
                          <label
                            key={s}
                            className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors cursor-pointer min-w-0"
                          >
                            <Checkbox
                              checked={formData.serviciosHerramientas.includes(s)}
                              onCheckedChange={() => handleServiceToggle(s)}
                              className="shrink-0"
                            />
                            <span className="font-semibold text-xs text-foreground leading-snug break-words">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* 2.2 Áreas de uso */}
                    <div className="space-y-4">
                      <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 flex items-center justify-between rounded-xl">
                        <div>
                          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                            <Building2 className="size-4 text-primary" />
                            2.2 Áreas de uso institucional <span className="text-warning">*</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Indica las áreas administrativas o técnicas de la institución que utilizarán el servicio.
                          </p>
                        </div>
                      </div>

                      <Textarea
                        id="areasUso"
                        value={formData.areasUso}
                        onChange={(e) => setFormData({ ...formData, areasUso: e.target.value })}
                        placeholder="Detallar las áreas administrativas o técnicas de su institución para las cuales requiere el servicio..."
                        className="text-xs min-h-[96px] leading-relaxed p-3"
                        required
                      />
                    </div>

                    <Separator />

                    {/* 2.3 Procesos de uso */}
                    <div className="space-y-4">
                      <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 flex items-center justify-between rounded-xl">
                        <div>
                          <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                            <FileText className="size-4 text-primary" />
                            2.3 Procesos para los cuales utilizará los servicios <span className="text-warning">*</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Describe los procesos internos, trámites o plataformas para los cuales se consumirán los datos.
                          </p>
                        </div>
                      </div>

                      <Textarea
                        id="procesosUso"
                        value={formData.procesosUso}
                        onChange={(e) => setFormData({ ...formData, procesosUso: e.target.value })}
                        placeholder="Detalle los trámites, plataformas o procesos sustantivos que consumirán los datos..."
                        className="text-xs min-h-[96px] leading-relaxed p-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-border/60">
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span className="whitespace-nowrap">Volver a Coordinadores</span>
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        onClick={() => {
                          if (formData.serviciosHerramientas.length === 0 || !formData.areasUso || !formData.procesosUso) {
                            toast.error("Por favor completa las herramientas, áreas y procesos de uso.");
                            return;
                          }
                          setStep(4);
                        }}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[240px]"
                      >
                        <span className="whitespace-nowrap">Siguiente: Declaraciones</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 4: DECLARACIONES ── */}
              {step === 4 && (
                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                        <span>Sección III — Declaraciones y Responsabilidades</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Declaraciones institucionales y aceptación formal de responsabilidades previo a la revisión del documento oficial.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      DECLARACIONES
                    </Badge>
                  </div>


                  {/* Bloque Legal de Declaraciones */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                    <h3 className="font-bold text-foreground text-sm">
                      2.2 Cláusula Segunda: Declaraciones del Solicitante
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-justify">
                      La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los arts. 66 numerales 11 y 19 de la Constitución, art. 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos, Ley de Optimización de Trámites, Ley Orgánica de Protección de Datos Personales, y arts. 178, 180 y 229 del COIP. La institución queda obligada a dar a la información el uso exclusivo para el que le sea concedido y custodiarla con prudencia.
                    </p>
                    <div className="flex items-start gap-3 pt-4 border-t border-border/60">
                      <Checkbox
                        id="declaraciones"
                        checked={formData.declaracionesAceptadas}
                        onCheckedChange={(checked) => setFormData({ ...formData, declaracionesAceptadas: Boolean(checked) })}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0 mt-0.5"
                      />
                      <Label htmlFor="declaraciones" className="text-xs cursor-pointer font-bold text-foreground">
                        Acepto expresamente las declaraciones legales, términos y responsabilidades del Anexo A.
                      </Label>
                    </div>
                  </div>

                  {/* Resumen de Firmante y Lugar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                    >
                      <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                        <User className="size-3.5 text-secondary" />
                        <span>Firmante Autorizado Designado</span>
                      </CardBadge>

                      <div className="space-y-0.5 mt-2">
                        <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                          {formData.representanteLegalNombre || "Sin asignar"}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium break-words">
                          {formData.representanteLegalCargo || "Representante Legal o Delegado"}
                        </CardDescription>
                      </div>

                      <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                        <User className="size-28 text-secondary" />
                      </CardDecorativeIcon>
                    </Card>

                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                    >
                      <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                        <MapPin className="size-3.5 text-secondary" />
                        <span>Lugar y Fecha</span>
                      </CardBadge>

                      <div className="space-y-0.5 mt-2">
                        <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                          {formData.ciudadFirma || "Quito D.M."}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3.5 text-secondary/80" />
                          <span>{formData.fechaFirma || "24/09/2026"}</span>
                        </CardDescription>
                      </div>

                      <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                        <Calendar className="size-28 text-secondary" />
                      </CardDecorativeIcon>
                    </Card>
                  </div>

                  {/* Certificación de Veracidad de la Información */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-start sm:items-center gap-3">
                    <Checkbox
                      id="firmaDigital"
                      checked={formData.firmadoDigitalmente}
                      onCheckedChange={(checked) => setFormData({ ...formData, firmadoDigitalmente: Boolean(checked) })}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0 mt-0.5 sm:mt-0"
                    />
                    <Label htmlFor="firmaDigital" className="text-xs cursor-pointer font-bold text-foreground">
                      Confirmo que la información ingresada en el Anexo A es verídica, exacta y está lista para revisión.
                    </Label>
                  </div>

                  {/* Botones de Navegación de Paso 4 */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-border/60">
                    <Link href="/login" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        size="default"
                        onClick={() => {
                          setStep(3);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span>Volver al paso anterior</span>
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        disabled={!formData.declaracionesAceptadas || !formData.firmadoDigitalmente}
                        onClick={handleContinuarARevision}
                        className="text-xs font-semibold shadow-xs w-full sm:w-auto px-6 gap-2 group"
                      >
                        <span>Continuar a revisión</span>
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 5: REVISAR BORRADOR (VISTA PREVIA REAL DEL DOCUMENTO) ── */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                    <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <FileCheck2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                          <span>Paso 5 — Revisar borrador del Anexo A</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Verifica que la información oficial de la institución, coordinadores designados y servicios requeridos sea exacta antes de continuar a la firma digital.
                        </p>
                      </div>
                      <Badge tone="primary" appearance="soft" size="sm" className="font-bold text-[10px] uppercase tracking-wider shrink-0 self-start sm:self-auto rounded-full px-3 py-1 border border-primary/30">
                        Documento Oficial ARP-R01
                      </Badge>
                    </div>

                    {/* Alerta de sólo lectura / informativa */}
                    <Alert
                      variant="info"
                      icon={<Info className="size-4" />}
                      title="Vista previa del documento consolidado"
                    >
                      Este es el documento Anexo A consolidado con los datos de los pasos anteriores. No contiene campos editables en esta vista. Si requieres hacer correcciones, haz clic en "Volver y corregir".
                    </Alert>

                    {/* Vista previa tipo Hoja de Oficio del Documento Anexo A (ARP-R01) */}
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-md max-w-5xl mx-auto border-t-4 border-t-primary">
                      {/* Encabezado Institucional Oficial DINARP */}
                      <div className="flex items-center justify-between border-b border-border/80 pb-4 gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAssetPath("/logo-horizontal.svg")}
                            alt="DINARP"
                            className="dark:hidden h-10 w-auto object-contain"
                          />
                          <img
                            src={getAssetPath("/logo-horizontal-blanco.svg")}
                            alt="DINARP"
                            className="hidden dark:block h-10 w-auto object-contain"
                          />
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-bold text-primary block">
                            CÓDIGO: ARP-R01
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                            ANEXO A · SISTEMA NACIONAL DE REGISTROS PÚBLICOS
                          </span>
                        </div>
                      </div>

                      {/* Título Principal */}
                      <div className="text-center space-y-1">
                        <h3 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-wide">
                          FORMULARIO ANEXO A — SOLICITUD DE ACCESO AL SISTEMA NACIONAL DE REGISTROS PÚBLICOS
                        </h3>
                        <p className="text-[11px] text-muted-foreground italic">
                          Suscrito al amparo de la Constitución de la República del Ecuador, Ley Orgánica del Sistema Nacional de Registros Públicos y Ley Orgánica de Protección de Datos Personales
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border text-[11px] font-mono text-foreground font-semibold mt-1">
                          <span>EXPEDIENTE:</span>
                          <strong className="text-primary font-bold">EXP-ARP-2026-0042</strong>
                        </div>
                      </div>

                      {/* Cuerpo del Documento estructurado */}
                      <div className="space-y-6 text-xs text-foreground divide-y divide-border/60">
                        {/* SECCIÓN I: ENTIDAD Y AUTORIDAD */}
                        <div className="pt-2 space-y-3">
                          <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                            <Building2 className="size-4 shrink-0" />
                            <span>Sección I — Datos de la Entidad y Máxima Autoridad o Delegado</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Naturaleza Institucional</span>
                              <p className="font-semibold text-foreground text-xs">{formData.entidadTipo === "Publica" ? "Pública (Estado / GAD / Empresa Pública)" : "Privada"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Razón Social / Nombre Oficial</span>
                              <p className="font-semibold text-foreground text-xs">{formData.nombreEntidad || "—"}</p>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">RUC</span>
                              <p className="font-mono font-semibold text-foreground text-xs">{formData.rucEntidad || "—"}</p>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Domicilio Institucional</span>
                              <p className="font-semibold text-foreground text-xs">{formData.direccionEntidad || "—"}</p>
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">Objeto Social / Fines Institucionales</span>
                              <p className="text-muted-foreground text-xs leading-relaxed">{formData.objetoSocial || "—"}</p>
                            </div>
                          </div>

                          {/* Máxima Autoridad o Delegado */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                              {formData.esDelegado ? "Delegado de la Máxima Autoridad" : "Representante Legal / Máxima Autoridad"}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Nombres y Apellidos:</span>
                                <p className="font-semibold text-foreground">{formData.representanteLegalNombre || "—"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Cargo Institucional:</span>
                                <p className="font-semibold text-foreground">{formData.representanteLegalCargo || "—"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Correo Electrónico:</span>
                                <p className="font-semibold text-foreground">{formData.representanteLegalEmail || "—"}</p>
                              </div>
                            </div>
                            {formData.esDelegado && (
                              <div className="pt-2 border-t border-border/50 flex items-center gap-2 text-[11px] text-secondary font-medium">
                                <FileText className="size-3.5 shrink-0" />
                                <span>Acto administrativo de delegación adjunto: {formData.archivoSoporteDelegacion || "Resolución_Delegación_Oficial.pdf"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SECCIÓN II: COORDINADORES */}
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                            <User className="size-4 shrink-0" />
                            <span>Sección II — Coordinadores Institucionales Registrados</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Titular */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
                              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                                  <User className="size-3.5 text-primary" />
                                  <span>Coordinador Titular</span>
                                </span>
                                <Badge tone="primary" appearance="soft" size="sm" className="text-[9px] uppercase font-bold">
                                  Principal
                                </Badge>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Nombre completo:</span>
                                  <strong className="text-foreground">{formData.titularNombreCompleto || "—"}</strong>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Cédula:</span>
                                    <span className="font-mono text-foreground font-semibold">{formData.titularCedula || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                                    <span className="text-foreground">{formData.titularCargo || "—"}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Área / Unidad:</span>
                                  <span className="text-foreground">{formData.titularAreaUnidad || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Correo electrónico:</span>
                                  <span className="text-foreground">{formData.titularEmail || "—"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Fijo:</span>
                                    <span>{formData.titularTelefonoFijo || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Móvil Institucional:</span>
                                    <span>{formData.titularMovilInstitucional || "—"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Suplente */}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2.5">
                              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                                <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                                  <User className="size-3.5 text-secondary" />
                                  <span>Coordinador Suplente</span>
                                </span>
                                <Badge tone="neutral" appearance="soft" size="sm" className="text-[9px] uppercase font-bold">
                                  Alterno
                                </Badge>
                              </div>
                              <div className="space-y-1.5 text-xs">
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Nombre completo:</span>
                                  <strong className="text-foreground">{formData.suplenteNombreCompleto || "—"}</strong>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Cédula:</span>
                                    <span className="font-mono text-foreground font-semibold">{formData.suplenteCedula || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                                    <span className="text-foreground">{formData.suplenteCargo || "—"}</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Área / Unidad:</span>
                                  <span className="text-foreground">{formData.suplenteAreaUnidad || "—"}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-muted-foreground block">Correo electrónico:</span>
                                  <span className="text-foreground">{formData.suplenteEmail || "—"}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Fijo:</span>
                                    <span>{formData.suplenteTelefonoFijo || "—"}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-muted-foreground block">Móvil Institucional:</span>
                                    <span>{formData.suplenteMovilInstitucional || "—"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECCIÓN III: SERVICIOS */}
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                            <FileText className="size-4 shrink-0" />
                            <span>Sección III — Servicios y Herramientas Informáticas Solicitadas</span>
                          </div>

                          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">
                                Herramientas y/o Servicios Requeridos:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {formData.serviciosHerramientas.length > 0 ? (
                                  formData.serviciosHerramientas.map((serv) => (
                                    <Badge key={serv} tone="primary" appearance="soft" size="sm" className="font-medium">
                                      <Check className="size-3 mr-1" />
                                      {serv}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Ningún servicio seleccionado</span>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                              <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Áreas de uso institucional:</span>
                                <p className="text-foreground text-xs mt-0.5">{formData.areasUso || "—"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase block">Procesos institucionales:</span>
                                <p className="text-foreground text-xs mt-0.5">{formData.procesosUso || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SECCIÓN IV: DECLARACIONES Y RESPONSABILIDADES */}
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 font-bold font-heading text-primary text-xs uppercase tracking-wide">
                            <ShieldCheck className="size-4 shrink-0" />
                            <span>Sección IV — Declaraciones Legales y Responsabilidad</span>
                          </div>

                          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-justify text-[11px] leading-relaxed text-muted-foreground">
                            <p>
                              La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los artículos 66 numerales 11 y 19 de la Constitución de la República del Ecuador; artículo 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos; Ley Orgánica para la Optimización y Eficiencia de Trámites Administrativos; Ley Orgánica de Protección de Datos Personales; y los artículos 178, 180 y 229 del Código Orgánico Integral Penal.
                            </p>
                            <p>
                              La entidad se compromete formalmente a salvaguardar la confidencialidad de la información y utilizar las herramientas informáticas provistas única y exclusivamente para los fines institucionales autorizados.
                            </p>
                            <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-semibold text-foreground">
                              <span className="flex items-center gap-1.5 text-success">
                                <CheckCircle2 className="size-3.5 shrink-0" />
                                Declaraciones y responsabilidades legales aceptadas expresamente
                              </span>
                              <span className="font-mono text-muted-foreground">
                                Lugar y Fecha: {formData.ciudadFirma || "Quito D.M."}, {formData.fechaFirma || "24/09/2026"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BLOQUE DE FIRMAS TIPO HOJA DE OFICIO */}
                        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                          {/* Tarjeta 1: Representante Legal */}
                          <Card
                            variant="featured"
                            disableHover={true}
                            className="bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 shadow-none text-center p-6 relative overflow-hidden rounded-2xl flex flex-col items-center justify-center"
                          >
                            <CardDecorativeIcon className="-bottom-6 -right-6 opacity-15 pointer-events-none">
                              <FileSignature className="size-28 text-secondary" />
                            </CardDecorativeIcon>

                            <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                              <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-xs">
                                <FileSignature className="size-7 opacity-80" />
                              </div>

                              <div className="text-secondary/70 italic text-[11px] font-medium">
                                [Firmante Autorizado del Solicitante]
                              </div>

                              <div className="w-full border-t border-secondary/20 pt-3 flex flex-col items-center text-center">
                                <span className="font-bold font-heading text-foreground block text-sm sm:text-base">
                                  {formData.representanteLegalNombre || "Máxima Autoridad o Delegado"}
                                </span>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                  {formData.representanteLegalCargo || "Representante Legal"}
                                </span>
                                <span className="text-[10px] text-muted-foreground/80 block mt-0.5 font-medium">
                                  {formData.nombreEntidad}
                                </span>
                              </div>
                            </div>
                          </Card>

                          {/* Tarjeta 2: Pendiente FirmaEC (Paso 6) */}
                          <Card
                            variant="featured"
                            disableHover={true}
                            className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/40 text-center p-6 relative overflow-hidden rounded-2xl ring-2 ring-primary/20 shadow-sm flex flex-col items-center justify-center group"
                          >
                            <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                <Sparkles className="size-3 text-primary animate-pulse shrink-0" />
                                <span>Acción Requerida en Paso 6</span>
                              </div>

                              <div className="size-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-sm relative">
                                <ShieldCheck className="size-7 text-primary" />
                                <span className="absolute -top-1 -right-1 flex size-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                  <span className="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                                </span>
                              </div>

                              <div className="text-primary font-bold text-xs sm:text-sm tracking-wide">
                                Pendiente FirmaEC (Paso 6)
                              </div>

                              <div className="w-full border-t border-primary/25 pt-3 flex flex-col items-center text-center">
                                <span className="font-bold font-heading text-primary block text-sm sm:text-base">
                                  Suscripción Electrónica Oficial
                                </span>
                                <span className="text-[11px] text-muted-foreground block mt-0.5">
                                  Validez jurídica mediante FirmaEC
                                </span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Navegación de Paso 5 */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                      <Link href="/login" className="w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="neutral"
                          size="default"
                          className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                        >
                          <ArrowLeft className="size-4" />
                          <span>Volver al acceso principal</span>
                        </Button>
                      </Link>

                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <Button
                          type="button"
                          variant="secondary"
                          size="default"
                          onClick={() => handleVolverYCorregir(4)}
                          className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                        >
                          <ArrowLeft className="size-4 shrink-0" />
                          <span>Volver y corregir</span>
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={() => {
                            setStep(6);
                            if (bpmState === "DRAFT") {
                              setBpmState("PENDIENTE_FIRMA");
                            }
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                        >
                          <span className="whitespace-nowrap">Continuar a firma</span>
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASO 6: FIRMA Y ENVÍO ── */}
              {step === 6 && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs w-full">
                    {/* Cabecera Paso 6 */}
                    <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                          <ShieldCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                          <span>Paso 6 — Firma Electrónica y Envío</span>
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Suscripción digital mediante FirmaEC y remisión formal del Anexo A al área de Gestión de la DINARP.
                        </p>
                      </div>
                      <Badge
                        tone={
                          bpmState === "EN_REVISION" ? "info" :
                          bpmState === "FIRMADO" ? "success" :
                          bpmState === "FIRMA_RECHAZADA" || bpmState === "FIRMA_CADUCADA" || bpmState === "FIRMA_DESCONOCIDA" ? "danger" :
                          bpmState === "EN_PROCESO" ? "warning" : "warning"
                        }
                        appearance="soft"
                        size="sm"
                        className="font-bold text-[10px] uppercase tracking-wider shrink-0 self-start sm:self-auto rounded-full px-3 py-1"
                      >
                        {bpmState === "EN_REVISION" && "ENVIADO A GESTIÓN"}
                        {bpmState === "FIRMADO" && "FIRMA CONFIRMADA"}
                        {(bpmState === "FIRMA_RECHAZADA" || bpmState === "FIRMA_CADUCADA" || bpmState === "FIRMA_DESCONOCIDA") && "FIRMA NO CONFIRMADA"}
                        {bpmState === "EN_PROCESO" && "FIRMA EN PROCESO"}
                        {bpmState === "PENDIENTE_FIRMA" && "PENDIENTE DE FIRMA"}
                        {bpmState === "DRAFT" && "PENDIENTE DE FIRMA"}
                      </Badge>
                    </div>

                    {/* 1. Identificación Breve del Documento */}
                    <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <FileText className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-bold text-foreground">
                              ARP-R01_Solicitud_Acceso_SINARP.pdf
                            </h3>
                            <Badge tone="neutral" appearance="outline" size="sm" className="font-mono text-[10px]">
                              ARP-R01
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Expediente: <span className="font-mono font-semibold text-foreground">EXP-ARP-2026-0042</span> · 312 KB
                          </p>
                        </div>
                      </div>

                      {/* 2. Estado Actual y Contenido según estado */}

                      {/* CASO A: EN_REVISION (Enviado a Gestión con éxito) */}
                      {bpmState === "EN_REVISION" && (
                        <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-300">
                          <Alert
                            variant="success"
                            className="flex flex-col items-center justify-center text-center p-6 sm:p-8 gap-3.5 rounded-2xl [&_.alert-line]:hidden [&_.alert-icon]:size-14 sm:[&_.alert-icon]:size-16 [&_.alert-icon]:rounded-2xl [&_.alert-icon_svg]:size-7 sm:[&_.alert-icon_svg]:size-8 [&_.alert-icon]:shadow-sm [&_.alert-icon]:mb-1 [&_.alert-title]:text-center [&_.alert-title]:text-base sm:[&_.alert-title]:text-lg [&_.alert-title]:font-bold [&_.alert-title]:font-heading [&>div:last-of-type]:text-center [&>div:last-of-type]:items-center [&>div:last-of-type]:w-full"
                            icon={<CheckCircle2 className="size-7 sm:size-8" />}
                            title="¡Solicitud Enviada Exitosamente a Gestión!"
                          >
                            <div className="space-y-4 mt-1 w-full max-w-lg mx-auto text-center">
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                El Anexo A y el expediente de registro para <strong className="text-foreground">{formData.nombreEntidad}</strong> han sido recibidos por el equipo de Gestión de la DINARP.
                              </p>

                              <div className="p-3.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 text-xs space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-muted-foreground">Número de Expediente:</span>
                                  <strong className="font-mono text-foreground font-bold text-xs">EXP-ARP-2026-0042</strong>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-muted-foreground">Estado del trámite:</span>
                                  <span className="text-info font-bold uppercase text-[10px]">EN REVISIÓN TÉCNICA</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="default"
                                  onClick={handleDescargarDocumentoFirmado}
                                  className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                                >
                                  <Download className="size-3.5" />
                                  <span>Descargar documento firmado</span>
                                </Button>
                                <Link href="/login" className="w-full sm:w-auto">
                                  <Button
                                    type="button"
                                    variant="primary"
                                    size="default"
                                    className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                                  >
                                    <span>Volver al acceso principal</span>
                                    <ArrowRight className="size-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </Alert>
                        </div>
                      )}

                      {/* CASO B: FIRMADO (Firma confirmada / Envío pendiente) */}
                      {bpmState === "FIRMADO" && (
                        <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-300">
                          <Alert
                            variant="success"
                            className="flex flex-col items-center justify-center text-center p-6 sm:p-7 gap-3.5 rounded-2xl [&_.alert-line]:hidden [&_.alert-icon]:size-12 [&_.alert-icon]:rounded-2xl [&_.alert-icon_svg]:size-6 [&_.alert-title]:text-center [&_.alert-title]:text-base [&_.alert-title]:font-bold [&_.alert-title]:font-heading [&>div:last-of-type]:text-center [&>div:last-of-type]:items-center [&>div:last-of-type]:w-full"
                            icon={<CheckCircle2 className="size-6" />}
                            title="Firma Electrónica Confirmada por FirmaEC"
                          >
                            <div className="space-y-4 mt-1 w-full max-w-lg mx-auto text-center">
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                El formulario oficial Anexo A ha sido firmado digitalmente por <strong className="text-foreground">{formData.representanteLegalNombre}</strong>. El documento cuenta con plena validez jurídica.
                              </p>

                              {/* Metadatos del certificado */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left p-3.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 text-xs">
                                <div>
                                  <span className="text-muted-foreground text-[10px] block">Fecha y Hora:</span>
                                  <strong className="font-mono text-foreground text-[11px]">{signatureInfo.fechaHora}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-[10px] block">Serie Certificado / ID:</span>
                                  <strong className="font-mono text-foreground text-[11px]">{signatureInfo.identificador}</strong>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-[10px] block">Entidad Certificadora:</span>
                                  <span className="text-foreground text-[11px] font-medium">Banco Central del Ecuador</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground text-[10px] block">Integridad SHA-256:</span>
                                  <span className="font-mono text-[10px] text-muted-foreground truncate block">a7f92e...4d18</span>
                                </div>
                              </div>
                            </div>
                          </Alert>

                          {/* Banner de Envío Pendiente */}
                          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 text-xs">
                            <div className="flex items-center gap-2 font-bold text-primary text-xs">
                              <Send className="size-4 shrink-0" />
                              <span>Paso final: Envío a Gestión de la DINARP</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              El documento se encuentra firmado. Haz clic en <strong>"Enviar solicitud a Gestión"</strong> para remitir formalmente el expediente de acceso. Una vez enviado, la edición quedará bloqueada en análisis técnico.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* CASO C: FIRMA NO CONFIRMADA (Rechazada, Caducada o Desconocida) */}
                      {(bpmState === "FIRMA_RECHAZADA" || bpmState === "FIRMA_CADUCADA" || bpmState === "FIRMA_DESCONOCIDA") && (
                        <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                          <Alert
                            variant="danger"
                            icon={<AlertTriangle className="size-4" />}
                            title="Firma electrónica no confirmada"
                          >
                            {firmaFallo?.motivo || "No se pudo confirmar la firma digital del Anexo A mediante FirmaEC."}
                          </Alert>

                          {/* Metadatos de contingencia */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-3.5 rounded-xl bg-surface/80 dark:bg-surface/50 border border-border text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground text-[11px]">Diagnóstico FirmaEC:</span>
                              <Badge tone="danger" appearance="soft" size="sm" className="font-bold uppercase text-[10px]">
                                {bpmState === "FIRMA_RECHAZADA" && "Certificado Inválido o Cancelado"}
                                {bpmState === "FIRMA_CADUCADA" && "Plazo de 48h Expirado"}
                                {bpmState === "FIRMA_DESCONOCIDA" && "Fallo de Conexión"}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground text-[11px]">Código de Operación:</span>
                              <strong className="font-mono text-foreground text-xs">{firmaFallo?.transaccionId || "FEC-OP-2026-092942"}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground text-[11px]">Borrador del Anexo A:</span>
                              <span className="text-success font-semibold text-[11px] flex items-center gap-1">
                                <Check className="size-3" /> Conservado intacto
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground text-[11px]">Reintento disponible:</span>
                              <span className="text-foreground font-semibold text-[11px]">Inmediato (sin duplicar)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CASO D: FIRMA EN PROCESO */}
                      {bpmState === "EN_PROCESO" && (
                        <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                          <div className="p-4 rounded-xl border border-secondary/25 bg-secondary/5 space-y-2 text-xs">
                            <div className="flex items-center gap-2 font-bold text-secondary">
                              <Mail className="size-4 shrink-0" />
                              <span>Operación enviada a FirmaEC / Notificación remitida</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                              Se ha remitido la solicitud de firma digital al correo <strong className="text-foreground font-semibold">{formData.representanteLegalEmail || "del representante legal"}</strong>.
                            </p>
                            <p className="text-[11px] font-semibold text-secondary flex items-center gap-1.5 pt-1">
                              <RefreshCw className="size-3.5 animate-spin shrink-0" />
                              <span>Esperando que el firmante complete el proceso en la aplicación FirmaEC o con token digital.</span>
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <LoadingSpinner size="sm" className="size-3.5 text-primary shrink-0" />
                              <span className="text-[11px] font-medium">Monitoreando estado de firma en vivo...</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleConsultarEstadoFirma}
                              disabled={isCheckingFirma}
                              className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                            >
                              <RefreshCw className={cn("size-3.5", isCheckingFirma && "animate-spin")} />
                              <span>{isCheckingFirma ? "Consultando FirmaEC..." : "Consultar estado de firma"}</span>
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* CASO E: PENDIENTE DE FIRMA (Inicial en Paso 6) */}
                      {(bpmState === "PENDIENTE_FIRMA" || bpmState === "DRAFT") && (
                        <div className="pt-2 border-t border-border/60 space-y-4 animate-in fade-in duration-200">
                          <Alert
                            variant="info"
                            icon={<ShieldCheck className="size-4" />}
                            title="Listo para suscripción digital"
                          >
                            El borrador del Anexo A ha sido validado y consolidado. Inicia el proceso con FirmaEC para que {formData.esDelegado ? "el delegado institucional autorizado" : "la máxima autoridad institucional"} suscriba digitalmente el documento.
                          </Alert>

                          {/* Datos del firmante */}
                          <div className="p-4 rounded-xl bg-surface border border-border space-y-3 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                                Firmante Autorizado Designado
                              </span>
                              <Badge tone="primary" appearance="soft" size="sm" className="w-fit text-[10px] font-semibold">
                                {formData.esDelegado ? "Delegado Autorizado" : "Máxima Autoridad Institucional"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Nombre:</span>
                                <p className="font-semibold text-foreground text-xs">{formData.representanteLegalNombre || "—"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Cargo:</span>
                                <p className="font-semibold text-foreground text-xs">{formData.representanteLegalCargo || "—"}</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground block">Correo de Notificación:</span>
                                <p className="font-semibold text-foreground text-xs">{formData.representanteLegalEmail || "—"}</p>
                              </div>
                            </div>
                            {formData.esDelegado && (
                              <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                                <FileText className="size-3.5 text-primary shrink-0" />
                                <span>Acto administrativo de delegación:</span>
                                <strong className="font-mono text-foreground font-medium">
                                  {formData.archivoSoporteDelegacion || "Resolución / Autorización de delegación adjunta"}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Acciones Finales / Barra de Navegación del Paso 6 */}
                    {bpmState !== "EN_REVISION" && (
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                        <Link href="/login" className="w-full sm:w-auto">
                          <Button
                            type="button"
                            variant="neutral"
                            size="default"
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                          >
                            <ArrowLeft className="size-4" />
                            <span>Volver al acceso principal</span>
                          </Button>
                        </Link>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                          {bpmState !== "FIRMADO" && (
                            <Button
                              type="button"
                              variant="secondary"
                              size="default"
                              onClick={() => handleVolverYCorregir(5)}
                              className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                            >
                              <ArrowLeft className="size-4 shrink-0" />
                              <span>Volver a revisar borrador</span>
                            </Button>
                          )}

                          {(bpmState === "PENDIENTE_FIRMA" || bpmState === "DRAFT") && (
                            <Button
                              type="button"
                              variant="primary"
                              size="default"
                              onClick={handleIniciarFirmaEC}
                              className="text-xs font-semibold gap-2 w-full sm:w-auto shadow-xs whitespace-nowrap px-6"
                            >
                              <ShieldCheck className="size-4" />
                              <span>Iniciar firma con FirmaEC</span>
                            </Button>
                          )}

                          {(bpmState === "FIRMA_RECHAZADA" || bpmState === "FIRMA_CADUCADA" || bpmState === "FIRMA_DESCONOCIDA") && (
                            <Button
                              type="button"
                              variant="primary"
                              size="default"
                              onClick={handleIniciarFirmaEC}
                              className="text-xs font-semibold gap-1.5 w-full sm:w-auto shadow-xs whitespace-nowrap px-6"
                            >
                              <RefreshCw className="size-3.5" />
                              <span>Reintentar firma con FirmaEC</span>
                            </Button>
                          )}

                          {bpmState === "FIRMADO" && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={handleDescargarDocumentoFirmado}
                                className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                              >
                                <Download className="size-3.5" />
                                <span>Descargar PDF</span>
                              </Button>

                              <Button
                                type="button"
                                variant="primary"
                                size="default"
                                onClick={handleEnviarSolicitudFinal}
                                disabled={isSubmitting}
                                className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                              >
                                {isSubmitting ? (
                                  <span>Enviando a Gestión...</span>
                                ) : (
                                  <>
                                    <span className="whitespace-nowrap">Enviar solicitud a Gestión</span>
                                    <Check className="size-4" />
                                  </>
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
</form>
          </div>
        
      </main>

      {/* Botones flotantes para Demo */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        {showDemoToolbar ? (
          <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
              <Sparkles className="size-3 text-primary shrink-0" />
              <span>Demo</span>
            </div>

            {step <= 4 && (
              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={handleSimulateFill}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 shadow-xs"
              >
                <Sparkles className="size-3.5" /> Llenar campos automáticamente
              </Button>
            )}

            {step === 0 && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => {
                    setRucError(true);
                    setFormData({ ...formData, rucEntidad: "1111111111111" });
                    toast.error("No encontramos una institución asociada a este RUC.\nVerifica el número e inténtalo nuevamente.");
                  }}
                  className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                >
                  <Sparkles className="size-3.5 text-muted-foreground" /> Demo: RUC No Encontrado
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => {
                    setRucError(true);
                    setFormData({ ...formData, rucEntidad: "2222222222222" });
                    toast.error("No pudimos validar el RUC en este momento. Inténtalo nuevamente.");
                  }}
                  className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                >
                  <Sparkles className="size-3.5 text-muted-foreground" /> Demo: Error Técnico
                </Button>
              </>
            )}

            {step === 5 && (
              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={() => {
                  setStep(6);
                  setBpmState("PENDIENTE_FIRMA");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 shadow-xs"
              >
                <ArrowRight className="size-3.5" /> Demo: Ir a Firma y Envío
              </Button>
            )}

            {step === 6 && (
              <>
                <Button type="button" variant="success" size="default" onClick={handleSimulateFirmaSuccess} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                  <Sparkles className="size-3.5" /> Demo: Firma confirmada
                </Button>
                <Button type="button" variant="danger" size="default" onClick={() => handleSimulateFirmaRechazada()} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                  <Sparkles className="size-3.5" /> Demo: Firma rechazada
                </Button>
                <Button type="button" variant="warning" size="default" onClick={handleSimulateFirmaCaducada} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                  <Sparkles className="size-3.5" /> Demo: Firma caducada
                </Button>
                <Button type="button" variant="outline" size="default" onClick={handleSimulateFirmaDesconocida} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                  <Sparkles className="size-3.5" /> Demo: Fallo FirmaEC
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={() => {
                    setBpmState("PENDIENTE_FIRMA");
                    setIsSigned(false);
                    persistAnexoA("PENDIENTE_FIRMA");
                    toast.info("Estado reiniciado", {
                      description: "Documento en estado inicial Pendiente de firma.",
                    });
                  }}
                  className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                >
                  <Clock className="size-3.5" /> Demo: Pendiente de firma
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowDemoToolbar(false)}
              className="rounded-full size-8 shrink-0 hover:bg-muted text-muted-foreground hover:text-foreground ml-0.5"
              title="Ocultar opciones de simulación"
            >
              <ChevronDown className="size-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDemoToolbar(true)}
            className="rounded-full px-3.5 py-1.5 shadow-lg flex items-center gap-2 text-xs bg-surface/95 backdrop-blur-md border border-border hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            title="Desplegar opciones de simulación"
          >
            <Sparkles className="size-3.5 text-primary" />
            <span className="font-semibold text-foreground">Opciones de simulación</span>
            <ChevronUp className="size-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>

      {/* Modal Visor de Documento Anexo A */}
      <Dialog open={showDocPreviewModal} onOpenChange={setShowDocPreviewModal}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge tone="primary" appearance="soft" size="sm">
                Documento Oficial SINARP
              </Badge>
              <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                ARP-R01
              </Badge>
            </div>
            <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground mt-1">
              Vista Previa — Anexo A: Solicitud de Acceso al SINARP
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Formulario de acreditación de institución, coordinadores y servicios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-4 sm:p-6 bg-surface border border-border rounded-xl space-y-4 text-xs shadow-inner">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
                <div className="space-y-0.5">
                  <p className="font-bold text-xs sm:text-sm text-foreground">DIRECCIÓN NACIONAL DE REGISTROS PÚBLICOS</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">FORMULARIO ANEXO A — SOLICITUD DE ACCESO AL SINARP</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono text-muted-foreground block">EXPEDIENTE N°</span>
                  <span className="font-mono font-bold text-foreground">EXP-ARP-2026-0042</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Institución:</span>
                  <p className="font-semibold text-foreground break-words">{formData.nombreEntidad || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">RUC:</span>
                  <p className="font-mono font-semibold text-foreground break-all">{formData.rucEntidad || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Representante Legal / Firmante:</span>
                  <p className="font-semibold text-foreground break-words">{formData.representanteLegalNombre || "—"}</p>
                  {formData.representanteLegalCargo && (
                    <p className="text-[11px] text-muted-foreground break-words">{formData.representanteLegalCargo}</p>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Coordinador Titular:</span>
                  <p className="font-semibold text-foreground break-words">{formData.titularNombreCompleto || "—"}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">CI: {formData.titularCedula || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 sm:gap-3 w-full">
            <Button
              type="button"
              variant="neutral"
              size="sm"
              onClick={() => setShowDocPreviewModal(false)}
              className="text-xs font-semibold px-4 w-full sm:w-auto"
            >
              Cerrar visor
            </Button>
            {bpmState === "FIRMADO" && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleDescargarDocumentoFirmado}
                className="text-xs font-semibold px-4 gap-1.5 w-full sm:w-auto"
              >
                <Download className="size-3.5" />
                <span>Descargar PDF firmado</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para evitar modificación silenciosa de documento firmado */}
      <Dialog open={showConfirmInvalidateModal} onOpenChange={setShowConfirmInvalidateModal}>
        <DialogContent variant="warning" size="default" className="w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-lg font-bold font-heading text-foreground">
              El documento ya cuenta con firma electrónica
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              El Anexo A ya fue suscrito digitalmente mediante FirmaEC. Si regresas a corregir los datos de pasos anteriores, <strong>la firma actual será anulada</strong> y el documento deberá ser firmado nuevamente antes del envío formal a Gestión.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3 w-full pt-4">
            <Button
              type="button"
              variant="neutral"
              size="default"
              onClick={() => {
                setShowConfirmInvalidateModal(false);
                setPendingTargetStep(null);
              }}
              className="w-full sm:w-auto text-xs font-semibold px-4"
            >
              Cancelar y conservar firma
            </Button>
            <Button
              type="button"
              variant="warning"
              size="default"
              onClick={confirmInvalidateAndNavigate}
              className="w-full sm:w-auto text-xs font-semibold px-5 whitespace-nowrap"
            >
              Anular firma y editar datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
