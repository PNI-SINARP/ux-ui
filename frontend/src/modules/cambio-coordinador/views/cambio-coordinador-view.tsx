"use client";

import React, { useState } from "react";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { CoordinadorActualCard } from "../components/coordinador-actual-card";
import {
  CoordinadorEntranteForm,
  type FormNuevoCoordinadorData
} from "../components/coordinador-entrante-form";
import { AnexoCPreview } from "../components/anexo-c-preview";
import { AnexoCForm, type DatosInstrumentoAnexoC } from "../components/anexo-c-form";
import { AnexoCSignature } from "../components/anexo-c-signature";
import { CambioCoordinadorResult } from "../components/cambio-coordinador-result";
import { CambioCoordinadorReview } from "../components/cambio-coordinador-review";
import {
  useCambioCoordinadorStore,
  type CaracterCoordinador,
  type TramiteCambioCoordinador,
  type TipoFirmanteAnexoC,
  type AutorizacionDelegado,
  type ValidacionFirmaECAnexoC
} from "../data/cambio-coordinador-store";
import { Card, CardTitle, CardDescription, CardDecorativeIcon, CardBadge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import {
  UserCheck,
  FileText,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Check,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

type VistaEstado = "INICIAL" | "WIZARD" | "DETALLE";

export function CambioCoordinadorView() {
  const {
    institucion,
    crearSolicitud,
    isLoaded
  } = useCambioCoordinadorStore();

  const [vista, setVista] = useState<VistaEstado>("INICIAL");
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState<TramiteCambioCoordinador | null>(null);

  // Estados del Wizard (5 pasos)
  const [caracterSolicitud, setCaracterSolicitud] = useState<CaracterCoordinador>("TITULAR");
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [datosEntrante, setDatosEntrante] = useState<FormNuevoCoordinadorData | null>(null);
  const [datosInstrumento, setDatosInstrumento] = useState<DatosInstrumentoAnexoC | null>(null);
  const [tramiteGenerado, setTramiteGenerado] = useState<TramiteCambioCoordinador | null>(null);

  // Pasos oficiales del Stepper
  const stepsList: StepperStep[] = [
    {
      id: "1",
      title: "Nuevo coordinador",
      description: "Datos del funcionario entrante",
      icon: UserCheck
    },
    {
      id: "2",
      title: "Llenar Anexo C",
      description: "Instrumentación y respaldo",
      icon: FileText
    },
    {
      id: "3",
      title: "Revisar borrador",
      description: "Documento oficial Anexo C",
      icon: FileCheck2
    },
    {
      id: "4",
      title: "Firma electrónica",
      description: "Suscripción con FirmaEC",
      icon: ShieldCheck
    },
    {
      id: "5",
      title: "Confirmación y envío",
      description: "Trámite registrado y enviado",
      icon: CheckCircle2
    }
  ];

  // Iniciar wizard desde las cards de la vista inicial
  const handleIniciarSolicitud = (caracter: CaracterCoordinador) => {
    setCaracterSolicitud(caracter);
    setPasoActual(1);
    setDatosEntrante(null);
    setDatosInstrumento(null);
    setTramiteGenerado(null);
    setVista("WIZARD");
  };

  // Paso 1 completado: datos del nuevo coordinador
  const handlePaso1Completado = (data: FormNuevoCoordinadorData) => {
    setDatosEntrante(data);
    setPasoActual(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Paso 2 completado: instrumento Anexo C completado
  const handlePaso2Completado = (datos: DatosInstrumentoAnexoC) => {
    setDatosInstrumento(datos);
    setPasoActual(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Paso 3 a Paso 4: avanzar de revisión Anexo C a Firma
  const handlePaso3AvanzarFirma = () => {
    setPasoActual(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Paso 3 completado: Anexo C firmado con FirmaEC y enviado a Gestión
  const handleFirmaCompletada = (datosFirma: {
    firmanteTipo: TipoFirmanteAnexoC;
    autorizacionDelegado?: AutorizacionDelegado;
    firmaEC: ValidacionFirmaECAnexoC;
  }) => {
    if (!datosEntrante) return;

    const saliente = caracterSolicitud === "TITULAR" ? institucion.titular : institucion.suplente;
    const now = new Date();
    const fechaStr = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const nuevaSolicitud = crearSolicitud({
      institucion: institucion.nombre,
      ruc: institucion.ruc,
      fechaSolicitud: fechaStr,
      caracter: caracterSolicitud,
      coordinadorSaliente: saliente,
      coordinadorEntrante: {
        nombreCompleto: datosEntrante.nombreCompleto,
        cedula: datosEntrante.cedula,
        correo: datosEntrante.correo,
        cargo: datosEntrante.cargo,
        motivo: datosEntrante.motivo,
        poseeCuentaSistema: datosEntrante.poseeCuentaSistema,
        poseeAnexoBAprobado: datosEntrante.poseeAnexoBAprobado
      },
      firmanteTipo: datosFirma.firmanteTipo,
      autorizacionDelegado: datosFirma.autorizacionDelegado,
      estadoDocumento: "Firma verificada",
      estadoTramite: "Pendiente de asignación",
      firmaEC: datosFirma.firmaEC,
      datosAnexoC: {
        nombreEntidad: institucion.nombre,
        representanteLegalNombre:
          datosFirma.firmanteTipo === "MAXIMA_AUTORIDAD"
            ? institucion.representanteLegal
            : "Delegado Autorizado",
        esDelegado: datosFirma.firmanteTipo === "DELEGADO_AUTORIZADO",
        archivoSoporteDelegacion: datosFirma.autorizacionDelegado?.archivoNombre,
        aplicaCambioTitular: caracterSolicitud === "TITULAR",
        aplicaCambioSuplente: caracterSolicitud === "SUPLENTE",
        aplicaDesignacionInicialSuplente: false,
        nuevoTitularNombre: caracterSolicitud === "TITULAR" ? datosEntrante.nombreCompleto : undefined,
        nuevoTitularCedula: caracterSolicitud === "TITULAR" ? datosEntrante.cedula : undefined,
        nuevoTitularCargo: caracterSolicitud === "TITULAR" ? datosEntrante.cargo : undefined,
        nuevoTitularMotivo: caracterSolicitud === "TITULAR" ? (datosInstrumento?.motivoSustitucion || datosEntrante.motivo) : undefined,
        nuevoTitularEmail: caracterSolicitud === "TITULAR" ? datosEntrante.correo : undefined,
        nuevoSuplenteNombre: caracterSolicitud === "SUPLENTE" ? datosEntrante.nombreCompleto : undefined,
        nuevoSuplenteCedula: caracterSolicitud === "SUPLENTE" ? datosEntrante.cedula : undefined,
        nuevoSuplenteCargo: caracterSolicitud === "SUPLENTE" ? datosEntrante.cargo : undefined,
        nuevoSuplenteMotivo: caracterSolicitud === "SUPLENTE" ? (datosInstrumento?.motivoSustitucion || datosEntrante.motivo) : undefined,
        nuevoSuplenteEmail: caracterSolicitud === "SUPLENTE" ? datosEntrante.correo : undefined,
        ciudadFirma: "Quito D.M.",
        fechaFirma: fechaStr,
        firmadoDigitalmente: true,
        archivoDocumentoFirmado: "ARP-R03_Cambio_Coordinador_MinEduc.pdf"
      }
    });

    setTramiteGenerado(nuevaSolicitud);
    setPasoActual(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerDetalle = (tramite: TramiteCambioCoordinador) => {
    setTramiteSeleccionado(tramite);
    setVista("DETALLE");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVolverInicial = () => {
    setVista("INICIAL");
    setTramiteSeleccionado(null);
    setPasoActual(1);
    setDatosEntrante(null);
    setDatosInstrumento(null);
    setTramiteGenerado(null);
  };

  return (
    <WireframeDashboardLayout activeMenu="cambio-coordinador">
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-5 py-4 sm:py-6 space-y-5">
        {/* Contenedor Principal Unificado idéntico a /registro-institucion y /enrolamiento-coordinador */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-xs animate-in fade-in duration-300 w-full">
          {/* Encabezado del Trámite en Card Featured estilo UI Kit con CardBadge y CardDecorativeIcon */}
          <Card
            variant="featured"
            disableHover={true}
            className="bg-primary-100/30 dark:bg-primary-900/20 border-0 shadow-none hover:shadow-none hover:translate-y-0 mb-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <CardBadge className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 border-0">
                  FORMULARIO OFICIAL ARP-R03
                </CardBadge>
                <Badge
                  tone="primary"
                  appearance="soft"
                  size="sm"
                  className="font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border border-primary/30"
                >
                  <FileText className="size-3 shrink-0" />
                  <span>Anexo C · Versión 1.0</span>
                </Badge>
              </div>

              {vista === "WIZARD" && (
                <div className="flex items-center gap-2 text-xs font-medium bg-muted/50 px-2.5 py-1 rounded-full border border-border/50 transition-colors">
                  <Check className="size-3.5 text-success" />
                  <span className="text-muted-foreground">Borrador guardado</span>
                </div>
              )}
            </div>

            <CardTitle className="text-lg sm:text-xl font-bold font-heading text-primary">
              Cambio de coordinador
            </CardTitle>

            <CardDescription className="text-xs text-primary-800/80 dark:text-primary-200/80 font-medium">
              Gestiona la sustitución del Coordinador titular o suplente de tu institución mediante el Anexo C.
            </CardDescription>

            <CardDecorativeIcon className="-bottom-10 -right-10 opacity-20 group-hover/card:scale-100 hidden sm:block">
              <ShieldCheck className="size-32 text-primary" />
            </CardDecorativeIcon>
          </Card>

          <Separator className="my-6" />

          {/* 3. VISTA INICIAL (CONTEXTO INSTITUCIONAL + COORDINADORES + TABLA HISTORIAL) */}
          {vista === "INICIAL" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Contexto y Cards de Titular y Suplente */}
              <CoordinadorActualCard
                institucion={institucion}
                onSolicitarCambio={handleIniciarSolicitud}
              />
            </div>
          )}

          {/* 4. VISTA WIZARD CON STEPPER OFICIAL DENTRO DEL CONTENEDOR */}
          {vista === "WIZARD" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stepper oficial UI Kit con línea conectora, badges y navegación */}
              <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 my-6 shadow-xs overflow-x-auto">
                <Stepper
                  steps={stepsList}
                  activeStep={pasoActual - 1}
                  variant="default"
                  stepPrefix="PASO"
                  showBadge={true}
                  onStepClick={(idx) => {
                    if (idx + 1 < pasoActual) {
                      setPasoActual((idx + 1) as 1 | 2 | 3 | 4 | 5);
                    }
                  }}
                />
              </div>

              {/* Contenedor del Paso Actual con Cabecera al Ras */}
              {pasoActual === 1 && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <UserCheck className="size-5 text-primary shrink-0" />
                        <span>Paso 1: Designación del Nuevo Coordinador</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Ingresa los datos personales e institucionales del funcionario a designar como Coordinador {caracterSolicitud === "TITULAR" ? "Titular" : "Suplente"}.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                      PASO 1 DE 5
                    </Badge>
                  </div>

                  <CoordinadorEntranteForm
                    coordinadorActual={
                      caracterSolicitud === "TITULAR" ? institucion.titular : institucion.suplente
                    }
                    caracter={caracterSolicitud}
                    initialData={datosEntrante || undefined}
                    onContinuar={handlePaso1Completado}
                    onCancelar={handleVolverInicial}
                  />
                </div>
              )}

              {pasoActual === 2 && datosEntrante && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <FileText className="size-5 text-primary shrink-0" />
                        <span>Paso 2: Llenar Instrumento Anexo C</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Completa la información formal, administrativa y legal requerida para el instrumento oficial ARP-R03.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                      PASO 2 DE 5
                    </Badge>
                  </div>

                  <AnexoCForm
                    institucion={institucion}
                    caracter={caracterSolicitud}
                    coordinadorSaliente={
                      caracterSolicitud === "TITULAR" ? institucion.titular : institucion.suplente
                    }
                    coordinadorEntrante={datosEntrante}
                    initialData={datosInstrumento || undefined}
                    onContinuar={handlePaso2Completado}
                    onVolver={() => setPasoActual(1)}
                  />
                </div>
              )}

              {pasoActual === 3 && datosEntrante && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <FileCheck2 className="size-5 text-primary shrink-0" />
                        <span>Paso 3: Revisar borrador del Anexo C</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Revisa el documento oficial ARP-R03 generado con los datos de designación antes de pasar a la firma digital.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                      PASO 3 DE 5
                    </Badge>
                  </div>

                  <AnexoCPreview
                    institucion={institucion}
                    caracter={caracterSolicitud}
                    coordinadorSaliente={
                      caracterSolicitud === "TITULAR" ? institucion.titular : institucion.suplente
                    }
                    coordinadorEntrante={datosEntrante}
                    datosInstrumento={datosInstrumento || undefined}
                    firmanteNombre={institucion.representanteLegal}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="neutral"
                      size="default"
                      onClick={() => setPasoActual(2)}
                      className="text-xs font-semibold gap-1.5 w-full sm:w-auto"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Anterior: Llenar Anexo C</span>
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="default"
                      onClick={handlePaso3AvanzarFirma}
                      className="text-xs font-semibold gap-1.5 w-full sm:w-auto sm:min-w-[200px]"
                    >
                      <span>Continuar a firma electrónica</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {pasoActual === 4 && datosEntrante && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="bg-primary/5 dark:bg-primary-950/20 border-b border-border p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-primary dark:text-primary-300 flex items-center gap-2">
                        <ShieldCheck className="size-5 text-primary shrink-0" />
                        <span>Paso 4: Suscripción Digital con FirmaEC</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Identifica la calidad del firmante (Máxima Autoridad o Delegado) y suscribe electrónicamente el Anexo C.
                      </p>
                    </div>
                    <Badge tone="primary" appearance="soft" size="sm" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                      PASO 4 DE 5
                    </Badge>
                  </div>

                  <AnexoCSignature
                    institucion={institucion}
                    caracter={caracterSolicitud}
                    coordinadorSaliente={
                      caracterSolicitud === "TITULAR" ? institucion.titular : institucion.suplente
                    }
                    coordinadorEntrante={datosEntrante}
                    onVolver={() => setPasoActual(3)}
                    onFirmaCompletadaYEnviada={handleFirmaCompletada}
                  />
                </div>
              )}

              {pasoActual === 5 && tramiteGenerado && (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
                  <div className="bg-success/10 border-b border-success/20 p-4 sm:p-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 rounded-t-2xl rounded-b-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold font-heading text-success flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-success shrink-0" />
                        <span>Paso 5: Trámite Enviado a Gestión</span>
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        El Anexo C ha sido suscrito y remitido para la asignación y revisión formal.
                      </p>
                    </div>
                    <Badge tone="success" appearance="soft" size="sm" className="font-mono text-xs font-semibold px-2.5 py-0.5">
                      FINALIZADO
                    </Badge>
                  </div>

                  <CambioCoordinadorResult
                    tramite={tramiteGenerado}
                    onNuevoTramite={handleVolverInicial}
                  />
                </div>
              )}
            </div>
          )}

          {/* 5. VISTA DETALLE DE UN TRÁMITE ESPECÍFICO */}
          {vista === "DETALLE" && tramiteSeleccionado && (
            <div className="animate-in fade-in duration-200">
              <CambioCoordinadorReview
                tramite={tramiteSeleccionado}
                onVolver={handleVolverInicial}
                institucionConfig={institucion}
              />
            </div>
          )}
        </div>
      </main>
    </WireframeDashboardLayout>
  );
}
