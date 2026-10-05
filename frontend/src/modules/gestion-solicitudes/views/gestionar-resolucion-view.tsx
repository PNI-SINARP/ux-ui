"use client";

import React, { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  FileSignature,
  Eye,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle2,
  Info,
  XCircle,
  AlertTriangle,
  Building2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Stepper, type Step as StepperStep } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { useAuthStore } from "@/modules/gestion-solicitudes/data/auth-store";
import {
  useSolicitudesIngresoStore,
  getEstadoBadgeProps,
  type SolicitudIngreso,
} from "@/modules/gestion-solicitudes/data/gestion-ingresos-store";
import { RechazarSolicitudDialog } from "@/components/shared/solicitudes/rechazar-solicitud-dialog";
import { MOCK_USERS_BY_ROLE } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";

interface GestionarResolucionViewProps { id: string; basePath?: string; }

export function GestionarResolucionView({ id, basePath = "/asignacion-solicitudes" }: GestionarResolucionViewProps) {
  const router = useRouter();
  const { activeUser } = useAuthStore();
  const currentUser = activeUser || MOCK_USERS_BY_ROLE.EQ_NORMATIVA;

  const store = useSolicitudesIngresoStore();
  const { solicitudes, isLoaded } = store;

  const solicitud = useMemo(() => {
    return solicitudes.find((s) => s.id === id) || null;
  }, [solicitudes, id]);

  const numResolucionSugerido = useMemo(() => {
    if (!solicitud) return "RES-DINARP-2026-001";
    return (
      solicitud.resolucion ||
      `RES-DINARP-2026-${String(Math.floor(100 + Math.random() * 900))}`
    );
  }, [solicitud]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const stepsList: StepperStep[] = [
    {
      id: "1",
      title: "Información",
      description: "Datos base",
      icon: FileText,
    },
    {
      id: "2",
      title: "Contenido",
      description: "Cuerpo de resolución",
      icon: FileSignature,
    },
    { id: "3", title: "Borrador", description: "Revisión previa", icon: Eye },
    {
      id: "4",
      title: "Generación",
      description: "Emisión formal",
      icon: ShieldCheck,
    },
  ];

  const activeSectionTitle = useMemo(() => {
    if (
      currentUser.role === "DIR_GESTION" ||
      currentUser.role === "DIR_NORMATIVA"
    ) {
      return "Asignación de solicitudes";
    }
    if (currentUser.role === "EQ_NORMATIVA") {
      return "Solicitudes pendientes";
    }
    if (currentUser.role === "EQ_GESTION") {
      return "Solicitudes asignadas";
    }
    return "Gestión de ingresos";
  }, [currentUser.role]);

  if (isLoaded && !solicitud) {
    return (
      <WireframeDashboardLayout
        breadcrumbs={[
          {
            label: activeSectionTitle,
            onClick: () => router.push(basePath),
          },
          { label: "Trámite no encontrado" },
        ]}
      >
        <div className="p-8 text-center">Trámite no encontrado.</div>
      </WireframeDashboardLayout>
    );
  }

  if (!solicitud) {
    return (
      <WireframeDashboardLayout breadcrumbs={[{ label: activeSectionTitle }]}>
        <div className="p-8 text-center text-xs text-muted-foreground">
          Cargando...
        </div>
      </WireframeDashboardLayout>
    );
  }

  const { tone, label } = getEstadoBadgeProps(
    solicitud.estado,
    solicitud.revisionIniciada,
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 text-center space-y-4 shadow-xs animate-in fade-in duration-200">
      <div className="size-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
        <Info className="size-6" />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground">
        {title}
      </h3>
      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning-700 dark:text-warning text-xs font-semibold">
        <Clock className="size-3.5" />
        Contenido pendiente de definición
      </div>
    </div>
  );

  const handleNext = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleConfirmReject = (sol: SolicitudIngreso, motivo: string) => {
    store.rechazarSolicitud(sol.id, motivo, currentUser.name);
    toast.success("Solicitud rechazada correctamente", {
      description: "No se generó la resolución institucional y se notificó el motivo a la entidad.",
    });
    router.push(basePath);
  };

  const handleGenerate = () => {
    store.aprobarNormatividad(
      solicitud.id,
      currentUser.name,
      numResolucionSugerido,
      "Resolución institucional generada mediante flujo por pasos. Remitida a Máxima Autoridad para suscripción digital.",
    );
    toast.success("Resolución institucional generada con éxito", {
      description: `El trámite ${solicitud.id} fue remitido a la Máxima Autoridad para firma digital. Al suscribirse, se activará la institución y se invitará al Coordinador Titular y Suplente.`,
      duration: 6000,
    });
    router.push(`${basePath}/${solicitud.id}`);
  };

  return (
    <WireframeDashboardLayout
      breadcrumbs={[
        {
          label: activeSectionTitle,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            router.push(basePath);
          },
        },
        {
          label: solicitud.id,
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            router.push(`${basePath}/${solicitud.id}`);
          },
        },
        { label: "Gestionar resolución" },
      ]}
    >
      <main className="w-full max-w-[1200px] mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">
        {/* Cabecera contextual */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Button
                type="button"
                variant="neutral"
                size="sm"
                onClick={() => router.push(`${basePath}/${solicitud.id}`)}
                className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-full"
              >
                <ArrowLeft className="size-3.5" />
                <span>Volver al trámite</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRejectOpen(true)}
                className="h-8 px-3 text-xs font-semibold gap-1.5 border-danger/30 text-danger hover:bg-danger/10 rounded-full"
              >
                <XCircle className="size-3.5" />
                <span>Rechazar trámite</span>
              </Button>
            </div>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-foreground">
              Gestionar Resolución Institucional
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configura y emite la resolución para aprobar la solicitud de
              registro.
            </p>
          </div>

          {/* Contexto del trámite minimalista */}
          <div className="p-3.5 bg-surface border border-border rounded-xl shadow-2xs min-w-[280px]">
            <div className="flex justify-between items-start gap-4 mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Contexto del Trámite
              </span>
              <Badge
                tone={tone}
                appearance="soft"
                size="sm"
                dot
                className="font-semibold text-[10px] uppercase"
              >
                {label}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">ID Trámite:</span>
                <span className="font-mono font-bold text-foreground">
                  {solicitud.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Institución:</span>
                <span
                  className="font-semibold text-foreground max-w-[180px] truncate"
                  title={solicitud.institucion}
                >
                  {solicitud.institucion}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xs overflow-x-auto">
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

        {/* Contenido de los Pasos */}
        <div className="space-y-6">
          {step === 1 &&
            renderPlaceholder(
              "Información de la resolución",
              "Los campos de esta sección se configurarán de acuerdo con la plantilla oficial de resolución definida por DINARP.",
            )}

          {step === 2 &&
            renderPlaceholder(
              "Contenido de la resolución",
              "Aquí se definirá el cuerpo del documento jurídico. Los campos específicos se ajustarán a la plantilla oficial de DINARP.",
            )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                      Paso 3 — Revisión Preliminar
                    </span>
                    <h3 className="font-heading font-bold text-lg text-foreground mt-0.5">
                      Borrador de Resolución Institucional DINARP
                    </h3>
                  </div>
                  <Badge tone="warning" appearance="soft" size="sm" className="w-fit">
                    Borrador preliminar
                  </Badge>
                </div>

                {/* Ficha documental previa */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border/80 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Número preliminar:</span>
                      <span className="font-mono font-bold text-foreground">{numResolucionSugerido}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Institución requirente:</span>
                      <span className="font-semibold text-foreground truncate block">{solicitud.institucion}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Responsable normativo:</span>
                      <span className="font-medium text-foreground">{currentUser.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Trámite matriz:</span>
                      <span className="font-mono text-foreground">{solicitud.id}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-2.5">
                    <span className="text-muted-foreground block text-[11px] mb-1">Objeto resolutivo:</span>
                    <p className="text-foreground/90 text-xs italic bg-surface/80 p-3 rounded-lg border border-border/40">
                      &quot;Aprobar el ingreso institucional y habilitar la interoperabilidad de la entidad {solicitud.institucion} en el Sistema Nacional de Registro de Datos Públicos (SINARP).&quot;
                    </p>
                  </div>
                </div>

                {/* Banner informativo de flujo posterior */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-primary">
                    <Info className="size-4 shrink-0" />
                    <span>Flujo del trámite tras la emisión de este borrador:</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                    En el siguiente paso se confirmará la emisión de la resolución oficial. El documento será remitido de forma automática a la <strong>Máxima Autoridad de DINARP</strong> para su <strong>suscripción digital en FirmaEC</strong>. Tras la suscripción:
                  </p>
                  <ul className="list-disc pl-10 text-xs text-muted-foreground space-y-1">
                    <li>Se activará la institución automáticamente en el sistema SINARP.</li>
                    <li>Se emitirán e impartirán las invitaciones de enrolamiento para el <strong>Coordinador Titular</strong> y el <strong>Coordinador Suplente</strong>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="text-center space-y-3 max-w-xl mx-auto">
                  <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/20">
                    <ShieldCheck className="size-7" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-foreground">
                    Confirmar Emisión de Resolución Institucional
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Al confirmar, se formalizará la resolución <strong>{numResolucionSugerido}</strong> vinculándola al trámite de <strong>{solicitud.institucion}</strong>. El sistema iniciará la secuencia operativa hacia la Máxima Autoridad.
                  </p>
                </div>

                {/* Resumen del trámite */}
                <div className="p-4 bg-muted/30 rounded-xl border border-border text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-muted-foreground text-[11px]">Institución a registrar:</span>
                      <span className="font-semibold text-foreground truncate">{solicitud.institucion}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-muted-foreground text-[11px]">Identificador de trámite:</span>
                      <span className="font-mono text-foreground font-bold">{solicitud.id}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-muted-foreground text-[11px]">Resolución a formalizar:</span>
                      <span className="font-mono text-primary font-bold">{numResolucionSugerido}</span>
                    </div>
                    <div className="flex justify-between sm:flex-col sm:justify-start">
                      <span className="text-muted-foreground text-[11px]">Revisor normativo:</span>
                      <span className="font-medium text-foreground">{currentUser.name}</span>
                    </div>
                  </div>
                </div>

                {/* Cadena de acciones posteriores destacada */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                      Cadena de acciones posteriores a la emisión
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                      Automático
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Acción 1 */}
                    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <FileSignature className="size-3.5" />
                        </div>
                        <span>1. Envío a Máxima Autoridad</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        La resolución se remite formalmente a la Máxima Autoridad de DINARP (Director Nacional) para suscripción digital mediante FirmaEC.
                      </p>
                    </div>

                    {/* Acción 2 */}
                    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2 text-success font-semibold text-xs">
                        <div className="size-6 rounded-md bg-success/10 flex items-center justify-center shrink-0 text-success">
                          <Building2 className="size-3.5" />
                        </div>
                        <span>2. Activación institucional</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Al verificarse la firma digital oficial, el sistema activa automáticamente a la institución en la plataforma SINARP.
                      </p>
                    </div>

                    {/* Acción 3 */}
                    <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                      <div className="flex items-center gap-2 text-info font-semibold text-xs">
                        <div className="size-6 rounded-md bg-info/10 flex items-center justify-center shrink-0 text-info">
                          <Users className="size-3.5" />
                        </div>
                        <span>3. Invitación a coordinadores</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Se enviarán invitaciones individuales por correo electrónico al Coordinador Titular ({solicitud.anexoA?.titularNombreCompleto || "Titular"}) y al Coordinador Suplente ({solicitud.anexoA?.suplenteNombreCompleto || "Suplente"}).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banner de trazabilidad */}
                <div className="p-3 bg-muted/40 rounded-xl border border-border/80 flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Esta remisión y las posteriores etapas de firma, activación institucional e invitaciones quedarán asentadas cronológicamente en la <strong>trazabilidad oficial del trámite</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-border mt-8">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={
                step === 1
                  ? () => router.push(`${basePath}/${solicitud.id}`)
                  : handlePrev
              }
              className="w-full sm:w-auto text-xs font-semibold rounded-full"
            >
              {step === 1 ? "Cancelar" : "Atrás"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setIsRejectOpen(true)}
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 border-danger/30 text-danger hover:bg-danger/10 rounded-full"
            >
              <XCircle className="size-4" />
              <span>Rechazar y no emitir resolución</span>
            </Button>
          </div>

          {step < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleNext}
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-2xs rounded-full"
            >
              <span>Siguiente</span>
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={handleGenerate}
              className="w-full sm:w-auto text-xs font-semibold gap-1.5 shadow-2xs rounded-full"
            >
              <CheckCircle2 className="size-4" />
              <span>Confirmar y Generar Resolución</span>
            </Button>
          )}
        </div>

        {/* Modal de confirmación de rechazo con advertencia y campo de motivo */}
        <RechazarSolicitudDialog
          solicitud={solicitud}
          open={isRejectOpen}
          onOpenChange={setIsRejectOpen}
          directConfirm={true}
          title="Confirmar rechazo de la solicitud"
          description="Al confirmar el rechazo, no se generará la resolución institucional y el trámite se dará por concluido como Rechazado."
          warningNotice="Atención: Esta acción cancelará definitivamente el trámite y enviará el motivo registrado a la institución requirente."
          confirmLabel="Confirmar rechazo"
          onConfirm={handleConfirmReject}
        />
      </main>
    </WireframeDashboardLayout>
  );
}
