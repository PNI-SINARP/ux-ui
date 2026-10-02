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
  Clock,
  Sparkles,
  Phone,
  Mail,
  Check,
  Search,
  MapPin,
  Calendar,
  Eye,
  UserCheck,
  UserPlus,
  XCircle,
  ChevronRight,
  FileSignature,
  Info,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Home
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardTitle, CardDescription, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-button";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { FileUpload, type FileUploadItem } from "@/components/ui/file-upload";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, getAssetPath } from "@/lib/utils";
import { WireframeRoleSelector } from "@/components/layout/wireframes/wireframe-role-selector";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  type SolicitudIngreso,
  type DatosAnexoC
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { MOCK_USERS_BY_ROLE, type UserRole } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { REVISORES_GESTION } from "@/components/shared/solicitudes/asignar-revisor-dialog";

// Instituciones demo del sistema
const DEMO_INSTITUCIONES = [
  {
    ruc: "1760001550001",
    nombre: "Dirección General de Registro Civil, Identificación y Cedulación",
    representante: "Abg. Fernando Alarcón (Subdirector General)",
    direccion: "Av. Amazonas N37-61 y Unión Nacional de Periodistas, Quito",
    coordinadorActual: "Ing. Esteban Javier Morales Salazar"
  },
  {
    ruc: "1760013210001",
    nombre: "Servicio de Rentas Internas (SRI)",
    representante: "Ec. Damián Larco (Director General)",
    direccion: "Salinas y Santiago, Edificio SRI, Quito",
    coordinadorActual: "Santiago Andrés Cárdenas Viteri"
  },
  {
    ruc: "1760001230001",
    nombre: "Ministerio de Salud Pública (MSP)",
    representante: "Dra. Gabriela Patricia Aguinaga",
    direccion: "Av. República de El Salvador 36-64 y Suecia, Quito",
    coordinadorActual: "Juan Carlos Pérez Gómez"
  },
  {
    ruc: "1760004560001",
    nombre: "Ministerio de Educación",
    representante: "Dra. Alegría Crespo Cordovez",
    direccion: "Av. Amazonas N34-451 entre Atahualpa y Juan Pablo Sanz, Quito",
    coordinadorActual: "Carlos Alberto Andrade Villacís"
  }
];

