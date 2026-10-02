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
  ChevronDown
} from "lucide-react";

import { Alert } from "@/components/ui/alert";

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

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bpmState, setBpmState] = useState<"DRAFT" | "PENDIENTE_FIRMA" | "FIRMADO" | "EN_REVISION" | "FIRMA_RECHAZADA" | "FIRMA_CADUCADA" | "FIRMA_DESCONOCIDA">("DRAFT");
  const [showDocPreviewModal, setShowDocPreviewModal] = useState(false);
  const [isCheckingFirma, setIsCheckingFirma] = useState(false);
  const [readOnlyTab, setReadOnlyTab] = useState<number>(0);
  const [rucError, setRucError] = useState(false);
  const [showDemoToolbar, setShowDemoToolbar] = useState(true);

  const stepsList: StepperStep[] = [
    { id: "1", title: "Entidad", description: "Datos y autoridad", icon: Building2 },
    { id: "2", title: "Coordinadores", description: "Titular y suplente", icon: User },
    { id: "3", title: "Servicios", description: "Áreas y herramientas", icon: FileText },
    { id: "4", title: "Declaraciones y firma", description: "Certificación digital", icon: ShieldCheck },
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

  const persistAnexoA = (nextBpm: "DRAFT" | "PENDIENTE_FIRMA" | "FIRMADO" | "EN_REVISION" | "FIRMA_RECHAZADA" | "FIRMA_CADUCADA" | "FIRMA_DESCONOCIDA", currentForm = formData) => {
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
    setBpmState("FIRMADO");
    persistAnexoA("FIRMADO");
    agregarRegistroInstitucion(formData, "PENDIENTE_ENVIO");
    toast.success("Firma electrónica verificada", {
      description: "FirmaEC confirmó la firma digital válida. Para completar el registro, debes enviar la solicitud a Gestión.",
    });
  };

  const handleSimulateFirmaRechazada = (motivo = "Certificado revocado o no reconocido por la entidad de certificación en FirmaEC") => {
    setBpmState("FIRMA_RECHAZADA");
    persistAnexoA("FIRMA_RECHAZADA");
    toast.error("No se pudo completar la firma", {
      description: (
        <div className="space-y-1 mt-1 text-xs">
          <p>
            FirmaEC no validó la operación de firma. El Anexo A continúa guardado como borrador y no ha sido enviado a Gestión.
          </p>
          <p className="font-semibold text-foreground/90">
            Motivo: {motivo}
          </p>
        </div>
      ),
      action: {
        label: "Intentar nuevamente",
        onClick: () => handleSolicitarNuevaFirma(),
      },
      duration: 8000,
    });
  };

  const handleSimulateFirmaCaducada = () => {
    setBpmState("FIRMA_CADUCADA");
    persistAnexoA("FIRMA_CADUCADA");
    toast.warning("Firma caducada", {
      description: "El plazo límite de firma en FirmaEC ha expirado. El Anexo A se conserva como borrador.",
      action: {
        label: "Intentar nuevamente",
        onClick: () => handleSolicitarNuevaFirma(),
      },
    });
  };

  const handleSimulateFirmaDesconocida = () => {
    setBpmState("FIRMA_DESCONOCIDA");
    persistAnexoA("FIRMA_DESCONOCIDA");
    toast.info("No se pudo confirmar la firma", {
      description: "No se pudo sincronizar el estado de la operación con FirmaEC. Consulta el estado antes de un nuevo intento.",
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
        {["PENDIENTE_FIRMA", "FIRMADO", "EN_REVISION", "FIRMA_RECHAZADA", "FIRMA_CADUCADA", "FIRMA_DESCONOCIDA"].includes(bpmState) && (
          /* â”€â”€ CONTENEDOR MAESTRO UNIFICADO: MIGA DE PAN Y LAS DOS COLUMNAS ADENTRO APROVECHANDO EL ANCHO â”€â”€ */
          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xs space-y-5 animate-in fade-in duration-300 w-full">
            {/* Barra superior de navegación y código de expediente */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/login" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
                  <Home className="size-3.5" />
                  <span>Portal de Acceso</span>
                </Link>
                <span>/</span>
                <span className="text-muted-foreground">Solicitud de enrolamiento</span>
                <span>/</span>
                <span className="text-foreground font-semibold">Anexo A Solicitud de Registro de Institución</span>
              </nav>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                  EXP-ARP-2026-0042
                </Badge>
                <Badge tone="neutral" appearance="soft" size="sm">
                  Formulario ARP-R01
                </Badge>
              </div>
            </div>

            {/* Layout de dos columnas: ~65% Izquierda (Anexo A) / ~35% Derecha (Estado de la Firma) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* â”€â”€ COLUMNA IZQUIERDA (65% -> lg:col-span-8): ANEXO A EN UN CONTENEDOR UNIFICADO â”€â”€ */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-4 order-2 lg:order-1">
                {/* â”€â”€ CONTENEDOR UNIFICADO DEL ANEXO A (TÍTULO, ESTADO, TABS Y CONTENIDO COMPLETO) â”€â”€ */}
                <div className="space-y-6">
                  {/* Cabecera del Anexo A con Badge de Estado */}
                  <div className="space-y-4 pb-5 border-b border-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                          Anexo A
                        </h1>

                        {bpmState === "PENDIENTE_FIRMA" && (
                          <Badge tone="warning" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <Clock className="size-3 animate-spin text-white" />
                            <span className="text-white">Validando firma</span>
                          </Badge>
                        )}
                        {bpmState === "FIRMADO" && (
                          <Badge tone="warning" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <CheckCircle2 className="size-3 text-white" />
                            <span className="text-white">Firma verificada · Pendiente de envío</span>
                          </Badge>
                        )}
                        {bpmState === "EN_REVISION" && (
                          <Badge tone="info" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <Clock className="size-3 text-white" />
                            <span className="text-white">En revisión de Gestión</span>
                          </Badge>
                        )}
                        {bpmState === "FIRMA_RECHAZADA" && (
                          <Badge tone="danger" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <XCircle className="size-3 text-white" />
                            <span className="text-white">Firma no completada</span>
                          </Badge>
                        )}
                        {bpmState === "FIRMA_CADUCADA" && (
                          <Badge tone="warning" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <Clock className="size-3 text-white" />
                            <span className="text-white">Firma caducada</span>
                          </Badge>
                        )}
                        {bpmState === "FIRMA_DESCONOCIDA" && (
                          <Badge tone="neutral" appearance="solid" size="md" className="gap-1.5 text-white font-medium">
                            <HelpCircle className="size-3 text-white" />
                            <span className="text-white">No se pudo confirmar la firma</span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Formulario oficial de enrolamiento y solicitud de acceso al SINARP · Modo solo lectura
                      </p>
                    </div>

                    {/* Banner de Modo Solo Lectura */}
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-foreground">
                      <Lock className="size-4 text-muted-foreground shrink-0" />
                      <span>
                        {bpmState === "EN_REVISION"
                          ? "Anexo A enviado a Gestión · Edición bloqueada definitivamente. Tu trámite se encuentra en proceso de análisis técnico."
                          : "Modo solo lectura · El Anexo A se encuentra en proceso de firma y no puede ser modificado mientras esté en curso."}
                      </span>
                    </div>

                    {/* Pestañas Cápsula UI Kit para navegar los 4 pasos del Anexo A */}
                    <div className="overflow-x-auto pt-1">
                      <Tabs
                        value={`tab-${readOnlyTab}`}
                        onValueChange={(val) => setReadOnlyTab(Number(val.replace("tab-", "")))}
                        className="w-full"
                      >
                        <TabsList className="h-auto p-1.5 rounded-full bg-background border border-border/40 inline-flex gap-1.5 flex-nowrap w-full sm:w-auto justify-start">
                          <TabsTrigger
                            value="tab-0"
                            className="px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&_svg]:text-primary-foreground"
                          >
                            <Building2 className="size-3.5 shrink-0" />
                            <span>1. Entidad y autoridad</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="tab-1"
                            className="px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&_svg]:text-primary-foreground"
                          >
                            <User className="size-3.5 shrink-0" />
                            <span>2. Coordinadores</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="tab-2"
                            className="px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&_svg]:text-primary-foreground"
                          >
                            <FileText className="size-3.5 shrink-0" />
                            <span>3. Servicios y procesos</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="tab-3"
                            className="px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:[&_svg]:text-primary-foreground"
                          >
                            <ShieldCheck className="size-3.5 shrink-0" />
                            <span>4. Declaraciones y firma</span>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </div>

                  {/* CONTENIDO DEL TAB ACTIVO DENTRO DEL MISMO CONTENEDOR */}
                  <div className="space-y-6">
                    {/* â”€â”€ TAB 0: ENTIDAD Y AUTORIDAD (DENTRO DE CONTENEDOR) â”€â”€ */}
                    {readOnlyTab === 0 && (
                      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                        {/* Cabecera de Sección I */}
                        <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                              <Building2 className="size-5 text-primary dark:text-primary-300 shrink-0" />
                              <span>Sección I — Datos de la Institución y Máxima Autoridad</span>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Información de identificación de la institución solicitante y de su máxima autoridad o delegado.
                            </p>
                          </div>
                          <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs">
                            {formData.entidadTipo === "Privada" ? "ENTIDAD PRIVADA" : "ENTIDAD PÚBLICA"}
                          </Badge>
                        </div>

                        {/* Naturaleza y Datos de la Entidad */}
                        <div className="space-y-4">

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
                            <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                              <Label className="text-xs font-semibold text-foreground">
                                Naturaleza de la Entidad
                              </Label>
                              <RadioGroup
                                orientation="horizontal"
                                value={formData.entidadTipo}
                                disabled
                                className="flex flex-wrap gap-4 sm:gap-6 pt-1 opacity-80 cursor-not-allowed"
                              >
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="Publica" id="ro-entidad-publica" disabled />
                                  <Label htmlFor="ro-entidad-publica" className="text-xs font-medium cursor-not-allowed">
                                    Entidad Pública
                                  </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <RadioGroupItem value="Privada" id="ro-entidad-privada" disabled />
                                  <Label htmlFor="ro-entidad-privada" className="text-xs font-medium cursor-not-allowed">
                                    Entidad Privada
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="ro-nombreEntidad" className="text-xs font-semibold text-foreground">
                                Nombre de la Entidad
                              </Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-nombreEntidad"
                                  value={formData.nombreEntidad || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="ro-rucEntidad" className="text-xs font-semibold text-foreground">
                                RUC de la Entidad (13 dígitos)
                              </Label>
                              <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-rucEntidad"
                                  value={formData.rucEntidad || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground font-semibold"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <Label htmlFor="ro-direccionEntidad" className="text-xs font-semibold text-foreground">
                                Dirección de la Entidad
                              </Label>
                              <InputGroup leftIcon={<Home className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-direccionEntidad"
                                  value={formData.direccionEntidad || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <Label htmlFor="ro-objetoSocial" className="text-xs font-semibold text-foreground">
                                Objeto Social y/o Misión Institucional
                              </Label>
                              <Textarea
                                id="ro-objetoSocial"
                                value={formData.objetoSocial || "—"}
                                disabled
                                rows={3}
                                className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3 border-border/80"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Datos del firmante del Anexo A */}
                        <div className="bg-muted/15 border border-border/70 rounded-2xl p-5 sm:p-6 space-y-4">
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
                                ¿Quién firmará el Anexo A?
                              </Label>
                              <RadioGroup
                                value={formData.esDelegado ? "delegado" : "autoridad"}
                                disabled
                                className="flex flex-col sm:flex-row gap-4 opacity-80 cursor-not-allowed"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="autoridad" id="ro-autoridad" disabled />
                                  <Label htmlFor="ro-autoridad" className="text-xs font-medium cursor-not-allowed">
                                    Máxima autoridad institucional
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="delegado" id="ro-delegado" disabled />
                                  <Label htmlFor="ro-delegado" className="text-xs font-medium cursor-not-allowed">
                                    Delegado de la máxima autoridad
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="ro-repNombre" className="text-xs font-semibold text-foreground">
                                Nombre completo
                              </Label>
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-repNombre"
                                  value={formData.representanteLegalNombre || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label htmlFor="ro-repCargo" className="text-xs font-semibold text-foreground">
                                Denominación del cargo
                              </Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-repCargo"
                                  value={formData.representanteLegalCargo || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                              <Label htmlFor="ro-repEmail" className="text-xs font-semibold text-foreground">
                                Correo electrónico institucional
                              </Label>
                              <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="ro-repEmail"
                                  type="email"
                                  value={formData.representanteLegalEmail || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>

                            {formData.esDelegado && (
                              <div className="flex flex-col gap-2 sm:col-span-2 mt-2">
                                <Label className="text-xs font-semibold text-foreground">
                                  Autorización de delegación
                                </Label>
                                <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="size-4 text-primary shrink-0" />
                                    <span className="text-xs font-semibold text-foreground truncate">
                                      {formData.archivoSoporteDelegacion || "Documento_Delegacion_Firmado.pdf"}
                                    </span>
                                  </div>
                                  <Badge tone="success" appearance="soft" size="sm" className="shrink-0 gap-1 font-medium">
                                    <CheckCircle2 className="size-3 text-success" />
                                    <span>Adjuntado</span>
                                  </Badge>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* â”€â”€ TAB 1: COORDINADORES (DENTRO DE CONTENEDOR) â”€â”€ */}
                    {readOnlyTab === 1 && (
                      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                        {/* Cabecera de Coordinadores */}
                        <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                        {/* Coordinador Titular */}
                        <div className="space-y-4">
                          <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <User className="size-4 text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                                  1.2 Coordinador Institucional Principal (Titular)
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Datos del coordinador institucional titular designado por la entidad.
                                </p>
                              </div>
                            </div>
                            <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                              TITULAR
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Nombre Completo</Label>
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularNombreCompleto || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía</Label>
                              <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularCedula || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground font-semibold"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularCargo || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularAreaUnidad || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional</Label>
                              <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularEmail || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularTelefonoFijo || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularMovilInstitucional || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Personal</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.titularMovilPersonal || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>
                          </div>
                        </div>

                        {/* Coordinador Suplente */}
                        <div className="space-y-4 pt-4 border-t border-border/60">
                          <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <User className="size-4 text-primary shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold font-heading text-foreground leading-snug">
                                  1.3 Coordinador Institucional Suplente
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Datos del coordinador institucional alterno registrado para soporte institucional.
                                </p>
                              </div>
                            </div>
                            <Badge tone="primary" appearance="soft" size="sm" className="shrink-0 self-start sm:self-auto">
                              SUPLENTE
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Nombre Completo</Label>
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteNombreCompleto || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-semibold text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cédula de Ciudadanía</Label>
                              <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteCedula || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground font-semibold"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Cargo / Rol en la Institución</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteCargo || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Área / Unidad a la que pertenece</Label>
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteAreaUnidad || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Correo Electrónico Institucional</Label>
                              <InputGroup leftIcon={<Mail className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteEmail || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Teléfono Fijo Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteTelefonoFijo || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Institucional</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteMovilInstitucional || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <Label className="text-xs font-semibold text-foreground">Móvil Personal</Label>
                              <InputGroup leftIcon={<Phone className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  value={formData.suplenteMovilPersonal || "—"}
                                  disabled
                                  className="bg-muted/30 cursor-not-allowed text-xs font-mono text-foreground"
                                />
                              </InputGroup>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* â”€â”€ TAB 2: SERVICIOS Y PROCESOS (DENTRO DE CONTENEDOR) â”€â”€ */}
                    {readOnlyTab === 2 && (
                      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                        {/* Cabecera de Sección II */}
                        <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                        <div className="flex flex-col gap-6">
                          {/* 2.1 Servicios */}
                          <div className="space-y-4">
                            <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 flex items-center justify-between rounded-xl">
                              <div>
                                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                                  <FileCheck2 className="size-4 text-primary" />
                                  2.1 Servicios y/o herramientas requeridas
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Servicios institucionales provistos por la DINARP solicitados en el trámite.
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
                              {["Interoperabilidad", "Infodigital", "Ficha de Registro Único del Ciudadano"].map((s) => (
                                <label
                                  key={s}
                                  className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card/60 cursor-not-allowed min-w-0"
                                >
                                  <Checkbox
                                    checked={formData.serviciosHerramientas.includes(s)}
                                    disabled
                                    className="shrink-0 cursor-not-allowed"
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
                                  2.2 Áreas de uso institucional
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Direcciones o departamentos donde se utilizarán las herramientas.
                                </p>
                              </div>
                            </div>

                            <Textarea
                              value={formData.areasUso || "—"}
                              disabled
                              rows={3}
                              className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3 border-border/80"
                            />
                          </div>

                          <Separator />

                          {/* 2.3 Procesos institucionales */}
                          <div className="space-y-4">
                            <div className="bg-primary/5 dark:bg-primary-950/20 border border-primary/15 dark:border-primary-800/30 p-3.5 flex items-center justify-between rounded-xl">
                              <div>
                                <h3 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                                  <FileText className="size-4 text-primary" />
                                  2.3 Procesos institucionales
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Actividades o trámites en los que se empleará la información provista por la DINARP.
                                </p>
                              </div>
                            </div>

                            <Textarea
                              value={formData.procesosUso || "—"}
                              disabled
                              rows={3}
                              className="bg-muted/30 cursor-not-allowed text-xs leading-relaxed text-foreground rounded-2xl p-3 border-border/80"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* â”€â”€ TAB 3: DECLARACIONES Y FIRMA (DENTRO DE CONTENEDOR) â”€â”€ */}
                    {readOnlyTab === 3 && (
                      <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                        {/* Cabecera de Sección III */}
                        <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                              <ShieldCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                              <span>Sección III — Declaraciones y Firma</span>
                            </h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Declaraciones correspondientes a la solicitud y formalización mediante la firma de la máxima autoridad o delegado.
                            </p>
                          </div>
                          <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                            FORMALIZACIÓN
                          </Badge>
                        </div>

                        <Card
                          variant="featured"
                          disableHover={true}
                          className={cn(
                            "border shadow-xs relative overflow-hidden mb-6",
                            bpmState === "FIRMADO"
                              ? "bg-success/15 dark:bg-success/25 border-success/40"
                              : bpmState === "EN_REVISION"
                              ? "bg-info/15 dark:bg-info/25 border-info/40"
                              : "bg-warning/15 dark:bg-warning/25 border-warning/40"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <CardBadge
                              className={cn(
                                "text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0 flex items-center gap-1.5",
                                bpmState === "FIRMADO"
                                  ? "bg-success/25 text-success"
                                  : bpmState === "EN_REVISION"
                                  ? "bg-info/25 text-info"
                                  : "bg-warning/25 text-warning"
                              )}
                            >
                              {bpmState === "FIRMADO" ? (
                                <>
                                  <CheckCircle2 className="size-3" />
                                  <span>Firma verificada</span>
                                </>
                              ) : bpmState === "EN_REVISION" ? (
                                <>
                                  <Clock className="size-3" />
                                  <span>En revisión</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3 animate-spin" />
                                  <span>Validando firma</span>
                                </>
                              )}
                            </CardBadge>
                          </div>

                          <CardTitle
                            className={cn(
                              "text-lg sm:text-xl font-bold font-heading",
                              bpmState === "FIRMADO" ? "text-success" : bpmState === "EN_REVISION" ? "text-info" : "text-warning"
                            )}
                          >
                            {bpmState === "FIRMADO"
                              ? "El Anexo A cuenta con firma verificada."
                              : bpmState === "EN_REVISION"
                              ? "El Anexo A fue enviado a Gestión."
                              : "El Anexo A se encuentra en proceso de validación de firma."}
                          </CardTitle>

                          <CardDescription className="text-xs text-muted-foreground max-w-3xl leading-relaxed font-normal">
                            {bpmState === "FIRMADO"
                              ? "FirmaEC confirmó la validez jurídica de la suscripción electrónica. Para completar el registro institucional, debes pulsar 'Enviar solicitud'."
                              : bpmState === "EN_REVISION"
                              ? "El documento fue remitido formalmente para revisión técnica de la DINARP. La edición está bloqueada definitivamente."
                              : "El documento fue remitido a FirmaEC para suscripción de la máxima autoridad o su delegado institucional."}
                          </CardDescription>

                          <CardDecorativeIcon className="-bottom-8 -right-8 opacity-25 group-hover/card:scale-100 hidden sm:block">
                            <FileCheck2
                              className={cn(
                                "size-36",
                                bpmState === "FIRMADO"
                                  ? "text-success"
                                  : bpmState === "EN_REVISION"
                                  ? "text-info"
                                  : "text-warning"
                              )}
                            />
                          </CardDecorativeIcon>
                        </Card>

                        {/* Bloque Legal de Declaraciones */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                          <h3 className="font-bold text-foreground text-sm">
                            2.2 Cláusula Segunda: Declaraciones del Solicitante
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            La entidad solicitante declara conocer los servicios provistos por la DINARP, así como los arts. 66 numerales 11 y 19 de la Constitución, art. 6 de la Ley Orgánica del Sistema Nacional de Registros Públicos, Ley de Optimización de Trámites, Ley Orgánica de Protección de Datos Personales, y arts. 178, 180 y 229 del COIP. La institución queda obligada a dar a la información el uso exclusivo para el que le sea concedido y custodiarla con prudencia.
                          </p>
                          <div className="flex items-start gap-3 pt-4 border-t border-border/60">
                            <Checkbox
                              id="ro-declaraciones"
                              checked={formData.declaracionesAceptadas}
                              disabled
                              className="shrink-0 mt-0.5 cursor-not-allowed"
                            />
                            <Label htmlFor="ro-declaraciones" className="text-xs font-bold text-foreground cursor-not-allowed">
                              Acepto expresamente las declaraciones legales, términos y responsabilidades del Anexo A.
                            </Label>
                          </div>
                        </div>

                        {/* Resumen de Firmante */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Card
                            variant="featured"
                            disableHover={true}
                            className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                          >
                            <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                              <User className="size-3.5 text-secondary" />
                              <span>Firmante Autorizado</span>
                            </CardBadge>

                            <div className="space-y-0.5 mt-2">
                              <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                                {formData.representanteLegalNombre || "—"}
                              </CardTitle>

                              <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium break-words">
                                {formData.representanteLegalCargo || "Representante Institucional"}
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
                              <Calendar className="size-3.5 text-secondary" />
                              <span>Fecha y Ciudad de Suscripción</span>
                            </CardBadge>

                            <div className="space-y-0.5 mt-2">
                              <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                                {formData.ciudadFirma || "Quito D.M., Ecuador"}
                              </CardTitle>

                              <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium">
                                {formData.fechaFirma || "Fecha de emisión y firma"}
                              </CardDescription>
                            </div>

                            <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                              <Calendar className="size-28 text-secondary" />
                            </CardDecorativeIcon>
                          </Card>
                        </div>

                        {/* Certificación de datos */}
                        <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
                          <Checkbox checked={formData.firmadoDigitalmente} disabled className="cursor-not-allowed" />
                          <span className="text-xs font-bold text-foreground">
                            Confirmo que la información ingresada es verídica y corresponde a los antecedentes institucionales.
                          </span>
                        </div>

                        {/* Certificación de Documento Firmado FirmaEC si aplica */}
                        {["FIRMADO", "EN_REVISION"].includes(bpmState) && (
                          <div className="p-5 rounded-2xl border border-success/30 bg-success/5 space-y-4 shadow-2xs">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div className="flex items-start gap-3.5 min-w-0">
                                <div className="p-2.5 rounded-xl bg-success/10 text-success shrink-0 mt-0.5">
                                  <CheckCircle2 className="size-5" />
                                </div>

                                <div className="space-y-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-mono font-bold text-xs sm:text-sm text-foreground">
                                      {formData.archivoDocumentoFirmado || `ARP-R01_Solicitud_Acceso_SINARP_${(formData.entidadSiglas || "ENTIDAD").toUpperCase()}.pdf`}
                                    </h4>
                                    <Badge tone="success" appearance="soft" size="sm" className="font-bold text-[10px] uppercase px-2 py-0.5 shrink-0">
                                      SE FIRMÓ EN FIRMA EC
                                    </Badge>
                                  </div>

                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    Documento oficial del formulario suscrito digitalmente por el Representante Legal mediante <strong className="text-foreground">FirmaEC</strong> con estampado cronológico y validez jurídica acreditada.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navegación inferior entre pasos / tabs del Anexo A */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-border/60">
                    {/* Botón único a la izquierda: Volver al acceso principal */}
                    <Link href="/login" className="w-full sm:w-auto inline-block">
                      <Button
                        type="button"
                        variant="neutral"
                        size="default"
                        className="text-xs font-semibold gap-2 w-full sm:w-auto"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span>Volver al acceso principal</span>
                      </Button>
                    </Link>

                    {/* Botones de navegación a la derecha: Paso anterior (secondary) al ladito del Siguiente (primary) */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto justify-end">
                      {readOnlyTab > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="default"
                          onClick={() => setReadOnlyTab((prev) => Math.max(0, prev - 1))}
                          className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4"
                        >
                          <ArrowLeft className="size-4 shrink-0" />
                          <span>Paso anterior</span>
                        </Button>
                      )}

                      {readOnlyTab < 3 && (
                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={() => setReadOnlyTab((prev) => Math.min(3, prev + 1))}
                          className="text-xs font-semibold gap-2 w-full sm:w-auto sm:min-w-[190px]"
                        >
                          <span>
                            {readOnlyTab === 0 && "Siguiente: 2. Coordinadores"}
                            {readOnlyTab === 1 && "Siguiente: 3. Servicios y procesos"}
                            {readOnlyTab === 2 && "Siguiente: 4. Declaraciones y firma"}
                          </span>
                          <ArrowRight className="size-4 shrink-0" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* â”€â”€ COLUMNA DERECHA (42% -> lg:col-span-5): ESTADO DE LA FIRMA FIRMAEC â”€â”€ */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4 order-1 lg:order-2">
                <div className="bg-muted/15 border border-border/80 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
                  {/* Encabezado del panel de firma */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <ShieldCheck className="size-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold font-heading text-foreground">Estado de la firma</h2>
                        <p className="text-[11px] text-muted-foreground">Seguimiento FirmaEC</p>
                      </div>
                    </div>

                    {bpmState === "PENDIENTE_FIRMA" && (
                      <Badge tone="warning" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <Clock className="size-3 text-white" />
                        <span className="text-white">Validando firma</span>
                      </Badge>
                    )}
                    {bpmState === "FIRMADO" && (
                      <Badge tone="success" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <CheckCircle2 className="size-3 text-white" />
                        <span className="text-white">Firma verificada</span>
                      </Badge>
                    )}
                    {bpmState === "EN_REVISION" && (
                      <Badge tone="info" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <Clock className="size-3 text-white" />
                        <span className="text-white">En revisión</span>
                      </Badge>
                    )}
                    {bpmState === "FIRMA_RECHAZADA" && (
                      <Badge tone="danger" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <XCircle className="size-3 text-white" />
                        <span className="text-white">Firma no completada</span>
                      </Badge>
                    )}
                    {bpmState === "FIRMA_CADUCADA" && (
                      <Badge tone="warning" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <AlertTriangle className="size-3 text-white" />
                        <span className="text-white">Firma caducada</span>
                      </Badge>
                    )}
                    {bpmState === "FIRMA_DESCONOCIDA" && (
                      <Badge tone="neutral" appearance="solid" size="sm" className="gap-1 text-white font-medium">
                        <HelpCircle className="size-3 text-white" />
                        <span className="text-white">No se pudo confirmar</span>
                      </Badge>
                    )}
                  </div>

                  {/* Alerta contextual según estado del proceso */}
                  {bpmState === "PENDIENTE_FIRMA" && (
                    <Alert
                      variant="info"
                      icon={<Clock className="size-4" />}
                      title="Esperando validación de firma"
                    >
                      El Anexo A fue enviado a firma electrónica. Estamos esperando la confirmación de FirmaEC. La solicitud todavía no ha sido enviada a Gestión.
                    </Alert>
                  )}

                  {bpmState === "FIRMADO" && (
                    <>
                      <Alert
                        variant="success"
                        icon={<CheckCircle2 className="size-4" />}
                        title="Firma electrónica verificada"
                      >
                        FirmaEC confirmó la validez jurídica de la firma digital de la autoridad.
                      </Alert>

                      {/* Bloque destacado Siguiente paso con animación sutil de onda de progreso */}
                      <div className="relative overflow-hidden p-4 rounded-xl border-2 border-primary/40 bg-primary/5 space-y-2">
                        {/* Onda de progreso suave que recorre el fondo de izquierda a derecha */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 -translate-x-full card-wave-bg animate-progress-wave"
                        />

                        {/* Contenido estático y legible */}
                        <div className="relative z-10 space-y-2">
                          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                            <ArrowRightCircle className="size-4 shrink-0 text-primary" />
                            <span>Siguiente paso</span>
                          </div>
                          <p className="text-xs text-foreground font-semibold leading-relaxed">
                            Para completar el registro, debes enviar la solicitud a Gestión.
                          </p>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            El documento cuenta con firma verificada, pero la revisión formal ante la DINARP iniciará únicamente al remitir el Anexo A.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {bpmState === "EN_REVISION" && (
                    <Alert
                      variant="info"
                      icon={<Clock className="size-4" />}
                      title="En revisión de Gestión"
                    >
                      El Anexo A fue enviado al área de Gestión de la DINARP. La edición ha sido bloqueada definitivamente.
                    </Alert>
                  )}

                  {bpmState === "FIRMA_RECHAZADA" && (
                    <Alert
                      variant="danger"
                      icon={<XCircle className="size-4" />}
                      title="Firma no completada"
                    >
                      <div className="space-y-1.5">
                        <p>
                          FirmaEC no validó la operación de firma. El Anexo A continúa guardado como borrador y no ha sido enviado a Gestión.
                        </p>
                        <p className="text-[11px] font-semibold text-foreground/90">
                          Motivo: Certificado no reconocido o firma cancelada en FirmaEC.
                        </p>
                      </div>
                    </Alert>
                  )}

                  {bpmState === "FIRMA_CADUCADA" && (
                    <Alert
                      variant="warning"
                      icon={<AlertTriangle className="size-4" />}
                      title="Firma caducada"
                    >
                      El tiempo límite asignado en FirmaEC para firmar el documento ha expirado. El Anexo A continúa guardado como borrador.
                    </Alert>
                  )}

                  {bpmState === "FIRMA_DESCONOCIDA" && (
                    <Alert
                      variant="warning"
                      icon={<HelpCircle className="size-4" />}
                      title="No se pudo confirmar la firma"
                    >
                      No se pudo sincronizar el estado de la operación con FirmaEC. Consulta el estado antes de un nuevo intento. El Anexo A continúa guardado como borrador.
                    </Alert>
                  )}

                  {/* Resumen del Firmante y Operación */}
                  <div className="bg-background/60 border border-border/60 rounded-xl p-4 space-y-2.5 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Firmante Autorizado
                      </span>
                      <p className="font-bold text-foreground break-words">
                        {formData.representanteLegalNombre || "—"}
                      </p>
                      {formData.representanteLegalCargo && (
                        <p className="text-[11px] text-muted-foreground break-words">
                          {formData.representanteLegalCargo}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Correo de Notificación FirmaEC
                      </span>
                      <p className="font-mono text-foreground text-[11px] break-all">
                        {formData.representanteLegalEmail || "—"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Fecha de Solicitud
                        </span>
                        <p className="font-medium text-foreground text-[11px]">
                          {formData.fechaFirma || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Ciudad
                        </span>
                        <p className="font-medium text-foreground text-[11px] break-words">
                          {formData.ciudadFirma || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Detalle específico según estado */}
                    {bpmState === "FIRMADO" && (
                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <span className="text-[10px] font-bold text-success uppercase tracking-wider block">
                          Certificado y Validación
                        </span>
                        <p className="text-[11px] text-foreground font-medium">
                          Certificado Digital Reconocido (BCE / FirmaEC)
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono break-all">
                          Hash SHA-256: 4f8b9e...d12a · Validado
                        </p>
                      </div>
                    )}

                    {bpmState === "FIRMA_RECHAZADA" && (
                      <div className="pt-2 border-t border-border/50 space-y-1 bg-danger/5 -mx-4 -mb-4 p-3 rounded-b-xl border-t-danger/20">
                        <span className="text-[10px] font-bold text-danger uppercase tracking-wider block">
                          Causa informada por FirmaEC
                        </span>
                        <p className="text-[11px] text-foreground font-medium">
                          Motivo: Certificado no reconocido o firma cancelada en FirmaEC.
                        </p>
                      </div>
                    )}

                    {bpmState === "FIRMA_CADUCADA" && (
                      <div className="pt-2 border-t border-border/50 space-y-1 bg-warning/5 -mx-4 -mb-4 p-3 rounded-b-xl border-t-warning/20">
                        <span className="text-[10px] font-bold text-warning uppercase tracking-wider block">
                          Límite de Vigencia
                        </span>
                        <p className="text-[11px] text-foreground">
                          El plazo de 48 horas para la firma en FirmaEC ha expirado. El borrador original no sufre modificaciones.
                        </p>
                      </div>
                    )}

                    {bpmState === "FIRMA_DESCONOCIDA" && (
                      <div className="pt-2 border-t border-border/50 space-y-1 bg-muted/40 -mx-4 -mb-4 p-3 rounded-b-xl">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                          Código de Operación
                        </span>
                        <p className="font-mono text-[11px] text-foreground">
                          FEC-OP-2026-092942
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Consulta el estado antes de un nuevo intento para no generar duplicidad de firmas.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Acciones principales del panel de estado */}
                  <div className="space-y-3 pt-2">
                    {/* Caso: PENDIENTE_FIRMA */}
                    {bpmState === "PENDIENTE_FIRMA" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleConsultarEstadoFirma}
                          disabled={isCheckingFirma}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <RefreshCw className={cn("size-3.5", isCheckingFirma && "animate-spin")} />
                          <span>{isCheckingFirma ? "Consultando FirmaEC..." : "Consultar estado de firma"}</span>
                        </Button>

                        <div className="space-y-1.5">
                          <Button
                            type="button"
                            variant="primary"
                            size="default"
                            disabled={true}
                            className="w-full text-xs font-semibold gap-2 opacity-50 cursor-not-allowed"
                          >
                            <span>Enviar solicitud</span>
                            <ArrowRight className="size-4" />
                          </Button>
                          <p className="text-[11px] text-muted-foreground text-center italic">
                            Podrás enviar la solicitud cuando FirmaEC confirme una firma válida.
                          </p>
                        </div>
                      </>
                    )}

                    {/* Caso: FIRMADO */}
                    {bpmState === "FIRMADO" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleDescargarDocumentoFirmado}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <Download className="size-3.5" />
                          <span>Descargar documento firmado</span>
                        </Button>

                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={handleEnviarSolicitudFinal}
                          disabled={isSubmitting}
                          className="w-full text-xs font-semibold gap-2 shadow-sm"
                        >
                          {isSubmitting ? "Enviando a Gestión..." : (
                            <>
                              <span>Enviar solicitud</span>
                              <ArrowRight className="size-4" />
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    {/* Caso: EN_REVISION */}
                    {bpmState === "EN_REVISION" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleDescargarDocumentoFirmado}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <Download className="size-3.5" />
                          <span>Descargar documento firmado</span>
                        </Button>

                        <div className="p-3.5 rounded-xl bg-muted/60 border border-border/80 text-center space-y-1.5">
                          <div className="flex items-center justify-center gap-2 text-xs font-bold text-foreground">
                            <Lock className="size-4 text-muted-foreground" />
                            <span>Solicitud enviada a Gestión</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Anexo A bloqueado definitivamente en revisión técnica.
                          </p>
                        </div>
                      </>
                    )}

                    {/* Caso: FIRMA_RECHAZADA (Firma no completada) */}
                    {bpmState === "FIRMA_RECHAZADA" && (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={handleSolicitarNuevaFirma}
                          disabled={isSubmitting}
                          className="w-full text-xs font-semibold gap-2 shadow-sm"
                        >
                          <RefreshCw className={cn("size-3.5", isSubmitting && "animate-spin")} />
                          <span>Intentar nuevamente</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleVolverAEditar}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <ArrowLeft className="size-3.5" />
                          <span>Editar Anexo A</span>
                        </Button>
                      </>
                    )}

                    {/* Caso: FIRMA_CADUCADA */}
                    {bpmState === "FIRMA_CADUCADA" && (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={handleSolicitarNuevaFirma}
                          disabled={isSubmitting}
                          className="w-full text-xs font-semibold gap-2 shadow-sm"
                        >
                          <RefreshCw className={cn("size-3.5", isSubmitting && "animate-spin")} />
                          <span>Intentar nuevamente</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleVolverAEditar}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <ArrowLeft className="size-3.5" />
                          <span>Editar Anexo A</span>
                        </Button>
                      </>
                    )}

                    {/* Caso: FIRMA_DESCONOCIDA */}
                    {bpmState === "FIRMA_DESCONOCIDA" && (
                      <>
                        <Button
                          type="button"
                          variant="primary"
                          size="default"
                          onClick={handleConsultarEstadoFirma}
                          disabled={isCheckingFirma}
                          className="w-full text-xs font-semibold gap-2 shadow-sm"
                        >
                          <RefreshCw className={cn("size-3.5", isCheckingFirma && "animate-spin")} />
                          <span>{isCheckingFirma ? "Consultando FirmaEC..." : "Consultar estado de firma"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleVolverAEditar}
                          className="w-full text-xs font-semibold gap-2"
                        >
                          <ArrowLeft className="size-3.5" />
                          <span>Volver a editar borrador</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {bpmState === "DRAFT" && (
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        <span className="whitespace-nowrap">Siguiente: Declaraciones y firma</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* â”€â”€ PASO 4: DECLARACIONES, GENERACIÓN Y FIRMA DIGITAL â”€â”€ */}
              {step === 4 && (
                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary dark:text-primary-300 shrink-0" />
                        <span>Sección III — Declaraciones y Firma</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Declaraciones correspondientes a la solicitud y formalización mediante la firma de la máxima autoridad o delegado.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="solid" size="sm" className="font-bold uppercase tracking-wider shrink-0 self-start sm:self-auto !text-white shadow-xs rounded-full px-3 py-1">
                      FORMALIZACIÓN
                    </Badge>
                  </div>

                  <Card
                    variant="featured"
                    disableHover={true}
                    className="bg-success/15 dark:bg-success/25 border border-success/40 shadow-xs relative overflow-hidden mb-6"
                  >
                    <div className="flex items-center gap-2">
                      <CardBadge className="bg-success/25 text-success text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                        Listo para firma
                      </CardBadge>
                    </div>

                    <CardTitle className="text-lg sm:text-xl font-bold font-heading text-success">
                      El Anexo A está listo para ser firmado.
                    </CardTitle>

                    <CardDescription className="text-xs text-muted-foreground max-w-3xl leading-relaxed font-normal">
                      Revisa la información y los documentos adjuntos antes de continuar. Al enviarlo a firma, el firmante autorizado recibirá la solicitud para completar la firma electrónica mediante FirmaEC.
                    </CardDescription>

                    <CardDecorativeIcon className="-bottom-8 -right-8 opacity-25 group-hover/card:scale-100 hidden sm:block">
                      <FileCheck2 className="size-36 text-success" />
                    </CardDecorativeIcon>
                  </Card>

                  {/* Bloque Legal de Declaraciones */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border space-y-4 text-xs">
                    <h3 className="font-bold text-foreground text-sm">
                      2.2 Cláusula Segunda: Declaraciones del Solicitante
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
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

                  {/* Resumen de Firmante */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card
                      variant="featured"
                      disableHover={true}
                      className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 relative overflow-hidden"
                    >
                      <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 border-0 flex items-center gap-1.5 w-fit">
                        <User className="size-3.5 text-secondary" />
                        <span>Firmante Autorizado</span>
                      </CardBadge>

                      <div className="space-y-0.5 mt-2">
                        <CardTitle className="text-base font-bold font-heading text-secondary break-words">
                          {formData.representanteLegalNombre}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium break-words">
                          {formData.representanteLegalCargo}
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
                          {formData.ciudadFirma}
                        </CardTitle>

                        <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                          <Calendar className="size-3.5 text-secondary/80" />
                          <span>{formData.fechaFirma}</span>
                        </CardDescription>
                      </div>

                      <CardDecorativeIcon className="-bottom-6 -right-6 opacity-20 group-hover/card:scale-100 hidden sm:block">
                        <Calendar className="size-28 text-secondary" />
                      </CardDecorativeIcon>
                    </Card>
                  </div>

                  {/* Certificación de Firma Electrónica */}
                  <div className="p-4 rounded-xl border border-border bg-muted/30 flex items-start sm:items-center gap-3">
                    <Checkbox
                      id="firmaDigital"
                      checked={formData.firmadoDigitalmente}
                      onCheckedChange={(checked) => setFormData({ ...formData, firmadoDigitalmente: Boolean(checked) })}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0 mt-0.5 sm:mt-0"
                    />
                    <Label htmlFor="firmaDigital" className="text-xs cursor-pointer font-bold text-foreground">
                      Confirmo que la información del Anexo A está completa y es correcta.
                    </Label>
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
                        onClick={() => setStep(3)}
                        className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4"
                      >
                        <ArrowLeft className="size-4 shrink-0" />
                        <span>Volver y editar</span>
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="default"
                        disabled={isSubmitting || !formData.firmadoDigitalmente}
                        className="text-xs font-semibold shadow-xs w-full sm:w-auto px-6 gap-2 group"
                      >
                        {isSubmitting ? (
                          <span>Enviando trámite...</span>
                        ) : (
                          <>
                            <span>Enviar a firma</span>
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </main>

      {/* Botones flotantes para Demo */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
        {bpmState === "DRAFT" && (
          showDemoToolbar ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
                <Sparkles className="size-3 text-primary shrink-0" />
                <span>Demo</span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="default"
                onClick={handleSimulateFill}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 shadow-xs"
              >
                <Sparkles className="size-3.5" /> Llenar campos automáticamente
              </Button>

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
              <span className="font-semibold text-foreground">Opciones de prueba</span>
              <ChevronUp className="size-3.5 text-muted-foreground" />
            </Button>
          )
        )}

        {["PENDIENTE_FIRMA", "FIRMADO", "EN_REVISION", "FIRMA_RECHAZADA", "FIRMA_CADUCADA", "FIRMA_DESCONOCIDA"].includes(bpmState) && (
          showDemoToolbar ? (
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Button type="button" variant="success" size="default" onClick={handleSimulateFirmaSuccess} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                <Sparkles className="size-3.5" /> Firma verificada
              </Button>
              <Button type="button" variant="danger" size="default" onClick={() => handleSimulateFirmaRechazada()} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                <Sparkles className="size-3.5" /> Firma no completada
              </Button>
              <Button type="button" variant="warning" size="default" onClick={handleSimulateFirmaCaducada} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                <Sparkles className="size-3.5" /> Firma caducada
              </Button>
              <Button type="button" variant="outline" size="default" onClick={handleSimulateFirmaDesconocida} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                <Sparkles className="size-3.5" /> No se pudo confirmar
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={() => {
                  setBpmState("PENDIENTE_FIRMA");
                  persistAnexoA("PENDIENTE_FIRMA");
                  toast.info("Validando firma", {
                    description: "Esperando confirmación del proceso de firma electrónica en FirmaEC.",
                  });
                }}
                className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
              >
                <Clock className="size-3.5" /> Validando firma
              </Button>
              <Button type="button" variant="outline" size="default" onClick={handleVolverAEditar} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                <ArrowLeft className="size-3.5" /> Borrador
              </Button>
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
          )
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
            {/* Header del documento en formato expediente */}
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

              {/* Contenido resumido */}
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

              {/* Sello de Firma Electrónica */}
              <div className={cn(
                "p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4",
                bpmState === "FIRMADO" ? "bg-success/10 border-success/30 text-success" : "bg-warning/10 border-warning/30 text-warning"
              )}>
                <div className="flex items-start sm:items-center gap-3">
                  <div className={cn("size-8 sm:size-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 sm:mt-0", bpmState === "FIRMADO" ? "bg-success text-white" : "bg-warning text-white")}>
                    {bpmState === "FIRMADO" ? <CheckCircle2 className="size-4 sm:size-5" /> : <Clock className="size-4 sm:size-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs">
                      {bpmState === "FIRMADO" ? "DOCUMENTO FIRMADO DIGITALMENTE (FirmaEC)" : "OPERACIÓN DE FIRMA EN CURSO (FirmaEC)"}
                    </p>
                    <p className="text-[11px] opacity-80 break-words">
                      {bpmState === "FIRMADO" 
                        ? `Firmado por: ${formData.representanteLegalNombre || "—"} · Verificado con validez jurídica`
                        : `Notificación enviada a: ${formData.representanteLegalEmail || "—"}`
                      }
                    </p>
                  </div>
                </div>
                <Badge tone={bpmState === "FIRMADO" ? "success" : "warning"} appearance="solid" size="sm" className="text-white shrink-0 self-start sm:self-auto gap-1 font-medium">
                  {bpmState === "FIRMADO" ? <CheckCircle2 className="size-2.5 text-white" /> : <Clock className="size-2.5 text-white" />}
                  <span className="text-white">{bpmState === "FIRMADO" ? "Válido" : "Pendiente"}</span>
                </Badge>
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

      {/* Modal de confirmación Warning UI Kit */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent variant="warning" size="lg" className="w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-foreground">
              Confirmar Generación
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              ¿Estás seguro que deseas generar el Anexo A y enviarlo a FirmaEC? Revisa que los datos ingresados sean correctos. Llegará una notificación al correo electrónico con el link para ser firmado.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end items-center gap-3 w-full pt-4">
            <Button
              type="button"
              variant="neutral"
              size="default"
              onClick={() => setShowConfirmModal(false)}
              className="w-full sm:w-auto text-xs font-semibold px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="warning"
              size="default"
              onClick={executeSubmit}
              className="w-full sm:w-auto text-xs font-semibold px-6 whitespace-nowrap"
            >
              Confirmar y Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
