"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowLeftRight,
  Building2,
  FileText,
  Layers,
  ShieldCheck,
  Server,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Upload,
  RefreshCw,
  Lock,
  EyeOff,
  Eye,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  FolderArchive,
  Terminal,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardDecorativeIcon } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { WireframeBreadcrumbs } from "@/components/layout/wireframes/wireframe-breadcrumbs";
import { useSimulatedRole } from "@/modules/catalogo-interoperabilidad/hooks/use-simulated-role";
import {
  ROLES_CONFIG,
  ETAPAS_EXPEDIENTE_CONFIG,
  MOCK_USERS_BY_ROLE,
  type ExpedienteIntegracion,
  type UserRole,
  type EtapaExpediente,
  type CampoCatalogo,
  type EventoHistorial,
  type MockUser
} from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { WireframeRoleSelector } from "@/components/layout/wireframes/wireframe-role-selector";

interface ExpedienteClientViewProps {
  initialExpediente: ExpedienteIntegracion;
}

export function CatalogoIncorporacionDetailView({ initialExpediente }: ExpedienteClientViewProps) {
  const [expediente, setExpediente] = useState<ExpedienteIntegracion>(initialExpediente);
  const [activeRole, setActiveRole] = useSimulatedRole(initialExpediente.responsableActualRol);
  const [activeTab, setActiveTab] = useState<
    "resumen" | "informacion" | "documentos" | "campos" | "clasificacion" | "tecnica" | "validaciones" | "historial"
  >("resumen");

  const currentUser = MOCK_USERS_BY_ROLE[activeRole];

  // Modales y formularios contextuales por rol
  // DGR: Observaciones (Paso 2)
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [obsTipo, setObsTipo] = useState<"campo" | "documento" | "informacion">("campo");
  const [obsElementoId, setObsElementoId] = useState("");
  const [obsTexto, setObsTexto] = useState("");

  // Coordinador: Corrección (Paso 3)
  const [correccionTexto, setCorreccionTexto] = useState("");

  // DPI: Clasificación (Paso 5)
  const [dpiInformeNro, setDpiInformeNro] = useState("INF-DPI-2026-0044");
  const [dpiInformePdf, setDpiInformePdf] = useState("Informe_Tecnico_Clasificacion_DPI.pdf");
  const [dpiCampos, setDpiCampos] = useState<CampoCatalogo[]>(expediente.camposCandidatos);

  // DTD: Despliegue Preproducción (Paso 5)
  const [dtdMicroservicio, setDtdMicroservicio] = useState(expediente.desplieguePreDTD?.microservicioNombre || "ms-rc-defunciones");
  const [dtdVersionPre, setDtdVersionPre] = useState(expediente.desplieguePreDTD?.version || "1.0.0-rc1");
  const [dtdEndpointPre, setDtdEndpointPre] = useState(expediente.desplieguePreDTD?.endpointPre || "https://pre-api.dinarp.gob.ec/v1/rc/defunciones");

  // DGR: Validación Preproducción (Paso 6)
  const [isValPreModalOpen, setIsValPreModalOpen] = useState(false);
  const [validacionPreResultado, setValidacionPreResultado] = useState<"Favorable" | "No favorable">("Favorable");
  const [validacionPreObs, setValidacionPreObs] = useState("");

  // DTD: Corrección Error Loop (Paso 7)
  const [dtdSolucionError, setDtdSolucionError] = useState("");
  const [dtdVersionNueva, setDtdVersionNueva] = useState("1.0.0-rc2");

  // DGR: Aprobación Formulario (Paso 8)
  const [formularioNro, setFormularioNro] = useState("FORM-DGR-2026-089");
  const [formularioConclusiones, setFormularioConclusiones] = useState("Cumplidos todos los requisitos técnicos y documentales; integración validada favorablemente en preproducción.");

  // DTD: Paso a Producción (Paso 9)
  const [endpointProd, setEndpointProd] = useState("https://api.dinarp.gob.ec/v1/rc/defunciones");
  const [versionProd, setVersionProd] = useState("1.0.0");

  // ==========================================
  // TRANSICIONES DE ETAPAS (HU-INT-03 A 15)
  // ==========================================

  // HU-INT-04: DGR emite observaciones
  const handleDgrSolicitarCorreccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsTexto.trim()) {
      alert("Ingrese la observación obligatoria.");
      return;
    }

    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 2,
      etapaNombre: "Revisión Documental y de Campos",
      actorRol: "DGR",
      actorNombre: "María Torres (DGR)",
      accion: `Solicitud de corrección en ${obsTipo}`,
      version: expediente.versionActual,
      observaciones: obsTexto,
      huRef: "HU-INT-04"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_3_CORRECCION_COORDINADOR",
      responsableActualRol: "COORDINADOR_SINARP",
      responsableActualNombre: "Andrea López (Coordinador SINARP)",
      estadoGeneral: "Con observaciones",
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    setIsObsModalOpen(false);
    setObsTexto("");
    alert("Observaciones enviadas al Coordinador SINARP para subsanación puntual.");
  };

  // HU-INT-04: DGR aprueba revisión inicial y deriva a DTD
  const handleDgrAprobarRevision = () => {
    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 2,
      etapaNombre: "Revisión Documental y de Campos",
      actorRol: "DGR",
      actorNombre: "María Torres (DGR)",
      accion: "Aprobación documental y derivación a Tecnología",
      version: expediente.versionActual,
      detalles: "Requisitos documentales y campos candidatos conformes.",
      huRef: "HU-INT-04"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_4_VALIDACION_DTD",
      responsableActualRol: "DTD",
      responsableActualNombre: "Carlos Mena (DTD)",
      estadoGeneral: "En validación técnica DTD",
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    alert("Revisión documental aprobada. Expediente asignado a DTD para validación técnica.");
  };

  // HU-INT-05: Coordinador subsana y reenvía a DGR
  const handleCoordinadorReenviar = () => {
    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 3,
      etapaNombre: "Depuración y Subsanación",
      actorRol: "COORDINADOR_SINARP",
      actorNombre: "Andrea López (Coordinador)",
      accion: "Reenvío con correcciones subsanadas",
      version: "v1.0.1",
      detalles: correccionTexto || "Se atendieron las observaciones registradas por DGR sin reiniciar el trámite.",
      huRef: "HU-INT-05"
    };

    setExpediente(prev => ({
      ...prev,
      versionActual: "v1.0.1",
      etapaActual: "ETAPA_2_REVISION_DGR",
      responsableActualRol: "DGR",
      responsableActualNombre: "María Torres (DGR)",
      estadoGeneral: "En revisión DGR",
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    setCorreccionTexto("");
    alert("Correcciones enviadas a DGR para nueva revisión.");
  };

  // HU-INT-07: DTD valida técnicamente y pasa la fuente a estado OCULTO
  const handleDtdPasarOculto = () => {
    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 4,
      etapaNombre: "Validación Técnica e Ingreso a Catálogo",
      actorRol: "DTD",
      actorNombre: "Carlos Mena (DTD)",
      accion: "Validación técnica aprobada y registro de fuente como OCULTO",
      version: expediente.versionActual,
      detalles: "Fuente incorporada internamente en el Catálogo de Interoperabilidad bajo estado OCULTO. Se inician ramas paralelas DPI y DTD.",
      huRef: "HU-INT-06 / HU-INT-07"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_5_PARALELO_DPI_DTD",
      responsableActualRol: "DPI",
      responsableActualNombre: "Daniela Ruiz (DPI) & Carlos Mena (DTD)",
      estadoGeneral: "En integración y clasificación",
      validacionTecnicaDTD: {
        aprobado: true,
        fecha: nuevoEvento.fecha,
        responsable: "Carlos Mena (DTD)",
        observacionTecnica: "Esquema REST y contratos de integración validados satisfactoriamente.",
        estadoCatalogoAsignado: "OCULTO"
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    alert("¡Fuente ingresada al Catálogo como OCULTO! Se habilitan en paralelo las actividades de DPI (Clasificación) y DTD (Preproducción).");
  };

  // HU-INT-08: DPI clasifica campos y emite informe técnico
  const handleDpiFinalizarClasificacion = () => {
    const camposPendientes = dpiCampos.filter(c => c.clasificacion === "Pendiente");
    if (camposPendientes.length > 0) {
      alert("No es posible finalizar: aún existen campos con clasificación 'Pendiente'.");
      return;
    }

    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 5,
      etapaNombre: "Clasificación DPI",
      actorRol: "DPI",
      actorNombre: "Daniela Ruiz (DPI)",
      accion: "Informe de clasificación de datos emitido",
      version: expediente.versionActual,
      detalles: `Informe ${dpiInformeNro} cargado. Clasificados ${dpiCampos.length} campos (Accesible / Confidencial).`,
      huRef: "HU-INT-08"
    };

    setExpediente(prev => ({
      ...prev,
      camposCandidatos: dpiCampos,
      clasificacionDPI: {
        completada: true,
        fecha: nuevoEvento.fecha,
        responsable: "Daniela Ruiz (DPI)",
        numeroInforme: dpiInformeNro,
        informeAdjunto: dpiInformePdf,
        observaciones: "Clasificación jurídica de datos personales completada conforme a la LOPDP."
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    alert("Clasificación DPI registrada formalmente con informe adjunto.");
  };

  // HU-INT-09: DTD registra despliegue en preproducción
  const handleDtdRegistrarPreproduccion = () => {
    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 5,
      etapaNombre: "Integración DTD en Preproducción",
      actorRol: "DTD",
      actorNombre: "Carlos Mena (DTD)",
      accion: "Microservicio desplegado en ambiente de preproducción",
      version: dtdVersionPre,
      detalles: `Endpoint: ${dtdEndpointPre} â€¢ Microservicio: ${dtdMicroservicio}`,
      huRef: "HU-INT-09"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_6_VALIDACION_PRE_DGR",
      responsableActualRol: "DGR",
      responsableActualNombre: "María Torres (DGR)",
      estadoGeneral: "En validación preproducción",
      desplieguePreDTD: {
        completado: true,
        fecha: nuevoEvento.fecha,
        responsable: "Carlos Mena (DTD)",
        microservicioNombre: dtdMicroservicio,
        version: dtdVersionPre,
        endpointPre: dtdEndpointPre,
        notasDespliegue: "Microservicio activo en clúster preproducción con mTLS y credenciales de prueba."
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    alert("Despliegue en preproducción registrado. Tarea de validación funcional asignada a DGR.");
  };

  // HU-INT-10: DGR evalúa preproducción (Favorable / No Favorable)
  const handleDgrEvaluarPreproduccion = (e: React.FormEvent) => {
    e.preventDefault();

    if (validacionPreResultado === "No favorable" && !validacionPreObs.trim()) {
      alert("Es obligatorio registrar los errores u observaciones para devolver a DTD.");
      return;
    }

    const esFavorable = validacionPreResultado === "Favorable";

    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 6,
      etapaNombre: "Validación Funcional en Preproducción",
      actorRol: "DGR",
      actorNombre: "María Torres (DGR)",
      accion: esFavorable ? "Validación favorable en preproducción" : "Validación no favorable — Errores reportados",
      version: expediente.versionActual,
      observaciones: esFavorable ? undefined : validacionPreObs,
      detalles: esFavorable ? "Pruebas funcionales de consumo satisfactorias." : `Incidencias técnicas reportadas: ${validacionPreObs}`,
      huRef: esFavorable ? "HU-INT-10" : "HU-INT-11"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: esFavorable ? "ETAPA_8_APROBACION_DGR" : "ETAPA_7_ERROR_TECNICO_LOOP",
      responsableActualRol: esFavorable ? "DGR" : "DTD",
      responsableActualNombre: esFavorable ? "María Torres (DGR)" : "Carlos Mena (DTD)",
      estadoGeneral: esFavorable ? "En revisión DGR" : "En corrección técnica",
      validacionPreDGR: {
        evaluada: true,
        resultado: validacionPreResultado,
        fecha: nuevoEvento.fecha,
        responsable: "María Torres (DGR)",
        observacionesValidacion: validacionPreObs || "Pruebas funcionales exitosas."
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    setIsValPreModalOpen(false);
    alert(esFavorable ? "Validación favorable registrada. Habilitada etapa de aprobación." : "Reporte de incidencias enviado a DTD para corrección técnica.");
  };

  // HU-INT-11: DTD atiende incidencias y redespliega
  const handleDtdCorregirYRedesplegar = () => {
    if (!dtdSolucionError.trim()) {
      alert("Describa la solución técnica aplicada.");
      return;
    }

    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 7,
      etapaNombre: "Corrección Técnica y Redespliegue",
      actorRol: "DTD",
      actorNombre: "Carlos Mena (DTD)",
      accion: "Corrección técnica aplicada y redespliegue en preproducción",
      version: dtdVersionNueva,
      detalles: `Solución: ${dtdSolucionError} â€¢ Nueva versión: ${dtdVersionNueva}`,
      huRef: "HU-INT-11"
    };

    setExpediente(prev => ({
      ...prev,
      versionActual: dtdVersionNueva,
      etapaActual: "ETAPA_6_VALIDACION_PRE_DGR",
      responsableActualRol: "DGR",
      responsableActualNombre: "María Torres (DGR)",
      estadoGeneral: "En validación preproducción",
      correccionTecnicaDTD: {
        atendida: true,
        fecha: nuevoEvento.fecha,
        responsable: "Carlos Mena (DTD)",
        solucionAplicada: dtdSolucionError,
        nuevaVersion: dtdVersionNueva
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    setDtdSolucionError("");
    alert("Microservicio redesplegado con correcciones. Reasignado a DGR para nueva validación.");
  };

  // HU-INT-12: DGR diligencia formulario automatizado y aprueba
  const handleDgrAprobarIntegracion = () => {
    if (!formularioConclusiones.trim()) {
      alert("Debe completar las conclusiones en el formulario automatizado.");
      return;
    }

    const nuevoEvento: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 8,
      etapaNombre: "Aprobación de la Integración",
      actorRol: "DGR",
      actorNombre: "María Torres (DGR)",
      accion: "Aprobación formal de integración emitida",
      version: expediente.versionActual,
      detalles: `Formulario automatizado ${formularioNro} formalizado. Pasa a DTD para paso a producción.`,
      huRef: "HU-INT-12"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_9_PRODUCCION_DTD",
      responsableActualRol: "DTD",
      responsableActualNombre: "Carlos Mena (DTD)",
      estadoGeneral: "Aprobada",
      aprobacionDGR: {
        aprobada: true,
        fecha: nuevoEvento.fecha,
        responsable: "María Torres (DGR)",
        formularioAutomatizadoNro: formularioNro,
        conclusiones: formularioConclusiones
      },
      ultimaActualizacion: `${nuevoEvento.fecha} ${nuevoEvento.hora}`,
      historial: [nuevoEvento, ...prev.historial]
    }));

    alert("¡Integración aprobada formalmente! Tarea de paso a producción asignada a DTD.");
  };

  // HU-INT-13 & 14: DTD ejecuta paso a producción y se dispara notificación
  const handleDtdPasoProduccion = () => {
    const nuevoEvento1: EventoHistorial = {
      id: `h_${Date.now()}`,
      fecha: new Date().toLocaleDateString("es-EC"),
      hora: new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      etapaNumero: 9,
      etapaNombre: "Paso a Producción",
      actorRol: "DTD",
      actorNombre: "Carlos Mena (DTD)",
      accion: "Despliegue en ambiente productivo completado",
      version: versionProd,
      detalles: `Endpoint productivo: ${endpointProd}`,
      huRef: "HU-INT-13"
    };

    const nuevoEvento2: EventoHistorial = {
      id: `h_${Date.now() + 1}`,
      fecha: nuevoEvento1.fecha,
      hora: nuevoEvento1.hora,
      etapaNumero: 10,
      etapaNombre: "Notificación Automática de Cierre",
      actorRol: "COORDINADOR_SINARP",
      actorNombre: "Sistema Automático DINARP",
      accion: "Notificación automática remitida a Coordinadores SINARP",
      version: versionProd,
      detalles: `Notificados: Titular y Suplente de ${expediente.institucionSigla}. Fuente integrada correctamente.`,
      huRef: "HU-INT-14"
    };

    setExpediente(prev => ({
      ...prev,
      etapaActual: "ETAPA_10_NOTIFICACION_FINAL",
      responsableActualRol: "COORDINADOR_SINARP",
      responsableActualNombre: "Trámite Finalizado",
      estadoGeneral: "Integrada",
      pasoProduccionDTD: {
        ejecutado: true,
        fecha: nuevoEvento1.fecha,
        responsable: "Carlos Mena (DTD)",
        endpointProd: endpointProd,
        versionProd: versionProd
      },
      notificacionFinal: {
        enviada: true,
        fecha: nuevoEvento1.fecha,
        destinatarios: ["carlos.mendoza@registrocivil.gob.ec", "andrea.saltos@registrocivil.gob.ec"],
        asunto: `Fuente ${expediente.nombreFuente} integrada satisfactoriamente al Catálogo DINARP`
      },
      ultimaActualizacion: `${nuevoEvento1.fecha} ${nuevoEvento1.hora}`,
      historial: [nuevoEvento2, nuevoEvento1, ...prev.historial]
    }));

    alert("¡Paso a producción completado! Notificación automática enviada a los coordinadores institucional titular y suplente.");
  };

  const isMyTurn = expediente.responsableActualRol === activeRole;
  const isCoordinador = activeRole === "COORDINADOR_SINARP";
  const isDGR = activeRole === "DGR";
  const isDTD = activeRole === "DTD";
  const isDPI = activeRole === "DPI";

  return (
    <WireframeDashboardLayout
      activeMenu="integracion-fuentes"
      currentRole={activeRole}
      currentUser={currentUser}
      headerSlot={
        <WireframeRoleSelector activeRole={activeRole} onRoleChange={setActiveRole} />
      }
      breadcrumbs={[
        { label: "Catálogo de Interoperabilidad", href: "/catalogo-interoperabilidad" },
        { label: "Integración de Fuentes", href: "/catalogo-interoperabilidad/administracion/incorporaciones" },
        { label: expediente.codigoExpediente }
      ]}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">

        {/* Retorno */}
        <div className="flex items-center justify-between gap-4 -mt-2">
          <Button variant="ghost" size="sm" asChild className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/catalogo-interoperabilidad/administracion/incorporaciones">
              <ArrowLeft className="size-4" />
              Volver a Integración de Fuentes
            </Link>
          </Button>

        </div>

        {/* HEADER DEL EXPEDIENTE */}
        <Card variant="featured">
          <CardContent className="p-6 flex flex-col gap-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-mono font-bold bg-muted px-2.5 py-1 rounded border border-border text-foreground">
                    {expediente.codigoExpediente}
                  </span>
                  <Badge tone="neutral" appearance="outline" size="sm" className="font-mono">
                    {expediente.codigoFuente}
                  </Badge>
                  <Badge tone="info" appearance="soft" size="sm">
                    {expediente.estadoGeneral}
                  </Badge>
                </div>
                <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                  {expediente.nombreFuente}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="size-3.5 shrink-0" />
                  <span>{expediente.institucionNombre} ({expediente.institucionSigla})</span>
                </p>
              </div>
            </div>

            {/* Metadatos Clave */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Etapa actual:</span>
                <span className="font-semibold text-foreground">
                  {ETAPAS_EXPEDIENTE_CONFIG[expediente.etapaActual]?.nombre}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {ETAPAS_EXPEDIENTE_CONFIG[expediente.etapaActual]?.huRef}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Responsable actual:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {expediente.responsableActualNombre}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Fecha radicación:</span>
                <span className="font-semibold text-foreground">
                  {expediente.fechaRadicacion}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">Última actualización:</span>
                <span className="font-semibold text-foreground">
                  {expediente.ultimaActualizacion}
                </span>
              </div>
            </div>

            {/* BANNER DINÁMICO DE TAREA ACTIVA PARA EL ROL */}
            {isMyTurn ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Tu tarea ({ROLES_CONFIG[activeRole]?.shortName || activeRole}):
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isCoordinador && (expediente.etapaActual === "ETAPA_1_REGISTRO" || expediente.etapaActual === "ETAPA_3_CORRECCION_COORDINADOR") ? "Completa y envía la información de la fuente." :
                       isCoordinador && expediente.etapaActual === "ETAPA_3_CORRECCION_COORDINADOR" ? "Corrige las observaciones realizadas por DGR." :
                       isDPI && expediente.etapaActual === "ETAPA_5_PARALELO_DPI_DTD" ? "Clasifica todos los campos de la fuente y adjunta el informe." :
                       ETAPAS_EXPEDIENTE_CONFIG[expediente.etapaActual]?.descripcion}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* ACCIONES COORDINADOR (Paso 3) */}
                  {isCoordinador && expediente.etapaActual === "ETAPA_3_CORRECCION_COORDINADOR" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCoordinadorReenviar}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Send className="size-3.5" />
                      Reenviar a revisión DGR
                    </Button>
                  )}

                  {/* ACCIONES DGR (Paso 2) */}
                  {isDGR && expediente.etapaActual === "ETAPA_2_REVISION_DGR" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsObsModalOpen(true)}
                        className="gap-1.5 text-xs"
                      >
                        <AlertTriangle className="size-3.5 text-amber-600" />
                        Solicitar corrección
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleDgrAprobarRevision}
                        className="gap-1.5 text-xs font-semibold"
                      >
                        <Check className="size-3.5" />
                        Aprobar revisión
                      </Button>
                    </>
                  )}

                  {/* ACCIONES DTD (Paso 4) */}
                  {isDTD && expediente.etapaActual === "ETAPA_4_VALIDACION_DTD" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDtdPasarOculto}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <EyeOff className="size-3.5" />
                      Registrar en catálogo como OCULTO
                    </Button>
                  )}

                  {/* ACCIONES DGR (Paso 6) */}
                  {isDGR && expediente.etapaActual === "ETAPA_6_VALIDACION_PRE_DGR" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsValPreModalOpen(true)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <FileCheck2 className="size-3.5" />
                      Evaluar validación preproducción
                    </Button>
                  )}

                  {/* ACCIONES DGR (Paso 8) */}
                  {isDGR && expediente.etapaActual === "ETAPA_8_APROBACION_DGR" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDgrAprobarIntegracion}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Aprobar integración formal
                    </Button>
                  )}

                  {/* ACCIONES DTD (Paso 9) */}
                  {isDTD && expediente.etapaActual === "ETAPA_9_PRODUCCION_DTD" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDtdPasoProduccion}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <Server className="size-3.5" />
                      Registrar paso a producción
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-muted/40 border border-border rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
                <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">No tienes acciones pendientes en esta etapa.</strong> El trámite está siendo gestionado por {expediente.responsableActualNombre}.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* STEPPER / TIMELINE DE PROGRESO */}
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Flujo de Incorporación (HU-INT-03 a 15)
              </span>
              <Badge tone="neutral" appearance="soft" size="sm" className="text-[11px]">
                Etapa {ETAPAS_EXPEDIENTE_CONFIG[expediente.etapaActual]?.numero || 1} de 10
              </Badge>
            </div>

            {/* Stepper visual con soporte de la rama paralela */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-2 text-center text-xs">
              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">1</span>
                <span className="font-semibold text-foreground text-[11px]">Registro</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-03</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">2</span>
                <span className="font-semibold text-foreground text-[11px]">Revisión DGR</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-04</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">3</span>
                <span className="font-semibold text-foreground text-[11px]">Validación DTD</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-06/07</span>
              </div>

              {/* RAMA PARALELA DESTACADA */}
              <div className="sm:col-span-2 bg-purple-500/10 p-2.5 rounded-lg border border-purple-500/30 flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">4</span>
                <span className="font-bold text-foreground text-[11px]">Paralelo: DPI + DTD</span>
                <span className="text-[10px] text-muted-foreground">Clasificación & Preproducción</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">5</span>
                <span className="font-semibold text-foreground text-[11px]">Validación DGR</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-10</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">6</span>
                <span className="font-semibold text-foreground text-[11px]">Aprobación</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-12</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">7</span>
                <span className="font-semibold text-foreground text-[11px]">Producción</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-13</span>
              </div>

              <div className="bg-muted/40 p-2.5 rounded-lg border border-border flex flex-col items-center gap-1">
                <span className="size-5 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center">8</span>
                <span className="font-semibold text-foreground text-[11px]">Notificación</span>
                <span className="text-[10px] text-muted-foreground">HU-INT-14</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NAVEGACIÓN POR TABS / SECCIONES */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-1 text-xs">
          {[
            { id: "resumen", label: "Resumen", icon: Layers },
            { id: "informacion", label: "Información de la fuente", icon: Building2 },
            { id: "documentos", label: `Documentación (${expediente.documentosSoporte.length})`, icon: FileText },
            { id: "campos", label: `Campos (${expediente.camposCandidatos.length})`, icon: Sparkles },
            { id: "clasificacion", label: "Clasificación DPI", icon: ShieldCheck },
            { id: "tecnica", label: "Integración técnica DTD", icon: Server },
            { id: "validaciones", label: "Validaciones DGR", icon: FileCheck2 },
            { id: "historial", label: `Historial (${expediente.historial.length})`, icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "primary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className={`h-9 px-3 gap-1.5 shrink-0 rounded-b-none border-b-2 ${isActive ? "border-primary font-semibold" : "border-transparent text-muted-foreground"
                  }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* CONTENIDO DE TABS */}

        {/* TAB 1: RESUMEN */}
        {activeTab === "resumen" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Columna Izquierda: Ficha y Estado */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-bold font-heading">
                      Descripción Funcional de la Fuente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3 text-xs leading-relaxed">
                    <p className="text-foreground">
                      {expediente.descripcion}
                    </p>
                    <div className="bg-muted/30 border border-border rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-muted-foreground block">Base Legal:</span>
                        <span className="font-medium text-foreground">
                          Ley Orgánica de Gestión de la Identidad y Datos Civiles / Res. 004
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Tipo de Consumo:</span>
                        <span className="font-medium text-foreground">
                          Servicio Web (REST / JSON Sincrónico)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Si la fuente está en estado con observaciones, mostrar alerta detallada */}
                {expediente.estadoGeneral === "Con observaciones" && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                      <AlertCircle className="size-4 text-amber-600" />
                      Esta integración requiere correcciones
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      La Dirección de Gestión y Registro (DGR) devolvió el expediente solicitando subsanación puntual de los siguientes elementos observados. El Coordinador SINARP puede editar los datos y reenviar sin reiniciar el trámite.
                    </p>
                    <div className="divide-y divide-amber-500/20 bg-surface rounded-lg border border-amber-500/30 overflow-hidden text-xs">
                      {expediente.documentosSoporte.filter(d => d.estadoRevision === "Observado").map(d => (
                        <div key={d.id} className="p-3 flex flex-col gap-1">
                          <span className="font-semibold text-foreground">Documento observado: {d.nombre}</span>
                          <span className="text-muted-foreground">{d.observacionDGR}</span>
                        </div>
                      ))}
                      {expediente.camposCandidatos.filter(c => c.estadoRevision === "Observado").map(c => (
                        <div key={c.id} className="p-3 flex flex-col gap-1">
                          <span className="font-semibold text-foreground">Campo observado: {c.nombre}</span>
                          <span className="text-muted-foreground">{c.observacionDGR}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen de los 2 paralelos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DPI */}
                  <Card>
                    <CardHeader className="p-4 pb-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-heading flex items-center gap-1.5">
                          <ShieldCheck className="size-4 text-purple-600" />
                          Rama A: DPI Clasificación
                        </span>
                        <Badge
                          tone={expediente.clasificacionDPI?.completada ? "success" : "neutral"}
                          appearance="soft"
                          size="sm"
                        >
                          {expediente.clasificacionDPI?.completada ? "Completada" : "En proceso"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 text-xs flex flex-col gap-2">
                      <p className="text-muted-foreground">
                        {expediente.clasificacionDPI?.completada
                          ? `Informe ${expediente.clasificacionDPI.numeroInforme} emitido con clasificación de todos los campos.`
                          : "Pendiente emisión del Informe Técnico de Clasificación de Datos."}
                      </p>
                    </CardContent>
                  </Card>

                  {/* DTD */}
                  <Card>
                    <CardHeader className="p-4 pb-2 border-b border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-heading flex items-center gap-1.5">
                          <Server className="size-4 text-blue-600" />
                          Rama B: DTD Integración
                        </span>
                        <Badge
                          tone={expediente.desplieguePreDTD?.completado ? "success" : "neutral"}
                          appearance="soft"
                          size="sm"
                        >
                          {expediente.desplieguePreDTD?.completado ? "Desplegado" : "Pendiente"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 text-xs flex flex-col gap-2">
                      <p className="text-muted-foreground">
                        {expediente.desplieguePreDTD?.completado
                          ? `Microservicio ${expediente.desplieguePreDTD.microservicioNombre} (${expediente.desplieguePreDTD.version}) activo en preproducción.`
                          : "Pendiente configuración del microservicio y despliegue en clúster preproducción."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Columna Derecha: Antecedentes del Procedimiento y Coordinadores */}
              <div className="flex flex-col gap-6">
                <Card>
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-bold font-heading">
                      Coordinación Institucional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Coordinador Titular:</span>
                      <span className="font-semibold text-foreground">Ing. Carlos Mendoza Viteri</span>
                      <span className="text-muted-foreground block text-[11px]">carlos.mendoza@registrocivil.gob.ec</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Coordinador Suplente:</span>
                      <span className="font-semibold text-foreground">Lcda. Andrea Saltos</span>
                      <span className="text-muted-foreground block text-[11px]">andrea.saltos@registrocivil.gob.ec</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Antecedentes del Procedimiento Oficial DINARP */}
                <Card>
                  <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-sm font-bold font-heading">
                      Antecedentes del Procedimiento
                    </CardTitle>
                    <CardDescription className="text-[11px] text-muted-foreground">
                      Elementos documentales del procedimiento actual entregado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col gap-2.5 text-xs">
                    <div className="p-2.5 rounded bg-muted/40 border border-border flex flex-col gap-1">
                      <span className="font-semibold text-foreground text-[11px]">Ticket JTRAC / Caso de Negocio:</span>
                      <span className="text-muted-foreground text-[11px]">
                        JTRAC-2026-0891 (Registrado como antecedente en expediente)
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-muted/40 border border-border flex flex-col gap-1">
                      <span className="font-semibold text-foreground text-[11px]">Plan de Implementación:</span>
                      <span className="text-muted-foreground text-[11px]">
                        Plan_Tecnico_Interoperabilidad_v1.0.pdf
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                      Anotación: Estos elementos corresponden al procedimiento actual y se conservan como documentación de soporte.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INFORMACIÓN DE LA FUENTE */}
        {activeTab === "informacion" && (
          <Card>
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-bold font-heading">
                Información General de la Fuente Candidata
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Datos descriptivos y marco institucional ingresados por el Coordinador SINARP (HU-INT-03)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">Nombre de la fuente:</span>
                <span className="text-foreground text-sm font-medium">{expediente.nombreFuente}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">Código técnico asignado:</span>
                <span className="text-foreground text-sm font-mono font-medium">{expediente.codigoFuente}</span>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-muted-foreground font-semibold">Descripción de la fuente:</span>
                <p className="text-foreground leading-relaxed">{expediente.descripcion}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">Institución Emisora:</span>
                <span className="text-foreground">{expediente.institucionNombre} ({expediente.institucionSigla})</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground font-semibold">Base Legal y Normativa:</span>
                <span className="text-foreground">Ley Orgánica de Gestión de la Identidad y Datos Civiles / Resolución N° 004-DN-2023</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: DOCUMENTACIÓN */}
        {activeTab === "documentos" && (
          <Card>
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-heading">
                    Documentación de Soporte (Resolución N° 004)
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Oficios de solicitud, especificación técnica y actos administrativos
                  </CardDescription>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm">
                  {expediente.documentosSoporte.length} documentos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-surface">
                {expediente.documentosSoporte.map(doc => (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {doc.nombre}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Tipo: {doc.tipoRequerido} â€¢ Archivo: {doc.archivoNombre} ({doc.archivoTamano || "1.2 MB"})
                        </span>
                        {doc.observacionDGR && (
                          <span className="text-amber-600 text-[11px] font-medium mt-1">
                            Observación DGR: {doc.observacionDGR}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        tone={doc.estadoRevision === "Aprobado" ? "success" : doc.estadoRevision === "Observado" ? "warning" : "neutral"}
                        appearance="soft"
                        size="sm"
                      >
                        {doc.estadoRevision}
                      </Badge>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Ver archivo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 4: CAMPOS */}
        {activeTab === "campos" && (
          <Card>
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-heading">
                    Campos Candidatos de la Fuente
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Atributos que conforman la estructura de intercambio (HU-INT-03 / HU-INT-04)
                  </CardDescription>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm">
                  {expediente.camposCandidatos.length} campos
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="border border-border rounded-lg overflow-x-auto bg-surface">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-2.5 px-3">Nombre del campo</th>
                      <th className="py-2.5 px-3">Tipo de dato</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3">Clasificación DPI</th>
                      <th className="py-2.5 px-3">Estado revisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {expediente.camposCandidatos.map(campo => (
                      <tr key={campo.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                          {campo.nombre}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                            {campo.tipo}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-sm">
                          {campo.descripcion}
                          {campo.observacionDGR && (
                            <span className="block text-amber-600 text-[10px] font-medium mt-0.5">
                              Observación DGR: {campo.observacionDGR}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            tone="neutral"
                            appearance="soft"
                            size="sm"
                            className="text-[11px] font-medium gap-1 bg-muted/80 text-foreground border border-border"
                          >
                            {campo.clasificacion === "Accesible" && <Check className="size-2.5 text-muted-foreground" />}
                            {campo.clasificacion === "Confidencial" && <Lock className="size-2.5 text-muted-foreground" />}
                            <span>{campo.clasificacion}</span>
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge
                            tone={campo.estadoRevision === "Valido" ? "success" : campo.estadoRevision === "Observado" ? "warning" : "neutral"}
                            appearance="soft"
                            size="sm"
                          >
                            {campo.estadoRevision || "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 5: CLASIFICACIÓN DPI */}
        {activeTab === "clasificacion" && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <ShieldCheck className="size-4 text-purple-600" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        Clasificación Jurídica de Sensibilidad de Datos (DPI)
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Conforme a la Ley Orgánica de Protección de Datos Personales (HU-INT-08)
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    tone={expediente.clasificacionDPI?.completada ? "success" : "warning"}
                    appearance="soft"
                    size="sm"
                  >
                    {expediente.clasificacionDPI?.completada ? "Clasificación Formalizada" : "Pendiente de Dictamen"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-5">
                {/* Formulario / Tabla interactiva para DPI */}
                <div className="border border-border rounded-lg overflow-x-auto bg-surface">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="py-2.5 px-3">Campo</th>
                        <th className="py-2.5 px-3">Tipo</th>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-3">Nivel de Sensibilidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {dpiCampos.map((c, idx) => (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="py-2.5 px-3 font-mono font-medium text-foreground">
                            {c.nombre}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px]">
                              {c.tipo}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground max-w-xs">
                            {c.descripcion}
                          </td>
                          <td className="py-2.5 px-3">
                            {isDPI && !expediente.clasificacionDPI?.completada ? (
                              <select
                                value={c.clasificacion}
                                onChange={e => {
                                  const val = e.target.value as any;
                                  const updated = [...dpiCampos];
                                  updated[idx].clasificacion = val;
                                  setDpiCampos(updated);
                                }}
                                className="h-8 text-xs border border-border rounded bg-background px-2 focus:ring-1 focus:ring-ring"
                              >
                                <option value="Pendiente">Pendiente de clasificación</option>
                                <option value="Accesible">Accesible (Público)</option>
                                <option value="Confidencial">Confidencial (Protegido)</option>
                              </select>
                            ) : (
                              <Badge
                                tone="neutral"
                                appearance="soft"
                                size="sm"
                                className="text-[11px] font-medium gap-1 bg-muted/80 text-foreground border border-border"
                              >
                                {c.clasificacion === "Accesible" && <Check className="size-2.5 text-muted-foreground" />}
                                {c.clasificacion === "Confidencial" && <Lock className="size-2.5 text-muted-foreground" />}
                                <span>{c.clasificacion}</span>
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Informe Técnico PDF obligatorio */}
                <div className="bg-muted/30 border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        Informe Técnico de Clasificación (Obligatorio)
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        N.º de Informe: {dpiInformeNro} â€¢ Archivo: {dpiInformePdf}
                      </span>
                    </div>
                  </div>

                  {isDPI && !expediente.clasificacionDPI?.completada && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDpiFinalizarClasificacion}
                      className="gap-1.5 text-xs font-semibold shrink-0"
                    >
                      <CheckCircle2 className="size-3.5" />
                      Finalizar y formalizar clasificación
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 6: INTEGRACIÓN TÉCNICA DTD */}
        {activeTab === "tecnica" && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardDecorativeIcon>
                      <Server className="size-4 text-blue-600" />
                    </CardDecorativeIcon>
                    <div>
                      <CardTitle className="text-base font-bold font-heading">
                        Integración Técnica y Despliegues (DTD)
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Microservicios, endpoints de prueba y paso a producción (HU-INT-09 / 13)
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    tone={expediente.pasoProduccionDTD?.ejecutado ? "success" : expediente.desplieguePreDTD?.completado ? "info" : "neutral"}
                    appearance="soft"
                    size="sm"
                  >
                    {expediente.pasoProduccionDTD?.ejecutado ? "En Producción" : expediente.desplieguePreDTD?.completado ? "En Preproducción" : "Pendiente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-5 text-xs">
                {/* Preproducción */}
                <div className="border border-border rounded-lg p-4 bg-surface flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Terminal className="size-4 text-blue-600" />
                      Ambiente de Preproducción (Testing)
                    </span>
                    <Badge tone="info" appearance="soft" size="sm">
                      {expediente.desplieguePreDTD?.completado ? "Desplegado" : "Pendiente"}
                    </Badge>
                  </div>

                  {expediente.desplieguePreDTD?.completado ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-muted/30 p-3 rounded font-mono text-[11px]">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Microservicio:</span>
                        <span className="font-semibold text-foreground">{expediente.desplieguePreDTD.microservicioNombre}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Versión:</span>
                        <span className="font-semibold text-foreground">{expediente.desplieguePreDTD.version}</span>
                      </div>
                      <div className="sm:col-span-3">
                        <span className="text-muted-foreground block text-[10px]">Endpoint Preproducción:</span>
                        <span className="font-semibold text-foreground text-blue-600 underline truncate block">
                          {expediente.desplieguePreDTD.endpointPre}
                        </span>
                      </div>
                    </div>
                  ) : isDTD ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-muted-foreground">Nombre microservicio</Label>
                        <Input
                          value={dtdMicroservicio}
                          onChange={e => setDtdMicroservicio(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-muted-foreground">Versión</Label>
                        <Input
                          value={dtdVersionPre}
                          onChange={e => setDtdVersionPre(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <Label className="text-[11px] text-muted-foreground">Endpoint Preproducción</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={dtdEndpointPre}
                            onChange={e => setDtdEndpointPre(e.target.value)}
                            className="h-8 text-xs font-mono flex-1"
                          />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleDtdRegistrarPreproduccion}
                            className="h-8 text-xs shrink-0"
                          >
                            Registrar despliegue
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Pendiente de despliegue por parte de la Dirección de Tecnología (DTD).
                    </p>
                  )}
                </div>

                {/* Paso a Producción */}
                <div className="border border-border rounded-lg p-4 bg-surface flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Server className="size-4 text-emerald-600" />
                      Ambiente de Producción (Oficial)
                    </span>
                    <Badge
                      tone={expediente.pasoProduccionDTD?.ejecutado ? "success" : "neutral"}
                      appearance="soft"
                      size="sm"
                    >
                      {expediente.pasoProduccionDTD?.ejecutado ? "Producción Activa" : "No Desplegado"}
                    </Badge>
                  </div>

                  {expediente.pasoProduccionDTD?.ejecutado ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 font-mono text-[11px] flex flex-col gap-1">
                      <span className="text-muted-foreground">Endpoint Productivo:</span>
                      <span className="font-bold text-emerald-700 text-xs">
                        {expediente.pasoProduccionDTD.endpointProd}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Desplegado el {expediente.pasoProduccionDTD.fecha} por {expediente.pasoProduccionDTD.responsable}
                      </span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      El paso a producción se habilita una vez emitida la aprobación formal por parte de DGR (HU-INT-12).
                    </p>
                  )}
                </div>

                {/* Anotación HU-INT-15 sobre publicación */}
                <div className="bg-muted/40 border border-border rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground">Anotación de diseño (HU-INT-15):</strong> Publicación pendiente de definición con DINARP. Se debe confirmar si el paso de <code>OCULTO â†’ PUBLICADO</code> se ejecuta automáticamente tras el despliegue a producción o requiere una acción manual complementaria de DGR.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 7: VALIDACIONES DGR */}
        {activeTab === "validaciones" && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-bold font-heading">
                  Validaciones Funcionales y Aprobación (DGR)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Dictámenes de pruebas en preproducción y formulario automatizado (HU-INT-10 / 12)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col gap-5 text-xs">
                {/* Dictamen Preproducción */}
                <div className="border border-border rounded-lg p-4 bg-surface flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Validación Funcional en Preproducción (HU-INT-10)
                    </span>
                    <Badge
                      tone={expediente.validacionPreDGR?.resultado === "Favorable" ? "success" : expediente.validacionPreDGR?.resultado === "No favorable" ? "danger" : "neutral"}
                      appearance="soft"
                      size="sm"
                    >
                      {expediente.validacionPreDGR?.resultado || "Pendiente"}
                    </Badge>
                  </div>
                  {expediente.validacionPreDGR?.evaluada ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {expediente.validacionPreDGR.observacionesValidacion}
                    </p>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Pendiente de evaluación funcional por parte de DGR en el ambiente de preproducción.
                    </p>
                  )}
                </div>

                {/* Formulario Automatizado y Aprobación */}
                <div className="border border-border rounded-lg p-4 bg-surface flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Formulario Automatizado de Aprobación (HU-INT-12)
                    </span>
                    <Badge
                      tone={expediente.aprobacionDGR?.aprobada ? "success" : "neutral"}
                      appearance="soft"
                      size="sm"
                    >
                      {expediente.aprobacionDGR?.aprobada ? "Aprobada" : "Pendiente"}
                    </Badge>
                  </div>

                  {expediente.aprobacionDGR?.aprobada ? (
                    <div className="bg-muted/30 border border-border rounded p-3 flex flex-col gap-1.5">
                      <span className="font-mono text-[11px] text-foreground font-semibold">
                        N.º Formulario: {expediente.aprobacionDGR.formularioAutomatizadoNro}
                      </span>
                      <p className="text-muted-foreground leading-relaxed">
                        Conclusiones: {expediente.aprobacionDGR.conclusiones}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        Aprobado el {expediente.aprobacionDGR.fecha} por {expediente.aprobacionDGR.responsable}
                      </span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      El formulario automatizado precargará los antecedentes técnicos y legales para la firma y aprobación final de DGR.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 8: HISTORIAL Y TRAZABILIDAD */}
        {activeTab === "historial" && (
          <Card>
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold font-heading">
                    Historial Inmutable de Trazabilidad
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Registro cronológico de actuaciones, devoluciones, correcciones y aprobaciones
                  </CardDescription>
                </div>
                <Badge tone="neutral" appearance="soft" size="sm">
                  {expediente.historial.length} eventos registrados
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {expediente.historial.map((ev, index) => (
                  <div key={ev.id} className="relative flex flex-col gap-1.5 text-xs">
                    <span className="absolute -left-6 top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">
                        {ev.accion}
                      </span>
                      <Badge tone="neutral" appearance="soft" size="sm" className="text-[10px]">
                        {ROLES_CONFIG[ev.actorRol]?.shortName || ev.actorRol}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {ev.fecha} {ev.hora}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-[11px]">
                      Responsable: <strong className="text-foreground">{ev.actorNombre}</strong> â€¢ Versión: {ev.version} â€¢ Ref: {ev.huRef}
                    </span>
                    {ev.observaciones && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-800 text-[11px] mt-1">
                        <strong>Observaciones:</strong> {ev.observaciones}
                      </div>
                    )}
                    {ev.detalles && (
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        {ev.detalles}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* MODAL DE OBSERVACIONES DGR (Paso 2) */}
        <Dialog open={isObsModalOpen} onOpenChange={setIsObsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-heading font-bold flex items-center gap-2">
                <AlertTriangle className="size-4 text-amber-600" />
                Solicitar Correcciones al Coordinador
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Registra las observaciones puntuales que el organismo emisor debe subsanar (HU-INT-04).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDgrSolicitarCorreccion} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Elemento a observar</Label>
                <select
                  value={obsTipo}
                  onChange={e => setObsTipo(e.target.value as any)}
                  className="h-9 text-xs border border-border rounded bg-background px-2"
                >
                  <option value="campo">Campo candidato</option>
                  <option value="documento">Documento soporte</option>
                  <option value="informacion">Información general de la fuente</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">
                  Observación o justificación <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={obsTexto}
                  onChange={e => setObsTexto(e.target.value)}
                  placeholder="Detalla con precisión el ajuste o corrección requerida..."
                  rows={3}
                  className="text-xs"
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="neutral" size="sm" onClick={() => setIsObsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Enviar observaciones
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL DE VALIDACIÓN PREPRODUCCIÓN DGR (Paso 6) */}
        <Dialog open={isValPreModalOpen} onOpenChange={setIsValPreModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-heading font-bold flex items-center gap-2">
                <FileCheck2 className="size-4 text-blue-600" />
                Validación Funcional en Preproducción
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Evalúa el comportamiento funcional del microservicio desplegado (HU-INT-10).
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleDgrEvaluarPreproduccion} className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">Resultado de la evaluación</Label>
                <select
                  value={validacionPreResultado}
                  onChange={e => setValidacionPreResultado(e.target.value as any)}
                  className="h-9 text-xs border border-border rounded bg-background px-2"
                >
                  <option value="Favorable">Validación Favorable (Pruebas exitosas)</option>
                  <option value="No favorable">Validación No Favorable (Con errores técnicos)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold">
                  Observaciones / Errores técnicos {validacionPreResultado === "No favorable" && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  value={validacionPreObs}
                  onChange={e => setValidacionPreObs(e.target.value)}
                  placeholder="Detalla el resultado de las pruebas o los errores encontrados..."
                  rows={3}
                  className="text-xs"
                  required={validacionPreResultado === "No favorable"}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="neutral" size="sm" onClick={() => setIsValPreModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Registrar dictamen
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </WireframeDashboardLayout>
  );
}