export function CambioCoordinadorView() {
  const router = useRouter();
  const {
    solicitudes,
    agregarCambioCoordinador,
    asignarRevisorGestion,
    aprobarSolicitud,
    rechazarSolicitud
  } = useSolicitudesIngresoStore();

  // Rol activo (INSTITUCION / DIR_GESTION / EQ_GESTION)
  const [activeRole, setActiveRole] = useState<UserRole>("COORDINADOR_SINARP");

  // Pasos de Institución (0: Inicio/RUC, 1: Anexo C, 2: Revisión, 3: Firma, 4: Confirmación)
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Institución Seleccionada
  const [selectedRuc, setSelectedRuc] = useState<string>(DEMO_INSTITUCIONES[0].ruc);
  const selectedEntidad = DEMO_INSTITUCIONES.find((i) => i.ruc === selectedRuc) || DEMO_INSTITUCIONES[0];

  // Firma y Estados de Simulación
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State Anexo C (ARP-R03)
  const [formData, setFormData] = useState<DatosAnexoC>({
    nombreEntidad: selectedEntidad.nombre,
    representanteLegalNombre: selectedEntidad.representante,
    esDelegado: false,
    archivoSoporteDelegacion: "",

    // Cláusula Segunda: Cambio Titular
    aplicaCambioTitular: true,
    nuevoTitularNombre: "Dra. Patricia Elena Moncayo Benítez",
    nuevoTitularCedula: "1724589632",
    nuevoTitularCargo: "Directora de Gestión de la Información Registral",
    nuevoTitularMotivo: "Cese de funciones del coordinador saliente por cambio orgánico institucional.",
    nuevoTitularEmail: "patricia.moncayo@registrocivil.gob.ec",
    nuevoTitularArea: "Dirección de Tecnologías y Seguridad de la Información",
    nuevoTitularTelefonoFijo: "023731110 ext 204",
    nuevoTitularMovilInst: "0984561230",
    nuevoTitularMovilPersonal: "0991245876",

    // Cláusula Segunda: Cambio Suplente
    aplicaCambioSuplente: false,
    nuevoSuplenteNombre: "",
    nuevoSuplenteCedula: "",
    nuevoSuplenteCargo: "",
    nuevoSuplenteMotivo: "",
    nuevoSuplenteEmail: "",
    nuevoSuplenteArea: "",
    nuevoSuplenteTelefonoFijo: "",
    nuevoSuplenteMovilInst: "",
    nuevoSuplenteMovilPersonal: "",

    // Cláusula Tercera: Designación Inicial Suplente
    aplicaDesignacionInicialSuplente: false,
    inicialSuplenteNombre: "",
    inicialSuplenteCedula: "",
    inicialSuplenteCargo: "",
    inicialSuplenteEmail: "",

    // Cláusula Cuarta: Firmas
    ciudadFirma: "Quito D.M.",
    fechaFirma: "28/09/2026",
    firmadoDigitalmente: false,
    archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_Institucional.pdf"
  });

  // Archivos adjuntos de delegación
  const [soporteFiles, setSoporteFiles] = useState<FileUploadItem[]>([]);

  // Modales
  const [assignModalSol, setAssignModalSol] = useState<SolicitudIngreso | null>(null);
  const [selectedRevisor, setSelectedRevisor] = useState<string>(REVISORES_GESTION[0].nombre);

  const [detailModalSol, setDetailModalSol] = useState<SolicitudIngreso | null>(null);

  const [approveModalSol, setApproveModalSol] = useState<SolicitudIngreso | null>(null);
  const [showNotificationSent, setShowNotificationSent] = useState(false);

  const [rejectModalSol, setRejectModalSol] = useState<SolicitudIngreso | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Actualizar datos de entidad al cambiar RUC
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      nombreEntidad: selectedEntidad.nombre,
      representanteLegalNombre: selectedEntidad.representante
    }));
  }, [selectedRuc, selectedEntidad]);

  const stepsList: StepperStep[] = [
    { id: "1", title: "Institución", description: "Selección de RUC", icon: Building2 },
    { id: "2", title: "Anexo C", description: "Completar datos", icon: FileText },
    { id: "3", title: "Revisión", description: "Verificar resumen", icon: CheckCircle2 },
    { id: "4", title: "Firma Digital", description: "FirmaEC", icon: ShieldCheck },
    { id: "5", title: "Confirmación", description: "Trámite enviado", icon: FileCheck2 },
  ];

  const handleSoporteSelect = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    const item: FileUploadItem = {
      id: `soporte-${Date.now()}`,
      file: f,
      status: "success",
      errorType: null,
      progress: 100,
    };
    setSoporteFiles([item]);
    setFormData((prev) => ({ ...prev, archivoSoporteDelegacion: f.name }));
  };

  const handleSoporteRemove = () => {
    setSoporteFiles([]);
    setFormData((prev) => ({ ...prev, archivoSoporteDelegacion: "" }));
  };

  const displayedSoporteItems: FileUploadItem[] =
    soporteFiles.length > 0
      ? soporteFiles
      : formData.archivoSoporteDelegacion
        ? [
          {
            id: "soporte-default",
            file: new File([""], formData.archivoSoporteDelegacion, { type: "application/pdf" }),
            status: "success",
            errorType: null,
            progress: 100,
          },
        ]
        : [];

  const handleSimulateFill = () => {
    setFormData({
      nombreEntidad: selectedEntidad.nombre,
      representanteLegalNombre: selectedEntidad.representante,
      esDelegado: true,
      archivoSoporteDelegacion: "Accion_Personal_Delegacion_Firmante.pdf",

      aplicaCambioTitular: true,
      nuevoTitularNombre: "Dra. Patricia Elena Moncayo Benítez",
      nuevoTitularCedula: "1724589632",
      nuevoTitularCargo: "Directora de Gestión de la Información Registral",
      nuevoTitularMotivo: "Cese de funciones del coordinador saliente por cambio orgánico institucional.",
      nuevoTitularEmail: "patricia.moncayo@registrocivil.gob.ec",
      nuevoTitularArea: "Dirección de Tecnologías y Seguridad de la Información",
      nuevoTitularTelefonoFijo: "023731110 ext 204",
      nuevoTitularMovilInst: "0984561230",
      nuevoTitularMovilPersonal: "0991245876",

      aplicaCambioSuplente: false,
      nuevoSuplenteNombre: "",
      nuevoSuplenteCedula: "",
      nuevoSuplenteCargo: "",
      nuevoSuplenteMotivo: "",

      aplicaDesignacionInicialSuplente: false,
      inicialSuplenteNombre: "",
      inicialSuplenteCedula: "",
      inicialSuplenteCargo: "",
      inicialSuplenteEmail: "",

      ciudadFirma: "Quito D.M.",
      fechaFirma: "28/09/2026",
      firmadoDigitalmente: false,
      archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_Institucional.pdf"
    });
    setSoporteFiles([
      {
        id: "soporte-demo",
        file: new File([""], "Accion_Personal_Delegacion_Firmante.pdf", { type: "application/pdf" }),
        status: "success",
        errorType: null,
        progress: 100
      }
    ]);
    toast.success("Formulario precargado con datos demo del Anexo C");
  };

  // Simulación de FirmaEC
  const handleFirmaElectronica = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setFormData((prev) => ({ ...prev, firmadoDigitalmente: true }));
      toast.success("Documento firmado correctamente con FirmaEC", {
        description: "Certificado digital validado exitosamente."
      });
    }, 1200);
  };

  // Enviar Solicitud (Institución)
  const handleEnviarSolicitud = () => {
    if (!formData.firmadoDigitalmente) {
      toast.error("Debe firmar electrónicamente el formulario Anexo C antes de enviar.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      agregarCambioCoordinador(formData);
      setStep(4);
      toast.success("Solicitud enviada al Área de Gestión", {
        description: "El trámite ingresó a la bandeja de revisión."
      });
    }, 600);
  };

  // Asignar Revisor (Director)
  const handleConfirmAsignarRevisor = () => {
    if (!assignModalSol) return;
    asignarRevisorGestion(assignModalSol.id, selectedRevisor, "Director Área de Gestión");
    toast.success(`Solicitud ${assignModalSol.id} asignada a ${selectedRevisor}`);
    setAssignModalSol(null);
  };

  // Aprobar Solicitud (Equipo de Gestión)
  const handleConfirmAprobar = () => {
    if (!approveModalSol) return;
    aprobarSolicitud(approveModalSol.id, "Revisor Equipo de Gestión");
    toast.success(`Solicitud ${approveModalSol.id} APROBADA exitosamente`);
    setShowNotificationSent(true);
    setApproveModalSol(null);
  };

  // Rechazar Solicitud (Equipo de Gestión)
  const handleConfirmRechazar = () => {
    if (!rejectModalSol) return;
    if (!motivoRechazo.trim()) {
      toast.error("El motivo del rechazo es obligatorio.");
      return;
    }
    rechazarSolicitud(rejectModalSol.id, motivoRechazo, "Revisor Equipo de Gestión");
    toast.success(`Solicitud ${rejectModalSol.id} RECHAZADA`);
    setRejectModalSol(null);
    setMotivoRechazo("");
  };

  // Solicitudes del Anexo C para la bandeja
  const solicitudesCambio = solicitudes.filter(
    (s) => s.tipoTramite === "PROCESO_C_CAMBIO_COORDINADOR" || s.codigoDocumental === "ARP-R03"
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header General con Selector de Roles */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img
                src={getAssetPath("/logo-horizontal.svg")}
                alt="Logo DINARP"
                className="dark:hidden h-8 w-auto object-contain"
              />
              <img
                src={getAssetPath("/logo-horizontal-blanco.svg")}
                alt="Logo DINARP"
                className="hidden dark:block h-8 w-auto object-contain"
              />
            </Link>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold font-heading text-foreground">SISTEMA DINARP</span>
              <span className="text-[10px] text-muted-foreground">Cambio de Coordinador — Anexo C</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <WireframeRoleSelector activeRole={activeRole} onRoleChange={(role) => setActiveRole(role)} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Navegación Secundaría por Rol */}
      <div className="bg-surface border-b border-border px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Rol Activo:</span>
            <Badge tone="primary" appearance="soft" size="sm" className="font-semibold">
              {activeRole === "COORDINADOR_SINARP" && "1. INSTITUCIÓN"}
              {activeRole === "DIR_GESTION" && "2. DIRECTOR DEL ÁREA DE GESTIÓN"}
              {activeRole === "EQ_GESTION" && "3. EQUIPO DE GESTIÓN / REVISOR"}
              {activeRole !== "COORDINADOR_SINARP" && activeRole !== "DIR_GESTION" && activeRole !== "EQ_GESTION" && activeRole}
            </Badge>
          </div>

          {activeRole === "COORDINADOR_SINARP" && (
            <span className="text-muted-foreground hidden sm:inline-block">
              Complete el proceso de solicitud del Anexo C (ARP-R03)
            </span>
          )}
          {activeRole === "DIR_GESTION" && (
            <span className="text-muted-foreground hidden sm:inline-block">
              Bandeja de recepción y asignación de revisores para cambio de coordinador
            </span>
          )}
          {activeRole === "EQ_GESTION" && (
            <span className="text-muted-foreground hidden sm:inline-block">
              Evaluación y dictamen de solicitudes asignadas
            </span>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* ==================================================================== */}
        {/* VISTA 1: INSTITUCIÓN                                                */}
        {/* ==================================================================== */}
        {activeRole === "COORDINADOR_SINARP" && (
          <div className="space-y-8">
            {/* Stepper del Flujo */}
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
              <Stepper steps={stepsList} activeStep={step} />
            </div>

            {/* STEP 0: INICIO DEL TRÁMITE / SELECCIÓN DE RUC */}
            {step === 0 && (
              <div className="max-w-2xl mx-auto bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                <div className="space-y-2 border-b border-border pb-4">
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                    Inicio de Trámite · Anexo C
                  </Badge>
                  <h1 className="text-2xl font-bold font-heading text-foreground">Cambio de Coordinador</h1>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Gestiona la solicitud de cambio de Coordinador institucional. Selecciona la institución correspondiente para cargar los datos almacenados.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Seleccionar Institución / RUC *</Label>
                    <select
                      className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring outline-none"
                      value={selectedRuc}
                      onChange={(e) => setSelectedRuc(e.target.value)}
                    >
                      {DEMO_INSTITUCIONES.map((inst) => (
                        <option key={inst.ruc} value={inst.ruc}>
                          {inst.nombre} — RUC: {inst.ruc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Card variant="featured" className="p-4 space-y-3 bg-muted/40 border border-border">
                    <div className="flex items-center gap-2 text-xs font-bold font-heading text-foreground">
                      <Building2 className="size-4 text-foreground" />
                      <span>Información Institucional Registrada</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">RUC Institucional:</span>
                        <span className="font-semibold text-foreground font-mono">{selectedEntidad.ruc}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Máxima Autoridad:</span>
                        <span className="font-semibold text-foreground">{selectedEntidad.representante}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Dirección Matriz:</span>
                        <span className="font-medium text-foreground">{selectedEntidad.direccion}</span>
                      </div>
                      <div className="sm:col-span-2 pt-2 border-t border-border/60">
                        <span className="text-muted-foreground block text-[11px]">Coordinador Registrado Actual:</span>
                        <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          <User className="size-3.5 text-muted-foreground" />
                          {selectedEntidad.coordinadorActual}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="primary" size="default" className="text-xs font-semibold px-6 gap-2" onClick={() => setStep(1)}>
                    <span>Continuar al Formulario</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 1: FORMULARIO ANEXO C */}
            {step === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!formData.aplicaCambioTitular && !formData.aplicaCambioSuplente && !formData.aplicaDesignacionInicialSuplente) {
                    toast.error("Debe seleccionar al menos una cláusula de cambio o designación.");
                    return;
                  }
                  if (formData.esDelegado && !formData.archivoSoporteDelegacion) {
                    toast.error("Al requerir firma delegada, es obligatorio adjuntar la Autorización para firmar.");
                    return;
                  }
                  setStep(2);
                }}
                className="space-y-6 animate-in fade-in duration-200"
              >
                {/* Header del Formulario */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                        Formulario Oficial ARP-R03
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">Anexo C</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground mt-1">
                      Cambio de Coordinador Institucional
                    </h1>
                  </div>

                  <Button type="button" variant="outline" size="sm" onClick={handleSimulateFill} className="text-xs gap-1.5">
                    <Sparkles className="size-3.5" />
                    <span>Cargar Datos DEMO</span>
                  </Button>
                </div>

                {/* Antecedentes y Delegación */}
                <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                  <div className="border-b border-border/70 pb-3">
                    <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                      <Building2 className="size-4 text-foreground" />
                      Cláusula Primera — Antecedentes y Firma Autorizada
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Identificación de la entidad solicitante y especificación de firma directa o delegada.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Nombre de la Entidad *</Label>
                      <Input
                        value={formData.nombreEntidad}
                        onChange={(e) => setFormData({ ...formData, nombreEntidad: e.target.value })}
                        required
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-foreground">Máxima Autoridad / Firmante *</Label>
                      <Input
                        value={formData.representanteLegalNombre}
                        onChange={(e) => setFormData({ ...formData, representanteLegalNombre: e.target.value })}
                        required
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  {/* Pregunta: ¿Firma Delegada? */}
                  <div className="pt-2 space-y-3">
                    <Label className="text-xs font-semibold text-foreground block">¿Es Firma Delegada?</Label>
                    <RadioGroup
                      value={formData.esDelegado ? "SI" : "NO"}
                      onValueChange={(val) => setFormData({ ...formData, esDelegado: val === "SI" })}
                      className="flex items-center gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NO" id="delegado-no" />
                        <Label htmlFor="delegado-no" className="text-xs font-medium cursor-pointer">
                          No (Firma de Máxima Autoridad)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SI" id="delegado-si" />
                        <Label htmlFor="delegado-si" className="text-xs font-medium cursor-pointer">
                          Sí (Firma Delegada)
                        </Label>
                      </div>
                    </RadioGroup>

                    {formData.esDelegado && (
                      <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3 mt-3 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                          <UploadCloud className="size-4" />
                          <span>Autorización para firmar *</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Adjunte la Acción de Personal o Resolución de Delegación formal que faculte al firmante.
                        </p>
                        <FileUpload
                          items={displayedSoporteItems}
                          onFileSelect={handleSoporteSelect}
                          onRemove={handleSoporteRemove}
                          maxSizeMB={5}
                          allowedFormats=".pdf"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Cláusula Segunda: Cambio de Coordinador Titular */}
                <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/70 pb-3">
                    <div>
                      <h2 className="text-sm font-bold font-heading text-foreground flex items-center gap-2">
                        <UserCheck className="size-4 text-foreground" />
                        Cláusula Segunda — Cambio de Coordinador Titular
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Designación del nuevo Coordinador Titular ante la DINARP.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cambio-titular"
                        checked={formData.aplicaCambioTitular}
                        onCheckedChange={(checked) => setFormData({ ...formData, aplicaCambioTitular: Boolean(checked) })}
                      />
                      <Label htmlFor="cambio-titular" className="text-xs font-semibold cursor-pointer">
                        Aplicar cambio de Titular
                      </Label>
                    </div>
                  </div>

                  {formData.aplicaCambioTitular && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Nombres y Apellidos Completos *</Label>
                        <Input
                          value={formData.nuevoTitularNombre || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularNombre: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cédula de Identidad *</Label>
                        <Input
                          value={formData.nuevoTitularCedula || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularCedula: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Cargo Institucional *</Label>
                        <Input
                          value={formData.nuevoTitularCargo || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularCargo: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Área o Unidad Administrativa *</Label>
                        <Input
                          value={formData.nuevoTitularArea || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularArea: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Correo Institucional *</Label>
                        <Input
                          type="email"
                          value={formData.nuevoTitularEmail || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularEmail: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Teléfono Móvil Institucional *</Label>
                        <Input
                          value={formData.nuevoTitularMovilInst || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularMovilInst: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          className="text-xs h-9"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1.5">
                        <Label className="text-xs font-semibold text-foreground">Motivo del Cambio *</Label>
                        <Textarea
                          value={formData.nuevoTitularMotivo || ""}
                          onChange={(e) => setFormData({ ...formData, nuevoTitularMotivo: e.target.value })}
                          required={formData.aplicaCambioTitular}
                          rows={2}
                          className="text-xs"
                          placeholder="Especifique las razones administrativas o de reemplazo del coordinador saliente..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones del Formulario */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button type="button" variant="outline" size="default" className="text-xs gap-2" onClick={() => setStep(0)}>
                    <ArrowLeft className="size-4" />
                    <span>Volver a Institución</span>
                  </Button>

                  <Button type="submit" variant="primary" size="default" className="text-xs font-semibold px-6 gap-2">
                    <span>Continuar a Revisión</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: REVISIÓN ("Revisar solicitud") */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4">
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                    Paso 3 de 5 · Resumen de Verificación
                  </Badge>
                  <h1 className="text-2xl font-bold font-heading text-foreground mt-1">Revisar solicitud</h1>
                  <p className="text-xs text-muted-foreground">
                    Verifique detalladamente la información ingresada en el Anexo C antes de proceder a la firma electrónica.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Sección 1: Entidad y Firmante */}
                  <Card variant="default" className="p-6 space-y-4">
                    <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                      1. Entidad y Autoridad Firmante
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Institución:</span>
                        <span className="font-semibold text-foreground">{formData.nombreEntidad}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">RUC:</span>
                        <span className="font-semibold text-foreground font-mono">{selectedEntidad.ruc}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Máxima Autoridad / Firmante:</span>
                        <span className="font-semibold text-foreground">{formData.representanteLegalNombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Modalidad de Firma:</span>
                        <Badge tone={formData.esDelegado ? "warning" : "info"} appearance="soft" size="sm" className="mt-0.5">
                          {formData.esDelegado ? "Firma Delegada (Soporte Adjunto)" : "Firma Directa de Máxima Autoridad"}
                        </Badge>
                      </div>
                    </div>
                  </Card>

                  {/* Sección 2: Detalle del Nuevo Coordinador */}
                  <Card variant="default" className="p-6 space-y-4">
                    <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                      2. Coordinador Titular Solicitado
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Nombres Completos:</span>
                        <span className="font-semibold text-foreground">{formData.nuevoTitularNombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Cédula:</span>
                        <span className="font-semibold text-foreground font-mono">{formData.nuevoTitularCedula}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Cargo:</span>
                        <span className="font-semibold text-foreground">{formData.nuevoTitularCargo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Área / Unidad:</span>
                        <span className="font-semibold text-foreground">{formData.nuevoTitularArea}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Correo Institucional:</span>
                        <span className="font-semibold text-foreground font-mono">{formData.nuevoTitularEmail}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Teléfono Móvil:</span>
                        <span className="font-semibold text-foreground">{formData.nuevoTitularMovilInst}</span>
                      </div>
                      <div className="sm:col-span-3 pt-2 border-t border-border/60">
                        <span className="text-muted-foreground block text-[11px]">Motivo del Cambio:</span>
                        <p className="text-xs text-foreground italic mt-0.5 bg-muted/30 p-2.5 rounded-lg border border-border">
                          "{formData.nuevoTitularMotivo}"
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button variant="outline" size="default" className="text-xs gap-2" onClick={() => setStep(1)}>
                    <ArrowLeft className="size-4" />
                    <span>Volver</span>
                  </Button>

                  <Button variant="primary" size="default" className="text-xs font-semibold px-6 gap-2" onClick={() => setStep(3)}>
                    <span>Continuar a firma</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: TIPO DE FIRMA & FIRMA ELECTRÓNICA */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-border pb-4 text-center sm:text-left">
                  <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                    Paso 4 de 5 · Certificación Digital
                  </Badge>
                  <h1 className="text-2xl font-bold font-heading text-foreground mt-1">Firma Electrónica</h1>
                  <p className="text-xs text-muted-foreground">
                    Certifique el documento Anexo C mediante la plataforma oficial FirmaEC.
                  </p>
                </div>

                {/* Banner de Modalidad de Firma */}
                {formData.esDelegado ? (
                  <Card variant="featured" className="p-4 space-y-3 bg-muted/40 border border-border">
                    <div className="flex items-center gap-2 text-xs font-bold font-heading text-foreground">
                      <FileCheck2 className="size-4 text-foreground" />
                      <span>Modalidad: Firma Delegada</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se ha adjuntado el documento de soporte de delegación:{" "}
                      <span className="font-semibold text-foreground font-mono">{formData.archivoSoporteDelegacion || "Accion_Personal_Delegacion_Firmante.pdf"}</span>.
                    </p>
                  </Card>
                ) : (
                  <Card variant="default" className="p-4 space-y-2 bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-xs font-bold font-heading text-foreground">
                      <ShieldCheck className="size-4 text-foreground" />
                      <span>Modalidad: Firma de Máxima Autoridad</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El documento debe ser firmado electrónicamente de forma directa por la máxima autoridad institucional registrada ({formData.representanteLegalNombre}).
                    </p>
                  </Card>
                )}

                {/* Caja de FirmaEC */}
                <div className="bg-surface border border-border rounded-2xl p-6 text-center space-y-5 shadow-xs">
                  <div className="size-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto">
                    <ShieldCheck className="size-8 text-foreground" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-heading text-foreground">Modulo FirmaEC Simulado</h3>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el botón para validar la firma digital del Anexo C (ARP-R03).
                    </p>
                  </div>

                  {formData.firmadoDigitalmente ? (
                    <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-2 text-center animate-in zoom-in-95 duration-200">
                      <Badge tone="success" appearance="solid" size="md" className="mx-auto gap-1.5">
                        <CheckCircle2 className="size-4" />
                        <span>Documento firmado correctamente</span>
                      </Badge>
                      <p className="text-[11px] text-muted-foreground font-mono pt-1">
                        Hash Digital: 0x8f9a2b7c4d1e3f... | Timestamp: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      className="text-xs font-semibold px-8 gap-2"
                      onClick={handleFirmaElectronica}
                      disabled={isSigning}
                    >
                      {isSigning ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Validando con FirmaEC...</span>
                        </>
                      ) : (
                        <>
                          <FileSignature className="size-4" />
                          <span>Firmar electrónicamente</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button variant="outline" size="default" className="text-xs gap-2" onClick={() => setStep(2)}>
                    <ArrowLeft className="size-4" />
                    <span>Volver a Revisión</span>
                  </Button>

                  <Button
                    variant="primary"
                    size="default"
                    className="text-xs font-semibold px-6 gap-2"
                    onClick={handleEnviarSolicitud}
                    disabled={!formData.firmadoDigitalmente || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="size-4 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar solicitud para aprobación</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: CONFIRMACIÓN ("Solicitud enviada") */}
            {step === 4 && (
              <div className="max-w-xl mx-auto bg-surface border border-border rounded-2xl p-8 space-y-6 text-center shadow-xs animate-in fade-in duration-300">
                <div className="size-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto text-foreground">
                  <CheckCircle2 className="size-8 text-foreground" />
                </div>

                <div className="space-y-2">
                  <Badge tone="neutral" appearance="soft" size="md" className="border border-border font-mono">
                    Solicitud enviada
                  </Badge>
                  <h1 className="text-2xl font-bold font-heading text-foreground">Solicitud enviada</h1>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    La solicitud fue enviada al Área de Gestión para revisión.
                  </p>
                </div>

                {/* Resumen del trámite enviado */}
                <div className="p-4 bg-muted/40 rounded-xl border border-border text-left space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Trámite:</span>
                    <span className="font-bold text-foreground font-mono">SOL-ING-004</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Institución:</span>
                    <span className="font-semibold text-foreground">{formData.nombreEntidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de Trámite:</span>
                    <span className="font-semibold text-foreground">Cambio de Coordinador</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Envío:</span>
                    <span className="font-medium text-foreground">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border/60">
                    <span className="text-muted-foreground">Estado Inicial:</span>
                    <Badge tone="warning" appearance="soft" size="sm">
                      En revisión
                    </Badge>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full text-xs font-medium"
                    onClick={() => {
                      setStep(0);
                      setFormData((prev) => ({ ...prev, firmadoDigitalmente: false }));
                    }}
                  >
                    Crear otra solicitud
                  </Button>

                  <Button
                    variant="primary"
                    size="default"
                    className="w-full text-xs font-semibold gap-2"
                    onClick={() => setActiveRole("DIR_GESTION")}
                  >
                    <span>Ir a Bandeja del Director</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* VISTA 2: DIRECTOR DEL ÁREA DE GESTIÓN                                */}
        {/* ==================================================================== */}
        {activeRole === "DIR_GESTION" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                  Bandeja Director · Área de Gestión
                </Badge>
                <h1 className="text-2xl font-bold font-heading text-foreground mt-1">
                  Solicitudes de Cambio de Coordinador
                </h1>
                <p className="text-xs text-muted-foreground">
                  Recibir solicitudes de cambio de Coordinador y determinar/asignar el revisor del Equipo de Gestión.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone="info" appearance="soft" size="md" className="gap-1.5">
                  <Clock className="size-3.5" />
                  <span>Pendientes de asignación: {solicitudesCambio.filter((s) => s.estado === "PENDIENTE_ASIGNACION_GESTION").length}</span>
                </Badge>
              </div>
            </div>

            {/* Tabla de Solicitudes */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Nº Trámite</TableHead>
                    <TableHead className="text-xs font-bold">Institución</TableHead>
                    <TableHead className="text-xs font-bold">Tipo Trámite</TableHead>
                    <TableHead className="text-xs font-bold">Solicitante / Coordinador</TableHead>
                    <TableHead className="text-xs font-bold">Fecha</TableHead>
                    <TableHead className="text-xs font-bold">Estado</TableHead>
                    <TableHead className="text-xs font-bold">Responsable / Revisor</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudesCambio.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                        No hay solicitudes de Cambio de Coordinador registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    solicitudesCambio.map((sol) => {
                      const badge = getEstadoBadgeProps(sol.estado);
                      return (
                        <TableRow key={sol.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-foreground">{sol.id}</TableCell>
                          <TableCell className="text-xs font-medium text-foreground max-w-[200px] truncate">
                            {sol.institucion}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge tone="neutral" appearance="soft" size="sm">
                              Cambio de Coordinador
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-foreground">
                            <span className="font-medium block">{sol.nombreCompleto}</span>
                            <span className="text-[11px] text-muted-foreground">{sol.correo}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{sol.fechaSolicitud}</TableCell>
                          <TableCell className="text-xs">
                            <Badge tone={badge.tone} appearance="soft" size="sm">
                              {badge.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {sol.revisorGestion || sol.revisor || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Button onClick={() => {
                                setAssignModalSol(sol);
                                setSelectedRevisor(REVISORES_GESTION[0].nombre);
                              }} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                              <UserPlus className="size-4" />
                              
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VISTA 3: EQUIPO DE GESTIÓN / REVISOR                                 */}
        {/* ==================================================================== */}
        {activeRole === "EQ_GESTION" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <Badge tone="neutral" appearance="soft" size="sm" className="border border-border">
                  Bandeja Revisor · Equipo de Gestión
                </Badge>
                <h1 className="text-2xl font-bold font-heading text-foreground mt-1">Solicitudes asignadas</h1>
                <p className="text-xs text-muted-foreground">
                  Revisar la documentación formal del Anexo C y emitir dictamen de Aprobación o Rechazo.
                </p>
              </div>
            </div>

            {/* Mensaje de envío de correo/notificación tras aprobación */}
            {showNotificationSent && (
              <div className="p-4 bg-muted/40 border border-border rounded-xl flex items-start justify-between gap-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-start gap-2.5">
                  <Mail className="size-5 text-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">Notificación automática enviada:</span>
                    <p className="text-muted-foreground mt-0.5">
                      Se ha enviado un correo electrónico a la institución con la información correspondiente para continuar con el proceso de registro y enrolamiento.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowNotificationSent(false)} className="h-6 w-6 p-0">
                  <XCircle className="size-4" />
                </Button>
              </div>
            )}

            {/* Tabla de Solicitudes Asignadas */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold">Nº Trámite</TableHead>
                    <TableHead className="text-xs font-bold">Institución</TableHead>
                    <TableHead className="text-xs font-bold">Solicitante</TableHead>
                    <TableHead className="text-xs font-bold">Fecha Asignación</TableHead>
                    <TableHead className="text-xs font-bold">Estado</TableHead>
                    <TableHead className="w-24 text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitudesCambio.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                        No hay solicitudes asignadas en este momento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    solicitudesCambio.map((sol) => {
                      const badge = getEstadoBadgeProps(sol.estado);
                      return (
                        <TableRow key={sol.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-foreground">{sol.id}</TableCell>
                          <TableCell className="text-xs font-medium text-foreground max-w-[220px] truncate">
                            {sol.institucion}
                          </TableCell>
                          <TableCell className="text-xs text-foreground">
                            <span className="font-medium block">{sol.nombreCompleto}</span>
                            <span className="text-[11px] text-muted-foreground">{sol.correo}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{sol.fechaSolicitud}</TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              tone={badge.tone}
                              appearance="soft"
                              size="sm"
                              dot
                              className="font-semibold text-[11px] normal-case tracking-normal whitespace-nowrap px-2.5 py-0.5 inline-flex shrink-0 shadow-2xs"
                            >
                              <span>{badge.label}</span>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-center">
                            <Button onClick={() => setDetailModalSol(sol)} variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-primary-300 hover:bg-primary-300/10">
                              <Eye className="size-4" />
                              
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL 1: ASIGNAR REVISOR (DIRECTOR DE GESTIÓN)                      */}
      {/* ==================================================================== */}
      <Dialog open={Boolean(assignModalSol)} onOpenChange={(open) => !open && setAssignModalSol(null)}>
        <DialogContent className="max-w-md bg-surface border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <UserPlus className="size-4 text-foreground" />
              Asignar revisor
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Seleccione un funcionario del Equipo de Gestión para evaluar la solicitud {assignModalSol?.id}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
              <span className="text-[11px] text-muted-foreground block">Institución Solicitante:</span>
              <span className="font-semibold text-foreground">{assignModalSol?.institucion}</span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">Revisor de Gestión *</Label>
              <select
                className="w-full h-9 px-3 text-xs bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-ring outline-none"
                value={selectedRevisor}
                onChange={(e) => setSelectedRevisor(e.target.value)}
              >
                {REVISORES_GESTION.map((rev) => (
                  <option key={rev.id} value={rev.nombre}>
                    {rev.nombre} — {rev.cargo} ({rev.basePendientes} pendientes)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 sm:justify-end">
            <Button variant="neutral" size="sm" onClick={() => setAssignModalSol(null)} className="text-xs">
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAsignarRevisor} className="text-xs font-semibold">
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* MODAL 2: DETALLE DE SOLICITUD (EQUIPO DE GESTIÓN)                   */}
      {/* ==================================================================== */}
      <Dialog open={Boolean(detailModalSol)} onOpenChange={(open) => !open && setDetailModalSol(null)}>
        <DialogContent className="max-w-3xl bg-surface border border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Badge tone="neutral" appearance="soft" size="sm" className="font-mono">
                {detailModalSol?.id}
              </Badge>
              <Badge
                tone={detailModalSol ? getEstadoBadgeProps(detailModalSol.estado).tone : "neutral"}
                appearance="soft"
                size="sm"
                dot
                className="font-semibold text-[11px] normal-case tracking-normal whitespace-nowrap px-2.5 py-0.5 inline-flex shrink-0 shadow-2xs"
              >
                <span>{detailModalSol ? getEstadoBadgeProps(detailModalSol.estado).label : ""}</span>
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold font-heading text-foreground mt-1">
              Detalle de Solicitud — Cambio de Coordinador
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Expediente digital del Anexo C (ARP-R03) para {detailModalSol?.institucion}.
            </DialogDescription>
          </DialogHeader>

          {detailModalSol && (
            <div className="space-y-6 py-2 text-xs">
              {/* Información General */}
              <Card variant="default" className="p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                  Información del Anexo C
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Institución:</span>
                    <span className="font-semibold text-foreground">{detailModalSol.institucion}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Fecha de Solicitud:</span>
                    <span className="font-medium text-foreground">{detailModalSol.fechaSolicitud}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Coordinador Solicitado:</span>
                    <span className="font-semibold text-foreground">{detailModalSol.nombreCompleto}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Correo de Contacto:</span>
                    <span className="font-mono text-foreground">{detailModalSol.correo}</span>
                  </div>
                </div>
              </Card>

              {/* Documentación Adjunta */}
              <Card variant="default" className="p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                  Documentación Adjunta
                </h4>
                <div className="space-y-2">
                  {detailModalSol.documentos?.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/40 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="size-4 text-foreground" />
                        <span className="font-mono text-xs text-foreground">{doc}</span>
                      </div>
                      <Badge tone="success" appearance="soft" size="sm">
                        Firmado / Válido
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Timeline / Trazabilidad */}
              <Card variant="default" className="p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-1.5">
                  Trazabilidad e Historial del Trámite
                </h4>
                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                      <FileText className="size-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Solicitud creada y Anexo C completado</span>
                      <span className="text-[11px] text-muted-foreground block">{detailModalSol.fechaSolicitud} · Por Institución</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative z-10">
                    <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                      <ShieldCheck className="size-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Documento firmado electrónicamente con FirmaEC</span>
                      <span className="text-[11px] text-muted-foreground block">Certificado digital validado</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 relative z-10">
                    <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                      <Building2 className="size-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block">Director Área de Gestión recibe la solicitud</span>
                      <span className="text-[11px] text-muted-foreground block">Ingreso a bandeja formal</span>
                    </div>
                  </div>

                  {detailModalSol.revisorGestion && (
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                        <UserCheck className="size-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">Revisor asignado: {detailModalSol.revisorGestion}</span>
                        <span className="text-[11px] text-muted-foreground block">Asignación completada por el Director</span>
                      </div>
                    </div>
                  )}

                  {detailModalSol.estado === "Aprobada" && (
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                        <CheckCircle2 className="size-3.5 text-foreground" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">Solicitud APROBADA</span>
                        <span className="text-[11px] text-muted-foreground block">Notificación de enrolamiento enviada a la institución</span>
                      </div>
                    </div>
                  )}

                  {detailModalSol.estado === "Rechazada" && (
                    <div className="flex items-start gap-3 relative z-10">
                      <div className="size-7 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 text-foreground">
                        <XCircle className="size-3.5 text-foreground" />
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">Solicitud RECHAZADA</span>
                        <span className="text-[11px] text-muted-foreground block">Motivo: {detailModalSol.motivoRechazo}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t border-border pt-3">
            <Button variant="neutral" size="sm" onClick={() => setDetailModalSol(null)} className="text-xs">
              Cerrar
            </Button>

            {detailModalSol?.estado !== "Aprobada" && detailModalSol?.estado !== "Rechazada" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold"
                  onClick={() => {
                    setRejectModalSol(detailModalSol);
                    setDetailModalSol(null);
                  }}
                >
                  <XCircle className="size-3.5 mr-1" />
                  <span>Rechazar</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold"
                  onClick={() => {
                    setApproveModalSol(detailModalSol);
                    setDetailModalSol(null);
                  }}
                >
                  <CheckCircle2 className="size-3.5 mr-1" />
                  <span>Aprobar</span>
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* MODAL 3: APROBAR SOLICITUD                                          */}
      {/* ==================================================================== */}
      <Dialog open={Boolean(approveModalSol)} onOpenChange={(open) => !open && setApproveModalSol(null)}>
        <DialogContent className="max-w-md bg-surface border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-foreground" />
              Aprobar solicitud
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ¿Está seguro de aprobar la solicitud de cambio de coordinador {approveModalSol?.id}?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs space-y-1 my-2">
            <span className="text-muted-foreground text-[11px] block">Institución:</span>
            <span className="font-semibold text-foreground">{approveModalSol?.institucion}</span>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 sm:justify-end">
            <Button variant="neutral" size="sm" onClick={() => setApproveModalSol(null)} className="text-xs">
              Cancelar
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmAprobar} className="text-xs font-semibold">
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* MODAL 4: RECHAZAR SOLICITUD                                         */}
      {/* ==================================================================== */}
      <Dialog open={Boolean(rejectModalSol)} onOpenChange={(open) => !open && setRejectModalSol(null)}>
        <DialogContent className="max-w-md bg-surface border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
              <XCircle className="size-4 text-foreground" />
              Rechazar solicitud
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Ingrese el motivo justificado para notificar el rechazo a la institución.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1">
              <span className="text-muted-foreground text-[11px] block">Institución:</span>
              <span className="font-semibold text-foreground">{rejectModalSol?.institucion}</span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Motivo del rechazo *</Label>
              <Textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Especifique detalladamente las observaciones o inconsistencias encontradas..."
                rows={3}
                required
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 sm:justify-end">
            <Button variant="neutral" size="sm" onClick={() => setRejectModalSol(null)} className="text-xs">
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmRechazar} className="text-xs font-semibold">
              Confirmar rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
