"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Database,
  Building2,
  Check,
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
  Send,
  AlertTriangle,
  RotateCcw,
  ListChecks,
  Scale,
  User,
  Unlock,
  Info,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";
import { Search as SearchInput } from "@/components/ui/search";
import { Stepper, Step } from "@/components/ui/stepper";
import { WireframeDashboardLayout } from "@/components/layout/wireframes/wireframe-dashboard-layout";
import { INITIAL_INSTITUCIONES } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { WireframeTour, TourStep } from "@/components/layout/wireframes/wireframe-tour";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSolicitudesStore } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

export function AccesoSolicitudNuevaView() {
  const router = useRouter();
  const { crearNuevaSolicitud } = useSolicitudesStore();
  const [step, setStep] = useState(1);
  const [isModalConfirmacionOpen, setIsModalConfirmacionOpen] = useState(false);

  // Step 1 State
  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState("ALL");
  const [clasificacionFilter, setClasificacionFilter] = useState("ALL");
  const [expandedInstituciones, setExpandedInstituciones] = useState<Record<string, boolean>>({});
  const [expandedFuentes, setExpandedFuentes] = useState<Record<string, boolean>>({});
  const [selectedCampos, setSelectedCampos] = useState<Record<string, boolean>>({});

  // Step 2 State
  const [justificaciones, setJustificaciones] = useState<Record<string, { finalidad: string; fundamento: string }>>({});
  const [expandedCamposJustificacion, setExpandedCamposJustificacion] = useState<Record<string, boolean>>({});

  const toggleInstitucion = (id: string) => setExpandedInstituciones(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFuente = (id: string) => setExpandedFuentes(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleCampoJustificacion = (id: string) => {
    setExpandedCamposJustificacion(prev => ({
      ...prev,
      [id]: !(prev[id] ?? true)
    }));
  };
  const expandAllJustificaciones = () => {
    const next: Record<string, boolean> = {};
    selectedCamposDetails.forEach(c => { next[c.campo.id] = true; });
    setExpandedCamposJustificacion(next);
  };
  const collapseAllJustificaciones = () => {
    const next: Record<string, boolean> = {};
    selectedCamposDetails.forEach(c => { next[c.campo.id] = false; });
    setExpandedCamposJustificacion(next);
  };

  const institucionesPublicadas = useMemo(() => {
    return INITIAL_INSTITUCIONES.map(inst => ({
      ...inst,
      fuentes: inst.fuentes.filter(f => f.estado === "PUBLICADO")
    })).filter(inst => inst.fuentes.length > 0);
  }, []);

  const institucionOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Todas las instituciones" },
      ...institucionesPublicadas.map(inst => ({
        value: inst.id,
        label: inst.sigla ? `${inst.sigla} - ${inst.nombre}` : inst.nombre
      }))
    ];
  }, [institucionesPublicadas]);

  const clasificacionOptions = useMemo(() => [
    { value: "ALL", label: "Todas las clasificaciones" },
    { value: "Accesible", label: "Accesible" },
    { value: "Confidencial", label: "Confidencial" }
  ], []);

  const filteredInstituciones = useMemo(() => {
    return institucionesPublicadas
      .filter(inst => {
        if (institucionFilter !== "ALL" && inst.id !== institucionFilter) {
          return false;
        }
        return true;
      })
      .map(inst => {
        const matchingFuentes = inst.fuentes
          .map(fuente => {
            const matchingCampos = fuente.campos.filter(campo => {
              if (clasificacionFilter !== "ALL" && campo.clasificacion !== clasificacionFilter) {
                return false;
              }
              if (!searchTerm) return true;
              const term = searchTerm.toLowerCase();
              return (
                campo.nombre.toLowerCase().includes(term) ||
                campo.descripcion.toLowerCase().includes(term) ||
                fuente.nombre.toLowerCase().includes(term) ||
                inst.nombre.toLowerCase().includes(term)
              );
            });

            return {
              ...fuente,
              campos: matchingCampos
            };
          })
          .filter(fuente => {
            if (fuente.campos.length > 0) return true;
            if (!searchTerm && clasificacionFilter === "ALL") return true;
            return false;
          });

        return {
          ...inst,
          fuentes: matchingFuentes
        };
      })
      .filter(inst => inst.fuentes.length > 0);
  }, [institucionesPublicadas, institucionFilter, clasificacionFilter, searchTerm]);

  const [restrictionAlert, setRestrictionAlert] = useState<{
    fuenteActual: string;
    fuenteIntentada: string;
  } | null>(null);

  const selectedCamposDetails = useMemo(() => {
    const details: any[] = [];
    institucionesPublicadas.forEach(inst => {
      inst.fuentes.forEach(servicio => {
        servicio.campos.forEach(campo => {
          if (selectedCampos[campo.id]) {
            details.push({
              fuenteId: inst.id,
              fuenteNombre: inst.nombre,
              servicioId: servicio.id,
              servicioNombre: servicio.nombre,
              campo
            });
          }
        });
      });
    });
    return details;
  }, [selectedCampos, institucionesPublicadas]);

  const activeFuente = useMemo(() => {
    if (selectedCamposDetails.length === 0) return null;
    return {
      id: selectedCamposDetails[0].fuenteId,
      nombre: selectedCamposDetails[0].fuenteNombre,
    };
  }, [selectedCamposDetails]);

  const selectedCamposByServicio = useMemo(() => {
    const map = new Map<string, { servicioNombre: string; items: typeof selectedCamposDetails }>();
    selectedCamposDetails.forEach(item => {
      if (!map.has(item.servicioId)) {
        map.set(item.servicioId, {
          servicioNombre: item.servicioNombre,
          items: []
        });
      }
      map.get(item.servicioId)!.items.push(item);
    });
    return Array.from(map.entries()).map(([servicioId, data]) => ({
      servicioId,
      servicioNombre: data.servicioNombre,
      items: data.items
    }));
  }, [selectedCamposDetails]);

  const handleSelectCampo = (
    campoId: string,
    isSelected: boolean,
    fuenteId?: string,
    fuenteNombre?: string
  ) => {
    if (isSelected && activeFuente && fuenteId && activeFuente.id !== fuenteId) {
      setRestrictionAlert({
        fuenteActual: activeFuente.nombre,
        fuenteIntentada: fuenteNombre || "otra fuente",
      });
      toast.warning("Para esta solicitud solo puedes seleccionar campos pertenecientes a una misma fuente.", {
        description: `Fuente seleccionada: "${activeFuente.nombre}". No se permite combinar campos de múltiples fuentes en una sola solicitud.`,
        duration: 5000,
      });
      return;
    }

    if (isSelected && restrictionAlert) {
      setRestrictionAlert(null);
    }

    setSelectedCampos(prev => {
      const next = { ...prev, [campoId]: isSelected };
      if (!isSelected) {
        delete next[campoId];
      }
      return next;
    });
  };

  const selectedCount = Object.values(selectedCampos).filter(Boolean).length;

  const isStep2Valid = selectedCamposDetails.every(c => {
    const j = justificaciones[c.campo.id];
    if (!j) return false;
    if (!j.finalidad) return false;
    if (c.campo.clasificacion === "Confidencial" && !j.fundamento) return false;
    return true;
  });

  const nextStep = () => setStep(prev => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev));

  const [tourOpen, setTourOpen] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("onboarding_nueva_visto")) {
      setTourOpen(true);
      localStorage.setItem("onboarding_nueva_visto", "true");
    }
  }, []);

  const tourSteps: TourStep[] = [
    {
      id: "step1",
      target: "#stepper-container",
      title: "Progreso de solicitud",
      description: "Esta solicitud se completa paso a paso. Puedes revisar tu progreso antes de enviarla."
    },
    {
      id: "step2",
      target: "#datos-documentos",
      title: "Filtros y búsqueda",
      description: "Filtre por búsqueda general, institución proveedora o clasificación para encontrar campos rápidamente.",
      onBeforeStep: () => setStep(1)
    },
    {
      id: "step3",
      target: "#seleccion-info",
      title: "Selección de información",
      description: "Explore las instituciones fuente y seleccione los campos deseados.",
      onBeforeStep: () => setStep(1)
    },
    {
      id: "step4",
      target: "#justificacion-step",
      title: "Justificación de campos",
      description: "Cada campo seleccionado debe quedar asociado a una finalidad de uso. Los campos confidenciales requieren justificación jurídica.",
      onBeforeStep: () => setStep(2)
    },
    {
      id: "step5",
      target: "#resumen-step",
      title: "Revisar y enviar",
      description: "Antes de enviar, verifique el resumen de información de la solicitud.",
      onBeforeStep: () => setStep(3)
    },
    {
      id: "step6",
      target: "#btn-enviar-solicitud",
      title: "Enviar solicitud",
      description: "Al enviar, la solicitud pasa a validación y podrás consultar todo su avance desde Gestión de solicitudes.",
      onBeforeStep: () => setStep(3)
    }
  ];

  const stepperSteps: Step[] = [
    { id: "1", title: "Seleccionar información", icon: Database },
    { id: "2", title: "Justificar campos", icon: FileText },
    { id: "3", title: "Revisar y enviar", icon: Send },
  ];

  return (
    <TooltipProvider>
      <WireframeDashboardLayout
        activeMenu="acceso-interoperabilidad"
        breadcrumbs={[
          { label: "Gestión de solicitudes", href: "/acceso-interoperabilidad/solicitudes" },
          { label: "Nueva Solicitud" }
        ]}
        headerSlot={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setTourOpen(true); setCurrentTourStep(0); }}
            className="h-8 px-2 text-xs"
          >
            Ver guía
          </Button>
        }
      >
        <WireframeTour
          isOpen={tourOpen}
          onClose={() => setTourOpen(false)}
          steps={tourSteps}
          currentStep={currentTourStep}
          onStepChange={setCurrentTourStep}
        />

        <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Contenedor principal */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
            {/* Volver a gestión de solicitudes */}
            <div>
              <Link
                href="/acceso-interoperabilidad/solicitudes"
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Volver a gestión de solicitudes</span>
              </Link>
            </div>

            {/* Cabecera */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Nueva solicitud de acceso a interoperabilidad
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Seleccione los campos requeridos. Los campos accesibles requieren solo finalidad de uso; los campos confidenciales requieren finalidad de uso y justificación jurídica.
              </p>
            </div>

            {/* Stepper del UI kit */}
            <div id="stepper-container" className="pt-2 pb-4 border-b border-border">
              <Stepper
                steps={stepperSteps}
                activeStep={step - 1}
                onStepClick={(index) => setStep(index + 1)}
                size="sm"
              />
            </div>

            {/* PASO 1: SELECCIONAR INFORMACIÓN */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                {/* 3 Filtros horizontales sin contenedor, separados por línea */}
                <div className="pb-6 border-b border-border" id="datos-documentos">
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 items-end">
                      <div className="sm:col-span-12 lg:col-span-5 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Búsqueda general</label>
                        <SearchInput
                          placeholder="Buscar por institución, fuente o campo..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          onClear={() => setSearchTerm("")}
                          className="w-full h-10 bg-background rounded-full border-border/80"
                        />
                      </div>

                      <div className="sm:col-span-6 lg:col-span-4 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Institución proveedora</label>
                        <Combobox
                          items={institucionOptions}
                          value={institucionOptions.find(opt => opt.value === institucionFilter) || institucionOptions[0]}
                          onValueChange={(val: any) => {
                            if (val) {
                              const selected = typeof val === "string" ? val : val.value;
                              setInstitucionFilter(selected);
                            }
                          }}
                        >
                          <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                            <span className="truncate">
                              {institucionOptions.find(opt => opt.value === institucionFilter)?.label || "Todas las instituciones"}
                            </span>
                          </ComboboxSelectTrigger>
                          <ComboboxContent align="start" className="w-80 max-w-[90vw]">
                            <ComboboxList>
                              {institucionOptions.map((opt) => (
                                <ComboboxItem key={opt.value} value={opt} className="text-xs">
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>

                      <div className="sm:col-span-6 lg:col-span-3 space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Clasificación del campo</label>
                        <Combobox
                          items={clasificacionOptions}
                          value={clasificacionOptions.find(opt => opt.value === clasificacionFilter) || clasificacionOptions[0]}
                          onValueChange={(val: any) => {
                            if (val) {
                              const selected = typeof val === "string" ? val : val.value;
                              setClasificacionFilter(selected);
                            }
                          }}
                        >
                          <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                            <span className="truncate">
                              {clasificacionOptions.find(opt => opt.value === clasificacionFilter)?.label || "Todas las clasificaciones"}
                            </span>
                          </ComboboxSelectTrigger>
                          <ComboboxContent align="end" className="w-56">
                            <ComboboxList>
                              {clasificacionOptions.map((opt) => (
                                <ComboboxItem key={opt.value} value={opt} className="text-xs">
                                  {opt.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </div>

                    {/* Badges de Filtros Activos (UI Kit pattern igual a Consulta) */}
                    {(searchTerm || institucionFilter !== "ALL" || clasificacionFilter !== "ALL") && (
                      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60 w-full">
                        <span className="text-[12px] font-semibold text-muted-foreground mr-1">Filtros activos:</span>

                        {searchTerm && (
                          <Badge
                            tone="neutral"
                            appearance="soft"
                            className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                          >
                            <span>Búsqueda: <strong className="font-semibold text-foreground">&ldquo;{searchTerm}&rdquo;</strong></span>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => setSearchTerm("")}
                              className="h-auto p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              aria-label="Eliminar filtro de búsqueda"
                            >
                              <X className="size-3" />
                            </Button>
                          </Badge>
                        )}

                        {institucionFilter !== "ALL" && (
                          <Badge
                            tone="neutral"
                            appearance="soft"
                            className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                          >
                            <span className="flex items-center gap-1">
                              <Building2 className="size-3 text-muted-foreground" />
                              Institución: <strong className="font-semibold text-foreground">{institucionOptions.find((i) => i.value === institucionFilter)?.label || institucionFilter}</strong>
                            </span>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => setInstitucionFilter("ALL")}
                              className="h-auto p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              aria-label="Eliminar filtro de institución"
                            >
                              <X className="size-3" />
                            </Button>
                          </Badge>
                        )}

                        {clasificacionFilter !== "ALL" && (
                          <Badge
                            tone="neutral"
                            appearance="soft"
                            className="pl-2.5 pr-1 py-0.5 rounded-full text-[11px] h-7 gap-1.5 font-medium bg-muted text-foreground border border-border"
                          >
                            <span className="flex items-center gap-1">
                              {clasificacionFilter === "Accesible" ? <Check className="size-3 text-muted-foreground" /> : <Lock className="size-3 text-muted-foreground" />}
                              Clasificación: <strong className="font-semibold text-foreground">{clasificacionFilter}</strong>
                            </span>
                            <Button
                              variant="ghost"
                              type="button"
                              onClick={() => setClasificacionFilter("ALL")}
                              className="h-auto p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              aria-label="Eliminar filtro de clasificación"
                            >
                              <X className="size-3" />
                            </Button>
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchTerm("");
                            setInstitucionFilter("ALL");
                            setClasificacionFilter("ALL");
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground h-7 px-2.5 ml-auto"
                        >
                          Limpiar filtros
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Alerta / Mensaje contextual de restricción de fuente única */}
                {!restrictionAlert && (
                  <Alert
                    variant="info"
                    icon={<Info className="size-4" />}
                    className="py-3 px-4 border border-border/70 rounded-xl"
                  >
                    <div className="text-xs sm:text-sm text-foreground leading-relaxed">
                      Para esta solicitud solo puedes seleccionar campos pertenecientes a una misma fuente.
                      {activeFuente && (
                        <span className="text-muted-foreground ml-1.5">
                          (Fuente activa: <strong className="text-foreground font-semibold">&ldquo;{activeFuente.nombre}&rdquo;</strong>)
                        </span>
                      )}
                    </div>
                  </Alert>
                )}

                {/* Alerta de restricción si se intenta seleccionar de otra fuente */}
                {restrictionAlert && (
                  <Alert
                    variant="warning"
                    icon={<AlertTriangle className="size-4" />}
                    title="Para esta solicitud solo puedes seleccionar campos pertenecientes a una misma fuente."
                    onClose={() => setRestrictionAlert(null)}
                    className="animate-in fade-in-0 duration-200"
                  >
                    <div className="flex flex-col gap-2 pt-0.5">
                      <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
                        Actualmente tu solicitud contiene campos de <strong className="font-semibold text-foreground">&ldquo;{restrictionAlert.fuenteActual}&rdquo;</strong>.
                        Para consultar campos de <strong className="font-semibold text-foreground">&ldquo;{restrictionAlert.fuenteIntentada}&rdquo;</strong>, debes tramitarlos en una solicitud independiente o reiniciar tu selección.
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCampos({});
                            setRestrictionAlert(null);
                            toast.info("Selección reiniciada", {
                              description: "Ahora puede seleccionar campos de cualquier otra fuente.",
                            });
                          }}
                          className="text-xs h-7 px-2.5 gap-1.5 border-warning/40 hover:bg-warning/10"
                        >
                          <RotateCcw className="size-3" />
                          <span>Cambiar de fuente (limpiar selección actual)</span>
                        </Button>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Listado de instituciones y fuentes */}
                <div className="flex flex-col gap-4" id="seleccion-info">
                  {filteredInstituciones.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                      No se encontraron campos o instituciones con los filtros aplicados.
                    </div>
                  ) : (
                    filteredInstituciones.map(institucion => {
                      const isInstExpanded = expandedInstituciones[institucion.id] ?? true;
                      const isCurrentActiveFuente = activeFuente?.id === institucion.id;
                      const isDifferentFromActive = activeFuente && !isCurrentActiveFuente;
                      const selectedInInst = selectedCamposDetails.filter(d => d.fuenteId === institucion.id).length;

                      return (
                        <div key={institucion.id} className="border border-border rounded-xl bg-card overflow-hidden">
                          <div
                            onClick={() => toggleInstitucion(institucion.id)}
                            className="p-4 bg-muted/20 hover:bg-muted/40 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Building2 className="size-5 text-muted-foreground shrink-0" />
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="font-bold text-foreground text-sm sm:text-base">{institucion.nombre}</h2>
                                {isCurrentActiveFuente && (
                                  <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 border-primary/30 text-primary bg-primary/10 text-[10px]">
                                    <Check className="size-2.5" /> Fuente en uso
                                  </Badge>
                                )}
                                {isDifferentFromActive && (
                                  <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-muted-foreground border-dashed text-[10px]">
                                    <Lock className="size-2.5 text-muted-foreground" /> Solicitud independiente requerida
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronDown className={`size-5 transition-transform ${isInstExpanded ? "rotate-180" : ""}`} />
                          </div>

                          {isInstExpanded && (
                            <div className="p-4 flex flex-col gap-4 border-t border-border">
                              {institucion.fuentes.map(servicio => {
                                const isServicioExpanded = expandedFuentes[servicio.id] ?? false;
                                const selectedInServicio = selectedCamposDetails.filter(d => d.servicioId === servicio.id).length;

                                return (
                                  <div
                                    key={servicio.id}
                                    className={`border rounded-lg p-4 transition-all ${
                                      selectedInServicio > 0
                                        ? "border-primary/50 bg-primary/5"
                                        : isDifferentFromActive
                                        ? "border-border/60 bg-surface/60 opacity-80"
                                        : "border-border/80 bg-surface"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Fuente
                                          </Badge>
                                          <h3 className="font-bold text-sm text-foreground">{servicio.nombre}</h3>
                                          {selectedInServicio > 0 && (
                                            <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 text-[10px] text-primary bg-primary/10 border-primary/20">
                                              <Check className="size-2.5" /> {selectedInServicio} campo(s) seleccionado(s)
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">{servicio.descripcion}</p>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleFuente(servicio.id)}
                                      >
                                        {isServicioExpanded ? "Ocultar campos" : "Ver campos"}
                                      </Button>
                                    </div>

                                    {isServicioExpanded && (
                                      <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                        {servicio.campos.map(campo => {
                                          const isSelected = !!selectedCampos[campo.id];
                                          const isBlocked = isDifferentFromActive;

                                          return (
                                            <div
                                              key={campo.id}
                                              onClick={() => {
                                                handleSelectCampo(campo.id, !isSelected, institucion.id, institucion.nombre);
                                              }}
                                              className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                                                isSelected
                                                  ? "bg-primary/5 border-primary/40 shadow-2xs"
                                                  : isBlocked
                                                  ? "bg-muted/10 border-border/40 opacity-70 hover:border-warning/50 hover:bg-warning/5"
                                                  : "bg-muted/20 hover:bg-muted/40 border-border/50"
                                              }`}
                                            >
                                              <div className="pt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                  checked={isSelected}
                                                  variant="primary"
                                                  size="md"
                                                  onCheckedChange={(checked) => {
                                                    handleSelectCampo(campo.id, !!checked, institucion.id, institucion.nombre);
                                                  }}
                                                />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                  <span className="font-medium text-sm text-foreground">{campo.nombre}</span>
                                                  {campo.clasificacion === "Accesible" ? (
                                                    <Badge
                                                      tone="neutral"
                                                      appearance="soft"
                                                      size="sm"
                                                      className="text-[11px] font-medium gap-1 bg-muted/80 text-foreground border border-border"
                                                    >
                                                      <Check className="size-2.5 text-muted-foreground" />
                                                      <span>Accesible</span>
                                                    </Badge>
                                                  ) : (
                                                    <Badge
                                                      tone="neutral"
                                                      appearance="soft"
                                                      size="sm"
                                                      className="text-[11px] font-medium gap-1 bg-muted/80 text-foreground border border-border"
                                                    >
                                                      <Lock className="size-2.5 text-muted-foreground" />
                                                      <span>Confidencial</span>
                                                    </Badge>
                                                  )}
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <span
                                                        role="button"
                                                        tabIndex={0}
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          e.stopPropagation();
                                                        }}
                                                        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors cursor-help p-0.5 rounded-full hover:bg-muted ml-0.5"
                                                        aria-label="Información de requisitos"
                                                      >
                                                        <Info className="size-3.5" />
                                                      </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                      <span>
                                                        {campo.clasificacion === "Confidencial"
                                                          ? "Requiere: Finalidad de uso y justificación jurídica"
                                                          : "Requiere: Solo finalidad de uso"}
                                                      </span>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{campo.descripcion}</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Barra inferior */}
                <div className="sticky bottom-0 bg-card border border-border p-4 flex items-center justify-between rounded-xl shadow-lg mt-4 z-10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-foreground text-sm">
                      Campos seleccionados: {selectedCount}
                    </span>
                    {selectedCount > 0 && (
                      <span className="text-xs text-muted-foreground hidden lg:inline">
                        ({selectedCamposDetails.filter(c => c.campo.clasificacion === "Accesible").length} accesibles [solo finalidad] · {selectedCamposDetails.filter(c => c.campo.clasificacion === "Confidencial").length} confidenciales [finalidad + justificación jurídica])
                      </span>
                    )}
                    {activeFuente && (
                      <Badge tone="neutral" appearance="soft" size="sm" className="hidden sm:inline-flex text-xs gap-1 bg-muted/80 text-foreground border border-border">
                        <Database className="size-3 text-muted-foreground" />
                        <span>Fuente: {activeFuente.nombre}</span>
                      </Badge>
                    )}
                  </div>
                  <Button onClick={nextStep} disabled={selectedCount === 0} size="sm">
                    Continuar con la justificación
                  </Button>
                </div>
              </div>
            )}

            {/* PASO 2: JUSTIFICAR CAMPOS (SENCILLO Y APROVECHANDO EL ESPACIO) */}
            {step === 2 && (
              <div className="flex flex-col gap-6" id="justificacion-step">
                {selectedCamposDetails.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                    No hay campos seleccionados. Vuelva al paso anterior para seleccionar campos.
                  </div>
                ) : (
                  <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
                    {/* Nivel 1: Institución / Fuente */}
                    <div className="p-4 sm:p-5 bg-muted/20 flex items-center justify-between border-b border-border">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="size-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs">
                          <Building2 className="size-4.5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-heading text-base font-bold text-foreground">
                              {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Dirección General de Registro Civil, Identificación y Cedulación")}
                            </h2>
                            <Badge tone="neutral" appearance="soft" size="sm" className="gap-1 border-primary/30 text-primary bg-primary/10 text-[10px]">
                              <Check className="size-2.5" /> Fuente en uso
                            </Badge>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {selectedCamposDetails.length} {selectedCamposDetails.length === 1 ? "campo seleccionado para justificar" : "campos seleccionados para justificar"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedCamposDetails.length > 1 && (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={expandAllJustificaciones}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Expandir todos
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={collapseAllJustificaciones}
                            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Colapsar todos
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Nota de distinción clara y documento de respaldo */}
                    <div className="mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3">
                      <Info className="size-4 text-primary shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-foreground">
                          Requisitos según clasificación del campo:
                        </p>
                        <ul className="text-muted-foreground list-disc list-inside space-y-0.5">
                          <li><strong className="text-foreground">Campos Accesibles:</strong> Requieren únicamente <span className="text-foreground font-medium">Finalidad de uso</span>.</li>
                          <li><strong className="text-foreground">Campos Confidenciales:</strong> Requieren <span className="text-foreground font-medium">Finalidad de uso</span> y <span className="text-foreground font-medium">Justificación jurídica</span> obligatoria.</li>
                        </ul>
                        <p className="text-[11px] text-muted-foreground pt-0.5 italic">
                          * Nota: Queda pendiente de confirmar si en este paso será obligatorio cargar algún documento de respaldo jurídico adicional.
                        </p>
                      </div>
                    </div>

                    {/* Nivel 2 y 3: Fuentes y Campos dentro del Contenedor */}
                    <div className="p-4 sm:p-6 flex flex-col gap-6 bg-card divide-y divide-border/60">
                      {selectedCamposByServicio.map((group, groupIdx) => (
                        <div key={group.servicioId} className={`flex flex-col gap-4 ${groupIdx > 0 ? "pt-6" : ""}`}>
                          {/* Identificador de Fuente */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Fuente
                              </Badge>
                              <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                <Database className="size-4 text-primary" />
                                {group.servicioNombre}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                ({group.items.length} {group.items.length === 1 ? "campo" : "campos"})
                              </span>
                            </div>
                          </div>

                          {/* Lista de campos a justificar de este servicio */}
                          <div className="flex flex-col gap-3">
                            {group.items.map((item) => {
                              const isExpanded = expandedCamposJustificacion[item.campo.id] ?? true;
                              const isFinalidadFilled = Boolean(justificaciones[item.campo.id]?.finalidad?.trim());
                              const isFundamentoFilled = item.campo.clasificacion === "Confidencial"
                                ? Boolean(justificaciones[item.campo.id]?.fundamento?.trim())
                                : true;
                              const isCompleted = isFinalidadFilled && isFundamentoFilled;

                              return (
                                <div
                                  key={item.campo.id}
                                  className="border border-border/80 rounded-xl bg-surface/50 overflow-hidden shadow-2xs transition-all"
                                >
                                  {/* Fila del campo: click expande / colapsa */}
                                  <div
                                    onClick={() => toggleCampoJustificacion(item.campo.id)}
                                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
                                  >
                                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                                      <span className="font-mono font-bold text-sm text-foreground">{item.campo.nombre}</span>
                                      {item.campo.clasificacion === "Accesible" ? (
                                        <Badge
                                          tone="neutral"
                                          appearance="outline"
                                          size="sm"
                                          className="gap-1 uppercase tracking-wider text-[10px] font-semibold bg-background"
                                        >
                                          <Check className="size-2.5 text-muted-foreground" /> ACCESIBLE
                                        </Badge>
                                      ) : (
                                        <Badge
                                          tone="neutral"
                                          appearance="outline"
                                          size="sm"
                                          className="gap-1 uppercase tracking-wider text-[10px] font-semibold bg-background"
                                        >
                                          <Lock className="size-2.5 text-muted-foreground" /> CONFIDENCIAL
                                        </Badge>
                                      )}
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors cursor-help p-0.5 rounded-full hover:bg-muted ml-0.5"
                                            aria-label="Información de requisitos"
                                          >
                                            <Info className="size-3.5" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <span>
                                            {item.campo.clasificacion === "Confidencial"
                                              ? "Requiere: Finalidad de uso y justificación jurídica"
                                              : "Requiere: Solo finalidad de uso"}
                                          </span>
                                        </TooltipContent>
                                      </Tooltip>
                                      <span className="text-xs text-muted-foreground line-clamp-1">— {item.campo.descripcion}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                                      {isCompleted ? (
                                        <Badge appearance="soft" tone="success" className="h-6 px-2 text-[10px] font-semibold gap-1 hidden sm:inline-flex">
                                          <Check className="size-3" /> Justificado
                                        </Badge>
                                      ) : (
                                        <Badge appearance="soft" tone="neutral" className="h-6 px-2 text-[10px] font-semibold hidden sm:inline-flex text-muted-foreground">
                                          Pendiente
                                        </Badge>
                                      )}

                                      <span className="text-xs font-medium text-muted-foreground hidden lg:inline-block">
                                        {isExpanded ? "Ocultar" : "Desplegar"}
                                      </span>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={isExpanded ? "Ocultar finalidad" : "Desplegar finalidad"}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleCampoJustificacion(item.campo.id);
                                            }}
                                            className="size-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80 shadow-2xs"
                                          >
                                            {isExpanded ? (
                                              <ChevronUp className="size-4" />
                                            ) : (
                                              <ChevronDown className="size-4" />
                                            )}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                          <span>{isExpanded ? "Ocultar finalidad y justificación" : "Desplegar finalidad y justificación"}</span>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>

                                  {/* Contenido colapsable: textareas de justificación a ancho completo */}
                                  {isExpanded && (
                                    <div className="border-t border-border/70 p-5 sm:p-6 pt-4 flex flex-col gap-4 bg-muted/10 animate-in fade-in-50 duration-150">
                                      <div className="flex flex-col gap-1.5 w-full">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                                          Finalidad de uso declarada <span className="text-destructive">*</span>
                                        </label>
                                        <Textarea
                                          className="w-full rounded-xl min-h-[95px] text-xs sm:text-sm bg-background border-border"
                                          placeholder="Describa con precisión la finalidad de uso para este campo..."
                                          value={justificaciones[item.campo.id]?.finalidad || ""}
                                          onChange={(e) =>
                                            setJustificaciones(prev => ({
                                              ...prev,
                                              [item.campo.id]: {
                                                ...prev[item.campo.id],
                                                finalidad: e.target.value
                                              }
                                            }))
                                          }
                                        />
                                      </div>

                                      {item.campo.clasificacion === "Confidencial" && (
                                        <div className="flex flex-col gap-1.5 w-full">
                                          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                                            Justificación jurídica requerida <span className="text-destructive">*</span>
                                          </label>
                                          <Textarea
                                            className="w-full rounded-xl min-h-[95px] text-xs sm:text-sm bg-background border-amber-500/40"
                                            placeholder="Indique el fundamento legal o norma jurídica que autoriza el acceso a este campo confidencial..."
                                            value={justificaciones[item.campo.id]?.fundamento || ""}
                                            onChange={(e) =>
                                              setJustificaciones(prev => ({
                                                ...prev,
                                                [item.campo.id]: {
                                                  ...prev[item.campo.id],
                                                  fundamento: e.target.value
                                                }
                                              }))
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" size="sm" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="size-4" />
                    Atrás
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={nextStep}
                    disabled={!isStep2Valid}
                    className="gap-2"
                  >
                    <span>Revisar y enviar</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* PASO 3: REVISAR Y ENVIAR (RESUMEN EN INPUTS UI KIT Y JUSTIFICACIONES EN TEXTAREAS CON ICONOS) */}
            {step === 3 && (
              <div className="flex flex-col gap-6" id="resumen-step">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    Resumen de la solicitud
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Revisión de toda la información y justificaciones ingresadas en los pasos anteriores antes del envío formal.
                  </p>
                </div>

                {/* Ficha Resumen de la Solicitud */}
                <Card className="p-6 bg-surface border-border shadow-xs space-y-4 rounded-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-border/70">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Building2 className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-foreground">
                          Ficha ejecutiva de la solicitud
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Datos institucionales consolidados para emisión y revisión
                        </p>
                      </div>
                    </div>
                    <Badge tone="info" appearance="soft" size="sm" className="font-semibold text-xs">
                      Trámite de Interoperabilidad
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Institución solicitante:</span>
                      <strong className="text-foreground text-xs sm:text-sm block">Ministerio de Salud Pública</strong>
                      <span className="text-[10px] text-muted-foreground">Entidad del sector público</span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Fuente seleccionada:</span>
                      <strong className="text-foreground text-xs sm:text-sm truncate block" title={activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}>
                        {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}
                      </strong>
                      <span className="text-[10px] text-muted-foreground">Fuente única autorizada</span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Fuente solicitada:</span>
                      <strong className="text-foreground text-xs sm:text-sm truncate block" title={selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad"}>
                        {selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad"}
                      </strong>
                      <span className="text-[10px] text-muted-foreground">Acceso vía API segura</span>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Documentos adjuntos:</span>
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <FileText className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">Oficio_Solicitud.pdf</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">Firma electrónica incorporada</span>
                    </div>
                  </div>
                </Card>

                {/* PASO 1: Campos seleccionados en el Paso 1 */}
                <Card className="p-6 bg-card border-border shadow-xs space-y-4 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                        1
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-foreground">
                          Paso 1: Campos seleccionados
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Institución: <strong className="text-foreground font-semibold">{activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}</strong>
                          {selectedCamposDetails[0]?.servicioNombre && (
                            <span className="text-muted-foreground font-normal"> · Fuente: <strong className="text-foreground font-semibold">{selectedCamposDetails[0].servicioNombre}</strong></span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                      {selectedCamposDetails.length} campo(s)
                    </Badge>
                  </div>

                  {/* Campos seleccionados */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ListChecks className="size-3.5 text-muted-foreground" />
                      Campos seleccionados de la fuente:
                    </label>
                    <div className={cn(
                      "grid gap-3 w-full",
                      selectedCamposDetails.length === 1
                        ? "grid-cols-1"
                        : selectedCamposDetails.length === 2
                        ? "grid-cols-1 sm:grid-cols-2"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    )}>
                      {selectedCamposDetails.map((item) => (
                        <div
                          key={`p1-res-${item.campo.id}`}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20 gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-mono font-bold text-xs text-foreground truncate">
                              {item.campo.nombre}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {item.campo.descripcion}
                            </p>
                          </div>
                          <Badge
                            tone="neutral"
                            appearance="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-wider shrink-0",
                              item.campo.clasificacion === "Confidencial"
                                ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "border-border bg-muted/60 text-muted-foreground"
                            )}
                          >
                            {item.campo.clasificacion === "Confidencial" ? (
                              <Lock className="size-2.5 mr-1 inline" />
                            ) : (
                              <Check className="size-2.5 mr-1 inline" />
                            )}
                            {item.campo.clasificacion}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* PASO 2: Justificaciones declaradas */}
                <Card className="p-6 bg-card border-border shadow-xs space-y-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                        2
                      </span>
                      <div>
                        <h3 className="font-bold text-base text-foreground">
                          Paso 2: Finalidad de uso y justificación jurídica declaradas
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Finalidad de uso (campos accesibles) y justificación jurídica (campos confidenciales)
                        </p>
                      </div>
                    </div>
                    <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                      {selectedCamposDetails.length} justificado(s)
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-4">
                    {selectedCamposDetails.map((item) => (
                      <div
                        key={`p2-res-${item.fuenteId}-${item.campo.id}`}
                        className="p-4 sm:p-5 border border-border/80 bg-muted/10 space-y-3.5 rounded-xl w-full"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-sm text-foreground">
                              {item.campo.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                              — {item.campo.descripcion}
                            </span>
                          </div>
                          <Badge
                            tone="neutral"
                            appearance="outline"
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-wider shrink-0",
                              item.campo.clasificacion === "Confidencial"
                                ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                                : "border-border bg-muted/60 text-muted-foreground"
                            )}
                          >
                            {item.campo.clasificacion === "Confidencial" ? (
                              <Lock className="size-2.5 mr-1 inline" />
                            ) : (
                              <Check className="size-2.5 mr-1 inline" />
                            )}
                            {item.campo.clasificacion}
                          </Badge>
                        </div>

                        <div className={cn(
                          "w-full",
                          item.campo.clasificacion === "Confidencial"
                            ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                            : "flex flex-col"
                        )}>
                          <div className="space-y-1.5 w-full">
                            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <FileText className="size-3.5 text-primary" />
                              Finalidad de uso declarada
                            </label>
                            <Textarea
                              disabled
                              className="w-full rounded-xl min-h-[75px] text-xs sm:text-sm bg-background border-border/80 opacity-90 cursor-not-allowed"
                              value={justificaciones[item.campo.id]?.finalidad || "Finalidad de verificación institucional y consulta de elegibilidad."}
                            />
                          </div>

                          {item.campo.clasificacion === "Confidencial" && (
                            <div className="space-y-1.5 w-full">
                              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                <Scale className="size-3.5 text-amber-600 dark:text-amber-400" />
                                Justificación jurídica requerida
                              </label>
                              <Textarea
                                disabled
                                className="w-full rounded-xl min-h-[75px] text-xs sm:text-sm bg-background border-amber-500/30 opacity-90 cursor-not-allowed"
                                value={justificaciones[item.campo.id]?.fundamento || "Art. 89 del Código Orgánico de la Economía Social de los Conocimientos y Ley Orgánica de Protección de Datos Personales."}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" size="sm" onClick={prevStep} className="gap-2">
                    <ArrowLeft className="size-4" />
                    Volver a editar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsModalConfirmacionOpen(true)}
                    id="btn-enviar-firmas"
                    className="gap-2 font-semibold shadow-sm"
                  >
                    <Send className="size-4" />
                    <span>Enviar a firmas</span>
                  </Button>
                </div>

                {/* MODAL DE CONFIRMACIÓN: ENVÍO A FIRMAS */}
                <Dialog open={isModalConfirmacionOpen} onOpenChange={setIsModalConfirmacionOpen}>
                  <DialogContent size="sm">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Check className="size-5 text-emerald-600" />
                        Solicitud enviada correctamente
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Tu solicitud fue enviada correctamente y continuará con el proceso de revisión y firma por parte del Aprobador.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="p-3.5 my-2 rounded-xl bg-muted/40 border border-border text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institución solicitante:</span>
                        <strong className="text-foreground">Ministerio de Salud Pública</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Institución:</span>
                        <strong className="text-foreground truncate max-w-[200px]">
                          {activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Registro Civil")}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuente:</span>
                        <strong className="text-foreground truncate max-w-[200px]">
                          {selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Campos solicitados:</span>
                        <strong className="text-foreground">{selectedCamposDetails.length} campo(s)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estado inicial:</span>
                        <Badge tone="info" appearance="soft" size="sm">Por revisar</Badge>
                      </div>
                    </div>

                    <DialogFooter className="pt-2 border-t border-border/60">
                      <Button
                        size="sm"
                        onClick={() => {
                          const fuenteNombre = activeFuente ? activeFuente.nombre : (selectedCamposDetails[0]?.fuenteNombre || "Dirección General de Registro Civil, Identificación y Cedulación");
                          const servicioNombre = selectedCamposDetails[0]?.servicioNombre || "Consulta de Datos de Identidad";
                          
                          crearNuevaSolicitud({
                            institucion: "Ministerio de Salud Pública",
                            tipoInstitucion: "Pública",
                            fuentePrincipal: fuenteNombre,
                            servicioPrincipal: servicioNombre,
                            camposCount: selectedCamposDetails.length,
                            fuentes: [
                              {
                                id: activeFuente?.id || "f-regciv",
                                nombre: fuenteNombre,
                                institucion: fuenteNombre,
                                campos: selectedCamposDetails.map(c => ({
                                  id: c.campo.id,
                                  nombre: c.campo.nombre,
                                  descripcion: c.campo.descripcion || "",
                                  tipo: c.campo.tipo,
                                  clasificacion: (c.campo.clasificacion === "Confidencial" ? "Confidencial" : "Accesible") as "Accesible" | "Confidencial",
                                  finalidad: justificaciones[c.campo.id]?.finalidad || "Finalidad institucional requerida.",
                                  fundamento: justificaciones[c.campo.id]?.fundamento || "Base legal de interoperabilidad."
                                }))
                              }
                            ]
                          });
                          setIsModalConfirmacionOpen(false);
                          toast.success("Solicitud radicada y enviada a firmas exitosamente");
                          router.push('/acceso-interoperabilidad/solicitudes');
                        }}
                        className="w-full bg-primary text-primary-foreground font-semibold"
                      >
                        Ir a Gestión de solicitudes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </WireframeDashboardLayout>
    </TooltipProvider>
  );
}
