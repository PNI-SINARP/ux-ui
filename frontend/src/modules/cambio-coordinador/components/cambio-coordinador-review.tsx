"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Send,
  UserCheck,
  UserPlus,
  ArrowLeft,
  KeyRound,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  DocumentoStatusBadge,
  TramiteStatusBadge
} from "./cambio-coordinador-status";
import { CambioCoordinadorTimeline } from "./cambio-coordinador-timeline";
import { AnexoCPreview } from "./anexo-c-preview";
import type {
  TramiteCambioCoordinador,
  InstitucionConfig
} from "../data/cambio-coordinador-store";
import { useCambioCoordinadorStore } from "../data/cambio-coordinador-store";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";

interface CambioCoordinadorReviewProps {
  tramite: TramiteCambioCoordinador;
  onVolver?: () => void;
  institucionConfig?: InstitucionConfig;
}

export function CambioCoordinadorReview({
  tramite: initialTramite,
  onVolver,
  institucionConfig
}: CambioCoordinadorReviewProps) {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const { tramites, asignarRevisor, aprobarCambio, rechazarCambio } = useCambioCoordinadorStore();
  const storeTramite = tramites.find(
    (t) => t.id === initialTramite.id || t.numeroTramite === initialTramite.numeroTramite
  );
  const tramite = storeTramite || initialTramite;

  const userRole = activeUser?.role || "REPRESENTANTE_INSTITUCIONAL";
  const isDirector = userRole === "DIR_GESTION" || userRole === "ADMIN";
  const isRevisor = userRole === "EQ_GESTION" || userRole === "ADMIN";

  // Estados de modales
  const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
  const [modalAprobarOpen, setModalAprobarOpen] = useState(false);
  const [modalRechazarOpen, setModalRechazarOpen] = useState(false);
  const [modalDocPreviewOpen, setModalDocPreviewOpen] = useState(false);

  // Estados de inputs
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [simularCasoAprobacion, setSimularCasoAprobacion] = useState<"AUTO" | "CASO_A" | "CASO_B">("AUTO");

  // Revisor fijo elegible (Ana Torres)
  const revisorElegible = {
    id: "1111111111",
    nombre: "Ana Torres (Revisor)",
    cargo: "Revisor Área de Gestión"
  };

  // Manejador: Director asigna revisor
  const handleConfirmarAsignacion = () => {
    asignarRevisor(tramite.id, revisorElegible);
    setModalAsignarOpen(false);
    toast.success("Revisor asignado correctamente", {
      description: `Trámite ${tramite.numeroTramite} enviado a la bandeja de Ana Torres.`
    });
  };

  // Manejador: Revisor rechaza trámite
  const handleConfirmarRechazo = () => {
    if (!motivoRechazo.trim()) {
      toast.error("Motivo obligatorio", {
        description: "Debes ingresar una justificación para rechazar el cambio de coordinador."
      });
      return;
    }

    rechazarCambio(tramite.id, motivoRechazo.trim());
    setModalRechazarOpen(false);
    toast.error("Cambio de coordinador rechazado", {
      description: "El trámite fue archivado y el Coordinador actual mantiene sus funciones."
    });
  };

  // Manejador: Revisor aprueba trámite (evalúa Caso A o Caso B)
  const handleConfirmarAprobacion = () => {
    aprobarCambio(tramite.id, simularCasoAprobacion);
    setModalAprobarOpen(false);

    const tieneAnexoB =
      simularCasoAprobacion === "CASO_A"
        ? true
        : simularCasoAprobacion === "CASO_B"
        ? false
        : Boolean(tramite.coordinadorEntrante.poseeAnexoBAprobado);

    if (tieneAnexoB) {
      toast.success("Cambio de coordinador aplicado", {
        description: `Se vinculó formalmente a ${tramite.coordinadorEntrante.nombreCompleto} como nuevo Coordinador ${tramite.caracter}.`
      });
    } else {
      toast.warning("Cambio aprobado con enrolamiento pendiente", {
        description: "El nuevo Coordinador no posee Anexo B suscrito; se requiere completar su enrolamiento."
      });
    }
  };

  // Redirección para continuar enrolamiento (Caso B)
  const handleIrAEnrolamiento = () => {
    const params = new URLSearchParams({
      cedula: tramite.coordinadorEntrante.cedula,
      nombres: tramite.coordinadorEntrante.nombreCompleto,
      email: tramite.coordinadorEntrante.correo,
      institucion: tramite.institucion,
      caracter: tramite.caracter,
      origenTramite: tramite.numeroTramite
    });
    router.push(`/enrolamiento-coordinador?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Barra superior de navegación y estados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          {onVolver && (
            <Button
              variant="outline"
              size="sm"
              onClick={onVolver}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver</span>
            </Button>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-h3 font-heading font-semibold text-foreground">
                Cambio de coordinador
              </h2>
              <span className="font-mono text-h4 font-bold text-primary">
                {tramite.numeroTramite}
              </span>
            </div>
            <p className="text-caption text-muted-foreground mt-0.5">
              Solicitud de sustitución institucional mediante instrumento ARP-R03
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DocumentoStatusBadge status={tramite.estadoDocumento} />
          <TramiteStatusBadge status={tramite.estadoTramite} />
        </div>
      </div>

      {/* Banner de alerta según estado del trámite */}
      {tramite.estadoTramite === "Enrolamiento pendiente" && (
        <Alert
          variant="warning"
          icon={<UserPlus className="size-5 text-warning shrink-0" />}
          className="border-warning/30"
        >
          <div className="space-y-2 flex-1">
            <div className="text-body-sm font-semibold text-foreground">
              Sustitución aprobada &bull; Enrolamiento pendiente del nuevo Coordinador (Caso B)
            </div>
            <p className="text-caption text-muted-foreground">
              El cambio de coordinador fue validado legalmente por el Área de Gestión. Sin embargo, el nuevo funcionario (
              {tramite.coordinadorEntrante.nombreCompleto}) aún debe suscribir y registrar su Anexo B para que se le
              habiliten las credenciales y accesos en el SINARP.
            </p>
            <div>
              <Button
                variant="primary"
                size="sm"
                className="gap-2 font-medium"
                onClick={handleIrAEnrolamiento}
              >
                <UserCheck className="h-4 w-4" />
                <span>Continuar enrolamiento del Coordinador</span>
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {tramite.estadoTramite === "Aplicado" && (
        <Alert
          variant="success"
          icon={<CheckCircle2 className="size-5 text-success shrink-0" />}
          className="border-success/30"
        >
          <div className="space-y-1">
            <div className="text-body-sm font-semibold text-success">
              Cambio de coordinador aplicado formalmente (Caso A)
            </div>
            <p className="text-caption text-foreground">
              Se ha retirado el vínculo del Coordinador saliente ({tramite.coordinadorSaliente.nombreCompleto}) y se ha
              habilitado el perfil activo de <strong>{tramite.coordinadorEntrante.nombreCompleto}</strong> con fecha
              efectiva {tramite.fechaEfectiva || tramite.fechaSolicitud}.
            </p>
            {tramite.caracter === "TITULAR" && (
              <div className="text-caption text-primary font-medium flex items-center gap-1.5 pt-1">
                <KeyRound className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Recomendación institucional: Por motivos de ciberseguridad, se sugiere al nuevo Coordinador Titular rotar
                  las credenciales y tokens técnicos de consumo de la entidad.
                </span>
              </div>
            )}
          </div>
        </Alert>
      )}

      {tramite.estadoTramite === "Rechazado" && (
        <Alert
          variant="danger"
          icon={<XCircle className="size-5 text-danger shrink-0" />}
          className="border-danger/30"
        >
          <div className="space-y-1">
            <div className="text-body-sm font-semibold text-danger">
              Trámite de cambio rechazado
            </div>
            <p className="text-caption text-foreground">
              <strong>Motivo de rechazo: </strong>
              {tramite.motivoRechazo || "No cumple con los requisitos normativos o de personería jurídica."}
            </p>
            <p className="text-caption text-muted-foreground">
              El Coordinador actual ({tramite.coordinadorSaliente.nombreCompleto}) conserva su vínculo y facultades sin alteraciones.
            </p>
          </div>
        </Alert>
      )}

      {/* Grid Principal de Datos del Trámite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Información Institucional y Coordinadores (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tarjeta: Contexto Institucional */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="text-body font-semibold text-foreground">
                Institución Solicitante
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
              <div>
                <span className="text-caption text-muted-foreground block">Razón Social:</span>
                <strong className="text-foreground">{tramite.institucion}</strong>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">RUC Institucional:</span>
                <span className="font-mono text-foreground font-semibold">{tramite.ruc}</span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Estado Institucional:</span>
                <span className="text-success font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Institución activa
                </span>
              </div>
              <div>
                <span className="text-caption text-muted-foreground block">Carácter del cambio:</span>
                <Badge tone="primary" appearance="soft" size="sm" className="font-medium">
                  Coordinador {tramite.caracter === "TITULAR" ? "Titular" : "Suplente"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Comparativa: Saliente vs Entrante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coordinador Saliente */}
            <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
                  Coordinador Saliente
                </span>
                <Badge tone="neutral" appearance="soft" size="sm">
                  {tramite.caracter === "TITULAR" ? "Titular" : "Suplente"}
                </Badge>
              </div>

              <div>
                <h4 className="text-body font-semibold text-foreground">
                  {tramite.coordinadorSaliente.nombreCompleto}
                </h4>
                <p className="text-caption text-muted-foreground">
                  {tramite.coordinadorSaliente.cargo}
                </p>
              </div>

              <div className="pt-2 border-t border-border space-y-1.5 text-caption">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cédula:</span>
                  <span className="font-mono text-foreground">{tramite.coordinadorSaliente.cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correo:</span>
                  <span className="text-foreground truncate max-w-[170px]" title={tramite.coordinadorSaliente.correo}>
                    {tramite.coordinadorSaliente.correo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vínculo:</span>
                  <span className="text-muted-foreground font-medium">Desvinculación solicitada</span>
                </div>
              </div>
            </div>

            {/* Coordinador Entrante */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-primary/20">
                <span className="text-caption font-semibold uppercase tracking-wider text-primary">
                  Coordinador Entrante
                </span>
                <Badge tone="primary" appearance="soft" size="sm">
                  Designado
                </Badge>
              </div>

              <div>
                <h4 className="text-body font-semibold text-foreground">
                  {tramite.coordinadorEntrante.nombreCompleto}
                </h4>
                <p className="text-caption text-muted-foreground">
                  {tramite.coordinadorEntrante.cargo}
                </p>
              </div>

              <div className="pt-2 border-t border-primary/20 space-y-1.5 text-caption">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cédula:</span>
                  <span className="font-mono font-semibold text-foreground">{tramite.coordinadorEntrante.cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correo:</span>
                  <span className="text-foreground truncate max-w-[170px]" title={tramite.coordinadorEntrante.correo}>
                    {tramite.coordinadorEntrante.correo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Motivo:</span>
                  <span className="text-foreground italic truncate max-w-[170px]" title={tramite.coordinadorEntrante.motivo}>
                    {tramite.coordinadorEntrante.motivo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documentos del Trámite: Anexo C y Autorización */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-body font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Instrumentos y Documentos Digitales</span>
            </h3>

            <div className="space-y-3">
              {/* Documento Principal: Anexo C */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm font-semibold text-foreground">
                        Formulario Oficial ARP-R03 — Anexo C
                      </span>
                      <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-mono text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> Firmado
                      </Badge>
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Suscrito digitalmente por {tramite.firmaEC.firmante || "Autoridad Institucional"} &bull;{" "}
                      {tramite.fechaSolicitud}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 shrink-0 hover:bg-primary/5 hover:text-primary"
                  onClick={() => setModalDocPreviewOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Ver documento firmado</span>
                </Button>
              </div>

              {/* Documento de Autorización si firmó Delegado */}
              {tramite.firmanteTipo === "DELEGADO_AUTORIZADO" && (
                <div className="p-3.5 rounded-xl border border-warning/30 bg-warning/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-body-sm font-semibold text-foreground">
                          Autorización o Delegación Formal
                        </span>
                        <Badge tone="warning" appearance="soft" size="sm" className="text-[10px]">
                          Delegado
                        </Badge>
                      </div>
                      <p className="text-caption text-muted-foreground">
                        {tramite.autorizacionDelegado?.archivoNombre || "Acuerdo_Delegacion_Autorizada.pdf"} (
                        {tramite.autorizacionDelegado?.archivoTamano || "450 KB"})
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() =>
                      toast.info("Visualizando delegación", {
                        description: "Documento oficial de facultades de representación."
                      })
                    }
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Ver autorización</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Validación FirmaEC */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-body font-semibold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-success" />
                <span>Validación Criptográfica FirmaEC</span>
              </h3>
              <Badge tone="success" appearance="soft" size="sm" className="gap-1 font-medium border border-success/20">
                <CheckCircle2 className="h-3 w-3 text-success" />
                <span>Certificado Válido</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption">
              <div>
                <span className="text-muted-foreground block">ID de Transacción:</span>
                <span className="font-mono text-foreground font-semibold">
                  {tramite.firmaEC.transaccionId || "FEC-2026-90412"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Firmante Digital:</span>
                <span className="text-foreground font-medium">{tramite.firmaEC.firmante}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Entidad de Certificación:</span>
                <span className="text-foreground">{tramite.firmaEC.entidadCertificadora || "Banco Central del Ecuador"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Fecha de Estampado:</span>
                <span className="text-foreground">{tramite.firmaEC.fechaFirma || tramite.fechaSolicitud}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block">Huella Digital SHA-256:</span>
                <span className="font-mono text-[11px] text-muted-foreground break-all">
                  {tramite.firmaEC.huellaSha256 || "8f4b23a9d18e5472bc19448a0fd329c4ba598e12d5e381023d8c1109a1bf04e1"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Trazabilidad y Acciones por Rol (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Panel de Acciones Operativas (Director / Revisor) */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="text-body font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Acciones del Proceso</span>
            </h3>

            {/* CASO DIRECTOR DE GESTIÓN: Solo asigna revisor (Req. 12) */}
            {isDirector && (
              <div className="space-y-3">
                <p className="text-caption text-muted-foreground">
                  Como Director de Gestión, asigna este expediente a un analista o revisor para su análisis legal.
                </p>

                {tramite.estadoTramite === "Pendiente de asignación" || tramite.estadoTramite === "Enviado a Gestión" ? (
                  <Button
                    variant="primary"
                    className="w-full gap-2 shadow-xs"
                    onClick={() => setModalAsignarOpen(true)}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Asignar revisor</span>
                  </Button>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/30 border border-border text-caption space-y-1">
                    <span className="text-muted-foreground block">Revisor asignado actualmente:</span>
                    <strong className="text-foreground block">{tramite.revisorAsignado?.nombre || "Ana Torres (Revisor)"}</strong>
                    <span className="text-muted-foreground text-[11px]">
                      Asignado el {tramite.revisorAsignado?.fechaAsignacion || tramite.fechaSolicitud}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CASO REVISOR DE GESTIÓN: Aprobar o Rechazar (Req. 14, 15, 16, 17) */}
            {isRevisor && (
              <div className="space-y-3 pt-1">
                <p className="text-caption text-muted-foreground">
                  Como Revisor legal, evalúa la pertinencia normativa del Anexo C, delegaciones y firmas.
                </p>

                {tramite.estadoTramite === "En revisión" || tramite.estadoTramite === "Pendiente de asignación" ? (
                  <div className="flex flex-col gap-2.5">
                    <Button
                      variant="primary"
                      className="w-full gap-2 shadow-xs bg-success hover:bg-success/90 text-white"
                      onClick={() => setModalAprobarOpen(true)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Aprobar cambio</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full gap-2 border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/60"
                      onClick={() => setModalRechazarOpen(true)}
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Rechazar</span>
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-caption text-muted-foreground text-center">
                    Trámite en estado final: <strong>{tramite.estadoTramite}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Alerta de no-eliminación de accesos */}
            <div className="pt-3 border-t border-border text-[11px] text-muted-foreground">
              La aprobación de este trámite sustituye la titularidad de los accesos institucionales pero preserva
              contratos y cupos sin interrupción.
            </div>
          </div>

          {/* Trazabilidad del Trámite */}
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-body font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Trazabilidad</span>
              </h3>
              <Badge tone="neutral" appearance="soft" size="sm">
                {tramite.trazabilidad?.length || 0} eventos
              </Badge>
            </div>

            <CambioCoordinadorTimeline eventos={tramite.trazabilidad || []} />
          </div>
        </div>
      </div>

      {/* DIALOG 1: DIRECTOR ASIGNA REVISOR (Req. 12) */}
      <Dialog open={modalAsignarOpen} onOpenChange={setModalAsignarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <span>Asignar revisión</span>
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground mt-1">
              Selecciona el funcionario del Área de Gestión para revisar el Anexo C del trámite {tramite.numeroTramite}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-body font-semibold text-foreground">
                  {revisorElegible.nombre}
                </strong>
                <Badge tone="primary" appearance="soft" size="sm">
                  EQ_GESTION
                </Badge>
              </div>
              <p className="text-caption text-muted-foreground">
                {revisorElegible.cargo} &bull; Cédula: <span className="font-mono">{revisorElegible.id}</span>
              </p>
              <p className="text-caption text-foreground pt-1">
                Este trámite será enviado a la bandeja de solicitudes pendientes del revisor.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalAsignarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmarAsignacion}>
              Confirmar asignación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: REVISOR RECHAZA CAMBIO (Req. 15) */}
      <Dialog open={modalRechazarOpen} onOpenChange={setModalRechazarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading font-semibold text-danger flex items-center gap-2">
              <XCircle className="h-5 w-5 text-danger" />
              <span>Rechazar cambio de coordinador</span>
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground mt-1">
              Indica la razón formal por la cual se rechaza el Anexo C de la institución.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="space-y-1.5">
              <Label htmlFor="motivo-rechazo" className="text-body-sm font-semibold">
                Motivo del rechazo <span className="text-danger">*</span>
              </Label>
              <Textarea
                id="motivo-rechazo"
                rows={3}
                placeholder="Ej. El poder de delegación adjunto se encuentra caducado o no especifica facultades expresas..."
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
              />
            </div>

            <Alert
              variant="warning"
              icon={<AlertTriangle className="size-4 text-warning shrink-0" />}
              className="border-warning/30"
            >
              <div className="text-caption text-foreground">
                <strong>Advertencia: </strong>
                El cambio no será aplicado y el Coordinador actual conservará su vínculo institucional.
              </div>
            </Alert>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalRechazarOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="bg-danger hover:bg-danger/90 text-white"
              onClick={handleConfirmarRechazo}
            >
              Rechazar cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: REVISOR APRUEBA CAMBIO (Req. 16, 17 - Caso A / B) */}
      <Dialog open={modalAprobarOpen} onOpenChange={setModalAprobarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span>Aprobar cambio de coordinador</span>
            </DialogTitle>
            <DialogDescription className="text-body-sm text-muted-foreground mt-1">
              Confirma la aprobación formal del instrumento ARP-R03 para {tramite.institucion}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <p className="text-body-sm text-foreground">
              Al confirmar la aprobación, el sistema evaluará si el nuevo funcionario posee Anexo B suscrito para esta institución.
            </p>

            {/* Selector de simulación para pruebas QA de Caso A vs Caso B */}
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
              <Label className="text-caption font-semibold text-muted-foreground uppercase tracking-wider block">
                Evaluación Anexo B (Regla CAM-03)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSimularCasoAprobacion("CASO_A")}
                  className={`p-2.5 rounded text-left border text-caption transition-all ${
                    simularCasoAprobacion === "CASO_A"
                      ? "bg-success/10 border-success text-foreground font-semibold"
                      : "bg-surface border-border hover:bg-muted/30"
                  }`}
                >
                  <strong className="block text-success">Caso A (Posee Anexo B)</strong>
                  <span>Cambio inmediato a "Aplicado"</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimularCasoAprobacion("CASO_B")}
                  className={`p-2.5 rounded text-left border text-caption transition-all ${
                    simularCasoAprobacion === "CASO_B"
                      ? "bg-warning/10 border-warning text-foreground font-semibold"
                      : "bg-surface border-border hover:bg-muted/30"
                  }`}
                >
                  <strong className="block text-warning">Caso B (Sin Anexo B)</strong>
                  <span>Pasa a "Enrolamiento pendiente"</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded border border-primary/20 text-caption text-foreground">
              <strong>Garantía operativa: </strong>
              Los proyectos, solicitudes, contratos, cupos y credenciales de la institución se conservarán intactos.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setModalAprobarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="bg-success hover:bg-success/90 text-white" onClick={handleConfirmarAprobacion}>
              Confirmar aprobación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Vista Previa Oficial del Anexo C */}
      <Dialog open={modalDocPreviewOpen} onOpenChange={setModalDocPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Instrumento ARP-R03 Oficial</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 bg-surface rounded border border-border text-body-sm space-y-4">
            <div className="text-center border-b pb-3 space-y-1">
              <h3 className="font-heading font-bold text-foreground">
                DIRECCIÓN NACIONAL DE REGISTROS PÚBLICOS
              </h3>
              <p className="text-caption text-muted-foreground uppercase font-mono">
                FORMULARIO ANEXO C — CAMBIO DE COORDINADOR INSTITUCIONAL (ARP-R03)
              </p>
            </div>

            <div className="space-y-2 text-justify text-muted-foreground text-caption">
              <p>
                <strong>Entidad: </strong> {tramite.institucion} &bull; <strong>RUC: </strong> {tramite.ruc}
              </p>
              <p>
                <strong>Coordinador Saliente: </strong> {tramite.coordinadorSaliente.nombreCompleto} ({tramite.caracter}) &bull;
                C.I.: {tramite.coordinadorSaliente.cedula}
              </p>
              <p>
                <strong>Coordinador Entrante: </strong> {tramite.coordinadorEntrante.nombreCompleto} &bull; C.I.:{" "}
                {tramite.coordinadorEntrante.cedula} &bull; Cargo: {tramite.coordinadorEntrante.cargo}
              </p>
              <p>
                <strong>Motivo del cambio: </strong> {tramite.coordinadorEntrante.motivo}
              </p>
            </div>

            <div className="p-3 bg-muted/20 rounded border border-border text-caption">
              <strong>Firma Electrónica: </strong> {tramite.firmaEC.firmante} &bull; Transacción FirmaEC:{" "}
              <span className="font-mono">{tramite.firmaEC.transaccionId}</span> &bull; {tramite.firmaEC.fechaFirma}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalDocPreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
