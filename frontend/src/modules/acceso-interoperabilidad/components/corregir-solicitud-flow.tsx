"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Database,
  Building2,
  Check,
  Lock,
  ChevronDown,
  ArrowLeft,
  FileText,
  Send,
  AlertTriangle,
  ListChecks,
  Scale,
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
import { toast } from "sonner";
import { Search as SearchInput } from "@/components/ui/search";
import { Stepper, Step } from "@/components/ui/stepper";
import { INITIAL_INSTITUCIONES } from "@/modules/catalogo-interoperabilidad/data/catalogo-data";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  Combobox,
  ComboboxSelectTrigger,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/components/ui/combobox";
import { SolicitudAcceso, FuenteDetalle } from "@/modules/acceso-interoperabilidad/data/solicitudes-store";

export interface CorregirSolicitudFlowProps {
  solicitud: SolicitudAcceso;
  initialStep?: number;
  onCancel: () => void;
  onReenviar: (comentario: string, nuevasFuentes: FuenteDetalle[]) => void;
}

export function CorregirSolicitudFlow({
  solicitud,
  initialStep,
  onCancel,
  onReenviar,
}: CorregirSolicitudFlowProps) {
  // Detección automática del paso a subsanar según la observación del Aprobador
  const detectTargetStep = (): number => {
    if (initialStep && initialStep >= 1 && initialStep <= 3) return initialStep;
    if (typeof window !== "undefined") {
      const urlStep = new URLSearchParams(window.location.search).get("step");
      if (urlStep && ["1", "2", "3"].includes(urlStep)) {
        return parseInt(urlStep, 10);
      }
    }
    const obs = `${solicitud.motivoRechazo || ""} ${solicitud.observaciones || ""}`.toLowerCase();
    // Si la observación pide expresamente cambiar/quitar campos o fuentes
    if (
      obs.includes("eliminar campo") ||
      obs.includes("quitar campo") ||
      obs.includes("cambiar fuente") ||
      obs.includes("campo no autorizado") ||
      obs.includes("seleccionar otro")
    ) {
      return 1;
    }
    // Para expedientes con campos ya seleccionados, ir directo al Paso 2 (Justificar campos)
    if (solicitud.fuentes && solicitud.fuentes.length > 0) {
      return 2;
    }
    return 1;
  };

  const [step, setStep] = useState<number>(detectTargetStep);

  // Inicializar campos seleccionados a partir de la solicitud existente
  const [selectedCampos, setSelectedCampos] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    solicitud.fuentes?.forEach((f) => {
      f.campos?.forEach((c) => {
        map[c.id] = true;
      });
    });
    return map;
  });

  // Inicializar justificaciones a partir de la solicitud existente
  const [justificaciones, setJustificaciones] = useState<
    Record<string, { finalidad: string; fundamento: string }>
  >(() => {
    const map: Record<string, { finalidad: string; fundamento: string }> = {};
    solicitud.fuentes?.forEach((f) => {
      f.campos?.forEach((c) => {
        map[c.id] = {
          finalidad: c.finalidad || "",
          fundamento: c.fundamento || "",
        };
      });
    });
    return map;
  });

  // Comentario de subsanación
  const [comentarioSubsanacion, setComentarioSubsanacion] = useState(
    "Se subsanaron las observaciones emitidas por el Aprobador: se aclaró la fundamentación jurídica y se ajustó la finalidad de uso."
  );

  // Step 1: Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [institucionFilter, setInstitucionFilter] = useState("ALL");
  const [clasificacionFilter, setClasificacionFilter] = useState("ALL");

  // Expandir por defecto las instituciones que contienen campos de la solicitud
  const [expandedInstituciones, setExpandedInstituciones] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    INITIAL_INSTITUCIONES.forEach((inst) => {
      inst.fuentes.forEach((f) => {
        if (solicitud.fuentes?.some((sf) => sf.id === f.id || sf.id === inst.id)) {
          map[inst.id] = true;
        }
      });
    });
    if (Object.keys(map).length === 0 && INITIAL_INSTITUCIONES.length > 0) {
      map[INITIAL_INSTITUCIONES[0].id] = true;
    }
    return map;
  });

  const [expandedFuentes, setExpandedFuentes] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    solicitud.fuentes?.forEach((f) => {
      map[f.id] = true;
    });
    return map;
  });

  const [expandedCamposJustificacion, setExpandedCamposJustificacion] = useState<Record<string, boolean>>({});

  const toggleInstitucion = (id: string) =>
    setExpandedInstituciones((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleFuente = (id: string) =>
    setExpandedFuentes((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleCampoJustificacion = (id: string) => {
    setExpandedCamposJustificacion((prev) => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const expandAllJustificaciones = () => {
    const next: Record<string, boolean> = {};
    selectedCamposDetails.forEach((c) => {
      next[c.campo.id] = true;
    });
    setExpandedCamposJustificacion(next);
  };

  const collapseAllJustificaciones = () => {
    const next: Record<string, boolean> = {};
    selectedCamposDetails.forEach((c) => {
      next[c.campo.id] = false;
    });
    setExpandedCamposJustificacion(next);
  };

  const institucionesPublicadas = useMemo(() => {
    return INITIAL_INSTITUCIONES.map((inst) => ({
      ...inst,
      fuentes: inst.fuentes.filter((f) => f.estado === "PUBLICADO"),
    })).filter((inst) => inst.fuentes.length > 0);
  }, []);

  const institucionOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Todas las instituciones" },
      ...institucionesPublicadas.map((inst) => ({
        value: inst.id,
        label: inst.sigla ? `${inst.sigla} - ${inst.nombre}` : inst.nombre,
      })),
    ];
  }, [institucionesPublicadas]);

  const clasificacionOptions = useMemo(
    () => [
      { value: "ALL", label: "Todas las clasificaciones" },
      { value: "Accesible", label: "Accesible" },
      { value: "Confidencial", label: "Confidencial" },
    ],
    []
  );

  const filteredInstituciones = useMemo(() => {
    return institucionesPublicadas
      .filter((inst) => {
        if (institucionFilter !== "ALL" && inst.id !== institucionFilter) {
          return false;
        }
        return true;
      })
      .map((inst) => {
        const matchingFuentes = inst.fuentes
          .map((fuente) => {
            const matchingCampos = fuente.campos.filter((campo) => {
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
              campos: matchingCampos,
            };
          })
          .filter((fuente) => {
            if (fuente.campos.length > 0) return true;
            if (!searchTerm && clasificacionFilter === "ALL") return true;
            return false;
          });

        return {
          ...inst,
          fuentes: matchingFuentes,
        };
      })
      .filter((inst) => inst.fuentes.length > 0);
  }, [institucionesPublicadas, institucionFilter, clasificacionFilter, searchTerm]);

  const [restrictionAlert, setRestrictionAlert] = useState<{
    fuenteActual: string;
    fuenteIntentada: string;
  } | null>(null);

  const selectedCamposDetails = useMemo(() => {
    const details: any[] = [];
    institucionesPublicadas.forEach((inst) => {
      inst.fuentes.forEach((servicio) => {
        servicio.campos.forEach((campo) => {
          if (selectedCampos[campo.id]) {
            details.push({
              fuenteId: inst.id,
              fuenteNombre: inst.nombre,
              servicioId: servicio.id,
              servicioNombre: servicio.nombre,
              campo,
            });
          }
        });
      });
    });

    // Asegurar que campos que venían en la solicitud original pero no estén en el mock catalogo
    // sigan presentes en details para que no se pierdan
    solicitud.fuentes?.forEach((sf) => {
      sf.campos?.forEach((sc) => {
        if (selectedCampos[sc.id] && !details.some((d) => d.campo.id === sc.id)) {
          details.push({
            fuenteId: sf.id,
            fuenteNombre: sf.institucion || sf.nombre,
            servicioId: sf.id,
            servicioNombre: sf.nombre,
            campo: sc,
          });
        }
      });
    });

    return details;
  }, [selectedCampos, institucionesPublicadas, solicitud]);

  const activeFuente = useMemo(() => {
    if (selectedCamposDetails.length === 0) return null;
    return {
      id: selectedCamposDetails[0].fuenteId,
      nombre: selectedCamposDetails[0].fuenteNombre,
    };
  }, [selectedCamposDetails]);

  const selectedCamposByServicio = useMemo(() => {
    const map = new Map<string, { servicioNombre: string; items: typeof selectedCamposDetails }>();
    selectedCamposDetails.forEach((item) => {
      if (!map.has(item.servicioId)) {
        map.set(item.servicioId, {
          servicioNombre: item.servicioNombre,
          items: [],
        });
      }
      map.get(item.servicioId)!.items.push(item);
    });
    return Array.from(map.entries()).map(([servicioId, data]) => ({
      servicioId,
      servicioNombre: data.servicioNombre,
      items: data.items,
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
      toast.warning("Para esta solicitud solo puedes seleccionar campos de una misma fuente.", {
        description: `Fuente seleccionada: "${activeFuente.nombre}".`,
        duration: 4000,
      });
      return;
    }

    if (isSelected && restrictionAlert) {
      setRestrictionAlert(null);
    }

    setSelectedCampos((prev) => {
      const next = { ...prev, [campoId]: isSelected };
      if (!isSelected) {
        delete next[campoId];
      }
      return next;
    });
  };

  const selectedCount = Object.values(selectedCampos).filter(Boolean).length;

  const isStep2Valid = selectedCamposDetails.every((c) => {
    const j = justificaciones[c.campo.id];
    if (!j) return false;
    if (!j.finalidad?.trim()) return false;
    if (c.campo.clasificacion === "Confidencial" && !j.fundamento?.trim()) return false;
    return true;
  });

  const nextStep = () => setStep((prev) => (prev < 3 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const stepperSteps: Step[] = [
    { id: "1", title: "Campos de la fuente", icon: Database },
    { id: "2", title: "Justificación de campos", icon: FileText },
    { id: "3", title: "Resumen de la solicitud", icon: Send },
  ];

  const handleFinalizarEnvio = () => {
    // Reconstruir lista de fuentes actualizada
    const updatedFuentesMap = new Map<string, FuenteDetalle>();

    selectedCamposDetails.forEach((item) => {
      if (!updatedFuentesMap.has(item.servicioId)) {
        updatedFuentesMap.set(item.servicioId, {
          id: item.servicioId,
          nombre: item.servicioNombre,
          institucion: item.fuenteNombre,
          campos: [],
        });
      }

      const just = justificaciones[item.campo.id] || {
        finalidad: item.campo.finalidad || "Finalidad de verificación",
        fundamento: item.campo.fundamento || "",
      };

      updatedFuentesMap.get(item.servicioId)!.campos.push({
        id: item.campo.id,
        nombre: item.campo.nombre,
        descripcion: item.campo.descripcion,
        clasificacion: item.campo.clasificacion,
        finalidad: just.finalidad,
        fundamento: just.fundamento,
      });
    });

    const updatedFuentes = Array.from(updatedFuentesMap.values());
    onReenviar(comentarioSubsanacion, updatedFuentes);
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Contenedor Principal */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          {/* Volver al expediente */}
          <div className="flex items-center justify-between">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>Volver al detalle del expediente</span>
            </button>
            <Badge tone="neutral" appearance="outline" className="text-amber-700 dark:text-amber-300 border-amber-500/40 bg-amber-500/10 text-xs font-semibold">
              Modo corrección de solicitud
            </Badge>
          </div>

          {/* Cabecera */}
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">
                Corregir solicitud: {solicitud.id}
              </h1>
              <Badge tone="neutral" appearance="outline" className="text-xs">
                {solicitud.institucion}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Revise las observaciones realizadas por el Aprobador, ajuste los campos y comentarios en los 3 pasos y vuelva a enviar el expediente para su aprobación.
            </p>
          </div>

          {/* BANNER DESTACADO CON LAS OBSERVACIONES DEL APROBADOR */}
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground">
                Observaciones del Aprobador que debe subsanar:
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {solicitud.observaciones || "Se requiere justificar adecuadamente la finalidad de uso y fundamento legal de los campos solicitados."}
              </p>
            </div>
          </div>

          {/* Stepper del UI kit */}
          <div id="stepper-container" className="pt-2 pb-4 border-b border-border">
            <Stepper
              steps={stepperSteps}
              activeStep={step - 1}
              onStepClick={(index) => {
                if (index === 0) {
                  setStep(1);
                } else if (index === 1) {
                  if (selectedCount > 0) {
                    setStep(2);
                  } else {
                    toast.warning("Debe seleccionar al menos un campo en el Paso 1.");
                  }
                } else if (index === 2) {
                  if (selectedCount > 0 && isStep2Valid) {
                    setStep(3);
                  } else {
                    toast.warning("Complete la justificación requerida de todos los campos antes de avanzar al resumen.");
                  }
                }
              }}
            />
          </div>

          {/* PASO 1: SELECCIONAR INFORMACIÓN */}
          {step === 1 && (
            <div className="flex flex-col gap-6" id="seleccion-info">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Database className="size-5 text-primary" />
                  Campos de la fuente
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ajuste o seleccione los campos requeridos para subsanar las observaciones del Aprobador.
                </p>
              </div>
              {/* Alerta de restricción si intenta cambiar de fuente */}
              {restrictionAlert && (
                <div className="p-3.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-start gap-3 text-xs">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Restricción por fuente única: </strong>
                    Ya tienes campos seleccionados de <strong>{restrictionAlert.fuenteActual}</strong>. Para seleccionar campos de <strong>{restrictionAlert.fuenteIntentada}</strong>, primero desmarca los campos anteriores.
                  </div>
                </div>
              )}

              {/* Bloque: Barra de Filtros y Búsqueda (idéntico a Consulta) */}
              <div className="flex flex-col gap-3 p-4 bg-surface border border-border rounded-xl shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 items-end">
                  <div className="sm:col-span-12 lg:col-span-5 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Búsqueda general</label>
                    <SearchInput
                      placeholder="Buscar por institución, fuente o campo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClear={() => setSearchTerm("")}
                      className="w-full h-10 bg-background rounded-full border-border/80"
                    />
                  </div>

                  <div className="sm:col-span-6 lg:col-span-4 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground whitespace-nowrap block">Institución proveedora</label>
                    <Combobox
                      items={institucionOptions}
                      value={institucionOptions.find((i) => i.value === institucionFilter) || institucionOptions[0]}
                      onValueChange={(val: any) => {
                        if (val) {
                          const selected = typeof val === "string" ? val : val.value;
                          setInstitucionFilter(selected);
                        }
                      }}
                    >
                      <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                        <span className="truncate">
                          {institucionOptions.find((i) => i.value === institucionFilter)?.label || "Todas las instituciones"}
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
                      value={clasificacionOptions.find((c) => c.value === clasificacionFilter) || clasificacionOptions[0]}
                      onValueChange={(val: any) => {
                        if (val) {
                          const selected = typeof val === "string" ? val : val.value;
                          setClasificacionFilter(selected);
                        }
                      }}
                    >
                      <ComboboxSelectTrigger className="w-full h-10 justify-between text-xs sm:text-sm font-normal bg-background rounded-xl border-border/80 px-3.5 hover:bg-muted/40 shadow-none">
                        <span className="truncate">
                          {clasificacionOptions.find((c) => c.value === clasificacionFilter)?.label || "Todas las clasificaciones"}
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
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Eliminar filtro de búsqueda"
                        >
                          <X className="size-3" />
                        </button>
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
                        <button
                          type="button"
                          onClick={() => setInstitucionFilter("ALL")}
                          className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Eliminar filtro de institución"
                        >
                          <X className="size-3" />
                        </button>
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
                        <button
                          type="button"
                          onClick={() => setClasificacionFilter("ALL")}
                          className="p-0.5 rounded-full hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          aria-label="Eliminar filtro de clasificación"
                        >
                          <X className="size-3" />
                        </button>
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

              {/* Listado de Instituciones y Servicios */}
              <div className="flex flex-col gap-4">
                {filteredInstituciones.map((institucion) => {
                  const isInstExpanded = expandedInstituciones[institucion.id] ?? false;
                  const isCurrentActiveFuente = activeFuente?.id === institucion.id;
                  const isDifferentFromActive = activeFuente && !isCurrentActiveFuente;
                  const selectedInInst = selectedCamposDetails.filter((d) => d.fuenteId === institucion.id).length;

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
                          {institucion.fuentes.map((servicio) => {
                            const isServicioExpanded = expandedFuentes[servicio.id] ?? true;
                            const selectedInServicio = selectedCamposDetails.filter((d) => d.servicioId === servicio.id).length;

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
                                    {servicio.campos.map((campo) => {
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
                                              ? "bg-muted/10 border-border/40 opacity-70"
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
                })}
              </div>

              {/* Barra inferior */}
              <div className="sticky bottom-0 bg-card border border-border p-4 flex items-center justify-between rounded-xl shadow-lg mt-4 z-10">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-foreground text-sm">
                    Campos seleccionados: {selectedCount}
                  </span>
                  {selectedCount > 0 && (
                    <span className="text-xs text-muted-foreground hidden lg:inline">
                      ({selectedCamposDetails.filter((c) => c.campo.clasificacion === "Accesible").length} accesibles · {selectedCamposDetails.filter((c) => c.campo.clasificacion === "Confidencial").length} confidenciales)
                    </span>
                  )}
                </div>
                <Button onClick={nextStep} disabled={selectedCount === 0} size="sm">
                  Continuar con la justificación
                </Button>
              </div>
            </div>
          )}

          {/* PASO 2: JUSTIFICAR CAMPOS (EDITAR FINALIDAD Y FUNDAMENTO) */}
          {step === 2 && (
            <div className="flex flex-col gap-6" id="justificacion-step">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Justificación de campos
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Declare o ajuste la finalidad de uso para cada campo seleccionado y el fundamento legal habilitante en los campos confidenciales.
                </p>
              </div>
              {/* Recordatorio de la observación en Paso 2 */}
              <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground text-xs sm:text-sm">
                      Observación del Aprobador a subsanar:
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {solicitud.observaciones || solicitud.motivoRechazo || "Verifique y ajuste la finalidad y sustento jurídico de cada campo solicitado."}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground h-8 gap-1.5 self-start sm:self-center"
                >
                  <ArrowLeft className="size-3.5" />
                  Modificar campos (Paso 1)
                </Button>
              </div>

              {selectedCamposDetails.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  No hay campos seleccionados. Vuelva al paso anterior para seleccionar campos.
                </div>
              ) : (
                <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
                  {/* Encabezado de la fuente */}
                  <div className="p-4 sm:p-5 bg-muted/20 flex items-center justify-between border-b border-border">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 shadow-2xs">
                        <Building2 className="size-4.5 text-foreground" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-heading text-base font-bold text-foreground">
                          {activeFuente ? activeFuente.nombre : selectedCamposDetails[0]?.fuenteNombre}
                        </h2>
                        <span className="text-xs text-muted-foreground">
                          {selectedCamposDetails.length} campos a justificar
                        </span>
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

                  {/* Campos por fuente */}
                  <div className="p-4 sm:p-6 flex flex-col gap-6 bg-card divide-y divide-border/60">
                    {selectedCamposByServicio.map((group, groupIdx) => (
                      <div key={group.servicioId} className={`flex flex-col gap-4 ${groupIdx > 0 ? "pt-6" : ""}`}>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <Badge tone="neutral" appearance="outline" size="sm" className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Fuente
                          </Badge>
                          <h3 className="font-heading text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                            <Database className="size-4 text-primary" />
                            {group.servicioNombre}
                          </h3>
                        </div>

                        <div className="flex flex-col gap-3">
                          {group.items.map((item) => {
                            const isExpanded = expandedCamposJustificacion[item.campo.id] ?? true;
                            const isFinalidadFilled = Boolean(justificaciones[item.campo.id]?.finalidad?.trim());
                            const isFundamentoFilled =
                              item.campo.clasificacion === "Confidencial"
                                ? Boolean(justificaciones[item.campo.id]?.fundamento?.trim())
                                : true;
                            const isCompleted = isFinalidadFilled && isFundamentoFilled;

                            return (
                              <div
                                key={item.campo.id}
                                className="border border-border/80 rounded-xl bg-surface/50 overflow-hidden shadow-2xs transition-all"
                              >
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
                                      {isExpanded ? "Ocultar" : "Editar"}
                                    </span>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="p-4 pt-2 border-t border-border/60 bg-muted/10 space-y-4">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                        <FileText className="size-3.5 text-primary" />
                                        Finalidad de uso específica
                                        <span className="text-destructive">*</span>
                                      </label>
                                      <Textarea
                                        rows={3}
                                        placeholder="Especifique con exactitud para qué proceso o trámite institucional se requiere este dato..."
                                        value={justificaciones[item.campo.id]?.finalidad || ""}
                                        onChange={(e) =>
                                          setJustificaciones((prev) => ({
                                            ...prev,
                                            [item.campo.id]: {
                                              ...prev[item.campo.id],
                                              finalidad: e.target.value,
                                            },
                                          }))
                                        }
                                        className="text-xs sm:text-sm bg-background border-border"
                                      />
                                    </div>

                                    {item.campo.clasificacion === "Confidencial" && (
                                      <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                          <Scale className="size-3.5 text-amber-600 dark:text-amber-400" />
                                          Justificación jurídica (Requerido para datos confidenciales)
                                          <span className="text-destructive">*</span>
                                        </label>
                                        <Textarea
                                          rows={2}
                                          placeholder="Indique los artículos y leyes específicas que justifican jurídicamente el acceso..."
                                          value={justificaciones[item.campo.id]?.fundamento || ""}
                                          onChange={(e) =>
                                            setJustificaciones((prev) => ({
                                              ...prev,
                                              [item.campo.id]: {
                                                ...prev[item.campo.id],
                                                fundamento: e.target.value,
                                              },
                                            }))
                                          }
                                          className="text-xs sm:text-sm bg-background border-amber-500/30"
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

          {/* PASO 3: REVISAR Y ENVIAR */}
          {step === 3 && (
            <div className="flex flex-col gap-6" id="resumen-step">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Resumen de la solicitud corregida
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verifique los 3 pasos con las correcciones realizadas antes de remitir el expediente nuevamente al Aprobador.
                </p>
              </div>

              {/* Paso 1: Campos seleccionados */}
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
                        Fuente consultada: <strong className="text-foreground font-semibold">{activeFuente ? activeFuente.nombre : "Registro Civil"}</strong>
                      </p>
                    </div>
                  </div>
                  <Badge tone="neutral" appearance="outline" className="text-xs font-semibold w-fit">
                    {selectedCamposDetails.length} campo(s)
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className={cn(
                    "grid gap-3 w-full",
                    selectedCamposDetails.length === 1
                      ? "grid-cols-1"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  )}>
                    {selectedCamposDetails.map((item) => (
                      <div
                        key={`p1-corregido-${item.campo.id}`}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20 gap-3"
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
                          {item.campo.clasificacion}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Paso 2: Justificaciones corregidas */}
              <Card className="p-6 bg-card border-border shadow-xs space-y-4 rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/70 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                      2
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-foreground">
                        Paso 2: Finalidad de uso y justificación jurídica
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
                      key={`p2-corregido-${item.campo.id}`}
                      className="p-4 border border-border/80 bg-muted/10 space-y-3 rounded-xl w-full"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
                        <span className="font-mono font-bold text-sm text-foreground">
                          {item.campo.nombre}
                        </span>
                        <Badge
                          tone="neutral"
                          appearance="outline"
                          className="text-[10px] font-semibold uppercase"
                        >
                          {item.campo.clasificacion}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-muted-foreground">Finalidad de uso:</span>
                          <p className="p-2 rounded-lg bg-background border border-border text-foreground">
                            {justificaciones[item.campo.id]?.finalidad || "Sin finalidad"}
                          </p>
                        </div>
                        {item.campo.clasificacion === "Confidencial" && (
                          <div className="space-y-1">
                            <span className="font-semibold text-muted-foreground">Justificación jurídica:</span>
                            <p className="p-2 rounded-lg bg-background border border-amber-500/30 text-foreground">
                              {justificaciones[item.campo.id]?.fundamento || "Sin justificación jurídica"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Paso 3: Detalle de la corrección y subsanación realizada */}
              <Card className="p-6 bg-card border-border shadow-xs space-y-3 rounded-2xl">
                <div className="flex items-center gap-2.5 pb-2 border-b border-border/70">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                    3
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      Paso 3: Detalle de la subsanación realizada
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mensaje aclaratorio dirigido al Aprobador sobre las correcciones aplicadas
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Comentario de subsanación para el Aprobador:
                  </label>
                  <Textarea
                    rows={3}
                    value={comentarioSubsanacion}
                    onChange={(e) => setComentarioSubsanacion(e.target.value)}
                    placeholder="Describa brevemente las correcciones realizadas conforme a las observaciones del Aprobador..."
                    className="text-xs sm:text-sm bg-background border-border"
                  />
                </div>
              </Card>

              {/* Botones finales */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" size="sm" onClick={prevStep} className="gap-2">
                  <ArrowLeft className="size-4" />
                  Volver a editar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFinalizarEnvio}
                  className="gap-2 shadow-sm font-semibold"
                >
                  <Send className="size-4" />
                  <span>Reenviar solicitud para aprobación</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
