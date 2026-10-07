"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  FileText,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  AlertCircle,
  Clock,
  Sparkles,
  Lock,
  Check,
  FileCheck2,
  Home,
  ChevronDown, ChevronUp,
  Search,
  XCircle,
  Eye,
  RefreshCw,
  FileSignature,
  History,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  User,
  CheckSquare,
  Briefcase,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { InputGroup, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { FormField } from "@/components/ui/form-field";
import { Card, CardTitle, CardDescription, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Timeline, type TimelineItem } from "@/components/ui/timeline";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { cn, getAssetPath } from "@/lib/utils";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  type SolicitudIngreso,
  type DatosAnexoB
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { MOCK_USERS_BY_ROLE, type UserRole, ROLES_CONFIG } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";


export type TipoFirmaFallo = "RECHAZADA" | "CADUCADA" | "INCIERTA";

export interface FirmaFalloInfo {
  tipo: TipoFirmaFallo;
  titulo: string;
  motivo: string;
  transaccionId: string;
  fechaIntento: string;
}

function EnrolamientoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const store = useSolicitudesIngresoStore();
  const {
    solicitudes,
    buscarPreregistroPorCedula,
    agregarEnrolamientoCoordinador,
    aprobarSolicitud,
    rechazarSolicitud
  } = store;

  // Rol simulado: COORDINADOR_SINARP vs DIR_GESTION / EQ_GESTION
  const [simulatedRole, setSimulatedRole] = useState<UserRole>("COORDINADOR_SINARP");
  const currentUser = MOCK_USERS_BY_ROLE[simulatedRole] || MOCK_USERS_BY_ROLE.COORDINADOR_SINARP;

  // Estado del flujo de Coordinador
  const [cedulaInput, setCedulaInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [preregistroCargado, setPreregistroCargado] = useState<any>(null);
  const [existingSolicitud, setExistingSolicitud] = useState<SolicitudIngreso | null>(null);

  // Stepper state: 1 (Datos), 2 (Acuerdo), 3 (Revisión), 4 (Firma)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Estado de firma y contingencia FirmaEC
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigningDone] = useState(false);
  const [signatureInfo, setSignatureInfo] = useState<{
    fechaHora: string;
    identificador: string;
  } | null>(null);
  const [firmaFallo, setFirmaFallo] = useState<FirmaFalloInfo | null>(null);
  const [isCheckingTransaction, setIsCheckingTransaction] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [showDemoToolbar, setShowDemoToolbar] = useState(true);
  const [submittedSolicitudId, setSubmittedSolicitudId] = useState<string>("");

  // Form State Anexo B
  const [formData, setFormData] = useState<DatosAnexoB>({
    nombreEntidad: "",
    domicilioEntidad: "",
    representanteLegalNombre: "",
    funcionarioNombre: "",
    funcionarioCedula: "",
    funcionarioCargo: "",
    rolAsignado: "COORDINADOR TITULAR",
    misionVisionInstitucional: "",
    clausulasAceptadas: false,
    ciudadFirma: "Quito D.M.",
    fechaFirma: "28/09/2026",
    firmadoPorRepresentante: true,
    firmadoPorFuncionario: false,
    archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"
  });

  // Estados para vista de Revisor / Área de Gestión
  const [selectedSolicitudDetalle, setSelectedSolicitudDetalle] = useState<SolicitudIngreso | null>(null);
  const [isSheetDetailOpen, setIsSheetDetailOpen] = useState(false);
  const [solicitudToApprove, setSolicitudToApprove] = useState<SolicitudIngreso | null>(null);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [solicitudToReject, setSolicitudToReject] = useState<SolicitudIngreso | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [motivoRechazoInput, setMotivoRechazoInput] = useState("");
  const [previewDocModal, setPreviewDocModal] = useState<{ open: boolean; title: string } | null>(null);

  // Stepper list
  const stepsList: StepperStep[] = [
    { id: "1", title: "Datos del coordinador", description: "Verificación de prerregistro", icon: UserCheck },
    { id: "2", title: "Acuerdo de uso y confidencialidad", description: "Cláusulas Anexo B", icon: FileText },
    { id: "3", title: "Revisión", description: "Verificación de información", icon: FileCheck2 },
    { id: "4", title: "Firma y envío", description: "Suscripción digital", icon: ShieldCheck },
  ];

  // Leer parámetro query ?cedula=...
  useEffect(() => {
    const ced = searchParams.get("cedula");
    if (ced) {
      setCedulaInput(ced);
      ejecutarValidacionCedula(ced);
    }
  }, [searchParams]);

  // Actualizar solicitud existente si cambia store
  useEffect(() => {
    if (preregistroCargado?.cedula) {
      const sol = solicitudes.find(
        (s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR" && s.cedula === preregistroCargado.cedula
      );
      if (sol) {
        // COMENTADO PARA SIMULADOR: Permitir siempre hacer la solicitud sin mostrar "Activo/Pendiente"
        // setExistingSolicitud(sol);
      }
    }
  }, [solicitudes, preregistroCargado]);

  // Simular guardado automático de borrador
  useEffect(() => {
    if (preregistroCargado && !isSubmittedSuccess) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        setIsSaving(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [formData, step, preregistroCargado, isSubmittedSuccess]);

  // Función para validar la cédula ingresada
  const ejecutarValidacionCedula = (ced: string) => {
    const cleanCed = ced.trim();
    if (cleanCed.length !== 10) {
      toast.error("Formato de cédula no válido", {
        description: "El número de cédula debe contener exactamente 10 dígitos."
      });
      return;
    }

    setValidationError(null);
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      const res = buscarPreregistroPorCedula(cleanCed);

      if (res.encontrado && res.nombreCompleto) {
        setPreregistroCargado(res);
        setValidationError(null);

        // Cargar datos en el formulario Anexo B y pasar al Paso 1 obligatoriamente
        setExistingSolicitud(null);
        setFormData((prev) => ({
          ...prev,
          nombreEntidad: res.institucion || prev.nombreEntidad || "Ministerio de Salud Pública - MSP",
          domicilioEntidad: res.direccion || prev.domicilioEntidad || "Av. Amazonas N24-196 y Luis Cordero, Quito",
          representanteLegalNombre: res.representanteLegal || prev.representanteLegalNombre || "Dr. Franklin Encalada Calero",
          funcionarioNombre: res.nombreCompleto || prev.funcionarioNombre || "",
          funcionarioCedula: res.cedula || cleanCed,
          funcionarioCargo: res.cargo || prev.funcionarioCargo || "Coordinador Designado",
          rolAsignado: (res.tipo === "TITULAR" ? "COORDINADOR TITULAR" : "SUPLENTE") as any,
          misionVisionInstitucional: prev.misionVisionInstitucional || "Garantizar la custodia, confidencialidad, lealtad y uso estrictamente institucional de los datos e información del SINARP."
        }));
        setStep(1);

        toast.success("Habilitación de coordinador confirmada", {
          description: `Se encontró el prerregistro para ${res.nombreCompleto} (${res.institucion}). Por favor completa y suscribe el Formulario Anexo B.`
        });
      } else {
        setPreregistroCargado(null);
        setExistingSolicitud(null);
        setValidationError("No encontramos una habilitación vigente asociada a este número de cédula.");
        toast.error("Validación no exitosa", {
          description: "La cédula ingresada no posee un prerregistro previo. Puedes seleccionar una de las cédulas de prueba o ingresar los datos manualmente."
        });
      }
    }, 600);
  };

  const handleIrDirectoAFormulario = (customCedula?: string) => {
    const ced = customCedula || cedulaInput || "1715489621";
    setPreregistroCargado({
      encontrado: true,
      cedula: ced,
      nombreCompleto: formData.funcionarioNombre || "",
      institucion: formData.nombreEntidad || "",
      cargo: formData.funcionarioCargo || "",
      tipo: "TITULAR",
      representanteLegal: formData.representanteLegalNombre || "",
      direccion: formData.domicilioEntidad || "",
      yaEnrolado: false
    });
    setFormData((prev) => ({
      ...prev,
      funcionarioCedula: ced,
      nombreEntidad: prev.nombreEntidad || "",
      domicilioEntidad: prev.domicilioEntidad || "",
      representanteLegalNombre: prev.representanteLegalNombre || "",
      funcionarioNombre: prev.funcionarioNombre || "",
      funcionarioCargo: prev.funcionarioCargo || ""
    }));
    setValidationError(null);
    setStep(1);
    toast.info("Formulario Anexo B habilitado para ingreso manual de datos.");
  };

  const handleSimulateDemo = () => {
    const demoCed = "1715489621"; // Roberto Dávila (Prerregistrado habilitado MSP)
    setCedulaInput(demoCed);
    ejecutarValidacionCedula(demoCed);
  };

  const handleSimulateDemoAprobada = () => {
    const demoCed = "1712345602"; // Paula Mendoza (Aprobada)
    setCedulaInput(demoCed);
    ejecutarValidacionCedula(demoCed);
  };

  const handleSimulateDemoRechazada = () => {
    const demoCed = "1788888888"; // Carlos Andrade (Rechazada)
    setCedulaInput(demoCed);
    ejecutarValidacionCedula(demoCed);
  };

  const handleSimulateFillAnexoB = () => {
    setFormData({
      nombreEntidad: preregistroCargado?.institucion || "Ministerio de Salud Pública - MSP",
      domicilioEntidad: "Av. República de El Salvador N36-64 y Suecia, Quito",
      representanteLegalNombre: "Dr. Franklin Encalada Calero (Ministro de Salud)",
      funcionarioNombre: preregistroCargado?.nombreCompleto || "Dr. Roberto Carlos Dávila Silva",
      funcionarioCedula: preregistroCargado?.cedula || "1715489621",
      funcionarioCargo: "Director Nacional de Estadística y Análisis de Salud",
      rolAsignado: "COORDINADOR TITULAR",
      misionVisionInstitucional: "Garantizar el derecho a la salud de la población mediante la regulación, gobernanza y gestión transparente de datos de interoperabilidad médica y registro sanitario.",
      clausulasAceptadas: true,
      ciudadFirma: "Quito D.M.",
      fechaFirma: "28/09/2026",
      firmadoPorRepresentante: true,
      firmadoPorFuncionario: false,
      archivoAcuerdoFirmado: "ARP-R02_Acuerdo_Uso_Confidencialidad_Firmado.pdf"
    });
    toast.success("Formulario Anexo B autocompletado con datos de prueba.");
  };

  // Simulación de firma electrónica válida (FirmaEC)
  const handleFirmaElectronica = () => {
    if (!formData.clausulasAceptadas) {
      toast.error("Debe aceptar las cláusulas del Anexo B antes de firmar.");
      return;
    }

    setIsSigning(true);
    setFirmaFallo(null);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigningDone(true);
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setSignatureInfo({
        fechaHora: fechaStr,
        identificador: `FIRMA-EC-2026-${Math.floor(10000 + Math.random() * 90000)}-B`
      });
      setFormData((prev) => ({ ...prev, firmadoPorFuncionario: true }));
      toast.success("Documento firmado correctamente", {
        description: "El certificado digital fue estampado en el instrumento ARP-R02."
      });
    }, 1200);
  };

  // Simulación de contingencia en FirmaEC (Rechazo, Caducidad o Respuesta Incierta)
  const handleSimularFalloFirma = (tipo: TipoFirmaFallo) => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setIsSigningDone(false);
      setSignatureInfo(null);
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const transId = `TX-FEC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      let motivo = "";
      if (tipo === "RECHAZADA") {
        motivo = "FirmaEC rechazó la transacción: el certificado digital no es válido, se encuentra revocado o la clave ingresada fue incorrecta.";
      } else if (tipo === "CADUCADA") {
        motivo = "La sesión de firma en FirmaEC ha caducado por superar el tiempo límite de espera sin confirmación del usuario.";
      } else {
        motivo = "FirmaEC devolvió respuesta incierta (timeout / estado indeterminado). Consulta la transacción original antes de solicitar una nueva firma para evitar duplicar el acuerdo.";
      }

      setFirmaFallo({
        tipo,
        titulo: "Firma de Anexo B no confirmada; revisa o reintenta",
        motivo,
        transaccionId: transId,
        fechaIntento: fechaStr
      });

      // Regla de negocio estricta: Conserva borrador e invitación PENDIENTE, no crea B ni marca Usada
      setIsSaving(false);
      setFormData((prev) => ({ ...prev, firmadoPorFuncionario: false }));

      toast.warning("Firma de Anexo B no confirmada; revisa o reintenta", {
        description: "El borrador y la invitación permanecen intactos como Pendientes."
      });
    }, 900);
  };

  // Reintentar firma con FirmaEC
  const handleReintentarFirma = () => {
    setFirmaFallo(null);
    setIsSigning(false);
    setIsSigningDone(false);
    toast.info("Monitoreo de firma reiniciado", {
      description: "Puedes proceder a firmar nuevamente en FirmaEC."
    });
  };

  // Consultar transacción original (en respuesta incierta, sin duplicar acuerdo)
  const handleConsultarTransaccionOriginal = () => {
    if (!firmaFallo) return;
    setIsCheckingTransaction(true);
    setTimeout(() => {
      setIsCheckingTransaction(false);
      const now = new Date();
      const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setSignatureInfo({
        fechaHora: fechaStr,
        identificador: firmaFallo.transaccionId
      });
      setIsSigningDone(true);
      setFirmaFallo(null);
      setFormData((prev) => ({ ...prev, firmadoPorFuncionario: true }));
      toast.success("Transacción original confirmada", {
        description: `Se validó con FirmaEC la transacción ${firmaFallo.transaccionId} exitosamente sin duplicar el acuerdo.`
      });
    }, 1200);
  };

  // Enviar solicitud para aprobación
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSigned || firmaFallo) {
      toast.error("Debe firmar electrónicamente el documento de forma válida antes de enviarlo.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      agregarEnrolamientoCoordinador({
        ...formData,
        firmadoPorFuncionario: true
      });
      const generatedId = `SOL-ING-00${solicitudes.length + 1}`;
      setSubmittedSolicitudId(generatedId);
      setIsSubmittedSuccess(true);
      toast.success("Solicitud enviada al Área de Gestión", {
        description: "El trámite fue radicado correctamente para revisión."
      });
    }, 800);
  };

  // Restablecer para iniciar una NUEVA solicitud desde cero
  const handleIniciarNuevaSolicitud = () => {
    setCedulaInput("");
    setPreregistroCargado(null);
    setExistingSolicitud(null);
    setValidationError(null);
    setStep(1);
    setIsSigningDone(false);
    setIsSubmittedSuccess(false);
    setFirmaFallo(null);
    setIsCheckingTransaction(false);
  };

  // Confirmar Aprobación (Vista Revisor)
  const handleConfirmApprove = () => {
    if (!solicitudToApprove) return;
    aprobarSolicitud(solicitudToApprove.id, `${currentUser.name} (Área de Gestión)`);
    setIsApproveOpen(false);
    setSolicitudToApprove(null);
    setSelectedSolicitudDetalle(null);
    setIsSheetDetailOpen(false);
    toast.success("Solicitud aprobada correctamente", {
      description: `El coordinador ${solicitudToApprove.nombreCompleto} ha sido habilitado.`
    });
  };

  // Confirmar Rechazo (Vista Revisor)
  const handleConfirmReject = () => {
    if (!solicitudToReject) return;
    if (!motivoRechazoInput.trim()) {
      toast.error("Debe especificar el motivo del rechazo.");
      return;
    }
    rechazarSolicitud(solicitudToReject.id, motivoRechazoInput.trim(), `${currentUser.name} (Área de Gestión)`);
    setIsRejectOpen(false);
    setSolicitudToReject(null);
    setSelectedSolicitudDetalle(null);
    setIsSheetDetailOpen(false);
    setMotivoRechazoInput("");
    toast.error("Solicitud rechazada", {
      description: "Se registró el motivo de rechazo y el trámite quedó cerrado."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Superior Principal */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-20">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-5 lg:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img
                src={getAssetPath("/logo-horizontal.svg")}
                alt="Logo DINARP"
                className="dark:hidden h-11 sm:h-12 w-auto object-contain"
              />
              <img
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="Logo DINARP"
                className="hidden dark:block h-11 sm:h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-5 py-4 sm:py-6">
        {/* ========================================================= */}
        {/* EXPERIENCIA 1: COORDINADOR SINARP                          */}
        {/* ========================================================= */}
        {simulatedRole === "COORDINADOR_SINARP" && (
          <div className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-xs space-y-5 animate-in fade-in duration-300 w-full">
            {/* Migas de pan y Estado de Guardado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/login" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
                  <Home className="size-3.5" />
                  <span>Portal de Acceso</span>
                </Link>
                <span>/</span>
                <span className={cn(!preregistroCargado ? "text-foreground font-semibold truncate" : "hover:text-foreground")}>
                  Prerregistro Coordinador
                </span>
                {preregistroCargado && !isSubmittedSuccess && (
                  <>
                    <span>/</span>
                    <span className="text-foreground font-semibold truncate">
                      Paso {step}: {stepsList[step - 1]?.title}
                    </span>
                  </>
                )}
              </nav>

              {/* Metadatos de la Solicitud: Versión del Anexo B y Estado de Guardado */}
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <Badge
                  tone="secondary"
                  appearance="soft"
                  size="sm"
                  className="font-mono text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border border-secondary/30"
                >
                  <FileText className="size-3 shrink-0" />
                  <span>Anexo B · Versión 1.0</span>
                </Badge>

                {/* Indicador de Guardado */}
                <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/50 transition-colors">
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
            </div>

            {/* Encabezado del Trámite en Card Featured */}
            <Card
              variant="featured"
              disableHover={true}
              className="bg-secondary-100/30 dark:bg-secondary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-3 relative overflow-hidden"
            >
              <CardBadge className="bg-secondary/20 text-secondary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                FORMULARIO ARP-R02
              </CardBadge>

              <CardTitle className="text-lg sm:text-xl font-bold font-heading text-secondary">
                Anexo B — Acuerdo de Uso y Confidencialidad
              </CardTitle>

              <CardDescription className="text-xs text-secondary-800/80 dark:text-secondary-200/80 font-medium">
                Suscripción digital para el enrolamiento del Coordinador SINARP.
              </CardDescription>

              <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100">
                <ShieldCheck className="size-32 text-secondary" />
              </CardDecorativeIcon>
            </Card>

            <Separator className="my-4" />

            {/* â”€â”€ PANTALLA 1: VALIDACIÓN DEL COORDINADOR (SI NO SE HA CARGADO O NO EXISTE SOLICITUD) â”€â”€ */}
            {!preregistroCargado && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="pt-3 pb-2 my-2 space-y-1 text-left">
                  <h2 className="text-lg font-bold font-heading flex items-center gap-2 text-foreground">
                    <UserCheck className="size-5 text-secondary" />
                    Activación de Coordinador SINARP
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu número de cédula para continuar con el proceso de activación.
                  </p>
                </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      ejecutarValidacionCedula(cedulaInput);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      {/* Contenedor de Cédula (Más ancho) */}
                      <div className="lg:col-span-7 xl:col-span-8 bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[160px]">
                        <div className="space-y-1">
                          <Label htmlFor="cedula-input" className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <span>Número de cédula de identidad</span>
                            <span className="text-warning">*</span>
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Ingresa tu cédula de 10 dígitos para consultar tu habilitación como Coordinador SINARP.
                          </p>
                        </div>
                        <div className="pt-3">
                          <InputGroup state={validationError ? "error" : "default"} leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="cedula-input"
                              type="text"
                              maxLength={10}
                              placeholder="Ej: 1715489621"
                              value={cedulaInput}
                              onChange={(e) => {
                                setCedulaInput(e.target.value.replace(/\D/g, ""));
                                setValidationError(null);
                              }}
                              className="text-base font-mono tracking-wider h-11"
                              autoFocus
                              required
                            />
                          </InputGroup>
                        </div>
                      </div>

                      {/* Contenedor de Requisitos (Más compacto y ordenado) */}
                      <div className="lg:col-span-5 xl:col-span-4 bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary shrink-0">
                            <ShieldCheck className="size-4" />
                          </div>
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                            Requisitos para la activación
                          </h3>
                        </div>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-start gap-2">
                            <div className="size-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                            <span>Designación previa en solicitud institucional (Anexo A).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="size-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                            <span>Firma electrónica válida (FirmaEC) para suscribir Anexo B.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="size-1.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                            <span>Cédula de identidad de 10 dígitos.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* ESCENARIO DE ERROR: NO HABILITADO */}
                    {validationError && (
                      <div className="p-4 bg-danger/10 border border-danger/30 rounded-2xl space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="size-5 text-danger shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-danger uppercase tracking-wider">
                              Validación no aprobada
                            </h4>
                            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                              {validationError}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Asegúrate de que la institución haya completado el trámite de prerregistro (Anexo A) y que hayas sido designado formalmente.
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-danger/20">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCedulaInput("1715489621");
                              ejecutarValidacionCedula("1715489621");
                            }}
                            className="text-xs font-semibold gap-1.5 text-secondary border-secondary/30 hover:bg-secondary/10"
                          >
                            <Sparkles className="size-3.5" />
                            <span>Probar con cédula habilitada (1715489621)</span>
                          </Button>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleIrDirectoAFormulario(cedulaInput)}
                              className="text-xs font-medium"
                            >
                              <span>Continuar con formulario de prueba</span>
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCedulaInput("");
                                setValidationError(null);
                              }}
                              className="text-xs font-semibold gap-1.5"
                            >
                              <ArrowLeft className="size-3.5" />
                              <span>Intentar otra cédula</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

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
                        type="submit"
                        variant="primary"
                        size="default"
                        disabled={isSearching || cedulaInput.length !== 10}
                        className="text-xs font-semibold px-6 w-full sm:w-auto"
                      >
                        {isSearching ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" className="size-4" />
                            <span>Validando...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Validar información</span>
                            <ArrowRight className="size-4" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
              </div>

            )}

            {/* â”€â”€ SI EL COORDINADOR YA TIENE UNA SOLICITUD EN EL STORE â”€â”€ */}
            {preregistroCargado && existingSolicitud && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* SI ESTÁ APROBADA */}
                {existingSolicitud.estado === "Aprobada" && (
                  <div className="max-w-2xl mx-auto bg-surface border border-success/30 rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-full bg-gradient-to-b from-success/20 via-success/10 to-transparent blur-2xl pointer-events-none" />

                    <div className="flex justify-center w-full relative z-10">
                      <div className="size-20 rounded-full bg-success/15 border border-success/30 flex items-center justify-center">
                        <CheckCircle2 className="size-10 text-success stroke-[2px]" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <Badge tone="success" appearance="soft" size="sm" className="px-4 py-1 text-xs font-extrabold tracking-wider uppercase rounded-full mx-auto">
                        ESTADO: REGISTRO APROBADO
                      </Badge>
                      <h2 className="text-2xl font-bold font-heading text-foreground">
                        Tu registro como Coordinador SINARP fue aprobado.
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                        El proceso de enrolamiento y suscripción del Anexo B concluyó exitosamente. Ya te encuentras habilitado con perfil activo en la plataforma.
                      </p>
                    </div>

                    <div className="p-4 bg-muted/40 rounded-2xl border border-border text-left space-y-2 text-xs relative z-10">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coordinador:</span>
                        <span className="font-bold text-foreground">{existingSolicitud.nombreCompleto}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institución:</span>
                        <span className="font-bold text-foreground">{existingSolicitud.institucion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trámite N.º:</span>
                        <span className="font-mono font-medium text-foreground">{existingSolicitud.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aprobado por:</span>
                        <span className="font-medium text-foreground">{existingSolicitud.revisor || "Dirección de Gestión"}</span>
                      </div>
                    </div>

                    {/* Timeline de trazabilidad */}
                    <div className="text-left pt-2 relative z-10">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Trazabilidad del trámite</h3>
                      <Timeline
                        items={[
                          {
                            id: "t1",
                            title: "Prerregistro de Coordinador",
                            description: "Solicitud de acceso institucional aprobada (Anexo A).",
                            date: "18/09/2026",
                            status: "success",
                            icon: <UserCheck className="size-4" />
                          },
                          {
                            id: "t2",
                            title: "Acuerdo Anexo B Firmado",
                            description: "Suscripción digital realizada con FirmaEC.",
                            date: existingSolicitud.fechaSolicitud,
                            status: "success",
                            icon: <FileSignature className="size-4" />
                          },
                          {
                            id: "t3",
                            title: "Aprobación y Habilitación",
                            description: "Revisado por Área de Gestión. Usuario habilitado.",
                            date: existingSolicitud.fechaRevision || existingSolicitud.fechaSolicitud,
                            status: "success",
                            icon: <CheckCircle2 className="size-4" />
                          }
                        ]}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 relative z-10">
                      <Link href="/catalogo-interoperabilidad">
                        <Button variant="primary" size="lg" className="w-full sm:w-auto text-xs font-bold px-8">
                          <span>Acceder al Portal SINARP</span>
                          <ArrowRight className="size-4 ml-2" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleIniciarNuevaSolicitud}
                        className="w-full sm:w-auto text-xs font-semibold"
                      >
                        <span>Validar otra cédula</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* SI ESTÁ RECHAZADA */}
                {existingSolicitud.estado === "Rechazada" && (
                  <div className="max-w-2xl mx-auto bg-surface border border-danger/30 rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-full bg-gradient-to-b from-danger/20 via-danger/10 to-transparent blur-2xl pointer-events-none" />

                    <div className="flex justify-center w-full relative z-10">
                      <div className="size-20 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center">
                        <XCircle className="size-10 text-danger stroke-[2px]" />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <Badge tone="danger" appearance="soft" size="sm" className="px-4 py-1 text-xs font-extrabold tracking-wider uppercase rounded-full mx-auto">
                        ESTADO: SOLICITUD RECHAZADA
                      </Badge>
                      <h2 className="text-2xl font-bold font-heading text-foreground">
                        Tu solicitud fue rechazada
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                        El trámite ha finalizado y no se encuentra activo. De acuerdo con las reglas de negocio, una solicitud rechazada no puede ser corregida ni reenviada.
                      </p>
                    </div>

                    {/* Motivo de Rechazo en Card Destacado */}
                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-2xl text-left space-y-2 relative z-10">
                      <span className="text-xs font-bold text-danger uppercase tracking-wider block">
                        Motivo del rechazo registrado:
                      </span>
                      <p className="text-xs text-foreground font-medium leading-relaxed">
                        {existingSolicitud.motivoRechazo || "El acuerdo de confidencialidad no cumple con la firma digital válida del representante legal o delegado autorizante."}
                      </p>
                      <div className="pt-2 border-t border-danger/20 flex justify-between text-[11px] text-muted-foreground">
                        <span>Revisado por: {existingSolicitud.revisor || "Área de Gestión"}</span>
                        <span>Fecha: {existingSolicitud.fechaRevision || existingSolicitud.fechaSolicitud}</span>
                      </div>
                    </div>

                    {/* Timeline de Trazabilidad */}
                    <div className="text-left pt-2 relative z-10">
                      <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Trazabilidad del trámite</h3>
                      <Timeline
                        items={[
                          {
                            id: "t1",
                            title: "Solicitud Creada",
                            description: "Anexo B completado y enviado a revisión.",
                            date: existingSolicitud.fechaSolicitud,
                            status: "primary",
                            icon: <FileText className="size-4" />
                          },
                          {
                            id: "t2",
                            title: "Revisado por Área de Gestión",
                            description: "Análisis documental ejecutado.",
                            date: existingSolicitud.fechaRevision || existingSolicitud.fechaSolicitud,
                            status: "neutral",
                            icon: <Search className="size-4" />
                          },
                          {
                            id: "t3",
                            title: "Solicitud Rechazada",
                            description: "Trámite finalizado por incongruencias en la documentación.",
                            date: existingSolicitud.fechaRevision || existingSolicitud.fechaSolicitud,
                            status: "danger",
                            icon: <XCircle className="size-4" />
                          }
                        ]}
                      />
                    </div>

                    {/* Botón Único Obligatorio: Iniciar Nueva Solicitud */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 relative z-10">
                      <Button
                        type="button"
                        variant="primary"
                        size="lg"
                        onClick={handleIniciarNuevaSolicitud}
                        className="w-full sm:w-auto text-xs font-bold px-8 shadow-md"
                      >
                        <RefreshCw className="size-4 mr-2" />
                        <span>Iniciar nueva solicitud</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* SI ESTÁ EN REVISIÓN */}
                {(existingSolicitud.estado === "PENDIENTE_ASIGNACION_GESTION" ||
                  existingSolicitud.estado === "EN_REVISION_GESTION" ||
                  existingSolicitud.estado === "Pendiente") && (
                    <div className="max-w-2xl mx-auto bg-surface border border-warning/30 rounded-3xl p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
                      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[150%] h-[150%] rounded-full bg-gradient-to-b from-warning/20 via-warning/10 to-transparent blur-2xl pointer-events-none" />

                      <div className="flex justify-center w-full relative z-10">
                        <div className="size-20 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center">
                          <Clock className="size-10 text-warning stroke-[2px]" />
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <Badge tone="warning" appearance="soft" size="sm" className="px-4 py-1 text-xs font-extrabold tracking-wider uppercase rounded-full mx-auto">
                          ESTADO: EN REVISIÓN POR ÁREA DE GESTIÓN
                        </Badge>
                        <h2 className="text-2xl font-bold font-heading text-foreground">
                          Solicitud en proceso de evaluación
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                          Tu Anexo B y documento de firma electrónica han sido remitidos al Área de Gestión para su verificación formal.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/40 rounded-2xl border border-border text-left space-y-2 text-xs relative z-10">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">N.º Trámite:</span>
                          <span className="font-mono font-bold text-foreground">{existingSolicitud.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fecha de Envío:</span>
                          <span className="font-medium text-foreground">{existingSolicitud.fechaSolicitud}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Institución:</span>
                          <span className="font-medium text-foreground">{existingSolicitud.institucion}</span>
                        </div>
                      </div>

                      <div className="flex justify-center pt-2 relative z-10">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleIniciarNuevaSolicitud}
                          className="text-xs font-semibold"
                        >
                          <span>Validar otra cédula</span>
                        </Button>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* â”€â”€ PANTALLA 2: FORMULARIO ANEXO B (SI SE ENCONTRÓ PRERREGISTRO Y NO TIENE TRAMITE PENDIENTE/FINALIZADO) â”€â”€ */}
            {preregistroCargado && !existingSolicitud && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Stepper Oficial UI Kit */}
                <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 shadow-xs overflow-x-auto">
                  <Stepper
                    steps={stepsList}
                    activeStep={step - 1}
                    variant="default"
                    stepPrefix="PASO"
                    showBadge={true}
                    onStepClick={(idx) => {
                      if (idx + 1 < step) setStep((idx + 1) as 1 | 2 | 3 | 4);
                    }}
                  />
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* â”€â”€ PASO 1: DATOS DEL COORDINADOR â”€â”€ */}
                  {step === 1 && (
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                      {/* Cabecera al ras con relleno de secondary 500 en baja opacidad */}
                      <div className="bg-secondary-500/10 dark:bg-secondary-500/20 border-b border-secondary-500/20 p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold font-heading text-secondary dark:text-secondary-300 flex items-center gap-2">
                            <UserCheck className="size-5 text-secondary shrink-0" />
                            <span>Paso 1 — Datos del Coordinador Prerregistrado</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            La información institucional y personal ha sido precargada desde el Anexo A de la entidad.
                          </p>
                        </div>
                        <Badge tone="neutral" appearance="soft" size="sm" className="font-bold text-[10px] uppercase tracking-wider shrink-0 self-start sm:self-auto rounded-full px-3 py-1 border border-secondary/30 text-secondary bg-secondary/10">
                          INFORMACIÓN PRECARGADA
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Nombre de la Institución Solicitante" htmlFor="entidad-p1" required className="sm:col-span-2">
                          <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="entidad-p1"
                              value={formData.nombreEntidad}
                              onChange={(e) => setFormData({ ...formData, nombreEntidad: e.target.value })}
                              placeholder="Ej: Ministerio de Salud Pública - MSP"
                              className="text-sm font-semibold"
                              required
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Domicilio Legal Institucional" htmlFor="domicilio-p1" className="sm:col-span-2">
                          <InputGroup leftIcon={<MapPin className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="domicilio-p1"
                              value={formData.domicilioEntidad}
                              onChange={(e) => setFormData({ ...formData, domicilioEntidad: e.target.value })}
                              placeholder="Ej: Av. República de El Salvador N36-64 y Suecia, Quito"
                              className="text-sm"
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Representante Legal Autorizado" htmlFor="rep-legal-p1" required>
                          <InputGroup leftIcon={<UserCheck className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="rep-legal-p1"
                              value={formData.representanteLegalNombre}
                              onChange={(e) => setFormData({ ...formData, representanteLegalNombre: e.target.value })}
                              placeholder="Ej: Dr. Franklin Encalada Calero"
                              className="text-sm font-semibold"
                              required
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Rol Asignado" htmlFor="rol-p1" required>
                          <InputGroup leftIcon={<Shield className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="rol-p1"
                              value={formData.rolAsignado}
                              onChange={(e) => setFormData({ ...formData, rolAsignado: e.target.value as "COORDINADOR TITULAR" | "SUPLENTE" | "SUPERVISOR" | "VISUALIZADOR" })}
                              placeholder="Ej: COORDINADOR TITULAR / SUPLENTE"
                              className="text-sm font-semibold"
                              required
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Nombre Completo del Coordinador Designado" htmlFor="nombre-p1" required>
                          <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="nombre-p1"
                              value={formData.funcionarioNombre}
                              onChange={(e) => setFormData({ ...formData, funcionarioNombre: e.target.value })}
                              placeholder="Ej: Dr. Roberto Carlos Dávila Silva"
                              className="text-sm font-normal text-foreground placeholder:font-normal"
                              required
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Número de Cédula de Identidad" htmlFor="cedula-p1" required>
                          <InputGroup leftIcon={<FileText className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="cedula-p1"
                              value={formData.funcionarioCedula}
                              onChange={(e) => setFormData({ ...formData, funcionarioCedula: e.target.value })}
                              placeholder="Cédula de 10 dígitos"
                              className="text-sm font-mono tracking-wide"
                              required
                            />
                          </InputGroup>
                        </FormField>

                        <FormField label="Cargo Institucional" htmlFor="cargo-p1" className="sm:col-span-2" required>
                          <InputGroup leftIcon={<Briefcase className="size-4 text-muted-foreground" />}>
                            <InputGroupInput
                              id="cargo-p1"
                              value={formData.funcionarioCargo}
                              onChange={(e) => setFormData({ ...formData, funcionarioCargo: e.target.value })}
                              placeholder="Ej: Director Nacional de Estadística y Análisis de Salud"
                              className="text-sm"
                              required
                            />
                          </InputGroup>
                        </FormField>
                      </div>

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
                            onClick={handleIniciarNuevaSolicitud}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                          >
                            <ArrowLeft className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Volver a consultar cédula</span>
                          </Button>

                          <Button
                            type="button"
                            variant="primary"
                            size="default"
                            onClick={() => setStep(2)}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                          >
                            <span className="whitespace-nowrap">Siguiente: Acuerdo de Uso</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                                      {/* ðŸŸ¢ PASO 2: ACUERDO DE USO Y CONFIDENCIALIDAD ðŸŸ¢ */}
                    {step === 2 && (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        {/* Bloque 1: Comparecientes */}
                        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                          <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <Building2 className="size-4 text-secondary-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold font-heading text-secondary-400 leading-snug">
                                  2.1 Datos de los Intervinientes
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Suscripción del Acuerdo ARP-R02 entre la DINARP y la institución solicitante.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField label="Nombre de la entidad" htmlFor="entidad-nombre-p2">
                              <InputGroup leftIcon={<Building2 className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="entidad-nombre-p2"
                                  value={formData.nombreEntidad}
                                  onChange={(e) => setFormData({ ...formData, nombreEntidad: e.target.value })}
                                  className="text-sm font-semibold"
                                  required
                                />
                              </InputGroup>
                            </FormField>

                            <FormField label="Domicilio de la entidad" htmlFor="entidad-domicilio-p2">
                              <InputGroup leftIcon={<MapPin className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="entidad-domicilio-p2"
                                  value={formData.domicilioEntidad}
                                  onChange={(e) => setFormData({ ...formData, domicilioEntidad: e.target.value })}
                                  className="text-sm font-semibold"
                                  required
                                />
                              </InputGroup>
                            </FormField>

                            <FormField label="Nombres de la máxima autoridad / delegado / representante legal" htmlFor="rep-legal-p2">
                              <InputGroup leftIcon={<UserCheck className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="rep-legal-p2"
                                  value={formData.representanteLegalNombre}
                                  onChange={(e) => setFormData({ ...formData, representanteLegalNombre: e.target.value })}
                                  className="text-sm font-semibold"
                                  required
                                />
                              </InputGroup>
                            </FormField>

                            <FormField label="Nombre del trabajador/funcionario y/o servidor público" htmlFor="funcionario-nombre-p2">
                              <InputGroup leftIcon={<User className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="funcionario-nombre-p2"
                                  value={formData.funcionarioNombre}
                                  onChange={(e) => setFormData({ ...formData, funcionarioNombre: e.target.value })}
                                  className="text-sm font-semibold"
                                  required
                                />
                              </InputGroup>
                            </FormField>

                            <FormField label="Cargo en la entidad" htmlFor="funcionario-cargo-p2">
                              <InputGroup leftIcon={<Briefcase className="size-4 text-muted-foreground" />}>
                                <InputGroupInput
                                  id="funcionario-cargo-p2"
                                  value={formData.funcionarioCargo}
                                  onChange={(e) => setFormData({ ...formData, funcionarioCargo: e.target.value })}
                                  className="text-sm font-semibold"
                                  required
                                />
                              </InputGroup>
                            </FormField>

                            <FormField label="Rol: (COORDINADOR TITULAR, SUPLENTE, SUPERVISOR O VISUALIZADOR)" htmlFor="rol-select-p2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <div
                                    id="rol-select-p2"
                                    role="button"
                                    tabIndex={0}
                                    className="group/input-group relative flex h-11 w-full min-w-0 items-center justify-between px-4 overflow-hidden rounded-full border border-primary/30 text-muted-foreground hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-background cursor-pointer transition-all duration-300"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <Shield className="size-4 text-muted-foreground shrink-0" />
                                      <span className="text-sm font-semibold text-foreground truncate">
                                        {formData.rolAsignado}
                                      </span>
                                    </div>
                                    <ChevronDown className="size-4 text-muted-foreground opacity-70 shrink-0 ml-2" />
                                  </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                                  <DropdownMenuItem onClick={() => setFormData({ ...formData, rolAsignado: "COORDINADOR TITULAR" })}>
                                    COORDINADOR TITULAR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setFormData({ ...formData, rolAsignado: "SUPLENTE" })}>
                                    SUPLENTE
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setFormData({ ...formData, rolAsignado: "SUPERVISOR" })}>
                                    SUPERVISOR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setFormData({ ...formData, rolAsignado: "VISUALIZADOR" })}>
                                    VISUALIZADOR
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </FormField>
                          </div>
                        </div>

                        {/* Bloque 2: Misión y Visión */}
                        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                          <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <FileText className="size-4 text-secondary-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold font-heading text-secondary-400 leading-snug">
                                  2.2 Antecedentes Institucionales
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Justificación formal de la necesidad de uso de los datos del SINARP.
                                </p>
                              </div>
                            </div>
                          </div>

                          <FormField label="Misión y Visión de la entidad compareciente" htmlFor="mision-p2" required>
                            <Textarea
                              id="mision-p2"
                              value={formData.misionVisionInstitucional}
                              onChange={(e) => setFormData({ ...formData, misionVisionInstitucional: e.target.value })}
                              className="text-sm min-h-[120px] rounded-2xl leading-relaxed p-4"
                              required
                            />
                          </FormField>
                        </div>

                        {/* Bloque 3: Base Legal y Cláusulas Operativas */}
                        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                          <div className="bg-muted/50 p-3.5 mb-5 flex items-start sm:items-center justify-between gap-3 rounded-xl">
                            <div className="flex items-start gap-2.5 min-w-0">
                              <ShieldCheck className="size-4 text-secondary-400 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <h2 className="text-sm font-bold font-heading text-secondary-400 leading-snug">
                                  2.3 Cláusulas Legales del Instrumento Oficial (ARP-R02)
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                                  Términos y condiciones jurídicas del acuerdo de uso.
                                </p>
                              </div>
                            </div>
                            <div className="hidden sm:block text-right shrink-0">
                              <span className="text-[10px] font-bold font-mono text-secondary-800 tracking-wider">VERSIÓN: 1.0 - VIGENCIA: 20-06-2025</span>
                            </div>
                          </div>

                          <div className="bg-muted/10 border border-border rounded-xl p-4 sm:p-5 h-[350px] overflow-y-auto text-[11.5px] leading-relaxed text-muted-foreground space-y-4 text-justify custom-scrollbar pr-4">
                            <p>
                              <strong>CLÁUSULA TERCERA. – BASE LEGAL:</strong><br />
                              1. El artículo 66 numeral 19 del artículo 66 de la Constitución de la República del Ecuador establece: “Se reconoce y garantizará a las personas: (…) El derecho a la protección de datos de carácter personal, que incluye el acceso y la decisión sobre información y datos de este carácter, así como su correspondiente protección. La recolección, archivo, procesamiento, distribución o difusión de estos datos o información requerirán la autorización del titular o el mandato de la Ley”.<br /><br />
                              2. La Ley Orgánica del Sistema Nacional de Registros Públicos, publicada en el Registro Oficial nro. 162 de 31 de marzo de 2010, crea a la Dirección Nacional de Registros Públicos, como organismo de derecho público, con personería jurídica, autonomía administrativa, técnica, operativa, financiera y presupuestaria, adscrita al Ministerio de Telecomunicaciones y Sociedad de la Información.<br /><br />
                              3. La Ley indicada en el párrafo anterior, en su artículo 4, prescribe: “Las instituciones del sector público y privado y las personas naturales que actualmente o en el futuro administren bases o registros de datos públicos, son responsables de la integridad, protección y control de los registros y bases de datos a su cargo. Dichas instituciones responderán por la veracidad, autenticidad, custodia y debida conservación de los registros. La responsabilidad sobre la veracidad y autenticidad de los datos registrados, es exclusiva de la o el declarante cuando esta o este provee toda la información (…)”.<br /><br />
                              4. El artículo 28 de la norma ut supra establece: “Créase el Sistema Nacional de Registros Públicos con la finalidad de proteger los derechos constituidos, los que se constituyan, modifiquen, extingan y publiciten por efectos de la inscripción de los hechos, actos y/o contratos determinados por la presente Ley y las leyes y normas de registros; y con el objeto de coordinar el intercambio de información de los registros públicos. En el caso de que entidades privadas posean información que por su naturaleza sea pública, serán incorporadas a este sistema.”<br /><br />
                              5. El artículo 27 de la Ley ibidem establece: “Las Registradoras o Registradores y máximas autoridades, a quienes se autoriza el manejo de las licencias para el acceso a los registros de datos utilizados por la ley, serán las o los responsables directos administrativa, civil y penalmente por el mal uso de las mismas”.<br /><br />
                              6. Asimismo, el artículo 29 de la Ley Orgánica del Sistema Nacional de Registros Públicos, determina que: “El Sistema Nacional de Registros Públicos estará conformado por los registros: civil, de la propiedad, mercantil, societario, datos de conectividad electrónica, vehicular, de naves y aeronaves, patentes, de propiedad intelectual registros de datos crediticios y todos los registros de datos de las instituciones públicas y privadas que mantuvieren y administren por disposición legal información registral de carácter público”.<br /><br />
                              7. El artículo 2 de la Ley Orgánica de Protección de Datos Personales, establece que la mentada Ley, (…) se aplicará al tratamiento de datos personales contenidos en cualquier tipo de soporte, automatizados o no, así como a toda modalidad de uso posterior. (…)<br /><br />
                              8. El artículo 7 de la norma ut supra, determina: “El tratamiento será legítimo y lícito si se cumple con alguna de las siguientes condiciones: (…) 2) Que sea realizado por el responsable del tratamiento en cumplimiento de una obligación legal; 3) Que sea realizado por el responsable del tratamiento, por orden judicial, debiendo observarse los principios de la presente Ley; 4) Que el tratamiento de datos personales se sustente en el cumplimiento de una misión realizada en interés público o en el ejercicio de poderes públicos conferidos al responsable, derivados de una competencia atribuida por una norma con rango de ley, sujeto al cumplimiento de los estándares internacionales de derechos humanos aplicables a la materia, al cumplimiento de los principios de esta Ley y a los criterios de legalidad, proporcionalidad y necesidad;(…)<br /><br />
                              9. Los literales a, b, d, e y g del artículo 10 de la Ley Orgánica de Protección de Datos Personales, estipula entre sus principios: “a) Juridicidad. - Los datos personales deben tratarse con estricto apego y cumplimiento a los principios, derechos y obligaciones establecidas en la Constitución, los instrumentos internacionales, la presente Ley, su Reglamento y la demás normativa y jurisprudencia aplicable; b) Lealtad.- El tratamiento de datos personales deberá ser leal, por lo que para los titulares debe quedar claro que se están recogiendo, utilizando, consultando o tratando de otra manera, datos personales que les conciernen, así como las formas en que dichos datos son o serán tratados. En ningún caso los datos personales podrán ser tratados a través de medios o para fines, ilícitos o desleales.; d) Finalidad.- Las finalidades del tratamiento deberán ser determinadas, explícitas, legítimas y comunicadas al titular: no podrán tratarse datos personales con fines distintos para los cuales fueron recopilados, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta Ley. El tratamiento de datos personales con fines distintos de aquellos para los que hayan sido recogidos inicialmente solo debe permitirse cuando sea compatible con los fines de su recogida inicial. Para ello, habrá de considerarse el contexto en el que se recogieron los datos, la información facilitada al titular en ese proceso y, en particular, las expectativas razonables del titular basadas en su relación con el responsable en cuanto a su uso posterior, la naturaleza de los datos personales, las consecuencias para los titulares del tratamiento ulterior previsto y la existencia de garantías adecuadas tanto en la operación de tratamiento original como en la operación de tratamiento ulterior prevista.; e) Pertinencia y minimización de datos personales. - Los datos personales deben ser pertinentes y estar limitados a lo estrictamente necesario para el cumplimiento de la finalidad del tratamiento. (…);“g) Confidencialidad. - El tratamiento de datos personales debe concebirse sobre la base del debido sigilo y secreto, es decir, no debe tratarse o comunicarse para un fin distinto para el cual fueron recogidos, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta ley. Para tal efecto, el responsable del tratamiento deberá adecuar las medidas técnicas organizativas para cumplir con este principio”.<br /><br />
                              10. El artículo 38 de la Ley Orgánica de Protección de Datos Personales, estipula: “El mecanismo gubernamental de seguridad de la información deberá incluir las medidas que deban implementarse en el caso de tratamiento de datos personales para hacer frente a cualquier riesgo, amenaza., vulnerabilidad, accesos no autorizados, pérdidas, alteraciones, destrucción o comunicación accidental o ilícita en el tratamiento de los datos conforme al principio de seguridad de datos personales. El mecanismo gubernamental de seguridad de la información abarcará y aplicará a todas las instituciones del sector público, contenidas en el artículo 225 de la Constitución de la República de Ecuador, así como a terceros que presten servicios públicos mediante concesión, u otras figuras legalmente reconocidas. Estas, podrán incorporar medidas adicionales al mecanismo gubernamental de seguridad de la información”.<br /><br />
                              11. El artículo 46 de la Ley Orgánica de Protección de Datos Personales, prescribe: “El responsable del tratamiento deberá notificar sin dilación la vulneración de seguridad de datos personales al titular cuando conlleve un riesgo a sus derechos fundamentales y libertades individuales, dentro del término de tres días contados a partir de la fecha en la que tuvo conocimiento del riesgo. No se deberá notificar la vulneración de seguridad de datos personales al titular en los siguientes casos: 1. Cuando el responsable del tratamiento haya adoptado medidas de protección técnicas organizativas o de cualquier otra índole apropiadas aplicadas a los datos personales afectados por la vulneración de seguridad que se pueda demostrar que son efectivas; 2. Cuando el responsable del tratamiento haya tomado medidas que garanticen que el riesgo para los derechos fundamentales y las libertades individuales del titular, no ocurrirá; y, 3. Cuando se requiera un esfuerzo desproporcionado para hacerlo; en cuyo caso, el responsable del tratamiento deberá realizar una comunicación pública a través de cualquier medio en la que se informe de la vulneración de seguridad de datos personales a los titulares. 4. La procedencia de las excepciones de los numerales 1 y 2 deberá ser calificada por la Autoridad de Protección de Datos, una vez informada esta tan pronto sea posible, y en cualquier caso dentro de los plazos contemplados en el Articulo 43. 5. La notificación al titular del dato objeto de la vulneración de segundad contendrá lo señalado en el artículo 43 de esta ley. 6. En caso de que el responsable del tratamiento de los datos personales no cumpliese oportunamente y de modo justificado con la notificación será sancionado conforme al régimen sancionatorio previsto en esta ley. 7. La notificación oportuna de la violación por parte del responsable del tratamiento al titular y la ejecución oportuna de medidas de respuesta, serán consideradas atenuante de la infracción”.<br /><br />
                              12. El artículo 178 del Código Orgánico Integral Penal establece: “La persona que, sin contar con el consentimiento o la autorización legal, acceda, intercepte, examine, retenga, grabe, reproduzca, difunda o publique datos personales, mensajes de datos, voz, audio y vídeo, objetos postales, información contenida en soportes informáticos, comunicaciones privadas o reservadas de otra persona por cualquier medio, será sancionada con pena privativa de libertad de uno a tres años (…)”.<br /><br />
                              13. El artículo 229 del código ibidem, manifiesta: “Revelación ilegal de base de datos.- La persona que, en provecho propio o de un tercero, revele información registrada, contenida en ficheros, archivos, bases de datos o medios semejantes, a través o dirigidas a un sistema electrónico, informático, telemático o de telecomunicaciones; materializando voluntaria e intencionalmente la violación del secreto, la intimidad y la privacidad de las personas, será sancionada con pena privativa de libertad de uno a tres años”.
                            </p>

                            <p>
                              <strong>CLÁUSULA CUARTA. - DE LA PROTECCIÓN DE LA INFORMACIÓN Y EL TRATAMIENTO:</strong><br />
                              Los intervinientes de forma libre y voluntaria se obligan a guardar la confidencialidad y reserva de la información, respecto al acceso y uso de las herramientas que provee la Dirección Nacional de Registros Públicos, quien en cumplimiento de sus atribuciones y facultades determinadas en la Ley Orgánica del Sistema Nacional de Registros Públicos, controlará y supervisará que las entidades pertenecientes al Sistema Nacional de Registros Públicos, incorporen mecanismos de protección de datos personales; de igual manera dará cumplimiento a las disposiciones establecidas en la Ley Orgánica de Protección de Datos Personales, su reglamento de aplicación y demás normativa que emita la Autoridad de Protección de Datos Personales.<br />
                              El acceso a la consulta y tratamiento de la información contenida en las herramientas que proporciona la Dirección Nacional de Registros Públicos, se sujetará a las condiciones de legitimación para el tratamiento de datos personales y principalmente a los principios de legalidad, finalidad, pertinencia, minimización y las demás previstos en el ordenamiento jurídico ecuatoriano aplicables.<br />
                              Los intervinientes quedan obligados a utilizar única y exclusivamente la información para los fines determinados por la entidad, considerando que todas las acciones reguladas por la Dirección Nacional de Registros Públicos en el ejercicio de sus funciones no podrán ser reveladas, divulgadas, transferidas, utilizadas o expuestas para propósitos distintos a los autorizados por la Dirección Nacional de Registros Públicos; sin perjuicio de legalidad o licitud que las mismas puedan suponer.
                            </p>

                            <p>
                              <strong>CLÁUSULA QUINTA. – OBLIGACIONES DE LOS INTERVINIENTES:</strong><br />
                              LOS INTERVINIENTES se obliga a:<br />
                              a. Utilizar los accesos al Sistema Nacional de Registros Públicos, exclusivamente para los propósitos determinados en sus funciones o cargo, y siempre que los mismos guarden estricta relación con el objeto social o competencias institucionales, legales de la entidad a la que pertenece.<br />
                              b. Velar por el buen uso de la información que integra el Sistema Nacional de Registros Públicos.<br />
                              c. Implementar y/o utilizar las medidas de seguridad adecuadas y necesarias, entendiéndose por tales las aceptadas por el estado de la técnica, sean estas organizativas, técnicas o de cualquier otra índole, para proteger los datos personales, frente a cualquier riesgo, amenaza, vulnerabilidad, atendiendo a la naturaleza de los datos de carácter personal, al ámbito y el contexto.<br />
                              d. Implementar y/o utilizar un proceso de verificación, evaluación y valoración continua permanente de la eficiencia, eficacia y efectividad de las medidas de carácter técnico, organizativo y de cualquier otra índole, implementadas con el objeto de garantizar y mejorar la seguridad del tratamiento de datos personales.<br />
                              e. Implementar y/o utilizar políticas de trazabilidad que determinen fecha, hora y servidor que ha tenido acceso a la plataforma y a los datos.<br />
                              f. Notificar a la Dirección Nacional de Registro de Datos Públicos cualquier vulneración de los sistemas que pueda representar un riesgo para los datos personales, sus titulares o la plataforma del Sistema Nacional de Registros Públicos, sin perjuicio de las notificaciones que debe realizar a la Superintendencia de Protección de Datos Personales y al titular, conforme a la Ley Orgánica de Protección de Datos Personales.<br />
                              g. Tratar los datos con estricto apego y cumplimiento a los principios, derechos y obligaciones establecidas en la Constitución, instrumentos internacionales, Ley Orgánica de Protección de Datos Personales, su Reglamento y demás normativa que emita la Superintendencia de Protección de Datos Personales.<br />
                              h. Llevar un registro, que permita mantener un detalle actualizado de las gestiones realizadas.<br />
                              i. Al finalizar sus funciones deberá existir, un acta-entrega recepción donde conste el detalle de sus actividades y productos generados.<br />
                              j. Y demás obligaciones que se encuentren establecidas en las normas creadas para el afecto.
                            </p>

                            <p>
                              <strong>CLÁUSULA SEXTA. - PROHIBICIONES DE LOS INTERVINIENTES:</strong><br />
                              LOS INTERVINIENTES no podrán:<br />
                              4.1 Modificar, alterar, divulgar, comercializar de manera total o parcial la información y/o herramientas a la cual obtuviere acceso.<br />
                              4.2 Publicar, difundir, ceder, trasmitir o permitir a terceros no autorizados el acceso total o parcial a la información incorporada en el Sistema Nacional de Registros Públicos.<br />
                              4.3 Revelar, compartir o difundir por cualquier medio la clave de acceso al Sistema Nacional de Registros Públicos.<br />
                              4.4 Hacer uso de las claves de acceso cuando está haciendo uso de vacaciones o permisos.
                            </p>

                            <p>
                              <strong>CLÁUSULA SÉPTIMA. – RESPONSABILIDAD:</strong><br />
                              LOS INTERVINIENTES serán responsables civiles, administrativo y penalmente por el incumplimiento del presente acuerdo de uso y confidencialidad.<br />
                              Al suscribir el presente, los intervinientes aceptan de manera libre y voluntaria que la Dirección Nacional de Registros Públicos, no será responsable bajo ninguna circunstancia, por los daños o perjuicios de cualquier naturaleza que pudieran derivarse por el uso indebido que el o los usuarios hagan de la información, los sistemas y/o herramientas a las que tengan acceso, ni por errores en la información consultada, ingresada, procesada u obtenida, quedando bajo la exclusiva responsabilidad de los intervinientes la verificación y correcto uso de las mismas.
                            </p>

                            <p>
                              <strong>CLÁUSULA OCTAVA. - DECLARACIONES:</strong><br />
                              8.1. LOS INTERVINIENTES, declaran conocer que todos los registros públicos que forman parte del Sistema Nacional de Registros Públicos, contienen datos accesibles y confidenciales; los primeros hacen referencia a toda aquella información que está sujeta al principio de publicidad, mientras que los segundos son aquellos datos personales que para su acceso por parte de terceros requieren de consentimiento, mandato de ley u orden judicial; y que, en atención a la naturaleza de los datos y a los riesgos que el mal uso y/o divulgación de los mismos implican para la Dirección Nacional de Registros Públicos; así como, del Sistema Nacional de Registros Públicos, se comprometen a mantener en forma estrictamente reservada y confidencial toda la información que por razón de su competencia tengan acceso. Asimismo, se obligan a abstenerse de usar, disponer, divulgar y/o publicar por cualquier medio, oral, escrito, y/o tecnológico y en general, aprovecharse de ella en cualquier otra forma para efectos ajenos a los intereses de la entidad a la que pertenece.<br />
                              8.2.- LOS INTERVINIENTES declaran que conocen los servicios que brinda la Dirección Nacional de Registros Públicos, así como los numerales 11, 19 del artículo 66 de la Constitución de la República del Ecuador; artículo 6 de la ley Orgánica del Sistema Nacional de Registros Públicos; numeral 2 del artículo 21 de la Ley Orgánica para la Optimización y Eficiencia de Trámites Administrativos; numeral 4 del artículo 6 de la Ley Orgánica de Transparencia y Acceso a la Información Pública; artículo 2 , 7, 10, 11, 25 y 26 de la Ley Orgánica de Protección de Datos Personales; y, los artículos 178, 180 y 229 del Código Orgánico Integral Penal; artículo 32 de la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos.<br />
                              8.3.- LOS INTERVINIENTES declaran, que conocen los procedimientos de acceso a los servicios y/o herramientas informáticas que provee la DINARP; y se comprometen a cumplir con el ordenamiento jurídico vigente y lo determinado pro el presente instrumento jurídico.
                            </p>

                            <p>
                              <strong>CLÁUSULA NOVENA. - VIGENCIA:</strong><br />
                              Los compromisos establecidos en el presente acuerdo de uso y confidencialidad tendrán vigencia únicamente mientras el COORDINADOR TITULAR, SUPLENTE, SUPERVISOR O VISUALIZADOR se encuentren en funciones dentro de la institución a las cuales pertenecen y en el marco de las atribuciones de su cargo a partir de la fecha de su suscripción, sin embargo, podrá ser revocada cuando las condiciones legales lo ameriten.<br />
                              En caso de secesión de funciones, terminación laboral, desvinculación, renuncia, cambio administrativo o cualquier otra circunstancia que implique la desvinculación de el o los Coordinadores institucionales de la entidad a la que pertenece el usuario deberá notificar formalmente a la DINARP, en virtud de la normativa vigente.
                            </p>

                            <p>
                              <strong>CLÁUSULA DÉCIMA. - ACEPTACIÓN:</strong><br />
                              LOS INTERVINIENTES aceptan el contenido de todas y cada una de las cláusulas del presente acuerdo y en consecuencia se comprometen a cumplirlas en toda su extensión, en fe de lo cual y para los fines legales correspondientes, suscriben el presente documento.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 p-4 bg-secondary-500/10 border border-secondary-500/20 rounded-xl hover:bg-secondary-500/15 transition-colors">
                            <Checkbox
                              id="clausulas-check"
                              checked={formData.clausulasAceptadas}
                              onCheckedChange={(c) => setFormData({ ...formData, clausulasAceptadas: Boolean(c) })}
                              className="size-5 rounded data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:border-secondary shrink-0"
                            />
                            <Label htmlFor="clausulas-check" className="text-[13px] sm:text-sm cursor-pointer font-bold text-foreground leading-snug">
                              He leído, comprendo y acepto expresamente las 10 cláusulas del Acuerdo de Uso y Confidencialidad oficial (Formulario ARP-R02). <span className="text-danger">*</span>
                            </Label>
                          </div>
                        </div>

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
                              onClick={() => setStep(1)}
                              className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                            >
                              <ArrowLeft className="size-4 shrink-0" />
                              <span className="whitespace-nowrap">Volver al paso anterior</span>
                            </Button>

                            <Button
                              type="button"
                              variant="primary"
                              size="default"
                              disabled={!formData.clausulasAceptadas}
                              onClick={() => setStep(3)}
                              className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                            >
                              <span className="whitespace-nowrap">Siguiente paso</span>
                              <ArrowRight className="size-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}


                  {/* â”€â”€ PASO 3: REVISIÓN DE LA INFORMACIÓN â”€â”€ */}
                  {step === 3 && (
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                      {/* Cabecera al ras con relleno de secondary 500 en baja opacidad */}
                      <div className="bg-secondary-500/10 dark:bg-secondary-500/20 border-b border-secondary-500/20 p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold font-heading text-secondary dark:text-secondary-300 flex items-center gap-2">
                            <FileCheck2 className="size-5 text-secondary shrink-0" />
                            <span>Paso 3 — Revisión de la Información</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Verifica que los datos del coordinador y las cláusulas del Anexo B sean correctos antes de proceder a la firma electrónica.
                          </p>
                        </div>
                        <Badge tone="neutral" appearance="soft" size="sm" className="font-bold text-[10px] uppercase tracking-wider shrink-0 self-start sm:self-auto rounded-full px-3 py-1 border border-secondary/30 text-secondary bg-secondary/10">
                          Documento ARP-R02
                        </Badge>
                      </div>

                        {/* Vista previa tipo Hoja de Oficio del Documento Anexo B (ARP-R02) */}
                        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-md max-w-5xl mx-auto border-t-4 border-t-secondary">
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
                              <span className="font-mono text-xs font-bold text-secondary block">
                                CÓDIGO: ARP-R02
                              </span>
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                ANEXO B · SISTEMA NACIONAL DE REGISTROS PÚBLICOS
                              </span>
                            </div>
                          </div>

                          {/* Título Principal del Documento */}
                          <div className="text-center space-y-1">
                            <h4 className="text-sm sm:text-base font-bold font-heading text-foreground uppercase tracking-wide">
                              ACUERDO DE USO Y CONFIDENCIALIDAD PARA COORDINADORES DEL SINARP
                            </h4>
                            <p className="text-[11px] text-muted-foreground italic">
                              Suscrito al amparo del Art. 66 num. 19 de la Constitución y Arts. 4 y 28 de la Ley del SINARP
                            </p>
                          </div>

                          ï»¿<div className="space-y-4 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground text-justify h-[400px] overflow-y-auto pr-2 custom-scrollbar">
  <p>
    <strong>CLÁUSULA PRIMERA. - INTERVINIENTES:</strong><br />
    Por una parte, comparece <strong>{formData.nombreEntidad}</strong>, con domicilio en <strong>{formData.domicilioEntidad}</strong>, 
    representada por el/la <strong>{formData.representanteLegalNombre}</strong>, 
    en adelante EL SOLICITANTE; y, por la otra parte, el/la <strong>{formData.funcionarioNombre}</strong>, <strong>{formData.funcionarioCargo}</strong>, 
    en adelante EL <strong>{formData.rolAsignado}</strong>. En lo sucesivo se denominarán en forma conjunta e indistinta LOS INTERVINIENTES.
  </p>

  <p>
    <strong>CLÁUSULA SEGUNDA. - ANTECEDENTES:</strong><br />
    {formData.misionVisionInstitucional}
  </p>

  <p>
    <strong>CLÁUSULA TERCERA. – BASE LEGAL:</strong><br />
    1. El artículo 66 numeral 19 del artículo 66 de la Constitución de la República del Ecuador establece: “Se reconoce y garantizará a las personas: (…) El derecho a la protección de datos de carácter personal, que incluye el acceso y la decisión sobre información y datos de este carácter, así como su correspondiente protección. La recolección, archivo, procesamiento, distribución o difusión de estos datos o información requerirán la autorización del titular o el mandato de la Ley”.<br /><br />
    2. La Ley Orgánica del Sistema Nacional de Registros Públicos, publicada en el Registro Oficial nro. 162 de 31 de marzo de 2010, crea a la Dirección Nacional de Registros Públicos, como organismo de derecho público, con personería jurídica, autonomía administrativa, técnica, operativa, financiera y presupuestaria, adscrita al Ministerio de Telecomunicaciones y Sociedad de la Información.<br /><br />
    3. La Ley indicada en el párrafo anterior, en su artículo 4, prescribe: “Las instituciones del sector público y privado y las personas naturales que actualmente o en el futuro administren bases o registros de datos públicos, son responsables de la integridad, protección y control de los registros y bases de datos a su cargo. Dichas instituciones responderán por la veracidad, autenticidad, custodia y debida conservación de los registros. La responsabilidad sobre la veracidad y autenticidad de los datos registrados, es exclusiva de la o el declarante cuando esta o este provee toda la información (…)”.<br /><br />
    4. El artículo 28 de la norma ut supra establece: “Créase el Sistema Nacional de Registros Públicos con la finalidad de proteger los derechos constituidos, los que se constituyan, modifiquen, extingan y publiciten por efectos de la inscripción de los hechos, actos y/o contratos determinados por la presente Ley y las leyes y normas de registros; y con el objeto de coordinar el intercambio de información de los registros públicos. En el caso de que entidades privadas posean información que por su naturaleza sea pública, serán incorporadas a este sistema.”<br /><br />
    5. El artículo 27 de la Ley ibidem establece: “Las Registradoras o Registradores y máximas autoridades, a quienes se autoriza el manejo de las licencias para el acceso a los registros de datos utilizados por la ley, serán las o los responsables directos administrativa, civil y penalmente por el mal uso de las mismas”.<br /><br />
    6. Asimismo, el artículo 29 de la Ley Orgánica del Sistema Nacional de Registros Públicos, determina que: “El Sistema Nacional de Registros Públicos estará conformado por los registros: civil, de la propiedad, mercantil, societario, datos de conectividad electrónica, vehicular, de naves y aeronaves, patentes, de propiedad intelectual registros de datos crediticios y todos los registros de datos de las instituciones públicas y privadas que mantuvieren y administren por disposición legal información registral de carácter público”.<br /><br />
    7. El artículo 2 de la Ley Orgánica de Protección de Datos Personales, establece que la mentada Ley, (…) se aplicará al tratamiento de datos personales contenidos en cualquier tipo de soporte, automatizados o no, así como a toda modalidad de uso posterior. (…)<br /><br />
    8. El artículo 7 de la norma ut supra, determina: “El tratamiento será legítimo y lícito si se cumple con alguna de las siguientes condiciones: (…) 2) Que sea realizado por el responsable del tratamiento en cumplimiento de una obligación legal; 3) Que sea realizado por el responsable del tratamiento, por orden judicial, debiendo observarse los principios de la presente Ley; 4) Que el tratamiento de datos personales se sustente en el cumplimiento de una misión realizada en interés público o en el ejercicio de poderes públicos conferidos al responsable, derivados de una competencia atribuida por una norma con rango de ley, sujeto al cumplimiento de los estándares internacionales de derechos humanos aplicables a la materia, al cumplimiento de los principios de esta Ley y a los criterios de legalidad, proporcionalidad y necesidad;(…)<br /><br />
    9. Los literales a, b, d, e y g del artículo 10 de la Ley Orgánica de Protección de Datos Personales, estipula entre sus principios: “a) Juridicidad. - Los datos personales deben tratarse con estricto apego y cumplimiento a los principios, derechos y obligaciones establecidas en la Constitución, los instrumentos internacionales, la presente Ley, su Reglamento y la demás normativa y jurisprudencia aplicable; b) Lealtad.- El tratamiento de datos personales deberá ser leal, por lo que para los titulares debe quedar claro que se están recogiendo, utilizando, consultando o tratando de otra manera, datos personales que les conciernen, así como las formas en que dichos datos son o serán tratados. En ningún caso los datos personales podrán ser tratados a través de medios o para fines, ilícitos o desleales.; d) Finalidad.- Las finalidades del tratamiento deberán ser determinadas, explícitas, legítimas y comunicadas al titular: no podrán tratarse datos personales con fines distintos para los cuales fueron recopilados, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta Ley. El tratamiento de datos personales con fines distintos de aquellos para los que hayan sido recogidos inicialmente solo debe permitirse cuando sea compatible con los fines de su recogida inicial. Para ello, habrá de considerarse el contexto en el que se recogieron los datos, la información facilitada al titular en ese proceso y, en particular, las expectativas razonables del titular basadas en su relación con el responsable en cuanto a su uso posterior, la naturaleza de los datos personales, las consecuencias para los titulares del tratamiento ulterior previsto y la existencia de garantías adecuadas tanto en la operación de tratamiento original como en la operación de tratamiento ulterior prevista.; e) Pertinencia y minimización de datos personales. - Los datos personales deben ser pertinentes y estar limitados a lo estrictamente necesario para el cumplimiento de la finalidad del tratamiento. (…);“g) Confidencialidad. - El tratamiento de datos personales debe concebirse sobre la base del debido sigilo y secreto, es decir, no debe tratarse o comunicarse para un fin distinto para el cual fueron recogidos, a menos que concurra una de las causales que habiliten un nuevo tratamiento conforme los supuestos de tratamiento legítimo señalados en esta ley. Para tal efecto, el responsable del tratamiento deberá adecuar las medidas técnicas organizativas para cumplir con este principio”.<br /><br />
    10. El artículo 38 de la Ley Orgánica de Protección de Datos Personales, estipula: “El mecanismo gubernamental de seguridad de la información deberá incluir las medidas que deban implementarse en el caso de tratamiento de datos personales para hacer frente a cualquier riesgo, amenaza., vulnerabilidad, accesos no autorizados, pérdidas, alteraciones, destrucción o comunicación accidental o ilícita en el tratamiento de los datos conforme al principio de seguridad de datos personales. El mecanismo gubernamental de seguridad de la información abarcará y aplicará a todas las instituciones del sector público, contenidas en el artículo 225 de la Constitución de la República de Ecuador, así como a terceros que presten servicios públicos mediante concesión, u otras figuras legalmente reconocidas. Estas, podrán incorporar medidas adicionales al mecanismo gubernamental de seguridad de la información”.<br /><br />
    11. El artículo 46 de la Ley Orgánica de Protección de Datos Personales, prescribe: “El responsable del tratamiento deberá notificar sin dilación la vulneración de seguridad de datos personales al titular cuando conlleve un riesgo a sus derechos fundamentales y libertades individuales, dentro del término de tres días contados a partir de la fecha en la que tuvo conocimiento del riesgo. No se deberá notificar la vulneración de seguridad de datos personales al titular en los siguientes casos: 1. Cuando el responsable del tratamiento haya adoptado medidas de protección técnicas organizativas o de cualquier otra índole apropiadas aplicadas a los datos personales afectados por la vulneración de seguridad que se pueda demostrar que son efectivas; 2. Cuando el responsable del tratamiento haya tomado medidas que garanticen que el riesgo para los derechos fundamentales y las libertades individuales del titular, no ocurrirá; y, 3. Cuando se requiera un esfuerzo desproporcionado para hacerlo; en cuyo caso, el responsable del tratamiento deberá realizar una comunicación pública a través de cualquier medio en la que se informe de la vulneración de seguridad de datos personales a los titulares. 4. La procedencia de las excepciones de los numerales 1 y 2 deberá ser calificada por la Autoridad de Protección de Datos, una vez informada esta tan pronto sea posible, y en cualquier caso dentro de los plazos contemplados en el Articulo 43. 5. La notificación al titular del dato objeto de la vulneración de segundad contendrá lo señalado en el artículo 43 de esta ley. 6. En caso de que el responsable del tratamiento de los datos personales no cumpliese oportunamente y de modo justificado con la notificación será sancionado conforme al régimen sancionatorio previsto en esta ley. 7. La notificación oportuna de la violación por parte del responsable del tratamiento al titular y la ejecución oportuna de medidas de respuesta, serán consideradas atenuante de la infracción”.<br /><br />
    12. El artículo 178 del Código Orgánico Integral Penal establece: “La persona que, sin contar con el consentimiento o la autorización legal, acceda, intercepte, examine, retenga, grabe, reproduzca, difunda o publique datos personales, mensajes de datos, voz, audio y vídeo, objetos postales, información contenida en soportes informáticos, comunicaciones privadas o reservadas de otra persona por cualquier medio, será sancionada con pena privativa de libertad de uno a tres años (…)”.<br /><br />
    13. El artículo 229 del código ibidem, manifiesta: “Revelación ilegal de base de datos.- La persona que, en provecho propio o de un tercero, revele información registrada, contenida en ficheros, archivos, bases de datos o medios semejantes, a través o dirigidas a un sistema electrónico, informático, telemático o de telecomunicaciones; materializando voluntaria e intencionalmente la violación del secreto, la intimidad y la privacidad de las personas, será sancionada con pena privativa de libertad de uno a tres años”.
  </p>

  <p>
    <strong>CLÁUSULA CUARTA. - DE LA PROTECCIÓN DE LA INFORMACIÓN Y EL TRATAMIENTO:</strong><br />
    Los intervinientes de forma libre y voluntaria se obligan a guardar la confidencialidad y reserva de la información, respecto al acceso y uso de las herramientas que provee la Dirección Nacional de Registros Públicos, quien en cumplimiento de sus atribuciones y facultades determinadas en la Ley Orgánica del Sistema Nacional de Registros Públicos, controlará y supervisará que las entidades pertenecientes al Sistema Nacional de Registros Públicos, incorporen mecanismos de protección de datos personales; de igual manera dará cumplimiento a las disposiciones establecidas en la Ley Orgánica de Protección de Datos Personales, su reglamento de aplicación y demás normativa que emita la Autoridad de Protección de Datos Personales.<br />
    El acceso a la consulta y tratamiento de la información contenida en las herramientas que proporciona la Dirección Nacional de Registros Públicos, se sujetará a las condiciones de legitimación para el tratamiento de datos personales y principalmente a los principios de legalidad, finalidad, pertinencia, minimización y las demás previstos en el ordenamiento jurídico ecuatoriano aplicables.<br />
    Los intervinientes quedan obligados a utilizar única y exclusivamente la información para los fines determinados por la entidad, considerando que todas las acciones reguladas por la Dirección Nacional de Registros Públicos en el ejercicio de sus funciones no podrán ser reveladas, divulgadas, transferidas, utilizadas o expuestas para propósitos distintos a los autorizados por la Dirección Nacional de Registros Públicos; sin perjuicio de legalidad o licitud que las mismas puedan suponer.
  </p>

  <p>
    <strong>CLÁUSULA QUINTA. – OBLIGACIONES DE LOS INTERVINIENTES:</strong><br />
    LOS INTERVINIENTES se obliga a:<br />
    a. Utilizar los accesos al Sistema Nacional de Registros Públicos, exclusivamente para los propósitos determinados en sus funciones o cargo, y siempre que los mismos guarden estricta relación con el objeto social o competencias institucionales, legales de la entidad a la que pertenece.<br />
    b. Velar por el buen uso de la información que integra el Sistema Nacional de Registros Públicos.<br />
    c. Implementar y/o utilizar las medidas de seguridad adecuadas y necesarias, entendiéndose por tales las aceptadas por el estado de la técnica, sean estas organizativas, técnicas o de cualquier otra índole, para proteger los datos personales, frente a cualquier riesgo, amenaza, vulnerabilidad, atendiendo a la naturaleza de los datos de carácter personal, al ámbito y el contexto.<br />
    d. Implementar y/o utilizar un proceso de verificación, evaluación y valoración continua permanente de la eficiencia, eficacia y efectividad de las medidas de carácter técnico, organizativo y de cualquier otra índole, implementadas con el objeto de garantizar y mejorar la seguridad del tratamiento de datos personales.<br />
    e. Implementar y/o utilizar políticas de trazabilidad que determinen fecha, hora y servidor que ha tenido acceso a la plataforma y a los datos.<br />
    f. Notificar a la Dirección Nacional de Registro de Datos Públicos cualquier vulneración de los sistemas que pueda representar un riesgo para los datos personales, sus titulares o la plataforma del Sistema Nacional de Registros Públicos, sin perjuicio de las notificaciones que debe realizar a la Superintendencia de Protección de Datos Personales y al titular, conforme a la Ley Orgánica de Protección de Datos Personales.<br />
    g. Tratar los datos con estricto apego y cumplimiento a los principios, derechos y obligaciones establecidas en la Constitución, instrumentos internacionales, Ley Orgánica de Protección de Datos Personales, su Reglamento y demás normativa que emita la Superintendencia de Protección de Datos Personales.<br />
    h. Llevar un registro, que permita mantener un detalle actualizado de las gestiones realizadas.<br />
    i. Al finalizar sus funciones deberá existir, un acta-entrega recepción donde conste el detalle de sus actividades y productos generados.<br />
    j. Y demás obligaciones que se encuentren establecidas en las normas creadas para el afecto.
  </p>

  <p>
    <strong>CLÁUSULA SEXTA. - PROHIBICIONES DE LOS INTERVINIENTES:</strong><br />
    LOS INTERVINIENTES no podrán:<br />
    4.1 Modificar, alterar, divulgar, comercializar de manera total o parcial la información y/o herramientas a la cual obtuviere acceso.<br />
    4.2 Publicar, difundir, ceder, trasmitir o permitir a terceros no autorizados el acceso total o parcial a la información incorporada en el Sistema Nacional de Registros Públicos.<br />
    4.3 Revelar, compartir o difundir por cualquier medio la clave de acceso al Sistema Nacional de Registros Públicos.<br />
    4.4 Hacer uso de las claves de acceso cuando está haciendo uso de vacaciones o permisos.
  </p>

  <p>
    <strong>CLÁUSULA SÉPTIMA. – RESPONSABILIDAD:</strong><br />
    LOS INTERVINIENTES serán responsables civiles, administrativo y penalmente por el incumplimiento del presente acuerdo de uso y confidencialidad.<br />
    Al suscribir el presente, los intervinientes aceptan de manera libre y voluntaria que la Dirección Nacional de Registros Públicos, no será responsable bajo ninguna circunstancia, por los daños o perjuicios de cualquier naturaleza que pudieran derivarse por el uso indebido que el o los usuarios hagan de la información, los sistemas y/o herramientas a las que tengan acceso, ni por errores en la información consultada, ingresada, procesada u obtenida, quedando bajo la exclusiva responsabilidad de los intervinientes la verificación y correcto uso de las mismas.
  </p>

  <p>
    <strong>CLÁUSULA OCTAVA. - DECLARACIONES:</strong><br />
    8.1. LOS INTERVINIENTES, declaran conocer que todos los registros públicos que forman parte del Sistema Nacional de Registros Públicos, contienen datos accesibles y confidenciales; los primeros hacen referencia a toda aquella información que está sujeta al principio de publicidad, mientras que los segundos son aquellos datos personales que para su acceso por parte de terceros requieren de consentimiento, mandato de ley u orden judicial; y que, en atención a la naturaleza de los datos y a los riesgos que el mal uso y/o divulgación de los mismos implican para la Dirección Nacional de Registros Públicos; así como, del Sistema Nacional de Registros Públicos, se comprometen a mantener en forma estrictamente reservada y confidencial toda la información que por razón de su competencia tengan acceso. Asimismo, se obligan a abstenerse de usar, disponer, divulgar y/o publicar por cualquier medio, oral, escrito, y/o tecnológico y en general, aprovecharse de ella en cualquier otra forma para efectos ajenos a los intereses de la entidad a la que pertenece.<br />
    8.2.- LOS INTERVINIENTES declaran que conocen los servicios que brinda la Dirección Nacional de Registros Públicos, así como los numerales 11, 19 del artículo 66 de la Constitución de la República del Ecuador; artículo 6 de la ley Orgánica del Sistema Nacional de Registros Públicos; numeral 2 del artículo 21 de la Ley Orgánica para la Optimización y Eficiencia de Trámites Administrativos; numeral 4 del artículo 6 de la Ley Orgánica de Transparencia y Acceso a la Información Pública; artículo 2 , 7, 10, 11, 25 y 26 de la Ley Orgánica de Protección de Datos Personales; y, los artículos 178, 180 y 229 del Código Orgánico Integral Penal; artículo 32 de la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos.<br />
    8.3.- LOS INTERVINIENTES declaran, que conocen los procedimientos de acceso a los servicios y/o herramientas informáticas que provee la DINARP; y se comprometen a cumplir con el ordenamiento jurídico vigente y lo determinado pro el presente instrumento jurídico.
  </p>

  <p>
    <strong>CLÁUSULA NOVENA. - VIGENCIA:</strong><br />
    Los compromisos establecidos en el presente acuerdo de uso y confidencialidad tendrán vigencia únicamente mientras el COORDINADOR TITULAR, SUPLENTE, SUPERVISOR O VISUALIZADOR se encuentren en funciones dentro de la institución a las cuales pertenecen y en el marco de las atribuciones de su cargo a partir de la fecha de su suscripción, sin embargo, podrá ser revocada cuando las condiciones legales lo ameriten.<br />
    En caso de secesión de funciones, terminación laboral, desvinculación, renuncia, cambio administrativo o cualquier otra circunstancia que implique la desvinculación de el o los Coordinadores institucionales de la entidad a la que pertenece el usuario deberá notificar formalmente a la DINARP, en virtud de la normativa vigente.
  </p>

  <p>
    <strong>CLÁUSULA DÉCIMA. - ACEPTACIÓN:</strong><br />
    LOS INTERVINIENTES aceptan el contenido de todas y cada una de las cláusulas del presente acuerdo y en consecuencia se comprometen a cumplirlas en toda su extensión, en fe de lo cual y para los fines legales correspondientes, suscriben el presente documento.
  </p>
</div>


                            {/* Bloque de Firmas Estilo Featured Cards */}
                            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                              {/* Tarjeta 1: Firma Representante Legal (Informativa / Autorizada) */}
                              <Card
                                variant="featured"
                                disableHover={true}
                                className="bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 shadow-none text-center p-6 sm:p-7 relative overflow-hidden rounded-2xl flex flex-col items-center justify-center"
                              >
                                <CardDecorativeIcon className="-bottom-6 -right-6 opacity-15 pointer-events-none">
                                  <FileSignature className="size-28 text-secondary" />
                                </CardDecorativeIcon>

                                <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                                  {/* Icono destacado centrado */}
                                  <div className="size-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shadow-xs">
                                    <FileSignature className="size-7 opacity-80" />
                                  </div>

                                  <div className="text-secondary/70 italic text-[11px] font-medium">
                                    [Firma Electrónica Representante Legal]
                                  </div>

                                  <div className="w-full border-t border-secondary/20 pt-3 flex flex-col items-center text-center">
                                    <span className="font-bold font-heading text-foreground block text-sm sm:text-base">
                                      {formData.representanteLegalNombre}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                                      Representante Legal / Delegado
                                    </span>
                                  </div>
                                </div>
                              </Card>

                              {/* Tarjeta 2: Pendiente FirmaEC (Destacada con barrido glowy y destello en secondary 500) */}
                              <Card
                                variant="featured"
                                disableHover={true}
                                className="bg-secondary-500/10 dark:bg-secondary-500/20 border-2 border-secondary-500/50 text-center p-6 sm:p-7 relative overflow-hidden rounded-2xl ring-2 ring-secondary-500/20 shadow-lg shadow-secondary-500/10 flex flex-col items-center justify-center group"
                              >
                                {/* Barrido glowy con destello continuo */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
                                  {/* Haz de luz oblicuo con barrido progresivo */}
                                  <div className="absolute inset-0 -translate-x-full animate-progress-wave bg-gradient-to-r from-transparent via-secondary/25 via-white/40 dark:via-secondary/35 to-transparent skew-x-12 pointer-events-none" />
                                  {/* Destello resplandor radial en esquina */}
                                  <div className="absolute -top-10 -right-10 size-32 rounded-full bg-secondary/20 blur-xl animate-pulse pointer-events-none" />
                                </div>

                                <div className="space-y-3 relative z-10 w-full flex flex-col items-center">
                                  {/* Badge de acción destacada con destello */}
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/15 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-wider shadow-xs">
                                    <Sparkles className="size-3 text-secondary animate-pulse shrink-0" />
                                    <span>Acción Requerida en Paso 4</span>
                                  </div>

                                  {/* Icono grande destacado centrado */}
                                  <div className="size-14 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary shadow-sm relative">
                                    <ShieldCheck className="size-7 text-secondary" />
                                    {/* Punto pulsante de destello */}
                                    <span className="absolute -top-1 -right-1 flex size-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                      <span className="relative inline-flex rounded-full size-2.5 bg-secondary"></span>
                                    </span>
                                  </div>

                                  <div className="text-secondary font-bold text-xs sm:text-sm tracking-wide">
                                    Pendiente FirmaEC (Paso 4)
                                  </div>

                                  <div className="w-full border-t border-secondary/25 pt-3 flex flex-col items-center text-center">
                                    <span className="font-bold font-heading text-secondary block text-sm sm:text-base">
                                      {formData.funcionarioNombre}
                                    </span>
                                    <span className="text-[11px] text-secondary-800 dark:text-secondary-200 block mt-0.5 font-medium">
                                      Coordinador Designado ({formData.rolAsignado})
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          </div>

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
                            onClick={() => setStep(2)}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                          >
                            <ArrowLeft className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Volver al paso anterior</span>
                          </Button>

                          <Button
                            type="button"
                            variant="primary"
                            size="default"
                            onClick={() => setStep(4)}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                          >
                            <span className="whitespace-nowrap">Continuar a firma</span>
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* â”€â”€ PASO 4: FIRMA Y ENVÍO â”€â”€ */}
                  {step === 4 && (
                    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                      {/* Cabecera al ras con relleno de secondary 500 en baja opacidad */}
                      <div className="bg-secondary-500/10 dark:bg-secondary-500/20 border-b border-secondary-500/20 p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold font-heading text-secondary dark:text-secondary-300 flex items-center gap-2">
                            <ShieldCheck className="size-5 text-secondary shrink-0" />
                            <span>Paso 4 — Firma y Envío de la Solicitud</span>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Suscripción del instrumento digital ARP-R02 mediante Firma Electrónica.
                          </p>
                        </div>
                        <Badge
                          tone={isSigned ? "success" : firmaFallo ? (firmaFallo.tipo === "INCIERTA" ? "warning" : "danger") : "warning"}
                          appearance="soft"
                          size="sm"
                          className="font-bold text-[10px] uppercase tracking-wider shrink-0 self-start sm:self-auto rounded-full px-3 py-1"
                        >
                          {isSigned ? "Firma Confirmada" : firmaFallo ? "Firma No Confirmada" : "Pendiente Firma"}
                        </Badge>
                      </div>

                      <div className="p-5 rounded-2xl border border-border bg-muted/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                              <FileText className="size-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-foreground">
                                ARP-R02_Acuerdo_Uso_Confidencialidad.pdf
                              </h4>
                              <p className="text-[11px] text-muted-foreground">
                                Documento digital generado · 245 KB
                              </p>
                            </div>
                          </div>

                          <Badge
                            tone={isSigned ? "success" : "warning"}
                            appearance="soft"
                            size="sm"
                          >
                            {isSigned
                              ? "FIRMADO DIGITALMENTE"
                              : firmaFallo
                              ? "FIRMA NO CONFIRMADA"
                              : "PENDIENTE DE FIRMA"}
                          </Badge>
                        </div>

                        {/* Caso de contingencia / fallo en FirmaEC */}
                        {firmaFallo ? (
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
                              title="Firma de Anexo B no confirmada; revisa o reintenta"
                            >
                              {firmaFallo.motivo}
                            </Alert>

                            {/* Metadatos compactos de integridad y estado */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-3.5 rounded-xl bg-surface/80 dark:bg-surface/50 border border-border text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground text-[11px]">Diagnóstico FirmaEC:</span>
                                <Badge
                                  tone="warning"
                                  appearance="soft"
                                  size="sm"
                                  className="font-bold uppercase tracking-wider text-[10px]"
                                >
                                  {firmaFallo.tipo === "RECHAZADA" && "Certificado Inválido"}
                                  {firmaFallo.tipo === "CADUCADA" && "Sesión Caducada"}
                                  {firmaFallo.tipo === "INCIERTA" && "Respuesta Incierta"}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground text-[11px]">ID Transacción original:</span>
                                <strong className="font-mono text-foreground font-semibold text-xs">{firmaFallo.transaccionId}</strong>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground text-[11px]">Estado Invitación:</span>
                                <span className="text-success font-semibold text-[11px] flex items-center gap-1">
                                  <Check className="size-3" /> PENDIENTE (No consumida)
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground text-[11px]">Borrador Anexo B:</span>
                                <span className="text-foreground font-semibold text-[11px]">
                                  Conservado intacto (Sin duplicar)
                                </span>
                              </div>
                            </div>

                            {/* Acciones de recuperación y consulta alineadas a la derecha */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-1">
                              {firmaFallo.tipo === "INCIERTA" && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={isCheckingTransaction}
                                  onClick={handleConsultarTransaccionOriginal}
                                  className="font-bold text-xs gap-1.5 shadow-xs w-full sm:w-auto"
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
                                className="font-bold text-xs gap-1.5 shadow-xs w-full sm:w-auto text-white"
                              >
                                <RefreshCw className="size-3.5" />
                                <span>Reintentar firma con FirmaEC</span>
                              </Button>
                            </div>
                          </div>
                        ) : !isSigned ? (
                          <div className="pt-2 border-t border-border/60 space-y-4">
                            {/* Alerta de notificación por correo */}
                            <div className="p-4 rounded-xl border border-secondary/25 bg-secondary/5 space-y-2 text-xs">
                              <div className="flex items-center gap-2 font-bold text-secondary">
                                <Mail className="size-4 shrink-0" />
                                <span>Notificación de firma enviada a tu correo institucional</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-muted-foreground">
                                Se ha remitido la notificación de suscripción digital al correo <strong className="text-foreground font-semibold">{formData.funcionarioEmail || "tu correo institucional registrado"}</strong>.
                              </p>
                              <p className="text-[11px] font-semibold text-secondary flex items-center gap-1.5 pt-1">
                                <RefreshCw className="size-3.5 animate-spin shrink-0" />
                                <span>Revisa tu correo. Cuando firmes en FirmaEC o Token, el estado de esta pantalla se actualizará automáticamente.</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                              <LoadingSpinner size="sm" className="size-3.5 text-secondary shrink-0" />
                              <span className="text-[11px] font-medium">Monitoreando firma en vivo...</span>
                            </div>
                          </div>
                        ) : (
                          <Alert
                            variant="success"
                            className="flex flex-col items-center justify-center text-center p-6 sm:p-8 gap-3.5 rounded-2xl [&_.alert-line]:hidden [&_.alert-icon]:size-14 sm:[&_.alert-icon]:size-16 [&_.alert-icon]:rounded-2xl [&_.alert-icon_svg]:size-7 sm:[&_.alert-icon_svg]:size-8 [&_.alert-icon]:shadow-sm [&_.alert-icon]:mb-1 [&_.alert-title]:text-center [&_.alert-title]:text-base sm:[&_.alert-title]:text-lg [&_.alert-title]:font-bold [&_.alert-title]:font-heading [&>div:last-of-type]:text-center [&>div:last-of-type]:items-center [&>div:last-of-type]:w-full animate-in fade-in duration-300"
                            icon={<CheckCircle2 className="size-7 sm:size-8" />}
                            title="Firma Electrónica Confirmada por FirmaEC"
                          >
                            <div className="flex flex-col items-center justify-center text-center space-y-4 mt-1 w-full">
                              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                                El documento ARP-R02 ha sido firmado digitalmente de forma válida y los cambios se actualizaron en esta pantalla.
                              </p>

                              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2 text-xs w-full">
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-xs text-foreground font-mono text-[11px] sm:text-xs">
                                  <span className="font-sans font-medium text-muted-foreground">Fecha y Hora:</span>
                                  <strong className="text-foreground font-bold">{signatureInfo?.fechaHora || "01/10/2026 08:35"}</strong>
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface/80 dark:bg-surface/40 border border-success/30 shadow-xs text-foreground font-mono text-[11px] sm:text-xs">
                                  <span className="font-sans font-medium text-muted-foreground">Serie Certificado / ID:</span>
                                  <strong className="text-foreground font-bold">{signatureInfo?.identificador || "FIRMA-EC-2026-98124-B"}</strong>
                                </div>
                              </div>
                            </div>
                          </Alert>
                        )}
                      </div>

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
                            onClick={() => setStep(3)}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto px-4 whitespace-nowrap"
                          >
                            <ArrowLeft className="size-4 shrink-0" />
                            <span className="whitespace-nowrap">Volver al paso anterior</span>
                          </Button>

                          <Button
                            type="submit"
                            variant="primary"
                            size="default"
                            disabled={!isSigned || isSubmitting || Boolean(firmaFallo)}
                            className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                          >
                            {isSubmitting ? (
                              <span>Enviando trámite...</span>
                            ) : (
                              <>
                                <span className="whitespace-nowrap">Enviar para aprobación</span>
                                <Check className="size-4" />
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

            {/* â”€â”€ DIALOG DE CONFIRMACIÓN DE ENVÍO EXITOSO (ENCIMA) â”€â”€ */}
            <Dialog
              open={isSubmittedSuccess}
              onOpenChange={(open) => {
                if (!open) {
                  router.push("/login");
                }
              }}
            >
              <DialogContent
                variant="success"
                size="lg"
                className="rounded-3xl border-border p-6 sm:p-8"
                showCloseButton={false}
              >
                <div className="flex justify-center -mt-2">
                  <Badge tone="success" appearance="soft" size="sm" className="border border-success/30 font-bold uppercase tracking-wider">
                    Trámite Radicado: {submittedSolicitudId}
                  </Badge>
                </div>

                <DialogHeader className="space-y-1.5 text-center items-center">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                    Solicitud enviada
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Tu solicitud fue enviada al Área de Gestión para revisión.
                  </DialogDescription>
                </DialogHeader>

                <div className="w-full p-4 sm:p-5 bg-muted/40 rounded-2xl border border-border text-left space-y-2.5 text-xs my-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Número de solicitud:</span>
                    <span className="font-mono font-bold text-foreground">{submittedSolicitudId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Institución:</span>
                    <span className="font-bold text-foreground text-right">{formData.nombreEntidad}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tipo de trámite:</span>
                    <span className="font-medium text-foreground text-right">Anexo B · Activación de Coordinador</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estado actual:</span>
                    <Badge tone="warning" appearance="soft" size="sm">En revisión</Badge>
                  </div>
                </div>

                <DialogFooter className="w-full sm:justify-center pt-2">
                  <Link href="/login" className="w-full">
                    <Button
                      type="button"
                      variant="success"
                      size="default"
                      className="w-full font-bold gap-2 text-xs sm:text-sm shadow-md"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Volver al acceso principal</span>
                    </Button>
                  </Link>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* ========================================================= */}
        {/* EXPERIENCIA 2: ÁREA DE GESTIÓN / REVISOR                 */}
        {/* ========================================================= */}
        {simulatedRole !== "COORDINADOR_SINARP" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Encabezado y Miga de Pan */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                <Link href="/login" className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0">
                  <Home className="size-3.5" />
                  <span>Inicio</span>
                </Link>
                <span>/</span>
                <span>Solicitudes</span>
                <span>/</span>
                <span className="text-foreground font-semibold truncate">Anexo B · Activación de Coordinador</span>
              </nav>

              <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                Visualizando como: {ROLES_CONFIG[simulatedRole]?.name || simulatedRole}
              </Badge>
            </div>

            {/* Banner Área de Gestión */}
            <Card variant="featured" disableHover={true} className="bg-surface border border-border p-6 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    Bandeja de Gestión de Solicitudes — Anexo B
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revisión, aprobación o rechazo de solicitudes de enrolamiento de Coordinadores SINARP.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSimulatedRole("COORDINADOR_SINARP")}
                  className="text-xs font-semibold gap-1.5 self-start sm:self-auto"
                >
                  <UserCheck className="size-3.5" />
                  <span>Cambiar a Vista Coordinador</span>
                </Button>
              </div>
            </Card>

            {/* Tabla Bandeja de Solicitudes (Categoría 5: Table) */}
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border/60 pb-4">
                <h3 className="text-sm font-bold text-foreground">Solicitudes de Coordinadores SINARP</h3>
                <Badge tone="neutral" appearance="soft" size="sm">
                  {solicitudes.filter((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR").length} trámites en catálogo
                </Badge>
              </div>

              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs font-bold text-foreground">N.º Trámite</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Solicitante</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Institución</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Tipo de Trámite</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Fecha</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Estado</TableHead>
                      <TableHead className="w-24 text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitudes
                      .filter((s) => s.tipoTramite === "PROCESO_B_ENROLAMIENTO_COORDINADOR")
                      .map((sol) => {
                        const badgeProps = getEstadoBadgeProps(sol.estado);
                        return (
                          <TableRow key={sol.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              {sol.id}
                            </TableCell>
                            <TableCell className="text-xs font-medium text-foreground">
                              {sol.nombreCompleto}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {sol.institucion}
                            </TableCell>
                            <TableCell className="text-xs text-foreground font-medium">
                              Anexo B · Activación
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {sol.fechaSolicitud}
                            </TableCell>
                            <TableCell>
                              <Badge tone={badgeProps.tone} appearance="soft" size="sm" dot>
                                {badgeProps.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button type="button" onClick={() => {
                                      setSelectedSolicitudDetalle(sol);
                                      setIsSheetDetailOpen(true);
                                    }} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                                    <Eye className="size-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver detalle</TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* PANEL LATERAL SHEET (Categoría 4: Sheet) */}
            <Sheet open={isSheetDetailOpen} onOpenChange={setIsSheetDetailOpen}>
              <SheetContent side="right" className="w-full sm:max-w-lg md:max-w-xl p-0 flex flex-col h-full bg-surface border-l border-border shadow-2xl">
                {selectedSolicitudDetalle && (
                  <>
                    <SheetHeader className="p-6 border-b border-border/70 shrink-0 bg-surface/50">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="font-mono text-xs font-semibold text-muted-foreground uppercase">
                          {selectedSolicitudDetalle.id}
                        </span>
                        <Badge tone={getEstadoBadgeProps(selectedSolicitudDetalle.estado).tone} appearance="soft" size="sm">
                          {getEstadoBadgeProps(selectedSolicitudDetalle.estado).label}
                        </Badge>
                      </div>
                      <SheetTitle className="text-lg font-bold font-heading text-foreground">
                        Detalle de Solicitud — {selectedSolicitudDetalle.nombreCompleto}
                      </SheetTitle>
                      <SheetDescription className="text-xs text-muted-foreground">
                        {selectedSolicitudDetalle.institucion}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                      {/* Información del Coordinador */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] border-b border-border/60 pb-1">
                          Información del Coordinador
                        </h4>
                        <div className="space-y-1">
                          <div><span className="text-muted-foreground">Nombre:</span> <strong>{selectedSolicitudDetalle.nombreCompleto}</strong></div>
                          <div><span className="text-muted-foreground">Cédula:</span> <span className="font-mono">{selectedSolicitudDetalle.cedula}</span></div>
                          <div><span className="text-muted-foreground">Correo:</span> {selectedSolicitudDetalle.correo}</div>
                          <div><span className="text-muted-foreground">Institución:</span> {selectedSolicitudDetalle.institucion}</div>
                        </div>
                      </div>

                      {/* Anexo B y Documentos */}
                      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] border-b border-border/60 pb-1">
                          Documento y Firma Digital
                        </h4>
                        <div className="space-y-1">
                          <div><span className="text-muted-foreground">Documento:</span> ARP-R02_Acuerdo_Uso_Confidencialidad.pdf</div>
                          <div><span className="text-muted-foreground">Estado Firma:</span> Firmado Electrónicamente (FirmaEC)</div>
                          <div><span className="text-muted-foreground">Fecha de envío:</span> {selectedSolicitudDetalle.fechaSolicitud}</div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewDocModal({ open: true, title: "ARP-R02_Acuerdo_Uso_Confidencialidad.pdf" })}
                          className="mt-2 text-[11px] gap-1.5"
                        >
                          <Eye className="size-3" />
                          <span>Previsualizar documento PDF</span>
                        </Button>
                      </div>

                      {/* Motivo de rechazo si aplica */}
                      {selectedSolicitudDetalle.motivoRechazo && (
                        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 space-y-1 text-xs">
                          <span className="font-bold text-danger uppercase tracking-wider text-[11px] block">
                            Motivo de rechazo registrado:
                          </span>
                          <p className="text-foreground">{selectedSolicitudDetalle.motivoRechazo}</p>
                        </div>
                      )}

                      {/* Trazabilidad en Timeline (Categoría 6: Timeline) */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                          Historial de Trazabilidad
                        </h4>
                        <Timeline
                          items={[
                            {
                              id: "tl1",
                              title: "Solicitud Radicada",
                              description: "Formulario Anexo B firmado digitalmente y remitido.",
                              date: selectedSolicitudDetalle.fechaSolicitud,
                              status: "primary",
                              icon: <FileSignature className="size-4" />
                            },
                            {
                              id: "tl2",
                              title: "Revisión por Área de Gestión",
                              description: selectedSolicitudDetalle.estado === "Aprobada" ? "Aprobada formalmente." : selectedSolicitudDetalle.estado === "Rechazada" ? "Rechazada por observaciones." : "En proceso de evaluación.",
                              date: selectedSolicitudDetalle.fechaRevision || selectedSolicitudDetalle.fechaSolicitud,
                              status: selectedSolicitudDetalle.estado === "Aprobada" ? "success" : selectedSolicitudDetalle.estado === "Rechazada" ? "danger" : "warning",
                              icon: selectedSolicitudDetalle.estado === "Aprobada" ? <CheckCircle2 className="size-4" /> : selectedSolicitudDetalle.estado === "Rechazada" ? <XCircle className="size-4" /> : <Clock className="size-4" />
                            }
                          ]}
                        />
                      </div>
                    </div>

                    <SheetFooter className="p-4 border-t border-border shrink-0 bg-surface flex justify-between items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsSheetDetailOpen(false)} className="text-xs font-semibold">
                        Cerrar
                      </Button>

                      {selectedSolicitudDetalle.estado !== "Aprobada" && selectedSolicitudDetalle.estado !== "Rechazada" && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setSolicitudToReject(selectedSolicitudDetalle);
                              setIsRejectOpen(true);
                            }}
                            className="text-xs font-semibold gap-1.5"
                          >
                            <XCircle className="size-4" />
                            <span>Rechazar</span>
                          </Button>

                          <Button
                            type="button"
                            variant="success"
                            size="sm"
                            onClick={() => {
                              setSolicitudToApprove(selectedSolicitudDetalle);
                              setIsApproveOpen(true);
                            }}
                            className="text-xs font-bold gap-1.5 shadow-xs"
                          >
                            <CheckCircle2 className="size-4" />
                            <span>Aprobar</span>
                          </Button>
                        </div>
                      )}
                    </SheetFooter>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>
        )}
      </main>

      {/* â”€â”€ MODAL APROBAR SOLICITUD (Categoría 4: Dialog) â”€â”€ */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-full bg-success/10 text-success border border-success/30 flex items-center justify-center mb-1">
              <CheckCircle2 className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Aprobar solicitud de coordinador
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              La aprobación activará al Coordinador SINARP en la plataforma, permitiéndole iniciar sesión con su cédula y contraseña.
            </DialogDescription>
          </DialogHeader>

          {solicitudToApprove && (
            <div className="my-2 p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-xs">
              <div><span className="text-muted-foreground">Coordinador:</span> <strong>{solicitudToApprove.nombreCompleto}</strong></div>
              <div><span className="text-muted-foreground">Institución:</span> {solicitudToApprove.institucion}</div>
              <div><span className="text-muted-foreground">N.º Trámite:</span> {solicitudToApprove.id}</div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="neutral" size="sm" onClick={() => setIsApproveOpen(false)} className="text-xs font-semibold">
              Cancelar
            </Button>
            <Button type="button" variant="success" size="sm" onClick={handleConfirmApprove} className="text-xs font-bold">
              Aprobar solicitud
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ MODAL RECHAZAR SOLICITUD (Categoría 4: Dialog) â”€â”€ */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="space-y-2">
            <div className="size-10 rounded-full bg-danger/10 text-danger border border-danger/30 flex items-center justify-center mb-1">
              <XCircle className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Rechazar solicitud
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Indica obligatoriamente el motivo de rechazo. Esta solicitud se cerrará definitivamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <FormField label="Motivo del rechazo" htmlFor="motivo-rechazo-text" required>
              <Textarea
                id="motivo-rechazo-text"
                value={motivoRechazoInput}
                onChange={(e) => setMotivoRechazoInput(e.target.value)}
                placeholder="Explique claramente la razón jurídica o formal del rechazo..."
                className="text-sm min-h-[100px] p-3 rounded-2xl"
                required
              />
            </FormField>
          </div>

          <DialogFooter className="pt-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="neutral" size="sm" onClick={() => setIsRejectOpen(false)} className="text-xs font-semibold">
              Cancelar
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={handleConfirmReject} className="text-xs font-bold">
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* â”€â”€ MODAL PREVISUALIZAR DOCUMENTO PDF (Categoría 4: Dialog) â”€â”€ */}
      <Dialog open={Boolean(previewDocModal?.open)} onOpenChange={(o) => setPreviewDocModal(o ? previewDocModal : null)}>
        <DialogContent className="max-w-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Previsualización de Documento
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {previewDocModal?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 border border-border rounded-xl bg-muted/20 text-center space-y-4 my-2">
            <FileSignature className="size-16 text-primary mx-auto opacity-80" />
            <h4 className="text-sm font-bold text-foreground">Instrumento Digital ARP-R02</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Documento oficial de Acuerdo de Uso y Confidencialidad suscrito electrónicamente con certificado FirmaEC.
            </p>
            <Badge tone="success" appearance="soft" size="sm">Firma Electrónica Válida</Badge>
          </div>

          <DialogFooter>
            <Button type="button" variant="neutral" size="sm" onClick={() => setPreviewDocModal(null)} className="text-xs font-semibold">
              Cerrar previsualización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    
          {/* Floating Demo Toolbar */}
          <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2 sm:gap-3 max-w-[calc(100vw-2rem)]">
              {showDemoToolbar ? (
                <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 bg-surface/95 backdrop-blur-md p-2 rounded-2xl border border-border shadow-xl max-w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="hidden sm:flex items-center gap-1.5 px-2 text-[11px] font-semibold text-muted-foreground border-r border-border/60 mr-1">
                    <Sparkles className="size-3 text-primary shrink-0" />
                    <span>Demo</span>
                  </div>
                  
                  {!preregistroCargado && (
                    <>
                      <Button type="button" variant="outline" size="default" onClick={() => { setCedulaInput("1715489621"); ejecutarValidacionCedula("1715489621"); }} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                        <UserCheck className="size-3.5 text-primary" /> Titular (1715489621)
                      </Button>
                      <Button type="button" variant="outline" size="default" onClick={() => { setCedulaInput("1712345602"); ejecutarValidacionCedula("1712345602"); }} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                        <UserCheck className="size-3.5 text-primary" /> Suplente (1712345602)
                      </Button>
                    </>
                  )}

                  {preregistroCargado && !isSubmittedSuccess && step > 1 && (
                    <Button type="button" variant="outline" size="default" onClick={handleSimulateFillAnexoB} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">
                      <Sparkles className="size-3.5" /> Autocompletar Anexo B
                    </Button>
                  )}

                  {step === 4 && !isSigned && (
                    <>
                      <Button
                        type="button"
                        variant="success"
                        size="default"
                        onClick={handleFirmaElectronica}
                        className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                      >
                        <ShieldCheck className="size-3.5" /> Simular Firma Válida
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="default"
                            className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9 border-danger/40 text-danger hover:bg-danger/10"
                          >
                            <AlertCircle className="size-3.5" />
                            <span>Simular Fallo FirmaEC</span>
                            <ChevronDown className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 text-xs p-1.5">
                          <DropdownMenuItem
                            onClick={() => handleSimularFalloFirma("RECHAZADA")}
                            className="flex items-start gap-2.5 p-2 rounded-lg text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
                          >
                            <XCircle className="size-4 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-bold leading-none">Firma Rechazada</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">Certificado no válido o revocado</div>
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
                              <div className="text-[10px] text-muted-foreground mt-0.5">Timeout / Consulta transacción</div>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}

                  {step === 4 && isSigned && (
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={() => {
                        setIsSigningDone(false);
                        setSignatureInfo(null);
                        setFirmaFallo(null);
                        setFormData((prev) => ({ ...prev, firmadoPorFuncionario: false }));
                        toast.info("Estado de firma restablecido a pendiente");
                      }}
                      className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9"
                    >
                      <RefreshCw className="size-3.5" /> Deshacer Firma
                    </Button>
                  )}
                  
                  <Button type="button" variant="outline" size="default" onClick={handleIniciarNuevaSolicitud} className="rounded-full px-3 sm:px-4 flex items-center gap-1.5 text-xs h-8 sm:h-9">
                    <ArrowLeft className="size-3.5" /> Reiniciar Flujo
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
                  <span className="font-semibold text-foreground">Opciones de prueba</span>
                  <ChevronUp className="size-3.5 text-muted-foreground" />
                </Button>
              )}
          </div>
    </div>
  );
}

export function EnrolamientoCoordinadorView() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
          Cargando formulario de enrolamiento...
        </div>
      }
    >
      <EnrolamientoContent />
    </Suspense>
  );
}
